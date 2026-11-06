import { verifyEdition } from './content-contract.mjs';

export class EditionError extends Error {
  constructor(code,status=409) { super(code); this.code=code; this.status=status; }
}
export async function editionFor(env,id,answerLanguage,date) {
  if (!/^cf-(nl|en)-[a-f0-9]{24}$/.test(id || '')) throw new EditionError('editionUnavailable');
  const row=await env.DB.prepare('SELECT * FROM content_editions WHERE id=?').bind(id).first();
  if (!row) throw new EditionError('editionUnavailable');
  let edition;
  try {
    edition=await verifyEdition(JSON.parse(row.content));
    if (row.content_hash!==edition.contentHash || row.id!==edition.editionId || row.answer_language!==edition.answerLanguage || row.edition_date!==edition.date) throw new Error('Row mismatch');
  } catch { throw new EditionError('editionUnavailable'); }
  if (edition.answerLanguage!==answerLanguage) throw new EditionError('editionLanguage');
  return {...edition,language:answerLanguage,date,dayNumber:Math.floor((Date.parse(date)-Date.parse('2026-07-16'))/86400000)+1,sample:true};
}
export async function previewFor(env,id,answerLanguage,date) {
  if (env.LOCAL_DEVELOPMENT!=='true') throw new EditionError('editionPreviewDisabled',403);
  return editionFor(env,id,answerLanguage,date);
}
