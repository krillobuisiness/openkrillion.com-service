# KRILLO / FIETSDUIK — game-experience audit

## Scope en methode

Dit is een analyse, geen implementatie. De frontend-, worker-, content-,
asset- en testbestanden zijn gelezen; de serverflow is gevolgd en de bestaande
lokale controles zijn uitgevoerd. Tijdens deze audit zijn geen gamebestanden,
databases, vraagbanken of assets aangepast.

Gecontroleerd zijn onder meer [`src/html.mjs`](../src/html.mjs),
[`public/app.mjs`](../public/app.mjs), [`src/worker.mjs`](../src/worker.mjs),
[`public/rules.mjs`](../public/rules.mjs), [`public/ocean.mjs`](../public/ocean.mjs),
[`public/style.css`](../public/style.css), de taalbanken, D1-migraties en tests.

## Executive summary

De game heeft een duidelijke en onderscheidende kern: zeven open vragen, een
korte timer en een afdaling waarin zeldzamere antwoorden meer diepte opleveren.
De belangrijkste systemen zijn server-side gebouwd: sessies, timing, score,
pauzeren, dubbele submissions, taalkeuze en resultaten worden niet alleen door
de browser bepaald.

De grootste rem op kwaliteit is niet de basisgameplay maar de afwerking rond
taalconsistentie en contentdiepte. De live standaardroute is Nederlands, maar
delen van de server-rendered gids, footer, resultatentemplate en foutteksten zijn
nog Engels of worden pas na het laden met DOM-manipulatie vertaald. Daarnaast is
de Nederlandse bank inhoudelijk een zelfstandige voorbeeldbank van zeven
puzzels; technisch speelbaar, maar nog geen brede dagelijkse contentlaag.

### Beoordeling

| Onderdeel | Score | Onderbouwing |
| --- | ---: | --- |
| Gameplay | 7/10 | Heldere zeven-rondenlus, korte timer en betekenisvolle diepte; beperkte variatie na meerdere sessies. |
| Nederlandse taalervaring | 5/10 | Kernscherm en vragen zijn grotendeels Nederlands, maar gids, footer, results-template en enkele labels mengen talen. |
| Visueel ontwerp | 8/10 | Sterke pixel-artwereld, Amsterdamse omgeving, underwater descent en duidelijke stijl. |
| Game feel | 7/10 | Geluid, shake, plunge, tier ladder en score-animatie bestaan; feedback kan informatiever. |
| Mobiele ervaring | 8/10 | De gevraagde viewports zijn getest; geen overflow gevonden. De panorama-crop beperkt wat tegelijk zichtbaar is. |
| Replayability | 6/10 | Daily, practice, history, share en buddy-streaks bestaan; weinig inhoudelijke langetermijnvariatie. |
| Technische betrouwbaarheid | 8/10 | Servervalidatie, D1, rate limiting, pause/resume en tests zijn aanwezig. Browser-auditscripts lopen deels achter op lokalisatie. |

## Werkelijke spelerflow

