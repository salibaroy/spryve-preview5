import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Compass, Hammer, Layers } from 'lucide-react'
import { Band, ReplayButton, SectionIntro } from './parts'
import { BuildProcess } from '@/components/build/BuildProcess'
import { SpryveMark } from '@/components/ui'
import { BUILD_SERVICES } from '@/lib/data'
import { useSequence } from '@/lib/hooks'

const ease = [0.22, 1, 0.36, 1] as const

/* ========================================================================== */
/* 06 — Spryve Build (optional)                                                */
/* ========================================================================== */

export function BuildStory() {
  return (
    <Band id="build">
      <div className="container-site">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <SectionIntro
            index="06"
            eyebrow="Spryve Build · optional"
            title={
              <>
                Hands-on help, <span className="text-lime">when you want it.</span>
              </>
            }
          />
          <div className="lg:pb-1">
            <p className="lede">
              Spryve Build is an optional service. Our team can help you refine an idea and design or develop a website, prototype or product — step by step, with you. Most founders use Spryve without it.
            </p>
          </div>
        </div>

        <div className="border-line bg-raised mt-12 rounded-[24px] border p-5 sm:p-8">
          <BuildProcess />
        </div>

        <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-2" aria-label="What Spryve Build can help with">
            {BUILD_SERVICES.map((s) => (
              <li key={s.id} className="border-line text-fg-2 rounded-full border px-3 py-1.5 text-[0.8125rem]">
                {s.label}
              </li>
            ))}
          </ul>
          <Link to="/build" className="btn btn-primary shrink-0 self-start">
            Explore Spryve Build
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </Band>
  )
}

/* ========================================================================== */
/* 07 — About: the Spryve Nexus + who we are                                    */
/* ========================================================================== */

const C = { x: 200, y: 150 }
const SOURCES = [
  { id: 'opp', label: 'Opportunities', x: 46, y: 36, color: 'var(--brand-secondary)', row: 'Programmes, funding, events' },
  { id: 'know', label: 'Knowledge', x: 354, y: 36, color: 'var(--brand-tertiary)', row: 'Guides, templates, courses' },
  { id: 'people', label: 'People', x: 46, y: 264, color: 'var(--text-1)', row: 'Founders Hub' },
  { id: 'build', label: 'Building support', x: 354, y: 264, color: 'var(--brand-secondary)', row: 'Spryve Build (optional)' },
]

/* Each signal sweeps in on a slight clockwise arc, so the four read as one converging motion. */
const curve = (s: (typeof SOURCES)[number]) => {
  const dx = C.x - s.x
  const dy = C.y - s.y
  const len = Math.hypot(dx, dy)
  const bend = 46
  const cx = (s.x + C.x) / 2 + (-dy / len) * bend
  const cy = (s.y + C.y) / 2 + (dx / len) * bend
  return `M ${s.x} ${s.y} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${C.x} ${C.y}`
}

const RESULT = [
  { id: 'opp', text: 'Opportunities that fit your stage' },
  { id: 'know', text: 'Guides and the lesson you’re on' },
  { id: 'people', text: 'Founders worth meeting' },
  { id: 'build', text: 'Building help — only if you ask' },
]

/*
 * 0 four separate signals · 1 they travel inward · 2 the core forms ·
 * 3 one founder experience, then rest (no loop).
 */
const NEXUS_TIMES = [500, 1500, 2200]

