import { TIERS, normalize, answerVariants } from '../public/rules.mjs';
import { canonicalJSON, contentHash, questionHash } from '../src/content-contract.mjs';
export { canonicalJSON, contentHash, questionHash };
export const DEFAULT_AUDIENCE = 'Nederlandstalige algemene kennisspelers; gangbare Vlaamse varianten welkom';
export const LETTER_POLICY = 'normalized-latin-letters-v1';
const idOK = v => typeof v === 'string' && /^[a-z][a-z0-9-]{1,79}$/.test(v);
const langs = ['nl','en'];
const textOK = (v, max=600) => typeof v === 'string' && v.trim().length > 0 && v.length <= max && !/[<>\u0000-\u001f\u007f]/.test(v);
const list = value => Array.isArray(value) ? value : [];
const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
const knownKeys = (value, keys) => object(value) && Object.keys(value).every(k => keys.includes(k));

export async function sealBatch(batch) {
  const result = structuredClone(batch);
  if(!object(result))return result;
  for (const q of list(result.questions)) {
    if(!object(q))continue;
    const hash = await questionHash(q);
    if (q.contentHash !== hash) q.reviews = {};
    q.contentHash = hash;
  }
  return result;
}

export async function validateBatch(batch, catalog = []) {
  const errors = [], warnings = [];
  const error = (code, path, message) => errors.push({code,path,message});
  const warn = (code, path, message) => warnings.push({code,path,message});
  if (!object(batch)) return {ok:false,errors:[{code:'schema',path:'$',message:'Expected an object'}],warnings};
  if (canonicalJSON(batch).length > 2_000_000) error('size','$','Package exceeds 2 MB');
  if (batch.schemaVersion !== 1 || !idOK(batch.batchId) || !['model-authored','human-authored'].includes(batch.generationMethod) || !textOK(batch.promptTemplateVersion,80)) error('schema','$','Invalid batch header');
  if (!Array.isArray(batch.questions) || !batch.questions.length || batch.questions.length > 100) error('questions','$','Expected 1–100 questions');
  const ids = new Set(), texts = new Set();
  for (const [i,q] of list(batch.questions).entries()) {
    const p = `questions[${i}]`;
    if (!object(q)) { error('schema',p,'Expected question object'); continue; }
    if (!idOK(q.questionId) || ids.has(q.questionId)) error('id',p,'Invalid or duplicate question ID');
    ids.add(q.questionId);
    if (!Number.isInteger(q.version) || q.version < 1 || q.version > 100000) error('version',p,'Expected positive integer version');
    if (!textOK(q.text) || !langs.includes(q.originalLanguage) || !langs.includes(q.answerLanguage)) error('language',p,'Invalid prompt or language');
    if (!idOK(q.category) || !['easy','medium','hard'].includes(q.difficulty) || !textOK(q.audience)) error('metadata',p,'Category, difficulty and audience required');
    if (!object(q.scope) || !textOK(q.scope.include) || !textOK(q.scope.exclude)) error('scope',p,'Inclusion and exclusion rules required');
    if (q.linkedQuestionId !== undefined && !idOK(q.linkedQuestionId)) error('id',p,'Invalid linked question ID');
    const textKey = `${q.answerLanguage}:${normalize(q.text)}`;
    if (texts.has(textKey)) error('duplicate-question',p,'Duplicate normalized question');
    texts.add(textKey);
    for (const old of catalog) {
      if (old.questionId === q.questionId && old.version === q.version && old.contentHash !== q.contentHash) error('version-reuse',p,'Changed content requires a new version');
      if (old.questionId !== q.questionId && old.answerLanguage === q.answerLanguage && normalize(old.text) === normalize(q.text)) error('catalog-duplicate',p,'Question already exists in catalog');
    }
    const currentKeys=new Set(list(q.answers).filter(object).map(a=>normalize(a.answer)));
    for(const other of [...list(batch.questions).slice(0,i),...catalog]) {
      if(!object(other) || other.questionId===q.questionId || other.answerLanguage!==q.answerLanguage)continue;
      const otherKeys=new Set(list(other.answers).filter(object).map(a=>normalize(a.answer)));
      const overlap=[...currentKeys].filter(k=>otherKeys.has(k)).length;
      if(Math.min(currentKeys.size,otherKeys.size)>=4 && overlap/Math.min(currentKeys.size,otherKeys.size)>=0.8)warn('possible-variant',p,`Answer overlap with ${other.questionId}; semantic duplication requires editorial review`);
    }
    if (!object(q.translations)) error('translations',p,'Explicit translations required');
    for (const [language,t] of Object.entries(q.translations || {})) if (!langs.includes(language) || !object(t) || !textOK(t.text) || !['pending','ai-reviewed','human-approved'].includes(t.status)) error('translations',p,'Invalid translation');
    for (const language of langs) if (language !== q.originalLanguage && !q.translations?.[language]) warn('translation-missing',p,`Missing ${language} translation; compilation blocked`);
    if (!object(q.coverage) || !['open','closed'].includes(q.coverage.type) || !['curated-partial','claimed-complete'].includes(q.coverage.status) || !Array.isArray(q.coverage.knownMissing) || !textOK(q.coverage.notes)) error('coverage',p,'Coverage declaration required');
    if (q.coverage?.type === 'open' && q.coverage?.status !== 'curated-partial') error('coverage',p,'An open list cannot claim completeness');
    if (!list(q.coverage?.knownMissing).every(v=>textOK(v))) error('coverage',p,'Invalid missing-answer notes');
    if (q.coverage?.type === 'open') warn('open-coverage',p,'Curated open category; completeness not proven');
    const c = q.constraints;
    if (c?.type === 'listed') {
      if (!knownKeys(c,['type'])) error('constraint',p,'Unsupported listed constraint fields');
    } else if (c?.type === 'canonical-length') {
      if (!knownKeys(c,['type','length','letterPolicy']) || c.letterPolicy !== LETTER_POLICY || !Number.isInteger(c.length) || c.length < 1 || c.length > 40) error('constraint',p,'Unsupported length policy');
    } else error('constraint',p,'Unsupported constraint type; cannot silently discard');
    if (!Array.isArray(q.answers) || !q.answers.length || q.answers.length > 500) error('answers',p,'Expected 1–500 answers');
    const answerIds = new Set(), normalized = new Map(), concepts = new Map();
    for (const [j,a] of list(q.answers).entries()) {
      const ap = `${p}.answers[${j}]`;
      if (!object(a)) { error('answer',ap,'Expected answer object'); continue; }
      if (!idOK(a.answerId) || answerIds.has(a.answerId)) error('answer-id',ap,'Invalid or duplicate canonical answer ID');
      answerIds.add(a.answerId);
      if (!idOK(a.conceptId) || concepts.has(a.conceptId)) error('concept',ap,'Each concept must use one canonical answer (synonyms are aliases)');
      concepts.set(a.conceptId,a.tier);
      if (!textOK(a.answer,120) || !Array.isArray(a.aliases) || a.aliases.length > 20 || !a.aliases.every(x=>textOK(x,120))) { error('answer',ap,'Invalid spelling or aliases'); continue; }
      if (!Object.hasOwn(TIERS,a.tier)) error('tier',ap,'Unknown tier');
      if (!object(a.rarity) || a.rarity.source !== 'ai_estimate' || !textOK(a.rarity.methodVersion,80) || !['low','medium','high'].includes(a.rarity.confidence) || !textOK(a.rarity.reason)) error('rarity',ap,'Explicit provisional rarity assessment required');
      if (!object(a.evidence) || !['pending','source-checked'].includes(a.evidence.status) || !Array.isArray(a.evidence.sources)) error('evidence',ap,'Evidence or pending verification status required');
      if (a.evidence?.status === 'source-checked' && !a.evidence.sources?.length) error('evidence',ap,'Source-checked requires actual sources');
      for (const s of list(a.evidence?.sources)) if (!object(s) || !/^https:\/\/[^\s<>]+$/.test(s.url || '') || !textOK(s.claim) || !/^\d{4}-\d{2}-\d{2}$/.test(s.accessed || '') || !['page','search-excerpt'].includes(s.access)) error('source',ap,'Invalid source evidence');
      if (a.evidence?.status === 'pending') warn('fact-review',ap,'Not externally fact-checked');
      const variants = answerVariants(a);
      if (new Set([a.answer,...a.aliases]).size !== 1+a.aliases.length) error('duplicate-string',ap,'Repeated canonical/alias string');
      for (const value of variants) {
        const key = normalize(value);
        if (!key) error('empty-normalized',ap,'Empty normalized answer');
        if (normalized.has(key) && normalized.get(key) !== a.answerId) error('alias-collision',ap,`Effective matcher collision: ${value}`);
        normalized.set(key,a.answerId);
        if (c?.type === 'canonical-length' && (!/^[a-z]+$/.test(key) || key.length !== c.length)) error('length',ap,`Canonical and effective aliases must contain ${c.length} normalized Latin letters; digits forbidden`);
      }
    }
    const hash = await questionHash(q);
    if (q.contentHash !== hash) error('hash',p,'Content hash is stale');
    for (const stage of ['technical','content','rarity']) {
      const reviews = q.reviews?.[stage];
      for (const [kind,r] of Object.entries(reviews || {})) {
        if (!['ai','human','validator'].includes(kind) || !object(r) || r.contentHash !== hash || !['pass','fail'].includes(r.status) || !textOK(r.reviewer,120) || !Array.isArray(r.issues)) error('review',p,'Invalid/stale review');
        if (kind === 'human' && /model|codex|assistant|gpt|ai-review/i.test(r?.reviewer || '')) error('review-identity',p,'A model cannot register as human');
      }
    }
  }
  return {ok:errors.length===0,errors,warnings,questions:list(batch.questions).length,answers:list(batch.questions).reduce((n,q)=>n+list(q?.answers).length,0)};
}

