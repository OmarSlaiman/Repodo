// Datamodel, konstanter og beregninger.
// Alt her er rent og uden UI, saa tallene kan efterproeves et sted.

export const HOURS_PER_DAY = 7.4 // dansk standard fuldtidsdag

export const OWNERS = [
  { key: 'os', label: 'Os', short: 'Os' },
  { key: 'kunde', label: 'Kunden', short: 'Kunde' },
  { key: 'tredjepart', label: 'Tredjepart', short: '3. part' },
]

export const OWNER_LABEL = {
  os: 'Os',
  kunde: 'Kunden',
  tredjepart: 'Tredjepart',
}

let idCounter = 0
export const newId = () => `s${Date.now().toString(36)}${(idCounter++).toString(36)}`

// Det forudindlaeste eksempel: et AI-drevet afstemningsprodukt til regnskab.
export const EXAMPLE_STEPS = [
  { id: 'ex1', name: 'Kickoff-møde og forventningsafstemning', owner: 'os', processHours: 2, waitDaysBefore: 0, isValueMoment: false },
  { id: 'ex2', name: 'Kunden leverer kontoplan og systemadgange', owner: 'kunde', processHours: 3, waitDaysBefore: 5, isValueMoment: false },
  { id: 'ex3', name: 'Opsætning af integration', owner: 'os', processHours: 6, waitDaysBefore: 1, isValueMoment: false },
  { id: 'ex4', name: 'Datavalidering og fejlsøgning', owner: 'os', processHours: 4, waitDaysBefore: 0, isValueMoment: false },
  { id: 'ex5', name: 'Kunden godkender kontoplansmapping', owner: 'kunde', processHours: 2, waitDaysBefore: 4, isValueMoment: false },
  { id: 'ex6', name: 'Første automatiske afstemning kører', owner: 'os', processHours: 3, waitDaysBefore: 1, isValueMoment: true },
  { id: 'ex7', name: 'Træning af kundens team', owner: 'os', processHours: 4, waitDaysBefore: 6, isValueMoment: false },
  { id: 'ex8', name: 'Go-live og overdragelse til drift', owner: 'os', processHours: 2, waitDaysBefore: 2, isValueMoment: false },
]

export const READINESS_QUESTIONS = [
  {
    key: 'dataQuality',
    label: 'Hvordan ser kundens data ud?',
    help: 'Rodede data er den hyppigste enkeltårsag til, at et onboardingforløb skrider.',
    options: ['Rene og strukturerede', 'Blandet', 'Rodede'],
  },
  {
    key: 'champion',
    label: 'Er der en ildsjæl hos kunden?',
    help: 'En person, der vil have projektet i mål, og som andre lytter til.',
    options: ['Ja, en klar ildsjæl', 'Uklart', 'Nej, ingen'],
  },
  {
    key: 'decisionAuthority',
    label: 'Hvor tæt er beslutningstageren på?',
    help: 'Afstand til beslutninger bliver til ventetid, ikke til færre beslutninger.',
    options: ['Med i lokalet', 'Delvist involveret', 'Langt væk'],
  },
  {
    key: 'systemExperience',
    label: 'Har kunden prøvet noget lignende før?',
    help: 'Erfaring med tilsvarende systemer forkorter både oplæring og godkendelser.',
    options: ['Vant til lignende', 'Lidt erfaring', 'Helt nyt for dem'],
  },
  {
    key: 'changeAppetite',
    label: 'Hvor stor er lysten til forandring?',
    help: 'Lav forandringslyst viser sig sjældent som modstand. Den viser sig som udskudte møder.',
    options: ['Høj', 'Middel', 'Lav'],
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
  { max: 1, multiplier: 0.8, label: 'Bedre end planlagt' },
  { max: 3, multiplier: 1.0, label: 'Som planlagt' },
  { max: 5, multiplier: 1.3, label: 'Noget længere' },
  { max: 7, multiplier: 1.6, label: 'Væsentligt længere' },
  { max: 10, multiplier: 2.0, label: 'Markant længere' },
]

export function bandFor(score) {
  return MULTIPLIER_BANDS.find((b) => score <= b.max) ?? MULTIPLIER_BANDS[MULTIPLIER_BANDS.length - 1]
}

// Felterne kan midlertidigt vaere tomme strenge, mens brugeren taster.
export function num(v) {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export function computeMetrics(steps) {
  const totalProcessHours = steps.reduce((sum, s) => sum + num(s.processHours), 0)
  const totalProcessDays = totalProcessHours / HOURS_PER_DAY
  const totalWaitDays = steps.reduce((sum, s) => sum + num(s.waitDaysBefore), 0)
  const totalLeadTimeDays = totalWaitDays + totalProcessDays

  const flowEfficiency = totalLeadTimeDays > 0 ? (totalProcessDays / totalLeadTimeDays) * 100 : null

  // Foerste trin markeret som vaerdioejeblik vinder, hvis flere er sat.
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

  // Ventetid foer et trin tilskrives den, der skal udfoere trinnet.
  const waitByOwner = { os: 0, kunde: 0, tredjepart: 0 }
  const processByOwner = { os: 0, kunde: 0, tredjepart: 0 }
  for (const s of steps) {
    if (waitByOwner[s.owner] === undefined) continue
    waitByOwner[s.owner] += num(s.waitDaysBefore)
    processByOwner[s.owner] += num(s.processHours)
  }

  const topWaits = steps
    .map((s, index) => ({ index, name: s.name, owner: s.owner, days: num(s.waitDaysBefore) }))
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
    processByOwner,
    topWaits,
  }
}

export function computeReadiness(metrics, readiness) {
  const score = READINESS_QUESTIONS.reduce((sum, q) => sum + (Number(readiness[q.key]) || 0), 0)
  const band = bandFor(score)
  const customerWait = metrics.waitByOwner.kunde
  const otherWait = metrics.waitByOwner.os + metrics.waitByOwner.tredjepart
  const realisticWaitDays = customerWait * band.multiplier + otherWait
  const realisticLeadTimeDays = realisticWaitDays + metrics.totalProcessDays
  return {
    score,
    band,
    multiplier: band.multiplier,
    realisticWaitDays,
    realisticLeadTimeDays,
    deltaDays: realisticLeadTimeDays - metrics.totalLeadTimeDays,
  }
}

// Byggeklodserne til tidslinjen: skiftevis ventetid og arbejde, i kalendertid.
export function buildBlocks(steps) {
  const blocks = []
  let cursor = 0
  steps.forEach((step, index) => {
    const wait = num(step.waitDaysBefore)
    if (wait > 0) {
      blocks.push({ kind: 'wait', stepIndex: index, owner: step.owner, name: step.name, start: cursor, days: wait })
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
