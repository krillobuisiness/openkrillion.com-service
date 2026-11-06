import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import worker from '../src/worker.mjs';

export function database() {
  const db=new DatabaseSync(':memory:');
  for(const file of readdirSync(new URL('../migrations/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())db.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
  const prepare=sql=>({
    bind(...args){const s=db.prepare(sql);return {async first(){return s.get(...args)||null},async all(){return {results:s.all(...args)}},async run(){const r=s.run(...args);return {success:true,meta:{changes:Number(r.changes)}}}}},
    async first(){return db.prepare(sql).get()||null},
  });
  return {prepare,exec:sql=>db.exec(sql),async batch(statements){db.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());db.exec('COMMIT');return results}catch(e){db.exec('ROLLBACK');throw e}},close:()=>db.close()};
}
export function service(envOverride={}) {
  const env={DB:database(),BUCKET:{put:async()=>{},get:async()=>null},LOCAL_DEVELOPMENT:'true',REFERENCE_SYNC:'false',ASSETS:{fetch:async()=>new Response('not found',{status:404})},...envOverride};let cookie='';
  return {env,async call(path,data,extra={}){
    const response=await worker.fetch(new Request('http://localhost:3051'+path,{...(data===undefined?{}:{method:'POST',body:JSON.stringify(data)}),headers:{'Content-Type':'application/json',Cookie:cookie,...extra}}),env,{});
    if(response.headers.get('Set-Cookie'))cookie=response.headers.get('Set-Cookie').split(';')[0];
    return {status:response.status,body:await response.json()};
  },cookie:()=>cookie};
}
export async function installEdition(db,edition) {
  await db.prepare('INSERT INTO content_editions(id,answer_language,edition_date,content_hash,content) VALUES(?,?,?,?,?)').bind(edition.editionId,edition.answerLanguage,edition.date,edition.contentHash,JSON.stringify(edition)).run();
}
