import { BookOpen, Hammer, LayoutGrid, Target, UserRound, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavChild {
  label: string
  to: string
  /** Only match this exact path (for "overview" children that share a prefix). */
  end?: boolean
  badge?: 'unread'
}

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
  children?: NavChild[]
}

/**
 * Workspace IA for Preview 5. Saved is intentionally NOT a top-level item —
 * it lives as a compact section on the Dashboard, plus a "Saved" view inside
 * Opportunities and Library, all reading the same mock saved state.
 */
export const primaryNav: NavItem[] = [
  { label: 'Dashboard', to: '/app', icon: LayoutGrid, end: true },
  {
    label: 'Founders Hub',
    to: '/app/hub',
    icon: Users,
    children: [
      { label: 'Hub overview', to: '/app/hub', end: true },
      { label: 'My company', to: '/app/hub/my-company' },
      { label: 'Messages', to: '/app/hub/messages', badge: 'unread' },
    ],
  },
  {
    label: 'Opportunities',
    to: '/app/opportunities',
    icon: Target,
    children: [
      { label: 'Accelerators', to: '/app/opportunities/accelerators' },
      { label: 'Incubators', to: '/app/opportunities/incubators' },
      { label: 'Funding opportunities', to: '/app/opportunities/funding' },
      { label: 'Events', to: '/app/opportunities/events' },
      { label: 'Services', to: '/app/opportunities/services' },
    ],
  },
  {
    label: 'Library',
    to: '/app/library',
    icon: BookOpen,
    children: [
      { label: 'Resources', to: '/app/library/resources' },
      { label: 'Templates', to: '/app/library/templates' },
      { label: 'Learn', to: '/app/library/learn' },
    ],
  },
  { label: 'Spryve Build', to: '/app/build', icon: Hammer },
]

/** Pinned to the bottom of the sidebar. Opens Profile first. */
export const accountNav: NavItem = {
  label: 'Account',
  to: '/app/account',
  icon: UserRound,
  children: [
    { label: 'Profile', to: '/app/account', end: true },
    { label: 'Settings', to: '/app/account/settings' },
  ],
}

export function isActive(pathname: string, to: string, end?: boolean) {
  if (end) return pathname === to || pathname === `${to}/`
  return pathname === to || pathname.startsWith(`${to}/`)
}

/** Parent is active when it or any child matches (children like /app/hub/company/x included). */
export function isParentActive(pathname: string, item: NavItem) {
  if (item.end) return isActive(pathname, item.to, true)
  if (isActive(pathname, item.to)) return true
  return (item.children ?? []).some((c) => isActive(pathname, c.to, c.end))
}
