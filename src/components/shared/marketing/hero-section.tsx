"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function FloatingGrid() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_20%,transparent_70%)]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.52_0.22_265/0.03)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.52_0.22_265/0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
    </div>
  );
}

function FloatingShapes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute top-20 left-[15%] size-3 rounded-full bg-primary/30 dark:bg-primary/20"
        animate={{ y: [0, -12, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 right-[20%] size-2 rounded-full bg-violet-400/40 dark:bg-violet-400/30"
        animate={{ y: [0, -8, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-1/3 left-[30%] size-4 rounded-full border border-emerald-400/40 dark:border-emerald-400/30"
        animate={{ y: [0, -16, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-1/3 right-[10%] size-2 rounded-full bg-primary/20 dark:bg-primary/10"
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-[60%] left-[8%] size-1.5 rounded-full bg-violet-300/40 dark:bg-violet-300/30"
        animate={{ x: [0, 10, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
      <motion.div
        className="absolute top-[15%] left-[45%] size-1 rounded-full bg-emerald-300/50 dark:bg-emerald-300/30"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
    </div>
  );
}

function GradientOrb() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full opacity-20 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.52 0.22 265 / 0.4), oklch(0.55 0.22 290 / 0.2), transparent 70%)",
        }}
        animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function HeroMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative mx-auto mt-12 max-w-4xl"
    >
      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-primary/10 dark:shadow-primary/5">
        <div className="flex items-center gap-1.5 border-b bg-muted/50 px-4 py-2.5">
          <div className="size-2.5 rounded-full bg-rose-400/80" />
          <div className="size-2.5 rounded-full bg-amber-400/80" />
          <div className="size-2.5 rounded-full bg-emerald-400/80" />
          <div className="ml-3 flex-1 rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">
            quiznest.app/dashboard
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 p-4 sm:p-6">
          <div className="col-span-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Quiz publiés", value: "24", change: "+12%", color: "from-primary/20 to-primary/5" },
              { label: "Participants", value: "1 284", change: "+8%", color: "from-violet-500/20 to-violet-500/5" },
              { label: "Taux moyen", value: "78%", change: "+5%", color: "from-emerald-500/20 to-emerald-500/5" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-xl bg-gradient-to-br ${stat.color} p-4 ring-1 ring-border`}
              >
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">{stat.value}</p>
                <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">{stat.change}</p>
              </div>
            ))}
          </div>
          <div className="col-span-4 sm:col-span-2">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">Quiz récents</p>
              {[
                { title: "Maths – Ch. 3", status: "Actif", responses: 42 },
                { title: "Culture générale", status: "Actif", responses: 28 },
                { title: "Test technique JS", status: "Clôturé", responses: 15 },
              ].map((q) => (
                <div
                  key={q.title}
                  className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                >
                  <span className="text-sm font-medium">{q.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{q.responses} réponses</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        q.status === "Actif"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-4 sm:col-span-2">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">Distribution des scores</p>
              <div className="mt-4 flex items-end justify-between gap-1.5">
                {[35, 55, 72, 88, 65, 45, 30].map((h, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: h * 1.5 }}
                      transition={{ duration: 0.6, delay: 0.8 + i * 0.08, ease: "easeOut" }}
                      className="w-full rounded-md bg-gradient-to-t from-primary/60 to-primary/30"
                      style={{ height: h * 1.5 }}
                    />
                    <span className="text-[10px] text-muted-foreground">{i * 20 + 20}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <motion.div
        className="absolute -bottom-3 -right-3 -z-10 size-full rounded-2xl border border-primary/20 bg-primary/5"
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-24 sm:pt-32"
    >
      <FloatingGrid />
      <FloatingShapes />
      <GradientOrb />

      <motion.div style={{ y, opacity }} className="flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Badge variant="outline" className="mb-6 gap-1.5 px-3 py-1 text-xs font-normal">
            <Sparkles className="size-3 text-primary" />
            IA intégrée nativement
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Créez, partagez et{" "}
          <span className="bg-gradient-to-r from-primary via-primary to-violet-500 bg-clip-text text-transparent dark:from-primary dark:via-violet-400 dark:to-emerald-400">
            analysez
          </span>{" "}
          vos évaluations.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          La plateforme nouvelle génération qui transforme vos évaluations en expériences interactives.
          <span className="hidden sm:inline"> IA, analytics, flexibilité de paiement — tout inclus.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/register">
            <Button size="lg" className="h-11 gap-2 rounded-xl px-6 text-base shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-100">
              Commencer gratuitement
              <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-0.5" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="h-11 gap-2 rounded-xl px-6 text-base">
            <Play className="size-4" />
            Voir la démo
          </Button>
        </motion.div>
      </motion.div>

      <HeroMockup />
    </section>
  );
}
