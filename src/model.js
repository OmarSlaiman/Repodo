// Data model, constants and calculations.
// Everything here is pure and free of UI, so the numbers can be checked in one place.

export const HOURS_PER_DAY = 7.4 // a standard full working day

export const OWNERS = [
  { key: 'us', label: 'Us', short: 'Us' },
  { key: 'customer', label: 'Customer', short: 'Customer' },
  { key: 'thirdParty', label: 'Third party', short: '3rd party' },
]

export const OWNER_KEYS = OWNERS.map((o) => o.key)

export const OWNER_LABEL = {
  us: 'Us',
  customer: 'Customer',
  thirdParty: 'Third party',
}

// Ownership tells you who is holding the ball. The cause tells you why it is
// sitting still - and it is the cause that decides what can be done about it.
export const WAIT_CAUSES = [
  {
    key: 'calendar',
    label: 'Calendar',
    human: true,
    meaning: 'Waiting for a slot in the calendar: a meeting, a workshop, a training session',
    countermeasure:
      'Book every meeting in the flow at kickoff, not as you go. Calendar wait happens because the time is found too late, not because people are busy.',
    saving: [40, 60],
    effortNote:
      'it needs no new systems, only that the meetings are booked at kickoff instead of along the way',
    color: '#1F3864',
  },
  {
    key: 'decision',
    label: 'Decision',
    human: true,
    meaning: 'Waiting for an approval or a choice',
    countermeasure:
      'Establish who holds the mandate before the flow starts, and get that person in the room. Failing that, agree up front what can be decided without them.',
    saving: [40, 60],
    effortNote: 'it takes one conversation about mandate before the flow begins',
    color: '#3C5488',
  },
  {
    key: 'delivery',
    label: 'Delivery',
    human: true,
    meaning: 'Waiting for someone to produce something: data, documents, access',
    countermeasure:
      'Do not ask for the material. Book a working session and produce it together. Send a template and an example beforehand.',
    saving: [50, 70],
    effortNote: 'it costs one shared working session instead of a string of reminders',
    color: '#6E85B5',
  },
  {
    key: 'priority',
    label: 'Priority',
    human: true,
    meaning: 'The task sits still because it is not important enough right now',
    countermeasure:
      'Create a visible result early, and find someone at the customer with something at stake in it succeeding. Low priority is rarely reluctance; it is the absence of consequence.',
    saving: [30, 50],
    effortNote:
      'it requires someone at the customer to have something at stake — not that your team works faster',
    color: '#A9B6D1',
  },
  {
    key: 'technical',
    label: 'Technical',
    human: false,
    meaning: 'The system is running, an integration is syncing, a third party is answering by machine',
    countermeasure:
      'Check whether the step can run alongside other work instead of blocking it. Otherwise this is where automation genuinely helps.',
    saving: [20, 50],
    effortNote: 'it is the only one of the five where automation is actually the answer',
    color: '#C9CFDB',
  },
]

export const CAUSE_BY_KEY = Object.fromEntries(WAIT_CAUSES.map((c) => [c.key, c]))

// A step without a cause is unspecified - not "delivery". If it fell back to a
// default, the tool would present a guess as a finding, and the human share
// would always read 100 %.
export const UNSPECIFIED = {
  key: null,
  label: 'Unspecified',
  human: null,
  meaning: 'The wait is recorded, but no cause has been set',
  color: '#EDEFF4',
}

export const causeOf = (key) => CAUSE_BY_KEY[key] ?? null
export const causeOrUnspecified = (key) => CAUSE_BY_KEY[key] ?? UNSPECIFIED

let idCounter = 0
export const newId = () => `s${Date.now().toString(36)}${(idCounter++).toString(36)}`

