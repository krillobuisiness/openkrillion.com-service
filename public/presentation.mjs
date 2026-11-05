import { TIERS, NEON_ORANGE } from './rules.mjs';
import { getLocale } from './locale.mjs';
export const DROP_MS = { plankton: 3400, tooclever: 3000, schooler: 3000, rare: 3400, deepcut: 4300, krillion: 4600, miss: 900 };
export const easeInOut = t => t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
export const easeOut = t => 1 - (1 - t) ** 3;
export const iconFor = tier => ({ krillion: 'krill', plankton: 'plankton', tooclever: 'tooclever', schooler: 'schooler', rare: 'rare', deepcut: 'deepcut' })[tier];
export const tierImage = (tier, cls = '') => tier ? `<img class="${cls}" src="/assets/${iconFor(tier)}.svg" alt="" width="24" height="24">` : '<span class="miss-icon">⬛</span>';
const logDepth={plankton:8,tooclever:18,schooler:36,rare:60,deepcut:82,krillion:97};
export function diveChart(results, escape) {
  const L=getLocale(document.documentElement.lang);return `<div class="dive-chart" role="img" aria-label="${L.aria.results}">${[0,25,50,75,100].map(n=>`<div class="chart-grid" style="top:${n}%"><span>${n===0?'0 m':'−'+n}</span></div>`).join('')}<div class="dive-columns">${results.map((r,i)=>`<div class="dive-column" title="${L.hud.round} ${i+1}: ${escape(r.answer||L.prompt.noLanding)}, ${r.score} ${L.scoreUnit}" style="--drop:${logDepth[r.tier]??3}%;--delay:${i*90}ms;--dot-color:${TIERS[r.tier]?.color||'#43556b'}"><div class="dive-stem"></div><div class="dive-dot">${tierImage(r.tier)}</div><span>${i+1}</span></div>`).join('')}</div></div>`;
}
// Smoothed density derives solely from OpenKrillion's own completed daily games.
export function distributionChart(dist, score, population) {
  const bins = dist?.length ? dist : Array(71).fill(0), width = 560, top = 18, baseline = 140;
  const smoothed = bins.map((_, i) => bins.reduce((s, n, j) => s + n * Math.exp(-.5 * ((i-j)/2.2) ** 2), 0));
  const max = Math.max(1, ...smoothed), points = smoothed.map((n,i)=>[i*width/(bins.length-1),baseline-n/max*(baseline-top)]);
  const path = points.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' '), x=score/700*width;
  const index=Math.min(points.length-1,Math.max(0,Math.round(score/700*(points.length-1)))), y=points[index][1];
  return `<svg viewBox="0 0 560 174" role="img" aria-label="${population?`Scoreverdeling van ${population} dagelijkse OpenKrillion-duikers`:'Jouw score op een schaal van nul tot 700; vergelijking is niet beschikbaar'}"><path d="${path} L560,140 L0,140 Z" fill="#4de3ff25"/><path d="${path}" fill="none" stroke="#4de3ff" stroke-width="2.4"/><path d="M0 140H560" stroke="#7d93b855"/>${Array.from({length:8},(_,i)=>`<path d="M${i*80} 140v6" stroke="#7d93b8"/><text x="${i*80}" y="161" text-anchor="middle" fill="#7d93b8" font-size="12">${i*100}</text>`).join('')}<path d="M${x} 140V${y}" stroke="${NEON_ORANGE}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="4" fill="${NEON_ORANGE}"/><text x="${Math.max(12,Math.min(548,x))}" y="173" text-anchor="middle" fill="${NEON_ORANGE}" font-size="12" letter-spacing="2">JIJ</text></svg>`;
}
