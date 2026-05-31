import Logo from './Logo'

export default function Nav({ onHistory, onLogout }) {
  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 5%',
      background: 'rgba(15,30,46,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(201,168,76,0.12)'
    }}>
      <Logo height={32} />
      <div style={{ display: 'flex', gap: '20px' }}>
        <button
          onClick={onHistory}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
            fontSize: '0.82rem', fontFamily: 'var(--sans)',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.target.style.color = 'var(--gold)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        >
          Histórico
        </button>
        <button
          onClick={onLogout}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
            fontSize: '0.82rem', fontFamily: 'var(--sans)',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.target.style.color = 'var(--gold)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        >
          Sair
        </button>
      </div>
    </nav>
  )
}
