import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { RULES_HTML, RULES_HTML_NO_POSITION, PROFILE_RESPONSE, PROFILE_TAB_STATS, PROFILE_TAB_SPLITS,
  PROFILE_TAB_GAME_LOG_FANTASY, PROFILE_TAB_GAME_LOG, ROSTER_STATS_DAY, ROSTER_FPTS_DAY, ROSTER_STATS_SEASON,
  ROSTER_FPTS_SEASON, ROSTER_PERGAME_SEASON, ROSTER_STATS_FANTASY_TEAM, ROSTER_FPTS_FANTASY_TEAM, ROSTER_PERGAME_DAY,
  ROSTER_TRENDS_SEASON, ROSTER_TRENDS_SEASON_LOOKUP, ROSTER_TRENDS_DAY, ROSTER_DAY_LOOKUP, ROSTER_SCHEDULE_WEEK,
  PLAYERS_SCHEDULE, PLAYERS_SCHEDULE_LOOKUP, PLAYERS_TRENDS_FPG_P2, PLAYERS_TRENDS_FPG_P2_LOOKUP,
  ROSTER_TRENDS_LIVE_FIRST, ROSTER_TRENDS_LIVE_LATER, ROSTER_TRENDS_LIVE_LOOKUP } from './peripherals-fixtures.mjs';
import { LIVE_CURRENT, LIVE_CURRENT_REQ, LIVE_POLL, LIVE_POLL_REQ, LIVE_PAST, LIVE_PAST_REQ, LIVE_TEST_ALL_TEAMS,
  LIVE_TEST_ALL_TEAMS_REQ, LIVE_TEST_PROJECTED, LIVE_TEST_PROJECTED_REQ } from './peripherals-fixtures.mjs';
const require = createRequire(import.meta.url);
const P = require('../fantrax-peripherals.user.js');

test('parses our league', () => {
  const r = P.parseRules(RULES_HTML);
  assert.equal(r.skater.Blk.default, 0.7);
  assert.equal(r.skater.FOL.default, -0.27);
  assert.equal(r.skater.Pt.default, 1.5);
  assert.equal(r.skater.Pt.byPos.D, 3);
  assert.equal(r.skater.SV, undefined);
  assert.equal(r.skater.SHO, undefined);
  assert.equal(r.skater.GA, undefined);
});

test('parses a table without a Position column', () => {
  const r = P.parseRules(RULES_HTML_NO_POSITION);
  assert.equal(r.skater.PIM.default, 0.5);
  assert.deepEqual(r.skater.PIM.byPos, {});
  assert.equal(r.skater.SHG.default, 2);
  assert.ok(P.periCats(r).includes('PIM'));
  assert.ok(P.pointsCats(r).includes('SHG'));
  assert.ok(!P.periCats(r).includes('SHG'));
  assert.equal(r.skater.SV, undefined);
});

test('classifies', () => {
  const r = P.parseRules(RULES_HTML);
  assert.deepEqual(P.periCats(r), ['Blk', 'FOL', 'FOW', 'Hit', 'SOG']);
  assert.equal(P.isPointsCat('+/-'), true);
  assert.equal(P.isPointsCat('PIM'), false);
  assert.equal(P.isPointsCat('XYZ'), false);
  assert.ok(P.pointsCats(r).includes('Pt'));
});

test('roster-slot tables before the scoring table are skipped (real rules page)', () => {
  const slots = '<table class="fantasyTableLS"><tr><th class="text--nowrap"><p>Pos</p></th><th><p>Min Active</p></th>'
    + '<th><p>Max Active</p></th><th><p>Total Max</p></th></tr><tr class="row_0"><td><p>Center (C)</p></td><td><p>0</p></td>'
    + '<td><p>4</p></td><td><p></p></td></tr></table>';
  const r = P.parseRules('<div>' + slots + '<h3>Scoring</h3>' + RULES_HTML + slots + '</div>');
  assert.deepEqual(r, P.parseRules(RULES_HTML));
  assert.equal(r.skater.Pt.byPos.D, 3);
});

test('categories league yields null', () => {
  const html = '<table><tr><th class="scGroup"><p>Group</p></th><th class="scoringPts"><p>Category</p></th></tr>'
    + '<tr><td class="scGroup"><p>Skaters</p></td><td class="scoringPts"><p>Goals (G)</p></td></tr></table>';
  assert.equal(P.parseRules(html), null);
  assert.equal(P.parseRules(''), null);
  assert.equal(P.parseRules('<table></table>'), null);
});

// ---- Task 3: per-row Peri ----
import { STATS_RESPONSE } from './peripherals-fixtures.mjs';
const RULES = P.parseRules(RULES_HTML);
const hdrCells = STATS_RESPONSE.tableHeader.cells;
const hdr = hdrCells.map((c) => c.shortName);
const realRows = STATS_RESPONSE.statsTable.map((r) => ({
  stats: P.statsFromCells(hdrCells, r.cells),
  positions: r.scorer.posShortNames.split(','),
  fpts: Number(r.cells[hdr.indexOf('FPts')].content),
}));
const zero = (o = {}) => ({ GP: 1, G: 0, A: 0, Pt: 0, SOG: 0, GWG: 0, PPP: 0, SHP: 0, HT: 0, Hit: 0, Blk: 0, FOW: 0, FOL: 0, ...o });

test('every real fixture row reconciles', () => {
  for (const r of realRows) assert.equal(P.rowPeri(r.stats, r.positions, r.fpts, RULES).status, 'ok');
});

test('forward ok', () => {
  const r = realRows[0];
  const out = P.rowPeri(r.stats, r.positions, r.fpts, RULES);
  const expect = 6 * 0.45 + 25 * 0.6 + 12 * 0.7 + 58 * 0.3 + 61 * -0.27;
  assert.equal(out.status, 'ok');
  assert.ok(Math.abs(out.peri - expect) < 1e-9);
  assert.ok(Math.abs(out.perG - expect / 7) < 1e-9);
});

test('D bonus goes to points', () => {
  const r = realRows[2]; // D with 3 Pt
  const out = P.rowPeri(r.stats, r.positions, r.fpts, RULES);
  assert.equal(out.status, 'ok');
  assert.ok(Math.abs(out.peri - (10 * 0.45 + 17 * 0.6 + 14 * 0.7)) < 1e-9);
});

test('multi-position picks the matching override', () => {
  const s = zero({ A: 2, Pt: 2 });
  const d = P.rowPeri(s, ['C', 'D'], 10, RULES);
  assert.equal(d.status, 'ok');
  assert.equal(P.rowPeri(s, ['C', 'D'], 7, RULES).status, 'ok');
  const bad = P.rowPeri(s, ['C', 'D'], 5, RULES);
  assert.equal(bad.status, 'mismatch');
  assert.equal(bad.peri, null);
});

test('goalie', () => {
  const out = P.rowPeri(zero(), ['G'], 0, RULES);
  assert.equal(out.status, 'goalie');
  assert.equal(out.peri, null);
});

test('GP 0', () => {
  const r = realRows[4];
  const out = P.rowPeri(r.stats, r.positions, r.fpts, RULES);
  assert.equal(out.status, 'ok');
  assert.equal(out.peri, 0);
  assert.equal(out.perG, null);
});

test('missing category', () => {
  const s = zero();
  delete s.Blk;
  const out = P.rowPeri(s, ['C'], 0, RULES);
  assert.equal(out.status, 'missing');
  assert.equal(out.peri, null);
});

test('HT derived', () => {
  const s = zero({ G: 3, Pt: 3 });
  delete s.HT;
  assert.equal(P.rowPeri(s, ['C'], 9 + 4.5 + 3, RULES, true).status, 'ok');
  const s2 = zero({ G: 2, Pt: 2 });
  delete s2.HT;
  assert.equal(P.rowPeri(s2, ['C'], 6 + 3, RULES, true).status, 'ok');
});

test('totals rows with no HT column: HT is solved as the one unknown (controller ruling 2026-10-17)', () => {
  // a season with 2 hat tricks: 7 G, 7 Pt, 10 SOG -> 21 + 10.5 + 4.5 = 36 without HT, + 2 x 3
  const s = zero({ GP: 20, G: 7, Pt: 7, SOG: 10 });
  delete s.HT;
  const ok = P.rowPeri(s, ['C'], 36 + 6, RULES);
  assert.equal(ok.status, 'ok');
  assert.ok(Math.abs(ok.peri - 4.5) < 1e-9);
  assert.ok(Math.abs(ok.perG - 4.5 / 20) < 1e-9);
  assert.equal(P.rowPeri(s, ['C'], 36, RULES).status, 'ok'); // h = 0
  assert.equal(P.rowPeri(s, ['C'], 36 + 4.5, RULES).status, 'mismatch'); // h = 1.5: not a whole number -> ?
  assert.equal(P.rowPeri(s, ['C'], 36 + 9, RULES).status, 'mismatch'); // h = 3 > floor(7 / 3) = 2 -> ?
  assert.equal(P.rowPeri(s, ['C'], 36 - 3, RULES).status, 'mismatch'); // h = -1 -> ?
  assert.equal(P.rowPeri(s, ['C'], 36 + 6, RULES, true).status, 'mismatch'); // per-game rows never solve: HT from G
  const noG = zero({ SOG: 10 });
  delete noG.HT; delete noG.G;
  assert.equal(P.rowPeri(noG, ['C'], 4.5, RULES).status, 'missing'); // no G column: HT can't be bounded
});

test('a row with no games and FPts 0: Peri 0.00, Peri/G – when the table has the peripheral columns', () => {
  const fx = clone6(PROFILE_RESPONSE);
  const rt0 = tbl6(fx, 'Recent Trends');
  const fi = col6(rt0, 'fpts'), gi = col6(rt0, 'fptsPerGame');
  rt0.rows[2].cells = rt0.rows[2].cells.map((c, i) => (i === fi || i === gi ? { content: '0' } : i > gi ? { content: '' } : c));
  const rt = tbl6(P.augmentProfile(fx, RULES), 'Recent Trends');
  assert.equal(rt.rows[2].cells[col6(rt, 'fh_peri')].content, '0.00');
  assert.equal(rt.rows[2].cells[col6(rt, 'fh_peri_g')].content, '–');
  // the same row in a table with FPts and GP but none of the categories: not checkable -> –
  const bare = { sectionContent: { X: { tables: [{ caption: 'x', header: { cells: [{ shortName: 'Trend', key: 'trend' },
    { shortName: 'FPts', key: 'fpts' }, { shortName: 'GP', key: 'gp' }] }, rows: [{ cells: [{ content: '7-Day' }, { content: '0' }, { content: '' }] }] }] } },
    miscData: { defaultPosition: 'C' } };
  assert.equal(tabTbl(P.augmentProfile(bare, RULES)).rows[0].cells[2].content, '–');
  // FPts not 0 on a GP-blank row: the normal check (blank categories -> –)
  const fx2 = clone6(fx);
  tbl6(fx2, 'Recent Trends').rows[2].cells[fi].content = '2';
  assert.equal(tbl6(P.augmentProfile(fx2, RULES), 'Recent Trends').rows[2].cells[col6(rt, 'fh_peri')].content, '–');
});

test('Players list cells are plain: highlight / colour / tooltip / link fields of the FP/G cell are not copied', () => {
  const d = clone5(STATS_RESPONSE);
  const fi = d.tableHeader.cells.findIndex((c) => c.key === 'fptsPerGame');
  d.tableHeader.cells[fi].highlightColumn = true;
  for (const r of d.statsTable) Object.assign(r.cells[fi], { highlight: true, gainColor: 'g', toolTip: 't', briefContent: 'b', props: { x: 1 } });
  const out = P.augmentStats(d, RULES);
  const h = out.tableHeader.cells;
  for (const k of ['fh_peri', 'fh_peri_g']) {
    const i = h.findIndex((c) => c.key === k);
    assert.equal('highlightColumn' in h[i], false);
    assert.equal(h[i].width, d.tableHeader.cells[fi].width); // plain fields kept
    out.statsTable.forEach((r) => {
      for (const f of ['highlight', 'gainColor', 'briefContent', 'props']) assert.equal(f in r.cells[i], false, k + ' ' + f);
      if (r.cells[i].content !== '?') assert.equal('toolTip' in r.cells[i], false);
    });
  }
  assert.equal(out.statsTable[0].cells[fi].highlight, true); // Fantrax's own FP/G cell untouched
});

test('PPP derived from PPG + PPA', () => {
  const s = zero({ PPG: 1, PPA: 1 });
  delete s.PPP;
  assert.equal(P.rowPeri(s, ['C'], 2, RULES).status, 'ok');
});

test('parseFaceoffs', () => {
  assert.deepEqual(P.parseFaceoffs('1-0-100%'), { FOW: 1, FOL: 0 });
  assert.deepEqual(P.parseFaceoffs('0-0-0%'), { FOW: 0, FOL: 0 });
  assert.deepEqual(P.parseFaceoffs('24-23-51%'), { FOW: 24, FOL: 23 });
  assert.equal(P.parseFaceoffs('-'), null);
  assert.deepEqual(P.parseFaceoffs('1,008-800-56%'), { FOW: 1008, FOL: 800 });
});

test('thousands commas parse (season FOW "1,008", found live 2026-10-17)', () => {
  const header = ['GP', 'FOW', 'FOL', 'FPts'].map((n, i) => ({ shortName: n, key: `2010#${i}#-1` }));
  const s = P.statsFromCells(header, ['82', '1,008', '800', '1,234.5'].map((content) => ({ content })));
  assert.deepEqual(s, { GP: 82, FOW: 1008, FOL: 800, FPts: 1234.5 });
});

test('a "LW,G" row is scored as the skater; a pure G stays a goalie', () => {
  const s = zero({ SOG: 2 });
  const out = P.rowPeri(s, ['LW', 'G'], 0.9, RULES);
  assert.equal(out.status, 'ok');
  assert.ok(Math.abs(out.peri - 0.9) < 1e-9);
  assert.equal(P.rowPeri(s, ['G'], 0.9, RULES).status, 'goalie');
});

test('statsFromCells skips blanks, parses by header', () => {
  const s = P.statsFromCells(['GP', 'Hit', 'Blk', 'SOG'], ['3', '', '-', '1.5']);
  assert.deepEqual(s, { GP: 3, SOG: 1.5 });
});

test('Ros-change +/- column does not shadow the +/- category', () => {
  const html = RULES_HTML_NO_POSITION.replace('</table>', '<tr><td class="scGroup"><p>Skaters</p></td><td class="scoringPts"><p>Plus/Minus (+/-)</p></td><td class="points"><p>0.5</p></td></tr></table>');
  const rules = P.parseRules(html);
  assert.equal(rules.skater['+/-'].default, 0.5);
  const header = [
    { shortName: 'FPts', key: 'fpts' }, { shortName: 'Ros', key: null }, { shortName: '+/-', key: null },
    ...['GP', 'G', 'A', 'PIM', 'SHG', 'SOG', 'PPP', '+/-'].map((n, i) => ({ shortName: n, key: `2010#${i}#-1`, scipId: `2010#${i}#-1` })),
  ];
  const row = ['x', '15%', '+9%', '2', '1', '0', '2', '0', '4', '0', '3'].map((content) => ({ content }));
  const stats = P.statsFromCells(header, row);
  assert.equal(stats['+/-'], 3);
  // G 1*4 + PIM 2*.5 + SOG 4*.5 + +/- 3*.5 = 8.5
  const out = P.rowPeri(stats, ['C'], 8.5, rules);
  assert.equal(out.status, 'ok');
  assert.ok(Math.abs(out.peri - 3) < 1e-9);
});

test('GP missing gives perG null explicitly', () => {
  const s = zero();
  delete s.GP;
  const out = P.rowPeri(s, ['C'], 0, RULES);
  assert.equal(out.status, 'ok');
  assert.equal(out.perG, null);
});

// ---- Task 4: augment / sort / page ----
import { STATS_RESPONSE_ALL_POSITIONS } from './peripherals-fixtures.mjs';
const RULES4 = P.parseRules(RULES_HTML);
const clone4 = (o) => JSON.parse(JSON.stringify(o));
const hdrIdx4 = (d, key) => d.tableHeader.cells.findIndex((c) => c.key === key);

test('adds two columns after FP/G', () => {
  const orig = clone4(STATS_RESPONSE);
  const out = P.augmentStats(STATS_RESPONSE, RULES4);
  assert.deepEqual(STATS_RESPONSE, orig);
  const n = orig.tableHeader.cells.length, i = hdrIdx4(orig, 'fptsPerGame');
  assert.equal(out.tableHeader.cells.length, n + 2);
  assert.equal(out.tableHeader.cells[i + 1].shortName, 'Peri');
  assert.equal(out.tableHeader.cells[i + 2].shortName, 'Peri/G');
  assert.equal(out.tableHeader.cells[i + 1].scipId, P.SORT_PERI);
  assert.equal(out.tableHeader.cells[i + 2].sortKey, 'SCORING_CATEGORY_FH_PERI_G');
  out.statsTable.forEach((r, k) => {
    assert.equal(r.cells.length, orig.statsTable[k].cells.length + 2);
    const o = orig.statsTable[k].cells;
    assert.deepEqual(r.cells.slice(0, i + 1), o.slice(0, i + 1));
    assert.deepEqual(r.cells.slice(i + 3), o.slice(i + 1));
    assert.match(r.cells[i + 1].content, /^(-?\d+\.\d\d|–|\?)$/);
  });
});

test('values match rowPeri; GP0 skater gets en dash in Peri/G only', () => {
  const out = P.augmentStats(STATS_RESPONSE, RULES4);
  const i = hdrIdx4(out, 'fptsPerGame');
  const vals = P.periByScorer(STATS_RESPONSE, RULES4);
  out.statsTable.forEach((r) => {
    const v = vals.get(r.scorer.scorerId);
    if (v.status !== 'ok') return;
    assert.equal(r.cells[i + 1].content, P.fmt2(v.peri));
    assert.equal(r.cells[i + 2].content, v.perG === null ? '–' : P.fmt2(v.perG));
  });
  const gp0 = out.statsTable.find((r) => vals.get(r.scorer.scorerId).status === 'ok' && vals.get(r.scorer.scorerId).perG === null);
  assert.ok(gp0);
  assert.equal(gp0.cells[i + 2].content, '–');
  assert.notEqual(gp0.cells[i + 1].content, '–');
});

test('goalie cells and a values map for the All view', () => {
  const vals = P.periByScorer(STATS_RESPONSE, RULES4);
  const out = P.augmentStats(STATS_RESPONSE_ALL_POSITIONS, RULES4, vals);
  const i = hdrIdx4(out, 'fptsPerGame');
  out.statsTable.forEach((r) => {
    if (/G/.test(r.scorer.posShortNames) && !/[CLRWD]/.test(r.scorer.posShortNames)) {
      assert.equal(r.cells[i + 1].content, '–');
      assert.equal(r.cells[i + 2].content, '–');
    } else {
      assert.equal(r.cells[i + 1].content, '–'); // absent from the map
    }
  });
  const g = P.augmentStats(STATS_RESPONSE_ALL_POSITIONS, RULES4);
  assert.deepEqual(g.statsTable.map((r) => r.cells[i + 1].content), ['?', '–']); // no category columns and no map: skater unknown, goalie dash
});

test('mismatch gives ? with a toolTip', () => {
  const bad = clone4(STATS_RESPONSE);
  const fi = hdrIdx4(bad, 'fpts');
  bad.statsTable[0].cells[fi].content = '999.00';
  const out = P.augmentStats(bad, RULES4);
  const i = hdrIdx4(out, 'fptsPerGame');
  assert.equal(out.statsTable[0].cells[i + 1].content, '?');
  assert.match(out.statsTable[0].cells[i + 1].toolTip, /FPts/);
});

test('periName / periGName: Fantrax\'s description with "Fantasy Points" -> "Peripheral Fantasy Points", else a default', () => {
  assert.equal(P.periName('Fantasy Points'), 'Peripheral Fantasy Points');
  assert.equal(P.periName('Fantasy Points (2026-27 Reg Season)'), 'Peripheral Fantasy Points (2026-27 Reg Season)');
  assert.equal(P.periName('Points'), 'Peripheral Fantasy Points');
  assert.equal(P.periName(undefined), 'Peripheral Fantasy Points');
  assert.equal(P.periGName('Average Fantasy Points per Game'), 'Average Peripheral Fantasy Points per Game');
  assert.equal(P.periGName('Average Fantasy Points per Game (2026-27 Reg Season)'),
    'Average Peripheral Fantasy Points per Game (2026-27 Reg Season)');
  assert.equal(P.periGName('FP/G'), 'Average Peripheral Fantasy Points per Game');
  assert.equal(P.periGName(undefined), 'Average Peripheral Fantasy Points per Game');
});

test('header descriptions follow the FPts and FP/G headers (defaults when they have no name)', () => {
  const out = P.augmentStats(STATS_RESPONSE, RULES4);
  const i = hdrIdx4(out, 'fptsPerGame');
  assert.equal(out.tableHeader.cells[i + 1].name, 'Peripheral Fantasy Points');
  assert.equal(out.tableHeader.cells[i + 2].name, 'Average Peripheral Fantasy Points per Game');
  const named = clone4(STATS_RESPONSE);
  named.tableHeader.cells[hdrIdx4(named, 'fpts')].name = 'Fantasy Points (2026-27 Reg Season)';
  named.tableHeader.cells[hdrIdx4(named, 'fptsPerGame')].name = 'Average Fantasy Points per Game';
  const o2 = P.augmentStats(named, RULES4);
  const j = hdrIdx4(o2, 'fptsPerGame');
  assert.equal(o2.tableHeader.cells[j + 1].name, 'Peripheral Fantasy Points (2026-27 Reg Season)');
  assert.equal(o2.tableHeader.cells[j + 2].name, 'Average Peripheral Fantasy Points per Game');
});

test('projected view: columns present, all en dash, not sortable', () => {
  const pr = clone4(STATS_RESPONSE);
  pr.displayedSelections.displayedSeasonOrProjection = { code: 'PROJECTION_0_31n_SEASON', timeframeTypeCode: 'PROJECTED_SEASON' };
  assert.equal(P.isProjected(pr), true);
  assert.equal(P.isProjected(STATS_RESPONSE), false);
  const out = P.augmentStats(pr, RULES4);
  const i = hdrIdx4(out, 'fptsPerGame');
  for (const k of [1, 2]) {
    const h = out.tableHeader.cells[i + k];
    assert.equal(h.sortType, undefined); assert.equal(h.scipId, undefined); assert.equal(h.sortKey, undefined);
  }
  assert.ok(out.statsTable.every((r) => r.cells[i + 1].content === '–' && r.cells[i + 2].content === '–'));
});

test('sortPool desc/asc with unavailable last, ties by FPts', () => {
  const rows = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => ({ scorer: { scorerId: id }, cells: [] }));
  const ok = (peri, perG, fpts) => ({ status: 'ok', peri, perG, fpts });
  const values = new Map([
    ['a', ok(5, 1, 10)], ['b', ok(5, 2, 30)], ['c', ok(9, null, 20)],
    ['d', { status: 'mismatch', peri: null, perG: null, fpts: 99 }],
    ['e', { status: 'goalie', peri: null, perG: null, fpts: 50 }],
  ]);
  const ids = (r) => r.map((x) => x.scorer.scorerId).join('');
  const snapshot = ids(rows);
  // Peri desc: c(9), b(5,fpts30), a(5,fpts10), then unavailable d,e,f (ties by FPts desc; f has no entry -> last)
  assert.equal(ids(P.sortPool(rows, P.SORT_PERI, false, values)), 'cbadef');
  assert.equal(ids(P.sortPool(rows, P.SORT_PERI, true, values)), 'bacdef');
  // Peri/G desc: b(2), a(1), then c(null perG) and unavailable
  assert.equal(ids(P.sortPool(rows, P.SORT_PERI_G, false, values)).slice(0, 2), 'ba');
  assert.equal(ids(P.sortPool(rows, P.SORT_PERI_G, true, values)).slice(0, 2), 'ab');
  assert.equal(ids(rows), snapshot);
});

