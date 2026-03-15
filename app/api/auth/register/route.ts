import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import User from "@/lib/models/user"
import DailyWord from "@/lib/models/daily-word"
import { WORD_BANK } from "@/lib/word-bank"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, classCode } = await req.json()

    // Basic validation
    if (!name || !email || !password || !classCode) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    await connectDB()

    // Check if email is already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }

    // Validate class code — check if a teacher has this code, or it matches the default
    const teacher = await User.findOne({ classCode, role: "teacher" })
    const isDefaultCode = classCode === (process.env.DEFAULT_CLASS_CODE ?? "IELTS2026")
    if (!teacher && !isDefaultCode) {
      return NextResponse.json({ error: "Invalid class code. Please check with your teacher." }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "student",
      classCode,
      streak: 0,
      lastActiveDate: null,
    })

    // Seed the word bank if empty (first user registration triggers seeding)
    const wordCount = await DailyWord.countDocuments()
    if (wordCount < WORD_BANK.length) {
      await DailyWord.insertMany(WORD_BANK, { ordered: false }).catch(() => {
        // Ignore duplicate key errors — words already seeded
      })
    }

    return NextResponse.json({
      message: "Account created successfully",
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 })
  }
}
