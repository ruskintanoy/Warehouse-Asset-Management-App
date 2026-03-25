import { LoaderCircle } from "lucide-react"

type LoadingIndicatorProps = {
  label?: string
  className?: string
}

export function LoadingIndicator({
  label = "Loading",
  className,
}: LoadingIndicatorProps) {
  return (
    <span className={`inline-flex items-center gap-2 text-sm text-muted-foreground ${className ?? ""}`.trim()}>
      <LoaderCircle className="size-4 animate-spin" />
      <span>{label}</span>
    </span>
  )
}