1. [`src/worker.mjs:185`](../src/worker.mjs#L185) serveert de homepage en kiest standaard Nederlands.
2. [`src/html.mjs:20`](../src/html.mjs#L20) rendert canvas, UI, dialogs, gids en runtime-config.
3. [`public/app.mjs:42`](../public/app.mjs#L42) verstuurt `/api/start` met interface- en antwoordtaal.
4. [`src/worker.mjs:105`](../src/worker.mjs#L105) maakt of hervat een D1-run.
5. [`public/app.mjs:43`](../public/app.mjs#L43) toont preview; [`public/app.mjs:119`](../public/app.mjs#L119) opent het antwoordvenster.
6. [`public/app.mjs:44`](../public/app.mjs#L44) verstuurt `/api/answer`.
7. [`src/worker.mjs:135`](../src/worker.mjs#L135) controleert eigenaar, pauze, ronde, timing en antwoord en schrijft atomair.
8. [`public/app.mjs:51`](../public/app.mjs#L51) toont afdaling, tier-feedback, score-animatie en landing.
9. [`public/app.mjs:76`](../public/app.mjs#L76) vraagt de volgende ronde op.
10. [`public/app.mjs:100`](../public/app.mjs#L100) bouwt het resultatenrapport en haalt `/api/review` op.
11. Logboek, delen, feedback en oefenen zijn gekoppeld in [`public/app.mjs:102`](../public/app.mjs#L102)–[`public/app.mjs:128`](../public/app.mjs#L128).

## Wat werkt al goed

- De server is de bron van waarheid voor zeven rondes, scores en duplicate
  protection (`src/worker.mjs:139-159`). Een client kan geen eigen score laten
  accepteren.
- De timer gebruikt serverstarttijd plus 25 seconden
  (`public/rules.mjs:16-18`, `src/worker.mjs:144-148`). Late handmatige requests
  kunnen een ronde niet opnieuw openen.
- Pauzeren is server-side (`src/worker.mjs:118-126`) en gekoppeld aan dialogs.
- Daily en practice zijn gescheiden; practice wijzigt de daily-score niet.
- De zes tiers hebben vaste scores van 10, 15, 30, 60, 85 en 100 punten
  (`public/rules.mjs:1-7`). Eén punt is tien meter.
- Sound cues, typing particles, camera, tier ladder, shake, burst en landing
  geven de kernlus duidelijke feedback.
- De art-audit controleerde 22 states zonder errors; de audio-audit controleerde
  15 events zonder clipping en met werkende mute.
- De mobiele matrix voor 1728×832, 1440×900, 1280×800, 1024×768, 768×1024,
  430×932, 390×844, 375×812, 360×800 en 844×390 rapporteerde geen horizontale
  overflow.

## Bevestigde beperkingen en problemen

### P1 — Taal is op systeemniveau niet één geheel

De live route is Nederlands, maar [`src/html.mjs:12`](../src/html.mjs#L12)–
[`src/html.mjs:15`](../src/html.mjs#L15) bevat Engelse agent/footer-tekst en
`src/html.mjs:38` rendert de gids aanvankelijk met Engelse teksten.
`public/app.mjs:36` en `:81-100` repareren slechts delen na het laden. Dit kan
een zichtbare taalwissel geven tijdens laden.

### P1 — Nederlandse content is speelbaar maar klein

[`src/dutch.mjs:6`](../src/dutch.mjs#L6)–`:76` bevat zeven zelfstandige puzzels.
Dat is een correcte architecturale scheiding, maar niet genoeg voor langdurige
dagelijkse variatie. Tierverdeling is redactioneel; er is geen meetbare
responsfrequentie.

### P1 — Contentvalidatie is lijstvalidatie

[`public/rules.mjs:61`](../public/rules.mjs#L61)–`:72` matcht tegen answer-set,
aliassen en beperkte fuzzy matching. Een inhoudelijk correct Nederlands woord
dat niet in de voorbereide bank staat wordt afgewezen. Dat is reproduceerbaar,
maar kan voor spelers voelen als een onterechte afwijzing.

### P2 — Browser-auditscripts lopen achter op lokalisatie

[`scripts/browser-audit.mjs:27`](../scripts/browser-audit.mjs#L27)–`:28` zoekt
letterlijk naar Engelse teksten zoals `no echo` en `corrects to`, terwijl de
live interface Nederlands toont. Dit is geen bewezen spelerbug, wel een
onderhoudsprobleem voor betrouwbare regressietests.

### P2 — Replayability is vooral cosmetisch

Daily, practice, logboek, share-result en buddy-unlocks bestaan, maar er zijn
geen inhoudelijke themaweken, milestones of discoveries die volgende sessies
wezenlijk anders maken. Dit is een productkans, geen defect.

## Mechanics-inventaris

| Mechanic | Status | Bewijs |
| --- | --- | --- |
| Zeven vragen | Volledig | `public/rules.mjs:18`; server voltooit op ronde 7. |
| Preview | Volledig | `PREVIEW_MS=3000`; `public/app.mjs:43`. |
| Antwoordtijd | Volledig | `ROUND_MS=25000`; server-side. |
| Score per antwoord | Volledig | `TIERS` en `src/worker.mjs:151`. |
| Rarity/depth | Volledig | Tier-score, camera en 10 meter per punt. |
| Fuzzy/correction | Gedeeltelijk | `public/rules.mjs:45-72`; beperkt, niet morfologisch. |
| Pause/resume | Volledig | D1 `paused_at`, `/api/pause`, UI-dialogs. |
| Results/review | Volledig | `/api/review`, chart, distribution en review. |
| Daily Dive | Volledig | Daily unique index en `mode='daily'`. |
| Practice | Volledig | Aparte run, niet daily. |
| Logbook/history | Volledig lokaal | `localStorage`; geen account-sync. |
| Achievements/collectibles | Niet geïmplementeerd | Geen aparte state/contentmodel gevonden. |
| Multiplayer/leaderboard | Niet geïmplementeerd | Alleen geanonimiseerde scoreverdeling. |

## Conclusie

Behoud de bestaande gamekern. De hoogste opbrengst zit in één coherente
lokalisatielaag, betere uitleg van antwoordafwijzingen/correcties en een
zorgvuldig uitbreidbare Nederlandse contentkalender. Een grote gameplay- of
rendererrewrite is op basis van de huidige code niet gerechtvaardigd.
