import {
  AIProviderRequestError,
  type AIProvider,
  type AIProviderMessage,
} from './ai-provider'

type OpenAIChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null
    }
  }>
  error?: {
    message?: string
  }
}

const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions'
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini'

export class OpenAIProvider implements AIProvider {
  name = 'openai'

  private readonly apiKey = import.meta.env.VITE_OPENAI_API_KEY?.trim()
  private readonly model = import.meta.env.VITE_OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL

  async generateResponse(messages: AIProviderMessage[]): Promise<string> {
    // WARNING: VITE_OPENAI_API_KEY is only acceptable for local development.
    // Production should call a backend or Supabase Edge Function instead.
    if (!this.apiKey) {
      throw new AIProviderRequestError(this.name, 'OpenAI API key is missing. Set VITE_OPENAI_API_KEY for local development.')
    }

    const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
      }),
    })

    let payload: OpenAIChatCompletionResponse | null = null

    try {
      payload = (await response.json()) as OpenAIChatCompletionResponse
    } catch {
      payload = null
    }

    if (!response.ok) {
      throw new AIProviderRequestError(
        this.name,
        payload?.error?.message || `OpenAI request failed with status ${response.status}.`,
        response.status,
      )
    }

    const content = payload?.choices?.[0]?.message?.content?.trim()

    if (!content) {
      throw new AIProviderRequestError(this.name, 'OpenAI returned an empty response.', response.status)
    }

    return content
  }
}