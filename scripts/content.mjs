import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { DEFAULT_AUDIENCE, importBatch, validateBatch, recordReview, compileEdition, canonicalJSON } from '../content/factory.mjs';
import { verifyEdition } from '../src/content-contract.mjs';
import { DEMO } from '../src/demo.mjs';
import { DUTCH } from '../src/dutch.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const [command,...args]=process.argv.slice(2);
const opts={};
for(let i=0;i<args.length;i+=2) {if(!args[i].startsWith('--') || args[i+1]===undefined)throw new Error('Options require --name value');opts[args[i].slice(2)]=args[i+1];}
async function readJSON(path) {const raw=await readFile(resolve(root,path),'utf8');if(raw.length>2_000_000)throw new Error('Input exceeds 2 MB');return JSON.parse(raw);}
async function writeJSON(path,value,{replace=false}={}) {
  const target=resolve(root,path),local=relative(root,target);
  if(local.startsWith('..') || local==='public' || local.startsWith('public/'))throw new Error('Keep content inside the repository and outside public/');
  await mkdir(dirname(target),{recursive:true});
  const text=JSON.stringify(value,null,2)+'\n';
  try {await writeFile(target,text,{flag:replace?'w':'wx'});} catch(e) {if(e.code!=='EEXIST' || canonicalJSON(await readJSON(path))!==canonicalJSON(value))throw e;}
}
async function catalog() {
  const result=[...DEMO.prompts.map(q=>({questionId:q.id,text:q.text,answerLanguage:'en'})),...DUTCH.prompts.map(q=>({questionId:q.id,text:q.text,answerLanguage:'nl'}))];
  const folder=resolve(root,opts.catalog || 'content/work/drafts');
  let files;try{files=await readdir(folder);}catch(e){if(e.code==='ENOENT')return result;throw e;}
  for(const file of files.filter(f=>f.endsWith('.json')).sort()) {const value=await readJSON(resolve(folder,file));result.push(...(value.questions || []));}
  return result;
}
async function reportValidation(report) {
  await writeJSON(opts.report || 'output/content/validation.json',report,{replace:true});
  console.log(`${report.ok?'PASS':'FAIL'}: ${report.questions || 0} questions, ${report.answers || 0} answers; ${report.errors.length} errors, ${report.warnings.length} editorial warnings`);
  for(const item of report.errors)console.error(`${item.code} ${item.path}: ${item.message}`);
  if(report.warnings.length) console.log('Editorial warnings are recorded in the JSON report; technical PASS is not factual approval.');
  if(!report.ok)process.exitCode=2;
}
try {
  if(command==='brief') {
    const answerLanguage=opts.language || 'nl';
    if(!['en','nl'].includes(answerLanguage))throw new Error('Unsupported language');
    const brief={schemaVersion:1,provider:'external-json',promptTemplateVersion:'generator-v1',answerLanguage,audience:opts.audience || DEFAULT_AUDIENCE,categories:(opts.categories || 'natuur,taal,muziek,wetenschap,erfgoed').split(','),existingQuestions:(await catalog()).map(({questionId,text,answerLanguage})=>({questionId,text,answerLanguage})),instructions:await readFile(new URL('../content/prompts/generator.md',import.meta.url),'utf8')};
    await writeJSON(opts.out || 'content/work/brief.json',brief);
    console.log('Brief created. No model API was called. Supply externally authored JSON to import.');
  } else if(command==='import') {
    const {batch,report}=await importBatch(await readJSON(opts.file),await catalog());
    await reportValidation(report);
    if(report.ok){await writeJSON(opts.out || `content/work/drafts/${batch.batchId}.json`,batch);console.log(`Imported draft ${batch.batchId}; reviews from external input were discarded.`);}
  } else if(command==='validate') {
    await reportValidation(await validateBatch(await readJSON(opts.file),await catalog()));
  } else if(command==='review') {
    const batch=await recordReview(await readJSON(opts.file),await readJSON(opts.review));
    await reportValidation(await validateBatch(batch,await catalog()));
    if(!process.exitCode)await writeJSON(opts.out || opts.file,batch,{replace:!opts.out || opts.out===opts.file});
  } else if(command==='compile') {
    const batch=await readJSON(opts.file);
    const report=await validateBatch(batch,await catalog());
    await reportValidation(report);
    if(report.ok){
      const recent=opts.recent?(await readJSON(opts.recent)).flatMap(e=>e.prompts.map(p=>p.id)):[];
      const edition=await compileEdition(batch,{seed:opts.seed || 'pilot-v1',date:opts.date || '2026-11-06',answerLanguage:opts.language || 'nl',recent,questionIds:opts.questions?.split(',')});
      await writeJSON(opts.out || `content/editions/${edition.editionId}.json`,edition);
      console.log(JSON.stringify({editionId:edition.editionId,hash:edition.contentHash,maximumScore:edition.maximumScore,questions:edition.prompts.map(p=>p.id)},null,2));
    }
  } else if(command==='preview') {
    const edition=await verifyEdition(await readJSON(opts.file));
    const config=await readJSON('wrangler.jsonc');
    if(config.vars?.LOCAL_DEVELOPMENT!=='true')throw new Error('Local development must be explicitly enabled');
    const binding=config.d1_databases.find(d=>d.binding==='DB');
    if(!binding)throw new Error('No DB binding');
    const sqlString=s=>"'"+String(s).replaceAll("'","''")+"'";
    const sql=`INSERT OR IGNORE INTO content_editions(id,answer_language,edition_date,content_hash,content) VALUES(${[edition.editionId,edition.answerLanguage,edition.date,edition.contentHash,canonicalJSON(edition)].map(sqlString).join(',')});`;
    const file=resolve(root,'output/content/install-preview.sql');await mkdir(dirname(file),{recursive:true});await writeFile(file,sql);
    execFileSync(resolve(root,'node_modules/.bin/wrangler'),['d1','execute',binding.database_name,'--local','--config',resolve(root,'wrangler.jsonc'),'--file',file],{cwd:root,stdio:'inherit'});
    console.log(`http://localhost:3051/?lang=${opts.interface || 'nl'}&answers=${edition.answerLanguage}&edition=${edition.editionId}`);
    console.log('Local practice only. Start the existing server with npm run dev. No remote database or active daily manifest changed.');
  } else if(command==='check') {
    for(const file of (await readdir(resolve(root,'content/reviewed'))).filter(f=>f.endsWith('.json'))) {
      const report=await validateBatch(await readJSON('content/reviewed/'+file));
      if(!report.ok)throw new Error(JSON.stringify(report.errors));
      console.log(`${file}: ${report.questions} questions, ${report.answers} answers; ${report.warnings.length} editorial warnings`);
    }
    for(const file of (await readdir(resolve(root,'content/editions'))).filter(f=>f.endsWith('.json')))await verifyEdition(await readJSON('content/editions/'+file));
    console.log('Offline content checks passed (not a semantic completeness certificate).');
  } else {
    console.log('npm run content -- brief|import|validate|review|compile|preview|check [--file path] [--out path] [--review path] [--seed value] [--date YYYY-MM-DD] [--language nl|en]');
    if(command)process.exitCode=1;
  }
} catch(e) {console.error(`Content command failed: ${e.message}`);process.exitCode=1;}
