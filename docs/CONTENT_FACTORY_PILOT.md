# Contentfabriek — pilot en verificatierapport

Datum: 6 november 2026. Uitgevoerd in de Codespace, Node 24.22.2,
Wrangler 4.151.1, lokale D1 en headless Chromium via Playwright.

## Resultaat

- Eerste pilot: **21 Nederlandse vragen, 284 canonieke antwoorden, 15 categorieën**.
- Technisch geïmporteerd: 21/21; technische afkeur: 0.
- Inhoudelijk afgekeurd voor spelwaarde: **1** (klinkerletters; prompt geeft antwoorden weg).
- Inhoudelijk bruikbaar als concept maar niet selecteerbaar voor de huidige
  700-punteneditie: **13**, zonder verdedigbare 100-puntenoptie.
- Samengestelde lokale editie: **7 vragen, 190 canonieke antwoorden, 7 categorieën**.
- Tweede batch: **1 extra vraag, 8 antwoorden**, technisch/AI-reviewed;
  geen zelfstandige zevenvrageneditie en geen 100-puntentier geforceerd.
- Totaal via de importer verwerkt: **22 vragen, 292 canonieke antwoorden**.
- Menselijk goedgekeurde vragen: **0**. Alle inhoud is model-authored.
- Gemiddeld 13,52 antwoorden per pilotvraag; geselecteerde editie gemiddeld 27,14.
- Gesloten categorieën in pilot: 13. Open categorieën: 8, allemaal
  expliciet gedeeltelijk en met dekkingnotities.
- Zeven specialistische antwoorden hebben een daadwerkelijk geraadpleegde bron
  of zoekpassage. **277 pilotantwoorden hebben evidence=pending**; ook de andere
  zeven zijn niet onafhankelijk menselijk goedgekeurd.
- De synthetische EN-fixtures tellen niet als nieuwe redactionele inhoud.

Dit is een werkende lokale contentketen en proefeditie, **geen verklaring dat
alle antwoorden, varianten, vertalingen of rarity nu productierijp zijn**.

## Vraaginventaris

| ID | Vraag | Antwoorden | Uitkomst |
| --- | --- | ---: | --- |
| nl-instrumenten | Noem een muziekinstrument. | 39 | Lokale proefeditie |
| nl-mineralen | Noem een mineraalsoort; geen gesteente of alleen een kleurvariant. | 34 | Lokale proefeditie |
| nl-bloemonderdelen | Noem een anatomisch onderdeel van een bloem. | 22 | Lokale proefeditie |
| nl-stijlfiguren | Noem een stijlfiguur of vorm van beeldspraak. | 31 | Lokale proefeditie |
| nl-vlakke-krommen | Noem een benoemde vlakke kromme, zoals een cirkel. | 21 | Lokale proefeditie |
| nl-zeilschepen | Noem een historisch type zeilschip, geen individuele scheepsnaam. | 27 | Lokale proefeditie |
| nl-lichtverschijnselen | Noem een optisch verschijnsel in de atmosfeer dat door zon- of maanlicht ontstaat. | 16 | Lokale proefeditie |
| nl-weekdagen | Noem een dag van de week. | 7 | Concept; geen 100-puntenoptie |
| nl-maanden | Noem een maand van de gregoriaanse kalender. | 12 | Concept; geen 100-puntenoptie |
| nl-seizoenen | Noem een van de vier seizoenen. | 4 | Concept; geen 100-puntenoptie |
| nl-schaakstukken | Noem een soort schaakstuk uit het gewone schaakspel; pionnen tellen ook. | 6 | Concept; geen 100-puntenoptie |
| nl-kaartkleuren | Noem een kaartkleur uit een Frans kaartspel. | 4 | Concept; geen 100-puntenoptie |
| nl-regenboogkleuren | Noem een kleur uit de traditionele zevenkleurige regenboog. | 7 | Concept; geen 100-puntenoptie |
| nl-provincies | Noem een van de twaalf Nederlandse provincies. | 12 | Concept; geen 100-puntenoptie |
| nl-romeinse-symbolen | Noem een van de zeven letters die als Romeins cijferteken worden gebruikt. | 7 | Concept; geen 100-puntenoptie |
| nl-si-basiseenheden | Noem een SI-basiseenheid; geef de naam, niet alleen het symbool. | 7 | Concept; geen 100-puntenoptie |
| nl-klinkerletters | Noem een van de vijf gewone klinkerletters a, e, i, o en u. | 5 | Afgekeurd voor spelwaarde |
| nl-veelhoeken | Noem de algemene naam van een veelhoek met drie tot en met acht zijden. | 6 | Concept; geen 100-puntenoptie |
| nl-planeten | Noem een van de acht planeten van ons zonnestelsel. | 8 | Concept; geen 100-puntenoptie |
| nl-vlagkleuren | Noem een van de drie kleuren van de Nederlandse nationale vlag. | 3 | Concept; geen 100-puntenoptie |
| nl-keuken-vier | Noem een voorwerp dat je in een keuken gebruikt, met precies vier letters. | 6 | Concept; geen 100-puntenoptie |

