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

    // Strictly using HEX/RGB for html2canvas compatibility
    const colors = {
        primary: "#FEE500",
        background: isPremium ? "#050505" : "#0a0a0a",
        premiumAccent: "#EAB308",
        freeAccent: "#6366f1",
        muted: "#888888",
        white: "#ffffff",
        border: isPremium ? "rgba(234, 179, 8, 0.4)" : "rgba(254, 229, 0, 0.2)",
        cardBg: isPremium ? "rgba(255, 255, 255, 0.03)" : "rgba(42, 42, 42, 0.4)",
        cardBorder: isPremium ? "rgba(234, 179, 8, 0.2)" : "rgba(255, 255, 255, 0.05)",
        indigoBg: "rgba(99, 102, 241, 0.1)",
        indigoBorder: "rgba(99, 102, 241, 0.3)"
    }

    return (
        <div
            id="report-capture-area"
            style={{
                width: '400px',
                padding: '40px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '32px',
                fontFamily: 'Inter, system-ui, sans-serif',
                backgroundColor: colors.background,
                border: isPremium ? `3px solid ${colors.premiumAccent}` : `2px solid ${colors.primary}`,
                borderRadius: '0px' // Canvas doesn't care about container radius usually, but let's be safe
            }}
        >
            {/* Premium Glossy Effect */}
            {isPremium && (
                <div
                    style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        transform: 'rotate(45deg)',
                        pointerEvents: 'none',
                        opacity: 0.1,
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%)'
                    }}
                />
            )}

            {/* Background elements */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '192px',
                    height: '192px',
                    borderRadius: '9999px',
                    filter: 'blur(80px)',
                    backgroundColor: isPremium ? 'rgba(234, 179, 8, 0.15)' : 'rgba(254, 229, 0, 0.1)',
                    zIndex: 0
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '192px',
                    height: '192px',
                    borderRadius: '9999px',
                    filter: 'blur(80px)',
                    backgroundColor: isPremium ? 'rgba(234, 179, 8, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                    zIndex: 0
                }}
            />

            {/* Header / Brand */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 10, width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isPremium ? colors.premiumAccent : colors.primary }} />
                        <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', fontStyle: 'italic', color: isPremium ? colors.premiumAccent : colors.white }}>Talk-Ka-Noko</span>
                    </div>
                    {isPremium ? (
                        <div style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(234, 179, 8, 0.2)', border: '1px solid rgba(234, 179, 8, 0.3)', fontSize: '8px', fontWeight: 900, color: '#EAB308', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                            PREMIUM ANALYTICS
                        </div>
                    ) : (
                        <span style={{ fontSize: '8px', fontWeight: 'bold', color: colors.muted, opacity: 0.5, fontStyle: 'italic' }}>AI-POWERED</span>
                    )}
                </div>
                <div style={{ height: '1px', width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', marginTop: '4px' }} />
            </div>

            {/* Main Result Area */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', zIndex: 10, width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.4, marginBottom: '4px', color: colors.muted }}>L-SCORE REPORT</span>
                    <div style={{ position: 'relative' }}>
                        <span style={{
                            fontSize: '80px',
                            fontWeight: 900,
                            letterSpacing: '-0.05em',
                            color: isPremium ? colors.premiumAccent : colors.primary,
                            // Text shadow is supported by most browsers in canvas
                            textShadow: isPremium ? '0 0 40px rgba(234, 179, 8, 0.3)' : '0 0 30px rgba(254, 229, 0, 0.2)'
                        }}>
                            {analysis.score}%
                        </span>
                    </div>
                </div>

                <div
                    style={{
                        width: '100%',
                        padding: '24px',
                        borderRadius: '28px',
                        border: `1px solid ${colors.cardBorder}`,
                        backgroundColor: colors.cardBg,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <div style={{ padding: '4px 12px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(254, 229, 0, 0.1)', border: '1px solid rgba(254, 229, 0, 0.15)' }}>
                        <Sparkles style={{ width: '12px', height: '12px', fill: colors.primary, color: colors.primary }} />
                        <span style={{ fontSize: '9px', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.primary }}>AI RELATIONSHIP KEYWORD</span>
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, textAlign: 'center', letterSpacing: '-0.02em', lineHeight: '1.2', color: colors.white }}>
                        "{analysis.keyword}"
                    </h2>
                    <p style={{ fontSize: '11px', textAlign: 'center', padding: '0 16px', lineHeight: '1.6', color: colors.muted, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {analysis.summary}
                    </p>
                </div>
            </div>

            {/* Attachment Type - DIFFERENTIATED */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 10, width: '100%', marginTop: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(255, 255, 255, 0.3)' }}>Attachment Style</span>
                    {isPremium ? (
                        <div style={{ padding: '12px 24px', borderRadius: '16px', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                                <span style={{ fontSize: '9px', opacity: 0.6, marginBottom: '4px', color: colors.white }}>고유형 페르소나</span>
                                <span style={{ fontSize: '24px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.05em', color: '#a5b4fc' }}>#{analysis.attachment_type}</span>
                            </div>
                        </div>
                    ) : (
                        <div style={{ position: 'relative' }}>
                            <div style={{ padding: '12px 24px', borderRadius: '16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', filter: 'blur(4px)', opacity: 0.4 }}>
                                <span style={{ fontSize: '20px', fontWeight: 900, fontStyle: 'italic', padding: '0 16px', color: colors.white }}>#비공개_애착유형</span>
                            </div>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ padding: '4px 12px', borderRadius: '9999px', backgroundColor: colors.primary, color: '#3A1D1D', fontSize: '9px', fontWeight: 900, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>프리미엄 전용 데이터</span>
                            </div>
                        </div>
                    )}
                </div>

                {isPremium && (
                    <div style={{ padding: '12px 20px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.05)', width: '100%' }}>
                        <p style={{ fontSize: '10px', textAlign: 'center', lineHeight: '1.6', color: colors.muted }}>
                            {analysis.attachment_description?.slice(0, 100)}...
                        </p>
                    </div>
                )}
            </div>

            {/* CTA/Footer */}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.4)' }}>talk-ka-noko.vercel.app</span>
                    <span style={{ fontSize: '8px', fontWeight: 500, opacity: 0.3, color: colors.white, textTransform: 'uppercase', letterSpacing: '0.2em' }}>전문 AI 심리 데이터 분석 플랫폼</span>
                </div>
                {!isPremium && (
                    <div style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'rgba(254, 229, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: colors.primary, fontStyle: 'italic' }}>!</span>
                        </div>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.5)' }}>친구에게 링크를 공유하고 당신의 점수를 확인하세요!</span>
                    </div>
                )}
            </div>

            {/* Distinctive Watermark */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-40deg)', pointerEvents: 'none', zIndex: 0 }}>
                <span style={{ fontSize: '120px', fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap', opacity: 0.02, color: colors.white }}>
                    {isPremium ? 'PREMIUM ACCESS' : 'TALK KA NOKO'}
                </span>
            </div>
        </div>
    )
}
