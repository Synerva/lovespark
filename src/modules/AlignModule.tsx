import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  UsersThree,
  ArrowLeft,
  ChatsCircle,
  Target,
  Scales,
  HeartStraightBreak,
  Crosshair,
  ListChecks,
  Lightbulb
} from '@phosphor-icons/react'
import type { AppView } from '../App'

interface AlignModuleProps {
  onNavigate: (view: AppView) => void
}

const comingSoonFeatures = [
  {
    icon: Scales,
    title: 'Compatibility Intelligence Scan™',
    description: 'Comprehensive analysis of value alignment, lifestyle compatibility, and long-term vision matching',
    category: 'Assessment',
  },
  {
    icon: Target,
    title: 'Alignment Score Visualization',
    description: 'Real-time tracking of relationship alignment across key dimensions with trend analysis',
    category: 'Assessment',
  },
  {
    icon: ChatsCircle,
    title: 'Communication Analyzer',
    description: 'AI-powered analysis of communication patterns, effectiveness, and emotional tone',
    category: 'Communication',
  },
  {
    icon: Lightbulb,
    title: 'AI Conversation Guidance',
    description: 'Real-time suggestions for navigating difficult conversations and expressing needs clearly',
    category: 'Communication',
  },
  {
    icon: ListChecks,
    title: 'Expectation Clarity Tools',
    description: 'Structured exercises to surface and align expectations across relationship dimensions',
    category: 'Tools',
  },
  {
    icon: HeartStraightBreak,
    title: 'Conflict Resolution Patterns',
    description: 'Identify and improve conflict repair strategies based on behavioral data',
    category: 'Pattern Analysis',
  },
  {
    icon: Crosshair,
    title: 'Couple Alignment Dashboard',
    description: 'Shared view for couples to track alignment progress and celebrate improvements together',
    category: 'Tools',
  },
]

export function AlignModule({ onNavigate }: AlignModuleProps) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-6">
          <ArrowLeft className="mr-2" /> Back to Dashboard
        </Button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-align/20 rounded-lg">
            <UsersThree size={32} weight="duotone" className="text-align" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
              ALIGN
            </h1>
            <p className="text-muted-foreground">Optimize communication and identify alignment gaps</p>
          </div>
        </div>

        <div className="mb-8">
          <Card className="p-6 bg-gradient-to-br from-align/10 via-align/5 to-transparent border-align/30">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-align/20 rounded-lg">
                <Lightbulb size={24} weight="duotone" className="text-align" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Advanced Alignment Tools Coming Soon
                </h2>
                <p className="text-sm text-muted-foreground">
                  We're developing powerful communication analysis and alignment tracking tools to help you 
                  bridge gaps, improve understanding, and strengthen connection through data-driven insights.
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
                className="p-6 hover:shadow-lg transition-all relative overflow-hidden group bg-gradient-to-br from-align/10 via-align/5 to-transparent border-align/20"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-align/10 to-align/20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-align/10 rounded-lg">
                      <Icon size={24} weight="duotone" className="text-align" />
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
                      <div className="w-2 h-2 rounded-full bg-align animate-pulse" />
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
              Get Notified When ALIGN Launches
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Be the first to access these alignment and communication tools when they become available
            </p>
            <Button variant="outline" disabled>
              <UsersThree className="mr-2" size={16} />
              Notify Me
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