export async function importBatch(input,catalog=[]) {
  const batch = structuredClone(input);
  if(!object(batch))return {batch,report:await validateBatch(batch,catalog)};
  for (const q of list(batch.questions)) if (object(q)) { delete q.contentHash; q.reviews={}; }
  const sealed=await sealBatch(batch), report=await validateBatch(sealed,catalog);
  if (report.ok) for (const q of sealed.questions) q.reviews.technical={validator:{status:'pass',contentHash:q.contentHash,reviewer:'content-validator-v1',issues:[]}};
  return {batch:sealed,report};
}

export async function recordReview(batch, review) {
  const result = structuredClone(batch);
  if (!['content','rarity'].includes(review.stage) || !['ai','human'].includes(review.kind) || !textOK(review.reviewer,120) || !Array.isArray(review.questions)) throw new Error('Invalid review envelope');
  if (review.kind === 'human' && /model|codex|assistant|gpt|ai-review/i.test(review.reviewer)) throw new Error('Models cannot approve as human');
  const seen = new Set();
  for (const entry of review.questions) {
    const q=result.questions.find(q=>q.questionId===entry.questionId);
    if (!q || seen.has(entry.questionId) || entry.contentHash !== await questionHash(q) || !['pass','fail'].includes(entry.status) || !Array.isArray(entry.issues) || !entry.issues.every(x=>textOK(x))) throw new Error('Unknown question, duplicate, stale hash or invalid review');
    seen.add(entry.questionId);
    q.reviews ||= {};
    q.reviews[review.stage] ||= {};
    q.reviews[review.stage][review.kind]={contentHash:entry.contentHash,status:entry.status,issues:entry.issues,reviewer:review.reviewer};
  }
  return result;
}

