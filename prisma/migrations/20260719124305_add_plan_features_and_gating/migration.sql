-- CreateEnum
CREATE TYPE "FeatureKey" AS ENUM ('AI_GENERATION', 'AI_IMPORT', 'QUESTION_BANK', 'CERTIFICATES', 'EXPORT_PDF', 'EXPORT_EXCEL', 'EXPORT_CSV', 'ADVANCED_ANALYTICS', 'CUSTOM_BRANDING', 'CUSTOM_DOMAIN', 'WEBHOOKS', 'API_ACCESS', 'MULTI_TEAM', 'LIVE_MONITORING', 'EMAIL_NOTIFICATIONS', 'SMS_NOTIFICATIONS', 'WHITE_LABEL');

-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "available_from" TIMESTAMP(3),
ADD COLUMN     "available_until" TIMESTAMP(3),
ADD COLUMN     "badge" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "display_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_promoted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trial_days" INTEGER;

-- CreateTable
CREATE TABLE "plan_features" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "feature" "FeatureKey" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "limit" INTEGER,

    CONSTRAINT "plan_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plan_features_plan_id_feature_key" ON "plan_features"("plan_id", "feature");

-- AddForeignKey
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
