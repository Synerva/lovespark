import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendUp } from '@phosphor-icons/react'
import type { AppView } from '../App'
import { ArrowLeft } from '@phosphor-icons/react'

interface ElevateModuleProps {
  onNavigate: (view: AppView) => void
}

export function ElevateModule({ onNavigate }: ElevateModuleProps) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-6">
          <ArrowLeft className="mr-2" /> Back to Dashboard
        </Button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/20 rounded-lg">
            <TrendUp size={32} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
              ELEVATE
            </h1>
            <p className="text-muted-foreground">Apply insights through protocols and track progress</p>
          </div>
        </div>

        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Growth protocols and progress tracking coming soon
          </p>
        </Card>
      </div>
    </div>
  )
}
