import { useEffect, useMemo, useState } from "react"
import { Box, FileText, Minus, PackageCheck, PackageSearch, Plus, RotateCcw, Search, UserRound, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { SearchableSelect } from "./searchable-select"
import type { MaterialRecord, MaterialRequestLine, Technician } from "../types"

type RequestBuilderProps = {
  technicians: Technician[]
  materials: MaterialRecord[]
  selectedTechnician: Technician | null
  notes: string
  resetVersion: number
  onSelectTechnician: (technician: Technician) => void
  onNotesChange: (notes: string) => void
  onAddMaterials: (materials: MaterialRequestLine[]) => void
}

export function RequestBuilder({
  technicians,
  materials,
  selectedTechnician,
  notes,
  resetVersion,
  onSelectTechnician,
  onNotesChange,
  onAddMaterials,
}: RequestBuilderProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [draftMaterials, setDraftMaterials] = useState<MaterialRequestLine[]>([])

  const filteredMaterials = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return materials
    }

    return materials.filter((material) =>
      `${material.name} ${material.productCode} ${material.unit}`
        .toLowerCase()
        .includes(normalizedSearch)
    )
  }, [materials, searchTerm])

  useEffect(() => {
    setSearchTerm("")
    setDraftMaterials([])
  }, [resetVersion])

  function handleToggleMaterial(material: MaterialRecord) {
    setDraftMaterials((currentDrafts) => {
      const exists = currentDrafts.some((draft) => draft.id === material.id)

      if (exists) {
        return currentDrafts.filter((draft) => draft.id !== material.id)
      }

      return [...currentDrafts, { ...material, quantity: 1 }]
    })
  }

  function handleAdjustDraftQuantity(materialId: number, nextQuantity: number) {
    setDraftMaterials((currentDrafts) =>
      currentDrafts.map((draft) =>
        draft.id === materialId
          ? { ...draft, quantity: Math.max(1, nextQuantity) }
          : draft
      )
    )
  }

  function handleDraftQuantityInput(materialId: number, value: string) {
    const numericValue = Number(value)

    setDraftMaterials((currentDrafts) =>
      currentDrafts.map((draft) =>
        draft.id === materialId
          ? {
              ...draft,
              quantity: Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 1,
            }
          : draft
      )
    )
  }

  function handleAddSelectedMaterials() {
    if (draftMaterials.length === 0) {
      return
    }

    onAddMaterials(draftMaterials)
    setDraftMaterials([])
    setSearchTerm("")
  }

  return (
    <Card className="bg-card border shadow-sm">
      <CardHeader className="gap-1 px-4 py-4 sm:px-5">
        <CardTitle className="text-xl">Request Details</CardTitle>
        <CardDescription>
          Choose the technician, select one or more materials, then add optional notes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-4 pb-4 sm:px-5">
        <div className="space-y-2">
          <Label htmlFor="technician-picker" className="gap-1.5">
            <UserRound className="text-accent-foreground size-4" />
            Technician
          </Label>
          <div id="technician-picker">
            <SearchableSelect
              items={technicians}
              selectedKey={selectedTechnician ? String(selectedTechnician.stageid) : undefined}
              onSelect={onSelectTechnician}
              placeholder="Search by name or unit"
              searchPlaceholder="Type a technician name or unit..."
              emptyText="No technicians match that search."
              getKey={(technician) => String(technician.stageid)}
              getSearchText={(technician) =>
                `${technician.bponum} ${technician.stage}`.toLowerCase()
              }
              renderItem={(technician) => (
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{technician.bponum}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {technician.stage}
                  </span>
                </div>
              )}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="material-search" className="gap-1.5">
                <PackageSearch className="text-accent-foreground size-4" />
                Materials
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8"
                onClick={() => {
                  setSearchTerm("")
                  setDraftMaterials([])
                }}
                disabled={searchTerm === "" && draftMaterials.length === 0}
                aria-label="Reset material selection"
              >
                <RotateCcw className="size-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="material-search"
                placeholder="Search material name, product code, or unit"
                className="h-10 pl-9"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="grid max-h-64 gap-2 overflow-y-auto rounded-xl border bg-muted/60 p-2">
            {filteredMaterials.map((material) => {
              const isSelected = draftMaterials.some((draft) => draft.id === material.id)

              return (
                <button
                  key={material.id}
                  type="button"
                  className={`rounded-lg border px-3 py-2 text-left transition ${
                    isSelected
                      ? "border-accent-foreground/20 bg-accent shadow-sm"
                      : "bg-white hover:border-accent-foreground/20"
                  }`}
                  onClick={() => handleToggleMaterial(material)}
                >
                  <div className="min-w-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-950">{material.name}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {material.productCode} • {material.unit}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
            {filteredMaterials.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-6 text-center text-sm text-slate-500">
                No materials match that search.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label className="gap-1.5">
                <PackageCheck className="text-accent-foreground size-4" />
                Selected Materials
              </Label>
              <span className="text-muted-foreground text-xs">
                {draftMaterials.length} selected
              </span>
            </div>

            {draftMaterials.length === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 px-3 py-6 text-center text-sm">
                <Box className="mb-2 size-6" />
                <p>No materials selected yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {draftMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border bg-white px-2.5 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-950">
                        {material.name}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {material.productCode} • {material.unit}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="h-8 w-8"
                        onClick={() =>
                          handleAdjustDraftQuantity(material.id, material.quantity - 1)
                        }
                        aria-label={`Decrease ${material.name} quantity`}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        className="hide-number-spin h-8 w-14 px-2 text-center text-sm"
                        value={material.quantity}
                        onChange={(event) =>
                          handleDraftQuantityInput(material.id, event.target.value)
                        }
                        aria-label={`${material.name} quantity`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="h-8 w-8"
                        onClick={() =>
                          handleAdjustDraftQuantity(material.id, material.quantity + 1)
                        }
                        aria-label={`Increase ${material.name} quantity`}
                      >
                        <Plus className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8"
                        onClick={() => handleToggleMaterial(material)}
                        aria-label={`Remove ${material.name}`}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              className="h-10 w-full"
              disabled={draftMaterials.length === 0}
              onClick={handleAddSelectedMaterials}
            >
              Add Selected Materials
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="request-notes" className="gap-1.5">
            <FileText className="text-accent-foreground size-4" />
            Notes
          </Label>
          <Textarea
            id="request-notes"
            placeholder="Optional notes for the warehouse team"
            className="min-h-24 resize-none"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
