import {
  AIProviderRequestError,
  type AIProvider,
  type AIProviderMessage,
} from './ai-provider'

type OpenAIChatCompletionResponse = {
  content?: string
  error?: {
    message?: string
  }
}

const OPENAI_CHAT_COMPLETIONS_URL = '/api/ai/chat'
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini'

export class OpenAIProvider implements AIProvider {
  name = 'openai'

  private readonly model = import.meta.env.VITE_OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL

  async generateResponse(messages: AIProviderMessage[]): Promise<string> {
    const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
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
        payload?.error?.message || `OpenAI API route failed with status ${response.status}.`,
        response.status,
      )
    }

    const content = payload?.content?.trim()

    if (!content) {
      throw new AIProviderRequestError(this.name, 'OpenAI API route returned an empty response.', response.status)
    }

    return content
  }
}