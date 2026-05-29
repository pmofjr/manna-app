export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { prompt } = req.body;
  if (!prompt) { res.status(400).json({ error: 'Prompt required' }); return; }

  function isComplete(text) {
    if (!text) return false;
    const wordCount = text.split(/\s+/).length;
    const hasAbertura = /ABERTURA:/i.test(text);
    const hasVersiculo = /VERS[IÍ]CULO:/i.test(text);
    const hasReflexao = /REFLEX[AÃ]O:/i.test(text);
    const hasOracao = /ORA[CÇ][AÃ]O:/i.test(text);
    return wordCount >= 550 && hasAbertura && hasVersiculo && hasReflexao && hasOracao;
  }

  const strongPrompt = prompt + '\n\nATENÇÃO ABSOLUTA: Seu texto DEVE ter no mínimo 700 palavras. DEVE conter obrigatoriamente as seções ABERTURA:, VERSÍCULO:, REFERÊNCIA:, REFLEXÃO: e ORAÇÃO:. NÃO encurte o texto. NÃO pule nenhuma seção. Um devocional incompleto é inaceitável.';

  // Try sonnet first (more instruction-following), fallback to opus
  const models = ['claude-sonnet-4-6', 'claude-opus-4-8'];

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: model,
            max_tokens: 4000,
            messages: [{ role: 'user', content: strongPrompt }]
          })
        });

        const data = await response.json();

        if (!response.ok) {
          console.log(`Model ${model} not available, trying next...`);
          break; // try next model
        }

        const text = data.content[0].text;
        const wordCount = text.split(/\s+/).length;
        console.log(`Model ${model}, attempt ${attempt}: ${wordCount} words`);

        if (isComplete(text)) {
          res.status(200).json({ text, model, attempts: attempt });
          return;
        }

        console.log(`Incomplete, retrying...`);

      } catch (error) {
        console.error(`Error with ${model}:`, error.message);
        break;
      }
    }
  }

  res.status(500).json({ error: 'Could not generate complete devotional' });
}
