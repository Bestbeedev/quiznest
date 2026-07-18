"use client";

import { FileDown, FileSpreadsheet } from "lucide-react";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/format";
import type { Participant } from "@/generated/prisma/client";

type QuestionStat = { id: string; title: string; successRate: number | null };

const STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  ABANDONED: "Abandonné",
};

function toCsvValue(value: string | number) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ResultsExportButtons({
  quizTitle,
  participants,
  totalCompleted,
  averageScore,
  passRate,
  averageTimeSpent,
  questionStats,
}: {
  quizTitle: string;
  participants: Participant[];
  totalCompleted: number;
  averageScore: number | null;
  passRate: number | null;
  averageTimeSpent: number | null;
  questionStats: QuestionStat[];
}) {
  const exportCsv = () => {
    const header = ["Nom", "Email", "Statut", "Score (%)", "Résultat", "Démarré le", "Terminé le"];
    const rows = participants.map((p) => [
      p.name,
      p.email ?? "",
      STATUS_LABELS[p.status] ?? p.status,
      p.status === "COMPLETED" ? String(p.percentage) : "",
      p.status === "COMPLETED" ? (p.passed ? "Réussi" : "Échoué") : "",
      new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(p.startedAt),
      p.completedAt
        ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(p.completedAt)
        : "",
    ]);

    const csv = [header, ...rows].map((row) => row.map(toCsvValue).join(",")).join("\n");
    downloadBlob(`﻿${csv}`, `${quizTitle}-participants.csv`, "text/csv;charset=utf-8");
  };

  const exportPdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(quizTitle, 14, 18);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text("Rapport de résultats", 14, 25);

    doc.setFontSize(10);
    doc.setTextColor(0);
    const summaryLines = [
      `Tentatives terminées : ${totalCompleted}`,
      `Score moyen : ${averageScore === null ? "—" : `${averageScore}%`}`,
      `Taux de réussite : ${passRate === null ? "—" : `${passRate}%`}`,
      `Temps moyen : ${averageTimeSpent === null ? "—" : formatDuration(averageTimeSpent)}`,
    ];
    doc.text(summaryLines, 14, 35);

    autoTable(doc, {
      startY: 35 + summaryLines.length * 5 + 5,
      head: [["Question", "Taux de réussite"]],
      body: questionStats.map((q) => [q.title, q.successRate === null ? "—" : `${q.successRate}%`]),
      headStyles: { fillColor: [30, 30, 30] },
      styles: { fontSize: 9 },
    });

    doc.save(`${quizTitle}-rapport.pdf`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5">
        <FileSpreadsheet className="size-3.5" />
        Export CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportPdf} className="gap-1.5">
        <FileDown className="size-3.5" />
        Export PDF
      </Button>
    </div>
  );
}
