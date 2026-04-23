import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkle, ArrowLeft, EnvelopeSimple } from '@phosphor-icons/react'
import { authService } from '@/lib/auth-service'
import { toast } from 'sonner'

interface ForgotPasswordProps {
  onBackToLogin: () => void
  onResetRequested: (token: string) => void
}

export function ForgotPassword({ onBackToLogin, onResetRequested }: ForgotPasswordProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    
    const result = await authService.requestPasswordReset(email)
    
    setIsLoading(false)
    
    if (result.success && result.token) {
      setEmailSent(true)
      toast.success('Password reset link generated!')
      onResetRequested(result.token)
    } else {
      setEmailSent(true)
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
            Reset Your Password
          </h1>
          <p className="text-muted-foreground">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              {emailSent 
                ? 'Check your email for the reset link' 
                : 'Enter the email associated with your account'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="space-y-4">
                <Alert className="border-secondary/50 bg-secondary/10">
                  <EnvelopeSimple size={20} className="text-secondary" />
                  <AlertDescription className="ml-2">
                    A password reset link has been generated for <strong>{email}</strong>. 
                    In a production environment, this would be sent via email.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertDescription>
                    <strong>Development Mode:</strong> The reset link has been automatically opened for you. 
                    Click the "Reset Password" button below to continue.
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={onBackToLogin}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Login
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onBackToLogin}
                    className="w-full"
                  >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Login
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
