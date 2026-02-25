import { useKV } from '@github/spark/hooks'

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useKV<boolean>('sidebar-collapsed', false)
  
  return {
    isCollapsed,
    setIsCollapsed,
    toggleSidebar: () => setIsCollapsed((prev) => !prev),
  }
}
