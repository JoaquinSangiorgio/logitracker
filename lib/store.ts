import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Driver, Client, Delivery, Incident, UserRole } from './types'
import { mockDrivers, mockClients, mockDeliveries, mockIncidents, mockUsers } from './mock-data'

interface AuthState {
  user: User | Driver | Client | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, _password: string) => {
        // Mock authentication - in production this would call an API
        const allUsers = [...mockUsers, ...mockDrivers, ...mockClients]
        const user = allUsers.find(u => u.email === email)
        
        if (user) {
          set({ user, isAuthenticated: true })
          return { success: true }
        }
        
        return { success: false, error: 'Credenciales invalidas' }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false })
      }
    }),
    { name: 'auth-storage' }
  )
)

interface DriversState {
  drivers: Driver[]
  addDriver: (driver: Omit<Driver, 'id' | 'createdAt' | 'totalDeliveries' | 'rating'>) => void
  updateDriver: (id: string, data: Partial<Driver>) => void
  deleteDriver: (id: string) => void
  updateDriverLocation: (id: string, lat: number, lng: number) => void
}

export const useDriversStore = create<DriversState>()(
  persist(
    (set) => ({
      drivers: mockDrivers,
      addDriver: (driverData) => {
        const newDriver: Driver = {
          ...driverData,
          id: `driver-${Date.now()}`,
          createdAt: new Date().toISOString(),
          totalDeliveries: 0,
          rating: 5.0
        }
        set((state) => ({ drivers: [...state.drivers, newDriver] }))
      },
      updateDriver: (id, data) => {
        set((state) => ({
          drivers: state.drivers.map(d => d.id === id ? { ...d, ...data } : d)
        }))
      },
      deleteDriver: (id) => {
        set((state) => ({ drivers: state.drivers.filter(d => d.id !== id) }))
      },
      updateDriverLocation: (id, lat, lng) => {
        set((state) => ({
          drivers: state.drivers.map(d => 
            d.id === id 
              ? { ...d, currentLocation: { lat, lng, updatedAt: new Date().toISOString() } }
              : d
          )
        }))
      }
    }),
    { name: 'drivers-storage' }
  )
)

interface ClientsState {
  clients: Client[]
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'totalOrders'>) => void
  updateClient: (id: string, data: Partial<Client>) => void
  deleteClient: (id: string) => void
}

export const useClientsStore = create<ClientsState>()(
  persist(
    (set) => ({
      clients: mockClients,
      addClient: (clientData) => {
        const newClient: Client = {
          ...clientData,
          id: `client-${Date.now()}`,
          createdAt: new Date().toISOString(),
          totalOrders: 0
        }
        set((state) => ({ clients: [...state.clients, newClient] }))
      },
      updateClient: (id, data) => {
        set((state) => ({
          clients: state.clients.map(c => c.id === id ? { ...c, ...data } : c)
        }))
      },
      deleteClient: (id) => {
        set((state) => ({ clients: state.clients.filter(c => c.id !== id) }))
      }
    }),
    { name: 'clients-storage' }
  )
)

interface DeliveriesState {
  deliveries: Delivery[]
  addDelivery: (delivery: Omit<Delivery, 'id' | 'trackingCode' | 'createdAt' | 'updatedAt'>) => void
  updateDelivery: (id: string, data: Partial<Delivery>) => void
  deleteDelivery: (id: string) => void
  assignDriver: (deliveryId: string, driverId: string, driverName: string) => void
  updateStatus: (id: string, status: Delivery['status']) => void
  addProof: (id: string, proof: Delivery['proof']) => void
}

