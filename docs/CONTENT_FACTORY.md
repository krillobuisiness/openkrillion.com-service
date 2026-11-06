# Contentfabriek v1 — lokaal, versieerbaar en controleerbaar

Implementatie en verificatie: 6 november 2026. Geen deployment, remote migratie,
betaalde modelaanroep of wijziging van de actieve daily-bank uitgevoerd.

## Geverifieerde uitgangssituatie

De schone branch begon op `da35578`. De aangeleverde analyse klopt voor de
contentketen: Worker/ESM, D1, optioneel R2; NL gebruikt `DUTCH` (7/263), EN gebruikt
cache/D1/reference/`DEMO` (7/41). Alleen `puzzles.date` was de contentsleutel.
Runs bewaarden datum en twee talen, niet de inhoudsversie. State, answer en
review laadden de bank opnieuw. De bestaande browseraudit gebruikt `answers=en`
in beide interfaces. Vraagvertaling berustte op exacte tekstmapping.

Verschil met de verouderde auditdocumenten: de gedeelde locale-catalogus en de
reparatie van de resultaten-MutationObserver waren al aanwezig. Die worden niet
opnieuw gebouwd. De vaste scorewaarden zijn 10/15/30/60/85/100. `tooclever`
betekent een voorspelbaar slim antwoord, niet simpelweg een hogere moeilijkheid.

De bestaande renderer, assets, timers, zevenrondenstructuur en banken blijven
intact. De enige matcherrefactor exporteert de al bestaande effectieve aliassen
als `answerVariants`; het matchgedrag is onveranderd. Een concrete fout in de
SSR-taalselectie is gericht hersteld: `?lang=en&answers=nl` werd eerst onterecht
als EN/EN behandeld. Die combinatie wordt nu ook echt als EN/NL gerenderd.

## Architectuur en bestanden

| Onderdeel | Verantwoordelijkheid |
| --- | --- |
| [factory.mjs](../content/factory.mjs) | Import, schema/constraints, hashes, review, deterministische selectie/compiler |
| [content.mjs](../scripts/content.mjs) | Offline CLI, brief, JSON-rapporten, uitsluitend lokale D1-installatie |
| [content-contract.mjs](../src/content-contract.mjs) | Canonieke JSON/SHA-256 en integriteits-/vormcontrole in Node én Worker |
| [editions.mjs](../src/editions.mjs) | Exacte D1-snapshot laden, lokale previewpoort en expliciete fouten |
| [0006_content_editions.sql](../migrations/0006_content_editions.sql) | Onveranderlijke edities en nullable verwijzing vanuit runs |
| [worker.mjs](../src/worker.mjs) | Preview bij start, alle volgende requests via gepinde editie, veilige DTO |
| [i18n.mjs](../public/i18n.mjs) | Expliciete vraagvertalingen; tekstmap blijft legacyfallback |
| [app.mjs](../public/app.mjs) | Lokale previewselectie, practice-start, bestaande run hervatten |
| [locale.mjs](../public/locale.mjs) | NL/EN-fouten voor ontbrekende, corrupte of verkeerde edities |
| [incoming/](../content/incoming/) | Extern/model-authored JSON; nooit automatisch goedgekeurd |
| [reviews/](../content/reviews/) | Afzonderlijke inhouds- en rarity-review van exacte hashes |
| [reviewed/](../content/reviewed/) | Reproduceerbare, technisch gecontroleerde en AI-reviewed batches |
| [editions/](../content/editions/) | Compacte, vastgezette server-export, geen publieke assetmap |
| [prompts/](../content/prompts/) | Generator-, inhoudsreview- en rarity-instructies |

Route: brief → externe JSON → draftimport → technische controle → inhoudsreview
→ rarity-review → compileerbare zevenvrageneditie → lokale D1-preview → game.

## Wat is wel en niet automatisch?

