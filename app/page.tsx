"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ZipperVisual } from "@/components/zipper-visual"
import { UploadArea } from "@/components/upload-area"
import { StickyFooter } from "@/components/sticky-footer"
import { ReportCard } from "@/components/report-card"

import { ScoreCriteriaModal } from "@/components/score-criteria-modal"
import { Info, Sparkles, Lock } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { ContextSurvey } from "@/components/context-survey"
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { PaymentModal } from "@/components/payment-modal"
import { PremiumDetailedReport } from "@/components/premium-detailed-report"
import { RelationshipRadar } from "@/components/relationship-radar"
import { ShareButton, SharedCaptureCard } from "@/components/share-button"
import { toast, Toaster } from "sonner"


console.log("CLIENT_LOG: page.tsx executing at top level")

export default function Home() {
  console.log("CLIENT_LOG: Home component rendering")
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-dvh bg-background">로딩 중... (JS 로드 중)</div>}>
      <HomeContent />
    </Suspense>
  )
}

function PremiumManager({ setIsPremiumUser }: { setIsPremiumUser: (v: boolean) => void }) {
  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get("premium") === "true") {
      setIsPremiumUser(true)
    }
    if (localStorage.getItem("talk_ka_noko_premium") === "true") {
      setIsPremiumUser(true)
    }
  }, [searchParams, setIsPremiumUser])
  return null
}

