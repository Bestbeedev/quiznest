"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Loader2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

import { importAiQuestionAction } from "@/features/quiz/actions";
import { buildQuestionGenerationPrompt, type PromptOptions } from "@/lib/utils/ai-question-prompt";
import { AddQuestionDialog, type QuestionForEdit } from "@/features/quiz/components/add-question-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const QUESTION_TYPES = [
  { value: "single_choice", label: "Choix unique" },
  { value: "multiple_choice", label: "Choix multiple" },
  { value: "true_false", label: "Vrai / Faux" },
  { value: "short_answer", label: "Réponse courte" },
];

const DIFFICULTY_OPTIONS = [
  { value: "mixed", label: "Mixte" },
  { value: "easy", label: "Facile" },
  { value: "medium", label: "Moyen" },
  { value: "hard", label: "Difficile" },
];

const LANGUAGE_OPTIONS = [
  { value: "fr", label: "Français" },
  { value: "en", label: "Anglais" },
  { value: "es", label: "Espagnol" },
  { value: "de", label: "Allemand" },
  { value: "pt", label: "Portugais" },
  { value: "ar", label: "Arabe" },
];

const TYPE_BADGE_LABELS: Record<string, string> = {
  SINGLE_CHOICE: "Choix unique",
  MULTIPLE_CHOICE: "Choix multiple",
  TRUE_FALSE: "Vrai / Faux",
  SHORT_ANSWER: "Réponse courte",
};

type Step = "configure" | "paste" | "importing" | "review";

type ImportRow = {
  index: number;
  title: string;
  status: "pending" | "success" | "error";
  message?: string;
  question?: QuestionForEdit;
};

