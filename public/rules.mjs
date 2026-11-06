export const TIERS = {
  plankton: { name: 'Plankton', score: 10, emoji: '🫧', color: '#8fa3c4', blurb: 'Het antwoord dat iedereen meteen roept.' },
  tooclever: { name: 'Te slim', score: 15, emoji: '🤡', color: '#ff9f43', blurb: 'Het obscure antwoord waar de hele klas aan dacht.' },
  schooler: { name: 'Schoolvis', score: 30, emoji: '🐟', color: '#4de3ff', blurb: 'Sterk — je zwemt met de school mee.' },
  rare: { name: 'Zeldzaam', score: 60, emoji: '🦑', color: '#ff5252', blurb: 'Een ongewoon antwoord. Goed gezien.' },
  deepcut: { name: 'Diepe snede', score: 85, emoji: '🏮', color: '#9d7bff', blurb: 'Echte obscuriteit. Weinigen komen zo diep.' },
  krillion: { name: 'Eén op een krillion', score: 100, emoji: '🌟', color: '#ffd166', blurb: 'De aangewezen parel. Tot op de bodem.' },
};
export const BANDS = [
  { min: 0, max: 150, tier: 'plankton', name: 'Plankton', text: 'Er is daar beneden nog een hele oceaan.' },
  { min: 151, max: 250, tier: 'schooler', name: 'Schoolvis', text: 'Je zwemt met de school mee.' },
  { min: 251, max: 350, tier: 'rare', name: 'Zeldzaam', text: 'Onder de thermocline. Netjes.' },
  { min: 351, max: 449, tier: 'deepcut', name: 'Diepe snede', text: 'Een serieuze duik.' },
  { min: 450, max: 700, tier: 'krillion', name: 'Eén op een krillion', text: 'Bewoner van de trog. Absurd diep.' },
];
export const ROUND_MS = 25000;
export const PREVIEW_MS = 3000;
export const ROUNDS = 7;
export const NEON_ORANGE = '#ff7900';
export const NEON_ORANGE_BRIGHT = '#ff9d32';
export const NEON_ORANGE_DARK = '#c95a00';
export const NEON_ORANGE_GLOW = 'rgba(255,121,0,.30)';
export const bandFor = score => [...BANDS].reverse().find(b => score >= b.min) || BANDS[0];
export const normalize = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
export function etDate(now = Date.now()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now));
}
export function resetAt(date) {
  const next = new Date(date + 'T12:00:00Z'); next.setUTCDate(next.getUTCDate() + 1);
  const day = next.toISOString().slice(0, 10);
  const probe = new Date(day + 'T04:00:00Z');
  return etDate(probe) === day ? probe.getTime() : Date.parse(day + 'T05:00:00Z');
}
export function distance(a, b, limit = Infinity) {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) next[j] = Math.min(next[j - 1] + 1, row[j] + 1, row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    if (Math.min(...next) > limit) return limit + 1;
    row = next;
  }
  return row[b.length];
}
function typoDistance(a, b, limit, language) {
  const base = distance(a, b, limit);
  if (base <= limit) return base;
  // A transposed adjacent pair is a frequent keyboard error in both supported
  // languages. It is checked separately so the normal Levenshtein budget stays
  // conservative for short words and ambiguous candidates.
  if (language === 'nl' || language === 'en') {
    for (let i = 0; i < Math.min(a.length, b.length) - 1; i++) {
      if (a[i] !== b[i] || a[i + 1] !== b[i + 1]) {
        const swapped = a.slice(0, i) + a[i + 1] + a[i] + a.slice(i + 2);
        if (swapped === b) return 1;
      }
    }
  }
  return base;
}
// Shared with the offline content validator: keep the effective alias space identical.
export function answerVariants(answer) {
  const commonAliases = { mashedpotatoes: ['mashed', 'mash'], frenchfries: ['fries'], bakedpotato: ['baked potato', 'jacket potato'] };
  return [answer.answer, ...(answer.aliases || []), ...(commonAliases[normalize(answer.answer)] || [])];
}
export function matchAnswer(input, answers, validation = null, language = 'en') {
  const key = normalize(input);
  if (!key || key.length > 256) return null;
  if (validation?.type === 'canonical-length' && key.length !== validation.length) return null;
  const entries = answers.flatMap(a => answerVariants(a).map(word => ({ word, a, key: normalize(word) }))).filter(e => validation?.type !== 'canonical-length' || e.a.answer && normalize(e.a.answer).length === validation.length);
  const exact = entries.find(e => e.key === key);
  if (exact) return { ...exact.a, correction: key !== normalize(exact.a.answer) };
  const allowance = key.length < 4 ? 0 : key.length < 8 ? 1 : 2;
  const candidates = entries.map(e => ({ ...e, d: typoDistance(key, e.key, allowance, language) })).filter(e => e.d <= allowance).sort((a, b) => a.d - b.d);
  if (candidates.length && (!candidates[1] || candidates[0].d < candidates[1].d || candidates[0].a.answer === candidates[1].a.answer)) return { ...candidates[0].a, correction: true };
  return null;
}
export function shareText(day, results) {
  const score = results.reduce((s, r) => s + r.score, 0);
  return `OpenKrillion #${day} 🦐\n${score}/700 · ${score * 10} m\n${results.map(r => TIERS[r.tier]?.emoji || '⬛').join('')}\nhttps://openkrillion.com`;
}
