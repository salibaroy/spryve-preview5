/**
 * Smoke + layout check for the preview.
 * Visits every route at desktop and mobile widths, fails on console errors,
 * page errors or horizontal overflow, and writes screenshots for review.
 *
 *   npm run build && npx vite preview --port 4173 &
 *   NODE_PATH=$(npm root -g) npm run smoke
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const OUT = process.env.SHOTS ?? 'screenshots'
mkdirSync(OUT, { recursive: true })

const ROUTES = [
  '/', '/build', '/register', '/sign-in',
  '/app', '/app/hub', '/app/hub/my-company', '/app/hub/my-company/new', '/app/hub/company/ostraka', '/app/hub/messages?thread=t-maya',
  '/app/opportunities', '/app/opportunities/accelerators', '/app/opportunities/incubators', '/app/opportunities/funding', '/app/opportunities/events', '/app/opportunities/services',
  '/app/opportunities/saved', '/app/opportunities/item/launchway-health',
  '/app/library', '/app/library/resources', '/app/library/templates', '/app/library/learn', '/app/library/saved', '/app/library/item/pricing-course',
  '/app/build', '/app/saved', '/app/account', '/app/account/settings', '/app/does-not-exist',
]
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]

const browser = await chromium.launch({ executablePath: process.env.CHROME ?? undefined })
let failures = 0
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const errors = []
  // Only report errors from the app itself — external font requests may be blocked in CI sandboxes.
  page.on('console', (m) => m.type() === 'error' && (m.location().url ?? '').startsWith(BASE) && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
  for (const route of ROUTES) {
    errors.length = 0
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(400)
    // walk down the page so in-view animations run before the screenshot
    const h = await page.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < h; y += Math.round(vp.height * 0.7)) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y)
      await page.waitForTimeout(route === '/' ? 350 : 60)
    }
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    const name = `${vp.name}${route.replace(/[/?=]/g, '_') || '_home'}.png`
    await page.screenshot({ path: `${OUT}/${name}`, fullPage: true })
    const problems = [...errors]
    if (overflow > 1) problems.push(`horizontal overflow of ${overflow}px`)
    if (problems.length) {
      failures++
      console.log(`✗ ${vp.name} ${route}\n   ${problems.join('\n   ')}`)
    } else console.log(`✓ ${vp.name} ${route}`)
  }
  await ctx.close()
}
await browser.close()
if (failures) {
  console.log(`\n${failures} route(s) with problems`)
  process.exit(1)
}
console.log('\nAll routes clean.')
