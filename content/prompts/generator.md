# Generator v1 — external-json provider

Maak een JSON-batch volgens het model in content/incoming/pilot-nl.json en
docs/CONTENT_FACTORY.md. Geen Markdown in de JSON. schemaVersion=1,
generationMethod=model-authored, promptTemplateVersion=generator-v1.
Gebruik de doelgroep, categorieën en bestaande catalogus uit de brief.
Een prompttekstvertaling verandert nooit de antwoordtaal. Geef voor NL en EN
afzonderlijke puzzelidentiteiten wanneer antwoorden of taalvoorwaarden veranderen.

Begin met heldere inclusie en exclusie. Gebruik stabiele IDs, geen ID afgeleid
van alleen de spelling. Neem echte synoniemen op als aliases van één concept.
Open categorieën blijven curated-partial. Kleine gesloten categorieën hoeven
niet te worden opgevuld. Alleen listed en canonical-length zijn uitvoerbaar.
Gebruik bij lengte normalized-latin-letters-v1: NFKD, ij=2, spaties/koppeltekens
tellen niet, cijfers verboden. Controleer ook iedere alias.

Rarity is een ai_estimate van een keuze binnen 25 seconden door algemene
kennisspelers die zeldzaam proberen te antwoorden. Geen verzonnen percentages.
Forceer nooit zes tiers of een 100-puntenantwoord. Registreer feitelijke bronnen
alleen als ze daadwerkelijk zijn geraadpleegd; anders evidence.status=pending.
Registreer geen menselijke goedkeuring en geen niet-uitgevoerde API-aanroep.
De importer zal externe hashes en reviews verwijderen en zelf berekenen.
