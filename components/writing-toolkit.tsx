"use client"

import { useState } from "react"
import { Tabs } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Copy, Check, BarChart3, PenLine, TrendingUp, TrendingDown, Minus, Activity } from "lucide-react"
import { GRAPH_LANGUAGE, ESSAY_TYPES } from "@/lib/constants"
import { cn } from "@/lib/utils"

type WritingTab = "toolkit" | "task1-feedback" | "task2-feedback"

export function WritingToolkit() {
  const [activeTab, setActiveTab] = useState<WritingTab>("toolkit")

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1 w-fit">
        {(
          [
            { id: "toolkit", label: "Graph Language", icon: BarChart3 },
            { id: "task1-feedback", label: "Task 1 Feedback", icon: TrendingUp },
            { id: "task2-feedback", label: "Task 2 Feedback", icon: PenLine },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              activeTab === id
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "toolkit" && <GraphLanguageToolkit />}
      {activeTab === "task1-feedback" && <WritingFeedbackForm taskType="task1" />}
      {activeTab === "task2-feedback" && <WritingFeedbackForm taskType="task2" />}
    </div>
  )
}

// ── Graph Language Toolkit ──────────────────────────────

function GraphLanguageToolkit() {
  const [activeCategory, setActiveCategory] = useState("upward")
  const [copied, setCopied] = useState<string | null>(null)

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 1500)
  }

  const categories = [
    { id: "upward", label: "Upward", icon: TrendingUp, color: "text-emerald-400" },
    { id: "downward", label: "Downward", icon: TrendingDown, color: "text-rose-400" },
    { id: "stable", label: "Stable", icon: Minus, color: "text-blue-400" },
    { id: "fluctuating", label: "Fluctuating", icon: Activity, color: "text-amber-400" },
    { id: "peakTrough", label: "Peak/Trough", icon: BarChart3, color: "text-purple-400" },
    { id: "fractions", label: "Fractions", icon: BarChart3, color: "text-cyan-400" },
    { id: "comparison", label: "Comparison", icon: BarChart3, color: "text-orange-400" },
    { id: "time", label: "Time", icon: BarChart3, color: "text-pink-400" },
  ] as const

  const data = GRAPH_LANGUAGE[activeCategory as keyof typeof GRAPH_LANGUAGE]

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">
            Click any word or phrase to copy it. Use these in your Task 1 responses to improve your <strong className="text-foreground">Lexical Resource</strong> band score.
          </p>
        </CardContent>
      </Card>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              activeCategory === id
                ? `bg-card border-primary/50 text-foreground`
                : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <Icon className={cn("w-3 h-3", activeCategory === id ? color : "")} />
            {label}
          </button>
        ))}
      </div>

      {/* Vocabulary display */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm capitalize">
            {categories.find((c) => c.id === activeCategory)?.label} Vocabulary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {"verbs" in data && (
            <VocabSection
              title="Verbs"
              items={data.verbs as readonly string[]}
              onCopy={copyToClipboard}
              copied={copied}
            />
          )}
          {"adjectives" in data && (
            <VocabSection
              title="Adjectives"
              items={data.adjectives as readonly string[]}
              onCopy={copyToClipboard}
              copied={copied}
            />
          )}
          {"adverbs" in data && (
            <VocabSection
              title="Adverbs"
              items={data.adverbs as readonly string[]}
              onCopy={copyToClipboard}
              copied={copied}
            />
          )}
          {"phrases" in data && (
            <VocabSection
              title="Phrases"
              items={data.phrases as readonly string[]}
              onCopy={copyToClipboard}
              copied={copied}
            />
          )}
        </CardContent>
      </Card>

      {/* Example sentences */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Example usage</CardTitle>
        </CardHeader>
        <CardContent>
          <ExampleSentence category={activeCategory} />
        </CardContent>
      </Card>
    </div>
  )
}

