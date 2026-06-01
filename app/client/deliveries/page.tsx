"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Truck, CheckCircle, Clock, AlertTriangle, ChevronRight } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

type DeliveryStatusKey = "pending" | "assigned" | "in_transit" | "delivered" | "failed"

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-muted text-muted-foreground", icon: Clock },
  assigned: { label: "Asignada", color: "bg-primary/20 text-primary", icon: Package },
  in_transit: { label: "En Transito", color: "bg-warning text-warning-foreground", icon: Truck },
  delivered: { label: "Entregada", color: "bg-success text-success-foreground", icon: CheckCircle },
  failed: { label: "Fallida", color: "bg-destructive text-destructive-foreground", icon: AlertTriangle }
}

export default function ClientDeliveriesPage() {
  const { deliveries } = useStore()

  const clientDeliveries = deliveries.filter((d: { clientId: any }) => d.clientId)
  const activeDeliveries = clientDeliveries.filter((d: { status: string }) => d.status !== "delivered" && d.status !== "failed")
  const completedDeliveries = clientDeliveries.filter((d: { status: string }) => d.status === "delivered" || d.status === "failed")

  const DeliveryList = ({ items }: { items: typeof deliveries }) => (
    items.length === 0 ? (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold">No hay entregas</h3>
          <p className="text-sm text-muted-foreground text-center mt-2">
            No hay entregas en esta categoria
          </p>
        </CardContent>
      </Card>
    ) : (
      <div className="space-y-3">
        {items.map(delivery => {
          const config = statusConfig[delivery.status as DeliveryStatusKey] ?? statusConfig.pending
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
                        <p className="font-medium">{delivery.id}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {(delivery as any).destination?.address ?? "Sin direccion"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
  {(() => {
    try {
      // 1. Validamos que exista y no sea un string vacío
      if (!delivery.estimatedDelivery) return "Fecha por definir";
      
      const parsedDate = new Date(delivery.estimatedDelivery);
      
      // 2. Validamos si el objeto Date resultante es válido en JS
      if (isNaN(parsedDate.getTime())) return "Fecha por definir";
      
      return format(parsedDate, "PPP", { locale: es });
    } catch (error) {
      return "Fecha por definir"; // Evita que explote la pantalla si algo falla en el parseo
    }
  })()}
</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={config.color}>{config.label}</Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    )
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis Entregas</h1>
        <p className="text-muted-foreground">Rastrea y gestiona tus envios</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Activas ({activeDeliveries.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completadas ({completedDeliveries.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <DeliveryList items={activeDeliveries} />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <DeliveryList items={completedDeliveries} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
