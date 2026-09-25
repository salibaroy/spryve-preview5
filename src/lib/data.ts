/**
 * ILLUSTRATIVE SAMPLE CONTENT
 * ---------------------------------------------------------------------------
 * Every provider, programme, company, person and date in this file is
 * fictional and exists only to demonstrate layout and interaction. Nothing
 * here describes a real partnership, a real funding commitment, a success
 * rate, a user count or a verified match. Replace with real, sourced content
 * in the data phase.
 */

export type Stage = 'Idea' | 'Validation' | 'MVP' | 'Launched'
export const STAGES: Stage[] = ['Idea', 'Validation', 'MVP', 'Launched']

/** Fixed "today" for the sample data, so deadlines always read sensibly. */
export const SAMPLE_TODAY = new Date('2026-09-28T09:00:00')

export const daysUntil = (iso: string) =>
  Math.round((new Date(iso + 'T12:00:00').getTime() - SAMPLE_TODAY.getTime()) / 86_400_000)

export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', opts)

/* ========================================================================== */
/* Opportunities — external. Spryve lists them and links to the provider.    */
/* ========================================================================== */

export type OppCategory = 'accelerators' | 'incubators' | 'funding' | 'events' | 'services'

export const OPP_CATEGORIES: { id: OppCategory; label: string; singular: string; blurb: string }[] = [
  {
    id: 'accelerators',
    label: 'Accelerators',
    singular: 'Accelerator',
    blurb: 'Accelerators, pre-accelerators and competitions run by external organisations.',
  },
  {
    id: 'incubators',
    label: 'Incubators',
    singular: 'Incubator',
    blurb: 'Incubators, residencies and fellowships for earlier-stage founders.',
  },
  {
    id: 'funding',
    label: 'Funding opportunities',
    singular: 'Funding opportunity',
    blurb: 'Grants, angel networks, funds and prizes offered by third parties. Spryve does not provide funding.',
  },
  {
    id: 'events',
    label: 'Events',
    singular: 'Event',
    blurb: 'Meetups, workshops, demo days and conferences hosted by the wider ecosystem.',
  },
  {
    id: 'services',
    label: 'Services',
    singular: 'Service provider',
    blurb: 'Independent providers for legal, accounting, registration, payments and workspace.',
  },
]

export type Region = 'Levant' | 'Gulf' | 'North Africa' | 'Global'

export interface Opportunity {
  id: string
  category: OppCategory
  title: string
  provider: string
  providerSite: string
  /** Accelerator, Competition, Fellowship, Grant, Workshop, Legal… */
  type: string
  summary: string
  description: string
  stages: Stage[]
  location: string
  region: Region
  format: 'In person' | 'Hybrid' | 'Remote' | 'Online'
  sectors: string[]
  eligibility: string[]
  offers: string[]
  /** ISO date. Absent = rolling / always open. */
  deadline?: string
  duration?: string
  /** Events */
  date?: string
  time?: string
  price?: 'Free' | 'Paid' | 'Free registration'
  /** Funding: always phrased as the provider's own published terms. */
  range?: string
}

