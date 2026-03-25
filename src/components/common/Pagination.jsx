import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, hasPrev, hasNext, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Page {page}
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={!hasPrev}
          onClick={onPrev}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-50 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>
        <button
          disabled={!hasNext}
          onClick={onNext}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-50 transition"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}