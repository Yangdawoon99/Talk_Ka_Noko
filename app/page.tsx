"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ZipperVisual } from "@/components/zipper-visual"
import { UploadArea } from "@/components/upload-area"
import { StickyFooter } from "@/components/sticky-footer"
import { ReportCard } from "@/components/report-card"

import { ScoreCriteriaModal } from "@/components/score-criteria-modal"
import { Info } from "lucide-react"

import { ContextSurvey } from "@/components/context-survey"
import { ActivityHeatmap } from "@/components/activity-heatmap"

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [parsedData, setParsedData] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [showSurvey, setShowSurvey] = useState(false)
  const [surveyContext, setSurveyContext] = useState<any>(null)
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false)

  const handleAnalysisTrigger = async (context: any) => {
    setIsAnalyzing(true)
    setShowSurvey(false)
    setSurveyContext(context)

    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: parsedData,
          context: context
        })
      })

      if (!response.ok) throw new Error("Analysis failed")

      const result = await response.json()
      setAnalysis(result.analysis)
      setAiError(result.aiError)
    } catch (error: any) {
      console.error("AI analysis fail", error)
      setAiError(error.message || "분석 실패")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background max-w-lg mx-auto">
      <Header />
      <main className="flex-1 pb-36">
        <HeroSection />
        <ZipperVisual forcedIsAnalyzing={isAnalyzing} />

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

        {analysis && (
          <div className="px-6 py-8 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-foreground">관계 분석 리포트</h3>
              <p className="text-sm text-muted-foreground">{analysis.summary || "데이터 기반 관계 분석 결과입니다."}</p>
            </div>

            <ActivityHeatmap hourlyData={analysis.stats?.hourly} />

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
                title="메시지 총량"
                value={`${parsedData?.length?.toLocaleString() || 0}개`}
                description="지금까지 주고받은 소중한 대화의 조각들입니다."
              />

              {/* Premium Preview Section */}
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
                  상대방의 답장 속도 변화 추이와 단어별 감정 분석 등 12가지 정밀 리포트가 기다리고 있어요.
                </p>

                <button className="w-full py-4 px-6 rounded-xl bg-[#FEE500] text-[#3A1D1D] font-extrabold shadow-lg shadow-yellow-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm">
                  상세 리포트 잠금 해제하기
                </button>
              </div>
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
