import { HOURS_PER_DAY } from '../model.js'
import { fmt, fmtInt, dayWord } from '../format.js'

function flowStatus(value) {
  if (value === null) return ''
  if (value < 10) return 'status-red'
  if (value <= 25) return 'status-yellow'
  return 'status-green'
}

function Kpi({ value, suffix, label, sub, note, valueClass = '', undefinedText, className = '' }) {
  return (
    <div className={'kpi ' + className}>
      {undefinedText ? (
        <div className="kpi-value undefined-value">{undefinedText}</div>
      ) : (
        <div className={'kpi-value ' + valueClass}>
          {value}
          {suffix ? <span className="suffix">{suffix}</span> : null}
        </div>
      )}
      <div className="kpi-label">{label}</div>
      <div className="kpi-sub">{sub}</div>
      {note ? <div className="kpi-note">{note}</div> : null}
    </div>
  )
}

export default function Metrics({ metrics, stepCount }) {
  const {
    totalLeadTimeDays,
    totalWaitDays,
    totalProcessDays,
    totalProcessHours,
    flowEfficiency,
    ttvDays,
    handoffs,
    humanWaitDays,
    humanWaitShare,
  } = metrics

  const hasData = stepCount > 0 && totalLeadTimeDays > 0

  return (
    <section className="card" aria-labelledby="results-heading">
      <div className="card-head">
        <h2 id="results-heading">Nøgletal</h2>
        <p className="note">Opdateres løbende</p>
      </div>
      <div className="card-body">
        <div className="kpi-grid">
          <Kpi
            value={hasData ? fmt(totalLeadTimeDays, 1) : '—'}
            suffix={hasData ? 'dage' : ''}
            label="Gennemløbstid"
            sub="fra start til go-live"
            note={
              hasData
                ? 'Heraf er ' +
                  fmt(totalWaitDays, 1) +
                  ' ' +
                  dayWord(totalWaitDays) +
                  ' ventetid og ' +
                  fmt(totalProcessDays, 1) +
                  ' ' +
                  dayWord(totalProcessDays) +
                  ' faktisk arbejde.'
                : 'Tilføj trin for at få et tal.'
            }
          />

          <Kpi
            value={ttvDays !== null ? fmt(ttvDays, 1) : null}
            suffix="dage"
            undefinedText={ttvDays === null ? 'ikke defineret' : null}
            label="Time-to-value"
            sub="til kunden ser værdi"
            note={
              ttvDays !== null
                ? 'Time-to-value er gennemløbstid frem til første værdi. Samme størrelse, andet fagsprog.'
                : 'Marker det trin, hvor kunden første gang oplever reel værdi. At tallet mangler, er i sig selv en oplysning: mange forløb har aldrig fået det defineret.'
            }
          />

          <Kpi
            value={flowEfficiency !== null ? fmt(flowEfficiency, 1) : '—'}
            suffix={flowEfficiency !== null ? '%' : ''}
            valueClass={flowStatus(flowEfficiency)}
            label="Flow-effektivitet"
            sub="af tiden arbejdes der"
            note="Under 15 % er normalt i serviceprocesser. Det betyder, at forbedringen sjældent ligger i at arbejde hurtigere."
          />

          <Kpi
            value={stepCount > 0 ? fmtInt(handoffs) : '—'}
            label="Overleveringer"
            sub="gange arbejdet skifter hænder"
            note="Hvert skift er et sted, hvor opgaven kan lægge sig til at vente eller blive misforstået."
          />

          {/* Det skarpeste tal i vaerktoejet faar sin egen raekke. */}
          <Kpi
            className="kpi-span"
            value={humanWaitShare !== null ? fmt(humanWaitShare, 1) : '—'}
            suffix={humanWaitShare !== null ? '%' : ''}
            label="Menneskelig ventetid"
            sub={
              humanWaitShare !== null
                ? fmt(humanWaitDays, 1) +
                  ' af ' +
                  fmt(totalWaitDays, 1) +
                  ' ventedage skyldes kalendere, beslutninger, leverancer eller prioritering'
                : 'registrér ventetid for at få et tal'
            }
            note="Så stor en del af ventetiden skyldes mennesker, kalendere og beslutninger — ikke teknik. Det er også dér, forkortelsen er lettest at hente. Man kan ikke automatisere sig ud af et forløb, hvor næsten al ventetid er menneskelig."
          />
        </div>

        <details className="derivation">
          <summary>Sådan er tallene regnet ud</summary>
          <div className="derivation-body">
            <table>
              <tbody>
                <tr>
                  <td>Arbejdstid i alt</td>
                  <td>{fmt(totalProcessHours, 1)} timer</td>
                </tr>
                <tr>
                  <td>Omregnet til dage ved {fmt(HOURS_PER_DAY, 1)} timer pr. arbejdsdag</td>
                  <td>{fmt(totalProcessDays, 2)} dage</td>
                </tr>
                <tr>
                  <td>Ventetid i alt</td>
                  <td>{fmt(totalWaitDays, 1)} dage</td>
                </tr>
                <tr className="rule">
                  <td>Gennemløbstid = ventetid + arbejdstid</td>
                  <td>{fmt(totalLeadTimeDays, 2)} dage</td>
                </tr>
                <tr>
                  <td>Flow-effektivitet = arbejdstid delt med gennemløbstid</td>
                  <td>{flowEfficiency !== null ? fmt(flowEfficiency, 1) + ' %' : '—'}</td>
                </tr>
                <tr>
                  <td>Time-to-value = alt til og med trinnet markeret som første værdi</td>
                  <td>{ttvDays !== null ? fmt(ttvDays, 2) + ' dage' : 'ikke defineret'}</td>
                </tr>
                <tr>
                  <td>Overleveringer = antal gange ejerskabet skifter mellem to trin i træk</td>
                  <td>{fmtInt(handoffs)}</td>
                </tr>
                <tr>
                  <td>Menneskelig ventetid = al ventetid med anden årsag end teknisk</td>
                  <td>{humanWaitShare !== null ? fmt(humanWaitDays, 1) + ' dage' : '—'}</td>
                </tr>
              </tbody>
            </table>
            <p>
              En arbejdsdag regnes som {fmt(HOURS_PER_DAY, 1)} timer. Ventetid tastes i kalenderdage
              og regnes ikke om, fordi kalenderen ikke holder fri. Alle tal her er regnet direkte af
              det, du har tastet ind. Skøn er markeret som skøn og vises uden decimaler.
            </p>
          </div>
        </details>
      </div>
    </section>
  )
}
