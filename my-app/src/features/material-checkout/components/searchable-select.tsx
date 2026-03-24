import { type ReactNode, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type SearchableSelectProps<TItem> = {
  items: TItem[]
  selectedKey?: string
  onSelect: (item: TItem) => void
  placeholder: string
  searchPlaceholder: string
  emptyText: string
  getKey: (item: TItem) => string
  getSearchText: (item: TItem) => string
  renderItem: (item: TItem) => ReactNode
}

export function SearchableSelect<TItem>({
  items,
  selectedKey,
  onSelect,
  placeholder,
  searchPlaceholder,
  emptyText,
  getKey,
  getSearchText,
  renderItem,
}: SearchableSelectProps<TItem>) {
  const [open, setOpen] = useState(false)

  const selectedItem = items.find((item) => getKey(item) === selectedKey)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto min-h-10 w-full justify-between px-3 py-2.5 text-left"
        >
          <span className="min-w-0 flex-1">
            {selectedItem ? (
              renderItem(selectedItem)
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronDown className="text-muted-foreground ml-3 size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => {
                const key = getKey(item)

                return (
                  <CommandItem
                    key={key}
                    value={`${key} ${getSearchText(item)}`}
                    onSelect={() => {
                      onSelect(item)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "size-4",
                        key === selectedKey ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="min-w-0 flex-1">{renderItem(item)}</div>
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
