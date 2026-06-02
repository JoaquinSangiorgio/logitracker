'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useRoutesStore, useDeliveriesStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Clock,
  Package,
  CheckCircle2,
  Circle,
  Play,
  ExternalLink,
  Route as RouteIcon,
  User
} from 'lucide-react'
import { routeStatusLabels } from '@/lib/mock-data'
import { generateGoogleMapsUrl, generateGoogleMapsRouteUrl } from '@/lib/route-optimizer'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import dynamic from 'next/dynamic'

const RouteMapView = dynamic(() => import('@/components/admin/route-map-view'), { ssr: false })

export default function RecorridoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { routes, updateStopStatus, startRoute, completeRoute } = useRoutesStore()
  const { deliveries } = useDeliveriesStore()

  const route = routes.find(r => r.id === id)

  if (!route) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Recorrido no encontrado</h1>
          <Button onClick={() => router.push('/admin/recorridos')}>
            Volver a Recorridos
          </Button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-500',
      active: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  const getStopStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle2 className="h-5 w-5 text-green-500" />
    if (status === 'skipped') return <Circle className="h-5 w-5 text-gray-400" />
    return <Circle className="h-5 w-5 text-muted-foreground" />
  }

  const completedStops = route.stops.filter(s => s.status === 'completed').length
  const progress = (completedStops / route.stops.length) * 100

  const handleNavigateToStop = (stop: typeof route.stops[0]) => {
    const prevStop = route.stops[route.stops.indexOf(stop) - 1]
    const originLat = prevStop ? prevStop.lat : route.startPoint.lat
    const originLng = prevStop ? prevStop.lng : route.startPoint.lng

    const url = generateGoogleMapsUrl(originLat, originLng, stop.lat, stop.lng)
    window.open(url, '_blank')
  }

  const handleViewFullRoute = () => {
    const url = generateGoogleMapsRouteUrl(
      route.startPoint.lat,
      route.startPoint.lng,
      route.stops
    )
    window.open(url, '_blank')
  }

  const handleStopComplete = (stopId: string) => {
    updateStopStatus(route.id, stopId, 'completed')
  }

  const handleStart = () => {
    if (confirm('¿Deseas iniciar este recorrido?')) {
      startRoute(route.id)
    }
  }

  const handleComplete = () => {
    if (confirm('¿Marcar este recorrido como completado?')) {
      completeRoute(route.id)
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-foreground">{route.name}</h1>
              <Badge className={getStatusColor(route.status)}>
                {routeStatusLabels[route.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              {route.driverName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {route.status === 'draft' && (
            <Button onClick={handleStart}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Recorrido
            </Button>
          )}
          {route.status === 'active' && (
            <Button onClick={handleComplete} variant="default">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Completar Recorrido
            </Button>
          )}
          <Button variant="outline" onClick={handleViewFullRoute}>
            <Navigation className="h-4 w-4 mr-2" />
            Ver Ruta Completa
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* Progress */}
      {route.status === 'active' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progreso del Recorrido</span>
                <span className="font-medium">
                  {completedStops} de {route.stops.length} paradas completadas
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paradas</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{route.stops.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedStops} completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{route.deliveryIds.length}</div>
            <p className="text-xs text-muted-foreground">asignadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distancia Total</CardTitle>
            <RouteIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {route.totalDistance?.toFixed(1) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">kilómetros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Estimado</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {route.estimatedDuration || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">minutos</p>
          </CardContent>
        </Card>
      </div>

      {/* Route Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stops List */}
        <Card>
          <CardHeader>
            <CardTitle>Paradas del Recorrido</CardTitle>
            <CardDescription>Orden optimizado de entregas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Punto de Inicio */}
              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{route.startPoint.name}</p>
                  <p className="text-sm text-muted-foreground">{route.startPoint.address}</p>
                  <Badge variant="outline" className="mt-2">Punto de Inicio</Badge>
                </div>
              </div>

              {/* Paradas */}
              {route.stops.map((stop, index) => {
                const delivery = deliveries.find(d => d.id === stop.deliveryId)
                const isCompleted = stop.status === 'completed'
                const isNext = !isCompleted && route.stops.slice(0, index).every(s => s.status === 'completed')

                return (
                  <div
                    key={stop.id}
                    className={`flex items-start gap-4 pb-4 border-b last:border-b-0 ${
                      isCompleted ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold text-foreground">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{stop.address}</p>
                            {isNext && <Badge className="bg-blue-500">Siguiente</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {delivery?.clientName} - {delivery?.trackingCode}
                          </p>
                          <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <RouteIcon className="h-3 w-3" />
                              {stop.distance} km
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              ~{stop.duration} min
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStopStatusIcon(stop.status)}
                        </div>
                      </div>

                      {route.status === 'active' && !isCompleted && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleNavigateToStop(stop)}
                          >
                            <Navigation className="h-3 w-3 mr-1" />
                            Navegar
                          </Button>
                          {isNext && (
                            <Button
                              size="sm"
                              onClick={() => handleStopComplete(stop.id)}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completar
                            </Button>
                          )}
                        </div>
                      )}

                      {isCompleted && stop.actualArrival && (
                        <p className="text-xs text-green-600">
                          Completado:{' '}
                          {format(new Date(stop.actualArrival), "HH:mm", { locale: es })}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="space-y-6">
          {/* Mapa */}
          <Card>
            <CardHeader>
              <CardTitle>Vista de Mapa</CardTitle>
              <CardDescription>Visualización de la ruta completa</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] w-full">
                <RouteMapView
                  startPoint={route.startPoint}
                  stops={route.stops}
                  deliveries={deliveries.filter(d => route.deliveryIds.includes(d.id))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Recorrido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Chofer Asignado</p>
                <p className="font-medium">{route.driverName}</p>
              </div>

              {route.scheduledDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Fecha Programada</p>
                  <p className="font-medium">
                    {format(new Date(route.scheduledDate), "d 'de' MMMM 'a las' HH:mm", {
                      locale: es
                    })}
                  </p>
                </div>
              )}

              {route.startedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Iniciado</p>
                  <p className="font-medium">
                    {format(new Date(route.startedAt), "d 'de' MMMM 'a las' HH:mm", {
                      locale: es
                    })}
                  </p>
                </div>
              )}

              {route.completedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Completado</p>
                  <p className="font-medium">
                    {format(new Date(route.completedAt), "d 'de' MMMM 'a las' HH:mm", {
                      locale: es
                    })}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Creado</p>
                <p className="font-medium">
                  {format(new Date(route.createdAt), "d 'de' MMMM 'a las' HH:mm", {
                    locale: es
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Entregas Incluidas</CardTitle>
              <CardDescription>{route.deliveryIds.length} entregas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {route.deliveryIds.map(deliveryId => {
                  const delivery = deliveries.find(d => d.id === deliveryId)
                  if (!delivery) return null

                  return (
                    <div
                      key={deliveryId}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium text-sm">{delivery.trackingCode}</p>
                        <p className="text-xs text-muted-foreground">{delivery.clientName}</p>
                      </div>
                      <Badge variant="outline">{delivery.priority}</Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
