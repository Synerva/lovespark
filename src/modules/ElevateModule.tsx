import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendUp,
  ArrowLeft,
  ChartLineUp,
  Calendar,
  CheckCircle,
  Path,
  Lightning,
  UserCircleGear,
  Lightbulb
} from '@phosphor-icons/react'
import type { AppView } from '../App'

interface ElevateModuleProps {
  onNavigate: (view: AppView) => void
}

const comingSoonFeatures = [
  {
    icon: Calendar,
    title: 'Weekly Optimization Brief',
    description: 'Personalized weekly action plan based on your latest RIS data and behavioral patterns',
    category: 'Protocols',
  },
  {
    icon: Path,
    title: 'Growth Protocols',
    description: 'Structured behavior change programs designed to improve specific relationship dimensions',
    category: 'Protocols',
  },
  {
    icon: CheckCircle,
    title: 'Habit Tracking & Streaks',
    description: 'Track daily relationship-building habits and celebrate consistency with streak counters',
    category: 'Progress Tracking',
  },
  {
    icon: ChartLineUp,
    title: 'Progress Visualization',
    description: 'Interactive charts showing RIS trends, pillar improvements, and milestone achievements',
    category: 'Progress Tracking',
  },
  {
    icon: UserCircleGear,
    title: 'Psychologist Session Booking',
    description: 'Schedule and manage sessions with licensed relationship psychologists for deeper support',
    category: 'Professional Support',
  },
  {
    icon: Lightning,
    title: 'Quick Wins Library',
    description: 'Science-backed micro-actions you can take today to immediately improve connection',
    category: 'Tools',
  },
  {
    icon: TrendUp,
    title: 'Long-Term Strategy View',
    description: 'Visualize your relationship evolution trajectory and plan for future milestones',
    category: 'Tools',
  },
]

export function ElevateModule({ onNavigate }: ElevateModuleProps) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-6">
          <ArrowLeft className="mr-2" /> Back to Dashboard
        </Button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-elevate/20 rounded-lg">
            <TrendUp size={32} weight="duotone" className="text-elevate" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
              ELEVATE
            </h1>
            <p className="text-muted-foreground">Apply insights through protocols and track progress</p>
          </div>
        </div>

        <div className="mb-8">
          <Card className="p-6 bg-gradient-to-br from-elevate/10 via-elevate/5 to-transparent border-elevate/30">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-elevate/20 rounded-lg">
                <Lightbulb size={24} weight="duotone" className="text-elevate" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Powerful Growth Tools Coming Soon
                </h2>
                <p className="text-sm text-muted-foreground">
                  We're building structured growth protocols, progress tracking systems, and professional support 
                  features to help you systematically elevate your relationship from insights to lasting change.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comingSoonFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card 
                key={index}
                className="p-6 hover:shadow-lg hover:shadow-elevate/20 transition-all relative overflow-hidden group bg-gradient-to-br from-elevate/10 via-elevate/5 to-transparent border-elevate/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-elevate/25 via-elevate/10 to-elevate/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-pulse" />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-elevate/10 rounded-lg group-hover:bg-elevate/20 transition-colors">
                      <Icon size={24} weight="duotone" className="text-elevate" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.category}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                    {feature.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-elevate animate-pulse" />
                      <span>In Development</span>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="mt-8 p-6 bg-muted/30">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
              Get Notified When ELEVATE Launches
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Be the first to access these growth protocols and progress tracking tools when they become available
            </p>
            <Button variant="outline" disabled>
              <TrendUp className="mr-2" size={16} />
              Notify Me
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
