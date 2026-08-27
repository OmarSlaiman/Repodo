// Persistens og deling. Begge dele er bekvemmeligheder: fejler de, koerer app'en videre.

import { CAUSE_BY_KEY, DEFAULT_CAUSE, isBlank } from './model.js'

const STORAGE_KEY = 'onboarding-flow-analyser/v1'

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

// Kort noeglenavne, saa link-laengden holdes nede.
function pack(state) {
  return {
    s: state.steps.map((st) => [
      st.name,
      st.owner,
      Number(st.processHours) || 0,
      Number(st.waitDaysBefore) || 0,
      st.isValueMoment ? 1 : 0,
      st.waitCause || DEFAULT_CAUSE,
    ]),
    a: isBlank(state.adoptionDays) ? null : Number(state.adoptionDays) || 0,
    r: state.readiness,
  }
}

// Aeldre links har kun fem felter pr. traek og intet adoptionstal. De skal stadig virke.
function unpack(raw) {
  if (!raw || !Array.isArray(raw.s)) return null
  const steps = raw.s.map((row, i) => ({
    id: `u${i}`,
    name: String(row[0] ?? ''),
    owner: ['os', 'kunde', 'tredjepart'].includes(row[1]) ? row[1] : 'os',
    processHours: Number(row[2]) || 0,
    waitDaysBefore: Number(row[3]) || 0,
    isValueMoment: !!row[4],
    waitCause: CAUSE_BY_KEY[row[5]] ? row[5] : DEFAULT_CAUSE,
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
    /* localStorage kan vaere slaaet fra. Det er ikke et krav. */
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
    /* ignoreres bevidst */
  }
}
