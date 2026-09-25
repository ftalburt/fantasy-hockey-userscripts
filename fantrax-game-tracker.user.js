// ==UserScript==
// @name         Fantrax Game Tracker
// @namespace    http://ftalburt.com/
// @version      1.2.1
// @description  Games played vs the games-played cap, plus a per-day week view of your lineup, on Fantrax matchup and roster pages
// @author       Forrest Talburt
// @match        https://www.fantrax.com/fantasy/league/*
// @exclude      https://www.fantrax.com/fantasy/league/*/draft*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ftalburt/fantasy-hockey-userscripts/master/fantrax-game-tracker.user.js
// @downloadURL  https://raw.githubusercontent.com/ftalburt/fantasy-hockey-userscripts/master/fantrax-game-tracker.user.js
// ==/UserScript==

/*
 * Layers, top to bottom: pure logic (parsers + compute, no DOM, no fetch) → data layer (two same-origin
 * getTeamRosterInfo calls per team, cached 60 s) → page adapters for /livescoring and /team/roster, driven by a
 * URL-polling router and a MutationObserver. The logic is exported to Node for `node --test`; page start-up only
 * runs when a `document` exists. Read-only: the script never calls a Fantrax write method.
 * 1.2.0 adds, on the roster page, a "Week" panel (every lineup slot per period day with that day's game, the bench
 * players who play, open slots and injury tags) and recolours the Schedule - Week cells by each day's real lineup.
 */

// ---------------------------------------------------------------- logic: constants

// Fantrax icon typeIds seen on rosters (2026-09-24, all ten teams): 30 = injured/out ("Lower body - Out Indefinitely"),
// 2 = "Injured Reserve List - …", 6 = "Suspended", 1 = "… - Day-to-Day", 4 = "Minor Leagues"; 8/9/14 news, 20 keeper,
// 35 trade block. The first three mean "will not play"; day-to-day and minors players count as available (shown as a note).
const INJURY_ICON_TYPES = new Set(['30', '2', '6']);
const ICON_TAGS = [['2', 'IR', 'out'], ['30', 'OUT', 'out'], ['6', 'SUSP', 'out'], ['1', 'DTD', 'note'], ['4', 'MINORS', 'note']];   // worst first ('MIN' would read as Minnesota)
// Slot position ids in Fantrax NHL leagues (2026-09-24), used only when a response does not name a slot itself.
const POS_FALLBACK = { 201: 'G', 202: 'D', 203: 'LW', 204: 'RW', 206: 'C', 208: 'Skt' };
const GROUP_BY_SC = { 2010: 'skaters', 2020: 'goalies' };      // scGroup ids in getTeamRosterInfo SCHEDULE_PERIOD
const STATUS_BY_ID = { 1: 'active', 2: 'reserve', 3: 'ir' };   // statusId in the same response; unknown → 'ir'
const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };

// ---------------------------------------------------------------- logic: dates

function pad2(n) { return (n < 10 ? '0' : '') + n; }
function ymd(y, m, d) { return y + '-' + pad2(m) + '-' + pad2(d); }
function dayString(date) { return ymd(date.getFullYear(), date.getMonth() + 1, date.getDate()); }

// Calendar days from start to end inclusive, done in UTC so DST changes cannot skip or repeat a day.
function periodDays(start, end) {
  const [sy, sm, sd] = start.split('-').map(Number), [ey, em, ed] = end.split('-').map(Number);
  const out = [];
  for (let t = Date.UTC(sy, sm - 1, sd); t <= Date.UTC(ey, em - 1, ed); t += 86400000) {
    const d = new Date(t);
    out.push(ymd(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()));
  }
  return out;
}

// Fantrax numbers lineup periods (days) from the season's first day: day 1 = the first scoring period's start,
// day N = that date plus N-1 calendar days (181 days Sep 29 → Mar 28 in 2026-27, verified on the roster page's list).
function addDays(day, n) { const [y, m, d] = day.split('-').map(Number); const t = new Date(Date.UTC(y, m - 1, d) + n * 86400000); return ymd(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()); }
function dayFromIndex(seasonStart, n) { return addDays(seasonStart, n - 1); }
function indexFromDay(seasonStart, day) { const [y, m, d] = day.split('-').map(Number), [sy, sm, sd] = seasonStart.split('-').map(Number); return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(sy, sm - 1, sd)) / 86400000) + 1; }
function seasonStart(periods) { return periods.reduce((a, p) => (a === null || p.start < a ? p.start : a), null); }
function periodForDay(periods, day) { return periods.find(p => day >= p.start && day <= p.end) || null; }

// ---------------------------------------------------------------- logic: parsers

// displayedLists.scoringPeriodList entries look like {name: "(Sep 29/26 - Oct 4/26)", value: 1}; "Full Season" is 9999.
function parsePeriodList(list) {
  const out = [];
  for (const item of list || []) {
    const m = /\((\w{3}) (\d{1,2})\/(\d{2}) - (\w{3}) (\d{1,2})\/(\d{2})\)/.exec(item.name || '');
    if (!m || !MONTHS[m[1]] || !MONTHS[m[4]]) continue;
    const start = ymd(2000 + Number(m[3]), MONTHS[m[1]], Number(m[2]));
    const end = ymd(2000 + Number(m[6]), MONTHS[m[4]], Number(m[5]));
    out.push({ id: Number(item.value), start, end, days: periodDays(start, end) });
  }
  return out;
}

// The worst injury/availability icon on a scorer → {text, kind: "out" | "note", tip: Fantrax's tooltip}, or null.
function iconTag(icons) {
  const list = icons || [];
  for (const [id, text, kind] of ICON_TAGS) {
    const ic = list.find(i => String(i.typeId) === id);
    if (ic) return { text, kind, tip: String(ic.tooltip || '') };
  }
  return null;
}

function parseMax(v) { const n = Number(v); return Number.isFinite(n) && String(v).trim() !== '' ? n : null; }

// getTeamRosterInfo view GAMES_PER_POS
function parseGamesPerPos(data) {
  const played = { skaters: 0, goalies: 0 }, max = { skaters: null, goalies: null };
  for (const row of (data.scMinMaxData && data.scMinMaxData.tableData) || []) {
    const cat = String(row.scoringCategory || '');
    const key = /Skaters/i.test(cat) ? 'skaters' : /Goalies/i.test(cat) ? 'goalies' : null;
    if (!key) continue;
    played[key] = Number(row.total) || 0;
    max[key] = parseMax(row.max);
  }
  const sel = data.displayedSelections || {};
  const teamId = sel.displayedFantasyTeamId || '';
  const team = (data.fantasyTeams || []).find(t => t.id === teamId);
  return { teamId, teamName: team ? team.name : '', period: Number(sel.displayedScoringPeriod) || 0, played, max,
    periods: parsePeriodList(data.displayedLists && data.displayedLists.scoringPeriodList) };
}

