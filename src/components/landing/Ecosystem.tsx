import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Band, SectionIntro } from './parts'

const GROUPS = [
  {
    title: 'Programmes',
    items: [
      { label: 'Accelerators', to: '/app/opportunities/accelerators' },
      { label: 'Incubators', to: '/app/opportunities/incubators' },
      { label: 'Competitions', to: '/app/opportunities?type=Competition' },
      { label: 'Fellowships & residencies', to: '/app/opportunities/incubators?type=Fellowship' },
    ],
  },
  {
    title: 'Funding & events',
    items: [
      { label: 'Funding opportunities', to: '/app/opportunities/funding' },
      { label: 'Grants', to: '/app/opportunities/funding?type=Grant' },
      { label: 'Angel networks & funds', to: '/app/opportunities/funding?type=Angel%20network' },
      { label: 'Events', to: '/app/opportunities/events' },
    ],
  },
  {
    title: 'Providers',
    items: [
      { label: 'Legal providers', to: '/app/opportunities/services?type=Legal' },
      { label: 'Registration & accounting', to: '/app/opportunities/services?type=Company%20registration' },
      { label: 'Banking & payments', to: '/app/opportunities/services?type=Banking%20%26%20payments' },
      { label: 'Coworking', to: '/app/opportunities/services?type=Coworking' },
    ],
  },
  {
    title: 'Knowledge',
    items: [
      { label: 'Resources', to: '/app/library/resources' },
      { label: 'Templates', to: '/app/library/templates' },
      { label: 'Short courses', to: '/app/library/learn' },
      { label: 'Founders Hub', to: '/app/hub' },
    ],
  },
]

export function Ecosystem() {
  return (
    <Band id="ecosystem" tone="raised">
      <div className="container-site">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <SectionIntro index="05" eyebrow="The wider ecosystem" title="Everything around you, mapped." />
          <p className="lede lg:pb-1">
            Accelerators, incubators, programmes, competitions, fellowships, grants, events and the providers founders rely on — organised into
            directories you can filter. When you’re ready to act, Spryve sends you to the source.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map((g, gi) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: gi * 0.08 }}
              className="bg-base border-line rounded-[20px] border p-2"
            >
              <p className="eyebrow px-3 pt-3 pb-2">{g.title}</p>
              <ul>
                {g.items.map((it) => (
                  <li key={it.label}>
                    <Link to={it.to} className="group hover:bg-raised flex items-center justify-between rounded-[12px] px-3 py-2.5 transition-colors">
                      <span className="text-fg text-[0.9375rem]">{it.label}</span>
                      <ArrowRight className="text-fg-2 group-hover:text-lime h-4 w-4 transition-all group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <p className="text-fg-2 mt-6 text-[0.8125rem]">Directory links open the sample workspace. Listings are illustrative until real, sourced content is added.</p>
      </div>
    </Band>
  )
}
