import { ClipboardList } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LoadingIndicator } from "@/components/ui/loading-indicator"
import type { MaterialRequestLine, Technician } from "@/lib/material-checkout/types"
import { RequestSummaryDetails } from "./request-summary-details"

type RequestReviewDialogProps = {
  open: boolean
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
  onOpenChange: (open: boolean) => void
}

export function RequestReviewDialog({
  open,
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
  onOpenChange,
}: RequestReviewDialogProps) {
  const canSubmit = Boolean(selectedTechnician) && lines.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="gap-2 text-left">
          <div className="flex items-center gap-2">
            <div className="bg-accent text-accent-foreground flex size-8 items-center justify-center rounded-lg">
              <ClipboardList className="size-4.5" />
            </div>
            <div>
              <DialogTitle>Review Request</DialogTitle>
            </div>
          </div>
          <DialogDescription>
            Confirm the technician, materials, and notes before submitting.
          </DialogDescription>
        </DialogHeader>

        <RequestSummaryDetails
          selectedTechnician={selectedTechnician}
          technicianEmail={technicianEmail}
          isLoadingTechnicianEmail={isLoadingTechnicianEmail}
          lines={lines}
          notes={notes}
          onAdjustQuantity={onAdjustQuantity}
          onRemoveLine={onRemoveLine}
        />

        <CardFooter className="block px-0 pb-0">
          {submitError ? (
            <p className="mb-3 text-sm text-rose-600">{submitError}</p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => onOpenChange(false)}
            >
              Back to Edit
            </Button>
            <Button
              className="h-10 sm:min-w-48"
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
          </div>
        </CardFooter>
      </DialogContent>
    </Dialog>
  )
}
