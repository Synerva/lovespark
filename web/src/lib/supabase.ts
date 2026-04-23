import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Log environment configuration for debugging
if (typeof window !== 'undefined') {
  console.log('[Supabase] Configuration status:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseAnonKey?.length || 0,
  })
}

let supabaseInstance: any = null
let initError: Error | null = null

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = []
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL')
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY')
  
  initError = new Error(
    `Supabase not configured. Missing: ${missingVars.join(', ')}.\n` +
    'Add these variables to your .env.local file:\n' +
    'VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=your-anon-key-here'
  )
  
  if (typeof window !== 'undefined') {
    console.error('[Supabase] Initialization error:', initError.message)
  }
} else {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
    console.log('[Supabase] Client initialized successfully')
  } catch (error) {
    initError = error instanceof Error ? error : new Error('Failed to initialize Supabase')
    console.error('[Supabase] Initialization failed:', initError.message)
  }
}

export const supabase = supabaseInstance
export const supabaseInitError = initError
