import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, SignOut, EnvelopeSimple, Calendar, Crown } from '@phosphor-icons/react'
import type { AppView } from '../App'
import { ArrowLeft } from '@phosphor-icons/react'
import { authService } from '@/lib/auth-service'
import { toast } from 'sonner'
import type { User as UserType, Subscription } from '@/lib/types'
import { SubscriptionService } from '@/lib/subscription-service'

interface ProfileSettingsProps {
  onNavigate: (view: AppView) => void
  onLogout: () => void
}

export function ProfileSettings({ onNavigate, onLogout }: ProfileSettingsProps) {
  const [user] = useKV<UserType | null>('lovespark-user', null)
  const [subscription] = useKV<Subscription | null>('lovespark-subscription', null)
  
  const authUser = authService.getSession()
  const plan = subscription ? SubscriptionService.getPlanById(subscription.planId) : SubscriptionService.getPlanByName('FREE')

  const handleLogout = () => {
    authService.logout()
    toast.success('Logged out successfully')
    onLogout()
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-6">
          <ArrowLeft className="mr-2" /> Back to Dashboard
        </Button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-secondary/20 rounded-lg">
            <User size={32} weight="duotone" className="text-secondary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
              Profile & Settings
            </h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User size={20} weight="duotone" className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{authUser?.name || user?.name || 'User'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <EnvelopeSimple size={20} weight="duotone" className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{authUser?.email || user?.email || 'user@lovespark.ai'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={20} weight="duotone" className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })
                      : 'Recently'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-muted rounded">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mode</p>
                  <p className="font-medium capitalize">{user?.mode || 'Individual'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown weight="duotone" className="text-secondary" />
                Subscription
              </CardTitle>
              <CardDescription>Manage your subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
                <p className="text-lg font-semibold">{plan?.displayName}</p>
              </div>

              {subscription && subscription.status === 'active' && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Billing Cycle</p>
                  <p className="font-medium capitalize">{subscription.billingCycle}</p>
                </div>
              )}

              {subscription && subscription.renewalDate && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Next Renewal</p>
                  <p className="font-medium">
                    {new Date(subscription.renewalDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}

              <Button
                onClick={() => onNavigate('pricing')}
                variant="outline"
                className="w-full"
              >
                {subscription?.planName === 'FREE' ? 'Upgrade Plan' : 'Change Plan'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session</CardTitle>
              <CardDescription>Manage your login session</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                <SignOut className="mr-2" size={20} />
                Log Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
