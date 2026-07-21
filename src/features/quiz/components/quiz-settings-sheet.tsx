"use client";

import { Settings } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { QuizSettingsForm } from "./quiz-settings-form";
import type { Quiz } from "@/generated/prisma/client";

export function QuizSettingsSheet({ quiz }: { quiz: Quiz }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          />
        }
      >
        <Settings className="size-4 shrink-0" />
        <div className="min-w-0">
          <p className="truncate">Paramètres</p>
          <p className="hidden truncate text-[11px] text-muted-foreground sm:block">Configuration du quiz</p>
        </div>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-lg overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Paramètres du quiz</SheetTitle>
          <SheetDescription>
            Modifiez la configuration de votre quiz.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">
          <QuizSettingsForm quiz={quiz} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
