import { READINESS_QUESTIONS } from '../model.js'
import { fmt, fmtEstimate, fmtEstimateRange } from '../format.js'

// Skoennet er en tommelfingerregel. Et interval siger det tydeligere end et decimaltal.
const SPREAD = 0.1

export default function Readiness({ readiness, onChange, result, metrics, open, onToggle }) {
  const { score, band, multiplier, realisticLeadTimeDays, deltaDays, actions } = result
  const planned = metrics.totalLeadTimeDays
  const hasData = planned > 0
  const noCustomerWait = metrics.waitByOwner.kunde <= 0

  const low = realisticLeadTimeDays * (1 - SPREAD)
  const high = realisticLeadTimeDays * (1 + SPREAD)

  return (
    <section className="card" aria-labelledby="readiness-heading">
      <div className="card-head">
        <h2 id="readiness-heading">Kundens udgangspunkt, og hvad I kan gøre ved det</h2>
        <button
          type="button"
          className="btn"
          aria-expanded={open}
          aria-controls="readiness-body"
          onClick={() => onToggle(!open)}
        >
          {open ? 'Skjul' : 'Fold ud'}
        </button>
      </div>

      {open ? (
        <div className="card-body" id="readiness-body">
          <p className="chart-caption" style={{ marginTop: 0, marginBottom: 16 }}>
            Ventetid på kundesiden er sjældent tilfældig. Den kan i vid udstrækning forudsiges ud
            fra fem forhold, der ikke har noget med systemet at gøre. Svarene nedenfor justerer
            forventningen til, hvor længe forløbet reelt tager, og peger på et modtræk for hvert
            forhold, der trækker ned. Spørgsmålene starter på midten; ret dem, så de passer til den
            kunde, I har foran jer.
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
              Samlet score: <b>{score} af 10</b>
            </span>
            <span>
              Vurdering: <b>{band.label.toLowerCase()}</b>
            </span>
            <span>
              Kundesidens ventetid ganges med <b>{fmt(multiplier, 1)}</b>
            </span>
          </div>

          <div className="compare">
            <div className="compare-cell">
              <div className="compare-value">
                {hasData ? fmt(planned, 1) : '—'}
                <span className="suffix">dage</span>
              </div>
              <div className="compare-label">Planlagt gennemløbstid</div>
            </div>
            <div className="compare-cell highlight">
              <div className="compare-value">
                {hasData ? fmtEstimateRange(low, high) : '—'}
                <span className="suffix">dage</span>
              </div>
              <div className="compare-label">Realistisk skøn</div>
            </div>
            <div className="compare-cell">
              <div className={'compare-value delta' + (deltaDays < 0 ? ' negative' : '')}>
                {hasData ? (deltaDays >= 0 ? '+' : '−') + fmtEstimate(Math.abs(deltaDays)) : '—'}
                <span className="suffix">dage</span>
              </div>
              <div className="compare-label">Forskel</div>
            </div>
          </div>

          {hasData ? (
            <p className="readiness-summary">
              {noCustomerWait ? (
                <>
                  Der er ingen ventetid registreret på kundesiden, så svarene her flytter ikke
                  tallet. Det er værd at kontrollere: i de fleste forløb ligger en betydelig del af
                  ventetiden netop hos kunden.
                </>
              ) : (
                <>
                  Med denne kundes udgangspunkt bør I forvente omkring{' '}
                  <b>{fmtEstimateRange(low, high)} dage</b> frem for de {fmt(planned, 1)}, planen
                  antager. Forskellen ligger næsten udelukkende i kundesidens ventetid.
                </>
              )}
            </p>
          ) : null}

          {actions.length > 0 ? (
            <div className="section">
              <h3 className="sub-heading">Modtræk</h3>
              <p className="note-line">
                For hvert forhold, der trækker ned. Ingen af dem kræver, at nogen arbejder hurtigere.
              </p>
              <ul className="action-list">
                {actions.map((a) => (
                  <li key={a.key}>
                    <div className="action-head">
                      {a.label}{' '}
                      <span className="action-answer">
                        {'— ' + a.answer.toLowerCase()}
                      </span>
                    </div>
                    <div className="action-text">{a.text}</div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="readiness-summary">
              Kunden scorer bedst muligt på alle fem forhold. Det er sjældent, og det er værd at
              lægge mærke til hvorfor — det er ofte noget, der kan gentages hos den næste.
            </p>
          )}

          <p className="disclaimer">
            Kun ventetiden på kundesiden ganges. Kundens datakvalitet eller beslutningsvej påvirker
            ikke, hvor hurtigt jeres eget team arbejder — den påvirker, hvor længe opgaven ligger
            og venter hos kunden. Det er en pointe om årsag, ikke en teknikalitet.
          </p>
          <p className="disclaimer">
            Tallene er et skøn, ikke en forudsigelse. Multiplikatoren er en tommelfingerregel
            baseret på erfaringsmønstre, ikke en kalibreret model. Derfor vises skønnet som et
            interval og uden decimaler. Brug det til at åbne samtalen om forventninger, ikke til at
            love en dato.
          </p>
        </div>
      ) : (
        <div className="card-body">
          <p className="chart-caption" style={{ margin: 0 }}>
            Fem spørgsmål om kunden giver et realistisk skøn ved siden af det planlagte, og et
            modtræk for hvert forhold, der trækker ned. Adoption er adfærd, og adfærd er den
            hyppigste kilde til ventetid.
          </p>
        </div>
      )}
    </section>
  )
}
