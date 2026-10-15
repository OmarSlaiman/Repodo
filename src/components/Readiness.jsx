import { READINESS_QUESTIONS } from '../model.js'
import { fmt, fmtEstimate, fmtEstimateRange } from '../format.js'

// The estimate is a rule of thumb. A range says so more plainly than a decimal.
const SPREAD = 0.1

export default function Readiness({ readiness, onChange, result, metrics, open, onToggle }) {
  const { score, band, multiplier, realisticLeadTimeDays, deltaDays, actions } = result
  const planned = metrics.totalLeadTimeDays
  const hasData = planned > 0
  const noCustomerWait = metrics.waitByOwner.customer <= 0

  const low = realisticLeadTimeDays * (1 - SPREAD)
  const high = realisticLeadTimeDays * (1 + SPREAD)

  return (
    <section className="card" aria-labelledby="readiness-heading">
      <div className="card-head">
        <h2 id="readiness-heading">The customer's starting point, and what you can do about it</h2>
        <button
          type="button"
          className="btn"
          aria-expanded={open}
          aria-controls="readiness-body"
          onClick={() => onToggle(!open)}
        >
          {open ? 'Hide' : 'Expand'}
        </button>
      </div>

      {open ? (
        <div className="card-body" id="readiness-body">
          <p className="chart-caption" style={{ marginTop: 0, marginBottom: 16 }}>
            Waiting on the customer side is rarely random. It can largely be predicted from five
            conditions that have nothing to do with the system. The answers below adjust the
            expectation of how long the flow really takes, and point to a countermeasure for each
            condition that drags. The questions start in the middle; move them to fit the customer
            in front of you.
          </p>

          <div className="questions">
            {READINESS_QUESTIONS.map((q) => (
              <div key={q.key}>
                <div className="question-label" id={'q-' + q.key}>
                  {q.label}
                </div>
                <p className="question-help">{q.help}</p>
                <div className="choices" role="group" aria-labelledby={'q-' + q.key}>
                  {q.options.map((opt, value) => (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={Number(readiness[q.key]) === value}
                      onClick={() => onChange({ ...readiness, [q.key]: value })}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="score-line">
            <span>
              Total score: <b>{score} of 10</b>
            </span>
            <span>
              Assessment: <b>{band.label.toLowerCase()}</b>
            </span>
            <span>
              Customer-side waiting multiplied by <b>{fmt(multiplier, 1)}</b>
            </span>
          </div>

          <div className="compare">
            <div className="compare-cell">
              <div className="compare-value">
                {hasData ? fmt(planned, 1) : '—'}
                <span className="suffix">days</span>
              </div>
              <div className="compare-label">Planned lead time</div>
            </div>
            <div className="compare-cell highlight">
              <div className="compare-value">
                {hasData ? fmtEstimateRange(low, high) : '—'}
                <span className="suffix">days</span>
              </div>
              <div className="compare-label">Realistic estimate</div>
            </div>
            <div className="compare-cell">
              <div className={'compare-value delta' + (deltaDays < 0 ? ' negative' : '')}>
                {hasData ? (deltaDays >= 0 ? '+' : '−') + fmtEstimate(Math.abs(deltaDays)) : '—'}
                <span className="suffix">days</span>
              </div>
              <div className="compare-label">Difference</div>
            </div>
          </div>

          {hasData ? (
            <p className="readiness-summary">
              {noCustomerWait ? (
                <>
                  No waiting is recorded on the customer side, so the answers here do not move the
                  figure. That is worth checking: in most flows a substantial share of the waiting
                  sits with the customer.
                </>
              ) : (
                <>
                  With this customer's starting point you should expect around{' '}
                  <b>{fmtEstimateRange(low, high)} days</b> rather than the {fmt(planned, 1)} the
                  plan assumes. The difference lies almost entirely in customer-side waiting.
                </>
              )}
            </p>
          ) : null}

          {actions.length > 0 ? (
            <div className="section">
              <h3 className="sub-heading">Countermeasures</h3>
              <p className="note-line">
                One for each condition that drags. None of them requires anyone to work faster.
              </p>
              <ul className="action-list">
                {actions.map((a) => (
                  <li key={a.key}>
                    <div className="action-head">
                      {a.label}{' '}
                      <span className="action-answer">{'— ' + a.answer.toLowerCase()}</span>
                    </div>
                    <div className="action-text">{a.text}</div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="readiness-summary">
              The customer scores as well as possible on all five conditions. That is rare, and it
              is worth noticing why — it is often something that can be repeated with the next one.
            </p>
          )}

          <p className="disclaimer">
            Only customer-side waiting is multiplied. The customer's data quality or decision path
            does not affect how fast your own team works — it affects how long the task sits waiting
            at the customer. That is a point about cause, not a technicality.
          </p>
          <p className="disclaimer">
            These figures are an estimate, not a prediction. The multiplier is a rule of thumb based
            on patterns of experience, not a calibrated model. That is why the estimate is shown as
            a range and without decimals. Use it to open the conversation about expectations, not to
            promise a date.
          </p>
        </div>
      ) : (
        <div className="card-body">
          <p className="chart-caption" style={{ margin: 0 }}>
            Five questions about the customer give a realistic estimate alongside the planned one,
            and a countermeasure for each condition that drags. Adoption is behaviour, and behaviour
            is the most common source of waiting.
          </p>
        </div>
      )}
    </section>
  )
}
