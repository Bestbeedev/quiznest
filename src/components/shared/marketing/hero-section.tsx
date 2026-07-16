"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 pt-20 pb-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Badge variant="secondary" className="gap-1.5">
          <Sparkles className="size-3.5" />
          IA intégrée nativement
        </Badge>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
        className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
      >
        Créez des évaluations qui marquent, en quelques minutes.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        className="max-w-2xl text-lg text-muted-foreground text-balance"
      >
        Quiz, examens, certifications et tests de recrutement — QuizNest est la plateforme
        d&apos;évaluation nouvelle génération pour l&apos;éducation, les entreprises et les
        organisations.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
        className="flex flex-col gap-3 pt-2 sm:flex-row"
      >
        <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}>
          Commencer gratuitement
          <ArrowRight className="size-4" />
        </Link>
        <a href="#fonctionnalites" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
          Découvrir les fonctionnalités
        </a>
      </motion.div>
    </section>
  );
}