// "Tue 4:00PM" inside "@CAR<br/>Tue 4:00PM" → local Date on `day`; null when there is no clock time.
function parseStart(content, day) {
  const m = /(\d{1,2}):(\d{2})\s*([AP]M)/i.exec(content || '');
  if (!m) return null;
  let h = Number(m[1]) % 12; if (m[3].toUpperCase() === 'PM') h += 12;
  const [y, mo, d] = day.split('-').map(Number);
  return new Date(y, mo - 1, d, h, Number(m[2]));
}

// "@CAR<br/>Tue 4:00PM" → {opp: "@CAR", time: "4:00PM"}; a finished game keeps whatever text Fantrax shows after the break.
function parseGameText(content) {
  const parts = String(content || '').split(/<br\s*\/?>/i).map(x => x.replace(/<[^>]*>/g, '').trim());
  return { opp: parts[0] || '', time: (parts[1] || '').replace(/^[A-Za-z]{3}\s+/, '') };
}
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// "2026-10-01" → "Thu 10/1" (the way Fantrax labels its day columns)
function dayLabel(day) { const [y, m, d] = day.split('-').map(Number); return DOW[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] + ' ' + m + '/' + d; }

// Day header cells are {shortName: "Tue 9/29", key: "sched_9/29", eventStr: true} (fixed columns also carry a name).
// "Tue 9/29" → "YYYY-MM-DD" using the period's start year, rolling over at New Year.
function dayColumns(headerCells, period) {
  const startMonth = Number(period.start.slice(5, 7)), startYear = Number(period.start.slice(0, 4));
  const cols = [];
  (headerCells || []).forEach((cell, index) => {
    const m = /^\w{3} (\d{1,2})\/(\d{1,2})$/.exec(String((cell && (cell.shortName || cell.name)) || '').trim());
    if (!m) return;
    const month = Number(m[1]), year = month < startMonth ? startYear + 1 : startYear;
    const day = ymd(year, month, Number(m[2]));
    if (day >= period.start && day <= period.end) cols.push({ index, day });
  });
  return cols;
}

// A schedule response (SCHEDULE_FULL: 30 day columns from Fantrax's current lineup day, ~0.9 s; or SCHEDULE_PERIOD
// with `period: N`: 7 columns from that day, ~3.5 s) → rows per group with the games that fall inside `period`.
// Statuses are NOT taken from here (they are one day's lineup); see parseDayStatuses / applyDayStatuses.
function parseScheduleRows(data, period) {
  const out = { skaters: [], goalies: [] };
  for (const table of data.tables || []) {
    const group = GROUP_BY_SC[table.scGroup];
    if (!group) continue;
    const cols = dayColumns(table.header && table.header.cells, period);
    for (const row of table.rows || []) {
      if (!row.scorer) continue;
      const games = [];
      for (const c of cols) {
        const cell = row.cells && row.cells[c.index];
        if (cell && cell.eventId) games.push(Object.assign({ day: c.day, start: parseStart(cell.content, c.day) }, parseGameText(cell.content)));
      }
      out[group].push({ id: row.scorer.scorerId || '', name: row.scorer.name || row.scorer.shortName || '', pos: row.scorer.posShortNames || '',
        injured: (row.scorer.icons || []).some(i => INJURY_ICON_TYPES.has(String(i.typeId))), tag: iconTag(row.scorer.icons), games });
    }
  }
  return out;
}
// The period days a schedule response has a column for.
function coveredDays(data, period) {
  const t = (data.tables || [])[0];
  return t ? dayColumns(t.header && t.header.cells, period).map(c => c.day) : [];
}
// One lineup day's roster response (any view with rows; the STATS view is the cheapest, ~0.8 s) → {scorerId: status}.
// Lineups are daily on Fantrax: a player can be active on Saturday and on reserve on Sunday (verified 2026-09-23).
function parseDayStatuses(data) {
  const out = {};
  for (const table of data.tables || []) for (const row of table.rows || []) if (row.scorer && row.scorer.scorerId) out[row.scorer.scorerId] = STATUS_BY_ID[row.statusId] || 'ir';
  return out;
}
// One lineup day's roster response → the day's slots in Fantrax order: {posId, pos, status, id, name, group}. An active slot
// with no scorer is OPEN (nobody in it); the "Reserve spot(s) available" row has no posId and is skipped. Slot labels come
// from the players themselves (posIdsNoFlex ↔ posShortNames), else the rank cell's tooltip ("Skt rank: …"), else POS_FALLBACK.
function parseDayLineup(data) {
  const names = Object.assign({}, POS_FALLBACK), slots = [], statuses = {};
  const tables = data.tables || [];
  for (const table of tables) for (const row of table.rows || []) {
    const sc = row.scorer;
    if (!sc) continue;
    const ids = sc.posIdsNoFlex || [], labels = String(sc.posShortNames || '').split(',');
    ids.forEach((id, i) => { if (labels[i]) names[id] = labels[i].trim(); });
    const tip = row.cells && row.cells[0] && row.cells[0].toolTip, m = tip && /^(\w+) rank:/.exec(tip);
    if (m && row.posId && !(row.posId in names)) names[row.posId] = m[1];
  }
  for (const table of tables) {
    const group = GROUP_BY_SC[table.scGroup] || 'skaters';
    for (const row of table.rows || []) {
      if (!row.posId) continue;
      const status = STATUS_BY_ID[row.statusId] || 'ir', sc = row.scorer;
      if (sc && sc.scorerId) statuses[sc.scorerId] = status;
      slots.push({ posId: String(row.posId), pos: names[row.posId] || String(row.posId), status, id: sc && sc.scorerId ? sc.scorerId : null,
        name: sc ? (sc.name || sc.shortName || '') : '', shortName: sc ? (sc.shortName || sc.name || '') : '', group });
    }
  }
  return { slots, statuses };
}
// statusByDay: {day: {scorerId: status}}. A game takes its day's lineup status; a day with no lineup fetched (a past
// day — already inside Played) or a player absent from that day's roster counts as ir, i.e. not at all.
function applyDayStatuses(rows, statusByDay) {
  return rows.map(row => Object.assign({}, row, { games: row.games.map(g => {
    const day = statusByDay[g.day];
    return Object.assign({}, g, { status: (day && day[row.id]) || 'ir' });
  }) }));
}

// ---------------------------------------------------------------- logic: compute

// A game is pending (still to be played) when its day is after today, or today and not yet started.
// A today game with no parseable start time is assumed not started.
function isPending(game, today, now) {
  if (game.day > today) return true;
  if (game.day < today) return false;
  return game.start === null || game.start.getTime() > now.getTime();
}

