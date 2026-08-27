// Danske talformater. Ét sted, saa tallene ser ens ud overalt.

export function fmt(n, decimals = 1) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  return n.toLocaleString('da-DK', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function fmtDays(n, decimals = 1) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  return fmt(n, decimals)
}

export function fmtInt(n) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  return Math.round(n).toLocaleString('da-DK')
}

export function fmtPct(n, decimals = 0) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  return fmt(n, decimals)
}

// "5 dage" / "1 dag", med korrekt ental
export function dayWord(n) {
  return Math.abs(n - 1) < 0.05 ? 'dag' : 'dage'
}
