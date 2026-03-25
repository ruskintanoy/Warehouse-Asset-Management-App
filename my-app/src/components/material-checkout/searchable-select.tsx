import { type ReactNode, useEffect, useRef, useState } from "react"
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
import { cn } from "@/lib/utils"

type SearchableSelectProps<TItem> = {
  items: TItem[]
  selectedKey?: string
  onSelect: (item: TItem) => void
  disabled?: boolean
  placeholder: ReactNode
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
  disabled = false,
  placeholder,
  searchPlaceholder,
  emptyText,
  getKey,
  getSearchText,
  renderItem,
}: SearchableSelectProps<TItem>) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)

  const selectedItem = items.find((item) => getKey(item) === selectedKey)

  useEffect(() => {
    if (!open || !panelRef.current) {
      return
    }

    panelRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [open])

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        className="h-auto min-h-10 w-full justify-between px-3 py-2.5 text-left"
        onClick={() => {
          if (disabled) {
            return
          }

          setOpen((currentOpen) => !currentOpen)
        }}
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

      {open && (
        <div ref={panelRef} className="rounded-md border bg-popover shadow-sm">
        <Command>
          <CommandInput autoFocus placeholder={searchPlaceholder} />
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
        </div>
      )}
    </div>
  )
}
