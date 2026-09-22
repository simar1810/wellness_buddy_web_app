"use client";

import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";

/**
 * Sticky bulk-delete toolbar shown when selection is non-empty.
 */
export default function BulkDeleteToolbar({
  selectedCount = 0,
  onClear,
  onConfirmDelete,
  label = "items",
}) {
  if (!selectedCount) return null;

  return (
    <div
      className="sticky top-0 z-20 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-[var(--comp)] px-4 py-3 shadow-sm motion-safe:animate-in motion-safe:fade-in"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-medium">{selectedCount} selected</p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 gap-2"
          onClick={onClear}
        >
          <X className="w-4 h-4" />
          Clear
        </Button>
        <DualOptionActionModal
          title={`Delete ${selectedCount} ${label}?`}
          description="This cannot be undone."
          action={async (setLoading, btnRef) => {
            const toastId = toast.loading("Deleting...");
            try {
              setLoading(true);
              await onConfirmDelete();
              toast.success(`Deleted ${selectedCount} ${label}`);
              btnRef?.current?.click();
            } catch (err) {
              toast.error(err?.message || "Bulk delete failed");
            } finally {
              setLoading(false);
              toast.dismiss(toastId);
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11 gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Bulk Delete
            </Button>
          </AlertDialogTrigger>
        </DualOptionActionModal>
      </div>
    </div>
  );
}
