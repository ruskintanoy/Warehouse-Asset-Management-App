import { CheckCircle2, Mail, Truck, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog,DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { getMaterialKey, type MaterialSubmissionReceipt } from "@/lib/material-checkout/types"

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
      <DialogContent className="max-h-[85vh] overflow-y-auto gap-3 sm:max-w-xl">
        <DialogHeader className="gap-2 text-left">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-inner shadow-emerald-500/15 animate-in fade-in zoom-in-75 duration-300">
            <CheckCircle2 className="size-8 animate-in zoom-in-50 duration-500" />
          </div>
          <div className="space-y-1">
            <DialogTitle>Material request submitted</DialogTitle>
            <DialogDescription>
              The request has been submitted and is pending for approval.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 border-b border-slate-200 pb-3 sm:grid-cols-[minmax(0,1fr)_132px]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Technician
              </p>
              <div className="mt-2 flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-white text-slate-600 shadow-sm">
                  <UserRound className="size-4.5" />
                </div>
                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,0.78fr)_minmax(0,1.12fr)] sm:items-start">
                  <div className="min-w-0 pt-0.5">
                    <p className="truncate text-sm font-semibold leading-none text-slate-950">
                      {receipt.technician.bponum}
                    </p>
                    <div className="mt-1 inline-flex max-w-full items-center gap-1.5 text-xs text-slate-500">
                      <Truck className="size-3.5 shrink-0" />
                      <span className="truncate">{receipt.technician.stage}</span>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center gap-3 pt-0.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-white text-slate-600 shadow-sm">
                      <Mail className="size-4.5" />
                    </div>
                    <div className="min-w-0 self-center">
                      <p className="truncate text-sm font-semibold leading-none text-slate-950">
                        {receipt.technicianEmail || "Email not found"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-0.5 sm:justify-self-end sm:pr-0.5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Submitted
              </p>
              <p className="mt-2 text-sm font-semibold leading-none text-slate-950">{receipt.submittedAt}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Materials
            </p>
            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
              {receipt.lines.map((line) => (
                <div
                  key={getMaterialKey(line)}
                  className="flex items-start justify-between gap-3 rounded-lg border border-white bg-white px-3 py-2 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-950">{line.name}</p>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {line.unit || "Unit not provided"}
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
            <p className="mt-1.5 text-sm font-semibold text-slate-700">
              {receipt.notes.trim() ? receipt.notes : "No notes were included with this request."}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              For corrections or additional details, please contact Pawel Jablonowski at pawel@spaar.ca.
            </p>
          </div>
        </div>

        <DialogFooter className="pt-1">
          <Button
            type="button"
            className="h-10 sm:min-w-44"
            onClick={() => onOpenChange(false)}
          >
            Start New Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
