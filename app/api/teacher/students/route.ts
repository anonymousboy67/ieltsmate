import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/lib/models/user"
import TestSession from "@/lib/models/test-session"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden — teacher access only" }, { status: 403 })
  }

  try {
    await connectDB()

    // Get all students in this teacher's class
    const students = await User.find({
      classCode: session.user.classCode,
      role: "student",
    })
      .select("name email streak lastActiveDate createdAt")
      .lean()

    // For each student, get their latest test session for band score
    const studentsWithScores = await Promise.all(
      students.map(async (student) => {
        const latestSession = await TestSession.findOne({ userId: student._id })
          .sort({ completedAt: -1 })
          .select("scores completedAt")
          .lean()

        const daysSinceActive = student.lastActiveDate
          ? Math.floor(
              (Date.now() - new Date(student.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24)
            )
          : null

        return {
          id: student._id.toString(),
          name: student.name,
          email: student.email,
          streak: student.streak,
          lastActiveDate: student.lastActiveDate,
          daysSinceActive,
          isInactive: daysSinceActive !== null && daysSinceActive >= 3,
          latestBand: latestSession?.scores?.overall ?? null,
          latestTestDate: latestSession?.completedAt ?? null,
          joinedAt: student.createdAt,
        }
      })
    )

    return NextResponse.json({
      classCode: session.user.classCode,
      totalStudents: students.length,
      inactiveStudents: studentsWithScores.filter((s) => s.isInactive).length,
      students: studentsWithScores,
    })
  } catch (error) {
    console.error("Teacher students error:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}
