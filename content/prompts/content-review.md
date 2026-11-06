# Inhoudsreview v1

Lees de geïmporteerde vragen opnieuw als kritische reviewer. Zoek per vraag:
onjuiste categorieleden, semantische dubbelingen, evidente ontbrekende antwoorden,
Vlaamse varianten, ongeldige synoniemen, onduidelijke grenzen en vertalingen die
per ongeluk de antwoordtaal veranderen. Verifieer specialistische claims waar
mogelijk met primaire bronnen. Een technisch PASS is geen inhoudelijk bewijs.

Schrijf een review-envelope met stage=content, kind=ai (of human uitsluitend
voor een echte menselijke handeling), reviewer en questions. Iedere entry heeft
questionId, de exacte contentHash, status=pass|fail en issues als tekstlijst.
Pass betekent geschikt voor lokale proef met vastgelegde beperkingen; fail
blokkeert compilatie. Gebruik fail voor bekende ongeldige antwoorden. Noteer
niet-opgeloste dekking en nog ontbrekende onafhankelijke feitencontrole.
Wijzig eerst de inhoud en verhoog de version indien nodig; importeer opnieuw,
want review van de vorige hash is dan niet geldig. Vink nooit jezelf als mens aan.
