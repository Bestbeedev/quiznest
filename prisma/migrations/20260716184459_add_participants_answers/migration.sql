
-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "show_corrections" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "score" INTEGER NOT NULL DEFAULT 0,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "time_spent" INTEGER,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "choice_ids" TEXT[],
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "participants_quiz_id_status_idx" ON "participants"("quiz_id", "status");

-- CreateIndex
CREATE INDEX "participants_quiz_id_email_idx" ON "participants"("quiz_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "answers_participant_id_question_id_key" ON "answers"("participant_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_access_code_key" ON "quizzes"("access_code");

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

