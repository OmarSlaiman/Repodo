import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  EXAMPLE_STEPS,
  DEFAULT_READINESS,
  computeMetrics,
  computeReadiness,
  computeImprovement,
  computeStartHere,
  computeAdoption,
  newId,
} from './model.js'
import {
  encodeStateToHash,
  readStateFromHash,
  saveLocal,
  readLocal,
  isUntouchedDanishExample,
} from './persist.js'
import { downloadPng, downloadSvg } from './exportImage.js'
import StepList from './components/StepList.jsx'
import Metrics from './components/Metrics.jsx'
import Timeline from './components/Timeline.jsx'
import WaitDistribution from './components/WaitDistribution.jsx'
import Readiness from './components/Readiness.jsx'
import AdoptionGap from './components/AdoptionGap.jsx'

const freshExample = () => EXAMPLE_STEPS.map((s) => ({ ...s }))

// A shared link first, then saved work, otherwise the example. The user never meets an empty form.
function restored(loaded, source) {
  return {
    steps: loaded.steps,
    readiness: loaded.readiness ?? DEFAULT_READINESS,
    adoptionDays: loaded.adoptionDays ?? null,
    source,
  }
}

const fresh = () => ({
  steps: freshExample(),
  readiness: DEFAULT_READINESS,
  adoptionDays: null,
  source: 'example',
})

function initialState() {
  const shared = readStateFromHash()
  if (shared && shared.steps.length) return restored(shared, 'link')
  const stored = readLocal()
  // The tool shipped in Danish first. Saved work is the user's own and is kept,
  // but a stored copy of the old demo that was never edited would show Danish
  // step names on an English page, so that one is replaced.
  if (stored && stored.steps.length && !isUntouchedDanishExample(stored.steps)) {
    return restored(stored, 'saved')
  }
  return fresh()
}

