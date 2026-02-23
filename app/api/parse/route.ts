import { NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
  systemInstruction: "당신은 연애 분석 전문가 'Love Data Architect'입니다. 카카오톡 대화 내용을 분석하여 두 사람의 관계를 흥미롭고 위트 있게 분석해주세요. 결과는 반드시 한국어 JSON 형식으로 응답하세요.",
  generationConfig: { responseMimeType: "application/json" }
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const shouldAnalyze = formData.get("analyze") === "true"

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const text = await file.text()

    // Path to python script
    const pythonScriptPath = path.join(process.cwd(), "lib", "python", "parser.py")

    // Spawn python process
    const pythonProcess = spawn("python", [pythonScriptPath])

    let resultData = ""
    let errorData = ""

    // Write text to stdin as UTF-8
    pythonProcess.stdin.write(text, "utf-8")
    pythonProcess.stdin.end()

    // Collect output from stdout
    const stdoutPromise = new Promise<string>((resolve) => {
      pythonProcess.stdout.on("data", (data) => {
        resultData += data.toString()
      })
      pythonProcess.stdout.on("close", () => resolve(resultData))
    })

    // Collect output from stderr
    const stderrPromise = new Promise<string>((resolve) => {
      pythonProcess.stderr.on("data", (data) => {
        errorData += data.toString()
      })
      pythonProcess.stderr.on("close", () => resolve(errorData))
    })

    const exitCodePromise = new Promise<number>((resolve) => {
      pythonProcess.on("close", (code) => resolve(code ?? 0))
    })

    await Promise.all([stdoutPromise, stderrPromise, exitCodePromise])

    if (errorData) {
      console.error("Python Error:", errorData)
    }

    const parsedData = JSON.parse(resultData)

    let aiAnalysis = null
    let aiError = null

    if (shouldAnalyze && parsedData && parsedData.length > 0) {
      try {
        // Free Tier optimization: sample messages
        const sampleSize = 50
        const chatSample = parsedData.slice(-sampleSize).map((m: any) =>
          `${m.sender || "알수없음"}: ${m.message}`
        ).join("\n")

        const result = await model.generateContent(`명시된 형식 키에 맞춰 다음 대화 내용을 분석해줘:\n\n${chatSample}`);

        const content = result.response.text()
        if (content) {
          aiAnalysis = JSON.parse(content)
        }
      } catch (err: any) {
        console.error("Gemini Analysis Failed:", err)
        aiError = err.message || "AI 분석 중 오류가 발생했습니다."
      }
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      analysis: aiAnalysis,
      aiError: aiError
    })
  } catch (error: any) {
    console.error("Parsing API Error 상세:", error)
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."
    return NextResponse.json({
      error: "Failed to parse file",
      details: errorMessage
    }, { status: 500 })
  }
}
