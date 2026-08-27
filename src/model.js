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

// Ejerskab fortaeller, hvem der holder bolden. Aarsagen fortaeller, hvorfor den ligger
// stille - og det er aarsagen, der afgoer, hvad man kan goere ved det.
export const WAIT_CAUSES = [
  {
    key: 'kalender',
    label: 'Kalender',
    human: true,
    meaning: 'Venter på at få en tid i kalenderen: møde, workshop, træning',
    countermeasure:
      'Book alle møder i forløbet ved kickoff, ikke undervejs. Kalenderventetid opstår, fordi tiden findes for sent, ikke fordi folk er optaget.',
    saving: [40, 60],
    effortNote:
      'den kræver ingen nye systemer, kun at møderne bookes ved kickoff i stedet for undervejs',
    color: '#1F3864',
  },
  {
    key: 'beslutning',
    label: 'Beslutning',
    human: true,
    meaning: 'Venter på en godkendelse eller et valg',
    countermeasure:
      'Afklar hvem der har mandatet, før forløbet starter, og få vedkommende med i lokalet. Alternativt: aftal på forhånd, hvad der kan besluttes uden dem.',
    saving: [40, 60],
    effortNote: 'den kræver én samtale om mandat, før forløbet går i gang',
    color: '#3C5488',
  },
  {
    key: 'leverance',
    label: 'Leverance',
    human: true,
    meaning: 'Venter på, at nogen producerer noget: data, dokumenter, adgange',
    countermeasure:
      'Bed ikke om materialet. Sæt en fælles arbejdssession, hvor I laver det sammen. Send skabelon og eksempel på forhånd.',
    saving: [50, 70],
    effortNote: 'den koster én fælles arbejdssession i stedet for en række rykkere',
    color: '#6E85B5',
  },
  {
    key: 'prioritering',
    label: 'Prioritering',
    human: true,
    meaning: 'Opgaven ligger stille, fordi den ikke er vigtig nok lige nu',
    countermeasure:
      'Skab et synligt resultat tidligt, og find en person hos kunden, der har noget på spil i, at det lykkes. Lav prioritering er sjældent modvilje, det er fravær af konsekvens.',
    saving: [30, 50],
    effortNote:
      'den kræver, at nogen hos kunden har noget på spil — ikke at I arbejder hurtigere',
    color: '#A9B6D1',
  },
  {
    key: 'teknisk',
    label: 'Teknisk',
    human: false,
    meaning: 'Systemet kører, integration synkroniserer, tredjepart svarer maskinelt',
    countermeasure:
      'Undersøg om trinnet kan køre parallelt med andet arbejde frem for at blokere. Ellers er det her, automatisering faktisk giver mening.',
    saving: [20, 50],
    effortNote: 'den er den eneste af de fem, hvor automatisering faktisk er svaret',
    color: '#C9CFDB',
  },
]

export const CAUSE_BY_KEY = Object.fromEntries(WAIT_CAUSES.map((c) => [c.key, c]))
export const DEFAULT_CAUSE = 'leverance'
export const causeOf = (key) => CAUSE_BY_KEY[key] ?? CAUSE_BY_KEY[DEFAULT_CAUSE]

let idCounter = 0
export const newId = () => `s${Date.now().toString(36)}${(idCounter++).toString(36)}`

// Det forudindlaeste eksempel: et AI-drevet afstemningsprodukt til regnskab.
export const EXAMPLE_STEPS = [
  { id: 'ex1', name: 'Kickoff-møde og forventningsafstemning', owner: 'os', processHours: 2, waitDaysBefore: 0, waitCause: 'kalender', isValueMoment: false },
  { id: 'ex2', name: 'Kunden leverer kontoplan og systemadgange', owner: 'kunde', processHours: 3, waitDaysBefore: 5, waitCause: 'leverance', isValueMoment: false },
  { id: 'ex3', name: 'Opsætning af integration', owner: 'os', processHours: 6, waitDaysBefore: 1, waitCause: 'prioritering', isValueMoment: false },
  { id: 'ex4', name: 'Datavalidering og fejlsøgning', owner: 'os', processHours: 4, waitDaysBefore: 0, waitCause: 'leverance', isValueMoment: false },
  { id: 'ex5', name: 'Kunden godkender kontoplansmapping', owner: 'kunde', processHours: 2, waitDaysBefore: 4, waitCause: 'beslutning', isValueMoment: false },
  { id: 'ex6', name: 'Første automatiske afstemning kører', owner: 'os', processHours: 3, waitDaysBefore: 1, waitCause: 'teknisk', isValueMoment: true },
  { id: 'ex7', name: 'Træning af kundens team', owner: 'os', processHours: 4, waitDaysBefore: 6, waitCause: 'kalender', isValueMoment: false },
  { id: 'ex8', name: 'Go-live og overdragelse til drift', owner: 'os', processHours: 2, waitDaysBefore: 2, waitCause: 'kalender', isValueMoment: false },
]

