'use client'

import { usePathname } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useIncidentsStore } from '@/lib/store'

const pathNames: Record<string, string> = {
  '/admin': 'Tablero',
  '/admin/drivers': 'Choferes',
  '/admin/clients': 'Clientes',
  '/admin/deliveries': 'Entregas',
  '/admin/map': 'Mapa en Vivo',
  '/admin/incidents': 'Incidencias',
  '/admin/settings': 'Ajustes',
}

export function AdminHeader() {
  const pathname = usePathname()
  const { incidents } = useIncidentsStore()
  const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'in_progress').length

  const currentPage = pathNames[pathname] || 'Dashboard'

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/admin">
              Admin
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentPage}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {openIncidents > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {openIncidents}
            </span>
          )}
        </Button>
      </div>
    </header>
  )
}
