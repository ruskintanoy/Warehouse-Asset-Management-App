import * as React from "react"
import { Toaster } from "sonner"

type SonnerProviderProps = { children: React.ReactNode }

export function SonnerProvider({ children }: SonnerProviderProps) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        theme="light"
        richColors
        expand
        duration={3000}
        visibleToasts={3}
      />
    </>
  )
}
