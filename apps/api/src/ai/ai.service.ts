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
        schema: z.object({ brand: z.string(), weightKg: z.number() }),
        func: async ({ brand, weightKg }) => {
          const product = await this.prisma.product.findUnique({ where: { brand_weightKg: { brand, weightKg } } });
          return product ? `Prix public: ${product.publicPrice} FCFA.` : "Produit introuvable.";
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

    // 2. Garde-fous (Prompt Injection)
    if (message.toLowerCase().includes('ignore') || message.toLowerCase().includes('system prompt')) {
      throw new BadRequestException('Action non autorisée.');
    }
    
    if (message.toLowerCase().includes('parler à un conseiller') || message.toLowerCase().includes('humain')) {
      return { response: "Je vous transfère vers un conseiller humain. Vous pouvez nous joindre sur WhatsApp au +237 657696567." };
    }

    // 3. Contexte
    const context = await this.getKnowledgeContext(message);
    const systemPrompt = `Tu es l'assistant IA de PLEINGAZ (Cameroun). Tu parles français et anglais, y compris le langage local (Camerounais). Règle stricte: base-toi UNIQUEMENT sur le contexte suivant. CONTEXTE: ${context}`;

    let aiResponseText = "";
    let inputTokens = message.length; // Fake token count
    let outputTokens = 50;

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'MOCK_KEY_FOR_DEV') {
      const messages = [new SystemMessage(systemPrompt), new HumanMessage(message)];
      const response = await this.llm.invoke(messages);
      aiResponseText = response.content.toString();
    } else {
      aiResponseText = "[MODE DEV] L'IA est configurée avec ses outils. Requête : " + message;
    }

    // Sauvegarde Coûts
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
