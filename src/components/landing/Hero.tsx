import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowDown, ArrowRight, Compass, Signpost, Users } from 'lucide-react'
import { useCalm } from '@/lib/hooks'

const ease = [0.22, 1, 0.36, 1] as const

/* The three promises the rest of the page proves, in order. */
const PROMISES = [
  { n: '01', icon: Compass, title: 'Discover', body: 'Opportunities and knowledge that fit your stage.' },
  { n: '02', icon: Users, title: 'Connect', body: 'Founders building beside you, in Founders Hub.' },
  { n: '03', icon: Signpost, title: 'Move', body: 'Your next step, clear on one dashboard.' },
]

/** A line of display type that wipes up from behind a mask — quick, so the headline reads almost at once. */
function Line({ children, delay, calm }: { children: React.ReactNode; delay: number; calm: boolean }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span className="block" initial={calm ? false : { y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.6, ease, delay }}>
        {children}
      </motion.span>
    </span>
  )
}

/**
 * The opening says what Spryve is and nothing else: one statement, one line
 * of support, two actions and three promises. No interface — the dashboard is
 * the payoff further down. As you scroll away the copy lifts and the horizon
 * dims (one of the few scroll-linked effects on the page).
 */
export function Hero() {
  const calm = useCalm()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -80])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.15])
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.25])
  const fade = (delay: number) => ({
    initial: calm ? false : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease, delay },
  })

  return (
    <section ref={ref} className="relative isolate overflow-hidden pt-[68px]">
      {/* atmosphere: a quiet horizon, not a picture */}
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-25 [mask-image:radial-gradient(70%_55%_at_30%_40%,black,transparent)]" aria-hidden />
      <motion.div style={calm ? undefined : { scale: glowScale }} className="pointer-events-none absolute inset-x-0 bottom-[-30%] h-[70%]" aria-hidden>
        <div
          className="h-full w-full opacity-45 blur-[90px]"
          style={{ background: 'radial-gradient(45% 55% at 38% 60%, color-mix(in oklab, var(--brand-secondary) 55%, transparent), transparent 70%), radial-gradient(40% 50% at 70% 55%, color-mix(in oklab, var(--brand-tertiary) 70%, transparent), transparent 70%)' }}
        />
      </motion.div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--brand-secondary)_45%,transparent)] to-transparent" aria-hidden />

      <motion.div style={calm ? undefined : { y: copyY, opacity: copyOpacity }} className="container-site relative flex min-h-[calc(100svh-68px)] flex-col pt-14 pb-8 sm:pt-20">
        <div className="flex flex-1 flex-col justify-center">
          <motion.p {...fade(0)} className="eyebrow mb-6 flex items-center gap-2.5">
            <span className="bg-lime h-1.5 w-1.5 rounded-full" aria-hidden />
            Spryve · the founder platform
          </motion.p>
          <h1 className="t-display max-w-[13ch]">
            <Line delay={0.04} calm={calm}>
              Everything a founder needs.
            </Line>
            <Line delay={0.12} calm={calm}>
              <span className="text-lime">One place.</span>
            </Line>
          </h1>
          <motion.p {...fade(0.25)} className="lede mt-7 max-w-[54ch] !text-[1.0625rem] sm:!text-[1.1875rem]">
            Spryve is where founders discover relevant opportunities and knowledge, connect with other founders, and see their next move — in one
            clear place.
          </motion.p>
          <motion.div {...fade(0.32)} className="mt-9 flex flex-wrap gap-3">
            <Link to="/register" className="btn btn-primary">
              Create account
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a href="#problem" className="btn btn-secondary">
              See how it works
              <ArrowDown className="h-4 w-4" aria-hidden />
            </a>
          </motion.div>
        </div>

        {/* the three promises — what the page goes on to show */}
        <div className="border-line mt-14 grid gap-px overflow-hidden rounded-[20px] border bg-[var(--line)] sm:grid-cols-3">
          {PROMISES.map((p, i) => (
            <motion.div key={p.title} {...fade(0.4 + i * 0.07)} className="bg-base/80 flex items-start gap-3.5 px-5 py-4 backdrop-blur-sm sm:py-5">
              <span className="border-line-strong text-lime grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border">
                <p.icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="flex items-baseline gap-2">
                  <span className="text-fg-2 font-mono text-[0.625rem]">{p.n}</span>
                  <span className="font-display text-fg text-[1rem] font-semibold">{p.title}</span>
                </span>
                <span className="text-fg-2 mt-0.5 block text-[0.875rem]">{p.body}</span>
              </span>
            </motion.div>
          ))}
        </div>
        <p className="text-fg-2 mt-4 text-[0.75rem]">Concept preview · all content is illustrative</p>
      </motion.div>
    </section>
  )
}
