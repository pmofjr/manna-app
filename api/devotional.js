import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://eeetgtjyrijykejerxab.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZXRndGp5cmlqeWtlamVyeGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMzczMTksImV4cCI6MjA5NTYxMzMxOX0.1bSCP6_L5iPBgoSg_kqeq3zMfisIck49lYDNjK6t1dw'
)

export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.status(200).end(); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  const { firstName, emotion, cause, trilha, blessName, userEmail } = req.body
  if (!firstName || !emotion) { res.status(400).json({ error: 'Missing fields' }); return }

  const targetName = trilha === 'outro' ? blessName : firstName
  const isNeutral = emotion === 'Neutro(a)'
  const queixa = cause ? cause : null
  const emotionContext = isNeutral
    ? 'que está se sentindo neutro hoje'
    : `que está se sentindo ${emotion}${queixa ? `, descrevendo: "${queixa}"` : ''}`

  // Buscar últimos 5 versículos usados pela pessoa
  let versiculosRecentes = []
  if (userEmail) {
    try {
      const { data } = await supabase
        .from('devotionals')
        .select('referencia')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false })
        .limit(5)
      if (data && data.length > 0) {
        versiculosRecentes = data.map(d => d.referencia).filter(Boolean)
      }
    } catch (e) {
      console.error('Erro ao buscar histórico:', e)
    }
  }

  const historicoTexto = versiculosRecentes.length > 0
    ? `IMPORTANTE: Não use nenhum destes versículos que já foram usados recentemente para esta pessoa: ${versiculosRecentes.join(', ')}. Escolha um versículo diferente e menos óbvio.`
    : ''

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
    // PASSO 1 — Escolher o versículo base primeiro
    const versiculoRaw = await callClaude(`
Você é um pastor bíblico experiente com profundo conhecimento das Escrituras.
Escolha o versículo bíblico mais adequado e significativo para alguém ${emotionContext}.
Prefira versículos menos conhecidos e mais precisos ao contexto, evitando os óbvios e genéricos.
${historicoTexto}
Responda EXATAMENTE neste formato:
TEXTO: [versículo completo]
REFERENCIA: [ex: João 3:16]
    `)

    const versiculoMatch = versiculoRaw.match(/TEXTO:\s*([\s\S]*?)\nREFERENCIA:\s*(.+)/i)
    const versiculo = versiculoMatch ? versiculoMatch[1].trim() : versiculoRaw
    const referencia = versiculoMatch ? versiculoMatch[2].trim() : ''

    // PASSO 2 — Gerar abertura, reflexão e oração com base no versículo escolhido
    const contextoCompleto = `
Versículo base: "${versiculo}" (${referencia})
Pessoa: ${targetName}, ${emotionContext}
${queixa ? `Queixa/situação descrita: "${queixa}"` : ''}
    `.trim()

    const [abertura, reflexao, oracao] = await Promise.all([

      callClaude(`
Você é um escritor cristão com a sensibilidade de um pastor acolhedor.
Com base no versículo "${versiculo}" (${referencia}), escreva a abertura de um devocional para alguém ${emotionContext}.
Use o nome ${targetName} apenas no início, de forma calorosa. Depois conduza o texto sem repetir o nome.
5 linhas empáticas, acolhedoras e poéticas. Sem títulos. Apenas o texto.
      `),

      callClaude(`
Você é um escritor cristão com a profundidade teológica de um pastor experiente.
Escreva a reflexão de um devocional baseada no versículo "${versiculo}" (${referencia}) para alguém ${emotionContext}.
${queixa ? `A pessoa descreveu sua situação como: "${queixa}". Use isso para tornar o texto mais preciso e tocante.` : ''}
EXATAMENTE 4 parágrafos separados por linha em branco, cada um com mínimo 5 linhas:
Parágrafo 1: contexto histórico e profundidade do versículo
Parágrafo 2: conexão precisa com a realidade e o sentimento da pessoa
Parágrafo 3: insight transformador baseado no versículo
Parágrafo 4: encorajamento final poético e esperançoso
Use o nome ${targetName} no máximo uma vez. Escreva como um ser humano sensível, não como uma IA.
Sem títulos. Apenas os parágrafos.
      `),

      callClaude(`
Você é um escritor cristão com a sensibilidade de um pastor em oração.
Escreva a oração final baseada no versículo "${versiculo}" (${referencia}) para alguém ${emotionContext}.
${queixa ? `A pessoa descreveu sua situação como: "${queixa}". A oração deve tocar diretamente nessa dor.` : ''}
6 linhas em primeira pessoa, vulnerável, sincera e específica ao contexto.
Termine com "Amém." Sem títulos. Apenas o texto da oração.
      `)
    ])

    res.status(200).json({ abertura, versiculo, referencia, reflexao, oracao })

  } catch (error) {
    console.error('Error:', error.message)
    res.status(500).json({ error: error.message })
  }
}
