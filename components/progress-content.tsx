"use client"

import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Flame, Mic, AlertCircle, Target, Hash, Zap } from "lucide-react"
import { BAND_DESCRIPTIONS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface ProgressData {
  totalSessions: number
  streak: number
  latestBand: number | null
  avgScores: {
    fluency: number
    vocabulary: number
    grammar: number
    pronunciation: number
    overall: number
  } | null
  weakestArea: string | null
  chartData: Array<{
    session: string
    date: string
    fluency: number
    vocabulary: number
    grammar: number
    pronunciation: number
    overall: number
  }>
  recentSessions: Array<{ id: string; overall: number; completedAt: string }>
}

export function ProgressContent() {
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-shimmer h-36 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!data || data.totalSessions === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-5xl shrink-0">
          📊
        </div>
        <div>
          <h3 className="font-bold text-xl">No Tests</h3>
          <p className="text-sm text-muted-foreground mt-1">Complete a Speaking test to unlock your progress charts.</p>
        </div>
      </div>
    )
  }

  const bandInfo = data.latestBand ? BAND_DESCRIPTIONS[Math.floor(data.latestBand)] : null
  const bandColor = data.latestBand
    ? data.latestBand >= 7.5 ? "text-emerald-600" : data.latestBand >= 6.5 ? "text-lime-600" : data.latestBand >= 5.5 ? "text-yellow-600" : "text-orange-500"
    : "text-muted-foreground"

  const radarData = data.avgScores
    ? [
        { skill: "Fluency", score: data.avgScores.fluency, fullMark: 9 },
        { skill: "Vocabulary", score: data.avgScores.vocabulary, fullMark: 9 },
        { skill: "Grammar", score: data.avgScores.grammar, fullMark: 9 },
        { skill: "Pronunciation", score: data.avgScores.pronunciation, fullMark: 9 },
      ]
    : []

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Target className="w-4 h-4 text-primary" />} label="Latest Band" value={data.latestBand ? data.latestBand.toFixed(1) : "—"} sub={bandInfo?.label ?? "No data"} valueClass={bandColor} />
        <StatCard icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} label="Avg Band" value={data.avgScores ? data.avgScores.overall.toFixed(1) : "—"} sub="all sessions" />
        <StatCard icon={<Flame className="w-4 h-4 text-orange-400" />} label="Streak" value={data.streak.toString()} sub={data.streak > 0 ? "days 🔥" : "start today"} />
        <StatCard icon={<Hash className="w-4 h-4 text-primary" />} label="Total Tests" value={data.totalSessions.toString()} sub="speaking tests" />
      </div>

      {/* Weakest area */}
      {data.weakestArea && (
        <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-amber-800">Focus Area</span>
            <Badge className="bg-amber-100 text-amber-700 border-amber-300 font-semibold text-xs">
              <Zap className="w-3 h-3 mr-1" />{data.weakestArea}
            </Badge>
          </div>
        </div>
      )}

      {/* Band score trend chart */}
      {data.chartData.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Band Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 145)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }} />
                <YAxis domain={[0, 9]} tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid oklch(0.9 0.02 145)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="overall" stroke="oklch(0.58 0.20 145)" strokeWidth={2.5} dot={{ fill: "oklch(0.58 0.20 145)", r: 4 }} name="Overall" />
                <Line type="monotone" dataKey="fluency" stroke="oklch(0.65 0.13 160)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Fluency" />
                <Line type="monotone" dataKey="vocabulary" stroke="oklch(0.55 0.15 200)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Vocabulary" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Skills radar */}
      {radarData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary" />
              Skills Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="oklch(0.9 0.02 145)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "oklch(0.4 0 0)" }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="oklch(0.58 0.20 145)"
                    fill="oklch(0.58 0.20 145)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-2 md:w-52 shrink-0">
                {radarData.map(({ skill, score }) => (
                  <div key={skill} className="rounded-xl bg-secondary/50 px-3 py-3 text-center space-y-1">
                    <div className={cn("text-xl font-bold tabular-nums", bandColor)}>{score.toFixed(1)}</div>
                    <Progress value={(score / 9) * 100} className="h-1" />
                    <p className="text-xs text-muted-foreground">{skill}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent sessions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.recentSessions.map((session, i) => {
            const bc = session.overall >= 7 ? "text-emerald-600 bg-emerald-50 border-emerald-200" : session.overall >= 6 ? "text-yellow-600 bg-yellow-50 border-yellow-200" : "text-orange-500 bg-orange-50 border-orange-200"
            return (
              <div key={session.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground shrink-0">
                  {data.totalSessions - i}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-medium">Speaking Test</span>
                    </div>
                    <Badge variant="outline" className={cn("font-mono font-bold text-xs", bc)}>
                      {session.overall.toFixed(1)}
                    </Badge>
                  </div>
                  <Progress value={(session.overall / 9) * 100} className="h-1" />
                  <p className="text-xs text-muted-foreground">
                    {session.completedAt
                      ? new Date(session.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : "Unknown date"}
                  </p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon, label, value, sub, valueClass }: { icon: React.ReactNode; label: string; value: string; sub: string; valueClass?: string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          {icon}
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <div className={cn("text-2xl font-bold tabular-nums tracking-tight", valueClass)}>{value}</div>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  )
}
