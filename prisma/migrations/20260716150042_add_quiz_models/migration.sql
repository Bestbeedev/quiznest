-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER');

-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "time_limit" INTEGER,
    "passing_score" INTEGER NOT NULL DEFAULT 50,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "random_order" BOOLEAN NOT NULL DEFAULT false,
    "shuffle_choices" BOOLEAN NOT NULL DEFAULT false,
    "fullscreen" BOOLEAN NOT NULL DEFAULT false,
    "access_code" TEXT,
    "status" "QuizStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "open_date" TIMESTAMP(3),
    "close_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL DEFAULT 'SINGLE_CHOICE',
    "difficulty" "QuestionDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "order" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "time_limit" INTEGER,
    "hint" TEXT,
    "explanation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_choices" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "question_choices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quizzes_organization_id_status_idx" ON "quizzes"("organization_id", "status");

-- CreateIndex
CREATE INDEX "quizzes_organization_id_created_at_idx" ON "quizzes"("organization_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_organization_id_slug_key" ON "quizzes"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "questions_quiz_id_order_idx" ON "questions"("quiz_id", "order");

-- CreateIndex
CREATE INDEX "question_choices_question_id_order_idx" ON "question_choices"("question_id", "order");

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_choices" ADD CONSTRAINT "question_choices_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
