"use client";

import { motion } from "framer-motion";

export function DecorativeBlobs({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className ?? ""}`}
    >
      <motion.div
        className="absolute -top-24 -left-24 size-80 rounded-full bg-primary/20 blur-3xl will-change-transform dark:bg-primary/10"
        animate={{ y: [0, 20, 0], x: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 size-96 rounded-full bg-violet-500/20 blur-3xl will-change-transform dark:bg-violet-500/10"
        animate={{ y: [0, -25, 0], x: [0, -10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/4 size-72 rounded-full bg-emerald-500/15 blur-3xl will-change-transform dark:bg-emerald-500/10"
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
