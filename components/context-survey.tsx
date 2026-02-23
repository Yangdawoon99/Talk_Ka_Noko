"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Heart, Flame, Briefcase, Baby, HelpCircle } from "lucide-react"

interface ContextSurveyProps {
    onComplete: (context: any) => void
}

const RELATION_TYPES = [
    { id: "friend", label: "친구", icon: Users, color: "text-blue-400" },
    { id: "crush", label: "썸", icon: Flame, color: "text-orange-500" },
    { id: "couple", label: "연인", icon: Heart, color: "text-rose-500" },
    { id: "ex", label: "전 연인", icon: Baby, color: "text-gray-400" },
    { id: "business", label: "비즈니스", icon: Briefcase, color: "text-emerald-500" },
    { id: "other", label: "기타", icon: HelpCircle, color: "text-purple-400" },
]

export function ContextSurvey({ onComplete }: ContextSurveyProps) {
    const [step, setStep] = useState(1)
    const [surveyData, setSurveyData] = useState({
        relationType: "",
        duration: "",
        tone: "balanced"
    })

    const handleComplete = () => {
        onComplete(surveyData)
    }

    return (
        <div className="px-6 py-8 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-foreground">더 정교한 분석을 위해</h3>
                <p className="text-sm text-muted-foreground">두 사람의 관계를 알려주시면 AI 상담가가 더 깊이 있게 분석해 드립니다.</p>
            </div>

            <Card className="p-6 bg-secondary/20 border-border/50 flex flex-col gap-8">
                {step === 1 && (
                    <div className="flex flex-col gap-6">
                        <p className="text-sm font-semibold text-center">두 분은 어떤 관계인가요?</p>
                        <div className="grid grid-cols-2 gap-3">
                            {RELATION_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => {
                                        setSurveyData({ ...surveyData, relationType: type.label })
                                        setStep(2)
                                    }}
                                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${surveyData.relationType === type.label
                                            ? "border-primary bg-primary/10"
                                            : "border-border/30 bg-background/50 hover:border-border"
                                        }`}
                                >
                                    <type.icon className={`w-6 h-6 ${type.color}`} />
                                    <span className="text-xs font-bold">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-6">
                        <p className="text-sm font-semibold text-center">알고 지낸 지 얼마나 되셨나요?</p>
                        <div className="flex flex-col gap-2">
                            {["1개월 미만", "1~6개월", "6개월~1년", "1년 이상"].map((dur) => (
                                <button
                                    key={dur}
                                    onClick={() => {
                                        setSurveyData({ ...surveyData, duration: dur })
                                        setStep(3)
                                    }}
                                    className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${surveyData.duration === dur
                                            ? "border-primary bg-primary/10"
                                            : "border-border/30 bg-background/50 hover:border-border"
                                        }`}
                                >
                                    {dur}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setStep(1)} className="text-xs text-muted-foreground underline">이전 단계로</button>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col gap-6 text-center">
                        <div className="py-8 flex flex-col gap-4">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                                <Heart className="w-8 h-8 text-primary animate-pulse" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="font-bold">준비가 끝났습니다!</p>
                                <p className="text-xs text-muted-foreground">이제 전문 심리 상담가 페르소나로 분석을 시작합니다.</p>
                            </div>
                        </div>

                        <Button
                            onClick={handleComplete}
                            className="w-full bg-[#FEE500] text-[#3A1D1D] hover:bg-[#FEE500]/90 font-bold py-6 rounded-xl"
                        >
                            분석 결과 확인하기
                        </Button>
                        <button onClick={() => setStep(2)} className="text-xs text-muted-foreground underline">이전 단계로</button>
                    </div>
                )}
            </Card>
        </div>
    )
}
