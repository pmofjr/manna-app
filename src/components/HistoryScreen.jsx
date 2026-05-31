import Nav from './Nav'

export default function HistoryScreen({ history, onOpen, onBack, onLogout }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--blue-dark)', paddingTop: '80px' }}>
      <Nav onHistory={() => {}} onLogout={onLogout} />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '680px', padding: '40px 24px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              fontSize: '0.85rem', fontFamily: 'var(--sans)',
              marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            ← Voltar
          </button>

          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', fontWeight: 400, marginBottom: '8px' }}>
            Meu Histórico
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
            Suas palavras anteriores, sempre disponíveis.
          </p>

          {history.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '48px 0', fontSize: '0.9rem' }}>
              Você ainda não tem devocionais salvos.<br />Gere o seu primeiro agora!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map(entry => {
                const dateStr = new Date(entry.date).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })
                return (
                  <button
                    key={entry.id}
                    onClick={() => onOpen(entry)}
                    style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '14px',
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      color: 'var(--white)',
                      width: '100%'
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
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        {dateStr}
                      </div>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: '1rem' }}>
                        {entry.emotion}{entry.cause ? ` · ${entry.cause}` : ''}
                      </div>
                    </div>
                    <span style={{ color: 'var(--gold)', fontSize: '1rem' }}>→</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
