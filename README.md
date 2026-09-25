# Spryve — Concept Preview 5

A **design and interaction prototype** for Spryve: the public website and the signed-in
founder workspace. Built on Preview 4's story and product direction with a new composition,
design system and motion approach.

> **Prototype only.** Every provider, programme, company, person and date is fictional sample
> content. There is no database, authentication, payment system or live data. Registration,
> saved items, company profiles, messages and settings are stored in this browser only
> (`localStorage` / `sessionStorage` under `spryve.p5.`).

## What Spryve is (as presented here)

1. **Dashboard** — relevant information and clear next steps.
2. **Founders Hub** — discover founders and companies, present your company, connect, message.
3. **Spryve Build** — optional, hands-on help to refine an idea and design or develop a digital experience.

Opportunities (accelerators, incubators, funding opportunities, events, services) are
**external**: listings explain the opportunity and every outbound action ("View opportunity ↗",
"Visit provider ↗") leads to the provider's own site. Spryve does not fund founders, run
programmes or provide legal services. Advisory has been removed.

## Design tokens

All adjustable values live at the top of [`src/index.css`](src/index.css).

| Token | Value | Role |
| --- | --- | --- |
| `--brand-primary` | `#07080A` | Near-black foundation |
| `--brand-secondary` | `#C8FF3D` | Controlled neon lime — strongest signals and primary actions |
| `--brand-tertiary` | `#3D7EFF` | Electric blue — connection, depth, selected states |
| `--surface-1` / `--surface-2` | `#07080A` / `#16181D` | The two layout surfaces |
| `--text-1` / `--text-2` | `#F4F6F8` / `#9AA3AE` | Primary reading / secondary information |
| `--line-alpha`, `--glow-strength` | `9%`, `0.32` | Hairline strength and glow, derived from the above |

Type: **Sora** (headings), **Inter** (body), **IBM Plex Mono** (labels).
A "Higher contrast" appearance and a "Reduce motion" setting are available in Settings.

## Landing story

The landing opens with a spacious brand statement (no interface on the first screen), then
follows P4's story: the scattered founder experience (cards travel into one dashboard) → one
useful dashboard (the payoff) → opportunities & knowledge (directory tabs that lead out to
providers) → Founders Hub → the wider ecosystem → optional Spryve Build → About: the Spryve
Nexus (Origin → Ignition → Spryve → Connections), then who we are → partners (reserved logo
space, clearly marked placeholders) → invitation.

Three effects follow the scroll: the opening lifting away, the dashboard settling into place,
and the Nexus, whose four stages advance as you scroll through its section (stage tabs, Replay
and Skip take over at any point). Every other scene starts the first time it enters the
viewport, plays through once in a couple of seconds and rests on a readable final state; tabs,
toggles and Replay override the timer. `useSequence` and `useAutoCycle` in `src/lib/hooks.ts`
drive the timed scenes. With reduced motion (OS setting or Settings → Reduce motion), nothing
is pinned or scroll-linked and every scene shows its completed state, still fully clickable.

## Routes

| Route | Screen |
| --- | --- |
| `/` | Landing page |
| `/build` | Spryve Build (public) |
| `/register`, `/sign-in` | Prototype account creation / sign-in |
| `/app` | Dashboard |
| `/app/hub`, `/app/hub/my-company`, `/app/hub/my-company/new`, `/app/hub/my-company/edit`, `/app/hub/company/:slug`, `/app/hub/messages` | Founders Hub |
| `/app/opportunities[/:category]`, `/app/opportunities/item/:id`, `/app/opportunities/saved` | Opportunities |
| `/app/library[/:category]`, `/app/library/item/:id`, `/app/library/saved` | Library (Resources, Templates, Learn) |
| `/app/build` | Spryve Build (in workspace, with request form) |
| `/app/saved` | All saved items (grouped) |
| `/app/account`, `/app/account/settings` | Profile and Settings |

Use **Preview data** in the workspace top bar to switch between: sample founder without a
company, sample founder with a published company, and a brand-new empty account.

## Stack & checks

React 19 · TypeScript · Vite · Tailwind CSS v4 · Motion · React Router · lucide-react.

```bash
npm install
npm run dev          # local development
npm run check        # typecheck + production build
npm run build && npx vite preview --port 4173 &
NODE_PATH=$(npm root -g) npm run smoke   # Playwright: every route, desktop + mobile, errors + overflow
```

## Open decisions

- **Logo**: the mark is a placeholder carried over from P4 `main`. The logo concepts on the
  separate P4 branch were not used.
- **Real content**: providers, programmes, companies, people, dates and the About/team story
  are placeholders to be replaced with sourced content.
