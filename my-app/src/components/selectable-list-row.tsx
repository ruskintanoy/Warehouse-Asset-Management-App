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
  showCheckbox?: boolean
}

export function SelectableListRow({
  title,
  subtitle,
  isSelected,
  onClick,
  style,
  className,
  titleClamp = 1,
  showCheckbox = true,
}: SelectableListRowProps) {
  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-md border px-2.5 py-1.5 text-left transition",
        isSelected
          ? "border-primary/60 bg-primary/10"
          : "border-border/80 bg-card hover:bg-secondary",
        className
      )}
      style={style}
      onClick={onClick}
    >
      <div className={cn("flex h-full items-start", showCheckbox ? "gap-2" : "gap-0")}>
        {showCheckbox ? (
          <Checkbox checked={isSelected} className="mt-0.5 pointer-events-none" />
        ) : null}
        <div className="min-w-0">
          <p
            className="text-sm font-medium leading-5 text-foreground"
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
          {subtitle ? (
            <p className="mt-0.5 text-xs leading-4 text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </button>
  )
}
