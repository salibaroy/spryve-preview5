import { useCallback, useMemo, type RefObject } from 'react'
import { AnimatePresence, easeOut, motion, useTransform, type MotionValue } from 'motion/react'
import { ChevronsDown } from 'lucide-react'
import { ReplayButton } from './parts'
import { useDriven, useMedia, useScrollScene } from '@/lib/hooks'
import { cn } from '@/lib/utils'

/* ==========================================================================
   THE SPRYVE NEXUS — a creation story, after P1
   Origin (nothing) → Ignition (big bang) → Spryve (the universe forms) →
   Connections (a connected universe). Every element below is a function of
   one value, `p` (0..1), which follows the scroll through a short sticky
   stage — so scrolling back rewinds it. Stage tabs and Replay move `p`
   without moving the page; the next scroll hands control back.
   ========================================================================== */

const STAGES = [
  { name: 'Origin', sub: 'Nothing', title: 'Every ecosystem begins with one signal.', body: 'Before the programmes, the tabs and the group chats, there is a founder with an idea — one point of light in a quiet space.' },
  { name: 'Ignition', sub: 'Big Bang', title: 'Then possibility expands.', body: 'The idea meets the world. Opportunities, knowledge and people move outward at once — full of potential, not yet organised.' },
  { name: 'Spryve', sub: 'The universe forms', title: 'Spryve gives it structure.', body: 'Distinct paths emerge: opportunities that fit your stage, knowledge to act on them, founders who can help, and building support if you want it.' },
  { name: 'Connections', sub: 'A connected universe', title: 'One connected founder ecosystem.', body: 'Each part now informs the others — and at the centre, the one thing that matters most: your clear next step.' },
] as const

/* Scroll map. Holds between transitions give each stage a still, readable frame. */
const T = {
  bang: [0.14, 0.32] as const, // Origin holds 0–0.14, the burst plays out to 0.32
  form: [0.42, 0.62] as const, // Ignition holds, then the universe forms
  link: [0.7, 0.88] as const, // Spryve holds, then everything connects
}
const stageFor = (v: number) => (v < 0.23 ? 0 : v < 0.52 ? 1 : v < 0.79 ? 2 : 3)
/* Where each stage tab lands (the middle of its hold). */
const STAGE_AT = [0.07, 0.37, 0.66, 0.95]

const LIME = 'var(--brand-secondary)'
const BLUE = 'var(--brand-tertiary)'
const INK = 'var(--text-1)'

type P = { x: number; y: number }
const PARTS = [
  { id: 'opp', label: 'Opportunities', sub: 'Programmes · funding · events', short: 'Programmes, funding', color: LIME },
  { id: 'know', label: 'Knowledge', sub: 'Guides · templates · courses', short: 'Guides, courses', color: BLUE },
  { id: 'build', label: 'Building support', sub: 'Optional · Spryve Build', short: 'Optional', color: BLUE, optional: true },
  { id: 'founders', label: 'Founders', sub: 'Founders Hub', short: 'Founders Hub', color: INK },
] as const

/* Deterministic pseudo-random, so the burst is rich but identical every time. */
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453
  return x - Math.floor(x)
}

