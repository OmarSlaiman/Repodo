// Persistence and sharing. Both are conveniences: if they fail, the app carries on.

import { CAUSE_BY_KEY, OWNER_KEYS, isBlank } from './model.js'

const STORAGE_KEY = 'onboarding-flow-analyser/v1'

// The tool shipped in Danish first, and links made then are still in circulation.
// Translating the keys on the way in costs a few lines and keeps those links alive.
const LEGACY_OWNERS = { os: 'us', kunde: 'customer', tredjepart: 'thirdParty' }
const LEGACY_CAUSES = {
  kalender: 'calendar',
  beslutning: 'decision',
  leverance: 'delivery',
  prioritering: 'priority',
  teknisk: 'technical',
}

// The Danish example as it was saved. A visitor who only ever looked at the demo
// has exactly this in storage; replacing it keeps them from meeting an English
// page with Danish step names. Anything edited is the user's own work and stays.
const DANISH_EXAMPLE_NAMES = [
  'Kickoff-møde og forventningsafstemning',
  'Kunden leverer kontoplan og systemadgange',
  'Opsætning af integration',
  'Datavalidering og fejlsøgning',
  'Kunden godkender kontoplansmapping',
  'Første automatiske afstemning kører',
  'Træning af kundens team',
  'Go-live og overdragelse til drift',
]

export function isUntouchedDanishExample(steps) {
  if (!steps || steps.length !== DANISH_EXAMPLE_NAMES.length) return false
  return steps.every((s, i) => s.name === DANISH_EXAMPLE_NAMES[i])
}

function encodeUtf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeBase64ToUtf8(b64) {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded + '==='.slice((padded.length + 3) % 4))
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

// Short key names, to keep the link length down.
function pack(state) {
  return {
    s: state.steps.map((st) => [
      st.name,
      st.owner,
      Number(st.processHours) || 0,
      Number(st.waitDaysBefore) || 0,
      st.isValueMoment ? 1 : 0,
      st.waitCause || null,
    ]),
    a: isBlank(state.adoptionDays) ? null : Number(state.adoptionDays) || 0,
    r: state.readiness,
  }
}

function readOwner(raw) {
  if (OWNER_KEYS.includes(raw)) return raw
  return LEGACY_OWNERS[raw] ?? 'us'
}

function readCause(raw) {
  if (CAUSE_BY_KEY[raw]) return raw
  return LEGACY_CAUSES[raw] ?? null
}

// Older links and saved work carry only five fields per step and no adoption
// figure. They still load, but the cause stays unspecified rather than guessed.
function unpack(raw) {
  if (!raw || !Array.isArray(raw.s)) return null
  const steps = raw.s.map((row, i) => ({
    id: `u${i}`,
    name: String(row[0] ?? ''),
    owner: readOwner(row[1]),
    processHours: Number(row[2]) || 0,
    waitDaysBefore: Number(row[3]) || 0,
    isValueMoment: !!row[4],
    waitCause: readCause(row[5]),
  }))
  return {
    steps,
    readiness: raw.r ?? null,
    adoptionDays: raw.a === null || raw.a === undefined ? null : Number(raw.a) || 0,
  }
}

export function encodeStateToHash(state) {
  try {
    return '#p=' + encodeUtf8ToBase64(JSON.stringify(pack(state)))
  } catch {
    return ''
  }
}

export function readStateFromHash() {
  try {
    const hash = window.location.hash
    if (!hash.startsWith('#p=')) return null
    return unpack(JSON.parse(decodeBase64ToUtf8(hash.slice(3))))
  } catch {
    return null
  }
}

export function saveLocal(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pack(state)))
  } catch {
    /* localStorage may be switched off. It is a convenience, not a requirement. */
  }
}

export function readLocal() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? unpack(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function clearLocal() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* deliberately ignored */
  }
}
