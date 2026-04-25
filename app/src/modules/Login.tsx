import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkle, Eye, EyeSlash } from '@phosphor-icons/react'
import { authService } from '@/lib/auth-service'
import { toast } from 'sonner'
import type { AuthUser } from '@/lib/types'
import { SITE_URL } from '@/config/domains'

interface LoginProps {
  onLoginSuccess: (user: AuthUser) => void
  onSwitchToRegister: () => void
  onForgotPassword: () => void
}

export function Login({ onLoginSuccess, onSwitchToRegister, onForgotPassword }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    
    console.log('[Login] Attempting login for:', email)
    const result = await authService.login({ email, password })
    
    setIsLoading(false)
    
    if (result.success && result.user) {
      console.log('[Login] Login successful')
      toast.success('Welcome back!')
      onLoginSuccess(result.user)
    } else {
      const errorMessage = result.error || 'Login failed'
      console.error('[Login] Login failed:', errorMessage)
      
      // Provide user-friendly error messages
      let displayMessage = errorMessage
      if (errorMessage.includes('Invalid') || errorMessage.includes('invalid')) {
        displayMessage = 'Invalid email or password. Please check your credentials.'
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
        displayMessage = 'Login is temporarily rate-limited by Supabase. Wait about 60 seconds and try again.'
      } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
        displayMessage = 'Network error. Please check your internet connection.'
      } else if (errorMessage.includes('configured') || errorMessage.includes('Supabase')) {
        displayMessage = 'Service is not configured properly. Please contact support.'
      }
      
      toast.error(displayMessage)
    }
  }

  return (
    <div
      className="min-h-screen px-4 py-6 sm:px-6 sm:py-8"
      style={{
        background: 'radial-gradient(circle at 50% 0%, oklch(0.88 0.08 15 / 0.3), transparent 70%), linear-gradient(135deg, oklch(0.99 0.005 30 / 1), oklch(0.96 0.01 30 / 1))'
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col sm:min-h-[calc(100vh-4rem)]">
        <div className="flex justify-start">
          <a
            href={SITE_URL || 'https://lovespark.synerva.tech'}
            className="inline-flex items-center gap-2 rounded-full px-1 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span aria-hidden="true">←</span>
            <span>Back to website</span>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center pt-10 sm:pt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                <Sparkle size={40} weight="duotone" className="text-primary" />
              </div>
              <h1 className="mb-2 text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                Welcome Back
              </h1>
              <p className="text-muted-foreground">
                Sign in to continue your relationship intelligence journey
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Log In</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-xs text-accent hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    onClick={onSwitchToRegister}
                    className="text-accent hover:underline font-medium"
                  >
                    Create Account
                  </button>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
