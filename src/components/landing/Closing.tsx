import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Briefcase, Compass, Hammer, ImageIcon, Layers, Rocket, UsersRound } from 'lucide-react'
import { Band, SectionIntro } from './parts'
import { BuildProcess } from '@/components/build/BuildProcess'
import { BUILD_SERVICES } from '@/lib/data'

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
/* 07b — Who we are (follows the Nexus scene)                                   */
/* ========================================================================== */

export function About() {
  const facts = [
    { icon: Layers, title: 'We bring it together', body: 'Opportunities, knowledge, people and building support in one place, ordered around what you’re working on.' },
    { icon: Compass, title: 'We point to the source', body: 'Listings explain an opportunity and send you to the provider. We don’t run programmes, fund companies or provide the listed services.' },
    { icon: Hammer, title: 'We help build — if you ask', body: 'Spryve Build is optional, hands-on help with product design and development. Most founders use Spryve without it.' },
  ]
  return (
    <Band id="who-we-are" tone="raised">
      <div className="container-site grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <SectionIntro eyebrow="About us" title="Who we are" />
          <p className="lede mt-5">
            Spryve is a platform for founders. We’re building one understandable place for the startup world around you — so the time you spend
            searching goes back into building your company.
          </p>
          <div className="border-line-strong mt-8 rounded-[16px] border border-dashed px-4 py-3.5">
            <p className="text-fg text-[0.875rem] font-medium">Team and founding story — to be added</p>
            <p className="text-fg-2 mt-1 text-[0.8125rem]">Placeholder for the real team, photos and story once confirmed. No names or claims have been invented here.</p>
          </div>
        </div>
        <ul className="grid gap-3">
          {facts.map((f, i) => (
            <motion.li
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45, ease }}
              className="border-line bg-base flex gap-4 rounded-[18px] border p-5"
            >
              <span className="border-line bg-raised text-lime grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border">
                <f.icon className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <span>
                <span className="font-display text-fg block text-[1rem] font-semibold">{f.title}</span>
                <span className="text-fg-2 mt-1 block text-[0.9375rem]">{f.body}</span>
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </Band>
  )
}

/* ========================================================================== */
/* 08 — Partners banner (reserved space; no names, logos or relationships)      */
/* ========================================================================== */

const PARTNER_GROUPS = [
  { icon: Rocket, title: 'Programmes', body: 'Accelerators, incubators, fellowships and competitions.' },
  { icon: UsersRound, title: 'Communities', body: 'Founder networks, meetups and ecosystem organisations.' },
  { icon: Briefcase, title: 'Service providers', body: 'Legal, accounting, banking, coworking and more.' },
]

function LogoSlot({ i }: { i: number }) {
  return (
    <div className="border-line-strong bg-base/60 flex h-12 items-center justify-center rounded-[12px] border border-dashed sm:h-16 lg:h-[72px]" aria-hidden>
      <span className="text-fg-2/80 flex items-center gap-1.5 font-mono text-[0.5625rem] tracking-[0.14em] uppercase">
        <ImageIcon className="h-3 w-3" />
        <span className="max-sm:hidden">Logo</span> {String(i + 1).padStart(2, '0')}
      </span>
    </div>
  )
}

export function Partners() {
  return (
    <section id="partners" className="border-line relative overflow-hidden border-y" aria-labelledby="partners-title">
      <div className="bg-raised absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--brand-tertiary)_60%,transparent)] to-transparent" aria-hidden />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[70%] -translate-x-1/2 opacity-20 blur-[100px]" style={{ background: 'var(--brand-tertiary)' }} aria-hidden />

      <div className="relative mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow mb-3 flex items-center gap-2.5">
              <span className="text-lime">08</span>
              <span className="bg-fg/20 h-px w-6" aria-hidden />
              Partners
            </p>
            <h2 id="partners-title" className="font-display max-w-[30ch] text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.12] font-semibold tracking-[-0.03em] text-balance">
              Spryve connects founders with <span className="text-electric">programmes, communities and service providers.</span>
            </h2>
          </div>
          <span className="border-line-strong text-fg-2 inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-[0.75rem] lg:self-end">
            <span className="bg-fg/40 h-1.5 w-1.5 rounded-full" aria-hidden />
            Placeholder · no partners shown yet
          </span>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {PARTNER_GROUPS.map((g, gi) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.45, ease, delay: gi * 0.08 }}
              className="border-line bg-base rounded-[20px] border p-4 sm:p-5"
              aria-label={`${g.title}: logo space reserved for approved partners`}
            >
              <div className="flex items-start gap-3">
                <span className="border-line-strong text-electric grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border">
                  <g.icon className="h-4 w-4" aria-hidden />
                </span>
                <span>
                  <span className="font-display text-fg block text-[1rem] font-semibold">{g.title}</span>
                  <span className="text-fg-2 block text-[0.8125rem]">{g.body}</span>
                </span>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 lg:grid-cols-2">
                {[0, 1, 2, 3].map((i) => (
                  <LogoSlot key={i} i={gi * 4 + i} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-fg-2 mt-6 max-w-[80ch] text-[0.8125rem]">
          Reserved for approved partner logos, added only once each relationship is confirmed. Appearing in Spryve’s directories does not make an
          organisation a Spryve partner.
        </p>
      </div>
    </section>
  )
}

/* ========================================================================== */
/* 09 — Invitation                                                              */
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
