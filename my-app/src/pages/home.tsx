import { useDeferredValue, useEffect, useRef, useState } from "react"
import { CheckCheck, Eraser, Minus, Plus, ShoppingCart } from "lucide-react"
import { DataLoadAlert } from "@/components/data-load-alert"
import { LoadingState } from "@/components/loading-state"
import { RequesterPicker } from "@/components/requester-picker"
import { RequestSummaryCard } from "@/components/request-summary-card"
import { SelectableListRow } from "@/components/selectable-list-row"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  type Requester,
  type Material,
  type InventoryRequestLine,
  type SubmitPayload,
} from "@/lib/inventory"
import type { DataLoadError } from "@/lib/load-errors"
import { loadMaterials } from "@/lib/materials"
import { lookupRequesterEmail } from "@/lib/requester-emails"
import { loadRequesters } from "@/lib/requesters"
import { toast } from "sonner"

type RequesterEmailLookupState = {
  status: "loading" | "resolved" | "error"
  error?: DataLoadError
}

export default function HomePage() {
  const selectionListViewportHeight = 272
  const selectionListRowHeight = 62
  const selectionListItemHeight = 56
  const selectionListOverscan = 6
  const requesterEmailLookupBatchSize = 5
  const companyLogoUrl = "https://onetrac.prophitmgmt.com:8443/pml/resources/spaar_small.png"
  const [selectedRequesterId, setSelectedRequesterId] = useState("")
  const [requesters, setRequesters] = useState<Requester[]>([])
  const [isLoadingRequesters, setIsLoadingRequesters] = useState(true)
  const [requestersError, setRequestersError] = useState<DataLoadError | null>(null)
  const [requesterEmailLookupByName, setRequesterEmailLookupByName] = useState<
    Record<string, RequesterEmailLookupState>
  >({})
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true)
  const [materialsError, setMaterialsError] = useState<DataLoadError | null>(null)
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([])
  const [materialSearch, setMaterialSearch] = useState("")
  const [materialScrollTop, setMaterialScrollTop] = useState(0)
  const [quantityInput, setQuantityInput] = useState("")
  const [cart, setCart] = useState<InventoryRequestLine[]>([])
  const [lastSubmittedSummary, setLastSubmittedSummary] = useState("")
  const requestersRef = useRef<Requester[]>([])
  const requesterEmailLookupByNameRef = useRef<Record<string, RequesterEmailLookupState>>({})
  const materialListRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let isActive = true

    async function hydrateRequesters() {
      setIsLoadingRequesters(true)

      const result = await loadRequesters()

      if (!isActive) {
        return
      }

      setRequesters(result.requesters)
      setRequestersError(result.error ?? null)
      setIsLoadingRequesters(false)
    }

    void hydrateRequesters()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    async function hydrateMaterials() {
      setIsLoadingMaterials(true)

      const result = await loadMaterials()

      if (!isActive) {
        return
      }

      setMaterials(result.materials)
      setMaterialsError(result.error ?? null)
      setIsLoadingMaterials(false)
    }

    void hydrateMaterials()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    requestersRef.current = requesters
  }, [requesters])

  useEffect(() => {
    requesterEmailLookupByNameRef.current = requesterEmailLookupByName
  }, [requesterEmailLookupByName])

  const selectedRequester =
    requesters.find((requester) => requester.stageId.toString() === selectedRequesterId) ?? null
  const selectedRequesterEmailLookup = selectedRequester
    ? requesterEmailLookupByName[selectedRequester.requesterName]
    : undefined
  const isResolvingSelectedRequesterEmail = selectedRequesterEmailLookup?.status === "loading"
  const deferredMaterialSearch = useDeferredValue(materialSearch)
  const normalizedMaterialSearch = deferredMaterialSearch.trim().toLowerCase()
  const matchingMaterials = normalizedMaterialSearch
    ? materials.filter((material) => {
        return (
          material.materialName.toLowerCase().includes(normalizedMaterialSearch) ||
          material.productCode.toLowerCase().includes(normalizedMaterialSearch)
        )
      })
    : materials
  const virtualStartIndex = Math.max(
    0,
    Math.floor(materialScrollTop / selectionListRowHeight) - selectionListOverscan
  )
  const virtualVisibleCount =
    Math.ceil(selectionListViewportHeight / selectionListRowHeight) + selectionListOverscan * 2
  const virtualEndIndex = Math.min(
    matchingMaterials.length,
    virtualStartIndex + virtualVisibleCount
  )
  const visibleMaterials = matchingMaterials.slice(virtualStartIndex, virtualEndIndex)
  const virtualHeight = matchingMaterials.length * selectionListRowHeight
  const selectedMaterials = materials.filter((material) =>
    selectedMaterialIds.includes(material.materialId.toString())
  )
  const totalQuantity = cart.reduce((sum, item) => sum + item.qty, 0)
  const parsedQuantity =
    quantityInput.trim() === "" ? null : Number.parseInt(quantityInput, 10)
  const quantityToAdd =
    parsedQuantity !== null && Number.isFinite(parsedQuantity) && parsedQuantity > 0
      ? parsedQuantity
      : null
  const requesterDirectorySignature = requesters
    .map((requester) => `${requester.stageId}:${requester.requesterName}`)
    .join("|")

  useEffect(() => {
    let isActive = true

    async function hydrateRequesterEmails() {
      const currentRequesters = requestersRef.current
      const currentLookupState = requesterEmailLookupByNameRef.current

      if (isLoadingRequesters || currentRequesters.length === 0 || requestersError) {
        return
      }

      const requesterNamesToResolve = Array.from(
        new Set(
          currentRequesters
            .filter((requester) => requester.requesterEmail === "")
            .map((requester) => requester.requesterName)
        )
      ).filter((requesterName) => !currentLookupState[requesterName])

      if (requesterNamesToResolve.length === 0) {
        return
      }

      setRequesterEmailLookupByName((current) => ({
        ...current,
        ...Object.fromEntries(
          requesterNamesToResolve.map((requesterName) => [
            requesterName,
            {
              status: "loading",
            } satisfies RequesterEmailLookupState,
          ])
        ),
      }))

      for (
        let index = 0;
        index < requesterNamesToResolve.length;
        index += requesterEmailLookupBatchSize
      ) {
        const requesterNameBatch = requesterNamesToResolve.slice(
          index,
          index + requesterEmailLookupBatchSize
        )
        const batchResults = await Promise.all(
          requesterNameBatch.map(async (requesterName) => ({
            requesterName,
            result: await lookupRequesterEmail(requesterName),
          }))
        )

        if (!isActive) {
          return
        }

        const resolvedEmails = new Map<string, string>()
        const nextLookupPatch: Record<string, RequesterEmailLookupState> = {}

        for (const { requesterName, result } of batchResults) {
          if (result.email) {
            resolvedEmails.set(requesterName, result.email)
            nextLookupPatch[requesterName] = {
              status: "resolved",
            }
            continue
          }

          nextLookupPatch[requesterName] = {
            status: "error",
            error:
              result.error ?? {
                message: "Email unavailable.",
              },
          }
        }

        if (resolvedEmails.size > 0) {
          setRequesters((current) =>
            current.map((requester) => {
              const resolvedEmail = resolvedEmails.get(requester.requesterName)

              return resolvedEmail
                ? { ...requester, requesterEmail: resolvedEmail }
                : requester
            })
          )
        }

        setRequesterEmailLookupByName((current) => ({
          ...current,
          ...nextLookupPatch,
        }))
      }
    }

    void hydrateRequesterEmails()

    return () => {
      isActive = false
    }
  }, [
    isLoadingRequesters,
    requesterDirectorySignature,
    requestersError,
    requesterEmailLookupBatchSize,
  ])

  useEffect(() => {
    setMaterialScrollTop(0)

    if (materialListRef.current) {
      materialListRef.current.scrollTop = 0
    }
  }, [normalizedMaterialSearch, materials])

  function toggleMaterialSelection(materialId: string) {
    setSelectedMaterialIds((currentIds) =>
      currentIds.includes(materialId)
        ? currentIds.filter((id) => id !== materialId)
        : [...currentIds, materialId]
    )
  }

  function toggleRequesterSelection(requesterId: string) {
    setSelectedRequesterId((currentId) => (currentId === requesterId ? "" : requesterId))
  }

  function clearRequesterSelection() {
    setSelectedRequesterId("")
  }

  function getSelectedRequesterEmailDisplay() {
    if (selectedRequester?.requesterEmail) {
      return selectedRequester.requesterEmail
    }

    if (isResolvingSelectedRequesterEmail) {
      return "Looking up email..."
    }

    if (selectedRequesterEmailLookup?.status === "error") {
      return selectedRequesterEmailLookup.error?.message ?? "Email unavailable."
    }

    return "Looking up email..."
  }

  function getRequesterSubtitle(requester: Requester) {
    if (requester.requesterEmail) {
      return requester.requesterEmail
    }

    const lookupState = requesterEmailLookupByName[requester.requesterName]

    if (lookupState?.status === "loading") {
      return "Looking up email..."
    }

    if (lookupState?.status === "error") {
      return "Email unavailable"
    }

    return "Looking up email..."
  }

  function selectAllMaterials() {
    setSelectedMaterialIds((currentIds) => {
      const nextIds = new Set(currentIds)

      for (const material of matchingMaterials) {
        nextIds.add(material.materialId.toString())
      }

      return Array.from(nextIds)
    })
  }

  function clearSelectedMaterials() {
    setSelectedMaterialIds([])
  }

  function addSelectedMaterials() {
    if (selectedMaterials.length === 0) {
      toast.error("Select at least one material before adding it to the request.")
      return
    }

    if (!quantityToAdd) {
      toast.error("Enter a quantity greater than 0 before adding materials.")
      return
    }

    setCart((currentCart) => {
      const cartById = new Map(currentCart.map((line) => [line.materialId, line]))

      for (const material of selectedMaterials) {
        const existingLine = cartById.get(material.materialId)

        if (existingLine) {
          cartById.set(material.materialId, {
            ...existingLine,
            qty: existingLine.qty + quantityToAdd,
          })
          continue
        }

        cartById.set(material.materialId, {
          materialId: material.materialId,
          materialName: material.materialName,
          productCode: material.productCode,
          qty: quantityToAdd,
        })
      }

      return Array.from(cartById.values())
    })

    setSelectedMaterialIds([])
    setMaterialSearch("")
    setQuantityInput("")
    toast.success(
      `${selectedMaterials.length} material${selectedMaterials.length === 1 ? "" : "s"} added to the request.`
    )
  }

  function changeCartQty(materialId: number, nextQty: number) {
    if (nextQty <= 0) {
      setCart((currentCart) => currentCart.filter((line) => line.materialId !== materialId))
      return
    }

    setCart((currentCart) =>
      currentCart.map((line) =>
        line.materialId === materialId ? { ...line, qty: nextQty } : line
      )
    )
  }

  function removeCartLine(materialId: number) {
    setCart((currentCart) => currentCart.filter((line) => line.materialId !== materialId))
  }

  function resetFormState() {
    setSelectedRequesterId("")
    setSelectedMaterialIds([])
    setMaterialSearch("")
    setQuantityInput("")
    setCart([])
  }

  function submitRequest() {
    if (!selectedRequester || cart.length === 0) {
      toast.error("Choose a technician and add at least one material before submitting.")
      return
    }

    if (!selectedRequester.requesterEmail) {
      toast.error(
        isResolvingSelectedRequesterEmail
          ? "Please wait while we confirm the technician email."
          : "Email unavailable."
      )
      return
    }

    const payload: SubmitPayload = {
      inventoryRequest: {
        stage: selectedRequester.stage,
        requesterName: selectedRequester.requesterName,
        requesterEmail: selectedRequester.requesterEmail,
      },
      inventoryRequestLines: cart,
    }

    console.info("Residential inventory payload", payload)
    setLastSubmittedSummary(
      `Request prepared for ${selectedRequester.requesterName} with ${cart.length} material item${cart.length === 1 ? "" : "s"}.`
    )
    resetFormState()
    toast.success("Request prepared.")
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={companyLogoUrl}
              alt="SPAAR logo"
              className="h-12 w-auto object-contain sm:h-14"
            />
            <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
              Residential Inventory Request
            </h1>
          </div>
          <p className="text-sm text-muted-foreground sm:max-w-xs sm:text-right">
              Select the technician, add materials, and submit the request.
          </p>
        </div>
      </div>

      {lastSubmittedSummary && (
        <div className="mt-4 rounded-lg border border-primary/60 bg-primary/20 px-4 py-3 text-sm text-foreground">
          {lastSubmittedSummary}
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Create Request</CardTitle>
            <CardDescription>Select a technician and add materials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">1. Select Technician</p>

              <RequesterPicker
                requesters={requesters}
                selectedRequesterId={selectedRequesterId}
                isLoading={isLoadingRequesters}
                error={requestersError}
                onSelect={toggleRequesterSelection}
                onClear={clearRequesterSelection}
                getRequesterSubtitle={getRequesterSubtitle}
              />

              {selectedRequester ? (
                <div className="rounded-lg border border-border bg-secondary/70 p-3">
                  <div className="grid gap-2.5 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Unit</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {selectedRequester.stage}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Technician
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {selectedRequester.requesterName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Email
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {getSelectedRequesterEmailDisplay()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-border" />

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">2. Add Materials</p>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="material-search">
                  Search Materials
                </label>
                <Input
                  id="material-search"
                  placeholder="Type a material name or product code"
                  value={materialSearch}
                  onChange={(event) => setMaterialSearch(event.target.value)}
                  disabled={isLoadingMaterials || Boolean(materialsError)}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-foreground">Available Materials</label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={selectAllMaterials}
                    disabled={
                      isLoadingMaterials || Boolean(materialsError) || matchingMaterials.length === 0
                    }
                  >
                    <CheckCheck className="size-4" />
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSelectedMaterials}
                    disabled={Boolean(materialsError) || selectedMaterialIds.length === 0}
                  >
                    <Eraser className="size-4" />
                    Clear
                  </Button>
                </div>
              </div>

              <div
                ref={materialListRef}
                className="max-h-72 overflow-y-auto rounded-xl border border-border bg-background p-1.5"
                onScroll={(event) => setMaterialScrollTop(event.currentTarget.scrollTop)}
              >
                {isLoadingMaterials ? (
                  <LoadingState
                    title="Loading materials"
                    subtitle="Please wait a moment."
                  />
                ) : materialsError ? (
                  <DataLoadAlert error={materialsError} />
                ) : matchingMaterials.length > 0 ? (
                  <div className="relative" style={{ height: virtualHeight }}>
                    {visibleMaterials.map((material, index) => {
                      const materialId = material.materialId.toString()
                      const isSelected = selectedMaterialIds.includes(materialId)
                      const absoluteIndex = virtualStartIndex + index

                      return (
                        <SelectableListRow
                          key={material.materialId}
                          title={material.materialName}
                          subtitle={material.productCode}
                          titleClamp={2}
                          isSelected={isSelected}
                          className="absolute left-0 right-0"
                          style={{
                            top: absoluteIndex * selectionListRowHeight,
                            height: selectionListItemHeight,
                          }}
                          onClick={() => toggleMaterialSelection(materialId)}
                        />
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    No materials matched your search.
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border bg-secondary/70 p-2.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {selectedMaterials.length} material{selectedMaterials.length === 1 ? "" : "s"} selected
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedMaterials.slice(0, 4).map((material) => (
                      <Badge key={material.materialId} variant="outline">
                        {material.productCode}
                      </Badge>
                    ))}
                    {selectedMaterials.length > 4 ? (
                      <Badge variant="outline">+{selectedMaterials.length - 4} more</Badge>
                    ) : null}
                  </div>
                </div>

                <div className="mt-2.5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="material-qty">
                      Quantity for all selected materials
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const currentQty = quantityToAdd ?? 0
                          setQuantityInput(currentQty <= 1 ? "" : String(currentQty - 1))
                        }}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <Input
                        id="material-qty"
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter quantity"
                        className="text-center"
                        value={quantityInput}
                        onChange={(event) => {
                          const nextValue = event.target.value

                          if (nextValue === "" || /^\d+$/.test(nextValue)) {
                            setQuantityInput(nextValue)
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const currentQty = quantityToAdd ?? 0
                          setQuantityInput(String(currentQty + 1))
                        }}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="sm:min-w-52"
                    onClick={addSelectedMaterials}
                    disabled={
                      isLoadingMaterials ||
                      Boolean(materialsError) ||
                      selectedMaterials.length === 0
                    }
                  >
                    <ShoppingCart className="size-4" />
                    Add Selected Materials
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <RequestSummaryCard
          requesterName={selectedRequester?.requesterName ?? "Not selected"}
          stage={selectedRequester?.stage ?? "Not selected"}
          requesterEmail={selectedRequester ? getSelectedRequesterEmailDisplay() : "Not selected"}
          cart={cart}
          totalQuantity={totalQuantity}
          canSubmit={
            Boolean(selectedRequester) &&
            Boolean(selectedRequester?.requesterEmail) &&
            !isResolvingSelectedRequesterEmail &&
            cart.length > 0
          }
          onSubmit={submitRequest}
          onStartOver={resetFormState}
          onChangeQty={changeCartQty}
          onRemoveLine={removeCartLine}
        />
      </div>
    </div>
  )
}
