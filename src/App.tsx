import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from '@/components/ui/sonner'
import { LandingPage } from './modules/LandingPage'
import { AboutPage } from './modules/AboutPage'
import { BlogPage } from './modules/BlogPage'
import { ContactPage } from './modules/ContactPage'
import { CoachingPage } from './modules/CoachingPage'
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
import { DesktopSidebar } from './components/DesktopSidebar'
import { MobileHeader } from './components/MobileHeader'
import { BottomNav } from './components/BottomNav'
import { authService } from './lib/auth-service'
import { useSidebar } from './hooks/use-sidebar'
import { useIsMobile } from './hooks/use-mobile'
import type { RISScore, User, AuthUser, Subscription } from './lib/types'

export type AppView =
  | 'landing'
  | 'about'
  | 'blog'
  | 'contact'
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
  | 'coaching'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [resetToken, setResetToken] = useState<string>('')
  const [user, setUser] = useKV<User | null>('lovespark-user', null)
  const [risScore] = useKV<RISScore>('lovespark-ris-score', {
    overall: 0,
    understand: 0,
    align: 0,
    elevate: 0,
    lastUpdated: new Date().toISOString(),
  })
  const { isCollapsed, sidebarWidth } = useSidebar()
  const isMobile = useIsMobile()

  useEffect(() => {
    const session = authService.getSession()
    if (session) {
      if (!user) {
        const newUser: User = {
          id: session.id,
          name: session.name,
          email: session.email,
          avatarUrl: session.avatarUrl,
          mode: 'individual',
          onboardingCompleted: true,
          createdAt: session.createdAt,
        }
        setUser(newUser)
      }
    }
    setIsCheckingAuth(false)
  }, [user?.id])

  const handleLoginSuccess = (authUser: AuthUser) => {
    setCurrentView('dashboard')
  }

  const handleRegisterSuccess = (authUser: AuthUser) => {
    setCurrentView('dashboard')
  }

  const handleOnboardingComplete = () => {
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    authService.logout()
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

    const publicViews: AppView[] = ['landing', 'about', 'blog', 'contact', 'login', 'register', 'forgot-password', 'reset-password']
    const authRequiredViews: AppView[] = ['dashboard', 'ai-coach', 'check-in', 'check-in-history', 'understand', 'align', 'elevate', 'profile', 'usage-stats', 'onboarding', 'retake-onboarding']
    
    if (!isAuthenticated && authRequiredViews.includes(currentView)) {
      return <Login 
        onLoginSuccess={handleLoginSuccess} 
        onSwitchToRegister={() => setCurrentView('register')}
        onForgotPassword={() => setCurrentView('forgot-password')}
      />
    }

    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentView} />
      case 'about':
        return <AboutPage onNavigate={setCurrentView} />
      case 'blog':
        return <BlogPage onNavigate={setCurrentView} />
      case 'contact':
        return <ContactPage onNavigate={setCurrentView} />
      case 'coaching':
        return <CoachingPage onNavigate={setCurrentView} />
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

  const showNavigation = authService.isAuthenticated() && 
    currentView !== 'landing' && currentView !== 'about' && currentView !== 'blog' && currentView !== 'contact' &&
    currentView !== 'login' && currentView !== 'register' && currentView !== 'onboarding' &&
    currentView !== 'forgot-password' && currentView !== 'reset-password' && currentView !== 'pricing' &&
    currentView !== 'retake-onboarding'

  return (
    <div className="min-h-screen bg-background">
      {showNavigation && isMobile && <MobileHeader />}
      {showNavigation && <DesktopSidebar currentView={currentView} onNavigate={setCurrentView} />}
      <div 
        className="transition-all duration-300"
        style={{
          paddingLeft: showNavigation && !isMobile ? `${isCollapsed ? 80 : sidebarWidth}px` : '0',
          paddingTop: showNavigation && isMobile ? '64px' : '0',
          paddingBottom: showNavigation && isMobile ? '80px' : '0'
        }}
      >
        {renderView()}
      </div>
      {showNavigation && isMobile && <BottomNav currentView={currentView} onNavigate={setCurrentView} />}
      <Toaster />
    </div>
  )
}

export default App
