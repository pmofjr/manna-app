export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.status(200).end(); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  const { firstName, emotion, cause, trilha, blessName } = req.body
  if (!firstName || !emotion) { res.status(400).json({ error: 'Missing fields' }); return }

  const targetName = trilha === 'outro' ? blessName : firstName
  const isNeutral = emotion === 'Neutro(a)'
  const causeText = cause ? ` por causa de ${cause}` : ''
  const emotionContext = isNeutral ? 'que está se sentindo neutro hoje' : `que está se sentindo ${emotion}${causeText}`

  async function callClaude(prompt) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'API error')
    return data.content[0].text.trim()
  }

  try {
    const [abertura, versiculoRaw, reflexao, oracao] = await Promise.all([
      callClaude(`Escritor cristão estilo Deive Leonardo. Escreva APENAS a abertura de um devocional para ${targetName}, ${emotionContext}. 5 linhas empáticas e acolhedoras. Comece com: "${targetName}, esta é a palavra de Deus para você hoje." Apenas o texto, sem títulos.`),
      callClaude(`Indique o versículo bíblico mais adequado para alguém ${emotionContext}. Responda EXATAMENTE assim:\nTEXTO: [versículo completo]\nREFERENCIA: [ex: João 3:16]`),
      callClaude(`Escritor cristão estilo Deive Leonardo. Escreva APENAS a reflexão de um devocional para ${targetName}, ${emotionContext}. EXATAMENTE 4 parágrafos separados por linha em branco, cada um com mínimo 5 linhas. Parágrafo 1: contexto histórico do versículo. Parágrafo 2: conexão com a realidade de ${targetName}. Parágrafo 3: insight transformador. Parágrafo 4: encorajamento final. Apenas os parágrafos, sem títulos.`),
      callClaude(`Escritor cristão estilo Deive Leonardo. Escreva APENAS a oração final para ${targetName}, ${emotionContext}. 6 linhas em primeira pessoa, vulnerável e sincera. Termine com "Amém." Apenas o texto da oração.`)
    ])

    const versiculoMatch = versiculoRaw.match(/TEXTO:\s*([\s\S]*?)\nREFERENCIA:\s*(.+)/i)
    const versiculo = versiculoMatch ? versiculoMatch[1].trim() : versiculoRaw
    const referencia = versiculoMatch ? versiculoMatch[2].trim() : ''

    res.status(200).json({ abertura, versiculo, referencia, reflexao, oracao })
  } catch (error) {
    console.error('Error:', error.message)
    res.status(500).json({ error: error.message })
  }
}
