import { fmt, fmtEstimate, dayWord } from '../format.js'

export default function AdoptionGap({ metrics, adoption, adoptionDays, onChange }) {
  const hasTtv = metrics.ttvDays !== null
  const filled = adoption.days !== null

  return (
    <section className="card" aria-labelledby="adoption-heading">
      <div className="card-head">
        <h2 id="adoption-heading">The adoption gap</h2>
        <p className="note">Value available is not the same as value used</p>
      </div>
      <div className="card-body">
        <p className="chart-caption" style={{ marginTop: 0 }}>
          Time-to-value measures when the value becomes available. That is not the same as when it
          is put to use. A system can be implemented perfectly and still sit unused, because people
          are busy and have done it another way for years. The gap between the two is where churn
          is born.
        </p>

        <div className="adoption-input">
          <label htmlFor="adoption-days">
            How long does it typically take from go-live until the customer's team uses the solution
            in their daily work?
          </label>
          <div className="field">
            <input
              id="adoption-days"
              type="number"
              min="0"
              step="1"
              value={adoptionDays ?? ''}
              placeholder="—"
              onChange={(e) => onChange(e.target.value)}
              onFocus={(e) => e.target.select()}
            />
            <span className="unit">days</span>
          </div>
        </div>

        {filled ? (
          <>
            <div className="compare">
              <div className="compare-cell">
                <div className="compare-value">
                  {hasTtv ? fmt(metrics.ttvDays, 1) : '—'}
                  <span className="suffix">days</span>
                </div>
                <div className="compare-label">Time-to-value</div>
              </div>
              <div className="compare-cell">
                <div className="compare-value delta">
                  {'+' + fmt(adoption.days, adoption.days % 1 === 0 ? 0 : 1)}
                  <span className="suffix">days</span>
                </div>
                <div className="compare-label">Adoption gap</div>
              </div>
              <div className="compare-cell highlight">
                <div className="compare-value">
                  {adoption.realTimeToValue !== null ? (
                    <>
                      <span className="prefix">about</span>
                      {fmtEstimate(adoption.realTimeToValue)}
                      <span className="suffix">days</span>
                    </>
                  ) : (
                    '—'
                  )}
                </div>
                <div className="compare-label">Real time-to-value</div>
              </div>
            </div>

            <p className="readiness-summary">
              Time-to-value measures when the value becomes available. Adoption measures when it
              gets used. The difference is{' '}
              <b>
                {fmt(adoption.days, adoption.days % 1 === 0 ? 0 : 1)} {dayWord(adoption.days)}
              </b>
              , during which the customer is paying without getting anything out of it — and during
              which the decision to continue is really made.
            </p>

            <p className="disclaimer">
              Time-to-value is calculated from what you entered, and is shown with a decimal. The
              adoption gap is a guess, and the sum inherits the uncertainty of that guess — which is
              why the real time-to-value is given as a round number.
            </p>

            {!hasTtv ? (
              <p className="disclaimer">
                No value moment is marked in the flow, so the real time-to-value cannot be
                calculated. Mark the step where the customer first experiences value.
              </p>
            ) : null}
          </>
        ) : (
          <p className="hint">
            Most people do not measure it. That is a finding in itself: the flow is declared finished
            at go-live, and what happens afterwards is nobody's number. An informed guess is enough
            to make the gap visible.
          </p>
        )}

        <p className="closing-note">
          An onboarding flow can be optimised to perfection and still fail, if the people on the
          other side do not change their habits. Process work gets the customer to the value.
          Behaviour decides whether they use it.
        </p>
      </div>
    </section>
  )
}
