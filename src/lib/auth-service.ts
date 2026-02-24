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

class AuthService {
  private readonly STORAGE_KEY = 'lovespark-auth-users'
  private readonly SESSION_KEY = 'lovespark-auth-session'

  private getUsers(): Record<string, { email: string; password: string; name: string }> {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  }

  private saveUsers(users: Record<string, { email: string; password: string; name: string }>) {
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
    }
    
    this.saveUsers(users)
    
    const authUser: AuthUser = {
      id: userId,
      email: data.email,
      name: data.name,
      createdAt: new Date().toISOString(),
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
    }
    
    this.setSession(authUser)
    
    return { success: true, user: authUser }
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
