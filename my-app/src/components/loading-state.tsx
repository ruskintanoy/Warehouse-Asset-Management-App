import { LoaderCircle } from "lucide-react"

type LoadingStateProps = {
  title: string
  subtitle?: string
}

export function LoadingState({ title, subtitle }: LoadingStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background/80 p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
          <LoaderCircle className="size-5 animate-spin" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground">{title}</p>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
    </div>
  )
}
