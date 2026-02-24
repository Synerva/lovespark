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
}

export const authService = new AuthService()
