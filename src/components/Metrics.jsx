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
    unspecifiedWaitDays,
    classifiedWaitDays,
  } = metrics

  const hasData = stepCount > 0 && totalLeadTimeDays > 0

  return (
    <section className="card" aria-labelledby="results-heading">
      <div className="card-head">
        <h2 id="results-heading">Key figures</h2>
        <p className="note">Updated as you edit</p>
      </div>
      <div className="card-body">
        <div className="kpi-grid">
          <Kpi
            value={hasData ? fmt(totalLeadTimeDays, 1) : '—'}
            suffix={hasData ? 'days' : ''}
            label="Lead time"
            sub="from start to go-live"
            note={
              hasData
                ? 'Of that, ' +
                  fmt(totalWaitDays, 1) +
                  ' ' +
                  dayWord(totalWaitDays) +
                  ' of waiting and ' +
                  fmt(totalProcessDays, 1) +
                  ' ' +
                  dayWord(totalProcessDays) +
                  ' of actual work.'
                : 'Add steps to get a figure.'
            }
          />

          <Kpi
            value={ttvDays !== null ? fmt(ttvDays, 1) : null}
            suffix="days"
            undefinedText={ttvDays === null ? 'not defined' : null}
            label="Time-to-value"
            sub="until the customer sees value"
            note={
              ttvDays !== null
                ? 'Time-to-value is lead time up to first value. The same quantity, a different vocabulary.'
                : 'Mark the step where the customer first experiences real value. The figure being missing is itself a finding: many flows have never had it defined.'
            }
          />

          <Kpi
            value={flowEfficiency !== null ? fmt(flowEfficiency, 1) : '—'}
            suffix={flowEfficiency !== null ? '%' : ''}
            valueClass={flowStatus(flowEfficiency)}
            label="Flow efficiency"
            sub="of the time, work is happening"
            note="Below 15% is normal in service processes. It means the improvement rarely lies in working faster."
          />

          <Kpi
            value={stepCount > 0 ? fmtInt(handoffs) : '—'}
            label="Handoffs"
            sub="times the work changes hands"
            note="Every change of hands is a place where the task can settle in to wait or be misunderstood."
          />

          {/* The sharpest figure in the tool gets its own row. It rests on the
              user's own answers, so unspecified wait must not count as human -
              that would make the figure read 100 % every time. */}
          <Kpi
            className="kpi-span"
            value={humanWaitShare !== null ? fmt(humanWaitShare, 1) : null}
            suffix={humanWaitShare !== null ? '%' : ''}
            undefinedText={
              humanWaitShare === null
                ? totalWaitDays > 0
                  ? 'no causes set yet'
                  : 'no waiting recorded'
                : null
            }
            label="Human wait time"
            sub={
              humanWaitShare !== null
                ? fmt(humanWaitDays, 1) +
                  ' of ' +
                  fmt(classifiedWaitDays, 1) +
                  ' classified waiting days come down to calendars, decisions, deliveries or priority' +
                  (unspecifiedWaitDays > 0
                    ? '. ' + fmt(unspecifiedWaitDays, 1) + ' days still have no cause'
                    : '')
                : totalWaitDays > 0
                  ? 'set the "because" field on the steps that have waiting'
                  : 'record some waiting to get a figure'
            }
            note={
              humanWaitShare === null && totalWaitDays > 0
                ? 'The tool does not guess whether waiting is human or technical — that is your answer in the "because" field on each step. Four of the five causes are human; only "technical" is machine time.'
                : 'The split comes from the "because" field on each step, not from an assumption. Four of the five causes are human; only "technical" is machine time. That is also where the shortening is easiest to find — you cannot automate your way out of a flow where nearly all the waiting is human.'
            }
          />
        </div>

        <details className="derivation">
          <summary>How these figures are calculated</summary>
          <div className="derivation-body">
            <table>
              <tbody>
                <tr>
                  <td>Total work</td>
                  <td>{fmt(totalProcessHours, 1)} hours</td>
                </tr>
                <tr>
                  <td>Converted to days at {fmt(HOURS_PER_DAY, 1)} hours per working day</td>
                  <td>{fmt(totalProcessDays, 2)} days</td>
                </tr>
                <tr>
                  <td>Total waiting</td>
                  <td>{fmt(totalWaitDays, 1)} days</td>
                </tr>
                <tr className="rule">
                  <td>Lead time = waiting + work</td>
                  <td>{fmt(totalLeadTimeDays, 2)} days</td>
                </tr>
                <tr>
                  <td>Flow efficiency = work divided by lead time</td>
                  <td>{flowEfficiency !== null ? fmt(flowEfficiency, 1) + '%' : '—'}</td>
                </tr>
                <tr>
                  <td>Time-to-value = everything up to and including the step marked as first value</td>
                  <td>{ttvDays !== null ? fmt(ttvDays, 2) + ' days' : 'not defined'}</td>
                </tr>
                <tr>
                  <td>Handoffs = times ownership changes between two consecutive steps</td>
                  <td>{fmtInt(handoffs)}</td>
                </tr>
                <tr>
                  <td>Waiting with a cause set</td>
                  <td>{fmt(classifiedWaitDays, 1)} days</td>
                </tr>
                <tr>
                  <td>Waiting without a cause, counted in neither column</td>
                  <td>{fmt(unspecifiedWaitDays, 1)} days</td>
                </tr>
                <tr>
                  <td>Human wait time = classified waiting with a cause other than technical</td>
                  <td>{humanWaitShare !== null ? fmt(humanWaitDays, 1) + ' days' : '—'}</td>
                </tr>
              </tbody>
            </table>
            <p>
              A working day counts as {fmt(HOURS_PER_DAY, 1)} hours. Waiting is entered in calendar
              days and is not converted, because the calendar does not take time off. Every figure
              here is calculated directly from what you have entered. Estimates are labelled as
              estimates and shown without decimals.
            </p>
          </div>
        </details>
      </div>
    </section>
  )
}
