"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Sparkles } from "lucide-react";

import { importQuestionsFromJsonAction } from "@/features/quiz/actions";
import { buildQuestionGenerationPrompt } from "@/lib/utils/ai-question-prompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";

export function AiGenerateDialog({ quizId, quizTitle }: { quizId: string; quizTitle: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState(quizTitle);
  const [count, setCount] = useState(5);
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const prompt = useMemo(() => buildQuestionGenerationPrompt(topic, count), [topic, count]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = async () => {
    setError(null);
    setSuccess(null);
    setIsImporting(true);

    const result = await importQuestionsFromJsonAction(quizId, pasted);
    setIsImporting(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setSuccess(`${result?.count} question(s) importée(s) avec succès.`);
    setPasted("");
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 h-8 text-sm font-medium hover:bg-muted">
        <Sparkles className="size-4" />
        Générer avec l&apos;IA
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Générer des questions avec l&apos;IA</DialogTitle>
          <DialogDescription>
            Copiez ce prompt dans votre assistant IA préféré (ChatGPT, Claude...), puis collez sa
            réponse ci-dessous pour importer automatiquement les questions dans ce quiz.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium">1. Copier le prompt</p>
          <Field orientation="responsive">
            <Field>
              <FieldLabel htmlFor="ai-topic">Sujet</FieldLabel>
              <Input id="ai-topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="ai-count">Nombre de questions</FieldLabel>
              <Input
                id="ai-count"
                type="number"
                min={1}
                max={30}
                value={count}
                onChange={(e) => setCount(Number(e.target.value) || 1)}
              />
            </Field>
          </Field>

          <div className="relative">
            <pre className="max-h-48 overflow-y-auto rounded-lg border bg-muted/40 p-3 text-xs whitespace-pre-wrap">
              {prompt}
            </pre>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="absolute top-2 right-2 gap-1.5"
              onClick={handleCopy}
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copié" : "Copier"}
            </Button>
          </div>

          <Separator />

          <p className="text-sm font-medium">2. Coller la réponse de l&apos;IA</p>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder='{"questions": [...]}'
            rows={6}
            className="w-full rounded-lg border bg-transparent p-3 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button
            type="button"
            disabled={!pasted.trim() || isImporting}
            onClick={handleImport}
            className="w-fit"
          >
            {isImporting ? "Import..." : "Importer les questions"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
