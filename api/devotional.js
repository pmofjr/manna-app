export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { firstName, emotion, cause, trilha, blessName } = req.body;
  if (!firstName || !emotion) { res.status(400).json({ error: 'Missing required fields' }); return; }

  const MODEL = 'claude-sonnet-4-6';
  const isNeutral = emotion === 'Neutro(a)';
  const isBless = trilha === 'outro';
  const targetName = isBless ? blessName : firstName;
  const causeText = cause ? ` por causa de ${cause}` : '';
  const emotionContext = isNeutral
    ? `que está se sentindo neutro hoje`
    : `que está se sentindo ${emotion}${causeText}`;

  async function callClaude(prompt) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'API error');
    return data.content[0].text.trim();
  }

  try {
    // === CALL 1: ABERTURA ===
    const abertura = await callClaude(
      `Você é um escritor cristão no estilo de Deive Leonardo. Escreva APENAS a abertura de um devocional para ${targetName}, ${emotionContext}. 
      
      A abertura deve ter exatamente 5 linhas. Deve ser empática, acolhedora, vulnerável e fazer ${targetName} sentir-se completamente compreendido(a). Fale diretamente com ${targetName} sobre o que ele/ela está sentindo. Seja específico sobre a dor ou alegria.
      
      Comece com: "${targetName}, esta é a palavra de Deus para você hoje."
      
      Escreva APENAS o texto da abertura, sem títulos ou marcações.`
    );

    // === CALL 2: VERSÍCULO ===
    const versiculoRaw = await callClaude(
      `Indique o versículo bíblico mais adequado para alguém que está ${emotionContext}. 
      
      Responda EXATAMENTE neste formato:
      TEXTO: [versículo completo aqui]
      REFERENCIA: [ex: João 3:16]
      
      O versículo deve ser completo, longo e profundamente adequado ao momento emocional. Use português brasileiro.`
    );

    const versiculoMatch = versiculoRaw.match(/TEXTO:\s*([\s\S]*?)\nREFERENCIA:\s*(.+)/i);
    const versiculo = versiculoMatch ? versiculoMatch[1].trim() : versiculoRaw;
    const referencia = versiculoMatch ? versiculoMatch[2].trim() : '';

    // === CALL 3: REFLEXÃO ===
    const reflexao = await callClaude(
      `Você é um escritor cristão no estilo de Deive Leonardo. Escreva APENAS a reflexão de um devocional para ${targetName}, ${emotionContext}, baseada no versículo: "${versiculo}" (${referencia}).

      Escreva EXATAMENTE 4 parágrafos separados por linha em branco. Cada parágrafo deve ter no mínimo 5 linhas.
      
      Parágrafo 1: Contexto histórico/bíblico do versículo de forma profunda e interessante
      Parágrafo 2: Conexão direta com a realidade emocional de ${targetName} hoje
      Parágrafo 3: Um insight transformador e prático para ${targetName}
      Parágrafo 4: Encorajamento final profundo e esperançoso
      
      Escreva APENAS os 4 parágrafos, sem títulos ou marcações. Português brasileiro correto.`
    );

    // === CALL 4: ORAÇÃO ===
    const oracao = await callClaude(
      `Você é um escritor cristão no estilo de Deive Leonardo. Escreva APENAS a oração final de um devocional para ${targetName}, ${emotionContext}.
      
      A oração deve:
      - Estar em primeira pessoa (como se ${targetName} estivesse orando)
      - Ter exatamente 6 linhas
      - Ser vulnerável, sincera e específica para o momento emocional
      - Terminar com "Amém."
      
      Escreva APENAS o texto da oração, sem títulos ou marcações. Português brasileiro correto.`
    );

    res.status(200).json({
      abertura,
      versiculo,
      referencia,
      reflexao,
      oracao
    });

  } catch (error) {
    console.error('Error generating devotional:', error.message);
    res.status(500).json({ error: error.message });
  }
}
