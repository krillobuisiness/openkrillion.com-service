import { TIERS, normalize, answerVariants } from '../public/rules.mjs';
// Worker and Node compatible. Authoring metadata never enters player DTOs.
export const canonicalJSON = value => JSON.stringify(sort(value));
function sort(value) {
  if (Array.isArray(value)) return value.map(sort);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, sort(value[k])]));
  return value;
}
export async function contentHash(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalJSON(value)));
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export async function questionHash(question) {
  const { contentHash: ignored, reviews, ...content } = question;
  return contentHash(content);
}
export async function verifyEdition(edition) {
  if (!edition || edition.schemaVersion !== 1 || !['en','nl'].includes(edition.answerLanguage) || !Array.isArray(edition.prompts) || edition.prompts.length !== 7) throw new Error('Invalid content edition');
  const { editionId, contentHash: digest, ...snapshot } = edition;
  if (!/^[a-f0-9]{64}$/.test(digest || '') || await contentHash(snapshot) !== digest || editionId !== `cf-${edition.answerLanguage}-${digest.slice(0,24)}`) throw new Error('Content edition hash mismatch');
  const ids=new Set(),safeText=value=>typeof value==='string' && value.length>0 && value.length<=600 && !/[<>\u0000-\u001f]/.test(value);
  let maximum=0;
  for(const p of edition.prompts) {
    if(!p || ids.has(p.id) || !/^[a-z][a-z0-9-]{1,79}$/.test(p.id || '') || !Number.isInteger(p.version) || p.version<1 || !/^[a-f0-9]{64}$/.test(p.contentHash || '') || p.language!==edition.answerLanguage || !['nl','en'].includes(p.originalLanguage) || !safeText(p.text) || !p.translations || !Array.isArray(p.answers) || !p.answers.length || p.answers.length>500)throw new Error('Invalid edition prompt');
    ids.add(p.id);
    for(const lang of ['en','nl'])if(lang!==p.originalLanguage && !safeText(p.translations[lang]))throw new Error('Missing edition translation');
    if(!['listed','canonical-length'].includes(p.validation?.type) || (p.validation.type==='canonical-length' && (!Number.isInteger(p.validation.length) || p.validation.length<1 || p.validation.length>40)))throw new Error('Unsupported edition constraint');
    const variants=new Map(),answerIds=new Set();
    for(const a of p.answers) {
      if(!a || !safeText(a.answer) || !Object.hasOwn(TIERS,a.tier) || !/^[a-z][a-z0-9-]{1,79}$/.test(a.answerId || '') || answerIds.has(a.answerId) || !Array.isArray(a.aliases) || a.aliases.length>20 || !a.aliases.every(safeText))throw new Error('Invalid edition answer');
      answerIds.add(a.answerId);
      for(const word of answerVariants(a)) {
        const key=normalize(word);
        if(!key || (variants.has(key) && variants.get(key)!==a.answerId))throw new Error('Edition alias collision');
        if(p.validation.type==='canonical-length' && (!/^[a-z]+$/.test(key) || key.length!==p.validation.length))throw new Error('Edition length mismatch');
        variants.set(key,a.answerId);
      }
    }
    maximum+=Math.max(...p.answers.map(a=>TIERS[a.tier].score));
  }
  if(maximum!==edition.maximumScore || maximum!==700)throw new Error('Invalid edition maximum');
  return edition;
}
