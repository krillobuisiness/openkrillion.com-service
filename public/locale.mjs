// Shared player-facing interface copy. This module is intentionally free of
// DOM, Worker and Node-only APIs so SSR and the browser use the same source.
export const DEFAULT_LOCALE = 'en';
export const SUPPORTED_LOCALES = ['en', 'nl'];

const COMMON = {
  brand: 'OPENKRILLION',
  title: 'FIETSDUIK',
  dayPrefix: 'DUIK #',
  scoreUnit: 'punten',
  depthUnit: 'm',
};

export const CATALOG = {
  en: {
    ...COMMON,
    page: { title: 'FIETSDUIK — the daily dive', description: 'Seven prompts. Twenty-five seconds. An ocean of possible answers.' },
    aria: {
      game: 'FIETSDUIK daily word game',
      canvas: 'Animated pixel ocean; depth increases downward',
      menuOpen: 'Open menu', menuClose: 'Close menu', muteOn: 'Turn sound on', muteOff: 'Turn sound off',
      settingsOpen: 'Open settings', buddyOpen: 'Choose dive buddy', buddyTap: 'Tap your dive buddy',
      mascotTitle: 'A friend', prompt: 'Question', progress: 'Dive progress', results: 'Dive results',
      timeLeft: 'Time remaining', reviewAnswers: 'Search accepted answers', rateDive: 'Rate your dive',
      footer: 'Site footer', guide: 'Guide contents',
    },
    hero: { openLabel: 'KRILLION · OPEN SOURCE', tagline: 'THE DAILY DIVE', subline: '7 prompts · 25 seconds per prompt · rarer answers sink deeper' },
    intro: {
      howTo: 'HOW TO PLAY', rules: ['7 prompts each day. The same for everyone.', '25 seconds to give one answer.', 'Rare answers score high. Obvious answers stay near the surface.', 'Each point takes you 10 metres deeper. 700 is the trench.', 'One daily dive. Practice is always available.'],
      privacy: 'Privacy', guideLink: 'Guide & AI documents', begin: '▼ BEGIN DESCENT ▼', day: 'DIVE …', logbook: 'LOGBOOK ⟲', guide: 'GUIDE', practice: 'PRACTICE ∞', sample: 'Sample prompts · reference unavailable',
    },
    hud: { depth: 'DEPTH', score: 'SCORE', surface: 'SURFACE', prompt: 'PROMPT', round: 'ROUND', completed: 'DIVE COMPLETE' },
    landmarks: [[60,'light begins to fade','L'],[200,'most sunlight stops here','R'],[332,'deepest scuba dive ever — 332 m','R'],[385,'sperm whales hunt below here','L'],[535,'emperor penguins dive this deep','R'],[660,'pressure: 67x the surface','L'],[800,'siphonophore drift zone','R'],[1040,'THE MIDNIGHT ZONE','L'],[1240,'anglerfish territory','R'],[1550,'sperm whales duel giant squid here','L'],[1850,'giant squid territory','R'],[2150,'colossal squid eyes: football-sized','L'],[2500,'the water is 2°C and utterly black','R'],[3000,'THE ABYSSAL ZONE','L'],[3800,'the Titanic rests here — 3,800 m','R'],[4400,'cusk eels patrol the plain','L'],[4900,'the abyssal plain stretches out','R'],[5500,'deeper than most submarines survive','L'],[6000,'THE HADAL ZONE','R'],[6500,'named for Hades. fitting.','L'],[7000,'the trench floor — a perfect dive ends here','R']],
    tiers: { plankton: { name: 'Plankton', blurb: 'The answer everyone shouts first.' }, tooclever: { name: 'Too clever', blurb: 'The obscure answer the whole class thought of.' }, schooler: { name: 'Schooler', blurb: 'Strong — you are swimming with the school.' }, rare: { name: 'Rare', blurb: 'An unusual answer. Good catch.' }, deepcut: { name: 'Deep cut', blurb: 'True obscurity. Few dive this far.' }, krillion: { name: 'One in a krillion', blurb: 'The chosen pearl. All the way down.' } },
    prompt: { hint: '▼ rarer answers sink deeper ▼', preview: 'the dive begins in', answerPlaceholder: 'type one answer…', submit: 'SUBMIT', descend: 'DESCEND ▼', surface: 'TO THE SURFACE ▲', noLanding: 'NOTHING FOUND', correction: 'Did you mean', correctionHint: 'submit again to confirm · or edit it', rejected: 'No match. Try another answer.' },
    menu: { title: 'Menu', rule: 'DIVE IN', daily: '↓ Daily dive', practice: '∞ Practice dive', logbook: '⟲ My logbook', guide: '? Krillion guide', settings: '⚙ Settings', source: '⌘ Open source ↗', about: 'About this site', privacy: 'Privacy', signoff: 'one in a krillion.' },
    settings: { title: 'Settings', interface: 'Interface language', interfaceHelp: 'The language of buttons, prompts and feedback.', answer: 'Answer language', answerHelp: 'The word bank used to check your answers.', lowPower: 'Low-power mode', lowPowerHelp: 'Less decoration and fewer background animations.', colorblind: 'Colour-blind mode', colorblindHelp: 'Brighter text and clearer tier distinctions.', corrections: 'Answer corrections', correctionsHelp: 'Show a suggested correction before scoring it.', clearRejected: 'Clear rejected answers', clearRejectedHelp: 'Clear the field after a rejected answer.', shareLink: 'Share link', shareLinkHelp: 'Add an openkrillion.com link to shared results.', history: 'My logbook', historyButton: 'My dives →', localStorage: 'Saved in this browser. No account needed.', close: 'Close settings' },
    buddy: { title: 'Dive buddy', help: 'Earn buddies with your best daily streak.', unlocked: 'Unlocked', streak: 'day streak', close: 'Close dive buddy', names: { krill: 'Dutch bicycle', schooler: 'Schooler', rare: 'Rare squid', deepcut: 'Deep-sea anglerfish', evil: 'Angry krill' } },
    logbook: { eyebrow: 'YOUR DIVE LOGBOOK', title: 'My OpenKrillion', export: 'Export my history ↓', help: 'Daily dives extend your streak. Practice dives do not.', current: 'Current streak', bestStreak: 'Best streak', daily: 'Daily dives', best: 'Best daily score', first: 'Your first dive starts your logbook.', practice: 'practice', dailyMode: 'daily' },
    guide: { toggle: 'Krillion guide & AI documents', close: 'Close guide', eyebrow: 'OPENKRILLION · THE DIVER’S HANDBOOK', title: 'Krillion: the complete dive guide', lead: 'Seven prompts. Twenty-five seconds. An ocean of possible answers.', contents: 'Guide contents', questions: 'Quick questions', faq: ['Is OpenKrillion the official Krillion game?', 'Can I play Krillion without paying?', 'Do my settings and scores sync across devices?'], faqAnswers: ['No. This is an independent open-source implementation. The original game is at krillion.io.', 'Yes. This release has free daily and practice games, no checkout and no credit system.', 'No account sync is offered. Your browser stores a local history copy; this service resumes dives using a random browser identifier.'] },
    results: { practicePrefix: 'Practice · ', completed: 'Dive complete', depth: 'depth', ruleLog: 'DIVE LOG · DEEPER = RARER', ruleBearing: 'THE BEARING', ruleCatch: 'THE CATCH · TAP A ROUND FOR EVERY ANSWER', ruleLogbook: 'LOGBOOK', copy: 'Copy result', copied: 'Copied ✓', share: 'Share…', practice: 'KEEP DIVING ∞', logbook: 'LOGBOOK ⟲', guide: 'GUIDE & DOCS →', suggestionLabel: 'Have an idea for a prompt? Tell us what to ask.', suggestionPlaceholder: 'name a type of cloud…', suggestionSubmit: 'submit', suggestionThanks: 'Thanks — noted.', rating: 'How was that dive? 1 = poor · 5 = great', ratingGroup: 'Rate your dive', loading: 'Sounding this ocean’s depths…', scoreNeeded: 'YOUR SCORE · MORE DAILY DIVES NEEDED FOR COMPARISON', unavailable: 'Comparison temporarily unavailable. Your score is saved.', betterThan: 'BETTER THAN', otherDivers: 'OTHER OPENKRILLION DIVERS', acceptedSearch: 'search {count} accepted answers…', you: 'YOU', nextDive: 'next dive in' },
    footer: { tagline: 'one in a krillion. Open source. Open ocean.', source: 'Open source. Open ocean.', bug: 'Report a bug', privacy: 'Privacy', about: 'About', independent: 'An independent Krillion-inspired game. Not affiliated with krillion.io.', back: '← BACK TO THE DIVE' },
    agent: { title: 'AI & Agent Docs', description: 'Read this site’s actual game, pricing and capability notes. These external links prefill a question; answers and citations are not guaranteed.', docs: 'AI reference documents', ask: 'ask about OpenKrillion in English', languages: 'Nederlands · 中文问答与说明' },
    errors: { signal: 'The signal is temporarily lost. Try again.', resume: 'Could not resume. Open the menu again and try once more.', invalid: 'Invalid request.', unknown: 'Unknown endpoint.', notFound: 'No active dive found in this browser.', diveNotFound: 'Dive not found.', reviewLocked: 'Finish your dive before reviewing the answers.', paused: 'Close the menu to resume your dive.', tooMany: 'Too many requests. Take a breath and try again.', tooLarge: 'That request is too large.', method: 'Method not allowed.', reference: 'Reference service unavailable.', answerNotOpen: 'The answer window is not open yet.', startDive: 'Start a dive first.', feedbackEmpty: 'Enter a message.', feedbackLimit: 'Thanks — that is enough feedback for today.' },
    info: {
      privacyTitle: 'OpenKrillion Privacy — Krillion Game Data', aboutTitle: 'About OpenKrillion — Open-Source Krillion Game', back: '← BACK TO THE DIVE',
      privacyIntro: 'This independent game can be played without an account. We use a random browser identifier, not a name or email, to resume a dive. This page describes the implemented service.',
      privacySections: [['Game progress', 'Preferences, draft answers and a copy of completed history are stored locally in your browser. The server stores your random identifier, game date, accepted answers, scores and round timing in Cloudflare D1. Clearing browser storage removes the local copy and identifier. There is no cross-device login or account sync.'], ['Statistics and feedback', 'Daily score comparisons use completed daily games on OpenKrillion. Practice scores are excluded. Voluntary ratings and suggestions are saved if submitted; do not include personal information.'], ['Analytics', 'This site uses Plausible, Google Analytics 4 and Microsoft Clarity when their production integrations are enabled. They measure page visits, game events and site usability. Clarity is configured to mask typed input; answer text is not attached to analytics events. Analytics scripts are disabled on localhost and automated test runs.'], ['Hosting and references', 'Cloudflare hosts the application and D1 database. R2 stores assets and reference puzzle snapshots. Public reference categories and answer lists may be synchronized from krillion.io. No user answers are sent to that reference service.'], ['Cookies', 'The essential ok_player cookie is HttpOnly, SameSite=Lax and Secure on HTTPS. It identifies a browser’s game history. Third-party analytics may use their own storage and cookies.'], ['Retention and requests', 'Game records are retained for history and statistics. Rate-limit records are short-lived. For a data request, open a repository issue without posting personal information; arrange private details separately. We do not sell player records.'], ['External AI links', 'AI icons open third-party services with a public product question. Opening them shares that question with the selected provider. No game answer, identifier or private history is included.']],
      aboutIntro: 'OpenKrillion is an independent open-source Krillion-inspired daily trivia game. It is not affiliated with, endorsed by, or operated by the original Krillion creator.',
      aboutSections: [['Seven answers. One ocean.', 'The implemented game includes a seven-round daily dive, practice, prepared rarity tiers, an animated descent, browser-synthesized sound effects, a results report, answer review and a local logbook.'], ['Open source', 'The complete runnable application code is published under MIT. Credentials, production player data and deployment account bindings are excluded. The sample bank is independently assembled; runtime reference snapshots are not granted a new license by this code repository.'], ['Reference data', 'When available, published daily categories and prepared answer tiers are synchronized from public reference endpoints, cached in this service’s D1 database, and used for local answer validation. Aliases and correction behavior may differ. If synchronization is unavailable, a clearly identified sample practice bank keeps the game playable. Player distributions are computed from this site’s own games.'], ['Current scope', 'Daily and practice modes are free in this release. Themed packs, paid unlocks, user accounts and multiplayer are not implemented. The AI documentation lists the actual current capabilities.']],
      aboutLink: 'Explore the source on GitHub ↗',
    },
  },
  nl: {
    ...COMMON,
    page: { title: 'FIETSDUIK — de dagelijkse duik', description: 'Zeven vragen. Vijfentwintig seconden. Een oceaan vol mogelijke antwoorden.' },
    aria: {
      game: 'FIETSDUIK dagelijkse woordgame', canvas: 'Geanimeerde pixel-oceaan; de diepte neemt naar beneden toe',
      menuOpen: 'Menu openen', menuClose: 'Menu sluiten', muteOn: 'Geluid aanzetten', muteOff: 'Geluid uitzetten', settingsOpen: 'Instellingen openen', buddyOpen: 'Duikmaatje kiezen', buddyTap: 'Geef je duikmaatje een tikje', mascotTitle: 'Een vriend', prompt: 'Vraag', progress: 'Duikvoortgang', results: 'Duikuitslag', timeLeft: 'Tijd over', reviewAnswers: 'Geaccepteerde antwoorden zoeken', rateDive: 'Beoordeel je duik', footer: 'Sitefooter', guide: 'Inhoud van de uitleg',
    },
    hero: { openLabel: 'KRILLION · OPEN SOURCE', tagline: 'DE DAGELIJKSE DUIK', subline: '7 vragen · 25 seconden per vraag · zeldzame antwoorden zakken dieper' },
    intro: {
      howTo: 'ZO SPEEL JE', rules: ['7 vragen per dag. Voor iedereen hetzelfde.', '25 seconden om één antwoord te geven.', 'Zeldzame antwoorden scoren hoog. Voor de hand liggende blijven drijven.', 'Elk punt brengt je 10 meter dieper. 700 is de trog.', 'Eén dagelijkse duik. Oefenen kan altijd.'],
      privacy: 'Privacy', guideLink: 'Uitleg & AI-documenten', begin: '▼ DUIK NAAR BENEDEN ▼', day: 'DUIK …', logbook: 'LOGBOEK ⟲', guide: 'UITLEG', practice: 'OEFENEN ∞', sample: 'Voorbeeldvragen · referentie niet beschikbaar',
    },
    hud: { depth: 'DIEPTE', score: 'SCORE', surface: 'OPPERVLAK', prompt: 'VRAAG', round: 'RONDE', completed: 'DUIK VOLTOOID' },
    landmarks: [[60,'het licht begint te vervagen','L'],[200,'het meeste zonlicht stopt hier','R'],[332,'diepste duik ooit — 332 m','R'],[385,'potvissen jagen hier beneden','L'],[535,'keizerspinguïns duiken zo diep','R'],[660,'druk: 67 keer het oppervlak','L'],[800,'zweefzone van de reuzensnoer','R'],[1040,'DE MIDDERNACHTZONE','L'],[1240,'gebied van de zeeduivel','R'],[1550,'potvissen vechten hier met reuzeninktvissen','L'],[1850,'gebied van de reuzeninktvis','R'],[2150,'ogen zo groot als voetballen','L'],[2500,'het water is 2 °C en pikdonker','R'],[3000,'DE ABYSSALE ZONE','L'],[3800,'de Titanic rust hier — 3.800 m','R'],[4400,'de slanke draakvissen patrouilleren','L'],[4900,'de abyssale vlakte strekt zich uit','R'],[5500,'dieper dan de meeste duikboten komen','L'],[6000,'DE HADALZONE','R'],[6500,'vernoemd naar Hades. Logisch.','L'],[7000,'de bodem van de trog — duik geslaagd','R']],
    tiers: { plankton: { name: 'Plankton', blurb: 'Het antwoord dat iedereen meteen roept.' }, tooclever: { name: 'Te slim', blurb: 'Het obscure antwoord waar de hele klas aan dacht.' }, schooler: { name: 'Schoolvis', blurb: 'Sterk — je zwemt met de school mee.' }, rare: { name: 'Zeldzaam', blurb: 'Een ongewoon antwoord. Goed gezien.' }, deepcut: { name: 'Diepe snede', blurb: 'Echte obscuriteit. Weinigen komen zo diep.' }, krillion: { name: 'Eén op een krillion', blurb: 'De aangewezen parel. Tot op de bodem.' } },
    prompt: { hint: '▼ zeldzamere antwoorden zakken dieper ▼', preview: 'de duik begint over', answerPlaceholder: 'typ één antwoord…', submit: 'STUUR IN', descend: 'DAAL AF ▼', surface: 'NAAR HET OPPERVLAK ▲', noLanding: 'NIETS GEVONDEN', correction: 'Bedoelde je', correctionHint: 'stuur opnieuw in om te bevestigen · of pas aan', rejected: 'Geen match. Probeer een ander antwoord.' },
    menu: { title: 'Menu', rule: 'DUIK ERIN', daily: '↓ Dagelijkse duik', practice: '∞ Oefenduik', logbook: '⟲ Mijn logboek', guide: '? Krillion-uitleg', settings: '⚙ Instellingen', source: '⌘ Open-sourcecode ↗', about: 'Over deze site', privacy: 'Privacy', signoff: 'één op een krillion.' },
    settings: { title: 'Instellingen', interface: 'Interface-taal', interfaceHelp: 'De taal van knoppen, vragen en feedback.', answer: 'Antwoordtaal', answerHelp: 'De woordbank waartegen je antwoorden worden gecontroleerd.', lowPower: 'Energiebesparende modus', lowPowerHelp: 'Minder decoratie en minder achtergrondanimaties.', colorblind: 'Kleurenblindmodus', colorblindHelp: 'Helderdere tekst en duidelijker onderscheiden niveaus.', corrections: 'Antwoordcorrecties', correctionsHelp: 'Toon een voorgestelde correctie voordat die wordt gescoord.', clearRejected: 'Afgewezen antwoorden wissen', clearRejectedHelp: 'Maak het antwoordveld leeg na een misser.', shareLink: 'Deellink', shareLinkHelp: 'Voeg een openkrillion.com-link toe aan gedeelde uitslagen.', history: 'Jouw logboek', historyButton: 'Mijn duiken →', localStorage: 'Op deze browser opgeslagen. Geen account nodig.', close: 'Instellingen sluiten' },
    buddy: { title: 'Duikmaatje', help: 'Verdien maatjes met je beste dagelijkse reeks.', unlocked: 'Vrijgespeeld', streak: 'dagenreeks', close: 'Duikmaatje sluiten', names: { krill: 'Nederlandse fiets', schooler: 'Schoolvis', rare: 'Zeldzame inktvis', deepcut: 'Diepzeehengelvis', evil: 'Boze krill' } },
    logbook: { eyebrow: 'JOUW DUIKLOGBOEK', title: 'Mijn OpenKrillion', export: 'Exporteer mijn geschiedenis ↓', help: 'Dagelijkse duiken verlengen je reeks. Oefenduiken niet.', current: 'Huidige reeks', bestStreak: 'Beste reeks', daily: 'Dagelijkse duiken', best: 'Beste dagscore', first: 'Je eerste duik begint je logboek.', practice: 'oefenen', dailyMode: 'dagelijks' },
    guide: { toggle: 'Krillion-uitleg & AI-documenten', close: 'Uitleg sluiten', eyebrow: 'OPENKRILLION · HET DUIKERSHANDBOEK', title: 'Krillion: de complete duikgids', lead: 'Zeven vragen. Vijfentwintig seconden. Een oceaan vol mogelijke antwoorden.', contents: 'Inhoud van de uitleg', questions: 'Veelgestelde vragen', faq: ['Is OpenKrillion de officiële Krillion-game?', 'Kan ik Krillion gratis spelen?', 'Worden mijn instellingen en scores gesynchroniseerd?'], faqAnswers: ['Nee. Dit is een zelfstandig open-sourceproject. De originele game staat op krillion.io.', 'Ja. Deze versie biedt gratis dagelijkse duiken en oefenen, zonder betaalmuur of credits.', 'Nee. Er is geen accountsynchronisatie. Je browser bewaart een lokale geschiedenis en hervat duiken via een willekeurige browsercode.'] },
    results: { practicePrefix: 'Oefenen · ', completed: 'Duik voltooid', depth: 'diepte', ruleLog: 'DUIKLOG · DIEPER = ZELDZAMER', ruleBearing: 'DE KOERS', ruleCatch: 'DE VANGST · TIK OP EEN RONDE VOOR ELK ANTWOORD', ruleLogbook: 'LOGBOEK', copy: 'Kopieer uitslag', copied: 'Gekopieerd ✓', share: 'Delen…', practice: 'VERDER OEFENEN ∞', logbook: 'LOGBOEK ⟲', guide: 'UITLEG & DOCS →', suggestionLabel: 'Heb je een idee voor een vraag? Laat het weten.', suggestionPlaceholder: 'noem een soort wolk…', suggestionSubmit: 'verstuur', suggestionThanks: 'Bedankt — genoteerd.', rating: 'Hoe was deze duik? 1 = matig · 5 = geweldig', ratingGroup: 'Beoordeel je duik', loading: 'De diepte van je antwoorden wordt bepaald…', scoreNeeded: 'JE SCORE · MEER DAGELIJKSE DUIKEN NODIG VOOR VERGELIJKING', unavailable: 'Vergelijking tijdelijk niet beschikbaar. Je score is opgeslagen.', betterThan: 'BETER DAN', otherDivers: 'ANDERE OPENKRILLION-DUIKERS', acceptedSearch: 'zoek in {count} antwoorden…', you: 'JIJ', nextDive: 'volgende duik over' },
    footer: { tagline: 'één op een krillion. Open source. Open oceaan.', source: 'Open source. Open oceaan.', bug: 'Meld een probleem', privacy: 'Privacy', about: 'Over', independent: 'Een zelfstandig, op Krillion geïnspireerd spel. Niet verbonden aan krillion.io.', back: '← TERUG NAAR DE DUIK' },
    agent: { title: 'AI- en agentdocumenten', description: 'Lees wat deze site echt kan, kost en ondersteunt. Externe links vullen alleen een openbare vraag vooraf in; antwoorden en bronverwijzingen zijn niet gegarandeerd.', docs: 'AI-referentiedocumenten', ask: 'stel een vraag over OpenKrillion', languages: 'English · 中文问答与说明' },
    errors: { signal: 'Het signaal is tijdelijk weggevallen. Probeer het opnieuw.', resume: 'Hervatten lukt niet. Open het menu opnieuw en probeer het nog eens.', invalid: 'Ongeldig verzoek.', unknown: 'Onbekend eindpunt.', notFound: 'Geen actieve duik gevonden op deze browser.', diveNotFound: 'Duik niet gevonden.', reviewLocked: 'Maak je duik af voordat je de antwoorden bekijkt.', paused: 'Sluit het menu om je duik te hervatten.', tooMany: 'Te veel verzoeken. Adem even uit en probeer het opnieuw.', tooLarge: 'Het verzoek is te groot.', method: 'Methode niet toegestaan.', reference: 'Referentieservice niet beschikbaar.', answerNotOpen: 'Het antwoordvenster is nog niet geopend.', startDive: 'Begin eerst aan een duik.', feedbackEmpty: 'Vul een bericht in.', feedbackLimit: 'Bedankt — genoeg feedback voor vandaag.' },
    info: {
      privacyTitle: 'Privacy bij OpenKrillion — gamegegevens', aboutTitle: 'Over OpenKrillion — open-source Krillion-game', back: '← TERUG NAAR DE DUIK',
      privacyIntro: 'Je kunt dit zelfstandige spel zonder account spelen. We gebruiken een willekeurige browsercode, geen naam of e-mailadres, om een duik te hervatten. Op deze pagina staat wat de service echt doet.',
      privacySections: [['Spelvoortgang', 'Voorkeuren, conceptantwoorden en een kopie van afgeronde duiken worden lokaal in je browser opgeslagen. De server bewaart je willekeurige code, speldatum, geaccepteerde antwoorden, scores en rondetijden in Cloudflare D1. Wis je browseropslag, dan verdwijnen de lokale kopie en code. Er is geen account- of apparaatsynchronisatie.'], ['Statistieken en feedback', 'Dagelijkse scorevergelijkingen gebruiken afgeronde dagelijkse duiken op OpenKrillion. Oefenscores tellen niet mee. Vrijwillige beoordelingen en suggesties worden opgeslagen wanneer je ze instuurt; zet er geen persoonlijke informatie in.'], ['Analytics', 'Deze site gebruikt Plausible, Google Analytics 4 en Microsoft Clarity wanneer de productie-integraties zijn ingeschakeld. Ze meten bezoeken, game-events en gebruiksgemak. Clarity maskeert getypte tekst; antwoorden worden niet aan analytics-events gekoppeld. Op localhost en in geautomatiseerde tests staan analytics uit.'], ['Hosting en referenties', 'Cloudflare host de applicatie en D1-database. R2 bewaart assets en referentiepuzzels. Openbare categorieën en antwoordlijsten kunnen van krillion.io worden gesynchroniseerd. Antwoorden van spelers worden niet naar die referentieservice gestuurd.'], ['Cookies', 'De essentiële ok_player-cookie is HttpOnly, SameSite=Lax en op HTTPS Secure. Hij koppelt een browser aan zijn spelgeschiedenis. Analyticspartijen kunnen eigen opslag en cookies gebruiken.'], ['Bewaren en verzoeken', 'Spelrecords worden bewaard voor geschiedenis en statistieken. Rate-limitrecords zijn kortstondig. Open voor een dataverzoek een issue zonder persoonlijke informatie te plaatsen; regel privégegevens apart. We verkopen geen spelerrecords.'], ['Externe AI-links', 'AI-iconen openen externe diensten met een openbare productvraag. Die vraag wordt gedeeld met de gekozen aanbieder. Geen gameantwoord, identificatiecode of privégeschiedenis wordt meegestuurd.']],
      aboutIntro: 'OpenKrillion is een zelfstandig open-source spel, geïnspireerd door Krillion. Het is niet verbonden aan, goedgekeurd door of beheerd door de oorspronkelijke maker.',
      aboutSections: [['Zeven antwoorden. Eén oceaan.', 'Deze versie bevat een dagelijkse duik van zeven rondes, oefenen, vaste zeldzaamheidsniveaus, een geanimeerde afdaling, geluiden uit de browser, een uitslag, antwoordreview en een lokaal logboek.'], ['Open source', 'De volledige uitvoerbare code staat onder de MIT-licentie gepubliceerd. Inloggegevens, productiegegevens van spelers en infrastructuurgeheimen zijn uitgesloten. De voorbeeldbank is zelfstandig samengesteld; runtime-referenties krijgen via deze repository geen nieuwe licentie.'], ['Referentiegegevens', 'Wanneer beschikbaar worden openbare categorieën en voorbereide antwoordniveaus van krillion.io gesynchroniseerd, in deze D1-database opgeslagen en gebruikt voor lokale antwoordcontrole. Aliassen en correcties kunnen verschillen. Als synchronisatie niet beschikbaar is, blijft een duidelijk gemarkeerde voorbeeldbank het spel speelbaar. Verdelingen worden uit eigen spellen berekend.'], ['Huidige scope', 'Dagelijkse duiken en oefenen zijn gratis. Thema-pakketten, betaalde unlocks, accounts en multiplayer zijn niet geïmplementeerd. De AI-documentatie beschrijft de echte mogelijkheden.']],
      aboutLink: 'Bekijk de broncode op GitHub ↗',
    },
  },
};