function compute(group, period, now) {
  const today = dayString(now);
  const active = {}, pending = {};
  for (const day of period.days) { active[day] = 0; pending[day] = 0; }
  let scheduled = 0, bench = 0;
  for (const row of group.rows) {
    if (row.injured) continue;
    for (const g of row.games) {
      if (!(g.day in active)) continue;
      const status = g.status || 'ir';
      const p = isPending(g, today, now);
      if (status === 'active') { active[g.day]++; if (p) { scheduled++; pending[g.day]++; } }
      else if (status === 'reserve' && p) bench++;
    }
  }
  const played = group.played, max = group.max;
  const left = max === null ? null : max - played;
  let status;
  if (max === null) status = { kind: 'nomax', over: 0, unused: 0, bench: 0 };
  else if (scheduled > left) status = { kind: 'over', over: scheduled - left, unused: 0, bench: 0 };
  else if (scheduled < left) status = { kind: 'unused', over: 0, unused: left - scheduled, bench: Math.min(bench, left - scheduled) };
  else status = { kind: 'ok', over: 0, unused: 0, bench: 0 };
  let cumulative = played, crossed = false;
  const perDay = period.days.map(day => {
    if (day < today) return { day, active: active[day], cumulative: null, crosses: false };
    cumulative += pending[day];
    const crosses = max !== null && !crossed && cumulative > max;
    if (crosses) crossed = true;
    return { day, active: active[day], cumulative, crosses };
  });
  return { played, max, left, scheduled, potential: scheduled + bench, status, perDay };
}

function formatStatus(s) {
  if (s.kind === 'nomax') return 'no games max';
  if (s.kind === 'over') return 'over by ' + s.over;
  if (s.kind === 'unused') return s.unused + ' unused' + (s.bench <= 0 ? '' : s.bench >= s.unused ? ', bench covers all ' + s.unused : ', bench covers ' + s.bench);
  return 'on track';
}

// The week panel's model: for each period day, the active slots in lineup order (kind game / idle / open / out), the
// goalie slots apart, the reserve players who have a game that day (bench), and counts. A day whose lineup was not
// loaded has slots === null. `games` counts active games by healthy players over the period, per group.
function weekView(team, now) {
  const today = dayString(now);
  const rowById = {};
  for (const g of ['skaters', 'goalies']) for (const r of team.groups[g].rows) rowById[r.id] = r;
  const games = { skaters: 0, goalies: 0 };
  const days = team.period.days.map(day => {
    const lineup = team.lineups && team.lineups[day];
    const state = day < today ? 'past' : day === today ? 'today' : 'future';
    if (!lineup) return { day, label: dayLabel(day), state, slots: null, goalies: null, bench: [], counts: { playing: 0, idle: 0, open: 0, out: 0 } };
    const slots = [], goalies = [], bench = [], counts = { playing: 0, idle: 0, open: 0, out: 0 };
    for (const s of lineup.slots) {
      const row = s.id ? rowById[s.id] : null;
      const game = row ? row.games.find(g => g.day === day) : null;
      const base = { pos: s.pos, id: s.id, name: s.name, shortName: s.shortName || s.name, group: s.group, opp: game ? game.opp : '', time: game ? game.time : '', start: game ? game.start : null, tag: row ? row.tag : null };
      if (s.status === 'active') {
        let kind;
        if (!s.id) kind = 'open'; else if (!game) kind = 'idle'; else if (row.injured) kind = 'out'; else kind = 'game';
        if (s.group !== 'goalies') counts[kind === 'game' ? 'playing' : kind]++;   // the header counts skater slots; goalies are listed apart
        if (kind === 'game') games[s.group]++;
        (s.group === 'goalies' ? goalies : slots).push(Object.assign(base, { kind }));
      } else if (s.status === 'reserve' && game && !row.injured) bench.push(base);
    }
    bench.sort((a, b) => (a.start && b.start ? a.start - b.start : a.start ? -1 : b.start ? 1 : 0) || a.name.localeCompare(b.name));
    return { day, label: dayLabel(day), state, slots, goalies, bench, counts };
  });
  return { days, games };
}

// ---------------------------------------------------------------- adapter decisions (pure)

// Should a container be (re)rendered for `key`? A finished table or a terminal error marker for the same key stands
// until a route change, the retry link or the forced 5-minute refresh; anything else (nothing, another key, a loading
// marker) is rendered again — re-issuing a loading marker hits the cache, so it costs no request.
function shouldRender(existing, key, force) {
  if (force || !existing) return true;
  if (existing.getAttribute('data-fgt-key') !== key) return true;
  return !(existing.tagName === 'TABLE' || existing.getAttribute('data-fgt-state') === 'error');
}
// A finished load may only land if the container still waits for that key (a slow response must not overwrite a newer render).
function isCurrent(existing, key) { return !!existing && existing.getAttribute('data-fgt-key') === key; }

// ---------------------------------------------------------------- routing

// Fantrax URLs: /fantasy/league/<id>/livescoring;period=2?matchupId=A_B and /fantasy/league/<id>/team/roster;view=X;scoringPeriod=2
function parseRoute(href) {
  const url = new URL(href);
  const segs = url.pathname.split('/').filter(Boolean);            // ["fantasy","league","<id>","team","roster;view=..."]
  const out = { page: null, leagueId: null, period: null, day: null, teamId: null, view: null };
  if (segs[0] !== 'fantasy' || segs[1] !== 'league' || !segs[2]) return out;
  out.leagueId = segs[2];
  const rest = segs.slice(3).join('/');
  const [path, ...matrix] = rest.split(';');
  const params = {};
  for (const m of matrix) { const i = m.indexOf('='); if (i > 0) params[decodeURIComponent(m.slice(0, i))] = decodeURIComponent(m.slice(i + 1)); }
  if (path === 'livescoring') { out.page = 'matchups'; out.period = params.period ? Number(params.period) : null; }
  else if (path === 'team/roster') {
    // Min/Max and Schedule - Week carry ;scoringPeriod=N; the Stats and Fantasy Points tabs carry ;period=N, a LINEUP DAY
    out.page = 'roster'; out.period = params.scoringPeriod ? Number(params.scoringPeriod) : null; out.day = params.period ? Number(params.period) : null;
    out.teamId = params.teamId || null; out.view = params.view || null;
  }
  return out;
}

// ---------------------------------------------------------------- data

const API_TIMEOUT_MS = 20000, CACHE_TTL_MS = 60000, RETRY_DELAY_MS = 1500;

