import { Spaar_materiallistsService } from "@/generated"
import type { Spaar_materiallists } from "@/generated/models/Spaar_materiallistsModel"
import type { MaterialRecord } from "./types"

function toMaterialRecord(material: Spaar_materiallists): MaterialRecord | null {
  const id = material.spaar_materiallistid?.trim()
  const name = material.spaar_materialname?.trim()

  if (!id || !name) {
    return null
  }

  return {
    id,
    materialId: material.spaar_materialid?.trim() || id,
    name,
    unit: material.spaar_unit?.trim() || "",
  }
}

export async function fetchMaterials() {
  const result = await Spaar_materiallistsService.getAll({
    orderBy: ["spaar_materialname asc"],
    filter: "statecode eq 0",
  })

  if (!result.success) {
    throw result.error ?? new Error("Unable to load materials.")
  }

  return result.data
    .map(toMaterialRecord)
    .filter((material): material is MaterialRecord => material !== null)
    .sort((left, right) => left.name.localeCompare(right.name))
}
