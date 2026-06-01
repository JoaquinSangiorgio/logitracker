"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, AlertTriangle, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/client", icon: Home, label: "Inicio" },
  { href: "/client/deliveries", icon: Package, label: "Mis Entregas" },
  { href: "/client/incidents", icon: AlertTriangle, label: "Incidencias" },
  { href: "/client/profile", icon: User, label: "Perfil" }
]

export function ClientNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map(item => {
            const isActive = pathname === item.href || 
              (item.href !== "/client" && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-center",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
