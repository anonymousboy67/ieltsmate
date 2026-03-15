import { WritingToolkit } from "@/components/writing-toolkit"

export default function WritingPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Writing Practice</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Task 1 graph language toolkit + Task 2 essay feedback from AI examiner.
        </p>
      </div>
      <WritingToolkit />
    </div>
  )
}
