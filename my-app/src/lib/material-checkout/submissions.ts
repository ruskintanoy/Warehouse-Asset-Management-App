import {
  Spaar_materialrequestlinesService,
  Spaar_materialrequestsService,
} from "@/generated"
import type { Spaar_materialrequestlinesBase } from "@/generated/models/Spaar_materialrequestlinesModel"
import type {
  Spaar_materialrequestsBase,
  Spaar_materialrequestsspaar_status,
} from "@/generated/models/Spaar_materialrequestsModel"

import type { MaterialRequestLine, Technician } from "./types"

const REQUEST_PREFIX = "MR"
const REQUEST_LINE_PREFIX = "MRL"
const ID_WIDTH = 6
const PENDING_STATUS: Spaar_materialrequestsspaar_status = 534470000

type SaveMaterialRequestInput = {
  technician: Technician
  technicianEmail: string | null
  lines: MaterialRequestLine[]
  notes: string
}

type SaveMaterialRequestResult = {
  requestNumber: string
}

function padSequence(value: number) {
  return String(value).padStart(ID_WIDTH, "0")
}

function extractSequence(value: string | undefined, prefix: string) {
  if (!value) {
    return null
  }

  const match = value.trim().match(new RegExp(`^${prefix}(\\d+)$`, "i"))

  if (!match) {
    return null
  }

  const parsedValue = Number(match[1])
  return Number.isInteger(parsedValue) ? parsedValue : null
}

async function getNextRequestNumber() {
  const result = await Spaar_materialrequestsService.getAll({
    select: ["spaar_materialrequest1"],
    orderBy: ["spaar_materialrequest1 desc"],
    top: 1,
  })

  if (!result.success) {
    throw result.error ?? new Error("Unable to generate the next material request number.")
  }

  const currentSequence = extractSequence(result.data?.[0]?.spaar_materialrequest1, REQUEST_PREFIX) ?? 0
  return `${REQUEST_PREFIX}${padSequence(currentSequence + 1)}`
}

async function getNextLineSequence() {
  const result = await Spaar_materialrequestlinesService.getAll({
    select: ["spaar_materialrequestline1"],
    orderBy: ["spaar_materialrequestline1 desc"],
    top: 1,
  })

  if (!result.success) {
    throw result.error ?? new Error("Unable to generate the next material request line number.")
  }

  return (extractSequence(result.data?.[0]?.spaar_materialrequestline1, REQUEST_LINE_PREFIX) ?? 0) + 1
}

function buildRequestRecord(input: SaveMaterialRequestInput, requestNumber: string): Omit<Spaar_materialrequestsBase, "spaar_materialrequestid"> {
  return {
    spaar_materialrequest1: requestNumber,
    spaar_stageid: String(input.technician.stageid),
    spaar_stage: input.technician.stage,
    spaar_technicianname: input.technician.bponum,
    spaar_technicianemail: input.technicianEmail ?? undefined,
    spaar_notes: input.notes.trim() || undefined,
    spaar_status: PENDING_STATUS,
    statecode: 0,
    statuscode: 1,
  }
}

function buildLineRecord(
  line: MaterialRequestLine,
  lineNumber: string,
  requestDataverseId: string,
): Omit<Spaar_materialrequestlinesBase, "spaar_materialrequestlineid"> {
  return {
    spaar_materialrequestline1: lineNumber,
    spaar_materialid: String(line.id),
    spaar_materialname: line.name,
    "spaar_MaterialRequest@odata.bind": `/spaar_materialrequests(${requestDataverseId})`,
    spaar_productcode: line.productCode || undefined,
    spaar_quantity: String(line.quantity),
    spaar_unit: line.unit || undefined,
    statecode: 0,
    statuscode: 1,
  }
}

export async function saveMaterialRequest(input: SaveMaterialRequestInput): Promise<SaveMaterialRequestResult> {
  const [requestNumber, nextLineSequence] = await Promise.all([
    getNextRequestNumber(),
    getNextLineSequence(),
  ])

  const requestCreateResult = await Spaar_materialrequestsService.create(
    buildRequestRecord(input, requestNumber)
  )

  if (!requestCreateResult.success) {
    throw requestCreateResult.error ?? new Error("Unable to create the material request.")
  }

  const requestDataverseId = requestCreateResult.data.spaar_materialrequestid

  const lineResults = await Promise.all(
    input.lines.map((line, index) =>
      Spaar_materialrequestlinesService.create(
        buildLineRecord(
          line,
          `${REQUEST_LINE_PREFIX}${padSequence(nextLineSequence + index)}`,
          requestDataverseId,
        )
      )
    )
  )

  const failedLineResult = lineResults.find((result) => !result.success)

  if (failedLineResult) {
    throw failedLineResult.error ?? new Error("Unable to create one or more material request lines.")
  }

  return { requestNumber }
}
