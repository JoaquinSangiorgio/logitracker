'use client'

import { useState, useEffect } from 'react'
import { useRoutesStore, useDeliveriesStore, useDriversStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Navigation,
  Clock,
  Package,
  CheckCircle2,
  Circle,
  Truck,
  Route as RouteIcon,
  User,
  RefreshCw,
  Play
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const LiveRouteMapView = dynamic(() => import('@/components/admin/live-route-map-view'), {
  ssr: false
})

export default function MonitoreoPage() {
  const router = useRouter()
  const { routes } = useRoutesStore()
  const { deliveries } = useDeliveriesStore()
  const { drivers } = useDriversStore()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [])

  const activeRoutes = routes.filter(r => r.status === 'active')

  // Auto-select first active route if none selected
  useEffect(() => {
    if (activeRoutes.length > 0 && !selectedRouteId) {
      setSelectedRouteId(activeRoutes[0].id)
    }
  }, [activeRoutes, selectedRouteId])

  const selectedRoute = selectedRouteId
    ? routes.find(r => r.id === selectedRouteId)
    : null

  const getStopStatusIcon = (status: string) => {
    if (status === 'completed')
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    return <Circle className="h-4 w-4 text-muted-foreground" />
  }

  const handleRefresh = () => {
    setCurrentTime(new Date())
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Monitoreo en Vivo</h1>
          <p className="text-muted-foreground">
            Seguimiento en tiempo real de rutas activas
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {format(currentTime, "EEEE d 'de' MMMM, HH:mm", { locale: es })}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rutas Activas</CardTitle>
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
              <RouteIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{activeRoutes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">en curso</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Choferes Activos</CardTitle>
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
              <Truck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {drivers.filter(d => d.status === 'busy').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">en ruta</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas Completadas</CardTitle>
            <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {activeRoutes.reduce(
                (sum, r) => sum + r.stops.filter(s => s.status === 'completed').length,
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">hoy</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas Pendientes</CardTitle>
            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
              <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {activeRoutes.reduce(
                (sum, r) => sum + r.stops.filter(s => s.status === 'pending').length,
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">restantes</p>
          </CardContent>
        </Card>
      </div>

      {activeRoutes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <RouteIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No hay rutas activas en este momento
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Cuando las rutas se inicien, aparecerán aquí para monitoreo en vivo
            </p>
            <Button onClick={() => router.push('/admin/recorridos')}>
              <Play className="h-4 w-4 mr-2" />
              Ver Recorridos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Map Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                    <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Mapa en Vivo</CardTitle>
                    <CardDescription className="font-medium">
                      {selectedRoute
                        ? `Seguimiento de: ${selectedRoute.name}`
                        : 'Selecciona una ruta para ver detalles'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[700px] w-full">
                  {selectedRoute && (
                    <LiveRouteMapView
                      route={selectedRoute}
                      deliveries={deliveries.filter(d =>
                        selectedRoute.deliveryIds.includes(d.id)
                      )}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Route Details Sidebar */}
          <div className="space-y-4">
            {/* Route Selector */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <CardTitle className="text-lg flex items-center gap-2">
                  <RouteIcon className="h-5 w-5 text-blue-600" />
                  Rutas Activas
                </CardTitle>
                <CardDescription className="font-medium">{activeRoutes.length} en curso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-6 max-h-[400px] overflow-y-auto">
                {activeRoutes.map(route => {
                  const completedStops = route.stops.filter(
                    s => s.status === 'completed'
                  ).length
                  const progress = (completedStops / route.stops.length) * 100
                  const isSelected = route.id === selectedRouteId

                  return (
                    <button
                      key={route.id}
                      onClick={() => setSelectedRouteId(route.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all shadow-sm hover:shadow-md ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-md scale-[1.02]'
                          : 'border-border hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-bold text-base">{route.name}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-900">
                              <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">
                              {route.driverName}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0">
                          Activa
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground font-medium">Progreso</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {completedStops}/{route.stops.length} entregas
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs mt-2">
                          <span className="text-muted-foreground">
                            {route.totalDistance?.toFixed(1)} km
                          </span>
                          <span className="text-muted-foreground">
                            ~{route.estimatedDuration} min
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            {/* Selected Route Details */}
            {selectedRoute && (
              <>
                {/* Route Info */}
                <Card className="shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-purple-600" />
                      Información de Ruta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Chofer
                      </span>
                      <span className="font-bold">{selectedRoute.driverName}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Paradas Totales
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{selectedRoute.stops.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                        <RouteIcon className="h-4 w-4" />
                        Distancia
                      </span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {selectedRoute.totalDistance?.toFixed(1)} km
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Tiempo Estimado
                      </span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">
                        {selectedRoute.estimatedDuration} min
                      </span>
                    </div>
                    {selectedRoute.startedAt && (
                      <div className="pt-3 border-t border-dashed">
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                          <span className="text-sm text-muted-foreground font-medium block mb-1">
                            Iniciado hace
                          </span>
                          <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                            {Math.floor(
                              (Date.now() - new Date(selectedRoute.startedAt).getTime()) /
                                60000
                            )}{' '}
                            minutos
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Stops List */}
                <Card className="shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Package className="h-5 w-5 text-orange-600" />
                          Paradas
                        </CardTitle>
                        <CardDescription className="font-medium mt-1">
                          {selectedRoute.stops.filter(s => s.status === 'completed').length}{' '}
                          de {selectedRoute.stops.length} completadas
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {Math.round((selectedRoute.stops.filter(s => s.status === 'completed').length / selectedRoute.stops.length) * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">completado</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedRoute.stops.map((stop, index) => {
                        const delivery = deliveries.find(d => d.id === stop.deliveryId)
                        const isCompleted = stop.status === 'completed'
                        const isNext =
                          !isCompleted &&
                          selectedRoute.stops
                            .slice(0, index)
                            .every(s => s.status === 'completed')

                        return (
                          <div
                            key={stop.id}
                            className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all ${
                              isNext
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-400 dark:border-green-600 shadow-md scale-[1.02]'
                                : isCompleted
                                ? 'opacity-60 border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/30'
                                : 'border-border bg-muted/30'
                            }`}
                          >
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold flex-shrink-0 shadow-sm ${
                                isCompleted
                                  ? 'bg-green-500 text-white'
                                  : isNext
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white animate-pulse'
                                  : 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                              }`}
                            >
                              {isCompleted ? '✓' : index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold truncate">
                                    {delivery?.clientName}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                                    {stop.address.split(',')[0]}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    {isNext && (
                                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs shadow-sm">
                                        → Siguiente
                                      </Badge>
                                    )}
                                    {isCompleted && stop.actualArrival && (
                                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        {format(
                                          new Date(stop.actualArrival),
                                          'HH:mm',
                                          { locale: es }
                                        )}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