function makeGeo(wide: boolean) {
  const w = wide ? 600 : 360
  const h = wide ? 460 : 360
  const c = { x: w / 2, y: h / 2 }
  const dx = wide ? 160 : 110
  const dy = wide ? 110 : 90
  /* final positions: clockwise from top-left (opp, know, build, founders) */
  const at: P[] = [
    { x: c.x - dx, y: c.y - dy },
    { x: c.x + dx, y: c.y - dy },
    { x: c.x + dx, y: c.y + dy },
    { x: c.x - dx, y: c.y + dy },
  ]
  /* where each part is flung by the burst before the structure pulls it in */
  const tip = at.map((a, i) => ({ x: c.x + (a.x - c.x) * (wide ? 1.55 : 1.42) + (i % 2 ? 6 : -6), y: c.y + (a.y - c.y) * (wide ? 1.7 : 1.5) }))
  const maxR = Math.hypot(w, h) / 2
  const nRays = wide ? 26 : 14
  const rays = Array.from({ length: nRays }, (_, i) => {
    const a = (i / nRays) * Math.PI * 2 + rnd(i, 1) * 0.2
    const inner = 14 + rnd(i, 2) * 8
    const outer = maxR * (0.42 + rnd(i, 3) * 0.5)
    return { x1: c.x + Math.cos(a) * inner, y1: c.y + Math.sin(a) * inner, x2: c.x + Math.cos(a) * outer, y2: c.y + Math.sin(a) * outer, w: i % 5 === 0 ? 1.8 : i % 2 ? 0.8 : 1.2, blue: i % 6 === 0 }
  })
  const nStars = wide ? 42 : 20
  const stars = Array.from({ length: nStars }, (_, i) => {
    const a = rnd(i, 4) * Math.PI * 2
    const d = maxR * (0.25 + rnd(i, 5) * 0.75)
    return { x: c.x + Math.cos(a) * d, y: c.y + Math.sin(a) * d * 0.85, r: 0.8 + rnd(i, 6) * 1.4, blue: rnd(i, 7) > 0.72 }
  })
  const ring = Math.hypot(dx, dy)
  return { w, h, c, at, tip, rays, stars, ring, wide, card: wide ? { w: 224, h: 104 } : { w: 168, h: 88 }, maxR }
}
type Geo = ReturnType<typeof makeGeo>

/* A quadratic path from a to b, bowed toward the centre by `k`. */
const bow = (a: P, b: P, c: P, k: number) => {
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  return `M${a.x},${a.y} Q${mx + (c.x - mx) * k},${my + (c.y - my) * k} ${b.x},${b.y}`
}

const seg = (p: MotionValue<number>, a: number, b: number, ease?: (t: number) => number) => ({ p, a, b, ease })
function useSeg({ p, a, b, ease }: ReturnType<typeof seg>) {
  return useTransform(p, [a, b], [0, 1], ease ? { ease } : undefined)
}

/* ---------------------------------------------------------------- pieces */

function Ray({ p, r, i }: { p: MotionValue<number>; r: Geo['rays'][number]; i: number }) {
  const len = useSeg(seg(p, T.bang[0] + i * 0.004, T.bang[0] + 0.14 + i * 0.004, easeOut))
  const opacity = useTransform(p, [T.bang[0], T.bang[0] + 0.05, T.form[0], T.form[1]], [0, 0.75, 0.7, 0.07])
  return <motion.line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke={r.blue ? BLUE : LIME} strokeWidth={r.w} strokeLinecap="round" style={{ pathLength: len, opacity }} />
}

function Star({ p, s, g }: { p: MotionValue<number>; s: Geo['stars'][number]; g: Geo }) {
  const out = useSeg(seg(p, T.bang[0] + 0.02, T.bang[1] + 0.04, easeOut))
  const x = useTransform(out, (t) => g.c.x + (s.x - g.c.x) * (0.08 + 0.92 * t))
  const y = useTransform(out, (t) => g.c.y + (s.y - g.c.y) * (0.08 + 0.92 * t))
  const opacity = useTransform(p, [T.bang[0], T.bang[0] + 0.06, T.bang[1], T.form[1]], [0, 0.95, 0.7, 0.28])
  return <motion.circle cx={x} cy={y} r={s.r} fill={s.blue ? BLUE : INK} style={{ opacity }} />
}

