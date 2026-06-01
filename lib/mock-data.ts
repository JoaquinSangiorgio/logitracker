import type { User, Driver, Client, Delivery, Incident, DashboardStats } from './types'

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@logistica.com',
    name: 'Carlos Rodriguez',
    role: 'admin',
    phone: '+52 55 1234 5678',
    createdAt: '2024-01-01T00:00:00Z'
  }
]

export const mockDrivers: Driver[] = [
  {
    id: 'driver-1',
    email: 'juan.perez@logistica.com',
    name: 'Juan Perez',
    role: 'driver',
    phone: '+52 55 2345 6789',
    vehiclePlate: 'ABC-123',
    vehicleType: 'Van',
    status: 'busy',
    currentLocation: { lat: 19.4326, lng: -99.1332, updatedAt: new Date().toISOString() },
    totalDeliveries: 234,
    rating: 4.8,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'driver-2',
    email: 'maria.garcia@logistica.com',
    name: 'Maria Garcia',
    role: 'driver',
    phone: '+52 55 3456 7890',
    vehiclePlate: 'DEF-456',
    vehicleType: 'Motorcycle',
    status: 'available',
    currentLocation: { lat: 19.4126, lng: -99.1532, updatedAt: new Date().toISOString() },
    totalDeliveries: 189,
    rating: 4.9,
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: 'driver-3',
    email: 'pedro.lopez@logistica.com',
    name: 'Pedro Lopez',
    role: 'driver',
    phone: '+52 55 4567 8901',
    vehiclePlate: 'GHI-789',
    vehicleType: 'Truck',
    status: 'busy',
    currentLocation: { lat: 19.4526, lng: -99.1132, updatedAt: new Date().toISOString() },
    totalDeliveries: 312,
    rating: 4.7,
    createdAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'driver-4',
    email: 'ana.martinez@logistica.com',
    name: 'Ana Martinez',
    role: 'driver',
    phone: '+52 55 5678 9012',
    vehiclePlate: 'JKL-012',
    vehicleType: 'Van',
    status: 'offline',
    totalDeliveries: 156,
    rating: 4.6,
    createdAt: '2024-03-01T00:00:00Z'
  }
]

export const mockClients: Client[] = [
  {
    id: 'client-1',
    email: 'empresa.abc@mail.com',
    name: 'Empresa ABC S.A.',
    role: 'client',
    phone: '+52 55 6789 0123',
    address: 'Av. Reforma 123, Col. Centro',
    city: 'Ciudad de Mexico',
    postalCode: '06600',
    totalOrders: 45,
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 'client-2',
    email: 'tienda.xyz@mail.com',
    name: 'Tienda XYZ',
    role: 'client',
    phone: '+52 55 7890 1234',
    address: 'Calle Madero 456, Col. Juarez',
    city: 'Ciudad de Mexico',
    postalCode: '06600',
    totalOrders: 78,
    createdAt: '2024-01-05T00:00:00Z'
  },
  {
    id: 'client-3',
    email: 'comercial.123@mail.com',
    name: 'Comercial 123',
    role: 'client',
    phone: '+52 55 8901 2345',
    address: 'Blvd. Miguel de Cervantes 789',
    city: 'Ciudad de Mexico',
    postalCode: '11520',
    totalOrders: 23,
    createdAt: '2024-02-15T00:00:00Z'
  },
  {
    id: 'client-4',
    email: 'distribuidora.norte@mail.com',
    name: 'Distribuidora Norte',
    role: 'client',
    phone: '+52 55 9012 3456',
    address: 'Av. Insurgentes Sur 1234',
    city: 'Ciudad de Mexico',
    postalCode: '03100',
    totalOrders: 156,
    createdAt: '2024-01-01T00:00:00Z'
  }
]

