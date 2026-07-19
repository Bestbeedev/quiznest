"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

import { importQuestionsFromJsonAction } from "@/features/quiz/actions";
import { buildQuestionGenerationPrompt, type PromptOptions } from "@/lib/utils/ai-question-prompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

export function AiGenerateDialog({ quizId, quizTitle }: { quizId: string; quizTitle: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

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

  const handleImport = async () => {
    setError(null);
    setSuccess(null);
    setIsImporting(true);

    const result = await importQuestionsFromJsonAction(quizId, pasted);
    setIsImporting(false);

    if (result?.error) {
      setError(result.error);
      toast.error(result.error);
      return;
    }

    const message = `${result?.count} question(s) importée(s) avec succès.`;
    setSuccess(message);
    toast.success(message);
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
            Configurez le prompt, copiez-le dans votre assistant IA préféré (ChatGPT, Claude...),
            puis collez sa réponse ci-dessous pour importer automatiquement les questions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium">1. Configurer et copier le prompt</p>

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

          <div className="relative">
            <pre className="max-h-64 overflow-y-auto rounded-lg border bg-muted/40 p-3 text-xs whitespace-pre-wrap">
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
