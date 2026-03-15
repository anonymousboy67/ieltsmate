"use client"

import { useState, useEffect } from "react"
import { Volume2, Check, RotateCcw, Search, BookOpen, Star, Layers } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { WORD_BANK, WordEntry } from "@/lib/word-bank"
import { IELTS_TOPICS } from "@/lib/constants"
import { cn } from "@/lib/utils"

type WordStatus = "new" | "learning" | "mastered"

interface ProgressMap {
  [word: string]: WordStatus
}

export function VocabularyPage() {
  const [activeTopic, setActiveTopic] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [progressMap, setProgressMap] = useState<ProgressMap>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [stats, setStats] = useState({ mastered: 0, learning: 0, total: 0 })

  useEffect(() => {
    fetch("/api/words/progress")
      .then((r) => r.json())
      .then((data) => {
        const map: ProgressMap = {}
        for (const p of data.allProgress ?? []) {
          map[p.wordId] = p.status
        }
        setProgressMap(map)
        setStats({
          mastered: data.stats?.mastered ?? 0,
          learning: data.stats?.learning ?? 0,
          total: WORD_BANK.length,
        })
      })
      .catch(() => { /* silent fail */ })
  }, [])

  const topics = ["All", ...IELTS_TOPICS]

  const filteredWords = WORD_BANK.filter((w) => {
    const matchesTopic = activeTopic === "All" || w.topic === activeTopic
    const matchesSearch =
      searchQuery === "" ||
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.definition.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTopic && matchesSearch
  })

  async function updateStatus(word: string, status: WordStatus) {
    setSaving(word)
    try {
      await fetch("/api/words/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId: word, status }),
      })
      setProgressMap((prev) => ({ ...prev, [word]: status }))
      setStats((prev) => {
        const oldStatus = progressMap[word]
        const updated = { ...prev }
        if (oldStatus === "mastered") updated.mastered--
        if (oldStatus === "learning") updated.learning--
        if (status === "mastered") updated.mastered++
        if (status === "learning") updated.learning++
        return updated
      })
    } finally {
      setSaving(null)
    }
  }

  function speak(word: string) {
    if (typeof window === "undefined") return
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.rate = 0.85
    utterance.lang = "en-GB"
    window.speechSynthesis.speak(utterance)
  }

  const masteredPct = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-xs text-muted-foreground">Mastered</p>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{stats.mastered}</div>
            <Progress value={(stats.mastered / stats.total) * 100} className="h-1 mt-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-xs text-muted-foreground">Reviewing</p>
            </div>
            <div className="text-2xl font-bold text-amber-600">{stats.learning}</div>
            <Progress value={(stats.learning / stats.total) * 100} className="h-1 mt-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <Progress value={masteredPct} className="h-1 mt-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Overall progress */}
      <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
        <BookOpen className="w-4 h-4 text-primary shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-primary">Vocabulary Progress</span>
            <span className="text-xs font-bold tabular-nums text-primary">{masteredPct}%</span>
          </div>
          <Progress value={masteredPct} className="h-2" />
        </div>
        <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary shrink-0">
          {stats.mastered}/{stats.total}
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search words or definitions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 rounded-xl border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
      </div>

      {/* Topic filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {topics.map((topic) => {
          const count = topic === "All" ? WORD_BANK.length : WORD_BANK.filter((w) => w.topic === topic).length
          return (
            <button
              key={topic}
              onClick={() => setActiveTopic(topic)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                activeTopic === topic
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {topic} <span className="opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Word list */}
      <div className="space-y-2">
        {filteredWords.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center text-3xl">🔍</div>
            <div>
              <h3 className="font-bold text-base">Not Found</h3>
              <p className="text-sm text-muted-foreground">Try a different word or topic.</p>
            </div>
          </div>
        ) : (
          filteredWords.map((word) => (
            <WordCard
              key={`${word.word}-${word.topic}`}
              word={word}
              status={progressMap[word.word] ?? "new"}
              saving={saving === word.word}
              onSpeak={() => speak(word.word)}
              onMarkLearning={() => updateStatus(word.word, "learning")}
              onMarkMastered={() => updateStatus(word.word, "mastered")}
            />
          ))
        )}
      </div>
    </div>
  )
}

function WordCard({
  word,
  status,
  saving,
  onSpeak,
  onMarkLearning,
  onMarkMastered,
}: {
  word: WordEntry
  status: WordStatus
  saving: boolean
  onSpeak: () => void
  onMarkLearning: () => void
  onMarkMastered: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const statusBadge = {
    mastered: <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"><Check className="w-3 h-3 mr-0.5" />Mastered</Badge>,
    learning: <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs"><RotateCcw className="w-3 h-3 mr-0.5" />Reviewing</Badge>,
    new: <Badge className="bg-primary/5 text-primary border-primary/20 text-xs"><Star className="w-3 h-3 mr-0.5" />New</Badge>,
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-150",
        status === "mastered" && "opacity-70",
        expanded && "ring-1 ring-primary/30"
      )}
    >
      <CardContent
        className="py-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{word.word}</span>
              <span className="text-xs text-muted-foreground font-mono">{word.pronunciation}</span>
              <Badge variant="outline" className="text-xs border-border/50">{word.topic}</Badge>
              <Badge variant="secondary" className="text-xs font-mono">B{word.band}+</Badge>
              {statusBadge[status]}
            </div>
            {!expanded && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{word.definition}</p>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onSpeak() }}
            className="shrink-0 w-7 h-7 rounded-full bg-secondary hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {expanded && (
          <div className="mt-3 space-y-2.5 border-t border-border/50 pt-3">
            <p className="text-sm text-foreground/90">{word.definition}</p>

            <div className="rounded-lg bg-primary/5 border-l-2 border-primary/40 px-3 py-2">
              <p className="text-xs italic text-foreground/75">&ldquo;{word.exampleSentence}&rdquo;</p>
            </div>

            {word.synonyms?.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-muted-foreground font-medium">Synonyms:</span>
                {word.synonyms.map((s) => (
                  <span key={s} className="text-xs bg-secondary px-2 py-0.5 rounded-md">{s}</span>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 h-8 text-xs"
                onClick={onMarkLearning}
                disabled={saving || status === "learning"}
              >
                <RotateCcw className="w-3 h-3" />
                Review later
              </Button>
              <Button
                size="sm"
                className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90"
                onClick={onMarkMastered}
                disabled={saving || status === "mastered"}
              >
                <Check className="w-3 h-3" />
                Mastered
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
