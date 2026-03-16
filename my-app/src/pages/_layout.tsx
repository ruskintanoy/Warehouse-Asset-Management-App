import { Outlet } from "react-router-dom"

export default function Layout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1 flex">
        <div className="flex-1 mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
