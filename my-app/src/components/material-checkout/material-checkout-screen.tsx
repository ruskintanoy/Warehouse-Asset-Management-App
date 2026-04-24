import { useEffect, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { RotateCcw } from "lucide-react"
import spaarLogo from "@/assets/spaar-logo.png?inline"
import { Card, CardContent } from "@/components/ui/card"
import { fetchMaterials } from "@/lib/material-checkout/materials"
import { saveMaterialRequest } from "@/lib/material-checkout/submissions"
import { fetchTechnicianEmail, fetchTechnicians } from "@/lib/material-checkout/technicians"
import { getMaterialKey, type MaterialRecord, type MaterialRequestLine, type MaterialSubmissionReceipt, type Technician } from "@/lib/material-checkout/types"
import { cn } from "@/lib/utils"
import { RequestReviewDialog } from "./request-review-dialog"
import { ReviewRequestStrip } from "./review-request-strip"
import { RequestSummary } from "./request-summary"
import { RequestBuilder } from "./request-builder"
import { SubmissionSuccessDialog } from "./submission-success-dialog"

function formatSubmissionDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
  }).format(date)
}

export function MaterialCheckoutScreen() {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280
  )
  const [isPortraitViewport, setIsPortraitViewport] = useState(() =>
    typeof window !== "undefined"
      ? window.innerHeight >= window.innerWidth
      : false
  )
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null)
  const [requestLines, setRequestLines] = useState<MaterialRequestLine[]>([])
  const [notes, setNotes] = useState("")
  const [receipt, setReceipt] = useState<MaterialSubmissionReceipt | null>(null)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [resetVersion, setResetVersion] = useState(0)
  const techniciansQuery = useQuery({
    queryKey: ["technicians"],
    queryFn: fetchTechnicians,
  })
  const materialsQuery = useQuery({
    queryKey: ["materials"],
    queryFn: fetchMaterials,
  })
  const technicianEmailQuery = useQuery({
    queryKey: ["technician-email", selectedTechnician?.bponum],
    queryFn: () => fetchTechnicianEmail(selectedTechnician?.bponum ?? ""),
    enabled: Boolean(selectedTechnician?.bponum),
  })
  const submitMutation = useMutation({
    mutationFn: saveMaterialRequest,
  })
  const usesSplitLayout = !isPortraitViewport && viewportWidth >= 1024
  const usesReviewStrip = isPortraitViewport

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const portraitQuery = window.matchMedia("(orientation: portrait)")

    function syncViewportState() {
      setViewportWidth(window.innerWidth)
      setIsPortraitViewport(window.innerHeight >= window.innerWidth || portraitQuery.matches)
    }

    syncViewportState()
    window.addEventListener("resize", syncViewportState)
    portraitQuery.addEventListener("change", syncViewportState)

    return () => {
      window.removeEventListener("resize", syncViewportState)
      portraitQuery.removeEventListener("change", syncViewportState)
    }
  }, [])

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

  async function handleSubmit() {
    if (!selectedTechnician || requestLines.length === 0) {
      return
    }

    const submissionDate = formatSubmissionDate(new Date())
    const technicianEmail = technicianEmailQuery.data ?? null
    const submissionLines = [...requestLines]
    const submissionNotes = notes
    const technician = selectedTechnician

    try {
      await submitMutation.mutateAsync({
        technician,
        technicianEmail,
        lines: submissionLines,
        notes: submissionNotes,
      })

      setReceipt({
        technician,
        technicianEmail,
        lines: submissionLines,
        notes: submissionNotes,
        submittedAt: submissionDate,
      })
      setIsReviewOpen(false)
      setIsSuccessOpen(true)
      setSelectedTechnician(null)
      setRequestLines([])
      setNotes("")
    } catch {
      // Error state is surfaced by the mutation and shown in the summary.
    }
  }

  function handleResetPage() {
    setSelectedTechnician(null)
    setRequestLines([])
    setNotes("")
    setReceipt(null)
    setIsReviewOpen(false)
    setIsSuccessOpen(false)
    setResetVersion((currentVersion) => currentVersion + 1)
  }

  return (
    <>
      <div
        className={cn(
          "min-h-full bg-[linear-gradient(180deg,_#f6f7f9_0%,_#eef1f5_100%)] px-3 py-4 pb-5 sm:px-4 sm:py-5 lg:px-6"
        )}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          <Card className="bg-card border shadow-sm">
            <CardContent className="flex items-center justify-between gap-3 px-4 py-1 sm:px-5">
              <div className="flex items-center gap-3">
                <img
                  src={spaarLogo}
                  alt="SPAAR logo"
                  className="h-20 w-auto shrink-0 object-contain sm:h-15"
                />
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                    Material Checkout
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Warehouse kiosk request form
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

          {usesReviewStrip ? (
            <ReviewRequestStrip
              selectedTechnician={selectedTechnician}
              lineCount={requestLines.length}
              hasNotes={Boolean(notes.trim())}
              disabled={!selectedTechnician && requestLines.length === 0 && !notes.trim()}
              onReview={() => setIsReviewOpen(true)}
            />
          ) : null}

          <div className={cn("grid gap-4", usesSplitLayout && "lg:grid-cols-[1.15fr_0.85fr]")}>
            <div className="grid gap-4">
              <RequestBuilder
                technicians={techniciansQuery.data ?? []}
                materials={materialsQuery.data ?? []}
                selectedTechnician={selectedTechnician}
                notes={notes}
                resetVersion={resetVersion}
                isLoadingTechnicians={techniciansQuery.isLoading}
                technicianError={techniciansQuery.isError ? "Could not load technicians right now." : null}
                isLoadingMaterials={materialsQuery.isLoading}
                materialError={materialsQuery.isError ? "Could not load materials right now." : null}
                onSelectTechnician={setSelectedTechnician}
                onNotesChange={setNotes}
                onAddMaterials={handleAddMaterials}
              />
            </div>

            {!usesReviewStrip ? (
              <RequestSummary
                selectedTechnician={selectedTechnician}
                technicianEmail={technicianEmailQuery.data ?? null}
                isLoadingTechnicianEmail={technicianEmailQuery.isLoading}
                submitError={submitMutation.isError ? "Unable to submit the material request. Please try again." : null}
                isSubmitting={submitMutation.isPending}
                lines={requestLines}
                notes={notes}
                onAdjustQuantity={handleAdjustQuantity}
                onRemoveLine={handleRemoveLine}
                onSubmit={handleSubmit}
              />
            ) : null}
          </div>
        </div>
      </div>

      <RequestReviewDialog
        open={usesReviewStrip && isReviewOpen}
        selectedTechnician={selectedTechnician}
        technicianEmail={technicianEmailQuery.data ?? null}
        isLoadingTechnicianEmail={technicianEmailQuery.isLoading}
        submitError={submitMutation.isError ? "Unable to submit the material request. Please try again." : null}
        isSubmitting={submitMutation.isPending}
        lines={requestLines}
        notes={notes}
        onAdjustQuantity={handleAdjustQuantity}
        onRemoveLine={handleRemoveLine}
        onSubmit={handleSubmit}
        onOpenChange={setIsReviewOpen}
      />

      <SubmissionSuccessDialog
        open={isSuccessOpen}
        receipt={receipt}
        onOpenChange={setIsSuccessOpen}
      />
    </>
  )
}
