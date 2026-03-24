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
  {
    stageid: 235632,
    stage: "Unit 370",
    bponum: "Crystal Schultz",
  },
  {
    stageid: 446362,
    stage: "Unit 370",
    bponum: "Kyle Molin",
  },
  {
    stageid: 234523,
    stage: "Unit 370",
    bponum: "Ruskin Tanoy",
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
  {
    id: 421,
    name: "Misc - Complete Test Kit - Cortez 32S",
    unit: "Each",
    productCode: "TESTTEST",
  },
  {
    id: 989,
    name: "Misc - Complete Test Kit - Cortez LD6",
    unit: "Each",
    productCode: "TESTYTEST",
  },
  {
    id: 345,
    name: "Misc - Complete Test Kit - Cortez PO2",
    unit: "Each",
    productCode: "POLOMO",
  },
  {
    id: 874,
    name: "Misc - Complete Test Kit - Cortez TEST",
    unit: "Each",
    productCode: "ARLOMST",
  },
  {
    id: 567,
    name: "Misc - Complete Test Kit - Cortez TK5",
    unit: "Each",
    productCode: "POLEWOW",
  },
]
