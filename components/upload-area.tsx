"use client"

import { useState, useCallback } from "react"
import { Upload, FileText, X } from "lucide-react"

export function UploadArea() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

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

  return (
    <section className="px-6 py-4">
      {!file ? (
        <label
          htmlFor="file-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
            isDragging
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
            className="ml-auto flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
            aria-label="파일 제거"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      )}
    </section>
  )
}
