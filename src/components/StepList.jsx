import { OWNERS, WAIT_CAUSES, num } from '../model.js'

function NumberField({ id, label, unit, value, onChange, step, title }) {
  return (
    <div className="field">
      <label htmlFor={id} title={title}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
      />
      <span className="unit">{unit}</span>
    </div>
  )
}

function Step({ step, index, total, onChange, onMove, onRemove, onSetValueMoment }) {
  const hasWait = num(step.waitDaysBefore) > 0
  const cause = step.waitCause || ''

  return (
    <li className={'step' + (step.isValueMoment ? ' is-value' : '')}>
      <div className="step-index" aria-hidden="true">
        {index + 1}
      </div>

      <div className="step-main">
        <input
          className="step-name"
          type="text"
          value={step.name}
          placeholder="What happens in this step?"
          aria-label={'Name of step ' + (index + 1)}
          onChange={(e) => onChange({ name: e.target.value })}
        />

        <div className="step-fields">
          <div className="owner-group" role="group" aria-label={'Who carries out step ' + (index + 1)}>
            {OWNERS.map((o) => (
              <button
                key={o.key}
                type="button"
                aria-pressed={step.owner === o.key}
                onClick={() => onChange({ owner: o.key })}
              >
                {o.short}
              </button>
            ))}
          </div>

          <NumberField
            id={'ph-' + step.id}
            label="Work"
            unit="h"
            step="0.5"
            value={step.processHours}
            onChange={(v) => onChange({ processHours: v })}
            title="The time someone is actually working on the task"
          />

          <NumberField
            id={'wd-' + step.id}
            label="Wait before"
            unit="d"
            step="0.5"
            value={step.waitDaysBefore}
            onChange={(v) => onChange({ waitDaysBefore: v })}
            title="Calendar days the task sits still before this step gets going"
          />

          {/* The cause only appears once there is wait to explain. */}
          {hasWait ? (
            <div className="field">
              <label htmlFor={'wc-' + step.id}>Because</label>
              <select
                id={'wc-' + step.id}
                className={'cause-select' + (cause ? '' : ' needs-answer')}
                value={cause}
                title="Why did the task sit still? The cause decides the countermeasure."
                onChange={(e) => onChange({ waitCause: e.target.value || null })}
              >
                <option value="">Pick a cause…</option>
                {WAIT_CAUSES.map((c) => (
                  <option key={c.key} value={c.key} title={c.meaning}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <button
            type="button"
            className="value-toggle"
            aria-pressed={step.isValueMoment}
            title="Mark the first step where the customer experiences real value"
            onClick={() => onSetValueMoment(!step.isValueMoment)}
          >
            <span aria-hidden="true">{step.isValueMoment ? '★' : '☆'}</span>
            First value
          </button>
        </div>
      </div>

      <div className="step-actions">
        <button
          type="button"
          className="icon-btn"
          disabled={index === 0}
          aria-label={'Move step ' + (index + 1) + ' up'}
          onClick={() => onMove(-1)}
        >
          <span aria-hidden="true">{'▲'}</span>
        </button>
        <button
          type="button"
          className="icon-btn"
          disabled={index === total - 1}
          aria-label={'Move step ' + (index + 1) + ' down'}
          onClick={() => onMove(1)}
        >
          <span aria-hidden="true">{'▼'}</span>
        </button>
        <button
          type="button"
          className="icon-btn danger"
          aria-label={'Delete step ' + (index + 1)}
          onClick={onRemove}
        >
          <span aria-hidden="true">{'×'}</span>
        </button>
      </div>
    </li>
  )
}

export default function StepList({ steps, onChangeStep, onMoveStep, onRemoveStep, onSetValueMoment, onAddStep, onReset }) {
  return (
    <section className="card" aria-labelledby="steps-heading">
      <div className="card-head">
        <h2 id="steps-heading">The flow</h2>
        <p className="note">Edit the steps to match your own. Everything recalculates as you go.</p>
      </div>
      <div className="card-body">
        <p className="hint">
          If you do not know exactly, estimate. An informed guess beats no map at all, and you can
          correct it later. The <b>because</b> field is your answer to why the task sat still; the
          tool does not guess it for you. It is the cause, not the owner, that decides what can be
          done about the wait — and whether the wait is technical at all.
        </p>

        {steps.length === 0 ? (
          <p className="hint">
            There are no steps. Add the first one, or bring the example back to see how the tool
            calculates.
          </p>
        ) : (
          <ul className="steps">
            {steps.map((step, i) => (
              <Step
                key={step.id}
                step={step}
                index={i}
                total={steps.length}
                onChange={(patch) => onChangeStep(step.id, patch)}
                onMove={(dir) => onMoveStep(step.id, dir)}
                onRemove={() => onRemoveStep(step.id)}
                onSetValueMoment={(on) => onSetValueMoment(step.id, on)}
              />
            ))}
          </ul>
        )}

        <div className="toolbar">
          <button type="button" className="btn btn-primary" onClick={onAddStep}>
            Add step
          </button>
          <button type="button" className="btn" onClick={onReset}>
            Reset to example
          </button>
        </div>
      </div>
    </section>
  )
}