export const mockDeliveries: Delivery[] = [
  {
    id: 'del-001',
    trackingCode: 'TRK-2024-001',
    clientId: 'client-1',
    clientName: 'Empresa ABC S.A.',
    driverId: 'driver-1',
    driverName: 'Juan Perez',
    status: 'in_transit',
    priority: 'high',
    pickupAddress: 'Bodega Central, Av. Tlahuac 100',
    pickupLat: 19.3826,
    pickupLng: -99.0832,
    pickupTime: '2024-03-15T09:00:00Z',
    deliveryAddress: 'Av. Reforma 123, Col. Centro',
    deliveryLat: 19.4326,
    deliveryLng: -99.1332,
    estimatedDelivery: '2024-03-15T14:00:00Z',
    packageDescription: 'Documentos importantes',
    packageWeight: 2,
    packageSize: 'small',
    createdAt: '2024-03-15T08:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'del-002',
    trackingCode: 'TRK-2024-002',
    clientId: 'client-2',
    clientName: 'Tienda XYZ',
    driverId: 'driver-3',
    driverName: 'Pedro Lopez',
    status: 'picked_up',
    priority: 'medium',
    pickupAddress: 'Almacen Norte, Periferico 500',
    pickupLat: 19.4826,
    pickupLng: -99.1832,
    pickupTime: '2024-03-15T10:30:00Z',
    deliveryAddress: 'Calle Madero 456, Col. Juarez',
    deliveryLat: 19.4226,
    deliveryLng: -99.1432,
    estimatedDelivery: '2024-03-15T15:30:00Z',
    packageDescription: 'Productos electronicos',
    packageWeight: 15,
    packageSize: 'large',
    createdAt: '2024-03-15T08:30:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'del-003',
    trackingCode: 'TRK-2024-003',
    clientId: 'client-3',
    clientName: 'Comercial 123',
    status: 'pending',
    priority: 'low',
    pickupAddress: 'Centro de Distribucion Sur',
    pickupLat: 19.3526,
    pickupLng: -99.1632,
    deliveryAddress: 'Blvd. Miguel de Cervantes 789',
    deliveryLat: 19.4426,
    deliveryLng: -99.2032,
    estimatedDelivery: '2024-03-16T12:00:00Z',
    packageDescription: 'Papeleria',
    packageWeight: 8,
    packageSize: 'medium',
    createdAt: '2024-03-15T09:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'del-004',
    trackingCode: 'TRK-2024-004',
    clientId: 'client-4',
    clientName: 'Distribuidora Norte',
    driverId: 'driver-1',
    driverName: 'Juan Perez',
    status: 'delivered',
    priority: 'urgent',
    pickupAddress: 'Bodega Central, Av. Tlahuac 100',
    pickupLat: 19.3826,
    pickupLng: -99.0832,
    pickupTime: '2024-03-14T08:00:00Z',
    deliveryAddress: 'Av. Insurgentes Sur 1234',
    deliveryLat: 19.3926,
    deliveryLng: -99.1732,
    estimatedDelivery: '2024-03-14T12:00:00Z',
    actualDelivery: '2024-03-14T11:45:00Z',
    packageDescription: 'Refacciones automotrices',
    packageWeight: 25,
    packageSize: 'extra-large',
    proof: {
      receiverName: 'Roberto Sanchez',
      notes: 'Entregado en recepcion',
      timestamp: '2024-03-14T11:45:00Z'
    },
    createdAt: '2024-03-14T07:00:00Z',
    updatedAt: '2024-03-14T11:45:00Z'
  },
  {
    id: 'del-005',
    trackingCode: 'TRK-2024-005',
    clientId: 'client-1',
    clientName: 'Empresa ABC S.A.',
    driverId: 'driver-2',
    driverName: 'Maria Garcia',
    status: 'assigned',
    priority: 'medium',
    pickupAddress: 'Almacen Este, Calz. Zaragoza 200',
    pickupLat: 19.4126,
    pickupLng: -99.0632,
    deliveryAddress: 'Av. Reforma 123, Col. Centro',
    deliveryLat: 19.4326,
    deliveryLng: -99.1332,
    estimatedDelivery: '2024-03-15T17:00:00Z',
    packageDescription: 'Material de oficina',
    packageWeight: 5,
    packageSize: 'medium',
    createdAt: '2024-03-15T11:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'del-006',
    trackingCode: 'TRK-2024-006',
    clientId: 'client-2',
    clientName: 'Tienda XYZ',
    status: 'failed',
    priority: 'high',
    driverId: 'driver-4',
    driverName: 'Ana Martinez',
    pickupAddress: 'Centro de Distribucion Sur',
    pickupLat: 19.3526,
    pickupLng: -99.1632,
    deliveryAddress: 'Calle Madero 456, Col. Juarez',
    deliveryLat: 19.4226,
    deliveryLng: -99.1432,
    estimatedDelivery: '2024-03-14T16:00:00Z',
    packageDescription: 'Equipos de computo',
    packageWeight: 20,
    packageSize: 'large',
    createdAt: '2024-03-14T10:00:00Z',
    updatedAt: '2024-03-14T18:00:00Z'
  }
]

