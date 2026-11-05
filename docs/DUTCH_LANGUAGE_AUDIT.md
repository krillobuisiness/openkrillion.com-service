# FIETSDUIK — Nederlandse taal- en fairness-audit

## Samenvatting

De Nederlandse versie heeft een echte onafhankelijke answer-bank en de
interface gebruikt veel natuurlijk Nederlands. De taalarchitectuur scheidt
interface language en answer language. De uitvoering is echter niet volledig
consistent: SSR-gids, footer, info-pagina's en dynamische resultaten bevatten
nog Engels; de client probeert dit achteraf deels te vertalen.

## Huidige architectuur

- [`src/worker.mjs:37`](../src/worker.mjs#L37) normaliseert taalkeuzes naar `en` of `nl`.
- [`src/worker.mjs:40`](../src/worker.mjs#L40) laadt voor Nederlands `DUTCH` en voor Engels D1/reference/`DEMO`.
- Migraties 0003 en 0005 bewaren taalkeuzes per run.
- [`public/app.mjs:9`](../public/app.mjs#L9)–`:16` leest beide talen uit runtime-config en localStorage.
- [`public/i18n.mjs:1`](../public/i18n.mjs#L1)–`:35` vertaalt promptteksten bij gemengde taalkeuzes.
- [`src/dutch.mjs:6`](../src/dutch.mjs#L6)–`:76` bevat zeven prompts met canonical answers, aliases, tiers en één length-validator.

Dit is een goede basis: een Nederlandse vraag kan bewust een Engelse
answer-bank gebruiken, met `(in het Engels)` voor taalafhankelijke formuleringen.
Er is geen bewijs dat een Nederlandse run automatisch Engelse answers matcht.

## Gevonden problemen

### Hoog — SSR en runtime spreken niet één taal

[`src/html.mjs:20`](../src/html.mjs#L20)–`:39` bevat onder meer `OpenKrillion daily
trivia game`, Engelse guide-teksten, `Report a bug`, `About` en `AI & Agent
Docs`. [`public/app.mjs:36`](../public/app.mjs#L36) en `:81-100` vervangen slechts
een subset nadat JavaScript geladen is. Bij langzaam laden of screenreaders kan
de speler dus gemengde taal zien.

### Hoog — `lang` wordt niet overal doorgetrokken

`homePage()` ontvangt een taal, maar vaste labels in `src/html.mjs:21-38` zijn
Nederlands of Engels onafhankelijk van `lang`. Settings scheiden interface- en
antwoordtaal, maar gids en toegankelijkheidslabels volgen die keuze niet volledig.

### Medium — Correcties zijn begrensd, maar niet taalspecifiek

[`public/rules.mjs:24`](../public/rules.mjs#L24) normaliseert NFKD, verwijdert
diacritics en alles buiten `[a-z0-9]`. [`public/rules.mjs:69`](../public/rules.mjs#L69)–`:71`
laat maximaal één fout toe voor 4–7 tekens en twee voor langere woorden; korte
woorden krijgen geen fuzzy matching. Er is geen expliciete behandeling voor:

- `ij` als orthografische eenheid;
- los/vast schrijven van samenstellingen;
- werkwoordsvormen en meervouden;
- Nederlandse toetsenbordfouten buiten transposities;
- regionale of Vlaamse varianten.

De correctie wordt eerst voorgesteld en pas bij opnieuw insturen geaccepteerd
([`public/app.mjs:44`](../public/app.mjs#L44)). Dat is eerlijker dan stilzwijgend
omzetten, maar de melding kan duidelijker als “Bedoelde je …?”

### Medium — Samenstellingen hebben geen productbeleid

De normalisatie verwijdert spaties en koppeltekens. Voor de vierlettervraag
wordt de canonical answer genormaliseerd en op lengte getest
(`public/rules.mjs:64-66`, `src/dutch.mjs:22-28`). Technisch is dat consistent,
maar er is geen zichtbare regel voor `fietsbel`, `grachtenpand`, meervoud,
verkleinwoorden of creatieve samenstellingen. De lijstbank voorkomt onbeperkte
exploitatie, maar spelers weten niet altijd waarom een vorm telt.

### Medium — Rarity is redactioneel

De Nederlandse bank heeft vaste tierlabels, maar geen responsfrequenties,
bronverwijzingen of reviewstatus. Scores zijn technisch correct; “zeldzaam” is
een editorial estimate en moet niet als statistisch feit worden gepresenteerd.

## Concrete taalbeoordeling

### Sterk

- “DUIK NAAR BENEDEN”, “DAAL AF”, “LOGBOEK”, “OEFENEN” en “zeldzamere
  antwoorden zakken dieper” zijn kort en begrijpelijk.
- [`src/content/guide-nl.mjs`](../src/content/guide-nl.mjs) legt timer, correcties,
  score en privacy natuurlijk uit.
- `toLocaleString('nl-NL')` wordt voor diepte en getallen gebruikt.
- Worker-fouten rond pauze, rate limit en netwerk zijn grotendeels begrijpelijk.

### Herzien

- “geen echo” is stijlvol maar niet informatief genoeg; geef ook aan dat het
  antwoord niet in de huidige categorie/answer-set past.
- “Te slim” is een leuke tiernaam, maar leg het verschil tussen obscuur en
  ongeldig expliciet uit.
- “DE KOERS”, “DE VANGST” en “DUIKLOG” zijn sfeervol; voeg daarnaast één korte
  plain-language uitleg toe.
- `Wit-Rusland` en `Belarus` staan als variant naast elkaar in
  [`src/dutch.mjs:63`](../src/dutch.mjs#L63); kies hiervoor een redactionele
  naamgevingsrichtlijn.
- Eigennamen, leenwoorden en superheldenteams blijven soms Engels; dat kan
  correct zijn, maar de antwoordtaal moet zichtbaar zijn.

## Aanbevolen taalbeleid

1. Houd canonical spelling per taal vast; normaliseer alleen hoofdletters,
   accenten en veilige interpunctie.
2. Behandel spaties en koppeltekens als niet-meetellend voor technische
   letterlengte, maar documenteer dat per prompt.
3. Accepteer samenstellingen alleen na redactionele goedkeuring of bij een
   prompt die vrije samenstellingen toestaat.
4. Gebruik aliases alleen voor echte synoniemen, gangbare varianten en duidelijke
   afkortingen; voeg geen automatische meervoudsgenerator toe.
5. Geef fuzzy matches altijd een bevestigingsstap en bewaar originele én
   canonical input.
6. Laat een niet-gelijst woord niet automatisch door een woordenboek/API
   beslissen; reproduceerbaarheid is hier belangrijker.
7. Maak één locale dictionary voor SSR, client, errors, results, aria-labels en
   gids; houd vraag- en answer-content apart.

## Prioriteit

| Prioriteit | Actie | Waarom |
| --- | --- | --- |
| P0 | Geen bevestigde P0-taalfout | De game is speelbaar; geen vastgesteld dataverlies of scorelek. |
| P1 | SSR/client-teksten centraliseren | Verwijdert gemengde taal en laadvolgorde-afhankelijkheid. |
| P1 | Correction UX expliciet maken | Verbetert fairness onder tijdsdruk zonder fuzzy matching ruimer te maken. |
| P1 | Nederlandse content reviewen | Zeven puzzels zijn een bankbasis, geen brede editie. |
| P2 | Samenstellings- en lengtebeleid documenteren | Voorkomt discussie tussen prompts. |
| P2 | Browser-audits lokalisatiebewust maken | Herstelt betrouwbare regressietests. |
