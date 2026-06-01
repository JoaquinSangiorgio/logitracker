'use client'

import { useAuthStore, useDriversStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, Truck, Star, MapPin, Calendar } from 'lucide-react'
import type { Driver } from '@/lib/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function DriverProfilePage() {
  const { user, logout } = useAuthStore()
  const { drivers } = useDriversStore()

  const driver = drivers.find(d => d.id === user?.id) as Driver | undefined

  if (!driver) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground">Información de tu cuenta</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Información no disponible</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusConfig = {
    available: { label: 'Disponible', color: 'bg-green-100 text-green-800' },
    busy: { label: 'Ocupado', color: 'bg-amber-100 text-amber-800' },
    offline: { label: 'Offline', color: 'bg-gray-100 text-gray-800' }
  }

  const currentStatus = statusConfig[driver.status]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">Información de tu cuenta de chofer</p>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{driver.name}</h2>
                <Badge className={currentStatus.color}>{currentStatus.label}</Badge>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Correo Electrónico</p>
                <p className="font-medium">{driver.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Teléfono</p>
                <p className="font-medium">{driver.phone || 'No registrado'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Se unió el</p>
                <p className="font-medium">{format(new Date(driver.createdAt), 'PPP', { locale: es })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">ID de Chofer</p>
                <p className="font-medium text-sm">{driver.id}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Información del Vehículo
          </CardTitle>
          <CardDescription>Detalles del vehículo asignado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Placa del Vehículo</p>
              <p className="text-lg font-bold">{driver.vehiclePlate}</p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Tipo de Vehículo</p>
              <p className="text-lg font-bold capitalize">{driver.vehicleType}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Desempeño
          </CardTitle>
          <CardDescription>Estadísticas de tu trabajo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-2">Entregas Completadas</p>
              <p className="text-3xl font-bold text-primary">{driver.totalDeliveries}</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <p className="text-xs text-muted-foreground mb-2">Calificación Promedio</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-amber-600">{driver.rating.toFixed(1)}</p>
                <span className="text-lg">⭐</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Location */}
      {driver.currentLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación Actual
            </CardTitle>
            <CardDescription>Última posición registrada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="p-4 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Coordenadas</p>
                <p className="font-mono text-sm">
                  {driver.currentLocation.lat.toFixed(6)}, {driver.currentLocation.lng.toFixed(6)}
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Última Actualización</p>
                <p className="text-sm">{format(new Date(driver.currentLocation.updatedAt), 'PPPppp', { locale: es })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 md:flex-row">
        <Button variant="outline" className="flex-1">
          Editar Perfil
        </Button>
        <Button variant="outline" className="flex-1">
          Cambiar Contraseña
        </Button>
        <Button 
          variant="destructive" 
          className="flex-1"
          onClick={logout}
        >
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
