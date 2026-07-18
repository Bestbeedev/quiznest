"use client";

import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import type { Participant } from "@/generated/prisma/client";

type ExportRow = Participant & { quiz: { title: string } };

const STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  ABANDONED: "Abandonné",
};

function toRows(participants: ExportRow[]) {
  return participants.map((p) => ({
    Nom: p.name,
    Email: p.email ?? "",
    Quiz: p.quiz.title,
    Statut: STATUS_LABELS[p.status] ?? p.status,
    "Score (%)": p.status === "COMPLETED" ? p.percentage : "",
    Résultat: p.status === "COMPLETED" ? (p.passed ? "Réussi" : "Échoué") : "",
    "Démarré le": new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(p.startedAt),
    "Terminé le": p.completedAt
      ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(p.completedAt)
      : "",
  }));
}

function toCsvValue(value: string | number) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function downloadBlob(content: BlobPart, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ParticipantsExportButtons({ participants }: { participants: ExportRow[] }) {
  const exportCsv = () => {
    const rows = toRows(participants);
    const header = Object.keys(rows[0] ?? {});
    const csv = [header, ...rows.map((r) => Object.values(r))]
      .map((row) => row.map(toCsvValue).join(","))
      .join("\n");
    downloadBlob(`﻿${csv}`, "participants.csv", "text/csv;charset=utf-8");
  };

  const exportExcel = () => {
    const rows = toRows(participants);
    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Participants");
    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    downloadBlob(
      buffer,
      "participants.xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Participants", 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [["Nom", "Email", "Quiz", "Statut", "Score", "Résultat", "Démarré le"]],
      body: participants.map((p) => [
        p.name,
        p.email ?? "",
        p.quiz.title,
        STATUS_LABELS[p.status] ?? p.status,
        p.status === "COMPLETED" ? `${p.percentage}%` : "—",
        p.status === "COMPLETED" ? (p.passed ? "Réussi" : "Échoué") : "—",
        new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(p.startedAt),
      ]),
      headStyles: { fillColor: [30, 30, 30] },
      styles: { fontSize: 8 },
    });

    doc.save("participants.pdf");
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
