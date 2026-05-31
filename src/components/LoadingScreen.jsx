import WheatIcon from './WheatIcon'

export default function LoadingScreen({ message }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.1) 0%, transparent 60%), var(--blue-dark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
          <WheatIcon size={64} animated />
        </div>
        <p style={{
          fontFamily: 'var(--serif)',
          fontSize: '1.5rem',
          fontStyle: 'italic',
          marginBottom: '12px',
          lineHeight: 1.5,
          animation: 'fadeIn 0.5s ease both'
        }}>
          {message || 'Estamos preparando uma palavra personalizada para o seu momento…'}
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '40px' }}>
          Isso pode levar alguns segundos
        </p>
        <div style={{
          width: '100%',
          height: '2px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--gold), var(--gold-light))',
            borderRadius: '2px',
            animation: 'loadbar 30s linear forwards'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: 'var(--gold)',
              animation: `pulse 1.4s ${i * 0.2}s ease-in-out infinite`
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
