"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
 */
export default function BulkUploadDialog({
  title = "Bulk Upload",
  description = "Add multiple items, set fields including Availability, then upload.",
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
          className="min-h-11 gap-2 rounded-xl border-[var(--comp-3)] shadow-sm"
        >
          <Upload className="w-4 h-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl sm:max-w-2xl max-h-[88vh] overflow-hidden flex flex-col gap-0 p-0 rounded-2xl">
        <DialogHeader className="px-5 pt-5 pb-3 border-b bg-[var(--comp)]/40 shrink-0">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {rows.map((row, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[var(--comp-3)] bg-[var(--comp-2)]/80 p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center rounded-full bg-[var(--comp)] px-2.5 py-0.5 text-xs font-semibold text-muted-foreground tabular-nums">
                  Item {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="min-h-10 min-w-10 rounded-full text-muted-foreground hover:text-red-500"
                  disabled={rows.length <= 1 || saving}
                  onClick={() => removeRow(index)}
                  aria-label={`Remove item ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {renderRow(row, index, (patch) => updateRow(index, patch))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-t bg-[var(--comp)]/30 shrink-0">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 gap-2 rounded-xl"
            disabled={saving || rows.length >= MAX_ROWS}
            onClick={addRow}
          >
            <Plus className="w-4 h-4" />
            Add another
          </Button>
          <Button
            type="button"
            variant="wz"
            className="min-h-11 rounded-xl px-5"
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
