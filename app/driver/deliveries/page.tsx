'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuthStore, useDeliveriesStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { deliveryStatusLabels, priorityLabels } from '@/lib/mock-data'
import { Package, MapPin, Search, Clock, CheckCircle2 } from 'lucide-react'
import type { Driver } from '@/lib/types'

export default function DriverDeliveriesPage() {
  const { user } = useAuthStore()
  const { deliveries } = useDeliveriesStore()
  const driver = user as Driver | null
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('pending')

  const myDeliveries = useMemo(() => {
    if (!driver) return []
    return deliveries.filter(d => d.driverId === driver.id)
  }, [deliveries, driver])

  const filteredDeliveries = useMemo(() => {
    let filtered = myDeliveries

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by tab
    switch (activeTab) {
      case 'pending':
        return filtered.filter(d => ['assigned', 'picked_up'].includes(d.status))
      case 'in_transit':
        return filtered.filter(d => ['in_transit', 'arriving'].includes(d.status))
      case 'completed':
        return filtered.filter(d => ['delivered', 'failed'].includes(d.status))
      default:
        return filtered
    }
  }, [myDeliveries, searchTerm, activeTab])

  const counts = useMemo(() => ({
    pending: myDeliveries.filter(d => ['assigned', 'picked_up'].includes(d.status)).length,
    in_transit: myDeliveries.filter(d => ['in_transit', 'arriving'].includes(d.status)).length,
    completed: myDeliveries.filter(d => ['delivered', 'failed'].includes(d.status)).length
  }), [myDeliveries])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-700'
      case 'picked_up': return 'bg-indigo-100 text-indigo-700'
      case 'in_transit': return 'bg-primary text-primary-foreground'
      case 'arriving': return 'bg-cyan-100 text-cyan-700'
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'failed': return 'bg-red-100 text-red-700'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      default: return ''
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Mis Entregas</h1>
        <p className="text-muted-foreground text-sm">Gestiona tus entregas asignadas</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por codigo, cliente o direccion..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="text-xs">
            Pendientes ({counts.pending})
          </TabsTrigger>
          <TabsTrigger value="in_transit" className="text-xs">
            En Ruta ({counts.in_transit})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">
            Completadas ({counts.completed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-3">
          {filteredDeliveries.length === 0 ? (
            <Card>
              <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No hay entregas en esta categoria</p>
              </CardContent>
            </Card>
          ) : (
            filteredDeliveries.map((delivery) => (
              <Link 
                key={delivery.id} 
                href={`/driver/deliveries/${delivery.id}`}
                className="block"
              >
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full mt-1 ${getStatusColor(delivery.status)}`}>
                        {delivery.status === 'delivered' ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Package className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-semibold">{delivery.trackingCode}</p>
                          <Badge variant="secondary" className={getStatusColor(delivery.status)}>
                            {deliveryStatusLabels[delivery.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground mb-1">{delivery.clientName}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{delivery.deliveryAddress}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{delivery.packageDescription}</span>
                          </div>
                          {(delivery.priority === 'urgent' || delivery.priority === 'high') && (
                            <Badge variant="secondary" className={getPriorityColor(delivery.priority)}>
                              {priorityLabels[delivery.priority]}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
