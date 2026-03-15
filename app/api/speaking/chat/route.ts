import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// System prompt for the IELTS examiner — calibrated for authentic exam behaviour
const EXAMINER_SYSTEM_PROMPT = `You are a certified IELTS Speaking examiner conducting an official IELTS Speaking test.

CRITICAL RULES:
- Stay completely in character as an examiner at all times
- Never break character, never give feedback during the test
- Use natural, measured British English
- Be professional, neutral, and encouraging but not over-praising
- Keep your responses CONCISE — one question or instruction per turn
- Never correct grammar or pronunciation during the test
- Listen to what the student says and respond naturally

PART 1 BEHAVIOUR:
- Ask 4-5 questions on familiar topics (hometown, family, work/study, hobbies, food, travel)
- Each question should be short and conversational
- After 2-3 answers on one topic, smoothly transition: "Let's talk about..." or "Now I'd like to ask you about..."
- Say "Thank you. That's the end of Part 1." when done

PART 2 BEHAVIOUR:
- Give the cue card topic (you'll receive it in the message)
- Say: "Here's your topic card. You have one minute to prepare. You may make notes if you wish."
- After prep: "Now, please start speaking."
- After 2 minutes: "Thank you. Now I'd like to ask you one or two questions related to your talk."
- Ask 1-2 brief follow-up questions about their Part 2 topic
- Say "Thank you. That's the end of Part 2." when done

PART 3 BEHAVIOUR:
- Ask 4-5 abstract, analytical questions related to the Part 2 topic
- Questions should explore: society, trends, future, comparisons, advantages/disadvantages
- Show genuine interest in ideas without agreeing/disagreeing
- Say "That's the end of the Speaking test. Thank you very much." when done

TONE: Professional, calm, encouraging. Like a real examiner — structured but human.`

// Cue card topics for Part 2
const CUE_CARDS = [
  {
    topic: "Describe a place you have visited that made a strong impression on you.",
    points: ["Where it was", "When you went there", "What you saw or did", "Explain why it made such a strong impression"],
  },
  {
    topic: "Describe a person who has had an important influence on your life.",
    points: ["Who this person is", "How you know them", "What qualities they have", "Explain why they have influenced you"],
  },
  {
    topic: "Describe a skill you would like to learn.",
    points: ["What the skill is", "How you would learn it", "How long it would take", "Explain why you want to learn this skill"],
  },
  {
    topic: "Describe a time when you helped someone.",
    points: ["Who you helped", "What the situation was", "How you helped", "Explain how you felt about helping"],
  },
  {
    topic: "Describe an interesting book you have read.",
    points: ["What the book is about", "When you read it", "Why you chose it", "Explain why you found it interesting"],
  },
  {
    topic: "Describe a goal you would like to achieve in the future.",
    points: ["What the goal is", "How you plan to achieve it", "How long it will take", "Explain why this goal is important to you"],
  },
]

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { messages, part, cueCardIndex } = await req.json()

    // Build the messages array for Claude
    const claudeMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }))

    // For Part 2, include the cue card in the system context
    let systemPrompt = EXAMINER_SYSTEM_PROMPT
    if (part === 2 && cueCardIndex !== undefined) {
      const card = CUE_CARDS[cueCardIndex % CUE_CARDS.length]
      systemPrompt += `\n\nCURRENT CUE CARD FOR PART 2:\n"${card.topic}"\nPoints to cover:\n${card.points.map((p, i) => `${i + 1}. ${p}`).join("\n")}`
    }

    // Stream the response back to the client
    const stream = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: systemPrompt,
      messages: claudeMessages,
      stream: true,
    })

    // Create a ReadableStream to pipe the SSE response
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const data = JSON.stringify({ text: event.delta.text })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
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
    console.error("Speaking chat error:", error)
    return NextResponse.json({ error: "Failed to get examiner response" }, { status: 500 })
  }
}

// Export cue cards for use in the frontend
export { CUE_CARDS }
