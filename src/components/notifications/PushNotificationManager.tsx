'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [loading, setLoading] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
      registerServiceWorker()
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  const subscribeToPush = async () => {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })
      setSubscription(sub)
      setPermission(Notification.permission)
      
      // Save subscription to backend
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
      
      alert('Notificações ativadas! Você receberá alertas de contas a vencer amanhã.')
    } catch (error) {
      console.error('Error subscribing to push:', error)
      alert('Não foi possível ativar as notificações. Verifique as permissões do navegador.')
    } finally {
      setLoading(false)
    }
  }

  const unsubscribeFromPush = async () => {
    setLoading(true)
    try {
      if (subscription) {
        await subscription.unsubscribe()
        setSubscription(null)
        setPermission(Notification.permission)
        
        // Remove from backend
        const endpoint = subscription.endpoint
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint }),
        })
      }
    } catch (error) {
      console.error('Error unsubscribing:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <Button variant="ghost" size="icon" className="text-muted-foreground opacity-50 cursor-not-allowed" title="Notificações não suportadas">
        <BellOff className="size-5" />
      </Button>
    )
  }

  const isSubscribed = !!subscription && permission === 'granted'

  return (
    <Button 
      title={isSubscribed ? 'Desativar alertas diários' : 'Ativar alertas de contas a vencer'}
      variant="ghost" 
      size="icon" 
      className="text-muted-foreground hover:text-foreground relative"
      onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="size-5 animate-spin" />
      ) : isSubscribed ? (
        <>
          <Bell className="size-5 text-primary" />
          <span className="absolute top-2 right-2 size-2 bg-primary rounded-full ring-2 ring-background animate-pulse" />
        </>
      ) : (
        <BellOff className="size-5" />
      )}
      <span className="sr-only">Notificações</span>
    </Button>
  )
}
