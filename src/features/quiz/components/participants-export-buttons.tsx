"use client";

import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import * as XLSX from "xlsx";

import { ExportMenu } from "@/components/shared/export-menu";
import { downloadBlob, toCsvValue } from "@/lib/export-utils";
import { PARTICIPANT_STATUS_LABELS } from "@/lib/constants";
import type { Participant } from "@/generated/prisma/client";

type ExportRow = Participant & { quiz: { title: string } };

function toRows(participants: ExportRow[]) {
  return participants.map((p) => ({
    Nom: p.name,
    Email: p.email ?? "",
    Quiz: p.quiz.title,
    Statut: PARTICIPANT_STATUS_LABELS[p.status] ?? p.status,
    "Score (%)": p.status === "COMPLETED" ? p.percentage : "",
    Résultat: p.status === "COMPLETED" ? (p.passed ? "Réussi" : "Échoué") : "",
    "Démarré le": new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(p.startedAt),
    "Terminé le": p.completedAt
      ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(p.completedAt)
      : "",
  }));
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
        PARTICIPANT_STATUS_LABELS[p.status] ?? p.status,
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
    <ExportMenu
      formats={["csv", "excel", "pdf"]}
      onExport={(f) => {
        if (f === "csv") exportCsv();
        else if (f === "excel") exportExcel();
        else exportPdf();
      }}
    />
  );
}
