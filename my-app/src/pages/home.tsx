export default function HomePage() {
  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,_rgba(200,115,32,0.16),_transparent_42%),linear-gradient(180deg,_rgba(255,255,255,1),_rgba(245,242,236,1))]">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl items-center px-8 py-12">
        <section className="grid gap-6 rounded-[2rem] border border-border/70 bg-card/90 p-10 shadow-[0_24px_80px_rgba(35,26,16,0.08)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Material Checkout App
          </p>
          <div className="grid gap-3">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance">
              Starter template cleaned and ready for the kiosk build.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              The demo code, unused providers, and extra starter libraries have been removed so we can build the
              warehouse checkout experience from a smaller, easier-to-maintain base.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
