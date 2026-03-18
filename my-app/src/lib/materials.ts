import { Material_descService } from "@/generated"
import type { Material_desc } from "@/generated/models/Material_descModel"
import type { Material } from "@/lib/inventory"
import { createDataLoadError, type DataLoadError, logDiagnostic } from "@/lib/load-errors"

export type MaterialLoadResult = {
  materials: Material[]
  source: "sql" | "unavailable"
  error?: DataLoadError
}

function toMaterial(record: Material_desc): Material | null {
  if (
    typeof record.id !== "number" ||
    typeof record.name !== "string" ||
    typeof record.product_code !== "string"
  ) {
    return null
  }

  return {
    materialId: record.id,
    materialName: record.name,
    productCode: record.product_code,
  }
}

async function fetchSqlMaterials(): Promise<Material[]> {
  const rows: Material_desc[] = []
  let skipToken: string | undefined

  do {
    const result = await Material_descService.getAll({
      select: ["id", "name", "product_code"],
      orderBy: ["name asc"],
      maxPageSize: 500,
      skipToken,
    })

    if (!result.success) {
      throw result.error ?? new Error("The material list could not be loaded.")
    }

    rows.push(...result.data)
    skipToken = result.skipToken
  } while (skipToken)

  const materials = rows
    .map(toMaterial)
    .filter((material): material is Material => material !== null)

  return materials
}

function getMaterialLoadError(error: unknown): DataLoadError {
  void error
  return createDataLoadError("Failed to load materials. Refresh and try again.")
}

export async function loadMaterials(): Promise<MaterialLoadResult> {
  try {
    const materials = await fetchSqlMaterials()

    return {
      materials,
      source: "sql",
    }
  } catch (error) {
    logDiagnostic("materials.load", error)

    return {
      materials: [],
      source: "unavailable",
      error: getMaterialLoadError(error),
    }
  }
}