// POST /fxpa/req?leagueId=<id> with {msgs:[{method,data}, …]} and return one data object per message. Fantrax runs
// the messages of one request in series, so slow views go in separate parallel requests. One automatic retry.
// fetchImpl and retryDelay are for tests.
async function apiMulti(leagueId, msgs, fetchImpl, retryDelay) {
  try { return await apiOnce(leagueId, msgs, fetchImpl); }
  catch (e) {
    await new Promise(r => setTimeout(r, retryDelay === undefined ? RETRY_DELAY_MS : retryDelay));
    return apiOnce(leagueId, msgs, fetchImpl);
  }
}
async function apiOnce(leagueId, msgs, fetchImpl) {
  const doFetch = fetchImpl || fetch;
  const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const killer = ctl ? setTimeout(() => ctl.abort(), API_TIMEOUT_MS) : null;
  try {
    const r = await doFetch('/fxpa/req?leagueId=' + encodeURIComponent(leagueId), {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ msgs }), signal: ctl ? ctl.signal : undefined,
    });
    if (!r.ok) throw new Error('HTTP ' + r.status + ' from ' + msgs.map(m => m.method).join(','));
    const j = await r.json();
    const out = msgs.map((m, i) => j && j.responses && j.responses[i] && j.responses[i].data);
    if (out.some(d => !d)) throw new Error('empty response for ' + msgs[out.findIndex(d => !d)].method);
    return out;
  } finally { if (killer) clearTimeout(killer); }
}
async function api(leagueId, method, data, fetchImpl) { return (await apiMulti(leagueId, [{ method, data }], fetchImpl))[0]; }

function rosterMsg(leagueId, view, teamId, period, day) {
  const d = { leagueId, view };
  if (period !== null && period !== undefined) d.scoringPeriod = String(period);
  if (day !== null && day !== undefined) d.period = String(day);   // a lineup day; wins over scoringPeriod on Fantrax's side
  if (teamId) d.teamId = teamId;
  return { method: 'getTeamRosterInfo', data: d };
}

// The period lists seen per league, so a lineup day can be mapped to its scoring period before the first load.
const periodLists = {};

// One team for one scoring period → {teamId, teamName, period, groups:{skaters, goalies}}.
// period: scoring period id, or null for Fantrax's current one; day: a lineup day whose scoring period is wanted
// instead (the roster page's Stats tab). Requests, measured 2026-09-23: games-played (0.1 s); then in parallel the
// 30-day schedule (0.9 s) and one STATS call per lineup day of the period (0.8 s each, past days included since 1.2.0) —
// the per-day lineups. Days the 30-day schedule does not reach fall back to 7-day SCHEDULE_PERIOD calls (3.5 s each).
async function loadTeam(leagueId, { teamId, period, day }, fetchImpl, now, retryDelay) {
  const gppMsg = sp => [rosterMsg(leagueId, 'GAMES_PER_POS', teamId, sp)];
  let g = parseGamesPerPos((await apiMulti(leagueId, gppMsg(period), fetchImpl, retryDelay))[0]);
  if (g.periods.length) periodLists[leagueId] = g.periods;
  let p = g.periods.find(x => x.id === g.period);
  if ((period === null || period === undefined) && day) {
    const wanted = periodForDay(g.periods, dayFromIndex(seasonStart(g.periods), day));
    if (wanted && (!p || wanted.id !== p.id)) {
      g = parseGamesPerPos((await apiMulti(leagueId, gppMsg(wanted.id), fetchImpl, retryDelay))[0]);
      p = g.periods.find(x => x.id === g.period);
    }
  }
  if (!p) throw new Error('period ' + g.period + ' not in the period list');
  const start = seasonStart(g.periods), today = dayString(now || new Date());
  const lineupDays = p.days.slice();                                 // every day, past ones too (the week panel shows them)
  const one = msg => apiMulti(leagueId, [msg], fetchImpl, retryDelay).then(r => r[0]);
  const [full, ...dayData] = await Promise.all([one(rosterMsg(leagueId, 'SCHEDULE_FULL', teamId))]
    .concat(lineupDays.map(d => one(rosterMsg(leagueId, 'STATS', teamId, null, indexFromDay(start, d))))));
  const covered = new Set(coveredDays(full, p));
  const rows = parseScheduleRows(full, p);
  let missing = p.days.filter(d => !covered.has(d));
  while (missing.length) {                                           // 7 columns per SCHEDULE_PERIOD call
    const chunk = parseScheduleRows(await one(rosterMsg(leagueId, 'SCHEDULE_PERIOD', teamId, null, indexFromDay(start, missing[0]))), p);
    const until = addDays(missing[0], 6);
    for (const group of ['skaters', 'goalies']) for (const r of chunk[group]) {
      let target = rows[group].find(x => x.id === r.id);
      if (!target) { target = { id: r.id, name: r.name, injured: r.injured, games: [] }; rows[group].push(target); }
      for (const gm of r.games) if (gm.day >= missing[0] && gm.day <= until && !target.games.some(x => x.day === gm.day)) target.games.push(gm);
    }
    missing = missing.filter(d => d > until);
  }
  for (const group of ['skaters', 'goalies']) for (const r of rows[group]) r.games.sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
  const statusByDay = {}, lineups = {};
  dayData.forEach((d, i) => { const l = parseDayLineup(d); lineups[lineupDays[i]] = l; statusByDay[lineupDays[i]] = l.statuses; });
  return { teamId: g.teamId, teamName: g.teamName, period: p, lineups, groups: {
    skaters: { played: g.played.skaters, max: g.max.skaters, rows: applyDayStatuses(rows.skaters, statusByDay) },
    goalies: { played: g.played.goalies, max: g.max.goalies, rows: applyDayStatuses(rows.goalies, statusByDay) },
  } };
}

const cache = new Map();
function clearCache() { cache.clear(); }
function cacheKey(leagueId, teamId, period, day) { return leagueId + '|' + (teamId || 'me') + '|' + (period === null || period === undefined ? 'cur' : period) + '|' + (day || ''); }
function cachedLoadTeam(leagueId, args, fetchImpl, now, retryDelay) {
  const key = cacheKey(leagueId, args.teamId, args.period, args.day);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.promise;
  const entry = { at: Date.now(), promise: loadTeam(leagueId, args, fetchImpl, now, retryDelay) };
  cache.set(key, entry);
  // a load asked by lineup day (or Fantrax's default) is the same data as its resolved scoring period
  entry.promise.then(team => { cache.set(cacheKey(leagueId, args.teamId, team.period.id, null), entry); },
    () => { for (const [k, v] of cache) if (v === entry) cache.delete(k); });
  return entry.promise;
}

// ---------------------------------------------------------------- DOM: shared

const SEL = {
  // Matchups page (2026-09-23): 3 heads per matchup — team A, middle, team B; name link href carries teamId=<id>
  matchupHeads: 'header.scoring-table__row div.scoring-table__head',
  matchupBlock: 'league-livescoring-table-header',
  matchupName: 'header.scoring-header__name a',
  // Roster page (2026-09-23)
  rosterRoot: 'app-league-team-roster',
  rosterHeadline: 'app-league-team-roster headline.fx-headline',
  rosterHeadlineRows: '.fx-headline__rows',
  rosterTables: 'league-team-roster-tables div.i-table',
  rosterHeaderRow: '.i-table__row.i-table__header',
  rosterBody: '.i-table__body',
  cell: '.i-table__cell',
};
const COLORS = { over: '#f87171', unused: '#fbbf24', ok: '#4ade80', nomax: '#9ca3af', muted: '#9ca3af' };
const LOG = '[fgt]';

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) { if (k === 'style') node.style.cssText = v; else if (k === 'text') node.textContent = v; else node.setAttribute(k, v); }
  for (const c of children || []) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return node;
}

