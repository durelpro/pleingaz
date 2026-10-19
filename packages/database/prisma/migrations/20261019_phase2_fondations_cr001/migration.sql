-- CreateEnum
CREATE TYPE "PriceStatus" AS ENUM ('PROPOSED', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('MOTO', 'VELO', 'VOITURE', 'PIED');

-- CreateEnum
CREATE TYPE "CourierStatus" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED', 'INACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CashCollectionStatus" AS ENUM ('COLLECTED', 'REMITTED_TO_PLEINGAZ', 'DISPUTED');

-- CreateEnum
CREATE TYPE "FeeScheduleStatus" AS ENUM ('PROPOSED', 'APPROVED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CourierPayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "BeneficiaryType" AS ENUM ('DISTRIBUTOR', 'COURIER');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('PROPOSED', 'APPROVED', 'EXECUTED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "DocumentType_new" AS ENUM ('ID_CARD_FRONT', 'ID_CARD_BACK', 'PORTRAIT_PHOTO', 'SHOP_PHOTO');
ALTER TABLE "StoreDocument" ALTER COLUMN "type" TYPE "DocumentType_new" USING (
  CASE "type"::text
    WHEN 'CNI_FRONT' THEN 'ID_CARD_FRONT'::"DocumentType_new"
    WHEN 'CNI_BACK' THEN 'ID_CARD_BACK'::"DocumentType_new"
    WHEN 'PHOTO_BOUTIQUE' THEN 'SHOP_PHOTO'::"DocumentType_new"
    WHEN 'REGISTRE_COMMERCE' THEN 'SHOP_PHOTO'::"DocumentType_new"
    WHEN 'PLAN_LOCALISATION' THEN 'SHOP_PHOTO'::"DocumentType_new"
    ELSE 'ID_CARD_FRONT'::"DocumentType_new"
  END
);
ALTER TYPE "DocumentType" RENAME TO "DocumentType_old";
ALTER TYPE "DocumentType_new" RENAME TO "DocumentType";
DROP TYPE "DocumentType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StockLevel_new" AS ENUM ('BON', 'MOYEN', 'FAIBLE', 'RUPTURE');
ALTER TABLE "Inventory" ALTER COLUMN "level" DROP DEFAULT;
ALTER TABLE "Inventory" ALTER COLUMN "level" TYPE "StockLevel_new" USING (
  CASE "level"::text
    WHEN 'HIGH' THEN 'BON'::"StockLevel_new"
    WHEN 'MEDIUM' THEN 'MOYEN'::"StockLevel_new"
    WHEN 'LOW' THEN 'FAIBLE'::"StockLevel_new"
    WHEN 'OUT_OF_STOCK' THEN 'RUPTURE'::"StockLevel_new"
    ELSE 'RUPTURE'::"StockLevel_new"
  END
);
ALTER TYPE "StockLevel" RENAME TO "StockLevel_old";
ALTER TYPE "StockLevel_new" RENAME TO "StockLevel";
DROP TYPE "StockLevel_old";
ALTER TABLE "Inventory" ALTER COLUMN "level" SET DEFAULT 'RUPTURE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_driverId_fkey";

-- DropIndex
DROP INDEX "Product_brand_weightKg_key";

-- AlterTable
ALTER TABLE "Delivery" DROP COLUMN "confirmationOtp",
DROP COLUMN "driverId",
ADD COLUMN     "confirmationCodeHash" TEXT,
ADD COLUMN     "courierId" TEXT;

-- AlterTable
ALTER TABLE "DemandAlert" DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "radiusKm",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "neighborhood" TEXT;

-- AlterTable
ALTER TABLE "DistributorApplication" DROP COLUMN "momoReceiverNumber",
DROP COLUMN "orangeReceiverNumber",
DROP COLUMN "taxId";

-- AlterTable
ALTER TABLE "Inventory" ALTER COLUMN "level" SET DEFAULT 'RUPTURE';

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "totalAmount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "totalAmount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "unitPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "totalPrice" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "amount" SET DATA TYPE INTEGER,
ALTER COLUMN "fee" SET DEFAULT 0,
ALTER COLUMN "fee" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "PlatformSettings" ADD COLUMN     "maxCashHoldingCourier" INTEGER NOT NULL DEFAULT 50000,
ADD COLUMN     "maxUploadSizeBytes" INTEGER NOT NULL DEFAULT 5242880,
ADD COLUMN     "payoutDoubleApprovalThreshold" INTEGER NOT NULL DEFAULT 500000,
ADD COLUMN     "searchDefaultRadiusKm" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "searchGpsTimeoutSeconds" INTEGER NOT NULL DEFAULT 8;

-- AlterTable
ALTER TABLE "PriceHistory" DROP COLUMN "createdAt",
ADD COLUMN     "changeReason" TEXT,
ADD COLUMN     "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "oldPublicPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "newPublicPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "oldDistributorPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "newDistributorPrice" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN IF EXISTS "brand",
DROP COLUMN IF EXISTS "distributorPrice",
DROP COLUMN IF EXISTS "promoPrice",
DROP COLUMN IF EXISTS "publicPrice",
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "imageUrl" TEXT,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "name" TEXT,
ADD COLUMN IF NOT EXISTS "sku" TEXT;

UPDATE "Product" SET "name" = 'Bouteille PLEINGAZ ' || "weightKg" || ' kg' WHERE "name" IS NULL;
UPDATE "Product" SET "sku" = 'PG-BOT-' || replace("weightKg"::text, '.', '') || '-' || substr(id, 1, 4) WHERE "sku" IS NULL OR "sku" = ('PG-BOT-' || replace("weightKg"::text, '.', ''));

ALTER TABLE "Product" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "sku" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "slug" TEXT;

UPDATE "ProductCategory" SET "slug" = lower(replace(replace("name", ' ', '-'), 'é', 'e')) WHERE "slug" IS NULL;

ALTER TABLE "ProductCategory" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "SearchEvent" DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "radiusKm",
DROP COLUMN "searchQuery",
ADD COLUMN     "coarseArea" TEXT,
ADD COLUMN     "productId" TEXT;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "deliveryAvailable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "StoreDocument" DROP COLUMN "fileName",
DROP COLUMN "fileSize",
DROP COLUMN "mimeType";

-- CreateTable
CREATE TABLE "ProductPrice" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "publicPrice" INTEGER NOT NULL,
    "distributorPrice" INTEGER NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "status" "PriceStatus" NOT NULL DEFAULT 'PROPOSED',
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Courier" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL DEFAULT 'MOTO',
    "status" "CourierStatus" NOT NULL DEFAULT 'PENDING',
    "cashBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Courier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourierAvailability" (
    "id" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3),
    "currentLat" DOUBLE PRECISION,
    "currentLng" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourierAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourierZone" (
    "id" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "areaName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourierZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryAssignment" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PROPOSED',
    "timeoutAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashCollection" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "CashCollectionStatus" NOT NULL DEFAULT 'COLLECTED',
    "remittedAt" TIMESTAMP(3),
    "reconciledById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeSchedule" (
    "id" TEXT NOT NULL,
    "areaId" TEXT,
    "deliveryFeeCustomer" INTEGER NOT NULL,
    "courierPayout" INTEGER NOT NULL,
    "pleingazMargin" INTEGER NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "status" "FeeScheduleStatus" NOT NULL DEFAULT 'PROPOSED',
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourierPayout" (
    "id" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "payoutBatchId" TEXT,
    "grossDeliveriesAmount" INTEGER NOT NULL,
    "cashDeductionAmount" INTEGER NOT NULL,
    "netPayoutAmount" INTEGER NOT NULL,
    "status" "CourierPayoutStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourierPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditNote" (
    "id" TEXT NOT NULL,
    "creditNoteNumber" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerAccount" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "transactionRef" TEXT NOT NULL,
    "debit" INTEGER NOT NULL DEFAULT 0,
    "credit" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutBatch" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "beneficiaryType" "BeneficiaryType" NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'PROPOSED',
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "secondApprovedById" TEXT,
    "operatorTxRef" TEXT,
    "proofFileUrl" TEXT,
    "executedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Courier_userId_key" ON "Courier"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CourierAvailability_courierId_key" ON "CourierAvailability"("courierId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditNote_creditNoteNumber_key" ON "CreditNote"("creditNoteNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerAccount_code_key" ON "LedgerAccount"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PayoutBatch_batchNumber_key" ON "PayoutBatch"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_slug_key" ON "ProductCategory"("slug");

-- AddForeignKey
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Courier" ADD CONSTRAINT "Courier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourierAvailability" ADD CONSTRAINT "CourierAvailability_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourierZone" ADD CONSTRAINT "CourierZone_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryAssignment" ADD CONSTRAINT "DeliveryAssignment_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryAssignment" ADD CONSTRAINT "DeliveryAssignment_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashCollection" ADD CONSTRAINT "CashCollection_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashCollection" ADD CONSTRAINT "CashCollection_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashCollection" ADD CONSTRAINT "CashCollection_reconciledById_fkey" FOREIGN KEY ("reconciledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeSchedule" ADD CONSTRAINT "FeeSchedule_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeSchedule" ADD CONSTRAINT "FeeSchedule_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourierPayout" ADD CONSTRAINT "CourierPayout_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourierPayout" ADD CONSTRAINT "CourierPayout_payoutBatchId_fkey" FOREIGN KEY ("payoutBatchId") REFERENCES "PayoutBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditNote" ADD CONSTRAINT "CreditNote_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditNote" ADD CONSTRAINT "CreditNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "LedgerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutBatch" ADD CONSTRAINT "PayoutBatch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutBatch" ADD CONSTRAINT "PayoutBatch_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutBatch" ADD CONSTRAINT "PayoutBatch_secondApprovedById_fkey" FOREIGN KEY ("secondApprovedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Contrainte d'immutabilité stricte sur LedgerEntry (Insert-Only)
CREATE OR REPLACE FUNCTION prevent_ledger_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Les écritures du Grand Livre (LedgerEntry) sont strictement immuables : UPDATE et DELETE interdits.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_ledger_update ON "LedgerEntry";
CREATE TRIGGER trg_prevent_ledger_update
BEFORE UPDATE OR DELETE ON "LedgerEntry"
FOR EACH ROW
EXECUTE FUNCTION prevent_ledger_modification();
