'use client'

import { useRouter } from 'next/navigation'
import { useRoutesStore, useAuthStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  MapPin,
  Clock,
  Package,
  Play,
  Eye,
  CheckCircle2,
  Route as RouteIcon,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function DriverRecorridosPage() {
  const router = useRouter()
  const { routes, startRoute } = useRoutesStore()
  const { user } = useAuthStore()

  // Filtrar recorridos asignados al chofer actual
  const myRoutes = routes.filter(r => r.driverId === user?.id)

  const activeRoutes = myRoutes.filter(r => r.status === 'active')
  const draftRoutes = myRoutes.filter(r => r.status === 'draft')
  const completedRoutes = myRoutes.filter(r => r.status === 'completed')

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-500',
      active: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Programado',
      active: 'En Curso',
      completed: 'Completado',
      cancelled: 'Cancelado'
    }
    return labels[status as keyof typeof labels] || status
  }

  const handleStartRoute = (routeId: string) => {
    if (confirm('¿Deseas iniciar este recorrido?')) {
      startRoute(routeId)
      router.push(`/driver/recorridos/${routeId}`)
    }
  }

  const handleViewRoute = (routeId: string) => {
    router.push(`/driver/recorridos/${routeId}`)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mis Recorridos</h1>
        <p className="text-muted-foreground">Gestiona tus rutas de entrega</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <RouteIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRoutes.length}</div>
            <p className="text-xs text-muted-foreground">en curso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programados</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftRoutes.length}</div>
            <p className="text-xs text-muted-foreground">pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRoutes.length}</div>
            <p className="text-xs text-muted-foreground">finalizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Routes */}
      {activeRoutes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recorridos Activos</h2>
          {activeRoutes.map(route => {
            const completedStops = route.stops.filter(s => s.status === 'completed').length
            const progress = (completedStops / route.stops.length) * 100

            return (
              <Card key={route.id} className="border-blue-500 border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{route.name}</CardTitle>
                        <Badge className={getStatusColor(route.status)}>
                          {getStatusLabel(route.status)}
                        </Badge>
                      </div>
                      <CardDescription>
                        {route.scheduledDate && (
                          <span className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3" />
                            {format(new Date(route.scheduledDate), "d 'de' MMMM 'a las' HH:mm", {
                              locale: es
                            })}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Button onClick={() => handleViewRoute(route.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium">
                        {completedStops} de {route.stops.length} paradas
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{route.stops.length}</p>
                        <p className="text-xs text-muted-foreground">paradas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <RouteIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{route.totalDistance?.toFixed(1)} km</p>
                        <p className="text-xs text-muted-foreground">distancia</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{route.deliveryIds.length}</p>
                        <p className="text-xs text-muted-foreground">entregas</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Draft Routes */}
      {draftRoutes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recorridos Programados</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {draftRoutes.map(route => (
              <Card key={route.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{route.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {route.scheduledDate
                          ? format(new Date(route.scheduledDate), "d 'de' MMMM 'a las' HH:mm", {
                              locale: es
                            })
                          : 'Sin programar'}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(route.status)}>
                      {getStatusLabel(route.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {route.stops.length} paradas
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {route.deliveryIds.length} entregas
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleStartRoute(route.id)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Recorrido
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleViewRoute(route.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Routes */}
      {completedRoutes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recorridos Completados</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedRoutes.map(route => (
              <Card key={route.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{route.name}</CardTitle>
                    <Badge className={getStatusColor(route.status)}>
                      {getStatusLabel(route.status)}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {route.completedAt && (
                      <>
                        Completado el{' '}
                        {format(new Date(route.completedAt), "d 'de' MMMM", { locale: es })}
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{route.stops.length} paradas</span>
                    <span>{route.totalDistance?.toFixed(1)} km</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => handleViewRoute(route.id)}
                  >
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {myRoutes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <RouteIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes recorridos asignados</h3>
            <p className="text-sm text-muted-foreground text-center">
              Cuando se te asignen rutas de entrega, aparecerán aquí.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
