import { useState } from 'react'
import Nav from './Nav'
import { shareOrDownloadPDF } from '../lib/pdf'

export default function DevocionalScreen({ devo, trilha, onNew, onHistory, onLogout }) {
  const [pdfLoading, setPdfLoading] = useState(false)

  const dateStr = new Date(devo.date).toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  async function handlePDF() {
    setPdfLoading(true)
    try {
      await shareOrDownloadPDF(devo)
    } catch (e) {
      console.error('PDF error:', e)
    }
    setPdfLoading(false)
  }

  const paragraphs = devo.reflexao ? devo.reflexao.split(/\n\n+/).filter(p => p.trim()) : []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--blue-dark)', paddingTop: '80px' }}>
      <Nav onHistory={onHistory} onLogout={onLogout} />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '680px', padding: '40px 24px 80px' }}>

          {/* Meta */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
            flexWrap: 'wrap',
            gap: '12px',
            animation: 'fadeUp 0.4s ease both'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {dateStr}
            </span>
            {devo.emotion && (
              <span style={{
                background: 'rgba(201,168,76,0.12)',
                border: '1px solid var(--gold-border)',
                color: 'var(--gold-light)',
                fontSize: '0.75rem',
                padding: '4px 14px',
                borderRadius: '50px'
              }}>
                {devo.emotion}{devo.cause ? ` · ${devo.cause}` : ''}
              </span>
            )}
          </div>

          {/* Content card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--card-border)',
            borderRadius: '20px',
            padding: '40px 36px',
            animation: 'fadeUp 0.5s 0.05s ease both'
          }}>
            {/* Greeting */}
            <p style={{
              fontFamily: 'var(--serif)',
              fontSize: '1.1rem',
              color: 'var(--gold-light)',
              fontStyle: 'italic',
              marginBottom: '24px',
              lineHeight: 1.5
            }}>
              {devo.firstName}, esta é a palavra de Deus para você hoje.
            </p>

            {/* Abertura */}
            {devo.abertura && (
              <div style={{ fontSize: '1rem', lineHeight: 1.9, color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>
                {devo.abertura.split('\n').map((line, i) => (
                  <p key={i} style={{ marginBottom: '8px' }}>{line}</p>
                ))}
              </div>
            )}

            {/* Versículo */}
            {devo.versiculo && (
              <div style={{
                background: 'rgba(201,168,76,0.08)',
                borderLeft: '3px solid var(--gold)',
                borderRadius: '0 12px 12px 0',
                padding: '22px 24px',
                margin: '28px 0'
              }}>
                <p style={{
                  fontFamily: 'var(--serif)',
                  fontSize: '1.1rem',
                  fontStyle: 'italic',
                  color: 'var(--gold-light)',
                  lineHeight: 1.65,
                  marginBottom: '10px'
                }}>
                  "{devo.versiculo}"
                </p>
                {devo.referencia && (
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--gold)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 500
                  }}>
                    {devo.referencia}
                  </p>
                )}
              </div>
            )}

            {/* Reflexão */}
            {paragraphs.length > 0 && (
              <div style={{ fontSize: '1rem', lineHeight: 1.9, color: 'rgba(255,255,255,0.85)' }}>
                {paragraphs.map((para, i) => (
                  <p key={i} style={{ marginBottom: '20px' }}>{para}</p>
                ))}
              </div>
            )}

            {/* Oração */}
            {devo.oracao && (
              <div style={{
                background: 'rgba(28,53,87,0.5)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px',
                padding: '26px',
                marginTop: '28px'
              }}>
                <p style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--gold)',
                  marginBottom: '14px',
                  fontWeight: 500
                }}>
                  Oração
                </p>
                <p style={{
                  fontFamily: 'var(--serif)',
                  fontSize: '1rem',
                  fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.78)',
                  lineHeight: 1.75
                }}>
                  {devo.oracao}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '28px', flexWrap: 'wrap', animation: 'fadeUp 0.5s 0.1s ease both' }}>
            <button
              className="btn-primary"
              onClick={handlePDF}
              disabled={pdfLoading}
            >
              {pdfLoading ? 'Gerando...' : 'Gerar PDF e Compartilhar'}
            </button>
            <button className="btn-ghost" onClick={onNew}>
              Nova palavra
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
