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
    onShareSuccess?: () => void
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

export function ShareButton({ analysis, onShareSuccess }: ShareButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const shareUrl = "https://talk-ka-noko.vercel.app/"

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(shareUrl)
        toast.success("URL이 복사되었습니다!")
        if (onShareSuccess) onShareSuccess()
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
                if (typeof navigator.share !== 'undefined') {
                    const blob = await (await fetch(image)).blob()
                    const file = new File([blob], "analysis.png", { type: "image/png" })
                    await navigator.share({
                        files: [file],
                        title: "톡까놓고 분석 결과",
                        text: "우리의 분석 리포트야! 보고 너의 생각도 알려줘. #톡까놓고 #관계분석",
                        url: shareUrl
                    })
                    if (onShareSuccess) onShareSuccess()
                } else {
                    handleCopyUrl()
                    toast.info("현재 브라우저는 직접 공유를 지원하지 않아 링크를 복사했습니다! 앱에 붙여넣어 전달해 주세요.")
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
                    handleCapture('share')
                } else {
                    handleCopyUrl()
                    toast.info("인스타그램 DM에 붙여넣을 수 있도록 링크를 복사했습니다!")
                }
            }
        },
        { label: "이미지 저장", icon: <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white"><ImageIcon className="w-6 h-6" /></div>, onClick: () => handleCapture('download') },
        {
            label: "카카오톡", icon: <KakaoIcon />, onClick: () => {
                if (typeof navigator.share !== 'undefined') {
                    handleCapture('share')
                } else {
                    handleCopyUrl()
                    toast.info("카카오톡 친구에게 전달할 수 있도록 링크를 복사했습니다!")
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
export function SharedCaptureCard({ analysis, isPremium = false }: { analysis: any, isPremium?: boolean }) {
    if (!analysis) return null

    // Explicit colors for html2canvas compatibility (Hex/RGB only)
    const colors = {
        primary: isPremium ? "#FEE500" : "#FEE500", // Keep primary gold, but use it differently
        background: isPremium ? "#050505" : "#0a0a0a",
        premiumAccent: "#EAB308", // Golden
        freeAccent: "#6366f1", // Indigo
        muted: "#888888",
        white: "#ffffff"
    }

    return (
        <div
            id="report-capture-area"
            className="w-[400px] p-10 relative overflow-hidden flex flex-col items-center gap-8"
            style={{
                fontFamily: 'Inter, sans-serif',
                backgroundColor: colors.background,
                border: isPremium
                    ? `3px solid rgba(234, 179, 8, 0.4)`
                    : `2px solid rgba(254, 229, 0, 0.2)`
            }}
        >
            {/* Premium Glossy Effect */}
            {isPremium && (
                <div
                    className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] rotate-45 pointer-events-none opacity-10"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%)'
                    }}
                />
            )}

            {/* Background elements */}
            <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px]"
                style={{ backgroundColor: isPremium ? 'rgba(234, 179, 8, 0.15)' : 'rgba(254, 229, 0, 0.1)' }}
            />
            <div
                className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-[80px]"
                style={{ backgroundColor: isPremium ? 'rgba(234, 179, 8, 0.1)' : 'rgba(99, 102, 241, 0.1)' }}
            />

            {/* Header / Brand */}
            <div className="flex flex-col items-center gap-2 z-10 w-full">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isPremium ? colors.premiumAccent : colors.primary }} />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase italic" style={{ color: isPremium ? colors.premiumAccent : colors.white }}>Talk-Ka-Noko</span>
                    </div>
                    {isPremium ? (
                        <div className="px-2 py-0.5 rounded-md bg-yellow-500/20 border border-yellow-500/30 text-[8px] font-black text-yellow-500 uppercase tracking-tighter">
                            PREMIUM ANALYTICS
                        </div>
                    ) : (
                        <span className="text-[8px] font-bold text-muted-foreground opacity-50 italic">AI-POWERED</span>
                    )}
                </div>
                <div className="h-px w-full bg-white/5 mt-1" />
            </div>

            {/* Main Result Area */}
            <div className="flex flex-col items-center gap-6 z-10 w-full animate-in fade-in duration-1000">
                <div className="flex flex-col items-center gap-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1" style={{ color: colors.muted }}>L-SCORE REPORT</span>
                    <div className="relative">
                        <span className="text-8xl font-black tracking-tighter" style={{
                            color: isPremium ? colors.premiumAccent : colors.primary,
                            textShadow: isPremium ? '0 0 40px rgba(234, 179, 8, 0.3)' : '0 0 30px rgba(254, 229, 0, 0.2)'
                        }}>
                            {analysis.score}%
                        </span>
                    </div>
                </div>

                <div
                    className="w-full p-6 rounded-[28px] border backdrop-blur-md flex flex-col items-center gap-3"
                    style={{
                        backgroundColor: isPremium ? 'rgba(255, 255, 255, 0.03)' : 'rgba(42, 42, 42, 0.4)',
                        borderColor: isPremium ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        boxShadow: isPremium ? '0 20px 40px rgba(0,0,0,0.4)' : 'none'
                    }}
                >
                    <div className="px-3 py-1 rounded-full flex items-center gap-1.5" style={{ backgroundColor: 'rgba(254, 229, 0, 0.1)', border: '1px solid rgba(254, 229, 0, 0.15)' }}>
                        <Sparkles className="w-3 h-3" style={{ color: colors.primary }} />
                        <span className="text-[9px] font-black italic uppercase tracking-wider" style={{ color: colors.primary }}>AI RELATIONSHIP KEYWORD</span>
                    </div>
                    <h2 className="text-2xl font-black text-center tracking-tight leading-tight" style={{ color: colors.white }}>
                        "{analysis.keyword}"
                    </h2>
                    <p className="text-[11px] text-center px-4 leading-relaxed line-clamp-3" style={{ color: colors.muted }}>
                        {analysis.summary}
                    </p>
                </div>
            </div>

            {/* Attachment Type - DIFFERENTIATED */}
            <div className="flex flex-col items-center gap-4 z-10 w-full mt-2">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>Attachment Style</span>
                    {isPremium ? (
                        <div className="px-6 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-x font-black flex flex-col items-center leading-none">
                                <span className="text-[9px] opacity-60 mb-1">고유형 페르소나</span>
                                <span className="text-2xl italic tracking-tighter" style={{ color: "#a5b4fc" }}>#{analysis.attachment_type}</span>
                            </span>
                        </div>
                    ) : (
                        <div className="relative group">
                            <div className="px-6 py-3 rounded-2xl bg-white/5 border border-dashed border-white/20 blur-[4px] select-none opacity-40">
                                <span className="text-xl font-black italic px-4">#비공개_애착유형</span>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="px-3 py-1 rounded-full bg-primary text-[#3A1D1D] text-[9px] font-black shadow-lg">프리미엄 전용 데이터</span>
                            </div>
                        </div>
                    )}
                </div>

                {isPremium && (
                    <div className="px-5 py-3 rounded-xl bg-white/5 border border-white/5 w-full">
                        <p className="text-[10px] text-center leading-relaxed" style={{ color: colors.muted }}>
                            {analysis.attachment_description?.slice(0, 100)}...
                        </p>
                    </div>
                )}
            </div>

            {/* CTA/Footer */}
            <div className="mt-4 flex flex-col items-center gap-3 z-10">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold tracking-tight text-white/40 italic">talk-ka-noko.vercel.app</span>
                    <span className="text-[8px] font-medium opacity-30 text-white uppercase tracking-widest">전문 AI 심리 데이터 분석 플랫폼</span>
                </div>
                {!isPremium && (
                    <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 opacity-60">
                        <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-primary italic">!</span>
                        </div>
                        <span className="text-[9px] font-bold text-white/50">친구에게 링크를 공유하고 당신의 점수를 확인하세요!</span>
                    </div>
                )}
            </div>

            {/* Distinctive Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-40deg] pointer-events-none z-0">
                <span className="text-[120px] font-black uppercase whitespace-nowrap opacity-[0.02]" style={{ color: colors.white }}>
                    {isPremium ? 'PREMIUM ACCESS' : 'TALK KA NOKO'}
                </span>
            </div>
        </div>
    )
}
