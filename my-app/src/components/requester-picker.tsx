import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronUp, Eraser, Search } from "lucide-react"
import { DataLoadAlert } from "@/components/data-load-alert"
import { LoadingState } from "@/components/loading-state"
import { SelectableListRow } from "@/components/selectable-list-row"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Requester } from "@/lib/inventory"
import type { DataLoadError } from "@/lib/load-errors"
import { cn } from "@/lib/utils"

type RequesterPickerProps = {
  requesters: Requester[]
  selectedRequesterId: string
  isLoading: boolean
  error: DataLoadError | null
  onSelect: (requesterId: string) => void
  onClear: () => void
  getRequesterSubtitle: (requester: Requester) => string
}

export function RequesterPicker({
  requesters,
  selectedRequesterId,
  isLoading,
  error,
  onSelect,
  onClear,
  getRequesterSubtitle,
}: RequesterPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const selectedRequester =
    requesters.find((requester) => requester.stageId.toString() === selectedRequesterId) ?? null

  const filteredRequesters = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return requesters
    }

    return requesters.filter((requester) => {
      return (
        requester.stage.toLowerCase().includes(normalizedSearch) ||
        requester.requesterName.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [requesters, search])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    searchInputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
    }
  }, [])

  function handleSelect(requesterId: string) {
    onSelect(requesterId)
    setIsOpen(false)
    setSearch("")
  }

  function handleClear() {
    onClear()
    setSearch("")
  }

  return (
    <div ref={containerRef} className="space-y-2">
      <label className="text-sm font-medium text-foreground">Technician / Unit</label>
      <button
        type="button"
        className={cn(
          "flex min-h-9 w-full items-center justify-between rounded-lg border border-border/80 bg-background px-3 py-1.5 text-left shadow-sm transition",
          "hover:border-border focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        )}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-sm",
                selectedRequester ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              {selectedRequester
                ? `${selectedRequester.stage} - ${selectedRequester.requesterName}`
                : "Select technician or unit"}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedRequester ? getRequesterSubtitle(selectedRequester) : "Tap to search"}
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="ml-4 size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="ml-4 size-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {isOpen ? (
        <div className="rounded-xl border border-border bg-card p-2 shadow-md">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Input
                ref={searchInputRef}
                placeholder="Type a technician name or unit"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                disabled={Boolean(error)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={!selectedRequesterId}
              >
                <Eraser className="size-4" />
                Clear
              </Button>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-lg border border-border bg-background p-1.5">
              {isLoading ? (
                <LoadingState
                  title="Loading technicians"
                  subtitle="Please wait a moment."
                />
              ) : error ? (
                <DataLoadAlert error={error} />
              ) : filteredRequesters.length > 0 ? (
                <div className="space-y-1.5">
                  {filteredRequesters.map((requester) => (
                    <SelectableListRow
                      key={requester.stageId}
                      title={`${requester.stage} - ${requester.requesterName}`}
                      subtitle={getRequesterSubtitle(requester)}
                      isSelected={requester.stageId.toString() === selectedRequesterId}
                      showCheckbox={false}
                      onClick={() => handleSelect(requester.stageId.toString())}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  No technicians matched your search.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
