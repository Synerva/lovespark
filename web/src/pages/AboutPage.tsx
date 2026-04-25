import { AboutPage as AboutContent } from '@/modules/AboutPage'
import { useMarketingNavigation } from '@/hooks/useMarketingNavigation'

export function AboutPage() {
  const handleNavigate = useMarketingNavigation()

  return <AboutContent onNavigate={handleNavigate} />
}
