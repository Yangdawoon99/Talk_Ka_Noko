"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Download, Check, Sparkles, Instagram, Copy, MessageCircle, ExternalLink, ImageIcon, Facebook, Twitter, Mail } from "lucide-react"
import html2canvas from "html2canvas"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface ShareButtonProps {
    analysis: any
}

// Custom Kakao Icon (since lucide doesn't have it)
const KakaoIcon = () => (
    <div className="w-10 h-10 bg-[#FEE500] rounded-2xl flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3C7.029 3 3 6.134 3 10c0 2.49 1.66 4.67 4.14 5.91-.18.66-.65 2.38-.74 2.76-.11.44.17.43.35.31.14-.09 2.27-1.54 3.19-2.17.34.05.7.09 1.06.09 4.971 0 9-3.134 9-7s-4.029-7-9-7z" fill="#3A1D1D" />
        </svg>
    </div>
)

const BlogIcon = () => (
    <div className="w-10 h-10 bg-[#03C75A] rounded-2xl flex items-center justify-center">
        <span className="text-white font-black text-xl">b</span>
    </div>
)

export function ShareButton({ analysis }: ShareButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const shareUrl = "https://talk-ka-noko.vercel.app/"

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(shareUrl)
        toast.success("URL이 복사되었습니다!")
    }

    const handleCapture = async (type: 'download' | 'share') => {
        const element = document.getElementById("report-capture-area")
        if (!element) {
            toast.error("캡처할 영역을 찾지 못했습니다.")
            return
        }

        try {
            setIsGenerating(true)
            const canvas = await html2canvas(element, {
                backgroundColor: "#0a0a0a",
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
                    const blob = await (await fetch(image)).blob()
                    try {
                        await navigator.clipboard.write([
                            new ClipboardItem({ "image/png": blob })
                        ])
                        toast.success("이미지가 클립보드에 복사되었습니다!")
                    } catch (err) {
                        toast.error("이미지를 저장하여 공유해 주세요.")
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

    const shareOptions = [
        { label: "블로그", icon: <BlogIcon />, onClick: () => window.open(`https://blog.naver.com/openapi/share?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent("톡까놓고 관계분석 리포트")}`, '_blank') },
        {
            label: "인스타 DM", icon: <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white"><Instagram className="w-6 h-6" /></div>, onClick: () => {
                if (typeof navigator.share !== 'undefined') {
                    navigator.share({ url: shareUrl, title: "톡까놓고", text: "우리 관계, 톡까놓고 분석해봤어!" })
                } else {
                    handleCopyUrl()
                    toast.info("링크가 복사되었습니다! 인스타그램 DM에 붙여넣어 주세요.")
                }
            }
        },
        { label: "이미지 저장", icon: <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white"><ImageIcon className="w-6 h-6" /></div>, onClick: () => handleCapture('download') },
        {
            label: "카카오톡", icon: <KakaoIcon />, onClick: () => {
                if (typeof navigator.share !== 'undefined') {
                    navigator.share({ url: shareUrl, title: "톡까놓고", text: "우리 관계, 톡까놓고 분석해봤어!" })
                } else {
                    handleCopyUrl()
                    toast.success("링크가 복사되었습니다! 카카오톡 친구에게 전달해 주세요.")
                }
            }
        },
        { label: "페이스북", icon: <div className="w-10 h-10 bg-[#1877F2] rounded-2xl flex items-center justify-center text-white"><Facebook className="w-6 h-6" /></div>, onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank') },
        { label: "X (트위터)", icon: <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white"><Twitter className="w-6 h-6" /></div>, onClick: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("우리 관계 톡까놓고 분석해봤어!")}&url=${encodeURIComponent(shareUrl)}`, '_blank') },
        { label: "이메일", icon: <div className="w-10 h-10 bg-gray-500 rounded-2xl flex items-center justify-center text-white"><Mail className="w-6 h-6" /></div>, onClick: () => window.open(`mailto:?subject=${encodeURIComponent("톡까놓고 분석 결과")}&body=${encodeURIComponent(shareUrl)}`) },
        {
            label: "기타", icon: <div className="w-10 h-10 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-600"><ExternalLink className="w-6 h-6" /></div>, onClick: () => {
                if (typeof navigator.share !== 'undefined') {
                    navigator.share({ url: shareUrl })
                } else {
                    handleCopyUrl()
                }
            }
        },
    ]

    return (
        <div className="flex flex-col gap-3 px-4">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                    <Button
                        className="w-full h-14 rounded-2xl bg-[#FEE500] text-[#3A1D1D] font-black shadow-lg shadow-yellow-500/10 hover:bg-[#FEE500]/90 transition-all text-base flex items-center justify-center gap-2"
                    >
                        <Share2 className="w-5 h-5" />
                        분석 결과 공유하기
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[360px] rounded-[32px] p-8 bg-white border-none gap-6 sm:rounded-[32px]">
                    <DialogHeader className="p-0">
                        <DialogTitle className="text-center text-xl font-bold text-gray-900 border-b pb-4">공유하기</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-4 gap-y-6 gap-x-2 py-2">
                        {shareOptions.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    opt.onClick()
                                    if (opt.label !== "스토리" && opt.label !== "이미지 저장") setIsModalOpen(false)
                                }}
                                className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
                            >
                                <div className="shadow-sm group-hover:shadow-md transition-shadow">
                                    {opt.icon}
                                </div>
                                <span className="text-[10px] font-medium text-gray-600">{opt.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 p-1.5 bg-gray-50 border border-gray-100 rounded-xl mt-2">
                        <div className="flex-1 truncate px-2 text-[11px] text-gray-400 font-medium">
                            {shareUrl}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyUrl}
                            className="bg-white border border-gray-200 text-gray-700 text-[10px] font-bold h-8 px-3 rounded-lg hover:bg-gray-50"
                        >
                            URL 복사
                        </Button>
                    </div>

                    {isGenerating && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-center items-center justify-center rounded-[32px] z-50">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                <span className="text-xs font-bold text-gray-500">이미지 생성 중...</span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <p className="text-[10px] text-center text-muted-foreground">
                결과를 공유하여 친구들과 점수를 비교해보세요!
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
