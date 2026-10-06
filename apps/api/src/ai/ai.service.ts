import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

@Injectable()
export class AiService {
  private llm: ChatOpenAI;

  constructor(private readonly prisma: PrismaService) {
    // Initialisation du modèle. En production, clé via env var.
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY || 'MOCK_KEY_FOR_DEV',
    });
  }

  /**
   * Tâche 8.1 : RAG Knowledge Base
   */
  async getKnowledgeContext(query: string): Promise<string> {
    // Dans une vraie implémentation, on ferait une recherche vectorielle avec pgvector.
    // Ici on simule une recherche de base pour le prototype.
    const docs = await this.prisma.knowledgeDocument.findMany({
      where: { isActive: true },
      take: 3,
    });
    return docs.map(d => \`[DOCUMENT: \${d.title}]\\n\${d.content}\`).join('\\n\\n');
  }

  /**
   * Création des Tools Internes (Tâche 8.2)
   */
  private getTools() {
    return [
      new DynamicStructuredTool({
        name: 'check_product_availability',
        description: 'Vérifier la disponibilité et le prix d\\'un produit spécifique.',
        schema: z.object({
          brand: z.string().describe('La marque du produit (ex: SCTM, Camgaz)'),
          weightKg: z.number().describe('Le poids de la bouteille en Kg'),
        }),
        func: async ({ brand, weightKg }) => {
          const product = await this.prisma.product.findUnique({
            where: { brand_weightKg: { brand, weightKg } }
          });
          if (!product) return "Produit introuvable.";
          return \`Le prix public est de \${product.publicPrice} FCFA.\`;
        },
      }),
      new DynamicStructuredTool({
        name: 'get_order_status',
        description: 'Vérifier le statut d\\'une commande spécifique',
        schema: z.object({
          orderNumber: z.string().describe('Le numéro de la commande (ex: ORD-XXXX)'),
        }),
        func: async ({ orderNumber }) => {
          const order = await this.prisma.order.findUnique({ where: { orderNumber } });
          if (!order) return "Commande introuvable.";
          return \`Le statut de la commande est \${order.status}.\`;
        }
      })
    ];
  }

  /**
   * Chat (Tâche 8.4, 8.5)
   */
  async chat(userId: string, sessionId: string, message: string) {
    // 1. Garde-fous (Tâche 8.5)
    if (message.toLowerCase().includes('ignore all previous instructions')) {
      throw new BadRequestException('Tentative d\\'injection détectée. Opération refusée.');
    }

    // 2. Contexte (Tâche 8.1)
    const context = await this.getKnowledgeContext(message);
    const systemPrompt = \`
      Tu es l'assistant IA de PLEINGAZ (Cameroun). 
      Tu parles français et anglais, et tu comprends le langage local.
      Règle absolue : Pour toute question sur PLEINGAZ, base-toi UNIQUEMENT sur le contexte fourni. 
      Si tu ne sais pas, dis que tu ne sais pas et propose de contacter le support.
      Distingue clairement les infos officielles (ex: prix) des estimations (ex: temps de livraison).
      
      CONTEXTE OFFICIEL:
      \${context}
    \`;

    // 3. Appel du modèle (Mocké pour ce prototype sans clé API valide)
    let aiResponseText = "";
    
    if (process.env.OPENAI_API_KEY) {
      const messages = [new SystemMessage(systemPrompt), new HumanMessage(message)];
      const response = await this.llm.invoke(messages);
      aiResponseText = response.content.toString();
    } else {
      // Mock Response for Development
      aiResponseText = "[MODE DEV] L'IA est configurée, mais nécessite une clé API OpenAI valide pour répondre intelligemment à : " + message;
    }

    // 4. Historique
    let session = await this.prisma.aiChatSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      session = await this.prisma.aiChatSession.create({
        data: { id: sessionId, userId, history: [] }
      });
    }

    const history = Array.isArray(session.history) ? session.history : [];
    history.push({ role: 'user', content: message, timestamp: new Date() });
    history.push({ role: 'assistant', content: aiResponseText, timestamp: new Date() });

    await this.prisma.aiChatSession.update({
      where: { id: sessionId },
      data: { history: history as any }
    });

    return { response: aiResponseText };
  }
}
