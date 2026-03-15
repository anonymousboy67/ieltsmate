export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT — illustrated green panel */}
      <div className="hidden lg:flex lg:w-[52%] auth-panel relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Abstract circles */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-white/10" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-black/10" />
        <div className="absolute top-[30%] right-[-40px] w-40 h-40 rounded-full bg-white/8" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-xl shadow-lg">
              📚
            </div>
            <span className="text-white font-bold text-xl tracking-tight">IELTSmate</span>
          </div>

          {/* Hero text */}
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Ace your IELTS<br />with AI coaching
          </h1>
          <p className="text-white/75 text-base leading-relaxed mb-12">
            Practice speaking, get instant writing feedback, and build vocabulary — all in one place.
          </p>

          {/* Floating feature cards */}
          <div className="space-y-3">
            <div className="float flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-4 py-3 shadow-lg">
              <span className="text-2xl">🎤</span>
              <div>
                <p className="text-white font-semibold text-sm">AI Speaking Examiner</p>
                <p className="text-white/65 text-xs">Full mock test · Instant band score</p>
              </div>
            </div>
            <div className="float-delay flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-4 py-3 shadow-lg">
              <span className="text-2xl">✍️</span>
              <div>
                <p className="text-white font-semibold text-sm">Writing Feedback</p>
                <p className="text-white/65 text-xs">Task 1 & 2 · Detailed corrections</p>
              </div>
            </div>
            <div className="float flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-4 py-3 shadow-lg">
              <span className="text-2xl">📈</span>
              <div>
                <p className="text-white font-semibold text-sm">Track Your Progress</p>
                <p className="text-white/65 text-xs">Band history · Weak area detection</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — white form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-lg shadow-sm">
              📚
            </div>
            <span className="font-bold text-lg">IELTSmate</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
