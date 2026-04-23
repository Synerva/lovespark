import type { AuthUser } from './types'
import { supabase, supabaseInitError } from './supabase'

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface LoginData {
  email: string
  password: string
}

export interface SocialAuthData {
  email: string
  name: string
  provider: 'google' | 'github'
  providerId: string
  avatarUrl?: string
}

class AuthService {
  private readonly SESSION_KEY = 'lovespark-auth-session'

  constructor() {
    if (!supabase) {
      console.warn('[AuthService] Supabase not initialized:', supabaseInitError?.message)
      return
    }

    // Listen for auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthService] Auth state changed:', { hasSession: !!session, event: _event })
      if (session?.user) {
        const authUser = this.mapSupabaseUserToAuthUser(session.user)
        this.setSession(authUser)
      } else {
        localStorage.removeItem(this.SESSION_KEY)
      }
    })
  }

  private mapSupabaseUserToAuthUser(user: {
    id: string
    email?: string
    user_metadata?: Record<string, unknown>
    app_metadata?: Record<string, unknown>
    created_at?: string
  }): AuthUser {
    const provider = (user.app_metadata?.provider as AuthUser['provider']) || 'email'
    return {
      id: user.id,
      email: user.email || '',
      name: (user.user_metadata?.name as string) || (user.user_metadata?.full_name as string) || 'User',
      createdAt: user.created_at || new Date().toISOString(),
      provider,
      avatarUrl: (user.user_metadata?.avatar_url as string) || undefined,
    }
  }

  async register(data: RegisterData): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    if (!supabase) {
      const message = 'Supabase is not configured. Check your environment variables.'
      console.error('[AuthService] Register failed:', message)
      return { success: false, error: message }
    }

    console.log('[AuthService] Attempting registration for:', data.email)

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          full_name: data.name,
        },
      },
    })

    if (error) {
      const errorMessage = error.message || 'Registration failed'
      console.error('[AuthService] Registration error:', { message: errorMessage, code: error.code })
      return { success: false, error: errorMessage }
    }

    if (!signUpData.user) {
      const message = 'Registration succeeded but no user was returned'
      console.error('[AuthService] Registration result invalid:', signUpData)
      return { success: false, error: message }
    }

    const authUser = this.mapSupabaseUserToAuthUser(signUpData.user)
    this.setSession(authUser)
    console.log('[AuthService] Registration successful:', { userId: authUser.id, email: authUser.email })
    return { success: true, user: authUser }
  }

  async login(data: LoginData): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    if (!supabase) {
      const message = 'Supabase is not configured. Check your environment variables.'
      console.error('[AuthService] Login failed:', message)
      return { success: false, error: message }
    }

    console.log('[AuthService] Attempting login for:', data.email)

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      const errorMessage = error.message || 'Login failed'
      console.error('[AuthService] Login error:', { message: errorMessage, code: error.code })
      return { success: false, error: errorMessage }
    }

    if (!signInData.user) {
      const message = 'Login succeeded but no user was returned'
      console.error('[AuthService] Login result invalid:', signInData)
      return { success: false, error: message }
    }

    const authUser = this.mapSupabaseUserToAuthUser(signInData.user)
    this.setSession(authUser)
    console.log('[AuthService] Login successful:', { userId: authUser.id, email: authUser.email })
    return { success: true, user: authUser }
  }

  async loginWithSocial(data: SocialAuthData): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    const authUser: AuthUser = {
      id: data.providerId,
      email: data.email,
      name: data.name,
      createdAt: new Date().toISOString(),
      provider: data.provider,
      avatarUrl: data.avatarUrl,
    }

    this.setSession(authUser)
    console.log('[AuthService] Social login successful:', { userId: authUser.id, provider: data.provider })
    return { success: true, user: authUser }
  }

  logout(): void {
    console.log('[AuthService] Logging out')
    if (supabase) {
      void supabase.auth.signOut()
    }
    localStorage.removeItem(this.SESSION_KEY)
  }

  getSession(): AuthUser | null {
    const stored = localStorage.getItem(this.SESSION_KEY)
    const session = stored ? JSON.parse(stored) : null
    if (session) {
      console.log('[AuthService] Session retrieved from localStorage:', { userId: session.id })
    }
    return session
  }

  private setSession(user: AuthUser): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user))
    console.log('[AuthService] Session saved to localStorage:', { userId: user.id })
  }

  isAuthenticated(): boolean {
    const session = this.getSession()
    return !!session
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string; token?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured.' }
    }

    console.log('[AuthService] Requesting password reset for:', email)

    const redirectTo = `${window.location.origin}`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    if (error) {
      console.error('[AuthService] Password reset request failed:', error.message)
      return {
        success: false,
        error: error.message,
      }
    }

    console.log('[AuthService] Password reset email sent')
    return {
      success: true,
      token: 'supabase-email-sent',
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (!token) {
      return { success: false, error: 'Invalid reset token.' }
    }

    if (!supabase) {
      return { success: false, error: 'Supabase is not configured.' }
    }

    console.log('[AuthService] Resetting password')

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      console.error('[AuthService] Password reset failed:', error.message)
      return { success: false, error: error.message }
    }

    console.log('[AuthService] Password reset successful')
    return { success: true }
  }

  verifyResetToken(token: string): { valid: boolean; expired?: boolean } {
    return { valid: Boolean(token) }
  }
}

export const authService = new AuthService()
