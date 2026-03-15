import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/lib/models/user"
import TestSession from "@/lib/models/test-session"
import Link from "next/link"
import { Mic, PenLine, BookOpen, TrendingUp, ArrowRight, Flame, Target, GraduationCap } from "lucide-react"
import { DailyWordCard } from "@/components/daily-word-card"
import { BAND_DESCRIPTIONS } from "@/lib/constants"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)!
  await connectDB()

  const [user, latestSession] = await Promise.all([
    User.findById(session!.user.id).select("name streak lastActiveDate").lean(),
    TestSession.findOne({ userId: session!.user.id }).sort({ completedAt: -1 }).select("scores completedAt").lean(),
  ])

  const streak = (user as { streak?: number })?.streak ?? 0
  const latestBand = (latestSession as { scores?: { overall?: number } } | null)?.scores?.overall ?? null
  const bandInfo = latestBand ? BAND_DESCRIPTIONS[Math.floor(latestBand)] : null
  const firstName = session!.user.name?.split(" ")[0] ?? "there"

  const quickActions = [
    {
      href: "/dashboard/speaking",
      label: "Speaking Test",
      desc: "Full mock exam · AI examiner",
      icon: Mic,
      gradient: "from-primary to-green-500",
      shadow: "shadow-green-200",
    },
    {
      href: "/dashboard/writing",
      label: "Writing Feedback",
      desc: "Task 1 & 2 · Instant feedback",
      icon: PenLine,
      gradient: "from-green-600 to-emerald-700",
      shadow: "shadow-green-200",
    },
    {
      href: "/dashboard/vocabulary",
      label: "Vocabulary",
      desc: "Daily words · Topic banks",
      icon: BookOpen,
      gradient: "from-emerald-400 to-green-600",
      shadow: "shadow-emerald-200",
    },
    {
      href: "/dashboard/learn",
      label: "Learn IELTS",
      desc: "Basics · Band guide · Tips",
      icon: GraduationCap,
      gradient: "from-teal-500 to-green-700",
      shadow: "shadow-teal-200",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-7">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Hey {firstName} {getEmoji()}
        </h1>
        <p className="text-muted-foreground mt-1">
          {streak > 0 ? `${streak}-day streak 🔥 You're crushing it.` : "Ready to practice? Let's go."}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Target className="w-4 h-4 text-primary" />}
          label="Current Band"
          value={latestBand ? latestBand.toFixed(1) : "—"}
          sub={bandInfo?.label ?? "No tests yet"}
          accent="primary"
        />
        <StatCard
          icon={<Flame className="w-4 h-4 text-orange-400" />}
          label="Day Streak"
          value={streak.toString()}
          sub={streak > 0 ? "days in a row" : "start today!"}
          accent="orange"
        />
        <StatCard
          icon={<Mic className="w-4 h-4 text-primary" />}
          label="Tests Done"
          value="—"
          sub="speaking tests"
          accent="primary"
        />
        <StatCard
          icon={<BookOpen className="w-4 h-4 text-emerald-500" />}
          label="Words Learned"
          value="—"
          sub="vocabulary"
          accent="emerald"
        />
      </div>

      {/* Daily word */}
      <DailyWordCard />

      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Practice</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map(({ href, label, desc, icon: Icon, gradient, shadow }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-border/50 hover:border-transparent hover:shadow-lg hover:shadow-black/5 transition-all duration-200 card-hover"
            >
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md ${shadow} shrink-0`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* First-time nudge */}
      {!latestSession && (
        <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center shrink-0 shadow-md shadow-green-200">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-green-900">First Speaking Test</p>
            <p className="text-xs text-green-700/70 mt-0.5">AI examiner · 3 parts · instant band score + feedback.</p>
            <Link
              href="/dashboard/speaking"
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-green-200"
            >
              Start now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  accent: string
}) {
  const accentMap: Record<string, string> = {
    primary: "text-primary",
    orange: "text-orange-500",
    emerald: "text-emerald-600",
  }
  return (
    <div className="bg-white rounded-2xl border border-border/50 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className={`text-2xl font-bold tabular-nums tracking-tight ${accentMap[accent] ?? ""}`}>{value}</div>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  )
}

function getEmoji() {
  const h = new Date().getHours()
  if (h < 12) return "☀️"
  if (h < 17) return "👋"
  return "🌙"
}
