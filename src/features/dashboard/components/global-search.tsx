"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { HelpCircle, ListChecks, Search } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { globalSearchAction } from "@/features/dashboard/search-actions";

type SearchResults = Awaited<ReturnType<typeof globalSearchAction>>;

const EMPTY_RESULTS: SearchResults = { quizzes: [], questions: [] };

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const timeout = setTimeout(() => {
      startTransition(async () => {
        const data = await globalSearchAction(trimmed);
        setResults(data);
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, [query, open]);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  const trimmedQuery = query.trim();
  const displayResults = trimmedQuery.length < 2 ? EMPTY_RESULTS : results;
  const hasResults = displayResults.quizzes.length > 0 || displayResults.questions.length > 0;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery("");
      setResults(EMPTY_RESULTS);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-full border bg-muted/50 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 truncate text-left">Rechercher un quiz, une question…</span>
        <kbd className="hidden shrink-0 rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg" showCloseButton={false}>
          <DialogTitle className="sr-only">Recherche</DialogTitle>
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un quiz, une question…"
              className="border-0 shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {trimmedQuery.length < 2 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">Tapez au moins 2 caractères…</p>
            ) : isPending && !hasResults ? (
              <p className="p-4 text-center text-sm text-muted-foreground">Recherche…</p>
            ) : !hasResults ? (
              <p className="p-4 text-center text-sm text-muted-foreground">Aucun résultat pour « {trimmedQuery} ».</p>
            ) : (
              <>
                {displayResults.quizzes.length > 0 && (
                  <div className="mb-1">
                    <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Quiz
                    </p>
                    {displayResults.quizzes.map((quiz) => (
                      <Link
                        key={quiz.id}
                        href={`/dashboard/quiz/${quiz.id}`}
                        onClick={() => handleOpenChange(false)}
                        className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-muted"
                      >
                        <ListChecks className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{quiz.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {displayResults.questions.length > 0 && (
                  <div>
                    <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Questions
                    </p>
                    {displayResults.questions.map((question) => (
                      <Link
                        key={question.id}
                        href={`/dashboard/quiz/${question.quizId}`}
                        onClick={() => handleOpenChange(false)}
                        className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-muted"
                      >
                        <HelpCircle className="size-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate">{question.title}</span>
                        <span className="shrink-0 truncate text-xs text-muted-foreground">{question.quiz.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
