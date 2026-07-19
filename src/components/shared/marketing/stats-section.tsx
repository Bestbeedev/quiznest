"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { BarChart3, Building2, Brain, Users } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";

const STATS = [
  {
    icon: BarChart3,
    value: 12_400,
    suffix: "+",
    label: "Quiz créés",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Users,
    value: 58_000,
    suffix: "+",
    label: "Participants",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Building2,
    value: 320,
    suffix: "+",
    label: "Organisations",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Brain,
    value: 245_000,
    suffix: "+",
    label: "Questions générées par IA",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return n.toString();
}

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!isInView) return;
    const duration = 1800;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <Reveal>
          <p className="text-center text-xs font-medium tracking-widest uppercase text-muted-foreground">
            Rejoignez des milliers d&apos;organisations
          </p>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={0.1 + i * 0.1}>
              <motion.div
                className="flex flex-col items-center text-center"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div
                  className={`flex size-12 items-center justify-center rounded-2xl ${stat.bg}`}
                >
                  <stat.icon className={`size-6 ${stat.color}`} />
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
