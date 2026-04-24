/// <reference types="vite/client" />
declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string

interface ImportMetaEnv {
	readonly VITE_AI_PROVIDER?: 'openai' | 'spark'
	readonly VITE_OPENAI_API_KEY?: string
	readonly VITE_OPENAI_MODEL?: string
	readonly VITE_SUPABASE_URL?: string
	readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

interface Window {
	spark?: {
		llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
		llm: (prompt: string, model?: string, jsonMode?: boolean) => Promise<string>
		kv?: {
			get: <T>(key: string) => Promise<T | null>
			set: <T>(key: string, value: T) => Promise<void>
			delete?: (key: string) => Promise<void>
		}
		user?: unknown
	}
}