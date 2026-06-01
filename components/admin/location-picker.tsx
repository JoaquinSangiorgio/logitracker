'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Search } from 'lucide-react'

// Localidades predefinidas en México
const LOCALIDADES = [
  {
    name: 'CDMX - Centro Histórico',
    lat: 19.4326,
    lng: -99.1332,
    zone: 'CDMX'
  },
  {
    name: 'CDMX - Reforma',
    lat: 19.4267,
    lng: -99.1735,
    zone: 'CDMX'
  },
  {
    name: 'CDMX - Santa Fe',
    lat: 19.3631,
    lng: -99.2929,
    zone: 'CDMX'
  },
  {
    name: 'CDMX - Polanco',
    lat: 19.4328,
    lng: -99.2001,
    zone: 'CDMX'
  },
  {
    name: 'CDMX - Coyoacán',
    lat: 19.3434,
    lng: -99.1611,
    zone: 'CDMX'
  },
  {
    name: 'Ecatepec - Centro',
    lat: 19.6000,
    lng: -99.0500,
    zone: 'Estado de Mexico'
  },
  {
    name: 'Tlalnepantla - Centro',
    lat: 19.3333,
    lng: -99.2167,
    zone: 'Estado de Mexico'
  },
  {
    name: 'Naucalpan - Centro',
    lat: 19.4833,
    lng: -99.2333,
    zone: 'Estado de Mexico'
  },
  {
    name: 'Toluca - Centro',
    lat: 19.2835,
    lng: -99.6547,
    zone: 'Estado de Mexico'
  },
  {
    name: 'Tlaxcala - Centro',
    lat: 19.3143,
    lng: -98.2358,
    zone: 'Tlaxcala'
  },
]

interface LocationPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void
  type: 'pickup' | 'delivery'
}

// Custom marker component
const MapClickMarker = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

const markerIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzMwODNmZiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIj48cGF0aCBkPSJNMTIgMkM4LjEzIDIgNSA1LjEzIDUgOWMwIDUuMjUgNyAxMyA3IDEzczctNy43NSA3LTEzYzAtMy44Ny0zLjEzLTctNy03em0wIDkuNWMtMS4zOCAwLTIuNS0xLjEyLTIuNS0yLjVzMS4xMi0yLjUgMi41LTIuNSAyLjUgMS4xMiAyLjUgMi41LTEuMTIgMi41LTIuNSAyLjV6Ii8+PC9zdmc+',
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
})

export function LocationPicker({ open, onOpenChange, onLocationSelect, type }: LocationPickerProps) {
  const [selectedTab, setSelectedTab] = useState<'mapa' | 'localidades'>('localidades')
  const [searchTerm, setSearchTerm] = useState('')
  const [mapPosition, setMapPosition] = useState<[number, number]>([19.4326, -99.1332])
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredLocalidades = LOCALIDADES.filter(
    loc => loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           loc.zone.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleMapClick = (lat: number, lng: number) => {
    setMapPosition([lat, lng])
    setSelectedLocation({ lat, lng })
  }

  const handleSelectLocalidad = (localidad: typeof LOCALIDADES[0]) => {
    setSelectedLocation({ lat: localidad.lat, lng: localidad.lng })
    setMapPosition([localidad.lat, localidad.lng])
  }

  const handleConfirm = () => {
    if (selectedLocation) {
      const addressLabel = selectedLocation
        ? `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`
        : ''
      
      onLocationSelect({
        address: addressLabel,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
      })
      onOpenChange(false)
      setSearchTerm('')
      setSelectedLocation(null)
    }
  }

  const typeLabel = type === 'pickup' ? 'Recogida' : 'Entrega'

  if (!mounted) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seleccionar Ubicación de {typeLabel}</DialogTitle>
          <DialogDescription>
            Elige una localidad predefinida o haz clic en el mapa para establecer la ubicación
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'mapa' | 'localidades')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="localidades" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Localidades
            </TabsTrigger>
            <TabsTrigger value="mapa" className="flex items-center gap-2">
              Mapa
            </TabsTrigger>
          </TabsList>

          {/* Localidades Tab */}
          <TabsContent value="localidades" className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar localidad o zona..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2 border rounded-lg p-3 bg-muted/30">
              {filteredLocalidades.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No se encontraron localidades
                </p>
              ) : (
                filteredLocalidades.map((localidad, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectLocalidad(localidad)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedLocation?.lat === localidad.lat && selectedLocation?.lng === localidad.lng
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:border-primary/50 hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {localidad.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {localidad.zone} • {localidad.lat.toFixed(4)}, {localidad.lng.toFixed(4)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="mapa" className="space-y-4 mt-4">
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Haz clic en el mapa para establecer la ubicación</p>
              {selectedLocation && (
                <div className="bg-success/10 border border-success/30 p-3 rounded-lg text-success text-sm">
                  ✓ Ubicación seleccionada: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </div>
              )}
            </div>

            <div className="h-[400px] rounded-lg overflow-hidden border border-border">
              <MapContainer
                center={mapPosition}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {selectedLocation && (
                  <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={markerIcon} />
                )}
                <MapClickMarker onMapClick={handleMapClick} />
              </MapContainer>
            </div>
          </TabsContent>
        </Tabs>

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <p className="text-sm font-medium">Ubicación seleccionada:</p>
            <p className="text-sm font-mono">
              Latitud: {selectedLocation.lat.toFixed(6)} | Longitud: {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedLocation}>
            Confirmar Ubicación
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
