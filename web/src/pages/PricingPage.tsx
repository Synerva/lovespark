import { Pricing, type AppView as PricingView } from '@/modules/Pricing'
import { useMarketingNavigation } from '@/hooks/useMarketingNavigation'
import { PublicHeader } from '@/components/PublicHeader'
import { Logo } from '@/components/Logo'

export function PricingPage() {
  const navigate = useMarketingNavigation()

  const handleNavigate = (view: PricingView) => {
    if (view === 'dashboard') {
      navigate('landing')
      return
    }

    navigate(view as Parameters<typeof navigate>[0])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <PublicHeader currentView="pricing" onNavigate={handleNavigate as (view: import('@/App').AppView) => void} />

      <Pricing onNavigate={handleNavigate} showBackButton={false} isMarketingPage={true} />

      <footer className="bg-card border-t border-border/40 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Logo showText={false} />
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
                  <button onClick={() => handleNavigate('landing')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('pricing')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => handleNavigate('about')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('contact')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
