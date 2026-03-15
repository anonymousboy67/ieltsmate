"use client"

import { useEffect, useState } from "react"
import { Volume2, Check, RotateCcw, BookOpen, Star, RefreshCw } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface DailyWordData {
  word: { word: string; definition: string; pronunciation: string; exampleSentence: string; synonyms: string[]; topic: string; band: number }
  status: "new" | "learning" | "mastered"
}

export function DailyWordCard() {
  const [data, setData] = useState<DailyWordData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/words/daily")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false))
  }, [])

  async function markStatus(status: "mastered" | "learning") {
    if (!data || saving) return
    setSaving(true)
    try {
      await fetch("/api/words/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId: data.word.word, status }),
      })
      setData((prev) => (prev ? { ...prev, status } : prev))
    } finally {
      setSaving(false)
    }
  }

  function speak() {
    if (!data || typeof window === "undefined") return
    const utterance = new SpeechSynthesisUtterance(data.word.word)
    utterance.rate = 0.85
    utterance.lang = "en-GB"
    window.speechSynthesis.speak(utterance)
  }

  if (loading) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <div className="skeleton-shimmer h-4 w-32 rounded-lg" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="skeleton-shimmer h-7 w-48 rounded-lg" />
          <div className="skeleton-shimmer h-4 w-full rounded-lg" />
          <div className="skeleton-shimmer h-4 w-3/4 rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const { word } = data

  const statusConfig = {
    mastered: { label: "Mastered", icon: Check, class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    learning: { label: "Reviewing", icon: RotateCcw, class: "bg-orange-50 text-orange-700 border-orange-200" },
    new: { label: "New", icon: Star, class: "bg-primary/10 text-primary border-primary/20" },
  }
  const st = statusConfig[data.status]

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm bg-white">
      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Word of the Day</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
              {word.topic}
            </Badge>
            <Badge variant="outline" className="text-xs font-mono border-border/60">
              B{word.band}+
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{word.word}</h2>
              <button
                onClick={speak}
                className="w-7 h-7 rounded-full bg-secondary hover:bg-primary/10 hover:border-primary/20 border border-transparent flex items-center justify-center transition-colors"
                title="Hear pronunciation"
              >
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{word.pronunciation}</p>
          </div>
          <Badge variant="outline" className={`text-xs flex items-center gap-1 ${st.class}`}>
            <st.icon className="w-3 h-3" />
            {st.label}
          </Badge>
        </div>

        <p className="text-sm leading-relaxed text-foreground/90 line-clamp-2">{word.definition}</p>

        <div className="rounded-xl bg-primary/5 border border-primary/15 px-3 py-2.5 border-l-2 border-l-primary/60">
          <p className="text-xs text-primary/70 mb-1 font-semibold uppercase tracking-wide">Example</p>
          <p className="text-sm italic text-foreground/80 leading-relaxed line-clamp-2">
            &ldquo;{word.exampleSentence}&rdquo;
          </p>
        </div>

        {word.synonyms?.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Also:</span>
            {word.synonyms.slice(0, 4).map((syn) => (
              <span key={syn} className="text-xs bg-secondary border border-border/40 px-2 py-0.5 rounded-lg text-foreground/80">
                {syn}
              </span>
            ))}
          </div>
        )}

        {/* Mastery progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Mastery</span>
            <span className="font-mono">{data.status === "mastered" ? "100%" : data.status === "learning" ? "50%" : "0%"}</span>
          </div>
          <Progress value={data.status === "mastered" ? 100 : data.status === "learning" ? 50 : 0} className="h-1.5" />
        </div>
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        <Button
          size="sm"
          variant="secondary"
          className="flex-1 rounded-xl"
          onClick={() => markStatus("learning")}
          disabled={saving || data.status === "learning"}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Review later
        </Button>
        <Button
          size="sm"
          className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-white"
          onClick={() => markStatus("mastered")}
          disabled={saving || data.status === "mastered"}
        >
          <Check className="w-3.5 h-3.5" />
          I know this
        </Button>
      </CardFooter>
    </Card>
  )
}
