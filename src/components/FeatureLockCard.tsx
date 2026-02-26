import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, Sparkle } from '@phosphor-icons/react'
import type { AppView } from '@/App'

interface FeatureLockCardProps {
  title: string
  description: string
  featureName: string
  icon?: React.ReactNode
  onUpgrade: () => void
}

export function FeatureLockCard({ 
  title, 
  description, 
  featureName,
  icon,
  onUpgrade 
}: FeatureLockCardProps) {
  return (
    <Card className="relative overflow-hidden border-2 border-muted bg-gradient-to-br from-muted/30 via-muted/10 to-transparent group transition-all duration-300 hover:scale-105">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 backdrop-blur-sm z-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-primary/10 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-pulse z-10" />
      <CardContent className="p-6 relative z-20">
        <div className="flex items-start gap-4 mb-4">
          {icon && <div className="opacity-50">{icon}</div>}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg text-foreground/70">{title}</h3>
              <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                <Lock size={12} className="mr-1" />
                Premium
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground/70 mb-4">{description}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <p className="text-sm text-muted-foreground italic">
            Upgrade to access {featureName}
          </p>
          <Button onClick={onUpgrade} size="sm" className="gap-2 whitespace-nowrap w-full sm:w-auto">
            <Sparkle size={16} weight="fill" />
            Upgrade Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface FeatureLockBannerProps {
  message: string
  onUpgrade: () => void
  className?: string
}

export function FeatureLockBanner({ message, onUpgrade, className = '' }: FeatureLockBannerProps) {
  return (
    <div className={`flex items-center justify-between gap-4 p-4 bg-accent/10 border border-accent/20 rounded-lg ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-accent/20 rounded-full">
          <Lock size={20} className="text-accent" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{message}</p>
          <p className="text-sm text-muted-foreground">Unlock with Premium</p>
        </div>
      </div>
      <Button onClick={onUpgrade} size="sm" className="gap-2">
        <Sparkle size={16} weight="fill" />
        View Plans
      </Button>
    </div>
  )
}
