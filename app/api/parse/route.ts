import { NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
    if (shouldAnalyze && parsedData && parsedData.length > 0) {
      // Free Tier optimization: sample only the most recent messages for AI
      const sampleSize = 50
      const chatSample = parsedData.slice(-sampleSize).map((m: any) =>
        `${m.sender || "알수없음"}: ${m.message}`
      ).join("\n")

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "당신은 연애 분석 전문가 'Love Data Architect'입니다. 카카오톡 대화 내용을 분석하여 두 사람의 관계를 흥미롭고 위트 있게 분석해주세요. 결과는 반드시 한국어 JSON 형식으로 응답하세요. keys: { score: 0-100, keyword: '짧은 관계 명칭', active_sender: '더 적극적인 사람 이름', nighttime_rate: 0-100, summary: '한 줄 요약(30자 이내)' }",
          },
          {
            role: "user",
            content: `다음 대화 내용을 분석해줘:\n\n${chatSample}`,
          },
        ],
        response_format: { type: "json_object" },
      })

      const content = completion.choices[0].message.content
      if (content) {
        aiAnalysis = JSON.parse(content)
      }
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      analysis: aiAnalysis
    })
  } catch (error) {
    console.error("Parsing API Error:", error)
    return NextResponse.json({ error: "Failed to parse file" }, { status: 500 })
  }
}