export const opportunities: Opportunity[] = [
  /* ---------------- accelerators ---------------- */
  {
    id: 'launchway-health',
    category: 'accelerators',
    title: 'Launchway Health Accelerator',
    provider: 'Launchway',
    providerSite: 'launchway.example',
    type: 'Accelerator',
    summary: 'A 12-week programme for healthtech teams with a working product and early pilots.',
    description:
      'Launchway runs a cohort-based accelerator for healthtech companies moving from pilot to first paid contracts. The programme combines weekly workshops, sector mentors and a closing showcase. Terms, equity and selection criteria are set by Launchway and published on their site.',
    stages: ['MVP', 'Launched'],
    location: 'Beirut',
    region: 'Levant',
    format: 'Hybrid',
    sectors: ['Healthtech'],
    eligibility: ['Working product or live pilot', 'At least two founders', 'Registered or registering a company'],
    offers: ['Sector mentors', 'Weekly workshops', 'Closing showcase'],
    deadline: '2026-10-09',
    duration: '12 weeks',
  },
  {
    id: 'northwind-founders',
    category: 'accelerators',
    title: 'Northwind Founders Program',
    provider: 'Northwind Collective',
    providerSite: 'northwind.example',
    type: 'Pre-accelerator',
    summary: 'A remote pre-accelerator that helps first-time founders test an idea before building.',
    description:
      'An eight-week remote programme focused on customer discovery, problem definition and a first prototype. Open to solo founders. Northwind publishes its curriculum and selection process on its own website.',
    stages: ['Idea', 'Validation'],
    location: 'Remote',
    region: 'Global',
    format: 'Remote',
    sectors: ['Any sector'],
    eligibility: ['Solo founders welcome', 'No company registration needed', 'Around 8 hours a week'],
    offers: ['Discovery curriculum', 'Peer groups', 'Office hours'],
    deadline: '2026-10-20',
    duration: '8 weeks',
  },
  {
    id: 'gulfstream-scale',
    category: 'accelerators',
    title: 'Gulfstream Scale Track',
    provider: 'Gulfstream Ventures Studio',
    providerSite: 'gulfstream.example',
    type: 'Accelerator',
    summary: 'For B2B companies with revenue that want to expand into Gulf markets.',
    description:
      'A 16-week in-person track in Dubai for launched B2B companies preparing a regional expansion. Focus areas are enterprise sales, partnerships and hiring. Programme terms are published by the organiser.',
    stages: ['Launched'],
    location: 'Dubai',
    region: 'Gulf',
    format: 'In person',
    sectors: ['B2B software', 'Fintech', 'Logistics'],
    eligibility: ['Recurring revenue', 'Team of five or more', 'Able to relocate for the programme'],
    offers: ['Enterprise sales coaching', 'Market-entry workshops', 'Investor showcase'],
    deadline: '2026-11-15',
    duration: '16 weeks',
  },
  {
    id: 'riverside-climate',
    category: 'accelerators',
    title: 'Riverside Climate Accelerator',
    provider: 'Riverside Foundation',
    providerSite: 'riverside.example',
    type: 'Accelerator',
    summary: 'Ten weeks for climate and resource-efficiency startups validating with real customers.',
    description:
      'A hybrid accelerator for climate-focused teams that are validating demand. Includes technical mentors and access to pilot partners through the organiser’s own network.',
    stages: ['Validation', 'MVP'],
    location: 'Amman',
    region: 'Levant',
    format: 'Hybrid',
    sectors: ['Climate', 'Energy', 'Agritech'],
    eligibility: ['Climate or resource-efficiency focus', 'Prototype or pilot in progress'],
    offers: ['Technical mentors', 'Pilot introductions', 'Demo day'],
    deadline: '2026-10-30',
    duration: '10 weeks',
  },
  {
    id: 'open-build-challenge',
    category: 'accelerators',
    title: 'Open Build Challenge 2026',
    provider: 'Open Build Network',
    providerSite: 'openbuild.example',
    type: 'Competition',
    summary: 'An online startup competition with a regional final and feedback from judges.',
    description:
      'A three-round competition open to early teams across the region. Finalists pitch live and every applicant receives written feedback. Any prizes are defined and awarded by the organiser.',
    stages: ['Idea', 'Validation', 'MVP'],
    location: 'Online',
    region: 'Global',
    format: 'Online',
    sectors: ['Any sector'],
    eligibility: ['Teams of one to four', 'Pitch deck and two-minute video'],
    offers: ['Judge feedback', 'Regional final', 'Prize set by organiser'],
    deadline: '2026-10-14',
    duration: '6 weeks',
  },

  /* ---------------- incubators ---------------- */
  {
    id: 'cedar-grove-incubator',
    category: 'incubators',
    title: 'Cedar Grove Incubator',
    provider: 'Cedar Grove Hub',
    providerSite: 'cedargrove.example',
    type: 'Incubator',
    summary: 'A six-month incubator with a desk, mentors and structured milestones.',
    description:
      'Cedar Grove offers early teams a workspace, fortnightly mentor sessions and milestone reviews. Applications are reviewed on a rolling basis by the hub.',
    stages: ['Idea', 'Validation'],
    location: 'Beirut',
    region: 'Levant',
    format: 'In person',
    sectors: ['Any sector'],
    eligibility: ['Based in or near Beirut', 'Full-time commitment from one founder'],
    offers: ['Workspace', 'Mentor sessions', 'Milestone reviews'],
    duration: '6 months',
  },
  {
    id: 'university-venture-lab',
    category: 'incubators',
    title: 'University Venture Lab',
    provider: 'Northshore University (sample)',
    providerSite: 'venturelab.example',
    type: 'Incubator',
    summary: 'Incubation for students and recent graduates turning research or coursework into a company.',
    description:
      'A university-run incubator with faculty mentors and access to labs. Open to current students and graduates from the last three years.',
    stages: ['Idea'],
    location: 'Tripoli',
    region: 'Levant',
    format: 'In person',
    sectors: ['Any sector', 'Deep tech'],
    eligibility: ['Current student or graduate within three years'],
    offers: ['Faculty mentors', 'Lab access', 'Showcase evening'],
    deadline: '2026-10-25',
    duration: '4 months',
  },
  {
    id: 'harbor-residency',
    category: 'incubators',
    title: 'Harbor Founder Residency',
    provider: 'Harbor House',
    providerSite: 'harborhouse.example',
    type: 'Residency',
    summary: 'A three-month in-person residency for founders who want focused build time.',
    description:
      'Residents work from a shared house and studio with weekly founder dinners and expert sessions. The residency is organised and funded by Harbor House.',
    stages: ['Validation', 'MVP'],
    location: 'Cairo',
    region: 'North Africa',
    format: 'In person',
    sectors: ['Any sector'],
    eligibility: ['Available for three months in Cairo', 'Prototype in progress'],
    offers: ['Studio space', 'Weekly founder dinners', 'Expert sessions'],
    deadline: '2026-11-20',
    duration: '3 months',
  },
  {
    id: 'signal-fellowship',
    category: 'incubators',
    title: 'Signal Fellowship for Technical Founders',
    provider: 'Signal Fellowship',
    providerSite: 'signalfellowship.example',
    type: 'Fellowship',
    summary: 'A remote fellowship for engineers leaving employment to start a company.',
    description:
      'A remote fellowship with a small cohort of technical founders. Fellows meet weekly and are paired with an operator mentor. Any stipend or terms are described on the fellowship’s own site.',
    stages: ['Idea', 'Validation'],
    location: 'Remote',
    region: 'Global',
    format: 'Remote',
    sectors: ['Software', 'AI'],
    eligibility: ['Technical background', 'Not yet raised external funding'],
    offers: ['Operator mentor', 'Weekly cohort sessions'],
    deadline: '2026-11-02',
    duration: '12 weeks',
  },
  {
    id: 'makers-hardware',
    category: 'incubators',
    title: 'Makers Hardware Incubator',
    provider: 'Makers Yard',
    providerSite: 'makersyard.example',
    type: 'Incubator',
    summary: 'Prototyping space and supplier introductions for hardware teams.',
    description:
      'An incubator for physical-product teams with a workshop, prototyping tools and introductions to regional manufacturers.',
    stages: ['MVP'],
    location: 'Amman',
    region: 'Levant',
    format: 'In person',
    sectors: ['Hardware', 'IoT'],
    eligibility: ['Hardware or IoT product', 'Working prototype'],
    offers: ['Workshop access', 'Supplier introductions'],
    duration: '6 months',
  },

  /* ---------------- funding opportunities ---------------- */
  {
    id: 'digital-health-grant',
    category: 'funding',
    title: 'Digital Health Innovation Grant',
    provider: 'Levant Health Fund (sample)',
    providerSite: 'healthfund.example',
    type: 'Grant',
    summary: 'A non-dilutive grant round for digital health teams running clinical pilots.',
    description:
      'A grant programme for companies with a clinical pilot underway. Reporting is required. Amounts, criteria and decisions are set entirely by the provider; Spryve only lists the opportunity.',
    stages: ['MVP', 'Launched'],
    location: 'Regional',
    region: 'Levant',
    format: 'Online',
    sectors: ['Healthtech'],
    eligibility: ['Clinical pilot underway', 'Registered company', 'Quarterly reporting'],
    offers: ['Non-dilutive grant', 'Reporting support from provider'],
    deadline: '2026-12-01',
    range: 'Grant size published by the provider',
  },
  {
    id: 'levantine-angel-circle',
    category: 'funding',
    title: 'Levantine Angel Circle',
    provider: 'Levantine Angel Circle',
    providerSite: 'angelcircle.example',
    type: 'Angel network',
    summary: 'An angel network that screens early-stage companies once a month.',
    description:
      'Members review a shortlist each month and invest individually. The network describes its process and typical ticket sizes on its own site.',
    stages: ['Validation', 'MVP'],
    location: 'Beirut',
    region: 'Levant',
    format: 'Hybrid',
    sectors: ['Any sector'],
    eligibility: ['Company registered or in progress', 'Pitch deck'],
    offers: ['Monthly screening', 'Individual angel decisions'],
    range: 'Ticket sizes set by individual members',
  },
  {
    id: 'firstlight-preseed',
    category: 'funding',
    title: 'Firstlight Pre-seed Fund',
    provider: 'Firstlight Capital',
    providerSite: 'firstlight.example',
    type: 'Venture fund',
    summary: 'A pre-seed fund that writes first cheques into software companies.',
    description:
      'Firstlight invests at pre-seed and reviews applications on a rolling basis. Its thesis and process are published on its website.',
    stages: ['MVP'],
    location: 'Riyadh',
    region: 'Gulf',
    format: 'Hybrid',
    sectors: ['B2B software', 'AI', 'Fintech'],
    eligibility: ['Working product', 'Early users or pilots'],
    offers: ['Pre-seed investment', 'Portfolio community'],
    range: 'Investment terms set by the fund',
  },
  {
    id: 'women-founders-grant',
    category: 'funding',
    title: 'Women Founders Grant Round',
    provider: 'Tamkeen Foundation (sample)',
    providerSite: 'tamkeen.example',
    type: 'Grant',
    summary: 'A grant round for companies with at least one woman co-founder.',
    description:
      'An annual non-dilutive grant round with mentoring for recipients. Criteria and award sizes are defined by the foundation.',
    stages: ['Idea', 'Validation', 'MVP'],
    location: 'Regional',
    region: 'Levant',
    format: 'Online',
    sectors: ['Any sector'],
    eligibility: ['At least one woman co-founder', 'Based in the region'],
    offers: ['Non-dilutive grant', 'Mentoring'],
    deadline: '2026-10-31',
    range: 'Award sizes published by the foundation',
  },
  {
    id: 'regional-pitch-prize',
    category: 'funding',
    title: 'Regional Pitch Prize',
    provider: 'Open Build Network',
    providerSite: 'openbuild.example',
    type: 'Competition prize',
    summary: 'A pitch competition with a cash prize awarded by the organiser.',
    description:
      'Shortlisted teams pitch at a live final. The organiser sets and awards the prize; Spryve has no role in judging.',
    stages: ['Validation', 'MVP'],
    location: 'Online',
    region: 'Global',
    format: 'Online',
    sectors: ['Any sector'],
    eligibility: ['Early-stage company', 'Two-minute pitch video'],
    offers: ['Cash prize set by organiser', 'Judge feedback'],
    deadline: '2026-10-18',
    range: 'Prize amount published by the organiser',
  },
  {
    id: 'steadyline-rbf',
    category: 'funding',
    title: 'Steadyline Revenue Financing',
    provider: 'Steadyline',
    providerSite: 'steadyline.example',
    type: 'Revenue-based financing',
    summary: 'Non-dilutive financing repaid from revenue, for companies with recurring income.',
    description:
      'Steadyline provides revenue-based financing to companies with at least six months of recurring revenue. Terms and eligibility are set by the provider.',
    stages: ['Launched'],
    location: 'Dubai',
    region: 'Gulf',
    format: 'Online',
    sectors: ['Any sector'],
    eligibility: ['Six months of recurring revenue'],
    offers: ['Revenue-based financing'],
    range: 'Terms set by the provider',
  },

  /* ---------------- events ---------------- */
  {
    id: 'founders-night-clinical',
    category: 'events',
    title: 'Founders Night — Clinical Tech',
    provider: 'Beirut Builders Meetup',
    providerSite: 'buildersmeetup.example',
    type: 'Meetup',
    summary: 'An evening of short talks and introductions for founders building in healthcare.',
    description:
      'Three short talks from operators followed by open networking. Hosted and ticketed by the meetup organisers.',
    stages: ['Idea', 'Validation', 'MVP', 'Launched'],
    location: 'Beirut',
    region: 'Levant',
    format: 'In person',
    sectors: ['Healthtech'],
    eligibility: ['Open to founders and operators'],
    offers: ['Talks', 'Networking'],
    date: '2026-10-08',
    time: '18:30',
    price: 'Free registration',
  },
  {
    id: 'pricing-workshop',
    category: 'events',
    title: 'Pricing workshop for B2B founders',
    provider: 'Northwind Collective',
    providerSite: 'northwind.example',
    type: 'Workshop',
    summary: 'A 90-minute online working session on setting and testing a first price.',
    description:
      'Bring your current pricing idea and leave with two price points to test. Run by Northwind as an open online workshop.',
    stages: ['Validation', 'MVP'],
    location: 'Online',
    region: 'Global',
    format: 'Online',
    sectors: ['B2B software'],
    eligibility: ['Open to all'],
    offers: ['Live working session', 'Worksheet'],
    date: '2026-10-02',
    time: '17:00',
    price: 'Free',
  },
  {
    id: 'launchway-demo-day',
    category: 'events',
    title: 'Launchway Demo Day',
    provider: 'Launchway',
    providerSite: 'launchway.example',
    type: 'Demo day',
    summary: 'The closing showcase for Launchway’s current cohort.',
    description: 'Cohort companies present to an invited audience. Registration is handled by Launchway.',
    stages: ['Idea', 'Validation', 'MVP', 'Launched'],
    location: 'Beirut',
    region: 'Levant',
    format: 'In person',
    sectors: ['Healthtech'],
    eligibility: ['Registration required'],
    offers: ['Company pitches', 'Networking'],
    date: '2026-10-22',
    time: '16:00',
    price: 'Free registration',
  },
  {
    id: 'regional-startup-week',
    category: 'events',
    title: 'Regional Startup Week',
    provider: 'Startup Week Org (sample)',
    providerSite: 'startupweek.example',
    type: 'Conference',
    summary: 'A three-day conference with tracks on fundraising, product and hiring.',
    description: 'A multi-track conference organised independently. Tickets and schedule are on the organiser’s site.',
    stages: ['Validation', 'MVP', 'Launched'],
    location: 'Dubai',
    region: 'Gulf',
    format: 'In person',
    sectors: ['Any sector'],
    eligibility: ['Ticketed'],
    offers: ['Talks', 'Workshops', 'Exhibitor hall'],
    date: '2026-11-10',
    time: '09:00',
    price: 'Paid',
  },
  {
    id: 'incorporation-webinar',
    category: 'events',
    title: 'Incorporation basics — open Q&A',
    provider: 'Atlas Legal Partners',
    providerSite: 'atlaslegal.example',
    type: 'Webinar',
    summary: 'A general-information session on choosing where and how to register a company.',
    description:
      'A free webinar hosted by an independent law firm. General information only — for advice on your situation, contact a provider directly.',
    stages: ['Idea', 'Validation', 'MVP'],
    location: 'Online',
    region: 'Global',
    format: 'Online',
    sectors: ['Any sector'],
    eligibility: ['Open to all'],
    offers: ['Presentation', 'Live Q&A'],
    date: '2026-10-15',
    time: '12:00',
    price: 'Free',
  },
  {
    id: 'pitch-practice-amman',
    category: 'events',
    title: 'Pitch practice evening',
    provider: 'Amman Founders Circle',
    providerSite: 'ammanfounders.example',
    type: 'Meetup',
    summary: 'Practise a three-minute pitch and get peer feedback in small groups.',
    description: 'A friendly practice session run by a local founder community.',
    stages: ['Idea', 'Validation', 'MVP'],
    location: 'Amman',
    region: 'Levant',
    format: 'In person',
    sectors: ['Any sector'],
    eligibility: ['Open to founders'],
    offers: ['Small-group feedback'],
    date: '2026-10-29',
    time: '18:00',
    price: 'Free',
  },

  /* ---------------- services ---------------- */
  {
    id: 'atlas-legal',
    category: 'services',
    title: 'Atlas Legal Partners',
    provider: 'Atlas Legal Partners',
    providerSite: 'atlaslegal.example',
    type: 'Legal',
    summary: 'An independent law firm offering company formation, contracts and IP work.',
    description:
      'Atlas Legal Partners is an independent provider. Any engagement, advice and fees are agreed directly between you and the firm — Spryve does not provide legal services.',
    stages: ['Idea', 'Validation', 'MVP', 'Launched'],
    location: 'Beirut + remote',
    region: 'Levant',
    format: 'Hybrid',
    sectors: ['Any sector'],
    eligibility: ['Direct engagement with the firm'],
    offers: ['Company formation', 'Founder agreements', 'IP registration'],
  },
  {
    id: 'ledgerly',
    category: 'services',
    title: 'Ledgerly Accounting',
    provider: 'Ledgerly',
    providerSite: 'ledgerly.example',
    type: 'Accounting',
    summary: 'Bookkeeping, payroll and year-end accounts for small teams.',
    description: 'An independent accounting practice. Pricing and scope are set by the provider.',
    stages: ['MVP', 'Launched'],
    location: 'Remote',
    region: 'Global',
    format: 'Remote',
    sectors: ['Any sector'],
    eligibility: ['Direct engagement'],
    offers: ['Bookkeeping', 'Payroll', 'Year-end accounts'],
  },
  {
    id: 'formwise',
    category: 'services',
    title: 'Formwise Registration Services',
    provider: 'Formwise',
    providerSite: 'formwise.example',
    type: 'Company registration',
    summary: 'Handles filings and registered-agent services in several jurisdictions.',
    description:
      'Formwise is an independent registration agent. It does not give legal advice; for that, use a law firm. Fees are published by Formwise.',
    stages: ['Idea', 'Validation', 'MVP'],
    location: 'Remote',
    region: 'Global',
    format: 'Remote',
    sectors: ['Any sector'],
    eligibility: ['Direct engagement'],
    offers: ['Company filings', 'Registered agent', 'Annual compliance reminders'],
  },
  {
    id: 'paygate',
    category: 'services',
    title: 'Paygate Merchant Services',
    provider: 'Paygate',
    providerSite: 'paygate.example',
    type: 'Banking & payments',
    summary: 'Online payment acceptance and merchant accounts for startups.',
    description: 'An independent payments provider. Onboarding checks and fees are set by the provider.',
    stages: ['MVP', 'Launched'],
    location: 'Regional',
    region: 'Levant',
    format: 'Online',
    sectors: ['Any sector'],
    eligibility: ['Registered company', 'Provider KYC checks'],
    offers: ['Card payments', 'Payment links', 'Merchant dashboard'],
  },
  {
    id: 'workbench-coworking',
    category: 'services',
    title: 'The Workbench',
    provider: 'The Workbench',
    providerSite: 'workbench.example',
    type: 'Coworking',
    summary: 'Flexible desks and meeting rooms, with day passes for visiting founders.',
    description: 'An independent coworking space. Memberships and prices are listed on its website.',
    stages: ['Idea', 'Validation', 'MVP', 'Launched'],
    location: 'Beirut',
    region: 'Levant',
    format: 'In person',
    sectors: ['Any sector'],
    eligibility: ['Open to all'],
    offers: ['Hot desks', 'Meeting rooms', 'Day passes'],
  },
]

