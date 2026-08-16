"use client";

import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SortableHandle({ listeners, attributes, disabled, className }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`cursor-grab active:cursor-grabbing disabled:cursor-default disabled:opacity-30 p-1 rounded-md hover:bg-[var(--comp-2)] motion-reduce:transition-none ${className || ""}`}
      aria-label="Drag to reorder"
      {...(disabled ? {} : { ...attributes, ...listeners })}
    >
      <GripVertical className="w-4 h-4 text-current" />
    </button>
  );
}

export function MoveButtons({ index, lastIndex, disabled, onMove }) {
  return (
    <div className="flex flex-col">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-6 w-6 cursor-pointer"
        disabled={disabled || index === 0}
        aria-label="Move up"
        onClick={() => onMove(index, -1)}
      >
        <ChevronUp className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-6 w-6 cursor-pointer"
        disabled={disabled || index === lastIndex}
        aria-label="Move down"
        onClick={() => onMove(index, 1)}
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
