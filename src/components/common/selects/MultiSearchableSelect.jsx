"use client"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function MultiSearchableSelect({
  value = [],
  onValueChange,
  options,
  searchFn,
  selectLabel = "Select options...",
  searchEnabled = true,
  searchPlaceholder,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const filteredOptions = useMemo(() => {
    if (typeof searchFn === "function") {
      return options.filter((option) => searchFn(option, query))
    }
    const regex = new RegExp(query, "i")
    return options.filter(option => regex.test(option.label))
  }, [options, searchFn, query])

  const handleSelect = (currentValue) => {
    const isSelected = value.includes(currentValue)
    if (isSelected) {
      onValueChange(value.filter((v) => v !== currentValue))
    } else {
      onValueChange([...value, currentValue])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10"
        >
          <div className="flex flex-wrap gap-1">
            {(!selectLabel && value.length > 0) ? (
              options
                .filter((o) => value.includes(o.value))
                .map((option) => (
                  <Badge 
                    variant="secondary" 
                    key={option.value}
                    className="mr-1 mb-1"
                  >
                    {option.label}
                  </Badge>
                ))
            ) : (
              <span className="text-muted-foreground">{selectLabel}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-[200px]" align="start">
        <Command shouldFilter={false}>
          {searchEnabled && <CommandInput
            placeholder={searchPlaceholder ?? "Search..."}
            value={query}
            onValueChange={setQuery}
          />}
          <CommandList
            className="w-full max-h-[300px] overflow-y-auto"
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => {
                const isSelected = value.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-5 w-5 items-center justify-center rounded-[4px] p-1 border border-primary",
                        isSelected
                          ? "bg-[var(--accent-1)] text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4 text-white")} />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}