export default function App() {
  const [{ steps, readiness, adoptionDays, source }, setState] = useState(initialState)
  const [readinessOpen, setReadinessOpen] = useState(false)
  const [status, setStatus] = useState('')
  const svgRef = useRef(null)
  const statusTimer = useRef(null)

  // The address must not describe a state that no longer holds. The moment the user
  // changes anything, the shared link is stale, and the hash is removed.
  const clearHash = useCallback(() => {
    if (window.location.hash.startsWith('#p=')) {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])

  const setSteps = useCallback(
    (updater) => {
      clearHash()
      setState((prev) => ({
        ...prev,
        source: 'egen',
        steps: typeof updater === 'function' ? updater(prev.steps) : updater,
      }))
    },
    [clearHash]
  )

  const setReadiness = useCallback(
    (next) => {
      clearHash()
      setState((prev) => ({ ...prev, readiness: next }))
    },
    [clearHash]
  )

  const setAdoptionDays = useCallback(
    (next) => {
      clearHash()
      setState((prev) => ({ ...prev, adoptionDays: next === '' ? null : next }))
    },
    [clearHash]
  )

  const say = useCallback((message) => {
    setStatus(message)
    clearTimeout(statusTimer.current)
    statusTimer.current = setTimeout(() => setStatus(''), 4000)
  }, [])

  useEffect(() => () => clearTimeout(statusTimer.current), [])

  // A shared link pasted into the address bar of an open tab causes no reload.
  useEffect(() => {
    const onHashChange = () => {
      const shared = readStateFromHash()
      if (shared && shared.steps.length) setState(restored(shared, 'link'))
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    saveLocal({ steps, readiness, adoptionDays })
  }, [steps, readiness, adoptionDays])

  const metrics = useMemo(() => computeMetrics(steps), [steps])
  const readinessResult = useMemo(() => computeReadiness(metrics, readiness), [metrics, readiness])
  const improvement = useMemo(() => computeImprovement(metrics), [metrics])
  const startHere = useMemo(() => computeStartHere(metrics), [metrics])
  const adoption = useMemo(() => computeAdoption(metrics, adoptionDays), [metrics, adoptionDays])

  const changeStep = useCallback(
    (id, patch) => setSteps((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s))),
    [setSteps]
  )

  const moveStep = useCallback(
    (id, dir) =>
      setSteps((list) => {
        const i = list.findIndex((s) => s.id === id)
        const j = i + dir
        if (i < 0 || j < 0 || j >= list.length) return list
        const next = list.slice()
        ;[next[i], next[j]] = [next[j], next[i]]
        return next
      }),
    [setSteps]
  )

  const removeStep = useCallback((id) => setSteps((list) => list.filter((s) => s.id !== id)), [setSteps])

  // Only one step can be the value moment. Setting a new one clears the old.
  const setValueMoment = useCallback(
    (id, on) => setSteps((list) => list.map((s) => ({ ...s, isValueMoment: on && s.id === id }))),
    [setSteps]
  )

  const addStep = useCallback(
    () =>
      setSteps((list) => [
        ...list,
        {
          id: newId(),
          name: '',
          owner: 'us',
          processHours: 1,
          waitDaysBefore: 0,
          waitCause: null,
          isValueMoment: false,
        },
      ]),
    [setSteps]
  )

  const reset = useCallback(() => {
    setState(fresh())
    if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search)
    say('The example is back.')
  }, [say])

  const share = useCallback(async () => {
    const hash = encodeStateToHash({ steps, readiness, adoptionDays })
    if (!hash) return say('The link could not be created.')
    const url = window.location.origin + window.location.pathname + window.location.search + hash
    history.replaceState(null, '', hash)
    try {
      await navigator.clipboard.writeText(url)
      say('Link copied. The whole flow is in the address.')
    } catch {
      say('The link is now in the address bar and can be copied from there.')
    }
  }, [steps, readiness, adoptionDays, say])

  const exportSvg = useCallback(() => {
    say(downloadSvg(svgRef.current) ? 'Timeline downloaded as SVG.' : 'There is no timeline to download.')
  }, [say])

  const exportPng = useCallback(async () => {
    const ok = await downloadPng(svgRef.current)
    say(ok ? 'Timeline downloaded as PNG.' : 'The PNG could not be created. Try SVG instead.')
  }, [say])

  return (
    <>
      <header className="masthead">
        <div className="masthead-inner">
          <h1>Onboarding Flow Analyser</h1>
          <p className="lede">Map an onboarding flow, and see where the time actually goes.</p>
          <p className="byline">
            A small tool for making time-to-value concrete. Built by Omar Slaiman.
          </p>
        </div>
      </header>

      <main className="page">
        {source === 'link' ? (
          <p className="hint" style={{ marginTop: 20 }}>
            This flow was loaded from a shared link. Edit it freely — the changes only reach your
            own browser.
          </p>
        ) : null}

        <div className="columns">
          <div>
            <StepList
              steps={steps}
              onChangeStep={changeStep}
              onMoveStep={moveStep}
              onRemoveStep={removeStep}
              onSetValueMoment={setValueMoment}
              onAddStep={addStep}
              onReset={reset}
            />
          </div>

          <div className="results-col">
            <Metrics metrics={metrics} stepCount={steps.length} />
          </div>
        </div>

        <div className="section">
          <Timeline
            steps={steps}
            metrics={metrics}
            svgRef={svgRef}
            adoptionDays={adoption.days}
          />
        </div>

        <div className="section">
          <WaitDistribution metrics={metrics} improvement={improvement} startHere={startHere} />
        </div>

        <div className="section">
          <Readiness
            readiness={readiness}
            onChange={setReadiness}
            result={readinessResult}
            metrics={metrics}
            open={readinessOpen}
            onToggle={setReadinessOpen}
          />
        </div>

        <div className="section">
          <AdoptionGap
            metrics={metrics}
            adoption={adoption}
            adoptionDays={adoptionDays}
            onChange={setAdoptionDays}
          />
        </div>

        <div className="toolbar" style={{ marginTop: 20 }}>
          <button type="button" className="btn" onClick={share}>
            Copy link to this flow
          </button>
          <button type="button" className="btn" onClick={exportSvg}>
            Download timeline as SVG
          </button>
          <button type="button" className="btn" onClick={exportPng}>
            Download as PNG
          </button>
          <button type="button" className="btn" onClick={() => window.print()}>
            Print or save as PDF
          </button>
          <span className="status-msg" role="status" aria-live="polite">
            {status}
          </span>
        </div>

        <footer className="footer">
          <h2>About this tool</h2>
          <p>
            An onboarding flow is a process like any other: it has handoffs, waiting and places
            where things go wrong. And time-to-value, the figure subscription businesses measure, is
            the same thing as lead time, just said in a different vocabulary.
          </p>
          <p>
            The tool calculates nothing you could not work out by hand. The point is to make it
            visible where the time actually goes, so the conversation moves from “who is slow” to
            “where is the work sitting still”.
          </p>
          <p>
            The figures are only as good as the estimates typed in. The readiness part is a rule of
            thumb, not a model. Nothing leaves your browser: everything is calculated locally, and a
            shared link contains only what you entered yourself.
          </p>
          <p>Built by Omar Slaiman</p>
        </footer>
      </main>
    </>
  )
}