function statusColor(status) {
  if (status.kind === 'over') return COLORS.over;
  if (status.kind === 'unused') return status.bench > 0 ? COLORS.unused : COLORS.ok;
  if (status.kind === 'ok') return COLORS.ok;
  return COLORS.nomax;
}

function marker(kind, key, text, onRetry) {
  const m = el('div', { 'data-fgt': kind, 'data-fgt-key': key, 'data-fgt-state': onRetry ? 'error' : 'loading', style: 'font:12px/1.4 sans-serif;color:' + COLORS.muted + ';margin:4px 0' }, ['games: ' + text]);
  if (onRetry) { const b = el('a', { href: '#', style: 'margin-left:6px;color:#93c5fd', text: 'retry' }); b.addEventListener('click', e => { e.preventDefault(); onRetry(); }); m.appendChild(b); }
  return m;
}

function numCell(v, extraStyle) { return el('td', { style: 'padding:1px 6px;text-align:right;' + (extraStyle || ''), text: v === null ? '–' : String(v) }); }

// The two-row Played / Max / Left / Sched / Potential / status table used on both pages.
function buildTable(kind, key, team, now) {
  const head = el('tr', { style: 'color:' + COLORS.muted }, [el('th', { style: 'text-align:left;padding:1px 6px;font-weight:normal;white-space:nowrap', text: team.period.start.slice(5) + ' – ' + team.period.end.slice(5) })]
    .concat(['Played', 'Max', 'Left', 'Sched', 'Potential', ''].map(h => el('th', { style: 'padding:1px 6px;text-align:right;font-weight:normal', text: h }))));
  const rows = ['skaters', 'goalies'].map(g => {
    const r = compute(team.groups[g], team.period, now);
    const color = statusColor(r.status);
    return el('tr', {}, [el('td', { style: 'padding:1px 6px;text-align:left', text: g === 'skaters' ? 'Skaters' : 'Goalies' }),
      numCell(r.played), numCell(r.max), numCell(r.left), numCell(r.scheduled), numCell(r.potential),
      el('td', { style: 'padding:1px 6px;text-align:left;white-space:nowrap;color:' + color, text: formatStatus(r.status) })]);
  });
  return el('table', { 'data-fgt': kind, 'data-fgt-key': key, style: 'font:12px/1.4 sans-serif;border-collapse:collapse;margin:4px 0;color:#e5e7eb' }, [head].concat(rows));
}

function removeOwn(container, kind) { for (const n of container.querySelectorAll('[data-fgt="' + kind + '"]')) n.remove(); }
// While a re-render loads, the previous table stays visible but dimmed and a small marker says "updating…"
// (a period switch or a lineup save takes a few seconds; a blank "loading…" read as broken).
function ownNodes(container, kind) {
  return { table: container.querySelector('table[data-fgt="' + kind + '"]:not([data-fgt-stale])'), marker: container.querySelector('div[data-fgt="' + kind + '"]') };
}
function beginUpdate(container, kind, key, insert) {
  const { table } = ownNodes(container, kind);
  for (const n of container.querySelectorAll('div[data-fgt="' + kind + '"], table[data-fgt="' + kind + '"][data-fgt-stale]')) n.remove();
  if (table) { table.setAttribute('data-fgt-stale', '1'); table.style.opacity = '0.45'; }
  insert(marker(kind, key, table ? 'updating…' : 'loading…'));
}
function finishUpdate(container, kind, insert) { removeOwn(container, kind); insert(); }

// ---------------------------------------------------------------- DOM: matchups page

function teamIdFromHead(head) {
  const a = head.querySelector(SEL.matchupName);
  const m = a && /teamId=([a-z0-9]+)/.exec(a.getAttribute('href') || '');
  return m ? m[1] : null;
}

function renderMatchups(route, force) {
  const heads = Array.from(document.querySelectorAll(SEL.matchupHeads));
  for (const head of heads) {
    const teamId = teamIdFromHead(head), block = head.querySelector(SEL.matchupBlock);
    if (!teamId || !block) continue;
    const key = teamId + '|' + (route.period === null ? 'cur' : route.period);
    const own = ownNodes(head, 'matchup');
    if (!shouldRender(own.table || own.marker, key, force)) continue;
    beginUpdate(head, 'matchup', key, n => block.insertAdjacentElement('afterend', n));
    const stillWanted = () => head.isConnected && block.isConnected && isCurrent(ownNodes(head, 'matchup').marker, key);
    cachedLoadTeam(route.leagueId, { teamId, period: route.period, day: null }).then(team => {
      if (!stillWanted()) return;
      finishUpdate(head, 'matchup', () => block.insertAdjacentElement('afterend', buildTable('matchup', key, team, new Date())));
    }, err => {
      console.warn(LOG, 'matchups', teamId, err);
      if (!stillWanted()) return;
      finishUpdate(head, 'matchup', () => block.insertAdjacentElement('afterend', marker('matchup', key, 'unavailable', () => renderMatchups(route, true))));
    });
  }
}

// ---------------------------------------------------------------- DOM: roster page

function dayCellIndexes(headerRow, period) {
  const cells = Array.from(headerRow.querySelectorAll(':scope > ' + SEL.cell));
  const startMonth = Number(period.start.slice(5, 7)), startYear = Number(period.start.slice(0, 4));
  const out = [];
  cells.forEach((c, index) => {
    const m = /^\w{3} (\d{1,2})\/(\d{1,2})$/.exec(c.textContent.trim());
    if (!m) return;
    const month = Number(m[1]);
    out.push({ index, day: ymd(month < startMonth ? startYear + 1 : startYear, month, Number(m[2])) });
  });
  return { widths: cells.map(c => c.getBoundingClientRect().width), days: out };
}

// values: Map(cellIndex -> {text, color}); widths: the header cells' pixel widths. Fantrax's rows are flex rows whose
// cells carry inline rem widths and grow to fill; pinning ours to the header's measured widths keeps every column
// aligned and stops our row from widening the table (seen 2026-09-23: unpinned cells stretched Fantrax's own rows).
function footerRow(label, values, key, widths) {
  const cells = widths.map((w, i) => {
    const v = values.get(i);
    const cls = 'i-table__cell' + (i === 0 ? ' i-table__cell--sticky-left' : ' i-table__cell--center');
    const style = 'flex:0 0 ' + w + 'px;width:' + w + 'px;min-width:' + w + 'px;max-width:' + w + 'px;margin:0;box-sizing:border-box;font-size:12px;'
      + (v && v.color ? 'color:' + v.color + ';font-weight:bold;' : 'color:' + COLORS.muted + ';');
    return el('div', { class: cls, style, text: i === 0 ? label : (v ? v.text : '') });
  });
  return el('div', { class: 'i-table__row', 'data-fgt': 'perday', 'data-fgt-key': key }, cells);
}

