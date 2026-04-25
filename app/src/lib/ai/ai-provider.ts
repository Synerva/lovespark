export type AIProviderMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type AIProvider = {
  name: string
  generateResponse(messages: AIProviderMessage[]): Promise<string>
}

export type AIDiagnostic = {
  providerAttempted: string
  errorMessage: string
  statusCode?: number
  timestamp: string
}

export const USER_SAFE_AI_ERROR_MESSAGE = "I'm having trouble connecting to the AI service right now. Please try again in a moment."

export class AIProviderRequestError extends Error {
  provider: string
  statusCode?: number

  constructor(provider: string, message: string, statusCode?: number) {
    super(message)
    this.name = 'AIProviderRequestError'
    this.provider = provider
    this.statusCode = statusCode
  }
}

export class AIProviderError extends Error {
  provider: string
  diagnostic: AIDiagnostic

  constructor(provider: string, diagnostic: AIDiagnostic) {
    super(USER_SAFE_AI_ERROR_MESSAGE)
    this.name = 'AIProviderError'
    this.provider = provider
    this.diagnostic = diagnostic
  }
}

export function isAIProviderError(error: unknown): error is AIProviderError {
  return error instanceof AIProviderError
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  return 'Unknown AI provider error'
}

export function extractStatusCode(error: unknown): number | undefined {
  if (error instanceof AIProviderRequestError) {
    if (typeof error.statusCode === 'number') {
      return error.statusCode
    }

    const messageMatch = error.message.match(/\b(\d{3})\b/)
    if (messageMatch) {
      return Number(messageMatch[1])
    }

    return error.statusCode
  }

  if (error instanceof Error) {
    const messageMatch = error.message.match(/\b(\d{3})\b/)
    if (messageMatch) {
      return Number(messageMatch[1])
    }
  }

  if (typeof error === 'string') {
    const messageMatch = error.match(/\b(\d{3})\b/)
    if (messageMatch) {
      return Number(messageMatch[1])
    }
  }

  if (error && typeof error === 'object') {
    const maybeStatus = (error as { status?: unknown }).status
    if (typeof maybeStatus === 'number') {
      return maybeStatus
    }

    const maybeStatusCode = (error as { statusCode?: unknown }).statusCode
    if (typeof maybeStatusCode === 'number') {
      return maybeStatusCode
    }
  }

  return undefined
}

export function createAIDiagnostic(providerAttempted: string, error: unknown): AIDiagnostic {
  return {
    providerAttempted,
    errorMessage: extractErrorMessage(error),
    statusCode: extractStatusCode(error),
    timestamp: new Date().toISOString(),
  }
}

export function getAIProviderUserMessage(diagnostic: AIDiagnostic): string {
  const statusCode = diagnostic.statusCode
  const normalizedMessage = diagnostic.errorMessage.toLowerCase()

  if (
    diagnostic.providerAttempted === 'spark' &&
    (normalizedMessage.includes('404') || normalizedMessage.includes('page could not be found') || normalizedMessage.includes('llm request failed'))
  ) {
    return 'Spark AI runtime is not available on Vercel. Set VITE_AI_PROVIDER=openai and OPENAI_API_KEY in Vercel.'
  }

  if (statusCode === 401 || statusCode === 403) {
    return 'Authentication with the AI provider failed. Verify your API key and provider permissions.'
  }

  if (statusCode === 429) {
    return 'The AI provider is rate-limiting requests right now. Please wait a moment and retry.'
  }

  if (statusCode && statusCode >= 500) {
    return 'The AI provider is temporarily unavailable. Please try again shortly.'
  }

  if (normalizedMessage.includes('missing') || normalizedMessage.includes('not configured')) {
    return 'AI provider configuration is missing. Set VITE_AI_PROVIDER=openai and OPENAI_API_KEY in Vercel.'
  }

  if (
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('network') ||
    normalizedMessage.includes('cors')
  ) {
    return 'Unable to reach the AI provider. Check your internet connection and provider network access settings.'
  }

  if (normalizedMessage.includes('spark runtime is unavailable')) {
    return 'Spark runtime is not available in this session. Switch provider to OpenAI or run inside Spark runtime.'
  }

  const sanitizedDetail = diagnostic.errorMessage
    .replace(/sk-[A-Za-z0-9_-]{8,}/g, 'sk-***')
    .replace(/\s+/g, ' ')
    .trim()

  if (sanitizedDetail && sanitizedDetail.toLowerCase() !== 'unknown ai provider error') {
    const detailSnippet = sanitizedDetail.slice(0, 180)
    return `AI request failed with ${diagnostic.providerAttempted}. ${detailSnippet}`
  }

  return `AI request failed with ${diagnostic.providerAttempted}. Please try again in a moment.`
}

export function formatMessagesAsPrompt(messages: AIProviderMessage[]): string {
  return messages
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join('\n\n')
}