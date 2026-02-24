import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Sparkle, Eye, EyeSlash, GoogleLogo, GithubLogo } from '@phosphor-icons/react'
import { authService } from '@/lib/auth-service'
import { socialAuthService } from '@/lib/social-auth-service'
import { toast } from 'sonner'
import type { AuthUser } from '@/lib/types'

interface RegisterProps {
  onRegisterSuccess: (user: AuthUser) => void
  onSwitchToLogin: () => void
}

export function Register({ onRegisterSuccess, onSwitchToLogin }: RegisterProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)
    
    const result = await authService.register({ name, email, password })
    
    setIsLoading(false)
    
    if (result.success && result.user) {
      toast.success('Account created successfully!')
      onRegisterSuccess(result.user)
    } else {
      toast.error(result.error || 'Registration failed')
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setSocialLoading(provider)
    
    try {
      const socialResult = provider === 'google' 
        ? await socialAuthService.loginWithGoogle()
        : await socialAuthService.loginWithGitHub()
      
      if (socialResult.success && socialResult.profile) {
        const authResult = await authService.loginWithSocial({
          email: socialResult.profile.email,
          name: socialResult.profile.name,
          provider,
          providerId: socialResult.profile.id,
          avatarUrl: socialResult.profile.avatarUrl,
        })
        
        if (authResult.success && authResult.user) {
          toast.success(`Account created successfully!`)
          onRegisterSuccess(authResult.user)
        } else {
          toast.error(authResult.error || 'Registration failed')
        }
      } else {
        toast.error(socialResult.error || 'Social login failed')
      }
    } catch (error) {
      toast.error('Authentication failed. Please try again.')
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'radial-gradient(circle at 50% 0%, oklch(0.65 0.09 195 / 0.1), transparent 70%)'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-secondary/20 rounded-full mb-4">
            <Sparkle size={40} weight="duotone" className="text-secondary" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
            Create Account
          </h1>
          <p className="text-muted-foreground">
            Start your relationship intelligence journey
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Create your LoveSpark account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR CONTINUE WITH</span>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                disabled={socialLoading !== null}
                className="w-full"
              >
                {socialLoading === 'google' ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Signing up...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <GoogleLogo size={20} weight="bold" />
                    <span>Google</span>
                  </div>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('github')}
                disabled={socialLoading !== null}
                className="w-full"
              >
                {socialLoading === 'github' ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Signing up...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <GithubLogo size={20} weight="fill" />
                    <span>GitHub</span>
                  </div>
                )}
              </Button>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <button
                onClick={onSwitchToLogin}
                className="text-accent hover:underline font-medium"
              >
                Sign In
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
