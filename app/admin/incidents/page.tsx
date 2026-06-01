'use client'

import { useState, useMemo } from 'react'
import { useIncidentsStore, useDeliveriesStore, useAuthStore } from '@/lib/store'
import { incidentStatusLabels, incidentTypeLabels, priorityLabels } from '@/lib/mock-data'
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
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  UserPlus,
  MessageSquare
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Incident, IncidentStatus, IncidentType } from '@/lib/types'

export default function IncidentsPage() {
  const { incidents, addIncident, updateIncident, deleteIncident, resolveIncident, assignIncident } = useIncidentsStore()
  const { deliveries } = useDeliveriesStore()
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [resolution, setResolution] = useState('')
  const [formData, setFormData] = useState({
    deliveryId: '',
    type: 'other' as IncidentType,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    title: '',
    description: ''
  })

  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const matchesSearch = 
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.reporterName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || incident.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [incidents, searchTerm, statusFilter])

  const stats = useMemo(() => ({
    total: incidents.length,
    open: incidents.filter(i => i.status === 'open').length,
    inProgress: incidents.filter(i => i.status === 'in_progress').length,
    resolved: incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length,
    critical: incidents.filter(i => i.priority === 'critical' && i.status !== 'resolved' && i.status !== 'closed').length
  }), [incidents])

  const handleAddIncident = () => {
    if (!user) return

    const delivery = deliveries.find(d => d.id === formData.deliveryId)
    
    addIncident({
      ...formData,
      deliveryId: formData.deliveryId || undefined,
      reporterId: user.id,
      reporterName: user.name,
      reporterRole: user.role,
      status: 'open'
    })
    
    setFormData({
      deliveryId: '',
      type: 'other',
      priority: 'medium',
      title: '',
      description: ''
    })
    setIsAddDialogOpen(false)
  }

  const handleResolveIncident = () => {
    if (!selectedIncident || !resolution) return
    resolveIncident(selectedIncident.id, resolution)
    setIsResolveDialogOpen(false)
    setSelectedIncident(null)
    setResolution('')
  }

  const handleAssignToMe = (incident: Incident) => {
    if (!user) return
    assignIncident(incident.id, user.id, user.name)
  }

  const handleDeleteIncident = (id: string) => {
    if (confirm('Esta seguro de eliminar esta incidencia?')) {
      deleteIncident(id)
    }
  }

  const getStatusBadge = (status: IncidentStatus) => {
    const variants: Record<IncidentStatus, { className: string }> = {
      open: { className: 'bg-red-100 text-red-700 hover:bg-red-100' },
      in_progress: { className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
      pending_info: { className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
      resolved: { className: 'bg-green-100 text-green-700 hover:bg-green-100' },
      closed: { className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' }
    }
    return <Badge variant="secondary" className={variants[status].className}>{incidentStatusLabels[status]}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">{priorityLabels[priority]}</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">{priorityLabels[priority]}</Badge>
      case 'medium':
        return <Badge variant="secondary">{priorityLabels[priority]}</Badge>
      default:
        return <Badge variant="outline">{priorityLabels[priority]}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidencias</h1>
          <p className="text-muted-foreground">Gestiona los problemas reportados</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Incidencia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Reportar Incidencia</DialogTitle>
              <DialogDescription>
                Describe el problema encontrado
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo de incidencia</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: IncidentType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damaged_package">Paquete danado</SelectItem>
                      <SelectItem value="delayed_delivery">Entrega retrasada</SelectItem>
                      <SelectItem value="wrong_address">Direccion incorrecta</SelectItem>
                      <SelectItem value="customer_absent">Cliente ausente</SelectItem>
                      <SelectItem value="vehicle_issue">Problema vehicular</SelectItem>
                      <SelectItem value="route_problem">Problema de ruta</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Prioridad</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Critica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Entrega relacionada (opcional)</Label>
                <Select
                  value={formData.deliveryId}
                  onValueChange={(value) => setFormData({ ...formData, deliveryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar entrega" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ninguna</SelectItem>
                    {deliveries.map(delivery => (
                      <SelectItem key={delivery.id} value={delivery.id}>
                        {delivery.trackingCode} - {delivery.clientName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Titulo</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Resumen breve del problema"
                />
              </div>
              <div className="grid gap-2">
                <Label>Descripcion</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el problema en detalle..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddIncident}>Reportar Incidencia</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <AlertTriangle className="h-5 w-5 text-primary" />
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
              <div className="p-2 rounded-full bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abiertas</p>
                <p className="text-2xl font-bold">{stats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Proceso</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
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
                <p className="text-sm text-muted-foreground">Resueltas</p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={stats.critical > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${stats.critical > 0 ? 'bg-red-200' : 'bg-orange-100'}`}>
                <AlertTriangle className={`h-5 w-5 ${stats.critical > 0 ? 'text-red-700' : 'text-orange-600'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Criticas</p>
                <p className={`text-2xl font-bold ${stats.critical > 0 ? 'text-red-700' : ''}`}>{stats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Lista de Incidencias</CardTitle>
              <CardDescription>Todas las incidencias reportadas</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por titulo o reportador..."
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
                  <SelectItem value="open">Abierto</SelectItem>
                  <SelectItem value="in_progress">En proceso</SelectItem>
                  <SelectItem value="pending_info">Pendiente info</SelectItem>
                  <SelectItem value="resolved">Resuelto</SelectItem>
                  <SelectItem value="closed">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incidencia</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Reportado por</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{incident.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(incident.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{incidentTypeLabels[incident.type]}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{incident.reporterName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{incident.reporterRole}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {incident.assigneeName ? (
                      <span className="text-sm">{incident.assigneeName}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(incident.status)}</TableCell>
                  <TableCell>{getPriorityBadge(incident.priority)}</TableCell>
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
                          setSelectedIncident(incident)
                          setIsDetailDialogOpen(true)
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        {!incident.assigneeId && (
                          <DropdownMenuItem onClick={() => handleAssignToMe(incident)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Asignarme
                          </DropdownMenuItem>
                        )}
                        {incident.status !== 'resolved' && incident.status !== 'closed' && (
                          <DropdownMenuItem onClick={() => {
                            setSelectedIncident(incident)
                            setIsResolveDialogOpen(true)
                          }}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Resolver
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteIncident(incident.id)}
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
            <DialogTitle>Detalles de Incidencia</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedIncident.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Reportado el {format(new Date(selectedIncident.createdAt), 'dd MMMM yyyy a las HH:mm', { locale: es })}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <div className="mt-1">{getStatusBadge(selectedIncident.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Prioridad</Label>
                  <div className="mt-1">{getPriorityBadge(selectedIncident.priority)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p>{incidentTypeLabels[selectedIncident.type]}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reportado por</Label>
                  <p>{selectedIncident.reporterName} ({selectedIncident.reporterRole})</p>
                </div>
              </div>

              {selectedIncident.assigneeName && (
                <div>
                  <Label className="text-muted-foreground">Asignado a</Label>
                  <p>{selectedIncident.assigneeName}</p>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">Descripcion</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedIncident.description}</p>
              </div>

              {selectedIncident.resolution && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <Label className="text-green-700">Resolucion</Label>
                  <p className="mt-1">{selectedIncident.resolution}</p>
                  {selectedIncident.resolvedAt && (
                    <p className="text-xs text-green-600 mt-2">
                      Resuelto el {format(new Date(selectedIncident.resolvedAt), 'dd MMM yyyy HH:mm', { locale: es })}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Resolver Incidencia</DialogTitle>
            <DialogDescription>
              Describe como se resolvio el problema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Resolucion</Label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe la solucion aplicada..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleResolveIncident} disabled={!resolution}>
              Marcar como Resuelto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
