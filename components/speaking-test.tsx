"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Mic, MicOff, Volume2, VolumeX, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SPEAKING_PARTS } from "@/lib/constants"

// CUE_CARDS synced with the API
const CUE_CARDS = [
  {
    topic: "Describe a place you have visited that made a strong impression on you.",
    points: ["Where it was", "When you went there", "What you saw or did", "Explain why it made such a strong impression"],
  },
  {
    topic: "Describe a person who has had an important influence on your life.",
    points: ["Who this person is", "How you know them", "What qualities they have", "Explain why they have influenced you"],
  },
]

type TestPhase =
  | "intro"
  | "part1-active"
  | "part2-prep"
  | "part2-speak"
  | "part3-active"
  | "scoring"
  | "results"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface ScoreResult {
  scores: { fluency: number; vocabulary: number; grammar: number; pronunciation: number; overall: number }
  feedback: {
    summary: string
    fluency: string
    vocabulary: string
    grammar: string
    pronunciation: string
    strengths: string[]
    improvements: string[]
    nextSteps: string
  }
}

// Speech recognition type declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string
}
interface SpeechRecognitionType extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionType
    webkitSpeechRecognition: new () => SpeechRecognitionType
  }
}

export function SpeakingTest() {
  const [phase, setPhase] = useState<TestPhase>("intro")
  const [messages, setMessages] = useState<Message[]>([])
  const [examinerText, setExaminerText] = useState("")
  const [isExaminerTalking, setIsExaminerTalking] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [prepCountdown, setPrepCountdown] = useState<number>(SPEAKING_PARTS.PART2.prepTime)
  const [speakCountdown, setSpeakCountdown] = useState<number>(SPEAKING_PARTS.PART2.speakTime)
  const [part1Transcript, setPart1Transcript] = useState("")
  const [part2Transcript, setPart2Transcript] = useState("")
  const [part3Transcript, setPart3Transcript] = useState("")
  const [currentPart, setCurrentPart] = useState(1)
  const [results, setResults] = useState<ScoreResult | null>(null)
  const [speechSupported, setSpeechSupported] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [cueCardIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  const recognitionRef = useRef<SpeechRecognitionType | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentTranscriptRef = useRef("")

  // Check browser support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition
      if (!SR) setSpeechSupported(false)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, examinerText])

  // Text-to-speech helper
  const speak = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === "undefined") return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.lang = "en-GB"
    setIsExaminerTalking(true)
    utterance.onend = () => setIsExaminerTalking(false)
    window.speechSynthesis.speak(utterance)
  }, [voiceEnabled])

  // Send message to Claude and stream response
  const sendToExaminer = useCallback(async (userMessage: string, part: number) => {
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }]
    setMessages(newMessages)
    setLoading(true)

    let fullResponse = ""
    setExaminerText("")

    try {
      const res = await fetch("/api/speaking/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, part, cueCardIndex }),
      })

      if (!res.body) throw new Error("No stream")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") break
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                fullResponse += parsed.text
                setExaminerText(fullResponse)
              }
            } catch { /* ignore malformed chunks */ }
          }
        }
      }

      const assistantMsg: Message = { role: "assistant", content: fullResponse }
      setMessages([...newMessages, assistantMsg])
      setExaminerText("")
      speak(fullResponse)
    } catch (err) {
      console.error("Examiner error:", err)
    } finally {
      setLoading(false)
    }
  }, [messages, cueCardIndex, speak])

  // Start speech recognition
  function startRecording() {
    if (!speechSupported) return
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"
    currentTranscriptRef.current = transcript

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ""
      let final = currentTranscriptRef.current
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + " "
        } else {
          interim += event.results[i][0].transcript
        }
      }
      currentTranscriptRef.current = final
      setTranscript(final + interim)
    }

    recognition.onerror = () => {
      setIsRecording(false)
    }

    recognition.onend = () => {
      if (isRecording) recognition.start() // keep going while recording
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }

  function stopRecording(): string {
    recognitionRef.current?.stop()
    setIsRecording(false)
    const finalTranscript = currentTranscriptRef.current.trim()
    return finalTranscript
  }

  // ── PHASE HANDLERS ──────────────────────────────────

  async function startTest() {
    setPhase("part1-active")
    setCurrentPart(1)
    const opening = "Good morning. I'm your IELTS examiner today. Can I see your identification please? Thank you. My name is Alex. Now in this first part, I'd like to ask you some questions about yourself. Let's talk about where you live. Where are you from originally?"
    await sendToExaminer(opening, 1)
  }

  async function submitPart1Answer() {
    const said = stopRecording()
    const combined = part1Transcript + " " + said
    setPart1Transcript(combined.trim())
    setTranscript("")
    currentTranscriptRef.current = ""

    // Check if we should move to Part 2
    const totalExchanges = messages.filter((m) => m.role === "user").length
    if (totalExchanges >= 4) {
      await sendToExaminer(said, 1)
      setTimeout(() => moveToPart2(), 2000)
    } else {
      await sendToExaminer(said, 1)
    }
  }

  function moveToPart2() {
    setPhase("part2-prep")
    setCurrentPart(2)
    setPrepCountdown(SPEAKING_PARTS.PART2.prepTime)
    const card = CUE_CARDS[cueCardIndex]
    speak(`Thank you. That's the end of Part 1. Now I'd like you to talk about a topic. I'm going to give you a topic and I'd like you to talk about it for one to two minutes. You have one minute to think about what you're going to say. You can make some notes if you wish. Here is your topic: ${card.topic}`)

    // Start prep countdown
    timerRef.current = setInterval(() => {
      setPrepCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          startPart2Speaking()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function startPart2Speaking() {
    setPhase("part2-speak")
    setSpeakCountdown(SPEAKING_PARTS.PART2.speakTime)
    speak("Now, please start speaking.")
    startRecording()

    // 2-minute countdown
    timerRef.current = setInterval(() => {
      setSpeakCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          finishPart2Speaking()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function finishPart2Speaking() {
    const said = stopRecording()
    setPart2Transcript(said)
    setTranscript("")
    currentTranscriptRef.current = ""
    setPhase("part3-active")
    setCurrentPart(3)
    await sendToExaminer(said, 2)
    setTimeout(async () => {
      await sendToExaminer("Ready for Part 3.", 3)
    }, 1500)
  }

  async function submitPart3Answer() {
    const said = stopRecording()
    const combined = part3Transcript + " " + said
    setPart3Transcript(combined.trim())
    setTranscript("")
    currentTranscriptRef.current = ""

    const totalPart3Exchanges = messages.filter((m) => m.role === "user" && currentPart === 3).length
    if (totalPart3Exchanges >= 3) {
      await sendToExaminer(said, 3)
      setTimeout(() => scoreTest(part1Transcript, part2Transcript, combined.trim()), 2000)
    } else {
      await sendToExaminer(said, 3)
    }
  }

  async function scoreTest(p1: string, p2: string, p3: string) {
    setPhase("scoring")
    speak("That's the end of the Speaking test. Thank you very much.")
    try {
      const res = await fetch("/api/speaking/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ part1Transcript: p1, part2Transcript: p2, part3Transcript: p3 }),
      })
      const data = await res.json()
      setResults(data)
      setPhase("results")
    } catch {
      console.error("Scoring failed")
    }
  }

  function resetTest() {
    setPhase("intro")
    setMessages([])
    setExaminerText("")
    setPart1Transcript("")
    setPart2Transcript("")
    setPart3Transcript("")
    setTranscript("")
    setCurrentPart(1)
    setResults(null)
    currentTranscriptRef.current = ""
    if (timerRef.current) clearInterval(timerRef.current)
    window.speechSynthesis?.cancel()
  }

  // ── RENDER ───────────────────────────────────────────

  if (!speechSupported) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="w-24 h-24 rounded-3xl bg-destructive/10 flex items-center justify-center text-5xl">🎤</div>
        <div>
          <h3 className="font-bold text-xl">Use Chrome</h3>
          <p className="text-sm text-muted-foreground">Safari doesn&apos;t support speech recognition. Switch to Chrome or Edge.</p>
        </div>
      </div>
    )
  }

  if (phase === "intro") return <TestIntro onStart={startTest} />

  if (phase === "results" && results) return <TestResults results={results} onRetry={resetTest} />

  if (phase === "scoring") {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-5xl">🤖</div>
        <div>
          <h3 className="font-bold text-xl">Scoring Test</h3>
          <p className="text-sm text-muted-foreground">AI is analysing fluency, vocabulary, grammar & pronunciation.</p>
        </div>
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Part indicator */}
      <div className="flex items-center gap-3">
        {[1, 2, 3].map((p) => (
          <div
            key={p}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all",
              currentPart === p
                ? "bg-primary/15 text-primary border border-primary/30"
                : currentPart > p
                ? "bg-emerald-400/10 text-emerald-400"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {currentPart > p ? <CheckCircle2 className="w-3 h-3" /> : null}
            Part {p}
          </div>
        ))}
      </div>

      {/* Part 2 cue card */}
      {(phase === "part2-prep" || phase === "part2-speak") && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Cue Card — Part 2</CardTitle>
              <div className="text-sm font-mono font-bold text-primary">
                {phase === "part2-prep"
                  ? `Prep: ${prepCountdown}s`
                  : `Speaking: ${speakCountdown}s`}
              </div>
            </div>
            {phase === "part2-prep" && (
              <Progress value={((SPEAKING_PARTS.PART2.prepTime - prepCountdown) / SPEAKING_PARTS.PART2.prepTime) * 100} className="h-1.5 mt-2" />
            )}
            {phase === "part2-speak" && (
              <Progress value={((SPEAKING_PARTS.PART2.speakTime - speakCountdown) / SPEAKING_PARTS.PART2.speakTime) * 100} className="h-1.5 mt-2" />
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-medium">{CUE_CARDS[cueCardIndex].topic}</p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">You should say:</p>
              {CUE_CARDS[cueCardIndex].points.map((point, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation */}
      <Card>
        <CardHeader className="pb-2 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", isExaminerTalking ? "bg-primary animate-pulse" : "bg-muted")} />
              AI Examiner
            </CardTitle>
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled)
                if (!voiceEnabled) window.speechSynthesis?.cancel()
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title={voiceEnabled ? "Mute examiner voice" : "Unmute examiner voice"}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </CardHeader>

        <CardContent className="py-4 space-y-3 min-h-[200px] max-h-[320px] overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                msg.role === "assistant" ? "justify-start" : "justify-end"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm",
                  msg.role === "assistant"
                    ? "bg-secondary text-foreground rounded-tl-sm"
                    : "bg-primary text-primary-foreground rounded-tr-sm"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Streaming examiner text */}
          {(examinerText || loading) && (
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-secondary rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm">
                {loading && !examinerText ? (
                  <div className="flex gap-1 py-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                ) : (
                  <span className="streaming-text">{examinerText}</span>
                )}
              </div>
            </div>
          )}

          {/* Live transcript */}
          {transcript && (
            <div className="flex justify-end">
              <div className="max-w-[85%] bg-primary/20 border border-primary/30 rounded-xl rounded-tr-sm px-3.5 py-2.5 text-sm text-primary italic">
                {transcript}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {(phase === "part1-active" || phase === "part3-active") && (
          <>
            {!isRecording ? (
              <Button onClick={startRecording} className="flex-1 h-11" size="lg">
                <Mic className="w-4 h-4" />
                Start speaking
              </Button>
            ) : (
              <Button
                onClick={phase === "part1-active" ? submitPart1Answer : submitPart3Answer}
                className="flex-1 h-11 recording-pulse"
                variant="destructive"
                size="lg"
              >
                <MicOff className="w-4 h-4" />
                Done, send answer
              </Button>
            )}
          </>
        )}

        {phase === "part2-prep" && (
          <Button onClick={startPart2Speaking} className="flex-1 h-11" size="lg">
            <Mic className="w-4 h-4" />
            Start speaking now (skip prep time)
          </Button>
        )}

        {phase === "part2-speak" && (
          <Button
            onClick={finishPart2Speaking}
            variant="destructive"
            className="flex-1 h-11"
            size="lg"
          >
            <MicOff className="w-4 h-4" />
            Finish speaking
          </Button>
        )}

        {/* Manual move to next part */}
        {phase === "part1-active" && !isRecording && messages.length >= 8 && (
          <Button variant="outline" size="icon" className="h-11 w-11" onClick={moveToPart2} title="Move to Part 2">
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
        {phase === "part3-active" && !isRecording && messages.length >= 14 && (
          <Button
            variant="outline"
            onClick={() => scoreTest(part1Transcript, part2Transcript, part3Transcript)}
            className="h-11"
          >
            Finish test & get score
          </Button>
        )}
      </div>
    </div>
  )
}

function TestIntro({ onStart }: { onStart: () => void }) {
  return (
    <Card>
      <CardContent className="py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto text-4xl">🎙️</div>
          <h2 className="text-xl font-bold">Speaking Mock Test</h2>
          <p className="text-sm text-muted-foreground">Full 3-part IELTS exam with AI examiner.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Part 1", desc: "Interview", time: "~4 min", emoji: "💬" },
            { label: "Part 2", desc: "Long Turn", time: "~3 min", emoji: "📝" },
            { label: "Part 3", desc: "Discussion", time: "~5 min", emoji: "🧠" },
          ].map((p) => (
            <div key={p.label} className="rounded-xl bg-secondary/50 border border-border/50 p-3 text-center space-y-1">
              <span className="text-2xl">{p.emoji}</span>
              <p className="text-xs font-bold text-primary">{p.label}</p>
              <p className="text-xs font-medium">{p.desc}</p>
              <Badge variant="outline" className="text-xs border-border/40">{p.time}</Badge>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Before you start</p>
          </div>
          <div className="space-y-1.5">
            {[
              { icon: Mic, text: "Allow microphone access" },
              { icon: CheckCircle2, text: "Use Chrome or Edge" },
              { icon: Volume2, text: "Speak clearly at natural pace" },
              { icon: VolumeX, text: "Voice can be muted anytime" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-amber-700">
                <Icon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>

        <Button size="lg" className="w-full h-11" onClick={onStart}>
          <Mic className="w-4 h-4" />
          Begin Speaking Test
        </Button>
      </CardContent>
    </Card>
  )
}

function TestResults({ results, onRetry }: { results: ScoreResult; onRetry: () => void }) {
  const { scores, feedback } = results
  const bandColor =
    scores.overall >= 7.5
      ? "text-emerald-400"
      : scores.overall >= 6.5
      ? "text-lime-400"
      : scores.overall >= 5.5
      ? "text-yellow-400"
      : "text-orange-400"

  const criteria = [
    { label: "Fluency & Coherence", score: scores.fluency, detail: feedback.fluency },
    { label: "Lexical Resource", score: scores.vocabulary, detail: feedback.vocabulary },
    { label: "Grammatical Range", score: scores.grammar, detail: feedback.grammar },
    { label: "Pronunciation", score: scores.pronunciation, detail: feedback.pronunciation },
  ]

  return (
    <div className="space-y-4">
      {/* Overall band hero */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
        <CardContent className="py-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
              <div className={`text-3xl font-bold tabular-nums ${bandColor}`}>{scores.overall.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground font-medium">Band</p>
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm leading-relaxed text-foreground/90 line-clamp-2">{feedback.summary}</p>
              <Progress value={(scores.overall / 9) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criteria grid */}
      <div className="grid grid-cols-2 gap-3">
        {criteria.map(({ label, score, detail }) => (
          <Card key={label}>
            <CardContent className="py-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <Badge variant="secondary" className={cn("font-mono font-bold text-xs", bandColor)}>{score}.0</Badge>
              </div>
              <Progress value={(score / 9) * 100} className="h-2" />
              {detail && <p className="text-xs text-muted-foreground line-clamp-2">{detail}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strengths & improvements */}
      {(feedback.strengths?.length > 0 || feedback.improvements?.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1.5">
              {feedback.strengths?.map((s, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                  {s}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-amber-700 flex items-center gap-1.5 uppercase tracking-wider">
                <ArrowRight className="w-3.5 h-3.5" /> To Improve
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1.5">
              {feedback.improvements?.map((s, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-amber-800">
                  <ArrowRight className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                  {s}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {feedback.nextSteps && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4 flex items-start gap-3">
            <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground/90 line-clamp-2">{feedback.nextSteps}</p>
          </CardContent>
        </Card>
      )}

      <Button size="lg" className="w-full" onClick={onRetry}>
        <Mic className="w-4 h-4" />
        Take Another Test
      </Button>
    </div>
  )
}
