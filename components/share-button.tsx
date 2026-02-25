"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Download, Check, Sparkles, Instagram } from "lucide-react"
import html2canvas from "html2canvas"
import { toast } from "sonner"

interface ShareButtonProps {
    analysis: any
}

export function ShareButton({ analysis }: ShareButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [isCopied, setIsCopied] = useState(false)

    const handleCapture = async (type: 'download' | 'share') => {
        const element = document.getElementById("report-capture-area")
        if (!element) {
            toast.error("캡처할 영역을 찾지 못했습니다.")
            return
        }

        try {
            setIsGenerating(true)
            const canvas = await html2canvas(element, {
                background: "#0a0a0a",
                scale: 2,
                useCORS: true,
                logging: false,
            } as any)

            const image = canvas.toDataURL("image/png")

            if (type === 'download') {
                const link = document.createElement("a")
                link.href = image
                link.download = `talk-ka-noko-analysis-${Date.now()}.png`
                link.click()
                toast.success("이미지가 저장되었습니다!")
            } else if (type === 'share') {
                if (navigator.share) {
                    const blob = await (await fetch(image)).blob()
                    const file = new File([blob], "analysis.png", { type: "image/png" })
                    await navigator.share({
                        files: [file],
                        title: "톡까놓고 분석 결과",
                        text: "우리 관계, 톡까놓고 분석해봤어! 결과가 궁금하면 너도 해봐. #톡까놓고 #카톡분석",
                    })
                } else {
                    // Fallback to clipboard
                    const blob = await (await fetch(image)).blob()
                    try {
                        await navigator.clipboard.write([
                            new ClipboardItem({ "image/png": blob })
                        ])
                        setIsCopied(true)
                        toast.success("이미지가 클립보드에 복사되었습니다!")
                        setTimeout(() => setIsCopied(false), 2000)
                    } catch (err) {
                        toast.error("공유 기능을 지원하지 않는 브라우저입니다.")
                    }
                }
            }
        } catch (err) {
            console.error("Capture Error:", err)
            toast.error("이미지 생성 중 오류가 발생했습니다.")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="flex flex-col gap-3 px-4">
            <div className="flex gap-2">
                <Button
                    onClick={() => handleCapture('share')}
                    disabled={isGenerating}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl bg-secondary/50 border-border/40 gap-2 hover:bg-secondary"
                >
                    {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Instagram className="w-4 h-4 text-pink-500" />}
                    <span className="text-xs font-bold">인스타/공유하기</span>
                </Button>
                <Button
                    onClick={() => handleCapture('download')}
                    disabled={isGenerating}
                    variant="outline"
                    className="w-12 h-12 rounded-xl bg-secondary/50 border-border/40 p-0 hover:bg-secondary"
                    title="이미지 다운로드"
                >
                    <Download className="w-4 h-4 text-muted-foreground" />
                </Button>
            </div>

            <p className="text-[10px] text-center text-muted-foreground">
                이미지 생성은 수초가 걸릴 수 있습니다.
            </p>
        </div>
    )
}

// 캡처용 요약 카드 컴포넌트
export function SharedCaptureCard({ analysis }: { analysis: any }) {
    if (!analysis) return null

    // Explicit colors for html2canvas compatibility (Hex/RGB only)
    const colors = {
        primary: "#FEE500",
        background: "#0a0a0a",
        secondary: "#2a2a2a",
        indigo500: "#6366f1",
        indigo400: "#818cf8",
        muted: "#888888",
        white: "#ffffff"
    }

    return (
        <div
            id="report-capture-area"
            className="w-[400px] p-8 relative overflow-hidden flex flex-col items-center gap-6"
            style={{
                fontFamily: 'Inter, sans-serif',
                backgroundColor: colors.background,
                border: `2px solid rgba(254, 229, 0, 0.3)`
            }}
        >
            {/* Background elements */}
            <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl"
                style={{ backgroundColor: 'rgba(254, 229, 0, 0.1)' }}
            />
            <div
                className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl"
                style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
            />

            {/* Header */}
            <div className="flex flex-col items-center gap-1 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }} />
                    <span className="text-[10px] font-black tracking-widest uppercase italic" style={{ color: colors.primary }}>Talk-Ka-Noko Analysis</span>
                </div>
                <h1 className="text-xl font-black italic" style={{ color: colors.white }}>우리의 대화 리포트</h1>
            </div>

            {/* Main Score Area */}
            <div className="relative flex items-center justify-center py-4 z-10">
                <div className="absolute inset-0 rounded-full blur-2xl scale-150" style={{ backgroundColor: 'rgba(254, 229, 0, 0.05)' }} />
                <div className="flex flex-col items-center gap-0">
                    <span className="text-[10px] font-bold uppercase opacity-50" style={{ color: colors.muted }}>L-SCORE</span>
                    <span className="text-7xl font-black tracking-tighter drop-shadow-[0_0_15px_rgba(254,229,0,0.3)]" style={{ color: colors.primary }}>
                        {analysis.score}%
                    </span>
                </div>
            </div>

            {/* Keyword Card */}
            <div
                className="w-full p-5 rounded-2xl border backdrop-blur-sm z-10 flex flex-col items-center gap-2"
                style={{
                    backgroundColor: 'rgba(42, 42, 42, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.05)'
                }}
            >
                <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(254, 229, 0, 0.1)', border: '1px solid rgba(254, 229, 0, 0.2)' }}>
                    <Sparkles className="w-3 h-3" style={{ color: colors.primary }} />
                    <span className="text-[10px] font-bold italic uppercase" style={{ color: colors.primary }}>Keyword</span>
                </div>
                <h2 className="text-2xl font-black text-center tracking-tight" style={{ color: colors.white }}>"{analysis.keyword}"</h2>
                <p className="text-xs text-center line-clamp-2 px-2" style={{ color: colors.muted }}>
                    {analysis.summary}
                </p>
            </div>

            {/* Attachment Type Badge */}
            <div className="flex flex-col items-center gap-2 z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Type</span>
                <div className="px-4 py-2 rounded-xl" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                    <span className="text-xl font-black italic" style={{ color: colors.indigo400 }}>#{analysis.attachment_type}</span>
                </div>
            </div>

            {/* Footer / QR or Brand */}
            <div className="mt-4 flex flex-col items-center gap-1 opacity-60 z-10">
                <span className="text-[9px] font-medium uppercase" style={{ color: colors.muted }}>talk-ka-noko.vercel.app</span>
                <span className="text-[8px] italic" style={{ color: 'rgba(136, 136, 136, 0.5)' }}>AI-Powered Relationship Analytics</span>
            </div>

            {/* Watermark/Pattern - simplified for canvas */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] pointer-events-none">
                <span className="text-[100px] font-black whitespace-nowrap" style={{ color: 'rgba(255, 255, 255, 0.02)' }}>TALK KA NOKO</span>
            </div>
        </div>
    )
}
