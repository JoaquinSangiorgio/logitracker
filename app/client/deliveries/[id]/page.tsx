"use client"

import { use, useEffect, useState } from "react"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  MapPin,
  User,
  Phone,
  Calendar,
  Navigation
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import dynamic from "next/dynamic"

const TrackingMap = dynamic(() => import("@/components/client/tracking-map"), { ssr: false })

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-muted text-muted-foreground", icon: Clock },
  assigned: { label: "Asignada", color: "bg-primary/20 text-primary", icon: Package },
  in_transit: { label: "En Transito", color: "bg-warning text-warning-foreground", icon: Truck },
  delivered: { label: "Entregada", color: "bg-success text-success-foreground", icon: CheckCircle },
  failed: { label: "Fallida", color: "bg-destructive text-destructive-foreground", icon: AlertTriangle }
}

const statusSteps = [
  { key: "pending", label: "Pendiente", description: "Orden recibida" },
  { key: "assigned", label: "Asignada", description: "Chofer asignado" },
  { key: "in_transit", label: "En Transito", description: "En camino a destino" },
  { key: "delivered", label: "Entregada", description: "Entrega completada" }
]

export default function ClientDeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { deliveries, drivers } = useStore()
  const router = useRouter()
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null)

  const delivery = deliveries.find(d => d.id === id)
  const driver = delivery?.driverId ? drivers.find(d => d.id === delivery.driverId) : null
  const destination = (delivery as (typeof delivery & {
    destination?: { lat: number; lng: number; address?: string }
  }))?.destination

  useEffect(() => {
    if (delivery?.status === "in_transit" && driver && destination) {
      const interval = setInterval(() => {
        const baseLat = destination.lat
        const baseLng = destination.lng
        setDriverLocation({
          lat: baseLat + (Math.random() - 0.5) * 0.02,
          lng: baseLng + (Math.random() - 0.5) * 0.02
        })
      }, 3000)

      setDriverLocation({
        lat: destination.lat + 0.01,
        lng: destination.lng + 0.01
      })

      return () => clearInterval(interval)
    }
  }, [delivery, driver, destination])

  if (!delivery) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold">Entrega no encontrada</h3>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>
    )
  }

  const config = statusConfig[delivery.status]
  const StatusIcon = config.icon
  const currentStepIndex = statusSteps.findIndex(s => s.key === delivery.status)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{delivery.trackingNumber}</h1>
          <Badge className={config.color}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      </div>

      {delivery.status === "in_transit" && driverLocation && destination && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" />
              Ubicacion en Tiempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[250px] rounded-b-lg overflow-hidden">
              <TrackingMap 
                driverLocation={driverLocation}
                destination={destination}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado del Envio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex
              const isCurrent = index === currentStepIndex

              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div className={`w-0.5 h-8 mt-2 ${
                        isCompleted && index < currentStepIndex
                          ? "bg-primary" 
                          : "bg-border"
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className={`font-medium ${isCurrent ? "text-primary" : ""}`}>
                      {step.label}
                    </p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalles de Entrega</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Direccion de Entrega</p>
              <p className="text-sm text-muted-foreground">{destination?.address ?? "Sin direccion"}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Fecha Estimada</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(delivery.estimatedDelivery), "PPP", { locale: es })}
              </p>
            </div>
          </div>
          {driver && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Chofer Asignado</p>
                  <p className="text-sm text-muted-foreground">{driver.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Telefono</p>
                  <p className="text-sm text-muted-foreground">{driver.phone}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {delivery.proof && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prueba de Entrega</CardTitle>
            <CardDescription>
              Recibido por: {delivery.proof.receiverName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {delivery.proof.signature && (
              <div>
                <p className="text-sm font-medium mb-2">Firma</p>
                <div className="border rounded-lg p-2 bg-card">
                  <img 
                    src={delivery.proof.signature} 
                    alt="Firma" 
                    className="max-h-24 mx-auto"
                  />
                </div>
              </div>
            )}
            {delivery.proof.photo && (
              <div>
                <p className="text-sm font-medium mb-2">Foto</p>
                <div className="border rounded-lg overflow-hidden">
                  <img 
                    src={delivery.proof.photo} 
                    alt="Foto de entrega" 
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Entregado el {format(new Date(delivery.proof.timestamp), "PPp", { locale: es })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
