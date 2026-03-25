export type Technician = {
  stageid: number
  stage: string
  bponum: string
}

export type MaterialRecord = {
  id: number
  name: string
  unit: string
  productCode: string
}

export type MaterialRequestLine = MaterialRecord & {
  quantity: number
}

export type MaterialSubmissionReceipt = {
  requestNumber?: string
  technician: Technician
  technicianEmail: string | null
  lines: MaterialRequestLine[]
  notes: string
  submittedAt: string
}

export function getMaterialKey(material: Pick<MaterialRecord, "id" | "name" | "productCode">) {
  return `${material.id}::${material.productCode}::${material.name}`
}
