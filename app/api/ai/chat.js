const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions'
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: { message: 'Method not allowed. Use POST.' } })
    return
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: { message: 'OPENAI_API_KEY is missing on the server. Configure it in Vercel project environment variables.' } })
    return
  }

  let body = {}
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
  } catch {
    res.status(400).json({ error: { message: 'Invalid JSON body.' } })
    return
  }

  const { messages, model } = body

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: { message: 'Invalid request body. `messages` must be a non-empty array.' } })
    return
  }

  try {
    const openAIResponse = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: typeof model === 'string' && model.trim() ? model.trim() : DEFAULT_OPENAI_MODEL,
        messages,
        temperature: 0.7,
      }),
    })

    const payload = await openAIResponse.json().catch(() => null)

    if (!openAIResponse.ok) {
      const providerMessage = payload?.error?.message || `OpenAI request failed with status ${openAIResponse.status}.`
      res.status(openAIResponse.status).json({ error: { message: providerMessage } })
      return
    }

    const content = payload?.choices?.[0]?.message?.content?.trim()
    if (!content) {
      res.status(502).json({ error: { message: 'OpenAI returned an empty response.' } })
      return
    }

    res.status(200).json({ content })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error while calling OpenAI.'
    res.status(500).json({ error: { message } })
  }
}