// The preloaded example: an AI-driven reconciliation product for accounting.
export const EXAMPLE_STEPS = [
  { id: 'ex1', name: 'Kickoff meeting and expectation setting', owner: 'us', processHours: 2, waitDaysBefore: 0, waitCause: 'calendar', isValueMoment: false },
  { id: 'ex2', name: 'Customer supplies chart of accounts and system access', owner: 'customer', processHours: 3, waitDaysBefore: 5, waitCause: 'delivery', isValueMoment: false },
  { id: 'ex3', name: 'Integration setup', owner: 'us', processHours: 6, waitDaysBefore: 1, waitCause: 'technical', isValueMoment: false },
  { id: 'ex4', name: 'Data validation and troubleshooting', owner: 'us', processHours: 4, waitDaysBefore: 0, waitCause: 'delivery', isValueMoment: false },
  { id: 'ex5', name: 'Customer approves the account mapping', owner: 'customer', processHours: 2, waitDaysBefore: 4, waitCause: 'decision', isValueMoment: false },
  { id: 'ex6', name: 'First automated reconciliation runs', owner: 'us', processHours: 3, waitDaysBefore: 1, waitCause: 'technical', isValueMoment: true },
  { id: 'ex7', name: 'Training the customer team', owner: 'us', processHours: 4, waitDaysBefore: 6, waitCause: 'calendar', isValueMoment: false },
  { id: 'ex8', name: 'Go-live and handover to operations', owner: 'us', processHours: 2, waitDaysBefore: 2, waitCause: 'calendar', isValueMoment: false },
]

export const READINESS_QUESTIONS = [
  {
    key: 'dataQuality',
    label: 'What shape is the customer data in?',
    help: 'Messy data is the single most common reason an onboarding flow slips.',
    options: ['Clean and structured', 'Mixed', 'Messy'],
    countermeasures: [
      null,
      'Ask for an extract of the most-used accounts before setup, and review it together. Mixed data quality rarely shows up until it costs time in validation.',
      'Set aside a separate step for data cleaning before setup, and do it with the customer. Otherwise messy data surfaces during validation, where it costs twice.',
    ],
  },
  {
    key: 'champion',
    label: 'Is there a champion at the customer?',
    help: 'Someone who wants the project finished, and who others listen to.',
    options: ['Yes, a clear champion', 'Unclear', 'No one'],
    countermeasures: [
      null,
      'Get a name on the responsible person at kickoff. If it is unclear who it is, there usually is not one.',
      'Ask for a named owner at the customer at kickoff, not a department. Without a person with a name, the flow belongs to everyone and therefore to no one.',
    ],
  },
  {
    key: 'decisionAuthority',
    label: 'How close is the decision-maker?',
    help: 'Distance to decisions turns into wait time, not into fewer decisions.',
    options: ['In the room', 'Partly involved', 'Far away'],
    countermeasures: [
      null,
      'Agree at kickoff which decisions can be made in the room and which have to go further. At least then the wait becomes predictable.',
      'Establish up front which decisions can be made without the top, and which cannot. Otherwise every approval turns into a queue.',
    ],
  },
  {
    key: 'systemExperience',
    label: 'Has the customer done something like this before?',
    help: 'Experience with similar systems shortens both training and approvals.',
    options: ['Used to similar', 'A little experience', 'Entirely new to them'],
    countermeasures: [
      null,
      'Schedule a short follow-up a couple of weeks after the training. That is when the questions arrive, not during the session itself.',
      'Plan for more training than you think, and place it earlier. Inexperienced users do not ask questions; they postpone using the product.',
    ],
  },
  {
    key: 'changeAppetite',
    label: 'How much appetite is there for change?',
    help: 'Low appetite for change rarely shows up as resistance. It shows up as postponed meetings.',
    options: ['High', 'Medium', 'Low'],
    countermeasures: [
      null,
      'Pick the first use case where the gain is clearest to the people who have to use it. Medium appetite tips on visible results.',
      'Find the one place where the new thing solves a problem they actually feel, and start there. Low appetite for change shows up as postponed meetings, not as resistance.',
    ],
  },
]

export const DEFAULT_READINESS = {
  dataQuality: 1,
  champion: 1,
  decisionAuthority: 1,
  systemExperience: 1,
  changeAppetite: 1,
}

