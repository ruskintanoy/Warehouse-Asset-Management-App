import { Box, Mail, Minus, Plus, Trash2, Truck, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LoadingIndicator } from "@/components/ui/loading-indicator"
import { getMaterialKey, type MaterialRequestLine, type Technician } from "@/lib/material-checkout/types"

type RequestSummaryDetailsProps = {
  selectedTechnician: Technician | null
  technicianEmail: string | null
  isLoadingTechnicianEmail?: boolean
  lines: MaterialRequestLine[]
  notes: string
  onAdjustQuantity: (materialKey: string, nextQuantity: number) => void
  onRemoveLine: (materialKey: string) => void
}

export function RequestSummaryDetails({
  selectedTechnician,
  technicianEmail,
  isLoadingTechnicianEmail = false,
  lines,
  notes,
  onAdjustQuantity,
  onRemoveLine,
}: RequestSummaryDetailsProps) {
  return (
    <div className="space-y-2.5">
      <div className="bg-muted/60 rounded-lg border p-2.5">
        <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.24em]">
          Technician
        </p>
        {selectedTechnician ? (
          <div className="mt-2 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-white text-slate-600 shadow-sm">
                <UserRound className="size-4.5" />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="truncate text-base font-semibold text-slate-950">
                  {selectedTechnician.bponum}
                </p>
                <div className="text-muted-foreground mt-0.5 inline-flex max-w-full items-center gap-1.5 text-xs">
                  <Truck className="size-3.5 shrink-0" />
                  <span className="truncate">{selectedTechnician.stage}</span>
                </div>
              </div>
            </div>

            <div className="pt-0.5 sm:justify-self-end sm:pr-0.5">
              <div className="inline-flex max-w-full items-center gap-2 text-base font-semibold text-slate-950">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-white text-slate-600 shadow-sm">
                  <Mail className="size-4.5" />
                </div>
                {isLoadingTechnicianEmail ? (
                  <LoadingIndicator label="Loading email" className="text-base font-semibold text-slate-950" />
                ) : (
                  <span className="truncate">{technicianEmail || "Email not found"}</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-1.5 text-sm text-muted-foreground">
            Technician required.
          </p>
        )}
      </div>

      <div className="space-y-2">
        {lines.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 px-3 py-6 text-center text-sm">
            <Box className="mb-2 size-6" />
            <p>No materials added yet.</p>
          </div>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {lines.map((line) => (
              <div
                key={getMaterialKey(line)}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border bg-muted/30 px-2.5 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[rgb(74,50,31)]">{line.name}</p>
                  <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                    <span>{line.unit || "Unit not provided"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="h-7 w-7 bg-white"
                    onClick={() =>
                      onAdjustQuantity(getMaterialKey(line), Math.max(1, line.quantity - 1))
                    }
                    aria-label={`Decrease ${line.name} quantity`}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-6 text-center text-sm font-semibold">{line.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="h-7 w-7 bg-white"
                    onClick={() => onAdjustQuantity(getMaterialKey(line), line.quantity + 1)}
                    aria-label={`Increase ${line.name} quantity`}
                  >
                    <Plus className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7"
                    onClick={() => onRemoveLine(getMaterialKey(line))}
                    aria-label={`Remove ${line.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-muted/60 rounded-lg border p-2.5">
        <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.24em]">
          Notes
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {notes.trim() ? notes : "N/A"}
        </p>
      </div>
    </div>
  )
}
