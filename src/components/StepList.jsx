import { OWNERS } from '../model.js'

function NumberField({ id, label, unit, value, onChange, step, max }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        min="0"
        max={max}
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
          placeholder="Hvad sker der i dette trin?"
          aria-label={'Navn på trin ' + (index + 1)}
          onChange={(e) => onChange({ name: e.target.value })}
        />

        <div className="step-fields">
          <div className="owner-group" role="group" aria-label={'Hvem udfører trin ' + (index + 1)}>
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
            label="Arbejde"
            unit="t"
            step="0.5"
            value={step.processHours}
            onChange={(v) => onChange({ processHours: v })}
          />

          <NumberField
            id={'wd-' + step.id}
            label="Ventetid før"
            unit="d"
            step="0.5"
            value={step.waitDaysBefore}
            onChange={(v) => onChange({ waitDaysBefore: v })}
          />

          <button
            type="button"
            className="value-toggle"
            aria-pressed={step.isValueMoment}
            title="Marker det første trin, hvor kunden oplever reel værdi"
            onClick={() => onSetValueMoment(!step.isValueMoment)}
          >
            <span aria-hidden="true">{step.isValueMoment ? '★' : '☆'}</span>
            Første værdi
          </button>
        </div>
      </div>

      <div className="step-actions">
        <button
          type="button"
          className="icon-btn"
          disabled={index === 0}
          aria-label={'Flyt trin ' + (index + 1) + ' op'}
          onClick={() => onMove(-1)}
        >
          <span aria-hidden="true">{'▲'}</span>
        </button>
        <button
          type="button"
          className="icon-btn"
          disabled={index === total - 1}
          aria-label={'Flyt trin ' + (index + 1) + ' ned'}
          onClick={() => onMove(1)}
        >
          <span aria-hidden="true">{'▼'}</span>
        </button>
        <button
          type="button"
          className="icon-btn danger"
          aria-label={'Slet trin ' + (index + 1)}
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
        <h2 id="steps-heading">Forløbet</h2>
        <p className="note">Ret trinnene, så de matcher jeres eget. Alt regnes om med det samme.</p>
      </div>
      <div className="card-body">
        {steps.length === 0 ? (
          <p className="hint">
            Der er ingen trin. Tilføj det første, eller hent eksemplet tilbage for at se, hvordan
            værktøjet regner.
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
            Tilføj trin
          </button>
          <button type="button" className="btn" onClick={onReset}>
            Nulstil til eksempel
          </button>
        </div>
      </div>
    </section>
  )
}
