import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { parseKakaoTalk } from "@/lib/parser"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
const SYSTEM_INSTRUCTION = `당신은 2026년 현재 대한민국 최고의 전문 심리 상담가이자 '관계 정밀 역동 분석' 전문가입니다. (오늘 날짜: 2026년 2월 26일)

제공되는 대화 데이터와 사용자 맥락을 최신 심리학 이론(애착 이론, 고트만 관계 분석, 교류 분석 등)을 바탕으로 매우 날카롭고 깊이 있게 해독해주세요.

[2026년형 분석 핵심 지침]
1. **정교한 시계열 분석**: 대화가 현재(2026년)를 기준으로 얼마나 과거부터 이어져 온 것인지 파악하고, 시간 흐름에 따른 감정의 퇴색이나 농익음을 분석하세요.
2. **비언어적 실마리 포착**: 텍스트 뒤에 숨겨진 '침묵의 속도', '응답의 일관성', '자기 노출의 수위'를 통해 표면적인 말 이상의 심리적 의도를 읽어내세요.
3. **전문적 통찰**: '신경 가소성', '정서적 상호 조절(Co-regulation)', '안정적 애착의 재구성' 등 2020년대 중반의 최신 상담 트렌드 용어를 활용하여 신뢰도를 극대화하세요.
4. **MBTI 스타일의 페르소나**: 관계를 정의할 때 '신중한 중재자', '열정적인 조력자', '독립적인 관찰자', '대담한 수호자', '조화로운 리더' 등 전문적이고 세련된 명칭을 부여하세요.

[워드클라우드 추출 규칙]
- **노이즈 필터링 2.0**: 'ㅋㅋ', 'ㅎㅎ', '웅', '어', '네' 등 무의미한 감탄사는 100% 제외하십시오.
- **관계의 본질**: 두 사람의 고유한 애칭, 공통 관심사, 갈등의 중심이 되는 핵심 키워드 15개를 엄선하세요.

[응답 가이드라인 (JSON 전용)]
반드시 다음 구조를 유지하여 응답하세요:
{
  "score": 숫자 (L-Score, 0-100),
  "keyword": "관계를 상징하는 날카롭고 시적인 한마디",
  "active_sender": "대화의 흐름을 주도하는 인물",
  "nighttime_rate": 숫자 (야간 대화 비중),
  "summary": "전체 요약 (전문 심리학적 근거 포함, 80자 내외)",
  "detailed_analysis": "심층 리포트 (통계적 근거와 심리적 통찰이 담긴 500자 이상의 초장문)",
  "psychological_insight": "심리적 역동 분석 (숨겨진 애착 동기와 상호 작용 패턴, 300자 내외)",
  "attachment_type": "관계 애착 성향 (예: '신중한 중재자' 스타일 등)",
  "attachment_description": "유형에 대한 2026년 기준의 전문적인 진단 설명",
  "compatibility_tips": ["실행 가능한 구체적 소통법", "관계의 장기적 유지를 위한 과제", "감정적 트리거 주의점"],
  "wordcloud": [{"text": "단어1", "value": 10}, {"text": "단어2", "value": 8}, ...],
  "sentiment_score": 0-100,
  "radar_data": {
    "volume": 0-100,
    "speed": 0-100,
    "empathy": 0-100,
    "proactivity": 0-100,
    "consistency": 0-100
  }
}`

const GENERATION_CONFIG = {
  responseMimeType: "application/json",
  temperature: 0.7
}

// Model Fallback List (ordered by priority)
const AVAILABLE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash"
]

export async function POST(req: NextRequest) {
  console.log(`[${new Date().toISOString()}] LOG: API POST hit`)
  try {
    const contentType = req.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      const { data: parsedData, context } = await req.json()

      let aiAnalysis = null
      let aiError = null

      if (parsedData && parsedData.length > 0) {
        const stats = calculateStats(parsedData)
        const statsSummary = summarizeStats(stats)
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

        // --- ATTEMPT ANALYSIS WITH FALLBACK LOGIC ---
        for (const modelName of AVAILABLE_MODELS) {
          try {
            console.log(`[${new Date().toISOString()}] LOG: Attempting analysis with ${modelName}`)
            const model = genAI.getGenerativeModel({
              model: modelName,
              systemInstruction: SYSTEM_INSTRUCTION,
              generationConfig: GENERATION_CONFIG
            })

            const result = await model.generateContent(prompt)
            const response = await result.response
            const content = response.text()

            if (content) {
              const jsonMatch = content.match(/\{[\s\S]*\}/)
              const cleanJson = jsonMatch ? jsonMatch[0] : content
              aiAnalysis = {
                ...JSON.parse(cleanJson),
                stats: stats,
                modelUsed: modelName // Track which model succeeded
              }
              aiError = null // Clear any previous errors if a fallback succeeds
              break // SUCCESS! Exit the loop
            }
          } catch (err: any) {
            console.error(`[${new Date().toISOString()}] ERROR: Model ${modelName} failed`, err.message)
            aiError = `AI 모델(${modelName}) 처리 중 오류가 발생했습니다. 다음 모델로 재시도합니다.`
            // Continue to the next model in the loop
          }
        }

        if (!aiAnalysis && aiError) {
          aiError = "모든 AI 모델의 가용량을 초과했거나 분석에 실패했습니다. 잠시 후 다시 시도해 주세요."
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
