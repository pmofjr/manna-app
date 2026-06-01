import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://eeetgtjyrijykejerxab.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZXRndGp5cmlqeWtlamVyeGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMzczMTksImV4cCI6MjA5NTYxMzMxOX0.1bSCP6_L5iPBgoSg_kqeq3zMfisIck49lYDNjK6t1dw'
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const event = req.body

  const email = event?.customer?.email
  const status = event?.status
  const plan = event?.plan?.name || 'monthly'
  const mivvo_id = event?.id || null

  if (!email) {
    return res.status(400).json({ error: 'Email não encontrado no evento' })
  }

  // Eventos que LIBERAM acesso
  const activeEvents = [
    'payment.confirmed',
    'subscription.created',
    'subscription.charge_paid'
  ]

  // Eventos que BLOQUEIAM acesso
  const inactiveEvents = [
    'subscription.canceled',
    'subscription.inactive',
    'subscription.overdue'
  ]

  let newStatus = null

  if (activeEvents.includes(status)) newStatus = 'active'
  if (inactiveEvents.includes(status)) newStatus = 'inactive'

  if (!newStatus) {
    return res.status(200).json({ message: 'Evento ignorado' })
  }

  const { error } = await supabase
    .from('subscriptions')
    .upsert(
      { email, status: newStatus, plan, mivvo_subscription_id: mivvo_id },
      { onConflict: 'email' }
    )

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json({ message: 'OK' })
}