function bigPool(n) {
  const base = STATS_RESPONSE.statsTable[0];
  const rows = [], values = new Map();
  for (let k = 0; k < n; k++) {
    const r = clone4(base); r.scorer.scorerId = 'p' + k; rows.push(r);
    values.set('p' + k, { status: 'ok', peri: k, perG: k / 2, fpts: k });
  }
  return { rows: P.sortPool(rows, P.SORT_PERI, false, values), values };
}

test('pages slice the sorted pool', () => {
  const { rows } = bigPool(45);
  const base = clone4(STATS_RESPONSE);
  const p = (n, rev) => P.pageOf(base, rows, n, 20, P.SORT_PERI, rev);
  assert.deepEqual([1, 2, 3].map((n) => p(n).statsTable.length), [20, 20, 5]);
  const p4 = p(4);
  assert.equal(p4.statsTable.length, 5);
  assert.deepEqual(p4.paginatedResultSet, { totalNumResults: 45, totalNumPages: 3, pageNumber: 3, maxResultsPerPage: 20 });
  assert.equal(p(1).statsTable[0].scorer.scorerId, 'p44');
  assert.equal(p(1, true).displayedSortReversed, true);
  assert.equal(p(1).displayedSortType, 'SCORING_CATEGORY');
  assert.deepEqual(base, clone4(STATS_RESPONSE));
});

// ---- Task 5: network hook, rules and pool ----
const parse5 = JSON.parse;
const clone5 = (o) => parse5(JSON.stringify(o));

// A pool of n skaters: copies of the 5 reconciled fixture rows with distinct scorerIds.
function pool5(n, idPrefix = 'q') {
  const rows = [];
  for (let k = 0; k < n; k++) {
    const r = clone5(STATS_RESPONSE.statsTable[k % STATS_RESPONSE.statsTable.length]);
    r.scorer.scorerId = idPrefix + k;
    rows.push(r);
  }
  return rows;
}
function pageData(rows, page, per) {
  const d = clone5(STATS_RESPONSE);
  d.statsTable = rows.slice((page - 1) * per, page * per);
  d.paginatedResultSet = { totalNumResults: rows.length, totalNumPages: Math.max(1, Math.ceil(rows.length / per)),
    pageNumber: page, maxResultsPerPage: per };
  return d;
}

// Fake Fantrax: records every call; stats(data) answers getPlayerStats (default: the pool, 20/page or 500/page).
function server5({ rules = RULES_HTML, rulesStatus = 200, stats, rows = pool5(45), rulesGate, poolGate, pageStatus,
  poolYield } = {}) {
  const calls = [];
  const inflight = new Set();
  const overlaps = [];
  const fetch = async (url, init) => {
    if (typeof url !== 'string') {
      const call = { input: url, init };
      calls.push(call);
      call.res = new Response('{"responses":[]}', { status: 200 });
      return call.res;
    }
    const u = new URL(String(url), 'https://www.fantrax.com/');
    const call = { url: String(url), leagueId: u.searchParams.get('leagueId'), init, body: init && init.body };
    calls.push(call);
    if (/getTeamRosterInfo/.test(call.body) && !/getPlayerStats/.test(call.body)) {
      call.res = new Response('{"responses":[{"data":{"roster":"x"}}]}', { status: 200 });
      return call.res;
    }
    const msgs = parse5(call.body).msgs;
    call.msgs = msgs;
    if (msgs.some((m) => m.method === 'getLeagueRulesOld')) {
      if (rulesGate) await rulesGate;
      if (rulesStatus !== 200) return new Response('no', { status: rulesStatus });
    }
    const pool = msgs.find((m) => m.method === 'getPlayerStats' && m.data && m.data.maxResultsPerPage === '500');
    if (pool) {
      inflight.add(call);
      overlaps.push([...inflight].map((c) => c.msgs[0].data));
      if (poolGate) await poolGate;
      if (poolYield) for (let k = 0; k < poolYield; k++) await new Promise((r) => setImmediate(r));
      inflight.delete(call);
    } else if (pageStatus && msgs.some((m) => m.method === 'getPlayerStats')) {
      call.res = new Response('err', { status: pageStatus });
      return call.res;
    }
    const responses = msgs.map((m) => {
      if (m.method === 'getLeagueRulesOld') return { data: { content: rules } };
      if (m.method === 'getPlayerStats') {
        const d = m.data || {};
        if (stats) { const s = stats(d); if (s !== undefined) return { data: s }; }
        const per = d.maxResultsPerPage ? Number(d.maxResultsPerPage) : 20;
        return { data: pageData(rows, Number(d.pageNumber) || 1, per) };
      }
      return { data: { other: m.method } };
    });
    call.text = JSON.stringify({ responses });
    call.res = new Response(call.text, { status: 200, headers: { 'content-type': 'application/json' } });
    return call.res;
  };
  const statsCalls = () => calls.filter((c) => c.msgs && c.msgs.some((m) => m.method === 'getPlayerStats'));
  const poolCalls = () => statsCalls().filter((c) => c.msgs.some((m) => m.data && m.data.maxResultsPerPage === '500'));
  const pageCalls = () => statsCalls().filter((c) => !c.msgs.some((m) => m.data && m.data.maxResultsPerPage === '500'));
  const rulesCalls = () => calls.filter((c) => c.msgs && c.msgs.some((m) => m.method === 'getLeagueRulesOld'));
  return { fetch, calls, statsCalls, poolCalls, pageCalls, rulesCalls, overlaps };
}
const never5 = () => new Promise(() => {});
const tick5 = (n = 20) => (async () => { for (let k = 0; k < n; k++) await new Promise((r) => setImmediate(r)); })();
function gate5() { let open; const p = new Promise((r) => { open = r; }); return { p, open }; }
function setup5(srvOpts, clock = { t: 1e12 }, delay = never5) {
  const srv = server5(srvOpts);
  const win = { fetch: srv.fetch };
  P.install(win, { now: () => clock.t, retryDelay: 0, delay: (ms) => delay(ms) });
  // The page pre-warms the rules at install; a response that arrives before they are read passes through untouched.
  // send() waits for the rules first (the same one read, so call counts are unchanged), except with a rules gate.
  const ready = (leagueId) => (srvOpts && srvOpts.rulesGate ? Promise.resolve() : win.fetch.prewarm(leagueId));
  const send = async (data, leagueId = 'L1', method = 'getPlayerStats') => {
    await ready(leagueId);
    return win.fetch('/fxpa/req?leagueId=' + leagueId, { method: 'POST', body: JSON.stringify({ msgs: [{ method, data }], uiv: 3 }) });
  };
  const sendJson = async (data, leagueId) => (await (await send(data, leagueId)).json()).responses[0].data;
  // A view that needs an extra read: the first answer is '–' (loading) and warms the cache; the next one has numbers.
  const warmJson = async (data, leagueId) => {
    const first = await sendJson(data, leagueId);
    await settle5();
    return { first, d: await sendJson(data, leagueId) };
  };
  return { srv, win, send, sendJson, warmJson, clock };
}
// Lets background reads (and their retries) finish.
const settle5 = async () => { await tick5(40); await new Promise((r) => setTimeout(r, 0)); await tick5(40); };
// Every skater cell of the first view is '–' with the loading tip.
function assertLoading5(d) {
  const i = periIdx5(d);
  for (const r of d.statsTable) {
    if (r.scorer.posShortNames === 'G') continue;
    for (const c of [r.cells[i], r.cells[i + 1]]) {
      if (c.toolTip === P.LOADING_TIP) assert.equal(c.content, '–');
    }
  }
  assert.ok(d.statsTable.some((r) => r.cells[i].toolTip === P.LOADING_TIP), 'some row loading');
}
const periIdx5 = (d) => hdrIdx4(d, 'fh_peri');

test('adds columns to a passthrough response', async () => {
  const { srv, sendJson } = setup5();
  const d = await sendJson({ sortType: 'FPTS_PER_GAME', pageNumber: '1' });
  const i = periIdx5(d);
  assert.ok(i > 0);
  assert.equal(d.tableHeader.cells[i].shortName, 'Peri');
  assert.equal(d.tableHeader.cells[i + 1].shortName, 'Peri/G');
  assert.equal(d.statsTable.length, 20);
  const vals = P.periByScorer(pageData(pool5(45), 1, 20), RULES4);
  d.statsTable.forEach((r) => {
    const v = vals.get(r.scorer.scorerId);
    assert.equal(r.cells[i].content, P.fmt2(v.peri));
  });
  assert.equal(srv.poolCalls().length, 0); // Tracked totals view: values from the displayed rows
  assert.equal(srv.pageCalls()[0].msgs[0].data.sortType, 'FPTS_PER_GAME');
});

