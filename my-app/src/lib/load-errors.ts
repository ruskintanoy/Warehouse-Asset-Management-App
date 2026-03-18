export type DataLoadError = {
  message: string
}

export function createDataLoadError(message: string): DataLoadError {
  return {
    message,
  }
}

export function logDiagnostic(scope: string, details: unknown) {
  console.error(`InventoryApp:${scope}`, details)
}
