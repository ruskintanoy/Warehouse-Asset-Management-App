export type DataLoadError = {
  message: string
  supportHint: string
}

export function createDataLoadError(
  message: string,
  supportHint: string
): DataLoadError {
  return {
    message,
    supportHint,
  }
}