Object.assign(CATALOG.en.errors, {
  editionUnavailable: 'This dive’s content version is missing or damaged. It cannot be replaced. Contact the local editor.',
  editionLanguage: 'This edition uses a different answer language. Open the preview link supplied by the editor.',
  editionPreviewDisabled: 'Content previews are only available in local development.',
  editionPractice: 'Content previews can only be played in practice mode.',
});
Object.assign(CATALOG.nl.errors, {
  editionUnavailable: 'De inhoudsversie van deze duik ontbreekt of is beschadigd. We vervangen de vragen niet. Neem contact op met de lokale redacteur.',
  editionLanguage: 'Deze editie gebruikt een andere antwoordtaal. Open de voorbeeldlink van de redacteur.',
  editionPreviewDisabled: 'Conceptedities zijn alleen beschikbaar in de lokale ontwikkelomgeving.',
  editionPractice: 'Conceptedities kun je alleen in de oefenstand spelen.',
});

// Prompt copy is interface text, while the answer banks remain in their
// language-specific content modules. Keeping the prompt map here lets SSR and
// the browser make the same choice without translating answer data.
const PROMPT_NL = new Map([
  ['Name a way to prepare potatoes', 'Noem een manier om aardappelen te bereiden'],
  ['Name an animal whose name is exactly four letters long', 'Noem een diernaam van precies vier letters'],
  ['Name someone who has won an NBA Most Valuable Player award', 'Noem iemand die de NBA-prijs voor Most Valuable Player heeft gewonnen'],
  ['Name a chemical element whose symbol is one letter', 'Noem een scheikundig element met een symbool van één letter'],
  ['Name a type of station', 'Noem een soort station'],
  ['Name a country whose English name ends in the letter E', 'Noem een land waarvan de Engelse naam eindigt op de letter E'],
  ['Name a superhero team', 'Noem een superheldenteam'],
]);
CATALOG.en.prompts = new Map([...PROMPT_NL].map(([en]) => [en, en]));
CATALOG.nl.prompts = PROMPT_NL;

function flatten(value, prefix = '', result = {}) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, path, result);
    else result[path] = child;
  }
  return result;
}

export function localeOf(value) { return SUPPORTED_LOCALES.includes(value) ? value : DEFAULT_LOCALE; }
export function getLocale(value) { return CATALOG[localeOf(value)]; }
export function translate(locale, key) {
  const requested = flatten(getLocale(locale)), fallback = flatten(CATALOG[DEFAULT_LOCALE]);
  if (Object.hasOwn(requested, key)) return requested[key];
  if (Object.hasOwn(fallback, key)) return fallback[key];
  return `[missing:${key}]`;
}
export function missingTranslations(locale) {
  const requested = flatten(getLocale(locale)), fallbackKeys = Object.keys(flatten(CATALOG[DEFAULT_LOCALE]));
  return fallbackKeys.filter(key => !Object.hasOwn(requested, key));
}
