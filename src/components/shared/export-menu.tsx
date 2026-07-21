"use client";

import Link from "next/link";
import { FileDown, FileSpreadsheet, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ExportFormat = "csv" | "excel" | "pdf";

const FORMAT_CONFIG: Record<ExportFormat, { label: string; icon: typeof FileText }> = {
  csv: { label: "CSV", icon: FileText },
  excel: { label: "Excel", icon: FileSpreadsheet },
  pdf: { label: "PDF", icon: FileDown },
};

export function ExportMenu({
  formats,
  onExport,
  disabledFormats,
  loading,
}: {
  formats: ExportFormat[];
  onExport: (format: ExportFormat) => void;
  disabledFormats?: Partial<Record<ExportFormat, string>>;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {formats.map((format) => {
        const config = FORMAT_CONFIG[format];
        const Icon = config.icon;
        const disabledReason = disabledFormats?.[format];
        const isDisabled = !!disabledReason;

        if (isDisabled) {
          return (
            <Button
              key={format}
              variant="outline"
              size="sm"
              disabled
              className="gap-1.5 text-muted-foreground"
              title={disabledReason}
            >
              <Lock className="size-3.5" />
              {config.label}
            </Button>
          );
        }

        return (
          <Button
            key={format}
            variant="outline"
            size="sm"
            onClick={() => onExport(format)}
            disabled={loading}
            className="gap-1.5"
          >
            <Icon className="size-3.5" />
            {loading ? "..." : config.label}
          </Button>
        );
      })}
      {disabledFormats && Object.keys(disabledFormats).length > 0 && (
        <Link
          href="/dashboard/billing"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Lock className="size-3" />
          Débloquer
        </Link>
      )}
    </div>
  );
}
