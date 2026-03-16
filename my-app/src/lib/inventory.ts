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

export const mockRequesters: Requester[] = [
  {
    stageId: 111626,
    stage: "Unit 355",
    requesterName: "Marko Holdt",
    requesterEmail: "marko.holdt@spaar.ca",
  },
  {
    stageId: 150568,
    stage: "Unit 365",
    requesterName: "Conner Bennett",
    requesterEmail: "conner.bennett@spaar.ca",
  },
  {
    stageId: 172259,
    stage: "Unit 385",
    requesterName: "Taylor Soos",
    requesterEmail: "taylor.soos@spaar.ca",
  },
  {
    stageId: 187441,
    stage: "Unit 392",
    requesterName: "Abby Jarrah",
    requesterEmail: "abby.jarrah@spaar.ca",
  },
  {
    stageId: 193274,
    stage: "Unit 404",
    requesterName: "Bryan Galdonez",
    requesterEmail: "bryan.galdonez@spaar.ca",
  },
  {
    stageId: 201118,
    stage: "Unit 411",
    requesterName: "Carson Geiger",
    requesterEmail: "carson.geiger@spaar.ca",
  },
]

export const mockMaterials: Material[] = [
  {
    materialId: 89,
    materialName: "Insulation - Poly Light 08'",
    productCode: "PYLT86",
  },
  {
    materialId: 170,
    materialName: "Misc - Sanding Sponges Angle Fine",
    productCode: "XMCP040",
  },
  {
    materialId: 713,
    materialName: "OC Storm Shingle (Duration)",
    productCode: "OCSTM",
  },
  {
    materialId: 811,
    materialName: "Roof Vent - Low Profile",
    productCode: "RFV112",
  },
  {
    materialId: 945,
    materialName: "Caulking - Exterior White",
    productCode: "CAULK9",
  },
  {
    materialId: 1002,
    materialName: "Drywall Patch Kit",
    productCode: "DWPK44",
  },
  {
    materialId: 1093,
    materialName: "Drywall Patch Kit Drywall Patch Kit Drywall Patch Kit",
    productCode: "DWPK44",
  },
]
