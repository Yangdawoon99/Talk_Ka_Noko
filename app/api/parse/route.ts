import { NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
  systemInstruction: `당신은 대한민국 최고의 전문 심리 상담가이자 데이터 분석가입니다. 
제공되는 대화 텍스트와 통계, 그리고 '관계 맥락'을 바탕으로 두 사람의 관계를 날카롭고 공감 가게 분석해주세요.

[애정 지수(L-Score) 산출 기준 - 엄격 준수]
1. 0~20%: 비즈니스, 공적인 관계, 극도의 어색함. (존댓말 사용, 사무적인 대화 위주)
2. 21~40%: 일반적인 지인 또는 단순 친구. (일상적인 정보 공유, 감정적 교류 적음)
3. 41~60%: 친밀한 친구 또는 가벼운 호감. (유머 코드 공유, 정기적인 연락)
4. 61~80%: 강력한 썸 또는 시작하는 연인. (높은 답장 속도, 감정 표현 빈번)
5. 81~100%: 깊은 신뢰와 사랑의 관계. (밤낮 없는 대화, 서로에 대한 깊은 유대감)

주의사항:
- 고백 전의 '썸'이나 '비즈니스' 관계인 경우, 감정 과잉 해석을 경계하고 객관적인 지표(답장 속도, 말투 등)를 우선하세요.
- 비즈니스 관계에서 예의 바른 대화는 '애정'이 아닌 '매너'로 해석하여 낮은 점수를 부여하세요.

반드시 다음 JSON 형식을 엄격히 지켜 응답하세요:
{
  "score": 0-100 사이의 숫자,
  "keyword": "관계의 핵심 정체성",
  "active_sender": "대화 주도자 이름",
  "nighttime_rate": 0-100 사이의 숫자,
  "summary": "핵심 요약 (30자 이내, 전문 상담가 어조)"
}`,
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
