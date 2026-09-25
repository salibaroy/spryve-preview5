import { AnimatePresence, motion } from 'motion/react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowLeft, PanelLeft, X } from 'lucide-react'
import { accountNav, isActive, isParentActive, primaryNav, type NavItem } from './nav-config'
import { Avatar, Logo } from '@/components/ui'
import { initialsOf } from '@/lib/data'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export const RAIL = 76
export const EXPANDED = 264

function Badge({ n }: { n: number }) {
  if (!n) return null
  return (
    <span className="bg-electric text-fg ml-auto grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 font-mono text-[0.625rem]" aria-label={`${n} unread`}>
      {n}
    </span>
  )
}

function NavRow({ item, expanded, onNavigate }: { item: NavItem; expanded: boolean; onNavigate?: () => void }) {
  const { pathname } = useLocation()
  const { unread } = useStore()
  const Icon = item.icon
  const active = isParentActive(pathname, item)
  const hasUnread = item.children?.some((c) => c.badge === 'unread') && unread > 0

  return (
    <li>
      <NavLink
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        title={expanded ? undefined : item.label}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group relative flex items-center rounded-[13px] transition-colors duration-300',
          expanded ? 'gap-3.5 px-3.5 py-2.5' : 'justify-center py-3',
          active ? 'bg-raised text-fg' : 'text-fg-2 hover:bg-raised/60 hover:text-fg',
        )}
      >
        {active && (
          <motion.span layoutId="nav-rail" className="bg-lime absolute top-1/2 left-0 h-5 w-[2px] -translate-y-1/2 rounded-full" transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} aria-hidden />
        )}
        <span className="relative">
          <Icon className={cn('h-[18px] w-[18px] shrink-0', active && 'text-lime')} aria-hidden />
          {!expanded && hasUnread && <span className="bg-electric absolute -top-1 -right-1 h-2 w-2 rounded-full" aria-hidden />}
        </span>
        {expanded && <span className="truncate text-[0.875rem] font-medium">{item.label}</span>}
        {expanded && hasUnread && !active && <Badge n={unread} />}
      </NavLink>

      <AnimatePresence initial={false}>
        {expanded && item.children && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-line mt-0.5 mb-1 ml-[29px] flex flex-col gap-0.5 border-l pl-3">
              {item.children.map((child) => {
                const on = isActive(pathname, child.to, child.end)
                return (
                  <li key={child.to}>
                    <Link
                      to={child.to}
                      onClick={onNavigate}
                      aria-current={on ? 'page' : undefined}
                      className={cn(
                        'flex items-center rounded-[9px] px-2.5 py-1.5 text-[0.8125rem] transition-colors duration-200',
                        on ? 'text-fg bg-electric/14' : 'text-fg-2 hover:text-fg',
                      )}
                    >
                      {child.label}
                      {child.badge === 'unread' && <Badge n={unread} />}
                    </Link>
                  </li>
                )
              })}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  )
}

function SidebarBody({ expanded, onToggle, onNavigate, mobile = false }: { expanded: boolean; onToggle?: () => void; onNavigate?: () => void; mobile?: boolean }) {
  const { state } = useStore()
  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-[68px] shrink-0 items-center', expanded ? 'justify-between px-5' : 'justify-center')}>
        <Link to="/app" onClick={onNavigate} aria-label="Spryve dashboard">
          <Logo compact={!expanded} />
        </Link>
        {!mobile && expanded && (
          <button type="button" onClick={onToggle} className="text-fg-2 hover:text-fg hover:bg-raised rounded-lg p-1.5" aria-label="Collapse navigation">
            <PanelLeft className="h-4 w-4" aria-hidden />
          </button>
        )}
        {mobile && (
          <button type="button" onClick={onNavigate} className="text-fg-2 hover:text-fg border-line rounded-full border p-2" aria-label="Close navigation">
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3" aria-label="Workspace">
        <ul className="flex flex-col gap-0.5">
          {primaryNav.map((item) => (
            <NavRow key={item.label} item={item} expanded={expanded} onNavigate={onNavigate} />
          ))}
        </ul>
      </nav>

      <div className="border-line shrink-0 border-t p-3">
        <ul>
          <NavRow item={accountNav} expanded={expanded} onNavigate={onNavigate} />
        </ul>
        <Link
          to="/app/account"
          onClick={onNavigate}
          title={expanded ? undefined : state.profile.name}
          className={cn('hover:bg-raised mt-1 flex items-center rounded-[13px] p-2 transition-colors', expanded ? 'gap-3' : 'justify-center')}
        >
          <Avatar initials={initialsOf(state.profile.name) || 'SF'} size="sm" accent="lime" />
          {expanded && (
            <span className="min-w-0 flex-1">
              <span className="text-fg block truncate text-[0.8125rem] font-medium">{state.profile.name}</span>
              <span className="text-fg-2 block truncate text-[0.75rem]">{state.company?.name ?? 'No company yet'}</span>
            </span>
          )}
        </Link>
        {mobile && (
          <Link to="/" onClick={onNavigate} className="btn btn-secondary mt-3 w-full">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to the website
          </Link>
        )}
        {!mobile && !expanded && (
          <button type="button" onClick={onToggle} className="text-fg-2 hover:text-fg mx-auto mt-2 flex rounded-lg p-2" aria-label="Expand navigation">
            <PanelLeft className="h-4 w-4 rotate-180" aria-hidden />
          </button>
        )}
      </div>
    </div>
  )
}

export function DesktopSidebar({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return (
    <motion.aside
      animate={{ width: expanded ? EXPANDED : RAIL }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="border-line bg-base fixed inset-y-0 left-0 z-40 hidden border-r lg:block"
    >
      <SidebarBody expanded={expanded} onToggle={onToggle} />
    </motion.aside>
  )
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <motion.button type="button" aria-label="Close navigation" tabIndex={-1} onClick={onClose} className="bg-base/80 absolute inset-0 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="bg-base border-line absolute inset-y-0 left-0 w-[86vw] max-w-[320px] border-r"
          >
            <SidebarBody expanded mobile onNavigate={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
