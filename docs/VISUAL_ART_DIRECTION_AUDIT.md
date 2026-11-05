# FIETSDUIK — visuele, game-feel- en art-direction-audit

## Huidige identiteit

De ervaring combineert CRT-scanlines, VT323-pixeltypografie, Amsterdamse
canal-art, een Nederlandse fietsmascot en een afdaling naar een donkere
procedurele oceaan. Dat is een herkenbare 80–90% bestaande identiteit waarop
kleine, gerichte verbeteringen kunnen voortbouwen.

## Renderingarchitectuur

- [`public/ocean.mjs:10`](../public/ocean.mjs#L10) bezit canvasloop, camera en
  fase-state.
- [`public/ocean.mjs:21`](../public/ocean.mjs#L21) tekent op halve canvasresolutie
  met `imageSmoothingEnabled=false`; dit ondersteunt scherpe pixelranden.
- [`public/seascape.mjs:35`](../public/seascape.mjs#L35) maakt 384×688 procedurele
  lagen en schaalt die naar de beschikbare breedte.
- `Ocean.drawHomeBackground()` gebruikt de Amsterdam-background boven de
  waterlijn en de bestaande seascape/particles eronder.
- De portrait-crop gebruikt height-based scaling en bronwaterlijnratio `590/724`.
- De fiets staat als onafhankelijk HTML-element in
  [`src/html.mjs:25`](../src/html.mjs#L25); `public/ocean.mjs` en
  [`public/app.mjs:34`](../public/app.mjs#L34) sturen positie en gedrag.

## Bevestigde sterke punten

### Pixelkwaliteit

Halve canvasresolutie, `imageSmoothingEnabled=false` en `image-rendering:
pixelated` voorkomen de meest storende blur. `npm run test:art` controleerde 22
states met nul errors.

### Atmosfeer en feedback

De oceaan bevat scanline-compatibele dieptekleuren, bubbles, fish, freshwater
hints, orange bioluminescence, particles en landmarktekst. De descent koppelt
diepte direct aan antwoordfeedback. `npm run test:audio` controleerde 15 events,
mute en clipping zonder fout.

### Nederlandse identiteit

De Amsterdamse panorama, fiets, kanaal/waterlijn, freshwater-details en oranje
accenten vormen samen een herkenbare identiteit. Boot en fiets blijven
onafhankelijk van de backgroundlaag, wat toekomstige art-varianten mogelijk maakt.

## Bevestigde aandachtspunten

### P1 — semantische brandnaam wisselt

De homepage toont `FIETSDUIK`, terwijl h1-label en resultaten nog
`OpenKrillion`/`OPENKRILLION` noemen (`src/html.mjs:23`, `public/app.mjs:100`).
Dat kan bewust zijn als OpenKrillion projectnaam is, maar het onderscheid moet
expliciet worden gemaakt voor spelers en screenreaders.

### P1 — portrait-background is bewust gecropt

Een 2172×724 panorama kan op 390px niet volledig zichtbaar blijven én de huizen
leesbaar houden. De huidige oplossing bewaart de verhouding, maar bridge,
houseboat en alle gevels zijn niet altijd tegelijk zichtbaar. Geen tweede mobile
illustratie introduceren zonder art-besluit; gecontroleerde crop is nu
onderhoudbaar.

### P2 — canvas en DOM hebben verschillende lagen

Scorekaart, prompt, answer dock, mascot, boat en canvas worden onafhankelijk
getekend. Dat is flexibel maar maakt waterlijn- en z-index-regressies mogelijk.
Nieuwe decoratie moet daarom per fase en viewport getest worden, niet alleen als
homepage-screenshot.

### P2 — kleurdefinities zijn historisch gegroeid

`public/style.css` bevat legacy `--pink`-regels en latere neon-orange overrides.
De cascade werkt, maar onderhouders moeten meerdere regels lezen. Dit is een
code-qualityprobleem, geen acute visuele bug.

## Game-feel beoordeling

| Moment | Huidige ervaring | Advies |
| --- | --- | --- |
| Start | Sound cue, camera activeert, preview begint | Behouden; maak “3 seconden preview” expliciet. |
| Preview → antwoord | Timer en input verschijnen automatisch | Behouden; focus/keyboard blijven testen. |
| Submit | Submit-cue, typing particles, plunge | Sterk; voeg bij reject een korte reden toe. |
| Rarity reveal | Tier ladder, sound, shake, burst en score count | Sterk; onderscheid lage tiers subtieler. |
| Miss | Shake en korte miss sound | Laat duidelijk zien dat de ronde doorgaat. |
| Results | Chart, distribution, review, share en history | Veel inhoud; maak eerste scan mobiel compacter. |

## Tien Nederlandse identiteit-enhancements

1. **P1:** één terminologielijst voor “duik”, “ronde”, “zeldzaamheid” en
   “logboek”.
2. **P1:** redactioneel gevalideerde kanaalvondsten in de bestaande `seaLife`-laag.
3. **P1:** correction copy “Bedoelde je …?”.
4. **P2:** zeldzame Delftblauwe scherf als visuele depth-discovery.
5. **P2:** fietsbel- of waterklank bij de surface transition, optioneel.
6. **P2:** beperkte Nederlandse promptthema’s in weekrotatie.
7. **P2:** kort kanaalnotitie-moment in results zonder score-impact.
8. **P3:** seizoensvarianten met dezelfde backgroundarchitectuur.
9. **P3:** zachte mascotreaction bij een zeldzame vondst.
10. **P3:** Dutch result-card met dezelfde scoredata, zonder answers.

De beste eerste drie zijn 1, 2 en 3: directe taal/fairnesswinst zonder nieuwe
economie of grote rendererwijziging.

## Assetaanbevelingen

| Asset | Doel | Animatie | Impact | Complexiteit |
| --- | --- | --- | --- | --- |
| Delftblauwe scherf, 16–24 px | Zeldzame kanaalvondst | 2-frame glans | Medium | S |
| Reeds/freshwater plant variant | Nederlandse watercontext | 2–3 px sway | Medium | S/M |
| Fietsbel/water-plop cue | Surface identity | korte Web Audio ping | Low/medium | S |
| Compact result badge | Deelbare herkenning | statische pixelbadge | Medium | M |
| Mobile-safe canal crop | Belangrijk detail behouden | statische asset | Medium | M/L |

## Conclusie

Niet opnieuw ontwerpen. Behoud de huidige Amsterdamse background en underwater
wereld. Centraliseer kleuren en taal, voeg maximaal enkele discovery-details toe
en laat elk effect dezelfde pixelresolutie, contrastregels en reduced-motion
gedrag volgen.
