'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useAuthStore, useDeliveriesStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deliveryStatusLabels, priorityLabels } from '@/lib/mock-data'
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Navigation
} from 'lucide-react'
import type { Driver } from '@/lib/types'

export default function DriverHomePage() {
  const { user } = useAuthStore()
  const { deliveries } = useDeliveriesStore()
  const driver = user as Driver | null

  const myDeliveries = useMemo(() => {
    if (!driver) return []
    return deliveries.filter(d => d.driverId === driver.id)
  }, [deliveries, driver])

  const stats = useMemo(() => ({
    pending: myDeliveries.filter(d => d.status === 'assigned' || d.status === 'picked_up').length,
    inTransit: myDeliveries.filter(d => d.status === 'in_transit' || d.status === 'arriving').length,
    completed: myDeliveries.filter(d => d.status === 'delivered').length,
    total: myDeliveries.length
  }), [myDeliveries])

  const activeDeliveries = useMemo(() => {
    return myDeliveries
      .filter(d => ['assigned', 'picked_up', 'in_transit', 'arriving'].includes(d.status))
      .slice(0, 3)
  }, [myDeliveries])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-700'
      case 'picked_up': return 'bg-indigo-100 text-indigo-700'
      case 'in_transit': return 'bg-primary text-primary-foreground'
      case 'arriving': return 'bg-cyan-100 text-cyan-700'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Hola, {driver?.name?.split(' ')[0]}</h1>
        <p className="text-muted-foreground">Aqui esta tu resumen del dia</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Navigation className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">En Transito</p>
                <p className="text-2xl font-bold">{stats.inTransit}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Hoy</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Deliveries */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Entregas Activas</CardTitle>
              <CardDescription>Tus proximas entregas</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/driver/deliveries">
                Ver todas <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeDeliveries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No tienes entregas activas</p>
            </div>
          ) : (
            activeDeliveries.map((delivery) => (
              <Link 
                key={delivery.id} 
                href={`/driver/deliveries/${delivery.id}`}
                className="block"
              >
                <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-full ${getStatusColor(delivery.status)}`}>
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{delivery.trackingCode}</p>
                      {(delivery.priority === 'urgent' || delivery.priority === 'high') && (
                        <Badge variant="secondary" className={getPriorityColor(delivery.priority)}>
                          {priorityLabels[delivery.priority]}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{delivery.deliveryAddress}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className={getStatusColor(delivery.status)}>
                    {deliveryStatusLabels[delivery.status]}
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
          <Link href="/driver/deliveries">
            <Package className="h-6 w-6" />
            <span>Mis Entregas</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
          <Link href="/driver/incidents">
            <MapPin className="h-6 w-6" />
            <span>Reportar Incidencia</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
