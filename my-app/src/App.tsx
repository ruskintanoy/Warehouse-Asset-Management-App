import { SonnerProvider } from "@/providers/sonner-provider"
import { RouterProvider } from "react-router-dom"
import { router } from "@/router"

export default function App() {
  return (
    <SonnerProvider>
      <RouterProvider router={router} />
    </SonnerProvider>
  )
}
