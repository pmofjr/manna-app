export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.status(200).end(); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  const { email } = req.body
  if (!email) { res.status(400).json({ error: 'Email obrigatório' }); return }

  // Verificar se email existe no Supabase
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    'https://eeetgtjyrijykejerxab.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZXRndGp5cmlqeWtlamVyeGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMzczMTksImV4cCI6MjA5NTYxMzMxOX0.1bSCP6_L5iPBgoSg_kqeq3zMfisIck49lYDNjK6t1dw'
  )

  const { data: user } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('email', email.toLowerCase().trim())
    .single()

  // Sempre retorna sucesso para não revelar se email existe
  if (!user) {
    return res.status(200).json({ message: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.' })
  }

  // Gerar token simples (timestamp + email em base64)
  const token = Buffer.from(`${email}:${Date.now()}`).toString('base64url')
  const resetLink = `https://appmanna.com/reset-password.html?token=${token}&email=${encodeURIComponent(email)}`

  // Enviar email via Resend
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'Manna <noreply@appmanna.com>',
      to: email,
      subject: 'Redefinir sua senha — Manna',
      html: `
        <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; background: #0F1E2E; color: #ffffff; padding: 48px 32px; border-radius: 16px;">
          <img src="https://appmanna.com/logo-manna.png" alt="Manna" style="height: 40px; margin-bottom: 32px;" />
          <h2 style="font-weight: 300; font-size: 1.6rem; margin-bottom: 16px; color: #E8D5A3;">Redefinir senha</h2>
          <p style="color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 24px;">
            Olá${user.name ? ', ' + user.name.split(' ')[0] : ''}! Recebemos uma solicitação para redefinir a senha da sua conta Manna.
          </p>
          <p style="color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 32px;">
            Clique no botão abaixo para criar uma nova senha. Este link é válido por <strong style="color:#C9A84C;">1 hora</strong>.
          </p>
          <a href="${resetLink}" style="display: inline-block; background: #C9A84C; color: #0F1E2E; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-family: sans-serif; font-weight: 500; font-size: 0.95rem;">
            Redefinir minha senha
          </a>
          <p style="color: rgba(255,255,255,0.4); font-size: 0.8rem; margin-top: 32px; line-height: 1.6;">
            Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanece a mesma.<br/><br/>
            Dúvidas? Entre em contato: appmannadevotional@gmail.com
          </p>
        </div>
      `
    })
  })

  if (!emailRes.ok) {
    const err = await emailRes.json()
    console.error('Resend error:', err)
    return res.status(500).json({ error: 'Erro ao enviar email' })
  }

  return res.status(200).json({ message: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.' })
}
