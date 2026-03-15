// App-wide constants

export const APP_NAME = "IELTSmate"
export const APP_TAGLINE = "Your AI-powered IELTS preparation companion"

// Default class code — teacher shares this with students
export const DEFAULT_CLASS_CODE = process.env.DEFAULT_CLASS_CODE ?? "IELTS2026"

// IELTS scoring ranges
export const BAND_DESCRIPTIONS: Record<number, { label: string; description: string; color: string }> = {
  9: { label: "Expert", description: "Full operational command of English", color: "text-emerald-400" },
  8: { label: "Very Good", description: "Fully operational command with occasional unsystematic errors", color: "text-green-400" },
  7: { label: "Good", description: "Operational command with occasional inaccuracies", color: "text-lime-400" },
  6: { label: "Competent", description: "Effective command despite some inaccuracies", color: "text-yellow-400" },
  5: { label: "Modest", description: "Partial command in most situations", color: "text-amber-400" },
  4: { label: "Limited", description: "Basic competence in familiar situations", color: "text-orange-400" },
  3: { label: "Extremely Limited", description: "Conveys only general meaning in familiar situations", color: "text-red-400" },
}

// Speaking test structure
export const SPEAKING_PARTS = {
  PART1: {
    number: 1,
    title: "Introduction & Interview",
    duration: "4-5 minutes",
    description: "The examiner asks personal questions about familiar topics",
    questionCount: 5,
  },
  PART2: {
    number: 2,
    title: "Individual Long Turn",
    duration: "3-4 minutes",
    description: "You speak for 1-2 minutes on a given topic",
    prepTime: 60, // seconds
    speakTime: 120, // seconds
  },
  PART3: {
    number: 3,
    title: "Two-way Discussion",
    duration: "4-5 minutes",
    description: "Abstract discussion questions related to Part 2 topic",
    questionCount: 5,
  },
} as const

// Graph language toolkit categories
export const GRAPH_LANGUAGE = {
  upward: {
    label: "Upward Trends",
    verbs: ["increased", "rose", "climbed", "grew", "jumped", "soared", "surged"],
    adjectives: ["sharp", "steep", "dramatic", "significant", "considerable", "moderate", "slight", "marginal"],
    adverbs: ["sharply", "steeply", "dramatically", "significantly", "considerably", "moderately", "slightly", "marginally"],
  },
  downward: {
    label: "Downward Trends",
    verbs: ["decreased", "fell", "declined", "dropped", "plummeted", "slipped", "reduced"],
    adjectives: ["sharp", "steep", "dramatic", "significant", "considerable", "moderate", "slight", "gradual"],
    adverbs: ["sharply", "steeply", "dramatically", "significantly", "considerably", "moderately", "gradually"],
  },
  stable: {
    label: "Stable / Flat",
    verbs: ["remained stable", "plateaued", "levelled out", "stayed constant", "held steady"],
    adjectives: ["relatively stable", "fairly constant", "roughly unchanged"],
    adverbs: ["steadily", "consistently"],
  },
  fluctuating: {
    label: "Fluctuating",
    verbs: ["fluctuated", "varied", "oscillated", "wavered"],
    adjectives: ["variable", "erratic", "inconsistent"],
    adverbs: ["erratically", "unpredictably"],
  },
  peakTrough: {
    label: "Peak & Trough",
    phrases: [
      "reached its peak of",
      "hit a high of",
      "reached its highest point at",
      "peaked at",
      "hit a low of",
      "reached its lowest point at",
      "bottomed out at",
      "dipped to",
    ],
  },
  fractions: {
    label: "Fractions & Multiples",
    phrases: [
      "doubled",
      "trebled",
      "quadrupled",
      "halved",
      "a two-fold increase",
      "a three-fold rise",
      "the majority of",
      "a minority of",
      "roughly one-third",
      "approximately half",
      "nearly three-quarters",
    ],
  },
  comparison: {
    label: "Comparison",
    phrases: [
      "surpassed",
      "exceeded",
      "overtook",
      "was higher than",
      "was lower than",
      "outperformed",
      "converged",
      "diverged",
      "the gap between",
      "in contrast",
      "by comparison",
    ],
  },
  time: {
    label: "Time Phrases",
    phrases: [
      "over the period",
      "throughout the period",
      "during the period shown",
      "over the following decade",
      "in the first half of the period",
      "in the latter half",
      "a decade later",
      "by the end of the period",
      "at the beginning of the period",
      "between X and Y",
    ],
  },
} as const

// Writing task 2 essay types
export const ESSAY_TYPES = [
  { id: "opinion", label: "Opinion Essay", description: "Do you agree or disagree?" },
  { id: "discussion", label: "Discussion Essay", description: "Discuss both views" },
  { id: "problem-solution", label: "Problem & Solution", description: "Identify problems and suggest solutions" },
  { id: "advantages-disadvantages", label: "Advantages & Disadvantages", description: "Weigh pros and cons" },
  { id: "two-part", label: "Two-Part Question", description: "Answer two separate questions" },
] as const

// IELTS topic categories
export const IELTS_TOPICS = [
  "Environment",
  "Technology",
  "Health",
  "Education",
  "Society",
  "Economy",
  "Science",
  "Culture",
  "Urbanisation",
  "Media",
] as const

export type IELTSTopic = typeof IELTS_TOPICS[number]

// Navigation items for dashboard sidebar
export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/speaking", label: "Speaking", icon: "Mic" },
  { href: "/dashboard/writing", label: "Writing", icon: "PenLine" },
  { href: "/dashboard/vocabulary", label: "Vocabulary", icon: "BookOpen" },
  { href: "/dashboard/progress", label: "Progress", icon: "TrendingUp" },
  { href: "/dashboard/learn", label: "Learn IELTS", icon: "GraduationCap" },
] as const
