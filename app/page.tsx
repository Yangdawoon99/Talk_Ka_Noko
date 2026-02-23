"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ZipperVisual } from "@/components/zipper-visual"
import { UploadArea } from "@/components/upload-area"
import { StickyFooter } from "@/components/sticky-footer"

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [parsedData, setParsedData] = useState<any>(null)

  return (
    <div className="flex flex-col min-h-dvh bg-background max-w-lg mx-auto">
      <Header />
      <main className="flex-1 pb-36">
        <HeroSection />
        <ZipperVisual forcedIsAnalyzing={isAnalyzing} />
        <UploadArea
          onAnalysisStart={() => setIsAnalyzing(true)}
          onAnalysisComplete={(data) => {
            setParsedData(data)
            setIsAnalyzing(false)
          }}
        />
        {parsedData && (
          <div className="px-6 py-4 mt-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <h3 className="text-sm font-bold text-primary mb-2">분석 완료!</h3>
              <p className="text-xs text-muted-foreground">
                총 {parsedData.length}개의 메시지를 분석했습니다.
              </p>
            </div>
          </div>
        )}
      </main>
      <StickyFooter />
    </div>
  )
}
