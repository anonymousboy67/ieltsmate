import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import DailyWord from "@/lib/models/daily-word"
import WordProgress from "@/lib/models/word-progress"
import { WORD_BANK, getDailyWord } from "@/lib/word-bank"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const today = new Date().toISOString().split("T")[0] // "YYYY-MM-DD"

    // Seed word bank if needed
    const wordCount = await DailyWord.countDocuments()
    if (wordCount === 0) {
      await DailyWord.insertMany(WORD_BANK)
    }

    // Find today's word or pick deterministically
    let dailyWord = await DailyWord.findOne({ assignedDate: today })

    if (dailyWord == null) {
      // Pick word based on date and assign it
      const wordData = getDailyWord(today)
      dailyWord = await DailyWord.findOneAndUpdate(
        { word: wordData.word },
        { $set: { assignedDate: today } },
        { upsert: true, new: true }
      )
    }

    if (!dailyWord) {
      return NextResponse.json({ error: "No word found" }, { status: 404 })
    }

    // Get user's progress for this word
    const progress = await WordProgress.findOne({
      userId: session.user.id,
      wordId: dailyWord.word,
    })

    return NextResponse.json({
      word: dailyWord,
      status: progress?.status ?? "new",
      reviewCount: progress?.reviewCount ?? 0,
    })
  } catch (error) {
    console.error("Daily word error:", error)
    return NextResponse.json({ error: "Failed to fetch daily word" }, { status: 500 })
  }
}
