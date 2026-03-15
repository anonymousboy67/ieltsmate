import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Headphones, PenLine, Mic, BarChart3, Clock, Target, GraduationCap, ChevronRight, Globe, Building2 } from "lucide-react"

const BAND_TABLE = [
  { band: 9, label: "Expert", pct: 100, color: "text-emerald-700 bg-emerald-100 border-emerald-300" },
  { band: 8, label: "Very Good", pct: 88, color: "text-green-700 bg-green-100 border-green-300" },
  { band: 7, label: "Good", pct: 77, color: "text-lime-700 bg-lime-100 border-lime-300" },
  { band: 6, label: "Competent", pct: 66, color: "text-yellow-700 bg-yellow-100 border-yellow-300" },
  { band: 5, label: "Modest", pct: 55, color: "text-amber-700 bg-amber-100 border-amber-300" },
  { band: 4, label: "Limited", pct: 44, color: "text-orange-700 bg-orange-100 border-orange-300" },
  { band: 3, label: "Very Limited", pct: 33, color: "text-red-700 bg-red-100 border-red-300" },
]

const SECTIONS = [
  {
    emoji: "🎧",
    icon: Headphones,
    title: "Listening",
    time: "30 min",
    questions: "40 Q",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    desc: "4 recordings of native speakers. Played once only.",
    tips: [
      "Read questions before audio starts",
      "Watch spelling — answers come from the audio",
      "Predict answers while reading",
      "10-min transfer time at the end",
    ],
  },
  {
    emoji: "📖",
    icon: BookOpen,
    title: "Reading",
    time: "60 min",
    questions: "40 Q",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    desc: "3 long passages from academic texts.",
    tips: [
      "Skim first, then read for detail",
      "'Not Given' ≠ False — text just doesn't say it",
      "Cover heading options and guess first",
      "Write answers directly on the answer sheet",
    ],
  },
  {
    emoji: "✍️",
    icon: PenLine,
    title: "Writing",
    time: "60 min",
    questions: "2 tasks",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    desc: "Task 1: describe a graph (150+ words). Task 2: essay (250+ words).",
    tips: [
      "Task 2 carries more weight than Task 1",
      "Always include an overview in Task 1",
      "State your position clearly in Task 2 intro",
      "Proofread — leave 2-3 min per task",
    ],
  },
  {
    emoji: "🎙️",
    icon: Mic,
    title: "Speaking",
    time: "11–14 min",
    questions: "3 parts",
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-200",
    desc: "Face-to-face with an examiner — interview, cue card, discussion.",
    tips: [
      "Speak at a natural pace — don't rush",
      "Use a wide range of vocabulary",
      "Self-correcting shows awareness — it's OK",
      "Develop Part 3 answers with reasons & examples",
    ],
  },
]

export default function LearnPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Learn IELTS</h1>
        </div>
        <p className="text-sm text-muted-foreground">Everything a beginner needs to know.</p>
      </div>

      {/* What is IELTS */}
      <section className="space-y-3">
        <SectionHeading icon={GraduationCap} label="What is IELTS?" />
        <Card>
          <CardContent className="py-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-xl shrink-0">🌍</div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">World&apos;s most popular English test</p>
                <p className="text-xs text-muted-foreground">Accepted by 11,000+ universities, employers & immigration authorities.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/60 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <p className="font-semibold text-sm">Academic</p>
                  <Badge variant="secondary" className="text-xs ml-auto">Most common</Badge>
                </div>
                <p className="text-xs text-muted-foreground">University admission & professional registration (doctors, nurses, engineers).</p>
              </div>
              <div className="rounded-xl border border-border/60 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <p className="font-semibold text-sm">General Training</p>
                </div>
                <p className="text-xs text-muted-foreground">Work experience or migration to Australia, Canada, NZ & UK.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 px-3 py-2.5">
              <ChevronRight className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-primary font-medium">Applying to university? You need <strong>Academic</strong>.</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Four sections */}
      <section className="space-y-3">
        <SectionHeading icon={BookOpen} label="The 4 Sections" />
        <div className="space-y-3">
          {SECTIONS.map((section) => (
            <Card key={section.title}>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-2xl border ${section.bg} flex items-center justify-center text-2xl shrink-0`}>
                    {section.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{section.title}</CardTitle>
                      <div className="flex items-center gap-1.5 ml-auto">
                        <Badge variant="outline" className="text-xs flex items-center gap-1 border-border/50">
                          <Clock className="w-3 h-3" />{section.time}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">{section.questions}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{section.desc}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl bg-secondary/50 p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tips</p>
                  {section.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <ChevronRight className={`w-3.5 h-3.5 ${section.color} mt-0.5 shrink-0`} />
                      <span className="text-foreground/75">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Band scores */}
      <section className="space-y-3">
        <SectionHeading icon={BarChart3} label="Band Score Guide (0–9)" />
        <Card>
          <CardContent className="py-4 space-y-2">
            <div className="flex items-center gap-2 rounded-xl bg-secondary/40 px-3 py-2 mb-3">
              <BarChart3 className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">Overall = average of 4 sections, rounded to nearest 0.5.</p>
            </div>
            <div className="space-y-2.5">
              {BAND_TABLE.map(({ band, label, pct, color }) => (
                <div key={band} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-sm ${color} shrink-0`}>
                    {band}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{label}</span>
                      <span className="text-xs text-muted-foreground font-mono">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Target bands */}
      <section className="space-y-3">
        <SectionHeading icon={Target} label="What Score Do You Need?" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { dest: "Australia", detail: "Student Visa", score: "6.0", min: "5.5 each" },
            { dest: "United Kingdom", detail: "Student Visa", score: "6.0–7.0", min: "by course" },
            { dest: "Canada", detail: "Study Permit", score: "6.0–6.5", min: "overall" },
            { dest: "USA", detail: "Universities", score: "6.5–7.5", min: "varies" },
            { dest: "Nepal Medical", detail: "College", score: "6.5–7.0", min: "check institution" },
            { dest: "Nepal Engineering", detail: "University", score: "6.0–7.0", min: "varies" },
          ].map(({ dest, detail, score, min }) => (
            <div key={dest} className="flex items-center gap-3 rounded-xl bg-secondary/40 border border-border/40 px-3 py-3">
              <Target className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold">{dest}</p>
                  <span className="text-xs text-muted-foreground">· {detail}</span>
                </div>
                <p className="text-xs text-muted-foreground">{min}</p>
              </div>
              <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary shrink-0">{score}</Badge>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground px-1">* Always verify with the specific institution. These are approximate minimums.</p>
      </section>
    </div>
  )
}

function SectionHeading({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h2 className="font-bold text-base">{label}</h2>
    </div>
  )
}
