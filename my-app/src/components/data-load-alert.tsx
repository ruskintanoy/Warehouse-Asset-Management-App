import type { DataLoadError } from "@/lib/load-errors"

type DataLoadAlertProps = {
  error: DataLoadError
}

export function DataLoadAlert({ error }: DataLoadAlertProps) {
  return (
    <div className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3">
      <p className="text-sm font-medium text-foreground">{error.message}</p>
      <p className="mt-1 text-xs text-muted-foreground">IT: {error.supportHint}</p>
    </div>
  )
}
