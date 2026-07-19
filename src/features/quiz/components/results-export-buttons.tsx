"use client";

import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

import { ExportMenu } from "@/components/shared/export-menu";
import { formatDuration } from "@/lib/format";
import { PARTICIPANT_STATUS_LABELS, downloadBlob, toCsvValue } from "@/lib/export-utils";
import type { Participant } from "@/generated/prisma/client";

type QuestionStat = { id: string; title: string; successRate: number | null };

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
      PARTICIPANT_STATUS_LABELS[p.status] ?? p.status,
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

  return <ExportMenu formats={["csv", "pdf"]} onExport={(f) => (f === "csv" ? exportCsv() : exportPdf())} />;
}