export const oppById = (id: string) => opportunities.find((o) => o.id === id)

/* ========================================================================== */
/* Library — Spryve's own knowledge materials                                  */
/* ========================================================================== */

export type LibCategory = 'resources' | 'templates' | 'learn'

export const LIB_CATEGORIES: { id: LibCategory; label: string; blurb: string }[] = [
  { id: 'resources', label: 'Resources', blurb: 'Guides, checklists and short videos for the stage you are in.' },
  { id: 'templates', label: 'Templates', blurb: 'Decks, documents and spreadsheets to start from rather than a blank page.' },
  { id: 'learn', label: 'Learn', blurb: 'Short courses with lessons you can pick up where you left off.' },
]

export interface Lesson {
  id: string
  title: string
  minutes: number
}

export interface LibraryItem {
  id: string
  category: LibCategory
  title: string
  summary: string
  topic: string
  format: string
  stages: Stage[]
  minutes?: number
  pages?: string
  level?: 'Beginner' | 'Intermediate'
  lessons?: Lesson[]
  note?: string
}

export const TOPICS = [
  'Customer discovery',
  'Pricing',
  'Fundraising',
  'Legal & company setup',
  'Sales & marketing',
  'Metrics',
  'Product',
]

export const library: LibraryItem[] = [
  /* resources */
  { id: 'pricing-guide', category: 'resources', title: 'Pricing your first B2B product', summary: 'How to pick two price points worth testing and what to listen for in the answers.', topic: 'Pricing', format: 'Guide', stages: ['Validation', 'MVP'], minutes: 18 },
  { id: 'interview-field-guide', category: 'resources', title: 'Customer interview field guide', summary: 'Questions that uncover real behaviour instead of polite encouragement.', topic: 'Customer discovery', format: 'Guide', stages: ['Idea', 'Validation'], minutes: 12 },
  { id: 'preseed-questions', category: 'resources', title: 'What pre-seed investors usually ask', summary: 'The questions that come up in first meetings and how to prepare honest answers.', topic: 'Fundraising', format: 'Guide', stages: ['MVP', 'Launched'], minutes: 15 },
  { id: 'incorporation-primer', category: 'resources', title: 'Incorporating a company — a primer', summary: 'The decisions involved in registering a company, explained in plain language.', topic: 'Legal & company setup', format: 'Guide', stages: ['Idea', 'Validation', 'MVP'], minutes: 10, note: 'General information only — not legal advice.' },
  { id: 'early-metrics', category: 'resources', title: 'Early metrics that actually matter', summary: 'A short checklist of the numbers worth tracking before product–market fit.', topic: 'Metrics', format: 'Checklist', stages: ['MVP', 'Launched'], minutes: 6 },
  { id: 'selling-hospitals', category: 'resources', title: 'Selling into hospitals', summary: 'A conversation on procurement cycles, champions and pilots.', topic: 'Sales & marketing', format: 'Video', stages: ['MVP', 'Launched'], minutes: 24 },
  { id: 'mvp-scope', category: 'resources', title: 'Scoping a first version', summary: 'How to decide what a first version must do, and what can wait.', topic: 'Product', format: 'Guide', stages: ['Validation', 'MVP'], minutes: 9 },

  /* templates */
  { id: 'pricing-script', category: 'templates', title: 'Pricing interview script', summary: 'A structured script for testing willingness to pay.', topic: 'Pricing', format: 'Doc', stages: ['Validation', 'MVP'], pages: '6 pages' },
  { id: 'preseed-deck', category: 'templates', title: 'Pre-seed pitch deck', summary: 'A 12-slide structure for first conversations with investors.', topic: 'Fundraising', format: 'Slides', stages: ['MVP', 'Launched'], pages: '12 slides' },
  { id: 'financial-model', category: 'templates', title: '24-month financial model', summary: 'Revenue, costs and runway in one editable spreadsheet.', topic: 'Fundraising', format: 'Spreadsheet', stages: ['MVP', 'Launched'], pages: '5 tabs' },
  { id: 'founder-agreement', category: 'templates', title: 'Founder agreement outline', summary: 'The topics co-founders should agree on, as a starting point for a lawyer.', topic: 'Legal & company setup', format: 'Doc', stages: ['Idea', 'Validation'], pages: '4 pages', note: 'A discussion outline, not a legal document.' },
  { id: 'discovery-tracker', category: 'templates', title: 'Customer discovery tracker', summary: 'Log interviews, patterns and quotes in one place.', topic: 'Customer discovery', format: 'Spreadsheet', stages: ['Idea', 'Validation'], pages: '3 tabs' },
  { id: 'grant-outline', category: 'templates', title: 'Grant application outline', summary: 'A structure that maps to the sections most grant forms ask for.', topic: 'Fundraising', format: 'Doc', stages: ['Validation', 'MVP'], pages: '8 pages' },
  { id: 'launch-checklist', category: 'templates', title: 'Product launch checklist', summary: 'Everything to check in the week before you launch.', topic: 'Product', format: 'Checklist', stages: ['MVP'], pages: '40 items' },

  /* learn */
  {
    id: 'validate-course', category: 'learn', title: 'Validate before you build', summary: 'Turn an idea into evidence with interviews, landing tests and simple prototypes.', topic: 'Customer discovery', format: 'Course', stages: ['Idea', 'Validation'], level: 'Beginner',
    lessons: [
      { id: 'v1', title: 'Write the problem down', minutes: 12 },
      { id: 'v2', title: 'Find ten people to talk to', minutes: 14 },
      { id: 'v3', title: 'Run the interview', minutes: 18 },
      { id: 'v4', title: 'Test with a landing page', minutes: 15 },
      { id: 'v5', title: 'Decide what the evidence says', minutes: 11 },
    ],
  },
  {
    id: 'pricing-course', category: 'learn', title: 'Pricing fundamentals', summary: 'Set a first price, test it, and know when to change it.', topic: 'Pricing', format: 'Course', stages: ['Validation', 'MVP'], level: 'Beginner',
    lessons: [
      { id: 'p1', title: 'Value before price', minutes: 11 },
      { id: 'p2', title: 'Choosing a pricing model', minutes: 13 },
      { id: 'p3', title: 'Running pricing interviews', minutes: 14 },
      { id: 'p4', title: 'Publishing and revisiting', minutes: 12 },
    ],
  },
  {
    id: 'fundraising-course', category: 'learn', title: 'Fundraising readiness', summary: 'What to prepare before you approach angels, funds or grants.', topic: 'Fundraising', format: 'Course', stages: ['MVP', 'Launched'], level: 'Intermediate',
    lessons: [
      { id: 'f1', title: 'Is raising the right move?', minutes: 12 },
      { id: 'f2', title: 'Your story in one page', minutes: 16 },
      { id: 'f3', title: 'Building the deck', minutes: 18 },
      { id: 'f4', title: 'Numbers investors check', minutes: 17 },
      { id: 'f5', title: 'Running a process', minutes: 15 },
      { id: 'f6', title: 'Grants and non-dilutive options', minutes: 12 },
    ],
  },
  {
    id: 'gtm-course', category: 'learn', title: 'Your first go-to-market', summary: 'Find a first channel that works and measure it honestly.', topic: 'Sales & marketing', format: 'Course', stages: ['MVP', 'Launched'], level: 'Intermediate',
    lessons: [
      { id: 'g1', title: 'Who buys, who uses', minutes: 12 },
      { id: 'g2', title: 'Picking one channel', minutes: 13 },
      { id: 'g3', title: 'Founder-led sales', minutes: 16 },
      { id: 'g4', title: 'Measuring what works', minutes: 12 },
      { id: 'g5', title: 'When to hire', minutes: 12 },
    ],
  },
  {
    id: 'setup-course', category: 'learn', title: 'Company setup basics', summary: 'The practical steps of registering, banking and staying compliant.', topic: 'Legal & company setup', format: 'Course', stages: ['Idea', 'Validation', 'MVP'], level: 'Beginner',
    note: 'General information — speak to a qualified provider for advice.',
    lessons: [
      { id: 's1', title: 'When to register', minutes: 10 },
      { id: 's2', title: 'Choosing a structure', minutes: 13 },
      { id: 's3', title: 'Banking and payments', minutes: 12 },
    ],
  },
]

