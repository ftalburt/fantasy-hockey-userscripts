// ==UserScript==
// @name         Fantrax Peripherals
// @namespace    http://ftalburt.com/
// @version      1.0.1
// @description  Adds Peri / Peri/G (fantasy points from non-points categories) to Fantrax's Players list, player card, Team Roster and Live Scoring
// @author       Forrest Talburt
// @match        https://www.fantrax.com/*
// @exclude      https://www.fantrax.com/fantasy/league/*/draft*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ftalburt/fantasy-hockey-userscripts/master/fantrax-peripherals.user.js
// @downloadURL  https://raw.githubusercontent.com/ftalburt/fantasy-hockey-userscripts/master/fantrax-peripherals.user.js
// ==/UserScript==

/*
 * A network rewrite: Fantrax's own responses get the added columns and Fantrax draws them. The only DOM work is
 * hiding our own Peri on Live Scoring while it is in Stats mode (one style rule, one observer). Pure logic is exported to Node for `node --test`. Read-only: only getPlayerStats,
 * getPlayerProfile, getTeamRosterInfo and getLeagueRulesOld are ever called (getLiveScoringStats responses are rewritten,
 * never requested). Only Fantrax's own page requests are
 * rewritten (other userscripts' calls pass through untouched).
 */

// ---- scoring rules -> weights ----

const POINTS_CATS = ['G', 'A', 'Pt', 'PTS', 'PPG', 'PPA', 'PPP', 'SHG', 'SHA', 'SHP', 'GWG', 'GTG', 'OTG', 'HT', '+/-'];
const POS_NAMES = { Center: 'C', 'Left Wing': 'LW', 'Right Wing': 'RW', Defense: 'D', Goalie: 'G' };

