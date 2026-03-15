"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Eye, EyeOff, Loader2,
  BookOpen, GraduationCap, Flame, Star,
  Mic, PenLine, Mail, Lock,
} from "lucide-react"

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 28,
  padding: "44px 40px",
  boxShadow: "0 32px 64px rgba(0,0,0,0.2)",
}

const inputBase: React.CSSProperties = {
  width: "100%",
  height: 52,
  borderRadius: 50,
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.25)",
  color: "white",
  fontSize: 15,
  fontWeight: 600,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s, box-shadow 0.2s",
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await signIn("credentials", { email, password, redirect: false })
      if (result?.error) {
        setError("Wrong email or password. Try again.")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setError("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={cardStyle}>

      {/* ── 1. Logo ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 36 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: "rgba(255,255,255,0.2)",
          border: "1px solid rgba(255,255,255,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        }}>
          <BookOpen style={{ width: 22, height: 22, color: "white" }} />
        </div>
        <span style={{ color: "white", fontWeight: 900, fontSize: 22, letterSpacing: "-0.4px" }}>IELTSmate</span>
      </div>

      {/* ── 2. Illustration circle ── */}
      <div style={{ display: "flex", justifyContent: "center", margin: "0 0 32px", paddingTop: 12, paddingBottom: 12 }}>
        <div style={{ position: "relative" }}>
          {/* Main circle */}
          <div style={{
            width: 128, height: 128, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            border: "2px solid rgba(255,255,255,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}>
            <GraduationCap style={{ width: 56, height: 56, color: "white" }} />
          </div>

          {/* Floating badge — streak (top-left) */}
          <div className="badge-pop" style={{
            position: "absolute", top: -6, left: -72,
            background: "white", borderRadius: 50,
            padding: "5px 12px",
            fontSize: 12, fontWeight: 800,
            color: "#166534",
            boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
            whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <Flame style={{ width: 13, height: 13, color: "#f97316" }} />
            7 day streak
          </div>

          {/* Floating badge — band (bottom-right) */}
          <div className="badge-pop-delay" style={{
            position: "absolute", bottom: -6, right: -58,
            background: "white", borderRadius: 50,
            padding: "5px 12px",
            fontSize: 12, fontWeight: 800,
            color: "#16a34a",
            boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
            whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <Star style={{ width: 13, height: 13, color: "#eab308", fill: "#eab308" }} />
            Band 7.0
          </div>
        </div>
      </div>

      {/* ── 3. Heading ── */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ color: "white", fontWeight: 900, fontSize: 30, lineHeight: 1.15, margin: "0 0 7px", letterSpacing: "-0.5px" }}>
          Ace your IELTS
        </h1>
        <p style={{ color: "rgba(255,255,255,0.72)", fontWeight: 600, fontSize: 14, margin: 0 }}>
          AI-powered prep built for Nepali students
        </p>
      </div>

      {/* ── 4. Feature pills ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {[
          { icon: <Mic style={{ width: 20, height: 20, color: "white" }} />, title: "AI Examiner", sub: "Full mock test" },
          { icon: <PenLine style={{ width: 20, height: 20, color: "white" }} />, title: "Writing AI", sub: "Instant feedback" },
        ].map((f) => (
          <div key={f.title} style={{
            flex: 1,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: "10px 12px",
            display: "flex", alignItems: "center", gap: 9,
          }}>
            <span style={{ lineHeight: 1, flexShrink: 0 }}>{f.icon}</span>
            <div>
              <p style={{ color: "white", fontWeight: 700, fontSize: 13, margin: 0, lineHeight: 1.3 }}>{f.title}</p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: 11, margin: 0, lineHeight: 1.3 }}>{f.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: "rgba(255,80,80,0.18)",
          border: "1px solid rgba(255,120,120,0.35)",
          borderRadius: 14, padding: "10px 16px",
          marginBottom: 16, color: "rgba(255,255,255,0.95)",
          fontSize: 13, fontWeight: 600,
        }}>
          {error}
        </div>
      )}

      {/* ── 5. Form ── */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Email */}
        <div style={{ position: "relative" }}>
          <Mail style={{ position: "absolute", left: 17, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: "rgba(255,255,255,0.65)", pointerEvents: "none" }} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            autoComplete="email"
            className="auth-input"
            style={{ ...inputBase, paddingLeft: 50, paddingRight: 20 }}
          />
        </div>

        {/* Password */}
        <div style={{ position: "relative" }}>
          <Lock style={{ position: "absolute", left: 17, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: "rgba(255,255,255,0.65)", pointerEvents: "none" }} />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete="current-password"
            className="auth-input"
            style={{ ...inputBase, paddingLeft: 50, paddingRight: 52 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.65)", padding: 0, display: "flex", alignItems: "center" }}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* ── 6. Main button ── */}
        <button
          type="submit"
          disabled={loading}
          className="auth-submit-btn"
          style={{
            height: 52, borderRadius: 50,
            background: "white", border: "none",
            color: "#16a34a", fontWeight: 900,
            fontSize: 16, fontFamily: "inherit",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            marginTop: 6,
            transition: "all 0.2s ease",
            boxShadow: "0 6px 28px rgba(0,0,0,0.22)",
            opacity: loading ? 0.8 : 1,
          }}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
          ) : (
            "Sign In →"
          )}
        </button>
      </form>

      {/* ── 7. Divider ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.2)" }} />
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", letterSpacing: "0.3px" }}>or continue with</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.2)" }} />
      </div>

      {/* ── 8. Google button ── */}
      <button
        type="button"
        className="auth-google-btn"
        style={{
          width: "100%", height: 52, borderRadius: 50,
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.25)",
          color: "white", fontWeight: 700, fontSize: 15,
          fontFamily: "inherit", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "all 0.2s ease",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="rgba(255,255,255,0.9)" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(255,255,255,0.75)" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="rgba(255,255,255,0.65)" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(255,255,255,0.85)" />
        </svg>
        Sign in with Google
      </button>

      {/* ── 9. Sign up link ── */}
      <p style={{ textAlign: "center", marginTop: 24, color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600, margin: "24px 0 0" }}>
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" style={{ color: "white", fontWeight: 900, textDecoration: "underline", textUnderlineOffset: 3 }}>
          Sign up free
        </Link>
      </p>

    </div>
  )
}
