"use client";

import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import type { QuizComparisonRow, UserAnalysisRow } from "@/lib/analytics";

function downloadBlob(content: BlobPart, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function toCsvValue(value: string | number) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function toCsvTable(rows: Record<string, string | number>[]) {
  if (rows.length === 0) return "";
  const header = Object.keys(rows[0]);
  return [header, ...rows.map((r) => Object.values(r))].map((row) => row.map(toCsvValue).join(",")).join("\n");
}

export function AnalyticsExportButtons({
  quizRows,
  userRows,
}: {
  quizRows: QuizComparisonRow[];
  userRows: UserAnalysisRow[];
}) {
  const quizTable = quizRows.map((r) => ({
    Quiz: r.title,
    Participants: r.participants,
    "Score moyen (%)": r.averageScore ?? "",
    "Taux de réussite (%)": r.passRate ?? "",
  }));

  const userTable = userRows.map((r) => ({
    Nom: r.name,
    Email: r.email ?? "",
    "Quiz passés": r.quizzesTaken,
    Tentatives: r.attempts,
    "Score moyen (%)": r.averageScore ?? "",
    "Taux de réussite (%)": r.passRate ?? "",
  }));

  const exportCsv = () => {
    const csv = `Analyse par quiz\n${toCsvTable(quizTable)}\n\nAnalyse par utilisateur\n${toCsvTable(userTable)}`;
    downloadBlob(`﻿${csv}`, "analytics.csv", "text/csv;charset=utf-8");
  };

  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(quizTable), "Par quiz");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(userTable), "Par utilisateur");
    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    downloadBlob(buffer, "analytics.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Analytics", 14, 18);

    doc.setFontSize(12);
    doc.text("Analyse par quiz", 14, 28);
    autoTable(doc, {
      startY: 32,
      head: [["Quiz", "Participants", "Score moyen", "Réussite"]],
      body: quizRows.map((r) => [
        r.title,
        String(r.participants),
        r.averageScore === null ? "—" : `${r.averageScore}%`,
        r.passRate === null ? "—" : `${r.passRate}%`,
      ]),
      headStyles: { fillColor: [30, 30, 30] },
      styles: { fontSize: 9 },
    });

    const afterQuizY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    doc.text("Analyse par utilisateur", 14, afterQuizY);
    autoTable(doc, {
      startY: afterQuizY + 4,
      head: [["Nom", "Quiz passés", "Tentatives", "Score moyen", "Réussite"]],
      body: userRows.map((r) => [
        r.name,
        String(r.quizzesTaken),
        String(r.attempts),
        r.averageScore === null ? "—" : `${r.averageScore}%`,
        r.passRate === null ? "—" : `${r.passRate}%`,
      ]),
      headStyles: { fillColor: [30, 30, 30] },
      styles: { fontSize: 9 },
    });

    doc.save("analytics.pdf");
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5">
        <FileText className="size-3.5" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportExcel} className="gap-1.5">
        <FileSpreadsheet className="size-3.5" />
        Excel
      </Button>
      <Button variant="outline" size="sm" onClick={exportPdf} className="gap-1.5">
        <FileDown className="size-3.5" />
        PDF
      </Button>
    </div>
  );
}
