import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

// Root page redirects based on auth state
export default async function RootPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    if (session.user.role === "teacher") {
      redirect("/teacher/dashboard")
    }
    redirect("/dashboard")
  }

  redirect("/auth/login")
}
