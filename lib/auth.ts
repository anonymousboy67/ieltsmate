import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import { connectDB } from "./mongodb"
import User from "./models/user"

// Raw MongoDB client for NextAuth adapter (it needs the raw client, not mongoose)
const mongoClient = new MongoClient(process.env.MONGODB_URI!)
const mongoClientPromise = mongoClient.connect()

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(mongoClientPromise, { databaseName: "ieltsmate" }),

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          await connectDB()
          // Use .select("+password") to include the password field (excluded by default)
          const user = await User.findOne({ email: credentials.email.toLowerCase() }).select("+password")

          if (!user || !user.password) return null

          const passwordMatch = await bcrypt.compare(credentials.password, user.password)
          if (!passwordMatch) return null

          // Return user object (password excluded from JWT)
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            classCode: user.classCode,
            image: user.image,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      // On initial sign in, user object is available
      if (user) {
        token.id = user.id
        token.role = user.role
        token.classCode = user.classCode
      }
      return token
    },
    async session({ session, token }) {
      // Pass JWT fields into session
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.classCode = token.classCode
      }
      return session
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
}
