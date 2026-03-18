import { useDeferredValue, useEffect, useRef, useState } from "react"
import { DataLoadAlert } from "@/components/data-load-alert"
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
  const selectionListViewportHeight = 288
  const selectionListRowHeight = 88
  const selectionListItemHeight = 80
  const selectionListOverscan = 6
  const requesterEmailLookupBatchSize = 5
  const companyLogoUrl = "https://onetrac.prophitmgmt.com:8443/pml/resources/spaar_small.png"
  const [selectedRequesterId, setSelectedRequesterId] = useState("")
  const [requesterSearch, setRequesterSearch] = useState("")
  const [requesters, setRequesters] = useState<Requester[]>([])
  const [isLoadingRequesters, setIsLoadingRequesters] = useState(true)
  const [requestersError, setRequestersError] = useState<DataLoadError | null>(null)
  const [requesterEmailLookupByName, setRequesterEmailLookupByName] = useState<
    Record<string, RequesterEmailLookupState>
  >({})
  const [requesterScrollTop, setRequesterScrollTop] = useState(0)
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
  const requesterListRef = useRef<HTMLDivElement | null>(null)
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
  const deferredRequesterSearch = useDeferredValue(requesterSearch)
  const deferredMaterialSearch = useDeferredValue(materialSearch)
  const normalizedRequesterSearch = deferredRequesterSearch.trim().toLowerCase()
  const filteredRequesters = requesters.filter((requester) => {
    const query = normalizedRequesterSearch

    if (!query) {
      return true
    }

    return (
      requester.stage.toLowerCase().includes(query) ||
      requester.requesterName.toLowerCase().includes(query)
    )
  })
  const requesterVirtualStartIndex = Math.max(
    0,
    Math.floor(requesterScrollTop / selectionListRowHeight) - selectionListOverscan
  )
  const requesterVirtualVisibleCount =
    Math.ceil(selectionListViewportHeight / selectionListRowHeight) + selectionListOverscan * 2
  const requesterVirtualEndIndex = Math.min(
    filteredRequesters.length,
    requesterVirtualStartIndex + requesterVirtualVisibleCount
  )
  const visibleRequesters = filteredRequesters.slice(
    requesterVirtualStartIndex,
    requesterVirtualEndIndex
  )
  const requesterVirtualHeight = filteredRequesters.length * selectionListRowHeight
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
                message: "We couldn't confirm the technician email. Please notify IT.",
                supportHint: `Office 365 email lookup failed for ${requesterName}.`,
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
    setRequesterScrollTop(0)

    if (requesterListRef.current) {
      requesterListRef.current.scrollTop = 0
    }
  }, [normalizedRequesterSearch, requesterDirectorySignature])

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

  function getRequesterSubtitle(requester: Requester) {
    if (requester.requesterEmail) {
      return requester.requesterEmail
    }

    const lookupState = requesterEmailLookupByName[requester.requesterName]

    if (lookupState?.status === "loading") {
      return "Looking up email..."
    }

    if (lookupState?.status === "error") {
      return "Email unavailable. Notify IT."
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
    setRequesterSearch("")
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
          : "We couldn't confirm the technician email. Please notify IT."
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
    toast.success("Request prepared for Power Automate.")
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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Requester</CardTitle>
            <CardDescription>Search and select the technician and unit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="requester-search">
                Search Technician / Unit
              </label>
              <Input
                id="requester-search"
                placeholder="Type a technician name or unit"
                value={requesterSearch}
                onChange={(event) => setRequesterSearch(event.target.value)}
                disabled={isLoadingRequesters || Boolean(requestersError)}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-foreground">Technicians</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearRequesterSelection}
                disabled={Boolean(requestersError) || !selectedRequesterId}
              >
                Clear
              </Button>
            </div>

            <div
              ref={requesterListRef}
              className="max-h-72 overflow-y-auto rounded-lg border border-border bg-background p-2"
              onScroll={(event) => setRequesterScrollTop(event.currentTarget.scrollTop)}
            >
              {isLoadingRequesters ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Loading technicians from SQL...
                </div>
              ) : requestersError ? (
                <DataLoadAlert error={requestersError} />
              ) : filteredRequesters.length > 0 ? (
                <div className="relative" style={{ height: requesterVirtualHeight }}>
                  {visibleRequesters.map((requester, index) => {
                    const requesterId = requester.stageId.toString()
                    const isSelected = requesterId === selectedRequesterId
                    const absoluteIndex = requesterVirtualStartIndex + index

                    return (
                      <SelectableListRow
                        key={requester.stageId}
                        title={`${requester.stage} - ${requester.requesterName}`}
                        subtitle={getRequesterSubtitle(requester)}
                        isSelected={isSelected}
                        className="absolute left-0 right-0"
                        style={{
                          top: absoluteIndex * selectionListRowHeight,
                          height: selectionListItemHeight,
                        }}
                        onClick={() => toggleRequesterSelection(requesterId)}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  No technicians matched your search.
                </div>
              )}
            </div>

            {selectedRequester && (
              <div className="space-y-3 rounded-lg border border-border bg-secondary p-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Stage</p>
                  <p className="font-medium text-foreground">{selectedRequester.stage}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Requester Name</p>
                  <p className="font-medium text-foreground">{selectedRequester.requesterName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Requester Email</p>
                  <p className="font-medium text-foreground">
                    {selectedRequester.requesterEmail ||
                      (isResolvingSelectedRequesterEmail
                        ? "Looking up email..."
                        : selectedRequesterEmailLookup?.status === "error"
                          ? selectedRequesterEmailLookup.error?.message
                          : "Looking up email...")}
                  </p>
                  {selectedRequesterEmailLookup?.status === "error" &&
                    selectedRequesterEmailLookup.error?.supportHint && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        IT hint: {selectedRequesterEmailLookup.error.supportHint}
                      </p>
                    )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Materials</CardTitle>
            <CardDescription>
              Search and select one or more materials with the same quantity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {materialsError && (
              <DataLoadAlert error={materialsError} />
            )}

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
              <p className="text-xs text-muted-foreground">
                Scroll to browse or search by material name or product code.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-foreground">Materials</label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAllMaterials}
                  disabled={isLoadingMaterials || Boolean(materialsError) || matchingMaterials.length === 0}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSelectedMaterials}
                  disabled={Boolean(materialsError) || selectedMaterialIds.length === 0}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div
              ref={materialListRef}
              className="max-h-72 overflow-y-auto rounded-lg border border-border bg-background p-2"
              onScroll={(event) => setMaterialScrollTop(event.currentTarget.scrollTop)}
            >
              {isLoadingMaterials ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Loading materials from SQL...
                </div>
              ) : materialsError ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Material list unavailable.
                </div>
              ) : matchingMaterials.length > 0 ? (
                <div
                  className="relative"
                  style={{ height: virtualHeight }}
                >
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

            {selectedMaterials.length > 0 && (
              <div className="rounded-lg border border-border bg-secondary p-4 text-sm">
                <p className="font-medium text-foreground">
                  {selectedMaterials.length} material{selectedMaterials.length === 1 ? "" : "s"} selected
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedMaterials.map((material) => (
                    <Badge key={material.materialId} variant="outline">
                      {material.productCode}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="material-qty">
                Quantity for all selected materials
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const currentQty = quantityToAdd ?? 0
                    setQuantityInput(currentQty <= 1 ? "" : String(currentQty - 1))
                  }}
                >
                  -
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
                  onClick={() => {
                    const currentQty = quantityToAdd ?? 0
                    setQuantityInput(String(currentQty + 1))
                  }}
                >
                  +
                </Button>
              </div>
            </div>

            <Button
              type="button"
              className="w-full"
              onClick={addSelectedMaterials}
              disabled={isLoadingMaterials || Boolean(materialsError) || selectedMaterials.length === 0}
            >
              Add Selected Materials
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Current Request</CardTitle>
          <CardDescription>Review the materials before submitting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Requester:</span>{" "}
              {selectedRequester?.requesterName ?? "Not selected"}
            </div>
            <div>
              <span className="font-medium text-foreground">Stage:</span>{" "}
              {selectedRequester?.stage ?? "Not selected"}
            </div>
            <div>
              <span className="font-medium text-foreground">Total Quantity:</span> {totalQuantity}
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
              No materials added yet.
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((line) => (
                <div
                  key={line.materialId}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">{line.materialName}</p>
                    <p className="text-sm text-muted-foreground">{line.productCode}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => changeCartQty(line.materialId, line.qty - 1)}
                    >
                      -
                    </Button>
                    <Badge variant="outline" className="min-w-14 justify-center">
                      Qty {line.qty}
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => changeCartQty(line.materialId, line.qty + 1)}
                    >
                      +
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeCartLine(line.materialId)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              className="sm:flex-1"
              disabled={
                !selectedRequester ||
                !selectedRequester.requesterEmail ||
                isResolvingSelectedRequesterEmail ||
                cart.length === 0
              }
              onClick={submitRequest}
            >
              Submit Request
            </Button>
            <Button type="button" variant="outline" className="sm:flex-1" onClick={resetFormState}>
              Start Over
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
