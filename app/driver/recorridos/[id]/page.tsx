'use client'

import { use, useState, useEffect } from 'react'
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
  Route as RouteIcon,
  ExternalLink,
  Phone,
  User
} from 'lucide-react'
import { generateGoogleMapsUrl } from '@/lib/route-optimizer'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import dynamic from 'next/dynamic'

const RouteMapView = dynamic(() => import('@/components/admin/route-map-view'), { ssr: false })

export default function DriverRecorridoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { routes, updateStopStatus, startRoute, completeRoute } = useRoutesStore()
  const { deliveries, updateDeliveryStatus } = useDeliveriesStore()
  const [currentTime, setCurrentTime] = useState(new Date())

  const route = routes.find(r => r.id === id)

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [])

  if (!route) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Recorrido no encontrado</h1>
          <Button onClick={() => router.push('/driver/recorridos')}>
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

  const handleStopComplete = (stopId: string, deliveryId: string) => {
    if (confirm('¿Confirmar que la entrega fue completada exitosamente?')) {
      updateStopStatus(route.id, stopId, 'completed')
      updateDeliveryStatus(deliveryId, 'delivered')
    }
  }

  const handleStart = () => {
    if (confirm('¿Deseas iniciar este recorrido?')) {
      startRoute(route.id)
    }
  }

  const handleComplete = () => {
    const pendingStops = route.stops.filter(s => s.status === 'pending')
    if (pendingStops.length > 0) {
      if (
        !confirm(
          `Aún hay ${pendingStops.length} paradas pendientes. ¿Estás seguro de completar el recorrido?`
        )
      ) {
        return
      }
    }
    completeRoute(route.id)
    router.push('/driver/recorridos')
  }

  // Find next stop
  const nextStopIndex = route.stops.findIndex(s => s.status === 'pending')
  const nextStop = nextStopIndex >= 0 ? route.stops[nextStopIndex] : null

  return (
    <div className="p-6 space-y-6">
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
                {route.status === 'active'
                  ? 'En Curso'
                  : route.status === 'completed'
                  ? 'Completado'
                  : 'Programado'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(currentTime, "EEEE d 'de' MMMM, HH:mm", { locale: es })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {route.status === 'draft' && (
            <Button onClick={handleStart} size="lg">
              <Play className="h-4 w-4 mr-2" />
              Iniciar Recorrido
            </Button>
          )}
          {route.status === 'active' && (
            <Button onClick={handleComplete} variant="default" size="lg">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Completar Recorrido
            </Button>
          )}
        </div>
      </div>

      {/* Progress Card - Only show when active */}
      {route.status === 'active' && (
        <Card className="border-blue-500 border-2">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Progreso del Recorrido</p>
                  <p className="text-2xl font-bold">
                    {completedStops} de {route.stops.length} entregas
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Completado</p>
                  <p className="text-2xl font-bold">{Math.round(progress)}%</p>
                </div>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Stop Card - Only show when active and has pending stops */}
      {route.status === 'active' && nextStop && (
        <Card className="border-green-500 border-2 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-900 dark:text-green-100">
                Siguiente Parada
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                Parada #{nextStopIndex + 1} - {nextStop.address}
              </p>
              {(() => {
                const delivery = deliveries.find(d => d.id === nextStop.deliveryId)
                return (
                  <>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cliente: {delivery?.clientName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Código: {delivery?.trackingCode}
                    </p>
                    {delivery?.clientPhone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" />
                        {delivery.clientPhone}
                      </p>
                    )}
                  </>
                )
              })()}
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                size="lg"
                onClick={() => handleNavigateToStop(nextStop)}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Navegar a Destino
              </Button>
              <Button
                size="lg"
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleStopComplete(nextStop.id, nextStop.deliveryId)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar Entregado
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stops List */}
        <Card>
          <CardHeader>
            <CardTitle>Paradas del Recorrido</CardTitle>
            <CardDescription>
              {route.stops.length} paradas • {route.totalDistance?.toFixed(1)} km
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Starting Point */}
              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{route.startPoint.name}</p>
                  <p className="text-sm text-muted-foreground">{route.startPoint.address}</p>
                  <Badge variant="outline" className="mt-2">
                    Punto de Inicio
                  </Badge>
                </div>
              </div>

              {/* Stops */}
              {route.stops.map((stop, index) => {
                const delivery = deliveries.find(d => d.id === stop.deliveryId)
                const isCompleted = stop.status === 'completed'
                const isNext = index === nextStopIndex

                return (
                  <div
                    key={stop.id}
                    className={`flex items-start gap-4 pb-4 border-b last:border-b-0 ${
                      isCompleted ? 'opacity-60' : ''
                    } ${isNext ? 'bg-green-50 dark:bg-green-950 -mx-4 px-4 py-3 rounded-lg' : ''}`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                        isCompleted
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : isNext
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{stop.address}</p>
                            {isNext && (
                              <Badge className="bg-green-500">Siguiente</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {delivery?.clientName} - {delivery?.trackingCode}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {delivery?.packageDescription}
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
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {delivery?.packageWeight} kg
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
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleStopComplete(stop.id, stop.deliveryId)}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Marcar Entregado
                            </Button>
                          )}
                        </div>
                      )}

                      {isCompleted && stop.actualArrival && (
                        <p className="text-xs text-green-600 font-medium">
                          ✓ Entregado:{' '}
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

        {/* Map and Info */}
        <div className="space-y-6">
          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Ruta</CardTitle>
              <CardDescription>Vista completa del recorrido</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px] w-full">
                <RouteMapView
                  startPoint={route.startPoint}
                  stops={route.stops}
                  deliveries={deliveries.filter(d => route.deliveryIds.includes(d.id))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Route Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Recorrido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Paradas Totales</p>
                  <p className="text-2xl font-bold">{route.stops.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entregas</p>
                  <p className="text-2xl font-bold">{route.deliveryIds.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Distancia Total</p>
                  <p className="text-2xl font-bold">
                    {route.totalDistance?.toFixed(1)} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tiempo Estimado</p>
                  <p className="text-2xl font-bold">{route.estimatedDuration} min</p>
                </div>
              </div>

              {route.scheduledDate && (
                <div className="pt-4 border-t">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