export const mockIncidents: Incident[] = [
  {
    id: 'inc-001',
    deliveryId: 'del-006',
    reporterId: 'driver-4',
    reporterName: 'Ana Martinez',
    reporterRole: 'driver',
    type: 'customer_absent',
    priority: 'medium',
    status: 'open',
    title: 'Cliente no disponible',
    description: 'Se intento la entrega 3 veces pero no habia nadie para recibir el paquete. Se dejo aviso en la puerta.',
    createdAt: '2024-03-14T18:00:00Z',
    updatedAt: '2024-03-14T18:00:00Z'
  },
  {
    id: 'inc-002',
    deliveryId: 'del-002',
    reporterId: 'client-2',
    reporterName: 'Tienda XYZ',
    reporterRole: 'client',
    assigneeId: 'admin-1',
    assigneeName: 'Carlos Rodriguez',
    type: 'delayed_delivery',
    priority: 'high',
    status: 'in_progress',
    title: 'Retraso en entrega urgente',
    description: 'El pedido estaba programado para las 10am y aun no llega. Necesitamos los productos para una venta importante.',
    createdAt: '2024-03-15T11:00:00Z',
    updatedAt: '2024-03-15T11:30:00Z'
  },
  {
    id: 'inc-003',
    reporterId: 'driver-1',
    reporterName: 'Juan Perez',
    reporterRole: 'driver',
    type: 'vehicle_issue',
    priority: 'critical',
    status: 'resolved',
    title: 'Problema mecanico en ruta',
    description: 'La van presento fallas en el motor. Se tuvo que detener para revision.',
    resolution: 'Se envio unidad de apoyo. El vehiculo fue llevado al taller.',
    createdAt: '2024-03-13T14:00:00Z',
    updatedAt: '2024-03-13T16:00:00Z',
    resolvedAt: '2024-03-13T16:00:00Z'
  },
  {
    id: 'inc-004',
    deliveryId: 'del-004',
    reporterId: 'client-4',
    reporterName: 'Distribuidora Norte',
    reporterRole: 'client',
    type: 'damaged_package',
    priority: 'high',
    status: 'pending_info',
    title: 'Paquete danado',
    description: 'El paquete llego con golpes visibles en la caja exterior. Solicitamos revision del contenido.',
    createdAt: '2024-03-14T12:00:00Z',
    updatedAt: '2024-03-14T14:00:00Z'
  }
]

export const mockDashboardStats: DashboardStats = {
  totalDeliveries: 1234,
  pendingDeliveries: 45,
  inTransitDeliveries: 23,
  completedDeliveries: 1150,
  failedDeliveries: 16,
  totalDrivers: 4,
  activeDrivers: 3,
  totalClients: 4,
  openIncidents: 2,
  resolvedIncidents: 156,
  deliveryRate: 98.7,
  avgDeliveryTime: 2.4
}

// Helper to get status labels in Spanish
export const deliveryStatusLabels: Record<string, string> = {
  pending: 'Pendiente',
  assigned: 'Asignado',
  picked_up: 'Recogido',
  in_transit: 'En transito',
  arriving: 'Llegando',
  delivered: 'Entregado',
  failed: 'Fallido',
  cancelled: 'Cancelado'
}

export const incidentStatusLabels: Record<string, string> = {
  open: 'Abierto',
  in_progress: 'En proceso',
  pending_info: 'Pendiente info',
  resolved: 'Resuelto',
  closed: 'Cerrado'
}

export const incidentTypeLabels: Record<string, string> = {
  damaged_package: 'Paquete danado',
  delayed_delivery: 'Entrega retrasada',
  wrong_address: 'Direccion incorrecta',
  customer_absent: 'Cliente ausente',
  vehicle_issue: 'Problema vehicular',
  route_problem: 'Problema de ruta',
  other: 'Otro'
}

export const priorityLabels: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
  critical: 'Critica'
}
