import { VocabularyPage as VocabContent } from "@/components/vocabulary-page"

export default function VocabularyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Vocabulary</h1>
        <p className="text-sm text-muted-foreground mt-1">
          IELTS academic words organised by topic. Track your progress with spaced repetition.
        </p>
      </div>
      <VocabContent />
    </div>
  )
}