function Node({ p, g, i }: { p: MotionValue<number>; g: Geo; i: number }) {
  const part = PARTS[i]
  const at = g.at[i]
  const tip = g.tip[i]
  const t = useSeg(seg(p, T.form[0] + i * 0.025, T.form[0] + 0.14 + i * 0.025, easeOut))
  const x = useTransform(t, (v) => tip.x + (at.x - tip.x) * v)
  const y = useTransform(t, (v) => tip.y + (at.y - tip.y) * v)
  const opacity = useTransform(p, [T.form[0] - 0.02 + i * 0.025, T.form[0] + 0.05 + i * 0.025], [0, 1])
  const scale = useTransform(t, [0, 1], [0.35, 1])
  const labels = useSeg(seg(p, T.form[1] - 0.06, T.form[1] + 0.02))
  const live = useSeg(seg(p, T.link[0], T.link[1]))
  const halo = useTransform(live, [0, 1], [0.1, 0.26])
  const top = at.y < g.c.y
  const nameY = top ? (g.wide ? -34 : -30) : g.wide ? 34 : 30
  const subY = top ? (g.wide ? -19 : -16) : g.wide ? 49 : 44
  return (
    <motion.g style={{ x, y, opacity }}>
      <motion.g style={{ scale }}>
        <motion.circle r={g.wide ? 22 : 18} fill={part.color} style={{ opacity: halo }} />
        <circle r={g.wide ? 12 : 10} fill="var(--surface-2)" stroke={part.color} strokeWidth="1.6" strokeDasharray={'optional' in part ? '3 3' : undefined} />
        <circle r={g.wide ? 4.5 : 3.5} fill={part.color} />
      </motion.g>
      <motion.g style={{ opacity: labels }}>
        <text y={nameY} textAnchor="middle" fontSize={g.wide ? 14 : 13} fontWeight={600} fontFamily="var(--font-sans)" fill={INK}>
          {part.label}
        </text>
        <text y={subY} textAnchor="middle" fontSize={g.wide ? 11 : 10.5} fontFamily="var(--font-sans)" fill="var(--text-2)">
          {g.wide ? part.sub : part.short}
        </text>
      </motion.g>
    </motion.g>
  )
}

/* The path from a part to the centre: drawn as the universe forms, then lit
   and carrying one signal inward (toward the next step) as it connects. */
function Spoke({ p, g, i }: { p: MotionValue<number>; g: Geo; i: number }) {
  const d = bow(g.at[i], g.c, { x: g.c.x + (i % 2 ? -40 : 40), y: g.c.y + (i < 2 ? -30 : 30) }, 0.3)
  const draw = useSeg(seg(p, T.form[0] + 0.06 + i * 0.025, T.form[1] + i * 0.02))
  const lit = useTransform(p, [T.link[0], T.link[0] + 0.1], [0, 0.95])
  const travel = useSeg(seg(p, T.link[0] + 0.02 + i * 0.02, T.link[1] + i * 0.015))
  const dash = useTransform(travel, (v) => 0.1 - v * 1.1)
  const dashOpacity = useTransform(travel, [0, 0.05, 0.9, 1], [0, 1, 1, 0])
  return (
    <g>
      <motion.path d={d} fill="none" stroke={PARTS[i].color} strokeWidth="1.3" strokeOpacity="0.55" style={{ pathLength: draw }} />
      <motion.path d={d} fill="none" stroke={LIME} strokeWidth="1.8" strokeLinecap="round" style={{ opacity: lit, pathLength: draw }} />
      <motion.path d={d} pathLength={1} fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" strokeDasharray="0.1 1.2" style={{ strokeDashoffset: dash, opacity: dashOpacity }} />
    </g>
  )
}

/* The relationships between neighbouring parts — each one a real link. */
function Chord({ p, g, i }: { p: MotionValue<number>; g: Geo; i: number }) {
  const a = g.at[i]
  const b = g.at[(i + 1) % 4]
  const draw = useSeg(seg(p, T.link[0] + i * 0.03, T.link[0] + 0.1 + i * 0.03))
  return <motion.path d={bow(a, b, g.c, 0.22)} fill="none" stroke={i % 2 ? LIME : BLUE} strokeWidth="1.3" strokeOpacity="0.6" style={{ pathLength: draw }} />
}

