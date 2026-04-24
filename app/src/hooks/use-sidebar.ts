import { useState } from 'react'
import { useLocalStorageState } from './use-local-storage-state'

const MIN_WIDTH = 200
const MAX_WIDTH = 400
const DEFAULT_WIDTH = 256
const COLLAPSED_WIDTH = 80

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useLocalStorageState<boolean>('sidebar-collapsed', false)
  const [sidebarWidth, setSidebarWidth] = useLocalStorageState<number>('sidebar-width', DEFAULT_WIDTH)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  const currentWidth = sidebarWidth ?? DEFAULT_WIDTH
  const clampedWidth = Math.min(Math.max(currentWidth, MIN_WIDTH), MAX_WIDTH)
  
  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev)
  }
  
  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev)
  }
  
  const closeMobileSidebar = () => {
    setIsMobileOpen(false)
  }
  
  return {
    isCollapsed,
    sidebarWidth: isCollapsed ? COLLAPSED_WIDTH : clampedWidth,
    isMobileOpen,
    setIsCollapsed,
    setSidebarWidth,
    setIsMobileOpen,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
    minWidth: MIN_WIDTH,
    maxWidth: MAX_WIDTH,
    collapsedWidth: COLLAPSED_WIDTH,
  }
}
