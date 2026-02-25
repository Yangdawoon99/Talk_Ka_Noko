import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { parseKakaoTalk } from "@/lib/parser"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: `당신은 대한민국 최고의 전문 심리 상담가이자 관계 분석 전문가입니다. 
제공되는 대화 데이터와 관계 맥락을 심리학적 이론(애착 이론, 비언어적 커뮤니케이션 등)을 바탕으로 날카롭고 공감 가게 분석해주세요.

[애정 지수(L-Score) 및 관계 키워드]
- 관계의 핵심을 꿰뚫는 키워드와 0~100점 사이의 점수를 산출하세요.
- 단순히 숫자만 주는 것이 아니라, 왜 그 점수인지 심리학적 근거를 요약에 담으세요.

[MZ 애착 유형 및 심리 인사이트]
- 애착 유형을 진단하고, 그 유형이 두 사람의 소통에 어떤 영향을 주는지 상세히 설명하세요.
- 'psychological_insight' 필드에는 대화 속의 숨겨진 심리적 기제(예: 회피형 성향, 인정 욕구, 애정 표현 패턴 등)를 분석해 담으세요.

[워드클라우드 추출]
- 두 사람의 대화에서 가장 의미 있고 자주 등장하는 명사/동사 기반 키워드 10~15개를 추출하세요.
- 단순 인사말보다는 관계의 특징을 보여주는 단어 위주로 선별하세요.

[응답 가이드라인]
반드시 다음 JSON 형식을 엄격히 지켜 응답하세요:
{
  "score": 숫자 (L-Score),
  "keyword": "관계 정체성",
  "active_sender": "주도자 이름",
  "nighttime_rate": 숫자 (야간 대화 비중),
  "summary": "전체 요약 (심리학적 근거 포함, 40자 내외)",
  "detailed_analysis": "심층 리포트 (심리학적 통찰이 담긴 400자 이상의 장문)",
  "psychological_insight": "심리적 역동 분석 (200자 내외)",
  "attachment_type": "MZ 애착 유형 (5가지 중 선택)",
  "attachment_description": "해당 유형에 대한 심리적 설명",
  "compatibility_tips": ["조언1", "조언2", "조언3"],
  "wordcloud": [{"text": "단어1", "value": 10}, {"text": "단어2", "value": 8}, ...],
  "sentiment_score": 0-100,
  "radar_data": {
    "volume": 0-100,
    "speed": 0-100,
    "empathy": 0-100,
    "proactivity": 0-100,
    "consistency": 0-100
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
특히 '${context?.relationType || "미지정"}'라는 관계의 특수성과 심리학적 이론(애착 이론 등)을 근거로 분석해주세요.

상세 리포트에는 다음 항목들이 반드시 포함되어야 합니다:
1. MZ 애착 유형 진단 및 상세 설명
2. 깊이 있는 심층 리포트 (400자 이상)
3. 대화 속의 숨겨진 심리적 역동 분석 (psychological_insight)
4. 관계를 상징하는 주요 키워드 추출 (wordcloud)
5. 소통 개선을 위한 구체적 솔루션 (compatibility_tips)
6. 5가지 관계 지표 점수 (radar_data)`

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
