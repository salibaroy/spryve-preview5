import { useEffect } from 'react'
import { SiteFooter, SiteHeader } from '@/components/site/SiteChrome'
import { BuildContent } from '@/components/build/BuildContent'

export default function SiteBuild() {
  useEffect(() => window.scrollTo(0, 0), [])
  return (
    <div className="bg-base">
      <SiteHeader />
      <main className="container-site pt-[120px] pb-24">
        <BuildContent />
      </main>
      <SiteFooter />
    </div>
  )
}