export const MULTIPLIER_BANDS = [
  { max: 1, multiplier: 0.8, label: 'Better than planned' },
  { max: 3, multiplier: 1.0, label: 'As planned' },
  { max: 5, multiplier: 1.3, label: 'Somewhat longer' },
  { max: 7, multiplier: 1.6, label: 'Substantially longer' },
  { max: 10, multiplier: 2.0, label: 'Markedly longer' },
]

export function bandFor(score) {
  return MULTIPLIER_BANDS.find((b) => score <= b.max) ?? MULTIPLIER_BANDS[MULTIPLIER_BANDS.length - 1]
}

// Fields may briefly hold an empty string while the user is typing.
export function num(v) {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === ''
}

export function computeMetrics(steps) {
  const totalProcessHours = steps.reduce((sum, s) => sum + num(s.processHours), 0)
  const totalProcessDays = totalProcessHours / HOURS_PER_DAY
  const totalWaitDays = steps.reduce((sum, s) => sum + num(s.waitDaysBefore), 0)
  const totalLeadTimeDays = totalWaitDays + totalProcessDays

  const flowEfficiency = totalLeadTimeDays > 0 ? (totalProcessDays / totalLeadTimeDays) * 100 : null

  // If several steps are flagged, the first one marked as the value moment wins.
  const valueIndex = steps.findIndex((s) => s.isValueMoment)
  const ttvDays =
    valueIndex >= 0
      ? steps
          .slice(0, valueIndex + 1)
          .reduce((sum, s) => sum + num(s.waitDaysBefore) + num(s.processHours) / HOURS_PER_DAY, 0)
      : null

  let handoffs = 0
  for (let i = 1; i < steps.length; i++) {
    if (steps[i].owner !== steps[i - 1].owner) handoffs++
  }

  // Wait before a step is attributed to whoever has to carry that step out.
  const waitByOwner = { us: 0, customer: 0, thirdParty: 0 }
  const waitByCause = {}
  let humanWaitDays = 0
  let unspecifiedWaitDays = 0
  for (const s of steps) {
    const days = num(s.waitDaysBefore)
    if (waitByOwner[s.owner] !== undefined) waitByOwner[s.owner] += days
    if (days <= 0) continue
    const cause = causeOf(s.waitCause)
    if (!cause) {
      unspecifiedWaitDays += days
      continue
    }
    waitByCause[cause.key] = (waitByCause[cause.key] || 0) + days
    if (cause.human) humanWaitDays += days
  }
  // The share is measured against the wait the user has actually classified.
  const classifiedWaitDays = totalWaitDays - unspecifiedWaitDays
  const humanWaitShare =
    classifiedWaitDays > 0 ? (humanWaitDays / classifiedWaitDays) * 100 : null

  const topWaits = steps
    .map((s, index) => ({
      index,
      name: s.name,
      owner: s.owner,
      cause: s.waitCause && CAUSE_BY_KEY[s.waitCause] ? s.waitCause : null,
      days: num(s.waitDaysBefore),
    }))
    .filter((s) => s.days > 0)
    .sort((a, b) => b.days - a.days)
    .slice(0, 3)
    .map((s) => ({
      ...s,
      shareOfTotal: totalLeadTimeDays > 0 ? (s.days / totalLeadTimeDays) * 100 : 0,
    }))

  return {
    totalProcessHours,
    totalProcessDays,
    totalWaitDays,
    totalLeadTimeDays,
    flowEfficiency,
    valueIndex,
    ttvDays,
    handoffs,
    waitByOwner,
    waitByCause,
    humanWaitDays,
    humanWaitShare,
    unspecifiedWaitDays,
    classifiedWaitDays,
    topWaits,
  }
}