De CLI maakt briefs, importeert JSON, valideert, registreert reviews, compileert
en installeert lokaal. Deze stappen zijn echt uitgevoerd. De pilotinhoud is in
deze Codex-sessie opgesteld en via dezelfde JSON-import verwerkt.
`generationMethod=model-authored`; er is **geen model-API-aanroep gelogd of gedaan**.

De providergrens is een brief-JSON naar extern gegenereerde batch-JSON. De CLI
roept niet zelfstandig een AI aan. De drie prompttemplates zijn herbruikbare
instructies, geen daemon/generator of automatische feitenchecker. Ook review
vereist een inhoudelijke handeling, hier door dezelfde assistent in afzonderlijke
kritische passes. Dat is geen onafhankelijke tweede reviewer en geen mens.

Tests en build vereisen geen modelaccount, API-sleutel of netwerkaanroep. Alleen
het installeren van projectdependencies vraagt eventueel netwerk. De zeven
specialistische pilotclaims hebben bronnotities van daadwerkelijk geraadpleegde
pagina's of zoekpassages; de tests halen die bronnen niet opnieuw op.

## Authoringcontract v1

Het volledige uitvoerbare voorbeeld staat in [pilot-nl.json](../content/incoming/pilot-nl.json).
De validator is het uitvoerbare schema, niet alleen een beschreven JSON-vorm.

| Veld | Contract |
| --- | --- |
| `schemaVersion`, `batchId` | v1, stabiele batchidentiteit |
| `generationMethod`, `promptTemplateVersion` | Eerlijke herkomst en instructieversie |
| `questionId`, `version`, `contentHash` | Stabiele identiteit, positief geheel versienummer, SHA-256 |
| `originalLanguage`, `answerLanguage` | Alleen `nl`/`en`, niet uit interface afgeleid |
| `translations` | Per locale `{text,status}`; voor compilatie gecontroleerde tegenhanger nodig |
| `category`, `difficulty`, `audience` | Redactionele categorie, easy/medium/hard, configureerbare doelgroep |
| `scope.include`, `scope.exclude` | Wat wel/niet telt; semanticiteit wordt door reviewer beoordeeld |
| `constraints` | Alleen `listed` of ondersteunde `canonical-length` |
| `coverage` | `type=open/closed`, `status`, `knownMissing`, `notes` |
| `answers[].answerId`, `conceptId` | Canonieke identiteit onafhankelijk van latere spellingcorrectie |
| `answer`, `aliases`, `tier` | Runtimecompatibele spelling, expliciete alternatieven en bestaande tier-ID |
| `rarity` | `source=ai_estimate`, methodeversie, low/medium/high zekerheid, reden |
| `evidence` | `pending` of `source-checked`, URL/claim/datum en page/search-excerpt |
| `reviews` | Afzonderlijk technical/validator, content/ai/human en rarity/ai/human |
| `linkedQuestionId` | Optionele conceptverbinding; taalherwerking houdt eigen identiteit |

Maximaal 2 MB per pakket, 100 vragen, 500 antwoorden per vraag, 20 aliassen per
antwoord; vraagtekst maximaal 600 tekens, antwoordtekst maximaal 120. IDs zijn
begrensde ASCII-slugs. Lege inhoud, onbekende tiers, normalisatiebotsingen en
HTML/controltekens in spelersteksten blokkeren import. De browser blijft teksten
met `textContent` of bestaande escaping renderen.

Een inhoudshash omvat alle vraagmetadata, vertalingen, antwoorden, constraints en
rarity, maar niet de hash zelf of reviews. Een wijziging maakt bestaande reviews
ongeldig. Een gewijzigde betekenis/spelling/rarity vereist een nieuwe version
tegenover de catalogus, met behoud van dezelfde stabiele questionId/answerId waar
het nog hetzelfde concept is. Import negeert meegeleverde reviews en herberekent
hashes. `sealBatch` wist reviews als de hash verandert. Validatie/compilatie
accepteren geen oude reviewhash.

