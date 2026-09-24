import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Bell, Bookmark, CornerDownLeft, FlaskConical, LogOut, Menu, Search, Settings, UserRound } from 'lucide-react'
import { DesktopSidebar, EXPANDED, MobileSidebar, RAIL } from './Sidebar'
import { Avatar, Logo, Modal } from '@/components/ui'
import { useToast } from '@/components/ui/feedback'
import { companies, initialsOf, library, opportunities, OPP_CATEGORIES, LIB_CATEGORIES } from '@/lib/data'
import { useStore, type Scenario } from '@/lib/store'
import { cn } from '@/lib/utils'

const SIDEBAR_KEY = 'spryve.p5.sidebar'

function readExpanded() {
  try {
    const v = localStorage.getItem(SIDEBAR_KEY)
    if (v !== null) return v === '1'
  } catch {
    /* ignore */
  }
  return typeof window !== 'undefined' ? window.innerWidth >= 1360 : true
}

/* -------------------------------------------------------------------------- */
/* Small popover with outside-click + Escape handling                          */
/* -------------------------------------------------------------------------- */

function usePopover() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  return { open, setOpen, ref }
}

const popIn = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.98 },
  transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
}

function AccountMenu() {
  const { state } = useStore()
  const { open, setOpen, ref } = usePopover()
  const navigate = useNavigate()
  const items = [
    { label: 'Profile', to: '/app/account', icon: UserRound },
    { label: 'Settings', to: '/app/account/settings', icon: Settings },
    { label: 'Saved', to: '/app/saved', icon: Bookmark },
  ]
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu" className="rounded-full">
        <Avatar initials={initialsOf(state.profile.name) || 'SF'} size="sm" accent="lime" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div {...popIn} role="menu" className="card absolute top-11 right-0 z-50 w-64 p-2 shadow-2xl">
            <div className="border-line mb-1 border-b px-3 pt-2 pb-3">
              <p className="text-fg text-[0.875rem] font-medium">{state.profile.name}</p>
              <p className="text-fg-2 truncate text-[0.75rem]">{state.profile.email || 'No email added'}</p>
            </div>
            {items.map(({ label, to, icon: Icon }) => (
              <Link key={to} to={to} role="menuitem" onClick={() => setOpen(false)} className="text-fg hover:bg-lift flex items-center gap-3 rounded-[10px] px-3 py-2 text-[0.875rem]">
                <Icon className="text-fg-2 h-4 w-4" aria-hidden />
                {label}
              </Link>
            ))}
            <div className="border-line my-1 border-t" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                navigate('/')
              }}
              className="text-fg-2 hover:text-fg hover:bg-lift flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-[0.875rem]"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Leave preview workspace
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Notifications() {
  const { unread, state } = useStore()
  const { open, setOpen, ref } = usePopover()
  const notes = [
    ...(unread > 0 ? [{ text: `${unread} unread message${unread > 1 ? 's' : ''} in Founders Hub`, to: '/app/hub/messages', fresh: true }] : []),
    { text: 'Launchway Health Accelerator closes in 11 days', to: '/app/opportunities/item/launchway-health', fresh: true },
    { text: 'Pricing workshop for B2B founders is this Friday', to: '/app/opportunities/item/pricing-workshop', fresh: false },
    ...(!state.company ? [{ text: 'Your company profile has not been created yet', to: '/app/hub/my-company', fresh: false }] : []),
  ]
  const hasFresh = notes.some((n) => n.fresh)
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Notifications" className="text-fg-2 hover:text-fg hover:bg-raised relative rounded-full p-2">
        <Bell className="h-[18px] w-[18px]" aria-hidden />
        {hasFresh && <span className="bg-lime absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full" aria-hidden />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div {...popIn} className="card absolute top-11 right-0 z-50 w-[min(88vw,320px)] p-2 shadow-2xl">
            <p className="eyebrow px-3 pt-2 pb-2">Notifications · sample</p>
            {notes.map((n) => (
              <Link key={n.text} to={n.to} onClick={() => setOpen(false)} className="hover:bg-lift flex items-start gap-3 rounded-[10px] px-3 py-2.5 text-[0.8125rem]">
                <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', n.fresh ? 'bg-lime' : 'bg-fg/20')} aria-hidden />
                <span className="text-fg">{n.text}</span>
              </Link>
            ))}
            <Link to="/app/account/settings" onClick={() => setOpen(false)} className="text-fg-2 hover:text-fg block px-3 pt-2 pb-1 text-[0.75rem]">
              Notification settings
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Search palette — searches the sample content and the workspace pages        */
/* -------------------------------------------------------------------------- */

interface Hit {
  label: string
  group: string
  to: string
}

const PAGES: Hit[] = [
  { label: 'Dashboard', group: 'Go to', to: '/app' },
  { label: 'Founders Hub', group: 'Go to', to: '/app/hub' },
  { label: 'My company', group: 'Go to', to: '/app/hub/my-company' },
  { label: 'Messages', group: 'Go to', to: '/app/hub/messages' },
  ...OPP_CATEGORIES.map((c) => ({ label: c.label, group: 'Go to', to: `/app/opportunities/${c.id}` })),
  ...LIB_CATEGORIES.map((c) => ({ label: c.label, group: 'Go to', to: `/app/library/${c.id}` })),
  { label: 'Spryve Build', group: 'Go to', to: '/app/build' },
  { label: 'Saved', group: 'Go to', to: '/app/saved' },
  { label: 'Profile', group: 'Go to', to: '/app/account' },
  { label: 'Settings', group: 'Go to', to: '/app/account/settings' },
]

const INDEX: Hit[] = [
  ...PAGES,
  ...opportunities.map((o) => ({ label: o.title, group: OPP_CATEGORIES.find((c) => c.id === o.category)!.label, to: `/app/opportunities/item/${o.id}` })),
  ...library.map((l) => ({ label: l.title, group: `Library · ${LIB_CATEGORIES.find((c) => c.id === l.category)!.label}`, to: `/app/library/item/${l.id}` })),
  ...companies.map((c) => ({ label: c.name, group: 'Founders Hub', to: `/app/hub/company/${c.slug}` })),
]

function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [cursor, setCursor] = useState(0)
  const navigate = useNavigate()
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return PAGES.slice(0, 8)
    return INDEX.filter((h) => h.label.toLowerCase().includes(s) || h.group.toLowerCase().includes(s)).slice(0, 10)
  }, [q])

  useEffect(() => {
    if (open) {
      setQ('')
      setCursor(0)
    }
  }, [open])

  const go = (h: Hit) => {
    onClose()
    navigate(h.to)
  }

  return (
    <Modal open={open} onClose={onClose} title="Search Spryve" width="max-w-lg">
      <div className="border-line-strong focus-within:border-electric flex items-center gap-2 rounded-[12px] border px-3">
        <Search className="text-fg-2 h-4 w-4" aria-hidden />
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setCursor(0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setCursor((c) => Math.min(c + 1, hits.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setCursor((c) => Math.max(c - 1, 0))
            } else if (e.key === 'Enter' && hits[cursor]) go(hits[cursor])
          }}
          placeholder="Try “grant”, “pricing” or “Beirut”"
          className="text-fg h-11 w-full bg-transparent text-[0.9375rem] outline-none"
          aria-label="Search"
        />
      </div>
      <ul className="mt-3 max-h-[50vh] overflow-y-auto" role="listbox" aria-label="Results">
        {hits.length === 0 && <li className="text-fg-2 px-3 py-6 text-center text-[0.875rem]">Nothing in the sample content matches “{q}”.</li>}
        {hits.map((h, i) => (
          <li key={h.to + h.label} role="option" aria-selected={i === cursor}>
            <button
              type="button"
              onMouseEnter={() => setCursor(i)}
              onClick={() => go(h)}
              className={cn('flex w-full items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 text-left', i === cursor && 'bg-electric/14')}
            >
              <span className="text-fg truncate text-[0.875rem]">{h.label}</span>
              <span className="text-fg-2 flex shrink-0 items-center gap-2 text-[0.75rem]">
                {h.group}
                {i === cursor && <CornerDownLeft className="h-3 w-3" aria-hidden />}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  )
}

/* -------------------------------------------------------------------------- */
/* Preview data — switch between demo scenarios. Clearly not authentication.   */
/* -------------------------------------------------------------------------- */

function PreviewDataDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, loadScenario } = useStore()
  const toast = useToast()
  const navigate = useNavigate()
  const options: { id: Scenario; title: string; body: string }[] = [
    { id: 'sample', title: 'Sample founder — no company yet', body: 'Saved items, messages and course progress, but no company profile. Good for trying company creation.' },
    { id: 'published', title: 'Sample founder — company published', body: 'Same founder with a company profile already published, to review the My company overview.' },
    { id: 'new', title: 'Brand-new account', body: 'Nothing saved, no company, no messages. Shows every empty state and the onboarding steps.' },
  ]
  return (
    <Modal open={open} onClose={onClose} title="Preview data" width="max-w-lg">
      <p className="text-fg-2 text-[0.875rem]">
        This workspace runs on sample content stored only in this browser. There is no real account, database or sign-in. Pick a
        scenario to review different states.
      </p>
      <div className="mt-4 flex flex-col gap-2" role="radiogroup" aria-label="Scenario">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={state.scenario === o.id}
            onClick={() => {
              loadScenario(o.id)
              toast(`Loaded: ${o.title}`)
              onClose()
              navigate('/app')
            }}
            className={cn('rounded-[14px] border px-4 py-3 text-left transition-colors', state.scenario === o.id ? 'border-electric/60 bg-electric/12' : 'border-line hover:border-line-strong')}
          >
            <span className="text-fg block text-[0.9375rem] font-medium">{o.title}</span>
            <span className="text-fg-2 mt-0.5 block text-[0.8125rem]">{o.body}</span>
          </button>
        ))}
      </div>
      <p className="text-fg-2 mt-4 text-[0.75rem]">Switching resets changes you made in this browser.</p>
    </Modal>
  )
}