export function computeReadiness(metrics, readiness) {
  const score = READINESS_QUESTIONS.reduce((sum, q) => sum + (Number(readiness[q.key]) || 0), 0)
  const band = bandFor(score)
  const customerWait = metrics.waitByOwner.customer
  const otherWait = metrics.waitByOwner.us + metrics.waitByOwner.thirdParty
  const realisticWaitDays = customerWait * band.multiplier + otherWait
  const realisticLeadTimeDays = realisticWaitDays + metrics.totalProcessDays

  // A countermeasure for each answer that scores badly. A number with no way
  // out is just a verdict.
  const actions = READINESS_QUESTIONS.map((q) => {
    const value = Number(readiness[q.key]) || 0
    const text = q.countermeasures[value]
    return text ? { key: q.key, label: q.label, answer: q.options[value], text } : null
  }).filter(Boolean)

  return {
    score,
    band,
    multiplier: band.multiplier,
    realisticWaitDays,
    realisticLeadTimeDays,
    deltaDays: realisticLeadTimeDays - metrics.totalLeadTimeDays,
    actions,
  }
}

// What would happen if the three biggest delays were handled?
// The ranges come from the rules of thumb per cause, not from the user's data.
export function computeImprovement(metrics) {
  const top = metrics.topWaits
  if (!top.length || metrics.totalLeadTimeDays <= 0) return null

  // A delay without a cause has no saving range. It is skipped rather than
  // guessed into a number the user has no basis for.
  let minSaved = 0
  let maxSaved = 0
  let usedPosts = 0
  let skippedDays = 0
  for (const w of top) {
    const cause = causeOf(w.cause)
    if (!cause) {
      skippedDays += w.days
      continue
    }
    usedPosts++
    minSaved += (w.days * cause.saving[0]) / 100
    maxSaved += (w.days * cause.saving[1]) / 100
  }
  if (!usedPosts) return null

  const leadHigh = metrics.totalLeadTimeDays - minSaved
  const leadLow = Math.max(metrics.totalProcessDays, metrics.totalLeadTimeDays - maxSaved)
  const flowLow = leadHigh > 0 ? (metrics.totalProcessDays / leadHigh) * 100 : null
  const flowHigh = leadLow > 0 ? (metrics.totalProcessDays / leadLow) * 100 : null

  return { minSaved, maxSaved, leadLow, leadHigh, flowLow, flowHigh, usedPosts, skippedDays }
}

// What do you do first? The cause that realistically frees up the most days.
// The ranking covers the whole flow, not just the three biggest delays, because
// a countermeasure against a cause hits every place that cause appears.
export function computeStartHere(metrics) {
  const ranked = Object.entries(metrics.waitByCause)
    .map(([key, days]) => {
      const cause = causeOf(key)
      if (!cause) return null
      const midpoint = (cause.saving[0] + cause.saving[1]) / 2 / 100
      return { cause, days, expectedSaving: days * midpoint }
    })
    .filter(Boolean)
    .sort((a, b) => b.expectedSaving - a.expectedSaving || b.days - a.days)

  if (!ranked.length) return null
  const [first, second] = ranked
  return {
    ...first,
    // Without a runner-up to measure against, "more than any other" means nothing.
    clearlyLargest: !second || first.expectedSaving > second.expectedSaving + 1e-9,
    causeCount: ranked.length,
  }
}

export function computeAdoption(metrics, adoptionDays) {
  if (isBlank(adoptionDays)) return { days: null, realTimeToValue: null }
  const days = num(adoptionDays)
  return {
    days,
    realTimeToValue: metrics.ttvDays !== null ? metrics.ttvDays + days : null,
  }
}

// The building blocks for the timeline: wait and work in turn, in calendar time.
export function buildBlocks(steps) {
  const blocks = []
  let cursor = 0
  steps.forEach((step, index) => {
    const wait = num(step.waitDaysBefore)
    if (wait > 0) {
      blocks.push({
        kind: 'wait',
        stepIndex: index,
        owner: step.owner,
        cause: step.waitCause && CAUSE_BY_KEY[step.waitCause] ? step.waitCause : null,
        name: step.name,
        start: cursor,
        days: wait,
      })
      cursor += wait
    }
    const work = num(step.processHours) / HOURS_PER_DAY
    blocks.push({
      kind: 'work',
      stepIndex: index,
      owner: step.owner,
      name: step.name,
      start: cursor,
      days: work,
      hours: num(step.processHours),
      isValueMoment: !!step.isValueMoment,
    })
    cursor += work
  })
  return blocks
}
