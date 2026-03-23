import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-8">
      <div className="flex w-full max-w-xl flex-col items-center gap-6 rounded-[1.5rem] border bg-card p-10 text-center shadow-sm">
        <h1 className="text-5xl font-semibold tracking-tight">404 - Not found</h1>
        <p className="text-muted-foreground">This route does not exist inside the app shell.</p>
        <Button asChild variant="outline">
          <Link to="/">Back to app</Link>
        </Button>
      </div>
    </div>
  )
}
