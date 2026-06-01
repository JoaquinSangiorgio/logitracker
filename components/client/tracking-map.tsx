"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface TrackingMapProps {
  driverLocation: { lat: number; lng: number }
  destination: { lat: number; lng: number; address: string }
}

export default function TrackingMap({ driverLocation, destination }: TrackingMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const driverMarkerRef = useRef<L.Marker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapRef.current = L.map(containerRef.current).setView(
      [driverLocation.lat, driverLocation.lng],
      14
    )

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapRef.current)

    const destinationIcon = L.divIcon({
      html: `<div style="background-color: #22c55e; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>`,
      className: "custom-marker",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })

    L.marker([destination.lat, destination.lng], { icon: destinationIcon })
      .addTo(mapRef.current)
      .bindPopup(`<b>Destino</b><br/>${destination.address}`)

    const driverIcon = L.divIcon({
      html: `<div style="background-color: #3b82f6; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><path d="M8 15h0"/><path d="M16 15h0"/></svg>
      </div>`,
      className: "driver-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    })

    driverMarkerRef.current = L.marker([driverLocation.lat, driverLocation.lng], { icon: driverIcon })
      .addTo(mapRef.current)
      .bindPopup("<b>Tu chofer</b><br/>En camino...")

    const bounds = L.latLngBounds([
      [driverLocation.lat, driverLocation.lng],
      [destination.lat, destination.lng]
    ])
    mapRef.current.fitBounds(bounds, { padding: [50, 50] })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (driverMarkerRef.current && driverLocation) {
      driverMarkerRef.current.setLatLng([driverLocation.lat, driverLocation.lng])
    }
  }, [driverLocation])

  return (
    <div ref={containerRef} className="h-full w-full" />
  )
}
