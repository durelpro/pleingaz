-- CreateEnum
CREATE TYPE "VerificationLevel" AS ENUM ('LISTED', 'CLAIMED_PENDING', 'BASIC_VERIFIED', 'FULLY_VERIFIED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('UNCLAIMED', 'PENDING_VERIFICATION', 'CLAIMED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_ownerId_fkey";

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "claimStatus" "ClaimStatus" NOT NULL DEFAULT 'CLAIMED',
ADD COLUMN     "fieldLocks" JSONB,
ADD COLUMN     "importBatchId" TEXT,
ADD COLUMN     "onlineOrderingEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "sourceRef" TEXT,
ADD COLUMN     "verificationLevel" "VerificationLevel" NOT NULL DEFAULT 'FULLY_VERIFIED',
ALTER COLUMN "ownerId" DROP NOT NULL,
ALTER COLUMN "isVerifiedBadge" SET DEFAULT false;

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileHashSha256" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'STAGED',
    "totalPlacemarks" INTEGER NOT NULL DEFAULT 0,
    "importedCount" INTEGER NOT NULL DEFAULT 0,
    "quarantinedCount" INTEGER NOT NULL DEFAULT 0,
    "rawSummary" JSONB,
    "pleingazAgreementRef" TEXT,
    "createdById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3),
    "rolledBackAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportRecord" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "storeId" TEXT,
    "sourceRef" TEXT NOT NULL,
    "rawName" TEXT NOT NULL,
    "rawDescription" TEXT,
    "rawCoordinates" TEXT NOT NULL,
    "classifiedType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'STAGED',
    "quarantineReason" TEXT,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreClaim" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "applicantPhone" TEXT NOT NULL,
    "otpHash" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "otpVerifiedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImportRecord_batchId_status_idx" ON "ImportRecord"("batchId", "status");

-- CreateIndex
CREATE INDEX "StoreClaim_storeId_status_idx" ON "StoreClaim"("storeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Store_source_sourceRef_key" ON "Store"("source", "sourceRef");

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "ImportBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportBatch" ADD CONSTRAINT "ImportBatch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportBatch" ADD CONSTRAINT "ImportBatch_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportRecord" ADD CONSTRAINT "ImportRecord_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportRecord" ADD CONSTRAINT "ImportRecord_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreClaim" ADD CONSTRAINT "StoreClaim_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreClaim" ADD CONSTRAINT "StoreClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreClaim" ADD CONSTRAINT "StoreClaim_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
