import { useState } from 'react'
import Nav from './Nav'

const EMOTIONS = [
  { id: 'Triste', negative: true },
  { id: 'Ansioso(a)', negative: true },
  { id: 'Desanimado(a)', negative: true },
  { id: 'Confuso(a)', negative: true },
  { id: 'Com medo', negative: true },
  { id: 'Sobrecarregado(a)', negative: true },
  { id: 'Feliz', negative: false },
  { id: 'Grato(a)', negative: false },
  { id: 'Em paz', negative: false },
  { id: 'Neutro(a)', negative: false }
]

const CAUSES = [
  { id: 'Trabalho e Finanças', icon: '$' },
  { id: 'Família', icon: '♡' },
  { id: 'Saúde', icon: '+' },
  { id: 'Uma decisão importante', icon: '?' },
  { id: 'O futuro', icon: '→' },
  { id: 'Algo que não consigo explicar', icon: '…' }
]

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''
}

export default function FlowScreen({ trilha, user, onGenerate, onBack, onHistory, onLogout }) {
  const [step, setStep] = useState(trilha === 'outro' ? 'bless-name' : 'emotion')
  const [blessName, setBlessName] = useState('')
  const [emotion, setEmotion] = useState(null)

  function handleBlessNext() {
    if (blessName.trim().length >= 2) setStep('emotion')
  }

  function handleEmotion(em) {
    setEmotion(em)
    if (em.negative) {
      setStep('cause')
    } else {
      onGenerate({ emotion: em.id, cause: null, blessName: blessName.trim() || null })
    }
  }

  function handleCause(cause) {
    onGenerate({ emotion: emotion.id, cause, blessName: blessName.trim() || null })
  }

  const targetFirstName = trilha === 'outro' ? capitalize(blessName.split(' ')[0]) : capitalize(user.name.split(' ')[0])

  const containerStyle = {
    minHeight: '100vh',
    background: 'var(--blue-dark)',
    paddingTop: '80px',
    display: 'flex',
    justifyContent: 'center'
  }

  const innerStyle = {
    width: '100%',
    maxWidth: '520px',
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  }

  const backBtn = (onClick) => (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: 'none',
        color: 'var(--text-muted)', cursor: 'pointer',
        fontSize: '0.85rem', fontFamily: 'var(--sans)',
        display: 'flex', alignItems: 'center', gap: '6px',
        alignSelf: 'flex-start', padding: '4px 0',
        transition: 'color 0.2s'
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
    >
      ← Voltar
    </button>
  )

  const stepTitle = (html) => (
    <h2 style={{
      fontFamily: 'var(--serif)',
      fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
      fontWeight: 400,
      lineHeight: 1.3,
      animation: 'fadeUp 0.4s ease both'
    }} dangerouslySetInnerHTML={{ __html: html }} />
  )

  // BLESS NAME
  if (step === 'bless-name') return (
    <div style={containerStyle}>
      <Nav onHistory={onHistory} onLogout={onLogout} />
      <div style={innerStyle}>
        {backBtn(onBack)}
        {stepTitle('Ok. Qual o nome de quem<br/>será <em style="font-style:italic;color:var(--gold)">abençoado</em>?')}
        <input
          className="input"
          type="text"
          placeholder="Nome da pessoa..."
          value={blessName}
          onChange={e => setBlessName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleBlessNext()}
          style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem' }}
          autoFocus
        />
        <button
          className="btn-primary"
          disabled={blessName.trim().length < 2}
          onClick={handleBlessNext}
          style={{ alignSelf: 'flex-start' }}
        >
          Continuar →
        </button>
      </div>
    </div>
  )

  // EMOTION
  if (step === 'emotion') return (
    <div style={containerStyle}>
      <Nav onHistory={onHistory} onLogout={onLogout} />
      <div style={innerStyle}>
        {backBtn(() => trilha === 'outro' ? setStep('bless-name') : onBack())}
        {stepTitle(
          trilha === 'outro'
            ? `Como você acredita que <em style="font-style:italic;color:var(--gold)">${targetFirstName}</em><br/>esteja se sentindo agora?`
            : `Ok. Como você está<br/>se sentindo <em style="font-style:italic;color:var(--gold)">hoje</em>?`
        )}
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '-8px' }}>
          {trilha !== 'outro' && 'Não existe resposta certa. Apenas seja sincero.'}
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          animation: 'fadeUp 0.4s 0.05s ease both'
        }}>
          {EMOTIONS.map(em => (
            <button
              key={em.id}
              onClick={() => handleEmotion(em)}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '14px',
                padding: '20px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
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
              <div style={{
                width: '40px', height: '40px',
                borderRadius: '50%',
                background: 'rgba(201,168,76,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--serif)',
                fontSize: '1.1rem',
                color: 'var(--gold)',
                fontWeight: 600
              }}>
                {em.id.charAt(0)}
              </div>
              <span style={{ fontFamily: 'var(--serif)', fontSize: '0.95rem' }}>{em.id}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // CAUSE
  if (step === 'cause') return (
    <div style={containerStyle}>
      <Nav onHistory={onHistory} onLogout={onLogout} />
      <div style={innerStyle}>
        {backBtn(() => setStep('emotion'))}
        {stepTitle(
          trilha === 'outro'
            ? `O que parece deixar<br/><em style="font-style:italic;color:var(--gold)">${targetFirstName}</em> assim?`
            : `O que vem deixando<br/>você <em style="font-style:italic;color:var(--gold)">assim</em>?`
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'fadeUp 0.4s 0.05s ease both' }}>
          {CAUSES.map(c => (
            <button
              key={c.id}
              onClick={() => handleCause(c.id)}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '14px',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s',
                color: 'var(--white)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = 'var(--gold-border)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--card-bg)'
                e.currentTarget.style.borderColor = 'var(--card-border)'
              }}
            >
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '50%',
                background: 'rgba(201,168,76,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--gold)',
                fontFamily: 'var(--serif)',
                fontWeight: 600,
                fontSize: '1rem',
                flexShrink: 0
              }}>
                {c.icon}
              </div>
              <span style={{ fontFamily: 'var(--serif)', fontSize: '1rem' }}>{c.id}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return null
}
