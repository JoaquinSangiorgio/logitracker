'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDeliveriesStore, useDriversStore, useClientsStore, useIncidentsStore } from '@/lib/store'
import { deliveryStatusLabels, priorityLabels } from '@/lib/mock-data'
import { 
  Package, 
  Truck, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminDashboard() {
  const { deliveries } = useDeliveriesStore()
  const { drivers } = useDriversStore()
  const { clients } = useClientsStore()
  const { incidents } = useIncidentsStore()

  const stats = useMemo(() => {
    const pending = deliveries.filter(d => d.status === 'pending').length
    const inTransit = deliveries.filter(d => ['assigned', 'picked_up', 'in_transit', 'arriving'].includes(d.status)).length
    const completed = deliveries.filter(d => d.status === 'delivered').length
    const failed = deliveries.filter(d => d.status === 'failed').length
    const activeDrivers = drivers.filter(d => d.status !== 'offline').length
    const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'in_progress').length

    return {
      total: deliveries.length,
      pending,
      inTransit,
      completed,
      failed,
      totalDrivers: drivers.length,
      activeDrivers,
      totalClients: clients.length,
      openIncidents,
      deliveryRate: deliveries.length > 0 ? Math.round((completed / deliveries.length) * 100) : 0
    }
  }, [deliveries, drivers, clients, incidents])

  const statusData = useMemo(() => [
    { name: 'Pendientes', value: stats.pending, color: 'var(--chart-4)' },
    { name: 'En Transito', value: stats.inTransit, color: 'var(--chart-1)' },
    { name: 'Entregados', value: stats.completed, color: 'var(--chart-2)' },
    { name: 'Fallidos', value: stats.failed, color: 'var(--destructive)' },
  ], [stats])

  const weeklyData = useMemo(() => [
    { day: 'Lun', entregas: 45, incidencias: 2 },
    { day: 'Mar', entregas: 52, incidencias: 1 },
    { day: 'Mie', entregas: 48, incidencias: 3 },
    { day: 'Jue', entregas: 61, incidencias: 2 },
    { day: 'Vie', entregas: 55, incidencias: 4 },
    { day: 'Sab', entregas: 32, incidencias: 1 },
    { day: 'Dom', entregas: 18, incidencias: 0 },
  ], [])

  const recentDeliveries = useMemo(() => {
    return [...deliveries]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  }, [deliveries])

  const recentIncidents = useMemo(() => {
    return [...incidents]
      .filter(i => i.status !== 'closed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4)
  }, [incidents])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tablero</h1>
        <p className="text-muted-foreground">Vista general de las operaciones de LogiTrack</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Entregas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+12%</span> vs. mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En Transito</CardTitle>
            <Truck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.inTransit}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeDrivers} choferes activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasa de Entrega</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.deliveryRate}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+2.5%</span> vs. semana anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Incidencias Abiertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.openIncidents}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowDownRight className="h-3 w-3 text-green-500" />
              <span className="text-green-500">-3</span> vs. ayer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Semanal</CardTitle>
            <CardDescription>Entregas e incidencias de los ultimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--popover)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="entregas" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Entregas" />
                  <Bar dataKey="incidencias" fill="var(--chart-3)" radius={[4, 4, 0, 0]} name="Incidencias" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Entregas</CardTitle>
            <CardDescription>Distribucion actual de entregas por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--popover)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Deliveries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Entregas Recientes</CardTitle>
              <CardDescription>Ultimas actualizaciones de entregas</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/deliveries">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDeliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className={`p-2 rounded-full ${
                    delivery.status === 'delivered' ? 'bg-green-100 text-green-600' :
                    delivery.status === 'failed' ? 'bg-red-100 text-red-600' :
                    delivery.status === 'in_transit' ? 'bg-blue-100 text-blue-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {delivery.status === 'delivered' ? <CheckCircle2 className="h-4 w-4" /> :
                     delivery.status === 'failed' ? <XCircle className="h-4 w-4" /> :
                     <Clock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{delivery.trackingCode}</p>
                    <p className="text-xs text-muted-foreground truncate">{delivery.clientName}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      delivery.status === 'delivered' ? 'default' :
                      delivery.status === 'failed' ? 'destructive' : 
                      'secondary'
                    } className="text-xs">
                      {deliveryStatusLabels[delivery.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Incidencias Activas</CardTitle>
              <CardDescription>Problemas que requieren atencion</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/incidents">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentIncidents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>No hay incidencias activas</p>
                </div>
              ) : (
                recentIncidents.map((incident) => (
                  <div key={incident.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                    <div className={`p-2 rounded-full ${
                      incident.priority === 'critical' ? 'bg-red-100 text-red-600' :
                      incident.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{incident.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reportado por {incident.reporterName}
                      </p>
                    </div>
                    <Badge variant={
                      incident.priority === 'critical' ? 'destructive' :
                      incident.priority === 'high' ? 'default' : 
                      'secondary'
                    } className="text-xs shrink-0">
                      {priorityLabels[incident.priority]}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Choferes Activos</p>
                <p className="text-2xl font-bold">{stats.activeDrivers}/{stats.totalDrivers}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes Registrados</p>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
              </div>
              <div className="p-3 rounded-full bg-accent/20">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entregas Hoy</p>
                <p className="text-2xl font-bold">{stats.completed + stats.inTransit}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
