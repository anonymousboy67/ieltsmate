import type { DefaultSession } from "next-auth"

// Extend NextAuth session and JWT to include our custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "student" | "teacher"
      classCode: string
    } & DefaultSession["user"]
  }

  interface User {
    role: "student" | "teacher"
    classCode: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "student" | "teacher"
    classCode: string
  }
}
