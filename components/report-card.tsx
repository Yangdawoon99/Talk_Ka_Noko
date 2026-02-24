"use client"

import { Card } from "@/components/ui/card"
import { Lock } from "lucide-react"

interface ReportCardProps {
    title: React.ReactNode
    value: string | number
    description: string
    isPremium?: boolean
}

export function ReportCard({ title, value, description, isPremium = false }: ReportCardProps) {
    return (
        <Card className="relative overflow-hidden p-6 bg-secondary/30 border-border/50">
            <div className="flex flex-col gap-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {title}
                </h4>
                <div className={`relative ${isPremium ? "select-none" : ""}`}>
                    <p className={`text-2xl font-bold text-foreground transition-all duration-700 ${isPremium ? "blur-md opacity-30 px-2" : ""}`}>
                        {value}
                    </p>
                    {isPremium && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm">
                                <Lock className="w-3 h-3 text-primary" />
                                <span className="text-[10px] font-bold text-primary italic">PREMIUM</span>
                            </div>
                        </div>
                    )}
                </div>
                <p className={`text-sm text-muted-foreground leading-relaxed ${isPremium ? "blur-sm opacity-20" : ""}`}>
                    {description}
                </p>
            </div>

            {/* Subtle background glow */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        </Card>
    )
}
