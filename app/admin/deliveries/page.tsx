'use client'

import { useState, useMemo } from 'react'
import { useDeliveriesStore, useDriversStore, useClientsStore } from '@/lib/store'
import { deliveryStatusLabels, priorityLabels } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { LocationPicker } from '@/components/admin/location-picker'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  Package,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Eye,
  UserPlus,
  Map
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Delivery, DeliveryStatus } from '@/lib/types'

export default function DeliveriesPage() {
  const { deliveries, addDelivery, updateDelivery, deleteDelivery, assignDriver, updateStatus } = useDeliveriesStore()
  const { drivers } = useDriversStore()
  const { clients } = useClientsStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false)
  const [locationPickerType, setLocationPickerType] = useState<'pickup' | 'delivery'>('pickup')
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [formData, setFormData] = useState({
    clientId: '',
    priority: 'medium' as const,
    pickupAddress: '',
    pickupLat: 19.4326,
    pickupLng: -99.1332,
    deliveryAddress: '',
    deliveryLat: 19.4226,
    deliveryLng: -99.1432,
    estimatedDelivery: '',
    packageDescription: '',
    packageWeight: 0,
    packageSize: 'medium' as const
  })

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(delivery => {
      const matchesSearch = 
        delivery.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (delivery.driverName?.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [deliveries, searchTerm, statusFilter])

  const stats = useMemo(() => ({
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === 'pending').length,
    inTransit: deliveries.filter(d => ['assigned', 'picked_up', 'in_transit', 'arriving'].includes(d.status)).length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    failed: deliveries.filter(d => d.status === 'failed').length
  }), [deliveries])

  const handleAddDelivery = () => {
    const client = clients.find(c => c.id === formData.clientId)
    if (!client) return

    addDelivery({
      ...formData,
      clientName: client.name,
      status: 'pending'
    })
    setFormData({
      clientId: '',
      priority: 'medium',
      pickupAddress: '',
      pickupLat: 19.4326,
      pickupLng: -99.1332,
      deliveryAddress: '',
      deliveryLat: 19.4226,
      deliveryLng: -99.1432,
      estimatedDelivery: '',
      packageDescription: '',
      packageWeight: 0,
      packageSize: 'medium'
    })
    setIsAddDialogOpen(false)
  }

  const handleAssignDriver = (driverId: string) => {
    if (!selectedDelivery) return
    const driver = drivers.find(d => d.id === driverId)
    if (driver) {
      assignDriver(selectedDelivery.id, driverId, driver.name)
      setIsAssignDialogOpen(false)
      setSelectedDelivery(null)
    }
  }

  const handleStatusChange = (deliveryId: string, status: DeliveryStatus) => {
    updateStatus(deliveryId, status)
  }

  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    if (locationPickerType === 'pickup') {
      setFormData({
        ...formData,
        pickupAddress: location.address,
        pickupLat: location.lat,
        pickupLng: location.lng,
      })
    } else {
      setFormData({
        ...formData,
        deliveryAddress: location.address,
        deliveryLat: location.lat,
        deliveryLng: location.lng,
      })
    }
    setIsLocationPickerOpen(false)
  }

  const handleDeleteDelivery = (id: string) => {
    if (confirm('Esta seguro de eliminar esta entrega?')) {
      deleteDelivery(id)
    }
  }

  const getStatusBadge = (status: DeliveryStatus) => {
    const variants: Record<DeliveryStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className: string }> = {
      pending: { variant: 'secondary', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
      assigned: { variant: 'secondary', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
      picked_up: { variant: 'secondary', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' },
      in_transit: { variant: 'default', className: 'bg-primary text-primary-foreground' },
      arriving: { variant: 'secondary', className: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-100' },
      delivered: { variant: 'secondary', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
      failed: { variant: 'destructive', className: '' },
      cancelled: { variant: 'outline', className: '' }
    }
    const config = variants[status]
    return <Badge variant={config.variant} className={config.className}>{deliveryStatusLabels[status]}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">{priorityLabels[priority]}</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">{priorityLabels[priority]}</Badge>
      case 'medium':
        return <Badge variant="secondary">{priorityLabels[priority]}</Badge>
      default:
        return <Badge variant="outline">{priorityLabels[priority]}</Badge>
    }
  }

  const availableDrivers = drivers.filter(d => d.status === 'available')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entregas</h1>
          <p className="text-muted-foreground">Gestiona todas las entregas del sistema</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Entrega
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Entrega</DialogTitle>
              <DialogDescription>
                Ingresa los datos de la nueva entrega
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Cliente</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Prioridad</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Dirección de recogida</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.pickupAddress}
                    onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                    placeholder="Bodega Central, Av. Tlahuac 100"
                    readOnly
                    className="cursor-pointer"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setLocationPickerType('pickup')
                      setIsLocationPickerOpen(true)
                    }}
                    className="shrink-0 gap-2"
                  >
                    <Map className="h-4 w-4" />
                    Mapa
                  </Button>
                </div>
                {formData.pickupLat && formData.pickupLng && (
                  <p className="text-xs text-muted-foreground">
                    📍 {formData.pickupLat.toFixed(4)}, {formData.pickupLng.toFixed(4)}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Dirección de entrega</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    placeholder="Av. Reforma 123, Col. Centro"
                    readOnly
                    className="cursor-pointer"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setLocationPickerType('delivery')
                      setIsLocationPickerOpen(true)
                    }}
                    className="shrink-0 gap-2"
                  >
                    <Map className="h-4 w-4" />
                    Mapa
                  </Button>
                </div>
                {formData.deliveryLat && formData.deliveryLng && (
                  <p className="text-xs text-muted-foreground">
                    📍 {formData.deliveryLat.toFixed(4)}, {formData.deliveryLng.toFixed(4)}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Fecha estimada de entrega</Label>
                  <Input
                    type="datetime-local"
                    value={formData.estimatedDelivery}
                    onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Tamano del paquete</Label>
                  <Select
                    value={formData.packageSize}
                    onValueChange={(value: 'medium' | 'large' | 'extra-large') => setFormData({ ...formData, packageSize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeno</SelectItem>
                      <SelectItem value="medium">Mediano</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                      <SelectItem value="extra-large">Extra Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Descripcion del paquete</Label>
                <Textarea
                  value={formData.packageDescription}
                  onChange={(e) => setFormData({ ...formData, packageDescription: e.target.value })}
                  placeholder="Describe el contenido del paquete..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddDelivery}>Crear Entrega</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <LocationPicker
          open={isLocationPickerOpen}
          onOpenChange={setIsLocationPickerOpen}
          onLocationSelect={handleLocationSelect}
          type={locationPickerType}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-orange-100">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-blue-100">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Transito</p>
                <p className="text-2xl font-bold">{stats.inTransit}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entregados</p>
                <p className="text-2xl font-bold">{stats.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fallidos</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Lista de Entregas</CardTitle>
              <CardDescription>Todas las entregas registradas en el sistema</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por codigo o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="assigned">Asignado</SelectItem>
                  <SelectItem value="picked_up">Recogido</SelectItem>
                  <SelectItem value="in_transit">En Transito</SelectItem>
                  <SelectItem value="delivered">Entregado</SelectItem>
                  <SelectItem value="failed">Fallido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codigo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Chofer</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>
                    <div>
                      <p className="font-mono font-medium">{delivery.trackingCode}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(delivery.createdAt), 'dd MMM yyyy', { locale: es })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{delivery.clientName}</p>
                  </TableCell>
                  <TableCell>
                    {delivery.driverName ? (
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span>{delivery.driverName}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 max-w-[200px]">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate text-sm">{delivery.deliveryAddress}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                  <TableCell>{getPriorityBadge(delivery.priority)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                          setSelectedDelivery(delivery)
                          setIsDetailDialogOpen(true)
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        {!delivery.driverId && (
                          <DropdownMenuItem onClick={() => {
                            setSelectedDelivery(delivery)
                            setIsAssignDialogOpen(true)
                          }}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Asignar chofer
                          </DropdownMenuItem>
                        )}
                        {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(delivery.id, 'in_transit')}>
                              Marcar en transito
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(delivery.id, 'delivered')}>
                              Marcar entregado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(delivery.id, 'failed')}>
                              Marcar fallido
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteDelivery(delivery.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de Entrega</DialogTitle>
            <DialogDescription>
              Codigo: {selectedDelivery?.trackingCode}
            </DialogDescription>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Cliente</Label>
                  <p className="font-medium">{selectedDelivery.clientName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Chofer</Label>
                  <p className="font-medium">{selectedDelivery.driverName || 'Sin asignar'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <div className="mt-1">{getStatusBadge(selectedDelivery.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Prioridad</Label>
                  <div className="mt-1">{getPriorityBadge(selectedDelivery.priority)}</div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Direccion de recogida</Label>
                <p>{selectedDelivery.pickupAddress}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Direccion de entrega</Label>
                <p>{selectedDelivery.deliveryAddress}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Descripcion del paquete</Label>
                <p>{selectedDelivery.packageDescription}</p>
              </div>
              {selectedDelivery.proof && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <Label className="text-green-700">Prueba de entrega</Label>
                  <p className="text-sm mt-1">Recibido por: {selectedDelivery.proof.receiverName}</p>
                  {selectedDelivery.proof.notes && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedDelivery.proof.notes}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Driver Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Asignar Chofer</DialogTitle>
            <DialogDescription>
              Selecciona un chofer disponible para esta entrega
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {availableDrivers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No hay choferes disponibles
              </p>
            ) : (
              availableDrivers.map(driver => (
                <div 
                  key={driver.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleAssignDriver(driver.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Truck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{driver.name}</p>
                      <p className="text-xs text-muted-foreground">{driver.vehicleType} - {driver.vehiclePlate}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Disponible</Badge>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