export const libById = (id: string) => library.find((l) => l.id === id)
export const courseMinutes = (c: LibraryItem) => (c.lessons ?? []).reduce((n, l) => n + l.minutes, 0)
export const formatMinutes = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : `${m} min`)

/* ========================================================================== */
/* Founders Hub                                                                */
/* ========================================================================== */

export type Accent = 'lime' | 'blue' | 'white'

export interface Founder {
  firstName: string
  familyName: string
  position: string
  /** Private — used for team management, never shown on the public profile. */
  email?: string
  linkedin?: string
}

export interface Company {
  slug: string
  name: string
  mark: string
  companyType: 'Product company' | 'Service company' | 'Product & service company'
  industry: string
  subIndustry: string
  stage: Stage
  location: string
  teamSize: string
  founded: string
  short: string
  about: string
  founders: Founder[]
  products: { title: string; description: string }[]
  lookingFor: string[]
  canHelpWith: string[]
  website?: string
  linkedin?: string
  visibility: 'Visible to members' | 'Connections only' | 'Hidden from directory'
  accent: Accent
}

const f = (first: string, family: string, position: string): Founder => ({ firstName: first, familyName: family, position })

export const companies: Company[] = [
  {
    slug: 'trellis', name: 'Trellis', mark: 'TR', companyType: 'Product company', industry: 'Fintech', subIndustry: 'SME credit', stage: 'Launched', location: 'Dubai, UAE', teamSize: '11–25', founded: '2023',
    short: 'Credit scoring for the businesses banks cannot read yet.',
    about: 'Trellis builds an alternative credit file for small businesses in markets where formal financial history is thin, using payments, invoices and supplier behaviour instead of collateral.',
    founders: [f('Omar', 'Nasr', 'Founder & CEO')], products: [{ title: 'Trellis Score', description: 'A credit file lenders can query through one API.' }, { title: 'Merchant dashboard', description: 'Lets a business see and improve its own file.' }],
    lookingFor: ['Investments', 'Partnerships'], canHelpWith: ['Fundraising', 'Sales'], website: 'trellis.example', visibility: 'Visible to members', accent: 'blue',
  },
  {
    slug: 'ostraka', name: 'Ostraka', mark: 'OS', companyType: 'Product company', industry: 'Healthtech', subIndustry: 'Diagnostics', stage: 'Validation', location: 'Beirut, Lebanon', teamSize: '2–5', founded: '2025',
    short: 'Turning routine lab results into early warnings.',
    about: 'Ostraka reads the lab results patients already produce and flags patterns clinicians usually catch in hindsight. Currently running a validation study with two hospitals.',
    founders: [f('Maya', 'Sleiman', 'Co-founder'), f('Karim', 'Aziz', 'Co-founder & CTO')], products: [{ title: 'Ostraka Signal', description: 'Early-warning flags from routine lab panels.' }],
    lookingFor: ['Co-founder', 'Mentorship'], canHelpWith: ['Product', 'Engineering'], website: 'ostraka.example', visibility: 'Visible to members', accent: 'lime',
  },
  {
    slug: 'northline', name: 'Northline', mark: 'NL', companyType: 'Product company', industry: 'Climate', subIndustry: 'Cold chain', stage: 'Launched', location: 'Amman, Jordan', teamSize: '11–25', founded: '2022',
    short: 'Cold chain that tells you before it fails.',
    about: 'Northline puts low-cost sensors in refrigerated transport and predicts failures hours before the loss happens.',
    founders: [f('Karim', 'Dagher', 'Founder')], products: [{ title: 'Northline Sensor', description: 'Temperature and door sensors for trucks.' }, { title: 'Fleet console', description: 'Alerts and loss reports.' }],
    lookingFor: ['Partnerships', 'Service Providers'], canHelpWith: ['Operations', 'Hiring'], visibility: 'Visible to members', accent: 'white',
  },
  {
    slug: 'fold', name: 'Fold', mark: 'FD', companyType: 'Product company', industry: 'AI / ML', subIndustry: 'Document workflows', stage: 'MVP', location: 'Riyadh, Saudi Arabia', teamSize: '6–10', founded: '2025',
    short: 'Arabic-first document understanding for operations teams.',
    about: 'Fold reads messy Arabic paperwork — delivery notes, purchase orders, customs forms — and turns it into structured records.',
    founders: [f('Yusuf', 'Barakat', 'Founder & CTO')], products: [{ title: 'Fold Extract', description: 'Document capture and structuring.' }],
    lookingFor: ['Investments', 'Clients'], canHelpWith: ['Engineering', 'Intros'], visibility: 'Visible to members', accent: 'blue',
  },
  {
    slug: 'meridian', name: 'Meridian', mark: 'MD', companyType: 'Product & service company', industry: 'Food', subIndustry: 'Supply', stage: 'Launched', location: 'Beirut, Lebanon', teamSize: '11–25', founded: '2022',
    short: 'Restaurants buy direct from farms, at a price both survive.',
    about: 'Meridian removes layers of intermediaries between producers and restaurant kitchens, with ordering, delivery routing and payments in one place.',
    founders: [f('Dana', 'Khoury', 'Co-founder & CEO')], products: [{ title: 'Meridian Market', description: 'Ordering for restaurants.' }, { title: 'Farm app', description: 'Listings and payouts for producers.' }],
    lookingFor: ['Co-founder', 'Partnerships'], canHelpWith: ['Operations', 'Sales'], visibility: 'Visible to members', accent: 'lime',
  },
  {
    slug: 'vessel', name: 'Vessel', mark: 'VS', companyType: 'Product company', industry: 'Logistics', subIndustry: 'Last mile', stage: 'MVP', location: 'Beirut, Lebanon', teamSize: '6–10', founded: '2024',
    short: 'Last-mile delivery for cities without addresses.',
    about: 'Vessel builds routing on landmarks and voice notes instead of street addresses, matching how most of its market navigates.',
    founders: [f('Rania', 'Aoun', 'Founder')], products: [{ title: 'Vessel Router', description: 'Landmark-based routing.' }, { title: 'Driver app', description: 'Voice-note directions.' }],
    lookingFor: ['Investments', 'Mentorship'], canHelpWith: ['Product', 'Design'], visibility: 'Visible to members', accent: 'white',
  },
  {
    slug: 'halo-labs', name: 'Halo Labs', mark: 'HL', companyType: 'Service company', industry: 'Edtech', subIndustry: 'Vocational', stage: 'Idea', location: 'Tripoli, Lebanon', teamSize: '1', founded: '2026',
    short: 'Trade skills taught by the people still doing the trade.',
    about: 'Halo Labs is designing a vocational marketplace where working electricians, plumbers and welders teach short courses.',
    founders: [f('Sami', 'Iskandar', 'Founder')], products: [{ title: 'Course builder', description: 'In design.' }],
    lookingFor: ['Co-founder', 'Mentorship'], canHelpWith: ['Marketing'], visibility: 'Visible to members', accent: 'lime',
  },
  {
    slug: 'atlas-parcel', name: 'Atlas Parcel', mark: 'AP', companyType: 'Product company', industry: 'Logistics', subIndustry: 'Cross-border', stage: 'Validation', location: 'Cairo, Egypt', teamSize: '2–5', founded: '2025',
    short: 'Cross-border shipping priced before you pack the box.',
    about: 'Atlas Parcel gives small exporters a landed cost — duties, clearance and all — before a shipment leaves the warehouse.',
    founders: [f('Nour', 'Chaaban', 'Co-founder')], products: [{ title: 'Quote engine', description: 'Landed-cost estimates.' }],
    lookingFor: ['Partnerships', 'Investments'], canHelpWith: ['Finance', 'Operations'], visibility: 'Visible to members', accent: 'blue',
  },
]

