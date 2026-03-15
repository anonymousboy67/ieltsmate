"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
      className="text-muted-foreground hover:text-foreground gap-1.5"
    >
      <LogOut className="w-3.5 h-3.5" />
      Sign out
    </Button>
  )
}
