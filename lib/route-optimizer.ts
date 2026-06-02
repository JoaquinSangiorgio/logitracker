import type { Delivery, RouteStop } from './types'

interface Point {
  lat: number
  lng: number
  address: string
  deliveryId: string
}

// Calcula la distancia entre dos puntos usando la formula de Haversine
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Estima el tiempo de viaje basado en la distancia (asume velocidad promedio de 30 km/h en ciudad)
function estimateDuration(distanceKm: number): number {
  const avgSpeedKmH = 30
  const timeInHours = distanceKm / avgSpeedKmH
  return Math.round(timeInHours * 60) // retorna minutos
}

// Algoritmo de optimizacion de ruta usando Nearest Neighbor con prioridad y ventanas de tiempo
// Considera la urgencia y horarios programados para optimizar la ruta
export function optimizeRoute(
  startLat: number,
  startLng: number,
  deliveries: Delivery[],
  startTime?: Date
): RouteStop[] {
  if (deliveries.length === 0) return []

  const baseTime = startTime || new Date()

  // Asignar puntuacion a cada entrega basada en prioridad y tiempo
  const scoredDeliveries = deliveries.map(d => {
    let priorityScore = 0
    switch (d.priority) {
      case 'urgent': priorityScore = 100; break
      case 'high': priorityScore = 75; break
      case 'medium': priorityScore = 50; break
      case 'low': priorityScore = 25; break
    }

    // Bonus si la entrega tiene una ventana de tiempo cercana
    let timeScore = 0
    if (d.estimatedDelivery) {
      const deliveryTime = new Date(d.estimatedDelivery).getTime()
      const currentTime = baseTime.getTime()
      const hoursUntil = (deliveryTime - currentTime) / (1000 * 60 * 60)

      // Mayor puntuacion si la entrega es pronto
      if (hoursUntil < 2) timeScore = 50
      else if (hoursUntil < 4) timeScore = 30
      else if (hoursUntil < 6) timeScore = 10
    }

    return {
      delivery: d,
      score: priorityScore + timeScore,
      lat: d.deliveryLat,
      lng: d.deliveryLng,
      address: d.deliveryAddress,
      deliveryId: d.id
    }
  })

  const optimizedStops: RouteStop[] = []
  const unvisited = [...scoredDeliveries]
  let currentLat = startLat
  let currentLng = startLng
  let order = 1
  let totalTime = 0

  // Mientras haya puntos sin visitar
  while (unvisited.length > 0) {
    let bestIndex = 0
    let bestScore = -1

    // Encontrar el mejor punto considerando distancia Y prioridad
    for (let i = 0; i < unvisited.length; i++) {
      const distance = calculateDistance(currentLat, currentLng, unvisited[i].lat, unvisited[i].lng)

      // Score combinado: prioridad del paquete - penalizacion por distancia
      // Normalizamos la distancia (asumiendo max 30km en ciudad)
      const distancePenalty = (distance / 30) * 50
      const combinedScore = unvisited[i].score - distancePenalty

      if (combinedScore > bestScore) {
        bestScore = combinedScore
        bestIndex = i
      }
    }

    // Agregar el mejor punto a la ruta
    const best = unvisited[bestIndex]
    const distance = calculateDistance(currentLat, currentLng, best.lat, best.lng)
    const duration = estimateDuration(distance)
    totalTime += duration

    // Estimar tiempo de llegada
    const estimatedArrival = new Date(baseTime)
    estimatedArrival.setMinutes(estimatedArrival.getMinutes() + 30 + totalTime)

    optimizedStops.push({
      id: `stop-${Date.now()}-${order}`,
      deliveryId: best.deliveryId,
      order,
      address: best.address,
      lat: best.lat,
      lng: best.lng,
      status: 'pending',
      distance: parseFloat(distance.toFixed(2)),
      duration,
      estimatedArrival: estimatedArrival.toISOString()
    })

    // Actualizar posicion actual y remover punto visitado
    currentLat = best.lat
    currentLng = best.lng
    unvisited.splice(bestIndex, 1)
    order++
  }

  return optimizedStops
}

// Calcula las estadisticas totales de una ruta
export function calculateRouteStats(stops: RouteStop[]): {
  totalDistance: number
  estimatedDuration: number
} {
  const totalDistance = stops.reduce((sum, stop) => sum + (stop.distance || 0), 0)
  const estimatedDuration = stops.reduce((sum, stop) => sum + (stop.duration || 0), 0)

  return {
    totalDistance: parseFloat(totalDistance.toFixed(2)),
    estimatedDuration
  }
}

// Genera URL de Google Maps para navegacion
export function generateGoogleMapsUrl(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`
}

// Genera URL de Google Maps con multiples waypoints
export function generateGoogleMapsRouteUrl(
  startLat: number,
  startLng: number,
  stops: RouteStop[]
): string {
  if (stops.length === 0) return ''

  const origin = `${startLat},${startLng}`
  const destination = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`

  // Google Maps solo permite hasta 9 waypoints en la URL
  const waypoints = stops.slice(0, -1).slice(0, 9).map(stop => `${stop.lat},${stop.lng}`).join('|')

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`

  if (waypoints) {
    url += `&waypoints=${waypoints}`
  }

  return url
}
