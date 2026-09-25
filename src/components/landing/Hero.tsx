import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowDownRight, ArrowRight, BookOpen, Compass, Users, Wrench } from 'lucide-react'
import { SpryveMark } from '@/components/ui'
import { useCalm } from '@/lib/hooks'

const strands = [
  { label: 'Opportunities', icon: Compass },
  { label: 'Knowledge', icon: BookOpen },
  { label: 'Founders', icon: Users },
  { label: 'Building help', icon: Wrench },
]

/** The first screen tells the story; the detailed dashboard appears below. */
export function Hero() {
  const calm = useCalm()
  const rise = (delay: number) => ({
    initial: calm ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: calm ? 0 : 0.55, delay: calm ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
  })

  return (
    <section className="relative isolate overflow-hidden pt-[68px]">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-35 [mask-image:radial-gradient(80%_65%_at_50%_50%,black,transparent)]" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[65%] opacity-25 blur-[105px]" style={{ background: 'radial-gradient(50% 80% at 55% 20%, var(--brand-secondary), transparent)' }} aria-hidden />
      <div className="container-site relative flex min-h-[calc(100svh-68px)] flex-col justify-center py-20 sm:py-24">
        <motion.p {...rise(0)} className="eyebrow mb-7 flex items-center gap-2">
          <span className="bg-lime h-1.5 w-1.5 rounded-full" aria-hidden />
          Spryve · the founder platform
        </motion.p>
        <motion.h1 {...rise(0.08)} className="t-hero max-w-[15ch] text-balance">
          Everything a founder needs. <span className="text-lime">One place.</span>
        </motion.h1>
        <motion.p {...rise(0.2)} className="lede mt-7 max-w-[58ch]">
          Discover relevant opportunities and useful knowledge. Meet the people building beside you. See your next move in one clear workspace.
        </motion.p>
        <motion.div {...rise(0.3)} className="mt-8 flex flex-wrap gap-3">
          <Link to="/register" className="btn btn-primary">Create account <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          <a href="#dashboard" className="btn btn-secondary">See the dashboard <ArrowDownRight className="h-4 w-4" aria-hidden /></a>
        </motion.div>

        <motion.div {...rise(0.4)} className="border-line-strong bg-raised/50 relative mt-16 overflow-hidden rounded-[24px] border px-5 py-6 sm:mt-20 sm:px-8 sm:py-8" aria-label="The four parts of Spryve connect in one founder platform">
          <div className="pointer-events-none absolute inset-x-[10%] top-1/2 hidden h-px bg-gradient-to-r from-transparent via-lime/50 to-transparent lg:block" aria-hidden />
          <div className="relative flex flex-wrap items-center justify-center gap-3">
            {strands.map((strand, index) => (
              <motion.div key={strand.label} initial={calm ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: calm ? 0 : 0.38, delay: calm ? 0 : 0.55 + index * 0.1 }} className="border-line bg-base flex items-center gap-2.5 rounded-xl border px-4 py-3">
                <strand.icon className="text-lime h-4 w-4 shrink-0" aria-hidden />
                <span className="text-fg text-[0.8125rem]">{strand.label}</span>
              </motion.div>
            ))}
            <div className="border-lime/40 bg-base order-first grid h-11 w-11 place-items-center rounded-2xl border shadow-[0_0_35px_color-mix(in_oklab,var(--brand-secondary)_15%,transparent)] sm:order-last">
              <SpryveMark className="text-lime h-6 w-6" />
            </div>
          </div>
          <p className="text-fg-2 relative mt-5 text-center text-[0.75rem]">One connected place to find the right next step.</p>
        </motion.div>
        <p className="text-fg-2 mt-7 text-[0.75rem]">Concept preview · all content is illustrative</p>
      </div>
    </section>
  )
}
