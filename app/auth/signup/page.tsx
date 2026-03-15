"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, Check } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ name: "", email: "", password: "", classCode: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Registration failed."); return }
      setSuccess(true)
      await signIn("credentials", { email: formData.email, password: formData.password, redirect: false })
      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold">You&apos;re in! 🎉</h2>
        <p className="text-muted-foreground text-sm mt-1">Redirecting to your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-foreground tracking-tight mb-1">
        Create account
      </h2>
      <p className="text-muted-foreground mb-8">Join your class and start preparing</p>

      {error && (
        <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full name"
          required
          autoComplete="name"
          className="w-full h-13 rounded-2xl border border-border bg-secondary/40 px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:bg-white transition-all"
        />
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email address"
          required
          autoComplete="email"
          className="w-full h-13 rounded-2xl border border-border bg-secondary/40 px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:bg-white transition-all"
        />
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Password (min. 6 characters)"
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full h-13 rounded-2xl border border-border bg-secondary/40 px-4 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:bg-white transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <input
          name="classCode"
          type="text"
          value={formData.classCode}
          onChange={handleChange}
          placeholder="Class code (from your teacher)"
          required
          className="w-full h-13 rounded-2xl border border-border bg-secondary/40 px-4 text-sm font-mono uppercase tracking-wider placeholder:text-muted-foreground placeholder:font-sans placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:bg-white transition-all"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-13 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 mt-1"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
            : "Create account"
          }
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary font-semibold hover:underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </div>
  )
}