function renderPerDay(team, key, now) {
  for (const table of document.querySelectorAll(SEL.rosterTables)) {
    const headerRow = table.querySelector(SEL.rosterHeaderRow), body = table.querySelector(SEL.rosterBody);
    if (!headerRow || !body) continue;
    const first = headerRow.querySelector(SEL.cell);
    const group = first && /^Skaters/i.test(first.textContent.trim()) ? 'skaters' : first && /^Goalies/i.test(first.textContent.trim()) ? 'goalies' : null;
    if (!group) continue;
    const { widths, days } = dayCellIndexes(headerRow, team.period);
    if (days.length === 0) continue;                       // not the Schedule - Week view
    const r = compute(team.groups[group], team.period, now);
    const byDay = new Map(r.perDay.map(d => [d.day, d]));
    const active = new Map(), cumulative = new Map();
    for (const { index, day } of days) {
      const d = byDay.get(day);
      if (!d) continue;
      active.set(index, { text: team.lineups && team.lineups[day] ? String(d.active) : '' });
      cumulative.set(index, d.cumulative === null ? { text: '' } : { text: String(d.cumulative), color: d.crosses ? COLORS.over : (r.max !== null && d.cumulative > r.max ? COLORS.over : null) });
    }
    removeOwn(table, 'perday');
    body.appendChild(footerRow('Active games', active, key, widths));
    body.appendChild(footerRow('Running total' + (r.max === null ? '' : ' (max ' + r.max + ')'), cumulative, key, widths));
  }
}

// ---- the week panel (1.2.0): every lineup slot per period day, with that day's game, plus the bench players who play

const WEEK_CSS = `
.fgt-wk{font:12px/1.35 sans-serif;color:#e5e7eb;border:1px solid #2c3140;border-radius:4px;background:#1c1f2b;margin:6px 0;text-align:left}
.fgt-wkhead{display:flex;gap:14px;align-items:baseline;padding:6px 10px;color:#9ca3af;flex-wrap:wrap}
.fgt-wkhead b{color:#e5e7eb;font-weight:600}
.fgt-wkhead a{color:#93c5fd;text-decoration:none;font-weight:600;cursor:pointer}
.fgt-wkbody{border-top:1px solid #2c3140;overflow-x:auto}
.fgt-cols{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(170px,1fr)}
.fgt-col{padding:6px 8px 8px;border-right:1px solid #2c3140;min-width:0}
.fgt-col:last-child{border-right:0}
.fgt-col.fgt-past{opacity:.5}
.fgt-col.fgt-today{background:#222738;box-shadow:inset 0 2px 0 #5b8def}
.fgt-dh{display:flex;flex-direction:column;gap:1px;margin-bottom:5px;padding-bottom:4px;border-bottom:1px solid #2c3140;white-space:nowrap}
.fgt-dh b{font-weight:600;color:#fff}
.fgt-dh span{color:#9ca3af;font-size:11px;overflow:hidden;text-overflow:ellipsis}
.fgt-pl{display:flex;gap:5px;align-items:baseline;padding:1px 0;white-space:nowrap;line-height:1.3}
.fgt-pos{flex:0 0 22px;font-size:10px;color:#8b93a7}
.fgt-nm{flex:1 1 36px;min-width:36px;overflow:hidden;text-overflow:ellipsis;color:#8fbcff}
.fgt-gm{flex:0 1 auto;overflow:hidden;text-overflow:ellipsis;color:#c4c9d6;font-size:11px}
.fgt-idle .fgt-nm{color:#4b5163;font-style:italic}
.fgt-idle .fgt-gm{color:#3f4454;font-size:10px;overflow:hidden;text-overflow:ellipsis;flex:0 1 auto}
.fgt-idle .fgt-pos{color:#4b5163}
.fgt-open{border:1px dashed rgba(251,191,36,.55);border-radius:3px;padding:0 4px;margin:1px 0}
.fgt-open .fgt-nm{color:#fbbf24;font-style:italic}
.fgt-out .fgt-nm,.fgt-out .fgt-gm{color:#6b7386;text-decoration:line-through;text-decoration-color:#4b5163}
.fgt-bench{opacity:.5}
.fgt-bench .fgt-nm{color:#c4c9d6}
.fgt-tag{flex:0 0 auto;font-size:9px;font-weight:600;letter-spacing:.04em;padding:0 4px;border-radius:2px;line-height:14px}
.fgt-tag-out{background:rgba(248,113,113,.18);color:#f87171}
.fgt-tag-note{background:rgba(251,191,36,.18);color:#fbbf24}
.fgt-gsep{margin-top:4px;padding-top:3px;border-top:1px dashed #2c3140}
.fgt-sec{margin-top:7px;padding-top:4px;border-top:1px dashed #2c3140;font-size:10px;letter-spacing:.04em;text-transform:uppercase;color:#7c8497}
.fgt-none{color:#4b5163;font-style:italic}
.fgt-legend{padding:5px 10px;border-top:1px solid #2c3140;color:#7c8497;font-size:11px;display:flex;gap:16px;flex-wrap:wrap}
.fgt-sw{display:inline-block;width:9px;height:9px;border-radius:2px;vertical-align:-1px;margin-right:5px}
`;
function ensureWeekStyle() {
  if (document.getElementById('fgt-style')) return;
  const st = el('style', { id: 'fgt-style', 'data-fgt': 'css' }); st.textContent = WEEK_CSS;
  (document.head || document.documentElement).appendChild(st);
}
const WEEK_COLLAPSED_KEY = 'fgt-week-collapsed';
function weekCollapsed() { try { return localStorage.getItem(WEEK_COLLAPSED_KEY) === '1'; } catch (e) { return false; } }
function setWeekCollapsed(v) { try { localStorage.setItem(WEEK_COLLAPSED_KEY, v ? '1' : '0'); } catch (e) { /* private mode */ } }

function slotLine(s, extraClass) {
  const kids = [el('span', { class: 'fgt-pos', text: s.pos })];
  if (s.kind === 'open') kids.push(el('span', { class: 'fgt-nm', text: 'open slot' }), el('span', { class: 'fgt-gm', text: '' }));
  else if (s.kind === 'idle') kids.push(el('span', { class: 'fgt-nm', text: 'empty' }), el('span', { class: 'fgt-gm', text: s.shortName, title: s.name + ': no game' }));
  else {
    kids.push(el('span', { class: 'fgt-nm', text: s.shortName, title: s.name }));
    if (s.tag) kids.push(el('span', { class: 'fgt-tag fgt-tag-' + s.tag.kind, text: s.tag.text, title: s.tag.tip || s.tag.text }));
    kids.push(el('span', { class: 'fgt-gm', text: s.kind === 'out' ? s.opp : (s.opp + ' ' + s.time).trim() }));   // an out player's start time is noise
  }
  return el('div', { class: 'fgt-pl' + (s.kind && s.kind !== 'game' ? ' fgt-' + s.kind : '') + (extraClass ? ' ' + extraClass : '') }, kids);
}

