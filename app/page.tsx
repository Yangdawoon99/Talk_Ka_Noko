"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ZipperVisual } from "@/components/zipper-visual"
import { UploadArea } from "@/components/upload-area"
import { StickyFooter } from "@/components/sticky-footer"
import { ReportCard } from "@/components/report-card"

import { ScoreCriteriaModal } from "@/components/score-criteria-modal"
import { Info, Sparkles } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { ContextSurvey } from "@/components/context-survey"
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { RelationshipRadar } from "@/components/relationship-radar"
import { AttachmentCard } from "@/components/attachment-card"

import { Suspense } from "react"

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
  }, [searchParams, setIsPremiumUser])
  return null
}

function HomeContent() {
  console.log("CLIENT_LOG: HomeContent rendering")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [parsedData, setParsedData] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [showSurvey, setShowSurvey] = useState(false)
  const [surveyContext, setSurveyContext] = useState<any>(null)
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false)
  const [isPremiumUser, setIsPremiumUser] = useState(false)

  useEffect(() => {
    window.onerror = (msg, url, line, col, error) => {
      console.error("GLOBAL_ERROR_DETECTED:", { msg, url, line, col, error })
    }
    window.onunhandledrejection = (event) => {
      console.error("UNHANDLED_REJECTION_DETECTED:", event.reason)
    }
  }, [])

  useEffect(() => {
    console.log("STATE_CHANGE: isAnalyzing =", isAnalyzing)
  }, [isAnalyzing])

  useEffect(() => {
    console.log("STATE_CHANGE: parsedData =", parsedData?.length, "items")
  }, [parsedData])


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
      <PremiumManager setIsPremiumUser={setIsPremiumUser} />
      <Header />
      <main className="flex-1 pb-36">
        <HeroSection />
        <ZipperVisual forcedIsAnalyzing={isAnalyzing} />

        {isPremiumUser && (
          <div className="fixed top-4 left-4 z-50 px-3 py-1 bg-yellow-400 text-yellow-950 text-[10px] font-bold rounded-full shadow-lg flex items-center gap-1 animate-pulse">
            <Sparkles className="w-3 h-3" />
            TEST MODE: PREMIUM UNLOCKED
          </div>
        )}

        {!parsedData && !isAnalyzing && (
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

              {isPremiumUser ? (
                <div className="flex flex-col gap-6 animate-in zoom-in duration-500">
                  {/* Premium: Attachment Type */}
                  <AttachmentCard type={analysis.attachment_type} />

                  {/* Premium: Radar Chart */}
                  {analysis.radar_data && (
                    <RelationshipRadar data={analysis.radar_data} />
                  )}

                  {/* Premium: Sentiment Score */}
                  <div className="p-6 rounded-2xl bg-secondary/30 border border-primary/20 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase">대화 온도 (Sentiment)</h4>
                      <span className="text-xl font-black text-primary">{analysis.sentiment_score || 0}%</span>
                    </div>
                    <div className="h-3 w-full bg-border/30 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-primary/50 to-primary transition-all duration-1000 shadow-[0_0_15px_rgba(254,229,0,0.5)]"
                        style={{ width: `${analysis.sentiment_score || 0}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground">
                      * 대화 속의 긍정/부정 단어와 이모티콘의 온도를 측정한 결과입니다.
                    </p>
                  </div>

                  {/* Premium: Deep Analysis Text */}
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Sparkles className="w-4 h-4" />
                      <h4 className="text-sm font-bold">전문 상담가 심층 리포트</h4>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {analysis.detailed_analysis || "관계에 대한 정밀 분석 결과가 여기에 표시됩니다."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-2xl bg-secondary/30 border border-primary/20 p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      프리미엄 정밀 분석
                    </h4>
                    <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">LOCKED</span>
                  </div>

                  <div className="flex flex-col gap-2 blur-sm select-none opacity-40">
                    <div className="flex items-center gap-2">
                      <div className="w-full h-2 shadow-inner bg-border/50 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[70%]" />
                      </div>
                      <span className="text-[10px] font-medium min-w-[30px]">72%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-full h-2 shadow-inner bg-border/50 rounded-full overflow-hidden">
                        <div className="h-full bg-primary/50 w-[45%]" />
                      </div>
                      <span className="text-[10px] font-medium min-w-[30px]">45%</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    상대방의 답장에 담긴 무의식적 단어들과 시간대별 감정 변화를 분석한 단독 리포트를 확인하세요.
                  </p>

                  <button className="w-full py-4 px-6 rounded-xl bg-[#FEE500] text-[#3A1D1D] font-extrabold shadow-lg shadow-yellow-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm">
                    상세 리포트 잠금 해제하기
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
      </main>
      <StickyFooter />
    </div>
  )
}