export const companyBySlug = (slug: string) => companies.find((c) => c.slug === slug)
export const founderName = (c: Company) => `${c.founders[0].firstName} ${c.founders[0].familyName}`
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

/* Options mirror the fields the current Spryve company form asks for. */
export const INDUSTRY_OPTIONS = ['SaaS', 'Fintech', 'Healthtech', 'Edtech', 'E-commerce', 'AI / ML', 'Climate', 'Web3', 'Marketplace', 'Hardware', 'Media', 'Logistics', 'Real Estate', 'Travel', 'Food', 'Other']
export const TEAM_SIZES = ['1', '2–5', '6–10', '11–25', '26–50', '50+']
export const LOOKING_FOR_OPTIONS = ['Investments', 'Co-founder', 'Partnerships', 'Mentorship', 'Clients', 'Talent / Team Members', 'Service Providers', 'Networking', 'Other']
export const CAN_HELP_WITH_OPTIONS = ['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Fundraising', 'Operations', 'Legal', 'Finance', 'Hiring', 'Intros', 'Mentorship']
export const COMPANY_TYPES: Company['companyType'][] = ['Product company', 'Service company', 'Product & service company']
export const VISIBILITY_OPTIONS: Company['visibility'][] = ['Visible to members', 'Connections only', 'Hidden from directory']

