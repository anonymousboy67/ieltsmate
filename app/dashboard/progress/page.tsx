import { ProgressContent } from "@/components/progress-content"

export default function ProgressPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">My Progress</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Band score history, skill breakdown, and session log.
        </p>
      </div>
      <ProgressContent />
    </div>
  )
}