Tweede batch: `nl-windrichtingen`, “Noem een windrichting uit de achtstrekenroos.”,
acht antwoorden, concept zonder 100-puntenoptie.

## Tierverdeling eerste pilot

| Tier | Punten | Antwoorden |
| --- | ---: | ---: |
| plankton | 10 | 96 |
| tooclever | 15 | 10 |
| schooler | 30 | 76 |
| rare | 60 | 53 |
| deepcut | 85 | 42 |
| krillion | 100 | 7 |

De tweede batch voegt vier plankton- en vier schooler-antwoorden toe.
Er is geen geforceerde verdeling. De zeven 100-puntenkeuzes hebben low confidence:
geldigheid is onderbouwd, de kans dat spelers ze kiezen is niet gemeten.
Iedere alias deelt de tier van het canonieke concept.

## Proefeditie

- ID: `cf-nl-586a7b9c55c6edd065f1e610`
- SHA-256: `586a7b9c55c6edd065f1e6108355b3c88a98d8d9f3145d6973b8aea940e45399`
- Seed: `pilot-v1`; redactionele editiedatum: `2026-11-06`.
- Antwoordtaal: NL; maximumscore berekend uit werkelijke antwoorden: **700**.
- Volgorde: lichtverschijnselen → instrumenten → mineralen → bloemonderdelen →
  stijlfiguren → zeilschepen → vlakke krommen.
- Bestandsdatum van een editie is niet de daily-schakelaar: lokale practice
  gebruikt de huidige New York-speldatum en blijft aan deze snapshot gekoppeld.
- De follow-upimport wijzigde deze editie niet; identieke hercompilatie uit de
  beschreven workflow levert exact dezelfde hash.
- De automatische pinningtest installeert ook editie B met gewijzigde scores en
  een verwijderd antwoord, herlaadt de Worker-module en voltooit A met A's
  antwoorden, scores en reviewlijst. Dit is een herstartsimulatie met dezelfde
  testdatabase, niet een claim van een herstart van productie.

