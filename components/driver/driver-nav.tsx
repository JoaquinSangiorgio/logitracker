'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Package, AlertTriangle, User } from 'lucide-react'

const navItems = [
  { href: '/driver', icon: Home, label: 'Inicio' },
  { href: '/driver/deliveries', icon: Package, label: 'Entregas' },
  { href: '/driver/incidents', icon: AlertTriangle, label: 'Incidencias' },
  { href: '/driver/profile', icon: User, label: 'Perfil' },
]

export function DriverNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs transition-colors',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