function HomeContent() {
  const [isMounted, setIsMounted] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [parsedData, setParsedData] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [showSurvey, setShowSurvey] = useState(false)
  const [surveyContext, setSurveyContext] = useState<any>(null)
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isPremiumUser, setIsPremiumUser] = useState(false)
  const [isShared, setIsShared] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    console.log("CLIENT_LOG: HomeContent mounted, hydration complete")

    // Recover data from localStorage
    try {
      const savedParsedData = localStorage.getItem("talk_ka_noko_parsedData")
      const savedAnalysis = localStorage.getItem("talk_ka_noko_analysis")
      const savedContext = localStorage.getItem("talk_ka_noko_surveyContext")

      if (savedParsedData) setParsedData(JSON.parse(savedParsedData))
      if (savedAnalysis) setAnalysis(JSON.parse(savedAnalysis))
      if (savedContext) setSurveyContext(JSON.parse(savedContext))
    } catch (e) {
      console.error("Failed to recover from localStorage", e)
    }
  }, [])

  // Sync state to localStorage
  useEffect(() => {
    if (parsedData) localStorage.setItem("talk_ka_noko_parsedData", JSON.stringify(parsedData))
    if (analysis) localStorage.setItem("talk_ka_noko_analysis", JSON.stringify(analysis))
    if (surveyContext) localStorage.setItem("talk_ka_noko_surveyContext", JSON.stringify(surveyContext))
  }, [parsedData, analysis, surveyContext])

  useEffect(() => {
    console.log("STATE_CHANGE: isPaymentModalOpen =", isPaymentModalOpen)
  }, [isPaymentModalOpen])

  useEffect(() => {
    if (!isMounted) return
    window.onerror = (msg, url, line, col, error) => {
      console.error("GLOBAL_ERROR_DETECTED:", { msg, url, line, col, error })
    }
    window.onunhandledrejection = (event) => {
      console.error("UNHANDLED_REJECTION_DETECTED:", event.reason)
    }
  }, [isMounted])

  useEffect(() => {
    console.log("STATE_CHANGE: isAnalyzing =", isAnalyzing)
  }, [isAnalyzing])

  useEffect(() => {
    console.log("STATE_CHANGE: parsedData =", parsedData?.length, "items")
  }, [parsedData])

  const handleReset = () => {
    setParsedData(null)
    setAnalysis(null)
    setSurveyContext(null)
    setAiError(null)
    setShowSurvey(false)
    localStorage.removeItem("talk_ka_noko_parsedData")
    localStorage.removeItem("talk_ka_noko_analysis")
    localStorage.removeItem("talk_ka_noko_surveyContext")
    toast.success("초기화되었습니다. 새로운 파일을 업로드 해주세요!")
  }

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-background text-foreground/50 text-xs gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        자바스크립트 로드 중...
      </div>
    )
  }


  const handleAnalysisTrigger = async (context: any) => {
    try {
      console.log("CLIENT_LOG: handleAnalysisTrigger starting...", {
        context,
        dataLength: parsedData?.length,
        firstMessage: parsedData?.[0],
        lastMessage: parsedData?.[parsedData?.length - 1]
      })

      setIsAnalyzing(true)
      setShowSurvey(false)
      setSurveyContext(context)

      console.log("CLIENT_LOG: Attempting fetch to /api/parse (JSON)")
      const payload = JSON.stringify({
        data: parsedData,
        context: context
      })
      console.log("CLIENT_LOG: Payload size:", payload.length)

      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload
      })

      console.log(`CLIENT_LOG: Analysis response status: ${response.status}`)
      if (!response.ok) throw new Error("Analysis failed")

      const result = await response.json()
      console.log("CLIENT_LOG: Received analysis result", result)
      setAnalysis(result.analysis)
      setAiError(result.aiError)
    } catch (error: any) {
      console.error("CLIENT_LOG: AI analysis fail", error)
      setAiError(error.message || "분석 실패")
    } finally {
      console.log("CLIENT_LOG: handleAnalysisTrigger finished")
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background max-w-lg mx-auto">
      {isMounted && (
        <>
          <Suspense fallback={null}>
            <PremiumManager setIsPremiumUser={setIsPremiumUser} />
          </Suspense>
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onOpenChange={(val) => {
              console.log("MODAL_STATE_CHANGE: Setting isPaymentModalOpen to", val)
              setIsPaymentModalOpen(val)
            }}
            onSuccess={() => {
              console.log("PAYMENT_SUCCESS_CALLBACK: Unlocking premium")
              setIsPremiumUser(true)
              localStorage.setItem("talk_ka_noko_premium", "true")
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
          />
        </>
      )}
      <Header />
      <main className="flex-1 pb-36">
        <HeroSection />
        <ZipperVisual forcedIsAnalyzing={isAnalyzing} />

        {isPremiumUser && (
          <div className="fixed top-4 left-4 z-50 px-3 py-1 bg-yellow-400 text-yellow-950 text-[10px] font-bold rounded-full shadow-lg flex items-center gap-1 animate-pulse">
            <Sparkles className="w-3 h-3" />
            FREEMIUM: PREMIUM UNLOCKED 🔓
          </div>
        )}

        {!parsedData && (
          <UploadArea
            onAnalysisStart={() => {
              setIsAnalyzing(true)
              setAnalysis(null)
              setAiError(null)
            }}
            onAnalysisComplete={(data) => {
              setParsedData(data)
              setIsAnalyzing(false)
              if (data && data.length > 0) {
                setShowSurvey(true)
              }
            }}
          />
        )}

        {showSurvey && parsedData && (
          <ContextSurvey
            onComplete={handleAnalysisTrigger}
          />
        )}

        {analysis ? (
          <div className="px-6 py-8 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-foreground">관계 분석 리포트</h3>
              <p className="text-sm text-muted-foreground">{analysis.summary || "데이터 기반 관계 분석 결과입니다."}</p>
            </div>

            <ActivityHeatmap hourlyData={analysis.stats?.hourly} />

            {/* SHARED or PREMIUM users see Relationship Radar */}
            {(isPremiumUser || isShared) && analysis.radar_data && (
              <div className="animate-in fade-in zoom-in duration-700 bg-secondary/10 p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-2 mb-4 px-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground font-title uppercase tracking-widest">인공지능 정밀 밸런스</h3>
                </div>
                <RelationshipRadar data={analysis.radar_data} />
                {isShared && !isPremiumUser && (
                  <p className="mt-4 text-[10px] text-center text-primary/80 font-bold animate-pulse">
                    ✅ 공유 완료! 레이더 차트가 잠금 해제되었습니다.
                  </p>
                )}
              </div>
            )}

            {aiError && (
              <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 flex flex-col gap-4 animate-in fade-in duration-500">
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-destructive">분석 중 일부 지연 발생</h4>
                  <p className="text-xs text-muted-foreground">{aiError}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <ReportCard
                title="우리의 관계 키워드"
                value={analysis.keyword || "분석 완료"}
                description="대화 패턴으로 분석한 두 사람의 핵심 정체성입니다."
              />

              <ReportCard
                title={
                  <div className="flex items-center gap-1.5">
                    애정 지수 (L-Score)
                    <button
                      onClick={() => setIsScoreModalOpen(true)}
                      className="text-muted-foreground/50 hover:text-primary transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                }
                value={`${analysis.score || 0}%`}
                description="AI가 분석한 두 사람의 감정적 밀착도입니다."
              />

              <ReportCard
                title="가장 적극적인 사람"
                value={analysis.active_sender || "이름 확인 불가"}
                description="대화를 주도하고 약속을 먼저 제안하는 리더입니다."
              />

              <ReportCard
                title="야간 대화 빈도"
                value={`${analysis.nighttime_rate || 0}%`}
                description="감정이 풍부해지는 밤 10시 이후의 대화 비중입니다."
                isPremium={!isPremiumUser}
              />

              {!isPremiumUser && (
                <div className="space-y-6">
                  {/* Share to partially unlock */}
                  {!isShared && (
                    <div className="p-6 rounded-2xl bg-primary/5 border border-dashed border-primary/30 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-foreground">레이더 차트 잠금 해제</h4>
                        <span className="text-[10px] font-black text-primary px-2 py-0.5 rounded-full bg-primary/10">FREE UNLOCK</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        현재 분석 결과를 공유(혹은 링크 복사)하시면 <br />
                        두 사람의 <strong>5가지 관계 밸런스 데이터</strong>를 무료로 공개합니다!
                      </p>
                      <ShareButton
                        analysis={analysis}
                        onShareSuccess={() => {
                          setIsShared(true)
                          toast.success("레이더 차트가 잠금 해제되었습니다!")
                        }}
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                      <Lock className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-bold text-foreground font-title">프리미엄 정밀 분석</h3>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl bg-secondary/30 border border-primary/20 p-6 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          상대방의 속마음
                        </h4>
                        <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">LOCKED</span>
                      </div>

                      <div className="flex flex-col gap-2 blur-[6px] select-none opacity-20 pointer-events-none transform scale-[0.98]">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                          <div className="h-2 w-20 bg-primary/40 rounded-full" />
                          <div className="h-12 w-full bg-white/10 rounded-lg" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-full h-2 shadow-inner bg-border/50 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[70%]" />
                          </div>
                          <span className="text-[10px] font-medium min-w-[30px]">72%</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-muted-foreground italic leading-relaxed">
                          AI가 분석한 정밀 심리학적 리포트와 관계 솔루션,<br />
                          그리고 상대방의 <strong>애착 유형</strong>을 확인해보세요.
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          console.log("CLICKED: Payment button clicked")
                          setIsPaymentModalOpen(true)
                        }}
                        type="button"
                        className="w-full py-4 px-6 rounded-xl bg-[#FEE500] text-[#3A1D1D] font-extrabold shadow-lg shadow-yellow-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2 group"
                      >
                        <Sparkles className="w-4 h-4 fill-[#3A1D1D] group-hover:rotate-12 transition-transform" />
                        프리미엄 정밀 분석 (1,000원)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isPremiumUser && (
                <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <PremiumDetailedReport analysis={analysis} />
                  <div className="pt-8 border-t border-border/40">
                    <ShareButton analysis={analysis} />
                  </div>

                  <div className="pt-4 flex justify-center">
                    <button
                      onClick={handleReset}
                      className="text-xs text-muted-foreground/60 hover:text-primary transition-colors flex items-center gap-2 underline underline-offset-4"
                    >
                      새로운 대화 분석하기
                    </button>
                  </div>

                  {/* Capture Area (Hidden) */}
                  <div style={{ position: 'absolute', left: '-9999px', top: '0' }}>
                    <SharedCaptureCard analysis={analysis} />
                  </div>
                </div>
              )}

              {/* Reset button for Basic users too */}
              {!isPremiumUser && analysis && (
                <div className="pt-8 flex justify-center pb-12">
                  <button
                    onClick={handleReset}
                    className="text-xs text-muted-foreground/60 hover:text-primary transition-colors flex items-center gap-2 underline underline-offset-4"
                  >
                    새로운 대화 분석하기
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {!analysis && !isAnalyzing && aiError && (
          <div className="px-6 py-12 flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 rounded-3xl bg-secondary/50 border border-destructive/20 flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <Info className="w-8 h-8 text-destructive" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-foreground">분석에 실패했습니다</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {aiError}
                </p>
              </div>
              <button
                onClick={() => {
                  setParsedData(null)
                  setAnalysis(null)
                  setAiError(null)
                  setShowSurvey(false)
                }}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                처음부터 다시 시도하기
              </button>
            </div>
          </div>
        )}

        <ScoreCriteriaModal
          isOpen={isScoreModalOpen}
          onOpenChange={setIsScoreModalOpen}
        />

        <Toaster theme="dark" position="top-center" richColors />
      </main>

      <footer className="w-full py-12 px-6 border-t border-border/40 bg-secondary/10">
        <div className="max-w-[480px] mx-auto space-y-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-black tracking-tighter text-foreground/80 italic">톡까놓고.</h2>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              우리의 대화 속 숨겨진 마음을 AI가 정교하게 분석합니다.<br />
              모든 대화 데이터는 분석 즉시 파기되며 서버에 저장되지 않습니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Customer Service</h4>
              <a href="mailto:support@talkkanoko.com" className="text-xs text-muted-foreground hover:text-primary transition-colors block border-b border-border w-fit pb-0.5">
                support@talkkanoko.com
              </a>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Information</h4>
              <p className="text-[10px] text-muted-foreground leading-tight">
                본 서비스는 카카오(Kakao)와 무관한 독립적인 분석 서비스입니다.
              </p>
            </div>
          </div>

          <div className="pt-8 flex flex-col gap-4 border-t border-border/40">
            <div className="flex gap-4">
              <span className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors">이용약관</span>
              <span className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors font-bold text-primary">개인정보처리방침</span>
            </div>
            <p className="text-[9px] text-muted-foreground/50">
              © 2026 Talk-Ka-Noko. All rights reserved. Professional AI relationship analysis platform.
            </p>
          </div>
        </div>
      </footer>

      <StickyFooter />
    </div>
  )
}
