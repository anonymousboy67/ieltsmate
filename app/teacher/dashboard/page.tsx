import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { connectDB } from "@/lib/mongodb"
import User from "@/lib/models/user"
import TestSession from "@/lib/models/test-session"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookMarked, Users, AlertTriangle, Flame, TrendingUp, LogOut } from "lucide-react"
import { SignOutButton } from "@/components/sign-out-button"
import { cn } from "@/lib/utils"

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")
  if (session.user.role !== "teacher") redirect("/dashboard")

  await connectDB()

  const students = await User.find({
    classCode: session.user.classCode,
    role: "student",
  })
    .select("name email streak lastActiveDate createdAt")
    .lean()

  const studentsWithData = await Promise.all(
    students.map(async (student) => {
      const latestSession = await TestSession.findOne({ userId: student._id })
        .sort({ completedAt: -1 })
        .select("scores completedAt")
        .lean()

      const daysSinceActive = (student as { lastActiveDate?: Date }).lastActiveDate
        ? Math.floor(
            (Date.now() - new Date((student as { lastActiveDate: Date }).lastActiveDate).getTime()) / (1000 * 60 * 60 * 24)
          )
        : null

      return {
        id: (student._id as { toString(): string }).toString(),
        name: student.name as string,
        email: student.email as string,
        streak: (student as { streak: number }).streak,
        lastActiveDate: (student as { lastActiveDate?: Date }).lastActiveDate,
        daysSinceActive,
        isInactive: daysSinceActive !== null && daysSinceActive >= 3,
        latestBand: (latestSession as { scores?: { overall?: number } } | null)?.scores?.overall ?? null,
        latestTestDate: (latestSession as { completedAt?: Date } | null)?.completedAt ?? null,
      }
    })
  )

  const inactiveCount = studentsWithData.filter((s) => s.isInactive).length
  const avgBand =
    studentsWithData.filter((s) => s.latestBand !== null).length > 0
      ? studentsWithData
          .filter((s) => s.latestBand !== null)
          .reduce((a, s) => a + s.latestBand!, 0) / studentsWithData.filter((s) => s.latestBand !== null).length
      : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-sidebar px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BookMarked className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">IELTSmate</h1>
            <p className="text-xs text-muted-foreground">Teacher Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">Class: <span className="font-mono text-primary">{session.user.classCode}</span></p>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-primary" />
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">enrolled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-muted-foreground">Inactive</p>
              </div>
              <div className={cn("text-2xl font-bold", inactiveCount > 0 ? "text-amber-400" : "text-emerald-400")}>
                {inactiveCount}
              </div>
              <p className="text-xs text-muted-foreground">3+ days inactive</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-muted-foreground">Avg Band</p>
              </div>
              <div className="text-2xl font-bold">{avgBand ? avgBand.toFixed(1) : "—"}</div>
              <p className="text-xs text-muted-foreground">class average</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-rose-400" />
                <p className="text-xs text-muted-foreground">Class Code</p>
              </div>
              <div className="text-xl font-bold font-mono text-primary">{session.user.classCode}</div>
              <p className="text-xs text-muted-foreground">share with students</p>
            </CardContent>
          </Card>
        </div>

        {/* Inactive students alert */}
        {inactiveCount > 0 && (
          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-amber-800">Inactive Students</span>
              <Badge className="bg-amber-100 text-amber-700 border-amber-300 font-bold text-sm">{inactiveCount}</Badge>
              <span className="text-xs text-amber-600">· 3+ days without practice</span>
            </div>
          </div>
        )}

        {/* Students table */}
        <Card>
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>All Students ({students.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {studentsWithData.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-4xl">👥</div>
                <div>
                  <h3 className="font-bold text-base">No Students</h3>
                  <p className="text-sm text-muted-foreground">Share code <span className="font-mono text-primary font-bold">{session.user.classCode}</span> to enroll students.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {studentsWithData.map((student) => (
                  <div
                    key={student.id}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3",
                      student.isInactive && "bg-amber-400/3"
                    )}
                  >
                    {/* Avatar */}
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0",
                      student.isInactive ? "bg-amber-400/10 text-amber-400" : "bg-primary/10 text-primary"
                    )}>
                      {student.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name + email */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{student.name}</p>
                        {student.isInactive && (
                          <Badge variant="outline" className="text-xs border-amber-400/30 text-amber-400">
                            Inactive {student.daysSinceActive}d
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-4">
                      {/* Band with progress bar */}
                      <div className="w-24 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Band</span>
                          <span className={cn(
                            "text-xs font-bold tabular-nums",
                            student.latestBand
                              ? student.latestBand >= 7 ? "text-emerald-600" : student.latestBand >= 6 ? "text-yellow-600" : "text-orange-500"
                              : "text-muted-foreground"
                          )}>
                            {student.latestBand ? student.latestBand.toFixed(1) : "—"}
                          </span>
                        </div>
                        {/* Progress component not available in server component, use div */}
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              student.latestBand
                                ? student.latestBand >= 7 ? "bg-emerald-500" : student.latestBand >= 6 ? "bg-yellow-500" : "bg-orange-400"
                                : "bg-muted-foreground/20"
                            )}
                            style={{ width: student.latestBand ? `${(student.latestBand / 9) * 100}%` : "0%" }}
                          />
                        </div>
                      </div>

                      {/* Streak badge */}
                      {student.streak > 0 ? (
                        <Badge variant="outline" className="text-xs border-orange-200 bg-orange-50 text-orange-700">
                          🔥 {student.streak}d
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">No streak</Badge>
                      )}

                      {/* Last active */}
                      <Badge variant="outline" className={cn(
                        "text-xs shrink-0",
                        !student.lastActiveDate ? "text-muted-foreground border-border/40" :
                        student.daysSinceActive === 0 ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                        student.daysSinceActive === 1 ? "border-primary/20 bg-primary/5 text-primary" :
                        "border-amber-200 bg-amber-50 text-amber-700"
                      )}>
                        {student.lastActiveDate
                          ? student.daysSinceActive === 0 ? "Today"
                          : student.daysSinceActive === 1 ? "Yesterday"
                          : `${student.daysSinceActive}d ago`
                          : "Never"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
