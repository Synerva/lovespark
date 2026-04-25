import { supabase } from './supabase'
import { APP_URL } from '@/config/domains'

export interface SocialProfile {
  id: string
  email: string
  name: string
  avatarUrl?: string
}

class SocialAuthService {
  async loginWithGoogle(): Promise<{ success: boolean; profile?: SocialProfile; error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: APP_URL },
      })
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Google authentication failed' }
    }
  }

  async loginWithGitHub(): Promise<{ success: boolean; profile?: SocialProfile; error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: APP_URL },
      })
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: 'GitHub authentication failed' }
    }
  }
}

export const socialAuthService = new SocialAuthService()
