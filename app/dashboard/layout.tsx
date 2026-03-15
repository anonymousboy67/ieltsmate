import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { connectDB } from "@/lib/mongodb"
import User from "@/lib/models/user"
import { SidebarNav } from "@/components/sidebar-nav"
import { MobileNav } from "@/components/mobile-nav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")
  if (session.user.role === "teacher") redirect("/teacher/dashboard")

  await connectDB()
  const user = await User.findById(session.user.id).select("streak").lean()
  const streak = (user as { streak?: number })?.streak ?? 0

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Big dark sidebar — 288px */}
      <div className="hidden md:flex md:w-72 md:flex-col md:shrink-0">
        <SidebarNav
          userName={session.user.name ?? "Student"}
          userEmail={session.user.email ?? ""}
          streak={streak}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden">
          <MobileNav userName={session.user.name ?? "Student"} streak={streak} />
        </div>
        <main className="flex-1 overflow-y-auto p-5 md:p-7 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
