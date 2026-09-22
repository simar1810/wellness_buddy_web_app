"use client";

import { Label } from "@/components/ui/label";
import SelectMultiple from "@/components/SelectMultiple";
import { useAvailabilityOptions } from "@/hooks/useAvailabilityOptions";
import { checkArray } from "@/lib/formatter";

/** Availability multi-select for bulk upload rows (same options as Create Post). */
export default function BulkAvailabilityField({ value = [], onChange }) {
  const options = useAvailabilityOptions();

  return (
    <div className="space-y-1.5 pt-1 border-t border-[var(--comp-3)]/60">
      <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Availability
      </Label>
      <SelectMultiple
        options={options}
        value={checkArray(value)}
        onChange={(val) => onChange(checkArray(val))}
      />
      <p className="text-[11px] text-muted-foreground">
        Who can see this — clients, coaches, or categories.
      </p>
    </div>
  );
}

export const DEFAULT_BULK_AVAILABILITY = ["client", "coach"];
