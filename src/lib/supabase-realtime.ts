import { supabase } from '@/lib/supabase'

export function subscribeToOrders(userId: string, callback: (payload: any) => void) {
  const subscription = supabase
    .channel(`orders-${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders', filter: `seller_id=eq.${userId}` },
      (payload) => callback(payload)
    )
    .subscribe()
  return subscription
}

export function subscribeToNotifications(userId: string, callback: (payload: any) => void) {
  const subscription = supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      (payload) => callback(payload)
    )
    .subscribe()
  return subscription
}
