DO $$ BEGIN
  CREATE TYPE "OperationType" AS ENUM ('VENTE', 'LOCATION_MENSUELLE', 'SEJOUR_NUITEE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "PricePeriod" AS ENUM ('MOIS', 'NUITEE', 'NONE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "PriceStatus" AS ENUM ('KNOWN', 'SUR_DEMANDE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ProspectStatus" AS ENUM ('NOUVEAU', 'QUALIFIE', 'VISITE_PROGRAMMEE', 'NEGOCIATION', 'CONCLU', 'PERDU');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "VisitStatus" AS ENUM ('PROGRAMMEE', 'EFFECTUEE', 'ANNULEE', 'REPORTEE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "CommissionType" AS ENUM ('POURCENTAGE', 'MONTANT_FIXE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "CommissionStatus" AS ENUM ('ESTIMEE', 'ACQUISE', 'ENCAISSEE', 'ANNULEE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Establishment"
  ADD COLUMN IF NOT EXISTS "reference" TEXT,
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "operationType" "OperationType" NOT NULL DEFAULT 'SEJOUR_NUITEE',
  ADD COLUMN IF NOT EXISTS "priceAmount" INTEGER,
  ADD COLUMN IF NOT EXISTS "pricePeriod" "PricePeriod",
  ADD COLUMN IF NOT EXISTS "priceStatus" "PriceStatus" NOT NULL DEFAULT 'KNOWN',
  ADD COLUMN IF NOT EXISTS "bedrooms" INTEGER,
  ADD COLUMN IF NOT EXISTS "surfaceM2" INTEGER,
  ADD COLUMN IF NOT EXISTS "partnerId" TEXT;

UPDATE "Establishment"
SET
  "operationType" = 'VENTE',
  "priceAmount" = 157200000,
  "pricePeriod" = 'NONE',
  "priceStatus" = 'KNOWN',
  "type" = CASE WHEN "type" IS NULL OR "type" = '' THEN 'villa' ELSE "type" END
WHERE lower("name") LIKE '%teranga park villas%';

UPDATE "Establishment"
SET
  "priceAmount" = NULL,
  "priceStatus" = 'SUR_DEMANDE'
WHERE lower("name") LIKE '%confort+%';

UPDATE "Establishment"
SET
  "operationType" = 'VENTE',
  "pricePeriod" = 'NONE'
WHERE "type" = 'maison_a_vendre' AND "operationType" = 'SEJOUR_NUITEE';

UPDATE "Establishment"
SET
  "pricePeriod" = CASE
    WHEN "operationType" = 'VENTE' THEN 'NONE'::"PricePeriod"
    WHEN "operationType" = 'LOCATION_MENSUELLE' THEN 'MOIS'::"PricePeriod"
    ELSE 'NUITEE'::"PricePeriod"
  END
WHERE "pricePeriod" IS NULL;

DO $$ BEGIN
  ALTER TABLE "Establishment" ADD CONSTRAINT "Establishment_reference_key" UNIQUE ("reference");
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Establishment" ADD CONSTRAINT "Establishment_slug_key" UNIQUE ("slug");
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "Establishment_partnerId_idx" ON "Establishment"("partnerId");
CREATE INDEX IF NOT EXISTS "Establishment_operationType_idx" ON "Establishment"("operationType");

CREATE TABLE IF NOT EXISTS "Partner" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "company" TEXT,
  "notes" TEXT NOT NULL DEFAULT '',
  "mandateDetails" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Partner_name_idx" ON "Partner"("name");
CREATE INDEX IF NOT EXISTS "Partner_company_idx" ON "Partner"("company");

CREATE TABLE IF NOT EXISTS "Prospect" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "status" "ProspectStatus" NOT NULL DEFAULT 'NOUVEAU',
  "projectType" "OperationType",
  "desiredZone" TEXT NOT NULL DEFAULT '',
  "budget" INTEGER,
  "timeframe" TEXT NOT NULL DEFAULT '',
  "notes" TEXT NOT NULL DEFAULT '',
  "followUpAt" TIMESTAMP(3),
  "source" TEXT NOT NULL DEFAULT 'site',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Prospect_ownerId_idx" ON "Prospect"("ownerId");
CREATE INDEX IF NOT EXISTS "Prospect_status_idx" ON "Prospect"("status");
CREATE INDEX IF NOT EXISTS "Prospect_projectType_idx" ON "Prospect"("projectType");
CREATE INDEX IF NOT EXISTS "Prospect_followUpAt_idx" ON "Prospect"("followUpAt");
CREATE INDEX IF NOT EXISTS "Prospect_createdAt_idx" ON "Prospect"("createdAt");

CREATE TABLE IF NOT EXISTS "Visit" (
  "id" TEXT NOT NULL,
  "prospectId" TEXT,
  "establishmentId" TEXT,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "status" "VisitStatus" NOT NULL DEFAULT 'PROGRAMMEE',
  "notes" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Visit_prospectId_idx" ON "Visit"("prospectId");
CREATE INDEX IF NOT EXISTS "Visit_establishmentId_idx" ON "Visit"("establishmentId");
CREATE INDEX IF NOT EXISTS "Visit_scheduledAt_idx" ON "Visit"("scheduledAt");
CREATE INDEX IF NOT EXISTS "Visit_status_idx" ON "Visit"("status");

CREATE TABLE IF NOT EXISTS "Commission" (
  "id" TEXT NOT NULL,
  "partnerId" TEXT,
  "establishmentId" TEXT,
  "prospectId" TEXT,
  "type" "CommissionType" NOT NULL DEFAULT 'POURCENTAGE',
  "rate" DOUBLE PRECISION,
  "amountFixed" INTEGER,
  "amountEstimated" INTEGER,
  "amountInvoiced" INTEGER,
  "amountCollected" INTEGER,
  "status" "CommissionStatus" NOT NULL DEFAULT 'ESTIMEE',
  "notes" TEXT NOT NULL DEFAULT '',
  "dueAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Commission_partnerId_idx" ON "Commission"("partnerId");
CREATE INDEX IF NOT EXISTS "Commission_establishmentId_idx" ON "Commission"("establishmentId");
CREATE INDEX IF NOT EXISTS "Commission_prospectId_idx" ON "Commission"("prospectId");
CREATE INDEX IF NOT EXISTS "Commission_status_idx" ON "Commission"("status");
CREATE INDEX IF NOT EXISTS "Commission_createdAt_idx" ON "Commission"("createdAt");

CREATE TABLE IF NOT EXISTS "_EstablishmentToProspect" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "_EstablishmentToProspect" ADD CONSTRAINT "_EstablishmentToProspect_AB_unique" UNIQUE ("A", "B");
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "_EstablishmentToProspect_B_index" ON "_EstablishmentToProspect"("B");

DO $$ BEGIN
  ALTER TABLE "Establishment" ADD CONSTRAINT "Establishment_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Visit" ADD CONSTRAINT "Visit_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Visit" ADD CONSTRAINT "Visit_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Commission" ADD CONSTRAINT "Commission_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Commission" ADD CONSTRAINT "Commission_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Commission" ADD CONSTRAINT "Commission_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "_EstablishmentToProspect" ADD CONSTRAINT "_EstablishmentToProspect_A_fkey" FOREIGN KEY ("A") REFERENCES "Establishment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "_EstablishmentToProspect" ADD CONSTRAINT "_EstablishmentToProspect_B_fkey" FOREIGN KEY ("B") REFERENCES "Prospect"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
