/// <reference types="vite/client" />
declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string

interface ImportMetaEnv {
	readonly VITE_PUBLIC_SITE_URL?: string
	readonly VITE_PUBLIC_APP_URL?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}