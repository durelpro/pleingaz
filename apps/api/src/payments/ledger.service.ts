import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LedgerEntryItem {
  accountCode: string; // 1010, 1020, 1030, 4010, 4020, 7010, 7020, 6010, 6020
  debit: number;       // FCFA entier
  credit: number;      // FCFA entier
  description: string;
}

export interface RecordTransactionParams {
  transactionRef: string;
  entries: LedgerEntryItem[];
  entityType?: 'ORDER' | 'PAYOUT' | 'CASH_COLLECTION' | 'REFUND';
  entityId?: string;
  createdById?: string;
}

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * D-06: Enregistrement d'une transaction comptable en partie double (Insert-Only)
   * RÈGLE ABSOLUE: Total Débits === Total Crédits.
   */
  async recordDoubleEntry(params: RecordTransactionParams): Promise<any> {
    const { transactionRef, entries, entityType, entityId, createdById } = params;

    if (!entries || entries.length < 2) {
      throw new BadRequestException('Une écriture comptable en partie double requiert au moins 2 comptes (Débit et Crédit).');
    }

    // 1. Vérification stricte de l'équilibre Débit = Crédit
    const totalDebit = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + (e.credit || 0), 0);

    if (totalDebit <= 0 || totalCredit <= 0) {
      throw new BadRequestException('Les montants de la transaction doivent être strictement positifs.');
    }

    if (totalDebit !== totalCredit) {
      throw new BadRequestException(
        `Déséquilibre comptable D-06 : Total Débit (${totalDebit.toLocaleString()} FCFA) !== Total Crédit (${totalCredit.toLocaleString()} FCFA).`
      );
    }

    // 2. Résolution des comptes du plan comptable officiel
    const accountCodes = entries.map((e) => e.accountCode);
    const accounts = await this.prisma.ledgerAccount.findMany({
      where: { code: { in: accountCodes } },
    });

    const accountMap = new Map(accounts.map((a) => [a.code, a.id]));

    for (const code of accountCodes) {
      if (!accountMap.has(code)) {
        throw new NotFoundException(`Compte comptable introuvable dans le plan de comptes PLEINGAZ: ${code}`);
      }
    }

    // 3. Insertion Insert-Only dans LedgerEntry
    return this.prisma.$transaction(async (tx) => {
      const createdEntries = [];
      for (const entry of entries) {
        const accountId = accountMap.get(entry.accountCode)!;
        const record = await tx.ledgerEntry.create({
          data: {
            accountId,
            transactionRef,
            debit: entry.debit || 0,
            credit: entry.credit || 0,
            description: entry.description,
            entityType,
            entityId,
            createdById,
          },
        });
        createdEntries.push(record);
      }

      return {
        transactionRef,
        totalAmount: totalDebit,
        entriesCount: createdEntries.length,
        entries: createdEntries,
      };
    });
  }

  /**
   * D-06: Génération automatique des écritures comptables pour une commande livrée
   */
  async recordOrderSettlement(
    orderId: string,
    method: 'CASH' | 'MTN_MOMO' | 'ORANGE_MONEY',
    totalAmount: number,
    distributorAmount: number,
    courierFee: number,
    createdById?: string,
  ): Promise<any> {
    const pleingazMargin = totalAmount - distributorAmount - courierFee;
    const treasuryAccount = method === 'CASH' ? '1020' : '1010'; // 1020 = Caisse Livreur, 1010 = MoMo PLEINGAZ

    const entries: LedgerEntryItem[] = [
      {
        accountCode: treasuryAccount,
        debit: totalAmount,
        credit: 0,
        description: `Encaissement commande ${orderId} (${method})`,
      },
      {
        accountCode: '4010', // Dette Distributeur
        debit: 0,
        credit: distributorAmount,
        description: `Cession gaz distributeur pour commande ${orderId}`,
      },
      {
        accountCode: '4020', // Dette Livreur
        debit: 0,
        credit: courierFee,
        description: `Frais de livraison dus au coursier pour commande ${orderId}`,
      },
      {
        accountCode: '7010', // Commission PLEINGAZ
        debit: 0,
        credit: Math.max(0, pleingazMargin),
        description: `Commission plateforme PLEINGAZ sur commande ${orderId}`,
      },
    ];

    return this.recordDoubleEntry({
      transactionRef: `ORD-SETTLE-${orderId}`,
      entries,
      entityType: 'ORDER',
      entityId: orderId,
      createdById,
    });
  }

  /**
   * D-06: Extourne comptable (Contre-passation en cas d'annulation ou litige)
   * Génère les écritures strictement inverses pour garantir l'immutabilité sans jamais d'UPDATE ni DELETE.
   */
  async recordExtourne(
    originalTransactionRef: string,
    reason: string,
    createdById?: string,
  ): Promise<any> {
    const originalEntries = await this.prisma.ledgerEntry.findMany({
      where: { transactionRef: originalTransactionRef },
      include: { account: true },
    });

    if (originalEntries.length === 0) {
      throw new NotFoundException(`Aucune écriture trouvée pour la référence ${originalTransactionRef}`);
    }

    // Inversion rigoureuse : Débits deviennent Crédits et Crédits deviennent Débits
    const extourneEntries: LedgerEntryItem[] = originalEntries.map((e) => ({
      accountCode: e.account.code,
      debit: e.credit,
      credit: e.debit,
      description: `Extourne (${reason}) - Réf: ${originalTransactionRef}`,
    }));

    return this.recordDoubleEntry({
      transactionRef: `EXTOURNE-${originalTransactionRef}`,
      entries: extourneEntries,
      entityType: 'REFUND',
      createdById,
    });
  }

  /**
   * Consultation du solde d'un compte du Grand Livre
   */
  async getAccountBalance(accountCode: string): Promise<any> {
    const account = await this.prisma.ledgerAccount.findUnique({
      where: { code: accountCode },
    });

    if (!account) {
      throw new NotFoundException(`Compte introuvable: ${accountCode}`);
    }

    const aggregations = await this.prisma.ledgerEntry.aggregate({
      where: { accountId: account.id },
      _sum: { debit: true, credit: true },
    });

    const totalDebit = aggregations._sum.debit || 0;
    const totalCredit = aggregations._sum.credit || 0;

    // Détermination du solde selon la nature comptable (Actif / Charge = Débiteur, Passif / Produit = Créditeur)
    let balance = 0;
    if (['ASSET', 'EXPENSE'].includes(account.type)) {
      balance = totalDebit - totalCredit;
    } else {
      balance = totalCredit - totalDebit;
    }

    return {
      code: account.code,
      name: account.name,
      type: account.type,
      totalDebit,
      totalCredit,
      balance,
    };
  }
}
