// Zelfstandige Nederlandse voorbeeldbank. Deze inhoud deelt geen antwoorden,
// aliassen of puzzelregels met de Engelse DEMO-bank.
const a = (answer, tier = 'plankton', aliases = []) => ({ answer, tier, aliases });
const prompt = (id, text, answers, extra = {}) => ({ id, text, language: 'nl', ...extra, answers });

export const DUTCH = {
  language: 'nl',
  dayNumber: 1,
  source: 'OpenKrillion Nederlandse voorbeeldbank',
  prompts: [
    prompt('nl-p1', 'Noem een manier waarop je aardappelen kunt bereiden', [
      a('gekookt'), a('gebakken'), a('gefrituurd'), a('gepureerd'), a('gepoft'), a('gestoomd'), a('gegrild'), a('geroosterd'),
      a('gestoofd', 'tooclever'), a('gesmoord', 'tooclever'), a('gegratineerd', 'schooler'), a('aardappelpuree', 'schooler'),
      a('stamppot', 'schooler'), a('hutspot', 'schooler'), a('rösti', 'schooler', ['rosti']), a('friet', 'schooler'), a('patat', 'schooler'),
      a('aardappelkoekjes', 'rare'), a('aardappelkroket', 'rare'), a('aardappelsalade', 'rare'), a('aardappelgratin', 'rare'),
      a('aardappelpartjes', 'rare'), a('aardappelchips', 'rare'), a('wafelfriet', 'deepcut'), a('twisterfriet', 'deepcut'),
      a('pommes duchesse', 'deepcut'), a('pommes noisette', 'deepcut'), a('pommes dauphine', 'deepcut'), a('hasselbackaardappel', 'deepcut'),
      a('blote billetjes in het gras', 'krillion'), a('boerenkoolstamppot', 'krillion'), a('zuurkoolstamppot', 'krillion'),
      a('pommes anna', 'krillion'), a('aardappelwaaiers', 'krillion'), a('loaded fries', 'krillion'), a('aardappelwafels', 'krillion'),
    ], { classification: 'B', validation: { type: 'listed' } }),

    prompt('nl-p2', 'Noem een dier met precies vier letters', [
      a('beer'), a('ever'), a('haai'), a('hert'), a('hond'), a('muis'), a('wolf'), a('egel'), a('ibis'), a('lama'), a('maki'), a('orka'),
      a('puma'), a('raaf'), a('roek'), a('slak'), a('spin'), a('zalm'), a('gnoe'), a('krab'), a('mier'), a('wesp'), a('luis'), a('teek'),
      a('worm'), a('mees'), a('duif'), a('gier'), a('eend'), a('gans'), a('haan'), a('geit'), a('pony'), a('ezel'), a('rund', 'schooler'),
      a('dodo', 'rare'), a('koet', 'rare'), a('lori', 'deepcut'), a('vink', 'deepcut'), a('zebu', 'deepcut'), a('mijt', 'deepcut'),
      a('mara', 'krillion'), a('tahr', 'krillion'),
    ], { classification: 'A', validation: { type: 'canonical-length', length: 4, unit: 'letters', count: 'normalized-letters' } }),

    prompt('nl-p3', 'Noem een Nederlandse stad', [
      a('Amsterdam'), a('Rotterdam'), a('Den Haag'), a('Utrecht'), a('Eindhoven'), a('Groningen'), a('Tilburg'), a('Almere'),
      a('Breda'), a('Nijmegen'), a('Apeldoorn'), a('Haarlem'), a('Arnhem'), a('Zaanstad'), a('Amersfoort'), a('Enschede'),
      a("'s-Hertogenbosch"), a('Zoetermeer'), a('Zwolle'), a('Leiden'), a('Maastricht'), a('Dordrecht'), a('Ede'), a('Alkmaar'),
      a('Leeuwarden'), a('Emmen'), a('Venlo'), a('Delft'), a('Deventer'), a('Heerlen'), a('Sittard'), a('Helmond'), a('Hilversum'),
      a('Hengelo'), a('Amstelveen'), a('Roosendaal'), a('Purmerend'), a('Schiedam'), a('Vlaardingen'), a('Gouda'), a('Hoorn'),
      a('Velsen'), a('Assen'), a('Weert', 'tooclever'), a('Tiel', 'tooclever'), a('Middelburg', 'schooler'), a('Vlissingen', 'schooler'),
      a('Wageningen', 'rare'), a('Bergen op Zoom', 'deepcut'), a('Capelle aan den IJssel', 'deepcut'), a('Nieuwegein', 'krillion'),
    ], { classification: 'B', validation: { type: 'listed' } }),

    prompt('nl-p4', 'Noem een chemisch element waarvan het symbool uit één letter bestaat', [
      a('boor', 'plankton', ['B']), a('koolstof', 'plankton', ['C']), a('fluor', 'plankton', ['F']), a('waterstof', 'plankton', ['H']),
      a('jodium', 'schooler', ['I']), a('kalium', 'schooler', ['K']), a('stikstof', 'schooler', ['N']), a('zuurstof', 'schooler', ['O']),
      a('fosfor', 'rare', ['P']), a('zwavel', 'rare', ['S']), a('uranium', 'rare', ['U']), a('vanadium', 'deepcut', ['V']),
      a('wolfraam', 'deepcut', ['W']), a('yttrium', 'krillion', ['Y']),
    ], { classification: 'A', validation: { type: 'listed' } }),

    prompt('nl-p5', 'Noem een soort station, post of halte', [
      a('treinstation'), a('metrostation'), a('tramhalte'), a('bushalte'), a('tankstation'), a('laadstation'), a('pompstation'),
      a('radiostation'), a('televisiestation'), a('weerstation'), a('meetstation'), a('basisstation'), a('grondstation'), a('tussenstation'),
      a('eindstation'), a('hoofdstation'), a('wijkstation'), a('overstapstation'), a('grensstation'), a('politiestation'), a('brandweerstation'),
      a('reddingsstation'), a('onderzoeksstation'), a('ruimtestation', 'rare', ['space station']),
      a('elektriciteitsstation', 'tooclever'), a('transformatorstation', 'tooclever'), a('schakelstation', 'schooler'), a('verdeelstation', 'schooler'),
      a('onderstation', 'rare'), a('waterkrachtstation', 'rare'), a('vaccinatiestation', 'deepcut'), a('stembusstation', 'deepcut'),
      a('spookstation', 'krillion'), a('walvisstation', 'krillion'),
    ], { classification: 'B', validation: { type: 'listed' } }),

    prompt('nl-p6', 'Noem een land in Europa', [
      a('Albanië'), a('Andorra'), a('België'), a('Bosnië en Herzegovina'), a('Bulgarije'), a('Cyprus'), a('Denemarken'), a('Duitsland'),
      a('Estland'), a('Finland'), a('Frankrijk'), a('Griekenland'), a('Hongarije'), a('Ierland'), a('IJsland'), a('Italië'), a('Kroatië'),
      a('Letland'), a('Liechtenstein'), a('Litouwen'), a('Luxemburg'), a('Malta'), a('Moldavië'), a('Monaco'), a('Montenegro'), a('Nederland'),
      a('Noord-Macedonië'), a('Noorwegen'), a('Oekraïne'), a('Oostenrijk'), a('Polen'), a('Portugal'), a('Roemenië'), a('Rusland'), a('San Marino'),
      a('Servië'), a('Slovenië'), a('Slowakije'), a('Spanje'), a('Tsjechië'), a('Turkije'), a('Vaticaanstad'), a('Verenigd Koninkrijk'),
      a('Wit-Rusland', 'tooclever', ['Belarus']), a('Zwitserland', 'schooler'), a('Kosovo', 'schooler'), a('Georgië', 'rare'), a('Armenië', 'rare'),
      a('Azerbeidzjan', 'deepcut'), a('Kazachstan', 'krillion'),
    ], { classification: 'C', validation: { type: 'listed' } }),

    prompt('nl-p7', 'Noem een superheldenteam', [
      a('Avengers'), a('X-Men'), a('Justice League'), a('Fantastic Four'), a('Teen Titans'), a('Guardians of the Galaxy'), a('Suicide Squad'),
      a('Young Justice'), a('Doom Patrol'), a('Watchmen'), a('Birds of Prey'), a('Justice Society'), a('Defenders'), a('Champions'),
      a('Runaways'), a('Thunderbolts'), a('New Mutants'), a('Excalibur'), a('Secret Avengers'), a('Outsiders'), a('Inhumans'), a('Eternals'),
      a('Alpha Flight', 'tooclever'), a('Legion of Super-Heroes', 'tooclever'), a('Great Lakes Avengers', 'schooler'), a('Power Pack', 'schooler'),
      a('New Warriors', 'schooler'), a('Future Foundation', 'rare'), a('Howling Commandos', 'rare'), a('Midnight Sons', 'rare'),
      a('Secret Six', 'deepcut'), a('Hellfire Club', 'deepcut'), a('Brotherhood of Mutants', 'deepcut'), a('Sinister Six', 'krillion'),
      a('Web Warriors', 'krillion'),
    ], { classification: 'B', validation: { type: 'listed' } }),
  ],
};

export const DUTCH_PUZZLES = DUTCH.prompts;
