"use client"

import { useState, useCallback } from "react"
import { Upload, FileText, X } from "lucide-react"

interface UploadAreaProps {
  onAnalysisStart: () => void
  onAnalysisComplete: (data: any, aiAnalysis: any, aiError: string | null) => void
}

export function UploadArea({ onAnalysisStart, onAnalysisComplete }: UploadAreaProps) {
  console.log("CLIENT_LOG: UploadArea rendering")
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith(".txt")) {
      setFile(droppedFile)
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected && selected.name.endsWith(".txt")) {
      setFile(selected)
    }
  }, [])

  const handleRemoveFile = useCallback(() => {
    setFile(null)
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!file) return

    console.log("CLIENT_LOG: handleAnalyze started")
    setIsUploading(true)
    onAnalysisStart()

    try {
      console.log("CLIENT_LOG: Sending text parse request to /api/parse", { fileName: file.name, fileSize: file.size })
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      })

      console.log(`CLIENT_LOG: Parse response status: ${response.status}`)
      if (!response.ok) throw new Error("Parse failed")

      const result = await response.json()
      console.log(`CLIENT_LOG: Received parsed data (${result.data?.length} items)`)
      onAnalysisComplete(result.data, result.analysis, result.aiError)
    } catch (error) {
      console.error("Parse Error 상세:", error)
      alert("파일 분석 중 오류가 발생했습니다.")
      onAnalysisComplete(null, null, (error as any).message || "분석 실패")
    } finally {
      console.log("CLIENT_LOG: handleAnalyze finished")
      setIsUploading(false)
    }
  }, [file, onAnalysisStart, onAnalysisComplete])

  return (
    <section className="px-6 py-4">
      {!file ? (
        <label
          htmlFor="file-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${isDragging
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-border bg-secondary/50 hover:border-primary/50 hover:bg-secondary"
            }`}
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/15">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-sm font-medium text-foreground">
              {"카톡 대화 파일 업로드"}
            </span>
            <span className="text-xs text-muted-foreground">
              {".txt 파일만 가능"}
            </span>
          </div>
          <input
            id="file-upload"
            type="file"
            accept=".txt"
            className="sr-only"
            onChange={handleFileChange}
            aria-label="카카오톡 대화 파일 업로드"
          />
        </label>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/50 border border-border">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/15 shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {file.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
            <button
              onClick={handleRemoveFile}
              disabled={isUploading}
              className="ml-auto flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              aria-label="파일 제거"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isUploading}
            style={{ backgroundColor: "#FEE500", color: "#191919" }}
            className="w-full py-4 px-6 rounded-2xl font-bold shadow-lg shadow-yellow-500/10 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
          >
            {isUploading ? "분석 중..." : "지금 바로 분석하기"}
          </button>
        </div>
      )}
    </section>
  )
}
