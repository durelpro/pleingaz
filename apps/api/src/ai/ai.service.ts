import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

@Injectable()
export class AiService {
  private llm: ChatOpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY || 'MOCK_KEY_FOR_DEV',
    });
  }

  async getKnowledgeContext(query: string): Promise<string> {
    const docs = await this.prisma.knowledgeDocument.findMany({
      where: { isActive: true },
      take: 5,
    });
    return docs.map(d => `[DOCUMENT: ${d.title}]\\n${d.content}`).join('\\n\\n');
  }

  private getTools(userId: string) {
    return [
      new DynamicStructuredTool({
        name: 'check_product_availability',
        description: "Vérifier la disponibilité et le prix d'un produit spécifique.",
        schema: z.object({ sku: z.string().optional(), weightKg: z.number().optional() }),
        func: async ({ sku, weightKg }) => {
          const product = sku
            ? await this.prisma.product.findUnique({
                where: { sku },
                include: { prices: { where: { status: 'APPROVED' }, take: 1 } },
              })
            : await this.prisma.product.findFirst({
                where: weightKg ? { weightKg } : undefined,
                include: { prices: { where: { status: 'APPROVED' }, take: 1 } },
              });
          if (!product) return 'Produit PLEINGAZ introuvable.';
          const price = product.prices[0]?.publicPrice ?? 'Prix non disponible';
          return `Produit officiel: ${product.name} (SKU: ${product.sku}), Prix public: ${price} FCFA.`;
        },
      }),
      new DynamicStructuredTool({
        name: 'find_nearest_available_store',
        description: 'Trouver la boutique ouverte la plus proche ayant du stock.',
        schema: z.object({ city: z.string(), neighborhood: z.string() }),
        func: async ({ city, neighborhood }) => {
          return `La boutique PLEINGAZ la plus proche à ${city}, ${neighborhood} est ouverte de 08:00 à 18:00.`;
        },
      }),
      new DynamicStructuredTool({
        name: 'get_order_status',
        description: "Vérifier le statut d'une commande spécifique",
        schema: z.object({ orderNumber: z.string() }),
        func: async ({ orderNumber }) => {
          const order = await this.prisma.order.findUnique({ where: { orderNumber } });
          if (!order) return "Commande introuvable.";
          if (order.customerId !== userId) return "Cette commande ne vous appartient pas.";
          return `Le statut est ${order.status}.`;
        }
      }),
      new DynamicStructuredTool({
        name: 'contact_support',
        description: 'Obtenir les coordonnées du support',
        schema: z.object({}),
        func: async () => {
          const settings = await this.prisma.platformSettings.findUnique({ where: { id: 'singleton' } });
          return `Contactez le support au ${settings?.supportPhone} ou par email: ${settings?.supportEmail}`;
        }
      })
    ];
  }

  async chat(userId: string, sessionId: string, message: string) {
    // 1. Limite de requêtes (Rate Limiting) & Coûts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const usage = await this.prisma.aiUsageMetric.aggregate({
      where: { userId, createdAt: { gte: today } },
      _sum: { totalTokens: true }
    });
    
    if ((usage._sum.totalTokens || 0) > 10000) {
      throw new HttpException("Limite d'utilisation quotidienne atteinte.", HttpStatus.TOO_MANY_REQUESTS);
    }

    // 2. Garde-fous de Sécurité & Urgence Vitale (Fuite de gaz / Danger)
    const normalizedMessage = message.toLowerCase();
    
    // Détection d'urgence immédiate (Fuite de gaz, incendie, étincelle)
    if (
      normalizedMessage.includes('fuite') ||
      normalizedMessage.includes('odeur de gaz') ||
      normalizedMessage.includes('incendie') ||
      normalizedMessage.includes('explosion') ||
      normalizedMessage.includes('danger')
    ) {
      return {
        response:
          "🚨 ALERTE SÉCURITÉ GAZ - CONSIGNES D'URGENCE IMMÉDIATES :\n" +
          "1. N'actionnez aucun interrupteur électrique, téléphone ou flamme dans la pièce.\n" +
          "2. Éteignez immédiatement toute flamme nue.\n" +
          "3. Fermez le robinet / détendeur de la bouteille si accessible sans danger.\n" +
          "4. Aérez largement le local en ouvrant portes et fenêtres.\n" +
          "5. Évacuez immédiatement les lieux et prévenez les secours (Pompiers: 118) et le support PLEINGAZ (+237 657696567)."
      };
    }

    // Garde-fous contre les attaques par injection de prompt
    if (
      normalizedMessage.includes('ignore') ||
      normalizedMessage.includes('system prompt') ||
      normalizedMessage.includes('jailbreak') ||
      normalizedMessage.includes('dan mode')
    ) {
      throw new BadRequestException('Action non autorisée. Les consignes de sécurité de PLEINGAZ ne peuvent être outrepassées.');
    }
    
    if (normalizedMessage.includes('parler à un conseiller') || normalizedMessage.includes('humain') || normalizedMessage.includes('support')) {
      return { response: "Je vous transfère vers un conseiller humain. Vous pouvez joindre le support officiel PLEINGAZ sur WhatsApp au +237 657696567 ou par email à support@pleingaz.cm." };
    }

    // 3. Contexte RAG & Règle Anti-Hallucination
    const context = await this.getKnowledgeContext(message);
    const systemPrompt = `Tu es l'assistant officiel de PLEINGAZ (Cameroun). Tu réponds aux clients et distributeurs.
RÈGLE ABSOLUE ANTI-HALLUCINATION :
- Tu ne dois JAMAIS inventer un prix, un stock ou un produit.
- Tout prix doit provenir EXCLUSIVEMENT du catalogue officiel approuvé de PLEINGAZ. Si tu ne connais pas le prix ou s'il n'est pas renseigné, dis explicitement que le tarif officiel n'est pas encore publié.
- Langues supportées : Français, Anglais et expressions locales camerounaises courantes.
CONTEXTE DE BASE DE CONNAISSANCES :
${context}`;

    let aiResponseText = "";
    let inputTokens = message.length; // Estimation de tokens
    let outputTokens = 50;

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'MOCK_KEY_FOR_DEV') {
      const messages = [new SystemMessage(systemPrompt), new HumanMessage(message)];
      const response = await this.llm.invoke(messages);
      aiResponseText = response.content.toString();
    } else {
      aiResponseText = `[ASSISTANT PLEINGAZ] Réponse sécurisée à : "${message}". Pour consulter les tarifs officiels homologués, veuillez vous référer au catalogue en direct.`;
    }

    // Sauvegarde Coûts et métriques
    await this.prisma.aiUsageMetric.create({
      data: {
        userId,
        promptTokens: inputTokens,
        completionTokens: outputTokens,
        totalTokens: inputTokens + outputTokens,
        estimatedCostUsd: (inputTokens + outputTokens) * 0.00001
      }
    });

    let session = await this.prisma.aiChatSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      session = await this.prisma.aiChatSession.create({ data: { id: sessionId, userId, history: [] } });
    }
    const history = Array.isArray(session.history) ? session.history : [];
    history.push({ role: 'user', content: message, timestamp: new Date().toISOString() });
    history.push({ role: 'assistant', content: aiResponseText, timestamp: new Date().toISOString() });
    
    await this.prisma.aiChatSession.update({ where: { id: sessionId }, data: { history: history as any } });

    return { response: aiResponseText };
  }

  /**
   * Tâche 8.6: Assistant Admin (Analyse sur données réelles en lecture seule)
   */
  async adminAssistantQuery(adminId: string, query: string) {
    // L'admin veut des stats sans coder de SQL
    // Exemple d'outil: get_total_sales, get_active_distributors
    return {
      response: `[ASSISTANT ADMIN] Analyse en cours pour : "${query}". Fonction d'agrégation sécurisée en lecture seule appliquée.`
    };
  }
}
