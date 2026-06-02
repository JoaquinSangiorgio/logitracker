'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useRoutesStore, useDriversStore, useDeliveriesStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Sparkles, MapPin, Package, Clock, Route as RouteIcon, Filter, ArrowUpDown } from 'lucide-react'
import { optimizeRoute, calculateRouteStats } from '@/lib/route-optimizer'
import { DEFAULT_START_POINT } from '@/lib/mock-data'
import type { Delivery, Route } from '@/lib/types'
import dynamic from 'next/dynamic'

// Importar el mapa de forma dinámica para evitar problemas con SSR
const RouteMapView = dynamic(() => import('@/components/admin/route-map-view'), { ssr: false })

type SortOption = 'newest' | 'oldest' | 'priority-high' | 'priority-low' | 'date-asc' | 'date-desc'
type FilterStatus = 'all' | 'pending' | 'assigned'

export default function NuevoRecorridoPage() {
  const router = useRouter()
  const { addRoute } = useRoutesStore()
  const { drivers } = useDriversStore()
  const { deliveries } = useDeliveriesStore()

  const [name, setName] = useState('')
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [selectedDeliveryIds, setSelectedDeliveryIds] = useState<string[]>([])
  const [startPoint, setStartPoint] = useState(DEFAULT_START_POINT)
  const [scheduledDate, setScheduledDate] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedPreview, setOptimizedPreview] = useState<{
    stops: any[]
    totalDistance: number
    estimatedDuration: number
  } | null>(null)

  // Estados para filtros y ordenamiento
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [searchQuery, setSearchQuery] = useState('')

  const selectedDriver = drivers.find(d => d.id === selectedDriverId)

  // Filtrar y ordenar entregas disponibles
  const filteredAndSortedDeliveries = useMemo(() => {
    let filtered = deliveries.filter(d => {
      // Filtrar por estado
      if (filterStatus !== 'all' && d.status !== filterStatus) return false

      // Filtrar por prioridad
      if (filterPriority !== 'all' && d.priority !== filterPriority) return false

      // Filtrar por búsqueda
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          d.trackingCode.toLowerCase().includes(query) ||
          d.clientName.toLowerCase().includes(query) ||
          d.deliveryAddress.toLowerCase().includes(query) ||
          d.packageDescription.toLowerCase().includes(query)
        )
      }

      return true
    })

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'priority-high':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'priority-low':
          const priorityOrder2 = { urgent: 4, high: 3, medium: 2, low: 1 }
          return priorityOrder2[a.priority] - priorityOrder2[b.priority]
        case 'date-asc':
          return new Date(a.estimatedDelivery).getTime() - new Date(b.estimatedDelivery).getTime()
        case 'date-desc':
          return new Date(b.estimatedDelivery).getTime() - new Date(a.estimatedDelivery).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [deliveries, filterStatus, filterPriority, searchQuery, sortBy])

  const availableDeliveries = filteredAndSortedDeliveries

  const handleDeliveryToggle = (deliveryId: string) => {
    setSelectedDeliveryIds(prev =>
      prev.includes(deliveryId)
        ? prev.filter(id => id !== deliveryId)
        : [...prev, deliveryId]
    )
    setOptimizedPreview(null)
  }

  const handleSelectAll = () => {
    if (selectedDeliveryIds.length === availableDeliveries.length) {
      setSelectedDeliveryIds([])
    } else {
      setSelectedDeliveryIds(availableDeliveries.map(d => d.id))
    }
    setOptimizedPreview(null)
  }

  const handleOptimize = () => {
    if (selectedDeliveryIds.length === 0) {
      alert('Selecciona al menos una entrega')
      return
    }

    setIsOptimizing(true)

    setTimeout(() => {
      const selectedDeliveries = deliveries.filter(d =>
        selectedDeliveryIds.includes(d.id)
      )

      const startTime = scheduledDate ? new Date(scheduledDate) : new Date()

      const optimizedStops = optimizeRoute(
        startPoint.lat,
        startPoint.lng,
        selectedDeliveries,
        startTime
      )

      const stats = calculateRouteStats(optimizedStops)

      setOptimizedPreview({
        stops: optimizedStops,
        ...stats
      })

      setIsOptimizing(false)
    }, 1000)
  }

  const handleSave = () => {
    if (!name.trim()) {
      alert('Ingresa un nombre para el recorrido')
      return
    }

    if (!selectedDriverId) {
      alert('Selecciona un chofer')
      return
    }

    if (selectedDeliveryIds.length === 0) {
      alert('Selecciona al menos una entrega')
      return
    }

    if (!optimizedPreview) {
      alert('Optimiza la ruta antes de guardar')
      return
    }

    const newRoute: Omit<Route, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      driverId: selectedDriverId,
      driverName: selectedDriver?.name || '',
      status: 'draft',
      startPoint,
      stops: optimizedPreview.stops,
      deliveryIds: selectedDeliveryIds,
      totalDistance: optimizedPreview.totalDistance,
      estimatedDuration: optimizedPreview.estimatedDuration,
      scheduledDate: scheduledDate || undefined
    }

    addRoute(newRoute)
    router.push('/admin/recorridos')
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-500'
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nuevo Recorrido</h1>
          <p className="text-muted-foreground">Crea y optimiza un nuevo recorrido de entregas</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna 1: Formulario */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Recorrido</CardTitle>
              <CardDescription>Configura los detalles básicos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Recorrido</Label>
                <Input
                  id="name"
                  placeholder="Ej: Ruta Norte - Mañana"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="driver">Chofer Asignado</Label>
                <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un chofer" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers
                      .filter(d => d.status === 'available' || d.status === 'busy')
                      .map(driver => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} - {driver.vehicleType} ({driver.vehiclePlate})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Fecha y Hora de Inicio</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Afecta la optimización de la ruta
                </p>
              </div>

              <div className="space-y-2">
                <Label>Punto de Inicio</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium text-sm">{startPoint.name}</p>
                  <p className="text-xs text-muted-foreground">{startPoint.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtros y Búsqueda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Tracking, cliente, dirección..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterStatus">Estado</Label>
                <Select value={filterStatus} onValueChange={(v: FilterStatus) => setFilterStatus(v)}>
                  <SelectTrigger id="filterStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="assigned">Asignado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterPriority">Prioridad</Label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger id="filterPriority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortBy" className="flex items-center gap-2">
                  <ArrowUpDown className="h-3 w-3" />
                  Ordenar por
                </Label>
                <Select value={sortBy} onValueChange={(v: SortOption) => setSortBy(v)}>
                  <SelectTrigger id="sortBy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Más recientes</SelectItem>
                    <SelectItem value="oldest">Más antiguas</SelectItem>
                    <SelectItem value="priority-high">Mayor prioridad</SelectItem>
                    <SelectItem value="priority-low">Menor prioridad</SelectItem>
                    <SelectItem value="date-asc">Fecha entrega (asc)</SelectItem>
                    <SelectItem value="date-desc">Fecha entrega (desc)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna 2: Lista de Entregas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Entregas Disponibles</CardTitle>
                  <CardDescription>
                    {selectedDeliveryIds.length} de {availableDeliveries.length} seleccionadas
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedDeliveryIds.length === availableDeliveries.length ? 'Deseleccionar' : 'Seleccionar'} Todo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {availableDeliveries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay entregas que coincidan con los filtros
                  </p>
                ) : (
                  availableDeliveries.map(delivery => (
                    <div
                      key={delivery.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                        selectedDeliveryIds.includes(delivery.id) ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        id={delivery.id}
                        checked={selectedDeliveryIds.includes(delivery.id)}
                        onCheckedChange={() => handleDeliveryToggle(delivery.id)}
                      />
                      <label htmlFor={delivery.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{delivery.trackingCode}</p>
                          <Badge className={getPriorityColor(delivery.priority)}>
                            {delivery.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {delivery.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {delivery.deliveryAddress}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Cliente: {delivery.clientName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Entrega: {new Date(delivery.estimatedDelivery).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </label>
                    </div>
                  ))
                )}
              </div>

              {selectedDeliveryIds.length > 0 && (
                <Button
                  className="w-full mt-4"
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isOptimizing ? 'Optimizando...' : `Optimizar Ruta (${selectedDeliveryIds.length})`}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna 3: Preview y Mapa */}
        <div className="space-y-6">
          {optimizedPreview ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Ruta Optimizada</CardTitle>
                  <CardDescription>Resultado de la optimización</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Package className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-2xl font-bold">{optimizedPreview.stops.length}</p>
                      <p className="text-xs text-muted-foreground">Paradas</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <RouteIcon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-2xl font-bold">{optimizedPreview.totalDistance.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">km</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-2xl font-bold">{optimizedPreview.estimatedDuration}</p>
                      <p className="text-xs text-muted-foreground">min</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mapa */}
              <Card>
                <CardHeader>
                  <CardTitle>Vista de Mapa</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[300px] w-full">
                    <RouteMapView
                      startPoint={startPoint}
                      stops={optimizedPreview.stops}
                      deliveries={deliveries.filter(d => selectedDeliveryIds.includes(d.id))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Orden de Paradas</CardTitle>
                  <CardDescription>Secuencia optimizada</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                        0
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{startPoint.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{startPoint.address}</p>
                        <p className="text-xs text-muted-foreground mt-1">Punto de inicio</p>
                      </div>
                    </div>

                    {optimizedPreview.stops.map((stop, index) => {
                      const delivery = deliveries.find(d => d.id === stop.deliveryId)
                      return (
                        <div key={stop.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{stop.address}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {delivery?.clientName} - {delivery?.trackingCode}
                            </p>
                            {delivery && (
                              <Badge className={`${getPriorityColor(delivery.priority)} text-[10px] mt-1`}>
                                {delivery.priority}
                              </Badge>
                            )}
                            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                              <span>{stop.distance} km</span>
                              <span>~{stop.duration} min</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full" size="lg" onClick={handleSave}>
                <Save className="h-5 w-5 mr-2" />
                Guardar Recorrido
              </Button>
            </>
          ) : (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Selecciona entregas y optimiza la ruta<br />para ver el resultado y mapa aquí
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