/** Used by "Fill with sample details" on the company form, and the published scenario. */
export const SAMPLE_COMPANY: Company = {
  slug: 'cadence',
  name: 'Cadence',
  mark: 'CD',
  companyType: 'Product company',
  industry: 'Healthtech',
  subIndustry: 'Clinical operations',
  stage: 'MVP',
  location: 'Beirut, Lebanon',
  teamSize: '6–10',
  founded: '2025',
  short: 'Scheduling that clinical teams actually keep.',
  about:
    'Cadence replaces the whiteboard and the group chat that many clinics still run their week on. Rotas, cover requests and patient slots live in one place, built around how clinical teams already work.',
  founders: [{ ...f('Lina', 'Haddad', 'Founder & CEO'), email: 'lina@cadence.example' }, { ...f('Tarek', 'Mansour', 'Co-founder & CTO'), email: 'tarek@cadence.example' }],
  products: [
    { title: 'Cadence Rota', description: 'Shift planning that respects clinical rules and staff preferences.' },
    { title: 'Cover requests', description: 'Find and confirm cover for a shift in minutes, not phone calls.' },
  ],
  lookingFor: ['Investments', 'Mentorship', 'Clients'],
  canHelpWith: ['Product', 'Design'],
  website: 'https://cadence.example',
  linkedin: 'https://linkedin.com/company/cadence-example',
  visibility: 'Visible to members',
  accent: 'lime',
}

