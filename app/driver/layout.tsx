'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { DriverHeader } from '@/components/driver/driver-header'
import { DriverNav } from '@/components/driver/driver-nav'

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    } else if (user?.role !== 'driver') {
      router.push(`/${user?.role === 'admin' ? 'admin' : 'client'}`)
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== 'driver') {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DriverHeader />
      <main className="flex-1 p-4 pb-24">
        {children}
      </main>
      <DriverNav />
    </div>
  )
}
