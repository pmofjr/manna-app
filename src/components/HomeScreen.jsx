import { useState, useEffect } from 'react'
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
  const [showInstall, setShowInstall] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Verifica se já está instalado como PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true
    if (!isStandalone) {
      setShowInstall(true)
      setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
    }
  }, [])

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

          {/* Banner de instalação PWA */}
          {showInstall && (
            <div style={{
              width: '100%',
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: '14px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              animation: 'fadeUp 0.5s 0.2s ease both'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.3rem' }}>📲</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--gold-light)' }}>Instale o Manna</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Acesse direto da tela inicial</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => setShowInstructions(true)}
                  style={{
                    background: 'var(--gold)',
                    color: 'var(--blue-dark)',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '8px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--sans)'
                  }}
                >
                  Como fazer
                </button>
                <button
                  onClick={() => setShowInstall(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '4px'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de instruções */}
      {showInstructions && (
        <div
          onClick={() => setShowInstructions(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            zIndex: 1000, padding: '24px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#141B24',
              border: '1px solid var(--card-border)',
              borderRadius: '20px',
              padding: '32px 28px',
              width: '100%',
              maxWidth: '480px',
              animation: 'fadeUp 0.3s ease both'
            }}
          >
            <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '1.4rem', marginBottom: '8px' }}>
              Instalar o Manna
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Adicione o Manna à tela inicial do seu celular para acessar sem abrir o navegador.
            </p>

            {/* Android */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
                📱 Android (Chrome)
              </div>
              {['Abra o Manna no Chrome', 'Toque nos 3 pontinhos (⋮) no canto superior direito', 'Selecione "Adicionar à tela inicial" ou "Instalar app"', 'Confirme tocando em "Adicionar"'].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '22px', height: '22px', minWidth: '22px',
                    background: 'rgba(201,168,76,0.15)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 600
                  }}>{i + 1}</div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{step}</span>
                </div>
              ))}
            </div>

            {/* iPhone */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
                🍎 iPhone (Safari)
              </div>
              {['Abra o Manna no Safari (obrigatório)', 'Toque no botão de compartilhar (□↑) na barra inferior', 'Role a lista e toque em "Adicionar à Tela de Início"', 'Confirme tocando em "Adicionar"'].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '22px', height: '22px', minWidth: '22px',
                    background: 'rgba(201,168,76,0.15)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 600
                  }}>{i + 1}</div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{step}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
