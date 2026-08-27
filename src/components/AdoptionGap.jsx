import { fmt, fmtEstimate, dayWord } from '../format.js'

export default function AdoptionGap({ metrics, adoption, adoptionDays, onChange }) {
  const hasTtv = metrics.ttvDays !== null
  const filled = adoption.days !== null

  return (
    <section className="card" aria-labelledby="adoption-heading">
      <div className="card-head">
        <h2 id="adoption-heading">Adoptionsgabet</h2>
        <p className="note">Tilgængelig værdi er ikke det samme som brugt værdi</p>
      </div>
      <div className="card-body">
        <p className="chart-caption" style={{ marginTop: 0 }}>
          Time-to-value måler, hvornår værdien er tilgængelig. Det er ikke det samme som, hvornår
          den er taget i brug. Et system kan være perfekt implementeret og stadig stå ubrugt, fordi
          mennesker har travlt og har gjort det på en anden måde i årevis. Gabet mellem de to er,
          hvor frafald fødes.
        </p>

        <div className="adoption-input">
          <label htmlFor="adoption-days">
            Hvor lang tid går der typisk fra go-live, til kundens team bruger løsningen i deres
            daglige arbejde?
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
            <span className="unit">dage</span>
          </div>
        </div>

        {filled ? (
          <>
            <div className="compare">
              <div className="compare-cell">
                <div className="compare-value">
                  {hasTtv ? fmt(metrics.ttvDays, 1) : '—'}
                  <span className="suffix">dage</span>
                </div>
                <div className="compare-label">Time-to-value</div>
              </div>
              <div className="compare-cell">
                <div className="compare-value delta">
                  {'+' + fmt(adoption.days, adoption.days % 1 === 0 ? 0 : 1)}
                  <span className="suffix">dage</span>
                </div>
                <div className="compare-label">Adoptionsgab</div>
              </div>
              <div className="compare-cell highlight">
                <div className="compare-value">
                  {adoption.realTimeToValue !== null ? (
                    <>
                      <span className="prefix">cirka</span>
                      {fmtEstimate(adoption.realTimeToValue)}
                      <span className="suffix">dage</span>
                    </>
                  ) : (
                    '—'
                  )}
                </div>
                <div className="compare-label">Reel time-to-value</div>
              </div>
            </div>

            <p className="readiness-summary">
              Time-to-value måler, hvornår værdien er tilgængelig. Adoption måler, hvornår den
              bliver brugt. Forskellen er{' '}
              <b>
                {fmt(adoption.days, adoption.days % 1 === 0 ? 0 : 1)} {dayWord(adoption.days)}
              </b>
              , hvor kunden betaler uden at få noget ud af det — og hvor beslutningen om at
              fortsætte reelt træffes.
            </p>

            <p className="disclaimer">
              Time-to-value er regnet af det, du har tastet ind, og vises med decimal.
              Adoptionsgabet er et gæt, og summen arver gættets usikkerhed — derfor står den
              reelle time-to-value som et rundt tal.
            </p>

            {!hasTtv ? (
              <p className="disclaimer">
                Der er ikke markeret et værdiøjeblik i forløbet, så den reelle time-to-value kan
                ikke regnes ud. Marker det trin, hvor kunden første gang oplever værdi.
              </p>
            ) : null}
          </>
        ) : (
          <p className="hint">
            De fleste måler det ikke. Det er i sig selv en pointe: forløbet erklæres færdigt ved
            go-live, og hvad der sker bagefter, er ingens tal. Et kvalificeret gæt er nok til at
            gøre gabet synligt.
          </p>
        )}

        <p className="closing-note">
          Et onboardingforløb kan optimeres til perfektion og stadig fejle, hvis menneskene på den
          anden side ikke ændrer vaner. Procesarbejde får kunden hen til værdien. Adfærd afgør, om
          de bruger den.
        </p>
      </div>
    </section>
  )
}
