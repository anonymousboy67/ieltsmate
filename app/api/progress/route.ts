import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import TestSession from "@/lib/models/test-session"
import User from "@/lib/models/user"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    // Fetch all test sessions for this user, sorted by date
    const sessions = await TestSession.find({ userId: session.user.id })
      .sort({ completedAt: -1 })
      .select("scores completedAt")
      .lean()

    const user = await User.findById(session.user.id).select("streak lastActiveDate").lean()

    // Build chart data — last 10 sessions
    const chartData = sessions.slice(0, 10).reverse().map((s, i) => ({
      session: `Test ${i + 1}`,
      date: s.completedAt ? new Date(s.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "",
      fluency: s.scores?.fluency ?? 0,
      vocabulary: s.scores?.vocabulary ?? 0,
      grammar: s.scores?.grammar ?? 0,
      pronunciation: s.scores?.pronunciation ?? 0,
      overall: s.scores?.overall ?? 0,
    }))

    // Calculate averages over all sessions
    const avgScores =
      sessions.length > 0
        ? {
            fluency: +(sessions.reduce((a, s) => a + (s.scores?.fluency ?? 0), 0) / sessions.length).toFixed(1),
            vocabulary: +(sessions.reduce((a, s) => a + (s.scores?.vocabulary ?? 0), 0) / sessions.length).toFixed(1),
            grammar: +(sessions.reduce((a, s) => a + (s.scores?.grammar ?? 0), 0) / sessions.length).toFixed(1),
            pronunciation: +(sessions.reduce((a, s) => a + (s.scores?.pronunciation ?? 0), 0) / sessions.length).toFixed(1),
            overall: +(sessions.reduce((a, s) => a + (s.scores?.overall ?? 0), 0) / sessions.length).toFixed(1),
          }
        : null

    // Identify weakest area
    let weakestArea: string | null = null
    if (avgScores) {
      const scores = [
        { name: "Fluency", value: avgScores.fluency },
        { name: "Vocabulary", value: avgScores.vocabulary },
        { name: "Grammar", value: avgScores.grammar },
        { name: "Pronunciation", value: avgScores.pronunciation },
      ]
      weakestArea = scores.sort((a, b) => a.value - b.value)[0].name
    }

    return NextResponse.json({
      totalSessions: sessions.length,
      streak: user?.streak ?? 0,
      lastActive: user?.lastActiveDate ?? null,
      latestBand: sessions[0]?.scores?.overall ?? null,
      avgScores,
      weakestArea,
      chartData,
      recentSessions: sessions.slice(0, 5).map((s) => ({
        id: s._id.toString(),
        overall: s.scores?.overall ?? 0,
        completedAt: s.completedAt,
      })),
    })
  } catch (error) {
    console.error("Progress error:", error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}
