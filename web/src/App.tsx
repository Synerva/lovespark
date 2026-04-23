import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { LandingPage } from './modules/LandingPage'
import { AboutPage } from './modules/AboutPage'
import { ContactPage } from './modules/ContactPage'

export type AppView =
  | 'landing'
  | 'about'
  | 'contact'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'ai-coach'
  | 'pricing'

type MarketingView = 'landing' | 'about' | 'contact'

const APP_URL = (import.meta.env.VITE_APP_URL as string | undefined)?.trim() || 'http://localhost:5173'

function App() {
  const [currentView, setCurrentView] = useState<MarketingView>('landing')

  const handleNavigate = (view: AppView) => {
    if (view === 'landing' || view === 'about' || view === 'contact') {
      setCurrentView(view)
      return
    }

    window.location.href = APP_URL
  }

  const renderView = () => {
    switch (currentView) {
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />
      case 'contact':
        return <ContactPage onNavigate={handleNavigate} />
      case 'landing':
      default:
        return <LandingPage onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {renderView()}
      <Toaster />
    </div>
  )
}

export default App
