# FIETSDUIK — aanbevolen verbeterroadmap

De roadmap behoudt zeven rondes, bestaande score/tierwaarden, API-contracten en
D1-conventies. Elke fase kan onafhankelijk worden getest.

## Fase 1 — Fundamenten en taalfairness

**Doel:** één betrouwbare Nederlandse spelerervaring en eerlijke correcties.

**Scope:** B01–B07 uit [`FEATURE_IMPROVEMENT_BACKLOG.md`](./FEATURE_IMPROVEMENT_BACKLOG.md).

**Bestanden/systemen:** `src/html.mjs`, `public/i18n.mjs`, `public/app.mjs`,
`src/worker.mjs`, `public/rules.mjs`, `src/dutch.mjs` en browser-auditscripts.

**Acceptatiecriteria:**

- `?lang=nl` bevat geen onbedoelde Engelse spelertekst in homepage, guide,
  results, feedback of aria-labels.
- `?lang=en` bevat geen onbedoelde Nederlandse spelertekst.
- Interface language en answer language blijven onafhankelijk aantoonbaar.
- Een typo-correctie wordt nooit stilzwijgend gescoord.
- Samenstellingen, diacritics, spaties en koppeltekens hebben gedocumenteerde
  promptregels.
- Browser-audits controleren semantische UI-state in plaats van Engelse strings.

**Teststrategie:** locale-key tests, normalization/correction tests, Playwright
voor NL, EN en NL-interface/EN-answers, keyboard/screenreader-smoke test,
`npm test` en `npm run check`.

**Complexiteit:** medium. **Risico:** locale-regressies; beperk dit met één
kleine catalogus en player-facing assertions.

## Fase 2 — Game feel en feedback

**Doel:** elke actie begrijpelijker en bevredigender maken.

**Scope:** B08, B10, B12 en gerichte submit/reject/landing-verbeteringen.

**Bestanden/systemen:** `public/app.mjs`, `public/presentation.mjs`,
`public/style.css`, `public/sound.mjs` en testscripts.

**Acceptatiecriteria:**

- Na submit is onmiddellijk zichtbaar of de invoer ontvangen is.
- Reject, correction, miss en accepted answer hebben elk een unieke begrijpelijke
  status voor beeld, geluid en screenreader.
- Score, tier en afstand zijn binnen één blik begrijpelijk.
- Reduced-motion en mute blijven gerespecteerd.
- Mobile keyboard en short viewport houden prompt, timer, input en submit bereikbaar.

**Teststrategie:** Playwright op 360×800, 390×844, 844×390 en desktop; audio
audit; focus/Enter/Escape; reduced-motion check.

**Complexiteit:** medium. **Risico:** te veel animatie/tekst kan de kern vertragen;
behoud bestaande timing.

## Fase 3 — Nederlandse identiteit

**Doel:** de wereld laten voelen als één Nederlandse kanaal-naar-oceaanwereld.

**Scope:** B11 en de eerste art-direction enhancements.

**Bestanden/systemen:** bestaande `public/ocean.mjs`, bestaande assets,
`src/content/guide-nl.mjs` en eventueel kleine versie-assets.

**Acceptatiecriteria:**

- Maximaal enkele nieuwe details; geen nieuwe zone of gameplaymechanic.
- Waterlijn, bicycle, boat en underwater renderer blijven op dezelfde coördinaten.
- Nieuwe art gebruikt dezelfde pixelgrid, kleur- en reduced-motionregels.
- Voor/na-screenshots bestaan voor desktop, portrait en landscape mobile.

**Teststrategie:** `npm run test:art`, responsive screenshots, waterline inspection,
performance smoke test en console/network check.

**Complexiteit:** medium. **Risico:** decoratie mag promptkaart en leesbaarheid
niet hinderen.

## Fase 4 — Replayability met beperkte complexiteit

**Doel:** terugkeer aantrekkelijker maken zonder agressieve retentie.

**Scope:** B09, B13 en eventueel B14.

**Bestanden/systemen:** content schema/bank, daily selection, local logbook,
docs en tests; alleen migreren als echte persistentie nodig is.

**Acceptatiecriteria:**

- Bestaande daily/practice-runs blijven reproduceerbaar.
- Nederlandse en Engelse content blijven gescheiden.
- Thema’s veranderen tier-score of answer validation niet stilzwijgend.
- Geen currency, betaalmuur, agressieve notifications of punitive streaks.
- Minimaal één volledige weekrotatie is getest in beide talen.

**Teststrategie:** content-schema tests, seed/replay tests, seven-round browser
flow, uitsluitend lokale DB-migratietest en regressiesuite.

**Complexiteit:** medium/high. **Risico:** contentonderhoud wordt bottleneck;
toon eerst redactionele capaciteit aan.

## Fase 5 — Premium polish

**Doel:** optionele atmosfeer en shareability verfijnen.

**Scope:** B15–B16 en alleen de meest waardevolle onderdelen van de grote ideeën.

**Bestanden/systemen:** presentation, sound, static share rendering en docs.

**Acceptatiecriteria:**

- Audio is optioneel en muteable.
- Share-output bevat geen antwoorden, private identifiers of spelerdata.
- Nieuwe effecten hebben low-power en reduced-motion varianten.
- Performance blijft stabiel op de mobile matrix.

**Teststrategie:** audio/art/browser audits, screenshot diff, privacy review en
mobile performance check.

**Complexiteit:** medium/high. **Risico:** polish verdringt contentkwaliteit;
alleen uitvoeren na fase 1–4.

## Eerst bouwen

1. Locale catalogus en SSR/client-consistentie.
2. Correction/reject-flow met Nederlandse fairness-copy.
3. Contentreview- en testlaag voor de Nederlandse bank.

Deze volgorde pakt de grootste bewezen problemen aan zonder renderer, score of
database-architectuur onnodig te destabiliseren.

## Niet bouwen

- Geen volledige rendererrewrite; de bestaande canvasarchitectuur is functioneel.
- Geen algemene AI- of woordenboekvalidatie; dat vermindert reproduceerbaarheid.
- Geen accounts, currencies, betaalde unlocks of agressieve streakmechanics.
- Geen aparte mobiele background tenzij de gecontroleerde crop aantoonbaar tekortschiet.
- Geen leaderboard voordat privacy, anonimiteit en populatie betekenisvol zijn.
