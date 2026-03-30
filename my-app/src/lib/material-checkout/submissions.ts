import { Spaar_materialrequestlinesService, Spaar_materialrequestsService, } from "@/generated"
import type { Spaar_materialrequestlinesBase } from "@/generated/models/Spaar_materialrequestlinesModel"
import type { Spaar_materialrequestsBase, Spaar_materialrequestsspaar_status, } from "@/generated/models/Spaar_materialrequestsModel"

import type { MaterialRequestLine, Technician } from "./types"

const PENDING_STATUS: Spaar_materialrequestsspaar_status = 534470000

type SaveMaterialRequestInput = {
  technician: Technician
  technicianEmail: string | null
  lines: MaterialRequestLine[]
  notes: string
}

function buildRequestRecord(input: SaveMaterialRequestInput): Omit<Spaar_materialrequestsBase, "spaar_materialrequestid"> {
  return {
    spaar_stageid: String(input.technician.stageid),
    spaar_stage: input.technician.stage,
    spaar_technicianname: input.technician.bponum,
    spaar_technicianemail: input.technicianEmail ?? undefined,
    spaar_notes: input.notes.trim() || undefined,
    spaar_status: PENDING_STATUS,
    statecode: 0,
    statuscode: 1,
  } as Omit<Spaar_materialrequestsBase, "spaar_materialrequestid">
}

function buildLineRecord(
  line: MaterialRequestLine,
  requestDataverseId: string,
): Omit<Spaar_materialrequestlinesBase, "spaar_materialrequestlineid"> {
  return {
    spaar_materialid: String(line.id),
    spaar_materialname: line.name,
    "spaar_MaterialRequest@odata.bind": `/spaar_materialrequests(${requestDataverseId})`,
    spaar_productcode: line.productCode || undefined,
    spaar_quantity: String(line.quantity),
    spaar_unit: line.unit || undefined,
    statecode: 0,
    statuscode: 1,
  } as Omit<Spaar_materialrequestlinesBase, "spaar_materialrequestlineid">
}

export async function saveMaterialRequest(input: SaveMaterialRequestInput): Promise<void> {
  const requestCreateResult = await Spaar_materialrequestsService.create(
    buildRequestRecord(input)
  )

  if (!requestCreateResult.success) {
    throw requestCreateResult.error ?? new Error("Unable to create the material request.")
  }

  const requestDataverseId = requestCreateResult.data.spaar_materialrequestid

  const lineResults = await Promise.all(
    input.lines.map((line) =>
      Spaar_materialrequestlinesService.create(
        buildLineRecord(
          line,
          requestDataverseId,
        )
      )
    )
  )

  const failedLineResult = lineResults.find((result) => !result.success)

  if (failedLineResult) {
    throw failedLineResult.error ?? new Error("Unable to create one or more material request lines.")
  }
}
