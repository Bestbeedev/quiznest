"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

type QuizView = "grid" | "list";

const STORAGE_KEY = "quiznest-quiz-view";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): QuizView {
  return localStorage.getItem(STORAGE_KEY) === "list" ? "list" : "grid";
}

function getServerSnapshot(): QuizView {
  return "grid";
}

function setStoredView(view: QuizView) {
  localStorage.setItem(STORAGE_KEY, view);
  listeners.forEach((listener) => listener());
}

const QuizViewContext = createContext<{
  view: QuizView;
  setView: (view: QuizView) => void;
} | null>(null);

export function QuizViewProvider({ children }: { children: ReactNode }) {
  const view = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <QuizViewContext.Provider value={{ view, setView: setStoredView }}>
      {children}
    </QuizViewContext.Provider>
  );
}

export function useQuizView() {
  const ctx = useContext(QuizViewContext);
  if (!ctx) throw new Error("useQuizView must be used within QuizViewProvider");
  return ctx;
}
