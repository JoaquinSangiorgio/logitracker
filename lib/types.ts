// Types for the logistics application

export type UserRole = 'admin' | 'driver' | 'client'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  avatar?: string
  createdAt: string
}

export interface Driver extends User {
  role: 'driver'
  vehiclePlate: string
  vehicleType: string
  status: 'available' | 'busy' | 'offline'
  currentLocation?: {
    lat: number
    lng: number
    updatedAt: string
  }
  totalDeliveries: number
  rating: number
}

export interface Client extends User {
  role: 'client'
  address: string
  city: string
  postalCode: string
  totalOrders: number
}

export interface Delivery {
  id: string
  trackingCode: string
  clientId: string
  clientName: string
  driverId?: string
  driverName?: string
  status: DeliveryStatus
  priority: 'baja' | 'media' | 'alta' | 'urgente'
  
  // Pickup info
  pickupAddress: string
  pickupLat: number
  pickupLng: number
  pickupTime?: string
  
  // Delivery info
  deliveryAddress: string
  deliveryLat: number
  deliveryLng: number
  estimatedDelivery: string
  actualDelivery?: string
  
  // ePOD
  proof?: {
    signature?: string
    photo?: string
    receiverName?: string
    notes?: string
    timestamp: string
  }
  
  // Package info
  packageDescription: string
  packageWeight?: number
  packageSize?: 'small' | 'medium' | 'large' | 'extra-large'
  
  createdAt: string
  updatedAt: string
}

export type DeliveryStatus = 
  | 'pendiente'
  | 'asignada'
  | 'recogida'
  | 'en transito'
  | 'arrivando'
  | 'entregada'
  | 'fallida'
  | 'cancelada'

export interface Incident {
  id: string
  deliveryId?: string
  reporterId: string
  reporterName: string
  reporterRole: UserRole
  assigneeId?: string
  assigneeName?: string
  
  type: IncidentType
  priority: 'baja' | 'media' | 'alta' | 'critica'
  status: IncidentStatus
  
  title: string
  description: string
  resolution?: string
  
  attachments?: string[]
  
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export type IncidentType = 
  | 'damaged_package'
  | 'delayed_delivery'
  | 'wrong_address'
  | 'customer_absent'
  | 'vehicle_issue'
  | 'route_problem'
  | 'other'

export type IncidentStatus = 
  | 'open'
  | 'in_progress'
  | 'pending_info'
  | 'resolved'
  | 'closed'

export interface DashboardStats {
  totalDeliveries: number
  pendingDeliveries: number
  inTransitDeliveries: number
  completedDeliveries: number
  failedDeliveries: number
  
  totalDrivers: number
  activeDrivers: number
  
  totalClients: number
  
  openIncidents: number
  resolvedIncidents: number
  
  deliveryRate: number
  avgDeliveryTime: number
}

export interface RouteOptimization {
  driverId: string
  deliveries: string[]
  estimatedTime: number
  estimatedDistance: number
  waypoints: { lat: number; lng: number }[]
}

export interface RouteStop {
  id: string
  deliveryId: string
  order: number
  address: string
  lat: number
  lng: number
  estimatedArrival?: string
  actualArrival?: string
  status: 'pending' | 'completed' | 'skipped'
  distance?: number // km desde el punto anterior
  duration?: number // minutos desde el punto anterior
}

export interface Route {
  id: string
  name: string
  driverId: string
  driverName: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'

  // Punto de inicio
  startPoint: {
    name: string
    address: string
    lat: number
    lng: number
  }

  // Paradas ordenadas
  stops: RouteStop[]

  // IDs de entregas asignadas
  deliveryIds: string[]

  // Estadísticas
  totalDistance?: number // km
  estimatedDuration?: number // minutos
  actualDuration?: number // minutos

  // Fechas
  scheduledDate?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}
