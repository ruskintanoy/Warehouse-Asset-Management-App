import { Material_descService } from "@/generated"
import type { Material_desc } from "@/generated/models/Material_descModel"

import type { MaterialRecord } from "./types"

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function toMaterialRecord(material: Material_desc): MaterialRecord | null {
  if (typeof material.id !== "number" || !Number.isFinite(material.id)) {
    return null
  }

  const name = toText(material.name)

  if (!name) {
    return null
  }

  return {
    id: material.id,
    name,
    unit: toText(material.unit),
    productCode: toText(material.product_code),
  }
}

export async function fetchMaterials() {
  const result = await Material_descService.getAll({
    select: ["id", "name", "unit", "product_code"],
  })

  if (!result.success) {
    throw result.error ?? new Error("Unable to load materials.")
  }

  return (result.data ?? [])
    .map(toMaterialRecord)
    .filter((material): material is MaterialRecord => material !== null)
    .sort((left, right) => left.name.localeCompare(right.name))
}
