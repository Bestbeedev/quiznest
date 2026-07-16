import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { z } from "zod";

export function applyZodErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: z.ZodError,
) {
  for (const issue of error.issues) {
    setError(issue.path.join(".") as Path<T>, { message: issue.message });
  }
}