function decodeText(s) {
  return s.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#0*34;|&quot;/g, '"').replace(/&#0*39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

// Regex row extractor (Node has no DOMParser; the page uses it too, so there is one parser).
// Returns { header: class-name of each <th>, rows: text of each <td> per <tr> } of ONE table: the one whose header has
// a th.scGroup (the real rules page has roster-slot tables before the scoring table), else the first.
function tableRows(html) {
  const out = { header: [], rows: [] };
  const trs = String(html || '').match(/<tr\b[\s\S]*?<\/tr>/gi) || [];
  for (const tr of trs) {
    const cells = [...tr.matchAll(/<(t[dh])\b([^>]*)>([\s\S]*?)<\/\1>/gi)];
    if (!cells.length) continue;
    if (cells.every((c) => c[1].toLowerCase() === 'th')) {
      if (!out.header.length) out.header = cells.map((c) => ((c[2].match(/class="([^"]*)"/) || [])[1] || '').trim());
    } else {
      out.rows.push(cells.map((c) => decodeText(c[3])));
    }
  }
  return out;
}
function rowsFromHtml(html) {
  const tables = (String(html || '').match(/<table\b[\s\S]*?<\/table>/gi) || []).map(tableRows);
  if (!tables.length) return tableRows(html);
  return tables.find((t) => t.header.some((h) => h.split(/\s+/).includes('scGroup'))) || tables[0];
}

// Columns are found by header class (scGroup, scoringPts, optional position, points), not by cell count.
function parseRules(html, parseHtml) {
  try {
    const { header, rows } = (parseHtml || rowsFromHtml)(html);
    const col = (cls) => header.findIndex((h) => h.split(/\s+/).includes(cls));
    const iGroup = col('scGroup'), iCat = col('scoringPts'), iPos = col('position'), iPts = col('points');
    if (iGroup < 0 || iCat < 0 || iPts < 0) return null;
    const skater = {};
    let group = '', abbr = null;
    for (const r of rows) {
      if (r[iGroup]) group = r[iGroup];
      const cat = r[iCat] || '';
      if (cat) abbr = (cat.match(/\(([^()]*)\)\s*$/) || [])[1] || null; // empty category = position override of the previous
      if (group !== 'Skaters' || !abbr) continue;
      const pts = Number(r[iPts]);
      if (r[iPts] === '' || !Number.isFinite(pts)) continue;
      const pos = iPos >= 0 ? r[iPos] : 'Default';
      const e = skater[abbr] || (skater[abbr] = { default: undefined, byPos: {} });
      if (!pos || pos === 'Default') e.default = pts;
      else if (POS_NAMES[pos]) e.byPos[POS_NAMES[pos]] = pts;
      else e.unknownPos = true; // an override for a position we cannot name: totalsPeri treats its weights as differing
    }
    for (const k of Object.keys(skater)) if (skater[k].default === undefined) delete skater[k];
    return Object.keys(skater).length ? { skater } : null;
  } catch (e) {
    return null;
  }
}

function isPointsCat(abbr) { return POINTS_CATS.includes(abbr); }
function periCats(rules) { return Object.keys(rules.skater).filter((a) => !isPointsCat(a)).sort(); }
function pointsCats(rules) { return Object.keys(rules.skater).filter(isPointsCat).sort(); }

// ---- per-row Peri with the FPts safety check ----

const FPTS_TOLERANCE = 0.05;
// The "?" tooltip when Fantrax's own FPts can't be rebuilt from the row's stats (e.g. a season row listing a faceoff
// that none of the game logs or the FPts count; live 2026-10-17).
const MISMATCH_NOTE = "Fantrax's FPts doesn't match the stats in this row";

// statsFromCells(headerCells, rowCells): headerCells = data.tableHeader.cells ({shortName, key?, scipId?}; plain
// shortName strings are also accepted and treated as category columns); rowCells = the row's cells ({content}) or
// content strings. Only scoring-category columns (key/scipId like "2010#2270#-1") are read, so the non-category
// "+/-" Ros-change column can never shadow the +/- category. Blank / "-" / non-numeric cells are absent (never 0).
// Fantrax writes thousands with a comma ("1,008" FOW over a season): strip it before Number().
function statNum(x) {
  return Number(String(x === undefined || x === null ? '' : x).trim().replace(/,/g, ''));
}

function statsFromCells(header, cells) {
  const out = {};
  header.forEach((h, i) => {
    const isStr = typeof h === 'string';
    const name = isStr ? h : h && h.shortName;
    const id = isStr ? '' : String((h && (h.scipId || h.key)) || '');
    if (!name || (!isStr && !/^\d+#/.test(id)) || out[name] !== undefined) return;
    const c = cells[i];
    const raw = c && typeof c === 'object' ? c.content : c;
    if (raw === undefined || raw === null) return;
    const t = String(raw).trim();
    if (t === '' || t === '-') return;
    const n = statNum(t);
    if (Number.isFinite(n)) out[name] = n;
  });
  return out;
}

// Recent Games "Faceoffs" cell "24-23-51%" -> { FOW: 24, FOL: 23 }
function parseFaceoffs(text) {
  const m = String(text || '').match(/^\s*(\d[\d,]*)-(\d[\d,]*)-/);
  return m ? { FOW: statNum(m[1]), FOL: statNum(m[2]) } : null;
}

function weightFor(rule, pos) {
  return rule.byPos && rule.byPos[pos] !== undefined ? rule.byPos[pos] : rule.default;
}

// Peri = sum of peripheral stats x weight; checked by rebuilding Fantrax's own FPts from every skater category.
// HT when the row has no HT column: on per-game rows (game logs) it is 1 when G >= 3, else 0. On totals rows it is
// solved as the one unknown: h = (FPts - rebuilt without HT) / HT weight must be a whole number 0 <= h <= floor(G / 3)
// (to within the tolerance); if no h fits the row is a mismatch. Peri never depends on HT.
// Positions are tried in order (multi-position players); the first that reproduces FPts wins.
// tol: how far the rebuilt FPts may be from the shown one (default FPTS_TOLERANCE; fptsTolerance for shown text).
function rowPeri(stats, positions, fpts, rules, perGame, tol) {
  const bad = (status, note) => ({ peri: null, perG: null, status, note });
  const skaterPos = (positions || []).filter((p) => p !== 'G'); // "LW,G" rows exist: score them as the skater
  if ((positions || []).length && !skaterPos.length) return bad('goalie');
  const t = tol === undefined ? FPTS_TOLERANCE : tol;
  const s = Object.assign({}, stats);
  if (s.PPP === undefined && s.PPG !== undefined && s.PPA !== undefined) s.PPP = s.PPG + s.PPA;
  if (s.SHP === undefined && s.SHG !== undefined && s.SHA !== undefined) s.SHP = s.SHG + s.SHA;
  if (perGame && s.HT === undefined && s.G !== undefined) s.HT = s.G >= 3 ? 1 : 0;
  const cats = Object.keys(rules.skater);
  if (!Number.isFinite(fpts)) return bad('missing', 'no FPts');
  const solveHT = !perGame && rules.skater.HT && s.HT === undefined && s.G !== undefined;
  const absent = cats.filter((a) => s[a] === undefined && !(a === 'HT' && solveHT));
  if (absent.length) return bad('missing', 'no column for ' + absent.join(', '));
  const periSet = periCats(rules);
  for (const pos of skaterPos) {
    let rebuilt = 0, peri = 0;
    for (const a of cats) {
      if (a === 'HT' && solveHT) continue;
      const v = s[a] * weightFor(rules.skater[a], pos);
      rebuilt += v;
      if (periSet.includes(a)) peri += v;
    }
    let fits = Math.abs(rebuilt - fpts) <= t;
    if (solveHT) {
      const w = weightFor(rules.skater.HT, pos);
      const h = w ? Math.round((fpts - rebuilt) / w) : 0;
      fits = h >= 0 && h <= Math.floor(s.G / 3) && Math.abs(rebuilt + h * w - fpts) <= t;
    }
    if (fits) {
      const gp = stats.GP;
      return { peri, perG: typeof gp === 'number' && gp > 0 ? peri / gp : null, gp, status: 'ok' };
    }
  }
  return bad('mismatch', MISMATCH_NOTE);
}

// Shown FPts text -> half a unit of its last digit (plus float slack), at least FPTS_TOLERANCE. The profile Stats tab
// rounds: past seasons to whole points ("59" for 59.15), the current one to 0.1 ("9.7" for 9.65) (live 2026-10-17).
function fptsTolerance(text) {
  const dec = (String(text === undefined || text === null ? '' : text).trim().split('.')[1] || '').length;
  return Math.max(FPTS_TOLERANCE, 0.5 * Math.pow(10, -dec)) + 1e-6;
}
// Two decimals rounded half away from zero, like Fantrax (9.65 / 2 shows 4.83, where toFixed gives 4.82).
function fmt2(x) {
  return (Math.round(Math.abs(x) * 100 + 1e-6) / 100 * (x < 0 ? -1 : 1)).toFixed(2).replace(/^-(0\.00)$/, '$1');
}
// Shown FPts text -> number; blank or "-" (a multi-team season's per-team row, Career Total) -> NaN, never 0.
function fptsNum(text) {
  const t = String(text === undefined || text === null ? '' : text).trim();
  return t === '' || t === '-' ? NaN : statNum(t);
}

// A table with FP/G but no FPts column: a value (from a lookup) counts only when its FPts / GP is the FP/G shown, to the
// shown digits. 'ok' = matches, 'none' = nothing to check it by (no FP/G shown, no GP): "–", 'mismatch' = "?".
function fpgCheck(v, fpgText) {
  const shown = fptsNum(fpgText);
  if (!v || v.status !== 'ok') return 'ok';
  if (!Number.isFinite(shown) || !(typeof v.gp === 'number' && v.gp > 0) || !Number.isFinite(v.fpts)) return 'none';
  return Math.abs(v.fpts / v.gp - shown) <= fptsTolerance(fpgText) ? 'ok' : 'mismatch';
}

// ---- augment / sort / page getPlayerStats responses ----

const PLAIN_DROP = ['toolTip', 'highlight', 'gainColor', 'briefContent', 'props', 'colspan'];

// A copy of Fantrax's own FPts / FP/G cell with our content: same plain fields (width, align...), minus anything
// that would make it look or act different from an ordinary stat cell (highlight, colour, tooltip, links, spans).
function plainCell(src, content, toolTip) {
  const c = Object.assign({}, src, { content });
  for (const k of PLAIN_DROP) delete c[k];
  if (toolTip) c.toolTip = toolTip;
  return c;
}


const SORT_PERI = 'FH_PERI';
const SORT_PERI_G = 'FH_PERI_G';
const DASH = '–';
const LOADING_TIP = 'Peripherals still loading: change page or reload to see them';
const UPDATING_TIP = 'Peri unavailable: values still updating — reload to refresh';
const UNAVAILABLE_TIP = 'Peripherals unavailable right now';

function isProjected(data) {
  const sel = (data && data.displayedSelections && data.displayedSelections.displayedSeasonOrProjection) || {};
  return String(sel.code || '').startsWith('PROJECTION_') || String(sel.timeframeTypeCode || '').startsWith('PROJECTED');
}

function headerIndex(data, key) {
  return data.tableHeader.cells.findIndex((c) => c && c.key === key);
}

// scorerId -> rowPeri result (+ fpts) for every row of a response that carries the category columns.
function periByScorer(data, rules) {
  const out = new Map();
  const hc = data.tableHeader.cells;
  const fi = headerIndex(data, 'fpts');
  for (const row of data.statsTable || []) {
    const sc = row.scorer || {};
    const positions = String(sc.posShortNames || '').split(',').map((x) => x.trim()).filter(Boolean);
    const stats = statsFromCells(hc, row.cells);
    const fc = fi >= 0 ? row.cells[fi] : null;
    const fpts = fc ? statNum(fc.content) : NaN;
    out.set(sc.scorerId, Object.assign(rowPeri(stats, positions, fpts, rules), { fpts }));
  }
  return out;
}

// Header descriptions like Fantrax's own: its FPts / FP/G neighbour's name with "Fantasy Points" -> "Peripheral Fantasy
// Points" ("Fantasy Points (2026-27 Reg Season)" -> "Peripheral Fantasy Points (2026-27 Reg Season)"); no neighbour or no
// "Fantasy Points" in it -> the default.
const PERI_NAME = 'Peripheral Fantasy Points';
const PERI_G_NAME = 'Average Peripheral Fantasy Points per Game';
function periName(fptsName) {
  const s = typeof fptsName === 'string' ? fptsName : '';
  return s.includes('Fantasy Points') ? s.replace('Fantasy Points', PERI_NAME) : PERI_NAME;
}
function periGName(fpgName) {
  const s = typeof fpgName === 'string' ? fpgName : '';
  return s.includes('Fantasy Points') ? s.replace('Fantasy Points', PERI_NAME) : PERI_G_NAME;
}

// The rule for every value shown (from this response, a lookup or the pool): with an FPts column, a value is shown only
// when its FPts equals the row's shown FPts (to FPTS_TOLERANCE: the list shows two decimals with trailing zeros dropped,
// "46.5" / "0", so the shown-digits rule of the profile tables would be too loose here); a different FPts (a cached
// value from before the row's latest games) or no shown FPts gives "–". With FP/G but no FPts column, its FPts / GP must
// be the FP/G shown (fpgCheck): nothing to check by gives "–", a different FP/G "?".
function checkShown(v, row, fptsIdx, fpgIdx) {
  if (!v || v.status !== 'ok') return v;
  if (fptsIdx >= 0) {
    const shown = fptsNum(cellText(row.cells[fptsIdx]));
    if (!Number.isFinite(shown)) return { status: 'none', peri: null, perG: null };
    if (!Number.isFinite(v.fpts) || Math.abs(shown - v.fpts) > FPTS_TOLERANCE) {
      return { status: 'stale', peri: null, perG: null };
    }
    return v;
  }
  const c = fpgCheck(v, cellText(row.cells[fpgIdx]));
  return c === 'ok' ? v : c === 'none' ? { status: 'none', peri: null, perG: null }
    : { status: 'mismatch', peri: null, perG: null, note: 'the Stats values show a different FP/G for this row' };
}

function augmentStats(data, rules, values) {
  const fi = headerIndex(data, 'fptsPerGame');
  if (fi < 0) return data;
  const fpi = headerIndex(data, 'fpts');
  const projected = isProjected(data);
  const vals = projected ? new Map() : (values || periByScorer(data, rules));
  const fname = fpi >= 0 ? (data.tableHeader.cells[fpi] || {}).name : undefined;
  const gname = (data.tableHeader.cells[fi] || {}).name;
  const mkHeader = (short, scipId, key, name) => {
    const h = Object.assign({}, data.tableHeader.cells[fi], { shortName: short, name, key, sortDirection: 1 });
    delete h.highlightColumn;
    if (projected) { delete h.sortType; delete h.scipId; delete h.sortKey; } else {
      h.sortType = 'SCORING_CATEGORY'; h.scipId = scipId; h.sortKey = 'SCORING_CATEGORY_' + scipId;
    }
    return h;
  };
  const cells = data.tableHeader.cells.slice();
  cells.splice(fi + 1, 0, mkHeader('Peri', SORT_PERI, 'fh_peri', periName(fname)),
    mkHeader('Peri/G', SORT_PERI_G, 'fh_peri_g', periGName(gname)));
  const rowCell = (row, content, toolTip) => plainCell(row.cells[fi], content, toolTip);
  const statsTable = data.statsTable.map((row) => {
    const v = checkShown(vals.get((row.scorer || {}).scorerId), row, fpi, fi);
    let a, b;
    if (!v || v.status === 'goalie' || v.status === 'none') { a = rowCell(row, DASH); b = rowCell(row, DASH); }
    else if (v.status === 'stale') { a = rowCell(row, DASH, UPDATING_TIP); b = rowCell(row, DASH, UPDATING_TIP); }
    else if (v.status === 'loading') { a = rowCell(row, DASH, LOADING_TIP); b = rowCell(row, DASH, LOADING_TIP); }
    else if (v.status === 'unavailable') { a = rowCell(row, DASH, UNAVAILABLE_TIP); b = rowCell(row, DASH, UNAVAILABLE_TIP); }
    else if (v.status !== 'ok') {
      const t = 'Peri unavailable: ' + (v.note || MISMATCH_NOTE);
      a = rowCell(row, '?', t); b = rowCell(row, '?', t);
    } else {
      a = rowCell(row, fmt2(v.peri));
      b = rowCell(row, v.perG === null ? DASH : fmt2(v.perG));
    }
    const rc = row.cells.slice();
    rc.splice(fi + 1, 0, a, b);
    return Object.assign({}, row, { cells: rc });
  });
  return Object.assign({}, data, { tableHeader: Object.assign({}, data.tableHeader, { cells }), statsTable });
}

function sortPool(rows, scipId, reversed, values) {
  const get = (r) => values.get((r.scorer || {}).scorerId);
  const val = (r) => {
    const v = get(r);
    if (!v || v.status !== 'ok') return null;
    const x = scipId === SORT_PERI_G ? v.perG : v.peri;
    return typeof x === 'number' ? x : null;
  };
  const fp = (r) => { const v = get(r); return v && Number.isFinite(v.fpts) ? v.fpts : -Infinity; };
  const dir = reversed === true ? 1 : -1;
  return rows.slice().sort((x, y) => {
    const a = val(x), b = val(y);
    if (a === null && b === null) return fp(y) - fp(x);
    if (a === null) return 1;
    if (b === null) return -1;
    return a !== b ? dir * (a - b) : fp(y) - fp(x);
  });
}

// poolRows are already sorted (sortPool); scipId only labels the echo (the response carries no scipId field).
function pageOf(baseData, poolRows, pageNumber, perPage, scipId, reversed) {
  const total = poolRows.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, Number(pageNumber) || 1), pages);
  return Object.assign({}, baseData, {
    statsTable: poolRows.slice((page - 1) * perPage, page * perPage),
    paginatedResultSet: { totalNumResults: total, totalNumPages: pages, pageNumber: page, maxResultsPerPage: perPage },
    displayedSortType: 'SCORING_CATEGORY',
    displayedSortReversed: !!reversed,
  });
}

// Header indexes after which Peri and Peri/G go (-1 = not added), from the FPts (fi) and FP/G (gi) indexes: with both,
// Peri then Peri/G after the later of the two, so Fantrax's pair stays side by side (FPts | FP/G | Peri | Peri/G);
// with one, right after it. Peri is pushed before Peri/G at the same index.
function insertAt(fi, gi) {
  if (fi >= 0 && gi >= 0) { const at = Math.max(fi, gi); return [at, at]; }
  return [fi, gi];
}

// ---- player card ----

// Profile-table cells by header shortName (the card's header keys carry no category ids, and Recent Games has a
// single "+/-"). "Faceoffs" ("24-23-51%") becomes FOW / FOL; blank / non-numeric cells (Date, TOI...) are absent.
function profileStats(header, cells) {
  const out = {};
  header.forEach((h, i) => {
    const name = h && h.shortName, c = cells[i];
    if (!name || !c || out[name] !== undefined) return;
    const raw = String(c.content === undefined || c.content === null ? '' : c.content).trim();
    if (name === 'Faceoffs') { Object.assign(out, parseFaceoffs(raw) || {}); return; }
    if (raw === '' || raw === '-') return;
    const n = statNum(raw);
    if (Number.isFinite(n)) out[name] = n;
  });
  return out;
}

// One player-profile table, each row checked by rebuilding its FPts: with both FPts and FP/G, Peri and Peri/G right
// after the later of the two (FPts | FP/G | Peri | Peri/G); with only one, Peri right after FPts / Peri/G right after FP/G.
// A table with no GP column and a Date column is a per-game log (HT may come from G >= 3). Rows whose cell count
// differs from the header's: a full-width message row (one cell, colspan = header length) widens by the columns
// added; any other such row is left exactly as it is. A row with no games (GP 0 or blank) and FPts 0 in a table that
// has every peripheral column of the league shows Peri 0.00 and Peri/G unavailable.
// Returns the same table object when it has neither column.
function augmentProfileTable(t, positions, rules) {
  const hc = (t && t.header && Array.isArray(t.header.cells)) ? t.header.cells : null;
  if (!hc || !Array.isArray(t.rows)) return t;
  const fi = hc.findIndex((c) => c && c.key === 'fpts');
  const gi = hc.findIndex((c) => c && c.key === 'fptsPerGame');
  if (fi < 0 && gi < 0) return t;
  const perGame = !hc.some((c) => c && c.shortName === 'GP') && hc.some((c) => c && c.key === 'date');
  const added = (fi >= 0 ? 1 : 0) + (gi >= 0 ? 1 : 0);
  const gpi = hc.findIndex((c) => c && c.shortName === 'GP');
  const cols = new Set(hc.map((c) => c && c.shortName));
  if (cols.has('Faceoffs')) { cols.add('FOW'); cols.add('FOL'); }
  const hasPeriCols = periCats(rules).every((a) => cols.has(a));
  const hdr = (src, shortName, key, name) => {
    const h = Object.assign({}, src, { shortName, key, name });
    delete h.highlightColumn;
    return h;
  };
  const [pAt, gAt] = insertAt(fi, gi);
  const splice = (cells, peri, perG) => {
    const out = [];
    cells.forEach((c, i) => {
      out.push(c);
      if (i === pAt) out.push(peri);
      if (i === gAt) out.push(perG);
    });
    return out;
  };
  const header = Object.assign({}, t.header, { cells: splice(hc,
    fi >= 0 ? hdr(hc[fi], 'Peri', 'fh_peri', periName((hc[fi] || {}).name)) : null,
    gi >= 0 ? hdr(hc[gi], 'Peri/G', 'fh_peri_g', periGName((hc[gi] || {}).name)) : null) });
  const rows = t.rows.map((row) => {
    const cells = (row && row.cells) || [];
    if (cells.length !== hc.length) {
      if (cells.length !== 1 || !cells[0] || Number(cells[0].colspan) !== hc.length) return row;
      return Object.assign({}, row, { cells: [Object.assign({}, cells[0], { colspan: hc.length + added })] });
    }
    const ftext = fi >= 0 ? (cells[fi] || {}).content : '';
    const fpts = fptsNum(ftext);
    const st = profileStats(hc, cells);
    const noGames = gpi >= 0 && (st.GP === 0 || st.GP === undefined) && fpts === 0 && hasPeriCols;
    const r = noGames ? { peri: 0, perG: null, status: 'ok' }
      : rowPeri(st, positions, fpts, rules, perGame, fptsTolerance(ftext));
    let a, b;
    if (r.status === 'ok') {
      a = fmt2(r.peri);
      b = r.perG === null ? DASH : fmt2(r.perG);
    } else {
      a = b = r.status === 'mismatch' ? '?' : DASH;
    }
    const why = r.status === 'ok' ? null : 'Peri unavailable: ' + (r.note || MISMATCH_NOTE);
    const src = (i) => cells[i] || {};
    return Object.assign({}, row, { cells: splice(cells, fi >= 0 ? plainCell(src(fi), a, why) : null,
      gi >= 0 ? plainCell(src(gi), b, why) : null) });
  });
  return Object.assign({}, t, { header, rows });
}

// The player's skater positions: Overview responses carry miscData.defaultPosition ("D", "C,LW"); the other tabs'
// responses do not, but all carry miscData.leagueData "Eligible" ("D,Skt", "C,LW,Skt", "G"). "Skt" and G dropped.
function profilePositions(misc) {
  const elig = ((misc && misc.leagueData) || []).find((x) => x && x.name === 'Eligible');
  const raw = (misc && misc.defaultPosition) || (elig && elig.value) || '';
  return String(raw).split(',').map((x) => x.trim()).filter((x) => x && x !== 'G' && x !== 'Skt');
}

// Every table of every getPlayerProfile tab (Overview's Recent Games / Recent Trends, Stats, Splits, Games (Fntsy),
// Games, on the card and on the full player page) that has an FPts or FP/G column. Goalies: unchanged.
function augmentProfile(data, rules) {
  const sc = data && data.sectionContent;
  const misc = (data && data.miscData) || {};
  const positions = profilePositions(misc);
  if (!sc || typeof sc !== 'object' || !positions.length) return data; // goalie (a "LW,G" card is scored as LW)
  let changed = false;
  const out = {};
  for (const k of Object.keys(sc)) {
    const sec = sc[k];
    if (!sec || !Array.isArray(sec.tables)) { out[k] = sec; continue; }
    const tables = sec.tables.map((t) => augmentProfileTable(t, positions, rules));
    if (tables.some((t, i) => t !== sec.tables[i])) { changed = true; out[k] = Object.assign({}, sec, { tables }); } else out[k] = sec;
  }
  return changed ? Object.assign({}, data, { sectionContent: out }) : data;
}

async function handleProfile(data, plan, env) {
  try { return augmentProfile(data, env.rules); } catch (e) { warn('profile', e); return data; }
}

// ---- Team Roster: getTeamRosterInfo, views STATS and FPTS ----
//
// tables[] = {scGroup ("2010" skaters, "2020" goalies), header.cells, rows[]}. Rows: a player (scorer.scorerId), an empty
// slot or "Reserve/Inj Res spot(s) available" row (no scorer, every cell blank, full width), and on lineup-day / YTD views
// a "Totals" row (scorerColumn "Totals", statusId "y") that has NO Rk cell: in the Stats views it is one cell short; in
// Trends (OVERVIEW) it is Stats-shaped and LONGER than the header (Age, Opp, FPts, FP/G, then GP... ; live 2026-10-17).
// So a Totals row's cells start one column in when the header starts with Rk. Any other row must be header-wide; a
// table with a row that cannot be placed is left exactly as it is.

// Views that get the columns. STATS / FPTS: values from the response (Tracked totals); the rest (and Per-Game / Standard
// scoring views): one Tracked STATS lookup of the same request. GAMES_PER_POS (Min/Max) has no player FPts: not handled.
const ROSTER_VIEWS = ['STATS', 'FPTS'];
const ROSTER_LOOKUP_VIEWS = ['OVERVIEW', 'SCHEDULE_PERIOD', 'SCHEDULE_FULL'];
const ROSTER_ALL_VIEWS = ROSTER_VIEWS.concat(ROSTER_LOOKUP_VIEWS);
const isPlayerRow = (r) => !!(r && r.scorer && r.scorer.scorerId);
const isTotalsRow = (r) => !!r && !isPlayerRow(r) && (r.scorerColumn === 'Totals' || r.statusId === 'y');
const rowPositions = (r) => String(((r && r.scorer) || {}).posShortNames || '').split(',').map((x) => x.trim()).filter(Boolean);
const isCatHeader = (h) => !!h && /^\d+#/.test(String(h.scipId || h.key || ''));
const cellText = (c) => (c && c.content !== undefined && c.content !== null ? String(c.content) : '');
// Where row.cells[0] sits in the header (see above); null = a row that cannot be placed. A Totals row is placed only
// when the cell that lands under FPts is a number (a header-wide Totals row under an Rk header would otherwise put
// Age under FPts and Peri one column early); otherwise the whole table is left unchanged (rule above).
function rowOffset(hc, row) {
  const cells = (row && row.cells) || [], n = cells.length, H = hc.length;
  if (isTotalsRow(row)) {
    const off = hc[0] && hc[0].key === 'rankPosOv' ? 1 : Math.max(0, H - n);
    if (n + off < H) return null;
    const fi = hc.findIndex((c) => c && c.key === 'fpts');
    if (fi >= 0 && !(fi - off >= 0 && Number.isFinite(fptsNum(cellText(cells[fi - off]))))) return null;
    return off;
  }
  return n === H ? 0 : null;
}

function isSkaterTable(t) {
  if (!t || !t.header || !Array.isArray(t.header.cells) || !Array.isArray(t.rows)) return false;
  if (String(t.scGroup) === '2020') return false;
  const players = t.rows.filter(isPlayerRow);
  return !players.length || !players.every(isGoalieRow);
}

// GP from FPts and FP/G (the Fantasy Points view's GP cell holds GP's fantasy points: 0). The one whole number g for
// which FPts / g rounds to the shown FP/G; null when FPts or FP/G is 0 / missing or more than one g fits.
function gpFromFpg(fpts, fpgText) {
  const fpg = fptsNum(fpgText);
  if (!Number.isFinite(fpts) || !Number.isFinite(fpg) || fpts === 0 || fpg === 0) return null;
  const g0 = Math.round(fpts / fpg);
  const fits = [];
  for (let g = Math.max(1, g0 - 3); g <= g0 + 3; g++) if (Math.abs(fpts / g - fpg) <= 0.005 + 0.005 / g + 1e-9) fits.push(g);
  return fits.length === 1 ? fits[0] : null;
}

// Fantasy Points view row: every category cell is already fantasy points. Peri = the league's peripheral cells summed;
// checked by summing every category cell back to the row's FPts. Peri/G = Peri / GP (GP from gpFromFpg).
function fptsViewPeri(hc, cells, positions, fpts, fpgText, rules) {
  const bad = (status, note) => ({ peri: null, perG: null, status, note });
  const skaterPos = positions.filter((p) => p !== 'G');
  if (positions.length && !skaterPos.length) return bad('goalie');
  if (!Number.isFinite(fpts)) return bad('missing', 'no FPts');
  const have = {};
  let sum = 0;
  hc.forEach((h, i) => {
    if (!isCatHeader(h)) return;
    const t = cellText(cells[i]).trim();
    if (t === '' || t === '-') return;
    const n = statNum(t);
    if (!Number.isFinite(n)) return;
    sum += n;
    if (have[h.shortName] === undefined) have[h.shortName] = n;
  });
  const absent = Object.keys(rules.skater).filter((a) => have[a] === undefined);
  if (absent.length) return bad('missing', 'no column for ' + absent.join(', '));
  if (Math.abs(sum - fpts) > FPTS_TOLERANCE) return bad('mismatch', "Fantrax's FPts isn't the sum of the category points in this row");
  const peri = periCats(rules).reduce((a, c) => a + have[c], 0);
  const gp = gpFromFpg(fpts, fpgText);
  return { peri, perG: gp ? peri / gp : null, gp, status: 'ok' };
}

// Totals row (Stats view), from its own cells: it is not the sum of the rows shown (Fantasy Team / Full Fantasy Team
// totals count the whole team's season, dropped players included; live 2026-10-17), and it has no single position.
// The Totals row shows Peri only when the peripheral weights are the same for every position; its FPts is NOT rebuilt.
// The one test is a sanity bound: FPts must lie between the lowest and the highest total the position weights allow.
function totalsPeri(stats, fpts, rules) {
  const bad = (status, note) => ({ peri: null, perG: null, status, note });
  if (!Number.isFinite(fpts)) return bad('missing', 'no FPts');
  const s = Object.assign({}, stats);
  if (s.PPP === undefined && s.PPG !== undefined && s.PPA !== undefined) s.PPP = s.PPG + s.PPA;
  if (s.SHP === undefined && s.SHG !== undefined && s.SHA !== undefined) s.SHP = s.SHG + s.SHA;
  const cats = Object.keys(rules.skater);
  const absent = cats.filter((a) => s[a] === undefined);
  if (absent.length) return bad('missing', 'no column for ' + absent.join(', '));
  const weights = (a) => [...new Set([rules.skater[a].default, ...Object.values(rules.skater[a].byPos || {})])];
  const periSet = periCats(rules);
  if (periSet.some((a) => weights(a).length > 1 || rules.skater[a].unknownPos)) return bad('missing', 'peripheral weights differ by position');
  let peri = 0, lo = 0, hi = 0;
  for (const a of cats) {
    const v = weights(a).map((w) => s[a] * w);
    lo += Math.min(...v); hi += Math.max(...v);
    if (periSet.includes(a)) peri += v[0];
  }
  // sanity bound only (not a rebuild of FPts)
  if (fpts < lo - FPTS_TOLERANCE || fpts > hi + FPTS_TOLERANCE) return bad('mismatch', MISMATCH_NOTE);
  const gp = s.GP;
  return { peri, perG: typeof gp === 'number' && gp > 0 ? peri / gp : null, gp, status: 'ok' };
}

// One skater table of a STATS or FPTS response -> Map: scorerId -> result, and "T" -> the Totals row's result.
function rosterTablePeri(t, rules, view) {
  const hc = t.header.cells, H = hc.length;
  const fi = hc.findIndex((c) => c && c.key === 'fpts');
  const gi = hc.findIndex((c) => c && c.key === 'fptsPerGame');
  const out = new Map();
  for (const row of t.rows) {
    const cells = (row && row.cells) || [];
    const off = rowOffset(hc, row);
    if (off === null) continue;
    const at = (i) => (i >= 0 && i - off >= 0 ? cells[i - off] : undefined);
    const fpts = fptsNum(cellText(at(fi)));
    if (isTotalsRow(row)) {
      const sub = hc.slice(off, off + cells.length), c = cells.slice(0, sub.length);
      out.set('T', Object.assign(view === 'FPTS' ? fptsViewPeri(sub, c, [], fpts, cellText(at(gi)), rules)
        : totalsPeri(statsFromCells(sub, c), fpts, rules), { fpts }));
      continue;
    }
    if (!isPlayerRow(row)) continue;
    const positions = rowPositions(row);
    out.set(row.scorer.scorerId, Object.assign(view === 'FPTS'
      ? fptsViewPeri(hc, cells, positions, fpts, gi >= 0 ? cellText(cells[gi]) : '', rules)
      : rowPeri(statsFromCells(hc, cells), positions, fpts, rules), { fpts }));
  }
  return out;
}

const tableKey = (t, k) => String(t.scGroup || '#' + k);

// tableKey -> rosterTablePeri map, for every skater table of a response.
function rosterPeri(data, rules) {
  const view = String((data.displayedSelections || {}).displayedView || '');
  const out = new Map();
  (data.tables || []).forEach((t, k) => { if (isSkaterTable(t)) out.set(tableKey(t, k), rosterTablePeri(t, rules, view)); });
  return out;
}

// Peri and Peri/G in every skater table, placed by insertAt (FPts | FP/G | Peri | Peri/G). values: tableKey -> Map from rosterPeri (of this
// response, or of a Tracked STATS lookup when this one shows other categories); null = projected (all "–");
// 'loading' = the lookup has not answered yet (it runs in the background); 'unavailable' = it failed < 60 s ago. Player rows look up by scorerId, the Totals row by "T"; every other
// row (empty slot, spots available) gets two blank cells. Goalie tables are returned as they are.
function augmentRoster(data, rules, values) {
  if (!data || !Array.isArray(data.tables)) return data;
  let changed = false;
  const tables = data.tables.map((t, k) => {
    if (!isSkaterTable(t)) return t;
    const hc = t.header.cells, H = hc.length;
    const fi = hc.findIndex((c) => c && c.key === 'fpts');
    const gi = hc.findIndex((c) => c && c.key === 'fptsPerGame');
    if (fi < 0 && gi < 0) return t;
    const offs = t.rows.map((row) => rowOffset(hc, row));
    if (offs.some((off) => off === null || (fi >= 0 && fi - off < 0) || (gi >= 0 && gi - off < 0))) return t;
    changed = true;
    const loading = values === 'loading' || values === 'unavailable';
    const waitTip = values === 'unavailable' ? UNAVAILABLE_TIP : LOADING_TIP;
    const vals = loading || !values ? null : values.get(tableKey(t, k)) || new Map();
    const hdr = (src, shortName, key, name) => {
      const h = Object.assign({}, src, { shortName, key, name });
      for (const f of ['highlightColumn', 'sortKey', 'sortType', 'scipId', 'sortDirection']) delete h[f];
      return h;
    };
    const [pAt, gAt] = insertAt(fi, gi);
    const spliceAt = (cells, off, a, b) => {
      const out = [];
      cells.forEach((c, i) => {
        out.push(c);
        if (pAt >= 0 && i === pAt - off) out.push(a);
        if (gAt >= 0 && i === gAt - off) out.push(b);
      });
      return out;
    };
    const header = Object.assign({}, t.header, { cells: spliceAt(hc, 0,
      fi >= 0 ? hdr(hc[fi], 'Peri', 'fh_peri', periName((hc[fi] || {}).name)) : null,
      gi >= 0 ? hdr(hc[gi], 'Peri/G', 'fh_peri_g', periGName((hc[gi] || {}).name)) : null) });
    const rows = t.rows.map((row, k) => {
      const cells = (row && row.cells) || [];
      const off = offs[k];
      const src = (i) => cells[i - off] || {};
      let a = '', b = '', why = null;
      const player = isPlayerRow(row);
      if (player || isTotalsRow(row)) {
        let r = vals ? vals.get(player ? row.scorer.scorerId : 'T') : null;
        // values (from a lookup above all) must be for the same numbers this row shows; an FPts column with no number
        // in this row = nothing to check them against = "–". A table with no FPts column (FP/G only) keeps its values.
        const shown = fi >= 0 ? fptsNum(cellText(src(fi))) : NaN;
        if (fi >= 0 && r && r.status === 'ok' && !Number.isFinite(shown)) r = null;
        else if (fi < 0 && gi >= 0 && r && r.status === 'ok') {
          const c = fpgCheck(r, cellText(src(gi)));
          if (c === 'none') r = null;
          else if (c === 'mismatch') r = { status: 'mismatch', note: 'the Stats lookup shows a different FP/G for this row' };
        }
        else if (r && r.status !== 'goalie' && Number.isFinite(shown) && Number.isFinite(r.fpts) && Math.abs(shown - r.fpts) > FPTS_TOLERANCE) {
          r = { status: 'stale' }; // a cached lookup from before the row's latest games: timing, not the rules
        }
        if (loading && !(player && isGoalieRow(row))) { a = b = DASH; why = waitTip; }
        else if (!r || r.status === 'goalie') a = b = DASH;
        else if (r.status === 'stale') { a = b = DASH; why = UPDATING_TIP; }
        else if (r.status === 'ok') { a = fmt2(r.peri); b = r.perG === null ? DASH : fmt2(r.perG); }
        else {
          a = b = r.status === 'mismatch' ? '?' : DASH;
          why = 'Peri unavailable: ' + (r.note || MISMATCH_NOTE);
        }
      }
      return Object.assign({}, row, { cells: spliceAt(cells, off, fi >= 0 ? plainCell(src(fi), a, why) : null,
        gi >= 0 ? plainCell(src(gi), b, why) : null) });
    });
    return Object.assign({}, t, { header, rows });
  });
  return changed ? Object.assign({}, data, { tables }) : data;
}

// Tracked totals (5) in the Stats or Fantasy Points view: values from the response itself. Trends / Schedule views, and
// any other scoring-category view (Per-Game 7, Standard 1...): one Tracked STATS lookup of the same request (~30 rows,
// our own call, cached 3 minutes per request). Never waited for: a fresh cached answer gives the values, otherwise
// the response goes out with "–" (loading tip) and the lookup runs in the background for the next view.
async function handleRoster(data, plan, env) {
  try {
    if (!data || !Array.isArray(data.tables)) return data;
    const sel = data.displayedSelections || {};
    const view = String(sel.displayedView || '');
    if (!ROSTER_ALL_VIEWS.includes(view)) return data;
    const { rules, leagueId, apiImpl, state } = env;
    if (isProjected(data)) return augmentRoster(data, rules, null);
    if (ROSTER_VIEWS.includes(view) && String(sel.displayedScoringCategoryType || plan.reqData.scoringCategoryType || '5') === '5') {
      return augmentRoster(data, rules, rosterPeri(data, rules));
    }
    const req = Object.assign({}, plan.reqData, { view: 'STATS', scoringCategoryType: '5' });
    const e = peekLookup(leagueId, 'getTeamRosterInfo', req, state);
    const rv = scoredNow(e, rules, (d) => rosterPeri(d, rules));
    if (rv) return augmentRoster(data, rules, rv);
    if (e) return augmentRoster(data, rules, 'loading'); // found unscored: scored in a later task, shown next view
    if (lookupFailed(leagueId, 'getTeamRosterInfo', req, state)) return augmentRoster(data, rules, 'unavailable');
    cachedLookup(leagueId, 'getTeamRosterInfo', req, apiImpl, state, { rules, fn: (d) => rosterPeri(d, rules) })
      .catch((err) => warn('roster lookup', err));
    return augmentRoster(data, rules, 'loading');
  } catch (e) { warn('roster', e); return data; }
}

// Plan for getTeamRosterInfo: a request naming a view we do not handle (Min/Max) is not ours (no rules wait).
function planRoster(d) {
  const r = d || {};
  if (r.view !== undefined && !ROSTER_ALL_VIEWS.includes(String(r.view))) return null;
  return { sent: null, reqData: r };
}

// ---- Live Scoring: getLiveScoringStats ----
//
// Full responses (any view change) carry the category list scoringCategoriesPerGroup["2010"|"2020"] that every Live
// Scoring view draws (matchup cards' chips, Classic / Detailed tables, the team strip, All Teams), miscData.scipIdsCounted
// (a category missing from it is drawn dimmed) and standingsTable.standingsHeader (All Teams). The ~20 s polls carry
// none of those, only statsPerTeam. Values: statsPerTeam.statsMap[team][slot].statsMap[scorerId | "_2010" | "_2020"]
// = {object1: FPts, object2: [{scipId, sv, av, fpts}]}; allTeamsStats is an identical copy. Each entry's fpts is that
// category's fantasy points, so a row passes the exact check when they sum to object1, and its Peri is the sum over the
// league's peripheral categories: no weights needed. Peri is the FIRST entry of the skater list (so every view draws it
// as the first category, as close to FPts as the page allows) and the All Teams Peri cell goes right before the first
// skater category cell (after Proj); each passing skater row gets its entry PREPENDED to object2: tables, strip and All
// Teams find values by scipId, but the cards draw their chips in object2 order (live 2026-10-17). FPts, totals, projections and every existing entry stay as they are. Projected (sppId other than
// "-1": projections have no faceoff losses) gets nothing. The All Teams header cell has no key and no sort fields, so it
// is not a link and cannot sort (a Peri sort would leave a sort param in the URL that empties the table once the script
// is off).
const LIVE_PERI_ID = '2010#FHPERI#-1';
const LIVE_TOLERANCE = 0.005; // the entries are Fantrax's own two-decimal numbers: they add up exactly
// A team total with no Peri entry is drawn as "0" (strip, Detailed Totals, All Teams); this entry is drawn as "-" in
// all three, in Stats and Fpts mode, with no chip on the cards and no winner/loser colour (live 2026-10-17). Used only
// on polls: a full response with a failing total gets no Peri at all (liveTotalsPass).
const LIVE_PLACEHOLDER = { sv: '-', av: '-', fpts: '-' };

// Actual stats need positive evidence: the request says sppId "-1" (every page request seen carries it, polls too), and
// a provider in the response, when there is one, says "-1" as well. Anything else counts as projected (untouched).
function liveIsProjected(data, reqData) {
  const sp = reqData && reqData.sppId;
  const prov = data && data.displayedSelections && data.displayedSelections.realOrStatProjProvider;
  if (sp === undefined || sp === null || String(sp) !== '-1') return true;
  return !!prov && String(prov.id) !== '-1';
}

// The skater category list -> {cats: scipId -> shortName, peri: Set of peripheral scipIds}; null when a listed category
// is not in the league's rules (nothing to classify it by: fail closed) or the list is missing.
function liveCats(list, rules) {
  if (!Array.isArray(list) || !list.length) return null;
  const periSet = new Set(periCats(rules));
  const cats = new Map(), peri = new Set();
  for (const c of list) {
    if (!c || !c.id || c.id === LIVE_PERI_ID) continue;
    if (!rules.skater[c.shortName]) return null;
    cats.set(c.id, c.shortName);
    if (periSet.has(c.shortName)) peri.add(c.id);
  }
  return cats.size ? { cats, peri } : null;
}

// One {object1, object2} row -> its Peri, or null: not a skater row, an entry we do not know, or the exact check fails.
function liveRowPeri(row, lc) {
  const o2 = row && row.object2;
  if (!Array.isArray(o2) || !o2.length || !Number.isFinite(row.object1)) return null;
  let sum = 0, peri = 0;
  for (const e of o2) {
    if (!e || !lc.cats.has(e.scipId) || typeof e.fpts !== 'number' || !Number.isFinite(e.fpts)) return null;
    sum += e.fpts;
    if (lc.peri.has(e.scipId)) peri += e.fpts;
  }
  return Math.abs(sum - row.object1) <= LIVE_TOLERANCE ? peri : null;
}

// A team's skater total: as liveRowPeri, and a total with no entries and FPts 0 (nobody has played) is Peri 0.
function liveTotalPeri(row, lc) {
  if (row && Array.isArray(row.object2) && !row.object2.length && row.object1 === 0) return 0;
  return liveRowPeri(row, lc);
}

// The per-slot row maps: statsMap, and statsMap2 (the Day half of the Period + Day timeframe, viewType 3: same shape,
// the cards' chips are drawn from it; live 2026-10-17).
const LIVE_ROW_MAPS = ['statsMap', 'statsMap2'];

// statsMap[team][slot].statsMap|statsMap2[id] rows: a copy with the Peri entry on every passing row (rows that already
// have one are left alone, so a response seen twice is not doubled). Same object back when nothing passed.
function liveStatsMap(sm, lc) {
  if (!sm || typeof sm !== 'object') return sm;
  let changed = false;
  const out = {};
  for (const team of Object.keys(sm)) {
    const slots = sm[team];
    if (!slots || typeof slots !== 'object') { out[team] = slots; continue; }
    const ns = {};
    let tchg = false;
    for (const slot of Object.keys(slots)) {
      let s = slots[slot];
      let schg = false;
      for (const key of LIVE_ROW_MAPS) {
        const rows = s && s[key];
        if (!rows || typeof rows !== 'object') continue;
        const nr = {};
        let mchg = false;
        for (const id of Object.keys(rows)) {
          const row = rows[id];
          const has = row && Array.isArray(row.object2) && row.object2.some((e) => e && e.scipId === LIVE_PERI_ID);
          const p = has ? null : id === '_2010' ? liveTotalPeri(row, lc) : liveRowPeri(row, lc);
          if (p === null) {
            if (!has && id === '_2010' && row && Array.isArray(row.object2)) {
              nr[id] = Object.assign({}, row, { object2: [Object.assign({ scipId: LIVE_PERI_ID }, LIVE_PLACEHOLDER)].concat(row.object2) });
              mchg = true;
            } else nr[id] = row;
            continue;
          }
          const v = Number(fmt2(p));
          nr[id] = Object.assign({}, row, { object2: [{ scipId: LIVE_PERI_ID, sv: fmt2(p), av: v, fpts: v }].concat(row.object2) });
          mchg = true;
        }
        if (mchg) { s = Object.assign({}, s, { [key]: nr }); schg = true; }
      }
      ns[slot] = s;
      tchg = tchg || schg;
    }
    out[team] = tchg ? ns : slots;
    changed = changed || tchg;
  }
  return changed ? out : sm;
}

// Every team total (_2010) of both maps (statsMap and statsMap2 of each slot) passes the exact check. Fantrax draws a total with no Peri entry as "0" (team
// strip, Detailed Totals, All Teams; live 2026-10-17), so a full response with one failing total gets no Peri at all.
function liveTotalsPass(spt, lc) {
  for (const map of [spt.statsMap, spt.allTeamsStats]) {
    if (!map || typeof map !== 'object') continue;
    for (const slots of Object.values(map)) {
      if (!slots || typeof slots !== 'object') continue;
      for (const s of Object.values(slots)) {
        for (const key of LIVE_ROW_MAPS) {
          const t = s && s[key] && s[key]._2010;
          if (!t) continue;
          const has = Array.isArray(t.object2) && t.object2.some((e) => e && e.scipId === LIVE_PERI_ID);
          if (!has && liveTotalPeri(t, lc) === null) return false;
        }
      }
    }
  }
  return true;
}

function augmentLive(data, rules, lc) {
  const out = Object.assign({}, data);
  let changed = false;
  const scpg = data.scoringCategoriesPerGroup;
  const list = scpg && scpg['2010'];
  if (Array.isArray(list) && list.length && !list.some((c) => c && c.id === LIVE_PERI_ID)) {
    const last = list[list.length - 1];
    const cat = Object.assign({}, last, { id: LIVE_PERI_ID, name: PERI_NAME, shortName: 'Peri', tinyName: 'Peri',
      ungroupedShortName: 'Peri', sortDirection: 1 });
    out.scoringCategoriesPerGroup = Object.assign({}, scpg, { 2010: [cat].concat(list) });
    changed = true;
  }
  const misc = data.miscData;
  if (misc && Array.isArray(misc.scipIdsCounted) && !misc.scipIdsCounted.includes(LIVE_PERI_ID)) {
    out.miscData = Object.assign({}, misc, { scipIdsCounted: misc.scipIdsCounted.concat([LIVE_PERI_ID]) });
    changed = true;
  }
  const st = data.standingsTable;
  const hc = st && st.standingsHeader && st.standingsHeader.cells;
  if (Array.isArray(hc) && !hc.some((c) => c && (c.scipId === LIVE_PERI_ID || c.key === LIVE_PERI_ID))) {
    const at = hc.findIndex((c) => c && /^2010#/.test(String(c.key || '')));
    if (at >= 0) {
      // Fantrax (live 2026-10-17): a row's value is found by the cell's scipId; every header cell that has a key is
      // drawn as a link whose click sorts by that key and writes sort=<key> to the URL. So: scipId, and NO key.
      const h = Object.assign({}, hc[at], { scipId: LIVE_PERI_ID, shortName: 'Peri', name: PERI_NAME });
      for (const f of ['key', 'sortKey', 'sortType', 'sortDirection', 'highlightColumn']) delete h[f];
      const cells = hc.slice();
      cells.splice(at, 0, h);
      out.standingsTable = Object.assign({}, st, { standingsHeader: Object.assign({}, st.standingsHeader, { cells }) });
      changed = true;
    }
  }
  const spt = data.statsPerTeam;
  if (spt && spt.delta !== true) {
    const a = liveStatsMap(spt.statsMap, lc), b = liveStatsMap(spt.allTeamsStats, lc);
    if (a !== spt.statsMap || b !== spt.allTeamsStats) {
      out.statsPerTeam = Object.assign({}, spt, { statsMap: a, allTeamsStats: b });
      changed = true;
    }
  }
  return changed ? out : data;
}

// The category map comes from the last full response of the league (polls carry no list); until one is seen, nothing.
function handleLive(data, plan, env) {
  try {
    if (!data || typeof data !== 'object' || !data.statsPerTeam) return data;
    if (liveIsProjected(data, plan.reqData)) return data;
    if (data.miscData && data.miscData.pointsBased === false) return data;
    const st = env.state || defaultState;
    const scpg = data.scoringCategoriesPerGroup;
    let lc;
    if (scpg && Array.isArray(scpg['2010'])) {
      lc = liveCats(scpg['2010'], env.rules);
      if (lc && !(data.statsPerTeam.delta !== true && liveTotalsPass(data.statsPerTeam, lc))) lc = null;
      if (lc) st.live.set(env.leagueId, lc); else st.live.delete(env.leagueId);
    } else lc = st.live.get(env.leagueId);
    if (!lc) return data;
    return augmentLive(data, env.rules, lc);
  } catch (e) { warn('live scoring', e); return data; }
}

// ---- Live Scoring display: our Peri hidden in Stats mode (the script's only DOM code) ----
//
// The Stats / Fpts switch makes no request (it moves pill--active between two button.pill and adds mode=fpts to the
// URL), so the data cannot differ by mode. In Stats mode every category is a raw NHL count: our Peri elements are marked
// data-fpx-peri and hidden by one style rule while <html data-fpx-live="stats">. Only elements labelled Peri, and table
// cells at the Peri header's column, are ever marked (live 2026-10-17). The data rewrite is unchanged.
const LIVE_STYLE_ID = 'fpx-live-style';
const LIVE_STYLE = 'html[data-fpx-live="stats"] [data-fpx-peri]{display:none !important}';
const LIVE_ROUTE_RE = /^\/fantasy\/league\/[^/;?#]+\/livescoring(?:[/;]|$)/;

const domText = (el) => String((el && el.textContent) || '').trim();
const domKids = (el) => Array.from((el && el.children) || []);

// 'stats' | 'fpts' | null (not Live Scoring). The active pill when both are found, else the URL's mode param.
function liveMode(doc, href) {
  if (!doc || !doc.querySelector('app-league-livescoring')) return null;
  const pills = Array.from(doc.querySelectorAll('button.pill'));
  for (const f of pills) {
    if (domText(f) !== 'Fpts') continue;
    if (pills.some((s) => s !== f && domText(s) === 'Stats' && s.parentElement === f.parentElement)) {
      return f.classList.contains('pill--active') ? 'fpts' : 'stats';
    }
  }
  let u;
  try { u = new URL(String(href || '')); } catch (e) { return null; }
  if (!LIVE_ROUTE_RE.test(u.pathname)) return null;
  return u.searchParams.get('mode') === 'fpts' ? 'fpts' : 'stats';
}

// Marks our Peri inside app-league-livescoring (team strip rows, card chips, Classic / Detailed and All Teams columns)
// with data-fpx-peri and unmarks anything that no longer qualifies (Angular reuses nodes). Returns the number marked.
function markLivePeri(root) {
  const marks = new Set();
  for (const app of root.querySelectorAll('app-league-livescoring')) {
    for (const r of app.querySelectorAll('.league-livescoring-summary__row')) {
      const k = domKids(r);
      if (k.length === 3 && domText(k[1]) === 'Peri') marks.add(r);
    }
    for (const c of app.querySelectorAll('.scoring-table__cell__content')) {
      for (const li of c.querySelectorAll('li')) {
        const b = domKids(li).find((x) => x.tagName === 'B');
        if (b && domText(b) === 'Peri') marks.add(li);
      }
    }
    // Classic / Detailed: body rows lack the name cell (the first), so the index is counted from the end (right for Peri in
    // any column after the name: first category, live since 2026-10-17, or last). Only
    // rows as wide as the head or one cell narrower (live: 17 / 16); a full-width message row is never touched.
    for (const t of app.querySelectorAll('ultimate-table')) {
      const rows = Array.from(t.querySelectorAll('tr'));
      const head = rows.find((r) => r.classList.contains('_ut__head') && domKids(r).some((c) => domText(c) === 'Peri'));
      if (!head) continue;
      const hk = domKids(head), h = hk.findIndex((c) => domText(c) === 'Peri'), H = hk.length;
      marks.add(hk[h]);
      for (const r of rows) {
        if (r === head) continue;
        const k = domKids(r), i = h - (H - k.length);
        if ((k.length === H || k.length === H - 1) && i >= 0 && i < k.length) marks.add(k[i]);
      }
    }
    // All Teams: the same index in every row as wide as the header.
    for (const s of app.querySelectorAll('league-livescoring-stat-table')) {
      for (const t of s.querySelectorAll('.i-table')) {
        const rows = Array.from(t.querySelectorAll('.i-table__row'));
        const head = rows.find((r) => r.classList.contains('i-table__header') && domKids(r).some((c) => domText(c) === 'Peri'));
        if (!head) continue;
        const hk = domKids(head), h = hk.findIndex((c) => domText(c) === 'Peri');
        for (const r of rows) {
          const k = domKids(r);
          if (k.length === hk.length) marks.add(k[h]);
        }
      }
    }
  }
  for (const el of Array.from(root.querySelectorAll('[data-fpx-peri]'))) if (!marks.has(el)) el.removeAttribute('data-fpx-peri');
  for (const el of marks) if (el && el.getAttribute('data-fpx-peri') === null) el.setAttribute('data-fpx-peri', '');
  return marks.size;
}

// One MutationObserver on <html> (class changes cover the pill switch; our data-fpx-* attributes are not observed, so
// no loop). The callback runs before paint, so a Fantrax redraw is marked before it shows. Off Live Scoring it watches
// child lists only and does nothing but test the URL path (no DOM query), so other pages pay ~nothing; on Live Scoring it
// also watches text and class changes. Errors: one warning, then quiet.
const LIVE_FULL = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class'] };
const LIVE_LIGHT = { childList: true, subtree: true };
function startLiveDisplay(win) {
  const doc = win && win.document;
  if (!doc || !doc.documentElement || typeof win.MutationObserver !== 'function') return;
  const html = doc.documentElement;
  let mode, warned = false, full = null, obs = null;
  const onRoute = () => { try { return LIVE_ROUTE_RE.test(win.location.pathname); } catch (e) { return false; } };
  const watch = (f) => { if (f !== full) { full = f; obs.disconnect(); obs.observe(html, f ? LIVE_FULL : LIVE_LIGHT); } };
  const run = (content) => {
    try {
      const route = onRoute();
      if (!route && mode === null) { watch(false); return; }
      const m = route ? liveMode(doc, win.location && win.location.href) : null;
      const changed = m !== mode;
      mode = m;
      if (changed) { if (m) html.setAttribute('data-fpx-live', m); else html.removeAttribute('data-fpx-live'); }
      watch(m !== null);
      if (m === null) return;
      if (!doc.getElementById(LIVE_STYLE_ID)) {
        const st = doc.createElement('style');
        st.id = LIVE_STYLE_ID;
        st.textContent = LIVE_STYLE;
        (doc.head || html).appendChild(st);
      }
      if (content || changed) markLivePeri(doc);
    } catch (e) {
      if (!warned) { warned = true; warn('live display', e); }
    }
  };
  obs = new win.MutationObserver((muts) => run(muts.some((x) => x.type === 'childList' || x.type === 'characterData')));
  mode = undefined;
  run(true);
}

// ---- network: our own API calls, rules, the full pool ----

const API_TIMEOUT_MS = 20000, RETRY_DELAY_MS = 1500;
const RULES_FAIL_TTL_MS = 5 * 60 * 1000, POOL_TTL_MS = 3 * 60 * 1000, POOL_MAX_ENTRIES = 4;
const POOL_PAGE_SIZE = '500', POOL_MAX_PAGES = 60, POOL_CONCURRENCY = 4;
const SORT_WAIT_MS = 30000, FAIL_TTL_MS = 60 * 1000; // the ONE wait: a Peri / Peri/G sort (rules + pools); nothing else ever holds a response
const SORT_FIELDS = ['pageNumber', 'sortType', 'scipId', 'sortReversed', 'maxResultsPerPage'];

function warn(...a) { try { console.warn('[fpx]', ...a); } catch (e) { /* no console */ } }

function newState(opts) {
  return { now: (opts && opts.now) || (() => Date.now()), rules: new Map(), pools: new Map(), lookups: new Map(), live: new Map() };
}
const defaultState = newState();

// Same shape as the game tracker's apiOnce: POST /fxpa/req?leagueId=, text/plain, credentials, 20 s timeout.
// fetchImpl must be the ORIGINAL fetch, so our own calls never go through the hook.
async function apiOnce(leagueId, msgs, fetchImpl) {
  const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const killer = ctl ? setTimeout(() => ctl.abort(), API_TIMEOUT_MS) : null;
  try {
    const r = await fetchImpl('/fxpa/req?leagueId=' + encodeURIComponent(leagueId), {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ msgs }), signal: ctl ? ctl.signal : undefined,
    });
    if (!r.ok) throw new Error('HTTP ' + r.status + ' from ' + msgs.map((m) => m.method).join(','));
    const j = await r.json();
    const out = msgs.map((m, i) => (j && j.responses && j.responses[i] && j.responses[i].data) || null);
    if (out.some((d) => !d)) throw new Error('empty response for ' + msgs[out.findIndex((d) => !d)].method);
    return out;
  } finally { if (killer) clearTimeout(killer); }
}
async function api(leagueId, msgs, fetchImpl, retryDelay) {
  try { return await apiOnce(leagueId, msgs, fetchImpl); } catch (e) {
    await new Promise((r) => setTimeout(r, retryDelay === undefined ? RETRY_DELAY_MS : retryDelay));
    return apiOnce(leagueId, msgs, fetchImpl);
  }
}

// apiImpl(leagueId, msgs) -> data[]. Cached per league for the document's life; a failed read is null for 5 min.
function getRules(leagueId, apiImpl, state) {
  const st = state || defaultState;
  const c = st.rules.get(leagueId);
  if (c && (!c.failed || st.now() - c.at < RULES_FAIL_TTL_MS)) return c.promise;
  const entry = { at: st.now(), failed: false };
  entry.promise = (async () => {
    try {
      const [d] = await apiImpl(leagueId, [{ method: 'getLeagueRulesOld', data: { leagueId } }]);
      const r = parseRules(d && d.content);
      if (!r && !(d && d.content)) entry.failed = true; // empty content: retry later; a read page with no points scoring is final
      entry.value = r; entry.done = true;
      return r;
    } catch (e) {
      entry.failed = true;
      warn('rules read failed', e);
      entry.value = null; entry.done = true;
      return null;
    }
  })();
  st.rules.set(leagueId, entry);
  return entry.promise;
}

// The league's rules if the read has finished (null = no points rules), else undefined: never waits.
function peekRules(leagueId, state) {
  const c = (state || defaultState).rules.get(leagueId);
  return c && c.done ? c.value : undefined;
}

// A finished, fresh cache entry (pool or lookup) or null: never waits, never starts a read.
function peekEntry(map, key, ttl, st) {
  const e = map.get(key);
  return e && e.done && st.now() - e.at < ttl ? e : null;
}
// True while a read of this key failed less than FAIL_TTL_MS ago (no new request is made until then).
function failedEntry(map, key, st) {
  const e = map.get(key);
  return !!e && e.failed && st.now() - e.at < FAIL_TTL_MS;
}
// fn(entry.value) once per entry and rules (a cached pool is not re-scored on every view). Reads started with a prep
// ({rules, fn}) score their answer when it arrives, off the response path, so a view that finds it pays nothing.
function prepare(entry, prep) {
  if (prep && entry.done) { try { derived(entry, prep.rules, prep.fn); } catch (e) { warn('prepare', e); } }
}
const isPrepared = (entry, prep) => !prep || (!!entry.derived && entry.derived.rules === prep.rules);
// A view's use of a peeked entry: its score if it was scored when it arrived; otherwise null (the view shows loading)
// and the scoring runs in a later task, so the response path never scores a pool.
function scoredNow(entry, rules, fn) {
  if (!entry) return null;
  const prep = { rules, fn };
  if (isPrepared(entry, prep)) return entry.derived.v;
  setTimeout(() => prepare(entry, prep), 0);
  return null;
}

// The one cache behind pullPool and cachedLookup. A read in flight is shared; a finished one is fresh for ttl from when
// it FINISHED; a failed one is kept FAIL_TTL_MS as a pre-caught rejection, so nothing is re-requested meanwhile. A fresh
// entry found without its score (read by a caller that had no prep) is scored in a later task, never on this path.
// At most max entries (oldest out); stale ones are dropped on insert. start() -> Promise of the value.
function cacheRead(map, key, ttl, max, st, start, prep) {
  const c = map.get(key);
  if (c) {
    const age = st.now() - c.at;
    if (!c.done && !c.failed) return c.promise;
    if (c.failed && age < FAIL_TTL_MS) return c.promise;
    if (c.done && age < ttl) {
      if (!isPrepared(c, prep)) setTimeout(() => prepare(c, prep), 0);
      return c.promise;
    }
  }
  const entry = { at: st.now(), done: false, failed: false };
  entry.promise = start().then((v) => {
    entry.value = v; entry.done = true; entry.at = st.now();
    prepare(entry, prep);
    return v;
  }, (e) => { entry.failed = true; entry.at = st.now(); throw e; });
  entry.promise.catch(() => {});
  const now = st.now();
  for (const [k, e] of [...map]) {
    if ((e.done && now - e.at >= ttl) || (e.failed && now - e.at >= FAIL_TTL_MS)) map.delete(k);
  }
  map.delete(key);
  while (map.size >= max) map.delete(map.keys().next().value);
  map.set(key, entry);
  return entry.promise;
}
function derived(entry, rules, fn) {
  if (!entry.derived || entry.derived.rules !== rules) entry.derived = { rules, v: fn(entry.value) };
  return entry.derived.v;
}

// The selections of a getPlayerStats request: everything but the page/sort fields.
function selectionOf(reqData) {
  const out = {};
  for (const k of Object.keys(reqData || {}).sort()) if (!SORT_FIELDS.includes(k)) out[k] = reqData[k];
  return out;
}

const poolKey = (leagueId, reqData) => leagueId + '|' + JSON.stringify(selectionOf(reqData));
function peekPool(leagueId, reqData, state) {
  const st = state || defaultState;
  return peekEntry(st.pools, poolKey(leagueId, reqData), POOL_TTL_MS, st);
}

// Every row of the request's selections, Fantrax's SCORE order: page 1 (for totalNumPages), then the rest of the
// 500-row pages with at most POOL_CONCURRENCY in flight; rows kept in page order.
// Returns the first page's data with statsTable = all rows (so periByScorer / pageOf can use its header).
// Cached 3 min per league + selections (from when it finished); a failed pull blocks a retry for 60 s (cacheRead).
function pullPool(leagueId, reqData, apiImpl, state, prep) {
  const st = state || defaultState;
  const sel = selectionOf(reqData);
  return cacheRead(st.pools, poolKey(leagueId, reqData), POOL_TTL_MS, POOL_MAX_ENTRIES, st, async () => {
    const fetchPage = async (page) => {
      const data = Object.assign({}, sel, { maxResultsPerPage: POOL_PAGE_SIZE, pageNumber: String(page), sortType: 'SCORE' });
      const [d] = await apiImpl(leagueId, [{ method: 'getPlayerStats', data }]);
      if (!d || !Array.isArray(d.statsTable)) throw new Error('pool page ' + page + ' has no rows');
      return d;
    };
    const first = await fetchPage(1);
    const total = Number(first.paginatedResultSet && first.paginatedResultSet.totalNumPages) || 1;
    const last = Math.min(total, POOL_MAX_PAGES);
    if (total > POOL_MAX_PAGES) warn('pool stopped at ' + POOL_MAX_PAGES + ' of ' + total + ' pages');
    const pages = [first];
    let next = 2;
    const worker = async () => {
      while (next <= last) { const n = next++; pages[n - 1] = await fetchPage(n); }
    };
    await Promise.all(Array.from({ length: Math.min(POOL_CONCURRENCY, Math.max(0, last - 1)) }, worker));
    const rows = [];
    for (const d of pages) rows.push(...d.statsTable);
    return Object.assign({}, first, { statsTable: rows });
  }, prep);
}

// One read-only request through a small cache: leagueId + method + data, 3 minutes, at most 8 entries (cacheRead).
// A read in flight is shared (one request per key); views read the finished answer with peekLookup.
const LOOKUP_TTL_MS = 3 * 60 * 1000, LOOKUP_MAX_ENTRIES = 8;
const lookupKey = (leagueId, method, data) => leagueId + '|' + method + '|' + JSON.stringify(data);
function peekLookup(leagueId, method, data, state) {
  const st = state || defaultState;
  return peekEntry(st.lookups, lookupKey(leagueId, method, data), LOOKUP_TTL_MS, st);
}
function lookupFailed(leagueId, method, data, state) {
  const st = state || defaultState;
  return failedEntry(st.lookups, lookupKey(leagueId, method, data), st);
}
function poolFailed(leagueId, reqData, state) {
  const st = state || defaultState;
  return failedEntry(st.pools, poolKey(leagueId, reqData), st);
}
function cachedLookup(leagueId, method, data, apiImpl, state, prep) {
  const st = state || defaultState;
  return cacheRead(st.lookups, lookupKey(leagueId, method, data), LOOKUP_TTL_MS, LOOKUP_MAX_ENTRIES, st,
    () => apiImpl(leagueId, [{ method, data }]).then(([d]) => d), prep);
}

// ---- the getPlayerStats handler ----

function isOurSort(d) {
  return !!d && d.sortType === 'SCORING_CATEGORY' && String(d.scipId || '').startsWith('FH_');
}

// Outgoing data rewrite: our sort -> SCORE without scipId/sortReversed; a stale FH_ scipId on any other sort is dropped.
function planStats(reqData) {
  const d = reqData || {};
  if (isOurSort(d)) {
    const sent = Object.assign({}, d, { sortType: 'SCORE' });
    delete sent.scipId; delete sent.sortReversed;
    return { sent, sort: { scipId: d.scipId, reversed: d.sortReversed === true || d.sortReversed === 'true',
      pageNumber: Number(d.pageNumber) || 1 }, reqData: d };
  }
  if (String(d.scipId || '').startsWith('FH_')) {
    const sent = Object.assign({}, d);
    delete sent.scipId;
    return { sent, sort: null, reqData: d };
  }
  return { sent: null, sort: null, reqData: d };
}

function scoringType(data, reqData) {
  return String(data.displayedScoringCategoryType
    || (data.displayedSelections && data.displayedSelections.displayedScoringCategoryType)
    || reqData.scoringCategoryType || '5');
}

// True when the displayed rows cannot give Peri: not Tracked totals (Per-Game cells are per-game; Standard/Extra
// differ), or a league category column is missing (All Players view has none). PPP/SHP may be derived (HT only on per-game rows, never here).
function needsValuesPull(data, rules, reqData) {
  if (scoringType(data, reqData) !== '5') return true;
  const have = new Set(data.tableHeader.cells
    .filter((h) => h && /^\d+#/.test(String(h.scipId || h.key || ''))).map((h) => h.shortName));
  const derivable = { PPP: ['PPG', 'PPA'], SHP: ['SHG', 'SHA'] };
  return Object.keys(rules.skater).some((a) => !have.has(a) && !(derivable[a] && derivable[a].every((x) => have.has(x))));
}

// The values pull always asks for the Stats view: the Schedule / Trends tabs send view SCHEDULE_PERIOD / OVERVIEW, and
// with that view kept the server returns no category columns at all (live 2026-10-17).
function valuesSelection(reqData, data) {
  const sel = Object.assign({}, reqData, { scoringCategoryType: '5', view: 'STATS' });
  const pos = reqData.positionOrGroup || data.displayedPosOrGroup;
  if (pos === 'ALL') sel.positionOrGroup = 'HOCKEY_SKATING';
  return sel;
}

const isGoalieRow = (r) => String((r.scorer || {}).posShortNames || '').split(',').map((x) => x.trim()).join() === 'G';

// Background reads for the next view of a page (nobody waits for them; every failure is caught here). lsel: start the
// one-request lookup, then the pool only for rows it does not cover (or when it fails); null: the pool alone. Reads in
// flight are shared by key (cachedLookup / pullPool), so repeated views never pile up requests.
function warmValues(env, lsel, psel, rows, fits) {
  const { leagueId, apiImpl, state } = env;
  const scored = { rules: env.rules, fn: (d) => periByScorer(d, env.rules) };
  const pool = () => pullPool(leagueId, psel, apiImpl, state, scored).catch((e) => warn('values pool', e));
  try {
    if (!lsel) { pool(); return; }
    cachedLookup(leagueId, 'getPlayerStats', lsel, apiImpl, state, scored).then(() => {
      const e = peekLookup(leagueId, 'getPlayerStats', lsel, state);
      const lv = e ? derived(e, env.rules, scored.fn) : new Map();
      if (rows.some((row) => { const v = lv.get((row.scorer || {}).scorerId); return !v || !fits(row, v); })) pool();
    }).catch((e) => { warn('values lookup', e); pool(); });
  } catch (e) { warn('values', e); }
}

// The one-request values lookup for a displayed page: the page's own request (same sort, page, page size, filters) in
// the Tracked Stats view. It returns the same players in the same order (live 2026-10-17, Schedule / Trends tabs).
function lookupSelection(plan, data) {
  return valuesSelection(plan.sent || plan.reqData, data);
}
async function handleStats(data, plan, env) {
  if (!data || !data.tableHeader || !Array.isArray(data.statsTable)) return data;
  if (!plan.sort && headerIndex(data, 'fptsPerGame') < 0) return data; // no FP/G column: nothing to add, no pull
  const { rules, leagueId, apiImpl, state, delay } = env;
  if (isProjected(data)) return augmentStats(data, rules);
  const req = plan.reqData;
  const wantValues = needsValuesPull(data, rules, req) && !(!plan.sort && data.statsTable.every(isGoalieRow));
  if (!plan.sort) {
    if (!wantValues) return augmentStats(data, rules);
    // Never waits: values come only from fresh cached answers (each checked against the row's shown FPts in
    // augmentStats); rows they do not cover show "–" with the loading tip, and the reads run in the background.
    const fi = headerIndex(data, 'fpts');
    const shownOf = (row) => (fi >= 0 ? fptsNum(cellText(row.cells[fi])) : NaN);
    const fits = (row, v) => fi < 0 || (!!v && Number.isFinite(shownOf(row)) && Number.isFinite(v.fpts)
      && Math.abs(shownOf(row) - v.fpts) <= FPTS_TOLERANCE);
    const idOf = (row) => (row.scorer || {}).scorerId;
    // 1) one request: this page in the Stats view. Skipped when the values view needs another position filter (All
    // Players -> Skaters): its page N is not this page N. 2) rows it does not cover: the pool of the same selections.
    const base = plan.sent || plan.reqData;
    const lsel = lookupSelection(plan, data);
    const useLookup = lsel.positionOrGroup === base.positionOrGroup;
    const psel = valuesSelection(req, data);
    const skaters = data.statsTable.filter((row) => !isGoalieRow(row));
    const vals = new Map();
    const score = (d) => periByScorer(d, rules);
    const lpeek = useLookup ? peekLookup(leagueId, 'getPlayerStats', lsel, state) : null;
    const lv = scoredNow(lpeek, rules, score);
    const le = lv ? lpeek : null;
    if (lv) {
      // a lookup value whose FPts is not the shown FPts is not used, so the pool may answer that row
      for (const row of skaters) { const v = lv.get(idOf(row)); if (v && fits(row, v)) vals.set(idOf(row), v); }
    }
    const missing = skaters.filter((row) => !vals.has(idOf(row)) && (fi < 0 || Number.isFinite(shownOf(row))));
    if (!missing.length) return augmentStats(data, rules, vals);
    const pv = scoredNow(peekPool(leagueId, psel, state), rules, score);
    if (pv) {
      for (const row of missing) if (pv.has(idOf(row))) vals.set(idOf(row), pv.get(idOf(row)));
      return augmentStats(data, rules, vals);
    }
    // every read that could answer these rows failed < 60 s ago: plain "–" (unavailable), nothing re-requested
    const lookupDown = !useLookup || !!le || lookupFailed(leagueId, 'getPlayerStats', lsel, state);
    if (lookupDown && poolFailed(leagueId, psel, state)) {
      for (const row of missing) vals.set(idOf(row), { status: 'unavailable', peri: null, perG: null });
      return augmentStats(data, rules, vals);
    }
    for (const row of missing) vals.set(idOf(row), { status: 'loading', peri: null, perG: null });
    warmValues(env, useLookup && !le && !lpeek ? lsel : null, psel, missing, fits);
    return augmentStats(data, rules, vals);
  }
  // Our sort: the order comes from the pool values; each shown row's value is still checked against its shown FPts in
  // augmentStats ("–" when they differ; that row's place in the order may then be stale). The pools get SORT_WAIT_MS in
  // all; past it Fantrax's SCORE-sorted response passes through untouched (no Peri column, so no SCORE order is ever
  // shown under a Peri header); the pulls keep warming the cache.
  // both pools are scored when they arrive (prep), so a later view or sort click that finds them does no scoring
  const scored = { rules, fn: (d) => periByScorer(d, rules) };
  const scoreOf = (sel, d) => { const e = peekPool(leagueId, sel, state); return e ? derived(e, rules, scored.fn) : periByScorer(d, rules); };
  const vsel = valuesSelection(req, data);
  const valuesP = wantValues ? pullPool(leagueId, vsel, apiImpl, state, scored).then((d) => scoreOf(vsel, d)) : null;
  const displayP = pullPool(leagueId, req, apiImpl, state, scored);
  const both = Promise.all([valuesP, displayP.then((d) => [d, wantValues ? null : scoreOf(req, d)])]);
  both.catch(() => {});
  const deadline = env.sortDeadline || delay(SORT_WAIT_MS).then(() => ({ ok: false }));
  const sr = await Promise.race([both.then((v) => ({ ok: true, v })), deadline]);
  if (!sr.ok) { warn('our sort: pools past ' + SORT_WAIT_MS + ' ms, SCORE response passed through'); return data; }
  const [values, [pool, own]] = sr.v;
  const vals = values || own;
  const sorted = sortPool(pool.statsTable, plan.sort.scipId, plan.sort.reversed, vals);
  const perPage = Number(data.paginatedResultSet && data.paginatedResultSet.maxResultsPerPage) || 20;
  const page = pageOf(data, sorted, plan.sort.pageNumber, perPage, plan.sort.scipId, plan.sort.reversed);
  return augmentStats(page, rules, vals);
}

// Per-method handlers: plan(reqData) -> {sent?, ...}; respond(data, plan, env) -> new data. 
const HANDLERS = {
  getPlayerStats: { plan: planStats, respond: handleStats },
  getPlayerProfile: { plan: (d) => ({ sent: null, reqData: d || {} }), respond: handleProfile },
  getTeamRosterInfo: { plan: planRoster, respond: handleRoster },
  getLiveScoringStats: { plan: (d) => ({ sent: null, reqData: d || {} }), respond: handleLive },
};
const HANDLED_RE = /"method"\s*:\s*"(getPlayerStats|getPlayerProfile|getTeamRosterInfo|getLiveScoringStats)"/;

// Fantrax's own page requests carry uiv / refUrl / dt / at / tz / v next to msgs; other scripts' calls (the Game
// Tracker's: {msgs} only) never do. Only Fantrax's own are rewritten.
const isPageRequest = (parsed) => Object.prototype.hasOwnProperty.call(parsed, 'uiv');

// ---- the fetch hook ----

function abortError() {
  if (typeof DOMException !== 'undefined') return new DOMException('The operation was aborted.', 'AbortError');
  const e = new Error('The operation was aborted.'); e.name = 'AbortError'; return e;
}
const realDelay = (ms) => new Promise((r) => setTimeout(r, ms));
// A deadline that can be cancelled: our own timer (cleared when the sort is done) unless a delay is injected (tests).
function deadlineOf(ms, delay) {
  if (delay) return { p: delay(ms).then(() => ({ ok: false })), cancel: () => {} };
  let t = null;
  const p = new Promise((r) => { t = setTimeout(() => r({ ok: false }), ms); });
  return { p, cancel: () => clearTimeout(t) };
}

// Only a string URL to /fxpa/req whose body names a handled method and is Fantrax's own (isPageRequest) is touched;
// anything else (Request / URL inputs, the Game Tracker's calls) goes straight to the original fetch, unawaited.
// Fantrax's request is sent at once and its response is never held: rules not read yet -> it passes through untouched.
// The one exception is our Peri sort, which waits (rules and pools together) up to SORT_WAIT_MS.
function makeHook(origFetch, opts) {
  const o = opts || {};
  const state = o.state || newState(o);
  const apiImpl = (lid, msgs) => api(lid, msgs, origFetch, o.retryDelay);
  const delay = o.delay || realDelay;
  const injectedDelay = o.delay || null;
  const base = o.baseUrl || 'https://www.fantrax.com/';
  const RespCtor = o.Response || Response;
  const pathNow = o.pathname || (() => (typeof location !== 'undefined' && location && location.pathname) || '');
  const hook = async function fpxFetch(input, init) {
    const body = init && init.body;
    if (typeof input !== 'string' || typeof body !== 'string' || !/\/fxpa\/req\b/.test(input) || !HANDLED_RE.test(body)) {
      return origFetch(input, init);
    }
    let leagueId, parsed, plans;
    try {
      leagueId = new URL(input, base).searchParams.get('leagueId');
      parsed = JSON.parse(body);
      if (!leagueId || !parsed || typeof parsed !== 'object' || !isPageRequest(parsed) || !Array.isArray(parsed.msgs)) {
        return origFetch(input, init);
      }
      // @exclude .../draft* only covers the first document URL (Fantrax is a single-page app): skip draft pages here too.
      if (String(parsed.refUrl || '').includes('/draft') || String(pathNow() || '').includes('/draft')) return origFetch(input, init);
      plans = parsed.msgs.map((m) => {
        const h = m && HANDLERS[m.method];
        const pl = h ? h.plan(m.data) : null;
        return pl ? Object.assign({ handler: h }, pl) : null;
      });
    } catch (e) {
      warn('request', e);
      return origFetch(input, init);
    }
    if (!plans.some((p) => p)) return origFetch(input, init);
    const rulesP = getRules(leagueId, apiImpl, state);
    const sortTimer = plans.some((p) => p && p.sort) ? deadlineOf(SORT_WAIT_MS, injectedDelay) : null;
    const sortDeadline = sortTimer ? sortTimer.p : null;
    let sendInit = init;
    if (plans.some((p) => p && p.sent)) {
      const msgs = parsed.msgs.map((m, i) => (plans[i] && plans[i].sent ? Object.assign({}, m, { data: plans[i].sent }) : m));
      sendInit = Object.assign({}, init, { body: JSON.stringify(Object.assign({}, parsed, { msgs })) });
    }
    let res;
    try { res = await origFetch(input, sendInit); } catch (e) { if (sortTimer) sortTimer.cancel(); throw e; }
    if (!res || !res.ok) { if (sortTimer) sortTimer.cancel(); return res; }
    let out = res;
    try {
      let rules = peekRules(leagueId, state);
      if (rules === undefined && sortDeadline) {
        const rr = await Promise.race([rulesP.then((v) => ({ ok: true, v })), sortDeadline]);
        rules = rr.ok ? rr.v : null;
      }
      if (rules) {
        const j = await res.clone().json();
        let changed = false;
        for (let i = 0; i < plans.length; i++) {
          const r = plans[i] && j && j.responses && j.responses[i];
          if (!r || !r.data) continue;
          const d = await plans[i].handler.respond(r.data, plans[i], { rules, leagueId, apiImpl, state, delay, sortDeadline });
          if (d !== r.data) { r.data = d; changed = true; }
        }
        if (changed) {
          const headers = new Headers(res.headers);
          headers.delete('content-length'); headers.delete('content-encoding');
          out = new RespCtor(JSON.stringify(j), { status: res.status, statusText: res.statusText, headers });
        }
      }
    } catch (e) {
      warn('response', e);
      out = res;
    } finally {
      if (sortTimer) sortTimer.cancel();
    }
    if (init && init.signal && init.signal.aborted) throw abortError();
    return out;
  };
  hook.prewarm = (leagueId) => getRules(leagueId, apiImpl, state);
  return hook;
}

// Patches win.fetch (the page's own; Fantrax looks it up at call time) and pre-warms the rules for the league in the
// page URL. opts: {now, retryDelay, fetch (original), delay(ms) -> Promise}.
function install(win, opts) {
  const o = opts || {};
  if (!win || typeof win.fetch !== 'function' || win.fetch.__fpx) return;
  const orig = o.fetch || win.fetch.bind(win);
  const href = win.location && win.location.href;
  const hook = makeHook(orig, Object.assign({ Response: win.Response, baseUrl: href,
    pathname: () => (win.location && win.location.pathname) || '' }, o));
  hook.__fpx = true;
  win.fetch = hook;
  try {
    const m = href && new URL(href).pathname.match(/\/fantasy\/league\/([^/;?#]+)/);
    if (m) hook.prewarm(decodeURIComponent(m[1]));
  } catch (e) { warn('prewarm', e); }
  if (win.document) { try { startLiveDisplay(win); } catch (e) { warn('live display', e); } }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { rowsFromHtml, parseRules, isPointsCat, periCats, pointsCats, POINTS_CATS,
    FPTS_TOLERANCE, fptsTolerance, fptsNum, fmt2, plainCell, statsFromCells, parseFaceoffs, rowPeri,
    SORT_PERI, SORT_PERI_G, isProjected, periByScorer, augmentStats, sortPool, pageOf, periName, periGName, PERI_NAME, PERI_G_NAME,
    profileStats, profilePositions, augmentProfile, augmentProfileTable,
    gpFromFpg, fptsViewPeri, totalsPeri, rosterPeri, augmentRoster, valuesSelection, lookupSelection, cachedLookup,
    planRoster, rowOffset, fpgCheck, liveMode, markLivePeri, startLiveDisplay, LIVE_STYLE, LIVE_STYLE_ID, LIVE_TOLERANCE, LIVE_PLACEHOLDER, LIVE_PERI_ID, liveIsProjected, liveCats, liveRowPeri, augmentLive, handleLive,
    api, getRules, peekRules, peekPool, peekLookup, lookupFailed, poolFailed, UNAVAILABLE_TIP, FAIL_TTL_MS, pullPool, selectionOf, planStats, HANDLERS, makeHook, install, newState, LOADING_TIP, UPDATING_TIP,
    SORT_WAIT_MS };
} else if (typeof window !== 'undefined') {
  install(typeof unsafeWindow !== 'undefined' ? unsafeWindow : window); // eslint-disable-line no-undef
}