Een AI-reviewer mag niet als human met een modelnaam worden geregistreerd.
Menselijke en AI-goedkeuring staan apart; een fail blokkeert de standaardeditie.
Dit is een lokale redactionele workflow, geen geauthenticeerd handtekeningsysteem:
revieweridentiteit berust op de operatorverklaring. Er is geen menselijke
goedkeuring voor de meegeleverde pilot. Productiepublicatie heeft een eigen,
nog te bouwen goedkeuringsbeleid nodig.

### Letter- en antwoordbeleid

`normalized-latin-letters-v1` sluit aan op bestaande `normalize`: NFKD,
accentongevoelig, hoofdletterongevoelig, spaties/koppeltekens/leestekens tellen
niet mee; `ij` en `ĳ` tellen beide als twee letters. Bij deze lengteconstraint
zijn cijfers in canonieke spellingen en effectieve aliassen verboden. De algemene
legacy-normalizer behoudt cijfers en zet `&` om in `and`; dat is niet veranderd.

De vierletterregel controleert ook de invoerlengte vóór fuzzy matching:
`hondd` wordt afgewezen; `h nod` kan na normalisatie een correctie naar `hond`
opleveren. Dit bestaande gedrag is expliciet getest, niet stilzwijgend verruimd.
De validator kent ook ingebouwde Engelse matcheraliassen zoals `mashed/mash`.
Zo worden botsingen gevonden die niet letterlijk in de auteur-JSON staan.

Echte synoniemen delen één concept en één tier. In de pilot: voorjaar/lente,
helmbindsel/connectivum en boog van Parry/parryboog. Er worden geen automatische
meervouden, vervoegingen of regionale alternatieven aangemaakt. De bestaande
legacydubbeling friet/patat is bewust niet veranderd.

Een `listed`-regel valideert lidmaatschap, niet de waarheid van een categorie.
De compiler kan niet bewijzen dat iets een mineraal of stijlfiguur is. Onbekende
constrainttypen/velden blokkeren export; een nieuwe harde regel vereist een
implementatie en regressietests.

### Zeldzaamheidsrubriek

| ID | Punten | Voorlopige keuze-inschatting bij deze vraag binnen 25 seconden |
| --- | ---: | --- |
| plankton | 10 | Eerste associatie |
| tooclever | 15 | Voorspelbaar slim antwoord voor zeldzaamzoekers |
| schooler | 30 | Bekend en regelmatig verwacht |
| rare | 60 | Duidelijk minder spontaan |
| deepcut | 85 | Specialistisch en onderbouwbaar |
| krillion | 100 | Uitzonderlijk weinig verwacht, geldig en onderbouwbaar |

Geen percentages of gemeten responsaantallen worden verzonnen. Bronbewijs voor
het bestaan van een mineraal is geen bewijs voor antwoordfrequentie. Zekerheid
van de zeven 100-puntenkeuzes staat bewust op low. De tweede pass noteert geen
tierwijzigingen, maar dat is geen onafhankelijke statistische bevestiging.

## Reproduceerbare commando's

Vanaf de repositoryroot, na de bestaande `npm ci`. De afzonderlijke uitvoerfiles
maken onderstaande route ook opnieuw uitvoerbaar zonder eigen drafts te wissen.
De import accepteert identieke herhaling; een andere inhoud overschrijft nooit
zomaar een bestaand outputbestand. `review` zonder `--out` wijzigt wel de gekozen
draft; gebruik afzonderlijke outputs als je iedere stap wilt bewaren.

