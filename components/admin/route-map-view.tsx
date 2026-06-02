'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Delivery, RouteStop } from '@/lib/types'

// Fix para los iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Icono personalizado para el punto de inicio
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Icono personalizado para entregas urgentes
const urgentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Icono personalizado para entregas de alta prioridad
const highPriorityIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Icono para entregas regulares
const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

interface RouteMapViewProps {
  startPoint: {
    name: string
    address: string
    lat: number
    lng: number
  }
  stops: RouteStop[]
  deliveries: Delivery[]
}

// Componente para ajustar el zoom automáticamente
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [map, positions])

  return null
}

export default function RouteMapView({ startPoint, stops, deliveries }: RouteMapViewProps) {
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([])

  // Crear array de posiciones para la polilínea
  const positions: [number, number][] = [
    [startPoint.lat, startPoint.lng],
    ...stops.map(stop => [stop.lat, stop.lng] as [number, number])
  ]

  // Obtener la ruta real por calles usando OSRM
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const coords = positions.map(pos => `${pos[1]},${pos[0]}`).join(';')
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`

        const response = await fetch(url)
        const data = await response.json()

        if (data.code === 'Ok' && data.routes && data.routes[0]) {
          const coordinates = data.routes[0].geometry.coordinates.map(
            (coord: number[]) => [coord[1], coord[0]] as [number, number]
          )
          setRouteCoordinates(coordinates)
        }
      } catch (error) {
        console.error('Error fetching route:', error)
        // Si falla, usar las posiciones directas como fallback
        setRouteCoordinates(positions)
      }
    }

    fetchRoute()
  }, [stops.length])

  // Función para obtener el icono según la prioridad
  const getMarkerIcon = (deliveryId: string) => {
    const delivery = deliveries.find(d => d.id === deliveryId)
    if (!delivery) return defaultIcon

    switch (delivery.priority) {
      case 'urgent':
        return urgentIcon
      case 'high':
        return highPriorityIcon
      default:
        return defaultIcon
    }
  }

  return (
    <MapContainer
      center={[startPoint.lat, startPoint.lng]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds positions={positions} />

      {/* Polilínea que conecta todos los puntos siguiendo las calles reales */}
      {routeCoordinates.length > 0 && (
        <Polyline
          positions={routeCoordinates}
          pathOptions={{
            color: '#3b82f6',
            weight: 4,
            opacity: 0.8
          }}
        />
      )}

      {/* Marcador del punto de inicio */}
      <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon}>
        <Popup>
          <div className="text-sm">
            <strong>Punto de Inicio</strong>
            <br />
            {startPoint.name}
            <br />
            <span className="text-xs text-gray-600">{startPoint.address}</span>
          </div>
        </Popup>
      </Marker>

      {/* Marcadores de las paradas */}
      {stops.map((stop, index) => {
        const delivery = deliveries.find(d => d.id === stop.deliveryId)
        return (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={getMarkerIcon(stop.deliveryId)}
          >
            <Popup>
              <div className="text-sm">
                <strong>Parada #{index + 1}</strong>
                <br />
                {delivery?.clientName}
                <br />
                <span className="text-xs text-gray-600">{stop.address}</span>
                <br />
                <span className="text-xs font-semibold text-blue-600">
                  {delivery?.trackingCode}
                </span>
                <br />
                <span className="text-xs">
                  Prioridad: <strong>{delivery?.priority}</strong>
                </span>
                <br />
                <span className="text-xs text-gray-500">
                  {stop.distance} km • ~{stop.duration} min
                </span>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