/* ========================================================================== */
/* The signed-in person (sample persona)                                       */
/* ========================================================================== */

export const INTEREST_OPTIONS = [
  'Accelerators',
  'Incubators',
  'Funding opportunities',
  'Events',
  'Legal & registration',
  'Customer discovery',
  'Pricing',
  'Fundraising',
  'Hiring',
  'Product design',
  'Meeting founders',
]

export interface Profile {
  name: string
  headline: string
  location: string
  bio: string
  email: string
  phone: string
  website: string
  linkedin: string
  stage: Stage | ''
  sector: string
  interests: string[]
  privacy: {
    profileVisibility: 'Members' | 'Connections only' | 'Only me'
    showEmail: boolean
    showPhone: boolean
    showLocation: boolean
    allowMessages: 'Anyone on Spryve' | 'Connections only'
  }
}

export const SAMPLE_PROFILE: Profile = {
  name: 'Lina Haddad',
  headline: 'Founder building scheduling tools for clinics',
  location: 'Beirut, Lebanon',
  bio: 'Former clinic operations lead. I started building after running rotas on a whiteboard for six years. Happy to talk about selling to hospitals and running clinical pilots.',
  email: 'lina@cadence.example',
  phone: '+961 70 000 000',
  website: 'https://cadence.example',
  linkedin: 'https://linkedin.com/in/lina-example',
  stage: 'MVP',
  sector: 'Healthtech',
  interests: ['Accelerators', 'Funding opportunities', 'Pricing', 'Meeting founders'],
  privacy: {
    profileVisibility: 'Members',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowMessages: 'Anyone on Spryve',
  },
}