test('our sort is answered from the pool', async () => {
  const rows = pool5(1200);
  const { srv, sendJson } = setup5({ rows });
  const d = await sendJson({ sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI', pageNumber: '1', positionOrGroup: 'POS_202' });
  // server never sees our key; the page request went as SCORE
  for (const c of srv.statsCalls()) for (const m of c.msgs) {
    assert.ok(!/FH_/.test(JSON.stringify(m.data)));
    assert.equal(m.data.sortReversed, undefined);
  }
  const page = srv.pageCalls()[0].msgs[0].data;
  assert.equal(page.sortType, 'SCORE');
  assert.equal(page.positionOrGroup, 'POS_202');
  // pool: 3 sequential pages of 500 with the same selections
  const pp = srv.poolCalls().map((c) => c.msgs[0].data);
  assert.deepEqual(pp.map((x) => x.pageNumber), ['1', '2', '3']);
  assert.ok(pp.every((x) => x.sortType === 'SCORE' && x.positionOrGroup === 'POS_202' && x.scipId === undefined));
  const i = periIdx5(d);
  const shown = d.statsTable.map((r) => r.cells[i].content);
  const nums = shown.filter((x) => /^-?\d/.test(x)).map(Number);
  for (let k = 1; k < nums.length; k++) assert.ok(nums[k - 1] >= nums[k]);
  const vals = P.periByScorer(Object.assign({}, STATS_RESPONSE, { statsTable: rows }), RULES4);
  const best = Math.max(...[...vals.values()].filter((v) => v.status === 'ok').map((v) => v.peri));
  assert.equal(shown[0], P.fmt2(best));
  assert.equal(d.paginatedResultSet.totalNumResults, 1200);
  assert.equal(d.paginatedResultSet.maxResultsPerPage, 20);
  assert.equal(d.displayedSortType, 'SCORING_CATEGORY');
  // page 2, reversed, served from the cached pool
  const before = srv.poolCalls().length;
  const d2 = await sendJson({ sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI', sortReversed: true, pageNumber: '2', positionOrGroup: 'POS_202' });
  assert.equal(srv.poolCalls().length, before);
  assert.equal(d2.paginatedResultSet.pageNumber, 2);
  assert.equal(d2.displayedSortReversed, true);
  const n2 = d2.statsTable.map((r) => r.cells[i].content).filter((x) => /^-?\d/.test(x)).map(Number);
  for (let k = 1; k < n2.length; k++) assert.ok(n2[k - 1] <= n2[k]);
});

test('pool cache expires after 3 minutes and is keyed by selection', async () => {
  const clock = { t: 1e12 };
  const { srv, sendJson } = setup5({ rows: pool5(30) }, clock);
  const q = (pos) => ({ sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI_G', pageNumber: '1', positionOrGroup: pos });
  await sendJson(q('POS_202'));
  assert.equal(srv.poolCalls().length, 1);
  await sendJson(q('POS_202'));
  assert.equal(srv.poolCalls().length, 1);
  await sendJson(q('POS_206'));
  assert.equal(srv.poolCalls().length, 2);
  clock.t += 3 * 60 * 1000 + 1;
  await sendJson(q('POS_202'));
  assert.equal(srv.poolCalls().length, 3);
});

test('passes the original through when augment throws', async () => {
  // a valid header (so needsValuesPull passes) and a row with no cells: periByScorer inside augmentStats throws
  const bad = clone5(STATS_RESPONSE);
  bad.statsTable = [{ scorer: { scorerId: 'z', posShortNames: 'C' }, cells: null }];
  const real = P.augmentStats;
  assert.throws(() => real(bad, RULES4), TypeError);
  const { srv, send } = setup5({ stats: () => bad });
  const warned = [];
  const w = console.warn;
  console.warn = (...a) => warned.push(a);
  try {
    const res = await send({ sortType: 'SCORE' });
    assert.equal(await res.text(), srv.pageCalls()[0].text);
  } finally { console.warn = w; }
  assert.equal(warned.length, 1);
  assert.equal(warned[0][0], '[fpx]');
});

test('no rules, no change', async () => {
  for (const opts of [{ rules: '<table></table>' }, { rulesStatus: 500 }]) {
    const { srv, send } = setup5(opts);
    const w = console.warn; console.warn = () => {};
    try {
      const body = { sortType: 'FPTS', pageNumber: '1' };
      const res = await send(body);
      const pc = srv.pageCalls()[0];
      assert.equal(pc.body, JSON.stringify({ msgs: [{ method: 'getPlayerStats', data: body }], uiv: 3 }));
      assert.equal(res, pc.res);
      assert.equal(await res.text(), pc.text);
      // our sort still goes out as SCORE (no rules needed for that) and Fantrax's SCORE response comes back untouched
      const res2 = await send({ sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI', pageNumber: '1' });
      const pc2 = srv.pageCalls()[1];
      assert.deepEqual(pc2.msgs[0].data, { sortType: 'SCORE', pageNumber: '1' });
      assert.equal(res2, pc2.res);
      assert.equal(srv.poolCalls().length, 0);
    } finally { console.warn = w; }
  }
});

test('projected view drops our sort', async () => {
  const proj = clone5(STATS_RESPONSE);
  proj.statsTable = proj.statsTable.slice(0, 3);
  proj.displayedSelections.displayedSeasonOrProjection = { code: 'PROJECTION_0_31n_SEASON', timeframeTypeCode: 'PROJECTED_SEASON' };
  const { srv, sendJson } = setup5({ stats: (d) => (d.maxResultsPerPage ? undefined : proj) });
  const d = await sendJson({ sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI', sortReversed: true, pageNumber: '1',
    seasonOrProjection: 'PROJECTION_0_31n_SEASON' });
  const sent = srv.pageCalls()[0].msgs[0].data;
  assert.equal(sent.sortType, 'SCORE');
  assert.equal(sent.scipId, undefined);
  assert.equal(sent.sortReversed, undefined);
  assert.equal(sent.seasonOrProjection, 'PROJECTION_0_31n_SEASON');
  assert.equal(srv.poolCalls().length, 0);
  const i = periIdx5(d);
  assert.deepEqual(d.statsTable.map((r) => r.cells[i].content + r.cells[i + 1].content), ['––', '––', '––']);
  assert.deepEqual(d.statsTable.map((r) => r.scorer.scorerId), proj.statsTable.map((r) => r.scorer.scorerId));
});

test('a stale FH_ scipId is stripped from other sorts', async () => {
  const { srv } = await (async () => {
    const s = setup5();
    await s.sendJson({ sortType: 'FPTS', scipId: 'FH_PERI', pageNumber: '1' });
    await s.sendJson({ sortType: 'SCORING_CATEGORY', scipId: '2010#2270#-1', pageNumber: '1' });
    return s;
  })();
  const [a, b] = srv.pageCalls().map((c) => c.msgs[0].data);
  assert.deepEqual(a, { sortType: 'FPTS', pageNumber: '1' });
  assert.deepEqual(b, { sortType: 'SCORING_CATEGORY', scipId: '2010#2270#-1', pageNumber: '1' });
});

test('other methods untouched', async () => {
  const { srv, win } = setup5();
  const body = JSON.stringify({ msgs: [{ method: 'getStandings', data: { leagueId: 'L1' } }], uiv: 3 });
  const init = { method: 'POST', body };
  let parsed = 0;
  JSON.parse = (s, ...a) => { if (s === body) parsed++; return parse5(s, ...a); };
  let res;
  try { res = await win.fetch('/fxpa/req?leagueId=L1', init); } finally { JSON.parse = parse5; }
  assert.equal(parsed, 0);
  assert.equal(srv.calls.length, 1);
  assert.equal(srv.calls[0].init, init);
  assert.equal(srv.calls[0].body, body);
  assert.equal(res, srv.calls[0].res);
  assert.equal(srv.rulesCalls().length, 0);
  // non-fxpa URLs pass straight through too
  await win.fetch('/some/other?leagueId=L1', { method: 'POST', body: JSON.stringify({ msgs: [{ method: 'getPlayerStats' }], uiv: 3 }) });
  assert.equal(srv.rulesCalls().length, 0);
});

test('a multi-message request rewrites only the getPlayerStats response', async () => {
  const { srv, win } = setup5();
  await win.fetch.prewarm('L1');
  const res = await win.fetch('/fxpa/req?leagueId=L1', { method: 'POST', body: JSON.stringify({ msgs: [
    { method: 'getPlayerProfile', data: { playerId: 'x' } },
    { method: 'getPlayerStats', data: { pageNumber: '1' } },
  ], uiv: 3 }) });
  const j = await res.json();
  assert.deepEqual(j.responses[0].data, { other: 'getPlayerProfile' });
  assert.ok(periIdx5(j.responses[1].data) > 0);
  assert.equal(srv.pageCalls().length, 1);
});

test('rules fetched once per league', async () => {
  const clock = { t: 1e12 };
  const { srv, sendJson } = setup5({}, clock);
  await sendJson({ pageNumber: '1' }, 'L1');
  await sendJson({ pageNumber: '2' }, 'L1');
  await sendJson({ pageNumber: '1' }, 'L2');
  clock.t += 24 * 3600 * 1000;
  await sendJson({ pageNumber: '1' }, 'L1');
  assert.deepEqual(srv.rulesCalls().map((c) => c.leagueId), ['L1', 'L2']);
  assert.deepEqual(srv.rulesCalls()[0].msgs[0], { method: 'getLeagueRulesOld', data: { leagueId: 'L1' } });
});

test('a failed rules read is cached as null for 5 minutes', async () => {
  const clock = { t: 1e12 };
  const { srv, send } = setup5({ rulesStatus: 500 }, clock);
  const w = console.warn; console.warn = () => {};
  try {
    await send({ pageNumber: '1' });
    const n = srv.rulesCalls().length; // one try + one retry
    assert.equal(n, 2);
    await send({ pageNumber: '1' });
    assert.equal(srv.rulesCalls().length, n);
    clock.t += 5 * 60 * 1000 + 1;
    await send({ pageNumber: '1' });
    assert.equal(srv.rulesCalls().length, 2 * n);
  } finally { console.warn = w; }
});

// Values-source ruling: a view without the category columns gets its values from a Tracked-totals skater pull.
function allViewServer() {
  const lw = clone5(STATS_RESPONSE.statsTable[1]); // LW,RW fixture row
  lw.scorer.scorerId = STATS_RESPONSE_ALL_POSITIONS.statsTable[0].scorer.scorerId; // 04qzk
  const skaters = [lw, ...pool5(4, 's')];
  // the All view shows the same FPts as the skater's Stats row (as it does live)
  const allResp = () => {
    const all = clone5(STATS_RESPONSE_ALL_POSITIONS);
    const afi = hdrIdx4(all, 'fpts'), sfi = hdrIdx4(STATS_RESPONSE, 'fpts');
    all.statsTable[0].cells[afi].content = lw.cells[sfi].content;
    return all;
  };
  return { lw, skaters, stats: (d) => {
    if (d.maxResultsPerPage === '500') {
      if (d.positionOrGroup === 'HOCKEY_SKATING' && d.scoringCategoryType === '5') return pageData(skaters, Number(d.pageNumber), 500);
      if (d.positionOrGroup === 'ALL') {
        const all = allResp();
        all.paginatedResultSet = { totalNumResults: 2, totalNumPages: 1, pageNumber: 1, maxResultsPerPage: 500 };
        return all;
      }
    }
    if (d.positionOrGroup === 'ALL') return allResp();
    return undefined;
  } };
}

test('All view passthrough gets values from a type-5 HOCKEY_SKATING pull', async () => {
  const { lw, stats } = allViewServer();
  const { srv, warmJson } = setup5({ stats });
  const { first, d } = await warmJson({ positionOrGroup: 'ALL', pageNumber: '1', statusOrTeamFilter: 'ALL' });
  assertLoading5(first);
  const pulls = srv.poolCalls().map((c) => c.msgs[0].data);
  assert.equal(pulls.length, 1);
  assert.deepEqual(pulls[0], { positionOrGroup: 'HOCKEY_SKATING', statusOrTeamFilter: 'ALL', scoringCategoryType: '5',
    view: 'STATS', maxResultsPerPage: '500', pageNumber: '1', sortType: 'SCORE' });
  const i = periIdx5(d);
  const want = P.periByScorer(Object.assign({}, STATS_RESPONSE, { statsTable: [lw] }), RULES4).get(lw.scorer.scorerId);
  assert.equal(want.status, 'ok');
  assert.equal(d.statsTable[0].cells[i].content, P.fmt2(want.peri));
  assert.equal(d.statsTable[0].cells[i + 1].content, P.fmt2(want.perG));
  assert.deepEqual([d.statsTable[1].cells[i].content, d.statsTable[1].cells[i + 1].content], ['–', '–']); // goalie
});

test('All view with our sort sorts the All pool by the skater values', async () => {
  const { stats } = allViewServer();
  const { srv, sendJson } = setup5({ stats });
  const d = await sendJson({ positionOrGroup: 'ALL', pageNumber: '1', sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI', sortReversed: true });
  const pulls = srv.poolCalls().map((c) => c.msgs[0].data);
  assert.ok(pulls.some((x) => x.positionOrGroup === 'ALL' && x.scoringCategoryType === undefined));
  assert.ok(pulls.some((x) => x.positionOrGroup === 'HOCKEY_SKATING' && x.scoringCategoryType === '5'));
  const i = periIdx5(d);
  // skater with a value first even reversed; goalie (unavailable) last
  assert.deepEqual(d.statsTable.map((r) => r.scorer.posShortNames), ['LW', 'G']);
  assert.match(d.statsTable[0].cells[i].content, /^\d+\.\d\d$/);
});

test('Per-Game view takes its values from the totals pull', async () => {
  const perGame = clone5(STATS_RESPONSE);
  perGame.displayedScoringCategoryType = '7';
  perGame.displayedSelections.displayedScoringCategoryType = '7';
  perGame.statsTable = perGame.statsTable.slice(0, 2);
  const totals = pool5(2, 'x').map((r, k) => Object.assign(r, { scorer: perGame.statsTable[k].scorer }));
  const { srv, warmJson } = setup5({ stats: (d) => {
    if (d.maxResultsPerPage === '500' && d.scoringCategoryType === '5') return pageData(totals, 1, 500);
    if (d.scoringCategoryType === '7') return perGame;
    return undefined;
  } });
  // make the per-game cells useless so a values-from-display bug would show '?'; FPts stays the season total (as live)
  const fi = hdrIdx4(perGame, 'fpts'), sog = perGame.tableHeader.cells.findIndex((c) => c.shortName === 'SOG');
  perGame.statsTable.forEach((r, k) => { r.cells[sog].content = '1.23'; r.cells[fi].content = totals[k].cells[fi].content; });
  const { first, d } = await warmJson({ scoringCategoryType: '7', pageNumber: '1' });
  assertLoading5(first);
  const pulls = srv.poolCalls().map((c) => c.msgs[0].data);
  assert.deepEqual(pulls.map((x) => [x.scoringCategoryType, x.positionOrGroup]), [['5', undefined]]);
  const i = periIdx5(d);
  const vals = P.periByScorer(Object.assign({}, STATS_RESPONSE, { statsTable: totals }), RULES4);
  d.statsTable.forEach((r) => assert.equal(r.cells[i].content, P.fmt2(vals.get(r.scorer.scorerId).peri)));
});

test('api posts text/plain with credentials and retries once', async () => {
  let n = 0; const seen = [];
  const f = async (url, init) => {
    seen.push([url, init]);
    if (++n === 1) return new Response('x', { status: 502 });
    return new Response(JSON.stringify({ responses: [{ data: { a: 1 } }] }), { status: 200 });
  };
  const out = await P.api('L9', [{ method: 'getLeagueRulesOld', data: { leagueId: 'L9' } }], f, 0);
  assert.deepEqual(out, [{ a: 1 }]);
  assert.equal(seen.length, 2);
  assert.equal(seen[0][0], '/fxpa/req?leagueId=L9');
  assert.equal(seen[0][1].credentials, 'include');
  assert.equal(seen[0][1].headers['Content-Type'], 'text/plain');
});

// ---- Task 5 fix round: timing, budgets, abort, passthrough inputs ----

test('a throw in our sort after the rewrite returns the SCORE response', async () => {
  const badPool = pageData(pool5(3), 1, 500);
  badPool.statsTable[1].cells = null;
  const { srv, send } = setup5({ stats: (d) => (d.maxResultsPerPage === '500' ? badPool : undefined) });
  const w = console.warn; const warned = []; console.warn = (...a) => warned.push(a);
  try {
    const res = await send({ sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI', pageNumber: '1' });
    const pc = srv.pageCalls()[0];
    assert.equal(pc.msgs[0].data.sortType, 'SCORE');
    assert.equal(res, pc.res);
    assert.equal(await res.text(), pc.text);
  } finally { console.warn = w; }
  assert.equal(warned[0][0], '[fpx]');
});

test('a slow rules read does not delay dispatch', async () => {
  const g = gate5();
  const { srv, send } = setup5({ rulesGate: g.p });
  const pending = send({ sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI', pageNumber: '1' });
  await tick5();
  assert.equal(srv.rulesCalls().length, 1);
  assert.equal(srv.pageCalls().length, 1); // sent while rules are unresolved
  assert.equal(srv.pageCalls()[0].msgs[0].data.sortType, 'SCORE');
  g.open();
  const d = (await (await pending).json()).responses[0].data;
  assert.ok(periIdx5(d) > 0);
});

test('rules not read yet: Fantrax\'s response passes through untouched at once (no wait, no timer)', async () => {
  for (const [method, data] of [['getPlayerStats', { sortType: 'FPTS', pageNumber: '1' }],
    ['getPlayerStats', { view: 'SCHEDULE_PERIOD', pageNumber: '1' }], ['getPlayerProfile', { playerId: 'x' }],
    ['getTeamRosterInfo', { leagueId: 'L1', view: 'OVERVIEW' }]]) {
    const g = gate5();
    const waits = [];
    const { srv, send } = setup5({ rulesGate: g.p }, undefined, (ms) => { waits.push(ms); return never5(); });
    const res = await send(data, 'L1', method);   // resolves while the rules read is still held
    assert.equal(srv.rulesCalls().length, 1);
    const page = srv.calls.find((c) => c.body && c.body.includes('"uiv"') && c.body.includes(method));
    assert.equal(res, page.res, method);
    assert.deepEqual(waits, [], method);
    assert.equal(srv.poolCalls().length, 0);
    g.open();
    await settle5();
  }
});

test('a profile request reads rules and passes a non-card response through', async () => {
  const { srv, win } = setup5();
  const init = { method: 'POST', body: JSON.stringify({ msgs: [{ method: 'getPlayerProfile', data: { playerId: 'x' } }], uiv: 3 }) };
  const res = await win.fetch('/fxpa/req?leagueId=L1', init);
  assert.equal(srv.rulesCalls().length, 1);
  assert.ok(srv.calls.some((c) => c.init === init));
  assert.deepEqual((await res.json()).responses[0].data, { other: 'getPlayerProfile' });
});

test('install pre-warms rules from the page URL', async () => {
  const srv = server5();
  const win = { fetch: srv.fetch, location: { href: 'https://www.fantrax.com/fantasy/league/abc123league/players;positionOrGroup=ALL' } };
  P.install(win, { retryDelay: 0, delay: never5 });
  await tick5();
  assert.deepEqual(srv.rulesCalls().map((c) => c.leagueId), ['abc123league']);
  await win.fetch('/fxpa/req?leagueId=abc123league', { method: 'POST',
    body: JSON.stringify({ msgs: [{ method: 'getPlayerStats', data: {} }], uiv: 3 }) });
  assert.equal(srv.rulesCalls().length, 1);
});

test('pool pages 2..N run with at most 4 in flight', async () => {
  const rows = pool5(500 * 9);
  const { srv, sendJson } = setup5({ rows, poolYield: 3 });
  const d = await sendJson({ sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI', pageNumber: '1' });
  const pages = srv.poolCalls().map((c) => c.msgs[0].data.pageNumber);
  assert.equal(pages[0], '1');
  assert.deepEqual([...pages].sort((a, b) => a - b), ['1', '2', '3', '4', '5', '6', '7', '8', '9']);
  const sizes = srv.overlaps.map((o) => o.length);
  assert.equal(sizes[0], 1);                 // page 1 alone
  assert.equal(Math.max(...sizes), 4);       // then 4 at a time, never more
  assert.equal(d.paginatedResultSet.totalNumResults, 4500);
});

test('the pool warns when it stops at the page cap', async () => {
  const many = pageData(pool5(2), 1, 500);
  many.paginatedResultSet.totalNumPages = 61;
  const { sendJson } = setup5({ stats: (d) => (d.maxResultsPerPage === '500' ? many : undefined) });
  const w = console.warn; const warned = []; console.warn = (...a) => warned.push(a);
  try { await sendJson({ sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI', pageNumber: '1' }); } finally { console.warn = w; }
  assert.equal(warned.length, 1);
  assert.equal(warned[0][0], '[fpx]');
  assert.match(String(warned[0][1]), /60 of 61/);
});

test('values pool and display pool run in parallel', async () => {
  const { stats } = allViewServer();
  const { srv, sendJson } = setup5({ stats, poolYield: 3 });
  await sendJson({ positionOrGroup: 'ALL', pageNumber: '1', sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI' });
  assert.ok(srv.overlaps.some((o) => o.some((x) => x.positionOrGroup === 'ALL') && o.some((x) => x.positionOrGroup === 'HOCKEY_SKATING')));
});

test('non-sort values view: dashes with a loading tip at once, then the warmed cache', async () => {
  const { stats } = allViewServer();
  const g = gate5();
  const { srv, sendJson } = setup5({ stats, poolGate: g.p });
  const q = { positionOrGroup: 'ALL', pageNumber: '1' };
  const d = await sendJson(q);
  const i = periIdx5(d);
  assert.equal(d.statsTable[0].cells[i].content, '–');
  assert.equal(d.statsTable[0].cells[i].toolTip, P.LOADING_TIP);
  assert.equal(d.statsTable[0].cells[i + 1].toolTip, P.LOADING_TIP);
  assert.equal(P.LOADING_TIP, 'Peripherals still loading: change page or reload to see them');
  assert.equal(d.statsTable[1].cells[i].content, '–');          // goalie: plain dash
  assert.equal(d.statsTable[1].cells[i].toolTip, undefined);
  g.open();
  await tick5();
  const n = srv.poolCalls().length;
  const d2 = await sendJson(q);
  assert.equal(srv.poolCalls().length, n);                      // served by the warmed cache
  assert.match(d2.statsTable[0].cells[i].content, /^\d+\.\d\d$/);
});

test('an aborted request rejects with AbortError', async () => {
  const g = gate5();
  const { win } = setup5({ poolGate: g.p });
  const ctl = new AbortController();
  const p = win.fetch('/fxpa/req?leagueId=L1', { method: 'POST', signal: ctl.signal,
    body: JSON.stringify({ msgs: [{ method: 'getPlayerStats', data: { sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI' } }], uiv: 3 }) });
  await tick5();
  ctl.abort();
  g.open();
  await assert.rejects(p, (e) => e.name === 'AbortError');
});

test('Request and URL inputs and non-ok responses pass through', async () => {
  const { srv, win } = setup5({ pageStatus: 500 });
  const body = JSON.stringify({ msgs: [{ method: 'getPlayerStats', data: { sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI' } }], uiv: 3 });
  const req = new Request('https://www.fantrax.com/fxpa/req?leagueId=L1', { method: 'POST', body });
  const r1 = await win.fetch(req);
  assert.equal(srv.calls[0].input, req);
  assert.equal(r1, srv.calls[0].res);
  const url = new URL('https://www.fantrax.com/fxpa/req?leagueId=L1');
  const init = { method: 'POST', body };
  const r2 = await win.fetch(url, init);
  assert.equal(srv.calls[1].input, url);
  assert.equal(srv.calls[1].init, init);
  assert.equal(r2, srv.calls[1].res);
  assert.equal(srv.rulesCalls().length, 0);
  const r3 = await win.fetch('/fxpa/req?leagueId=L1', { method: 'POST', body: JSON.stringify({ msgs: [{ method: 'getPlayerStats', data: {} }], uiv: 3 }) });
  assert.equal(r3.status, 500);
  assert.equal(r3, srv.pageCalls()[0].res);
});

// ---- player card / player page: every FPts / FP/G table ----
const clone6 = (x) => JSON.parse(JSON.stringify(x));
const tbl6 = (d, cap) => d.sectionContent.OVERVIEW.tables.find((t) => t.caption === cap);
const tabTbl = (d) => Object.values(d.sectionContent)[0].tables[0];
const col6 = (t, key) => t.header.cells.findIndex((c) => c.key === key);
const colVals = (t, key) => { const i = col6(t, key); return t.rows.map((r) => r.cells[i].content); };
const PLAIN_ONLY = ['highlight', 'highlightColumn', 'gainColor', 'briefContent', 'props', 'colspan'];

// Every added cell: the neighbour's plain fields, none of its highlight / colour / link / span fields.
function assertPlain(before, after) {
  for (const [key, src] of [['fh_peri', 'fpts'], ['fh_peri_g', 'fptsPerGame']]) {
    const i = col6(after, key);
    if (i < 0) continue;
    const j = col6(before, src);
    const h = after.header.cells[i], hs = before.header.cells[j];
    for (const k of PLAIN_ONLY) assert.equal(k in h, false, key + ' header has ' + k);
    for (const k of Object.keys(hs)) if (!PLAIN_ONLY.includes(k) && !['shortName', 'key', 'name'].includes(k)) assert.deepEqual(h[k], hs[k], key + ' header lost ' + k);
    after.rows.forEach((r, n) => {
      const c = r.cells[i];
      for (const k of PLAIN_ONLY) assert.equal(k in c, false, key + ' cell has ' + k);
      for (const k of Object.keys(before.rows[n].cells[j])) if (!PLAIN_ONLY.includes(k) && !['content', 'toolTip'].includes(k)) assert.deepEqual(c[k], before.rows[n].cells[j][k]);
    });
  }
}
// Fantrax's own cells and header are all still there, in order, untouched.
function assertOnlyAdded(before, after) {
  const ours = new Set(['fh_peri', 'fh_peri_g'].map((k) => col6(after, k)).filter((i) => i >= 0));
  const keep = (cells) => cells.filter((_c, i) => !ours.has(i));
  assert.deepEqual(keep(after.header.cells), before.header.cells);
  after.rows.forEach((r, n) => assert.deepEqual(keep(r.cells), before.rows[n].cells));
  assert.equal(after.caption, before.caption);
}

test('Overview: Recent Games gets Peri after FPts, Recent Trends Peri and Peri/G after FP/G, the season table nothing', () => {
  const orig = clone6(PROFILE_RESPONSE);
  const data = P.augmentProfile(PROFILE_RESPONSE, RULES);
  assert.deepEqual(PROFILE_RESPONSE, orig); // input not mutated
  const rg0 = tbl6(PROFILE_RESPONSE, 'Recent Games'), rg = tbl6(data, 'Recent Games');
  assert.equal(col6(rg, 'fh_peri'), col6(rg0, 'fpts') + 1);
  assert.equal(col6(rg, 'fh_peri_g'), -1); // no FP/G column there
  assert.equal(rg.header.cells[col6(rg, 'fh_peri')].shortName, 'Peri');
  assert.equal(rg.header.cells[col6(rg, 'fh_peri')].name, P.periName(rg0.header.cells[col6(rg0, 'fpts')].name));
  assert.match(rg.header.cells[col6(rg, 'fh_peri')].name, /^Peripheral Fantasy Points/);
  // Oct 16: 5.65 FPts = 4.5 from G + Pt; the rest (Hit, Blk, SOG, faceoffs) is peripheral
  assert.deepEqual(colVals(rg, 'fh_peri'), ['1.15', '3.51', '7.73']);
  assertOnlyAdded(rg0, rg); assertPlain(rg0, rg);
  const rt0 = tbl6(PROFILE_RESPONSE, 'Recent Trends'), rt = tbl6(data, 'Recent Trends');
  assert.equal(col6(rt, 'fh_peri'), col6(rt0, 'fptsPerGame') + 1);
  assert.equal(col6(rt, 'fh_peri_g'), col6(rt0, 'fptsPerGame') + 2);
  assert.deepEqual(rt.header.cells.map((c) => c.shortName).slice(2, 7), ['FPts', 'FP/G', 'Peri', 'Peri/G', 'GP']);
  assert.equal(rt.header.cells[col6(rt, 'fh_peri_g')].name, P.periGName(rt0.header.cells[col6(rt0, 'fptsPerGame')].name));
  rt.rows.forEach((r, n) => {
    const st = P.profileStats(rt0.header.cells, rt0.rows[n].cells);
    const peri = st.SOG * 0.45 + st.Hit * 0.6 + st.Blk * 0.7 + st.FOW * 0.3 - st.FOL * 0.27;
    assert.equal(r.cells[col6(rt, 'fh_peri')].content, P.fmt2(peri));
    assert.equal(r.cells[col6(rt, 'fh_peri_g')].content, st.GP > 0 ? P.fmt2(peri / st.GP) : '–');
  });
  assertOnlyAdded(rt0, rt); assertPlain(rt0, rt);
  assert.equal(tbl6(data, '2026-27 Stats'), tbl6(PROFILE_RESPONSE, '2026-27 Stats')); // no FPts column: same object
  assert.deepEqual(data.sectionContent.OVERVIEW.tables.map((t) => t.caption), ['2026-27 Stats', 'Recent Games', 'Recent Trends']);
});

test('Recent Trends FPts / FP/G highlight and the date-range briefContent are not copied into our cells', () => {
  const rt0 = tbl6(PROFILE_RESPONSE, 'Recent Trends');
  const fi = col6(rt0, 'fpts');
  const withHl = clone6(PROFILE_RESPONSE);
  for (const r of tbl6(withHl, 'Recent Trends').rows) Object.assign(r.cells[fi], { highlight: true, gainColor: 'x', briefContent: 'b' });
  tbl6(withHl, 'Recent Trends').header.cells[fi].highlightColumn = true;
  const rt = tbl6(P.augmentProfile(withHl, RULES), 'Recent Trends');
  assertPlain(tbl6(withHl, 'Recent Trends'), rt);
  assert.equal(rt.rows[0].cells[fi].highlight, true); // Fantrax's own FPts cell keeps its highlight
});

test('Stats tab: whole-point past seasons are checked to the shown digit; HT solved; blank FPts gives –', () => {
  const d = P.augmentProfile(PROFILE_TAB_STATS, RULES);
  const t0 = tabTbl(PROFILE_TAB_STATS), t = tabTbl(d);
  assert.deepEqual(t.header.cells.map((c) => c.shortName).slice(0, 7), ['Season', 'Team', 'FPts', 'FP/G', 'Peri', 'Peri/G', 'GP']);
  assert.deepEqual(colVals(t0, 'fpts'), ['46.5', '215', '59', '']);
  // no HT column: 2026-27 and 2025-26 (3 goals) solve to HT 0; 2025-26 rebuilds to 214.8 vs shown "215";
  // 2024-25 rebuilt 59.15 vs shown "59", peri SOG 19 x .45 + Hit 39 x .6 + Blk 16 x .7 = 43.15 over 28 GP;
  // Career Total has no FPts.
  assert.deepEqual(colVals(t, 'fh_peri'), ['24.50', '161.80', '43.15', '–']);
  assert.deepEqual(colVals(t, 'fh_peri_g'), ['2.72', '2.31', '1.54', '–']);
  assert.equal(t.rows[0].cells[col6(t, 'fh_peri')].toolTip, undefined);
  assert.match(t.rows[3].cells[col6(t, 'fh_peri')].toolTip, /no FPts/);
  assertOnlyAdded(t0, t); assertPlain(t0, t);
});

test('Stats tab: a whole-point FPts more than half a point off is a mismatch (?)', () => {
  const bad = clone6(PROFILE_TAB_STATS);
  tabTbl(bad).rows[2].cells[col6(tabTbl(bad), 'fpts')].content = '60';
  const t = tabTbl(P.augmentProfile(bad, RULES));
  assert.equal(colVals(t, 'fh_peri')[2], '?');
  assert.equal(colVals(t, 'fh_peri_g')[2], '?');
  assert.ok(t.rows[2].cells[col6(t, 'fh_peri')].toolTip);
});

test('Splits tab: per-split totals; a split with 3+ goals solves HT', () => {
  const t0 = tabTbl(PROFILE_TAB_SPLITS), t = tabTbl(P.augmentProfile(PROFILE_TAB_SPLITS, RULES));
  assert.deepEqual(t0.rows.map((r) => r.cells[0].content), ['Home', 'Away', 'Day', 'Night', 'vs. NJD']);
  // Home: 12.35 FPts = G 3 + Pt 3 (D) + GWG 2 + SOG 0.45 + Hit 1.8 + Blk 2.1 -> peri 4.35 over 3 GP
  assert.deepEqual(colVals(t, 'fh_peri'), ['4.35', '20.15', '2.60', '21.90', '2.60']);
  assert.deepEqual(colVals(t, 'fh_peri_g'), ['1.45', '3.36', '2.60', '2.74', '2.60']);
  assertOnlyAdded(t0, t); assertPlain(t0, t);
});

test('Games (Fntsy) tab: the league categories directly; Games tab: HT from G and faceoffs from W-L-%', () => {
  for (const fx of [PROFILE_TAB_GAME_LOG_FANTASY, PROFILE_TAB_GAME_LOG]) {
    const t0 = tabTbl(fx), t = tabTbl(P.augmentProfile(fx, RULES));
    assert.equal(col6(t, 'fh_peri'), col6(t0, 'fpts') + 1);
    assert.equal(col6(t, 'fh_peri_g'), -1);
    assert.deepEqual(colVals(t, 'fh_peri'), ['3.50', '1.90', '3.30', '2.60']);
    assertOnlyAdded(t0, t); assertPlain(t0, t);
  }
});

test('a per-game row may derive a hat trick from G >= 3', () => {
  const fx = clone6(PROFILE_TAB_GAME_LOG);
  const t0 = tabTbl(fx), hc = t0.header.cells, at = (s) => hc.findIndex((c) => c.shortName === s);
  const r = t0.rows[0].cells; // 1 G game, 9.5 FPts: make it 3 G (+6 G, +6 Pt as D) and a hat trick (+3)
  r[at('G')].content = '3'; r[at('Pt')].content = '3'; r[col6(t0, 'fpts')].content = '24.5';
  assert.equal(colVals(tabTbl(P.augmentProfile(fx, RULES)), 'fh_peri')[0], '3.50');
});

test('positions: Overview defaultPosition, tab responses leagueData Eligible; goalie profile unchanged', () => {
  assert.deepEqual(P.profilePositions({ defaultPosition: 'C,LW' }), ['C', 'LW']);
  assert.deepEqual(P.profilePositions(PROFILE_TAB_STATS.miscData), ['D']);
  assert.deepEqual(P.profilePositions({ leagueData: [{ name: 'Eligible', value: 'LW,G,Skt' }] }), ['LW']);
  const g = clone6(PROFILE_TAB_SPLITS);
  g.miscData.leagueData.find((x) => x.name === 'Eligible').value = 'G';
  assert.equal(P.augmentProfile(g, RULES), g);
  const g2 = clone6(PROFILE_RESPONSE);
  g2.miscData.defaultPosition = 'G';
  assert.equal(P.augmentProfile(g2, RULES), g2);
  // a forward-scored D would not reconcile: ? (the Pt override is what makes Fantrax's FPts)
  const f = clone6(PROFILE_TAB_SPLITS);
  f.miscData.leagueData.find((x) => x.name === 'Eligible').value = 'C,Skt';
  assert.equal(colVals(tabTbl(P.augmentProfile(f, RULES)), 'fh_peri')[0], '?');
});

test('tables without FPts / FP/G and tabs without tables are returned as they are', () => {
  const trans = { sectionContent: { TRANSACTIONS: { tables: [{ caption: 'Transactions', header: { cells: [{ shortName: 'Date', key: 'date' }, { shortName: 'Transaction', key: 'tx', align: 'LEFT' }] }, rows: [] }] } },
    miscData: { leagueData: [{ name: 'Eligible', value: 'D,Skt' }] } };
  assert.equal(P.augmentProfile(trans, RULES), trans);
  const news = { sectionContent: { NEWS_NOTES: { playerNews: [] } }, miscData: trans.miscData };
  assert.equal(P.augmentProfile(news, RULES), news);
  const svc = { sectionContent: { TEAM_SERVICE_TIME: { tables: [{ caption: 'Team Service Time', header: { cells: [{ shortName: 'Period', key: 'period' }] },
    rows: [{ cells: [{ content: 'Not on a team', colspan: 4 }] }] }] } }, miscData: trans.miscData };
  assert.equal(P.augmentProfile(svc, RULES), svc);
});

test('a message row (colspan) in an FPts table widens by the added columns; nothing else changes', () => {
  const fx = clone6(PROFILE_TAB_SPLITS);
  const t0 = tabTbl(fx);
  const n = t0.header.cells.length;
  t0.rows.push({ cells: [{ content: 'No games', colspan: n }] });
  const t = tabTbl(P.augmentProfile(fx, RULES));
  assert.deepEqual(t.rows[5].cells, [{ content: 'No games', colspan: n + 2 }]);
  assert.equal(t.header.cells.length, n + 2);
  // a partial span (Season + Team in one cell, then the stats) is left exactly as it is
  const fx2 = clone6(PROFILE_TAB_STATS);
  const s0 = tabTbl(fx2);
  const part = { cells: [{ content: '2021-22 MTL', colspan: 2 }, ...s0.rows[2].cells.slice(2)] };
  s0.rows.push(part);
  const s1 = tabTbl(P.augmentProfile(fx2, RULES));
  assert.equal(JSON.stringify(s1.rows[s1.rows.length - 1]), JSON.stringify(part));
  // a single cell whose colspan is not the full width: untouched too
  const fx3 = clone6(PROFILE_TAB_STATS);
  const odd = { cells: [{ content: 'note', colspan: 3 }] };
  tabTbl(fx3).rows.push(odd);
  const s3 = tabTbl(P.augmentProfile(fx3, RULES));
  assert.equal(JSON.stringify(s3.rows[s3.rows.length - 1]), JSON.stringify(odd));
});

test('fmt2 rounds half away from zero like Fantrax', () => {
  assert.equal(P.fmt2(9.65 / 2), '4.83');
  assert.equal(P.fmt2(-0.0001), '0.00');
  assert.equal(P.fmt2(-0.755), '-0.76');
  assert.equal(P.fmt2(43.15), '43.15');
});

test('totals rows: with G < 3 the solved HT can only be 0', () => {
  const s = zero({ G: 2, Pt: 2 });
  delete s.HT;
  assert.equal(P.rowPeri(s, ['C'], 6 + 3, RULES).status, 'ok');
  assert.equal(P.rowPeri(s, ['C'], 6 + 3 + 3, RULES).status, 'mismatch');
});

test('fptsTolerance and fptsNum', () => {
  assert.ok(Math.abs(P.fptsTolerance('12.35') - P.FPTS_TOLERANCE) < 1e-5);
  assert.ok(Math.abs(P.fptsTolerance('59') - 0.5) < 1e-5);
  // live 2026-10-17: the Stats tab shows a 9.65 FPts season as "9.7"; 9.65 - 9.7 is 0.05000000000000071 in floats
  assert.ok(Math.abs(9.65 - 9.7) <= P.fptsTolerance('9.7'));
  assert.ok(0.06 > P.fptsTolerance('9.7'));
  assert.ok(Number.isNaN(P.fptsNum('')));
  assert.ok(Number.isNaN(P.fptsNum('-')));
  assert.equal(P.fptsNum('1,008.5'), 1008.5);
});

test('the hook rewrites every profile tab response it is handed (Overview and Stats in one go)', async () => {
  const fetchImpl = async (url, init) => {
    const msgs = JSON.parse(init.body).msgs;
    const responses = msgs.map((m) => ({ data: m.method === 'getLeagueRulesOld' ? { content: RULES_HTML }
      : m.data.tab === 'STATS' ? PROFILE_TAB_STATS : PROFILE_RESPONSE }));
    return new Response(JSON.stringify({ responses }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const win = { fetch: fetchImpl };
  P.install(win, { fetch: fetchImpl, retryDelay: 0, delay: () => new Promise(() => {}) });
  await win.fetch.prewarm('LP');
  const body = JSON.stringify({ msgs: [{ method: 'getPlayerProfile', data: { playerId: 'p9' } }, { method: 'getPlayerProfile', data: { playerId: 'p9', tab: 'STATS' } }], uiv: 3 });
  const res = await win.fetch('/fxpa/req?leagueId=LP', { method: 'POST', body });
  const [a, b] = (await res.json()).responses.map((r) => r.data);
  assert.ok(col6(tbl6(a, 'Recent Games'), 'fh_peri') > 0);
  assert.ok(col6(tbl6(a, 'Recent Trends'), 'fh_peri_g') > 0);
  assert.deepEqual(colVals(tabTbl(b), 'fh_peri'), ['24.50', '161.80', '43.15', '–']);
});

test('DOM code exists only in the Live Scoring display layer; install without a document touches nothing', () => {
  for (const k of ['syncCard', 'syncTint', 'cardState', 'summaryText', 'tintIndices', 'startDomObserver']) assert.equal(k in P, false, k);
  const src = require('fs').readFileSync(new URL('../fantrax-peripherals.user.js', import.meta.url), 'utf8');
  const layer = src.slice(src.indexOf('// ---- Live Scoring display'), src.indexOf('// ---- network'));
  const rest = src.replace(layer, '');
  assert.match(layer, /MutationObserver/);
  assert.doesNotMatch(rest, /MutationObserver|createElement|querySelector|insertAdjacent|<style|data-fpx|document\./);
  const sets = [];
  const target = { fetch: async () => new Response('{}') };
  const win = new Proxy(target, { set(t, k, v) { sets.push(k); t[k] = v; return true; } });
  P.install(win, { retryDelay: 0, delay: () => new Promise(() => {}) });
  assert.deepEqual(sets, ['fetch']);
});

// ---- Live Scoring display: a minimal fake DOM (selectors: tag, .class, tag.class, [attr]) ----
function fel(tag, cls = '', text = '', kids = []) {
  const e = { tagName: tag.toUpperCase(), className: cls, ownText: text, children: [], parentElement: null, attrs: {} };
  e.classList = { contains: (c) => e.className.split(/\s+/).includes(c) };
  Object.defineProperty(e, 'textContent', { get: () => e.ownText + e.children.map((c) => c.textContent).join(''),
    set: (v) => { e.ownText = String(v); e.children = []; } });
  e.getAttribute = (k) => (k in e.attrs ? e.attrs[k] : null);
  e.setAttribute = (k, v) => { e.attrs[k] = String(v); };
  e.removeAttribute = (k) => { delete e.attrs[k]; };
  e.append = (...cs) => { for (const c of cs) { c.parentElement = e; e.children.push(c); } return e; };
  e.appendChild = (c) => { e.append(c); return c; };
  const match = (x, sel) => {
    const a = sel.match(/^\[([^\]]+)\]$/);
    if (a) return x.getAttribute(a[1]) !== null;
    const [t, ...cs] = sel.split('.');
    return (!t || x.tagName === t.toUpperCase()) && cs.every((c) => x.classList.contains(c));
  };
  e.querySelectorAll = (sel) => {
    const out = [];
    const walk = (x) => { for (const c of x.children) { if (match(c, sel)) out.push(c); walk(c); } };
    walk(e);
    return out;
  };
  e.querySelector = (sel) => e.querySelectorAll(sel)[0] || null;
  e.append(...kids);
  return e;
}
const peri = (e) => e.getAttribute('data-fpx-peri') !== null;
const cellsOf = (tag, texts) => texts.map((t) => fel(tag, '', t));
const HEAD_ALL = ['Team', ...Array.from({ length: 16 }, (_, i) => 'c' + i), 'Peri', ...Array.from({ length: 6 }, (_, i) => 'g' + i)];
function liveDoc() {
  const strip = fel('div', 'league-livescoring-summary', '', [
    fel('div', 'league-livescoring-summary__row', '', cellsOf('span', ['12', 'FOL', '9'])),
    fel('div', 'league-livescoring-summary__row', '', cellsOf('span', ['3.5', 'Peri', '2.25'])),
  ]);
  const chipFow = fel('li', '', ' 2 ', [fel('b', '', 'FOW')]);
  const chipPeri = fel('li', '', ' 3.66 ', [fel('b', '', 'Peri')]);
  const chips = fel('div', 'scoring-table__cell__content', '', [fel('ul', '', '', [chipFow, chipPeri])]);
  const skaters = fel('ultimate-table', '', '', [fel('table', '', '', [
    fel('tr', '_ut__head', '', cellsOf('th', ['Skaters', 'FPts', 'Prj', 'Opp', 'G', 'FOL', 'Peri'])),
    fel('tr', '', '', cellsOf('td', ['5', '4', 'BOS', '1', '-1', '1.5'])),
    fel('tr', '', '', cellsOf('td', ['2', '3', 'NYR', '0', '0', '0.75'])),
    fel('tr', '', '', cellsOf('td', ['No players'])),
  ])]);
  const goalies = fel('ultimate-table', '', '', [fel('table', '', '', [
    fel('tr', '_ut__head', '', cellsOf('th', ['Goalies', 'FPts', 'W', 'SV'])),
    fel('tr', '', '', cellsOf('td', ['7', '1', '30'])),
  ])]);
  const all = fel('league-livescoring-stat-table', '', '', [fel('div', 'i-table', '', [
    fel('div', 'i-table__row i-table__header', '', cellsOf('div', HEAD_ALL)),
    fel('div', 'i-table__row', '', cellsOf('div', HEAD_ALL.map((_, i) => 'v' + i))),
    fel('div', 'i-table__row', '', cellsOf('div', HEAD_ALL.map((_, i) => 'w' + i))),
    fel('div', 'i-table__row', '', cellsOf('div', ['Totals', 'x', 'y'])),
  ])]);
  const pills = fel('div', 'pills', '', [fel('button', 'pill pill--active', ' Stats '), fel('button', 'pill', ' Fpts ')]);
  const app = fel('app-league-livescoring', '', '', [pills, strip, chips, skaters, goalies, all]);
  const outside = fel('div', 'league-livescoring-summary__row', '', cellsOf('span', ['1', 'Peri', '2']));
  const doc = fel('body', '', '', [app, outside]);
  return { doc, strip, chipFow, chipPeri, skaters, goalies, all, pills, outside };
}
const LS_URL = 'https://www.fantrax.com/fantasy/league/abc123/livescoring';

test('liveMode: the active pill, else the URL mode param on Live Scoring, else null', () => {
  const d = liveDoc();
  assert.equal(P.liveMode(d.doc, LS_URL + '?mode=fpts'), 'stats');      // the pill wins over the URL
  const [stats, fpts] = d.pills.children;
  stats.className = 'pill'; fpts.className = 'pill pill--active';
  assert.equal(P.liveMode(d.doc, LS_URL), 'fpts');
  const bare = fel('body', '', '', [fel('app-league-livescoring')]);
  assert.equal(P.liveMode(bare, LS_URL + '?mode=fpts'), 'fpts');
  assert.equal(P.liveMode(bare, LS_URL + ';period=3?x=1'), 'stats');
  assert.equal(P.liveMode(bare, LS_URL), 'stats');
  assert.equal(P.liveMode(bare, 'https://www.fantrax.com/fantasy/league/abc123/players'), null);
  assert.equal(P.liveMode(fel('body'), LS_URL + '?mode=fpts'), null);  // no app-league-livescoring: null
});

test('markLivePeri marks only our Peri: strip row, chip, Classic column, All Teams column', () => {
  const d = liveDoc();
  P.markLivePeri(d.doc);
  const [fol, per] = d.strip.children;
  assert.equal(peri(fol), false);
  assert.equal(peri(per), true);
  assert.equal(peri(d.chipFow), false);
  assert.equal(peri(d.chipPeri), true);
  const [head, r1, r2] = d.skaters.children[0].children;
  assert.deepEqual(head.children.map(peri), [false, false, false, false, false, false, true]);
  assert.deepEqual(r1.children.map(peri), [false, false, false, false, false, true]);
  assert.deepEqual(r2.children.map(peri), [false, false, false, false, false, true]);
  assert.equal(peri(d.skaters.children[0].children[3].children[0]), false); // a one-cell message row: untouched
  for (const r of d.goalies.children[0].children) assert.ok(!r.children.some(peri));
  const [ah, a1, a2, short] = d.all.children[0].children;
  assert.equal(ah.children.length, 24);
  for (const r of [ah, a1, a2]) assert.deepEqual(r.children.map((c, i) => peri(c) ? i : -1).filter((i) => i >= 0), [17]);
  assert.ok(!short.children.some(peri));
  assert.equal(peri(d.outside), false);                                 // outside app-league-livescoring
  assert.equal(d.doc.querySelectorAll('[data-fpx-peri]').length, 1 + 1 + 3 + 3);
});

test('markLivePeri with Peri as the first category: Classic column right after Opp, All Teams column right after Proj', () => {
  const skaters = fel('ultimate-table', '', '', [fel('table', '', '', [
    fel('tr', '_ut__head', '', cellsOf('th', ['Skaters', 'FPts', 'Prj', 'Opp', 'Peri', 'G', 'FOL'])),
    fel('tr', '', '', cellsOf('td', ['5', '4', 'BOS', '1.5', '1', '-1'])),
    fel('tr', '', '', cellsOf('td', ['2', '3', 'NYR', '0.75', '0', '0'])),
    fel('tr', '', '', cellsOf('td', ['No players'])),
  ])]);
  const head = ['Team', 'FPts', '+/-', 'Proj', 'Peri', 'G', 'A', 'FOL', 'W'];
  const all = fel('league-livescoring-stat-table', '', '', [fel('div', 'i-table', '', [
    fel('div', 'i-table__row i-table__header', '', cellsOf('div', head)),
    fel('div', 'i-table__row', '', cellsOf('div', head.map((_, i) => 'v' + i))),
  ])]);
  const doc = fel('body', '', '', [fel('app-league-livescoring', '', '', [skaters, all])]);
  P.markLivePeri(doc);
  const [h, r1, r2, msg] = skaters.children[0].children;
  assert.deepEqual(h.children.map(peri), [false, false, false, false, true, false, false]);
  assert.deepEqual(r1.children.map(peri), [false, false, false, true, false, false]);
  assert.deepEqual(r2.children.map(peri), [false, false, false, true, false, false]);
  assert.equal(r1.children[3].textContent, '1.5');
  assert.equal(peri(msg.children[0]), false);
  for (const r of all.children[0].children) assert.deepEqual(r.children.map((c, i) => peri(c) ? i : -1).filter((i) => i >= 0), [4]);
});

test('markLivePeri unmarks a reused node whose label is no longer Peri', () => {
  const d = liveDoc();
  P.markLivePeri(d.doc);
  const b = d.chipPeri.children[0];
  const lab = d.strip.children[1].children[1];
  b.ownText = 'FOW'; lab.ownText = 'FOW';
  P.markLivePeri(d.doc);
  assert.equal(peri(d.chipPeri), false);
  assert.equal(peri(d.strip.children[1]), false);
  assert.equal(peri(d.skaters.children[0].children[0].children[6]), true); // the rest stays marked
});

test('startLiveDisplay: html attribute follows the mode, one style, re-marked on mutations', () => {
  const d = liveDoc();
  const html = fel('html', '', '', [fel('head'), d.doc]);
  let cb = null, opts = null;
  const document = { documentElement: html, head: html.children[0],
    querySelector: html.querySelector, querySelectorAll: html.querySelectorAll,
    getElementById: (id) => html.querySelectorAll('style').find((s) => s.id === id) || null,
    createElement: (t) => fel(t) };
  const win = { document, location: { href: LS_URL, get pathname() { return new URL(this.href).pathname; } },
    MutationObserver: function (fn) { cb = fn; this.observe = (t, o) => { assert.equal(t, html); opts = o; }; this.disconnect = () => {}; } };
  P.startLiveDisplay(win);
  assert.deepEqual(opts.attributeFilter, ['class']);
  assert.equal(html.getAttribute('data-fpx-live'), 'stats');
  const styles = html.querySelectorAll('style');
  assert.equal(styles.length, 1);
  assert.equal(styles[0].id, P.LIVE_STYLE_ID);
  assert.equal(styles[0].ownText, 'html[data-fpx-live="stats"] [data-fpx-peri]{display:none !important}');
  assert.equal(peri(d.chipPeri), true);
  const [stats, fpts] = d.pills.children;
  stats.className = 'pill'; fpts.className = 'pill pill--active';
  cb([{ type: 'attributes' }]);
  assert.equal(html.getAttribute('data-fpx-live'), 'fpts');
  d.chipPeri.children[0].ownText = 'FOW';
  cb([{ type: 'attributes' }]);                                         // no content change, same mode: not re-marked
  assert.equal(peri(d.chipPeri), true);
  cb([{ type: 'characterData' }]);
  assert.equal(peri(d.chipPeri), false);
  win.location.href = 'https://www.fantrax.com/fantasy/league/abc123/players';
  html.children[1].children.shift();                                    // the route left Live Scoring
  cb([{ type: 'childList' }]);
  assert.equal(html.getAttribute('data-fpx-live'), null);
  assert.equal(html.querySelectorAll('style').length, 1);
  assert.deepEqual(opts, { childList: true, subtree: true });           // off Live Scoring: child lists only
});

test('startLiveDisplay off Live Scoring: light observer, no DOM query, no style; at document-start (no head) the style goes on <html>', () => {
  let queries = 0, opts = null, cb = null;
  const html = fel('html');
  const count = (f) => (...a) => { queries++; return f(...a); };
  const document = { documentElement: html, head: null, querySelector: count(html.querySelector),
    querySelectorAll: count(html.querySelectorAll), getElementById: count(() => null), createElement: (t) => fel(t) };
  const win = { document, location: { href: 'https://www.fantrax.com/fantasy/league/abc123/players', get pathname() { return new URL(this.href).pathname; } },
    MutationObserver: function (fn) { cb = fn; this.observe = (t, o) => { opts = o; }; this.disconnect = () => {}; } };
  P.startLiveDisplay(win);
  for (let k = 0; k < 50; k++) cb([{ type: 'childList' }]);
  assert.equal(queries, 0);
  assert.deepEqual(opts, { childList: true, subtree: true });
  assert.equal(html.getAttribute('data-fpx-live'), null);
  // in-app navigation to Live Scoring at document-start: no <head> yet
  win.location.href = LS_URL;
  html.append(fel('body', '', '', [fel('app-league-livescoring')]));
  document.getElementById = (id) => html.querySelectorAll('style').find((s) => s.id === id) || null;
  cb([{ type: 'childList' }]);
  assert.equal(html.getAttribute('data-fpx-live'), 'stats');
  assert.deepEqual(opts.attributeFilter, ['class']);
  assert.equal(html.children.filter((c) => c.tagName === 'STYLE').length, 1);
});

test('startLiveDisplay: an error in the display layer warns once and never throws into the page', () => {
  const w = console.warn; const warned = []; console.warn = (...a) => warned.push(a);
  try {
    let cb = null;
    const html = fel('html');
    const document = { documentElement: html, head: null, querySelector: () => { throw new Error('boom'); },
      querySelectorAll: () => [], getElementById: () => null, createElement: (t) => fel(t) };
    const win = { document, location: { href: LS_URL, get pathname() { return new URL(this.href).pathname; } },
      MutationObserver: function (fn) { cb = fn; this.observe = () => {}; this.disconnect = () => {}; } };
    P.startLiveDisplay(win);
    cb([{ type: 'childList' }]); cb([{ type: 'childList' }]);
    assert.equal(warned.length, 1);
    assert.equal(warned[0][0], '[fpx]');
  } finally { console.warn = w; }
});

test('pool cache evicts expired entries on insert and keeps at most 4', async () => {
  const clock = { t: 1e12 };
  const srv = server5();
  const st = P.newState({ now: () => clock.t });
  const pull = (n) => P.pullPool('L1', { sortType: 'SCORE', scoringCategoryType: '5', timeframe: 'x' + n }, (lid, msgs) => P.api(lid, msgs, srv.fetch, 0), st);
  await pull(1); await pull(2);
  assert.equal(st.pools.size, 2);
  clock.t += 3 * 60 * 1000 + 1;
  await pull(3);
  assert.equal(st.pools.size, 1); // 1 and 2 expired
  await pull(4); await pull(5); await pull(6); await pull(7);
  assert.equal(st.pools.size, 4); // oldest (3) out
  assert.ok(![...st.pools.keys()].some((k) => k.includes('x3')));
  assert.ok([...st.pools.keys()].some((k) => k.includes('x7')));
});

test('a response with no FP/G column passes through with no pull and no wait', async () => {
  const noFpg = clone5(STATS_RESPONSE);
  noFpg.tableHeader.cells = noFpg.tableHeader.cells.filter((c) => c.key !== 'fptsPerGame');
  noFpg.statsTable = noFpg.statsTable.map((r) => ({ ...r, cells: r.cells.slice(0, noFpg.tableHeader.cells.length) }));
  const { srv, sendJson } = setup5({ stats: (d) => (d.maxResultsPerPage === '500' ? undefined : noFpg) });
  const d = await sendJson({ pageNumber: '1', scoringCategoryType: '1' });
  assert.deepEqual(d, noFpg);
  assert.equal(srv.poolCalls().length, 0);
});

test('a points-less rules page is cached for the page life, not retried every 5 minutes', async () => {
  const clock = { t: 1e12 };
  const cats = '<table><tr><th class="scGroup"><p>Group</p></th><th class="scoringPts"><p>Category</p></th></tr>'
    + '<tr><td class="scGroup"><p>Skaters</p></td><td class="scoringPts"><p>Goals (G)</p></td></tr></table>';
  const { srv, send } = setup5({ rules: cats }, clock);
  await send({ pageNumber: '1' });
  assert.equal(srv.rulesCalls().length, 1);
  clock.t += 60 * 60 * 1000;
  await send({ pageNumber: '1' });
  assert.equal(srv.rulesCalls().length, 1);
});

// ---- Team Roster (getTeamRosterInfo), Stats and Fantasy Points views ----
const clone7 = (x) => JSON.parse(JSON.stringify(x));
const nameOf7 = (r) => (r.scorer && r.scorer.name) || r.scorerColumn || r.numSpotsAvailableText || 'EMPTY';
// Header-aligned (Totals rows are one cell short at the front) Peri / Peri-G text per row, by row name.
function peri7(d) {
  const t = d.tables[0], hc = t.header.cells, i = hc.findIndex((c) => c.key === 'fh_peri'), j = hc.findIndex((c) => c.key === 'fh_peri_g');
  const out = {};
  for (const r of t.rows) { const off = P.rowOffset(hc, r); out[nameOf7(r)] = r.cells[i - off].content + ' ' + r.cells[j - off].content; }
  return out;
}
// Fake Fantrax for roster requests: answer(data) -> response data; records every call.
function rosterServer(answer) {
  const calls = [];
  const fetch = (url, init) => {
    const call = { url, init, msgs: JSON.parse(init.body).msgs };
    calls.push(call);
    const responses = call.msgs.map((m) => ({ data: m.method === 'getLeagueRulesOld' ? { content: RULES_HTML } : answer(m.data || {}, m.method) }));
    call.res = new Response(JSON.stringify({ responses }), { status: 200, headers: { 'content-type': 'application/json' } });
    return Promise.resolve(call.res);
  };
  const win = { fetch };
  P.install(win, { retryDelay: 0, delay: () => new Promise(() => {}) });
  const send = async (data, extra = { uiv: 3, refUrl: 'x', dt: 0, at: 0, tz: 'x', v: 'x' }) => {
    await win.fetch.prewarm('L7'); // the page pre-warms the rules (see setup5)
    const res = await win.fetch('/fxpa/req?leagueId=L7', { method: 'POST',
      body: JSON.stringify(Object.assign({ msgs: [{ method: 'getTeamRosterInfo', data }] }, extra)) });
    return (await res.json()).responses[0].data;
  };
  // lookup views: the first answer is loading ('– –', loading tip) and warms the cache; the second has the numbers
  const sendWarm = async (data) => {
    const first = await send(data);
    const t = first.tables[0], i = t.header.cells.findIndex((c) => c.key === 'fh_peri');
    const player = t.rows.find((r) => r.scorer && r.scorer.scorerId && r.scorer.posShortNames !== 'G');
    if (i >= 0 && player) { assert.equal(player.cells[i].content, '–'); assert.equal(player.cells[i].toolTip, P.LOADING_TIP); }
    await settle5();
    return send(data);
  };
  const lookups = () => calls.filter((c) => c.init.body.indexOf('uiv') < 0 && c.msgs[0].method === 'getTeamRosterInfo');
  return { calls, win, send, sendWarm, lookups };
}

test('roster Stats view (lineup day): FPts | FP/G | Peri | Peri/G, blank rows, Totals, goalies untouched', async () => {
  const { send, lookups } = rosterServer(() => clone7(ROSTER_STATS_DAY));
  const d = await send({ leagueId: 'L7', view: 'STATS', period: '18' });
  const t = d.tables[0], hc = t.header.cells;
  const fi = hc.findIndex((c) => c.key === 'fpts'), gi = hc.findIndex((c) => c.key === 'fptsPerGame');
  assert.deepEqual(hc.slice(fi, fi + 5).map((c) => c.shortName), ['FPts', 'FP/G', 'Peri', 'Peri/G', 'GP']);
  assert.equal(gi, fi + 1);
  assert.equal(hc.length, ROSTER_STATS_DAY.tables[0].header.cells.length + 2);
  for (const h of [hc[gi + 1], hc[gi + 2]]) for (const k of ['sortType', 'sortKey', 'scipId', 'highlightColumn']) assert.equal(h[k], undefined, k);
  // live names: "Fantasy Points" / "Average Fantasy Points per Game"
  assert.equal(hc[gi + 1].name, 'Peripheral Fantasy Points');
  assert.equal(hc[gi + 2].name, 'Average Peripheral Fantasy Points per Game');
  // every row grew by exactly two cells (Totals stays one short)
  t.rows.forEach((r, k) => assert.equal(r.cells.length, ROSTER_STATS_DAY.tables[0].rows[k].cells.length + 2));
  assert.deepEqual(peri7(d), {
    'Bo Horvat': '0.00 –', 'Morgan Geekie': '1.51 1.51', 'Benjamin Kindel': '0.39 0.39', 'Nikita Zadorov': '3.60 3.60',
    EMPTY: ' ', 'Roman Kantserov': '0.00 –', 'Reserve spot(s) available': ' ', 'Troy Terry': '0.00 –',
    'Inj Res spot(s) available': ' ', Totals: '5.50 1.83',
  });
  // Totals (one cell short, offset 1): FPts "10", FP/G "3.33", then Peri, Peri/G, then its GP
  const tot = t.rows.find((r) => r.scorerColumn === 'Totals');
  const k = tot.cells.findIndex((c) => c.content === '10');
  assert.deepEqual(tot.cells.slice(k, k + 5).map((c) => c.content), ['10', '3.33', '5.50', '1.83', '3']);
  // plain cells: copies of the FPts / FP-G cell, no tooltip, no extra fields
  const geekie = t.rows.find((r) => nameOf7(r) === 'Morgan Geekie');
  assert.deepEqual(geekie.cells[gi + 1], { content: '1.51' });
  assert.deepEqual(geekie.cells[gi + 2], { content: '1.51' });
  // the rest of each row is Fantrax's own
  assert.deepEqual(Object.keys(geekie).sort(), Object.keys(ROSTER_STATS_DAY.tables[0].rows[1]).sort());
  assert.deepEqual(geekie.cells.filter((c, i) => i !== gi + 1 && i !== gi + 2), ROSTER_STATS_DAY.tables[0].rows[1].cells);
  assert.deepEqual(d.tables[1], ROSTER_STATS_DAY.tables[1]); // goalies
  assert.equal(lookups().length, 0);
});

test('roster Fantasy Points view: the same numbers from the point cells (lineup day and season)', async () => {
  const { send, lookups } = rosterServer((d) => clone7(d.view === 'FPTS'
    ? (d.period ? ROSTER_FPTS_DAY : ROSTER_FPTS_SEASON) : (d.period ? ROSTER_STATS_DAY : ROSTER_STATS_SEASON)));
  for (const extra of [{ period: '18' }, { seasonOrProjection: 'SEASON_31l_YEAR_TO_DATE' }]) {
    const s = await send(Object.assign({ leagueId: 'L7', view: 'STATS' }, extra));
    const f = await send(Object.assign({ leagueId: 'L7', view: 'FPTS' }, extra));
    assert.deepEqual(peri7(f), peri7(s));
  }
  const f = await send({ leagueId: 'L7', view: 'FPTS', seasonOrProjection: 'SEASON_31l_YEAR_TO_DATE' });
  assert.deepEqual(peri7(f), { 'Bo Horvat': '221.18 3.25', 'Jesper Bratt': '140.04 1.71', 'Morgan Geekie': '169.66 2.09',
    'Kiefer Sherwood': '299.31 4.16', 'Quinn Hughes': '149.25 2.02', 'Nikita Zadorov': '237.15 2.93', EMPTY: ' ' });
  assert.equal(lookups().length, 0);
});

test('roster Fantasy Points view check: cells that do not add up to FPts give ?, missing FPts gives –', () => {
  const d = clone7(ROSTER_FPTS_SEASON);
  const hc = d.tables[0].header.cells, sog = hc.findIndex((c) => c.shortName === 'SOG'), fi = hc.findIndex((c) => c.key === 'fpts');
  d.tables[0].rows[0].cells[sog].content = String(Number(d.tables[0].rows[0].cells[sog].content) + 0.45);
  d.tables[0].rows[1].cells[fi].content = '-';
  const a = P.augmentRoster(d, RULES4, P.rosterPeri(d, RULES4));
  const v = peri7(a);
  assert.equal(v['Bo Horvat'], '? ?');
  assert.equal(v['Jesper Bratt'], '– –');
  const i = a.tables[0].header.cells.findIndex((c) => c.key === 'fh_peri');
  assert.match(a.tables[0].rows[0].cells[i].toolTip, /FPts is not the sum/);
});

test('roster Stats view check: a row whose stats do not rebuild FPts gives ?; the Totals row is checked on its own cells', () => {
  const d = clone7(ROSTER_STATS_DAY);
  const hc = d.tables[0].header.cells, hit = hc.findIndex((c) => c.shortName === 'Hit');
  d.tables[0].rows[1].cells[hit].content = '4'; // Geekie: FPts no longer matches
  const v = peri7(P.augmentRoster(d, RULES4, P.rosterPeri(d, RULES4)));
  assert.equal(v['Morgan Geekie'], '? ?');
  assert.equal(v.Totals, '5.50 1.83'); // the Totals row's own cells still check
  // Totals FPts 10 with Pt 1: forwards' 1.5 or a defenceman's 3 per point allow 10..11.5, so 12 cannot be right
  const e = clone7(ROSTER_STATS_DAY);
  const tot = e.tables[0].rows.find((r) => r.scorerColumn === 'Totals');
  tot.cells.find((c) => c.content === '10').content = '12';
  assert.equal(peri7(P.augmentRoster(e, RULES4, P.rosterPeri(e, RULES4))).Totals, '? ?');
  tot.cells.find((c) => c.content === '12').content = '11.5';
  assert.equal(peri7(P.augmentRoster(e, RULES4, P.rosterPeri(e, RULES4))).Totals, '5.50 1.83');
});

test('roster Fantasy Team stats: Totals (the whole team season, not the rows shown) from its own cells, both views', () => {
  for (const fx of [ROSTER_STATS_FANTASY_TEAM, ROSTER_FPTS_FANTASY_TEAM]) {
    const v = peri7(P.augmentRoster(fx, RULES4, P.rosterPeri(fx, RULES4)));
    assert.equal(v.Totals, '375.20 2.45');
    assert.ok(!Object.values(v).some((x) => x.includes('?')));
  }
  // a league whose peripheral weights differ by position cannot split a mixed Totals row: "–"
  const r = clone7(RULES4);
  r.skater.SOG.byPos = { D: 0.5 };
  const v = peri7(P.augmentRoster(ROSTER_STATS_FANTASY_TEAM, r, P.rosterPeri(ROSTER_STATS_FANTASY_TEAM, r)));
  assert.equal(v.Totals, '– –');
});

test('roster Per-Game view: one Tracked STATS lookup of the same request; a failed lookup gives –', async () => {
  let fail = false;
  const { send, sendWarm, lookups } = rosterServer((d) => {
    if (d.scoringCategoryType === '5') { if (fail) throw new Error('down'); return clone7(ROSTER_STATS_SEASON); }
    return clone7(ROSTER_PERGAME_SEASON);
  });
  const req = { leagueId: 'L7', view: 'STATS', seasonOrProjection: 'SEASON_31l_YEAR_TO_DATE', scoringCategoryType: '7' };
  const d = await sendWarm(req);
  assert.equal(lookups().length, 1);
  assert.deepEqual(lookups()[0].msgs[0].data, Object.assign({}, req, { scoringCategoryType: '5' }));
  assert.equal(peri7(d)['Bo Horvat'], '221.18 3.25');
  assert.deepEqual(d.tables[1], ROSTER_PERGAME_SEASON.tables[1]);
  fail = true;
  const w = console.warn; console.warn = () => {};
  let d2;
  try { d2 = await send(Object.assign({}, req, { teamId: 'T2' })); await settle5(); } finally { console.warn = w; }
  assert.equal(peri7(d2)['Bo Horvat'], '– –');
  assert.equal(peri7(d2).EMPTY, ' ');
});

test('roster: projected season gives –, other views and goalie-only responses pass unchanged', async () => {
  const proj = clone7(ROSTER_STATS_SEASON);
  proj.displayedSelections.displayedSeasonOrProjection = { code: 'PROJECTION_0_31n_SEASON', timeframeTypeCode: 'PROJECTED_SEASON' };
  const other = clone7(ROSTER_STATS_SEASON);
  other.displayedSelections.displayedView = 'GAMES_PER_POS';
  const { send, lookups } = rosterServer((d) => (d.view === 'GAMES_PER_POS' ? clone7(other) : clone7(proj)));
  const v = peri7(await send({ leagueId: 'L7', view: 'STATS', seasonOrProjection: 'PROJECTION_0_31n_SEASON' }));
  assert.equal(v['Bo Horvat'], '– –');
  assert.equal(v.EMPTY, ' ');
  assert.deepEqual(await send({ leagueId: 'L7', view: 'GAMES_PER_POS' }), other);
  assert.equal(lookups().length, 0);
  const g = { tables: [clone7(ROSTER_STATS_SEASON.tables[1])], displayedSelections: ROSTER_STATS_SEASON.displayedSelections };
  assert.deepEqual(P.augmentRoster(g, RULES4, P.rosterPeri(g, RULES4)), g);
});

test('gpFromFpg', () => {
  assert.equal(P.gpFromFpg(10, '3.33'), 3);
  assert.equal(P.gpFromFpg(486.68, '7.16'), 68);
  assert.equal(P.gpFromFpg(6.01, '6.01'), 1);
  assert.equal(P.gpFromFpg(0, '0'), null);
  assert.equal(P.gpFromFpg(5, '-'), null);
  assert.equal(P.gpFromFpg(0.5, '0.01'), null); // 49, 50 and 51 all round to 0.01
});

// ---- only Fantrax's own requests are rewritten (the Game Tracker sends {msgs} only) ----
test('tracker-shaped requests pass straight through: same init, same response, called at once, no rules read', async () => {
  for (const [method, data] of [['getPlayerProfile', { leagueId: 'L7', playerId: 'p1' }],
    ['getTeamRosterInfo', { leagueId: 'L7', view: 'STATS', period: '18' }], ['getPlayerStats', { sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI' }]]) {
    const { calls, win } = rosterServer(() => clone7(ROSTER_STATS_DAY));
    const init = { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ msgs: [{ method, data }] }) };
    const p = win.fetch('/fxpa/req?leagueId=L7', init);
    // synchronously handed to the original fetch (no await before it), nothing else sent
    assert.equal(calls.length, 1, method);
    assert.equal(calls[0].init, init);
    const res = await p;
    assert.equal(res, calls[0].res);
    await tick5();
    assert.equal(calls.length, 1, method + ': no rules read, no lookup');
  }
});

test('page-shaped requests are still rewritten (uiv present)', async () => {
  const { calls, send } = rosterServer(() => clone7(ROSTER_STATS_DAY));
  const d = await send({ leagueId: 'L7', view: 'STATS', period: '18' });
  assert.ok(d.tables[0].header.cells.some((c) => c.key === 'fh_peri'));
  assert.ok(calls.some((c) => c.msgs[0].method === 'getLeagueRulesOld'));
});

// ---- Players Schedule / Trends tabs: the values pull asks for the Stats view ----
test('valuesSelection forces view STATS', () => {
  assert.equal(P.valuesSelection({ view: 'SCHEDULE_PERIOD', pageNumber: '1' }, {}).view, 'STATS');
  assert.equal(P.valuesSelection({ view: 'OVERVIEW' }, {}).view, 'STATS');
  assert.equal(P.valuesSelection({}, {}).view, 'STATS');
});

test('Players Schedule tab: values come from a Stats-view pull, never ?', async () => {
  const sched = clone5(STATS_RESPONSE);
  const keep = sched.tableHeader.cells.map((c) => !/^\d+#/.test(String(c.scipId || c.key || '')));
  sched.tableHeader.cells = sched.tableHeader.cells.filter((c, i) => keep[i]);
  sched.statsTable = sched.statsTable.map((r) => Object.assign({}, r, { cells: r.cells.filter((c, i) => keep[i]) }));
  const { srv, warmJson } = setup5({ stats: (d) => {
    if (d.view !== 'STATS') return clone5(sched); // the server ignores the scoring type under a schedule view
    if (d.maxResultsPerPage === '500') return pageData(STATS_RESPONSE.statsTable, 1, 500);
    return undefined;
  } });
  const { first, d } = await warmJson({ view: 'SCHEDULE_PERIOD', pageNumber: '1' });
  assertLoading5(first);
  const pulls = srv.poolCalls().map((c) => c.msgs[0].data);
  assert.equal(pulls.length, 1);
  assert.equal(pulls[0].view, 'STATS');
  const i = periIdx5(d);
  const shown = d.statsTable.map((r) => r.cells[i].content);
  assert.ok(!shown.includes('?'));
  const want = P.periByScorer(STATS_RESPONSE, RULES4);
  d.statsTable.forEach((r, k) => { const v = want.get(r.scorer.scorerId); if (v.status === 'ok') assert.equal(shown[k], P.fmt2(v.peri)); });
});

// ---- review minors: unplaceable rows, unhandled views, lookup cache, Totals via the lookup ----
test('a table with a row that cannot be placed is returned unchanged (player row of another width, short Totals)', () => {
  const d = clone7(ROSTER_STATS_SEASON);
  d.tables[0].rows[2].cells.push({ content: 'x' });           // a player row one cell too long
  const a = P.augmentRoster(d, RULES4, P.rosterPeri(d, RULES4));
  assert.equal(a.tables[0], d.tables[0]);
  const e = clone7(ROSTER_STATS_SEASON);
  e.tables[0].rows[1].cells.pop();                             // one cell too short
  assert.equal(P.augmentRoster(e, RULES4, P.rosterPeri(e, RULES4)).tables[0], e.tables[0]);
  const f = clone7(ROSTER_STATS_DAY);
  f.tables[0].rows.find((r) => r.scorerColumn === 'Totals').cells.splice(0, 3); // Totals too short to reach the header end
  assert.equal(P.augmentRoster(f, RULES4, P.rosterPeri(f, RULES4)).tables[0], f.tables[0]);
});

test('roster requests for a view we do not handle pass through with no rules wait; no view = handled', async () => {
  assert.equal(P.planRoster({ leagueId: 'L7', view: 'GAMES_PER_POS' }), null);
  for (const v of ['STATS', 'FPTS', 'OVERVIEW', 'SCHEDULE_PERIOD', 'SCHEDULE_FULL']) assert.ok(P.planRoster({ view: v }));
  assert.ok(P.planRoster({ leagueId: 'L7' }));
  const { calls, win } = rosterServer(() => ({ tables: [] }));
  const init = { method: 'POST', body: JSON.stringify({ msgs: [{ method: 'getTeamRosterInfo', data: { leagueId: 'L7', view: 'GAMES_PER_POS' } }], uiv: 3 }) };
  const p = win.fetch('/fxpa/req?leagueId=L7', init);
  assert.equal(calls.length, 1);
  assert.equal(await p, calls[0].res);
  await tick5();
  assert.equal(calls.length, 1); // no rules read
});

test('roster lookup is cached 3 minutes per request, warmed by a late answer', async () => {
  const clock = { t: 1e12 };
  let gate = null;
  const calls = [];
  const fetch = async (url, init) => {
    const msgs = JSON.parse(init.body).msgs;
    calls.push(msgs[0]);
    const lookup = msgs[0].method === 'getTeamRosterInfo' && msgs[0].data.scoringCategoryType === '5';
    if (lookup && gate) await gate.p;
    const data = msgs[0].method === 'getLeagueRulesOld' ? { content: RULES_HTML } : clone7(lookup ? ROSTER_STATS_SEASON : ROSTER_PERGAME_SEASON);
    return new Response(JSON.stringify({ responses: [{ data }] }), { status: 200 });
  };
  const win = { fetch };
  P.install(win, { now: () => clock.t, retryDelay: 0, delay: () => new Promise(() => {}) });
  await win.fetch.prewarm('L7');
  const req = { leagueId: 'L7', view: 'STATS', seasonOrProjection: 'SEASON_31l_YEAR_TO_DATE', scoringCategoryType: '7' };
  const send = async () => (await (await win.fetch('/fxpa/req?leagueId=L7', { method: 'POST', body: JSON.stringify({ msgs: [{ method: 'getTeamRosterInfo', data: req }], uiv: 3 }) })).json()).responses[0].data;
  const lookups = () => calls.filter((m) => m.method === 'getTeamRosterInfo' && m.data.scoringCategoryType === '5').length;
  gate = gate5();
  const d1 = await send();                         // lookup not answered yet: loading, nothing waited
  assert.equal(peri7(d1)['Bo Horvat'], '– –');
  const i = d1.tables[0].header.cells.findIndex((c) => c.key === 'fh_peri');
  assert.equal(d1.tables[0].rows[0].cells[i].toolTip, P.LOADING_TIP);
  gate.open(); await tick5(); gate = null;
  const d2 = await send();                         // served by the warmed cache, no new call
  assert.equal(lookups(), 1);
  assert.equal(peri7(d2)['Bo Horvat'], '221.18 3.25');
  clock.t += 3 * 60 * 1000 + 1;
  await send();
  assert.equal(lookups(), 2);
  await settle5();
});

test('Totals row through the Per-Game lookup', async () => {
  const { send, sendWarm, lookups } = rosterServer((d) => clone7(d.scoringCategoryType === '5' ? ROSTER_STATS_DAY : ROSTER_PERGAME_DAY));
  const d = await sendWarm({ leagueId: 'L7', view: 'STATS', period: '18', scoringCategoryType: '7' });
  assert.equal(lookups().length, 1);
  const v = peri7(d);
  assert.equal(v.Totals, '5.50 1.83');
  assert.equal(v['Morgan Geekie'], '1.51 1.51');
});

// ---- item 5: roster Trends / Schedule views, Players Schedule / Trends tabs ----
test('roster Trends (season): values from one STATS lookup of the same request, placed after FPts and FP-G', async () => {
  const { send, sendWarm, lookups } = rosterServer((d) => clone7(d.view === 'STATS' ? ROSTER_TRENDS_SEASON_LOOKUP : ROSTER_TRENDS_SEASON));
  const req = { leagueId: 'L7', view: 'OVERVIEW', timeframeTypeCode: 'YEAR_TO_DATE', seasonOrProjection: 'SEASON_31l_YEAR_TO_DATE' };
  const d = await sendWarm(req);
  assert.equal(lookups().length, 1);
  assert.deepEqual(lookups()[0].msgs[0].data, Object.assign({}, req, { view: 'STATS', scoringCategoryType: '5' }));
  assert.deepEqual(d.tables[0].header.cells.map((c) => c.shortName),
    ['Rk', 'Age', 'Opp', 'FPts', 'FP/G', 'Peri', 'Peri/G', 'Ros', '+/-', 'Act', '+/-', '%D', 'ADP']);
  const v = peri7(d);
  assert.equal(v['Bo Horvat'], '221.18 3.25');
  assert.ok(!Object.values(v).some((x) => x.includes('?')));
  assert.deepEqual(d.tables[1], ROSTER_TRENDS_SEASON.tables[1]);
  await send(req);
  assert.equal(lookups().length, 1); // cached
});

test('roster Trends (lineup day): the Stats-shaped Totals row longer than the header gets its cells after its FPts', async () => {
  const { sendWarm } = rosterServer((d) => clone7(d.view === 'STATS' ? ROSTER_DAY_LOOKUP : ROSTER_TRENDS_DAY));
  const d = await sendWarm({ leagueId: 'L7', view: 'OVERVIEW' });
  const tot = d.tables[0].rows.find((r) => r.scorerColumn === 'Totals');
  const orig = ROSTER_TRENDS_DAY.tables[0].rows.find((r) => r.scorerColumn === 'Totals');
  assert.equal(tot.cells.length, orig.cells.length + 2);
  assert.deepEqual(d.tables[0].header.cells.map((c) => c.shortName).slice(3, 7), ['FPts', 'FP/G', 'Peri', 'Peri/G']);
  assert.deepEqual(tot.cells.map((c) => c.content).slice(0, 6), ['', '', '0.45', '0.45', '0.45', '0.45']);
  assert.deepEqual(peri7(d), { 'Bo Horvat': '0.00 –', 'Jesper Bratt': '0.45 0.45', EMPTY: ' ', 'Reserve spot(s) available': ' ', Totals: '0.45 0.45' });
});

// The live Trends report (2026-10-17: rows shifted right of their headers once the values showed) came from the Game
// Tracker's Schedule - Week footer rows left in the reused table body, not from this script: this pins, on the real
// responses of both renders, that every row is Fantrax's own row + our two cells, in place.
test('roster Trends live (loading and loaded): every row is Fantrax\'s row + 2 cells right after FP/G', async () => {
  let overview = 0;
  const { send } = rosterServer((d) => clone7(d.view === 'STATS' ? ROSTER_TRENDS_LIVE_LOOKUP
    : overview++ === 0 ? ROSTER_TRENDS_LIVE_FIRST : ROSTER_TRENDS_LIVE_LATER));
  const req = { leagueId: 'L7', view: 'OVERVIEW', period: '19' };
  const loading = await send(req);
  await settle5();
  const loaded = await send(req);
  for (const [d, orig, state] of [[loading, ROSTER_TRENDS_LIVE_FIRST, 'loading'], [loaded, ROSTER_TRENDS_LIVE_LATER, 'loaded']]) {
    const t = d.tables[0], o = orig.tables[0], hc = t.header.cells, ohc = o.header.cells;
    const fi = ohc.findIndex((c) => c.key === 'fpts'), gi = ohc.findIndex((c) => c.key === 'fptsPerGame');
    assert.deepEqual(hc.map((c) => c.shortName), ['Rk', 'Age', 'Opp', 'FPts', 'FP/G', 'Peri', 'Peri/G', 'Ros', '+/-', 'Act', '+/-', '%D', 'ADP'], state);
    assert.deepEqual(hc.filter((c) => !/^fh_/.test(c.key)), ohc, state);
    assert.equal(t.rows.length, o.rows.length);
    t.rows.forEach((r, k) => {
      const or = o.rows[k], off = P.rowOffset(ohc, or);
      assert.equal(r.cells.length, or.cells.length + 2, state + ' row ' + k);
      assert.equal(gi, fi + 1);
      const a = gi - off + 1, b = gi - off + 2; // Peri then Peri/G right after FP/G
      assert.deepEqual(r.cells.filter((c, i) => i !== a && i !== b), or.cells, state + ' row ' + k);
      assert.deepEqual(Object.keys(r).sort(), Object.keys(or).sort());
      if (P.rowOffset(ohc, or) === 0) assert.equal(r.cells.length, hc.length, state + ' row ' + k); // header-wide rows stay so
    });
    assert.deepEqual(d.tables[1], orig.tables[1], state + ': goalies untouched');
  }
  const v0 = peri7(loading), v1 = peri7(loaded);
  assert.equal(v0['Jesper Bratt'], '– –');
  assert.equal(v1['Jesper Bratt'], '1.35 1.35'); // 3 SOG x 0.45
  assert.equal(v1['Bo Horvat'], '0.00 –'); // no game yet
  assert.ok(!Object.values(v1).some((x) => x.includes('?')));
});

test('roster Schedule - Week: columns go before the day columns; every day cell keeps its header', async () => {
  const { sendWarm } = rosterServer((d) => clone7(d.view === 'STATS' ? ROSTER_DAY_LOOKUP : ROSTER_SCHEDULE_WEEK));
  const d = await sendWarm({ leagueId: 'L7', view: 'SCHEDULE_PERIOD' });
  const hc = d.tables[0].header.cells.map((c) => c.shortName);
  assert.deepEqual(hc.slice(0, 7), ['Rk', 'Age', 'FPts', 'FP/G', 'Peri', 'Peri/G', 'Sat 10/17']);
  const ohc = ROSTER_SCHEDULE_WEEK.tables[0].header.cells.map((c) => c.shortName);
  d.tables[0].rows.forEach((r, k) => {
    const o = ROSTER_SCHEDULE_WEEK.tables[0].rows[k];
    for (const day of ohc.filter((h) => /^\w{3} \d+\/\d+$/.test(h))) assert.deepEqual(r.cells[hc.indexOf(day)], o.cells[ohc.indexOf(day)]);
  });
  assert.equal(peri7(d)['Jesper Bratt'], '0.45 0.45');
});

test('roster lookup with different FPts for a row gives – (values still updating) for that row, not ?', async () => {
  const look = clone7(ROSTER_TRENDS_SEASON_LOOKUP);
  const hc = look.tables[0].header.cells, fi = hc.findIndex((c) => c.key === 'fpts');
  const hrow = look.tables[0].rows.find((r) => nameOf7(r) === 'Bo Horvat');
  // keep the lookup row self-consistent (FPts and stats), but not equal to the displayed FPts
  hrow.cells[fi].content = String(Number(hrow.cells[fi].content) + 0.45);
  hrow.cells[hc.findIndex((c) => c.shortName === 'SOG')].content = String(Number(hrow.cells[hc.findIndex((c) => c.shortName === 'SOG')].content) + 1);
  const { sendWarm } = rosterServer((d) => clone7(d.view === 'STATS' ? look : ROSTER_TRENDS_SEASON));
  const d = await sendWarm({ leagueId: 'L7', view: 'OVERVIEW', seasonOrProjection: 'SEASON_31l_YEAR_TO_DATE' });
  const v = peri7(d);
  assert.equal(v['Bo Horvat'], '– –');
  assert.equal(v['Jesper Bratt'], '140.04 1.71');
  const t = d.tables[0], pi = t.header.cells.findIndex((c) => c.key === 'fh_peri');
  const row = t.rows.find((r) => nameOf7(r) === 'Bo Horvat');
  assert.equal(row.cells[pi].toolTip, P.UPDATING_TIP);
  // a row whose OWN cells fail the rebuild (values from this response) still shows ?
  const bad = clone7(ROSTER_STATS_SEASON);
  const bfi = bad.tables[0].header.cells.findIndex((c) => c.key === 'fpts');
  const brow = bad.tables[0].rows.find((r) => r.scorer && r.scorer.scorerId);
  brow.cells[bfi].content = String(Number(brow.cells[bfi].content) + 9);
  assert.equal(peri7(P.augmentRoster(bad, RULES4, P.rosterPeri(bad, RULES4)))[nameOf7(brow)], '? ?');
});

function playersServer(page, lookup, poolRows) {
  return setup5({ stats: (d) => {
    if (d.maxResultsPerPage === '500') return pageData(poolRows || lookup.statsTable, Number(d.pageNumber), 500);
    if (d.view === 'STATS') return clone5(lookup);
    return clone5(page);
  } });
}
const lookupCalls = (srv) => srv.pageCalls().filter((c) => c.init.body.indexOf('uiv') < 0);

test('Players Schedule tab: one lookup request (same page in the Stats view), no pool pull', async () => {
  const { srv, sendJson, warmJson } = playersServer(PLAYERS_SCHEDULE, PLAYERS_SCHEDULE_LOOKUP);
  const { first, d } = await warmJson({ view: 'SCHEDULE_PERIOD', pageNumber: '1' });
  assertLoading5(first);
  assert.equal(srv.poolCalls().length, 0);
  assert.equal(lookupCalls(srv).length, 1);
  assert.deepEqual(lookupCalls(srv)[0].msgs[0].data, { view: 'STATS', pageNumber: '1', scoringCategoryType: '5' });
  const i = periIdx5(d);
  const want = P.periByScorer(PLAYERS_SCHEDULE_LOOKUP, RULES4);
  d.statsTable.forEach((r) => {
    const v = want.get(r.scorer.scorerId);
    assert.equal(v.status, 'ok');
    assert.equal(r.cells[i].content, P.fmt2(v.peri));
  });
  assert.deepEqual(d.tableHeader.cells.map((c) => c.shortName).slice(3, 9), ['FPts', 'FP/G', 'Peri', 'Peri/G', 'Ros', '+/-']);
  await sendJson({ view: 'SCHEDULE_PERIOD', pageNumber: '1' });
  assert.equal(lookupCalls(srv).length, 1); // cached
});

test('Players Trends tab, FP/G sort page 2: the lookup keeps sort and page', async () => {
  const { srv, warmJson } = playersServer(PLAYERS_TRENDS_FPG_P2, PLAYERS_TRENDS_FPG_P2_LOOKUP);
  const { first, d } = await warmJson({ view: 'OVERVIEW', pageNumber: '2', sortType: 'FPTS_PER_GAME' });
  assertLoading5(first);
  assert.deepEqual(lookupCalls(srv)[0].msgs[0].data, { view: 'STATS', pageNumber: '2', sortType: 'FPTS_PER_GAME', scoringCategoryType: '5' });
  assert.equal(srv.poolCalls().length, 0);
  const i = periIdx5(d);
  assert.ok(d.statsTable.every((r) => /^-?\d+\.\d\d$/.test(r.cells[i].content)));
});

test('Players: rows the lookup does not cover come from the pool', async () => {
  const look = clone5(PLAYERS_SCHEDULE_LOOKUP);
  const gone = look.statsTable.splice(2, 1)[0];
  const { srv, warmJson } = playersServer(PLAYERS_SCHEDULE, look, PLAYERS_SCHEDULE_LOOKUP.statsTable);
  const { first, d } = await warmJson({ view: 'SCHEDULE_PERIOD', pageNumber: '1' });
  assertLoading5(first);
  assert.ok(srv.poolCalls().length >= 1);
  const i = periIdx5(d);
  const want = P.periByScorer(PLAYERS_SCHEDULE_LOOKUP, RULES4).get(gone.scorer.scorerId);
  assert.equal(d.statsTable.find((r) => r.scorer.scorerId === gone.scorer.scorerId).cells[i].content, P.fmt2(want.peri));
});

// ---- review of item 5: one deadline, no wasted All Players lookup, unchecked values never shown ----
test('All Players: no one-request lookup (its Stats view is skaters only); values come from the pool', async () => {
  const { lw, stats } = allViewServer();
  const { srv, warmJson } = setup5({ stats });
  const { first, d } = await warmJson({ positionOrGroup: 'ALL', pageNumber: '1' });
  assertLoading5(first);
  assert.equal(lookupCalls(srv).length, 0);
  assert.equal(srv.poolCalls().length, 1);
  const want = P.periByScorer(Object.assign({}, STATS_RESPONSE, { statsTable: [lw] }), RULES4).get(lw.scorer.scorerId);
  assert.equal(d.statsTable[0].cells[periIdx5(d)].content, P.fmt2(want.peri));
});

test('Players: a lookup row whose FPts differs from the shown FPts is never used (the pool answers it)', async () => {
  const look = clone5(PLAYERS_SCHEDULE_LOOKUP);
  const fi = hdrIdx4(look, 'fpts'), sog = look.tableHeader.cells.findIndex((c) => c.shortName === 'SOG');
  const row = look.statsTable[1];
  // self-consistent lookup row (FPts and SOG both moved) that is not the row shown
  row.cells[fi].content = String(Number(row.cells[fi].content) + 0.45);
  row.cells[sog].content = String(Number(row.cells[sog].content) + 1);
  const { srv, warmJson } = playersServer(PLAYERS_SCHEDULE, look, PLAYERS_SCHEDULE_LOOKUP.statsTable);
  const { first, d } = await warmJson({ view: 'SCHEDULE_PERIOD', pageNumber: '1' });
  assertLoading5(first);
  assert.equal(srv.poolCalls().length, 1);
  const id = row.scorer.scorerId, i = periIdx5(d);
  const right = P.periByScorer(PLAYERS_SCHEDULE_LOOKUP, RULES4).get(id), wrong = P.periByScorer(look, RULES4).get(id);
  assert.notEqual(P.fmt2(right.peri), P.fmt2(wrong.peri));
  assert.equal(d.statsTable.find((r) => r.scorer.scorerId === id).cells[i].content, P.fmt2(right.peri));
});

test('Players: a row with no shown FPts gets – (no lookup value, no pool pull)', async () => {
  const page = clone5(PLAYERS_SCHEDULE);
  const fi = hdrIdx4(page, 'fpts');
  page.statsTable[0].cells[fi].content = '-';
  const { srv, warmJson } = playersServer(page, PLAYERS_SCHEDULE_LOOKUP);
  const { first, d } = await warmJson({ view: 'SCHEDULE_PERIOD', pageNumber: '1' });
  assertLoading5(first);
  const i = periIdx5(d);
  assert.equal(d.statsTable[0].cells[i].content, '–');
  assert.equal(srv.poolCalls().length, 0);
  assert.match(d.statsTable[1].cells[i].content, /^-?\d+\.\d\d$/);
});

test('Players: lookup cached, pool still running -> covered rows shown, the rest loading; nothing waited', async () => {
  const look = clone5(PLAYERS_SCHEDULE_LOOKUP);
  const gone = look.statsTable.splice(2, 1)[0];
  const pg = gate5();
  const waits = [];
  const { srv, sendJson } = setup5({ poolGate: pg.p, stats: (d) => {
    if (d.maxResultsPerPage === '500') return pageData(PLAYERS_SCHEDULE_LOOKUP.statsTable, 1, 500);
    return clone5(d.view === 'STATS' ? look : PLAYERS_SCHEDULE);
  } }, undefined, (ms) => { waits.push(ms); return never5(); });
  const q = { view: 'SCHEDULE_PERIOD', pageNumber: '1' };
  assertLoading5(await sendJson(q));     // nothing cached: all loading; the lookup answers, the pool starts (held)
  await settle5();
  assert.equal(srv.poolCalls().length, 1);
  const d = await sendJson(q);            // lookup cached, pool still held: answered at once anyway
  const i = periIdx5(d);
  const shown = d.statsTable.find((r) => r.scorer.scorerId === gone.scorer.scorerId).cells[i];
  assert.equal(shown.content, '–');
  assert.equal(shown.toolTip, P.LOADING_TIP);
  assert.match(d.statsTable[0].cells[i].content, /^-?\d+\.\d\d$/);
  assert.equal(srv.poolCalls().length, 1); // the pool in flight is shared, not started again
  assert.deepEqual(waits, []);
  pg.open();
  await settle5();
  const d3 = await sendJson(q);
  assert.match(d3.statsTable.find((r) => r.scorer.scorerId === gone.scorer.scorerId).cells[i].content, /^-?\d+\.\d\d$/);
});

// Fantrax's response comes back before our read resolves: a fake read that never answers.
test('every extra-read view answers before its read resolves: "–" + loading tip, then numbers from the warmed cache', async () => {
  const views = [
    ['All Players', 'getPlayerStats', { positionOrGroup: 'ALL', pageNumber: '1' }],
    ['Per-Game', 'getPlayerStats', { scoringCategoryType: '7', pageNumber: '1' }],
    ['Standard', 'getPlayerStats', { scoringCategoryType: '1', pageNumber: '1' }],
    ['Schedule', 'getPlayerStats', { view: 'SCHEDULE_PERIOD', pageNumber: '1' }],
    ['Trends', 'getPlayerStats', { view: 'OVERVIEW', pageNumber: '2', sortType: 'FPTS_PER_GAME' }],
    ['roster Per-Game', 'getTeamRosterInfo', { leagueId: 'L1', view: 'STATS', seasonOrProjection: 'SEASON_31l_YEAR_TO_DATE', scoringCategoryType: '7' }],
    ['roster Trends', 'getTeamRosterInfo', { leagueId: 'L1', view: 'OVERVIEW', seasonOrProjection: 'SEASON_31l_YEAR_TO_DATE' }],
    ['roster Schedule', 'getTeamRosterInfo', { leagueId: 'L1', view: 'SCHEDULE_PERIOD', seasonOrProjection: 'SEASON_31l_YEAR_TO_DATE' }],
  ];
  const { stats: allStats } = allViewServer();
  const statsAnswer = (d) => {
    if (d.positionOrGroup === 'ALL' || d.positionOrGroup === 'HOCKEY_SKATING') return allStats(d);
    if (d.scoringCategoryType === '7' || d.scoringCategoryType === '1') {
      const pg = clone5(STATS_RESPONSE); pg.displayedScoringCategoryType = d.scoringCategoryType; return pg;
    }
    if (d.view === 'SCHEDULE_PERIOD') return clone5(d.maxResultsPerPage ? STATS_RESPONSE : PLAYERS_SCHEDULE);
    if (d.view === 'OVERVIEW') return clone5(PLAYERS_TRENDS_FPG_P2);
    if (d.view === 'STATS' && d.pageNumber === '2') return clone5(PLAYERS_TRENDS_FPG_P2_LOOKUP);
    if (d.view === 'STATS' && !d.maxResultsPerPage) return clone5(PLAYERS_SCHEDULE_LOOKUP);
    return pageData(STATS_RESPONSE.statsTable, 1, 500);
  };
  // the lookup (Tracked STATS) / Trends and Schedule views (Trends-shaped rows) / Per-Game
  const rosterAnswer = (d) => clone7(d.scoringCategoryType === '5' && d.view === 'STATS' ? ROSTER_STATS_SEASON
    : d.view === 'OVERVIEW' || d.view === 'SCHEDULE_PERIOD' ? ROSTER_TRENDS_SEASON : ROSTER_PERGAME_SEASON);
  for (const [name, method, data] of views) {
    let release = null;
    const held = new Promise((r) => { release = r; });
    let ours = 0;
    const order = [];
    const fetch = async (url, init) => {
      const b = JSON.parse(init.body), m = b.msgs[0];
      const answer = m.method === 'getLeagueRulesOld' ? { content: RULES_HTML }
        : m.method === 'getTeamRosterInfo' ? rosterAnswer(m.data) : statsAnswer(m.data);
      if (m.method !== 'getLeagueRulesOld' && !('uiv' in b)) { ours++; await held; order.push('read'); }
      return new Response(JSON.stringify({ responses: [{ data: answer }] }), { status: 200 });
    };
    const win = { fetch };
    P.install(win, { retryDelay: 0, delay: never5 });
    await win.fetch.prewarm('L1');
    const send = async () => {
      const res = await win.fetch('/fxpa/req?leagueId=L1', { method: 'POST', body: JSON.stringify({ msgs: [{ method, data }], uiv: 3 }) });
      order.push('page');
      return (await res.json()).responses[0].data;
    };
    const first = await send();
    assert.deepEqual(order, ['page'], name + ': answered before the read resolved');
    assert.ok(ours >= 1, name + ': a background read started');
    const tips = JSON.stringify(first).split(P.LOADING_TIP).length - 1;
    assert.ok(tips > 0, name + ': loading tip shown');
    release();
    await settle5();
    const second = await send();
    const txt = JSON.stringify(second);
    assert.equal(txt.split(P.LOADING_TIP).length - 1, 0, name + ': nothing loading on the second view');
    const cells = method === 'getTeamRosterInfo'
      ? Object.values(peri7(second)).map((x) => x.split(' ')[0])
      : second.statsTable.map((r) => r.cells[periIdx5(second)].content);
    assert.ok(cells.some((c) => /^-?\d+\.\d\d$/.test(c)), name + ': numbers from the warmed cache ' + cells.join(','));
    const n = ours;
    await send();
    assert.equal(ours, n, name + ': cached, no new read');
  }
});

test('a background read that fails never rejects unhandled; for 60 s no retry and "–" unavailable, then it retries', async () => {
  const unhandled = [];
  const onRej = (e) => unhandled.push(e);
  process.on('unhandledRejection', onRej);
  const w = console.warn; const warned = []; console.warn = (...a) => warned.push(a);
  try {
    for (const [method, data] of [['getPlayerStats', { view: 'SCHEDULE_PERIOD', pageNumber: '1' }],
      ['getPlayerStats', { positionOrGroup: 'ALL', pageNumber: '1' }],
      ['getTeamRosterInfo', { leagueId: 'L1', view: 'OVERVIEW', seasonOrProjection: 'SEASON_31l_YEAR_TO_DATE' }]]) {
      let ours = 0;
      const fetch = async (url, init) => {
        const b = JSON.parse(init.body), m = b.msgs[0];
        if (m.method === 'getLeagueRulesOld') return new Response(JSON.stringify({ responses: [{ data: { content: RULES_HTML } }] }), { status: 200 });
        if (!('uiv' in b)) { ours++; return new Response('down', { status: 503 }); }
        const page = method === 'getTeamRosterInfo' ? clone7(ROSTER_TRENDS_SEASON)
          : data.positionOrGroup === 'ALL' ? clone5(STATS_RESPONSE_ALL_POSITIONS) : clone5(PLAYERS_SCHEDULE);
        return new Response(JSON.stringify({ responses: [{ data: page }] }), { status: 200 });
      };
      const win = { fetch };
      const clock = { t: 1e12 };
      P.install(win, { now: () => clock.t, retryDelay: 0, delay: never5 });
      await win.fetch.prewarm('L1');
      const send = async () => (await (await win.fetch('/fxpa/req?leagueId=L1', { method: 'POST',
        body: JSON.stringify({ msgs: [{ method, data }], uiv: 3 }) })).json()).responses[0].data;
      // The retry waits on a real timer, so a fixed number of ticks can return before it fires on a busy machine:
      // settle until the request count has held still for two rounds.
      const quiet = async () => {
        for (let k = 0, still = 0, prev = ours; k < 100 && still < 2; k++) {
          await settle5(); await new Promise((r) => setTimeout(r, 5));
          still = ours === prev ? still + 1 : 0; prev = ours;
        }
      };
      const d1 = await send();
      assert.ok(JSON.stringify(d1).includes(P.LOADING_TIP), method);
      await quiet();
      const n = ours;
      assert.ok(n >= 2, method + ': read + retry (and the pool after a failed lookup)');
      clock.t += P.FAIL_TTL_MS - 1;
      const d2 = await send();
      await quiet();
      assert.equal(ours, n, method + ': no request within 60 s of the failure');
      const t2 = JSON.stringify(d2);
      assert.ok(t2.includes(P.UNAVAILABLE_TIP) && !t2.includes(P.LOADING_TIP), method + ': plain "–", unavailable tip');
      assert.equal(P.UNAVAILABLE_TIP, 'Peripherals unavailable right now');
      clock.t += 2;
      const d3 = await send();
      assert.ok(JSON.stringify(d3).includes(P.LOADING_TIP), method + ': after 60 s it is loading again');
      await quiet();
      assert.ok(ours > n, method + ': and the read is retried');
    }
    await new Promise((r) => setTimeout(r, 5));
    assert.deepEqual(unhandled, []);
    assert.ok(warned.every((a) => a[0] === '[fpx]'));
  } finally { console.warn = w; process.off('unhandledRejection', onRej); }
});

test('our sort waits: rules not read yet are awaited inside the 30 s cap, rows come back sorted by Peri', async () => {
  const g = gate5();
  const waits = [];
  const rows = pool5(45);
  const { srv, win } = setup5({ rows, rulesGate: g.p }, undefined, (ms) => { waits.push(ms); return never5(); });
  let done = false;
  const p = win.fetch('/fxpa/req?leagueId=L1', { method: 'POST', body: JSON.stringify({ msgs: [{ method: 'getPlayerStats',
    data: { sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI', pageNumber: '1' } }], uiv: 3 }) }).then((r) => { done = true; return r; });
  await settle5();
  assert.equal(done, false);                 // held: rules not read yet
  assert.deepEqual(waits, [P.SORT_WAIT_MS]); // one cap for the whole sort
  g.open();
  const d = (await (await p).json()).responses[0].data;
  const i = periIdx5(d);
  const nums = d.statsTable.map((r) => r.cells[i].content).filter((x) => /^-?\d/.test(x)).map(Number);
  assert.ok(nums.length > 5);
  for (let k = 1; k < nums.length; k++) assert.ok(nums[k - 1] >= nums[k]);
  assert.equal(d.displayedSortType, 'SCORING_CATEGORY');
  assert.ok(srv.poolCalls().length >= 1);
});

test('roster: a lookup value for a row with no shown FPts is not used (–)', async () => {
  const page = clone7(ROSTER_TRENDS_SEASON);
  const fi = page.tables[0].header.cells.findIndex((c) => c.key === 'fpts');
  page.tables[0].rows[0].cells[fi].content = '-';
  const { sendWarm } = rosterServer((d) => clone7(d.view === 'STATS' ? ROSTER_TRENDS_SEASON_LOOKUP : page));
  const v = peri7(await sendWarm({ leagueId: 'L7', view: 'OVERVIEW', seasonOrProjection: 'SEASON_31l_YEAR_TO_DATE' }));
  assert.equal(v['Bo Horvat'], '– –');
  assert.equal(v['Jesper Bratt'], '140.04 1.71');
});

test('a header-wide Totals row under an Rk header is not placed: the table is left unchanged', () => {
  const d = clone7(ROSTER_STATS_DAY);
  const tot = d.tables[0].rows.find((r) => r.scorerColumn === 'Totals');
  tot.cells.unshift({ content: '' });     // now as wide as the header: Age ('') would land under FPts
  assert.equal(P.rowOffset(d.tables[0].header.cells, tot), null);
  assert.equal(P.augmentRoster(d, RULES4, P.rosterPeri(d, RULES4)).tables[0], d.tables[0]);
});

// ---- follow-up: a table with no FPts column (FP/G only) keeps its values ----
const dropCol = (t, key) => {
  const i = t.header.cells.findIndex((c) => c.key === key);
  const out = clone7(t);
  out.header.cells.splice(i, 1);
  out.rows.forEach((r) => {
    const off = P.rowOffset(t.header.cells, t.rows[out.rows.indexOf(r)]);
    if (r.cells.length && off !== null && i - off >= 0 && i - off < r.cells.length) r.cells.splice(i - off, 1);
  });
  return out;
};

test('roster table with FP/G but no FPts column: Peri/G from the values, not "–"', () => {
  const d = clone7(ROSTER_STATS_SEASON);
  const vals = P.rosterPeri(d, RULES4);
  const k = 0;
  const t = d.tables[k];
  const e = Object.assign({}, d, { tables: d.tables.map((x, j) => (j === k ? dropCol(x, 'fpts') : x)) });
  const a = P.augmentRoster(e, RULES4, vals);
  const hc = a.tables[k].header.cells;
  assert.equal(hc.findIndex((c) => c.key === 'fh_peri'), -1);
  const gi = hc.findIndex((c) => c.key === 'fh_peri_g');
  assert.ok(gi > 0);
  const want = vals.get(String(t.scGroup || '#' + k));
  let checked = 0;
  a.tables[k].rows.forEach((r) => {
    if (!r.scorer || !r.scorer.scorerId) return;
    const v = want.get(r.scorer.scorerId);
    if (!v || v.status !== 'ok' || v.perG === null) return;
    assert.equal(r.cells[gi].content, P.fmt2(v.perG));
    checked++;
  });
  assert.ok(checked >= 3, 'rows checked: ' + checked);
});

test('Players table with FP/G but no FPts column: lookup values kept, no pool pull', async () => {
  const fi = STATS_RESPONSE.tableHeader.cells.findIndex((c) => c.key === 'fpts');
  const sched = clone5(STATS_RESPONSE);
  const keep = sched.tableHeader.cells.map((c, i) => i !== fi && !/^\d+#/.test(String(c.scipId || c.key || '')));
  sched.tableHeader.cells = sched.tableHeader.cells.filter((c, i) => keep[i]);
  sched.statsTable = sched.statsTable.map((r) => Object.assign({}, r, { cells: r.cells.filter((c, i) => keep[i]) }));
  const { srv, warmJson } = setup5({ stats: (d) => {
    if (d.view !== 'STATS') return clone5(sched);
    if (d.maxResultsPerPage === '500') return pageData(STATS_RESPONSE.statsTable, 1, 500);
    return clone5(STATS_RESPONSE);
  } });
  const { first, d } = await warmJson({ view: 'SCHEDULE_PERIOD', pageNumber: '1' });
  assertLoading5(first);
  assert.equal(srv.poolCalls().length, 0);
  const gi = d.tableHeader.cells.findIndex((c) => c.key === 'fh_peri_g');
  const want = P.periByScorer(STATS_RESPONSE, RULES4);
  let checked = 0;
  d.statsTable.forEach((r) => {
    const v = want.get(r.scorer.scorerId);
    if (v.status === 'ok' && v.perG !== null) { assert.equal(r.cells[gi].content, P.fmt2(v.perG)); checked++; }
  });
  assert.ok(checked >= 3);
});

// ---- Live Scoring (getLiveScoringStats) ----
const RULES_TEST = P.parseRules(RULES_HTML_NO_POSITION);
const live = (d, req, rules = RULES4, state = P.newState(), leagueId = 'L1') =>
  P.handleLive(clone7(d), { reqData: req }, { rules, leagueId, state });
const periEntry = (row) => row.object2.find((e) => e.scipId === P.LIVE_PERI_ID);
// Expected Peri from the fixture alone: fpts summed over the categories named SOG / Hit / Blk / FOW / FOL (PIM / SOG in
// the test league), only when the row's fpts add up to its FPts.
function expectPeri(d, row, periNames) {
  const names = new Map(d.cats.map((c) => [c.id, c.shortName]));
  if (!row.object2.length || !row.object2.every((e) => names.has(e.scipId))) return null;
  const sum = row.object2.reduce((a, e) => a + e.fpts, 0);
  if (Math.abs(sum - row.object1) > 0.05) return null;
  return row.object2.filter((e) => periNames.includes(names.get(e.scipId))).reduce((a, e) => a + e.fpts, 0);
}
const rowsOf = (d) => {
  const out = [];
  for (const map of ['statsMap', 'allTeamsStats']) {
    for (const [team, slots] of Object.entries(d.statsPerTeam[map])) {
      for (const [slot, s] of Object.entries(slots)) for (const [id, row] of Object.entries(s.statsMap || {})) out.push({ map, team, slot, id, row });
    }
  }
  return out;
};
const rowAt = (d, x) => d.statsPerTeam[x.map][x.team][x.slot].statsMap[x.id];

for (const [name, fx, req] of [['current period', LIVE_CURRENT, LIVE_CURRENT_REQ], ['past period', LIVE_PAST, LIVE_PAST_REQ]]) {
  test('live ' + name + ': Peri first in the skater categories, appended to the counted list', () => {
    const d = live(fx, req);
    const list = d.scoringCategoriesPerGroup['2010'];
    assert.equal(list.length, fx.scoringCategoriesPerGroup['2010'].length + 1);
    assert.deepEqual(list.slice(1), fx.scoringCategoriesPerGroup['2010']);
    const peri = list[0];
    assert.equal(peri.id, P.LIVE_PERI_ID);
    assert.equal(peri.shortName, 'Peri');
    assert.equal(peri.name, 'Peripheral Fantasy Points');
    assert.equal(list[1].shortName, 'G');
    assert.deepEqual(d.scoringCategoriesPerGroup['2020'], fx.scoringCategoriesPerGroup['2020']);
    assert.deepEqual(d.miscData.scipIdsCounted, fx.miscData.scipIdsCounted.concat([P.LIVE_PERI_ID]));
  });

  test('live ' + name + ': each passing skater row and team total gets its Peri; goalies and everything else unchanged', () => {
    const d = live(fx, req);
    const ctx = { cats: fx.scoringCategoriesPerGroup['2010'] };
    let skaters = 0, totals = 0, goalies = 0;
    for (const x of rowsOf(fx)) {
      const got = rowAt(d, x);
      const want = expectPeri(ctx, x.row, ['SOG', 'Hit', 'Blk', 'FOW', 'FOL']);
      assert.equal(got.object1, x.row.object1);
      const orig = got.object2[0] && got.object2[0].scipId === '2010#FHPERI#-1' ? got.object2.slice(1) : got.object2;
      assert.deepEqual(orig, x.row.object2); // original entries untouched, in order
      if (want === null) {
        assert.deepEqual(got, x.row);
        if (x.row.object2.every((e) => e.scipId.startsWith('2020#'))) goalies++;
        continue;
      }
      const e = periEntry(got);
      assert.equal(got.object2.length, x.row.object2.length + 1);
      assert.equal(got.object2[0], e); // first: the cards draw chips in object2 order
      assert.equal(e.sv, P.fmt2(want));
      assert.equal(e.av, Number(P.fmt2(want)));
      assert.equal(e.fpts, Number(P.fmt2(want)));
      if (x.id === '_2010') totals++; else skaters++;
    }
    assert.ok(skaters >= 12 && totals === 4 && goalies >= 4, [skaters, totals, goalies].join());
    for (const [team, slots] of Object.entries(fx.statsPerTeam.statsMap)) {
      const a = d.statsPerTeam.statsMap[team].ACTIVE;
      assert.equal(a.totalFpts, slots.ACTIVE.totalFpts);
      assert.deepEqual(a.projectedTotalsMap, slots.ACTIVE.projectedTotalsMap);
    }
    assert.deepEqual(d.statsPerTeam.statsMap, d.statsPerTeam.allTeamsStats);
    for (const k of Object.keys(fx)) if (!['scoringCategoriesPerGroup', 'miscData', 'standingsTable', 'statsPerTeam'].includes(k)) assert.deepEqual(d[k], fx[k], k);
  });
}

test('live: real values (spike numbers): team skater totals and a row without an HT entry', () => {
  const d = live(LIVE_CURRENT, LIVE_CURRENT_REQ);
  assert.equal(periEntry(d.statsPerTeam.statsMap.team0002.ACTIVE.statsMap._2010).sv, '85.95');
  const t1 = d.statsPerTeam.statsMap.team0001.ACTIVE.statsMap._2010;
  assert.equal(LIVE_CURRENT.statsPerTeam.statsMap.team0001.ACTIVE.statsMap._2010.object2.length, 11); // no HT entry
  assert.equal(periEntry(t1).sv, '62.71');
});

test('live: a row that fails the exact check, or has an unknown entry, gets no Peri entry', () => {
  const fx = clone7(LIVE_CURRENT);
  const rows = fx.statsPerTeam.statsMap.team0001.ACTIVE.statsMap;
  const ids = Object.keys(rows).filter((k) => !k.startsWith('_') && rows[k].object2[0].scipId.startsWith('2010#'));
  rows[ids[0]].object1 = Math.round((rows[ids[0]].object1 + 0.1) * 100) / 100;
  rows[ids[1]].object2.push({ scipId: '2010#9999#-1', sv: '1', av: 1, fpts: 0 });
  const d = live(fx, LIVE_CURRENT_REQ);
  const out = d.statsPerTeam.statsMap.team0001.ACTIVE.statsMap;
  assert.deepEqual(out[ids[0]], rows[ids[0]]);
  assert.deepEqual(out[ids[1]], rows[ids[1]]);
  assert.ok(periEntry(out[ids[2]]));
  // allTeamsStats was left as captured: its rows still pass and get Peri
  assert.ok(periEntry(d.statsPerTeam.allTeamsStats.team0001.ACTIVE.statsMap[ids[0]]));
});

test('live: projected mode (sppId "0", or a projection provider in the response) is returned untouched', () => {
  const fx = clone7(LIVE_CURRENT);
  const st = P.newState();
  assert.equal(P.handleLive(fx, { reqData: Object.assign({}, LIVE_CURRENT_REQ, { sppId: '0' }) }, { rules: RULES4, leagueId: 'L1', state: st }), fx);
  const fy = clone7(LIVE_CURRENT);
  fy.displayedSelections.realOrStatProjProvider = { id: '0', name: 'x' };
  assert.equal(P.handleLive(fy, { reqData: {} }, { rules: RULES4, leagueId: 'L1', state: st }), fy);
  // a projected poll after an actual full response is untouched too
  live(LIVE_CURRENT, LIVE_CURRENT_REQ, RULES4, st);
  const poll = clone7(LIVE_POLL);
  assert.equal(P.handleLive(poll, { reqData: Object.assign({}, LIVE_POLL_REQ, { sppId: '0' }) }, { rules: RULES4, leagueId: 'L1', state: st }), poll);
  assert.equal(P.liveIsProjected(LIVE_CURRENT, LIVE_CURRENT_REQ), false);
});

test('live All Teams: a Peri cell right after Proj, before the first skater category, with scipId but no key / sort fields; other cells unchanged', () => {
  for (const [fx, req, rules] of [[LIVE_CURRENT, LIVE_CURRENT_REQ, RULES4], [LIVE_TEST_ALL_TEAMS, LIVE_TEST_ALL_TEAMS_REQ, RULES_TEST]]) {
    const d = live(fx, req, rules);
    const hc = d.standingsTable.standingsHeader.cells, orig = fx.standingsTable.standingsHeader.cells;
    const i = hc.findIndex((c) => c.scipId === P.LIVE_PERI_ID);
    assert.equal(hc.length, orig.length + 1);
    assert.equal(hc[i].shortName, 'Peri');
    assert.equal(hc[i].name, 'Peripheral Fantasy Points');
    assert.equal(hc[i - 1].key, 'proj');
    assert.equal(i, orig.findIndex((c) => /^2010#/.test(String(c.key || ''))));
    assert.ok(String(hc[i + 1].key).startsWith('2010#'));
    // values are found by scipId; a header cell with a key is a sort link (sort=<key> in the URL): no key, no sort fields
    for (const f of ['key', 'sortKey', 'sortType', 'sortDirection']) assert.equal(hc[i][f], undefined, f);
    assert.deepEqual(hc.filter((c, k) => k !== i), orig);
  }
});

test('live test league (no position overrides): PIM and SOG are the peripherals', () => {
  const d = live(LIVE_TEST_ALL_TEAMS, LIVE_TEST_ALL_TEAMS_REQ, RULES_TEST);
  const ctx = { cats: LIVE_TEST_ALL_TEAMS.scoringCategoriesPerGroup['2010'] };
  let n = 0;
  for (const x of rowsOf(LIVE_TEST_ALL_TEAMS)) {
    const want = expectPeri(ctx, x.row, ['PIM', 'SOG']);
    const e = periEntry(rowAt(d, x));
    if (want === null) assert.equal(e, undefined); else { assert.equal(e.sv, P.fmt2(want)); n++; }
  }
  assert.ok(n >= 8);
});

test('live polls: values from the last full response\'s category map; none before one; per league', () => {
  const st = P.newState();
  const before = clone7(LIVE_POLL);
  assert.equal(P.handleLive(before, { reqData: LIVE_POLL_REQ }, { rules: RULES4, leagueId: 'L1', state: st }), before);
  live(LIVE_CURRENT, LIVE_CURRENT_REQ, RULES4, st);
  const d = live(LIVE_POLL, LIVE_POLL_REQ, RULES4, st);
  assert.equal(d.scoringCategoriesPerGroup, undefined);
  const ctx = { cats: LIVE_CURRENT.scoringCategoriesPerGroup['2010'] };
  let n = 0;
  for (const x of rowsOf(LIVE_POLL)) {
    const want = expectPeri(ctx, x.row, ['SOG', 'Hit', 'Blk', 'FOW', 'FOL']);
    const e = periEntry(rowAt(d, x));
    if (want === null) assert.equal(e, undefined); else { assert.equal(e.sv, P.fmt2(want)); n++; }
  }
  assert.ok(n >= 16);
  const other = clone7(LIVE_POLL);
  assert.equal(P.handleLive(other, { reqData: LIVE_POLL_REQ }, { rules: RULES4, leagueId: 'L2', state: st }), other);
});

test('live: a response rewritten twice gets one Peri entry per row and one category', () => {
  const st = P.newState();
  const once = live(LIVE_CURRENT, LIVE_CURRENT_REQ, RULES4, st);
  const twice = P.handleLive(clone7(once), { reqData: LIVE_CURRENT_REQ }, { rules: RULES4, leagueId: 'L1', state: st });
  assert.deepEqual(twice, once);
});

test('live: a listed category the rules do not know, a categories league, or a delta response: untouched', () => {
  const fx = clone7(LIVE_CURRENT);
  fx.scoringCategoriesPerGroup['2010'].push({ id: '2010#2999#-1', shortName: 'XYZ', name: 'x' });
  assert.equal(P.handleLive(fx, { reqData: LIVE_CURRENT_REQ }, { rules: RULES4, leagueId: 'L1', state: P.newState() }), fx);
  const fy = clone7(LIVE_CURRENT);
  fy.miscData.pointsBased = false;
  assert.equal(P.handleLive(fy, { reqData: LIVE_CURRENT_REQ }, { rules: RULES4, leagueId: 'L1', state: P.newState() }), fy);
  const st = P.newState();
  live(LIVE_CURRENT, LIVE_CURRENT_REQ, RULES4, st);
  const fz = clone7(LIVE_POLL);
  fz.statsPerTeam.delta = true;
  assert.equal(P.handleLive(fz, { reqData: LIVE_POLL_REQ }, { rules: RULES4, leagueId: 'L1', state: st }), fz);
});

function liveServer(answer) {
  const calls = [];
  const fetch = (url, init) => {
    const call = { url, init, msgs: JSON.parse(init.body).msgs };
    calls.push(call);
    const responses = call.msgs.map((m) => ({ data: m.method === 'getLeagueRulesOld' ? { content: RULES_HTML }
      : m.method === 'getScoresSummaryData' ? { summary: [1, 2, 3] } : answer(m.data || {}) }));
    call.res = new Response(JSON.stringify({ responses }), { status: 200, headers: { 'content-type': 'application/json' } });
    return Promise.resolve(call.res);
  };
  const win = { fetch };
  P.install(win, { retryDelay: 0, delay: () => new Promise(() => {}) });
  return { calls, win };
}
const liveReady = (win) => win.fetch.prewarm('L9');

test('live through the hook: the page batch is rewritten, getScoresSummaryData untouched, request sent as is', async () => {
  const { calls, win } = liveServer((d) => clone7(d.newView ? LIVE_CURRENT : LIVE_POLL));
  const send = async (data) => {
    const body = JSON.stringify({ msgs: [{ method: 'getLiveScoringStats', data }, { method: 'getScoresSummaryData', data: { bgp: true } }],
      uiv: 3, refUrl: 'x', dt: 0, at: 0, tz: 'x', v: 'x' });
    const res = await win.fetch('/fxpa/req?leagueId=L9', { method: 'POST', body });
    const page = calls.filter((c) => c.init.body === body);
    assert.equal(page.length, 1); // Fantrax's request went out unchanged
    return (await res.json()).responses;
  };
  await liveReady(win);
  const full = await send(LIVE_CURRENT_REQ);
  assert.equal(full[0].data.scoringCategoriesPerGroup['2010'][0].id, P.LIVE_PERI_ID);
  assert.deepEqual(full[1].data, { summary: [1, 2, 3] });
  const poll = await send(LIVE_POLL_REQ);
  assert.ok(periEntry(poll[0].data.statsPerTeam.statsMap.team0002.ACTIVE.statsMap._2010));
  const methods = calls.flatMap((c) => c.msgs.map((m) => m.method));
  assert.deepEqual(methods.filter((m) => m !== 'getLiveScoringStats' && m !== 'getScoresSummaryData'), ['getLeagueRulesOld']);
});

test('live: a tracker-shaped request (no uiv) passes straight through, same Response, no rules read', async () => {
  const { calls, win } = liveServer(() => clone7(LIVE_CURRENT));
  const init = { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ msgs: [{ method: 'getLiveScoringStats', data: LIVE_CURRENT_REQ }] }) };
  const p = win.fetch('/fxpa/req?leagueId=L9', init);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init, init);
  assert.equal(await p, calls[0].res);
  await tick5();
  assert.equal(calls.length, 1);
});

test('live projected (real response shape): rows pass the sum check, yet nothing is added', () => {
  const st = P.newState();
  const row = LIVE_TEST_PROJECTED.statsPerTeam.statsMap.team0005.ACTIVE.statsMap['05r1c'];
  assert.ok(Math.abs(row.object2.reduce((a, e) => a + e.fpts, 0) - row.object1) < 0.005);
  const fx = clone7(LIVE_TEST_PROJECTED);
  assert.equal(P.handleLive(fx, { reqData: LIVE_TEST_PROJECTED_REQ }, { rules: RULES_TEST, leagueId: 'L1', state: st }), fx);
  const fy = clone7(LIVE_TEST_PROJECTED); // even if the request had said "-1", the response's provider says projected
  assert.equal(P.handleLive(fy, { reqData: { sppId: '-1' } }, { rules: RULES_TEST, leagueId: 'L1', state: st }), fy);
  assert.deepEqual(fy, LIVE_TEST_PROJECTED);
});

// ---- review: failing team totals, strict actual-mode gate, live tolerance, FP/G-only check ----
const breakTotal = (d, team = 'team0001') => {
  for (const map of ['statsMap', 'allTeamsStats']) {
    const t = d.statsPerTeam[map][team].ACTIVE.statsMap._2010;
    t.object1 = Math.round((t.object1 + 0.1) * 100) / 100;
  }
  return d;
};

test('live full response with ONE failing team total: returned unchanged (no category, counted id, header) and the poll map cleared', () => {
  const st = P.newState();
  live(LIVE_CURRENT, LIVE_CURRENT_REQ, RULES4, st);
  assert.ok(st.live.has('L1'));
  const fx = breakTotal(clone7(LIVE_CURRENT));
  assert.equal(P.handleLive(fx, { reqData: LIVE_CURRENT_REQ }, { rules: RULES4, leagueId: 'L1', state: st }), fx);
  assert.equal(st.live.has('L1'), false);
  const poll = clone7(LIVE_POLL);
  assert.equal(P.handleLive(poll, { reqData: LIVE_POLL_REQ }, { rules: RULES4, leagueId: 'L1', state: st }), poll);
  // only one map failing is enough
  const fy = clone7(LIVE_CURRENT);
  fy.statsPerTeam.allTeamsStats.team0002.ACTIVE.statsMap._2010.object1 += 1;
  assert.equal(P.handleLive(fy, { reqData: LIVE_CURRENT_REQ }, { rules: RULES4, leagueId: 'L1', state: P.newState() }), fy);
});

test('live poll with a failing team total: that total gets the "-" placeholder (drawn "-" live), the others their Peri', () => {
  const st = P.newState();
  live(LIVE_CURRENT, LIVE_CURRENT_REQ, RULES4, st);
  const d = P.handleLive(breakTotal(clone7(LIVE_POLL)), { reqData: LIVE_POLL_REQ }, { rules: RULES4, leagueId: 'L1', state: st });
  for (const map of ['statsMap', 'allTeamsStats']) {
    const e = periEntry(d.statsPerTeam[map].team0001.ACTIVE.statsMap._2010);
    assert.deepEqual(e, { scipId: P.LIVE_PERI_ID, sv: '-', av: '-', fpts: '-' });
    assert.equal(periEntry(d.statsPerTeam[map].team0002.ACTIVE.statsMap._2010).sv, '85.95');
  }
  // a failing player row still gets nothing (drawn "-" in the tables, no chip)
  const fx = clone7(LIVE_POLL);
  const rows = fx.statsPerTeam.statsMap.team0002.ACTIVE.statsMap;
  const id = Object.keys(rows).find((k) => !k.startsWith('_') && rows[k].object2[0].scipId.startsWith('2010#'));
  rows[id].object1 += 1;
  const e = P.handleLive(fx, { reqData: LIVE_POLL_REQ }, { rules: RULES4, leagueId: 'L1', state: st });
  assert.deepEqual(e.statsPerTeam.statsMap.team0002.ACTIVE.statsMap[id], rows[id]);
  // the placeholder counts as present: rewriting again adds nothing
  assert.deepEqual(P.handleLive(clone7(d), { reqData: LIVE_POLL_REQ }, { rules: RULES4, leagueId: 'L1', state: st }), d);
});

// Period + Day timeframe (viewType 3): each slot also carries statsMap2 (the Day values, same shape; the cards' chips are
// drawn from it, live 2026-10-17). Built here from the real period response: statsMap2 = statsMap with every value
// doubled (still exact sums), so a Day Peri read from the Period rows would be caught.
const dbl = (x) => (typeof x === 'number' ? Math.round(x * 200) / 100 : x);
function withDay(fx) {
  const d = clone7(fx);
  for (const map of ['statsMap', 'allTeamsStats']) {
    for (const slots of Object.values(d.statsPerTeam[map])) {
      for (const s of Object.values(slots)) {
        s.statsMap2 = {};
        for (const [id, row] of Object.entries(s.statsMap)) {
          s.statsMap2[id] = Object.assign({}, row, { object1: dbl(row.object1),
            object2: row.object2.map((e) => Object.assign({}, e, { fpts: dbl(e.fpts) })) });
        }
      }
    }
  }
  return d;
}
const VIEW3_REQ = Object.assign({}, LIVE_CURRENT_REQ, { viewType: '3' });

test('live Period + Day (statsMap2): every passing Day row and Day total gets its Peri first, like the Period map', () => {
  const fx = withDay(LIVE_CURRENT);
  const before = clone7(fx);
  const d = live(fx, VIEW3_REQ);
  assert.deepEqual(fx, before); // the input response is not mutated
  let n = 0, m = 0;
  for (const map of ['statsMap', 'allTeamsStats']) {
    for (const [team, slots] of Object.entries(d.statsPerTeam[map])) {
      for (const [slot, s] of Object.entries(slots)) {
        for (const [id, row] of Object.entries(s.statsMap2)) {
          const orig = fx.statsPerTeam[map][team][slot].statsMap2[id];
          const per = s.statsMap[id].object2[0];
          if (row.object2.length === orig.object2.length + 1) {
            assert.equal(row.object2[0].scipId, P.LIVE_PERI_ID);
            assert.equal(per.scipId, P.LIVE_PERI_ID, [map, team, slot, id].join('/'));
            assert.equal(row.object2[0].sv, P.fmt2(2 * per.av)); // the Day rows' own values: twice the Period Peri
            assert.deepEqual(row.object2.slice(1), orig.object2);
            n++;
          }
          if (s.statsMap[id].object2[0].scipId === P.LIVE_PERI_ID) m++;
          else assert.deepEqual(row, orig);
        }
        assert.equal(s.totalFpts, fx.statsPerTeam[map][team][slot].totalFpts);
      }
    }
  }
  assert.ok(n >= 12 + 4 && n === m, n + ' vs ' + m); // as many Day rows got Peri as Period rows
  assert.equal(periEntry(d.statsPerTeam.statsMap.team0002.ACTIVE.statsMap2._2010).sv, '171.90');
  assert.deepEqual(live(clone7(d), VIEW3_REQ), d); // rewritten twice: one Peri entry per row
  // a response without statsMap2 is unchanged by this (the period-only tests above cover it)
  assert.equal(live(LIVE_CURRENT, LIVE_CURRENT_REQ).statsPerTeam.statsMap.team0001.ACTIVE.statsMap2, undefined);
});

test('live Period + Day: a failing Day total keeps Peri off a full response; on a poll it gets the "-" placeholder', () => {
  const bad = withDay(LIVE_CURRENT);
  bad.statsPerTeam.statsMap.team0001.ACTIVE.statsMap2._2010.object1 += 1;
  assert.equal(P.handleLive(bad, { reqData: VIEW3_REQ }, { rules: RULES4, leagueId: 'L1', state: P.newState() }), bad);
  const st = P.newState();
  live(withDay(LIVE_CURRENT), VIEW3_REQ, RULES4, st);
  const poll = withDay(LIVE_POLL);
  poll.statsPerTeam.statsMap.team0001.ACTIVE.statsMap2._2010.object1 += 1;
  const d = P.handleLive(poll, { reqData: LIVE_POLL_REQ }, { rules: RULES4, leagueId: 'L1', state: st });
  assert.deepEqual(periEntry(d.statsPerTeam.statsMap.team0001.ACTIVE.statsMap2._2010), { scipId: P.LIVE_PERI_ID, sv: '-', av: '-', fpts: '-' });
  assert.notEqual(periEntry(d.statsPerTeam.statsMap.team0001.ACTIVE.statsMap._2010).sv, '-');
  assert.deepEqual(P.handleLive(clone7(d), { reqData: LIVE_POLL_REQ }, { rules: RULES4, leagueId: 'L1', state: st }), d); // not doubled
});

test('live: a team total with no entries and FPts 0 is Peri 0, not a failure', () => {
  const fx = clone7(LIVE_CURRENT);
  for (const map of ['statsMap', 'allTeamsStats']) fx.statsPerTeam[map].team0001.ACTIVE.statsMap._2010 = { object2: [], object1: 0 };
  const d = live(fx, LIVE_CURRENT_REQ);
  assert.equal(periEntry(d.statsPerTeam.statsMap.team0001.ACTIVE.statsMap._2010).sv, '0.00');
});

test('live actual mode needs positive evidence: no sppId, or any value but "-1", is untouched', () => {
  for (const req of [{}, { sppId: '0' }, { sppId: null }, { sppId: 'x' }]) {
    const fx = clone7(LIVE_CURRENT);
    assert.equal(P.handleLive(fx, { reqData: req }, { rules: RULES4, leagueId: 'L1', state: P.newState() }), fx, JSON.stringify(req));
  }
  // projected-shaped rows (they pass the sum check) with reqData {} and no provider: untouched
  const pj = clone7(LIVE_TEST_PROJECTED);
  delete pj.displayedSelections.realOrStatProjProvider;
  assert.equal(P.handleLive(pj, { reqData: {} }, { rules: RULES_TEST, leagueId: 'L1', state: P.newState() }), pj);
  assert.equal(P.liveIsProjected({}, { sppId: -1 }), false); // number -1 is "-1"
  assert.equal(P.liveIsProjected({ displayedSelections: { realOrStatProjProvider: { id: '-1' } } }, { sppId: '-1' }), false);
  assert.equal(P.liveIsProjected({ displayedSelections: { realOrStatProjProvider: {} } }, { sppId: '-1' }), true);
});

test('live sum check uses its own 0.005 tolerance', () => {
  assert.equal(P.LIVE_TOLERANCE, 0.005);
  const fx = clone7(LIVE_CURRENT);
  const rows = fx.statsPerTeam.statsMap.team0002.ACTIVE.statsMap;
  const ids = Object.keys(rows).filter((k) => !k.startsWith('_') && rows[k].object2[0].scipId.startsWith('2010#'));
  rows[ids[0]].object1 = Math.round((rows[ids[0]].object1 + 0.01) * 100) / 100; // inside the old 0.05, outside 0.005
  const d = live(fx, LIVE_CURRENT_REQ);
  assert.equal(periEntry(d.statsPerTeam.statsMap.team0002.ACTIVE.statsMap[ids[0]]), undefined);
  assert.ok(periEntry(d.statsPerTeam.statsMap.team0002.ACTIVE.statsMap[ids[1]]));
});

test('fpgCheck: lookup FPts / GP against the shown FP/G, to the shown digits', () => {
  const v = { status: 'ok', peri: 1, perG: 0.5, fpts: 9.65, gp: 2 };
  assert.equal(P.fpgCheck(v, '4.83'), 'ok');
  assert.equal(P.fpgCheck(v, '4.8'), 'ok');
  assert.equal(P.fpgCheck(v, '4.90'), 'mismatch');
  assert.equal(P.fpgCheck(v, ''), 'none');
  assert.equal(P.fpgCheck(v, '-'), 'none');
  assert.equal(P.fpgCheck(Object.assign({}, v, { gp: 0 }), '4.83'), 'none');
  assert.equal(P.fpgCheck({ status: 'goalie' }, '1'), 'ok');
});

test('roster FP/G-only table: a stale lookup value (other FP/G) shows "?", no FP/G shown shows "–"', () => {
  const d = clone7(ROSTER_STATS_SEASON);
  const vals = P.rosterPeri(d, RULES4);
  const e = Object.assign({}, d, { tables: d.tables.map((x, j) => (j === 0 ? dropCol(x, 'fpts') : x)) });
  const t = e.tables[0], hc = t.header.cells;
  const gi = hc.findIndex((c) => c.key === 'fptsPerGame');
  const want = vals.get(String(d.tables[0].scGroup || '#0'));
  const players = t.rows.filter((r) => r.scorer && r.scorer.scorerId && want.get(r.scorer.scorerId) && want.get(r.scorer.scorerId).status === 'ok' && want.get(r.scorer.scorerId).gp > 0);
  assert.ok(players.length >= 2);
  const [p1, p2] = players;
  p1.cells[gi] = Object.assign({}, p1.cells[gi], { content: String((Number(p1.cells[gi].content) + 1).toFixed(2)) });
  p2.cells[gi] = Object.assign({}, p2.cells[gi], { content: '' });
  const a = P.augmentRoster(e, RULES4, vals);
  const ai = a.tables[0].header.cells.findIndex((c) => c.key === 'fh_peri_g');
  const row = (id) => a.tables[0].rows.find((r) => r.scorer && r.scorer.scorerId === id);
  assert.equal(row(p1.scorer.scorerId).cells[ai].content, '?');
  assert.equal(row(p2.scorer.scorerId).cells[ai].content, '–');
  const others = players.slice(2).filter((r) => want.get(r.scorer.scorerId).perG !== null);
  for (const r of others) assert.equal(row(r.scorer.scorerId).cells[ai].content, P.fmt2(want.get(r.scorer.scorerId).perG));
});

test('Players FP/G-only table: lookup rows whose FP/G differs show "?", none shown "–", the rest their values', async () => {
  const fi = STATS_RESPONSE.tableHeader.cells.findIndex((c) => c.key === 'fpts');
  const sched = clone5(STATS_RESPONSE);
  const keep = sched.tableHeader.cells.map((c, i) => i !== fi && !/^\d+#/.test(String(c.scipId || c.key || '')));
  sched.tableHeader.cells = sched.tableHeader.cells.filter((c, i) => keep[i]);
  sched.statsTable = sched.statsTable.map((r) => Object.assign({}, r, { cells: r.cells.filter((c, i) => keep[i]) }));
  const gi0 = sched.tableHeader.cells.findIndex((c) => c.key === 'fptsPerGame');
  const want = P.periByScorer(STATS_RESPONSE, RULES4);
  const okRows = sched.statsTable.filter((r) => { const v = want.get(r.scorer.scorerId); return v.status === 'ok' && v.gp > 0; });
  assert.ok(okRows.length >= 3);
  okRows[0].cells[gi0] = Object.assign({}, okRows[0].cells[gi0], { content: '99.99' });
  okRows[1].cells[gi0] = Object.assign({}, okRows[1].cells[gi0], { content: '-' });
  const { srv, warmJson } = setup5({ stats: (d) => {
    if (d.view !== 'STATS') return clone5(sched);
    if (d.maxResultsPerPage === '500') return pageData(STATS_RESPONSE.statsTable, 1, 500);
    return clone5(STATS_RESPONSE);
  } });
  const { first, d } = await warmJson({ view: 'SCHEDULE_PERIOD', pageNumber: '1' });
  assertLoading5(first);
  assert.equal(srv.poolCalls().length, 0);
  const gi = d.tableHeader.cells.findIndex((c) => c.key === 'fh_peri_g');
  const cell = (id) => d.statsTable.find((r) => r.scorer.scorerId === id).cells[gi].content;
  assert.equal(cell(okRows[0].scorer.scorerId), '?');
  assert.equal(cell(okRows[1].scorer.scorerId), '–');
  const v = want.get(okRows[2].scorer.scorerId);
  if (v.perG !== null) assert.equal(cell(okRows[2].scorer.scorerId), P.fmt2(v.perG));
});

// ---- final review fixes ----
// A self-consistent pool row (FPts + 0.45 and SOG + 1: it rebuilds) that is not the row shown: its Peri is never shown.
const bump = (row) => {
  const fi = hdrIdx4(STATS_RESPONSE, 'fpts'), sog = STATS_RESPONSE.tableHeader.cells.findIndex((c) => c.shortName === 'SOG');
  const r = clone5(row);
  r.cells[fi].content = (Number(r.cells[fi].content) + 0.45).toFixed(2);
  r.cells[sog].content = String(Number(r.cells[sog].content) + 1);
  return r;
};
const assertUpdating = (cell) => { assert.equal(cell.content, '–'); assert.equal(cell.toolTip, P.UPDATING_TIP); };

test('augmentStats: a value whose FPts is not the row\'s shown FPts is "–" (values still updating); no shown FPts "–"', () => {
  const bumped = Object.assign({}, STATS_RESPONSE, { statsTable: STATS_RESPONSE.statsTable.map(bump) });
  const vals = P.periByScorer(bumped, RULES4);
  const page = clone5(STATS_RESPONSE);
  page.statsTable[1].cells[hdrIdx4(page, 'fpts')].content = '-';
  const out = P.augmentStats(page, RULES4, vals);
  const i = periIdx5(out);
  out.statsTable.forEach((r, k) => {
    if (vals.get(r.scorer.scorerId).status !== 'ok') return;
    if (k === 1) { assert.equal(r.cells[i].content, '–'); assert.equal(r.cells[i].toolTip, undefined); return; }
    assertUpdating(r.cells[i]); assertUpdating(r.cells[i + 1]);
  });
  assert.match(P.UPDATING_TIP, /values still updating — reload to refresh/);
});

test('Players: a lookup-miss row whose pool FPts is shown + 0.45 shows "–", not the pool Peri', async () => {
  const look = clone5(PLAYERS_SCHEDULE_LOOKUP);
  const gone = look.statsTable.splice(2, 1)[0];
  const poolRows = PLAYERS_SCHEDULE_LOOKUP.statsTable.map((r) => (r.scorer.scorerId === gone.scorer.scorerId ? bump(r) : r));
  const { srv, warmJson } = playersServer(PLAYERS_SCHEDULE, look, poolRows);
  const { first, d } = await warmJson({ view: 'SCHEDULE_PERIOD', pageNumber: '1' });
  assertLoading5(first);
  assert.ok(srv.poolCalls().length >= 1);
  const i = periIdx5(d);
  assert.equal(P.periByScorer(pageData(poolRows, 1, 500), RULES4).get(gone.scorer.scorerId).status, 'ok');
  assertUpdating(d.statsTable.find((r) => r.scorer.scorerId === gone.scorer.scorerId).cells[i]);
  assert.match(d.statsTable.find((r) => r.scorer.scorerId !== gone.scorer.scorerId).cells[i].content, /^-?\d+\.\d\d$/);
});

function staleAllServer() {
  const { lw, skaters, stats } = allViewServer();
  const moved = [bump(lw), ...skaters.slice(1)];
  return { lw, stats: (d) => (d.maxResultsPerPage === '500' && d.positionOrGroup === 'HOCKEY_SKATING'
    ? pageData(moved, Number(d.pageNumber), 500) : stats(d)) };
}

test('All Players (no lookup): a pool row whose FPts is shown + 0.45 shows "–"', async () => {
  const { stats } = staleAllServer();
  const { srv, warmJson } = setup5({ stats });
  const { first, d } = await warmJson({ positionOrGroup: 'ALL', pageNumber: '1' });
  assertLoading5(first);
  assert.equal(lookupCalls(srv).length, 0);
  const i = periIdx5(d);
  assertUpdating(d.statsTable[0].cells[i]);
  assertUpdating(d.statsTable[0].cells[i + 1]);
});

test('our sort with a separate values pool: a shown row whose pool FPts is shown + 0.45 shows "–"', async () => {
  const { stats } = staleAllServer();
  const { sendJson } = setup5({ stats });
  const d = await sendJson({ positionOrGroup: 'ALL', pageNumber: '1', sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI' });
  assert.equal(d.displayedSortType, 'SCORING_CATEGORY');
  const i = periIdx5(d);
  const row = d.statsTable.find((r) => r.scorer.posShortNames === 'LW');
  assertUpdating(row.cells[i]);
});

test('our sort: past 30 s for the pools, Fantrax\'s SCORE response passes through untouched (no Peri header)', async () => {
  const g = gate5();
  const waits = [];
  const { srv, send } = setup5({ rows: pool5(30), poolGate: g.p }, undefined,
    (ms) => { waits.push(ms); return ms === P.SORT_WAIT_MS ? Promise.resolve() : never5(); });
  assert.equal(P.SORT_WAIT_MS, 30000);
  const res = await send({ sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI', pageNumber: '1' });
  const pageCall = srv.pageCalls().find((c) => c.init.body.indexOf('uiv') >= 0);
  assert.equal(await res.text(), pageCall.text); // the SCORE response exactly as Fantrax sent it
  assert.ok(waits.includes(30000));
  g.open();
  await tick5();
});

test('draft pages are never rewritten: refUrl or the page path naming /draft passes straight through', async () => {
  const srv = server5();
  const win = { fetch: srv.fetch };
  P.install(win, { retryDelay: 0, delay: never5 });
  const body = (refUrl) => JSON.stringify({ msgs: [{ method: 'getPlayerStats', data: { sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI' } }],
    uiv: 3, refUrl });
  const init = { method: 'POST', body: body('https://www.fantrax.com/fantasy/league/L1/draft;view=x') };
  const res = await win.fetch('/fxpa/req?leagueId=L1', init);
  assert.equal(srv.calls.length, 1);
  assert.equal(srv.calls[0].init, init);       // sent as is (our sort not rewritten)
  assert.equal(res, srv.calls[0].res);          // response untouched
  assert.equal(srv.rulesCalls().length, 0);
  // the page path (SPA navigation after the @exclude was checked)
  const srv2 = server5();
  const win2 = { fetch: srv2.fetch, location: { href: 'https://www.fantrax.com/fantasy/league/L1/players', pathname: '/fantasy/league/L1/players' } };
  P.install(win2, { retryDelay: 0, delay: never5 });
  srv2.calls.length = 0;
  win2.location.pathname = '/fantasy/league/L1/draft';
  const init2 = { method: 'POST', body: body('x') };
  const res2 = await win2.fetch('/fxpa/req?leagueId=L1', init2);
  assert.equal(srv2.calls.length, 1);
  assert.equal(res2, srv2.calls[0].res);
  assert.equal(srv2.calls[0].init, init2);
});

test('a position override we cannot name marks the category; a roster Totals row then shows "–"', () => {
  const extra = '<tr><td class="scGroup"><p>Skaters</p></td><td class="scoringPts"></td><td class="position"><p>Forward</p></td>'
    + '<td class="points"><p>0.5</p></td></tr>';
  const at = RULES_HTML.indexOf('<tr><td class="scGroup"><p>Skaters</p></td><td class="scoringPts"><p title="">Power Play Points');
  const r = P.parseRules(RULES_HTML.slice(0, at) + extra + RULES_HTML.slice(at));
  assert.equal(r.skater.SOG.unknownPos, true);
  assert.deepEqual(r.skater.SOG.byPos, {});
  assert.equal(RULES4.skater.SOG.unknownPos, undefined);
  const v = peri7(P.augmentRoster(ROSTER_STATS_FANTASY_TEAM, r, P.rosterPeri(ROSTER_STATS_FANTASY_TEAM, r)));
  assert.equal(v.Totals, '– –');
  assert.equal(peri7(P.augmentRoster(ROSTER_STATS_FANTASY_TEAM, RULES4, P.rosterPeri(ROSTER_STATS_FANTASY_TEAM, RULES4))).Totals, '375.20 2.45');
});

test('a background read is scored when it arrives, so the view that finds it does no scoring', async () => {
  const srv = server5({ rows: pool5(30) });
  const st = P.newState();
  const apiImpl = (lid, msgs) => P.api(lid, msgs, srv.fetch, 0);
  let n = 0;
  const fn = (d) => { n++; return P.periByScorer(d, RULES4); };
  const sel = { scoringCategoryType: '5', view: 'STATS' };
  assert.equal(P.peekPool('L1', sel, st), null);       // nothing yet, and peeking starts no read
  assert.equal(srv.poolCalls().length, 0);
  await P.pullPool('L1', sel, apiImpl, st, { rules: RULES4, fn });
  assert.equal(n, 1);
  const e = P.peekPool('L1', sel, st);
  assert.ok(e && e.derived && e.derived.rules === RULES4 && e.derived.v.size === 30);
  await P.cachedLookup('L1', 'getPlayerStats', { pageNumber: '1' }, apiImpl, st, { rules: RULES4, fn });
  assert.equal(n, 2);
  assert.ok(P.peekLookup('L1', 'getPlayerStats', { pageNumber: '1' }, st).derived);
});

test('pools are scored when they arrive (sort pools too): later views and sort clicks never score on the path', async () => {
  const rows = pool5(40);
  const srv = server5({ rows, stats: (d) => {
    if (d.scoringCategoryType === '7' && !d.maxResultsPerPage) { const pg = pageData(rows, 1, 20); pg.displayedScoringCategoryType = '7'; return pg; }
    return undefined;
  } });
  const st = P.newState();
  const hook = P.makeHook(srv.fetch, { state: st, retryDelay: 0, delay: never5 });
  const rules = await hook.prewarm('L1');
  const sendJson = async (data) => (await (await hook('/fxpa/req?leagueId=L1', { method: 'POST',
    body: JSON.stringify({ msgs: [{ method: 'getPlayerStats', data }], uiv: 3 }) })).json()).responses[0].data;
  // a Peri sort in the Tracked Stats view: its display pool is the values pool of a Per-Game view with the same filters
  await sendJson({ sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI', pageNumber: '1', view: 'STATS', scoringCategoryType: '5' });
  const entries = [...st.pools.values()];
  assert.ok(entries.length >= 1);
  for (const e of entries) assert.equal(e.derived && e.derived.rules, rules); // scored on arrival
  const scores = entries.map((e) => e.derived);
  const pulls = srv.poolCalls().length;
  const d = await sendJson({ scoringCategoryType: '7', pageNumber: '1', view: 'STATS' });
  assert.equal(srv.poolCalls().length, pulls);                     // the sort's pool answered it
  assert.match(d.statsTable[0].cells[periIdx5(d)].content, /^-?\d+\.\d\d$/);
  await sendJson({ sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI', pageNumber: '2', view: 'STATS', scoringCategoryType: '5' });
  entries.forEach((e, k) => assert.equal(e.derived, scores[k]));  // never re-scored
  // an entry found WITHOUT a score (read with no prep) is not scored on the path: loading now, scored a task later
  const st2 = P.newState();
  const hook2 = P.makeHook(srv.fetch, { state: st2, retryDelay: 0, delay: never5 });
  await hook2.prewarm('L1');
  await P.pullPool('L1', { scoringCategoryType: '5', view: 'STATS', pageNumber: '1' }, (l, m) => P.api(l, m, srv.fetch, 0), st2);
  const raw = [...st2.pools.values()][0];
  const send2 = async () => (await (await hook2('/fxpa/req?leagueId=L1', { method: 'POST',
    body: JSON.stringify({ msgs: [{ method: 'getPlayerStats', data: { scoringCategoryType: '7', pageNumber: '1', view: 'STATS' } }], uiv: 3 }) })).json()).responses[0].data;
  const d1 = await send2();
  assert.equal(raw.derived, undefined);                            // not scored while answering
  assert.ok(JSON.stringify(d1).includes(P.LOADING_TIP));
  await new Promise((r) => setTimeout(r, 0));
  assert.ok(raw.derived);                                          // scored in a later task
  const d2 = await send2();
  assert.match(d2.statsTable[0].cells[periIdx5(d2)].content, /^-?\d+\.\d\d$/);
  await settle5();
});

test('cache freshness counts from when a read finished, not when it started', async () => {
  const clock = { t: 1e12 };
  const st = P.newState({ now: () => clock.t });
  const g = gate5();
  let n = 0;
  const apiImpl = async () => { n++; if (n === 1) { await g.p; } return [{ ok: 1 }]; };
  const p = P.cachedLookup('L1', 'getPlayerStats', { a: 1 }, apiImpl, st);
  clock.t += 2 * 60 * 1000;               // a slow read: 2 minutes in flight
  g.open(); await p;
  clock.t += 2 * 60 * 1000;               // 4 min after start, 2 min after it finished: still fresh
  assert.ok(P.peekLookup('L1', 'getPlayerStats', { a: 1 }, st));
  await P.cachedLookup('L1', 'getPlayerStats', { a: 1 }, apiImpl, st);
  assert.equal(n, 1);
  clock.t += 60 * 1000 + 1;
  assert.equal(P.peekLookup('L1', 'getPlayerStats', { a: 1 }, st), null);
  await P.cachedLookup('L1', 'getPlayerStats', { a: 1 }, apiImpl, st);
  assert.equal(n, 2);
});

test('the sort deadline timer is cleared when the sort is done (real timers)', async () => {
  const srv = server5({ rows: pool5(30) });
  const real = { set: globalThis.setTimeout, clear: globalThis.clearTimeout };
  const live = new Set();
  globalThis.setTimeout = (fn, ms, ...a) => { const t = real.set(() => { live.delete(t); fn(...a); }, ms); if (ms === P.SORT_WAIT_MS) live.add(t); return t; };
  globalThis.clearTimeout = (t) => { live.delete(t); real.clear(t); };
  try {
    const win = { fetch: srv.fetch };
    P.install(win, { retryDelay: 0 });                  // no injected delay: the script's own timer
    await win.fetch.prewarm('L1');
    const d = (await (await win.fetch('/fxpa/req?leagueId=L1', { method: 'POST', body: JSON.stringify({ msgs: [{ method: 'getPlayerStats',
      data: { sortType: 'SCORING_CATEGORY', scipId: 'FH_PERI', pageNumber: '1' } }], uiv: 3 }) })).json()).responses[0].data;
    assert.equal(d.displayedSortType, 'SCORING_CATEGORY');
    assert.equal(live.size, 0);
  } finally { globalThis.setTimeout = real.set; globalThis.clearTimeout = real.clear; }
});