Lokaal openen met de draaiende ontwikkelserver:
[Start de Nederlandse proefeditie](http://localhost:3051/?lang=nl&answers=nl&edition=cf-nl-586a7b9c55c6edd065f1e610).

Exact installatiecommando (alleen lokale D1, na `npm run db:local`):

```sh
npm run content -- preview --file content/editions/pilot-nl-v1.json
```

Klik vervolgens op de normale startknop; de expliciete preview start practice.
Zonder previewlink blijft de bestaande daily/demo-ervaring actief.

## Inhoudelijke review en resterende vragen

De kritische pass is vastgelegd in [pilot-content.json](../content/reviews/pilot-content.json);
de aparte raritypass in [pilot-rarity.json](../content/reviews/pilot-rarity.json).
Het is eerlijk als AI-review gelabeld, niet als onafhankelijke menselijke review.

Concrete beslissingen:

- Synoniemen zoals helmbindsel/connectivum, kaag/kaagschip en lente/voorjaar delen
  één identiteit, dus geen extra punten voor een langere of specialistischer naam.
- Minerale kleurvarianten zoals amethist en robijn zijn niet als eigen soort
  toegevoegd. De vraag sluit gesteenten en alleen kleurvarianten expliciet uit.
- Epanadiplosis is niet als extra antwoord naast anadiplosis toegevoegd wegens
  terminologische overlap in het geraadpleegde lexicon.
- Een historische zeiluitvoering telt; een moderne motorvariant maakt die
  categorie niet ongeldig. Individuele scheepsnamen zijn uitgesloten.
- Poollicht en bliksem zijn geen antwoorden op de vraag naar zon-/maanlicht.
- De vierletter-keukenlijst is klein maar syntactisch gecontroleerd; zij krijgt
  geen verzonnen zeldzaam antwoord om selectie mogelijk te maken.
- De klinkerlettervraag is ondanks technische geldigheid afgekeurd voor spelwaarde.

Bekende gaten staan in de datasets en zijn niet verborgen: bijvoorbeeld erhu/
shamisen, rutiel/ilmeniet, bloembeker, antonomasie, folium van Descartes, dhow/
felucca en bijmaan/mistboog. Deze open lijsten zijn voor een lokale proef bruikbaar,
maar kunnen geldige niet-opgenomen antwoorden afwijzen. Dat moet vóór dagelijkse
productiegebruik inhoudelijk worden aangepakt, zonder automatische internetmatching
tijdens een ronde. De botanische/wiskundige vaktermen en moeilijke spreiding van
de standaardeditie verdienen een Nederlandstalige vak-/spelredacteur.

### Geraadpleegde specialistische bronnen

| Antwoord | Werkelijk geraadpleegde bron / beperkte claim |
| --- | --- |
| octobas | [Orchestre symphonique de Montréal](https://osm.ca/en/octobasses/) — instrument bestaat en wordt bespeeld |
| benitoiet | [California Geological Survey](https://www.conservation.ca.gov/cgs/Pages/Publications/Note_11.aspx) — beschreven mineraal; Engelse spelling |
| helmbindsel | [UGent-glossarium](https://wisiwis.ugent.be/glossary.php) — onderdeel van de helmknop, synoniem connectivum |
| apokoinou | [Tilburg University, stijlfiguren](https://webapp.fkt.uvt.nl/ibo/default/index/10/stijlfiguren.pdf) — geïndexeerde passage; stijlfiguur |
| nefroïde | [MathCurve](https://mathcurve.com/courbes2d.gb/nephroid/nephroid.shtml) — vlakke epicycloïde; bron gebruikt nephroid |
| kaag | [Zuiderzeemuseumcollectie](https://www.zuiderzeecollectie.nl/object/collect/Zuiderzee_museum-13453) — historisch scheepstype |
| parryboog | [KNMI-handleiding](https://cdn.knmi.nl/knmi/pdf/bibliotheek/knmipubmetnummer/knmipub137-3.pdf) — alleen zoekpassage; PDF-open geblokkeerd door bestandsgrootte |

Dit onderbouwt geen gemeten rarity en geen volledige lijstdekking. De Mindat-page
gaf 403 en wordt niet als gelezen pagina opgevoerd.

## Uitgevoerde verificatie

- `npm test`: 22 tests geslaagd, inclusief 9 nieuwe content-/integratietests.
- `npm run check`: geslaagd, inclusief offline controles van beide reviewed
  batches en integriteitscontrole van de editie. Deze check draait in bestaande CI.
- `npm run build`: geslaagd. De bestaande build herschreef ook de OG-afbeelding;
  uitsluitend die eigen onbedoelde buildwijziging is teruggezet. Geen artwork-
  of rendereraanpassing blijft over.
- `npm run test:browser`: EN en NL geslaagd met de ongewijzigde Engelse bank;
  zeven rondes, afwijzing/correctie, resultaten, review, refresh, mobiel en korte
  viewport voor toetsenbordruimte. Geen consolefouten.
- `npm run test:content-browser`: vier volledige combinaties, ieder zeven rondes,
  700 punten, expliciete vraagvertaling, afwijzing, resultaten, antwoordreview
  en refresh. NL-interfaces op 1280×800; EN-interfaces op 390×844.
- De volledige gedocumenteerde pilot- en follow-up-CLI-routes zijn uitgevoerd.
- Lokale migratie 0006 is toegepast; geen remote migratie of deployment.
- SHA-256-tests bewijzen dat beide legacybanken byte-identiek zijn aan de
  uitgangscommit. Scoring en timers zijn niet gewijzigd.
- `git diff --check` controleert whitespace; geen extra dependencies toegevoegd.

De eerste nieuwe browserrun wachtte vruchteloos op geometrische stabiliteit van
de geanimeerde startknop, vóórdat een startrequest werd verstuurd. De audit doet
nu een echte muisklik/tap op het zichtbare, hit-geteste middelpunt. Geen renderer-
wijziging of fake API-start om dit te omzeilen. Een eerste corruptiedatabasetest
liep tegen de werkende foreign key aan; de test controleert nu die bescherming
en simuleert pas daarna expliciet een beschadigde restore zonder foreign keys.

De tests controleren ook: dubbele/effectieve aliassen, verkeerde tiers, lege
banken, onbekende constraints, stale reviewhashes, menselijke/AI-statusscheiding,
determinisme, categorievariatie, onvoldoende voorraad, taalgescheiden edities,
ongeautoriseerde/onvoltooide review, geen volledige answers in today/state,
dubbele submissions, server-side scores, productieblokkade en expliciete fouten
bij ontbrekende/corrupte snapshots.

### Browserbewijs

- [Machineleesbaar nieuw browserrapport](../output/content/browser/report.json)
- [NL/NL eerste vraag](../output/content/browser/nl-nl-answer.png)
- [NL/NL resultaten](../output/content/browser/nl-nl-results.png)
- [EN/NL mobiel: expliciete Nederlandse antwoordtaal](../output/content/browser/en-nl-answer.png)
- [EN/EN mobiel: resultaten](../output/content/browser/en-en-results.png)
- [Legacy EN-browserrapport](../output/playwright/audit/report.json)
- [Legacy NL-browserrapport](../output/playwright/audit-nl/report.json)

Deze lokale bewijsbestanden staan bewust in genegeerde `output/`, niet in
publieke assets. De screenshots zijn echt browseroutput, geen mockups.

## Gewijzigde en toegevoegde bestanden

- CLI/contract: [factory](../content/factory.mjs), [CLI](../scripts/content.mjs),
  [runtimecontract](../src/content-contract.mjs), [editielader](../src/editions.mjs).
- Integratie: [Worker](../src/worker.mjs), [app](../public/app.mjs),
  [vraag-i18n](../public/i18n.mjs), [locale](../public/locale.mjs),
  [gedeelde aliassen](../public/rules.mjs), [migratie 0006](../migrations/0006_content_editions.sql).
- Content: [incoming](../content/incoming/), [reviewverslagen](../content/reviews/),
  [reviewed batches](../content/reviewed/), [proefeditie](../content/editions/pilot-nl-v1.json),
  [drie prompttemplates](../content/prompts/).
- Tests: [contenttests](../tests/content.test.mjs), [ongeldige fixtures](../tests/fixtures/content-invalid.json),
  [EN-fixtures](../tests/content-fixtures.mjs), [DB-helper](../tests/helpers.mjs),
  [bestaande gametests](../tests/game.test.mjs), [nieuwe browseraudit](../scripts/content-browser-audit.mjs).
- Config/docs: [package](../package.json), [.gitignore](../.gitignore),
  [README](../README.md), [werkflow/schema](CONTENT_FACTORY.md), dit rapport,
  [woordbankrapport](DUTCH_WORD_BANK_REPORT.md), [taalaudit](DUTCH_LANGUAGE_AUDIT.md),
  [roadmap](GAME_IMPROVEMENT_ROADMAP.md), [backlog](FEATURE_IMPROVEMENT_BACKLOG.md).

## Grenzen en volgende stap

De fabriek werkt offline en lokaal; automatische modelaanroepen, scheduling,
menselijke redactie en productiepublicatie zijn niet gebouwd. De legacyproblemen
met datum-only daily-populatie/history blijven expliciet voor de productie-
integratiefase staan. Nieuwe practice-edities tellen niet mee in daily-statistieken.

Eerst: laat de zeven geselecteerde categorieën inhoudelijk en op spelplezier
reviewen, vul bekende geldige antwoorden aan en maak hiervoor nieuwe versies.
Daarna: besluit over echte dagelijkse selectie, cohorten en de menselijke
publicatiepoort. Zie [vervolgstappen](CONTENT_FACTORY.md#wat-nog-niet-naar-productie-gaat).

