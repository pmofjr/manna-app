import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://eeetgtjyrijykejerxab.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZXRndGp5cmlqeWtlamVyeGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMzczMTksImV4cCI6MjA5NTYxMzMxOX0.1bSCP6_L5iPBgoSg_kqeq3zMfisIck49lYDNjK6t1dw'
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { event, data } = req.body

  if (!event || !data) {
    return res.status(400).json({ error: 'Payload inválido' })
  }

  const email = data?.customer?.email

  if (!email) {
    return res.status(400).json({ error: 'Email não encontrado no evento' })
  }

  // Eventos que LIBERAM acesso
  const activeEvents = [
    'subscription.created',
    'subscription.invoice_paid',
    'sale.paid',  // cobre inscrições gratuitas (cortesia)
  ]

  // Eventos que BLOQUEIAM acesso
  const inactiveEvents = [
    'subscription.canceled',
    'subscription.inactive',
    'subscription.auto_canceled',
    'subscription.overdue_30',
  ]

  let newStatus = null

  if (activeEvents.includes(event)) newStatus = 'active'
  if (inactiveEvents.includes(event)) newStatus = 'inactive'

  if (!newStatus) {
    return res.status(200).json({ message: 'Evento ignorado: ' + event })
  }

  // Busca o registro atual antes de gravar.
  // Nem todo evento da Mivvo carrega todos os campos, e o upsert substitui a
  // linha inteira — sem esta consulta, um evento incompleto apaga dado bom.
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('plan, mivvo_subscription_id')
    .eq('email', email)
    .maybeSingle()

  // 'interval' só existe em subscription.created.
  // Em sale.paid e subscription.invoice_paid ele não vem, então preservamos o
  // plano já gravado em vez de assumir cortesia.
  const plan = data?.interval || existing?.plan || 'courtesy'

  // 'subscription_id' não existe em sale.paid. Mesma lógica de preservação.
  const subscription_id =
    data?.subscription_id || existing?.mivvo_subscription_id || null

  const { error } = await supabase
    .from('subscriptions')
    .upsert(
      {
        email,
        status: newStatus,
        plan,
        mivvo_subscription_id: subscription_id,
      },
      { onConflict: 'email' }
    )

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json({ message: 'OK' })
}
