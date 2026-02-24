import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkle, Eye, EyeSlash, CheckCircle, XCircle } from '@phosphor-icons/react'
import { authService } from '@/lib/auth-service'
import { toast } from 'sonner'

interface ResetPasswordProps {
  token: string
  onResetSuccess: () => void
  onBackToLogin: () => void
}

export function ResetPassword({ token, onResetSuccess, onBackToLogin }: ResetPasswordProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [tokenExpired, setTokenExpired] = useState(false)

  useEffect(() => {
    const validation = authService.verifyResetToken(token)
    setTokenValid(validation.valid)
    if (!validation.valid && validation.expired) {
      setTokenExpired(true)
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
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
    
    const result = await authService.resetPassword(token, password)
    
    setIsLoading(false)
    
    if (result.success) {
      toast.success('Password reset successfully!')
      setTimeout(() => {
        onResetSuccess()
      }, 1500)
    } else {
      toast.error(result.error || 'Failed to reset password')
    }
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
          <p className="mt-4 text-muted-foreground">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
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
            <div className="inline-flex items-center justify-center p-3 bg-destructive/20 rounded-full mb-4">
              <XCircle size={40} weight="duotone" className="text-destructive" />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
              {tokenExpired ? 'Link Expired' : 'Invalid Link'}
            </h1>
            <p className="text-muted-foreground">
              {tokenExpired 
                ? 'This password reset link has expired. Please request a new one.'
                : 'This password reset link is invalid or has already been used.'
              }
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={onBackToLogin}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
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
            Create New Password
          </h1>
          <p className="text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Choose a strong password for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Alert className="border-secondary/50 bg-secondary/10">
                <CheckCircle size={20} className="text-secondary" />
                <AlertDescription className="ml-2">
                  Your reset link is valid. Enter your new password to continue.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {password && password.length < 6 && (
                  <p className="text-xs text-destructive">Password must be at least 6 characters</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                disabled={isLoading || !password || !confirmPassword || password !== confirmPassword || password.length < 6}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
