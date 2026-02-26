"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import { CreditCard, Mail, Sparkles, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface PaymentModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function PaymentModal({ isOpen, onOpenChange, onSuccess }: PaymentModalProps) {
    const [email, setEmail] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [step, setStep] = useState<"info" | "pay">("info")

    const handleNextStep = () => {
        if (!email || !email.includes("@")) {
            toast.error("올바른 이메일 주소를 입력해주세요.")
            return
        }
        setStep("pay")
    }

    const PAYPAL_SANDBOX_ID = "ASH7xj5crHjeZK8nWfGM4vTuWUQ72gH-Wnq511PEcYg5o_6feyD77W3fnzfFSAAHUVYvpoVUuMouUcVP"
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || PAYPAL_SANDBOX_ID

    const initialOptions = {
        clientId: clientId,
        currency: "USD",
        intent: "capture",
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            onOpenChange(open)
            if (!open) {
                setStep("info")
            }
        }}>
            <DialogContent className="max-w-[95vw] sm:max-w-md rounded-3xl bg-[#1A1A1A] border-primary/20 text-white p-0 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary/50 via-primary to-primary/50 animate-pulse" />

                <div className="p-6 sm:p-8">
                    <DialogHeader className="text-left">
                        <DialogTitle className="text-2xl font-black flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-primary fill-primary" />
                            Premium Unlock
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground pt-2">
                            두 사람의 무의식 속 감정과 깊은 유대감을 <br />
                            AI가 정밀하게 분석하여 알려드립니다.
                        </DialogDescription>
                    </DialogHeader>

                    {step === "info" ? (
                        <div className="flex flex-col gap-6 mt-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-4">
                                <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    리포트 수령 이메일
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="love@example.com"
                                        className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 transition-all"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    * 결제 후 리포트가 이메일로도 자동 전송됩니다.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                                <h4 className="text-sm font-bold flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    포함된 분석 내용
                                </h4>
                                <ul className="text-xs space-y-2 text-muted-foreground">
                                    <li className="flex items-center gap-2">∙ 텍스트 무의식 애착 유형 분석</li>
                                    <li className="flex items-center gap-2">∙ 시간대별/상황별 감정 온도 변화</li>
                                    <li className="flex items-center gap-2">∙ 전문 AI 상담가의 맞춤형 조언</li>
                                </ul>
                            </div>

                            <Button
                                onClick={handleNextStep}
                                className="h-14 bg-primary text-primary-foreground font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all rounded-2xl shadow-xl shadow-primary/10"
                            >
                                9,900원 ($7.50) 결제하기
                            </Button>

                            <p className="text-[10px] text-center text-muted-foreground/60 px-4 leading-relaxed">
                                디지털 콘텐츠 특성상 분석이 진행된 후에는 환불이 불가합니다.<br />
                                결제 시 이에 동의하는 것으로 간주됩니다.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 mt-8 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground uppercase leading-tight">Order Summary</span>
                                    <span className="text-sm font-bold text-white">프리미엄 정밀 분석 리포트</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-lg font-black text-primary">$7.50</span>
                                    <span className="text-[9px] text-muted-foreground">약 9,900원</span>
                                </div>
                            </div>

                            <div className="min-h-[150px]">
                                <PayPalScriptProvider options={initialOptions}>
                                    <PayPalButtons
                                        style={{
                                            layout: "vertical",
                                            color: "gold",
                                            shape: "rect",
                                            label: "pay"
                                        }}
                                        createOrder={(data, actions) => {
                                            return actions.order.create({
                                                intent: "CAPTURE",
                                                purchase_units: [
                                                    {
                                                        amount: {
                                                            currency_code: "USD",
                                                            value: "7.50",
                                                        },
                                                        description: "프리미엄 정밀 분석 리포트 (Talk-Ka-Noko)",
                                                    },
                                                ],
                                            })
                                        }}
                                        onApprove={async (data, actions) => {
                                            if (actions.order) {
                                                const details = await actions.order.capture()
                                                console.log("Paypal Success:", details)
                                                toast.success("결제가 완료되었습니다!")
                                                onSuccess()
                                                onOpenChange(false)
                                            }
                                        }}
                                        onError={(err) => {
                                            console.error("Paypal Error:", err)
                                            toast.error("결제 중 오류가 발생했습니다.")
                                        }}
                                    />
                                </PayPalScriptProvider>
                            </div>

                            <button
                                onClick={() => setStep("info")}
                                className="text-xs text-muted-foreground hover:text-primary transition-colors text-center"
                            >
                                이메일 수정하기
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