/* -------------------------------------------------------------------------- */

export function AppShell() {
  const [expanded, setExpanded] = useState(readExpanded)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [dataOpen, setDataOpen] = useState(false)
  const { pathname } = useLocation()

  const toggle = useCallback(() => {
    setExpanded((v) => {
      try {
        localStorage.setItem(SIDEBAR_KEY, v ? '0' : '1')
      } catch {
        /* ignore */
      }
      return !v
    })
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="bg-base min-h-dvh">
      <DesktopSidebar expanded={expanded} onToggle={toggle} />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <PreviewDataDialog open={dataOpen} onClose={() => setDataOpen(false)} />

      <div style={{ '--sb': `${expanded ? EXPANDED : RAIL}px` } as React.CSSProperties} className="transition-[padding] duration-500 ease-[var(--ease-out)] lg:pl-[var(--sb)]">
        <header className="border-line bg-base/85 sticky top-0 z-30 border-b backdrop-blur-xl">
          <div className="flex h-[64px] items-center gap-2 px-4 md:gap-3 md:px-8">
            <button type="button" onClick={() => setMobileOpen(true)} className="text-fg-2 hover:text-fg -ml-1 rounded-lg p-2 lg:hidden" aria-label="Open navigation">
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <Link to="/app" className="lg:hidden" aria-label="Spryve dashboard">
              <Logo compact />
            </Link>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="border-line bg-raised text-fg-2 hover:border-line-strong hover:text-fg flex h-10 items-center gap-2.5 rounded-full border px-3.5 text-[0.875rem] transition-colors max-md:ml-auto max-md:w-10 max-md:justify-center max-md:px-0 md:w-[320px]"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden />
              <span className="max-md:sr-only">Search Spryve</span>
              <kbd className="border-line ml-auto hidden rounded border px-1.5 py-0.5 font-mono text-[0.6875rem] md:block">⌘K</kbd>
            </button>

            <div className="flex items-center gap-1 md:ml-auto md:gap-2">
              <button
                type="button"
                onClick={() => setDataOpen(true)}
                className="border-electric/40 text-fg hover:bg-electric/12 flex h-9 items-center gap-1.5 rounded-full border px-3 text-[0.75rem] font-medium"
                title="Concept preview — sample data only"
              >
                <FlaskConical className="text-electric h-3.5 w-3.5" aria-hidden />
                <span className="max-sm:hidden">Preview data</span>
              </button>
              <Link to="/" className="text-fg-2 hover:text-fg hidden items-center gap-1.5 rounded-full px-3 py-2 text-[0.8125rem] xl:flex">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Website
              </Link>
              <Notifications />
              <AccountMenu />
            </div>
          </div>
        </header>

        <main className="px-4 pt-6 pb-24 md:px-8 md:pt-8">
          <div className="mx-auto w-full max-w-[1240px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