function Nexus() {
  const scene = useSequence(NEXUS_TIMES)
  const phase = scene.phase
  return (
    <div ref={scene.ref} className="relative">
      <div className="border-line bg-base relative overflow-hidden rounded-[24px] border p-4 sm:p-6">
        <div className="relative">
          <svg viewBox="0 0 400 300" className="h-auto w-full" role="img" aria-label="Four signals — opportunities, knowledge, people and building support — converge into one founder experience">
            <defs>
              <radialGradient id="nexus-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--brand-tertiary)" stopOpacity="0.45" />
                <stop offset="100%" stopColor="var(--brand-tertiary)" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* signal paths */}
            {SOURCES.map((s, i) => (
              <g key={s.id}>
                <path d={curve(s)} fill="none" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="2 4" />
                <motion.path
                  d={curve(s)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  initial={false}
                  animate={{ pathLength: phase >= 1 ? 1 : 0, opacity: phase >= 1 ? (phase >= 3 ? 0.55 : 0.9) : 0 }}
                  transition={{ duration: 0.9, ease, delay: phase === 1 ? i * 0.12 : 0 }}
                />
                {/* travelling signal — a short dash riding the normalised path, once */}
                {phase === 1 && (
                  <motion.path
                    d={curve(s)}
                    pathLength={1}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="0.06 1"
                    initial={{ strokeDashoffset: 0.06 }}
                    animate={{ strokeDashoffset: -1 }}
                    transition={{ duration: 0.9, ease, delay: i * 0.12 }}
                  />
                )}
              </g>
            ))}

            {/* sources */}
            {SOURCES.map((s, i) => (
              <motion.g key={s.id} initial={false} animate={{ opacity: phase >= 1 ? 1 : 0.55 }} transition={{ duration: 0.4, delay: phase === 1 ? i * 0.12 : 0 }}>
                <circle cx={s.x} cy={s.y} r="7" fill="var(--surface-2)" stroke={s.color} strokeWidth="1.5" />
                <circle cx={s.x} cy={s.y} r="2.5" fill={s.color} />
                <text x={s.x} y={s.y < C.y ? s.y - 14 : s.y + 22} textAnchor={s.x < C.x ? 'start' : 'end'} dx={s.x < C.x ? -8 : 8} fontSize="11" fontFamily="var(--font-sans)" fill="var(--text-1)">
                  {s.label}
                </text>
              </motion.g>
            ))}

            {/* core */}
            <motion.circle cx={C.x} cy={C.y} r="70" fill="url(#nexus-core)" initial={false} animate={{ opacity: phase >= 2 ? 1 : 0 }} transition={{ duration: 0.8 }} />
            <motion.g initial={false} animate={{ scale: phase === 2 ? 1 : phase > 2 ? 1.4 : 0.3, opacity: phase === 2 ? 1 : 0 }} transition={{ duration: 0.6, ease }} style={{ transformOrigin: `${C.x}px ${C.y}px` }}>
              <circle cx={C.x} cy={C.y} r="26" fill="var(--surface-1)" stroke="var(--brand-secondary)" strokeWidth="1.5" />
              <g transform={`translate(${C.x - 11} ${C.y - 11}) scale(0.92)`} color="var(--brand-secondary)">
                <path d="M3 17.5 9.2 10l4 4.4L21 5.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="21" cy="5.5" r="2" fill="currentColor" />
              </g>
            </motion.g>
          </svg>

          {/* the resolved founder experience — in the centre of the diagram, below it on phones */}
          <motion.div
            initial={false}
            animate={{ opacity: phase >= 3 ? 1 : 0, scale: phase >= 3 ? 1 : 0.85 }}
            transition={{ duration: 0.5, ease }}
            className="border-lime/45 bg-raised glow-lime relative mx-auto mt-3 max-w-[340px] rounded-[16px] border p-3 sm:absolute sm:top-1/2 sm:left-1/2 sm:mt-0 sm:w-[54%] sm:-translate-x-1/2 sm:-translate-y-1/2"
            aria-hidden={phase < 3}
          >
            <p className="eyebrow mb-1.5 flex items-center gap-2 !text-[0.5625rem]">
              <SpryveMark className="text-lime h-3 w-3" />
              One founder experience
            </p>
            {RESULT.map((r, i) => {
              const src = SOURCES.find((x) => x.id === r.id)!
              return (
                <motion.div
                  key={r.id}
                  initial={false}
                  animate={{ opacity: phase >= 3 ? 1 : 0, x: phase >= 3 ? 0 : -6 }}
                  transition={{ duration: 0.35, delay: phase >= 3 ? 0.15 + i * 0.08 : 0 }}
                  className="border-line flex items-center gap-2 border-t py-1 first:border-t-0"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: src.color }} />
                  <span className="text-fg truncate text-[0.6875rem] sm:text-[0.75rem]">{r.text}</span>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-fg-2 text-[0.75rem]">The Spryve Nexus · four kinds of support, one place</p>
        <ReplayButton onClick={scene.replay} />
      </div>
    </div>
  )
}

export function About() {
  const facts = [
    { icon: Layers, title: 'We bring it together', body: 'Opportunities, knowledge, people and building support in one place, ordered around what you’re working on.' },
    { icon: Compass, title: 'We point to the source', body: 'Listings explain an opportunity and send you to the provider. We don’t run programmes, fund companies or give legal advice.' },
    { icon: Hammer, title: 'We help build — if you ask', body: 'Spryve Build is optional, hands-on support for shaping, designing and developing digital products.' },
  ]
  return (
    <Band id="about" tone="raised">
      <div className="container-site grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <Nexus />
        <div>
          <SectionIntro index="07" eyebrow="About us" title="Who we are" />
          <p className="lede mt-5">Spryve is a platform for founders. We’re building one understandable place for the startup world around you — so the time you spend searching goes back into building your company.</p>
          <ul className="mt-8 flex flex-col gap-5">
            {facts.map((f, i) => (
              <motion.li key={f.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5, ease }} className="flex gap-4">
                <span className="border-line bg-base text-lime grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border">
                  <f.icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <span>
                  <span className="font-display text-fg block text-[1rem] font-semibold">{f.title}</span>
                  <span className="text-fg-2 mt-1 block text-[0.9375rem]">{f.body}</span>
                </span>
              </motion.li>
            ))}
          </ul>
          <div className="border-line-strong mt-8 rounded-[16px] border border-dashed px-4 py-3.5">
            <p className="text-fg text-[0.875rem] font-medium">Team and founding story — to be added</p>
            <p className="text-fg-2 mt-1 text-[0.8125rem]">Placeholder for the real team, photos and story once confirmed. No names or claims have been invented here.</p>
          </div>
        </div>
      </div>
    </Band>
  )
}

/* ========================================================================== */
/* 08 — Invitation                                                              */
/* ========================================================================== */

export function FinalCTA() {
  return (
    <section className="band relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] opacity-35 blur-[110px]"
        style={{ background: 'radial-gradient(40% 60% at 50% 100%, color-mix(in oklab, var(--brand-secondary) 40%, transparent), transparent)' }}
        aria-hidden
      />
      <div className="container-site relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="border-line-strong bg-raised mx-auto max-w-3xl rounded-[28px] border px-6 py-12 text-center sm:px-12"
        >
          <p className="eyebrow mb-4">Ready when you are</p>
          <h2 className="t-section mx-auto max-w-[16ch] text-balance">
            Step into <span className="text-lime">your startup world.</span>
          </h2>
          <p className="lede mx-auto mt-4">Create an account to get a dashboard shaped around your stage — or look around the sample workspace first.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn btn-primary">
              Create account
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/app" className="btn btn-secondary">
              Preview the dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
