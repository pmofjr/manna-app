import { useState } from 'react'
import { supabase, hashPassword } from '../lib/supabase'
import Logo from './Logo'

export default function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register fields
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  // Forgot fields
  const [forgotEmail, setForgotEmail] = useState('')
  const [showForgot, setShowForgot] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const hash = await hashPassword(loginPassword)
      const { data, error: err } = await supabase
        .from('users')
        .select('id,name,email')
        .eq('email', loginEmail.toLowerCase().trim())
        .eq('password_hash', hash)
        .single()

      if (err || !data) {
        setError('E-mail ou senha incorretos.')
        setLoading(false)
        return
      }

      // Check subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('email', data.email)
        .eq('status', 'active')
        .single()

      onLogin(data, !!sub)
    } catch {
      setError('Erro ao conectar. Tente novamente.')
    }
    setLoading(false)
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (regPassword.length < 6) { setError('Senha deve ter ao menos 6 caracteres.'); return }
    setLoading(true)
    try {
      const email = regEmail.toLowerCase().trim()
      const hash = await hashPassword(regPassword)

      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existing) { setError('Este e-mail já está cadastrado.'); setLoading(false); return }

      const { data, error: err } = await supabase
        .from('users')
        .insert({ name: regName.trim(), email, password_hash: hash })
        .select('id,name,email')
        .single()

      if (err) throw err
      onLogin(data, false)
    } catch {
      setError('Erro ao criar conta. Tente novamente.')
    }
    setLoading(false)
  }

  async function handleForgot(e) {
    e.preventDefault()
    setError('')
    setSuccess('Se este e-mail estiver cadastrado, você receberá um link em breve.')
    // CONECTAR SERVIÇO DE E-MAIL AQUI
  }

  const styles = {
    screen: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 60% 0%, rgba(201,168,76,0.12) 0%, transparent 60%), radial-gradient(ellipse at 10% 90%, rgba(46,84,128,0.5) 0%, transparent 60%), var(--blue-dark)',
      padding: '40px 24px'
    },
    box: {
      width: '100%',
      maxWidth: '400px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid var(--card-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '40px 36px',
      boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
      animation: 'fadeUp 0.5s ease both'
    },
    logoWrap: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '32px'
    },
    tabs: {
      display: 'flex',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: '12px',
      padding: '4px',
      marginBottom: '28px'
    },
    tab: (active) => ({
      flex: 1,
      textAlign: 'center',
      padding: '10px',
      fontSize: '0.85rem',
      fontWeight: 500,
      cursor: 'pointer',
      borderRadius: '10px',
      border: 'none',
      background: active ? 'var(--gold)' : 'transparent',
      color: active ? 'var(--white)' : 'var(--text-muted)',
      transition: 'all 0.2s',
      fontFamily: 'var(--sans)'
    }),
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    },
    forgot: {
      textAlign: 'right',
      fontSize: '0.78rem',
      color: 'var(--gold)',
      cursor: 'pointer',
      marginTop: '-6px'
    },
    note: {
      textAlign: 'center',
      fontSize: '0.75rem',
      color: 'var(--text-muted)',
      marginTop: '16px'
    },
    link: { color: 'var(--gold)', textDecoration: 'none' },
    back: {
      background: 'none',
      border: 'none',
      color: 'var(--text-muted)',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontFamily: 'var(--sans)',
      marginTop: '8px',
      alignSelf: 'center'
    }
  }

  if (showForgot) return (
    <div style={styles.screen}>
      <div style={styles.box}>
        <div style={styles.logoWrap}><Logo height={44} /></div>
        <p style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', marginBottom: '8px' }}>Recuperar senha</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Digite seu e-mail e enviaremos um link para redefinir sua senha.
        </p>
        <form onSubmit={handleForgot} style={styles.form}>
          <input className="input" type="email" placeholder="Seu e-mail" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Enviar link</button>
          <button type="button" style={styles.back} onClick={() => { setShowForgot(false); setError(''); setSuccess(''); }}>
            ← Voltar ao login
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div style={styles.screen}>
      <div style={styles.box}>
        <div style={styles.logoWrap}><Logo height={44} /></div>

        <div style={styles.tabs}>
          <button style={styles.tab(tab === 'login')} onClick={() => { setTab('login'); setError('') }}>Entrar</button>
          <button style={styles.tab(tab === 'register')} onClick={() => { setTab('register'); setError('') }}>Criar conta</button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin} style={styles.form}>
            <input className="input" type="email" placeholder="Seu e-mail" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} autoComplete="email" required />
            <input className="input" type="password" placeholder="Sua senha" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} autoComplete="current-password" required />
            <span style={styles.forgot} onClick={() => { setShowForgot(true); setError('') }}>Esqueci minha senha</span>
            {error && <div className="error-box">{error}</div>}
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Aguarde...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={styles.form}>
            <input className="input" type="text" placeholder="Seu nome completo" value={regName} onChange={e => setRegName(e.target.value)} autoComplete="name" required />
            <input className="input" type="email" placeholder="Seu e-mail" value={regEmail} onChange={e => setRegEmail(e.target.value)} autoComplete="email" required />
            <input className="input" type="password" placeholder="Crie uma senha (mín. 6 caracteres)" value={regPassword} onChange={e => setRegPassword(e.target.value)} autoComplete="new-password" required />
            {error && <div className="error-box">{error}</div>}
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Aguarde...' : 'Criar conta'}
            </button>
          </form>
        )}

        <p style={styles.note}>
          Ao continuar, você concorda com os <a href="#" style={styles.link}>Termos de Uso</a>
        </p>
      </div>
    </div>
  )
}