export const useDeliveriesStore = create<DeliveriesState>()(
  persist(
    (set) => ({
      deliveries: mockDeliveries,
      addDelivery: (deliveryData) => {
        const newDelivery: Delivery = {
          ...deliveryData,
          id: `del-${Date.now()}`,
          trackingCode: `TRK-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        set((state) => ({ deliveries: [...state.deliveries, newDelivery] }))
      },
      updateDelivery: (id, data) => {
        set((state) => ({
          deliveries: state.deliveries.map(d => 
            d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d
          )
        }))
      },
      deleteDelivery: (id) => {
        set((state) => ({ deliveries: state.deliveries.filter(d => d.id !== id) }))
      },
      assignDriver: (deliveryId, driverId, driverName) => {
        set((state) => ({
          deliveries: state.deliveries.map(d => 
            d.id === deliveryId 
              ? { ...d, driverId, driverName, status: 'assigned' as const, updatedAt: new Date().toISOString() }
              : d
          )
        }))
      },
      updateStatus: (id, status) => {
        set((state) => ({
          deliveries: state.deliveries.map(d => 
            d.id === id 
              ? { 
                  ...d, 
                  status, 
                  updatedAt: new Date().toISOString(),
                  actualDelivery: status === 'delivered' ? new Date().toISOString() : d.actualDelivery
                } 
              : d
          )
        }))
      },
      addProof: (id, proof) => {
        set((state) => ({
          deliveries: state.deliveries.map(d => 
            d.id === id 
              ? { ...d, proof, status: 'delivered' as const, actualDelivery: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : d
          )
        }))
      }
    }),
    { name: 'deliveries-storage' }
  )
)

interface IncidentsState {
  incidents: Incident[]
  addIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateIncident: (id: string, data: Partial<Incident>) => void
  deleteIncident: (id: string) => void
  resolveIncident: (id: string, resolution: string) => void
  assignIncident: (id: string, assigneeId: string, assigneeName: string) => void
}

export const useIncidentsStore = create<IncidentsState>()(
  persist(
    (set) => ({
      incidents: mockIncidents,
      addIncident: (incidentData) => {
        const newIncident: Incident = {
          ...incidentData,
          id: `inc-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        set((state) => ({ incidents: [...state.incidents, newIncident] }))
      },
      updateIncident: (id, data) => {
        set((state) => ({
          incidents: state.incidents.map(i => 
            i.id === id ? { ...i, ...data, updatedAt: new Date().toISOString() } : i
          )
        }))
      },
      deleteIncident: (id) => {
        set((state) => ({ incidents: state.incidents.filter(i => i.id !== id) }))
      },
      resolveIncident: (id, resolution) => {
        set((state) => ({
          incidents: state.incidents.map(i => 
            i.id === id 
              ? { ...i, resolution, status: 'resolved' as const, resolvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : i
          )
        }))
      },
      assignIncident: (id, assigneeId, assigneeName) => {
        set((state) => ({
          incidents: state.incidents.map(i => 
            i.id === id 
              ? { ...i, assigneeId, assigneeName, status: 'in_progress' as const, updatedAt: new Date().toISOString() }
              : i
          )
        }))
      }
    }),
    { name: 'incidents-storage' }
  )
)

// Offline sync store
interface OfflineState {
  pendingActions: Array<{
    id: string
    type: 'delivery_update' | 'incident_create' | 'proof_upload'
    data: unknown
    timestamp: string
  }>
  isOnline: boolean
  addPendingAction: (action: Omit<OfflineState['pendingActions'][0], 'id' | 'timestamp'>) => void
  removePendingAction: (id: string) => void
  setOnlineStatus: (status: boolean) => void
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      pendingActions: [],
      isOnline: true,
      addPendingAction: (action) => {
        set((state) => ({
          pendingActions: [
            ...state.pendingActions,
            { ...action, id: `action-${Date.now()}`, timestamp: new Date().toISOString() }
          ]
        }))
      },
      removePendingAction: (id) => {
        set((state) => ({
          pendingActions: state.pendingActions.filter(a => a.id !== id)
        }))
      },
      setOnlineStatus: (status) => {
        set({ isOnline: status })
      }
    }),
    { name: 'offline-storage' }
  )
)

export const useStore = () => {
  const auth = useAuthStore()
  const drivers = useDriversStore()
  const clients = useClientsStore()
  const deliveries = useDeliveriesStore()
  const incidents = useIncidentsStore()
  const offline = useOfflineStore()

  return {
    ...auth,
    ...drivers,
    ...clients,
    ...deliveries,
    ...incidents,
    ...offline
  }
}
