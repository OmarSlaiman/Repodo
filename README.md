# Onboarding Flow Analyser

Et lille, selvstændigt webværktøj, der kortlægger et kundeonboardingforløb og oversætter det til
to fagsprog på én gang: procesarbejde (procestid, gennemløbstid, flow-effektivitet,
overleveringer) og SaaS/GTM (time-to-value).

Påstanden, værktøjet skal gøre konkret: kundeonboarding er en proces som enhver anden, og
time-to-value er gennemløbstid under et andet navn.

## Kom i gang

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

Bygget output lander i `dist/` og kan hostes som statiske filer hvor som helst. `base` er sat til
`./`, så det også virker fra en undermappe.

## Sådan er det skruet sammen

| Fil | Ansvar |
| --- | --- |
| `src/model.js` | Datamodel, konstanter, eksemplet og alle beregninger. Ingen UI. |
| `src/format.js` | Danske talformater ét sted. |
| `src/persist.js` | localStorage og deling via base64 i URL-hash. |
| `src/exportImage.js` | Hent tidslinjen som SVG eller PNG. |
| `src/App.jsx` | State, rækkefølgen af sektioner, deling og eksport. |
| `src/components/StepList.jsx` | Den redigerbare trinliste. |
| `src/components/Metrics.jsx` | De fire nøgletal og udregningen bag dem. |
| `src/components/Timeline.jsx` | Tidslinjen som håndtegnet SVG, med swimlanes. |
| `src/components/WaitDistribution.jsx` | Ventetidsfordeling og de største spildposter. |
| `src/components/Readiness.jsx` | De fem readiness-spørgsmål og det realistiske skøn. |

Ingen backend, ingen database, intet login. Alt regnes i browseren. Ingen
tredjepartsbiblioteker til grafik — SVG'en er tegnet i hånden.

## Beregningerne

En arbejdsdag regnes som 7,4 timer (`HOURS_PER_DAY` i `src/model.js`).

```
totalProcessDays  = sum(processHours) / 7.4
totalWaitDays     = sum(waitDaysBefore)
totalLeadTimeDays = totalWaitDays + totalProcessDays
flowEfficiency    = totalProcessDays / totalLeadTimeDays * 100
ttvDays           = sum(waitDaysBefore + processHours/7.4) til og med trinnet med isValueMoment
handoffs          = antal gange owner skifter mellem to trin i træk
waitByOwner       = ventetid før et trin tilskrives den, der skal udføre trinnet
```

Readiness-laget lægger en multiplikator (0,8 til 2,0 ud fra en score på 0-10) på **kun**
kundesidens ventetid. Kundens datakvalitet påvirker ikke, hvor hurtigt jeres eget team arbejder.

Det forudindlæste eksempel giver cirka 22,5 dages gennemløbstid, 26 timers arbejde, 15,6 %
flow-effektivitet, fire overleveringer og 13,7 dages time-to-value.

## Deling og persistens

- **localStorage** gemmer arbejdet, så et refresh ikke koster noget. Er det slået fra, kører
  værktøjet videre uden.
- **Deling** koder hele forløbet ind i URL'ens hash som base64. Intet forlader browseren.
  Så snart brugeren retter noget efter at have delt, fjernes hashen igen — adressen må ikke
  beskrive en tilstand, der ikke længere gælder.

## Bevidste fravalg

Ingen brugerkonti, intet skabelonbibliotek, ingen AI-integration, ingen sammenligning af flere
forløb og ingen omkostningsberegning. Én ting, gjort færdig.

Bygget af Omar Slaiman.
