'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Delivery, Route } from '@/lib/types'

// Fix para los iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Icono para el punto de inicio
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Icono para paradas completadas
const completedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33]
})

// Icono para entregas urgentes pendientes
const urgentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Icono para entregas de alta prioridad pendientes
const highPriorityIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Icono para la siguiente parada (destacado)
const nextStopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49]
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

// Crear un icono de camión personalizado usando SVG
const createTruckIcon = () => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="11" fill="white" stroke="#2563eb" stroke-width="2"/>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
      <path d="M15 18H9"/>
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
      <circle cx="17" cy="18" r="2"/>
      <circle cx="7" cy="18" r="2"/>
    </svg>
  `
  return L.divIcon({
    html: svgIcon,
    className: 'truck-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  })
}

const truckIcon = createTruckIcon()

interface LiveRouteMapViewProps {
  route: Route
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

// Función para interpolar entre dos puntos
function interpolatePosition(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  progress: number
): [number, number] {
  const lat = lat1 + (lat2 - lat1) * progress
  const lng = lng1 + (lng2 - lng1) * progress
  return [lat, lng]
}

export default function LiveRouteMapView({ route, deliveries }: LiveRouteMapViewProps) {
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([])

  // Simular la posición del camión
  const [truckPosition, setTruckPosition] = useState<[number, number]>(() => {
    // Encontrar la última parada completada
    const lastCompletedIndex = route.stops.findIndex(s => s.status !== 'completed') - 1

    if (lastCompletedIndex < 0) {
      // No hay paradas completadas, el camión está en el punto de inicio
      return [route.startPoint.lat, route.startPoint.lng]
    }

    if (lastCompletedIndex >= route.stops.length - 1) {
      // Todas las paradas completadas
      const lastStop = route.stops[route.stops.length - 1]
      return [lastStop.lat, lastStop.lng]
    }

    // Interpolar entre la última parada completada y la siguiente
    const lastCompleted = route.stops[lastCompletedIndex]
    const nextStop = route.stops[lastCompletedIndex + 1]

    // Simular que está a 30% del camino
    return interpolatePosition(
      lastCompleted.lat,
      lastCompleted.lng,
      nextStop.lat,
      nextStop.lng,
      0.3
    )
  })

  // Obtener la ruta real por calles usando OSRM
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const positions: [number, number][] = [
          [route.startPoint.lat, route.startPoint.lng],
          ...route.stops.map(stop => [stop.lat, stop.lng] as [number, number])
        ]

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
      }
    }

    fetchRoute()
  }, [route.stops.length])

  // Simular movimiento del camión
  useEffect(() => {
    const interval = setInterval(() => {
      const nextStopIndex = route.stops.findIndex(s => s.status === 'pending')

      if (nextStopIndex < 0) return // No hay paradas pendientes

      const prevStop = nextStopIndex > 0
        ? route.stops[nextStopIndex - 1]
        : route.startPoint
      const nextStop = route.stops[nextStopIndex]

      // Calcular un progreso aleatorio (simular movimiento)
      const progress = Math.random() * 0.4 + 0.3 // Entre 30% y 70%

      setTruckPosition(
        interpolatePosition(
          prevStop.lat,
          prevStop.lng,
          nextStop.lat,
          nextStop.lng,
          progress
        )
      )
    }, 5000) // Actualizar cada 5 segundos

    return () => clearInterval(interval)
  }, [route])

  // Crear array de posiciones para la polilínea de ruta completa
  const routePositions: [number, number][] = [
    [route.startPoint.lat, route.startPoint.lng],
    ...route.stops.map(stop => [stop.lat, stop.lng] as [number, number])
  ]

  // Crear polilínea de ruta completada basada en las coordenadas reales
  const lastCompletedIndex = route.stops.findIndex(s => s.status !== 'completed')
  const completedStopsCount = lastCompletedIndex < 0 ? route.stops.length : lastCompletedIndex

  // Calcular qué porcentaje de la ruta se ha completado
  const totalStops = route.stops.length
  const completionRatio = completedStopsCount / totalStops

  // Si tenemos coordenadas de ruta real, tomar solo el porcentaje completado
  const completedRouteCoordinates = routeCoordinates.length > 0
    ? routeCoordinates.slice(0, Math.floor(routeCoordinates.length * completionRatio))
    : []

  const completedPositions: [number, number][] = completedRouteCoordinates.length > 0
    ? [...completedRouteCoordinates, truckPosition]
    : [
        [route.startPoint.lat, route.startPoint.lng],
        ...route.stops
          .slice(0, completedStopsCount)
          .map(stop => [stop.lat, stop.lng] as [number, number]),
        truckPosition
      ]

  // Función para obtener el icono según la parada
  const getMarkerIcon = (stop: typeof route.stops[0], index: number) => {
    if (stop.status === 'completed') {
      return completedIcon
    }

    // Verificar si es la siguiente parada
    const nextStopIndex = route.stops.findIndex(s => s.status === 'pending')
    if (index === nextStopIndex) {
      return nextStopIcon
    }

    const delivery = deliveries.find(d => d.id === stop.deliveryId)
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

  // Todas las posiciones para ajustar el mapa
  const allPositions: [number, number][] = [...routePositions, truckPosition]

  return (
    <MapContainer
      center={truckPosition}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds positions={allPositions} />

      {/* Polilínea de la ruta completa siguiendo calles reales (gris punteada) */}
      {routeCoordinates.length > 0 && (
        <Polyline
          positions={routeCoordinates}
          pathOptions={{
            color: '#9ca3af',
            weight: 3,
            opacity: 0.5,
            dashArray: '10, 10'
          }}
        />
      )}

      {/* Polilínea de la ruta completada siguiendo calles reales (azul sólida) */}
      {completedPositions.length > 0 && (
        <Polyline
          positions={completedPositions}
          pathOptions={{
            color: '#2563eb',
            weight: 4,
            opacity: 0.9
          }}
        />
      )}

      {/* Marcador del punto de inicio */}
      <Marker position={[route.startPoint.lat, route.startPoint.lng]} icon={startIcon}>
        <Popup>
          <div className="text-sm">
            <strong>Punto de Inicio</strong>
            <br />
            {route.startPoint.name}
            <br />
            <span className="text-xs text-gray-600">{route.startPoint.address}</span>
          </div>
        </Popup>
      </Marker>

      {/* Marcadores de las paradas */}
      {route.stops.map((stop, index) => {
        const delivery = deliveries.find(d => d.id === stop.deliveryId)
        const nextStopIndex = route.stops.findIndex(s => s.status === 'pending')
        const isNext = index === nextStopIndex

        return (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={getMarkerIcon(stop, index)}
          >
            <Popup>
              <div className="text-sm">
                <strong>
                  Parada #{index + 1}
                  {isNext && ' - SIGUIENTE'}
                </strong>
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
                <br />
                {stop.status === 'completed' && stop.actualArrival && (
                  <span className="text-xs text-green-600 font-semibold">
                    ✓ Entregado
                  </span>
                )}
                {isNext && (
                  <span className="text-xs text-purple-600 font-semibold block mt-1">
                    → En camino
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}

      {/* Marcador del camión (ubicación en tiempo real simulada) */}
      <Marker position={truckPosition} icon={truckIcon}>
        <Popup>
          <div className="text-sm">
            <strong className="text-blue-600">🚚 {route.driverName}</strong>
            <br />
            <span className="text-xs">{route.name}</span>
            <br />
            <span className="text-xs text-gray-600">
              {route.stops.filter(s => s.status === 'completed').length} de{' '}
              {route.stops.length} entregas completadas
            </span>
            <br />
            <span className="text-xs text-green-600 font-semibold">
              ● En ruta
            </span>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  )
}
