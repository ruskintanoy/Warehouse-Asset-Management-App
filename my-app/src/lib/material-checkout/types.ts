export type Technician = {
  stageid: number
  stage: string
  bponum: string
}

export type MaterialRecord = {
  id: string
  materialId: string
  name: string
  unit: string
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

export function getMaterialKey(material: Pick<MaterialRecord, "id" | "name">) {
  return `${material.id}::${material.name}`
}
