"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { RelationshipRadar } from "@/components/relationship-radar"
import { Brain, Heart, MessageCircle, Sparkles, TrendingUp, Zap } from "lucide-react"

interface PremiumDetailedReportProps {
    analysis: any
}

export function PremiumDetailedReport({ analysis }: PremiumDetailedReportProps) {
    if (!analysis) return null

    const radarData = [
        { subject: '대화량', A: analysis.radar_data?.volume || 0, fullMark: 100 },
        { subject: '답장속도', A: analysis.radar_data?.speed || 0, fullMark: 100 },
        { subject: '공감도', A: analysis.radar_data?.empathy || 0, fullMark: 100 },
        { subject: '적극성', A: analysis.radar_data?.proactivity || 0, fullMark: 100 },
        { subject: '일관성', A: analysis.radar_data?.consistency || 0, fullMark: 100 },
    ]

    const replySpeedData = Object.entries(analysis.stats?.senders || {}).map(([name, s]: any) => ({
        name,
        speed: s.replyCount > 0 ? Math.round(s.totalReplyTime / s.replyCount) : 0
    }))

    return (
        <div className="space-y-8 pb-12" id="premium-report-area">
            {/* 1. Psychological Insight Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-indigo-500/20">
                            <Brain className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-bold text-indigo-100 italic">Psychological Analysis</h3>
                    </div>
                    <p className="text-sm text-indigo-100/80 leading-relaxed">
                        {analysis.psychological_insight || "대화 속의 숨겨진 심리적 기제를 분석 중입니다."}
                    </p>
                </Card>
            </motion.div>

            {/* 2. MZ Attachment Type */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 gap-4"
            >
                <Card className="p-6 bg-[#FEE500]/5 border-[#FEE500]/20 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-5 h-5 text-[#FEE500]" />
                        <span className="text-[10px] font-black text-[#FEE500] uppercase tracking-[0.2em]">Relationship Dynamics Persona</span>
                    </div>
                    <h2 className="text-3xl font-black text-[#FEE500] mb-2">{analysis.attachment_type}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-[#FEE500]/30 pl-3">
                        {analysis.attachment_description}
                    </p>
                    <div className="absolute -right-8 -bottom-8 opacity-10">
                        <Heart className="w-32 h-32 fill-[#FEE500]" />
                    </div>
                </Card>
            </motion.div>

            {/* 2.5. Relationship Radar Chart */}
            {analysis.radar_data && (
                <div className="space-y-4">
                    <RelationshipRadar data={analysis.radar_data} />
                </div>
            )}

            {/* 3. Word Cloud Visual */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">주요 대화 키워드</h3>
                </div>
                <div className="flex flex-wrap gap-2 justify-center p-6 bg-secondary/20 rounded-2xl border border-border/40">
                    {analysis.wordcloud?.map((item: any, idx: number) => (
                        <motion.span
                            key={idx}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            style={{
                                fontSize: `${Math.max(12, Math.min(32, 10 + item.value * 1.5))}px`,
                                fontWeight: item.value > 5 ? 800 : 500
                            }}
                            className={`${idx % 3 === 0 ? 'text-primary' : 'text-foreground/70'} hover:text-primary transition-colors cursor-default`}
                        >
                            {item.text}
                        </motion.span>
                    ))}
                </div>
            </div>

            {/* 4. Reply Speed Comparison */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-400" />
                        <h3 className="text-sm font-bold text-foreground">누가 더 빨리 읽을까? (평균 답장 시간)</h3>
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase">Unit: Minutes</span>
                </div>
                <div className="h-48 w-full bg-secondary/20 rounded-2xl p-4 border border-border/40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={replySpeedData} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: '#888' }} />
                            <RechartsTooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', fontSize: '10px' }}
                            />
                            <Bar dataKey="speed" radius={[0, 4, 4, 0]} barSize={24}>
                                {replySpeedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#FEE500' : '#4f46e5'} opacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 5. Compatibility Tips */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-foreground">미래를 위한 솔루션</h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {analysis.compatibility_tips?.map((tip: string, idx: number) => (
                        <Card key={idx} className="p-4 bg-emerald-500/5 border-emerald-500/10 flex gap-3 items-start">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-bold">
                                {idx + 1}
                            </span>
                            <p className="text-xs text-emerald-100/80 leading-relaxed">{tip}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
