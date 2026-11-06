// Synthetic EN fixtures exercise contracts, not editorial rarity or production content.
import { importBatch, recordReview, compileEdition } from '../content/factory.mjs';

export async function approveFixture(batch) {
  for(const stage of ['content','rarity'])batch=await recordReview(batch,{stage,kind:'ai',reviewer:'test-fixture-not-editorial',questions:batch.questions.map(q=>({questionId:q.questionId,contentHash:q.contentHash,status:'pass',issues:['Synthetic test; not an editorial approval.']}))});
  return batch;
}
export async function englishFixture() {
  const definitions=[
    ['Name an animal with four letters for this test.','Noem voor deze test een dier met vier letters.','Wolf'],
    ['Name a musical instrument for this test.','Noem voor deze test een muziekinstrument.','Guitar'],
    ['Name a mineral for this test.','Noem voor deze test een mineraal.','Quartz'],
    ['Name a flower part for this test.','Noem voor deze test een bloemonderdeel.','Petal'],
    ['Name a figure of speech for this test.','Noem voor deze test een stijlfiguur.','Metaphor'],
    ['Name a vessel type for this test.','Noem voor deze test een scheepstype.','Schooner'],
    ['Name a plane curve for this test.','Noem voor deze test een vlakke kromme.','Circle'],
  ];
  const input={schemaVersion:1,batchId:'en-contract-fixture',generationMethod:'model-authored',promptTemplateVersion:'fixture-v1',questions:definitions.map(([text,nl,answer],i)=>({questionId:`en-fixture-${i}`,version:1,text,originalLanguage:'en',answerLanguage:'en',translations:{nl:{text:nl,status:'ai-reviewed'}},category:`fixture-${i}`,difficulty:'easy',audience:'Automated tests only',scope:{include:'Only the named fixture answer',exclude:'All other input'},constraints:i===0?{type:'canonical-length',length:4,letterPolicy:'normalized-latin-letters-v1'}:{type:'listed'},coverage:{type:'open',status:'curated-partial',knownMissing:[],notes:'Not a playable production bank'},answers:[{answerId:`en-fixture-${i}-answer`,conceptId:`en-fixture-${i}-answer`,answer,aliases:[],tier:'krillion',rarity:{source:'ai_estimate',methodVersion:'fixture-only',confidence:'low',reason:'Synthetic scoring fixture, not a claim of rarity'},evidence:{status:'pending',sources:[]}}]}))};
  const {batch,report}=await importBatch(input);
  if(!report.ok)throw new Error(JSON.stringify(report));
  return compileEdition(await approveFixture(batch),{answerLanguage:'en'});
}
