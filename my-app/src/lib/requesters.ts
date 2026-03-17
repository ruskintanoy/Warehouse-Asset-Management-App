import { GetTechListService } from "@/generated"
import type { GetTechListResponse } from "@/generated/models/GetTechListModel"
import type { Requester } from "@/lib/inventory"
import { createDataLoadError, type DataLoadError } from "@/lib/load-errors"

export type RequesterLoadResult = {
  requesters: Requester[]
  source: "sql" | "unavailable"
  error?: DataLoadError
}

type SqlResultRow = Record<string, unknown>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getRecordValue(record: SqlResultRow, fieldName: string): unknown {
  const directValue = record[fieldName]

  if (directValue !== undefined) {
    return directValue
  }

  const matchingKey = Object.keys(record).find(
    (key) => key.toLowerCase() === fieldName.toLowerCase()
  )

  return matchingKey ? record[matchingKey] : undefined
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : null
  }

  return null
}

function getResultSetRows(response: GetTechListResponse): SqlResultRow[] {
  const responseRecord = response as unknown as Record<string, unknown>
  const resultSets = response.ResultSets ?? responseRecord.resultsets

  if (Array.isArray(resultSets)) {
    return resultSets.filter(isRecord)
  }

  if (!isRecord(resultSets)) {
    return []
  }

  for (const value of Object.values(resultSets)) {
    if (Array.isArray(value)) {
      return value.filter(isRecord)
    }

    if (isRecord(value)) {
      for (const nestedValue of Object.values(value)) {
        if (Array.isArray(nestedValue)) {
          return nestedValue.filter(isRecord)
        }
      }
    }
  }

  return []
}

function toRequester(row: SqlResultRow): Requester | null {
  const stageId = toNumber(getRecordValue(row, "stageid"))
  const stage = getRecordValue(row, "stage")
  const requesterName = getRecordValue(row, "bponum")

  if (stageId === null || typeof stage !== "string" || typeof requesterName !== "string") {
    return null
  }

  const trimmedStage = stage.trim()
  const trimmedRequesterName = requesterName.trim()

  if (!trimmedStage || !trimmedRequesterName) {
    return null
  }

  return {
    stageId,
    stage: trimmedStage,
    requesterName: trimmedRequesterName,
    requesterEmail: "",
  }
}

function getRequesterLoadError(error: unknown): DataLoadError {
  const rawMessage = error instanceof Error ? error.message : ""
  const normalizedMessage = rawMessage.toLowerCase()

  if (
    normalizedMessage.includes("powermetadataclient is not available") ||
    normalizedMessage.includes("powerdataclient is not available")
  ) {
    return createDataLoadError(
      "We couldn't load the technician list. Please notify IT.",
      "Technician data is unavailable in the current Local Play session."
    )
  }

  if (normalizedMessage.includes("connection reference not found")) {
    return createDataLoadError(
      "We couldn't load the technician list. Please notify IT.",
      "Technician data source is missing from the current app session."
    )
  }

  return createDataLoadError(
    "We couldn't load the technician list. Please notify IT.",
    "Technician list load failed."
  )
}

async function fetchSqlRequesters(): Promise<Requester[]> {
  const result = await GetTechListService.GetTechList()

  if (!result.success) {
    throw result.error ?? new Error("The technician list could not be loaded.")
  }

  const requesters = getResultSetRows(result.data)
    .map(toRequester)
    .filter((requester): requester is Requester => requester !== null)
    .filter(
      (requester, index, rows) =>
        rows.findIndex((row) => row.stageId === requester.stageId) === index
    )
    .sort((left, right) => left.stage.localeCompare(right.stage))

  if (requesters.length === 0) {
    console.info("GetTechList returned no requester rows.", result.data)
  }

  return requesters
}

export async function loadRequesters(): Promise<RequesterLoadResult> {
  try {
    const requesters = await fetchSqlRequesters()

    return {
      requesters,
      source: "sql",
      error:
        requesters.length === 0
          ? createDataLoadError(
              "We couldn't load the technician list. Please notify IT.",
              "Technician stored procedure returned no rows."
            )
          : undefined,
    }
  } catch (error) {
    console.error("Failed to load technicians from SQL.", error)

    return {
      requesters: [],
      source: "unavailable",
      error: getRequesterLoadError(error),
    }
  }
}
