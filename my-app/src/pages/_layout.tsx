import { useEffect } from "react"
import { Outlet } from "react-router-dom"

export default function Layout() {
  useEffect(() => {
    const root = document.documentElement
    const visualViewport = window.visualViewport

    function updateViewportHeight() {
      const nextHeight = visualViewport?.height ?? window.innerHeight
      root.style.setProperty("--app-viewport-height", `${nextHeight}px`)
    }

    updateViewportHeight()

    window.addEventListener("resize", updateViewportHeight)
    visualViewport?.addEventListener("resize", updateViewportHeight)
    visualViewport?.addEventListener("scroll", updateViewportHeight)

    return () => {
      window.removeEventListener("resize", updateViewportHeight)
      visualViewport?.removeEventListener("resize", updateViewportHeight)
      visualViewport?.removeEventListener("scroll", updateViewportHeight)
    }
  }, [])

  return (
    <main
      className="mx-auto w-full max-w-7xl overflow-x-hidden"
      style={{ minHeight: "var(--app-viewport-height, 100dvh)" }}
    >
      <Outlet />
    </main>
  )
}
