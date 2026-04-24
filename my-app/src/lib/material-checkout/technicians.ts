import { Office365UsersService } from "@/generated"
import type { GetTechListResponse } from "@/generated/models/GetTechListModel"
import type { User } from "@/generated/models/Office365UsersModel"
import { getClient, type IOperationResult } from "@microsoft/power-apps/data"
import { dataSourcesInfo } from "../../../.power/schemas/appschemas/dataSourcesInfo"

import type { Technician } from "./types"

const technicianClient = getClient(dataSourcesInfo)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : null
  }

  return null
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function getResultSetRows(resultSets: unknown): unknown[] {
  if (Array.isArray(resultSets)) {
    return resultSets
  }

  if (!isRecord(resultSets)) {
    return []
  }

  const directArrayKeys = ["Table1", "table1", "Table", "table", "ResultSet1", "resultset", "resultsets"]

  for (const key of directArrayKeys) {
    const candidate = resultSets[key]

    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  for (const value of Object.values(resultSets)) {
    if (Array.isArray(value)) {
      return value
    }

    if (!isRecord(value)) {
      continue
    }

    for (const nestedValue of Object.values(value)) {
      if (Array.isArray(nestedValue)) {
        return nestedValue
      }
    }
  }

  return []
}

function toTechnician(row: unknown): Technician | null {
  if (!isRecord(row)) {
    return null
  }

  const stageid = toNumber(row.stageid ?? row.StageId ?? row.stageId)
  const stage = toText(row.stage ?? row.Stage)
  const bponum = toText(row.bponum ?? row.BPONum ?? row.name ?? row.Name)

  if (stageid === null || !stage || !bponum) {
    return null
  }

  return {
    stageid,
    stage,
    bponum,
  }
}

function normalizeValue(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
}

function tokenizeValue(value: string) {
  const normalizedValue = normalizeValue(value)
  return normalizedValue ? normalizedValue.split(" ") : []
}

function getCandidateNames(user: User) {
  const names = [
    user.DisplayName,
    [user.GivenName, user.Surname].filter(Boolean).join(" "),
  ]

  return names
    .map((name) => normalizeValue(name ?? ""))
    .filter(Boolean)
}

function isLikelyNameMatch(targetName: string, user: User) {
  const targetTokens = tokenizeValue(targetName)

  if (targetTokens.length === 0) {
    return false
  }

  return getCandidateNames(user).some((candidateName) => {
    const candidateTokens = tokenizeValue(candidateName)

    return targetTokens.every((targetToken) =>
      candidateTokens.some((candidateToken) =>
        candidateToken === targetToken
        || candidateToken.startsWith(targetToken)
        || targetToken.startsWith(candidateToken)
      )
    )
  })
}

function selectOfficeUser(users: User[], technicianName: string) {
  const normalizedTarget = normalizeValue(technicianName)

  const exactMatch = users.find((user) =>
    getCandidateNames(user).some((candidateName) => candidateName === normalizedTarget)
  )

  if (exactMatch) {
    return exactMatch
  }

  const likelyMatches = users.filter((user) => isLikelyNameMatch(technicianName, user))

  if (likelyMatches.length === 1) {
    return likelyMatches[0]
  }

  return null
}

export async function fetchTechnicians() {
  const result = await technicianClient.executeAsync<
    { inputParameters: Record<string, never> },
    GetTechListResponse
  >({
    connectorOperation: {
      tableName: "gettechlist",
      operationName: "GetTechList",
      parameters: { inputParameters: {} },
    },
  }) as IOperationResult<GetTechListResponse>

  if (!result.success) {
    throw result.error ?? new Error("Unable to load technicians.")
  }

  const payload = result.data as Record<string, unknown> | undefined
  const rows = getResultSetRows(payload?.ResultSets ?? payload?.resultsets)

  return rows
    .map(toTechnician)
    .filter((technician): technician is Technician => technician !== null)
}

export async function fetchTechnicianEmail(technicianName: string) {
  const trimmedName = technicianName.trim()

  if (!trimmedName) {
    return null
  }

  const result = await Office365UsersService.SearchUser(trimmedName, 10)

  if (!result.success) {
    throw result.error ?? new Error("Unable to look up technician email.")
  }

  const matchedUser = selectOfficeUser(result.data ?? [], trimmedName)

  return matchedUser?.Mail?.trim() || matchedUser?.UserPrincipalName?.trim() || null
}
