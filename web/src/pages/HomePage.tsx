import { LandingPage } from '@/modules/LandingPage'
import { useMarketingNavigation } from '@/hooks/useMarketingNavigation'

export function HomePage() {
  const handleNavigate = useMarketingNavigation()

  return <LandingPage onNavigate={handleNavigate} />
}
