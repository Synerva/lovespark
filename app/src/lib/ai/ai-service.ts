import {
  AIProviderError,
  createAIDiagnostic,
  type AIProvider,
  type AIProviderMessage,
} from './ai-provider'
import { OpenAIProvider } from './openai-provider'
import { SparkProvider } from './spark-provider'

export type ConfiguredAIProvider = 'openai' | 'spark'

export type AIProviderStatus = {
  configuredProvider: string | null
  env: {
    hasProvider: boolean
    hasOpenAIModel: boolean
    hasOpenAIKey: boolean
  }
  sparkRuntimeAvailable: boolean
}

export type AIDiagnosticResult =
  | ({ ok: true; provider: string; response: string } & AIProviderStatus)
  | ({ ok: false; provider: string | null; error: string; statusCode?: number } & AIProviderStatus)

export const LOVESPARK_CHAT_SYSTEM_PROMPT = `You are LoveSpark AI, an empathetic relationship intelligence and coaching assistant.
You help users understand relationship dynamics, improve communication, reflect clearly, and navigate conflict.
Do not give generic advice.
Be warm, nuanced, emotionally intelligent, practical, and concise.
Avoid blame, manipulation, diagnosis, or acting like a licensed therapist.
When confidence is low, ask one gentle clarifying question.
Always give one practical next step when appropriate.`

function getConfiguredAIProvider(): ConfiguredAIProvider | null {
  const provider = import.meta.env.VITE_AI_PROVIDER?.trim().toLowerCase()

  if (provider === 'openai' || provider === 'spark') {
    return provider
  }

  return null
}

function createProvider(provider: ConfiguredAIProvider): AIProvider {
  if (provider === 'openai') {
    return new OpenAIProvider()
  }

  return new SparkProvider()
}

function resolveProviderWithFallback(configuredProvider: ConfiguredAIProvider): ConfiguredAIProvider {
  const hasOpenAIKey = Boolean(import.meta.env.VITE_OPENAI_API_KEY?.trim())
  const sparkRuntimeAvailable = Boolean(window.spark?.llm)

  if (configuredProvider === 'openai' && !hasOpenAIKey && sparkRuntimeAvailable) {
    console.warn('[AI] Falling back to Spark provider because OpenAI is configured without an API key.')
    return 'spark'
  }

  return configuredProvider
}

export function getAIProviderStatus(): AIProviderStatus {
  return {
    configuredProvider: getConfiguredAIProvider(),
    env: {
      hasProvider: Boolean(import.meta.env.VITE_AI_PROVIDER),
      hasOpenAIModel: Boolean(import.meta.env.VITE_OPENAI_MODEL),
      hasOpenAIKey: Boolean(import.meta.env.VITE_OPENAI_API_KEY),
    },
    sparkRuntimeAvailable: Boolean(window.spark?.llm),
  }
}

export async function generateAIResponse(messages: AIProviderMessage[]): Promise<string> {
  const configuredProvider = getConfiguredAIProvider()

  if (!configuredProvider) {
    const diagnostic = createAIDiagnostic('unconfigured', 'AI provider is not configured. Set VITE_AI_PROVIDER to openai or spark.')
    console.error('[AI] Provider request failed', diagnostic)
    throw new AIProviderError('unconfigured', diagnostic)
  }

  const resolvedProvider = resolveProviderWithFallback(configuredProvider)
  const provider = createProvider(resolvedProvider)

  try {
    return await provider.generateResponse(messages)
  } catch (error) {
    const diagnostic = createAIDiagnostic(provider.name, error)
    console.error('[AI] Provider request failed', diagnostic)
    throw new AIProviderError(provider.name, diagnostic)
  }
}

export async function runAIDiagnostic(): Promise<AIDiagnosticResult> {
  const status = getAIProviderStatus()
  const configuredProvider = status.configuredProvider

  if (!configuredProvider) {
    return {
      ok: false,
      provider: null,
      error: 'AI provider is not configured.',
      ...status,
    }
  }

  try {
    const response = await generateAIResponse([
      { role: 'system', content: LOVESPARK_CHAT_SYSTEM_PROMPT },
      { role: 'user', content: 'Say hello from LoveSpark AI in two warm sentences.' },
    ])

    return {
      ok: true,
      provider: configuredProvider,
      response,
      ...status,
    }
  } catch (error) {
    if (error instanceof AIProviderError) {
      return {
        ok: false,
        provider: error.provider,
        error: error.diagnostic.errorMessage,
        statusCode: error.diagnostic.statusCode,
        ...status,
      }
    }

    return {
      ok: false,
      provider: configuredProvider,
      error: error instanceof Error ? error.message : 'Unknown AI diagnostic error.',
      ...status,
    }
  }
}