```sh
npm run content -- brief --language nl --categories muziek,mineralen,plantkunde,taal,wiskunde,scheepvaart,weer --out content/work/repro/brief.json
npm run content -- import --file content/incoming/pilot-nl.json --out content/work/repro/import.json
npm run content -- validate --file content/work/repro/import.json --report output/content/pilot-validation.json
npm run content -- review --file content/work/repro/import.json --review content/reviews/pilot-content.json --out content/work/repro/content-reviewed.json
npm run content -- review --file content/work/repro/content-reviewed.json --review content/reviews/pilot-rarity.json --out content/work/repro/reviewed.json
npm run content -- compile --file content/work/repro/reviewed.json --seed pilot-v1 --date 2026-11-06 --language nl --out content/work/repro/edition.json
npm run db:local
npm run content -- preview --file content/work/repro/edition.json
npm run dev -- --ip 0.0.0.0
```

Als de server al draait, start geen tweede server. Open de URL die `preview`
afdrukt en klik op de bestaande startknop. De expliciete previewlink start
altijd **practice**, ook wanneer je de grote startknop gebruikt.

Voor de kant-en-klare gecontroleerde export volstaat:

```sh
npm run content -- preview --file content/editions/pilot-nl-v1.json
```

Tweede batch, zonder de eerste editie te wijzigen:

```sh
npm run content -- import --file content/incoming/followup-nl.json --out content/work/repro/followup.json
npm run content -- review --file content/work/repro/followup.json --review content/reviews/followup-content.json --out content/work/repro/followup-content.json
npm run content -- review --file content/work/repro/followup-content.json --review content/reviews/followup-rarity.json --out content/work/repro/followup-reviewed.json
npm run content -- validate --file content/work/repro/followup-reviewed.json --report output/content/followup-validation.json
```

De tweede batch heeft één vraag en is dus op zichzelf geen zevenrondeneditie.
De pinningtest bouwt daarnaast een volwaardige gewijzigde editie B en speelt A
verder om het verschil in antwoorden en scores daadwerkelijk te controleren.

Opties: `--audience` past de briefdoelgroep aan; `--catalog` leest een directory
met bestaande batches (standaard `content/work/drafts`, plus beide legacybanken).
`--questions` kiest expliciet zeven IDs, nog steeds met alle kwaliteitscontroles.
`--recent` leest een JSON-array met recente edities en sluit die questionIds uit.
Bij onvoldoende voorraad volgt een fout, geen herhaling of hogere tier.

Exitcodes: 0 = technische stap geslaagd, 2 = technisch validatierapport met fouten,
1 = ongeldige opdracht, review, opslag of onvoldoende compilatievoorraad.
Leesbare samenvatting op stdout; volledig machineleesbaar validatierapport via
`--report` (standaard `output/content/validation.json`). Waarschuwingen zijn geen
technische fouten en evenmin een bewijs van correctheid.

## Onveranderlijke edities en bestaande games

Editie-identiteit: `cf-{answerLanguage}-{eerste 24 hextekens SHA-256}`. De volledige
hash omvat seed, datum, geordende vraagversies, vraaghashes, vertalingen, antwoorden
en tiers. Dezelfde input/seed/datum levert dezelfde export; invoervolgorde van de
vragen verandert de deterministische selectie niet. Minimaal vijf categorieën,
maximaal twee vragen per categorie, zeven verschillende vragen. Alleen lokaal
reviewgeschikte vragen met een werkelijk berekende maximumscore van 100 per vraag
worden voor de huidige 700-puntengame geselecteerd. Dit is een selectiebeperking,
geen automatische wijziging van rarity.

`content_editions` heeft een eigen ID, antwoordtaal, datum, volledige hash en
compacte snapshot. NL en EN kunnen naast elkaar bestaan op dezelfde datum.
SQL-triggers blokkeren UPDATE/DELETE; de runverwijzing heeft een foreign key.
De compiler en preview-installatie overschrijven nooit bestaande edities.

