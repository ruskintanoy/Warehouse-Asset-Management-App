import { Box, ClipboardList, Minus, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import type { MaterialRequestLine, Technician } from "../types"

type RequestSummaryProps = {
  selectedTechnician: Technician | null
  lines: MaterialRequestLine[]
  notes: string
  onAdjustQuantity: (materialId: number, nextQuantity: number) => void
  onRemoveLine: (materialId: number) => void
  onSubmit: () => void
}

export function RequestSummary({
  selectedTechnician,
  lines,
  notes,
  onAdjustQuantity,
  onRemoveLine,
  onSubmit,
}: RequestSummaryProps) {
  const canSubmit = Boolean(selectedTechnician) && lines.length > 0

  return (
    <Card className="bg-white shadow-md shadow-black/5">
      <CardHeader className="gap-2 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-lg">
            <ClipboardList className="size-4.5" />
          </div>
          <div>
            <CardTitle className="text-lg">Request Summary</CardTitle>
          </div>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          Review before submitting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5 px-4 pb-4 sm:px-5">
        <div className="bg-muted/60 rounded-lg border p-2.5">
          <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.24em]">
            Technician
          </p>
          {selectedTechnician ? (
            <div className="mt-1.5">
              <p className="text-sm font-semibold">{selectedTechnician.bponum}</p>
              <p className="text-sm text-muted-foreground">{selectedTechnician.stage}</p>
            </div>
          ) : (
            <p className="mt-1.5 text-sm text-muted-foreground">
              Pick a technician to unlock submission.
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
            lines.map((line) => (
              <div
                key={line.id}
                className="rounded-lg border bg-muted/30 px-2.5 py-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[rgb(74,50,31)]">{line.name}</p>
                    <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                      <span>{line.productCode}</span>
                      <span>•</span>
                      <span>{line.unit}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="h-7 w-7 bg-white"
                      onClick={() => onAdjustQuantity(line.id, Math.max(1, line.quantity - 1))}
                      aria-label={`Decrease ${line.name} quantity`}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-6 text-center text-sm font-semibold">{line.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="h-7 w-7 bg-white"
                      onClick={() => onAdjustQuantity(line.id, line.quantity + 1)}
                      aria-label={`Increase ${line.name} quantity`}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7"
                    onClick={() => onRemoveLine(line.id)}
                    aria-label={`Remove ${line.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-muted/60 rounded-lg border p-2.5">
          <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.24em]">
            Notes
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {notes.trim() ? notes : "No notes added for this request."}
          </p>
        </div>
      </CardContent>
      <CardFooter className="block px-4 pb-4 sm:px-5">
        <Button
          className="h-10 w-full"
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          Submit Material Request
        </Button>
      </CardFooter>
    </Card>
  )
}
