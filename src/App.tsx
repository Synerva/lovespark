import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from '@/components/ui/sonner'
import { Dashboard } from './modules/Dashboard'
import { Onboarding } from './modules/Onboarding'
import { AICoach } from './modules/AICoach'
import { CheckIn } from './modules/CheckIn'
import { UnderstandModule } from './modules/UnderstandModule'
import { AlignModule } from './modules/AlignModule'
import { ElevateModule } from './modules/ElevateModule'
import { ProfileSettings } from './modules/ProfileSettings'
import { BottomNav } from './components/BottomNav'
import type { RISScore, User } from './lib/types'

export type AppView =
  | 'onboarding'
  | 'dashboard'
  | 'ai-coach'
  | 'check-in'
  | 'understand'
  | 'align'
  | 'elevate'
  | 'profile'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('onboarding')
  const [user] = useKV<User | null>('lovespark-user', null)
  const [risScore] = useKV<RISScore>('lovespark-ris-score', {
    overall: 0,
    understand: 0,
    align: 0,
    elevate: 0,
    lastUpdated: new Date().toISOString(),
  })

  const handleOnboardingComplete = () => {
    setCurrentView('dashboard')
  }

  const renderView = () => {
    if (!user) {
      return <Onboarding onComplete={handleOnboardingComplete} />
    }

    switch (currentView) {
      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} />
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />
      case 'ai-coach':
        return <AICoach risScore={risScore || {
          overall: 52,
          understand: 51,
          align: 53,
          elevate: 50,
          lastUpdated: new Date().toISOString(),
        }} onNavigate={setCurrentView} />
      case 'check-in':
        return <CheckIn onComplete={() => setCurrentView('dashboard')} />
      case 'understand':
        return <UnderstandModule onNavigate={setCurrentView} />
      case 'align':
        return <AlignModule onNavigate={setCurrentView} />
      case 'elevate':
        return <ElevateModule onNavigate={setCurrentView} />
      case 'profile':
        return <ProfileSettings onNavigate={setCurrentView} />
      default:
        return <Dashboard onNavigate={setCurrentView} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pb-20 md:pb-0">{renderView()}</div>
      {user && <BottomNav currentView={currentView} onNavigate={setCurrentView} />}
      <Toaster />
    </div>
  )
}

export default App
