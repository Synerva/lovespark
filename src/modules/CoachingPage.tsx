import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/Logo'
import { Sparkle, Check, User, Users, ChatCircle, Target, Heart, ArrowRight } from '@phosphor-icons/react'
import type { AppView } from '@/App'
import { authService } from '@/lib/auth-service'

interface CoachingPageProps {
  onNavigate: (view: AppView) => void
}

export function CoachingPage({ onNavigate }: CoachingPageProps) {
  const isAuthenticated = authService.isAuthenticated()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="cursor-pointer" onClick={() => onNavigate('landing')}>
              <Logo />
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => onNavigate('landing')}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => onNavigate('blog')}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                Blog
              </button>
              <button 
                onClick={() => onNavigate('coaching')}
                className="text-sm font-medium text-foreground transition-colors"
              >
                Coaching
              </button>
            </nav>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'login')}
                className="text-sm"
              >
                {isAuthenticated ? 'Dashboard' : 'Log In'}
              </Button>
              {!isAuthenticated && (
                <Button 
                  onClick={() => onNavigate('register')}
                  className="text-sm bg-gradient-to-r from-primary via-secondary to-align hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-primary/5 to-align/5" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full mb-6">
              <Heart className="text-secondary" size={20} weight="fill" />
              <span className="text-sm font-medium text-secondary">Expert Relationship Coaching</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Work with a{' '}
              <span className="bg-gradient-to-r from-secondary via-primary to-align bg-clip-text text-transparent">
                Relationship Coach
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Go beyond AI insights with personalized coaching sessions tailored to your unique relationship dynamics and goals.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              Who is Coaching For?
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
              Relationship coaching is ideal for individuals and couples who want deeper support, accountability, and personalized guidance on their journey.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <Card className="border-2 hover:border-secondary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center mb-4">
                    <Target size={24} weight="fill" className="text-secondary-foreground" />
                  </div>
                  <CardTitle className="text-lg">Facing Specific Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Need expert guidance on communication breakdowns, conflict patterns, or emotional disconnection.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-4">
                    <ChatCircle size={24} weight="fill" className="text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">Want Personalized Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Seeking tailored strategies and real-time feedback beyond automated insights.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-align/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-align to-align/70 flex items-center justify-center mb-4">
                    <Sparkle size={24} weight="fill" className="text-align-foreground" />
                  </div>
                  <CardTitle className="text-lg">Ready to Elevate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Committed to accelerating growth and achieving breakthrough clarity in your relationship.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              Coaching Packages
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12">
              Choose the option that fits your needs. All sessions are 60 minutes via video call.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <User size={32} weight="duotone" className="text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Single Session</CardTitle>
                  <CardDescription className="text-base">Perfect for specific questions or one-time guidance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="text-4xl font-bold mb-2">$149</div>
                    <p className="text-sm text-muted-foreground">per session</p>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check size={20} weight="bold" className="text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">60-minute video session</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check size={20} weight="bold" className="text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Pre-session questionnaire</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check size={20} weight="bold" className="text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Personalized action plan</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check size={20} weight="bold" className="text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Session recording & notes</span>
                    </li>
                  </ul>

                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => onNavigate('contact')}
                  >
                    Book Single Session
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-4 border-secondary relative hover:shadow-2xl transition-shadow">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 bg-gradient-to-r from-secondary via-primary to-align text-secondary-foreground text-sm font-semibold rounded-full">
                    RECOMMENDED
                  </span>
                </div>
                <CardHeader className="pt-8">
                  <div className="flex items-center justify-between mb-2">
                    <Users size={32} weight="duotone" className="text-secondary" />
                  </div>
                  <CardTitle className="text-2xl">5-Session Package</CardTitle>
                  <CardDescription className="text-base">Complete transformation program</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="text-4xl font-bold mb-2">$649</div>
                    <p className="text-sm text-muted-foreground">$130 per session • Save $96</p>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check size={20} weight="bold" className="text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Five 60-minute video sessions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check size={20} weight="bold" className="text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Comprehensive relationship assessment</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check size={20} weight="bold" className="text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Personalized growth roadmap</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check size={20} weight="bold" className="text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Session recordings & detailed notes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check size={20} weight="bold" className="text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Email support between sessions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check size={20} weight="bold" className="text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Progress tracking & accountability</span>
                    </li>
                  </ul>

                  <Button 
                    className="w-full bg-gradient-to-r from-secondary via-primary to-align hover:opacity-90 transition-opacity"
                    onClick={() => onNavigate('contact')}
                  >
                    Apply for Coaching
                    <ArrowRight className="ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              All packages include integration with your LoveSpark account and AI insights
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
              Ready to Transform Your Relationship?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start with our Relationship Intelligence Profile, then work with a coach for personalized support.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => onNavigate('register')}
                className="text-base px-8 py-6 bg-gradient-to-r from-primary via-secondary to-align hover:opacity-90 transition-opacity"
              >
                Get Your Profile
                <Sparkle className="ml-2" weight="fill" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => onNavigate('contact')}
                className="text-base px-8 py-6 border-2"
              >
                Apply for Coaching
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-12 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="text-sm text-muted-foreground">© 2024 LoveSpark. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => onNavigate('about')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => onNavigate('contact')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
