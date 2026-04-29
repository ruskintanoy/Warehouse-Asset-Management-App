import { useCallback, useEffect, type RefObject } from "react"

type EnsureVisibleRef = RefObject<HTMLElement | null>

function scrollIntoNearestView(targetRef: EnsureVisibleRef) {
  targetRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
}

export function useEnsureVisible(targetRef: EnsureVisibleRef, enabled: boolean) {
  const ensureVisible = useCallback(() => {
    scrollIntoNearestView(targetRef)

    window.setTimeout(() => {
      scrollIntoNearestView(targetRef)
    }, 180)
  }, [targetRef])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const viewport = window.visualViewport

    ensureVisible()
    window.addEventListener("resize", ensureVisible)
    viewport?.addEventListener("resize", ensureVisible)

    return () => {
      window.removeEventListener("resize", ensureVisible)
      viewport?.removeEventListener("resize", ensureVisible)
    }
  }, [enabled, ensureVisible])

  return ensureVisible
}
