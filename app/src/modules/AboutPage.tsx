import { Button } from '@/components/ui/button'
import { PublicHeader } from '@/components/PublicHeader'
import { Logo } from '@/components/Logo'
import { Heart, Brain, TrendUp, Sparkle, Users, Target, Lightbulb } from '@phosphor-icons/react'
import type { AppView } from '@/App'

interface AboutPageProps {
  onNavigate: (view: AppView) => void
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <PublicHeader currentView="about" onNavigate={onNavigate} />

      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-align/5" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Sparkle className="text-primary" size={20} weight="fill" />
              <span className="text-sm font-medium text-primary">About LoveSpark</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
              Relationship Intelligence,{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-align bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              LoveSpark is the world's first AI-powered Relationship Intelligence Operating System designed for high-achieving individuals and couples who want to build deeper, healthier connections through data-driven insights and behavioral optimization.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <h2 className="text-4xl font-bold text-foreground mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  We believe that relationships are the foundation of a fulfilling life, yet most people navigate them without the tools, insights, or guidance they need to truly thrive.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  LoveSpark transforms relationship growth from guesswork into an intelligent, personalized journey. By combining psychology-backed frameworks with cutting-edge AI, we help you understand your patterns, align with your partner, and elevate your connection—one insight at a time.
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-align/20 rounded-3xl blur-3xl" />
                <div className="relative bg-card rounded-3xl border border-border/50 p-8 shadow-2xl">
                  <div className="flex items-center justify-center mb-6">
                    <Logo size={80} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-foreground mb-2">Intelligence-First</h3>
                    <p className="text-muted-foreground">
                      We're not therapy. We're not dating advice. We're a relationship operating system.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Why LoveSpark?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built on three core pillars that work together to optimize your relationship
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <div className="bg-card rounded-2xl border border-border/50 p-8 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-understand to-understand/70 flex items-center justify-center mb-6">
                  <Brain size={28} weight="fill" className="text-understand-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">UNDERSTAND</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Gain clarity on your attachment style, emotional patterns, and behavioral triggers through AI-powered assessments and insights.
                </p>
              </div>

              <div className="bg-card rounded-2xl border border-border/50 p-8 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-align to-align/70 flex items-center justify-center mb-6">
                  <Heart size={28} weight="fill" className="text-align-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">ALIGN</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Improve communication, set clear expectations, and strengthen your emotional connection with personalized, actionable guidance.
                </p>
              </div>

              <div className="bg-card rounded-2xl border border-border/50 p-8 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-elevate to-elevate/70 flex items-center justify-center mb-6">
                  <TrendUp size={28} weight="fill" className="text-elevate-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">ELEVATE</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Track your progress over time, build healthy relationship habits, and continuously optimize your Relationship Intelligence Score™.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-align/5 rounded-3xl p-12">
              <div className="text-center max-w-3xl mx-auto">
                <Target size={48} className="text-primary mx-auto mb-6" weight="fill" />
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Our Approach
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  LoveSpark is not about quick fixes or surface-level advice. We use a psychology-grounded, data-driven methodology to help you develop lasting relationship intelligence.
                </p>
                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                      <Lightbulb size={24} className="text-primary" weight="fill" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">AI-Powered Insights</h4>
                    <p className="text-sm text-muted-foreground">Real-time analysis of your patterns and behaviors</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-3">
                      <Users size={24} className="text-secondary" weight="fill" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">Psychology-Backed</h4>
                    <p className="text-sm text-muted-foreground">Frameworks rooted in attachment theory and behavioral science</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-elevate/20 flex items-center justify-center mb-3">
                      <TrendUp size={24} className="text-elevate" weight="fill" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">Continuous Growth</h4>
                    <p className="text-sm text-muted-foreground">Track progress and optimize your relationship over time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Join individuals and couples who are building stronger relationships through intelligence, not intuition alone.
            </p>
            <Button 
              size="lg"
              onClick={() => onNavigate('register')}
              className="text-base px-10 py-6 bg-gradient-to-r from-primary via-secondary to-align hover:opacity-90 transition-opacity"
            >
              Start Your Free Trial
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
