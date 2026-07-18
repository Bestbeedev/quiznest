-- AlterTable
ALTER TABLE "answers" ADD COLUMN     "time_spent" INTEGER;

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "category" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
