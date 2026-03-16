"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export default function FormSelect({
  label,
  value,
  onChange,
  options = [],
  searchableThreshold = 20,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  const selected = options.find((opt) => opt.value === value);

  const isSearchable = options.length > searchableThreshold;

  const regex = useMemo(() => new RegExp(search, "i"), [search])

  const filteredOptions = options.filter((opt) =>
    opt.label?.toLowerCase()?.includes(search.toLowerCase()) ||
    regex.test(opt.mobileNumber) ||
    regex.test(opt.coachId) ||
    regex.test(opt.clientId)
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1 relative" ref={wrapperRef}>
      <Label>{label}</Label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-between px-3 py-2 border border-gray-300 bg-white text-sm rounded-sm hover:bg-gray-50"
      >
        <span className="truncate">
          {selected ? selected.label : "Select option"}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full border border-gray-200 bg-white rounded-sm z-50">
          {isSearchable && (
            <div className="p-2 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-sm focus:outline-none focus:border-black"
              />
            </div>
          )}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">
                No results found
              </div>
            )}

            {filteredOptions.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setSearch("");
                }}
                className={cn(
                  "px-3 py-2 text-sm cursor-pointer flex items-center hover:bg-gray-50",
                  value === opt.value && "bg-gray-50"
                )}
              >
                {opt.label}
                {value === opt.value && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}