function VocabSection({
  title,
  items,
  onCopy,
  copied,
}: {
  title: string
  items: readonly string[]
  onCopy: (t: string) => void
  copied: string | null
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onCopy(item)}
            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 border border-border/50 hover:border-primary/30 text-sm transition-all"
          >
            <span>{item}</span>
            {copied === item ? (
              <Check className="w-3 h-3 text-primary" />
            ) : (
              <Copy className="w-3 h-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function ExampleSentence({ category }: { category: string }) {
  const examples: Record<string, string> = {
    upward: "The number of internet users rose sharply from 500 million in 2000 to over 4 billion by 2020.",
    downward: "Carbon emissions fell significantly during the pandemic, dropping by approximately 7% in 2020.",
    stable: "The unemployment rate remained relatively stable at around 5% throughout the mid-2010s.",
    fluctuating: "The price of oil fluctuated erratically between 2014 and 2016 before eventually stabilising.",
    peakTrough: "Sales reached their peak of £2.3 million in Q3 before hitting a low of £800,000 in January.",
    fractions: "The proportion of people using public transport doubled over the 20-year period, rising from one-quarter to half of all commuters.",
    comparison: "By 2010, mobile phone usage had surpassed that of landlines, with the gap continuing to widen thereafter.",
    time: "Over the period shown, there was a steady upward trend in renewable energy production throughout the period.",
  }
  return (
    <p className="text-sm italic text-foreground/80 leading-relaxed">
      &ldquo;{examples[category] ?? "Select a category to see an example sentence."}&rdquo;
    </p>
  )
}

// ── Writing Feedback Form ──────────────────────────────

function WritingFeedbackForm({ taskType }: { taskType: "task1" | "task2" }) {
  const [question, setQuestion] = useState("")
  const [response, setResponse] = useState("")
  const [feedback, setFeedback] = useState("")
  const [parsedFeedback, setParsedFeedback] = useState<{
    scores: Record<string, number>
    feedback: Record<string, string | string[]>
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [essayType, setEssayType] = useState<string>(ESSAY_TYPES[0].id)

  const wordCount = response.trim().split(/\s+/).filter(Boolean).length
  const minWords = taskType === "task1" ? 150 : 250
  const wordCountColor = wordCount >= minWords ? "text-emerald-400" : wordCount >= minWords * 0.8 ? "text-amber-400" : "text-muted-foreground"

  async function getFeedback() {
    if (response.trim().length < 50) return
    setLoading(true)
    setFeedback("")
    setParsedFeedback(null)
    let full = ""

    try {
      const res = await fetch("/api/writing/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType, question, response }),
      })

      if (!res.body) throw new Error("No stream")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") break
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                full += parsed.text
                setFeedback(full)
              }
            } catch { /* ignore */ }
          }
        }
      }

      // Try to parse the JSON feedback
      try {
        const parsed = JSON.parse(full)
        setParsedFeedback(parsed)
      } catch { /* raw text mode */ }
    } catch (err) {
      console.error("Feedback error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {taskType === "task1" ? (
        <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
          <BarChart3 className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs text-foreground/80 flex-1">Describe a graph/chart. Get instant band scores for all 4 criteria.</p>
          <Badge variant="outline" className="text-xs border-primary/30 text-primary shrink-0">150+ words</Badge>
        </div>
      ) : (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Essay type</p>
          <div className="flex flex-wrap gap-2">
            {ESSAY_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setEssayType(type.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  essayType === type.id
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Task question <span className="text-muted-foreground/50">(optional — helps for better feedback)</span>
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={
            taskType === "task1"
              ? "The chart shows... Summarise the information by selecting and reporting the main features..."
              : "Some people believe that... To what extent do you agree or disagree?"
          }
          rows={2}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">Your response</label>
          <span className={cn("text-xs font-mono", wordCountColor)}>
            {wordCount} words {wordCount >= minWords ? "✓" : `(min ${minWords})`}
          </span>
        </div>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Paste or type your response here..."
          rows={10}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none leading-relaxed"
        />
      </div>

      <Button
        onClick={getFeedback}
        className="w-full h-10"
        disabled={loading || response.trim().length < 50}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Getting feedback...
          </>
        ) : (
          "Get AI Feedback"
        )}
      </Button>

      {/* Feedback results */}
      {parsedFeedback && <FeedbackResults data={parsedFeedback} taskType={taskType} />}

      {/* Streaming feedback (before parsing completes) */}
      {feedback && !parsedFeedback && (
        <Card>
          <CardContent className="py-4">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{feedback}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function FeedbackResults({
  data,
  taskType,
}: {
  data: { scores: Record<string, number>; feedback: Record<string, string | string[]> }
  taskType: "task1" | "task2"
}) {
  const scoreLabels =
    taskType === "task1"
      ? { taskAchievement: "Task Achievement", coherenceCohesion: "Coherence & Cohesion", lexicalResource: "Lexical Resource", grammaticalRange: "Grammatical Range" }
      : { taskResponse: "Task Response", coherenceCohesion: "Coherence & Cohesion", lexicalResource: "Lexical Resource", grammaticalRange: "Grammatical Range" }

  const overall = data.scores?.overall ?? 0
  const bandColor = overall >= 7.5 ? "text-emerald-400" : overall >= 6.5 ? "text-lime-400" : overall >= 5.5 ? "text-yellow-400" : "text-orange-400"

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
        <CardContent className="py-5">
          <div className="flex items-center gap-5">
            <div className="text-center shrink-0">
              <div className={`text-4xl font-bold tabular-nums ${bandColor}`}>{overall?.toFixed?.(1)}</div>
              <p className="text-xs text-muted-foreground mt-0.5">Overall Band</p>
            </div>
            {data.feedback?.summary && (
              <p className="text-sm text-foreground/80 leading-relaxed">{data.feedback.summary as string}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(scoreLabels).map(([key, label]) => (
          <Card key={key}>
            <CardContent className="py-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-muted-foreground">{label}</span>
                <Badge variant="secondary" className="font-mono text-xs">{data.scores?.[key]?.toFixed?.(1)}</Badge>
              </div>
              <Progress value={((data.scores?.[key] ?? 0) / 9) * 100} className="h-1.5" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.isArray(data.feedback?.strengths) && data.feedback.strengths.length > 0 && (
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Check className="w-3.5 h-3.5" /> Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1.5">
              {(data.feedback.strengths as string[]).map((s, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-emerald-800">
                  <Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                  {s}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {Array.isArray(data.feedback?.improvements) && data.feedback.improvements.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-amber-700 flex items-center gap-1.5 uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" /> Improvements
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1.5">
              {(data.feedback.improvements as string[]).map((s, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-amber-800">
                  <TrendingUp className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                  {s}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {(data.feedback?.improvedSentence ?? data.feedback?.improvedVersion) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Improved sentence example</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm italic text-foreground/80 leading-relaxed">
              &ldquo;{(data.feedback?.improvedSentence ?? data.feedback?.improvedVersion) as string}&rdquo;
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
