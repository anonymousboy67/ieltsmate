"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard, Mic, PenLine, BookOpen,
  TrendingUp, GraduationCap, LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/speaking", label: "Speaking", icon: Mic },
  { href: "/dashboard/writing", label: "Writing", icon: PenLine },
  { href: "/dashboard/vocabulary", label: "Vocabulary", icon: BookOpen },
  { href: "/dashboard/progress", label: "Progress", icon: TrendingUp },
  { href: "/dashboard/learn", label: "Learn IELTS", icon: GraduationCap },
]

interface SidebarNavProps {
  userName: string
  userEmail: string
  streak: number
}

export function SidebarNav({ userName, userEmail, streak }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3.5 px-6 py-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-2xl shadow-lg shadow-primary/30 shrink-0">
          📚
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight text-white">IELTSmate</span>
          <p className="text-xs text-sidebar-foreground/40 leading-none mt-0.5">AI Study Partner</p>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-6 pt-6 pb-2">
        <p className="text-xs font-semibold text-sidebar-foreground/35 uppercase tracking-widest">Menu</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Streak pill */}
      {streak > 0 && (
        <div className="mx-3 mb-3 rounded-2xl bg-orange-500/15 border border-orange-400/20 px-4 py-3.5 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-sm font-bold text-orange-300">{streak} day streak</p>
            <p className="text-xs text-orange-400/60">Keep the momentum!</p>
          </div>
        </div>
      )}

      {/* User row */}
      <div className="p-3 border-t border-sidebar-border">
        <div
          className="flex items-center gap-3.5 px-3 py-3 rounded-2xl hover:bg-sidebar-accent cursor-pointer transition-colors group"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
        >
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">{userName}</p>
            <p className="text-xs text-sidebar-foreground/40 truncate">{userEmail}</p>
          </div>
          <LogOut className="w-4 h-4 text-sidebar-foreground/30 group-hover:text-sidebar-foreground/60 transition-colors shrink-0" />
        </div>
      </div>
    </aside>
  )
}
