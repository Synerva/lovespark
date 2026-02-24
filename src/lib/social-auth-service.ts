export interface SocialProfile {
  id: string
  email: string
  name: string
  avatarUrl?: string
}

class SocialAuthService {
  async loginWithGoogle(): Promise<{ success: boolean; profile?: SocialProfile; error?: string }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockProfile: SocialProfile = {
        id: `google-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: `user${Date.now()}@gmail.com`,
        name: 'Google User',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      }
      
      return { success: true, profile: mockProfile }
    } catch (error) {
      return { success: false, error: 'Google authentication failed' }
    }
  }

  async loginWithGitHub(): Promise<{ success: boolean; profile?: SocialProfile; error?: string }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockProfile: SocialProfile = {
        id: `github-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: `user${Date.now()}@github.com`,
        name: 'GitHub User',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now() + 1}`,
      }
      
      return { success: true, profile: mockProfile }
    } catch (error) {
      return { success: false, error: 'GitHub authentication failed' }
    }
  }
}

export const socialAuthService = new SocialAuthService()
