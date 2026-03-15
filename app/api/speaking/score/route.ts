import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import TestSession from "@/lib/models/test-session"
import User from "@/lib/models/user"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SCORING_PROMPT = `You are an expert IELTS examiner. You must score a speaking test transcript and provide detailed feedback.

Evaluate the candidate on the official IELTS Speaking Band Descriptors:
1. FLUENCY & COHERENCE: Flow, pace, coherence, use of cohesive devices, absence of long hesitation
2. LEXICAL RESOURCE: Range of vocabulary, accuracy, collocations, paraphrasing ability
3. GRAMMATICAL RANGE & ACCURACY: Range of structures, frequency and impact of errors
4. PRONUNCIATION: Sounds, word stress, sentence stress, intonation, intelligibility

IMPORTANT: You must respond with ONLY valid JSON, no other text. Format:
{
  "scores": {
    "fluency": <number 1-9>,
    "vocabulary": <number 1-9>,
    "grammar": <number 1-9>,
    "pronunciation": <number 1-9>,
    "overall": <number 1-9, average of above>
  },
  "feedback": {
    "summary": "<2-3 sentence overall impression>",
    "fluency": "<specific feedback on fluency>",
    "vocabulary": "<specific feedback with examples from transcript>",
    "grammar": "<specific feedback with examples of errors if any>",
    "pronunciation": "<feedback based on written patterns if visible>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
    "nextSteps": "<1-2 specific study recommendations>"
  }
}`

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { part1Transcript, part2Transcript, part3Transcript } = await req.json()

    const fullTranscript = `
PART 1 - Introduction & Interview:
${part1Transcript || "(no transcript)"}

PART 2 - Individual Long Turn:
${part2Transcript || "(no transcript)"}

PART 3 - Two-way Discussion:
${part3Transcript || "(no transcript)"}
    `.trim()

    // Ask Claude to score the session
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: SCORING_PROMPT,
      messages: [
        {
          role: "user",
          content: `Please score this IELTS Speaking test transcript:\n\n${fullTranscript}`,
        },
      ],
    })

    const rawText = response.content[0].type === "text" ? response.content[0].text : ""

    let parsed: {
      scores: { fluency: number; vocabulary: number; grammar: number; pronunciation: number; overall: number }
      feedback: {
        summary: string
        fluency: string
        vocabulary: string
        grammar: string
        pronunciation: string
        strengths: string[]
        improvements: string[]
        nextSteps: string
      }
    }

    try {
      parsed = JSON.parse(rawText)
    } catch {
      // Fallback if Claude returns non-JSON
      parsed = {
        scores: { fluency: 6, vocabulary: 6, grammar: 6, pronunciation: 6, overall: 6 },
        feedback: {
          summary: rawText,
          fluency: "",
          vocabulary: "",
          grammar: "",
          pronunciation: "",
          strengths: [],
          improvements: [],
          nextSteps: "",
        },
      }
    }

    // Save session to MongoDB
    await connectDB()
    const testSession = await TestSession.create({
      userId: session.user.id,
      part1Transcript,
      part2Transcript,
      part3Transcript,
      scores: parsed.scores,
      feedback: JSON.stringify(parsed.feedback),
      completedAt: new Date(),
    })

    // Update user streak
    const today = new Date().toDateString()
    const user = await User.findById(session.user.id)
    if (user) {
      const lastActive = user.lastActiveDate ? user.lastActiveDate.toDateString() : null
      if (lastActive !== today) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const isConsecutive = lastActive === yesterday.toDateString()
        user.streak = isConsecutive ? user.streak + 1 : 1
        user.lastActiveDate = new Date()
        await user.save()
      }
    }

    return NextResponse.json({
      sessionId: testSession._id.toString(),
      scores: parsed.scores,
      feedback: parsed.feedback,
    })
  } catch (error) {
    console.error("Scoring error:", error)
    return NextResponse.json({ error: "Failed to score the test" }, { status: 500 })
  }
}
