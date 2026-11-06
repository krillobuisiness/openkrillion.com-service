# Nederlandse woordbank — audit en implementatierapport

> Status 6 november 2026: dit rapport beschrijft de ongewijzigde legacybank.
> Daarnaast is [Contentfabriek v1](CONTENT_FACTORY.md) beschikbaar voor expliciete
> lokale practice-edities. Zie [de pilotrapportage](CONTENT_FACTORY_PILOT.md).
> Hieronder genoemde oude testresultaten zijn historische resultaten.

## Samenvatting

KRILLO heeft nu een zelfstandige Nederlandse voorbeeldbank met zeven speelbare puzzels. De Nederlandse sessie gebruikt eigen prompts, canonical answers, aliassen, validatieregels en redactionele rariteit. De Engelse DEMO-bank en de bestaande referentie-import blijven afzonderlijk beschikbaar.

De bank is tijdens de eerdere implementatie samengesteld; dat is geen bewijs van onafhankelijke menselijke redactie. De rariteit is een redactionele inschatting; er is geen responsfrequentiedataset waarmee de tiers statistisch zijn gemeten.

## Bestaande architectuur

- `src/demo.mjs` bevat de onafhankelijke Engelse fallback/demo-bank.
- `src/worker.mjs` haalt Engelse referentiepuzzels op, bewaart ze in D1 en valideert antwoorden server-side.
- `public/rules.mjs` bevat de gedeelde normalisatie, typo-correctie, tiers en scorewaarden.
- `src/dutch.mjs` bevat de onafhankelijke Nederlandse dataset.
- `migrations/0003_language.sql` voegt de sessietaal toe aan `runs`.
- `migrations/0004_daily_language_index.sql` voorkomt dat Engelse en Nederlandse Daily-sessies elkaar blokkeren.
- `migrations/0005_interface_answer_languages.sql` scheidt interface- en antwoordtaal in sessies.
- `public/app.mjs` stuurt de gekozen taal mee met `/api/start`.
- `src/worker.mjs` kiest op basis van `language` tussen de Engelse referentie/demo en de Nederlandse dataset.

De taal staat dus zowel in de puzzelrespons als in de gamesessie. Een Nederlandse sessie kan niet per ongeluk de Engelse antwoorden gebruiken.

## Puzzelinventaris

| ID | Nederlandse prompt | Type | Antwoorden |
| --- | --- | --- | ---: |
| `nl-p1` | Noem een manier waarop je aardappelen kunt bereiden | B — cultureel aangepast | 36 |
| `nl-p2` | Noem een dier met precies vier letters | A — direct aanpasbaar | 43 |
| `nl-p3` | Noem een Nederlandse stad | C — opnieuw ontworpen | 51 |
| `nl-p4` | Noem een chemisch element waarvan het symbool uit één letter bestaat | A — direct aanpasbaar | 14 |
| `nl-p5` | Noem een soort station, post of halte | B — cultureel aangepast | 34 |
| `nl-p6` | Noem een land in Europa | C — opnieuw ontworpen | 50 |
| `nl-p7` | Noem een superheldenteam | B — cultureel aangepast | 35 |

Totalen:

- Engelse demo-puzzels: 7.
- Nederlandse puzzels: 7.
- Direct aangepast: 2.
- Cultureel aangepast: 3.
- Opnieuw ontworpen: 2.
- Nederlandse canonical answers: 263.
- Gemiddeld: 37,6 answers per puzzel.
- De 14 elementen van `nl-p4` vormen een gesloten categorie. Het aantal alleen bewijst geen onvoldoende dekking; een universeel minimum van 30 is hier onjuist. Inhoudelijke volledigheid moet per categorie worden beoordeeld.

## Antwoordmodel

De bestaande vorm is behouden: `{ answer, tier, aliases }`. Nederlandse entries voegen geen nieuw incompatibel antwoordmodel toe. Puzzels hebben daarnaast `language`, `classification` en optioneel `validation`.

De zes bestaande scoretiers blijven hetzelfde:

- Plankton: 10 punten.
- Te slim: 15 punten.
- Schoolvis: 30 punten.
- Zeldzaam: 60 punten.
- Diepe snede: 85 punten.
- Eén op een krillion: 100 punten.

De tiers zijn per Nederlandse puzzel opnieuw redactioneel ingedeeld. Ze zijn niet gekopieerd uit de Engelse antwoorden en vertegenwoordigen geen gemeten spelersfrequenties.

## Validatie

De gedeelde normalisatie blijft hoofdletter-, accent-, spatie- en leestekenongevoelig. Voor Nederlandse lengtevragen ondersteunt `matchAnswer` nu een expliciete `canonical-length`-regel. De lengte wordt berekend na normalisatie van de Nederlandse canonical spelling.

Voor `nl-p2` betekent dit:

- alleen exact vier genormaliseerde letters;
- geen spaties of koppeltekens in de canonical answers;
- antwoorden van drie, vijf of meer letters worden geweigerd;
- Engelse antwoorddata wordt niet geraadpleegd.

De bestaande Engelse validatie zonder deze metadata blijft ongewijzigd.

## Testresultaten

- `npm test`: 12/12 geslaagd.
- Syntaxchecks voor de gewijzigde JavaScript-modules: geslaagd.
- `npm run build`: geslaagd.
- Lokale migration `0003_language.sql`: succesvol toegepast.
- Chromium desktopflow op 1280×800: geslaagd.
- Alle zeven Nederlandse rondes: geslaagd.
- Nederlandse resultatenscherm: zichtbaar.
- Browserconsole tijdens de sessie: geen fouten.
- Engelse en Nederlandse practice-sessies: verschillende `language`-velden, prompts en run-ID’s.

## Niet automatisch bewezen

De Nederlandse antwoorden zijn nog niet door een onafhankelijke Nederlandse taalredacteur of lexicografische bron nagekeken. Vooral samenstellingen, stationscategorieën, stedenlijst en superheldenteams verdienen een menselijke contentreview voordat de bank als productiecontent wordt beschouwd.

Het aantal antwoorden dat daarom nog handmatige review nodig heeft: **263**. Dit betekent niet dat alle 263 fout zijn; het betekent dat ze nog niet extern redactioneel zijn goedgekeurd.

## Gewijzigde bestanden

- `src/dutch.mjs` — Nederlandse dataset.
- `src/demo.mjs` — Engelse demo-prompts terug als Engelse brondata.
- `src/worker.mjs` — taalkeuze, sessietaal en Nederlandse antwoordvalidatie.
- `public/rules.mjs` — optionele lengtevalidatie voor een puzzel.
- `public/app.mjs` — taal meesturen bij het starten en promptweergave.
- `public/i18n.mjs` — promptweergave per taal.
- `src/config.mjs` — `nl` als ondersteunde gameplaytaal.
- `migrations/0003_language.sql` — taalveld op gamesessies.
- `migrations/0004_daily_language_index.sql` — taalgevoelige unieke Daily-index.
- `migrations/0005_interface_answer_languages.sql` — onafhankelijke interface- en antwoordtaal.
- `tests/game.test.mjs` — dataset-, scheidings- en lengtevalidatietests.

De Engelse antwoorden, aliassen, scores, referentie-import en zeven-rondestructuur zijn niet verwijderd of overschreven.

## Aanbevolen vervolgstap

Laat de 263 Nederlandse canonical answers en aliassen door een native Nederlandse reviewer controleren. Daarna kan een tweede contentreview de rariteitstiers en de categorieën met culturele aanpassing bevestigen. Pas daarna is het verantwoord om deze bank als productie-daily-bank in plaats van als lokale Nederlandse fallback te gebruiken.
