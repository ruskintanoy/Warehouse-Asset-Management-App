import {
  Mail,
  Minus,
  Plus,
  RotateCcw,
  Send,
  Truck,
  Trash2,
  UserRound,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { InventoryRequestLine } from "@/lib/inventory"

type RequestSummaryCardProps = {
  requesterName: string
  stage: string
  requesterEmail: string
  cart: InventoryRequestLine[]
  totalQuantity: number
  canSubmit: boolean
  onSubmit: () => void
  onStartOver: () => void
  onChangeQty: (materialId: number, nextQty: number) => void
  onRemoveLine: (materialId: number) => void
}

export function RequestSummaryCard({
  requesterName,
  stage,
  requesterEmail,
  cart,
  totalQuantity,
  canSubmit,
  onSubmit,
  onStartOver,
  onChangeQty,
  onRemoveLine,
}: RequestSummaryCardProps) {
  return (
    <Card className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-hidden">
      <CardHeader className="space-y-2.5 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Request Summary</CardTitle>
            <CardDescription>Review before sending.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">{cart.length} lines</Badge>
            <Badge variant="outline">{totalQuantity} qty</Badge>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-secondary/60 px-3 py-2 text-sm">
          <div className="flex items-center gap-2">
            <UserRound className="size-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{requesterName}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Truck className="size-4 text-muted-foreground" />
            <span className="text-foreground">{stage}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 min-w-0">
            <Mail className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-foreground">{requesterEmail}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 lg:min-h-0">
        {cart.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
            No materials added yet.
          </div>
        ) : (
          <div className="min-h-0 overflow-hidden rounded-lg border border-border bg-card">
            <div className="max-h-[26rem] overflow-y-auto">
              {cart.map((line) => (
                <div
                  key={line.materialId}
                  className="border-b border-border px-3 py-2.5 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-5 text-foreground">
                        {line.materialName}
                      </p>
                      <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
                        {line.productCode}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 px-2 py-0.5 text-[11px]">
                      Qty {line.qty}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Decrease quantity for ${line.materialName}`}
                        onClick={() => onChangeQty(line.materialId, line.qty - 1)}
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Increase quantity for ${line.materialName}`}
                        onClick={() => onChangeQty(line.materialId, line.qty + 1)}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => onRemoveLine(line.materialId)}
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-1">
          <Button type="button" disabled={!canSubmit} onClick={onSubmit}>
            <Send className="size-4" />
            Submit Request
          </Button>
          <Button type="button" variant="outline" onClick={onStartOver}>
            <RotateCcw className="size-4" />
            Start Over
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
