import { getLocale } from './locale.mjs';

export const NL = getLocale('nl');
export const EN = getLocale('en');

const EN_FROM_NL = new Map([...NL.prompts].map(([en, nl]) => [nl, en]));
for (const [nl, en] of [
  ['Noem een manier waarop je aardappelen kunt bereiden', 'Name a way to prepare potatoes'],
  ['Noem een dier met precies vier letters', 'Name an animal with exactly four letters'],
  ['Noem een Nederlandse stad', 'Name a Dutch city'],
  ['Noem een chemisch element waarvan het symbool uit één letter bestaat', 'Name a chemical element whose symbol is one letter'],
  ['Noem een soort station, post of halte', 'Name a type of station, post or stop'],
  ['Noem een land in Europa', 'Name a country in Europe'],
  ['Noem een superheldenteam', 'Name a superhero team'],
]) EN_FROM_NL.set(nl, en);
export function promptText(prompt, interfaceLanguage = 'nl', answerLanguage = 'nl') {
  const raw = prompt?.text || '';
  if (interfaceLanguage === 'en') return EN_FROM_NL.get(raw) || raw;
  const translated = NL.prompts.get(raw) || raw;
  if (answerLanguage !== 'en') return translated;
  const suffix = /vier letters|één letter|één teken|naam eindigt/i.test(translated) ? ' (in het Engels)' : '';
  return translated.endsWith(suffix) ? translated : translated + suffix;
}
