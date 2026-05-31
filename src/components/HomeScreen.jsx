import Nav from './Nav'

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function HomeScreen({ user, onTrilha, onHistory, onLogout }) {
  const firstName = capitalize(user.name.split(' ')[0])

  const trilhas = [
    {
      id: 'eu',
      icon: '✦',
      label: 'Para mim',
      sub: 'Receba um devocional para o seu momento'
    },
    {
      id: 'outro',
      icon: '♡',
      label: 'Para alguém que desejo abençoar',
      sub: 'Gere um devocional personalizado para enviar'
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 70% 0%, rgba(201,168,76,0.1) 0%, transparent 55%), var(--blue-dark)' }}>
      <Nav onHistory={onHistory} onLogout={onLogout} />
      <div style={{
        paddingTop: '80px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '520px',
          padding: '48px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '28px'
        }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', animation: 'fadeUp 0.4s ease both' }}>
            {getGreeting()}
          </p>

          <h1 style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(1.5rem, 4vw, 2.1rem)',
            fontWeight: 400,
            lineHeight: 1.35,
            animation: 'fadeUp 0.5s 0.05s ease both'
          }}>
            Olá, <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{firstName}</em>.<br />
            Descubra agora a palavra certa<br />
            para o que você está vivendo hoje.
          </h1>

          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginTop: '-8px', animation: 'fadeUp 0.5s 0.1s ease both' }}>
            Para quem você deseja a palavra neste momento?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', animation: 'fadeUp 0.5s 0.15s ease both' }}>
            {trilhas.map(t => (
              <button
                key={t.id}
                onClick={() => onTrilha(t.id)}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '16px',
                  padding: '22px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.2s',
                  color: 'var(--white)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.borderColor = 'var(--gold-border)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--card-bg)'
                  e.currentTarget.style.borderColor = 'var(--card-border)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span style={{ fontSize: '1.6rem', flexShrink: 0, color: 'var(--gold)' }}>{t.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', marginBottom: '3px' }}>{t.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
