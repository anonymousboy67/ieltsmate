import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import WordProgress from "@/lib/models/word-progress"
import type { WordStatus } from "@/lib/models/word-progress"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { wordId, status } = await req.json() as { wordId: string; status: WordStatus }

    if (!wordId || !status) {
      return NextResponse.json({ error: "wordId and status are required" }, { status: 400 })
    }

    await connectDB()

    // Calculate next review date based on spaced repetition
    const now = new Date()
    let nextReviewDate = new Date()

    switch (status) {
      case "mastered":
        nextReviewDate.setDate(now.getDate() + 7) // Review in 7 days
        break
      case "learning":
        nextReviewDate.setDate(now.getDate() + 2) // Review in 2 days
        break
      default:
        nextReviewDate = now // Review today
    }

    const progress = await WordProgress.findOneAndUpdate(
      { userId: session.user.id, wordId },
      {
        $set: { status, nextReviewDate, lastSeenDate: now },
        $inc: { reviewCount: 1 },
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({ success: true, progress })
  } catch (error) {
    console.error("Word progress error:", error)
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }
}

// GET — fetch all word progress for the current user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const allProgress = await WordProgress.find({ userId: session.user.id }).lean()

    const stats = {
      total: allProgress.length,
      mastered: allProgress.filter((p) => p.status === "mastered").length,
      learning: allProgress.filter((p) => p.status === "learning").length,
      new: allProgress.filter((p) => p.status === "new").length,
    }

    // Words due for review today
    const dueForReview = allProgress.filter(
      (p) => p.status !== "mastered" && new Date(p.nextReviewDate) <= new Date()
    )

    return NextResponse.json({ stats, dueForReview, allProgress })
  } catch (error) {
    console.error("Word progress fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}
