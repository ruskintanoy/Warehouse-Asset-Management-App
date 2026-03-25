import { GetMaterialListService } from "@/generated"

import type { MaterialRecord } from "./types"

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

function toMaterialRecord(row: unknown): MaterialRecord | null {
  if (!isRecord(row)) {
    return null
  }

  const id = toNumber(row.id ?? row.Id ?? row.materialid ?? row.material_id)
  const name = toText(row.name ?? row.Name)

  if (id === null || !name) {
    return null
  }

  return {
    id,
    name,
    unit: toText(row.unit ?? row.Unit),
    productCode: toText(row.product_code ?? row.productCode ?? row.ProductCode ?? row.Product_Code),
  }
}

export async function fetchMaterials() {
  const result = await GetMaterialListService.GetMaterialList()

  if (!result.success) {
    throw result.error ?? new Error("Unable to load materials.")
  }

  const payload = result.data as Record<string, unknown> | undefined
  const rows = getResultSetRows(payload?.ResultSets ?? payload?.resultsets)

  return rows
    .map(toMaterialRecord)
    .filter((material): material is MaterialRecord => material !== null)
    .sort((left, right) => left.name.localeCompare(right.name))
}
