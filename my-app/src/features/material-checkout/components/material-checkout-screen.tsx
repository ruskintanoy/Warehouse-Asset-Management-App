import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { RotateCcw, Warehouse } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

import { fetchTechnicianEmail, fetchTechnicians } from "../data/technicians"
import { mockMaterials } from "../mock-data"
import { getMaterialKey, type MaterialRecord, type MaterialRequestLine, type MaterialSubmissionReceipt, type Technician } from "../types"
import { RequestSummary } from "./request-summary"
import { RequestBuilder } from "./request-builder"
import { SubmissionSuccessDialog } from "./submission-success-dialog"

function formatSubmissionTime(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function MaterialCheckoutScreen() {
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null)
  const [requestLines, setRequestLines] = useState<MaterialRequestLine[]>([])
  const [notes, setNotes] = useState("")
  const [receipt, setReceipt] = useState<MaterialSubmissionReceipt | null>(null)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [resetVersion, setResetVersion] = useState(0)
  const techniciansQuery = useQuery({
    queryKey: ["technicians"],
    queryFn: fetchTechnicians,
  })
  const technicianEmailQuery = useQuery({
    queryKey: ["technician-email", selectedTechnician?.bponum],
    queryFn: () => fetchTechnicianEmail(selectedTechnician?.bponum ?? ""),
    enabled: Boolean(selectedTechnician?.bponum),
  })

  function handleAddMaterial(material: MaterialRecord, quantity: number) {
    setRequestLines((currentLines) => {
      const existingLine = currentLines.find(
        (line) => getMaterialKey(line) === getMaterialKey(material)
      )

      if (!existingLine) {
        return [...currentLines, { ...material, quantity }]
      }

      return currentLines.map((line) =>
        getMaterialKey(line) === getMaterialKey(material)
          ? { ...line, quantity: line.quantity + quantity }
          : line
      )
    })
  }

  function handleAddMaterials(materials: MaterialRequestLine[]) {
    materials.forEach((material) => {
      handleAddMaterial(material, material.quantity)
    })
  }

  function handleAdjustQuantity(materialKey: string, nextQuantity: number) {
    setRequestLines((currentLines) =>
      currentLines.map((line) =>
        getMaterialKey(line) === materialKey ? { ...line, quantity: nextQuantity } : line
      )
    )
  }

  function handleRemoveLine(materialKey: string) {
    setRequestLines((currentLines) =>
      currentLines.filter((line) => getMaterialKey(line) !== materialKey)
    )
  }

  function handleSubmit() {
    if (!selectedTechnician || requestLines.length === 0) {
      return
    }

    setReceipt({
      technician: selectedTechnician,
      technicianEmail: technicianEmailQuery.data ?? null,
      lines: requestLines,
      notes,
      submittedAt: formatSubmissionTime(new Date()),
    })
    setIsSuccessOpen(true)
    setSelectedTechnician(null)
    setRequestLines([])
    setNotes("")
  }

  function handleResetPage() {
    setSelectedTechnician(null)
    setRequestLines([])
    setNotes("")
    setReceipt(null)
    setIsSuccessOpen(false)
    setResetVersion((currentVersion) => currentVersion + 1)
  }

  return (
    <>
      <div className="min-h-full bg-[linear-gradient(180deg,_#f6f7f9_0%,_#eef1f5_100%)] px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          <Card className="bg-card border shadow-sm">
            <CardContent className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="bg-accent text-accent-foreground flex size-10 items-center justify-center rounded-xl border">
                  <Warehouse className="size-5" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                    Material Checkout
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Live technician data with mock materials for active UI development
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-muted-foreground inline-flex h-9 items-center gap-2 rounded-md px-2.5 text-sm font-medium transition hover:bg-muted hover:text-foreground"
                onClick={handleResetPage}
              >
                <RotateCcw className="size-4" />
                Start Over
              </button>
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="grid gap-4">
              <RequestBuilder
                technicians={techniciansQuery.data ?? []}
                materials={mockMaterials}
                selectedTechnician={selectedTechnician}
                notes={notes}
                resetVersion={resetVersion}
                isLoadingTechnicians={techniciansQuery.isLoading}
                technicianError={techniciansQuery.isError ? "Could not load technicians right now." : null}
                onSelectTechnician={setSelectedTechnician}
                onNotesChange={setNotes}
                onAddMaterials={handleAddMaterials}
              />
            </div>

            <RequestSummary
              selectedTechnician={selectedTechnician}
              technicianEmail={technicianEmailQuery.data ?? null}
              isLoadingTechnicianEmail={technicianEmailQuery.isLoading}
              lines={requestLines}
              notes={notes}
              onAdjustQuantity={handleAdjustQuantity}
              onRemoveLine={handleRemoveLine}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>

      <SubmissionSuccessDialog
        open={isSuccessOpen}
        receipt={receipt}
        onOpenChange={setIsSuccessOpen}
      />
    </>
  )
}
