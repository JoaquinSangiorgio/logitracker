"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertTriangle, Plus, Clock, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { IncidentType, IncidentPriority } from "@/lib/types"

const incidentTypeLabels: Record<string, string> = {
  vehicle_breakdown: "Averia del vehiculo",
  accident: "Accidente",
  delivery_issue: "Problema de entrega",
  customer_complaint: "Queja del cliente",
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

export default function DriverIncidentsPage() {
  const { incidents, deliveries, addIncident, currentUser } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newIncident, setNewIncident] = useState({
    type: "delivery_issue" as IncidentType,
    priority: "medium" as IncidentPriority,
    title: "",
    description: "",
    deliveryId: "none" // <-- Inicializado en "none" en lugar de ""
  })

  const driverDeliveries = deliveries.filter(d => d.driverId === currentUser?.id)
  const driverIncidents = incidents.filter(i => i.reportedBy === currentUser?.id)

  const handleSubmit = () => {
    if (!currentUser || !newIncident.title || !newIncident.description) return

    addIncident({
      type: newIncident.type,
      priority: newIncident.priority,
      status: "open",
      title: newIncident.title,
      description: newIncident.description,
      reportedBy: currentUser.id,
      deliveryId: newIncident.deliveryId === "none" ? undefined : newIncident.deliveryId
    })

    setNewIncident({
      type: "delivery_issue",
      priority: "medium",
      title: "",
      description: "",
      deliveryId: "none"
    })
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis Incidencias</h1>
          <p className="text-muted-foreground">Reporta y da seguimiento a problemas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setNewIncident({
              type: "delivery_issue",
              priority: "medium",
              title: "",
              description: "",
              deliveryId: "none"
            })
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Reportar Incidencia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva Incidencia</DialogTitle>
              <DialogDescription>
                Reporta un problema o situacion que requiera atencion
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Incidencia</Label>
                <Select
                  value={newIncident.type}
                  onValueChange={(value: IncidentType) => setNewIncident({ ...newIncident, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(incidentTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select
                  value={newIncident.priority}
                  onValueChange={(value: IncidentPriority) => setNewIncident({ ...newIncident, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
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
                    {/* ✅ SOLUCIÓN: Cambiado "" por "none" para evitar el crash de Radix */}
                    <SelectItem value="none">Ninguna</SelectItem>
                    {driverDeliveries.map((delivery, idx) => (
                      <SelectItem key={delivery.id || idx} value={delivery.id || `fallback-${idx}`}>
                        {(delivery.trackingNumber || delivery.trackingCode || "Envío") + ` - ${delivery.customerName || "Sin Nombre"}`}
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
                <Label>Descripcion Detallada</Label>
                <Textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  placeholder="Describe el problema con todos los detalles relevantes..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={!newIncident.title || !newIncident.description}>
                Reportar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {driverIncidents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No hay incidencias</h3>
            <p className="text-muted-foreground text-center mt-2">
              No has reportado ninguna incidencia aun
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {driverIncidents.map(incident => (
            <Card key={incident.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{incident.title}</CardTitle>
                    <CardDescription>
                      {/* ✅ SOLUCIÓN: Formateo con Try/Catch seguro para que no rompa la UI */}
                      {(() => {
                        try {
                          if (!incident.createdAt) return "Recién guardado";
                          const d = new Date(incident.createdAt);
                          if (isNaN(d.getTime())) return "Recién guardado";
                          return format(d, "PPp", { locale: es });
                        } catch (e) {
                          return "Recién guardado";
                        }
                      })()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{incidentTypeLabels[incident.type] || "Otro"}</Badge>
                    <Badge className={statusColors[incident.status as keyof typeof statusColors] || statusColors.open}>
                      {incident.status === "open" && <XCircle className="mr-1 h-3 w-3" />}
                      {incident.status === "in_progress" && <Clock className="mr-1 h-3 w-3" />}
                      {incident.status === "resolved" && <CheckCircle className="mr-1 h-3 w-3" />}
                      {statusLabels[incident.status as keyof typeof statusLabels] || "Abierta"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{incident.description}</p>
                {incident.resolution && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Resolucion:</p>
                    <p className="text-sm text-muted-foreground">{incident.resolution}</p>
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