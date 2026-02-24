import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain } from '@phosphor-icons/react'
import type { AppView } from '../App'
import { ArrowLeft } from '@phosphor-icons/react'

interface UnderstandModuleProps {
  onNavigate: (view: AppView) => void
}

export function UnderstandModule({ onNavigate }: UnderstandModuleProps) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
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

        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Assessment tools and pattern analysis coming soon
          </p>
        </Card>
      </div>
    </div>
  )
}
