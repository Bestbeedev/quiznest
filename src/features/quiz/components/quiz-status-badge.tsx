import { Badge } from "@/components/ui/badge";
import type { QuizStatus } from "@/generated/prisma/client";

const STATUS_LABEL: Record<QuizStatus, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

const STATUS_VARIANT: Record<QuizStatus, "secondary" | "default" | "outline"> = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "outline",
};

export function QuizStatusBadge({ status }: { status: QuizStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