function buildWeekPanel(key, team, now) {
  const w = weekView(team, now);
  const inPeriod = w.days.some(d => d.state === 'today');
  const collapsed = weekCollapsed();
  const toggle = el('a', { href: '#', text: (collapsed ? '▸' : '▾') + ' Week' });
  const body = el('div', { class: 'fgt-wkbody', style: collapsed ? 'display:none' : '' });
  toggle.addEventListener('click', e => {
    e.preventDefault();
    const hide = body.style.display !== 'none';
    body.style.display = hide ? 'none' : ''; toggle.textContent = (hide ? '▸' : '▾') + ' Week'; setWeekCollapsed(hide);
  });
  const head = el('div', { class: 'fgt-wkhead' }, [toggle, el('b', { text: dayLabel(team.period.start) + ' – ' + dayLabel(team.period.end) }),
    el('span', { text: 'every lineup slot, per day · ' + w.games.skaters + ' skater games · ' + w.games.goalies + ' goalie games' }),
    el('span', { style: 'margin-left:auto', text: inPeriod ? 'today: ' + dayLabel(dayString(now)) : '' })]);
  const cols = el('div', { class: 'fgt-cols' }, w.days.map(d => {
    const c = d.counts;
    const kids = [el('div', { class: 'fgt-dh' }, [el('b', { text: d.label }),
      el('span', { text: d.slots === null ? '' : c.playing + ' playing · ' + c.idle + ' empty' + (c.open ? ' · ' + c.open + ' open' : '') + (c.out ? ' · ' + c.out + ' out' : '') })])];
    if (d.slots === null) kids.push(el('div', { class: 'fgt-pl fgt-none', text: 'no lineup loaded' }));
    else {
      for (const s of d.slots) kids.push(slotLine(s));
      if (d.goalies.length) { kids.push(el('div', { class: 'fgt-gsep' })); for (const s of d.goalies) kids.push(slotLine(s)); }
      if (d.bench.length) { kids.push(el('div', { class: 'fgt-sec', text: 'Bench, has a game' })); for (const s of d.bench) kids.push(slotLine(Object.assign({ kind: 'game' }, s), 'fgt-bench')); }
    }
    return el('div', { class: 'fgt-col fgt-' + d.state }, kids);
  }));
  const legend = el('div', { class: 'fgt-legend' }, [
    el('span', {}, [el('span', { class: 'fgt-sw', style: 'background:#8fbcff' }), 'slot filled, plays that day']),
    el('span', {}, [el('span', { class: 'fgt-sw', style: 'background:#2a2e3c;border:1px solid #4b5163' }), 'slot empty: its player has no game (name in grey)']),
    el('span', {}, [el('span', { class: 'fgt-sw', style: 'border:1px dashed rgba(251,191,36,.7)' }), 'slot open: nobody in it (a change carries forward to later days)']),
    el('span', {}, [el('span', { class: 'fgt-tag fgt-tag-out', text: 'OUT' }), ' / ', el('span', { class: 'fgt-tag fgt-tag-out', text: 'IR' }), ' / ', el('span', { class: 'fgt-tag fgt-tag-out', text: 'SUSP' }), ' out, on IR, suspended: struck and not counted']),
    el('span', {}, [el('span', { class: 'fgt-tag fgt-tag-note', text: 'DTD' }), ' / ', el('span', { class: 'fgt-tag fgt-tag-note', text: 'MINORS' }), ' day-to-day, in the minors: shown, still counted (hover for Fantrax\'s note)']),
    el('span', {}, [el('span', { class: 'fgt-sw', style: 'background:#4b5163' }), 'on reserve that day with a game']),
    el('span', { text: 'dimmed column = already played' }),
  ]);
  body.appendChild(cols); body.appendChild(legend);
  return el('div', { class: 'fgt-wk', 'data-fgt': 'week', 'data-fgt-key': key }, [head, body]);
}

// The headline is a flex row (title block ~900 px + team picker); letting it wrap and giving the panel a 100% basis puts
// the panel on its own full-width line under both (1068 px on 2026-09-24), the same width as Fantrax's tables.
function renderWeek(root, headline, team, key, now) {
  ensureWeekStyle();
  removeOwn(root, 'week');
  headline.style.flexWrap = 'wrap';
  const panel = buildWeekPanel(key, team, now);
  panel.style.flex = '1 1 100%'; panel.style.minWidth = '0';
  headline.appendChild(panel);
}

// ---- recolour Fantrax's own Schedule - Week cells by that day's lineup (1.2.0): the grid draws every row with the
// displayed day's slot, so a player benched for Thursday still looks active in Thursday's column. Rows are matched by
// the player's full name in the first cell (the player link carries no id); the day cells by the header's day columns.
const CELL_STYLE = {
  active: { background: 'rgba(74,222,128,.10)', boxShadow: 'inset 0 0 0 1px rgba(74,222,128,.35)' },
  activeOut: { background: 'rgba(248,113,113,.10)', boxShadow: 'inset 0 0 0 1px rgba(248,113,113,.35)', textDecoration: 'line-through' },
  reserve: { textDecoration: 'line-through', opacity: '0.55' },
  ir: { opacity: '0.35' },
};
function clearCellStyles(table) {
  for (const c of table.querySelectorAll('[data-fgt-cell]')) { for (const k of ['background', 'boxShadow', 'textDecoration', 'opacity']) c.style[k] = ''; c.removeAttribute('data-fgt-cell'); c.removeAttribute('title'); }
}
function renderCellStatus(team, key) {
  for (const table of document.querySelectorAll(SEL.rosterTables)) {
    const headerRow = table.querySelector(SEL.rosterHeaderRow), body = table.querySelector(SEL.rosterBody);
    if (!headerRow || !body) continue;
    const first = headerRow.querySelector(SEL.cell);
    const group = first && /^Skaters/i.test(first.textContent.trim()) ? 'skaters' : first && /^Goalies/i.test(first.textContent.trim()) ? 'goalies' : null;
    if (!group) continue;
    const { days } = dayCellIndexes(headerRow, team.period);
    if (days.length === 0) continue;
    clearCellStyles(table);
    const rows = team.groups[group].rows, byName = new Map(rows.map(r => [r.name, r]));
    for (const tr of body.querySelectorAll(':scope > .i-table__row:not([data-fgt])')) {
      const cells = Array.from(tr.querySelectorAll(':scope > ' + SEL.cell));
      if (!cells.length) continue;
      const link = cells[0].querySelector('a');
      const text = (link || cells[0]).textContent.trim();
      const row = byName.get(text) || rows.find(r => r.name && cells[0].textContent.indexOf(r.name) >= 0);
      if (!row) continue;
      for (const { index, day } of days) {
        const cell = cells[index], game = row.games.find(g => g.day === day);
        if (!cell || !game || !game.status || game.status === 'ir' && !team.lineups[day]) continue;
        const st = game.status === 'active' ? (row.injured ? CELL_STYLE.activeOut : CELL_STYLE.active) : game.status === 'reserve' ? CELL_STYLE.reserve : CELL_STYLE.ir;
        Object.assign(cell.style, st);
        cell.setAttribute('data-fgt-cell', key);
        cell.setAttribute('title', game.status === 'active' ? (row.injured ? 'active that day, but ' + (row.tag ? row.tag.text : 'out') : 'active that day') : game.status === 'reserve' ? 'on reserve that day' : 'IR / not on the roster that day');
      }
    }
    table.setAttribute('data-fgt-cells', key);
  }
}