/* ========================================================================== */
/* Messages                                                                    */
/* ========================================================================== */

export interface Message {
  id: string
  from: 'me' | 'them'
  body: string
  at: string
}

export interface Thread {
  id: string
  companySlug: string
  person: string
  unread: boolean
  messages: Message[]
}

export const SAMPLE_THREADS: Thread[] = [
  {
    id: 't-maya',
    companySlug: 'ostraka',
    person: 'Maya Sleiman',
    unread: true,
    messages: [
      { id: 'm1', from: 'them', body: 'Hi Lina — saw Cadence in the Hub. We are running a pilot with two hospitals too. Would you be up for comparing notes on procurement?', at: 'Mon 10:12' },
      { id: 'm2', from: 'them', body: 'Happy to share what worked for getting the pilot signed.', at: 'Mon 10:13' },
    ],
  },
  {
    id: 't-rania',
    companySlug: 'vessel',
    person: 'Rania Aoun',
    unread: true,
    messages: [
      { id: 'm3', from: 'me', body: 'Are you going to the pitch practice evening in Amman?', at: 'Sun 18:40' },
      { id: 'm4', from: 'them', body: 'Yes! Want to do a practice run of our decks the day before?', at: 'Sun 19:02' },
    ],
  },
  {
    id: 't-omar',
    companySlug: 'trellis',
    person: 'Omar Nasr',
    unread: false,
    messages: [
      { id: 'm5', from: 'them', body: 'Good to connect. Ping me when you start thinking about pre-seed — happy to share how we prepared.', at: '12 Sep' },
      { id: 'm6', from: 'me', body: 'Thank you, will do.', at: '12 Sep' },
    ],
  },
]

/* ========================================================================== */
/* Spryve Build — optional hands-on service                                    */
/* ========================================================================== */

export const BUILD_STAGES = [
  {
    id: 'idea',
    label: 'Idea',
    title: 'Start with what you have',
    body: 'A note, a sketch, a problem you keep running into. We listen first and ask what success would look like for you.',
    output: 'A shared, written brief',
  },
  {
    id: 'shape',
    label: 'Shape',
    title: 'Decide what to build first',
    body: 'We work out who it is for, what the first version must do, and what can wait — so effort goes to the part that matters.',
    output: 'Scope and priorities',
  },
  {
    id: 'design',
    label: 'Design',
    title: 'Structure, then interface',
    body: 'User flows and wireframes first, then a visual design and a clickable prototype you can put in front of people.',
    output: 'Clickable prototype',
  },
  {
    id: 'develop',
    label: 'Develop',
    title: 'Built in working steps',
    body: 'Development happens in increments you can try as it grows, with review points instead of a long silence.',
    output: 'Working product increments',
  },
  {
    id: 'launch',
    label: 'Launch',
    title: 'Ready for real people',
    body: 'Testing, a launch checklist and a handover so you understand what you own and how to keep improving it.',
    output: 'Launch and handover',
  },
] as const

export const BUILD_SERVICES = [
  { id: 'clarify', label: 'Clarifying the concept', body: 'Turn a rough idea into a clear problem, audience and first version.', includes: ['Working sessions', 'Written brief', 'Priorities for version one'] },
  { id: 'website', label: 'Websites & landing pages', body: 'A site that explains what you do and works well on a phone.', includes: ['Structure and copy guidance', 'Responsive design', 'Build and launch'] },
  { id: 'prototype', label: 'Product prototypes', body: 'Something clickable to test with users or show to partners.', includes: ['User flows', 'Interface design', 'Clickable prototype'] },
  { id: 'product', label: 'Web & mobile products', body: 'Designing and developing a first working product, step by step.', includes: ['Design system', 'Incremental development', 'Testing before launch'] },
  { id: 'redesign', label: 'Redesigns & improvements', body: 'Improve something that exists but is not working as well as it should.', includes: ['Review of what exists', 'Prioritised fixes', 'Design and build'] },
] as const

export const BUILD_HELP_OPTIONS = ['Clarifying the concept', 'Website or landing page', 'Product prototype', 'Web or mobile product', 'Redesign', 'Not sure yet']
export const BUILD_STAGE_OPTIONS = ['Just an idea', 'Exploring', 'Have a prototype', 'Existing product', 'Ready to launch']

/* ========================================================================== */
/* Landing narrative                                                           */
/* ========================================================================== */

export const SCATTER = [
  { label: 'Accelerators', where: '14 open tabs' },
  { label: 'Funding', where: 'a spreadsheet from March' },
  { label: 'Templates', where: 'someone’s shared drive' },
  { label: 'Events', where: 'three group chats' },
  { label: 'Founders', where: 'a conference last year' },
  { label: 'Legal help', where: 'a friend of a friend' },
  { label: 'Guides', where: 'a newsletter you skim' },
  { label: 'Next steps', where: 'your head, at 2 a.m.' },
]
