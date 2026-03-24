import type { MaterialRecord, Technician } from "./types"

export const mockTechnicians: Technician[] = [
  {
    stageid: 153233,
    stage: "Unit 368",
    bponum: "Matt Dyck",
  },
  {
    stageid: 157822,
    stage: "Unit 369",
    bponum: "Justin Gallagher",
  },
  {
    stageid: 158504,
    stage: "Unit 370",
    bponum: "Jesse Tanner",
  },
]

export const mockMaterials: MaterialRecord[] = [
  {
    id: 987,
    name: "Thermal Barrier - Black DC315 5 Gal",
    unit: "Pail(s)",
    productCode: "IFCDC315",
  },
  {
    id: 988,
    name: "Steel - 1/4\" x 3\" Flat Eye Lags 5LB Box",
    unit: "Box(s)",
    productCode: "JW24113",
  },
  {
    id: 989,
    name: "Misc - Complete Test Kit - Cortez TK1",
    unit: "Each",
    productCode: "CZTESTKI",
  },
]
