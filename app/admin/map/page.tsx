                                            'use client'

                                            import dynamic from 'next/dynamic'
                                            import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
                                            import { useDriversStore, useDeliveriesStore } from '@/lib/store'
                                            import { Badge } from '@/components/ui/badge'
                                            import { Truck, Package, MapPin } from 'lucide-react'

                                            const LiveMapComponent = dynamic(() => import('@/components/admin/live-map'), {
                                              ssr: false,
                                              loading: () => (
                                                <div className="h-[600px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
                                                  <p className="text-muted-foreground">Cargando mapa...</p>
                                                </div>
                                              )
                                            })

                                            export default function MapPage() {
                                              const { drivers } = useDriversStore()
                                              const { deliveries } = useDeliveriesStore()

                                              const activeDrivers = drivers.filter(d => d.status !== 'offline' && d.currentLocation)
                                              const activeDeliveries = deliveries.filter(d => 
                                                ['assigned', 'picked_up', 'in_transit', 'arriving'].includes(d.status)
                                              )

                                              return (
                                                <div className="space-y-6">
                                                  <div>
                                                    <h1 className="text-3xl font-bold tracking-tight">Mapa en Vivo</h1>
                                                    <p className="text-muted-foreground">Visualiza la ubicacion de choferes y entregas en tiempo real</p>
                                                  </div>

                                                  {/* Stats */}
                                                  <div className="grid gap-4 md:grid-cols-3">
                                                    <Card>
                                                      <CardContent className="pt-6">
                                                        <div className="flex items-center gap-4">
                                                          <div className="p-2 rounded-full bg-green-100">
                                                            <Truck className="h-5 w-5 text-green-600" />
                                                          </div>
                                                          <div>
                                                            <p className="text-sm text-muted-foreground">Choferes Activos</p>
                                                            <p className="text-2xl font-bold">{activeDrivers.length}</p>
                                                          </div>
                                                        </div>
                                                      </CardContent>
                                                    </Card>
                                                    <Card>
                                                      <CardContent className="pt-6">
                                                        <div className="flex items-center gap-4">
                                                          <div className="p-2 rounded-full bg-blue-100">
                                                            <Package className="h-5 w-5 text-blue-600" />
                                                          </div>
                                                          <div>
                                                            <p className="text-sm text-muted-foreground">Entregas en Curso</p>
                                                            <p className="text-2xl font-bold">{activeDeliveries.length}</p>
                                                          </div>
                                                        </div>
                                                      </CardContent>
                                                    </Card>
                                                    <Card>
                                                      <CardContent className="pt-6">
                                                        <div className="flex items-center gap-4">
                                                          <div className="p-2 rounded-full bg-primary/10">
                                                            <MapPin className="h-5 w-5 text-primary" />
                                                          </div>
                                                          <div>
                                                            <p className="text-sm text-muted-foreground">Destinos Pendientes</p>
                                                            <p className="text-2xl font-bold">{activeDeliveries.length}</p>
                                                          </div>
                                                        </div>
                                                      </CardContent>
                                                    </Card>
                                                  </div>

                                                  {/* Map */}
                                                  <Card>
                                                    <CardHeader>
                                                      <div className="flex items-center justify-between">
                                                        <div>
                                                          <CardTitle>Mapa de Rastreo</CardTitle>
                                                          <CardDescription>Ubicacion en tiempo real de la flota</CardDescription>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                          <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                            <span className="text-sm text-muted-foreground">Chofer</span>
                                                          </div>
                                                          <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                            <span className="text-sm text-muted-foreground">Destino</span>
                                                          </div>
                                                          <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                                            <span className="text-sm text-muted-foreground">Recogida</span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                      <LiveMapComponent />
                                                    </CardContent>
                                                  </Card>

                                                  {/* Active Drivers List */}
                                                  <Card>
                                                    <CardHeader>
                                                      <CardTitle>Choferes en Ruta</CardTitle>
                                                      <CardDescription>Lista de choferes actualmente en servicio</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                        {activeDrivers.map(driver => {
                                                          const driverDeliveries = activeDeliveries.filter(d => d.driverId === driver.id)
                                                          return (
                                                            <div key={driver.id} className="flex items-center gap-4 p-4 rounded-lg border">
                                                              <div className="p-2 rounded-full bg-green-100">
                                                                <Truck className="h-5 w-5 text-green-600" />
                                                              </div>
                                                              <div className="flex-1">
                                                                <p className="font-medium">{driver.name}</p>
                                                                <p className="text-sm text-muted-foreground">{driver.vehiclePlate}</p>
                                                              </div>
                                                              <Badge variant={driver.status === 'busy' ? 'default' : 'secondary'}>
                                                                {driverDeliveries.length} entregas
                                                              </Badge>
                                                            </div>
                                                          )
                                                        })}
                                                        {activeDrivers.length === 0 && (
                                                          <div className="col-span-full text-center py-8 text-muted-foreground">
                                                            No hay choferes activos en este momento
                                                          </div>
                                                        )}
                                                      </div>
                                                    </CardContent>
                                                  </Card>
                                                </div>
                                              )
                                            }
