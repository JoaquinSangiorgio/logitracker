'use client'

import { useAuthStore, useOfflineStore } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogOut, Wifi, WifiOff } from 'lucide-react'

export function DriverHeader() {
  const { user, logout } = useAuthStore()
  const { isOnline, pendingActions } = useOfflineStore()

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary-foreground/20">
            <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Badge variant="secondary" className="bg-green-500/20 text-green-100 text-xs">
                  <Wifi className="h-3 w-3 mr-1" />
                  En linea
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-100 text-xs">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Sin conexion
                </Badge>
              )}
              {pendingActions.length > 0 && (
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-100 text-xs">
                  {pendingActions.length} pendiente{pendingActions.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => logout()}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