export async function compileEdition(batch,{seed='pilot-v1',date='2026-11-06',answerLanguage='nl',recent=[],questionIds}={}) {
  const report=await validateBatch(batch);
  if (!report.ok) throw new Error(`Technical validation failed: ${JSON.stringify(report.errors)}`);
  if (!langs.includes(answerLanguage) || !textOK(seed,120) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date) throw new Error('Invalid compilation options');
  const eligible=batch.questions.filter(q=>q.answerLanguage===answerLanguage && !recent.includes(q.questionId) && ['content','rarity'].every(stage=>['human','ai'].some(kind=>q.reviews?.[stage]?.[kind]?.status==='pass') && !Object.values(q.reviews?.[stage]||{}).some(r=>r.status==='fail')) && q.reviews?.technical?.validator?.status==='pass' && langs.every(lang=>lang===q.originalLanguage || ['ai-reviewed','human-approved'].includes(q.translations?.[lang]?.status)) && Math.max(...q.answers.map(a=>TIERS[a.tier].score))===100);
  const ranked=await Promise.all(eligible.map(async q=>({q,rank:await contentHash([seed,q.questionId,q.version])})));
  ranked.sort((a,b)=>a.rank.localeCompare(b.rank));
  const candidates=ranked.filter(({q})=>!questionIds || questionIds.includes(q.questionId));
  const selected=[], categories=new Map();
  // Reserve five distinct categories before filling the remaining two slots.
  for(const {q} of candidates) if(categories.size<5 && !categories.has(q.category)){selected.push(q);categories.set(q.category,1);}
  for(const {q} of candidates) if(selected.length<7 && !selected.includes(q) && (categories.get(q.category)||0)<2){selected.push(q);categories.set(q.category,(categories.get(q.category)||0)+1);}
  selected.sort((a,b)=>ranked.findIndex(x=>x.q===a)-ranked.findIndex(x=>x.q===b));
  if (selected.length!==7 || categories.size<5 || (questionIds && (questionIds.length!==7 || new Set(questionIds).size!==7))) throw new Error(`Insufficient reviewed stock: ${selected.length}/7 selectable questions, ${categories.size}/5 categories. Do not inflate tiers or relax repetition silently.`);
  const prompts=selected.map(q=>({id:q.questionId,version:q.version,contentHash:q.contentHash,text:q.text,language:q.answerLanguage,originalLanguage:q.originalLanguage,translations:Object.fromEntries(Object.entries(q.translations).map(([lang,t])=>[lang,t.text])),validation:q.constraints.type==='listed'?{type:'listed'}:{type:'canonical-length',length:q.constraints.length,unit:'letters',count:'normalized-letters'},answers:q.answers.map(a=>({answerId:a.answerId,answer:a.answer,tier:a.tier,aliases:a.aliases}))}));
  const reviewLabel=selected.every(q=>['content','rarity'].every(stage=>q.reviews[stage].ai?.status==='pass'))?'AI-reviewed':'reviewed';
  const snapshot={schemaVersion:1,answerLanguage,date,seed,source:`Contentfabriek v1 · ${batch.generationMethod} · ${reviewLabel} · local preview`,maximumScore:prompts.reduce((n,p)=>n+Math.max(...p.answers.map(a=>TIERS[a.tier].score)),0),prompts};
  const hash=await contentHash(snapshot);
  return {...snapshot,editionId:`cf-${answerLanguage}-${hash.slice(0,24)}`,contentHash:hash};
}
