"use client";

import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type ExportFormat = "csv" | "excel" | "pdf";

const FORMAT_CONFIG: Record<ExportFormat, { label: string; icon: typeof FileText }> = {
  csv: { label: "CSV", icon: FileText },
  excel: { label: "Excel", icon: FileSpreadsheet },
  pdf: { label: "PDF", icon: FileDown },
};

export function ExportMenu({
  formats,
  onExport,
}: {
  formats: ExportFormat[];
  onExport: (format: ExportFormat) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {formats.map((format) => {
        const config = FORMAT_CONFIG[format];
        const Icon = config.icon;
        return (
          <Button
            key={format}
            variant="outline"
            size="sm"
            onClick={() => onExport(format)}
            className="gap-1.5"
          >
            <Icon className="size-3.5" />
            {config.label}
          </Button>
        );
      })}
    </div>
  );
}
