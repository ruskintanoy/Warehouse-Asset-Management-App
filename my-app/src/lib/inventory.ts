export type Requester = {
  stageId: number
  stage: string
  requesterName: string
  requesterEmail: string
}

export type Material = {
  materialId: number
  materialName: string
  productCode: string
}

export type InventoryRequest = {
  stage: string
  requesterName: string
  requesterEmail: string
}

export type InventoryRequestLine = {
  materialId: number
  materialName: string
  productCode: string
  qty: number
}

export type SubmitPayload = {
  inventoryRequest: InventoryRequest
  inventoryRequestLines: InventoryRequestLine[]
}

export const appConfig = {
  approverEmail: "pawel@spaar.ca",
  warehouseEmail: "warehouse@spaar.ca",
}
