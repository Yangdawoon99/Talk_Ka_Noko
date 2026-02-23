"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ZipperVisual } from "@/components/zipper-visual"
import { UploadArea } from "@/components/upload-area"
import { StickyFooter } from "@/components/sticky-footer"
import { ReportCard } from "@/components/report-card"

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [parsedData, setParsedData] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  return (
    <div className="flex flex-col min-h-dvh bg-background max-w-lg mx-auto">
      <Header />
      <main className="flex-1 pb-36">
        <HeroSection />
        <ZipperVisual forcedIsAnalyzing={isAnalyzing} />
        <UploadArea
          onAnalysisStart={() => {
            setIsAnalyzing(true)
            setAnalysis(null)
            setAiError(null)
          }}
          onAnalysisComplete={(data, aiAnalysis, aiError) => {
            setParsedData(data)
            setAnalysis(aiAnalysis)
            setAiError(aiError)
            setIsAnalyzing(false)
          }}
        // We can't easily change the prop signature without updating UploadArea again
        // but we can handle the result in onAnalysisComplete
        />

        {parsedData && !analysis && !isAnalyzing && (
          <div className="px-6 py-4 animate-in fade-in duration-500">
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex flex-col gap-2">
              <p className="text-sm font-bold text-destructive">AI 분석에 실패했습니다.</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                OpenAI API 쿼터 초과 또는 키 설정 문제일 수 있습니다. (오류: {aiError || "quota_exceeded"})
                기본 파싱 결과(메시지 {parsedData.length}개)는 정상적으로 불러왔습니다.
              </p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="px-6 py-8 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-foreground">관계 분석 리포트</h3>
              <p className="text-sm text-muted-foreground">{analysis.summary || "데이터 기반 관계 분석 결과입니다."}</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Free Insights */}
              <ReportCard
                title="우리의 관계 키워드"
                value={analysis.keyword || "분석 완료"}
                description="대화 패턴으로 분석한 두 사람의 핵심 정체성입니다."
              />

              <ReportCard
                title="메시지 총량"
                value={`${parsedData?.length?.toLocaleString() || 0}개`}
                description="지금까지 주고받은 소중한 대화의 조각들입니다."
              />

              <ReportCard
                title="애정 지수 (L-Score)"
                value={`${analysis.score || 0}%`}
                description="AI가 분석한 두 사람의 감정적 밀착도입니다."
              />

              <ReportCard
                title="가장 적극적인 사람"
                value={analysis.active_sender || "이름 확인 불가"}
                description="대화를 주도하고 약속을 먼저 제안하는 리더입니다."
              />

              {/* Premium Insights (Blurred) */}
              <ReportCard
                title="야간 대화 빈도"
                value={`${analysis.nighttime_rate || 0}%`}
                description="감정이 가장 풍부해지는 밤 10시 이후의 대화 비중입니다."
                isPremium
              />
            </div>

            <button className="w-full py-5 px-6 rounded-2xl bg-[#FEE500] text-[#3A1D1D] font-extrabold shadow-xl shadow-yellow-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg">
              상세 리포트 잠금 해제하기
            </button>
          </div>
        )}
      </main>
      <StickyFooter />
    </div>
  )
}
