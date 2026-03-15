import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const TASK1_PROMPT = `You are an expert IELTS examiner specialising in Writing Task 1.

Evaluate the response against the official IELTS Task 1 Band Descriptors:
1. TASK ACHIEVEMENT: How well the key features are covered, accuracy of data, overview presence
2. COHERENCE & COHESION: Organisation, paragraphing, linking devices
3. LEXICAL RESOURCE: Range and accuracy of graph-specific vocabulary
4. GRAMMATICAL RANGE & ACCURACY: Variety of structures, error frequency

Response format — ONLY valid JSON:
{
  "taskType": "task1",
  "scores": {
    "taskAchievement": <1-9>,
    "coherenceCohesion": <1-9>,
    "lexicalResource": <1-9>,
    "grammaticalRange": <1-9>,
    "overall": <1-9>
  },
  "feedback": {
    "summary": "<2-3 sentences overall impression>",
    "strengths": ["<strength>", "<strength>"],
    "improvements": ["<improvement with example>", "<improvement with example>"],
    "improvedVersion": "<a brief example of one improved sentence from the essay>",
    "vocabularySuggestions": ["<better word/phrase for graph language>"],
    "wordCount": <estimated word count>
  }
}`

const TASK2_PROMPT = `You are an expert IELTS examiner specialising in Writing Task 2.

Evaluate the essay against the official IELTS Task 2 Band Descriptors:
1. TASK RESPONSE: Position clarity, argument development, conclusion
2. COHERENCE & COHESION: Paragraphing, logical flow, cohesive devices
3. LEXICAL RESOURCE: Vocabulary range, precision, collocations
4. GRAMMATICAL RANGE & ACCURACY: Sentence variety, complex structures, error rate

Response format — ONLY valid JSON:
{
  "taskType": "task2",
  "scores": {
    "taskResponse": <1-9>,
    "coherenceCohesion": <1-9>,
    "lexicalResource": <1-9>,
    "grammaticalRange": <1-9>,
    "overall": <1-9>
  },
  "feedback": {
    "summary": "<2-3 sentences overall impression>",
    "strengths": ["<strength>", "<strength>"],
    "improvements": ["<improvement with example>", "<improvement with example>"],
    "improvedSentence": "<example of one improved sentence from the essay>",
    "bandUpgraderTip": "<one specific tip to improve band score>",
    "wordCount": <estimated word count>
  }
}`

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { taskType, question, response: studentResponse } = await req.json()

    if (!taskType || !studentResponse) {
      return NextResponse.json({ error: "Task type and response are required" }, { status: 400 })
    }

    const systemPrompt = taskType === "task1" ? TASK1_PROMPT : TASK2_PROMPT

    // Stream the feedback for a responsive feel
    const stream = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `TASK QUESTION:\n${question || "No question provided — evaluate the response on its merits."}\n\nSTUDENT RESPONSE:\n${studentResponse}`,
        },
      ],
      stream: true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
          }
          if (event.type === "message_stop") {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
          }
        }
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Writing feedback error:", error)
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 })
  }
}
