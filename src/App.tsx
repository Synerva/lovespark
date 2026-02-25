import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from '@/components/ui/sonner'
import { Dashboard } from './modules/Dashboard'
import { Onboarding } from './modules/Onboarding'
import { Login } from './modules/Login'
import { Register } from './modules/Register'
import { ForgotPassword } from './modules/ForgotPassword'
import { ResetPassword } from './modules/ResetPassword'
import { AICoach } from './modules/AICoach'
import { CheckIn } from './modules/CheckIn'
import { UnderstandModule } from './modules/UnderstandModule'
import { AlignModule } from './modules/AlignModule'
import { ElevateModule } from './modules/ElevateModule'
import { ProfileSettings } from './modules/ProfileSettings'
import { CheckInHistory } from './modules/CheckInHistory'
import { Pricing } from './modules/Pricing'
import { UsageStats } from './modules/UsageStats'
import { BottomNav } from './components/BottomNav'
import { DesktopSidebar } from './components/DesktopSidebar'
import { authService } from './lib/auth-service'
import { useSidebar } from './hooks/use-sidebar'
import type { RISScore, User, AuthUser, Subscription } from './lib/types'

export type AppView =
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'onboarding'
  | 'retake-onboarding'
  | 'dashboard'
  | 'ai-coach'
  | 'check-in'
  | 'check-in-history'
  | 'understand'
  | 'align'
  | 'elevate'
  | 'profile'
  | 'pricing'
  | 'usage-stats'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('login')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [resetToken, setResetToken] = useState<string>('')
  const [user] = useKV<User | null>('lovespark-user', null)
  const [, setUser] = useKV<User | null>('lovespark-user', null)
  const [risScore] = useKV<RISScore>('lovespark-ris-score', {
    overall: 0,
    understand: 0,
    align: 0,
    elevate: 0,
    lastUpdated: new Date().toISOString(),
  })
  const { isCollapsed, sidebarWidth } = useSidebar()

  useEffect(() => {
    const session = authService.getSession()
    if (session) {
      if (user?.onboardingCompleted) {
        setCurrentView('dashboard')
      } else {
        setCurrentView('onboarding')
      }
    } else {
      setCurrentView('login')
    }
    setIsCheckingAuth(false)
  }, [user?.onboardingCompleted])

  const handleLoginSuccess = (authUser: AuthUser) => {
    if (user?.onboardingCompleted) {
      setCurrentView('dashboard')
    } else {
      setCurrentView('onboarding')
    }
  }

  const handleRegisterSuccess = (authUser: AuthUser) => {
    setCurrentView('onboarding')
  }

  const handleOnboardingComplete = () => {
    setCurrentView('pricing')
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentView('login')
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        </div>
      </div>
    )
  }

  const renderView = () => {
    const isAuthenticated = authService.isAuthenticated()

    if (!isAuthenticated && currentView !== 'login' && currentView !== 'register' && currentView !== 'forgot-password' && currentView !== 'reset-password') {
      return <Login 
        onLoginSuccess={handleLoginSuccess} 
        onSwitchToRegister={() => setCurrentView('register')}
        onForgotPassword={() => setCurrentView('forgot-password')}
      />
    }

    switch (currentView) {
      case 'login':
        return <Login 
          onLoginSuccess={handleLoginSuccess} 
          onSwitchToRegister={() => setCurrentView('register')}
          onForgotPassword={() => setCurrentView('forgot-password')}
        />
      case 'register':
        return <Register onRegisterSuccess={handleRegisterSuccess} onSwitchToLogin={() => setCurrentView('login')} />
      case 'forgot-password':
        return <ForgotPassword 
          onBackToLogin={() => setCurrentView('login')}
          onResetRequested={(token) => {
            setResetToken(token)
            setCurrentView('reset-password')
          }}
        />
      case 'reset-password':
        return <ResetPassword 
          token={resetToken}
          onResetSuccess={() => setCurrentView('login')}
          onBackToLogin={() => setCurrentView('login')}
        />
      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} />
      case 'retake-onboarding':
        return <Onboarding onComplete={() => setCurrentView('profile')} isRetake={true} />
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
      case 'check-in-history':
        return <CheckInHistory onNavigate={setCurrentView} />
      case 'understand':
        return <UnderstandModule onNavigate={setCurrentView} />
      case 'align':
        return <AlignModule onNavigate={setCurrentView} />
      case 'elevate':
        return <ElevateModule onNavigate={setCurrentView} />
      case 'profile':
        return <ProfileSettings onNavigate={setCurrentView} onLogout={handleLogout} />
      case 'pricing':
        return <Pricing onNavigate={setCurrentView} />
      case 'usage-stats':
        return <UsageStats onNavigate={setCurrentView} />
      default:
        return <Login 
          onLoginSuccess={handleLoginSuccess} 
          onSwitchToRegister={() => setCurrentView('register')}
          onForgotPassword={() => setCurrentView('forgot-password')}
        />
    }
  }

  const showBottomNav = authService.isAuthenticated() && user?.onboardingCompleted && 
    currentView !== 'login' && currentView !== 'register' && currentView !== 'onboarding' &&
    currentView !== 'forgot-password' && currentView !== 'reset-password' && currentView !== 'pricing' &&
    currentView !== 'retake-onboarding'

  return (
    <div className="min-h-screen bg-background">
      {showBottomNav && <DesktopSidebar currentView={currentView} onNavigate={setCurrentView} />}
      <div 
        className="pb-20 md:pb-0 transition-all duration-300"
        style={{
          paddingLeft: showBottomNav ? `${isCollapsed ? 80 : sidebarWidth}px` : '0'
        }}
      >
        {renderView()}
      </div>
      {showBottomNav && <BottomNav currentView={currentView} onNavigate={setCurrentView} />}
      <Toaster />
    </div>
  )
}

export default App