export const READINESS_QUESTIONS = [
  {
    key: 'dataQuality',
    label: 'Hvordan ser kundens data ud?',
    help: 'Rodede data er den hyppigste enkeltårsag til, at et onboardingforløb skrider.',
    options: ['Rene og strukturerede', 'Blandet', 'Rodede'],
    countermeasures: [
      null,
      'Bed om et udtræk af de mest brugte konti før opsætning, og gennemgå det sammen. Blandet datakvalitet opdages sjældent, før den koster tid i valideringen.',
      'Afsæt et separat trin til datarensning før opsætning, og lav det sammen med kunden. Rodede data opdages ellers først under validering, hvor det koster dobbelt.',
    ],
  },
  {
    key: 'champion',
    label: 'Er der en ildsjæl hos kunden?',
    help: 'En person, der vil have projektet i mål, og som andre lytter til.',
    options: ['Ja, en klar ildsjæl', 'Uklart', 'Nej, ingen'],
    countermeasures: [
      null,
      'Få sat navn på den ansvarlige ved kickoff. Er der tvivl om, hvem det er, er der som regel ingen.',
      'Bed om en navngiven ansvarlig hos kunden ved kickoff, ikke en afdeling. Uden en person med navn bliver forløbet alles og dermed ingens.',
    ],
  },
  {
    key: 'decisionAuthority',
    label: 'Hvor tæt er beslutningstageren på?',
    help: 'Afstand til beslutninger bliver til ventetid, ikke til færre beslutninger.',
    options: ['Med i lokalet', 'Delvist involveret', 'Langt væk'],
    countermeasures: [
      null,
      'Aftal ved kickoff, hvilke beslutninger der kan træffes i lokalet, og hvilke der skal videre. Så bliver ventetiden i det mindste forudsigelig.',
      'Få afklaret på forhånd, hvilke beslutninger der kan træffes uden den øverste, og hvilke der ikke kan. Ellers bliver hver godkendelse til en ventepost.',
    ],
  },
  {
    key: 'systemExperience',
    label: 'Har kunden prøvet noget lignende før?',
    help: 'Erfaring med tilsvarende systemer forkorter både oplæring og godkendelser.',
    options: ['Vant til lignende', 'Lidt erfaring', 'Helt nyt for dem'],
    countermeasures: [
      null,
      'Læg en kort opfølgning ind et par uger efter træningen. Det er dér, spørgsmålene kommer, ikke under selve oplæringen.',
      'Regn med mere træning end planlagt, og læg den tidligere. Uerfarne brugere stiller ikke spørgsmål, de udskyder brugen.',
    ],
  },
  {
    key: 'changeAppetite',
    label: 'Hvor stor er lysten til forandring?',
    help: 'Lav forandringslyst viser sig sjældent som modstand. Den viser sig som udskudte møder.',
    options: ['Høj', 'Middel', 'Lav'],
    countermeasures: [
      null,
      'Vælg det første anvendelsesområde, hvor gevinsten er tydeligst for dem, der skal bruge det. Middel forandringslyst tipper på synlige resultater.',
      'Find det ene sted, hvor det nye løser et problem, de faktisk mærker, og start dér. Lav forandringslyst viser sig som udskudte møder, ikke som modstand.',
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

export function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === ''
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
  const waitByCause = {}
  let humanWaitDays = 0
  for (const s of steps) {
    const days = num(s.waitDaysBefore)
    if (waitByOwner[s.owner] !== undefined) waitByOwner[s.owner] += days
    if (days <= 0) continue
    const cause = causeOf(s.waitCause)
    waitByCause[cause.key] = (waitByCause[cause.key] || 0) + days
    if (cause.human) humanWaitDays += days
  }
  const humanWaitShare = totalWaitDays > 0 ? (humanWaitDays / totalWaitDays) * 100 : null

  const topWaits = steps
    .map((s, index) => ({
      index,
      name: s.name,
      owner: s.owner,
      cause: causeOf(s.waitCause).key,
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

  // Modtraek for de svar, der scorer daarligt. Et tal uden en udvej er bare en dom.
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

// Hvad ville der ske, hvis de tre stoerste spildposter blev haandteret?
// Intervallerne kommer fra tommelfingerreglerne pr. aarsag, ikke fra brugerens data.
export function computeImprovement(metrics) {
  const top = metrics.topWaits
  if (!top.length || metrics.totalLeadTimeDays <= 0) return null

  let minSaved = 0
  let maxSaved = 0
  for (const w of top) {
    const cause = causeOf(w.cause)
    minSaved += (w.days * cause.saving[0]) / 100
    maxSaved += (w.days * cause.saving[1]) / 100
  }

  const leadHigh = metrics.totalLeadTimeDays - minSaved
  const leadLow = Math.max(metrics.totalProcessDays, metrics.totalLeadTimeDays - maxSaved)
  const flowLow = leadHigh > 0 ? (metrics.totalProcessDays / leadHigh) * 100 : null
  const flowHigh = leadLow > 0 ? (metrics.totalProcessDays / leadLow) * 100 : null

  return { minSaved, maxSaved, leadLow, leadHigh, flowLow, flowHigh, causes: top.map((w) => w.cause) }
}

// Hvad goer man foerst? Den aarsag, der realistisk frigiver flest dage.
// Rangeringen gaar paa hele forloebet, ikke kun de tre stoerste poster, fordi
// et modtraek mod en aarsag rammer alle de steder, aarsagen optraeder.
export function computeStartHere(metrics) {
  const ranked = Object.entries(metrics.waitByCause)
    .map(([key, days]) => {
      const cause = causeOf(key)
      const midpoint = (cause.saving[0] + cause.saving[1]) / 2 / 100
      return { cause, days, expectedSaving: days * midpoint }
    })
    .sort((a, b) => b.expectedSaving - a.expectedSaving || b.days - a.days)

  if (!ranked.length) return null
  const [first, second] = ranked
  return {
    ...first,
    // Uden en toer at maale mod giver "mere end nogen anden" ingen mening.
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

// Byggeklodserne til tidslinjen: skiftevis ventetid og arbejde, i kalendertid.
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
        cause: causeOf(step.waitCause).key,
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
