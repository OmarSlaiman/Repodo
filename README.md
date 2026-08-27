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
| `src/components/Metrics.jsx` | De fem nøgletal og udregningen bag dem. |
| `src/components/Timeline.jsx` | Tidslinjen som håndtegnet SVG, med swimlanes. |
| `src/components/WaitDistribution.jsx` | Ventetid efter ejer og efter årsag, spildposter, modtræk og potentiale. |
| `src/components/Readiness.jsx` | De fem readiness-spørgsmål, det realistiske skøn og modtrækkene. |
| `src/components/AdoptionGap.jsx` | Gabet mellem tilgængelig og brugt værdi. |

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
humanWaitDays     = sum(waitDaysBefore hvor waitCause != "teknisk")
humanWaitShare    = humanWaitDays / totalWaitDays * 100
```

### Årsag frem for ejer

Hvert trin har både en `owner` og en `waitCause`. Ejerskab fortæller, hvem der holder bolden.
Årsagen fortæller, hvorfor den ligger stille — og det er årsagen, der afgør, hvad man kan gøre
ved det. De fem årsager (`kalender`, `beslutning`, `leverance`, `prioritering`, `teknisk`) har
hver et modtræk og et besparelsesinterval i `WAIT_CAUSES`.

Fire af de fem er menneskelige. Det giver nøgletallet **menneskelig ventetid**, som er værktøjets
skarpeste pointe: man kan ikke automatisere sig ud af et forløb, hvor næsten al ventetid skyldes
kalendere, beslutninger og prioriteringer.

### Rundingsreglen

Beregnede tal må have én decimal. Estimerede tal må ikke — de vises som hele dage eller som et
interval. `fmt` er til beregnede tal, `fmtEstimate` og `fmtEstimateRange` til skøn. Et skøn, der
ser præcist ud, lover mere end det kan holde.

### Skøn

- **Potentialet** (`computeImprovement`) tager de tre største spildposter og anvender
  besparelsesintervallet for hver årsag. Resultatet er et interval, ikke et tal.
- **Readiness** lægger en multiplikator (0,8 til 2,0 ud fra en score på 0-10) på **kun**
  kundesidens ventetid. Kundens datakvalitet påvirker ikke, hvor hurtigt jeres eget team arbejder.
  Hvert svar, der scorer dårligt, giver et konkret modtræk.
- **Adoptionsgabet** er brugerens eget skøn over, hvor lang tid der går fra go-live, til løsningen
  bruges i det daglige. Det lægges til time-to-value og tegnes som en stiplet zone på tidslinjen.

Det forudindlæste eksempel giver 22,5 dages gennemløbstid, 26 timers arbejde, 15,6 %
flow-effektivitet, fire overleveringer, 13,7 dages time-to-value og 94,7 % menneskelig ventetid.
Håndteres de tre største spildposter, lander forløbet på cirka 13-16 dage.

## Deling og persistens

- **localStorage** gemmer arbejdet, så et refresh ikke koster noget. Er det slået fra, kører
  værktøjet videre uden.
- **Deling** koder hele forløbet ind i URL'ens hash som base64. Intet forlader browseren.
  Så snart brugeren retter noget efter at have delt, fjernes hashen igen — adressen må ikke
  beskrive en tilstand, der ikke længere gælder.
- **Ældre links** fra version 1 har ingen ventetidsårsager og intet adoptionstal. De indlæses
  stadig; årsagen falder tilbage på `leverance`, og adoptionsfeltet står tomt.

## Deploy

```bash
npm run deploy
```

Bygger og pusher `dist/` til `gh-pages`-branchen. Siden ligger på
<https://omarslaiman.github.io/Repodo/>.

## Bevidste fravalg

Ingen brugerkonti, intet skabelonbibliotek, ingen AI-integration, ingen sammenligning af flere
forløb og ingen omkostningsberegning. Én ting, gjort færdig.

PDF-eksport sker gennem browserens egen udskrivning (`window.print()` plus et print-stylesheet)
frem for et tredjepartsbibliotek til DOM-til-billede.

Bygget af Omar Slaiman.
