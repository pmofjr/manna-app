export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.status(200).end(); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  const { token, email, newPassword } = req.body
  if (!token || !email || !newPassword) {
    return res.status(400).json({ error: 'Dados incompletos' })
  }

  // Validar token — decodifica e verifica se tem menos de 1 hora
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const [tokenEmail, timestamp] = decoded.split(':')
    const age = Date.now() - parseInt(timestamp)
    const oneHour = 60 * 60 * 1000

    if (tokenEmail !== email.toLowerCase().trim() || age > oneHour) {
      return res.status(400).json({ error: 'Link inválido ou expirado. Solicite um novo.' })
    }
  } catch {
    return res.status(400).json({ error: 'Token inválido' })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter ao menos 6 caracteres' })
  }

  // Gerar novo hash
  const enc = new TextEncoder().encode(newPassword)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    'https://eeetgtjyrijykejerxab.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZXRndGp5cmlqeWtlamVyeGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMzczMTksImV4cCI6MjA5NTYxMzMxOX0.1bSCP6_L5iPBgoSg_kqeq3zMfisIck49lYDNjK6t1dw'
  )

  const { error } = await supabase
    .from('users')
    .update({ password_hash: hash })
    .eq('email', email.toLowerCase().trim())

  if (error) {
    return res.status(500).json({ error: 'Erro ao atualizar senha' })
  }

  return res.status(200).json({ message: 'Senha redefinida com sucesso!' })
}
