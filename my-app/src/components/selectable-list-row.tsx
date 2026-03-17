import type { CSSProperties } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

type SelectableListRowProps = {
  title: string
  subtitle?: string
  isSelected: boolean
  onClick: () => void
  style?: CSSProperties
  className?: string
  titleClamp?: 1 | 2
}

export function SelectableListRow({
  title,
  subtitle,
  isSelected,
  onClick,
  style,
  className,
  titleClamp = 1,
}: SelectableListRowProps) {
  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-lg border px-3 py-3 text-left transition",
        isSelected
          ? "border-primary/60 bg-primary/10"
          : "border-border/80 bg-card hover:bg-secondary",
        className
      )}
      style={style}
      onClick={onClick}
    >
      <div className="flex h-full items-start gap-3">
        <Checkbox checked={isSelected} className="mt-0.5 pointer-events-none" />
        <div className="min-w-0">
          <p
            className="font-medium text-foreground"
            style={
              titleClamp === 2
                ? {
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }
                : undefined
            }
          >
            {title}
          </p>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
    </button>
  )
}
