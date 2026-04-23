import { useEffect, useState } from 'react'
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
  ListChecks,
  Lightbulb,
  CheckCircle,
  Circle
} from '@phosphor-icons/react'
import type { AppView } from '../App'
import { loadLatestAssessmentByType } from '@/lib/db/assessments'

interface AlignModuleProps {
  onNavigate: (view: AppView) => void
}

const activeAssessments = [
  {
    icon: Scales,
    title: 'Compatibility Assessment',
    description: 'Evaluate alignment across core values, lifestyle, intimacy, and long-term vision',
    category: 'Assessment',
    view: 'compatibility-assessment' as AppView,
    storageKey: 'compatibilityAssessment'
  },
  {
    icon: ChatsCircle,
    title: 'Communication Patterns Assessment',
    description: 'Analyze your communication effectiveness, listening skills, and conflict management patterns',
    category: 'Assessment',
    view: 'communication-patterns-assessment' as AppView,
    storageKey: 'communicationPatternsAssessment'
  },
]

const comingSoonFeatures = [
  {
    icon: Target,
    title: 'Alignment Score Visualization',
    description: 'Real-time tracking of relationship alignment across key dimensions with trend analysis',
    category: 'Insights',
  },
  {
    icon: Lightbulb,
    title: 'AI Conversation Guidance',
    description: 'Real-time suggestions for navigating difficult conversations and expressing needs clearly',
    category: 'AI Tools',
  },
  {
    icon: ListChecks,
    title: 'Expectation Clarity Tools',
    description: 'Structured exercises to surface and align expectations across relationship dimensions',
    category: 'Exercises',
  },
  {
    icon: HeartStraightBreak,
    title: 'Conflict Resolution Patterns',
    description: 'Identify and improve conflict repair strategies based on behavioral data',
    category: 'Pattern Analysis',
  },
]

export function AlignModule({ onNavigate }: AlignModuleProps) {
  const [compatibilityCompleted, setCompatibilityCompleted] = useState(false)
  const [communicationPatternsCompleted, setCommunicationPatternsCompleted] = useState(false)

  useEffect(() => {
    const loadCompletion = async () => {
      try {
        const [compatibility, patterns] = await Promise.all([
          loadLatestAssessmentByType('conflict_pattern'),
          loadLatestAssessmentByType('communication_pattern'),
        ])
        setCompatibilityCompleted(Boolean(compatibility))
        setCommunicationPatternsCompleted(Boolean(patterns))
      } catch (error) {
        console.error('Failed loading ALIGN assessment completion:', error)
      }
    }

    void loadCompletion()
  }, [])

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

        <div className="mb-8 space-y-4">
          {activeAssessments.map((assessment, index) => {
            const Icon = assessment.icon
            const isCompleted = assessment.storageKey === 'compatibilityAssessment' 
              ? compatibilityCompleted 
              : communicationPatternsCompleted
            
            return (
              <Card 
                key={index}
                className="p-6 border-align/40 hover:shadow-lg hover:shadow-align/20 transition-all cursor-pointer bg-gradient-to-br from-align/10 via-background to-background group"
                onClick={() => onNavigate(assessment.view)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-align/20 rounded-lg group-hover:bg-align/30 transition-colors">
                      <Icon size={28} weight="duotone" className="text-align" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
                          {assessment.title}
                        </h3>
                        {isCompleted ? (
                          <CheckCircle size={20} weight="fill" className="text-success" />
                        ) : (
                          <Circle size={20} weight="regular" className="text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {assessment.description}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {assessment.category}
                      </Badge>
                    </div>
                  </div>
                  <Button variant={isCompleted ? "outline" : "default"} size="sm" className="ml-4">
                    {isCompleted ? 'Retake' : 'Start'}
                  </Button>
                </div>
              </Card>
            )
          })}
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
                className="p-6 hover:shadow-lg hover:shadow-align/20 transition-all relative overflow-hidden group bg-gradient-to-br from-align/10 via-align/5 to-transparent border-align/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-align/25 via-align/10 to-align/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-pulse" />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-align/10 rounded-lg group-hover:bg-align/20 transition-colors">
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
              Get Notified When More ALIGN Features Launch
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