function Core({ p, g }: { p: MotionValue<number>; g: Geo }) {
  const { c } = g
  /* the point: quiet, then it swells into the burst and gives way to the plate */
  const pointR = useTransform(p, [0, T.bang[0], T.bang[0] + 0.05, T.bang[1], T.form[0] + 0.06], [2.4, 2.4, 9, 6, 0])
  const haloOpacity = useTransform(p, [0, T.bang[0], T.bang[0] + 0.05], [0.4, 0.4, 0])
  const glowR = useTransform(p, [0, T.bang[0], T.bang[0] + 0.07, T.bang[1], T.form[1], T.link[1]], [12, 12, g.maxR * 0.62, g.maxR * 0.45, g.maxR * 0.3, g.maxR * 0.36])
  const glowOpacity = useTransform(p, [0, T.bang[0], T.bang[0] + 0.07, T.bang[1], T.form[1]], [0.45, 0.45, 1, 0.7, 0.5])
  const wave = useSeg(seg(p, T.bang[0] + 0.01, T.bang[1]))
  const waveR = useTransform(wave, [0, 1], [8, g.maxR * 0.95])
  const waveOpacity = useTransform(wave, [0, 0.12, 1], [0, 0.7, 0])
  /* the plate: Spryve, then the next step */
  const plateIn = useSeg(seg(p, T.form[0] + 0.1, T.form[1]))
  const toCard = useSeg(seg(p, T.link[0] + 0.02, T.link[1] - 0.04))
  const pw = useTransform(toCard, [0, 1], [g.wide ? 124 : 96, g.card.w])
  const ph = useTransform(toCard, [0, 1], [g.wide ? 100 : 80, g.card.h])
  const px = useTransform(pw, (v) => c.x - v / 2)
  const py = useTransform(ph, (v) => c.y - v / 2)
  const plateScale = useTransform(plateIn, [0, 1], [0.6, 1])
  const brand = useTransform(toCard, [0, 0.45], [1, 0])
  const next = useTransform(toCard, [0.3, 0.85], [0, 1])
  const f = g.wide ? 1 : 0.8
  return (
    <g>
      <motion.circle cx={c.x} cy={c.y} r={glowR} fill="url(#p5-nx-glow)" style={{ opacity: glowOpacity }} />
      <motion.circle cx={c.x} cy={c.y} r={waveR} fill="none" stroke={LIME} strokeWidth="1.2" style={{ opacity: waveOpacity }} />
      {[12, 24].map((r) => (
        <motion.circle key={r} cx={c.x} cy={c.y} r={r} fill="none" stroke={LIME} strokeWidth="0.8" style={{ opacity: haloOpacity }} />
      ))}
      <motion.circle cx={c.x} cy={c.y} r={pointR} fill={INK} />
      <motion.g style={{ opacity: plateIn, scale: plateScale }}>
        <motion.rect x={px} y={py} width={pw} height={ph} rx="22" fill="var(--surface-1)" stroke={LIME} strokeWidth="1.4" />
        <motion.g style={{ opacity: brand }}>
          <g transform={`translate(${c.x - 17 * f} ${c.y - 30 * f}) scale(${1.45 * f})`} color={LIME}>
            <path d="M3 17.5 9.2 10l4 4.4L21 5.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="21" cy="5.5" r="2" fill="currentColor" />
          </g>
          <text x={c.x} y={c.y + 30 * f} textAnchor="middle" fontSize={16 * f} fontWeight={600} fontFamily="var(--font-display)" fill={INK}>
            Spryve
          </text>
        </motion.g>
        <motion.g style={{ opacity: next }}>
          <text x={c.x} y={c.y - 26 * f} textAnchor="middle" fontSize={9.5 * f} letterSpacing="1.6" fontFamily="var(--font-mono)" fill={LIME}>
            YOUR NEXT STEP
          </text>
          <text x={c.x} y={c.y - 3 * f} textAnchor="middle" fontSize={15.5 * f} fontWeight={600} fontFamily="var(--font-display)" fill={INK}>
            Review 2 opportunities
          </text>
          <text x={c.x} y={c.y + 16 * f} textAnchor="middle" fontSize={15.5 * f} fontWeight={600} fontFamily="var(--font-display)" fill={INK}>
            that fit your stage
          </text>
          {PARTS.map((pt, i) => (
            <circle key={pt.id} cx={c.x - 40 * f + i * 9 * f} cy={c.y + 36 * f} r={2.6 * f} fill={pt.color} />
          ))}
          <text x={c.x - 2 * f} y={c.y + 39.5 * f} fontSize={10 * f} fontFamily="var(--font-sans)" fill="var(--text-2)">
            from all four parts
          </text>
        </motion.g>
      </motion.g>
    </g>
  )
}

