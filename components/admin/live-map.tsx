'use client'

import { useEffect, useState } from 'react'
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

export default function LiveMap() {
  const { drivers } = useDriversStore()
  const { deliveries } = useDeliveriesStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const activeDrivers = drivers.filter(d => d.status !== 'offline' && d.currentLocation)
  const activeDeliveries = deliveries.filter(d => 
    ['assigned', 'picked_up', 'in_transit', 'arriving'].includes(d.status)
  )

  // Center on Mexico City
  const center: [number, number] = [19.4326, -99.1332]

  return (
    <div className="h-[600px] rounded-lg overflow-hidden border">
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

        {/* Route lines from driver to delivery */}
        {activeDeliveries.map(delivery => {
          const driver = activeDrivers.find(d => d.id === delivery.driverId)
          if (!driver?.currentLocation) return null
          
          return (
            <Polyline
              key={`route-${delivery.id}`}
              positions={[
                [driver.currentLocation.lat, driver.currentLocation.lng],
                [delivery.deliveryLat, delivery.deliveryLng]
              ]}
              color="#3b82f6"
              weight={3}
              opacity={0.6}
              dashArray="10, 10"
            />
          )
        })}
      </MapContainer>

      <style jsx global>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  )
}
