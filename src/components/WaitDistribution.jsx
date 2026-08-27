import { OWNER_LABEL, WAIT_CAUSES, causeOf } from '../model.js'
import { fmt, fmtPct, fmtEstimate, fmtEstimateRange, dayWord } from '../format.js'

const OWNER_COLOR = {
  os: '#1F3864',
  kunde: '#6E85B5',
  tredjepart: '#A9B6D1',
}

function StackedBar({ segments, total, ariaLabel }) {
  return (
    <div className="stack" role="img" aria-label={ariaLabel}>
      {segments.map((seg) => {
        const share = (seg.days / total) * 100
        if (share <= 0) return null
        return (
          <div
            key={seg.key}
            className={'stack-seg' + (seg.light ? ' on-light' : '')}
            style={{ width: share + '%', background: seg.color }}
            title={seg.label + ': ' + fmt(seg.days, 1) + ' ' + dayWord(seg.days)}
          >
            {share >= 9 ? fmtPct(share) + ' %' : ''}
          </div>
        )
      })}
    </div>
  )
}

export default function WaitDistribution({ metrics, improvement, startHere }) {
  const { waitByOwner, waitByCause, totalWaitDays, totalLeadTimeDays, topWaits, humanWaitShare } = metrics
  const owners = ['os', 'kunde', 'tredjepart']
  const hasWait = totalWaitDays > 0

  const ownerSegments = owners.map((o) => ({
    key: o,
    days: waitByOwner[o],
    color: OWNER_COLOR[o],
    label: OWNER_LABEL[o],
  }))

  const causeSegments = WAIT_CAUSES.map((c) => ({
    key: c.key,
    days: waitByCause[c.key] || 0,
    color: c.color,
    label: c.label,
    light: !c.human,
  }))

  return (
    <section className="card" aria-labelledby="wait-heading">
      <div className="card-head">
        <h2 id="wait-heading">Hvor ligger ventetiden, og hvorfor</h2>
        <p className="note">Først hvem der ventede, så hvad de ventede på</p>
      </div>
      <div className="card-body">
        {!hasWait ? (
          <p className="hint">
            Der er ingen ventetid registreret endnu. Det er sjældent hele billedet: ventetid er
            den del af et forløb, der er nemmest at glemme, fordi ingen bruger tid på den.
          </p>
        ) : (
          <>
            <h3 className="sub-heading">Efter ejer</h3>
            <StackedBar
              segments={ownerSegments}
              total={totalWaitDays}
              ariaLabel={
                'Fordeling af ventetid efter ejer: ' +
                ownerSegments
                  .filter((s) => s.days > 0)
                  .map((s) => s.label + ' ' + fmtPct((s.days / totalWaitDays) * 100) + ' procent')
                  .join(', ')
              }
            />
            <div className="stack-legend">
              {ownerSegments.map((s) => (
                <span key={s.key}>
                  <i className="swatch" style={{ background: s.color }} />
                  {s.label}: <b>{fmt(s.days, 1)} {dayWord(s.days)}</b>
                </span>
              ))}
            </div>

            <h3 className="sub-heading" style={{ marginTop: 24 }}>
              Efter årsag
            </h3>
            <StackedBar
              segments={causeSegments}
              total={totalWaitDays}
              ariaLabel={
                'Fordeling af ventetid efter årsag: ' +
                causeSegments
                  .filter((s) => s.days > 0)
                  .map((s) => s.label + ' ' + fmtPct((s.days / totalWaitDays) * 100) + ' procent')
                  .join(', ')
              }
            />
            <div className="stack-legend">
              {causeSegments.map((s) => (
                <span key={s.key} title={causeOf(s.key).meaning}>
                  <i className="swatch" style={{ background: s.color }} />
                  {s.label}: <b>{fmt(s.days, 1)} {dayWord(s.days)}</b>
                </span>
              ))}
            </div>
            {humanWaitShare !== null ? (
              <p className="chart-caption">
                De blå felter er menneskelige årsager, det grå er teknisk.{' '}
                {fmt(humanWaitShare, 1)} % af ventetiden skyldes mennesker. Det er ikke
                inkompetence, det er organisering — og det er organisering, man kan lave om på.
              </p>
            ) : null}
          </>
        )}

        {topWaits.length > 0 ? (
          <div className="section">
            <h3 className="sub-heading">De største spildposter, og hvad man gør ved dem</h3>
            <p className="note-line">
              De tre længste stilstande. Modtrækket følger af årsagen, ikke af hvem der ventede.
            </p>
            <ul className="waste-list">
              {topWaits.map((w, i) => {
                const cause = causeOf(w.cause)
                return (
                  <li key={w.index}>
                    <span className="waste-rank">{i + 1}</span>
                    <div className="waste-body">
                      <div className="waste-name">
                        Før trin {w.index + 1}: {w.name || 'trin uden navn'}
                      </div>
                      <div className="waste-meta">
                        {fmtPct(w.shareOfTotal)} % af hele forløbet · ventetid hos{' '}
                        {OWNER_LABEL[w.owner].toLowerCase()} · årsag: {cause.label.toLowerCase()}
                      </div>
                      <div className="waste-action">
                        <b>Modtræk</b> {cause.countermeasure}
                        <span className="waste-saving">
                          Forkorter typisk {cause.saving[0]}–{cause.saving[1]} %
                        </span>
                      </div>
                    </div>
                    <span className="waste-days">
                      {fmt(w.days, w.days % 1 === 0 ? 0 : 1)} {dayWord(w.days)}
                    </span>
                  </li>
                )
              })}
            </ul>

            {improvement ? (
              <div className="potential">
                <h4>Hvis de tre poster håndteres</h4>
                <p>
                  Forløbet lander på cirka{' '}
                  <b>{fmtEstimateRange(improvement.leadLow, improvement.leadHigh)} dage</b> frem for{' '}
                  {fmt(totalLeadTimeDays, 1)}. Flow-effektiviteten stiger til cirka{' '}
                  <b>{fmtEstimateRange(improvement.flowLow, improvement.flowHigh)} %</b>.
                </p>
                <p className="disclaimer" style={{ marginTop: 10 }}>
                  Skønnet bygger på tommelfingerregler for hver årsagstype, ikke på jeres data.
                  Betragt det som en retning, ikke et løfte.
                </p>

                {startHere ? (
                  <p className="start-here">
                    <b>Start med {startHere.cause.label.toLowerCase()}ventetiden.</b> Den fylder{' '}
                    {fmt(startHere.days, startHere.days % 1 === 0 ? 0 : 1)}{' '}
                    {dayWord(startHere.days)} i forløbet
                    {startHere.clearlyLargest && startHere.causeCount > 1
                      ? ', mere end nogen anden årsag'
                      : ''}
                    , og {startHere.cause.effortNote}. Det er de{' '}
                    {fmtEstimate(startHere.expectedSaving)} dage, der er lettest at hente først.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
