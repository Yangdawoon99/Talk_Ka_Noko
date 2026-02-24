import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { parseKakaoTalk } from "@/lib/parser"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: `당신은 대한민국 최고의 전문 심리 상담가이자 데이터 분석가입니다. 
제공되는 대화 텍스트와 통계, 그리고 '관계 맥락'을 바탕으로 두 사람의 관계를 날카롭고 공감 가게 분석해주세요.

[애정 지수(L-Score) 산출 기준 - 엄격 준수]
1. 0~20%: 비즈니스, 공적인 관계, 극도의 어색함.
2. 21~40%: 일반적인 지인 또는 단순 친구.
3. 41~60%: 친밀한 친구 또는 가벼운 호감.
4. 61~80%: 강력한 썸 또는 시작하는 연인.
5. 81~100%: 깊은 신뢰와 사랑의 관계.

[MZ 애착 유형 진단 기준]
다음 5가지 중 가장 적합한 유형을 하나 선택하세요:
1. 평온한 갓생형: 안정적이고 균형 잡힌 소통.
2. 심장벌렁 집착형: 높은 연락 빈도, 답장에 민감함.
3. 차가운 AI 로봇형: 단답 위주, 논리 중심, 긴 답장 시간.
4. 금사빠 불도저형: 초반 폭발적인 에너지와 애정 공세.
5. 내맘대로 고양이형: 변동성이 크고 예측 불가능한 소통 패턴.

반드시 다음 JSON 형식을 엄격히 지켜 응답하세요:
{
  "score": 0-100 사이의 숫자,
  "keyword": "관계의 핵심 정체성",
  "active_sender": "대화 주도자 이름",
  "nighttime_rate": 0-100 사이의 숫자,
  "summary": "핵심 요약 (30자 이내)",
  "detailed_analysis": "전문 서술형 심층 리포트 (300자 이상)",
  "attachment_type": "5가지 MZ 유형 중 하나",
  "sentiment_score": 0-100 사이의 숫자 (감정적 따뜻함),
  "radar_data": {
    "volume": 0-100 (대화량 밸런스),
    "speed": 0-100 (답장 속도),
    "empathy": 0-100 (공감 반응),
    "proactivity": 0-100 (먼저 말걸기),
    "consistency": 0-100 (일관성)
  }
}`,
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.7
  }
})

export async function POST(req: NextRequest) {
  console.log(`[${new Date().toISOString()}] LOG: API POST hit`)
  try {
    const contentType = req.headers.get("content-type") || ""

    // 1. JSON Request (Analysis with Context)
    if (contentType.includes("application/json")) {
      const start = Date.now()
      console.log(`[${new Date().toISOString()}] LOG: Analysis Request Start`)
      const { data: parsedData, context } = await req.json()
      console.log(`[${new Date().toISOString()}] LOG: Data loaded (${parsedData?.length} msgs)`)

      let aiAnalysis = null
      let aiError = null

      if (parsedData && parsedData.length > 0) {
        try {
          const stats = calculateStats(parsedData)
          const statsSummary = summarizeStats(stats)

          // Sanitize data for Gemini (Avoid complex emojis in prompt if they cause issues)
          const sanitize = (text: string) => text.replace(/❤️/g, "(하트)").replace(/[^\u0000-\uFFFF]/g, "")

          const chatSample = parsedData.slice(-80).map((m: any) =>
            `${sanitize(m.sender || "알수없음")}: ${sanitize(m.message)}`
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
          const response = await result.response
          const content = response.text()

          if (content) {
            try {
              // Extract JSON from potential markdown blocks
              const jsonMatch = content.match(/\{[\s\S]*\}/)
              const cleanJson = jsonMatch ? jsonMatch[0] : content
              aiAnalysis = {
                ...JSON.parse(cleanJson),
                stats: stats
              }
            } catch (jsonErr) {
              console.error("JSON Parse Error:", jsonErr, "Raw Content:", content)
              aiError = "AI 응답 형식 오류가 발생했습니다. 다시 시도해 주세요."
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
    console.log(`[${new Date().toISOString()}] LOG: File Parsing Start`)
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const text = await file.text()
    console.log(`[${new Date().toISOString()}] LOG: Parsing text with JS parser... Size: ${text.length}`)
    const parsedData = parseKakaoTalk(text)
    console.log(`[${new Date().toISOString()}] LOG: Parsing Complete. Found ${parsedData.length} messages`)

    return NextResponse.json({
      success: true,
      data: parsedData,
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
    hourly: Array(24).fill(0),
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
      stats.hourly[hour]++

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
