import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { Heart, Sparkle, TrendUp, ChatCircle, Brain, Medal } from '@phosphor-icons/react'
import type { AppView } from '@/App'

interface LandingPageProps {
  onNavigate: (view: AppView) => void
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="text-xl font-semibold text-foreground">LoveSpark</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => onNavigate('landing')}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => onNavigate('about')}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => onNavigate('blog')}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                Blog
              </button>
              <button 
                onClick={() => onNavigate('contact')}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                Contact
              </button>
            </nav>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => onNavigate('login')}
                className="text-sm"
              >
                Log In
              </Button>
              <Button 
                onClick={() => onNavigate('register')}
                className="text-sm bg-gradient-to-r from-primary via-secondary to-align hover:opacity-90 transition-opacity"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-align/5" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Sparkle className="text-primary" size={20} weight="fill" />
              <span className="text-sm font-medium text-primary">AI-Powered Relationship Intelligence</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Build Stronger Relationships with{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-align bg-clip-text text-transparent">
                Intelligence
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              LoveSpark is your AI-first relationship operating system. Get data-driven insights, track your Relationship Intelligence Score™, and optimize your connection every day.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => onNavigate('register')}
                className="text-base px-8 py-6 bg-gradient-to-r from-primary via-secondary to-align hover:opacity-90 transition-opacity"
              >
                Start Your Journey
                <Sparkle className="ml-2" weight="fill" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => onNavigate('ai-coach')}
                className="text-base px-8 py-6 border-2"
              >
                Try AI Coach
                <ChatCircle className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              The LoveSpark Method
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three pillars of relationship intelligence working together to optimize your connection
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-understand/20 to-understand/5 rounded-2xl transform group-hover:scale-105 transition-transform" />
              <div className="relative p-8 bg-card rounded-2xl border border-border/50">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-understand to-understand/70 flex items-center justify-center mb-6">
                  <Brain size={28} weight="fill" className="text-understand-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">UNDERSTAND</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Gain deep insights into your relationship patterns, attachment styles, and emotional dynamics through AI-powered analysis.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-align/20 to-align/5 rounded-2xl transform group-hover:scale-105 transition-transform" />
              <div className="relative p-8 bg-card rounded-2xl border border-border/50">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-align to-align/70 flex items-center justify-center mb-6">
                  <Heart size={28} weight="fill" className="text-align-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">ALIGN</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Optimize communication, clarify expectations, and strengthen your emotional connection with personalized guidance.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-elevate/20 to-elevate/5 rounded-2xl transform group-hover:scale-105 transition-transform" />
              <div className="relative p-8 bg-card rounded-2xl border border-border/50">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-elevate to-elevate/70 flex items-center justify-center mb-6">
                  <TrendUp size={28} weight="fill" className="text-elevate-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">ELEVATE</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Track progress, build healthy habits, and continuously improve your relationship intelligence over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-foreground mb-6">
                  Your Relationship Intelligence Score™
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Track your relationship health with a comprehensive, data-driven score that updates as you grow. See real-time progress across all three pillars.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkle size={14} className="text-primary" weight="fill" />
                    </div>
                    <span className="text-foreground/80">Real-time insights based on weekly check-ins</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkle size={14} className="text-primary" weight="fill" />
                    </div>
                    <span className="text-foreground/80">Personalized recommendations from AI coach</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkle size={14} className="text-primary" weight="fill" />
                    </div>
                    <span className="text-foreground/80">Progress tracking and behavioral optimization</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-align/20 rounded-3xl blur-3xl" />
                <div className="relative bg-card rounded-3xl border border-border/50 p-8 shadow-2xl">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <svg className="w-48 h-48 transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="none" className="text-muted/30" />
                        <circle cx="96" cy="96" r="88" stroke="url(#gradient)" strokeWidth="12" fill="none" className="text-primary" strokeDasharray="553" strokeDashoffset="138" strokeLinecap="round" />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="oklch(0.52 0.28 28)" />
                            <stop offset="50%" stopColor="oklch(0.75 0.18 340)" />
                            <stop offset="100%" stopColor="oklch(0.62 0.24 340)" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Medal size={32} className="text-primary mb-2" weight="fill" />
                        <span className="text-4xl font-bold text-foreground">75</span>
                        <span className="text-sm text-muted-foreground">RIS Score</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-understand">72</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Understand</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-align">78</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Align</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-elevate">75</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Elevate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-align/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Ready to Transform Your Relationship?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Join thousands of individuals and couples using LoveSpark to build stronger, healthier relationships through AI-powered intelligence.
            </p>
            <Button 
              size="lg"
              onClick={() => onNavigate('register')}
              className="text-base px-10 py-6 bg-gradient-to-r from-primary via-secondary to-align hover:opacity-90 transition-opacity"
            >
              Get Started Free
              <Sparkle className="ml-2" weight="fill" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-card border-t border-border/40 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Logo />
                <span className="text-lg font-semibold text-foreground">LoveSpark</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-first relationship intelligence platform for high-achieving individuals and couples.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => onNavigate('dashboard')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('ai-coach')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    AI Coach
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('pricing')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => onNavigate('about')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('blog')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('contact')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 mt-12 pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} LoveSpark. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
