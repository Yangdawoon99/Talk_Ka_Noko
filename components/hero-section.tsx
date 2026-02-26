import { Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="flex flex-col items-center gap-5 px-6 pt-16 pb-6 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
        <Sparkles className="w-3 h-3 fill-primary" />
        High-Precision AI Analysis
      </div>
      <h2 className="text-[32px] sm:text-[40px] font-[900] leading-[1.1] text-foreground text-balance tracking-[-0.03em] font-title">
        3년 전 감정도 <br />
        <span className="text-primary italic">1분 만에</span> 팩트체크
      </h2>
      <p className="text-sm sm:text-base leading-relaxed text-muted-foreground/80 max-w-[280px] font-medium">
        무의식 속에 숨겨진 두 사람의 진짜 관계,<br />
        국내 최고 사양 AI가 정밀하게 해독합니다.
      </p>
    </section>
  )
}
