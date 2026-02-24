"use client"

import { Card } from "@/components/ui/card"
import { Sparkles, Heart, Zap, Bot, Cat } from "lucide-react"

interface AttachmentCardProps {
    type: string
}

const TYPE_CONFIG: Record<string, any> = {
    "평온한 갓생형": {
        icon: <Sparkles className="w-6 h-6 text-yellow-400" />,
        desc: "서로의 일상을 존중하면서도 필요할 때 곁을 지켜주는 아주 건강한 관계예요. 감정 소모가 적고 신뢰가 두텁습니다.",
        tag: "안정적 밸런스",
        color: "bg-yellow-400/20 text-yellow-400"
    },
    "심장벌렁 집착형": {
        icon: <Heart className="w-6 h-6 text-red-400 animate-bounce" />,
        desc: "답장 1분에 심장이 벌렁벌렁! 사랑이 넘치지만 때로는 연락 압박이 될 수 있어요. 조금만 여유를 가져볼까요?",
        tag: "열정폭발형",
        color: "bg-red-400/20 text-red-400"
    },
    "차가운 AI 로봇형": {
        icon: <Bot className="w-6 h-6 text-blue-400" />,
        desc: "읽씹이나 단답이 습관인가요? 감정 표현보다는 정보 전달에 충실한 타입입니다. 따뜻한 말 한마디가 필요해요.",
        tag: "극강의 효율충",
        color: "bg-blue-400/20 text-blue-400"
    },
    "금사빠 불도저형": {
        icon: <Zap className="w-6 h-6 text-orange-400" />,
        desc: "초반 불꽃이 너무 뜨거워요! 상대방이 당황하지 않게 속도 조절을 하는 연습이 관계 유지에 큰 도움이 됩니다.",
        tag: "직진본능형",
        color: "bg-orange-400/20 text-orange-400"
    },
    "내맘대로 고양이형": {
        icon: <Cat className="w-6 h-6 text-purple-400" />,
        desc: "다가갈까 하면 멀어지고, 가만히 있으면 다가오는 마성의 타입! 상대방이 지치지 않게 가끔은 명확한 시그널을 주세요.",
        tag: "예측불가 밀당고수",
        color: "bg-purple-400/20 text-purple-400"
    }
}

export function AttachmentCard({ type }: AttachmentCardProps) {
    const config = TYPE_CONFIG[type] || TYPE_CONFIG["평온한 갓생형"]

    return (
        <Card className="p-6 bg-secondary/30 border-primary/20 overflow-hidden relative group">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />

            <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-background/50 border border-white/5">
                            {config.icon}
                        </div>
                        <div className="flex flex-col font-bold">
                            <span className="text-[10px] text-muted-foreground uppercase">분석된 애착 유형</span>
                            <h4 className="text-lg text-foreground">{type}</h4>
                        </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.color}`}>
                        {config.tag}
                    </span>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "{config.desc}"
                </p>

                <div className="pt-2 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-primary">AI COUNSELOR'S OPINION</span>
                    <div className="flex-1 h-[1px] bg-primary/20" />
                </div>
            </div>
        </Card>
    )
}
