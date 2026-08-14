'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { PageHeader } from '@/components/layout/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotificationsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; is_read: boolean; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/notifications')
      return
    }

    if (user) {
      const fetchNotifications = async () => {
        const supabase = createClient()
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)
        if (data) setNotifications(data)
        setLoading(false)
      }
      fetchNotifications()
    }
  }, [user, authLoading, router])

  const markAsRead = async (id: string) => {
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user?.id).eq('is_read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  if (authLoading || loading) {
    return (
      <div>
        <PageHeader title="Notifications" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay updated with your activity"
        actions={
          notifications.some((n) => !n.is_read) ? (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Mark all read
            </Button>
          ) : undefined
        }
      />
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <Bell className="h-7 w-7 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white">No notifications</h3>
          <p className="mt-1 text-sm text-white/40">You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`flex items-start gap-3 rounded-xl border border-white/10 p-4 transition-colors ${
                n.is_read ? 'bg-white/[0.02]' : 'bg-white/[0.05] border-purple-500/20'
              } cursor-pointer hover:bg-white/[0.06]`}
            >
              <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${n.is_read ? 'bg-white/20' : 'bg-purple-500'}`} />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white">{n.title}</h4>
                <p className="mt-0.5 text-sm text-white/50">{n.message}</p>
                <p className="mt-1 text-xs text-white/30">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
