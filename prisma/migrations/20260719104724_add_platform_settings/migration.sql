-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'PLATFORM_SETTINGS_UPDATED';

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "maintenance_mode" BOOLEAN NOT NULL DEFAULT false,
    "maintenance_message" TEXT,
    "allow_signups" BOOLEAN NOT NULL DEFAULT true,
    "ai_generation_enabled" BOOLEAN NOT NULL DEFAULT true,
    "exports_enabled" BOOLEAN NOT NULL DEFAULT true,
    "billing_enabled" BOOLEAN NOT NULL DEFAULT false,
    "notification_email" TEXT,
    "notify_on_new_organization" BOOLEAN NOT NULL DEFAULT false,
    "notify_on_new_subscription" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);
