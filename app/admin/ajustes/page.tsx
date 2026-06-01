'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Zap,
  FileCheck,
  Truck,
  Plug,
  Clock,
  Route,
  AlertTriangle,
  MapPin,
  Package,
  Smartphone,
  Mail,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

export default function AjustesPage() {
  const [motorSettings, setMotorSettings] = useState({
    dropOffTime: '5',
    routePriority: 'distancia',
    trafficTolerance: [15],
  })

  const [eposSettings, setEposSettings] = useState({
    mandatoryPhoto: true,
    mandatorySignature: true,
    strictGPS: true,
  })

  const [fleetSettings, setFleetSettings] = useState({
    motoPayload: '25',
    vanPayload: '100',
    truckPayload: '300',
    activeZones: ['CDMX', 'Estado de Mexico', 'Tlaxcala'],
  })

  const [integrationSettings, setIntegrationSettings] = useState({
    shopifyConnected: true,
    woocommerceConnected: true,
    erpConnected: false,
    whatsappAlerts: true,
    emailAlerts: true,
  })

  const handleSave = () => {
    console.log({ motorSettings, eposSettings, fleetSettings, integrationSettings })
    // API call would go here
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Ajustes del Sistema
        </h1>
        <p className="text-muted-foreground mt-2">
          Configura los parámetros avanzados del motor de optimización, reglas de entrega, flota y canales de integración
        </p>
      </div>

      {/* Status Alert */}
      <Alert className="border-success/30 bg-success/10">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <AlertDescription className="text-success ml-3">
          Todas las integraciones están sincronizadas. Última actualización: Hace 2 minutos
        </AlertDescription>
      </Alert>

      {/* Main Settings Tabs */}
      <Tabs defaultValue="motor" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="motor" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Motor</span>
          </TabsTrigger>
          <TabsTrigger value="epod" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">ePOD</span>
          </TabsTrigger>
          <TabsTrigger value="flota" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Flota</span>
          </TabsTrigger>
          <TabsTrigger value="integraciones" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">APIs</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: MOTOR DE OPTIMIZACIÓN */}
        <TabsContent value="motor" className="space-y-6">
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Motor de Optimización
              </CardTitle>
              <CardDescription>
                Configura los parámetros de optimización de rutas y algoritmos de distribución
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Drop-off Time */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dropoff-time" className="flex items-center gap-2 text-base font-semibold">
                    <Clock className="h-4 w-4 text-primary" />
                    Tiempo de Descarga por Parada
                  </Label>
                  <span className="text-sm font-mono bg-primary/10 px-3 py-1 rounded-full text-primary">
                    {motorSettings.dropOffTime} min
                  </span>
                </div>
                <Input
                  id="dropoff-time"
                  type="number"
                  min="1"
                  max="30"
                  value={motorSettings.dropOffTime}
                  onChange={(e) =>
                    setMotorSettings({ ...motorSettings, dropOffTime: e.target.value })
                  }
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Tiempo promedio estimado para descargar paquetes por parada (rango: 1-30 minutos)
                </p>
              </div>

              <Separator />

              {/* Route Priority */}
              <div className="space-y-3">
                <Label htmlFor="route-priority" className="flex items-center gap-2 text-base font-semibold">
                  <Route className="h-4 w-4 text-primary" />
                  Estrategia de Prioridad de Rutas
                </Label>
                <Select value={motorSettings.routePriority} onValueChange={(value) =>
                  setMotorSettings({ ...motorSettings, routePriority: value })
                }>
                  <SelectTrigger id="route-priority" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distancia">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Distancia Mínima
                      </div>
                    </SelectItem>
                    <SelectItem value="tiempo">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Tiempo Mínimo
                      </div>
                    </SelectItem>
                    <SelectItem value="costo">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Costo Mínimo
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Define el criterio principal para optimizar rutas: menor distancia, tiempo o combustible
                </p>
              </div>

              <Separator />

              {/* Traffic Tolerance */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    Tolerancia de Tráfico
                  </Label>
                  <span className="text-sm font-mono bg-primary/10 px-3 py-1 rounded-full text-primary">
                    ±{motorSettings.trafficTolerance[0]}%
                  </span>
                </div>
                <Slider
                  value={motorSettings.trafficTolerance}
                  onValueChange={(value) =>
                    setMotorSettings({ ...motorSettings, trafficTolerance: value })
                  }
                  min={5}
                  max={50}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Margen de tolerancia para variaciones de tráfico en estimaciones (5% - 50%)
                </p>
              </div>

              <Separator />

              {/* Algorithm Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Entregas Optimizadas</p>
                  <p className="text-2xl font-bold">12,847</p>
                </div>
                <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Ahorro Combustible</p>
                  <p className="text-2xl font-bold">18.3%</p>
                </div>
                <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Tiempo Promedio</p>
                  <p className="text-2xl font-bold">42 min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: REGLAS DE ENTREGA (ePOD) */}
        <TabsContent value="epod" className="space-y-6">
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                Reglas de Entrega (ePOD)
              </CardTitle>
              <CardDescription>
                Establece los requisitos de prueba de entrega (Electronic Proof of Delivery)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mandatory Photo */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="space-y-1">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    Foto de Entrega Obligatoria
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Requerir evidencia fotográfica en cada entrega exitosa
                  </p>
                </div>
                <Switch
                  checked={eposSettings.mandatoryPhoto}
                  onCheckedChange={(checked) =>
                    setEposSettings({ ...eposSettings, mandatoryPhoto: checked })
                  }
                  className="h-6 w-11"
                />
              </div>

              <Separator />

              {/* Mandatory Signature */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="space-y-1">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary" />
                    Firma Digital Obligatoria
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Requerir firma digital del cliente en dispositivo móvil del chofer
                  </p>
                </div>
                <Switch
                  checked={eposSettings.mandatorySignature}
                  onCheckedChange={(checked) =>
                    setEposSettings({ ...eposSettings, mandatorySignature: checked })
                  }
                  className="h-6 w-11"
                />
              </div>

              <Separator />

              {/* Strict GPS */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="space-y-1">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Validación GPS Estricta
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Validar proximidad GPS dentro de 100m del cliente antes de marcar como entregado
                  </p>
                </div>
                <Switch
                  checked={eposSettings.strictGPS}
                  onCheckedChange={(checked) =>
                    setEposSettings({ ...eposSettings, strictGPS: checked })
                  }
                  className="h-6 w-11"
                />
              </div>

              <Separator />

              {/* ePOD Statistics */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-foreground">Estadísticas de ePOD</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-success/10 border border-success/30 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Entregas Verificadas</p>
                    <p className="text-2xl font-bold text-success">8,923</p>
                  </div>
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Entregas Rechazadas</p>
                    <p className="text-2xl font-bold text-destructive">247</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: CONFIGURACIÓN DE FLOTA */}
        <TabsContent value="flota" className="space-y-6">
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Configuración de Flota
              </CardTitle>
              <CardDescription>
                Define capacidades de carga y zonas activas de operación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Vehicle Payload Limits */}
              <div className="space-y-6">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Carga Máxima por Tipo de Vehículo
                </h3>

                {/* Motos */}
                <div className="space-y-3">
                  <Label htmlFor="moto-payload" className="text-sm font-medium">
                    Motos / Bicicletas
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="moto-payload"
                      type="number"
                      value={fleetSettings.motoPayload}
                      onChange={(e) =>
                        setFleetSettings({ ...fleetSettings, motoPayload: e.target.value })
                      }
                      className="h-11 flex-1"
                    />
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">kg</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Capacidad recomendada: 15-30 kg</p>
                </div>

                {/* Vans */}
                <div className="space-y-3">
                  <Label htmlFor="van-payload" className="text-sm font-medium">
                    Vans / Minivans
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="van-payload"
                      type="number"
                      value={fleetSettings.vanPayload}
                      onChange={(e) =>
                        setFleetSettings({ ...fleetSettings, vanPayload: e.target.value })
                      }
                      className="h-11 flex-1"
                    />
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">kg</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Capacidad recomendada: 80-120 kg</p>
                </div>

                {/* Camiones */}
                <div className="space-y-3">
                  <Label htmlFor="truck-payload" className="text-sm font-medium">
                    Camiones / Trailers
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="truck-payload"
                      type="number"
                      value={fleetSettings.truckPayload}
                      onChange={(e) =>
                        setFleetSettings({ ...fleetSettings, truckPayload: e.target.value })
                      }
                      className="h-11 flex-1"
                    />
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">kg</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Capacidad recomendada: 250-500 kg</p>
                </div>
              </div>

              <Separator />

              {/* Active Zones */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Zonas Activas de Operación
                </h3>
                <div className="space-y-2">
                  {fleetSettings.activeZones.map((zone, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm font-medium">{zone}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full">
                  Agregar Zona
                </Button>
              </div>

              <Separator />

              {/* Fleet Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Total de Vehículos</p>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-xs text-success mt-1">120 Activos</p>
                </div>
                <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Carga Promedio</p>
                  <p className="text-2xl font-bold">73%</p>
                  <p className="text-xs text-muted-foreground mt-1">Utilización</p>
                </div>
                <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Edad Promedio</p>
                  <p className="text-2xl font-bold">3.2</p>
                  <p className="text-xs text-muted-foreground mt-1">Años</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: INTEGRACIONES Y CANALES */}
        <TabsContent value="integraciones" className="space-y-6">
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5 text-primary" />
                Integraciones y Canales
              </CardTitle>
              <CardDescription>
                Gestiona las conexiones con plataformas externas y canales de notificación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Connected APIs */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-foreground">APIs Conectadas</h3>

                {/* Shopify */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-success"></div>
                      <Label className="text-base font-semibold">Shopify</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sincronización automática de órdenes y tracking
                    </p>
                  </div>
                  <Switch checked={integrationSettings.shopifyConnected} disabled className="h-6 w-11" />
                </div>

                {/* WooCommerce */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-success"></div>
                      <Label className="text-base font-semibold">WooCommerce</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Integración con WordPress y tiendas online
                    </p>
                  </div>
                  <Switch checked={integrationSettings.woocommerceConnected} disabled className="h-6 w-11" />
                </div>

                {/* ERP */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-muted-foreground"></div>
                      <Label className="text-base font-semibold">Sistema ERP</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Conectar con SAP, Oracle o sistemas internos
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Notification Channels */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-foreground">Canales de Notificación Automática</h3>

                {/* WhatsApp */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-primary" />
                      Alertas por WhatsApp
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones de estado de entrega a clientes y choferes
                    </p>
                  </div>
                  <Switch
                    checked={integrationSettings.whatsappAlerts}
                    onCheckedChange={(checked) =>
                      setIntegrationSettings({ ...integrationSettings, whatsappAlerts: checked })
                    }
                    className="h-6 w-11"
                  />
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Alertas por Email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Reportes automáticos y notificaciones críticas por correo
                    </p>
                  </div>
                  <Switch
                    checked={integrationSettings.emailAlerts}
                    onCheckedChange={(checked) =>
                      setIntegrationSettings({ ...integrationSettings, emailAlerts: checked })
                    }
                    className="h-6 w-11"
                  />
                </div>
              </div>

              <Separator />

              {/* Integration Stats */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-foreground">Estadísticas de Integración</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Órdenes Sincronizadas</p>
                    <p className="text-2xl font-bold">45,230</p>
                    <p className="text-xs text-success mt-1">Esta semana: +3,450</p>
                  </div>
                  <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Tasa de Éxito API</p>
                    <p className="text-2xl font-bold">99.8%</p>
                    <p className="text-xs text-muted-foreground mt-1">Últimos 30 días</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">
          Descartar Cambios
        </Button>
        <Button onClick={handleSave} size="lg" className="gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Guardar Configuración
        </Button>
      </div>
    </div>
  )
}