function NexusVisual({ p, g }: { p: MotionValue<number>; g: Geo }) {
  const orbit = useTransform(p, [T.form[0], 1], [-10, 6])
  const orbitOpacity = useTransform(p, [T.form[0] + 0.06, T.form[1], T.link[1]], [0, 0.32, 0.18])
  const ring = useSeg(seg(p, T.link[0] + 0.04, T.link[1]))
  return (
    <svg viewBox={`0 0 ${g.w} ${g.h}`} className="h-auto w-full" aria-hidden>
      <defs>
        <radialGradient id="p5-nx-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={LIME} stopOpacity="0.55" />
          <stop offset="35%" stopColor={BLUE} stopOpacity="0.28" />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
        </radialGradient>
      </defs>
      {g.stars.map((s, i) => (
        <Star key={i} p={p} s={s} g={g} />
      ))}
      {g.rays.map((r, i) => (
        <Ray key={i} p={p} r={r} i={i} />
      ))}
      {/* orbits: the universe taking a shape (desktop only) */}
      {g.wide &&
        [
          { rx: 230, ry: 78, rot: -8 },
          { rx: 170, ry: 124, rot: 26 },
        ].map((o, i) => (
          <motion.g key={i} style={{ rotate: orbit, opacity: orbitOpacity }}>
            <ellipse cx={g.c.x} cy={g.c.y} rx={o.rx} ry={o.ry} fill="none" stroke={i ? BLUE : LIME} strokeWidth="0.9" transform={`rotate(${o.rot} ${g.c.x} ${g.c.y})`} />
          </motion.g>
        ))}
      <motion.circle cx={g.c.x} cy={g.c.y} r={g.ring} fill="none" stroke={BLUE} strokeWidth="1" strokeOpacity="0.4" style={{ pathLength: ring, rotate: -135 }} />
      {[0, 1, 2, 3].map((i) => (
        <Chord key={i} p={p} g={g} i={i} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Spoke key={i} p={p} g={g} i={i} />
      ))}
      <Core p={p} g={g} />
      {[0, 1, 2, 3].map((i) => (
        <Node key={i} p={p} g={g} i={i} />
      ))}
    </svg>
  )
}

/* ---------------------------------------------------------------- section */

