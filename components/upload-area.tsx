"use client"

import { useState, useCallback } from "react"
import { Upload, FileText, X, HelpCircle, ShieldCheck, Smartphone, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface UploadAreaProps {
  onAnalysisStart: () => void
  onAnalysisComplete: (data: any, aiAnalysis: any, aiError: string | null) => void
}

export function UploadArea({ onAnalysisStart, onAnalysisComplete }: UploadAreaProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const validateAndSetFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".txt")) {
      alert("대화 내보내기로 생성된 .txt 파일만 가능합니다.")
      return
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      alert("파일 용량이 너무 큽니다 (최대 10MB). 텍스트 전용으로 내보내주세요!")
      return
    }
    setFile(selectedFile)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) validateAndSetFile(droppedFile)
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) validateAndSetFile(selected)
  }, [])

  const handleRemoveFile = useCallback(() => {
    setFile(null)
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!file) return
    setIsUploading(true)
    onAnalysisStart()
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      })
      if (!response.ok) throw new Error("분석에 실패했습니다. 파일 형식을 확인해주세요.")
      const result = await response.json()
      onAnalysisComplete(result.data, result.analysis, result.aiError)
    } catch (error) {
      console.error("Parse Error:", error)
      onAnalysisComplete(null, null, (error as any).message || "분석 실패")
    } finally {
      setIsUploading(false)
    }
  }, [file, onAnalysisStart, onAnalysisComplete])

  return (
    <section className="px-6 py-4 space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-[#03C75A]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold">서버에 저장되지 않는 암호화 분석</span>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-[11px] text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
              <HelpCircle className="w-3 h-3" />
              내보내는 법
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] sm:max-w-[400px] rounded-[32px] bg-white p-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-center mb-6">대화 파일 내보내는 법</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex gap-4 p-4 rounded-2xl bg-secondary/30">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold">모바일 (iOS/Android)</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    채팅방 설정 {">"} 대화 내용 내보내기 {">"} <span className="text-foreground font-semibold">텍스트만 보내기</span> 클릭 후 저장된 파일을 업로드하세요.
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-dashed border-primary/30 flex items-center gap-3">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  * 사진/영상 제외 '텍스트만 내보내기'를 사용해야 빠르고 정확하게 분석됩니다.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!file ? (
        <label
          htmlFor="file-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`group flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed rounded-[32px] cursor-pointer transition-all duration-300 ${isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-secondary/20 hover:border-primary/40 hover:bg-secondary/40"
            }`}
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-primary/10 group-hover:scale-110 transition-transform duration-300">
            <Upload className="w-7 h-7 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="text-sm font-bold text-foreground">
              카카오톡 대화 내용 업로드
            </span>
            <span className="text-[11px] text-muted-foreground px-3 py-1 bg-white/50 rounded-full">
              .txt 파일 전용 (최대 10MB)
            </span>
          </div>
          <input
            id="file-upload"
            type="file"
            accept=".txt"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3 p-5 rounded-[24px] bg-secondary/50 border border-border/50">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/20 shrink-0">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-sm font-bold text-foreground truncate">
                {file.name}
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                {(file.size / 1024).toFixed(1)} KB • READY TO ANALYZE
              </span>
            </div>
            <button
              onClick={handleRemoveFile}
              disabled={isUploading}
              className="ml-auto flex items-center justify-center w-9 h-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all active:scale-90 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 h-16 rounded-[24px] bg-[#FEE500] text-[#191919] font-[900] text-base shadow-xl shadow-yellow-500/10 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                분석 중...
              </>
            ) : "분석 시작하기"}
          </button>
        </div>
      )}

      <p className="text-[10px] text-center text-muted-foreground leading-relaxed px-4 opacity-60">
        업로드된 파일은 AI 분석 즉시 메모리에서 삭제되며,<br />
        그 어떤 데이터도 서버나 DB에 저장하지 않습니다.
      </p>
    </section>
  )
}
