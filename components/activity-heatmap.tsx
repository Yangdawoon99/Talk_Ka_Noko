"use client"

import { Card } from "@/components/ui/card"

interface ActivityHeatmapProps {
    hourlyData: number[]
}

export function ActivityHeatmap({ hourlyData }: ActivityHeatmapProps) {
    if (!hourlyData || hourlyData.length === 0) return null

    const maxActivity = Math.max(...hourlyData)

    return (
        <Card className="p-6 bg-secondary/30 border-border/50">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        시간대별 대화 활동성
                    </h4>
                    <p className="text-xs text-muted-foreground">우리만의 소통 온도가 가장 뜨거운 시간은 언제일까요?</p>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-2">
                    {hourlyData.map((count, hour) => {
                        const intensity = maxActivity > 0 ? (count / maxActivity) : 0
                        return (
                            <div key={hour} className="flex flex-col items-center gap-1">
                                <div
                                    className="w-full aspect-square rounded-sm transition-all duration-500 hover:scale-110"
                                    style={{
                                        backgroundColor: `rgba(254, 229, 0, ${0.1 + intensity * 0.9})`,
                                        boxShadow: intensity > 0.8 ? '0 0 10px rgba(254, 229, 0, 0.3)' : 'none'
                                    }}
                                    title={`${hour}시: ${count}개`}
                                />
                                <span className="text-[8px] font-medium text-muted-foreground/50">
                                    {hour}
                                </span>
                            </div>
                        )
                    })}
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">낮음</span>
                        <div className="flex gap-0.5">
                            {[0.2, 0.5, 0.8, 1].map(v => (
                                <div key={v} className="w-2 h-2 rounded-xs" style={{ backgroundColor: `rgba(254, 229, 0, ${v})` }} />
                            ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">높음</span>
                    </div>
                    <p className="text-[10px] font-bold text-primary italic">PEAK TIME ANALYSIS</p>
                </div>
            </div>
        </Card>
    )
}
