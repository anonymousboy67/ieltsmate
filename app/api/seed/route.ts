import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import User from "@/lib/models/user"
import DailyWord from "@/lib/models/daily-word"
import { WORD_BANK } from "@/lib/word-bank"

// One-time seed route — creates the default teacher account and seeds the word bank
// Protected by SEED_SECRET env variable
// Call: POST /api/seed with body { secret: "your-seed-secret" }

export async function POST(req: NextRequest) {
  const { secret } = await req.json()

  const expectedSecret = process.env.SEED_SECRET ?? "seed-ieltsmate-2026"
  if (secret !== expectedSecret) {
    return NextResponse.json({ error: "Invalid seed secret" }, { status: 401 })
  }

  try {
    await connectDB()

    const results: Record<string, string> = {}

    // 1. Create teacher account
    const teacherEmail = process.env.TEACHER_EMAIL ?? "teacher@ieltsmate.app"
    const teacherPassword = process.env.TEACHER_PASSWORD ?? "teacher123"
    const classCode = process.env.DEFAULT_CLASS_CODE ?? "IELTS2026"

    const existingTeacher = await User.findOne({ email: teacherEmail })
    if (!existingTeacher) {
      const hashedPassword = await bcrypt.hash(teacherPassword, 12)
      await User.create({
        name: "IELTS Teacher",
        email: teacherEmail,
        password: hashedPassword,
        role: "teacher",
        classCode,
        streak: 0,
      })
      results.teacher = `Created teacher: ${teacherEmail}`
    } else {
      results.teacher = `Teacher already exists: ${teacherEmail}`
    }

    // 2. Seed word bank
    const wordCount = await DailyWord.countDocuments()
    if (wordCount === 0) {
      await DailyWord.insertMany(WORD_BANK)
      results.words = `Seeded ${WORD_BANK.length} words`
    } else {
      results.words = `Word bank already seeded (${wordCount} words)`
    }

    return NextResponse.json({
      message: "Seed complete",
      results,
      teacherCredentials: { email: teacherEmail, password: teacherPassword, classCode },
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: "Seed failed" }, { status: 500 })
  }
}
