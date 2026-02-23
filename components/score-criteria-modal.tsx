"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

interface ScoreCriteriaModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

const CRITERIA = [
    { range: "0~20%", label: "비즈니스 & 격식", desc: "공적인 관계이거나 서로 조심스러운 상태입니다. 매너는 좋지만 개인적인 감정 교류는 드문 단계입니다." },
    { range: "21~40%", label: "지인 & 평범한 사이", desc: "가끔 연락을 주고받는 사이입니다. 특별한 호감보다는 일상적인 안부나 정보 공유가 주를 이룹니다." },
    { range: "41~60%", label: "친밀한 호감", desc: "서로에게 편해진 단계입니다. 웃음 코드가 맞고 사적인 이야기를 조금씩 나누기 시작한 긍정적인 신호입니다." },
    { range: "61~80%", label: "설레는 썸 & 시작", desc: "대화의 온도와 속도가 매우 높습니다. 서로에 대한 궁금증이 폭발하고 있으며 곧 연인으로 발전할 가능성이 큽니다." },
    { range: "81~100%", label: "깊은 사랑 & 신뢰", desc: "완벽한 유대감을 형성한 상태입니다. 밤낮없이 일상을 공유하며 서로가 삶의 큰 비중을 차지하고 있습니다." },
]

export function ScoreCriteriaModal({ isOpen, onOpenChange }: ScoreCriteriaModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl bg-[#1A1A1A] border-border/50 text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <span className="text-primary">L-Score</span> 산출 기준
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground pt-1">
                        AI 상담가가 분석하는 애정 지수는 다음 기준을 바탕으로 객관적으로 산출됩니다.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 mt-4">
                    {CRITERIA.map((item) => (
                        <div key={item.range} className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-primary">{item.range}</span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                                    {item.label}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-4 p-3 rounded-xl bg-secondary/30 text-[10px] text-muted-foreground leading-tight">
                    * 대화의 빈도, 답장 속도, 이모티콘 사용 패턴, 밤늦은 대화 비중 등 20가지 이상의 데이터 포인트를 종합적으로 분석합니다.
                </div>
            </DialogContent>
        </Dialog>
    )
}
