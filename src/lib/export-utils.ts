export function toCsvValue(value: string | number) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function toCsvTable(rows: Record<string, string | number>[]) {
  if (rows.length === 0) return "";
  const header = Object.keys(rows[0]);
  return [header, ...rows.map((r) => Object.values(r))].map((row) => row.map(toCsvValue).join(",")).join("\n");
}

export function downloadBlob(content: BlobPart, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  ABANDONED: "Abandonné",
};