function renderRoster(route, force) {
  const headline = document.querySelector(SEL.rosterHeadline), root = document.querySelector(SEL.rosterRoot);
  if (!headline || !root) return;
  // The page root is a CSS grid: a sibling inserted after the headline lands at the bottom of the page, so the strip
  // goes INSIDE the headline's rows block (title + subtitle), which flows normally (seen 2026-09-23).
  const anchor = headline.querySelector(SEL.rosterHeadlineRows) || headline;
  // ;period=N is a lineup day: once this league's period list is known, map it to its scoring period so the key
  // (and the cache) stay stable while the day arrows move inside one period.
  let period = route.period, day = route.day;
  if (period === null && day && periodLists[route.leagueId]) {
    const list = periodLists[route.leagueId], sp = periodForDay(list, dayFromIndex(seasonStart(list), day));
    if (sp) { period = sp.id; day = null; }
  }
  const key = (route.teamId || 'me') + '|' + (period === null ? 'cur' : period) + '|' + (day || '') + '|' + (route.view || '');
  const own = ownNodes(root, 'strip');
  // Only the Schedule - Week view has day columns; elsewhere the strip alone is the complete render.
  const hasDayColumns = Array.from(document.querySelectorAll(SEL.rosterTables + ' ' + SEL.rosterHeaderRow + ' > ' + SEL.cell))
    .some(c => /^\w{3} \d{1,2}\/\d{1,2}$/.test(c.textContent.trim()));
  const perDayPresent = !hasDayColumns || !!root.querySelector('[data-fgt="perday"]');
  const cellsPresent = !hasDayColumns || !!root.querySelector('[data-fgt-cells="' + key + '"]');
  const weekPresent = !!root.querySelector('[data-fgt="week"]');
  if (!shouldRender(own.table || own.marker, key, force) && perDayPresent && cellsPresent && weekPresent) return;
  beginUpdate(root, 'strip', key, n => anchor.appendChild(n));
  for (const n of root.querySelectorAll('[data-fgt="perday"], [data-fgt="week"]')) n.style.opacity = '0.45';
  const stillWanted = () => anchor.isConnected && isCurrent(ownNodes(root, 'strip').marker, key);
  cachedLoadTeam(route.leagueId, { teamId: route.teamId, period, day }).then(team => {
    if (!stillWanted()) return;
    const now = new Date();
    finishUpdate(root, 'strip', () => anchor.appendChild(buildTable('strip', key, team, now)));
    renderWeek(root, headline, team, key, now);
    renderPerDay(team, key, now);
    renderCellStatus(team, key);
  }, err => {
    console.warn(LOG, 'roster', err);
    if (!stillWanted()) return;
    finishUpdate(root, 'strip', () => anchor.appendChild(marker('strip', key, 'unavailable', () => renderRoster(route, true))));
  });
}

// ---------------------------------------------------------------- start-up

function start() {
  let lastHref = '', timer = null, pendingForce = false;
  const render = (force) => {
    try {
      const route = parseRoute(location.href);
      if (route.page === 'matchups') renderMatchups(route, force);
      else if (route.page === 'roster') renderRoster(route, force);
    } catch (e) { console.warn(LOG, 'render failed', e); }
  };
  // Debounced; a forced request (the 5-minute refresh) survives coalescing with ordinary ones.
  const schedule = (force) => { pendingForce = pendingForce || !!force; clearTimeout(timer); timer = setTimeout(() => { const f = pendingForce; pendingForce = false; render(f); }, 300); };
  setInterval(() => { if (location.href !== lastHref) { lastHref = location.href; schedule(); } }, 500);
  setInterval(() => { clearCache(); schedule(true); }, 5 * 60 * 1000);
  const observe = () => {
    const main = document.querySelector('section.fx-layout__main') || document.body;
    new MutationObserver(records => {
      // ignore mutations caused by our own nodes
      if (records.every(r => Array.from(r.addedNodes).concat(Array.from(r.removedNodes)).every(n => n.nodeType === 1 && n.hasAttribute && n.hasAttribute('data-fgt')))) return;
      schedule();
    }).observe(main, { childList: true, subtree: true });
  };
  if (document.body) observe(); else document.addEventListener('DOMContentLoaded', observe);
  // A lineup save shows a "Changes successfully saved" toast in a body-level overlay (outside the main column,
  // verified 2026-09-23 in the test league); the roster rows re-render without a route change, so refresh on it.
  const refresh = () => { clearCache(); schedule(true); };
  const watchToasts = () => new MutationObserver(records => {
    for (const r of records) for (const n of r.addedNodes) {
      if (n.nodeType === 1 && !n.hasAttribute('data-fgt') && /successfully saved/i.test(n.textContent || '')) { refresh(); return; }
    }
  }).observe(document.body, { childList: true, subtree: true });
  if (document.body) watchToasts(); else document.addEventListener('DOMContentLoaded', watchToasts);
  // coming back to a tab left open for hours: numbers follow the clock and any moves made elsewhere
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  // the per-day cells are pinned to the header's pixel widths, so a resize needs a re-render
  window.addEventListener('resize', () => { const root = document.querySelector(SEL.rosterRoot); if (root) { removeOwn(root, 'perday'); schedule(); } });
  schedule();
}

// ---------------------------------------------------------------- exports / start-up

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INJURY_ICON_TYPES, GROUP_BY_SC, STATUS_BY_ID, dayString, periodDays, addDays, dayFromIndex, indexFromDay, seasonStart, periodForDay, dayLabel,
    parsePeriodList, parseGamesPerPos, parseStart, parseGameText, iconTag, parseScheduleRows, coveredDays, parseDayStatuses, parseDayLineup, applyDayStatuses,
    compute, formatStatus, isPending, weekView, shouldRender, isCurrent, parseRoute,
    api, apiMulti, loadTeam, cachedLoadTeam, clearCache };
}
if (typeof document !== 'undefined') { try { start(); } catch (e) { console.warn(LOG, 'start failed', e); } }
