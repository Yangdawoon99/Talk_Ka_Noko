import { NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
  systemInstruction: `당신은 대한민국 최고의 카카오톡 대화 분석 전문가 'Love Data Architect'입니다. 
제공되는 대화 텍스트를 분석하여 두 사람의 관계를 흥미롭고 위트 있게 분석해주세요.

반드시 다음 JSON 형식을 엄격히 지켜 응답하세요:
{
  "score": 0-100 사이의 숫자 (두 사람의 애정 지수/친밀도),
  "keyword": "두 사람의 관계를 정의하는 센스 있는 키워드 (예: '썸 타는 사이', '운명적 동반자')",
  "active_sender": "대화에서 더 적극적으로 말을 걸거나 리드하는 사람의 이름 (실명 기반)",
  "nighttime_rate": 0-100 사이의 숫자 (밤 10시 이후 대화 비중),
  "summary": "전체적인 관계에 대한 한 줄 요약 (위트 있는 어조, 30자 이내)"
}

주의사항:
1. 'active_sender'에는 대화 목록에 등장하는 사람 중 한 명의 실명을 정확히 기입하세요.
2. 분석 대상이 부족하더라도 최대한 추측하여 성의 있는 답변을 만드세요.
3. 모든 분석 및 요약은 한국어로 작성하세요.`,
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.7
  }
})

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || ""

    // 1. JSON Request (Analysis with Context)
    if (contentType.includes("application/json")) {
      const { data: parsedData, context } = await req.json()

      let aiAnalysis = null
      let aiError = null

      if (parsedData && parsedData.length > 0) {
        try {
          const stats = calculateStats(parsedData)
          const statsSummary = summarizeStats(stats)
          const chatSample = parsedData.slice(-80).map((m: any) =>
            `${m.sender || "알수없음"}: ${m.message}`
          ).join("\n")

          const prompt = `
[사용자 정보 및 관계 맥락]
- 관계: ${context?.relationType || "미지정"}
- 기간: ${context?.duration || "미지정"}

[대화 통계 결과]
${statsSummary}

[최근 대화 샘플]
${chatSample}

위 데이터와 관계 맥락을 바탕으로, 대한민국 최고의 전문 심리 상담가 페르소나를 가지고 두 사람의 관계를 심층 분석해주세요. 
특히 '${context?.relationType}'라는 관계의 특수성을 고려하여, 통계 수치를 근거로 분석해주세요.`

          const result = await model.generateContent(prompt)
          const content = result.response.text()
          if (content) {
            aiAnalysis = {
              ...JSON.parse(content),
              stats: stats
            }
          }
        } catch (err: any) {
          console.error("Gemini Analysis Failed:", err)
          aiError = err.message || "AI 분석 중 오류가 발생했습니다."
        }
      }

      return NextResponse.json({ success: true, analysis: aiAnalysis, aiError })
    }

    // 2. FormData Request (Initial File Parse)
    const formData = await req.formData()
    const file = formData.get("file") as File
    // const shouldAnalyze = formData.get("analyze") === "true" // Removed as analysis is now a separate JSON request

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const text = await file.text()
    const pythonScriptPath = path.join(process.cwd(), "lib", "python", "parser.py")
    const pythonProcess = spawn("python", [pythonScriptPath])

    let resultData = ""
    let errorData = ""

    pythonProcess.stdin.write(text, "utf-8")
    pythonProcess.stdin.end()

    const stdoutPromise = new Promise<string>((resolve) => {
      pythonProcess.stdout.on("data", (data) => { resultData += data.toString() })
      pythonProcess.stdout.on("close", () => resolve(resultData))
    })

    const stderrPromise = new Promise<string>((resolve) => {
      pythonProcess.stderr.on("data", (data) => { errorData += data.toString() })
      pythonProcess.stderr.on("close", () => resolve(errorData))
    })

    // Await all promises, including the close event for the process
    await Promise.all([stdoutPromise, stderrPromise, new Promise(r => pythonProcess.on("close", r))])

    if (errorData) {
      console.error("Python Error:", errorData)
      // Optionally, throw an error or return an error response if Python script failed
    }

    const parsedData = JSON.parse(resultData)

    // AI analysis block removed from here, now handled by JSON request

    return NextResponse.json({
      success: true,
      data: parsedData,
      // analysis: aiAnalysis, // Removed
      // aiError: aiError // Removed
    })
  } catch (error: any) {
    console.error("Parsing API Error 상세:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

// Helper functions for stats
function calculateStats(data: any[]) {
  const stats: any = {
    senders: {},
    hourlyActivity: Array(24).fill(0),
    totalMessages: data.length,
  }
  let lastMessageTime: Date | null = null
  let lastSender: string | null = null

  data.forEach((m: any) => {
    const sender = m.sender || "Unknown"
    if (!stats.senders[sender]) {
      stats.senders[sender] = { count: 0, totalLength: 0, totalReplyTime: 0, replyCount: 0 }
    }
    stats.senders[sender].count++
    stats.senders[sender].totalLength += (m.message || "").length

    const timeMatch = m.time?.match(/(오전|오후)\s(\d{1,2}):(\d{2})/)
    if (timeMatch) {
      let hour = parseInt(timeMatch[2])
      const isPM = timeMatch[1] === "오후"
      if (isPM && hour !== 12) hour += 12
      if (!isPM && hour === 12) hour = 0
      stats.hourlyActivity[hour]++

      const currentMsgTime = new Date()
      currentMsgTime.setHours(hour, parseInt(timeMatch[3]), 0)
      if (lastMessageTime && lastSender && lastSender !== sender) {
        const diff = (currentMsgTime.getTime() - lastMessageTime.getTime()) / 1000 / 60
        if (diff > 0 && diff < 60) {
          stats.senders[sender].totalReplyTime += diff
          stats.senders[sender].replyCount++
        }
      }
      lastMessageTime = currentMsgTime
      lastSender = sender
    }
  })
  return stats
}

function summarizeStats(stats: any) {
  return Object.entries(stats.senders).map(([name, s]: any) => {
    return `${name}: 메시지 ${s.count}개, 평균 글자수 ${Math.round(s.totalLength / s.count)}자, 평균 답장속도 ${s.replyCount > 0 ? Math.round(s.totalReplyTime / s.replyCount) : '-'}분`
  }).join("\n")
}
