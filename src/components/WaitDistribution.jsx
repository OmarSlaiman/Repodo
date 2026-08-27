import { OWNER_LABEL } from '../model.js'
import { fmt, fmtPct, dayWord } from '../format.js'

const OWNER_COLOR = {
  os: '#1F3864',
  kunde: '#6E85B5',
  tredjepart: '#A9B6D1',
}

export default function WaitDistribution({ metrics }) {
  const { waitByOwner, totalWaitDays, totalLeadTimeDays, topWaits } = metrics
  const owners = ['os', 'kunde', 'tredjepart']
  const hasWait = totalWaitDays > 0

  return (
    <section className="card" aria-labelledby="wait-heading">
      <div className="card-head">
        <h2 id="wait-heading">Hvor ligger ventetiden</h2>
        <p className="note">
          Ventetid før et trin tilskrives den, der skal udføre trinnet
        </p>
      </div>
      <div className="card-body">
        {!hasWait ? (
          <p className="hint">
            Der er ingen ventetid registreret endnu. Det er sjældent hele billedet: ventetid er
            den del af et forløb, der er nemmest at glemme, fordi ingen bruger tid på den.
          </p>
        ) : (
          <>
            <div
              className="stack"
              role="img"
              aria-label={
                'Fordeling af ventetid: ' +
                owners
                  .filter((o) => waitByOwner[o] > 0)
                  .map(
                    (o) =>
                      OWNER_LABEL[o] +
                      ' ' +
                      fmtPct((waitByOwner[o] / totalWaitDays) * 100) +
                      ' procent'
                  )
                  .join(', ')
              }
            >
              {owners.map((o) => {
                const share = (waitByOwner[o] / totalWaitDays) * 100
                if (share <= 0) return null
                return (
                  <div
                    key={o}
                    className="stack-seg"
                    style={{ width: share + '%', background: OWNER_COLOR[o] }}
                    title={
                      OWNER_LABEL[o] + ': ' + fmt(waitByOwner[o], 1) + ' ' + dayWord(waitByOwner[o])
                    }
                  >
                    {share >= 9 ? fmtPct(share) + ' %' : ''}
                  </div>
                )
              })}
            </div>

            <div className="stack-legend">
              {owners.map((o) => (
                <span key={o}>
                  <i className="swatch" style={{ background: OWNER_COLOR[o] }} />
                  {OWNER_LABEL[o]}: <b>{fmt(waitByOwner[o], 1)} {dayWord(waitByOwner[o])}</b>
                </span>
              ))}
            </div>
          </>
        )}

        {topWaits.length > 0 ? (
          <div className="section">
            <h3 style={{ fontSize: 13.5, margin: '0 0 4px', fontWeight: 650 }}>
              De største spildposter
            </h3>
            <p className="note" style={{ margin: '0 0 6px', color: 'var(--muted)', fontSize: 12.5 }}>
              De tre længste stilstande. Det er her, en forkortelse af forløbet realistisk kan hentes.
            </p>
            <ul className="waste-list">
              {topWaits.map((w, i) => (
                <li key={w.index}>
                  <span className="waste-rank">{i + 1}</span>
                  <span>
                    <span className="waste-name">
                      Før trin {w.index + 1}: {w.name || 'trin uden navn'}
                    </span>
                    <span className="waste-meta">
                      {fmtPct(w.shareOfTotal)} % af hele forløbet · ventetid hos{' '}
                      {OWNER_LABEL[w.owner].toLowerCase()}
                    </span>
                  </span>
                  <span className="waste-days">
                    {fmt(w.days, w.days % 1 === 0 ? 0 : 1)} {dayWord(w.days)}
                  </span>
                </li>
              ))}
            </ul>
            {totalLeadTimeDays > 0 ? (
              <p className="chart-caption">
                Tilsammen udgør de tre poster{' '}
                {fmtPct(
                  (topWaits.reduce((s, w) => s + w.days, 0) / totalLeadTimeDays) * 100
                )}{' '}
                % af gennemløbstiden.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
