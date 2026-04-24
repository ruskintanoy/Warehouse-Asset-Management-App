import { ClipboardList } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingIndicator } from "@/components/ui/loading-indicator"
import { type MaterialRequestLine, type Technician } from "@/lib/material-checkout/types"
import { RequestSummaryDetails } from "./request-summary-details"

type RequestSummaryProps = {
  selectedTechnician: Technician | null
  technicianEmail: string | null
  isLoadingTechnicianEmail?: boolean
  submitError?: string | null
  isSubmitting?: boolean
  lines: MaterialRequestLine[]
  notes: string
  onAdjustQuantity: (materialKey: string, nextQuantity: number) => void
  onRemoveLine: (materialKey: string) => void
  onSubmit: () => void
}

export function RequestSummary({
  selectedTechnician,
  technicianEmail,
  isLoadingTechnicianEmail = false,
  submitError,
  isSubmitting = false,
  lines,
  notes,
  onAdjustQuantity,
  onRemoveLine,
  onSubmit,
}: RequestSummaryProps) {
  const canSubmit = Boolean(selectedTechnician) && lines.length > 0

  return (
    <Card className="bg-card border shadow-sm">
      <CardHeader className="gap-2 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="bg-accent text-accent-foreground flex size-8 items-center justify-center rounded-lg">
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
        <RequestSummaryDetails
          selectedTechnician={selectedTechnician}
          technicianEmail={technicianEmail}
          isLoadingTechnicianEmail={isLoadingTechnicianEmail}
          lines={lines}
          notes={notes}
          onAdjustQuantity={onAdjustQuantity}
          onRemoveLine={onRemoveLine}
        />
      </CardContent>
      <CardFooter className="block px-4 pb-4 sm:px-5">
        {submitError ? (
          <p className="mb-3 text-sm text-rose-600">{submitError}</p>
        ) : null}
        <Button
          className="h-10 w-full"
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? (
            <LoadingIndicator
              label="Submitting request"
              className="text-sm font-medium text-current [&_svg]:size-4"
            />
          ) : (
            "Submit Material Request"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
