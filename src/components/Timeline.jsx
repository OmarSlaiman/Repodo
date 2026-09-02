import { useCallback, useEffect, useRef, useState } from 'react'
import { OWNER_LABEL, buildBlocks, causeOrUnspecified } from '../model.js'
import { fmt, dayWord } from '../format.js'

const PAD_LEFT_LANES = 92
const PAD_LEFT_FLAT = 12
const PAD_RIGHT = 18
const TOP = 40
const LANE_H = 46
const LANE_GAP = 10
const AXIS_H = 36

const WORK_FILL = '#1F3864'
const WAIT_FILL = '#DDE1E9'
const WAIT_STROKE = '#C9CFDB'
const LANE_FILL = '#F7F8FA'
const LANE_STROKE = '#E6E9F0'
const AXIS_COLOR = '#B9BFCC'
const MUTED = '#6B7280'
const NAVY = '#1F3864'

const FALLBACK_WIDTH = 880

// Callback-ref frem for useEffect: tidslinjen forsvinder helt, naar der ikke er trin,
// og et effekt med tom afhaengighedsliste ville aldrig maale igen, naar den kommer tilbage.
function useContainerWidth() {
  const [width, setWidth] = useState(FALLBACK_WIDTH)
  const nodeRef = useRef(null)
  const observerRef = useRef(null)

  const ref = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    nodeRef.current = node
    if (!node) return
    setWidth(node.clientWidth || FALLBACK_WIDTH)
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => setWidth(node.clientWidth || FALLBACK_WIDTH))
    ro.observe(node)
    observerRef.current = ro
  }, [])

  // Reservevej for browsere uden ResizeObserver.
  useEffect(() => {
    if (typeof ResizeObserver !== 'undefined') return
    const onResize = () => {
      if (nodeRef.current) setWidth(nodeRef.current.clientWidth || FALLBACK_WIDTH)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return [ref, width]
}

// Ca. 6,4 px pr. tegn ved 12 px systemfont. Groft, men godt nok til at undgaa overloeb.
function truncate(text, availablePx) {
  const max = Math.floor((availablePx - 12) / 6.4)
  if (max < 3) return ''
  if (text.length <= max) return text
  return text.slice(0, Math.max(1, max - 1)).trimEnd() + '…'
}

function niceTickStep(totalDays, targetTicks) {
  const raw = totalDays / targetTicks
  const candidates = [0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500]
  return candidates.find((c) => c >= raw) ?? 1000
}

export default function Timeline({ steps, metrics, svgRef, adoptionDays = null }) {
  const [containerRef, containerWidth] = useContainerWidth()
  const [showLanes, setShowLanes] = useState(true)

  const blocks = buildBlocks(steps)
  const total = metrics.totalLeadTimeDays
  // Adoptionsperioden ligger efter go-live, men hoerer med paa den samme akse.
  const adoption = Number.isFinite(adoptionDays) && adoptionDays > 0 ? adoptionDays : 0
  const span = total + adoption

  const lanes = showLanes
    ? ['os', 'kunde', 'tredjepart'].filter((o) => steps.some((s) => s.owner === o))
    : ['__all__']
  const laneOf = (owner) => (showLanes ? Math.max(0, lanes.indexOf(owner)) : 0)

  const padLeft = showLanes ? PAD_LEFT_LANES : PAD_LEFT_FLAT
  const minWidth = padLeft + PAD_RIGHT + Math.max(420, steps.length * 44)
  const width = Math.max(containerWidth, minWidth)
  const chartW = width - padLeft - PAD_RIGHT
  const height = TOP + lanes.length * LANE_H + (lanes.length - 1) * LANE_GAP + AXIS_H
  const lanesBottom = TOP + lanes.length * LANE_H + (lanes.length - 1) * LANE_GAP

  const pxPerDay = span > 0 ? chartW / span : 0
  const x = (days) => padLeft + days * pxPerDay
  const laneY = (i) => TOP + i * (LANE_H + LANE_GAP)

  if (steps.length === 0 || total <= 0) {
    return (
      <section className="card" aria-labelledby="timeline-heading">
        <div className="card-head">
          <h2 id="timeline-heading">Tidslinje</h2>
        </div>
        <div className="card-body">
          <p className="hint">
            Tidslinjen tegnes, så snart der er trin med tid i. Bredden følger kalendertiden, så
            arbejde og ventetid kan sammenlignes direkte.
          </p>
        </div>
      </section>
    )
  }

  const tickStep = niceTickStep(span, Math.max(4, Math.min(8, Math.floor(chartW / 110))))
  const ticks = []
  for (let d = 0; d <= span + 1e-9; d += tickStep) ticks.push(Math.round(d * 1000) / 1000)

  // Overleveringer: hvor ejerskabet skifter mellem to trin i traek.
  const handoffMarks = []
  if (showLanes) {
    let cursor = 0
    const startOf = []
    for (const s of steps) {
      startOf.push(cursor)
      cursor += Number(s.waitDaysBefore) || 0
      cursor += (Number(s.processHours) || 0) / 7.4
    }
    for (let i = 1; i < steps.length; i++) {
      if (steps[i].owner !== steps[i - 1].owner) {
        handoffMarks.push({
          x: x(startOf[i]),
          from: laneY(laneOf(steps[i - 1].owner)) + LANE_H / 2,
          to: laneY(laneOf(steps[i].owner)) + LANE_H / 2,
          label: OWNER_LABEL[steps[i - 1].owner] + ' → ' + OWNER_LABEL[steps[i].owner],
        })
      }
    }
  }

  const ttv = metrics.ttvDays
  const ttvX = ttv !== null ? x(ttv) : null
  const flagAnchor = ttvX !== null && ttvX > width - 170 ? 'end' : 'start'

  return (
    <section className="card" aria-labelledby="timeline-heading">
      <div className="card-head">
        <h2 id="timeline-heading">Tidslinje</h2>
        <label className="note" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
          <input type="checkbox" checked={showLanes} onChange={(e) => setShowLanes(e.target.checked)} />
          Vis baner pr. ejer
        </label>
      </div>
      <div className="card-body">
        <div className="chart-scroll" ref={containerRef}>
          <svg
            ref={svgRef}
            width={width}
            height={height}
            viewBox={'0 0 ' + width + ' ' + height}
            xmlns="http://www.w3.org/2000/svg"
            fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif"
            role="img"
            aria-label={
              'Tidslinje over forløbet. ' +
              fmt(metrics.totalLeadTimeDays, 1) +
              ' dages gennemløbstid, hvoraf ' +
              fmt(metrics.totalProcessDays, 1) +
              ' dage er arbejde og ' +
              fmt(metrics.totalWaitDays, 1) +
              ' dage er ventetid.'
            }
          >
            <rect x="0" y="0" width={width} height={height} fill="#FFFFFF" />

            {lanes.map((lane, i) => (
              <g key={lane}>
                <rect
                  x={padLeft}
                  y={laneY(i)}
                  width={chartW}
                  height={LANE_H}
                  fill={LANE_FILL}
                  stroke={LANE_STROKE}
                  rx="3"
                />
                {showLanes ? (
                  <text
                    x={padLeft - 12}
                    y={laneY(i) + LANE_H / 2 + 4}
                    textAnchor="end"
                    fontSize="12.5"
                    fill={MUTED}
                  >
                    {OWNER_LABEL[lane]}
                  </text>
                ) : null}
              </g>
            ))}

            {handoffMarks.map((h, i) => (
              <g key={'h' + i}>
                <title>{'Overlevering: ' + h.label}</title>
                <line
                  x1={h.x}
                  y1={h.from}
                  x2={h.x}
                  y2={h.to}
                  stroke="#9AA3B5"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle cx={h.x} cy={h.to} r="2.5" fill="#9AA3B5" />
              </g>
            ))}

            {blocks.map((b, i) => {
              const bx = x(b.start)
              const bw = Math.max(b.days * pxPerDay, 2)
              const y0 = laneY(laneOf(b.owner))
              const isWork = b.kind === 'work'
              const h = isWork ? LANE_H - 16 : LANE_H - 24
              const y = y0 + (LANE_H - h) / 2
              // Arbejdsblokke er som regel for smalle til et navn. Nummeret binder dem
              // til trinlisten, uden at tage plads fra pointen.
              const label = isWork
                ? bw >= 64
                  ? truncate(b.name, bw)
                  : bw >= 9
                    ? String(b.stepIndex + 1)
                    : ''
                : bw > 30
                  ? fmt(b.days, b.days < 1 ? 1 : 0) + ' d'
                  : ''
              const centered = isWork && bw < 64
              const tip = isWork
                ? b.name + ' · ' + fmt(b.hours, 1) + ' timers arbejde · ' + OWNER_LABEL[b.owner]
                : 'Ventetid før "' +
                  b.name +
                  '" · ' +
                  fmt(b.days, 1) +
                  ' ' +
                  dayWord(b.days) +
                  ' · ' +
                  OWNER_LABEL[b.owner] +
                  ' · årsag: ' +
                  causeOrUnspecified(b.cause).label.toLowerCase()
              return (
                <g key={i}>
                  <title>{tip}</title>
                  <rect
                    x={bx}
                    y={y}
                    width={bw}
                    height={h}
                    rx="2"
                    fill={isWork ? WORK_FILL : WAIT_FILL}
                    stroke={isWork ? 'none' : WAIT_STROKE}
                  />
                  {label ? (
                    <text
                      x={centered ? bx + bw / 2 : bx + 6}
                      y={y + h / 2 + 4}
                      textAnchor={centered ? 'middle' : 'start'}
                      fontSize={centered ? '10.5' : '11.5'}
                      fill={isWork ? '#FFFFFF' : MUTED}
                    >
                      {label}
                    </text>
                  ) : null}
                </g>
              )
            })}

            {adoption > 0 ? (
              <g>
                <title>
                  {'Adoptionsperiode · ' +
                    fmt(adoption, adoption % 1 === 0 ? 0 : 1) +
                    ' ' +
                    dayWord(adoption) +
                    ' fra go-live til løsningen bruges i det daglige'}
                </title>
                <rect
                  x={x(total)}
                  y={TOP}
                  width={Math.max(x(span) - x(total), 2)}
                  height={lanesBottom - TOP}
                  fill="#F2F4F8"
                  stroke={NAVY}
                  strokeWidth="1"
                  strokeDasharray="5 4"
                  opacity="0.85"
                  rx="3"
                />
                {x(span) - x(total) > 120 ? (
                  <text
                    x={(x(total) + x(span)) / 2}
                    y={TOP + (lanesBottom - TOP) / 2 + 4}
                    textAnchor="middle"
                    fontSize="12"
                    fill={NAVY}
                    fontWeight="600"
                  >
                    Adoptionsperiode
                  </text>
                ) : null}
              </g>
            ) : null}

            {ttvX !== null ? (
              <g>
                <line
                  x1={ttvX}
                  y1={TOP - 22}
                  x2={ttvX}
                  y2={lanesBottom + 6}
                  stroke={NAVY}
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <circle cx={ttvX} cy={TOP - 22} r="3" fill={NAVY} />
                <text
                  x={flagAnchor === 'end' ? ttvX - 8 : ttvX + 8}
                  y={TOP - 18}
                  textAnchor={flagAnchor}
                  fontSize="12"
                  fill={NAVY}
                  fontWeight="600"
                >
                  {'Første værdi · ' + fmt(ttv, 1) + ' ' + dayWord(ttv)}
                </text>
              </g>
            ) : null}

            <line
              x1={padLeft}
              y1={lanesBottom + 12}
              x2={padLeft + chartW}
              y2={lanesBottom + 12}
              stroke={AXIS_COLOR}
            />
            {ticks.map((t, i) => (
              <g key={'t' + i}>
                <line
                  x1={x(t)}
                  y1={lanesBottom + 12}
                  x2={x(t)}
                  y2={lanesBottom + 17}
                  stroke={AXIS_COLOR}
                />
                <text x={x(t)} y={lanesBottom + 30} textAnchor="middle" fontSize="11" fill={MUTED}>
                  {fmt(t, t % 1 === 0 ? 0 : 1)}
                </text>
              </g>
            ))}
            <text x={padLeft + chartW} y={lanesBottom + 30} textAnchor="end" fontSize="11" fill={MUTED}>
              kalenderdage
            </text>
          </svg>
        </div>

        <div className="legend">
          <span>
            <i className="swatch" style={{ background: WORK_FILL }} /> Arbejde
          </span>
          <span>
            <i className="swatch" style={{ background: WAIT_FILL, borderColor: WAIT_STROKE }} /> Ventetid
          </span>
          {showLanes ? <span>Stiplet lodret linje: overlevering</span> : null}
          {adoption > 0 ? (
            <span>
              <i className="swatch" style={{ background: '#F2F4F8', borderColor: NAVY, borderStyle: 'dashed' }} />{' '}
              Adoptionsperiode
            </span>
          ) : null}
          <span>Hold musen over en blok for detaljer</span>
        </div>

        <p className="chart-caption">
          Bredden følger kalendertiden. De mørke blokke er den tid, nogen faktisk arbejder;
          de lyse er den tid, opgaven ligger stille. Forholdet mellem dem er flow-effektiviteten.
        </p>
      </div>
    </section>
  )
}
