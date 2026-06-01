"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-muted text-muted-foreground", icon: Clock },
  assigned: { label: "Asignada", color: "bg-primary/20 text-primary", icon: Package },
  in_transit: { label: "En Transito", color: "bg-warning text-warning-foreground", icon: Truck },
  delivered: { label: "Entregada", color: "bg-success text-success-foreground", icon: CheckCircle },
  failed: { label: "Fallida", color: "bg-destructive text-destructive-foreground", icon: AlertTriangle }
}

export default function ClientHomePage() {
  const { currentUser, deliveries } = useStore() as any

  const clientDeliveries = deliveries.filter(d => d.clientId === currentUser?.id)
  const activeDeliveries = clientDeliveries.filter(d => d.status !== "delivered" && d.status !== "failed")
  const inTransit = clientDeliveries.filter(d => d.status === "in_transit")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Hola, {currentUser?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Bienvenido a tu portal de entregas
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Entregas Activas</CardDescription>
            <CardTitle className="text-3xl">{activeDeliveries.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>En proceso</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>En Transito</CardDescription>
            <CardTitle className="text-3xl">{inTransit.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="h-4 w-4" />
              <span>En camino</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Entregas Recientes</h2>
          <Link href="/client/deliveries" className="text-sm text-primary hover:underline">
            Ver todas
          </Link>
        </div>

        {clientDeliveries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold">No hay entregas</h3>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Aun no tienes entregas programadas
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {clientDeliveries.slice(0, 5).map(delivery => {
              const config = statusConfig[delivery.status]
              const StatusIcon = config.icon

              return (
                <Link key={delivery.id} href={`/client/deliveries/${delivery.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <StatusIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{delivery.trackingNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(delivery.estimatedDelivery), "PPP", { locale: es })}
                            </p>
                          </div>
                        </div>
                        <Badge className={config.color}>{config.label}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
