"use client"

import type { ReactNode } from "react"
import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ClientHeader } from "@/components/client/client-header"
import { ClientNav } from "@/components/client/client-nav"

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "client") {
      router.push("/")
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "client") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      <main className="container mx-auto px-4 py-6 pb-24">
        {children}
      </main>
      <ClientNav />
    </div>
  )
}
