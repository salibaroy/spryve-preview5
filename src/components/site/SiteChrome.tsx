import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui'
import { cn } from '@/lib/utils'

const LINKS = [
  { label: 'Dashboard', href: '/#dashboard' },
  { label: 'Founders Hub', href: '/#founders-hub' },
  { label: 'Opportunities', href: '/#opportunities' },
  { label: 'Spryve Build', href: '/build' },
  { label: 'About', href: '/#about' },
]

function NavAnchor({ href, className, onClick, children }: { href: string; className?: string; onClick?: () => void; children: React.ReactNode }) {
  const { pathname } = useLocation()
  if (href.startsWith('/#')) {
    const hash = href.slice(1)
    // On the landing page, a plain hash keeps the scroll smooth and native.
    return pathname === '/' ? (
      <a href={hash} className={className} onClick={onClick}>
        {children}
      </a>
    ) : (
      <Link to={href} className={className} onClick={onClick}>
        {children}
      </Link>
    )
  }
  return (
    <Link to={href} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header className={cn('fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300', scrolled ? 'bg-base/80 border-line backdrop-blur-xl' : 'border-transparent')}>
        <div className="container-site flex h-[68px] items-center justify-between gap-6">
          <Link to="/" aria-label="Spryve home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {LINKS.map((l) => (
              <NavAnchor key={l.label} href={l.href} className="text-fg-2 hover:text-fg text-[0.875rem] transition-colors">
                {l.label}
              </NavAnchor>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/sign-in" className="btn btn-quiet btn-sm max-sm:hidden">
              Sign in
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Create account
            </Link>
            <button type="button" onClick={() => setOpen(true)} className="text-fg-2 hover:text-fg -mr-2 rounded-lg p-2 lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-base fixed inset-0 z-[60] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="container-site flex h-[68px] items-center justify-between">
              <Logo />
              <button type="button" onClick={() => setOpen(false)} className="border-line text-fg-2 hover:text-fg rounded-full border p-2" aria-label="Close menu">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <nav className="container-site mt-4 flex flex-col" aria-label="Mobile">
              {LINKS.map((l, i) => (
                <motion.div key={l.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i, duration: 0.35 }}>
                  <NavAnchor href={l.href} onClick={() => setOpen(false)} className="font-display border-line block border-b py-4 text-[1.375rem] font-semibold">
                    {l.label}
                  </NavAnchor>
                </motion.div>
              ))}
              <div className="mt-8 grid gap-3">
                <Link to="/register" onClick={() => setOpen(false)} className="btn btn-primary w-full">
                  Create account
                </Link>
                <Link to="/sign-in" onClick={() => setOpen(false)} className="btn btn-secondary w-full">
                  Sign in
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function PreviewRibbon() {
  return (
    <p className="text-fg-2 font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
      Concept preview 5 · Illustrative sample content · No real accounts or data
    </p>
  )
}

export function SiteFooter() {
  const cols = [
    {
      title: 'Product',
      links: [
        { label: 'Dashboard', to: '/app' },
        { label: 'Founders Hub', to: '/app/hub' },
        { label: 'Opportunities', to: '/app/opportunities' },
        { label: 'Library', to: '/app/library' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Spryve Build', to: '/build' },
        { label: 'Create account', to: '/register' },
        { label: 'Sign in', to: '/sign-in' },
      ],
    },
  ]
  return (
    <footer className="border-line border-t">
      <div className="container-site py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="text-fg-2 mt-4 max-w-[36ch] text-[0.875rem]">
              Your startup world in one place: a useful dashboard, the people building beside you, and optional hands-on help.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="eyebrow mb-3">{c.title}</p>
              <ul className="flex flex-col gap-2">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-fg-2 hover:text-fg text-[0.875rem]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-line mt-12 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <PreviewRibbon />
          <p className="text-fg-2 text-[0.75rem]">Spryve lists external opportunities and providers. It does not fund startups or provide legal services.</p>
        </div>
      </div>
    </footer>
  )
}
