"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Menu, X, LayoutDashboard, Mic, PenLine, BookOpen, TrendingUp, GraduationCap, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/speaking", label: "Speaking", icon: Mic },
  { href: "/dashboard/writing", label: "Writing", icon: PenLine },
  { href: "/dashboard/vocabulary", label: "Vocabulary", icon: BookOpen },
  { href: "/dashboard/progress", label: "Progress", icon: TrendingUp },
  { href: "/dashboard/learn", label: "Learn IELTS", icon: GraduationCap },
]

export function MobileNav({ userName, streak }: { userName: string; streak: number }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <div className="flex items-center justify-between px-5 h-16 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-lg">📚</div>
          <span className="font-bold text-white">IELTSmate</span>
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && <span className="text-xs font-bold text-orange-300">🔥 {streak}</span>}
          <button onClick={() => setOpen(true)} className="text-white/60 hover:text-white p-1.5 rounded-xl hover:bg-sidebar-accent transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative ml-auto w-80 h-full bg-sidebar flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 h-16 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-white">{userName}</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white p-1.5 rounded-xl hover:bg-sidebar-accent transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                return (
                  <Link key={href} href={href} onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-all",
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}>
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                )
              })}
            </nav>
            <div className="p-3 border-t border-sidebar-border">
              <button onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl text-sm text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all">
                <LogOut className="w-5 h-5" /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
