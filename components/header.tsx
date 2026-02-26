export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-black text-foreground tracking-tighter italic">
          톡까놓고<span className="text-primary">.</span>
        </h1>
        <span className="text-[9px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">V1.0</span>
      </div>
      <div className="hidden sm:block">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Premium AI Analysis Service</p>
      </div>
    </header>
  )
}
