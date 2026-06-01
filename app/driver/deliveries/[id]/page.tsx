'use client'

import { useState, useRef, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useDeliveriesStore, useAuthStore, useOfflineStore } from '@/lib/store'
import { deliveryStatusLabels, priorityLabels } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  ArrowLeft, 
  MapPin, 
  Package,
  Phone,
  Navigation,
  Clock,
  CheckCircle2,
  XCircle,
  Camera,
  Pen,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import SignaturePad from 'signature_pad'
import type { Delivery, DeliveryStatus, Driver } from '@/lib/types'

interface DeliveryDetailPageProps {
  params: Promise<{ id: string }>
}

export default function DeliveryDetailPage({ params }: DeliveryDetailPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { deliveries, updateStatus, addProof } = useDeliveriesStore()
  const { user } = useAuthStore()
  const { isOnline, addPendingAction } = useOfflineStore()
  const driver = user as Driver | null

  const delivery = deliveries.find(d => d.id === resolvedParams.id)

  const [isEPODDialogOpen, setIsEPODDialogOpen] = useState(false)
  const [isFailDialogOpen, setIsFailDialogOpen] = useState(false)
  const [receiverName, setReceiverName] = useState('')
  const [notes, setNotes] = useState('')
  const [failReason, setFailReason] = useState('')
  const [signatureData, setSignatureData] = useState<string | null>(null)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const signaturePadRef = useRef<SignaturePad | null>(null)

  useEffect(() => {
    if (isEPODDialogOpen && canvasRef.current && !signaturePadRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
      })
      
      // Resize canvas
      const canvas = canvasRef.current
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      canvas.width = canvas.offsetWidth * ratio
      canvas.height = canvas.offsetHeight * ratio
      canvas.getContext('2d')?.scale(ratio, ratio)
    }
  }, [isEPODDialogOpen])

  if (!delivery) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Entrega no encontrada</p>
        <Button variant="link" asChild className="mt-2">
          <Link href="/driver/deliveries">Volver a mis entregas</Link>
        </Button>
      </div>
    )
  }

  const handleStatusChange = (newStatus: DeliveryStatus) => {
    if (isOnline) {
      updateStatus(delivery.id, newStatus)
    } else {
      addPendingAction({
        type: 'delivery_update',
        data: { deliveryId: delivery.id, status: newStatus }
      })
      updateStatus(delivery.id, newStatus)
    }
  }

  const handleCompleteDelivery = () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      alert('Por favor, capture la firma del receptor')
      return
    }
    if (!receiverName) {
      alert('Por favor, ingrese el nombre del receptor')
      return
    }

    const signature = signaturePadRef.current.toDataURL()
    
    const proof = {
      signature,
      receiverName,
      notes,
      timestamp: new Date().toISOString()
    }

    if (isOnline) {
      addProof(delivery.id, proof)
    } else {
      addPendingAction({
        type: 'proof_upload',
        data: { deliveryId: delivery.id, proof }
      })
      addProof(delivery.id, proof)
    }

    setIsEPODDialogOpen(false)
    router.push('/driver/deliveries')
  }

  const handleFailDelivery = () => {
    if (!failReason) {
      alert('Por favor, describa el motivo de la falla')
      return
    }

    updateStatus(delivery.id, 'failed')
    setIsFailDialogOpen(false)
    router.push('/driver/deliveries')
  }

  const clearSignature = () => {
    signaturePadRef.current?.clear()
    setSignatureData(null)
  }

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

  const canAdvanceStatus = ['assigned', 'picked_up', 'in_transit', 'arriving'].includes(delivery.status)
  const canComplete = delivery.status === 'arriving' || delivery.status === 'in_transit'

  const getNextStatus = (): DeliveryStatus | null => {
    switch (delivery.status) {
      case 'assigned': return 'picked_up'
      case 'picked_up': return 'in_transit'
      case 'in_transit': return 'arriving'
      default: return null
    }
  }

  const getNextStatusLabel = () => {
    switch (delivery.status) {
      case 'assigned': return 'Marcar como Recogido'
      case 'picked_up': return 'Iniciar Transito'
      case 'in_transit': return 'Llegando al destino'
      default: return ''
    }
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/driver/deliveries">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{delivery.trackingCode}</h1>
          <Badge variant="secondary" className={getStatusColor(delivery.status)}>
            {deliveryStatusLabels[delivery.status]}
          </Badge>
        </div>
      </div>

      {/* Client Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-semibold">{delivery.clientName}</p>
          <p className="text-sm text-muted-foreground">{delivery.packageDescription}</p>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Direccion de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{delivery.deliveryAddress}</p>
          <Button variant="outline" className="w-full mt-3" asChild>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${delivery.deliveryLat},${delivery.deliveryLng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Abrir en Maps
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Pickup Address */}
      {delivery.status === 'assigned' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-500" />
              Punto de Recogida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{delivery.pickupAddress}</p>
            <Button variant="outline" className="w-full mt-3" asChild>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${delivery.pickupLat},${delivery.pickupLng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Ir a Recoger
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Package Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Informacion del Paquete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prioridad</span>
            <Badge variant="secondary" className={
              delivery.priority === 'urgent' ? 'bg-red-100 text-red-700' :
              delivery.priority === 'high' ? 'bg-orange-100 text-orange-700' :
              'bg-muted text-muted-foreground'
            }>
              {priorityLabels[delivery.priority]}
            </Badge>
          </div>
          {delivery.packageWeight && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Peso</span>
              <span>{delivery.packageWeight} kg</span>
            </div>
          )}
          {delivery.packageSize && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tamano</span>
              <span className="capitalize">{delivery.packageSize}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proof of Delivery (if completed) */}
      {delivery.proof && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-green-700 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Prueba de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Recibido por:</span>
              <p className="font-medium">{delivery.proof.receiverName}</p>
            </div>
            {delivery.proof.notes && (
              <div>
                <span className="text-sm text-muted-foreground">Notas:</span>
                <p>{delivery.proof.notes}</p>
              </div>
            )}
            {delivery.proof.signature && (
              <div>
                <span className="text-sm text-muted-foreground">Firma:</span>
                <img 
                  src={delivery.proof.signature} 
                  alt="Firma" 
                  className="mt-2 border rounded-lg bg-white max-h-32"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {canAdvanceStatus && (
        <div className="space-y-3 pt-4">
          {getNextStatus() && (
            <Button 
              className="w-full h-12" 
              onClick={() => handleStatusChange(getNextStatus()!)}
            >
              {getNextStatusLabel()}
            </Button>
          )}
          
          {canComplete && (
            <Button 
              className="w-full h-12 bg-green-600 hover:bg-green-700" 
              onClick={() => setIsEPODDialogOpen(true)}
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Completar Entrega
            </Button>
          )}

          <Button 
            variant="outline" 
            className="w-full h-12 text-destructive border-destructive hover:bg-destructive/10" 
            onClick={() => setIsFailDialogOpen(true)}
          >
            <XCircle className="h-5 w-5 mr-2" />
            Reportar Problema
          </Button>
        </div>
      )}

      {/* ePOD Dialog */}
      <Dialog open={isEPODDialogOpen} onOpenChange={setIsEPODDialogOpen}>
        <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prueba de Entrega</DialogTitle>
            <DialogDescription>
              Capture la firma y datos del receptor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre del Receptor *</Label>
              <Input
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Nombre completo"
              />
            </div>

            <div className="space-y-2">
              <Label>Firma del Receptor *</Label>
              <div className="border rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  className="w-full h-40 touch-none"
                  style={{ touchAction: 'none' }}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearSignature}
                className="w-full"
              >
                Limpiar Firma
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCompleteDelivery} className="w-full">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirmar Entrega
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fail Dialog */}
      <Dialog open={isFailDialogOpen} onOpenChange={setIsFailDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Reportar Problema
            </DialogTitle>
            <DialogDescription>
              Describe el motivo por el cual no se pudo completar la entrega
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motivo del problema *</Label>
              <Textarea
                value={failReason}
                onChange={(e) => setFailReason(e.target.value)}
                placeholder="Describe que sucedio..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={handleFailDelivery} className="w-full">
              Reportar como Fallido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
