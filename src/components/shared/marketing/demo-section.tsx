"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Monitor,
  LayoutDashboard,
  BarChart4,
  TrendingUp,
  Users,
  Trophy,
  ArrowUpRight,
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/shared/reveal";
import { DEMO_TABS } from "@/constants/marketing";

function DashboardView() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden rounded-2xl border bg-card shadow-xl"
    >
      <div className="flex items-center gap-1.5 border-b bg-muted/50 px-4 py-2.5">
        <div className="size-2.5 rounded-full bg-rose-400/80" />
        <div className="size-2.5 rounded-full bg-amber-400/80" />
        <div className="size-2.5 rounded-full bg-emerald-400/80" />
        <div className="ml-3 text-xs font-medium text-muted-foreground">Tableau de bord</div>
      </div>

      <div className="grid grid-cols-4 gap-3 p-4 sm:p-5">
        <div className="col-span-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: BookOpen, label: "Quiz créés", value: "24", color: "text-primary", bg: "bg-primary/10" },
            { icon: Users, label: "Participants", value: "1 284", color: "text-violet-500", bg: "bg-violet-500/10" },
            { icon: Trophy, label: "Taux moyen", value: "78%", color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { icon: TrendingUp, label: "Progression", value: "+12%", color: "text-amber-500", bg: "bg-amber-500/10" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-3.5">
              <div className={`flex size-8 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`size-4 ${s.color}`} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-xl font-semibold tracking-tight ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="col-span-4 sm:col-span-2">
          <p className="mb-3 text-xs font-medium text-muted-foreground">Quiz récents</p>
          {[
            { title: "Mathématiques – Ch. 3", status: "Actif", responses: 42, score: 76 },
            { title: "Culture générale Q1", status: "Actif", responses: 28, score: 82 },
            { title: "Test technique JavaScript", status: "Clôturé", responses: 15, score: 68 },
            { title: "Anglais – Vocabulaire", status: "Brouillon", responses: 0, score: null },
          ].map((q) => (
            <div
              key={q.title}
              className="mb-2 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{q.title}</p>
                <p className="text-xs text-muted-foreground">{q.responses} réponses</p>
              </div>
              <div className="flex items-center gap-2">
                {q.score && <span className="text-sm font-medium">{q.score}%</span>}
                <span
                  className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    q.status === "Actif"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : q.status === "Clôturé"
                        ? "bg-muted text-muted-foreground"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {q.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-4 sm:col-span-2">
          <p className="mb-3 text-xs font-medium text-muted-foreground">Taux de réussite par quiz</p>
          <div className="space-y-3">
            {[
              { label: "Maths Ch.3", value: 76 },
              { label: "Culture G.", value: 82 },
              { label: "JS Test", value: 68 },
              { label: "Anglais", value: 91 },
            ].map((q) => (
              <div key={q.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{q.label}</span>
                  <span className="text-muted-foreground">{q.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${q.value}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function QuizView() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden rounded-2xl border bg-card shadow-xl"
    >
      <div className="flex items-center gap-1.5 border-b bg-muted/50 px-4 py-2.5">
        <div className="size-2.5 rounded-full bg-rose-400/80" />
        <div className="size-2.5 rounded-full bg-amber-400/80" />
        <div className="size-2.5 rounded-full bg-emerald-400/80" />
        <div className="ml-3 text-xs font-medium text-muted-foreground">
          Quiz : Culture générale
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Question 3 / 10</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              04:32 restant
            </span>
          </div>
        </div>

        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "30%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-primary"
          />
        </div>

        <p className="mt-4 text-base font-medium sm:text-lg">
          Quelle est la capitale du Ghana ?
        </p>

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {["Accra", "Lagos", "Abidjan", "Nairobi"].map((option, i) => (
            <motion.button
              key={option}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors ${
                i === 0
                  ? "border-emerald-500/50 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400"
                  : "border-border bg-card hover:bg-muted/50"
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-medium ${
                  i === 0
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              {option}
              {i === 0 && <CheckCircle2 className="ml-auto size-4 text-emerald-500" />}
            </motion.button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`size-2 rounded-full ${
                  i < 2
                    ? "bg-emerald-500"
                    : i === 2
                      ? "bg-primary"
                      : "bg-muted"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
          >
            Suivant
            <ArrowUpRight className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AnalyticsView() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden rounded-2xl border bg-card shadow-xl"
    >
      <div className="flex items-center gap-1.5 border-b bg-muted/50 px-4 py-2.5">
        <div className="size-2.5 rounded-full bg-rose-400/80" />
        <div className="size-2.5 rounded-full bg-amber-400/80" />
        <div className="size-2.5 rounded-full bg-emerald-400/80" />
        <div className="ml-3 text-xs font-medium text-muted-foreground">Analytiques</div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 sm:p-5 sm:grid-cols-4">
        {[
          { label: "Taux de réussite", value: "78%", change: "+5%", color: "text-emerald-500" },
          { label: "Temps moyen", value: "6m 42s", change: "-12%", color: "text-primary" },
          { label: "Taux d'abandon", value: "8%", change: "-3%", color: "text-emerald-500" },
          { label: "Score moyen", value: "7.8/10", change: "+0.4", color: "text-violet-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-3.5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`mt-1 text-lg font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="border-t px-4 pb-4 sm:px-5 sm:pb-5">
        <p className="mb-3 text-xs font-medium text-muted-foreground">
          Questions les plus échouées
        </p>
        <div className="space-y-2">
          {[
            { q: "Capitale du Ghana", rate: 32, color: "bg-rose-500" },
            { q: "Date de l'indépendance", rate: 45, color: "bg-amber-500" },
            { q: "Fleuve le plus long", rate: 58, color: "bg-primary" },
            { q: "Population du continent", rate: 72, color: "bg-emerald-500" },
          ].map((item) => (
            <div key={item.q} className="flex items-center gap-3">
              <span className="w-40 text-xs font-medium truncate">{item.q}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.rate}%` }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${item.rate}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-muted-foreground">{item.rate}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const VIEWS = {
  dashboard: DashboardView,
  quiz: QuizView,
  analytics: AnalyticsView,
} as const;

export function DemoSection() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const ActiveView = VIEWS[activeTab as keyof typeof VIEWS] ?? DashboardView;

  return (
    <section className="bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Démonstration</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Voyez-le en action
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Explorez l&apos;interface par vous-même. Cliquez sur les onglets pour découvrir chaque vue.
            </p>
          </div>
        </Reveal>

        <div className="mt-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} > 
            <Reveal delay={0.1}>
              <TabsList className="mx-auto mb-8 p-4 w-fit">
                {DEMO_TABS.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5">
                    <tab.icon className="size-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Reveal>

            <Reveal delay={0.2} direction="up">
              <div className="relative">
                <AnimatePresence mode="wait">
                  <ActiveView key={activeTab} />
                </AnimatePresence>
              </div>
            </Reveal>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
