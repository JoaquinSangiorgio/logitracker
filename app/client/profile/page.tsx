'use client'

import { useAuthStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, MapPin, Package, Calendar, AlertCircle } from 'lucide-react'
import type { Client } from '@/lib/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function ClientProfilePage() {
  const { user, logout } = useAuthStore()

  const client = user as Client | null

  if (!client) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">Información de tu cuenta de cliente</p>
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
                <h2 className="text-2xl font-bold">{client.name}</h2>
                <p className="text-sm text-muted-foreground">Cliente Premium</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Correo Electrónico</p>
                <p className="font-medium">{client.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Teléfono</p>
                <p className="font-medium">{client.phone || 'No registrado'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Se unió el</p>
                <p className="font-medium">{format(new Date(client.createdAt), 'PPP', { locale: es })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">ID de Cliente</p>
                <p className="font-medium text-sm">{client.id}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Dirección de Envío
          </CardTitle>
          <CardDescription>Información de tu domicilio registrado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="p-4 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Dirección</p>
              <p className="font-medium">{(client as Client).address || 'No registrada'}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Ciudad</p>
                <p className="font-medium">{(client as Client).city || 'No registrada'}</p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Código Postal</p>
                <p className="font-medium">{(client as Client).postalCode || 'No registrado'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Estadísticas de Entregas
          </CardTitle>
          <CardDescription>Tu actividad con nosotros</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-1">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-2">Total de Órdenes</p>
              <p className="text-3xl font-bold text-primary">{(client as Client).totalOrders || 0}</p>
              <p className="text-xs text-muted-foreground mt-2">Entregas realizadas desde tu registro</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Membership Info */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Membresía</CardTitle>
          <CardDescription>Detalles de tu suscripción</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div>
                <p className="font-medium">Cuenta Activa</p>
                <p className="text-xs text-muted-foreground">Tu cuenta está en buen estado</p>
              </div>
              <div className="text-2xl">✓</div>
            </div>
            <div className="p-3 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Tipo de Cuenta</p>
              <p className="font-medium">Cliente Registrado</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
