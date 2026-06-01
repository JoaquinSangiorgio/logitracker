"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertTriangle, Plus, Clock, CheckCircle, XCircle, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { IncidentType, IncidentPriority } from "@/lib/types"

const incidentTypeLabels: Record<IncidentType, string> = {
  vehicle_breakdown: "Averia del vehiculo",
  accident: "Accidente",
  delivery_issue: "Problema de entrega",
  customer_complaint: "Queja",
  route_issue: "Problema de ruta",
  other: "Otro"
}

const priorityLabels: Record<IncidentPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Critica"
}

const statusColors = {
  open: "bg-destructive text-destructive-foreground",
  in_progress: "bg-warning text-warning-foreground",
  resolved: "bg-success text-success-foreground",
  closed: "bg-muted text-muted-foreground"
}

const statusLabels = {
  open: "Abierta",
  in_progress: "En Proceso",
  resolved: "Resuelta",
  closed: "Cerrada"
}

export default function ClientIncidentsPage() {
  const { currentUser, incidents, deliveries, addIncident } = useAppStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newIncident, setNewIncident] = useState({
    type: "customer_complaint" as IncidentType,
    priority: "medium" as IncidentPriority,
    title: "",
    description: "",
    deliveryId: ""
  })

  const clientDeliveries = deliveries.filter(d => d.clientId === currentUser?.id)
  const clientIncidents = incidents.filter(i => i.reportedBy === currentUser?.id)

  const handleSubmit = () => {
    if (!currentUser || !newIncident.title || !newIncident.description) return

    addIncident({
      type: newIncident.type,
      priority: newIncident.priority,
      status: "open",
      title: newIncident.title,
      description: newIncident.description,
      reportedBy: currentUser.id,
      deliveryId: newIncident.deliveryId || undefined
    })

    setNewIncident({
      type: "customer_complaint",
      priority: "medium",
      title: "",
      description: "",
      deliveryId: ""
    })
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incidencias</h1>
          <p className="text-muted-foreground">Reporta problemas con tus entregas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Reportar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva Incidencia</DialogTitle>
              <DialogDescription>
                Cuentanos que problema tuviste
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Problema</Label>
                <Select
                  value={newIncident.type}
                  onValueChange={(value: IncidentType) => setNewIncident({ ...newIncident, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_complaint">Queja general</SelectItem>
                    <SelectItem value="delivery_issue">Problema con entrega</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Entrega Relacionada (opcional)</Label>
                <Select
                  value={newIncident.deliveryId}
                  onValueChange={(value) => setNewIncident({ ...newIncident, deliveryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar entrega" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ninguna</SelectItem>
                    {clientDeliveries.map(delivery => (
                      <SelectItem key={delivery.id} value={delivery.id}>
                        {delivery.trackingNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Titulo</Label>
                <Input
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                  placeholder="Breve descripcion del problema"
                />
              </div>
              <div className="space-y-2">
                <Label>Descripcion</Label>
                <Textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  placeholder="Describe el problema con todos los detalles..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={!newIncident.title || !newIncident.description}>
                Enviar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {clientIncidents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No hay incidencias</h3>
            <p className="text-muted-foreground text-center mt-2">
              No has reportado ningun problema aun
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {clientIncidents.map(incident => (
            <Card key={incident.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{incident.title}</CardTitle>
                    <CardDescription>
                      {format(new Date(incident.createdAt), "PPp", { locale: es })}
                    </CardDescription>
                  </div>
                  <Badge className={statusColors[incident.status]}>
                    {incident.status === "open" && <XCircle className="mr-1 h-3 w-3" />}
                    {incident.status === "in_progress" && <Clock className="mr-1 h-3 w-3" />}
                    {incident.status === "resolved" && <CheckCircle className="mr-1 h-3 w-3" />}
                    {statusLabels[incident.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{incident.description}</p>
                {incident.resolution && (
                  <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm font-medium text-success">Resolucion:</p>
                    <p className="text-sm text-muted-foreground mt-1">{incident.resolution}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
