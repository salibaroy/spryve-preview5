import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome'
import { Hero } from '@/components/landing/Hero'
import { Problem } from '@/components/landing/Problem'
import { DashboardShowcase, OpportunitiesKnowledge } from '@/components/landing/Showcase'
import { HubStory } from '@/components/landing/HubStory'
import { Ecosystem } from '@/components/landing/Ecosystem'
import { About, BuildStory, FinalCTA, Partners } from '@/components/landing/Closing'
import { NexusSection } from '@/components/landing/Nexus'

/**
 * P4's story, re-composed for P5:
 * introduction → the scattered founder experience → one useful dashboard →
 * opportunities & knowledge → Founders Hub → the wider ecosystem → optional
 * Spryve Build → About (the Spryve Nexus, then who we are) → partners → invitation.
 *
 * Motion: three effects follow the scroll — the opening lifting away, the
 * dashboard settling into place as the payoff, and the Nexus, whose four
 * stages advance as you scroll through it. Every other scene is a short timed
 * sequence that starts when it comes into view, with its own controls.
 */
export default function Landing() {
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    const id = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60)
    return () => window.clearTimeout(id)
  }, [hash])

  return (
    <div className="bg-base">
      <SiteHeader />
      <main>
        <Hero />
        <Problem />
        <DashboardShowcase />
        <OpportunitiesKnowledge />
        <HubStory />
        <Ecosystem />
        <BuildStory />
        <NexusSection />
        <About />
        <Partners />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  )
}
