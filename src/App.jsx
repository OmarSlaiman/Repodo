import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  EXAMPLE_STEPS,
  DEFAULT_READINESS,
  DEFAULT_CAUSE,
  computeMetrics,
  computeReadiness,
  computeImprovement,
  computeAdoption,
  newId,
} from './model.js'
import { encodeStateToHash, readStateFromHash, saveLocal, readLocal } from './persist.js'
import { downloadPng, downloadSvg } from './exportImage.js'
import StepList from './components/StepList.jsx'
import Metrics from './components/Metrics.jsx'
import Timeline from './components/Timeline.jsx'
import WaitDistribution from './components/WaitDistribution.jsx'
import Readiness from './components/Readiness.jsx'
import AdoptionGap from './components/AdoptionGap.jsx'

const freshExample = () => EXAMPLE_STEPS.map((s) => ({ ...s }))

// Foerst et delt link, saa gemt arbejde, ellers eksemplet. Brugeren moeder aldrig en tom formular.
function restored(loaded, source) {
  return {
    steps: loaded.steps,
    readiness: loaded.readiness ?? DEFAULT_READINESS,
    adoptionDays: loaded.adoptionDays ?? null,
    source,
  }
}

function initialState() {
  const shared = readStateFromHash()
  if (shared && shared.steps.length) return restored(shared, 'link')
  const stored = readLocal()
  if (stored && stored.steps.length) return restored(stored, 'gemt')
  return { steps: freshExample(), readiness: DEFAULT_READINESS, adoptionDays: null, source: 'eksempel' }
}

export default function App() {
  const [{ steps, readiness, adoptionDays, source }, setState] = useState(initialState)
  const [readinessOpen, setReadinessOpen] = useState(false)
  const [status, setStatus] = useState('')
  const svgRef = useRef(null)
  const statusTimer = useRef(null)

  // Adressen maa ikke beskrive en tilstand, der ikke laengere gaelder. Saa snart
  // brugeren retter noget, er det delte link foraeldet, og hashen fjernes.
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

  // Et delt link indsat i adresselinjen paa en aaben fane giver ingen genindlaesning.
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

  // Kun ét trin kan vaere vaerdioejeblikket. At saette et nyt rydder det gamle.
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
          owner: 'os',
          processHours: 1,
          waitDaysBefore: 0,
          waitCause: DEFAULT_CAUSE,
          isValueMoment: false,
        },
      ]),
    [setSteps]
  )

  const reset = useCallback(() => {
    setState({ steps: freshExample(), readiness: DEFAULT_READINESS, adoptionDays: null, source: 'eksempel' })
    if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search)
    say('Eksemplet er hentet tilbage.')
  }, [say])

  const share = useCallback(async () => {
    const hash = encodeStateToHash({ steps, readiness, adoptionDays })
    if (!hash) return say('Linket kunne ikke laves.')
    const url = window.location.origin + window.location.pathname + window.location.search + hash
    history.replaceState(null, '', hash)
    try {
      await navigator.clipboard.writeText(url)
      say('Link kopieret. Hele forløbet ligger i adressen.')
    } catch {
      say('Linket står nu i adresselinjen og kan kopieres derfra.')
    }
  }, [steps, readiness, adoptionDays, say])

  const exportSvg = useCallback(() => {
    say(downloadSvg(svgRef.current) ? 'Tidslinjen er hentet som SVG.' : 'Der er ingen tidslinje at hente.')
  }, [say])

  const exportPng = useCallback(async () => {
    const ok = await downloadPng(svgRef.current)
    say(ok ? 'Tidslinjen er hentet som PNG.' : 'PNG kunne ikke laves. Prøv SVG i stedet.')
  }, [say])

  return (
    <>
      <header className="masthead">
        <div className="masthead-inner">
          <h1>Onboarding Flow Analyser</h1>
          <p className="lede">Kortlæg et onboardingforløb, og se hvor tiden faktisk går.</p>
          <p className="byline">
            Et lille værktøj til at gøre time-to-value konkret. Bygget af Omar Slaiman.
          </p>
        </div>
      </header>

      <main className="page">
        {source === 'link' ? (
          <p className="hint" style={{ marginTop: 20 }}>
            Dette forløb er indlæst fra et delt link. Ret frit i det — ændringerne rammer kun din
            egen browser.
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
          <WaitDistribution metrics={metrics} improvement={improvement} />
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
            Kopiér link til dette forløb
          </button>
          <button type="button" className="btn" onClick={exportSvg}>
            Hent tidslinje som SVG
          </button>
          <button type="button" className="btn" onClick={exportPng}>
            Hent som PNG
          </button>
          <button type="button" className="btn" onClick={() => window.print()}>
            Print eller gem som PDF
          </button>
          <span className="status-msg" role="status" aria-live="polite">
            {status}
          </span>
        </div>

        <footer className="footer">
          <h2>Om værktøjet</h2>
          <p>
            Et onboardingforløb er en proces som enhver anden: det har overleveringer, ventetid og
            fejlkilder. Og time-to-value, som abonnementsforretninger måler på, er det samme som
            gennemløbstid, bare sagt i et andet fagsprog.
          </p>
          <p>
            Værktøjet regner ikke noget ud, man ikke kunne regne i hånden. Formålet er at gøre det
            synligt, hvor tiden faktisk går, så samtalen flytter sig fra “hvem er langsom” til “hvor
            ligger arbejdet stille”.
          </p>
          <p>
            Tallene er så gode som de skøn, der tastes ind. Readiness-delen er en tommelfingerregel,
            ikke en model. Intet forlader din browser: alt regnes lokalt, og et delt link indeholder
            kun det, du selv har tastet.
          </p>
          <p>Bygget af Omar Slaiman</p>
        </footer>
      </main>
    </>
  )
}
