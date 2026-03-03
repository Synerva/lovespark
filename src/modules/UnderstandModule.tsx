import { useKV } from '@github/spark/hooks'
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
  HeartStraight,
  Clock,
  CheckCircle,
  Circle
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
  const [assessmentResults] = useKV<any[]>('lovespark-assessment-results', [])
  
  const emotionalReactionCompleted = assessmentResults?.some((r: any) => r.assessmentType === 'emotional-reaction')
  const communicationTimingCompleted = assessmentResults?.some((r: any) => r.assessmentType === 'communication-timing')

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-6">
          <ArrowLeft className="mr-2" /> Back to Dashboard
        </Button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-understand/20 rounded-lg">
            <Brain size={32} weight="duotone" className="text-understand" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
              UNDERSTAND
            </h1>
            <p className="text-muted-foreground">Build self-awareness through pattern recognition</p>
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <Card 
            className="p-6 border-understand/40 hover:shadow-lg hover:shadow-understand/20 transition-all cursor-pointer bg-gradient-to-br from-understand/10 via-background to-background group"
            onClick={() => onNavigate('emotional-reaction-assessment')}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-understand/20 rounded-lg group-hover:bg-understand/30 transition-colors">
                  <Brain size={28} weight="duotone" className="text-understand" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
                      Emotional Reaction Style Assessment
                    </h3>
                    {emotionalReactionCompleted ? (
                      <CheckCircle size={20} weight="fill" className="text-success" />
                    ) : (
                      <Circle size={20} weight="regular" className="text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Discover how you respond to stress and conflict. Learn your emotional regulation patterns and get personalized insights.
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    8 Questions • 5 minutes
                  </Badge>
                </div>
              </div>
              <Button variant={emotionalReactionCompleted ? "outline" : "default"} size="sm" className="ml-4">
                {emotionalReactionCompleted ? 'Retake' : 'Start'}
              </Button>
            </div>
          </Card>

          <Card 
            className="p-6 border-understand/40 hover:shadow-lg hover:shadow-understand/20 transition-all cursor-pointer bg-gradient-to-br from-understand/10 via-background to-background group"
            onClick={() => onNavigate('communication-timing-assessment')}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-understand/20 rounded-lg group-hover:bg-understand/30 transition-colors">
                  <Clock size={28} weight="duotone" className="text-understand" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
                      Communication Timing Assessment
                    </h3>
                    {communicationTimingCompleted ? (
                      <CheckCircle size={20} weight="fill" className="text-success" />
                    ) : (
                      <Circle size={20} weight="regular" className="text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Understand your emotional timing preferences. Learn when you're most receptive to difficult conversations.
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    9 Questions • 5 minutes
                  </Badge>
                </div>
              </div>
              <Button variant={communicationTimingCompleted ? "outline" : "default"} size="sm" className="ml-4">
                {communicationTimingCompleted ? 'Retake' : 'Start'}
              </Button>
            </div>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            Coming Soon
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comingSoonFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card 
                key={index}
                className="p-6 hover:shadow-lg hover:shadow-understand/20 transition-all relative overflow-hidden group bg-gradient-to-br from-understand/10 via-understand/5 to-transparent border-understand/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-understand/25 via-understand/10 to-understand/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-pulse" />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-understand/10 rounded-lg group-hover:bg-understand/20 transition-colors">
                      <Icon size={24} weight="duotone" className="text-understand" />
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
                      <div className="w-2 h-2 rounded-full bg-understand animate-pulse" />
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
