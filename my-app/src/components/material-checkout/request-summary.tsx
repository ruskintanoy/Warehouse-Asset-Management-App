import { useEffect, useState } from "react"
import { ChevronDown, ClipboardList } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingIndicator } from "@/components/ui/loading-indicator"
import { type MaterialRequestLine, type Technician } from "@/lib/material-checkout/types"
import { cn } from "@/lib/utils"
import { RequestSummaryDetails } from "./request-summary-details"

type RequestSummaryProps = {
  selectedTechnician: Technician | null
  technicianEmail: string | null
  isLoadingTechnicianEmail?: boolean
  submitError?: string | null
  isSubmitting?: boolean
  lines: MaterialRequestLine[]
  notes: string
  collapsible?: boolean
  defaultExpanded?: boolean
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
  collapsible = false,
  defaultExpanded = true,
  onAdjustQuantity,
  onRemoveLine,
  onSubmit,
}: RequestSummaryProps) {
  const canSubmit = Boolean(selectedTechnician) && lines.length > 0
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  useEffect(() => {
    setIsExpanded(defaultExpanded)
  }, [defaultExpanded, collapsible])

  const itemCountLabel = `${lines.length} item${lines.length === 1 ? "" : "s"}`
  const reviewButtonLabel = isExpanded ? "Hide review" : "Review request"

  return (
    <Card className="bg-card border shadow-sm">
      <CardHeader className="gap-2 px-4 py-3 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-accent text-accent-foreground flex size-8 items-center justify-center rounded-lg">
              <ClipboardList className="size-4.5" />
            </div>
            <div>
              <CardTitle className="text-lg">Request Summary</CardTitle>
            </div>
          </div>
          {collapsible ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0"
              onClick={() => setIsExpanded((currentValue) => !currentValue)}
              aria-expanded={isExpanded}
            >
              {reviewButtonLabel}
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </Button>
          ) : null}
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          {collapsible
            ? `${itemCountLabel} in this request. Expand to review before submitting.`
            : "Review before submitting."}
        </CardDescription>
      </CardHeader>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
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
        </div>
      </div>
    </Card>
  )
}
