import { ShieldCheck } from "lucide-react"

export function StickyFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/60">
      <div className="flex flex-col items-center gap-3 px-6 pt-4 pb-6 max-w-lg mx-auto">
        {/* Neon glow button wrapper */}
        <div className="relative w-full">
          {/* Neon glow layer behind the button */}
          <div
            className="absolute -inset-1 rounded-2xl opacity-60 blur-xl animate-neon-pulse pointer-events-none"
            style={{ background: "#FEE500" }}
            aria-hidden="true"
          />
          <div
            className="absolute -inset-0.5 rounded-2xl opacity-30 blur-md animate-neon-pulse pointer-events-none"
            style={{ background: "#FEE500" }}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="relative w-full py-4 text-base font-bold rounded-2xl bg-primary text-primary-foreground active:scale-[0.98] transition-all duration-150 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {"카카오톡 대화 분석하기"}
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#9ca3af] shrink-0" />
          <span className="text-xs text-[#9ca3af]">
            {"분석 즉시 서버에서 영구 삭제됨"}
          </span>
        </div>
      </div>
    </footer>
  )
}
