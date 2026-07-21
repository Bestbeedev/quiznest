-- AlterTable
ALTER TABLE "addon_products" ADD COLUMN     "is_one_time" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "target_feature" "FeatureKey";

-- AlterTable
ALTER TABLE "platform_settings" ADD COLUMN     "credit_cost_ai_generation" INTEGER,
ADD COLUMN     "credit_cost_certificate" INTEGER,
ADD COLUMN     "credit_cost_export" INTEGER;
