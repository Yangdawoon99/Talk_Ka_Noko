"use client"

interface RelationshipRadarProps {
    data: {
        volume: number
        speed: number
        empathy: number
        proactivity: number
        consistency: number
    }
}

export function RelationshipRadar({ data }: RelationshipRadarProps) {
    const size = 200
    const center = size / 2
    const radius = size * 0.4

    const labels = [
        { key: 'volume', label: '대화량' },
        { key: 'speed', label: '답장속도' },
        { key: 'empathy', label: '공감도' },
        { key: 'proactivity', label: '적극성' },
        { key: 'consistency', label: '일관성' },
    ]

    const points = labels.map((item, i) => {
        const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2
        const val = data[item.key as keyof typeof data] || 0
        const pointRadius = (radius * val) / 100
        return {
            x: center + pointRadius * Math.cos(angle),
            y: center + pointRadius * Math.sin(angle),
            labelX: center + (radius + 20) * Math.cos(angle),
            labelY: center + (radius + 20) * Math.sin(angle),
            text: item.label
        }
    })

    const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ')

    return (
        <div className="flex flex-col items-center gap-4 py-4 bg-secondary/20 rounded-2xl border border-white/5">
            <h4 className="text-xs font-bold text-primary flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                관계 밸런스 데이터
            </h4>

            <svg width={size + 60} height={size + 40} viewBox={`0 0 ${size + 60} ${size + 40}`} className="overflow-visible">
                {/* Grid Circles */}
                {[20, 40, 60, 80, 100].map(v => (
                    <circle
                        key={v}
                        cx={center + 30}
                        cy={center + 20}
                        r={(radius * v) / 100}
                        fill="none"
                        stroke="white"
                        strokeOpacity="0.05"
                    />
                ))}

                {/* Axis Lines */}
                {labels.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2
                    return (
                        <line
                            key={i}
                            x1={center + 30}
                            y1={center + 20}
                            x2={center + 30 + radius * Math.cos(angle)}
                            y2={center + 20 + radius * Math.sin(angle)}
                            stroke="white"
                            strokeOpacity="0.1"
                        />
                    )
                })}

                {/* Data Polygon */}
                <polygon
                    points={points.map(p => `${p.x + 30},${p.y + 20}`).join(' ')}
                    fill="rgba(254, 229, 0, 0.3)"
                    stroke="#FEE500"
                    strokeWidth="2"
                />

                {/* Labels */}
                {points.map((p, i) => (
                    <text
                        key={i}
                        x={p.labelX + 30}
                        y={p.labelY + 20}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        className="text-[10px] font-bold fill-muted-foreground"
                    >
                        {p.text}
                    </text>
                ))}
            </svg>

            <div className="px-6 text-[10px] text-muted-foreground text-center leading-relaxed">
                * 두 사람의 실제 대화 빈도와 반응 속도 등 24가지 지표를 분석한 결과입니다.
            </div>
        </div>
    )
}
