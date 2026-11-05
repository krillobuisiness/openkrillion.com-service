# FIETSDUIK — geprioriteerde feature backlog

## Prioriteitsregels

- **P0:** kritieke bug, fairness- of toegankelijkheidsprobleem.
- **P1:** hoge opbrengst, eerstvolgend productwerk.
- **P2:** waardevol na de basis.
- **P3:** optionele polish of experiment.

De items onderscheiden bevestigde bevindingen van ideeën. Alleen bevindingen met
code- of testbewijs worden als probleem beschreven.

| ID / prioriteit | Feature | Huidig probleem / bewijs | Oplossing | Player/Dutch-benefit | Impact | Effort | Risico |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B01 P1 | Eén locale bron | SSR in `src/html.mjs:20-39`, client-patches in `public/app.mjs:36,81-100` | SSR, errors, results, aria-labels en guide uit één locale-catalogus | Geen gemengde taal; native gevoel | Gameplay M / visual M | M | Laag |
| B02 P1 | Correction UX | `matchAnswer` is beperkt fuzzy; melding is `geen echo` (`src/worker.mjs:149-150`) | Toon “Bedoelde je …?” met expliciete bevestiging | Minder oneerlijke missers | Gameplay H | S/M | Laag |
| B03 P1 | NL content review | `src/dutch.mjs` heeft 7 voorbeeldpuzzels, tiers redactioneel | Review per prompt, source/coverage/reviewstatus toevoegen | Meer vertrouwen en variatie | Gameplay H | L | Medium |
| B04 P1 | Foutmeldingen per locale | Worker heeft gemengde Engelse technische fallbacks (`src/worker.mjs:170-201`) | Locale-aware error catalog, technische logging apart | Begrijpelijke feedback | UX M | S | Laag |
| B05 P1 | Audittests lokalisatiebewust | `scripts/browser-audit.mjs:27-28` assert Engelse strings | Test op semantische keys/status, niet op Engelse tekst | Betrouwbare regressietests | Reliability H | S | Laag |
| B06 P1 | Toegankelijke live status | Canvas is visueel sterk, maar state is beperkt tekstueel beschikbaar | Live status voor fase, timer, score en resultaat | Beter voor screenreaders | Accessibility H | M | Medium |
| B07 P2 | Compound-word policy | Normalisatie verwijdert spaties/koppelteken (`public/rules.mjs:24`), beleid ontbreekt | Documenteer canonical length, losse/vaste vorm en aliases | Eerlijke spellingregels | Fairness M | S | Laag |
| B08 P2 | Results first-read pass | `showResults` maakt veel informatie tegelijk (`public/app.mjs:100`) | Score/diepte/actie bovenaan; details uitklapbaar | Minder scrollfrictie | UX M | M | Laag |
| B09 P2 | Content rotation | Zevenronde-structuur is constant en NL-bank klein | Redactionele thema-rotatie zonder scorewijziging | Meer dagelijkse variatie | Replay H | M/L | Medium |
| B10 P2 | Explainable rarity | Tiers hebben blurbs, geen antwoord-specifieke rationale | Korte redactionele reden wanneer metadata bestaat | Score beter begrijpen | UX M | M | Medium |
| B11 P2 | Dutch canal discovery | `ocean.mjs` heeft al freshwater/orange details, geen discoverylaag | 1–3 zeldzame details in bestaande renderlaag | Authentieke sfeer | Visual M | M | Medium |
| B12 P2 | Mobile keyboard suite | Matrix was goed, scripts zijn deels verouderd | Locale-onafhankelijke viewport/keyboard acceptance | Minder mobile regressies | Mobile H | M | Laag |
| B13 P3 | Weekthema’s | Niet aanwezig; alleen daily/practice | Optionele thematische promptset | Meer variatie zonder bloat | Replay M | M/L | Medium |
| B14 P3 | Milestones/collectibles | Geen aparte progression state | Kleine depth/discovery-mijlpalen, geen currency | Zachte motivatie | Replay M | L | Medium/hoog |
| B15 P3 | Dutch result card | Share bestaat (`public/rules.mjs:74-76`), geen visuele card | Statische card zonder answers | Sterkere identity/shareability | Social M | M | Medium |
| B16 P3 | Ambient cue | Web Audio en mute bestaan, geen aparte canal ambience | Alleen korte optionele surface cue | Meer plaatsgevoel | Atmosphere L/M | S | Laag |

## Top 10 quick wins

1. Browser-auditscripts aanpassen aan locale-onafhankelijke status.
2. Engelse SSR-footer/gidslabels in de Nederlandse route verwijderen.
3. Eén correction-string “Bedoelde je …?” gebruiken.
4. Reject-feedback uitbreiden met categorie-uitleg.
5. Compound- en lengtebeleid toevoegen aan de Nederlandse gids.
6. Results-header en eerste scoreblok volledig Nederlands server/client maken.
7. Nederlandse aria-labels voor canvas, menu en results.
8. NL content-reviewchecklist per puzzle toevoegen.
9. Mobile results first-read vereenvoudigen zonder data te verwijderen.
10. Eén visuele kanaaldiscovery toevoegen binnen de bestaande renderlaag.

## Top 5 taalverbeteringen

1. Eén locale catalogus voor SSR en client.
2. Correction confirmation in plaats van impliciete correctie.
3. Samenstellings- en lettertelbeleid.
4. Prompt-specifieke alternatieven met reviewstatus.
5. Review van naamgeving, leenwoorden en regionale varianten.

## Top 5 visuele verbeteringen

1. Consistente brandnaam/aria-labels tussen FIETSDUIK en OpenKrillion.
2. Results hierarchy op mobiel.
3. Eén Delftblauwe kanaaldiscovery.
4. Eén subtiele surface/canal sound cue.
5. Legacy neon/pink tokenstructuur opruimen.

## Top 5 gameplayverbeteringen

1. Correction UX.
2. Duidelijkere reject-feedback.
3. Prompt/content rotation.
4. Uitleg van rarity bij de landing.
5. Optionele weekthema-rotatie zonder scoreformule te wijzigen.

## Top 5 Dutch-culturele details

1. Delftblauwe scherf.
2. Reeds en Nederlandse freshwater-fish silhouettes.
3. Fietsbel/water-plop bij surface transition.
4. Subtiele kanaalvondsten in logboektekst.
5. Beperkte Nederlandse themaweek.

## Drie grotere ideeën

### De levende kanaalkaart

Een verzameling kleine discoveries die spelers in de descent zien en in het
logboek terugvinden. Sterk voor identiteit en replayability, maar alleen de
moeite waard als content en art duurzaam onderhouden kunnen worden.

### Redactionele weekduiken

Een optioneel weekthema met dezelfde zevenrondenlus. Onderscheidend, maar het
verhoogt contentplanning, vertaling en QA aanzienlijk.

### Explainable rarity

Eén korte redactionele reden waarom een antwoord deze tier heeft. Dit kan de kern
van “zeldzaam maar geldig” verduidelijken, maar vereist metadata en mag geen
objectieve statistiek suggereren als die niet gemeten is.
