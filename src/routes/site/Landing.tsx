import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome'
import { Hero } from '@/components/landing/Hero'
import { Problem } from '@/components/landing/Problem'
import { DashboardShowcase, OpportunitiesKnowledge } from '@/components/landing/Showcase'
import { HubStory } from '@/components/landing/HubStory'
import { Ecosystem } from '@/components/landing/Ecosystem'
import { About, BuildStory, FinalCTA, Partners } from '@/components/landing/Closing'

/**
 * P4's story, re-composed:
 * manifesto → problem → one dashboard → opportunities & knowledge → Founders Hub →
 * the wider ecosystem → optional Spryve Build → who we are → partners → invitation.
 * Each section explains its states with a short timed scene or a click —
 * no pinned multi-screen scroll sequences.
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
        <About />
        <Partners />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  )
}
