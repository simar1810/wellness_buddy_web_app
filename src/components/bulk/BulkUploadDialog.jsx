"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

const MAX_ROWS = 20;

/**
 * Generic multi-row bulk upload dialog (no CSV).
 * @param {object} props
 * @param {string} props.title
 * @param {() => object} props.createEmptyRow
 * @param {(row: object, index: number, onChange: (patch: object) => void) => React.ReactNode} props.renderRow
 * @param {(rows: object[]) => Promise<{ createdCount?: number, failedCount?: number, message?: string }>} props.onSubmit
 * @param {boolean} [props.disabled]
 * @param {string} [props.triggerLabel]
 */
export default function BulkUploadDialog({
  title = "Bulk Upload",
  createEmptyRow,
  renderRow,
  onSubmit,
  disabled = false,
  triggerLabel = "Bulk Upload",
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(() => [createEmptyRow()]);
  const [saving, setSaving] = useState(false);

  function reset() {
    setRows([createEmptyRow()]);
  }

  function updateRow(index, patch) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  function addRow() {
    if (rows.length >= MAX_ROWS) {
      toast.error(`Maximum ${MAX_ROWS} rows per upload`);
      return;
    }
    setRows((prev) => [...prev, createEmptyRow()]);
  }

  function removeRow(index) {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit() {
    const toastId = toast.loading("Uploading...");
    try {
      setSaving(true);
      const result = await onSubmit(rows);
      const created = result?.createdCount ?? 0;
      const failed = result?.failedCount ?? 0;
      if (created > 0 && failed === 0) {
        toast.success(result?.message || `Created ${created} item(s)`);
      } else if (created > 0) {
        toast.warning(`Created ${created}, failed ${failed}`);
      } else {
        toast.error(result?.message || "Nothing created");
        return;
      }
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(err?.message || "Bulk upload failed");
    } finally {
      setSaving(false);
      toast.dismiss(toastId);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="min-h-11 gap-2"
        >
          <Upload className="w-4 h-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {rows.map((row, index) => (
            <div
              key={index}
              className="rounded-xl border border-[var(--border)] bg-[var(--comp-2)] p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Item {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="min-h-11 min-w-11"
                  disabled={rows.length <= 1 || saving}
                  onClick={() => removeRow(index)}
                  aria-label={`Remove item ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {renderRow(row, index, (patch) => updateRow(index, patch))}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 gap-2"
            disabled={saving || rows.length >= MAX_ROWS}
            onClick={addRow}
          >
            <Plus className="w-4 h-4" />
            Add another
          </Button>
          <Button
            type="button"
            className="min-h-11"
            disabled={saving}
            onClick={handleSubmit}
          >
            {saving ? "Saving..." : `Upload ${rows.length} item(s)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
