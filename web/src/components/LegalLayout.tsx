import { Link } from 'react-router-dom'
import { PublicHeader } from '@/components/PublicHeader'
import { Logo } from '@/components/Logo'
import { useMarketingNavigation } from '@/hooks/useMarketingNavigation'
import type { AppView } from '@/App'

interface LegalLayoutProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  const handleNavigate = useMarketingNavigation()

  const handleNavClick = (view: AppView) => {
    handleNavigate(view)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <PublicHeader currentView="landing" onNavigate={handleNavigate} />

      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-align/5" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">{title}</h1>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground/80">
            {children}
          </div>
        </div>
      </section>

      <footer className="bg-card border-t border-border/40 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <Logo />
              </div>
              <p className="text-sm text-muted-foreground">
                AI-first relationship intelligence platform for high-achieving individuals and couples.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => handleNavClick('landing')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('pricing')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => handleNavClick('about')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('contact')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/refund" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Refund Policy
                  </Link>
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
