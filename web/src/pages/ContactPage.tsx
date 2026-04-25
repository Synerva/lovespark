import { ContactPage as ContactContent } from '@/modules/ContactPage'
import { useMarketingNavigation } from '@/hooks/useMarketingNavigation'

export function ContactPage() {
  const handleNavigate = useMarketingNavigation()

  return <ContactContent onNavigate={handleNavigate} />
}