Een nieuwe previewrun bewaart `content_edition_id`. State, answer en review laden
altijd die snapshot en controleren de volledige hash. Er is bewust geen aparte
editiecache, zodat een restart of andere selectie geen vervanging kan veroorzaken.
Een ontbrekende/corrupte snapshot geeft HTTP 409 met een expliciete NL/EN-melding,
geen fallback naar DEMO/DUTCH. Preview-invoer accepteert alleen een opgeslagen ID,
geen bestandspad of URL. De installatiestap is lokale CLI, niet een publieke API.
De Worker controleert `LOCAL_DEVELOPMENT==='true'`; productie geeft 403 voor de
preview. `preview` gebruikt hardcoded `--local` en de lokale Wrangler-config.

Legacyruns met NULL blijven hun bestaande `puzzleFor`-pad gebruiken. Hun
historische reproduceerbaarheidsbeperking is niet verholpen door deze lokale
uitbreiding. Referentiesynchronisatie en de oude `puzzles`-tabel blijven intact.
Geen actieve daily of manifest is naar nieuwe inhoud omgezet.

Publieke today/state-prompts bevatten alleen ID, tekst en zo nodig gecontroleerde
vertalingen/originele taal. Geen answers, constraints, reviewnotities of bronnen.
Resultaten tonen alleen eigen reeds gescoorde antwoorden. Volledige antwoordreview
blijft aan eigenaar én voltooiing gebonden. Voorbeelden staan buiten `public/`.
De repository is wel openbaar: deze ontwikkelcontent is geen geheim ten opzichte
van iemand die de broncode bekijkt; er is alleen geen lek via de spel-DTO/assets.

Expliciete vraagvertalingen hebben voorrang boven de legacytekstmap. Bij gemengde
talen staat steeds `(antwoord in het Engels)` of `(answer in Dutch)`, ook bij
lengtevragen. De antwoorden en constraints blijven die van de opgeslagen bank.

## Wat nog niet naar productie gaat

- Daily-koppeling: immutable mapping `(New York-datum, answerLanguage) → editionId`
  vóór openstelling. De bestaande America/New_York-daggrens blijft ongewijzigd.
- Daily-vergelijkingen filteren legacy nog op datum; browserhistory sleutelt daily
  nog op datum. Vóór nieuwe daily-edities moeten cohort en history-sleutel editie/
  taalbewust worden gemigreerd, met behoud van oude historie. Practice wordt niet
  in daily-populaties meegeteld; deze uitbreiding activeert geen nieuwe dailies.
- Frequentieontwerp: tel toekomstige responses per questionId+version+hash,
  answerLanguage en canonicalAnswerId, gescheiden naar contentcohort. Een tierupdate
  maakt een nieuwe editie; bestaande runs blijven ongewijzigd. Geen telemetry-
  herbouw of opslag van afgewezen spelerwoorden in v1.
- Modeladapter: gecontroleerd briefcontract, gestructureerde JSON-output,
  token-/kostenbudget, timeout, bounded retries, deduplicatie en provenance van
  daadwerkelijke calls. Geheimen alleen in private omgeving, niet in bestanden.
- Scheduling: voorraadcontrole en draftgeneratie; nooit automatisch publiceren
  op grond van alleen een AI-review. Menselijke beleidskeuze voor live release.
- Content: uitbreiden van bekende gaten, onafhankelijke vak-/taalcontrole,
  kalibratie van de moeilijke pilot en controle van Vlaamse alternatieven.

## Verificatie

Zie [CONTENT_FACTORY_PILOT.md](CONTENT_FACTORY_PILOT.md) voor exacte aantallen,
reviewuitkomsten, editie-ID, hash en uitgevoerde checks. Unit/integratietests
gebruiken alle migraties, geïsoleerd SQLite en vaste fixtures. De nieuwe
browseraudit installeert uitsluitend lokale fixtures en doorloopt vier volledige
taalcombinaties; de Engelse fixtures zijn **testdata**, geen nieuwe productiebank.

`npm run check` bevat offline contentcontroles en wordt door de bestaande CI
uitgevoerd. De browserchecks zijn apart reproduceerbaar:

```sh
npm test
npm run check
npm run build
npm run test:browser
npm run test:content-browser
```
