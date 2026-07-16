"use client";

import { CheckCircle2, Circle } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/shared/reveal";

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden py-0 shadow-lg ring-1 ring-foreground/10">
      <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-destructive/40" />
        <span className="size-2.5 rounded-full bg-yellow-500/40" />
        <span className="size-2.5 rounded-full bg-emerald-500/40" />
      </div>
      <div className="p-6">{children}</div>
    </Card>
  );
}

function DashboardMockup() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {["Quiz créés", "Quiz publiés", "Questions"].map((label, i) => (
        <div key={label} className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="mt-2 h-6 w-12 rounded bg-primary/20" style={{ opacity: 1 - i * 0.15 }} />
        </div>
      ))}
      <div className="col-span-full rounded-lg border bg-card p-4">
        <p className="mb-3 text-xs text-muted-foreground">Évolution</p>
        <div className="flex h-24 items-end gap-2">
          {[40, 65, 45, 80, 60, 90, 70].map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-primary/30"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuizTakingMockup() {
  const choices = ["Porto-Novo", "Cotonou", "Parakou", "Bohicon"];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary">Question 3 / 10</Badge>
        <Badge variant="outline">00:42</Badge>
      </div>
      <p className="text-lg font-medium">Quelle est la capitale du Bénin ?</p>
      <div className="flex flex-col gap-2">
        {choices.map((choice, i) => (
          <div
            key={choice}
            className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm"
          >
            {i === 0 ? (
              <CheckCircle2 className="size-4 text-primary" />
            ) : (
              <Circle className="size-4 text-muted-foreground" />
            )}
            {choice}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DemoSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Voyez QuizNest en action</h2>
        <p className="mt-3 text-muted-foreground">
          Un tableau de bord clair pour vous, une expérience fluide pour vos participants.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10">
        <Tabs defaultValue="dashboard">
          <TabsList className="mx-auto w-fit">
            <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            <TabsTrigger value="quiz">Passage du quiz</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-6">
            <BrowserFrame>
              <DashboardMockup />
            </BrowserFrame>
          </TabsContent>
          <TabsContent value="quiz" className="mt-6">
            <BrowserFrame>
              <QuizTakingMockup />
            </BrowserFrame>
          </TabsContent>
        </Tabs>
      </Reveal>
    </section>
  );
}
