'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Truck, Users, Package, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuthStore()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await login(email, password)
    
    if (result.success) {
      const user = useAuthStore.getState().user
      if (user?.role === 'admin') {
        router.push('/admin')
      } else if (user?.role === 'driver') {
        router.push('/driver')
      } else {
        router.push('/client')
      }
    } else {
      setError(result.error || 'Error al iniciar sesion')
    }
    
    setIsLoading(false)
  }

  const quickLogin = async (type: 'admin' | 'driver' | 'client') => {
    const emails = {
      admin: 'admin@logistica.com',
      driver: 'juan.perez@logistica.com',
      client: 'empresa.abc@mail.com'
    }
    setEmail(emails[type])
    setPassword('demo123')
    
    setIsLoading(true)
    const result = await login(emails[type], 'demo123')
    if (result.success) {
      router.push(`/${type === 'admin' ? 'admin' : type}`)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary text-primary-foreground">
              <Truck className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">LogiTrack</h1>
          <p className="text-muted-foreground">Sistema de Gestion de Entregas</p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Iniciar Sesion</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electronico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contrasena</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>

            {/* Quick Login for Demo */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Acceso rapido (Demo)
              </p>
              <Tabs defaultValue="admin" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="admin" className="text-xs">Admin</TabsTrigger>
                  <TabsTrigger value="driver" className="text-xs">Chofer</TabsTrigger>
                  <TabsTrigger value="client" className="text-xs">Cliente</TabsTrigger>
                </TabsList>
                <TabsContent value="admin" className="mt-3">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => quickLogin('admin')}
                    disabled={isLoading}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Entrar como Administrador
                  </Button>
                </TabsContent>
                <TabsContent value="driver" className="mt-3">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => quickLogin('driver')}
                    disabled={isLoading}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Entrar como Chofer
                  </Button>
                </TabsContent>
                <TabsContent value="client" className="mt-3">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => quickLogin('client')}
                    disabled={isLoading}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Entrar como Cliente
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          LogiTrack v1.0 - Sistema de Logistica Integral
        </p>
      </div>
    </div>
  )
}
