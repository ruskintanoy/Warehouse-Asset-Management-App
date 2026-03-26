import { useDeferredValue, useEffect, useRef, useState } from "react"
import { Box, Check, ChevronDown, FileText, Minus, PackageCheck, Plus, RotateCcw, UserRound, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoadingIndicator } from "@/components/ui/loading-indicator"
import { getMaterialKey, type MaterialRecord, type MaterialRequestLine, type Technician } from "@/lib/material-checkout/types"
import { cn } from "@/lib/utils"

import { SearchableSelect } from "./searchable-select"

type RequestBuilderProps = {
  technicians: Technician[]
  materials: MaterialRecord[]
  selectedTechnician: Technician | null
  notes: string
  resetVersion: number
  isLoadingTechnicians?: boolean
  technicianError?: string | null
  isLoadingMaterials?: boolean
  materialError?: string | null
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
  isLoadingTechnicians = false,
  technicianError,
  isLoadingMaterials = false,
  materialError,
  onSelectTechnician,
  onNotesChange,
  onAddMaterials,
}: RequestBuilderProps) {
  const [isMaterialPickerOpen, setIsMaterialPickerOpen] = useState(false)
  const [draftMaterials, setDraftMaterials] = useState<MaterialRequestLine[]>([])
  const [materialSearch, setMaterialSearch] = useState("")
  const materialPanelRef = useRef<HTMLDivElement | null>(null)
  const deferredMaterialSearch = useDeferredValue(materialSearch)

  const normalizedMaterialSearch = deferredMaterialSearch.trim().toLowerCase()
  const matchingMaterials = normalizedMaterialSearch
    ? materials.filter((material) =>
        `${material.name} ${material.productCode} ${material.unit}`.toLowerCase().includes(normalizedMaterialSearch)
      )
    : materials
  const visibleMaterials = matchingMaterials.slice(0, normalizedMaterialSearch ? 100 : 75)
  const hasMoreMaterialResults = matchingMaterials.length > visibleMaterials.length

  useEffect(() => {
    setIsMaterialPickerOpen(false)
    setDraftMaterials([])
    setMaterialSearch("")
  }, [resetVersion])

  useEffect(() => {
    if (!isMaterialPickerOpen || !materialPanelRef.current) {
      return
    }

    materialPanelRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [isMaterialPickerOpen])

  function handleToggleMaterial(material: MaterialRecord) {
    setDraftMaterials((currentDrafts) => {
      const materialKey = getMaterialKey(material)
      const exists = currentDrafts.some((draft) => getMaterialKey(draft) === materialKey)

      if (exists) {
        return currentDrafts.filter((draft) => getMaterialKey(draft) !== materialKey)
      }

      return [...currentDrafts, { ...material, quantity: 1 }]
    })
  }

  function handleAdjustDraftQuantity(materialKey: string, nextQuantity: number) {
    setDraftMaterials((currentDrafts) =>
      currentDrafts.map((draft) =>
        getMaterialKey(draft) === materialKey
          ? { ...draft, quantity: Math.max(1, nextQuantity) }
          : draft
      )
    )
  }

  function handleDraftQuantityInput(materialKey: string, value: string) {
    const numericValue = Number(value)

    setDraftMaterials((currentDrafts) =>
      currentDrafts.map((draft) =>
        getMaterialKey(draft) === materialKey
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
    setIsMaterialPickerOpen(false)
  }

  return (
    <Card className="bg-card border shadow-sm">
      <CardHeader className="gap-1 px-4 py-4 sm:px-5">
        <CardTitle className="text-xl">Request Details</CardTitle>
        <CardDescription>
          Select technician, add one or more materials, then add notes(if applicable).
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
              disabled={isLoadingTechnicians || Boolean(technicianError)}
              placeholder={isLoadingTechnicians ? <LoadingIndicator label="Loading technicians" /> : "Search by name or unit"}
              searchPlaceholder="Type a technician name or unit..."
              emptyText={technicianError ?? "No technicians match that search."}
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
          {technicianError ? (
            <p className="text-sm text-rose-600">{technicianError}</p>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="material-search" className="gap-1.5">
                <Box className="text-accent-foreground size-4" />
                Materials
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8"
                onClick={() => {
                  setIsMaterialPickerOpen(false)
                  setDraftMaterials([])
                  setMaterialSearch("")
                }}
                disabled={draftMaterials.length === 0}
                aria-label="Reset material selection"
              >
                <RotateCcw className="size-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <Button
                id="material-search"
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={isMaterialPickerOpen}
                disabled={isLoadingMaterials || Boolean(materialError)}
                className="h-auto min-h-10 w-full justify-between px-3 py-2.5 text-left"
                onClick={() => setIsMaterialPickerOpen((currentOpen) => !currentOpen)}
              >
                <span className="min-w-0 flex-1">
                  {draftMaterials.length > 0 ? (
                    <span className="text-sm font-medium">
                      {draftMaterials.length} material{draftMaterials.length === 1 ? "" : "s"} selected
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      {isLoadingMaterials
                        ? <LoadingIndicator label="Loading materials" className="text-sm" />
                        : materialError || "Search and select materials"}
                    </span>
                  )}
                </span>
                <ChevronDown className="text-muted-foreground ml-3 size-4 shrink-0" />
              </Button>

              {isMaterialPickerOpen && (
                <div ref={materialPanelRef} className="rounded-md border bg-popover shadow-sm">
                  <div className="border-b p-2">
                    <Input
                      autoFocus
                      value={materialSearch}
                      onChange={(event) => setMaterialSearch(event.target.value)}
                      placeholder="Search material name, product code, or unit..."
                    />
                  </div>
                  <div className="max-h-72 overflow-y-auto p-1">
                    {visibleMaterials.length === 0 ? (
                      <div className="text-muted-foreground px-3 py-5 text-center text-sm">
                        No materials match that search.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {visibleMaterials.map((material) => {
                          const isSelected = draftMaterials.some(
                            (draft) => getMaterialKey(draft) === getMaterialKey(material)
                          )

                          return (
                            <button
                              key={getMaterialKey(material)}
                              type="button"
                              onClick={() => {
                                handleToggleMaterial(material)
                                setIsMaterialPickerOpen(false)
                                setMaterialSearch("")
                              }}
                              className={cn(
                                "flex w-full items-start gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground",
                                isSelected && "bg-accent text-accent-foreground"
                              )}
                            >
                              <Check
                                className={cn(
                                  "mt-0.5 size-4 shrink-0",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{material.name}</p>
                                <p className="text-muted-foreground truncate text-xs">
                                  {material.productCode} • {material.unit}
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {hasMoreMaterialResults ? (
                      <p className="text-muted-foreground px-3 pb-2 pt-3 text-xs">
                        Showing the first {visibleMaterials.length} matches. Keep typing to narrow the list.
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
          {materialError ? (
            <p className="text-sm text-rose-600">{materialError}</p>
          ) : null}

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
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {draftMaterials.map((material) => (
                  <div
                    key={getMaterialKey(material)}
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
                          handleAdjustDraftQuantity(getMaterialKey(material), material.quantity - 1)
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
                          handleDraftQuantityInput(getMaterialKey(material), event.target.value)
                        }
                        aria-label={`${material.name} quantity`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="h-8 w-8"
                        onClick={() =>
                          handleAdjustDraftQuantity(getMaterialKey(material), material.quantity + 1)
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
            Notes (optional)
          </Label>
          <Textarea
            id="request-notes"
            placeholder="Add notes"
            className="min-h-24 resize-y"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
