import { supabase } from './supabase'

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
        options: { redirectTo: window.location.origin },
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
        options: { redirectTo: window.location.origin },
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