export function NexusSection() {
  const wide = useMedia('(min-width: 1024px)')
  const g = useMemo(() => makeGeo(wide), [wide])
  const scene = useScrollScene({ start: [0, 0], end: [1, 1], calmValue: STAGE_AT[3] })
  const { calm, driver } = scene
  const stage = useDriven(driver, stageFor)
  const s = STAGES[stage]

  const select = useCallback((i: number) => scene.goTo(STAGE_AT[i], calm ? 0 : 1.2), [scene, calm])
  const skip = useCallback(() => {
    scene.goTo(STAGE_AT[3], 0)
    window.requestAnimationFrame(() => {
      const el = document.getElementById('who-we-are')
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: calm ? 'auto' : 'smooth' })
    })
  }, [scene, calm])
  const bar = useTransform(driver, (v) => `scaleX(${v})`)
  const glow = useTransform(driver, [0, T.bang[0], T.bang[1]], [0.08, 0.08, 0.32])

  return (
    <section id="about" ref={scene.ref as unknown as RefObject<HTMLElement>} className={cn('relative bg-[#050607]', calm ? 'band' : 'h-[220vh] lg:h-[250vh]')} aria-labelledby="nexus-title">
      <div className={cn(!calm && 'sticky top-0 flex h-[100svh] items-center overflow-hidden pt-[68px]')}>
        <motion.div className="pointer-events-none absolute inset-0 blur-[120px]" style={{ opacity: glow, background: 'radial-gradient(38% 46% at 64% 52%, color-mix(in oklab, var(--brand-tertiary) 60%, transparent), transparent)' }} aria-hidden />
        <div className="container-site relative grid w-full items-center gap-4 lg:grid-cols-[0.78fr_1.22fr] lg:gap-12">
          {/* narration */}
          <div className="order-2 lg:order-1">
            <p className="eyebrow mb-3 flex items-center gap-2.5 max-lg:hidden">
              <span className="text-lime">07</span>
              <span className="bg-fg/20 h-px w-6" aria-hidden />
              About Spryve · The Spryve Nexus
            </p>
            <h2 id="nexus-title" className="sr-only">
              The Spryve Nexus
            </h2>
            <div className="relative min-h-[8.5rem] lg:min-h-[10.5rem]" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={s.name} initial={calm ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                  <p className="eyebrow !text-[0.625rem]">
                    <span className="text-lime">{String(stage + 1).padStart(2, '0')}</span> · {s.name} — {s.sub}
                  </p>
                  <p className="font-display text-fg mt-2 text-[1.3rem] leading-tight font-semibold tracking-tight lg:text-[2rem]">{s.title}</p>
                  <p className="text-fg-2 mt-2 max-w-[46ch] text-[0.8125rem] leading-snug lg:mt-3 lg:text-[0.9375rem] lg:leading-relaxed">{s.body}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-1.5 lg:mt-8 lg:flex lg:flex-col lg:gap-0" role="tablist" aria-label="Spryve Nexus stages">
              {STAGES.map((st, i) => {
                const on = i === stage
                return (
                  <button
                    key={st.name}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => select(i)}
                    className={cn(
                      'rounded-full border px-1 py-1.5 text-[0.6875rem] transition-colors lg:flex lg:items-baseline lg:gap-3 lg:rounded-none lg:border-0 lg:border-b lg:px-0 lg:py-2.5 lg:text-left lg:text-[0.9375rem]',
                      on ? 'border-lime/50 bg-lime/10 text-lime lg:border-line lg:bg-transparent lg:text-fg' : 'border-line text-fg-2 hover:text-fg lg:border-line',
                    )}
                  >
                    <span className={cn('hidden font-mono text-[0.6875rem] lg:inline', on ? 'text-lime' : 'text-fg-2')}>{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-medium">{st.name}</span>
                    <span className="text-fg-2 hidden text-[0.8125rem] lg:inline">{st.sub}</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 lg:mt-6">
              {!calm && <ReplayButton onClick={() => scene.replay(6)} />}
              <button type="button" onClick={skip} className="text-fg-2 hover:text-fg inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.8125rem]">
                <ChevronsDown className="h-3.5 w-3.5" aria-hidden />
                Skip to Who we are
              </button>
              {!calm && <span className="text-fg-2 text-[0.75rem] max-sm:hidden">Scroll to move through the story — forward or back</span>}
            </div>
          </div>

          {/* the universe */}
          <div className="order-1 lg:order-2">
            <p className="eyebrow mb-1 flex items-center gap-2.5 lg:hidden">
              <span className="text-lime">07</span>
              <span className="bg-fg/20 h-px w-6" aria-hidden />
              About Spryve · The Spryve Nexus
            </p>
            <div className="relative mx-auto w-full max-w-[380px] lg:max-w-none" role="img" aria-label={`The Spryve Nexus, stage ${stage + 1} of 4: ${s.name} — ${s.sub}. ${s.title}`}>
              <NexusVisual p={driver} g={g} />
            </div>
          </div>
        </div>
        {!calm && (
          <div className="bg-fg/8 absolute inset-x-0 bottom-0 h-[2px]" aria-hidden>
            <motion.div className="bg-lime h-full origin-left" style={{ transform: bar }} />
          </div>
        )}
      </div>
    </section>
  )
}
