import { SpeakingTest } from "@/components/speaking-test"

export default function SpeakingPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Speaking Mock Test</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Full 3-part IELTS Speaking exam with an AI examiner. Exactly like the real test.
        </p>
      </div>
      <SpeakingTest />
    </div>
  )
}
