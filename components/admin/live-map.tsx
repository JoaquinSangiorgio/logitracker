'use client'

import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useDriversStore, useDeliveriesStore } from '@/lib/store'

// Custom icons
const createIcon = (color: string, type: 'driver' | 'destination' | 'pickup') => {
  const iconSvg = type === 'driver' 
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`

  return L.divIcon({
    html: iconSvg,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
}

const driverIcon = createIcon('#22c55e', 'driver')
const destinationIcon = createIcon('#3b82f6', 'destination')
const pickupIcon = createIcon('#f97316', 'pickup')

// Calcular distancia entre dos puntos (Haversine)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Algoritmo Nearest Neighbor para optimización de rutas
const optimizeRoute = (startLat: number, startLng: number, deliveries: any[]): any[] => {
  if (deliveries.length === 0) return []
  
  const remaining = [...deliveries]
  const route = []
  let currentLat = startLat
  let currentLng = startLng

  while (remaining.length > 0) {
    let nearestIdx = 0
    let nearestDistance = Infinity

    remaining.forEach((delivery, idx) => {
      const distance = calculateDistance(currentLat, currentLng, delivery.deliveryLat, delivery.deliveryLng)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIdx = idx
      }
    })

    const nearest = remaining[nearestIdx]
    route.push(nearest)
    currentLat = nearest.deliveryLat
    currentLng = nearest.deliveryLng
    remaining.splice(nearestIdx, 1)
  }

  return route
}

export default function LiveMap() {
  const { drivers } = useDriversStore()
  const { deliveries } = useDeliveriesStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 1. FILTRADOS MEMOIZADOS (Evitan recrear referencias inútiles en memoria)
  const activeDrivers = useMemo(() => {
    return drivers.filter(d => d.status !== 'offline' && d.currentLocation)
  }, [drivers])

  const activeDeliveries = useMemo(() => {
    return deliveries.filter(d =>
      ['assigned', 'picked_up', 'in_transit', 'arriving'].includes(d.status)
    )
  }, [deliveries])

  // 2. CÁLCULO DE RUTAS OPTIMIZADAS DIRECTAMENTE CON USEMEMO
  // Eliminamos el useEffect problemático que llamaba a un setState interno
  const optimizedRoutes = useMemo(() => {
    const routes: Record<string, any[]> = {}
    
    activeDrivers.forEach(driver => {
      const driverDeliveries = activeDeliveries.filter(d => d.driverId === driver.id)
      if (driverDeliveries.length > 0 && driver.currentLocation) {
        routes[driver.id] = optimizeRoute(
          driver.currentLocation.lat,
          driver.currentLocation.lng,
          driverDeliveries
        )
      }
    })
    
    return routes
  }, [activeDrivers, activeDeliveries])

  if (!mounted) return null

  // Center on Mexico City
  const center: [number, number] = [19.4326, -99.1332]

  return (
    <div className="h-[600px] rounded-lg overflow-hidden border relative">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Optimal route polylines for each driver */}
        {activeDrivers.map(driver => {
          if (!driver.currentLocation || !optimizedRoutes[driver.id]?.length) return null
          
          const route = optimizedRoutes[driver.id]
          const routeCoordinates: [number, number][] = [
            [driver.currentLocation.lat, driver.currentLocation.lng]
          ]
          
          route.forEach(delivery => {
            routeCoordinates.push([delivery.deliveryLat, delivery.deliveryLng])
          })

          return (
            <Polyline
              key={`optimal-route-${driver.id}`}
              positions={routeCoordinates}
              color="#8b5cf6"
              weight={3}
              opacity={0.8}
              dashArray="5, 5"
            />
          )
        })}

        {/* Driver markers */}
        {activeDrivers.map(driver => (
          driver.currentLocation && (
            <Marker
              key={driver.id}
              position={[driver.currentLocation.lat, driver.currentLocation.lng]}
              icon={driverIcon}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-semibold">{driver.name}</p>
                  <p className="text-sm text-gray-600">{driver.vehiclePlate}</p>
                  <p className="text-xs text-gray-500">{driver.vehicleType}</p>
                  <p className="text-xs mt-1">
                    Estado: <span className={driver.status === 'busy' ? 'text-blue-600' : 'text-green-600'}>
                      {driver.status === 'busy' ? 'Ocupado' : 'Disponible'}
                    </span>
                  </p>
                  {optimizedRoutes[driver.id]?.length > 0 && (
                    <p className="text-xs mt-2 bg-purple-100 text-purple-700 p-1 rounded">
                      Ruta óptima: {optimizedRoutes[driver.id].length} paradas
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        ))}

        {/* Delivery destination markers */}
        {activeDeliveries.map(delivery => (
          <Marker
            key={`dest-${delivery.id}`}
            position={[delivery.deliveryLat, delivery.deliveryLng]}
            icon={destinationIcon}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold">{delivery.trackingCode}</p>
                <p className="text-sm">{delivery.clientName}</p>
                <p className="text-xs text-gray-600 mt-1">{delivery.deliveryAddress}</p>
                {delivery.driverName && (
                  <p className="text-xs mt-1">Chofer: {delivery.driverName}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Pickup markers */}
        {activeDeliveries.filter(d => d.status === 'assigned').map(delivery => (
          <Marker
            key={`pickup-${delivery.id}`}
            position={[delivery.pickupLat, delivery.pickupLng]}
            icon={pickupIcon}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold">Punto de Recogida</p>
                <p className="text-sm">{delivery.trackingCode}</p>
                <p className="text-xs text-gray-600 mt-1">{delivery.pickupAddress}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg z-10 text-sm space-y-2">
        <div className="font-semibold mb-3">Leyenda</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Chofer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Destino</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>Recogida</span>
        </div>
        <hr className="my-2" />
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 bg-purple-500"></div>
          <span>Ruta Óptima</span>
        </div>
      </div>

      <style jsx global>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  )
}