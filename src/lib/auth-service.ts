import type { AuthUser } from './types'

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
  private readonly STORAGE_KEY = 'lovespark-auth-users'
  private readonly SESSION_KEY = 'lovespark-auth-session'
  private readonly RESET_TOKENS_KEY = 'lovespark-reset-tokens'

  private getUsers(): Record<string, { 
    email: string
    password?: string
    name: string
    provider: 'email' | 'google' | 'github'
    providerId?: string
    avatarUrl?: string
  }> {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  }

  private saveUsers(users: Record<string, { 
    email: string
    password?: string
    name: string
    provider: 'email' | 'google' | 'github'
    providerId?: string
    avatarUrl?: string
  }>) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users))
  }

  private getResetTokens(): Record<string, { 
    email: string
    token: string
    expiresAt: string
  }> {
    const stored = localStorage.getItem(this.RESET_TOKENS_KEY)
    return stored ? JSON.parse(stored) : {}
  }

  private saveResetTokens(tokens: Record<string, { 
    email: string
    token: string
    expiresAt: string
  }>) {
    localStorage.setItem(this.RESET_TOKENS_KEY, JSON.stringify(tokens))
  }

  async register(data: RegisterData): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    const users = this.getUsers()
    
    if (Object.values(users).some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'Email already registered' }
    }

    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    users[userId] = {
      email: data.email,
      password: data.password,
      name: data.name,
      provider: 'email',
    }
    
    this.saveUsers(users)
    
    const authUser: AuthUser = {
      id: userId,
      email: data.email,
      name: data.name,
      createdAt: new Date().toISOString(),
      provider: 'email',
    }
    
    this.setSession(authUser)
    
    return { success: true, user: authUser }
  }

  async login(data: LoginData): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    const users = this.getUsers()
    
    const userEntry = Object.entries(users).find(
      ([_, u]) => u.email.toLowerCase() === data.email.toLowerCase() && u.password === data.password
    )
    
    if (!userEntry) {
      return { success: false, error: 'Invalid email or password' }
    }
    
    const [userId, userData] = userEntry
    const authUser: AuthUser = {
      id: userId,
      email: userData.email,
      name: userData.name,
      createdAt: new Date().toISOString(),
      provider: userData.provider || 'email',
      avatarUrl: userData.avatarUrl,
    }
    
    this.setSession(authUser)
    
    return { success: true, user: authUser }
  }

  async loginWithSocial(data: SocialAuthData): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    const users = this.getUsers()
    
    const existingUser = Object.entries(users).find(
      ([_, u]) => u.provider === data.provider && u.providerId === data.providerId
    )
    
    let userId: string
    let userData: AuthUser
    
    if (existingUser) {
      [userId] = existingUser
      userData = {
        id: userId,
        email: data.email,
        name: data.name,
        createdAt: new Date().toISOString(),
        provider: data.provider,
        avatarUrl: data.avatarUrl,
      }
    } else {
      const emailExists = Object.values(users).some(
        u => u.email.toLowerCase() === data.email.toLowerCase()
      )
      
      if (emailExists) {
        return { 
          success: false, 
          error: `An account with this email already exists. Please sign in with your email and password.` 
        }
      }
      
      userId = `user-${data.provider}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      users[userId] = {
        email: data.email,
        name: data.name,
        provider: data.provider,
        providerId: data.providerId,
        avatarUrl: data.avatarUrl,
      }
      
      this.saveUsers(users)
      
      userData = {
        id: userId,
        email: data.email,
        name: data.name,
        createdAt: new Date().toISOString(),
        provider: data.provider,
        avatarUrl: data.avatarUrl,
      }
    }
    
    this.setSession(userData)
    
    return { success: true, user: userData }
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY)
  }

  getSession(): AuthUser | null {
    const stored = localStorage.getItem(this.SESSION_KEY)
    return stored ? JSON.parse(stored) : null
  }

  private setSession(user: AuthUser): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user))
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string; token?: string }> {
    const users = this.getUsers()
    
    const userEntry = Object.entries(users).find(
      ([_, u]) => u.email.toLowerCase() === email.toLowerCase() && u.provider === 'email'
    )
    
    if (!userEntry) {
      return { 
        success: false, 
        error: 'If an account exists with this email, you will receive a password reset link.' 
      }
    }
    
    const token = `reset-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    
    const resetTokens = this.getResetTokens()
    resetTokens[token] = {
      email: email.toLowerCase(),
      token,
      expiresAt,
    }
    this.saveResetTokens(resetTokens)
    
    return { 
      success: true, 
      token,
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const resetTokens = this.getResetTokens()
    const resetData = resetTokens[token]
    
    if (!resetData) {
      return { success: false, error: 'Invalid or expired reset link' }
    }
    
    if (new Date(resetData.expiresAt) < new Date()) {
      delete resetTokens[token]
      this.saveResetTokens(resetTokens)
      return { success: false, error: 'This reset link has expired. Please request a new one.' }
    }
    
    const users = this.getUsers()
    const userEntry = Object.entries(users).find(
      ([_, u]) => u.email.toLowerCase() === resetData.email.toLowerCase()
    )
    
    if (!userEntry) {
      return { success: false, error: 'User account not found' }
    }
    
    const [userId, userData] = userEntry
    users[userId] = {
      ...userData,
      password: newPassword,
    }
    this.saveUsers(users)
    
    delete resetTokens[token]
    this.saveResetTokens(resetTokens)
    
    return { success: true }
  }

  verifyResetToken(token: string): { valid: boolean; expired?: boolean } {
    const resetTokens = this.getResetTokens()
    const resetData = resetTokens[token]
    
    if (!resetData) {
      return { valid: false }
    }
    
    if (new Date(resetData.expiresAt) < new Date()) {
      return { valid: false, expired: true }
    }
    
    return { valid: true }
  }
}

export const authService = new AuthService()
