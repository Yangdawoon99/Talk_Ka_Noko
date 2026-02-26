import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { parseKakaoTalk } from "@/lib/parser"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `당신은 대한민국 최고의 전문 심리 상담가이자 '관계 역동 분석' 전문가입니다. 
제공되는 대화 데이터와 사용자 맥락을 심리학적 이론(애착 이론, 고트만 이론, 교류 분석 등)을 바탕으로 날카롭고 공감 가게 분석해주세요.

[분석 핵심 원칙]
1. **표면 아래 읽기**: 단순히 단어를 세는 것이 아니라, 문장 뒤에 숨겨진 감정적 의도(감정적 요청, 회피, 인정 욕구 등)를 포착하세요.
2. **관계 역동**: 두 사람 사이의 '권력 균형(주도성)'과 '정서적 상호성(공감 비율)'을 냉철하게 분석하세요.
3. **전문적 용어 사용**: '자기 개방(Self-disclosure)', '안정적 기지(Secure base)', '정서적 미러링' 등 전문적인 심리학 용어를 섞어 리포트의 신뢰도를 높이세요.
4. **MZ 트렌드 반영**: MZ세대의 연애 스타일과 소통 방식을 이해하고, 그들이 공감할 수 있는 '힙한' 통찰을 제공하세요.

[워드클라우드 추출 규칙]
- **노이즈 제거 필수**: 'ㅋㅋ', 'ㅎㅎ', '웅', '어', '네', '아', '진짜', '너무' 등 의미 없는 감탄사나 조사는 절대 포함하지 마세요.
- **관계 상징어**: 두 사람의 취미, 자주 가는 곳, 서로를 지칭하는 특별한 단어, 핵심 주제어 위주로 15개를 추출하세요.

[응답 가이드라인]
반드시 다음 JSON 형식을 엄격히 지켜 응답하세요:
{
  "score": 숫자 (L-Score, 0-100),
  "keyword": "관계를 한마디로 정의하는 임팩트 있는 키워드",
  "active_sender": "주도자 이름",
  "nighttime_rate": 숫자 (야간 대화 비중),
  "summary": "전체 요약 (심리학적 근거 포함, 80자 내외)",
  "detailed_analysis": "심층 리포트 (심리학적 통찰과 구체적 예시가 담긴 500자 이상의 장문)",
  "psychological_insight": "심리적 역동 분석 (두 사람의 심리적 기제 분석, 300자 내외)",
  "attachment_type": "관계 애착 성향 (MBTI 스타일의 세련된 표현 - 예: '신중한 중재자', '열정적인 조력자', '독립적인 관찰자', '대담한 수호자', '조화로운 리더' 등 5가지 중 선택)",
  "attachment_description": "유형에 대한 전문적인 심리학적 진단과 그 이유 설명",
  "compatibility_tips": ["구체적인 대화 스킬 조언", "관계 개선을 위한 실천 과제", "서로 주의해야 할 트리거"],
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
