import { ClipboardList, FileText, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Technician } from "@/lib/material-checkout/types"

type ReviewRequestStripProps = {
  selectedTechnician: Technician | null
  lineCount: number
  hasNotes: boolean
  disabled?: boolean
  onReview: () => void
}

export function ReviewRequestStrip({
  selectedTechnician,
  lineCount,
  hasNotes,
  disabled = false,
  onReview,
}: ReviewRequestStripProps) {
  return (
    <div className="sticky top-3 z-30">
      <div className="rounded-2xl border bg-background/95 px-3 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/88">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Current Request
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <ClipboardList className="size-4 text-slate-500" />
                {lineCount} item{lineCount === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="size-4 text-slate-500" />
                <span className="max-w-32 truncate">{selectedTechnician?.bponum || "No technician"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileText className="size-4 text-slate-500" />
                {hasNotes ? "Notes added" : "No notes"}
              </span>
            </div>
          </div>

          <Button
            type="button"
            className="h-10 shrink-0 px-4"
            disabled={disabled}
            onClick={onReview}
          >
            Review Request
          </Button>
        </div>
      </div>
    </div>
  )
}
