import { CheckCircle2, Clock3 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { MaterialSubmissionReceipt } from "../types"

type SubmissionSuccessDialogProps = {
  open: boolean
  receipt: MaterialSubmissionReceipt | null
  onOpenChange: (open: boolean) => void
}

export function SubmissionSuccessDialog({
  open,
  receipt,
  onOpenChange,
}: SubmissionSuccessDialogProps) {
  if (!receipt) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="items-start gap-3 text-left">
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-inner shadow-emerald-500/15">
            <CheckCircle2 className="size-7 animate-in zoom-in-75 duration-300" />
          </div>
          <div className="space-y-1">
            <DialogTitle>Material request submitted</DialogTitle>
            <DialogDescription>
              The request was captured in mock mode and the form is ready for the next checkout.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Technician
              </p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                {receipt.technician.bponum}
              </p>
              <p className="text-sm text-slate-600">{receipt.technician.stage}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Submitted
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                <Clock3 className="size-4" />
                <span>{receipt.submittedAt}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Materials
            </p>
            <div className="mt-3 space-y-3">
              {receipt.lines.map((line) => (
                <div
                  key={line.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-white bg-white p-4 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-950">{line.name}</p>
                    <p className="text-sm text-slate-600">
                      {line.productCode} • {line.unit}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-slate-800">
                    Qty {line.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Notes
            </p>
            <p className="mt-2 text-sm text-slate-700">
              {receipt.notes.trim() ? receipt.notes : "No notes were included with this request."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
