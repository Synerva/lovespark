import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  ArrowLeft, 
  ChartLine, 
  Target, 
  MagnifyingGlass,
  Lightbulb,
  Eye,
  HeartStraight
} from '@phosphor-icons/react'
import type { AppView } from '../App'

interface UnderstandModuleProps {
  onNavigate: (view: AppView) => void
}

const comingSoonFeatures = [
  {
    icon: ChartLine,
    title: 'Relationship Pattern Scan™',
    description: 'AI-powered analysis of recurring behavioral patterns in your relationship dynamics',
    category: 'Assessment',
  },
  {
    icon: Brain,
    title: 'Emotional Intelligence Profile',
    description: 'Comprehensive assessment of emotional awareness, regulation, and empathy capabilities',
    category: 'Assessment',
  },
  {
    icon: HeartStraight,
    title: 'Attachment Style Analysis',
    description: 'Deep dive into your attachment patterns and how they influence relationship behaviors',
    category: 'Assessment',
  },
  {
    icon: Target,
    title: 'Trigger Map',
    description: 'Identify and visualize emotional triggers and reactive patterns in relationships',
    category: 'Pattern Analysis',
  },
  {
    icon: Eye,
    title: 'Behavioral Blind Spot Reveal',
    description: 'Uncover unconscious patterns that may be impacting your relationship quality',
    category: 'Pattern Analysis',
  },
  {
    icon: MagnifyingGlass,
    title: 'Communication Pattern Analyzer',
    description: 'Track and analyze communication styles, frequencies, and effectiveness over time',
    category: 'Pattern Analysis',
  },
  {
    icon: Lightbulb,
    title: 'AI Insight Reports',
    description: 'Personalized insights generated from your check-ins and assessment data',
    category: 'Pattern Analysis',
  },
]

export function UnderstandModule({ onNavigate }: UnderstandModuleProps) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-6">
          <ArrowLeft className="mr-2" /> Back to Dashboard
        </Button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-accent/20 rounded-lg">
            <Brain size={32} weight="duotone" className="text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
              UNDERSTAND
            </h1>
            <p className="text-muted-foreground">Build self-awareness through pattern recognition</p>
          </div>
        </div>

        <div className="mb-8">
          <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Lightbulb size={24} weight="duotone" className="text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Powerful Assessment Tools Coming Soon
                </h2>
                <p className="text-sm text-muted-foreground">
                  We're building comprehensive assessment tools and AI-powered pattern analysis to help you 
                  gain deep insights into your relationship dynamics, emotional intelligence, and behavioral patterns.
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
                className="p-6 hover:shadow-lg transition-shadow relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Icon size={24} weight="duotone" className="text-accent" />
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
                      <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
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
              Get Notified When UNDERSTAND Launches
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Be the first to access these powerful tools when they become available
            </p>
            <Button variant="outline" disabled>
              <Target className="mr-2" size={16} />
              Notify Me
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
