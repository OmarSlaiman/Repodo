# Onboarding Flow Analyser

A small, self-contained web tool that maps a customer onboarding flow and translates it into two
vocabularies at once: process work (process time, lead time, flow efficiency, handoffs) and
SaaS/GTM (time-to-value).

The claim it is built to make concrete: customer onboarding is a process like any other, and
time-to-value is lead time under another name.

Live at <https://omarslaiman.github.io/Repodo/>.

## Getting started

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

The build lands in `dist/` and can be hosted as static files anywhere. `base` is set to `./`, so it
also works from a subdirectory.

## How it is put together

| File | Responsibility |
| --- | --- |
| `src/model.js` | Data model, constants, the example and every calculation. No UI. |
| `src/format.js` | Number formatting and the rounding rule, in one place. |
| `src/persist.js` | localStorage, sharing via base64 in the URL hash, and legacy migration. |
| `src/exportImage.js` | Download the timeline as SVG or PNG. |
| `src/App.jsx` | State, the order of the sections, sharing and export. |
| `src/components/StepList.jsx` | The editable list of steps. |
| `src/components/Metrics.jsx` | The five key figures and the arithmetic behind them. |
| `src/components/Timeline.jsx` | The timeline as hand-drawn SVG, with swimlanes. |
| `src/components/WaitDistribution.jsx` | Waiting by owner and by cause, the biggest delays, countermeasures and potential. |
| `src/components/Readiness.jsx` | The five readiness questions, the realistic estimate and the countermeasures. |
| `src/components/AdoptionGap.jsx` | The gap between value available and value used. |

No backend, no database, no login. Everything is calculated in the browser. No third-party
libraries for graphics — the SVG is drawn by hand.

## The calculations

A working day counts as 7.4 hours (`HOURS_PER_DAY` in `src/model.js`).

```
totalProcessDays   = sum(processHours) / 7.4
totalWaitDays      = sum(waitDaysBefore)
totalLeadTimeDays  = totalWaitDays + totalProcessDays
flowEfficiency     = totalProcessDays / totalLeadTimeDays * 100
ttvDays            = sum(waitDaysBefore + processHours/7.4) up to the step with isValueMoment
handoffs           = times owner changes between two consecutive steps
waitByOwner        = waiting before a step is attributed to whoever carries that step out
classifiedWaitDays = waiting where waitCause is set
humanWaitDays      = sum(waitDaysBefore where waitCause is set and is not "technical")
humanWaitShare     = humanWaitDays / classifiedWaitDays * 100
```

### Cause rather than owner

Every step carries both an `owner` and a `waitCause`. Ownership tells you who is holding the ball.
The cause tells you why it is sitting still — and it is the cause that decides what can be done
about it. The five causes (`calendar`, `decision`, `delivery`, `priority`, `technical`) each carry a
countermeasure and a saving range in `WAIT_CAUSES`.

Four of the five are human. That gives the **human wait time** figure, which is the sharpest point
the tool makes: you cannot automate your way out of a flow where nearly all the waiting comes down
to calendars, decisions and priorities.

**Unspecified is a state of its own.** `waitCause: null` means the user has not answered, and it
never falls back to a default. That is essential to the credibility: if it did, every step would
count as the chosen default, the human share would always read 100%, and every countermeasure would
be the same one. Unspecified waiting is therefore counted as neither human nor technical, it is
shown as a hatched field in the bar, it is held out of the potential calculation, and a delay with
no cause gets a prompt instead of a borrowed countermeasure. The tool does not guess on the user's
behalf.

### The rounding rule

Calculated figures may carry one decimal. Estimates may not — they are shown as whole days or as a
range. `fmt` is for calculated figures, `fmtEstimate` and `fmtEstimateRange` for estimates. An
estimate that looks precise promises more than it can keep.

### Estimates

- **The potential** (`computeImprovement`) takes the three biggest delays and applies the saving
  range for each cause. The result is a range, not a single figure.
- **Readiness** applies a multiplier (0.8 to 2.0 from a score of 0-10) to **only** customer-side
  waiting. The customer's data quality does not affect how fast your own team works. Each answer
  that scores badly produces a concrete countermeasure.
- **The adoption gap** is the user's own estimate of how long it takes from go-live until the
  solution is used day to day. It is added to time-to-value and drawn as a dashed zone on the
  timeline.

The preloaded example gives 22.5 days of lead time, 26 hours of work, 15.6% flow efficiency, four
handoffs, 13.7 days of time-to-value and 89.5% human wait time (2 of 19 waiting days are technical).
Handle the three biggest delays and the flow lands at roughly 13-16 days, with the recommendation
pointing at the calendar waiting first.

## Sharing and persistence

- **localStorage** keeps the work, so a refresh costs nothing. If it is switched off, the tool
  carries on without it.
- **Sharing** encodes the whole flow into the URL hash as base64. Nothing leaves the browser. As
  soon as the user changes anything after sharing, the hash is removed again — the address must not
  describe a state that no longer holds.
- **Older links and saved work** still load. Links from version 1 carry no wait causes and no
  adoption figure; the cause stays **unspecified** rather than being guessed. Links from the Danish
  release carry Danish keys, which are translated on the way in (`src/persist.js`), so those links
  keep working. A stored copy of the Danish demo that was never edited is replaced with the English
  example, so nobody meets an English page with Danish step names.

## Deploy

```bash
npm run deploy
```

Builds and pushes `dist/` to the `gh-pages` branch.

## Deliberate omissions

No user accounts, no template library, no AI integration, no comparison of several flows and no cost
calculation. One thing, finished.

PDF export goes through the browser's own printing (`window.print()` plus a print stylesheet) rather
than a third-party DOM-to-image library.

Built by Omar Slaiman.