function Select({
  value,
  onValueChange,
  options,
  className,
}: {
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="flex h-9 w-full appearance-none items-center rounded-lg border bg-transparent px-3 pr-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function extractRawQuestions(parsedJson: unknown): unknown[] | null {
  if (Array.isArray(parsedJson)) return parsedJson;
  if (
    parsedJson &&
    typeof parsedJson === "object" &&
    Array.isArray((parsedJson as { questions?: unknown }).questions)
  ) {
    return (parsedJson as { questions: unknown[] }).questions;
  }
  return null;
}

function rowTitle(raw: unknown, index: number): string {
  if (raw && typeof raw === "object" && typeof (raw as { question?: unknown }).question === "string") {
    return (raw as { question: string }).question;
  }
  return `Question ${index + 1}`;
}

export function AiGenerateDialog({ quizId, quizTitle }: { quizId: string; quizTitle: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("configure");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [results, setResults] = useState<ImportRow[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [topic, setTopic] = useState(quizTitle);
  const [count, setCount] = useState(5);
  const [types, setTypes] = useState<string[]>(["single_choice", "multiple_choice", "true_false"]);
  const [difficulty, setDifficulty] = useState("mixed");
  const [choicesPerQuestion, setChoicesPerQuestion] = useState(4);
  const [pointsPerQuestion, setPointsPerQuestion] = useState(2);
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [includeHints, setIncludeHints] = useState(false);
  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [language, setLanguage] = useState("fr");

  const tags = useMemo(
    () => tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
    [tagsInput],
  );

  const options: PromptOptions = useMemo(
    () => ({
      topic,
      count,
      types,
      difficulty,
      choicesPerQuestion,
      pointsPerQuestion,
      includeExplanations,
      includeHints,
      category,
      tags,
      language,
    }),
    [topic, count, types, difficulty, choicesPerQuestion, pointsPerQuestion, includeExplanations, includeHints, category, tags, language],
  );

  const prompt = useMemo(() => buildQuestionGenerationPrompt(options), [options]);

  const toggleType = (type: string) => {
    setTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAll = () => {
    setStep("configure");
    setPasted("");
    setParseError(null);
    setResults([]);
    setEditingIndex(null);
  };

  const handleNext = () => {
    if (!topic.trim()) {
      toast.error("Renseignez un sujet pour la génération.");
      return;
    }
    if (types.length === 0) {
      toast.error("Sélectionnez au moins un type de question.");
      return;
    }
    setStep("paste");
  };

  const runImport = async (rawQuestions: unknown[]) => {
    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < rawQuestions.length; i++) {
      const result = await importAiQuestionAction(quizId, rawQuestions[i]);
      if (result?.error) failed++;
      else succeeded++;

      setResults((prev) =>
        prev.map((row, idx) =>
          idx === i
            ? result?.error
              ? { ...row, status: "error", message: result.error }
              : { ...row, status: "success", question: result?.question as QuestionForEdit }
            : row,
        ),
      );
    }

    setStep("review");
    router.refresh();

    if (failed === 0) {
      toast.success(`${succeeded} question(s) importée(s) avec succès.`);
    } else if (succeeded === 0) {
      toast.error(`Aucune question importée (${failed} échec(s)).`);
    } else {
      toast.warning(`${succeeded} question(s) importée(s), ${failed} échec(s).`);
    }
  };

  const handleStartImport = async () => {
    setParseError(null);

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(pasted);
    } catch {
      setParseError("Le texte collé n'est pas un JSON valide.");
      toast.error("Le texte collé n'est pas un JSON valide.");
      return;
    }

    const rawQuestions = extractRawQuestions(parsedJson);
    if (!rawQuestions || rawQuestions.length === 0) {
      setParseError('Aucune question trouvée. Le JSON doit contenir un tableau "questions".');
      toast.error("Aucune question trouvée dans le JSON collé.");
      return;
    }

    setResults(
      rawQuestions.map((raw, index) => ({ index, title: rowTitle(raw, index), status: "pending" as const })),
    );
    setStep("importing");
    await runImport(rawQuestions);
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;
  const doneCount = successCount + errorCount;
  const progressPct = results.length > 0 ? Math.round((doneCount / results.length) * 100) : 0;

  return (
    <>
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && step === "importing") return;
        if (!next) resetAll();
        setOpen(next);
      }}
    >
      <DialogTrigger className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 h-8 text-sm font-medium hover:bg-muted">
        <Sparkles className="size-4" />
        Générer avec l&apos;IA
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl" showCloseButton={step !== "importing"}>
        <DialogHeader>
          <DialogTitle>Générer des questions avec l&apos;IA</DialogTitle>
          <DialogDescription>
            {step === "configure" && "Étape 1/4 — Configurez les options de génération."}
            {step === "paste" && "Étape 2/4 — Copiez le prompt, générez-le avec votre IA, puis collez la réponse."}
            {step === "importing" && "Étape 3/4 — Import en cours..."}
            {step === "review" && "Étape 4/4 — Vérifiez et modifiez les questions importées."}
          </DialogDescription>
        </DialogHeader>

        {step === "configure" && (
          <div className="flex flex-col gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="ai-topic">Sujet / Thème</FieldLabel>
                <Input id="ai-topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
                <FieldDescription>Le sujet principal sur lequel portent les questions.</FieldDescription>
              </Field>

              <Field orientation="responsive">
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
                <Field>
                  <FieldLabel>Langue</FieldLabel>
                  <Select value={language} onValueChange={setLanguage} options={LANGUAGE_OPTIONS} />
                </Field>
              </Field>

              <Field>
                <FieldLabel>Types de questions</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_TYPES.map((type) => (
                    <Badge
                      key={type.value}
                      variant={types.includes(type.value) ? "default" : "outline"}
                      className="cursor-pointer select-none"
                      onClick={() => toggleType(type.value)}
                    >
                      {type.label}
                    </Badge>
                  ))}
                </div>
                <FieldDescription>Sélectionnez les types de questions à générer.</FieldDescription>
              </Field>

              <Field orientation="responsive">
                <Field>
                  <FieldLabel>Difficulté</FieldLabel>
                  <Select value={difficulty} onValueChange={setDifficulty} options={DIFFICULTY_OPTIONS} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ai-choices">Choix par question</FieldLabel>
                  <Input
                    id="ai-choices"
                    type="number"
                    min={2}
                    max={6}
                    value={choicesPerQuestion}
                    onChange={(e) => setChoicesPerQuestion(Number(e.target.value) || 4)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ai-points">Points</FieldLabel>
                  <Input
                    id="ai-points"
                    type="number"
                    min={1}
                    max={100}
                    value={pointsPerQuestion}
                    onChange={(e) => setPointsPerQuestion(Number(e.target.value) || 2)}
                  />
                </Field>
              </Field>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={includeExplanations}
                    onCheckedChange={(c) => setIncludeExplanations(c === true)}
                  />
                  Explications
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={includeHints}
                    onCheckedChange={(c) => setIncludeHints(c === true)}
                  />
                  Indices (hints)
                </label>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                {showAdvanced ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                Options avancées
              </button>

              {showAdvanced && (
                <>
                  <Field>
                    <FieldLabel htmlFor="ai-category">Catégorie</FieldLabel>
                    <Input
                      id="ai-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="ex: Géographie, Sciences, Histoire..."
                    />
                    <FieldDescription>Appliquée à toutes les questions générées.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="ai-tags">Tags (séparés par des virgules)</FieldLabel>
                    <Input
                      id="ai-tags"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="ex: europe, capitales, facile"
                    />
                    <FieldDescription>Tags ajoutés à chaque question pour faciliter le filtrage.</FieldDescription>
                  </Field>
                </>
              )}
            </FieldGroup>

            <DialogFooter>
              <Button type="button" onClick={handleNext}>
                Suivant
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "paste" && (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium">1. Copier le prompt</p>
            <div className="relative">
              <pre className="max-h-64 min-w-0 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs whitespace-pre-wrap break-words">
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
            {parseError && (
              <Alert variant="destructive">
                <AlertDescription>{parseError}</AlertDescription>
              </Alert>
            )}
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder='{"questions": [...]}'
              rows={8}
              className="w-full min-w-0 rounded-lg border bg-transparent p-3 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep("configure")}>
                Retour
              </Button>
              <Button type="button" disabled={!pasted.trim()} onClick={handleStartImport}>
                Importer
              </Button>
            </DialogFooter>
          </div>
        )}

        {(step === "importing" || step === "review") && (
          <div className="flex flex-col gap-4 overflow-hidden">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {doneCount} / {results.length} question(s) traitée(s)
                </span>
                <span>
                  {successCount} importée(s){errorCount > 0 ? ` · ${errorCount} échouée(s)` : ""}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
              {results.map((row) => (
                <div
                  key={row.index}
                  className={cn(
                    "flex items-center gap-2.5 overflow-hidden rounded-lg h-full border p-8 text-sm",
                    row.status === "error" && "border-destructive/30 bg-destructive/5",
                  )}
                >
                  {row.status === "pending" && (
                    <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                  )}
                  {row.status === "success" && (
                    <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  )}
                  {row.status === "error" && (
                    <XCircle className="size-4 shrink-0 text-destructive" />
                  )}

                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate">{row.title}</p>
                    {row.status === "error" && row.message && (
                      <p className="mt-0.5 text-xs break-words text-destructive">{row.message}</p>
                    )}
                    {row.status === "success" && row.question && (
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline">{TYPE_BADGE_LABELS[row.question.type] ?? row.question.type}</Badge>
                        <Badge variant="outline">{row.question.points} pt(s)</Badge>
                      </div>
                    )}
                  </div>

                  {row.status === "success" && row.question && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Modifier"
                      onClick={() => setEditingIndex(row.index)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {step === "review" && (
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => {
                    resetAll();
                    setOpen(false);
                  }}
                >
                  Terminer
                </Button>
              </DialogFooter>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>

      {editingIndex !== null && results[editingIndex]?.question && (
        <AddQuestionDialog
          key={results[editingIndex].question.id}
          quizId={quizId}
          question={results[editingIndex].question}
          onClose={() => setEditingIndex(null)}
        />
      )}
    </>
  );
}
