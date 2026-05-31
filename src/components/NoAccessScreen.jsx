import WheatIcon from './WheatIcon'

export default function NoAccessScreen({ onLogout }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--blue-dark)',
      padding: '40px 24px',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '400px', animation: 'fadeUp 0.5s ease both' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <WheatIcon size={60} />
        </div>
        <h2 style={{
          fontFamily: 'var(--serif)',
          fontSize: '1.8rem',
          fontWeight: 400,
          marginBottom: '16px',
          lineHeight: 1.3
        }}>
          Você ainda não tem uma assinatura ativa
        </h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '32px' }}>
          Para receber sua palavra diária personalizada, escolha um dos planos do Manna. Acesso imediato após o pagamento.
        </p>
        <a
          href="https://appmanna.com"
          target="_blank"
          rel="noreferrer"
          className="btn-primary"
          style={{ display: 'inline-flex', marginBottom: '16px' }}
        >
          Ver planos e assinar
        </a>
        <br />
        <button
          onClick={onLogout}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontFamily: 'var(--sans)',
            fontSize: '0.82rem',
            marginTop: '8px'
          }}
        >
          Sair
        </button>
      </div>
    </div>
  )
}
