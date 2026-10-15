import { OWNER_KEYS, OWNER_LABEL, WAIT_CAUSES, UNSPECIFIED, causeOf } from '../model.js'
import { fmt, fmtPct, fmtEstimate, fmtEstimateRange, dayWord } from '../format.js'

const OWNER_COLOR = {
  us: '#1F3864',
  customer: '#6E85B5',
  thirdParty: '#A9B6D1',
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
            className={
              'stack-seg' + (seg.light ? ' on-light' : '') + (seg.hatched ? ' hatched' : '')
            }
            style={{ width: share + '%', background: seg.color }}
            title={seg.label + ': ' + fmt(seg.days, 1) + ' ' + dayWord(seg.days)}
          >
            {share >= 9 ? fmtPct(share) + '%' : ''}
          </div>
        )
      })}
    </div>
  )
}

export default function WaitDistribution({ metrics, improvement, startHere }) {
  const {
    waitByOwner,
    waitByCause,
    totalWaitDays,
    totalLeadTimeDays,
    topWaits,
    humanWaitShare,
    unspecifiedWaitDays,
  } = metrics
  const hasWait = totalWaitDays > 0

  const ownerSegments = OWNER_KEYS.map((o) => ({
    key: o,
    days: waitByOwner[o],
    color: OWNER_COLOR[o],
    label: OWNER_LABEL[o],
  }))

  const causeSegments = [
    ...WAIT_CAUSES.map((c) => ({
      key: c.key,
      days: waitByCause[c.key] || 0,
      color: c.color,
      label: c.label,
      light: !c.human,
    })),
    {
      key: 'unspecified',
      days: unspecifiedWaitDays,
      color: UNSPECIFIED.color,
      label: UNSPECIFIED.label,
      light: true,
      hatched: true,
    },
  ]

  return (
    <section className="card" aria-labelledby="wait-heading">
      <div className="card-head">
        <h2 id="wait-heading">Where the waiting sits, and why</h2>
        <p className="note">First who waited, then what they were waiting on</p>
      </div>
      <div className="card-body">
        {!hasWait ? (
          <p className="hint">
            No waiting has been recorded yet. That is rarely the whole picture: waiting is the part
            of a flow that is easiest to forget, because nobody spends time on it.
          </p>
        ) : (
          <>
            <h3 className="sub-heading">By owner</h3>
            <StackedBar
              segments={ownerSegments}
              total={totalWaitDays}
              ariaLabel={
                'Distribution of waiting by owner: ' +
                ownerSegments
                  .filter((s) => s.days > 0)
                  .map((s) => s.label + ' ' + fmtPct((s.days / totalWaitDays) * 100) + ' percent')
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
              By cause
            </h3>
            <StackedBar
              segments={causeSegments}
              total={totalWaitDays}
              ariaLabel={
                'Distribution of waiting by cause: ' +
                causeSegments
                  .filter((s) => s.days > 0)
                  .map((s) => s.label + ' ' + fmtPct((s.days / totalWaitDays) * 100) + ' percent')
                  .join(', ')
              }
            />
            <div className="stack-legend">
              {causeSegments
                .filter((s) => s.key !== 'unspecified' || s.days > 0)
                .map((s) => (
                  <span key={s.key} title={(causeOf(s.key) ?? UNSPECIFIED).meaning}>
                    <i
                      className={'swatch' + (s.hatched ? ' hatched' : '')}
                      style={{ background: s.color }}
                    />
                    {s.label}: <b>{fmt(s.days, 1)} {dayWord(s.days)}</b>
                  </span>
                ))}
            </div>
            {humanWaitShare !== null ? (
              <p className="chart-caption">
                The blue fields are human causes, the grey one is technical.{' '}
                {fmt(humanWaitShare, 1)}% of the classified waiting comes down to people. That is
                not incompetence, it is organisation — and organisation is something you can change.
                {unspecifiedWaitDays > 0 ? (
                  <>
                    {' '}
                    The hatched field is waiting without a cause: {fmt(unspecifiedWaitDays, 1)}{' '}
                    {dayWord(unspecifiedWaitDays)}, counted in neither column.
                  </>
                ) : null}
              </p>
            ) : (
              <p className="chart-caption">
                None of the steps has a cause set yet, so the split cannot be made. Set the{' '}
                <b>because</b> field on the steps that have waiting — the tool does not guess it for
                you.
              </p>
            )}
          </>
        )}

        {topWaits.length > 0 ? (
          <div className="section">
            <h3 className="sub-heading">The biggest delays, and what to do about them</h3>
            <p className="note-line">
              The three longest stretches of standing still. The countermeasure follows from the
              cause, not from who was waiting.
            </p>
            <ul className="waste-list">
              {topWaits.map((w, i) => {
                const cause = causeOf(w.cause)
                return (
                  <li key={w.index}>
                    <span className="waste-rank">{i + 1}</span>
                    <div className="waste-body">
                      <div className="waste-name">
                        Before step {w.index + 1}: {w.name || 'unnamed step'}
                      </div>
                      <div className="waste-meta">
                        {fmtPct(w.shareOfTotal)}% of the whole flow · owner:{' '}
                        {OWNER_LABEL[w.owner].toLowerCase()} · cause:{' '}
                        {cause ? cause.label.toLowerCase() : 'not set'}
                      </div>
                      {/* Without a cause there is no countermeasure. Borrowing one from
                          another cause would be a guess dressed up as advice. */}
                      {cause ? (
                        <div className="waste-action">
                          <b>Countermeasure</b> {cause.countermeasure}
                          <span className="waste-saving">
                            Typically shortens it by {cause.saving[0]}–{cause.saving[1]}%
                          </span>
                        </div>
                      ) : (
                        <div className="waste-action needs-answer">
                          <b>Countermeasure missing</b> Set the <b>because</b> field on step{' '}
                          {w.index + 1}. The countermeasure follows from the cause, so without it
                          the tool cannot say what to do — and it does not guess.
                        </div>
                      )}
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
                <h4>If those three are handled</h4>
                <p>
                  The flow lands at roughly{' '}
                  <b>{fmtEstimateRange(improvement.leadLow, improvement.leadHigh)} days</b> instead
                  of {fmt(totalLeadTimeDays, 1)}. Flow efficiency rises to roughly{' '}
                  <b>{fmtEstimateRange(improvement.flowLow, improvement.flowHigh)}%</b>.
                </p>
                <p className="disclaimer" style={{ marginTop: 10 }}>
                  The estimate rests on rules of thumb for each type of cause, not on your data.
                  Treat it as a direction, not a promise.
                  {improvement.skippedDays > 0 ? (
                    <>
                      {' '}
                      {fmt(improvement.skippedDays, 1)} {dayWord(improvement.skippedDays)} are left
                      out, because the steps they belong to have no cause set.
                    </>
                  ) : null}
                </p>

                {startHere ? (
                  <p className="start-here">
                    <b>Start with the {startHere.cause.label.toLowerCase()} wait.</b> It accounts for{' '}
                    {fmt(startHere.days, startHere.days % 1 === 0 ? 0 : 1)}{' '}
                    {dayWord(startHere.days)} in the flow
                    {startHere.clearlyLargest && startHere.causeCount > 1
                      ? ', more than any other cause'
                      : ''}
                    , and {startHere.cause.effortNote}. Those are the{' '}
                    {fmtEstimate(startHere.expectedSaving)} days that are easiest to claim first.
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
