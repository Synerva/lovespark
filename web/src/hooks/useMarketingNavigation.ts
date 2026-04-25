import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { AppView } from '@/App'

function resolveAppUrl() {
  const configuredUrl = (import.meta.env.VITE_APP_URL as string | undefined)?.trim()
  if (configuredUrl) return configuredUrl

  if (typeof window === 'undefined') {
    return 'http://localhost:5173'
  }

  // In local split-project dev, default the app to the opposite common Vite port.
  const { protocol, hostname, port } = window.location
  const fallbackPort = port === '5173' ? '5174' : '5173'
  return `${protocol}//${hostname}:${fallbackPort}`
}

const APP_URL = resolveAppUrl()

async function canReachAppUrl(url: string): Promise<boolean> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 1200)

  try {
    await fetch(url, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    })
    return true
  } catch {
    return false
  } finally {
    window.clearTimeout(timeoutId)
  }
}

const marketingPaths: Partial<Record<AppView, string>> = {
  landing: '/',
  about: '/about',
  pricing: '/pricing',
  contact: '/contact',
}

export function useMarketingNavigation() {
  const navigate = useNavigate()

  return (view: AppView) => {
    const path = marketingPaths[view]
    if (path) {
      navigate(path)
      return
    }

    void (async () => {
      if (import.meta.env.DEV) {
        const reachable = await canReachAppUrl(APP_URL)
        if (!reachable) {
          toast.error(`App server is not reachable at ${APP_URL}. Start it with: cd app && npm run dev`)
          return
        }
      }

      if (!import.meta.env.VITE_APP_URL && !import.meta.env.DEV) {
        console.warn('VITE_APP_URL is not set. Redirecting using fallback URL:', APP_URL)
      }
      window.location.href = APP_URL
    })()
  }
}
