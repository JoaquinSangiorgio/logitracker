'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRoutesStore, useDriversStore, useDeliveriesStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, MapPin, Clock, Route as RouteIcon, User, Package, Trash2, Eye, Play, CheckCircle2 } from 'lucide-react'
import { routeStatusLabels } from '@/lib/mock-data'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function RecorridosPage() {
  const router = useRouter()
  const { routes, deleteRoute, startRoute, completeRoute } = useRoutesStore()
  const { drivers } = useDriversStore()
  const { deliveries } = useDeliveriesStore()

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-500',
      active: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estas seguro de eliminar este recorrido?')) {
      deleteRoute(id)
    }
  }

  const handleStart = (id: string) => {
    if (confirm('¿Deseas iniciar este recorrido?')) {
      startRoute(id)
    }
  }

  const handleComplete = (id: string) => {
    if (confirm('¿Marcar este recorrido como completado?')) {
      completeRoute(id)
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recorridos</h1>
          <p className="text-muted-foreground">Gestiona y optimiza las rutas de entrega</p>
        </div>
        <Button onClick={() => router.push('/admin/recorridos/nuevo')} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Crear Recorrido
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recorridos</CardTitle>
            <RouteIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <Play className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {routes.filter(r => r.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados Hoy</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {routes.filter(r => r.status === 'completed' && r.completedAt && new Date(r.completedAt).toDateString() === new Date().toDateString()).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borradores</CardTitle>
            <RouteIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {routes.filter(r => r.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Routes List */}
      <div className="space-y-4">
        {routes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <RouteIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg mb-4">No hay recorridos creados</p>
              <Button onClick={() => router.push('/admin/recorridos/nuevo')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Recorrido
              </Button>
            </CardContent>
          </Card>
        ) : (
          routes.map((route) => (
            <Card key={route.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">{route.name}</CardTitle>
                      <Badge className={getStatusColor(route.status)}>
                        {routeStatusLabels[route.status]}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {route.driverName}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {route.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStart(route.id)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Iniciar
                      </Button>
                    )}
                    {route.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleComplete(route.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Completar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/recorridos/${route.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    {route.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(route.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{route.stops.length} paradas</p>
                      <p className="text-xs text-muted-foreground">
                        {route.stops.filter(s => s.status === 'completed').length} completadas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{route.deliveryIds.length} entregas</p>
                      <p className="text-xs text-muted-foreground">asignadas</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <RouteIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {route.totalDistance ? `${route.totalDistance.toFixed(1)} km` : 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">distancia total</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {route.estimatedDuration ? `${route.estimatedDuration} min` : 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">tiempo estimado</p>
                    </div>
                  </div>
                </div>

                {route.scheduledDate && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Programado para:{' '}
                      <span className="font-medium text-foreground">
                        {format(new Date(route.scheduledDate), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
