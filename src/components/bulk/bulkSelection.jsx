"use client";

import { Checkbox } from "@/components/ui/checkbox";

/** Select-all checkbox for list headers. */
export function SelectAllCheckbox({ ids = [], selected = [], onChange, disabled }) {
  const allSelected = ids.length > 0 && ids.every((id) => selected.includes(id));
  const someSelected = ids.some((id) => selected.includes(id));

  return (
    <Checkbox
      checked={allSelected ? true : someSelected ? "indeterminate" : false}
      disabled={disabled || ids.length === 0}
      onCheckedChange={(checked) => {
        if (checked) onChange(ids);
        else onChange([]);
      }}
      aria-label="Select all"
      className="min-h-5 min-w-5"
    />
  );
}

/** Per-row checkbox. */
export function RowCheckbox({ id, selected = [], onChange, disabled }) {
  const isChecked = selected.includes(id);
  return (
    <Checkbox
      checked={isChecked}
      disabled={disabled}
      onCheckedChange={(checked) => {
        if (checked) onChange([...selected, id]);
        else onChange(selected.filter((x) => x !== id));
      }}
      aria-label={`Select ${id}`}
      className="min-h-5 min-w-5"
      onClick={(e) => e.stopPropagation()}
    />
  );
}
