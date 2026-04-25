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

function getHostname(): string {
  return window.location.hostname.toLowerCase()
}

function isVercelProductionHost(hostname: string): boolean {
  return hostname === 'lovespark-app.synerva.tech' || hostname.endsWith('.vercel.app')
}

function isSparkRuntimeSession(hostname: string): boolean {
  if (!window.spark?.llm) {
    return false
  }

  // Spark runtime injects these globals; Vercel deployments should not have them.
  const hasSparkRuntimeGlobal = Boolean((globalThis as { GITHUB_RUNTIME_PERMANENT_NAME?: string }).GITHUB_RUNTIME_PERMANENT_NAME)
  const hasSparkKvGlobal = Boolean((globalThis as { BASE_KV_SERVICE_URL?: string }).BASE_KV_SERVICE_URL)

  return !isVercelProductionHost(hostname) && (hasSparkRuntimeGlobal || hasSparkKvGlobal)
}

function getConfiguredAIProvider(): ConfiguredAIProvider | null {
  const provider = import.meta.env.VITE_AI_PROVIDER?.trim().toLowerCase()
  const hostname = getHostname()

  if (provider === 'openai' || provider === 'spark') {
    return provider
  }

  if (isVercelProductionHost(hostname)) {
    return 'openai'
  }

  if (isSparkRuntimeSession(hostname)) {
    return 'spark'
  }

  return 'openai'
}

function createProvider(provider: ConfiguredAIProvider): AIProvider {
  if (provider === 'openai') {
    return new OpenAIProvider()
  }

  return new SparkProvider()
}

export function getAIProviderStatus(): AIProviderStatus {
  return {
    configuredProvider: getConfiguredAIProvider(),
    env: {
      hasProvider: Boolean(import.meta.env.VITE_AI_PROVIDER),
      hasOpenAIModel: Boolean(import.meta.env.VITE_OPENAI_MODEL),
      hasOpenAIKey: false,
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

  const provider = createProvider(configuredProvider)

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