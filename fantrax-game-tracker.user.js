// ==UserScript==
// @name         Fantrax Game Tracker
// @namespace    http://ftalburt.com/
// @version      1.4.4
// @description  Games played vs the games-played cap, plus a per-day week view of your lineup, on Fantrax matchup and roster pages, optionally counting from Fantrax's expected return dates; edit your own lineups from the Week panel
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
 * runs when a `document` exists. Read-only up to 1.3.x; since 1.4.0 its one write is the lineup save (saveDay), reached only
 * from the Week panel's Save button.
 * 1.2.0 adds, on the roster page, a "Week" panel (every lineup slot per period day with that day's game, the bench
 * players who play, open slots and injury tags) and recolours the Schedule - Week cells by each day's real lineup.
 * 1.3.0 adds an opt-in that counts flagged players from Fantrax's expected return date (getPlayerProfile, read-only),
 * with the players it moved listed under the tables.
 * 1.3.1 lists players in IR (or any off-lineup slot) who are expected back this period, with the players Fantrax says
 * could take their slot; nothing about them is counted.
 * 1.3.2 stops striking reserve days in the Schedule - Week grid (only active-but-out days are struck).
 * 1.3.3: a game in progress (Fantrax shows its score, not its time) is no longer counted as still to play; it is in Played.
 * 1.3.4: switching leagues inside one tab re-renders the roster page (its render key now carries the league).
 * 1.3.5: a game past its scheduled time stays in Sched until it starts. Started = Fantrax's own GP for the day (today's
 *        lineup call asks for that day's stats), the score cell as fallback — never the clock.
 * 1.3.8: leaving Schedule - Week for another roster view (Trends, Stats…) removes the per-day footer rows, which had
 *        stayed in Fantrax's reused table body and pushed every row off its header.
 * 1.4.0: first write: edit your own lineups from the Week panel (Columns or Grid, Fill, Save). Each legal day is sent through
 *        Fantrax's own confirmOrExecuteTeamRosterChanges (dry run, execute once, re-read); nothing is sent before Save.
 * 1.4.1: Grid starts (click, who sits?, start-all, Fill) seat earlier games in the slots later reserve players can't use, so
 *        the flex stays open for later games (Fantrax locks each player at his puck drop); the Grid's ⋯ menu is gone.
 * 1.4.2: the Week panel no longer inherits Fantrax's "Team Roster" tooltip; tooltips that repeat what is on screen are gone.
 * 1.4.3: the Grid's FP/G · GP also for players dropped earlier in the week (their season from the last day they were on the
 *        roster) and on other teams and finished weeks (read-only).
 * 1.4.4: an IR line names the slot his remaining games are in (played today in G, IR from tomorrow read "On ACTIVE"),
 *        and a player already in IR on the returning player's date is no longer offered as his free IR swap.
 */

// ---------------------------------------------------------------- logic: constants

// Fantrax icon typeIds seen on rosters (2026-09-24, all ten teams): 30 = injured/out ("Lower body - Out Indefinitely"),
// 2 = "Injured Reserve List - …", 6 = "Suspended", 1 = "… - Day-to-Day", 4 = "Minor Leagues"; 8/9/14 news, 20 keeper,
// 35 trade block. The first three mean "will not play"; day-to-day and minors players count as available (shown as a note).
const INJURY_ICON_TYPES = new Set(['30', '2', '6']);
const ICON_TAGS = [['2', 'IR', 'out'], ['30', 'OUT', 'out'], ['6', 'SUSP', 'out'], ['1', 'DTD', 'note'], ['4', 'MINORS', 'note']];   // worst first ('MIN' would read as Minnesota)
const FLAG_BY_ICON = { '2': 'ir', '30': 'out', '6': 'susp', '1': 'dtd' };   // 1.3.0: the injury flag a row carries (same order as ICON_TAGS)
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
// 1.3.0: Fantrax's injury report line ("Expected to return on Sat Sep 26 - <i>Out Indefinitely.</i>", no year) →
// "YYYY-MM-DD" or null. The year is whichever of last / this / next year puts the date nearest to today (a stale
// "Sep 29" read in January is last September, a "Feb 1" read in October is next February); a wrong pick counts
// nothing this period either way, it only changes the "passed" / "after this period" wording.
function parseReturnDate(injuryMsgs, today) {
  const first = Array.isArray(injuryMsgs) ? injuryMsgs[0] : null;
  if (typeof first !== 'string') return null;
  const m = /Expected to return on \w+ ([A-Z][a-z]{2}) (\d{1,2})/.exec(first.replace(/<[^>]*>/g, ''));
  if (!m || !(m[1] in MONTHS)) return null;
  const [ty, tm, td] = String(today).split('-').map(Number);
  const mo = MONTHS[m[1]], d = Number(m[2]), t = Date.UTC(ty, tm - 1, td);
  const year = [ty - 1, ty, ty + 1].reduce((best, y) => Math.abs(Date.UTC(y, mo - 1, d) - t) < Math.abs(Date.UTC(best, mo - 1, d) - t) ? y : best, ty);
  return ymd(year, mo, d);
}

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

// The injury flag of a scorer ("out" | "ir" | "susp" | "dtd"), worst first, or null.
function rowFlag(icons) {
  const list = icons || [];
  for (const [id] of ICON_TAGS) { if (FLAG_BY_ICON[id] && list.some(i => String(i.typeId) === id)) return FLAG_BY_ICON[id]; }
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
  // 1.4.0: top-level myTeamIds says whether this is the user's own team (null when the response carries none)
  return { teamId, teamName: team ? team.name : '', period: Number(sel.displayedScoringPeriod) || 0, played, max, ownTeam: Array.isArray(data.myTeamIds) ? isOwnTeam(data) : null,
    periods: parsePeriodList(data.displayedLists && data.displayedLists.scoringPeriodList) };
}

// Once a game starts Fantrax shows the score instead of the time ("FLA 0<br/>@CAR 0", verified 2026-09-29) and
// already counts it in Played. The score, not the clock, says a game has started: a late puck drop keeps the time
// shown and stays out of Played (NYI@TOR 2026-09-30, still "Wed 6:30PM" at 6:38 pm). The player's GP for the day
// (applyDayStatuses) is the main signal; the score cell is the fallback.
function isStartedCell(content) { return /^\s*[A-Z]{2,3}\s+\d+\s*<br\s*\/?>\s*@[A-Z]{2,3}\s+\d+/i.test(content || ''); }
// "Tue 4:00PM" inside "@CAR<br/>Tue 4:00PM" → local Date on `day`; null when there is no clock time; midnight of
// `day` for a started (score) cell, so it sorts first.
function parseStart(content, day) {
  const [y, mo, d] = day.split('-').map(Number);
  if (isStartedCell(content)) return new Date(y, mo - 1, d);
  const m = /(\d{1,2}):(\d{2})\s*([AP]M)/i.exec(content || '');
  if (!m) return null;
  let h = Number(m[1]) % 12; if (m[3].toUpperCase() === 'PM') h += 12;
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
        if (cell && cell.eventId) games.push(Object.assign({ day: c.day, start: parseStart(cell.content, c.day), started: isStartedCell(cell.content) }, parseGameText(cell.content)));
      }
      out[group].push({ id: row.scorer.scorerId || '', name: row.scorer.name || row.scorer.shortName || '', shortName: row.scorer.shortName || row.scorer.name || '', pos: row.scorer.posShortNames || '',
        injured: (row.scorer.icons || []).some(i => INJURY_ICON_TYPES.has(String(i.typeId))), tag: iconTag(row.scorer.icons), flag: rowFlag(row.scorer.icons),
        returnDate: null, returnText: null, games });
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
// 1.3.1: also statusNames {statusId: name} from each table's statusTotals, detail {scorerId: {statusId, eligible}} where
// eligible = the row's eligibleStatusIds (Fantrax's own per-player answer under the league's rules; [] when absent),
// and eligible on every slot.
// 1.3.5: gp {scorerId: n} from the GP column — that day's games when the call was made BY_DATE for the day (see
// rosterMsg); {} when the response has no GP column.
// 1.4.0 (lineup editing; real shapes from the 2026-10-05 spike): detail also keeps the row's own posId, eligiblePosIds (the slot
// posIds he may take, flex included), posIds / posIdsNoFlex / defaultPosId, secondary and disabled (scorer.disableLineupChange);
// misc = top-level miscData: {applyToFuturePeriods: boolean|null, illegalText: string|null, statusTotals (raw, null when absent)}.
function parseDayLineup(data) {
  const names = Object.assign({}, POS_FALLBACK), slots = [], statuses = {}, statusNames = {}, detail = {}, gp = {};
  const tables = data.tables || [];
  for (const table of tables) {
    const i = ((table.header && table.header.cells) || []).findIndex(c => c && (c.shortName || c.name) === 'GP');
    if (i < 0) continue;
    for (const row of table.rows || []) {
      const sc = row.scorer, n = Number(row.cells && row.cells[i] && row.cells[i].content);
      if (sc && sc.scorerId && Number.isFinite(n)) gp[sc.scorerId] = n;
    }
  }
  for (const table of tables) for (const st of table.statusTotals || []) if (st && st.id !== undefined && st.name) statusNames[String(st.id)] = String(st.name);
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
      const eligible = Array.isArray(row.eligibleStatusIds) ? row.eligibleStatusIds.map(String) : [];
      if (sc && sc.scorerId) {
        statuses[sc.scorerId] = status;
        const ids = a => Array.isArray(a) ? a.map(String) : [];
        detail[sc.scorerId] = { statusId: String(row.statusId), eligible, posId: String(row.posId), eligiblePosIds: ids(row.eligiblePosIds), posIds: ids(sc.posIds), posIdsNoFlex: ids(sc.posIdsNoFlex),
          defaultPosId: sc.defaultPosId === undefined || sc.defaultPosId === null ? null : String(sc.defaultPosId), secondary: row.secondary === true, disabled: sc.disableLineupChange === true };
      }
      slots.push({ posId: String(row.posId), pos: names[row.posId] || String(row.posId), status, id: sc && sc.scorerId ? sc.scorerId : null,
        name: sc ? (sc.name || sc.shortName || '') : '', shortName: sc ? (sc.shortName || sc.name || '') : '', group, eligible });
    }
  }
  const mm = data.miscData || {};
  const misc = { applyToFuturePeriods: typeof mm.applyToFuturePeriods === 'boolean' ? mm.applyToFuturePeriods : null, illegalText: mm.illegalRosterMsgsText ? String(mm.illegalRosterMsgsText) : null, statusTotals: Array.isArray(mm.statusTotals) ? mm.statusTotals : null };
  return { slots, statuses, statusNames, detail, gp, misc };
}
// 1.3.1: the label of a roster status and its short form for tags / line prefixes ("Inj Res" → "IR", "Minors" → "MINORS").
function statusLabel(statusNames, statusId) { return (statusNames && statusNames[String(statusId)]) || 'off-lineup'; }
function statusShort(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  return words.length >= 2 ? words.map(w => w[0]).join('').toUpperCase() : (words[0] || '').toUpperCase();
}
// statusByDay: {day: {scorerId: status}}. A game takes its day's lineup status; a day with no lineup fetched (a past
// day — already inside Played) or a player absent from that day's roster counts as ir, i.e. not at all.
// detailByDay (1.3.1, optional): {day: {scorerId: {statusId, eligible}}} — each game also gets its raw statusId (null when
// unknown) and the row gets `eligible` from the latest day that lists him ([] if none).
// gpByDay (1.3.5, optional): {day: {scorerId: games that day}} — GP ≥ 1 marks the game started. It is the number
// Fantrax's Played is summed from (the two matched exactly on 2026-09-30), so a game leaves Sched as it enters Played.
function applyDayStatuses(rows, statusByDay, detailByDay, gpByDay) {
  return rows.map(row => {
    const games = row.games.map(g => {
      const day = statusByDay[g.day], out = Object.assign({}, g, { status: (day && day[row.id]) || 'ir' });
      const gp = gpByDay && gpByDay[g.day] && gpByDay[g.day][row.id];
      if (gp >= 1) out.started = true;
      if (typeof gp === 'number') out.gp = gp;   // 1.3.6: that day's games for him, as Fantrax counts them into Played
      if (detailByDay) { const d = detailByDay[g.day] && detailByDay[g.day][row.id]; out.statusId = d ? d.statusId : null; }
      return out;
    });
    if (!detailByDay) return Object.assign({}, row, { games });
    let eligible = [];
    const statusIds = {};   // 1.3.1: the slot status of every day that lists him — "current slot" for the swap hint
    for (const day of Object.keys(detailByDay).sort()) { const d = detailByDay[day][row.id]; if (d) { eligible = d.eligible; statusIds[day] = d.statusId; } }
    return Object.assign({}, row, { games, eligible, statusIds });
  });
}

// ---------------------------------------------------------------- logic: compute

// A game is pending (still to be played) when its day is after today, or today and its cell does not show a score yet
// (`started`: the day's GP, else the score cell) — whatever the clock says, since Fantrax's Played moves only at puck drop.
function isPending(game, today) {
  if (game.day > today) return true;
  if (game.day < today) return false;
  return !game.started;
}

// 1.3.0: a row's expected return date, or null when it has none or it has already passed (a stale placeholder while
// the flag is still on: the flag is the reliable part). A date equal to today counts from today.
function effectiveReturnDate(row, today) { return row.returnDate && row.returnDate >= today ? row.returnDate : null; }
// Does this game count (lineup status aside)? Off: healthy rows only, as in 1.2.1. On: a flagged row with a date counts
// from that date (Out / IR / Suspended gain their later games, Day-to-day loses the earlier ones); no date → as off.
function countsGame(row, game, today, opts) {
  if (!opts || !opts.returnDates) return !row.injured;
  const date = effectiveReturnDate(row, today);
  return date ? game.day >= date : !row.injured;
}

// 1.3.6: an active game under way or played, when that day's GP is known, counted iff he got a GP (what Played counts),
// whatever his flag is today: a player hurt since kept the games he played, a scratched one (GP 0) got none. Otherwise
// the flag / return-date rule. → {counted, by: 'gp' | 'date' | 'flag'}; used by the week panel and the grid cells alike.
function activeGame(row, game, today, opts) {
  if (typeof game.gp === 'number' && !isPending(game, today)) return { counted: game.gp >= 1, by: 'gp' };
  const counted = countsGame(row, game, today, opts);
  return { counted, by: counted && opts && opts.returnDates && effectiveReturnDate(row, today) ? 'date' : 'flag' };
}

function compute(group, period, now, opts = {}) {
  const today = dayString(now);
  const active = {}, pending = {};
  for (const day of period.days) { active[day] = 0; pending[day] = 0; }
  let scheduled = 0, bench = 0;
  for (const row of group.rows) {
    for (const g of row.games) {
      if (!(g.day in active) || !countsGame(row, g, today, opts)) continue;
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

// 1.3.0: what the return-date option does to each flagged row with a pending game in the period.
// Effect = {id, name, flag, date, delta, bench, reason}: delta = pending games counted with the option on minus off
// (active and reserve days; ir never), bench = every counted game falls on a reserve day, reason only when delta is 0.
const FLAG_WORD = { out: 'Out', ir: 'IR', susp: 'Suspended', dtd: 'DTD' };
function shortDate(day) { const [, m, d] = day.split('-').map(Number); return m + '/' + d; }
function explainGroup(group, period, now) {
  const today = dayString(now), days = new Set(period.days), out = [];
  for (const row of group.rows) {
    if (!row.flag) continue;
    const games = row.games.filter(g => days.has(g.day) && (g.status === 'active' || g.status === 'reserve') && isPending(g, today, now));
    if (!games.length) continue;
    const on = games.filter(g => countsGame(row, g, today, { returnDates: true })), off = games.filter(g => countsGame(row, g, today, {}));
    const delta = on.length - off.length, date = row.returnDate, eff = effectiveReturnDate(row, today);
    const changed = delta > 0 ? on.filter(g => !off.includes(g)) : off.filter(g => !on.includes(g));   // the games the option moved
    let reason = null;
    if (delta === 0) {
      if (!date) reason = row.flag === 'susp' ? 'suspended, no date' : FLAG_WORD[row.flag] + ', no date';
      else if (date < today) reason = shortDate(date) + ' passed, still ' + FLAG_WORD[row.flag];
      else if (date > period.end) reason = shortDate(date) + ', after this period';
      else if (row.flag === 'dtd' && date === today) reason = 'DTD, back today';
      else if (row.flag !== 'dtd') reason = shortDate(date) + ', no game from then';
      else reason = 'no game before the date';
    }
    out.push({ id: row.id, name: row.shortName || row.name, flag: row.flag, date: eff, delta, bench: changed.length > 0 && changed.every(g => g.status === 'reserve'), reason });
  }
  return out;
}
function explainTeam(team, now) {
  const all = explainGroup(team.groups.skaters, team.period, now).concat(explainGroup(team.groups.goalies, team.period, now).map(e => Object.assign(e, { goalie: true })));
  return { gained: all.filter(e => e.delta > 0), lost: all.filter(e => e.delta < 0), none: all.filter(e => e.delta === 0) };
}
function formatEffect(e) {
  if (e.delta === 0) return e.name + ' ' + e.reason;
  return e.name + ' ' + dayLabel(e.date) + ' ' + (e.delta > 0 ? '+' + e.delta : '\u2212' + (-e.delta)) + (e.goalie ? ' (G)' : '') + (e.bench ? ' (bench)' : '');
}

// 1.3.1: players sitting in off-lineup slots (IR, or any status that is neither Active nor Reserve) for every pending
// game they have this period. Nothing about them is counted; this is visibility only.
// Entry = {kind: "cleared" | "back", id, name, statusId, statusName, short, date, games, swapCandidates?, goalie?}.
//   cleared — Fantrax no longer allows him in that slot (his eligibleStatusIds lack its status; with no eligibility
//             data, the injury flag being gone stands in): games = all pending games; the roster is illegal until he moves.
//   back    — flagged, with an effective return date on or before the period's end (so only with the option on): games
//             = pending games from that date; swapCandidates = players in an Active or Reserve slot on his date, whom
//             Fantrax says may enter that status, and who have no counted pending game — they can take the spot for free.
// A player's slot on a day = the latest lineup day on or before it that lists him, else the earliest that does. The entry's
// slot is the one on his first pending game's day, and a candidate's is the one on the returning player's date: today's slot
// misleads once today's game has started (2026-10-21: in G today, IR from tomorrow read "On ACTIVE" and was offered as an IR swap).
function slotOn(row, day) {
  const days = Object.keys(row.statusIds || {}).sort();
  if (!days.length) return null;
  const past = days.filter(d => d <= day);
  return row.statusIds[past.length ? past[past.length - 1] : days[0]];
}
function offLineup(team, now, opts = {}) {
  const today = dayString(now), period = team.period, days = new Set(period.days), names = team.statusNames || {};
  const all = [].concat(team.groups.skaters.rows.map(r => [r, false]), team.groups.goalies.rows.map(r => [r, true]));
  const pendingIn = row => row.games.filter(g => days.has(g.day) && isPending(g, today, now));
  const inLineup = g => g.status === 'active' || g.status === 'reserve';
  const counted = row => pendingIn(row).some(g => inLineup(g) && countsGame(row, g, today, opts));
  const out = [];
  for (const [row, goalie] of all) {
    const pending = pendingIn(row);
    if (!pending.length || pending.some(inLineup)) continue;
    const statusId = slotOn(row, pending[0].day) || pending[pending.length - 1].statusId || null;
    const statusName = statusLabel(names, statusId), short = statusShort(statusName);
    const base = { id: row.id, name: row.shortName || row.name, statusId, statusName, short };
    if (goalie) base.goalie = true;
    const eligible = row.eligible || [];
    const cleared = eligible.length ? !eligible.includes(String(statusId)) : (row.flag === null || row.flag === undefined);
    if (cleared) { out.push(Object.assign(base, { kind: 'cleared', date: null, games: pending.length })); continue; }
    const date = opts.returnDates ? effectiveReturnDate(row, today) : null;
    if (!date || date > period.end) continue;
    const games = pending.filter(g => g.day >= date).length;
    if (!games) continue;
    const swapCandidates = all.map(([r]) => r).filter(r => r !== row && ['1', '2'].includes(slotOn(r, date)) && (r.eligible || []).includes(String(statusId)) && !counted(r))
      .map(r => ({ id: r.id, name: r.shortName || r.name, flagWord: FLAG_WORD[r.flag] || 'no flag' }));
    out.push(Object.assign(base, { kind: 'back', date, games, swapCandidates }));
  }
  return out;
}
// `all` (every entry of the strip, optional): a candidate offered on another line too says so, since he can take only one spot.
function formatOffLineup(e, all) {
  const n = e.games + (e.games === 1 ? ' game' : ' games') + (e.goalie ? ' (G)' : '');
  if (e.kind === 'cleared') return 'On ' + e.short + ', no longer ' + e.short + '-eligible: ' + e.name + ', ' + n + ' this period, not counted \u2014 Fantrax no longer allows him there; the roster is illegal until he moves';
  const also = c => (Array.isArray(all) ? all : []).filter(o => o !== e && o.kind !== 'cleared' && o.swapCandidates.some(x => x.id === c.id)).map(o => o.name);
  const swap = e.swapCandidates.length
    ? 'free ' + e.short + ' swap: ' + e.swapCandidates.map(c => { const o = also(c); return c.name + ' (' + c.flagWord + (o.length ? '; also the swap for ' + o.join(', ') + ', one spot only' : '') + ')'; }).join(', ') + ' could take his spot'
    : 'no ' + e.short + '-eligible player to swap: activating him needs a drop';
  return 'On ' + e.short + ', back this period: ' + e.name + ' ' + dayLabel(e.date) + ', ' + n + ', not counted \u00b7 ' + swap;
}

// 1.3.1: the panel's off-lineup sections for one day — one per status, in order of first appearance, titled
// "<status>, could play" when any of its entries is cleared, else "<status>, expected back".
function offSections(off) {
  const out = [];
  for (const o of off || []) {
    let sec = out.find(x => x.statusName === o.statusName);
    if (!sec) { sec = { statusName: o.statusName, entries: [] }; out.push(sec); }
    sec.entries.push(o);
  }
  return out.map(sec => ({ title: sec.statusName + (sec.entries.some(o => o.kind === 'cleared') ? ', could play' : ', expected back'), entries: sec.entries }));
}

// The week panel's model: for each period day, the active slots in lineup order (kind game / idle / open / out), the
// goalie slots apart, the reserve players who have a game that day (bench), and counts. A day whose lineup was not
// loaded has slots === null. `games` counts the period's active games per group: by that day's GP once a game is under
// way or played (1.3.6, so it adds up to Played + Sched), else by healthy players / return dates.
function weekView(team, now, opts = {}) {
  const today = dayString(now);
  const rowById = {};
  for (const g of ['skaters', 'goalies']) for (const r of team.groups[g].rows) rowById[r.id] = r;
  const games = { skaters: 0, goalies: 0 };
  // 1.3.0: kind of a row's game that day — game / out / ret (counted because of its expected return date)
  // 1.3.6: an active slot's game goes through activeGame (by that day's GP once under way); a bench game by the flag
  const gameKind = (row, game, active) => {
    if (active) { const a = activeGame(row, game, today, opts); return !a.counted ? 'out' : a.by === 'date' ? 'ret' : 'game'; }
    return !countsGame(row, { day }, today, opts) ? 'out' : (opts.returnDates && effectiveReturnDate(row, today)) ? 'ret' : 'game';
  };
  // 1.3.1: off-lineup entries (IR etc.) by row id; listed per day from their date (back) or every day (cleared), never counted
  const offById = {};
  for (const e of offLineup(team, now, opts)) offById[e.id] = e;
  const offFor = d => Object.keys(offById).map(id => {
    const e = offById[id], row = rowById[id], game = row && row.games.find(g => g.day === d && g.statusId && g.status !== 'active' && g.status !== 'reserve');
    if (!game || !isPending(game, today, now) || (e.kind === 'back' && d < e.date)) return null;   // pending days only, like the strip line's count
    return { pos: (row.pos || '').split(',')[0].trim(), id, name: row.name, shortName: row.shortName || row.name, opp: game.opp, time: game.time, start: game.start, tag: row.tag, returnText: row.returnText || null, statusName: e.statusName, short: e.short, kind: e.kind, date: e.date };
  }).filter(Boolean).sort((a, b) => (a.start && b.start ? a.start - b.start : a.start ? -1 : b.start ? 1 : 0) || a.name.localeCompare(b.name));
  let day = null;
  const days = team.period.days.map(d => {
    day = d;
    const lineup = team.lineups && team.lineups[day];
    const state = day < today ? 'past' : day === today ? 'today' : 'future';
    if (!lineup) return { day, label: dayLabel(day), state, slots: null, goalies: null, bench: [], off: [], counts: { playing: 0, idle: 0, open: 0, out: 0, ret: 0 } };
    const slots = [], goalies = [], bench = [], counts = { playing: 0, idle: 0, open: 0, out: 0, ret: 0 };
    for (const s of lineup.slots) {
      const row = s.id ? rowById[s.id] : null;
      const game = row ? row.games.find(g => g.day === day) : null;
      const base = { pos: s.pos, id: s.id, name: s.name, shortName: s.shortName || s.name, group: s.group, opp: game ? game.opp : '', time: game ? game.time : '', start: game ? game.start : null, tag: row ? row.tag : null, returnText: row ? row.returnText || null : null };
      if (s.status === 'active') {
        let kind;
        if (!s.id) kind = 'open'; else if (!game) kind = 'idle'; else kind = gameKind(row, game, true);
        if (s.group !== 'goalies') { counts[kind === 'game' ? 'playing' : kind]++; if (kind === 'ret') counts.playing++; }   // the header counts skater slots; goalies are listed apart
        if (kind === 'game' || kind === 'ret') games[s.group]++;
        (s.group === 'goalies' ? goalies : slots).push(Object.assign(base, { kind }));
      } else if (s.status === 'reserve' && game) {
        const kind = gameKind(row, game, false);
        // a flagged reserve player is listed only when a return date is in play (struck before it, counted from it)
        if (kind !== 'out' || (opts.returnDates && effectiveReturnDate(row, today))) bench.push(Object.assign(base, { kind }));
      }
    }
    bench.sort((a, b) => (a.start && b.start ? a.start - b.start : a.start ? -1 : b.start ? 1 : 0) || a.name.localeCompare(b.name));
    return { day, label: dayLabel(day), state, slots, goalies, bench, off: offFor(day), counts };
  });
  return { days, games };
}

// ---------------------------------------------------------------- logic: lineup editing (1.4.0)

// The edit model every editing feature builds on (design: docs/superpowers/specs/2026-10-05-week-panel-lineup-editing-design.md).
// A Lineup is {s: (id|null)[] parallel to M.days[di].slots, ir: id[]}; a player on the roster that day who is in neither is on
// reserve, unless he is FIXED (a status other than Active / Reserve / IR, or a secondary row; scorer.disableLineupChange is Fantrax's LOCK flag for a started game, see `locked`):
// fixed players are never moved and are sent unchanged. A fixed player already in an active slot stays in `s` (the slot is taken).
// extras = {fpg: {id: {gp, fpg}} (this season), limits: {total, ir, irCountsTowardTotal}, ownTeam, daily, applyToFuture} | null.
function buildEditModel(team, extras, now, opts) {
  const today = dayString(now), ex = extras || null;
  const rowById = {}, order = [], group = {};
  for (const g of ['skaters', 'goalies']) for (const r of team.groups[g].rows) if (!(r.id in rowById)) { rowById[r.id] = r; order.push(r.id); group[r.id] = g; }
  const days = team.period.days.map(day => {
    const lineup = team.lineups && team.lineups[day];
    const state = day < today ? 'past' : day === today ? 'today' : 'future';
    const d = { day, n: team.seasonStartDay ? indexFromDay(team.seasonStartDay, day) : null, label: dayLabel(day), state, slots: null, base: { s: [], ir: [] }, fixed: {}, rows: {}, illegalText: null };
    if (!lineup) return d;
    d.slots = []; d.illegalText = lineup.misc ? lineup.misc.illegalText : null;
    for (const s of lineup.slots) {
      const det = s.id ? lineup.detail[s.id] : null, stId = det ? det.statusId : s.status === 'active' ? '1' : s.status === 'reserve' ? '2' : '3';
      if (det) {
        d.rows[s.id] = { posId: det.posId, stId, eligible: det.eligible, eligiblePosIds: det.eligiblePosIds, secondary: det.secondary, disabled: det.disabled };
        if (!(s.id in rowById)) { rowById[s.id] = null; order.push(s.id); group[s.id] = s.group; }
        if (det.secondary || !['1', '2', '3'].includes(stId)) d.fixed[s.id] = { posId: det.posId, stId };
      }
      if (stId === '1') { d.slots.push({ posId: s.posId, pos: s.pos, group: s.group }); d.base.s.push(s.id); }
      else if (stId === '3' && s.id && !d.fixed[s.id]) d.base.ir.push(s.id);
    }
    return d;
  });
  const players = {};
  for (const id of order) {
    let det = null, slot = null;
    for (let i = days.length - 1; i >= 0 && !det; i--) { const l = team.lineups && team.lineups[days[i].day]; if (l && l.detail[id]) { det = l.detail[id]; slot = l.slots.find(s => s.id === id); } }
    const row = rowById[id], f = ex && ex.fpg && ex.fpg[id];
    players[id] = { id, name: row ? row.name : slot ? slot.name : '', shortName: row ? row.shortName : slot ? slot.shortName : '', group: group[id], posIds: det ? det.posIds : [], defaultPosId: det ? det.defaultPosId : null,
      fpg: f && f.fpg !== undefined ? f.fpg : null, gp: f && f.gp !== undefined ? f.gp : null, row };
  }
  const notEditable = !ex ? 'Lineup data for editing is not available' : !ex.ownTeam ? 'Lineups can only be edited on your own team' : !ex.daily ? 'Lineups can only be edited in leagues with daily lineups' : null;
  return { days, players, order, limits: ex && ex.limits ? ex.limits : { total: null, ir: null, irCountsTowardTotal: false }, max: { skaters: team.groups.skaters.max, goalies: team.groups.goalies.max }, today, opts: opts || {},
    editable: notEditable === null, notEditable, applyToFuture: !!(ex && ex.applyToFuture) };
}
const cloneLineup = L => ({ s: L.s.slice(), ir: L.ir.slice() });
function onRoster(M, di, id) { return id in M.days[di].rows; }
// Fantrax's own per-player answer for that day (eligiblePosIds incl. the flex slot), else the player's posIds.
function fits(M, di, id, posId) {
  const row = M.days[di].rows[id], p = M.players[id];
  const ids = row && row.eligiblePosIds.length ? row.eligiblePosIds : p ? p.posIds : [];
  return ids.includes(String(posId));
}
function irEligible(M, di, id) { const row = M.days[di].rows[id]; return !!row && row.eligible.includes('3'); }
// Known to be no longer IR-eligible: Fantrax sent his eligible statuses that day and IR is not among them. No data ([]) = unknown,
// as 1.3.1's cleared rule: the !IR marker and the IR banner show only on this (moves still need irEligible).
function irIneligibleKnown(M, di, id) { const row = M.days[di].rows[id]; return !!row && row.eligible.length > 0 && !row.eligible.includes('3'); }
function gameOn(M, di, id) { const p = M.players[id], g = p && p.row && p.row.games.find(x => x.day === M.days[di].day); return g && (g.start !== null || g.started) ? g : null; }
function hasGame(M, di, id) { return !!gameOn(M, di, id); }
function locked(M, di, id) {
  const d = M.days[di];
  if (d.state === 'past') return true;
  if (d.rows[id] && d.rows[id].disabled) return true;   // Fantrax's own lock flag (live 2026-10-05: set on exactly today's started games)
  const g = d.state === 'today' ? gameOn(M, di, id) : null;
  return !!g && !isPending(g, M.today);
}
// Fantrax has locked the whole day: a played day, or every rostered player flagged (live 2026-10-05 19:40: once every game of the
// day is under way Fantrax flags the whole roster, players with no game included; tomorrow nobody).
function dayLocked(M, di) {
  const d = M.days[di];
  if (d.state === 'past') return true;
  const ids = Object.keys(d.rows);
  return d.slots !== null && ids.length > 0 && ids.every(id => d.rows[id].secondary || locked(M, di, id));
}
// "game started" only when his game really has (it is no longer pending); a player Fantrax flagged without one gets Fantrax's lock.
function lockWhy(M, di, id) {
  const d = M.days[di];
  if (d.state === 'past') return d.label + ' is already played';
  const g = gameOn(M, di, id);
  if (g && !isPending(g, M.today)) return M.players[id].name + "'s game started" + (/^\d{1,2}:\d{2}[AP]M$/.test(g.time) ? ' at ' + g.time.replace(/([AP]M)/, ' $1') : '');
  if (dayLocked(M, di)) return 'Fantrax has locked ' + d.label + (d.state === 'today' ? ': every game has started' : '');
  return 'Fantrax has locked ' + M.players[id].name + ' for ' + d.label;
}
function counted(M, di, id) { const g = gameOn(M, di, id); return !!g && activeGame(M.players[id].row, g, M.today, M.opts).counted; }
function isGoalie(M, id) { return M.players[id].group === 'goalies'; }
// → slot posId | 'R' reserve | 'IR' | 'fixed' | null (not on the roster that day)
function where(M, di, L, id) {
  const d = M.days[di];
  if (!(id in d.rows)) return null;
  if (id in d.fixed) return 'fixed';
  const i = L.s.indexOf(id);
  return i >= 0 ? d.slots[i].posId : L.ir.includes(id) ? 'IR' : 'R';
}
function bench(M, di, L) { return M.order.filter(id => where(M, di, L, id) === 'R'); }
// What Fantrax is sent for one day: {scorerId: {posId, stId}} for every non-secondary row. Slot numbers do not exist in it.
// An off-lineup player keeps his base row's posId if he was already off the lineup in base, else his default posId (spike 2026-10-05).
function fieldMapOf(M, di, L) {
  const d = M.days[di], fm = {};
  for (const id of M.order) {
    const row = d.rows[id];
    if (!row || row.secondary) continue;
    const w = where(M, di, L, id);
    if (w === 'fixed') fm[id] = { posId: row.posId, stId: row.stId };
    else if (w === 'R' || w === 'IR') fm[id] = { posId: row.stId !== '1' || !M.players[id].defaultPosId ? row.posId : M.players[id].defaultPosId, stId: w === 'R' ? '2' : '3' };
    else fm[id] = { posId: w, stId: '1' };
  }
  return fm;
}
// One player's entry: same status, and the same slot when active. Off the lineup (reserve '2', IR '3') the posId is not compared:
// Fantrax stores its own posId there (live 2026-10-05: 207 kept for reserve rows sent as 206 / 203 / 204), though we still send ours.
const sameEntry = (a, b) => !!a && !!b && a.stId === b.stId && (a.stId === '2' || a.stId === '3' || a.posId === b.posId);
function sameFieldMap(a, b) {
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every(k => sameEntry(a[k], b[k]));
}
// R4: the field map Fantrax holds for a day, straight from a parsed day response (parseDayLineup): every non-secondary row. For the
// same response it equals fieldMapOf(M, di, base) — it is how a save is checked against the re-read.
function fieldMapFromLineup(parsed) {
  const fm = {};
  for (const [id, d] of Object.entries((parsed && parsed.detail) || {})) if (!d.secondary) fm[id] = { posId: d.posId, stId: d.statusId };
  return fm;
}
// A field map back to a Lineup: actives into free slots with exactly their posId (in roster order); fixed players keep their base slot.
function lineupFromFieldMap(M, di, fm) {
  const d = M.days[di], L = { s: d.base.s.map(id => (id && id in d.fixed ? id : null)), ir: [] }, unplaced = [];
  for (const id of M.order) {
    if (!fm[id] || id in d.fixed) continue;
    if (fm[id].stId === '3') L.ir.push(id);
    else if (fm[id].stId === '1') { const i = d.slots.findIndex((s, k) => L.s[k] === null && s.posId === fm[id].posId); if (i >= 0) L.s[i] = id; else unplaced.push(id); }
  }
  return { L, unplaced };
}
// What saving would change, in Fantrax's words: "Reserve to Active (C)", "Active to IR", "LW to Skt". from / to are `where` values.
function changes(M, di, L) {
  const d = M.days[di], out = [], name = w => w === 'R' ? 'Reserve' : w === 'IR' ? 'IR' : 'Active', slotName = w => (d.slots.find(s => s.posId === w) || {}).pos || POS_FALLBACK[w] || w;
  for (const id of M.order) {
    const from = where(M, di, d.base, id), to = where(M, di, L, id);
    if (from === null || from === to || from === 'fixed') continue;
    const act = x => x !== 'R' && x !== 'IR';
    out.push({ id, from, to, text: act(from) && act(to) ? slotName(from) + ' to ' + slotName(to) : name(from) + ' to ' + name(to) + (act(to) ? ' (' + slotName(to) + ')' : '') });
  }
  return out;
}

// Seat `id` into the day's slots (array `s`, parallel to M.days[di].slots): an open slot he fits, else shift an unlocked occupant who can
// move elsewhere (augmenting path, mock.js:122). Nobody is benched; locked and fixed occupants never move. → the new `s`, or null.
function seat(M, di, s, id) {
  const d = M.days[di], a = s.slice(), seen = new Set();
  function aug(pid) {
    for (let i = 0; i < a.length; i++) if (!seen.has(i) && a[i] === null && fits(M, di, pid, d.slots[i].posId)) { seen.add(i); a[i] = pid; return true; }
    for (let i = 0; i < a.length; i++) {
      if (seen.has(i) || !fits(M, di, pid, d.slots[i].posId)) continue;
      seen.add(i);
      const q = a[i];
      if (q === null || q in d.fixed || locked(M, di, q)) continue;
      a[i] = pid;
      if (aug(q)) return true;
      a[i] = q;
    }
    return false;
  }
  return aug(id) ? a : null;
}
const withoutId = (s, id) => s.map(x => x === id ? null : x);
// Lock-aware seating (2026-10-18, user): Fantrax locks each player at his own puck drop and a locked player keeps his slot, so the
// unlocked starters are re-seated earliest game first, each into the slot the fewest later reserve players (a counted game after his)
// could use; ties keep his slot. The flex goes to the latest games. Same starters, so no points change; locked and fixed never move.
const lockAt = (M, di, id) => { const g = gameOn(M, di, id); return g && g.start ? g.start.getTime() : Infinity; };
// Every id gets a slot of his own among `slots` (slot indexes). Slots of one type are interchangeable, so it matches players to
// types with room (augmenting paths over a handful of types, not every slot).
function matchable(M, di, ids, slots) {
  const room = {}, owners = {};
  for (const i of slots) { const t = M.days[di].slots[i].posId; room[t] = (room[t] || 0) + 1; owners[t] = []; }
  const types = Object.keys(room);
  const aug = (id, seen) => {
    for (const t of types) {
      if (seen.has(t) || !fits(M, di, id, t)) continue;
      seen.add(t);
      if (owners[t].length < room[t]) { owners[t].push(id); return true; }
      for (let k = 0; k < owners[t].length; k++) if (aug(owners[t][k], seen)) { owners[t][k] = id; return true; }
    }
    return false;
  };
  return ids.every(id => aug(id, new Set()));
}
function arrange(M, di, L) {
  const d = M.days[di], ord = {}, s = L.s.slice();
  M.order.forEach((id, i) => { ord[id] = i; });
  let open = L.s.map((q, i) => i).filter(i => L.s[i] === null || !(L.s[i] in d.fixed || locked(M, di, L.s[i])));
  const free = open.slice();
  const U = open.map(i => L.s[i]).filter(Boolean).sort((a, b) => lockAt(M, di, a) - lockAt(M, di, b) || ord[a] - ord[b]);
  const later = bench(M, di, L).filter(id => counted(M, di, id) && !locked(M, di, id)).map(id => ({ id, t: lockAt(M, di, id) }));
  if (!later.length) return s;   // nobody could come in later: every slot ties, so everyone keeps his own
  const memo = {}, demand = (i, t) => { const k = d.slots[i].posId + '|' + t; return memo[k] ?? (memo[k] = later.filter(r => r.t > t && fits(M, di, r.id, d.slots[i].posId)).length); };
  open.forEach(i => { s[i] = null; });
  const placed = new Set(), homeOfRest = j => L.s[j] !== null && !placed.has(L.s[j]);
  let lost = 0;   // players still to seat whose own slot an earlier one took (none: everyone left can sit where he was)
  for (let k = 0; k < U.length; k++) {
    const p = U[k], t = lockAt(M, di, p), cur = L.s.indexOf(p), rest = U.slice(k + 1), seen = new Set();
    if (s[cur] !== null) lost--;
    placed.add(p);
    // one slot per type (his own first, then one nobody left needs back), least wanted first; the first that still seats everyone
    // after him (a legal L always has one; a starter in a slot he does not fit gets none, and the lineup stays as it was)
    const i = open.filter(j => fits(M, di, p, d.slots[j].posId)).sort((a, b) => (b === cur) - (a === cur) || homeOfRest(a) - homeOfRest(b) || a - b)
      .filter(j => !seen.has(d.slots[j].posId) && seen.add(d.slots[j].posId)).sort((a, b) => demand(a, t) - demand(b, t))
      .find(j => (!lost && !homeOfRest(j)) || matchable(M, di, rest, open.filter(x => x !== j)));
    if (i === undefined) return L.s.slice();
    if (homeOfRest(i)) lost++;
    s[i] = p; open = open.filter(x => x !== i);
  }
  // Slots of one type are interchangeable: whoever already held one of them keeps his own, so nobody rotates for nothing.
  for (const posId of new Set(free.map(i => d.slots[i].posId))) {
    const idx = free.filter(i => d.slots[i].posId === posId), who = idx.map(i => s[i]).filter(Boolean);
    const stay = who.filter(p => idx.includes(L.s.indexOf(p))), rest = idx.filter(i => !stay.some(p => L.s.indexOf(p) === i));
    idx.forEach(i => { s[i] = null; });
    stay.forEach(p => { s[L.s.indexOf(p)] = p; });
    who.filter(p => !stay.includes(p)).forEach((p, k) => { s[rest[k]] = p; });
  }
  return s;
}
// For each unlocked, non-fixed occupant of the same group: the seating with him removed (he goes to reserve).
function swapsFor(M, di, L, id) {
  const out = [], d = M.days[di];
  for (const q of L.s) {
    if (!q || q in d.fixed || locked(M, di, q) || isGoalie(M, q) !== isGoalie(M, id)) continue;
    const s = seat(M, di, withoutId(L.s, q), id);
    if (s) out.push({ out: q, s });
  }
  return out;
}
// Players on the roster that day outside IR (IR too when the league counts it toward the total). Fixed players are on the roster.
function rosterCount(M, di, L) {
  return M.order.filter(id => onRoster(M, di, id) && (M.limits.irCountsTowardTotal || !L.ir.includes(id))).length;
}
// A move that takes the roster over the limit is paired with the cheapest IR-eligible player going into IR, or refused (needs a drop).
// `before` = the lineup the move started from (default: the day's base): pairs only when the count rises above both the total and `before`'s.
function fitRoster(M, di, L, moved, before = M.days[di].base) {
  const total = M.limits.total;
  if (total === null || total === undefined) return { L };
  const after = rosterCount(M, di, L);
  if (after <= total || after <= rosterCount(M, di, before)) return { L };
  const d = M.days[di], irFull = M.limits.ir !== null && L.ir.length >= M.limits.ir;
  const c = M.order.filter(id => onRoster(M, di, id) && irEligible(M, di, id) && id !== moved && !L.ir.includes(id) && !(id in d.fixed) && !locked(M, di, id))
    .sort((a, b) => (counted(M, di, a) - counted(M, di, b)) || ((rankFpg(M, a) ?? -1) - (rankFpg(M, b) ?? -1)))[0];
  if (!c || irFull) return { L, blocked: 'Roster full (' + total + '/' + total + '): bringing ' + M.players[moved].name + ' back needs a drop' + (irFull ? ' (IR is full)' : ' (nobody else can go into IR)') + "; drops are made on Fantrax's roster page" };
  return { L: { s: withoutId(L.s, c), ir: L.ir.concat(c) }, paired: c };
}
// Why Fantrax would refuse (or score nothing for) this day's lineup; [] = legal. Fixed players are ignored.
function dayErrors(M, di, L) {
  const e = [], d = M.days[di], seen = new Set(), nm = id => M.players[id].name;
  const dup = id => { if (seen.has(id)) e.push(nm(id) + ' is in two places.'); seen.add(id); };
  L.s.forEach((id, i) => {
    if (!id || id in d.fixed) return;
    dup(id);
    if (!onRoster(M, di, id)) e.push(nm(id) + ' is not on the roster ' + d.label + '.');
    else if (!fits(M, di, id, d.slots[i].posId)) e.push(nm(id) + " can't play " + d.slots[i].pos + '.');
  });
  for (const id of L.ir) {
    if (id in d.fixed) continue;
    dup(id);
    if (!onRoster(M, di, id)) e.push(nm(id) + ' is not on the roster ' + d.label + '.');
    else if (!irEligible(M, di, id)) e.push(nm(id) + ' is on IR but no longer IR-eligible. Move him off IR first.');
  }
  if (M.limits.ir !== null && M.limits.ir !== undefined && L.ir.length > M.limits.ir) e.push('Only ' + M.limits.ir + ' IR spots.');
  const total = M.limits.total;
  if (total !== null && total !== undefined && rosterCount(M, di, L) > total) e.push('Roster over the limit: ' + rosterCount(M, di, L) + '/' + total + ' players outside IR. Fantrax would save it and score nothing that day.');
  for (const c of changes(M, di, L)) if (locked(M, di, c.id)) e.push(lockWhy(M, di, c.id) + ' after you moved him.');
  return e;
}
// Starts that will not count: a started player with a game who is Out or Suspended.
function dayWarnings(M, di, L) {
  const w = [];
  for (const c of changes(M, di, L)) {
    if (L.s.includes(c.id) && hasGame(M, di, c.id) && !counted(M, di, c.id)) w.push(M.players[c.id].name + " starts but won't count (" + (M.players[c.id].row && M.players[c.id].row.flag === 'susp' ? 'suspended' : 'out') + ').');
  }
  return w;
}
// Every counted active game of the week in Fantrax's counting order (day, start, roster order); entries past the group's max are in `over`.
// lineups: a Lineup per day index. E = {di, id, start (ms | null), played}.
function gameLedger(M, lineups) {
  const out = { skaters: [], goalies: [] }, over = new Set(), ord = {};
  M.order.forEach((id, i) => { ord[id] = i; });
  lineups.forEach((L, di) => {
    const d = M.days[di];
    L.s.forEach((id, i) => {
      if (!id || !d.slots || !counted(M, di, id)) return;
      const g = gameOn(M, di, id);
      out[d.slots[i].group].push({ di, id, start: g.start ? g.start.getTime() : null, played: !isPending(g, M.today) });
    });
  });
  for (const k of ['skaters', 'goalies']) {
    out[k].sort((x, y) => x.di - y.di || (x.start === null ? 1e18 : x.start) - (y.start === null ? 1e18 : y.start) || ord[x.id] - ord[y.id]);
    const max = M.max[k];
    if (max !== null && max !== undefined) out[k].slice(max).forEach(e => over.add(e.di + '|' + e.id));
  }
  return { skaters: out.skaters, goalies: out.goalies, over };
}

// Move planners (both views). Pure: each returns a new lineup and never mutates the one it is given.
// Sel = {kind:'slot', i} | {kind:'bench', id} | {kind:'ir', id}; target keys 's:<i>' | 'b:<id>' | 'i:<id>' | 'tobench' | 'toir' (mock.js targetsFor / computeMove)
// | 'x:<irId>' (IR is full: he goes into IR and irId comes out, 2026-10-05 mock parity).
const irRoom = (M, L) => M.limits.ir === null || M.limits.ir === undefined || L.ir.length < M.limits.ir;
const flagWord = (M, id) => ({ out: 'Out', susp: 'Susp', dtd: 'DTD' }[(M.players[id].row || {}).flag] || 'inj');
const pairNote = (M, c) => ' · ' + M.players[c].shortName + ' (' + flagWord(M, c) + ') into IR';
const slotPos = (M, di, i) => M.days[di].slots[i].pos;
function targetsFor(M, di, L, sel) {
  const T = new Set(), d = M.days[di], fx = id => id in d.fixed;
  if (d.state === 'past' || d.slots === null) return T;
  const who = sel.kind === 'slot' ? L.s[sel.i] : sel.id;
  if (who && (fx(who) || locked(M, di, who))) return T;
  const free = q => q === null || !(fx(q) || locked(M, di, q));   // an open slot, or an occupant who may move
  const ok = b => !fx(b) && !locked(M, di, b);
  const room = irRoom(M, L);
  // IR full: one swap per IR player who may move (the selected player is on the roster outside IR, unlocked and not fixed by now)
  const swaps = id => { if (!room && irEligible(M, di, id)) for (const y of L.ir) if (ok(y)) T.add('x:' + y); };
  if (sel.kind === 'slot') {
    const id = L.s[sel.i], here = d.slots[sel.i].posId;
    if (id !== null && fx(id)) return T;
    if (id === null) {
      for (const b of bench(M, di, L)) if (ok(b) && fits(M, di, b, here)) T.add('b:' + b);
      for (const r of L.ir) if (ok(r) && fits(M, di, r, here)) T.add('i:' + r);
      return T;
    }
    L.s.forEach((q, t) => { if (d.slots[t].posId === here || !fits(M, di, id, d.slots[t].posId)) return; if (free(q)) T.add('s:' + t); });
    for (const b of bench(M, di, L)) if (ok(b) && fits(M, di, b, here)) T.add('b:' + b);
    T.add('tobench');
    if (irEligible(M, di, id) && room) T.add('toir');
    swaps(id);
  } else if (sel.kind === 'bench') {
    if (fx(sel.id)) return T;
    L.s.forEach((q, t) => { if (fits(M, di, sel.id, d.slots[t].posId) && free(q)) T.add('s:' + t); });
    if (irEligible(M, di, sel.id) && room) T.add('toir');
    swaps(sel.id);
  } else {
    if (fx(sel.id)) return T;
    L.s.forEach((q, t) => { if (fits(M, di, sel.id, d.slots[t].posId) && free(q)) T.add('s:' + t); });
    T.add('tobench');
  }
  return T;
}
const openFor = (M, di, L, q) => { for (let u = 0; u < L.s.length; u++) if (L.s[u] === null && fits(M, di, q, M.days[di].slots[u].posId)) return u; return -1; };
function computeMove(M, di, L, sel, target) {
  const N = cloneLineup(L), d = M.days[di];
  const take = id => { N.s = N.s.map(x => x === id ? null : x); N.ir = N.ir.filter(x => x !== id); };
  const id = sel.kind === 'slot' ? N.s[sel.i] : sel.id;
  if (target === 'tobench') take(id);
  else if (target === 'toir') { take(id); N.ir.push(id); }
  else if (target.startsWith('x:')) {   // IR swap: y leaves IR for the slot he left if he fits it, else reserve; the count never changes
    const y = target.slice(2), at = sel.kind === 'slot' ? sel.i : -1;
    take(id); take(y); N.ir.push(id);
    if (at >= 0 && fits(M, di, y, d.slots[at].posId)) N.s[at] = y;
  }
  else if (target.startsWith('s:')) {
    const t = +target.slice(2), q = N.s[t];
    if (sel.kind === 'slot' && q && fits(M, di, q, d.slots[sel.i].posId)) { N.s[t] = id; N.s[sel.i] = q; }   // swap
    else { take(id); N.s[t] = id; if (q) { const u = openFor(M, di, N, q); if (u >= 0) N.s[u] = q; } }   // q moves to an open slot he fits, else reserve
  } else if (target.startsWith('b:') || target.startsWith('i:')) { const b = target.slice(2); take(b); N.s[sel.i] = b; }   // the selected player gives up his slot
  const moved = target.startsWith('b:') || target.startsWith('i:') || target.startsWith('x:') ? target.slice(2) : id;
  const f = fitRoster(M, di, N, moved, L);
  if (f.paired !== undefined) f.L.paired = f.paired;
  if (f.blocked !== undefined) f.L.blocked = f.blocked;
  return f.L;
}
function moveKind0(M, di, L, sel, key) {
  const d = M.days[di], nm = id => M.players[id].shortName;
  if (key === 'tobench') return { k: 'bench', txt: 'Reserve' };
  if (key === 'toir') return { k: 'ir', txt: 'IR' };
  if (key.startsWith('x:')) {
    const y = key.slice(2), takes = sel.kind === 'slot' && computeMove(M, di, L, sel, key).s[sel.i] === y;
    return { k: 'irswap', txt: 'IR · swap with ' + nm(y) + ': ' + (takes ? nm(y) + ' takes his ' + slotPos(M, di, sel.i) : nm(y) + ' to reserve') };
  }
  if (key.startsWith('s:')) {
    const t = +key.slice(2), q = L.s[t], ty = d.slots[t].pos;
    if (!q) return { k: 'open', txt: ty + ' (open)' };
    if (sel.kind === 'slot' && fits(M, di, q, d.slots[sel.i].posId)) return { k: 'swap', txt: ty + ' · swap with ' + nm(q) };
    const u = computeMove(M, di, L, sel, key).s.indexOf(q);
    return u >= 0 ? { k: 'shift', txt: ty + ' · ' + nm(q) + ' moves to ' + d.slots[u].pos } : { k: 'bump', txt: ty + ' · ' + nm(q) + ' to reserve' };
  }
  const x = key.slice(2), cur = sel.kind === 'slot' ? L.s[sel.i] : null;
  return { k: 'take', txt: cur ? 'Reserve · ' + nm(x) + ' takes his ' + slotPos(M, di, sel.i) : nm(x) + ' takes this ' + slotPos(M, di, sel.i) + ' slot' };
}
// What a target does before the click: open slot, swap, shift (the occupant moves to another slot), bump (he goes to reserve), take, reserve, IR, or blocked (roster full).
function moveKind(M, di, L, sel, key) {
  const m = moveKind0(M, di, L, sel, key);
  if (key === 'toir') return m;
  const after = computeMove(M, di, L, sel, key);
  if (after.blocked) return { k: 'blocked', txt: m.txt + ' — roster full, needs a drop', why: after.blocked };
  if (after.paired) return { k: m.k, txt: m.txt + pairNote(M, after.paired), pair: pairNote(M, after.paired) };
  return m;
}
// ---- 1.4.0 mock parity: the dock list (the Grid's IR chip on a full IR, a +slot chip), the open-slot picker and the Fill sentence (mock.js picker / fpgLong).
const gameLine = (M, di, id) => { const r = M.players[id] && M.players[id].row, g = r && r.games.find(x => x.day === M.days[di].day); return g ? (g.opp + ' ' + g.time).trim() : ''; };
const posText = (M, id) => ((M.players[id].row && M.players[id].row.pos) || '').split(',').map(x => x.trim()).filter(Boolean).join('/');
const DOCK_RANK = { open: 0, swap: 1, shift: 1, take: 1, irswap: 1, bump: 2, bench: 4, ir: 5, blocked: 9 };
// The options of the dock list, ranked: open 0, swap/shift/take/irswap 1, bump (not playing) 2, bump (plays) 3, bench 4, ir 5, blocked last.
// plays = a bump that benches a player who has a counted game; note / title are the suffix and tooltip the page adds to such an option.
function dockOptions(M, di, L, sel) {
  const T = [...targetsFor(M, di, L, sel.s)].filter(k => !sel.irOnly || k.startsWith('x:'));
  return T.map((key, i) => {
    const m = moveKind(M, di, L, sel.s, key), q = key.startsWith('s:') ? L.s[+key.slice(2)] : null, plays = m.k === 'bump' && !!q && counted(M, di, q);
    return { key, k: m.k, txt: m.txt, why: m.why, pair: m.pair || '', plays, rank: m.k === 'bump' ? (plays ? 3 : 2) : DOCK_RANK[m.k] ?? 6, i,
      note: m.k === 'bump' ? (plays ? '(he plays)' : '(not playing)') : '', title: plays ? 'He plays ' + M.days[di].label.split(' ')[0] + ': benching him costs a game' : '' };
  }).sort((a, b) => a.rank - b.rank || a.i - b.i);
}
// "<Name> (<positions> · <game> · <FP/G>) is in <pos> / on IR / on reserve on <Day>. Move him to:" (irOnly: the IR-full variant)
function dockQuestion(M, di, L, sel) {
  const s = sel.s, id = s.kind === 'slot' ? L.s[s.i] : s.id, day = M.days[di].label.split(' ')[0];
  if (!id) return null;
  const where = s.kind === 'slot' ? 'in ' + M.days[di].slots[s.i].pos : s.kind === 'ir' ? 'on IR' : 'on reserve';
  return { id, pre: ' (' + [posText(M, id), gameLine(M, di, id) || 'no game', fpgText(M, id)].join(' · ') + ') is ' + where + ' on ' + day + (sel.irOnly ? '. IR is full (' + L.ir.length + '/' + M.limits.ir + '): swap him into IR with:' : '. Move him to:') };
}
// One option of the open-slot picker: "<name> · <game or 'no game'> · <FP/G>"
const openOption = (M, di, id) => M.players[id].name + ' · ' + (gameLine(M, di, id) || 'no game') + ' · ' + fpgText(M, id);
// The Grid name cell's tooltip: the Fill sentence once the edit extras are loaded, the player's name before (read-only).
// 2026-10-21: Fill exists only where the panel is editable; elsewhere (another team, a finished week) the name and FP/G.
const nameTitle = (M, id, extras) => !extras ? M.players[id].name : M.editable ? fpgLong(M, id) : M.players[id].name + ' · ' + fpgText(M, id);
const OPEN_NONE = 'Nobody on reserve or IR fits it.';
// Why Fill ranks a player as it does (tooltip on the Grid's name cell).
function fpgLong(M, id) {
  const p = M.players[id], v = rankFpg(M, id);
  return v === null ? 'Fill ranks him last: no games this season.' : 'Fill ranks him by ' + v.toFixed(1) + ' FP/G this season (' + p.gp + ' GP).';
}
// After a rebuild that re-applied stored moves: n pending moves, c in conflict.
const rebuildNote = (n, c) => 'Panel rebuilt with fresh data. ' + n + ' pending move' + (n === 1 ? '' : 's') + ' re-applied' + (c ? ', ' + c + ' in conflict.' : ', none in conflict.');
// The grid's one click: off IR, to reserve, or start (seat; else swap out a player who is not counted; else ask which one sits).
function planClick(M, di, L, id) {
  if (id in M.days[di].fixed) return { k: 'none', text: M.players[id].name + " can't be moved here (Fantrax locks his slot)" };
  if (locked(M, di, id)) return { k: 'locked', text: 'Locked: ' + lockWhy(M, di, id) };
  const N = cloneLineup(L), d = M.days[di];
  if (N.ir.includes(id)) {
    N.ir = N.ir.filter(x => x !== id);
    const f = fitRoster(M, di, N, id, L);
    if (f.blocked) return { k: 'none', text: f.blocked };
    return { k: 'move', L: f.L, text: 'Click: off IR to reserve' + (f.paired ? pairNote(M, f.paired) + ' (roster stays at ' + M.limits.total + ')' : '') };
  }
  const s = N.s.indexOf(id);
  if (s >= 0) { N.s[s] = null; return { k: 'move', L: N, text: 'Click: to reserve (his ' + d.slots[s].pos + ' slot opens)' }; }
  // 2026-10-18 (user): starting a reserve player whose game would not count gains nothing (and bumped someone)
  if (!counted(M, di, id)) return { k: 'none', text: gameOn(M, di, id) ? 'His game ' + d.label + " won't count: nothing to gain" : 'No game ' + d.label + ': nothing to start' };
  const a0 = seat(M, di, N.s, id), a = a0 && arrange(M, di, { s: a0, ir: N.ir });
  const shift = s2 => s2.some((x, i) => x !== null && x !== L.s[i] && x !== id) ? ' (others shift slots)' : '';
  if (a) { N.s = a; return { k: 'move', L: N, text: 'Click: starts in ' + d.slots[a.indexOf(id)].pos + shift(a) }; }
  const opts = swapsFor(M, di, L, id);
  if (!opts.length) return { k: 'none', text: 'No slot he fits is free: every one is locked' };
  const idle = opts.filter(o => !counted(M, di, o.out));
  if (idle.length) { N.s = arrange(M, di, { s: idle[0].s, ir: N.ir }); return { k: 'move', L: N, out: idle[0].out, text: 'Click: starts in ' + d.slots[N.s.indexOf(id)].pos + ' · ' + M.players[idle[0].out].name + ' (not playing) to reserve' + shift(N.s) }; }
  return { k: 'pick', opts: opts.map(o => ({ out: o.out, s: arrange(M, di, { s: o.s, ir: N.ir }) })), text: 'Every slot he fits holds a player who plays: click to choose who sits' };
}
// → the lineup with him in IR, or null (not IR-eligible, locked, fixed, not on the roster, or IR is full).
function toIR(M, di, L, id) {
  if (!onRoster(M, di, id) || id in M.days[di].fixed || locked(M, di, id) || !irEligible(M, di, id) || L.ir.includes(id) || !irRoom(M, L)) return null;
  return { s: withoutId(L.s, id), ir: L.ir.concat(id) };
}
// What "Start all games" would do, day by day: every unlocked day his game counts and he is not active.
function allGamesPlan(M, lineups, id) {
  const plan = [];
  for (let di = 0; di < M.days.length; di++) {
    if (!onRoster(M, di, id) || id in M.days[di].fixed || !counted(M, di, id) || locked(M, di, id) || lineups[di].s.includes(id)) continue;
    let L = cloneLineup(lineups[di]);
    L.ir = L.ir.filter(x => x !== id);
    const f = fitRoster(M, di, L, id, lineups[di]);
    if (f.blocked) { plan.push({ di, blocked: true }); continue; }
    L = f.L;
    const a = seat(M, di, L.s, id);
    if (a) { L.s = arrange(M, di, { s: a, ir: L.ir }); plan.push({ di, L, out: null, paired: f.paired }); continue; }
    const idle = swapsFor(M, di, L, id).filter(o => !counted(M, di, o.out));
    if (idle.length) { L.s = arrange(M, di, { s: idle[0].s, ir: L.ir }); plan.push({ di, L, out: idle[0].out, paired: f.paired }); continue; }
    plan.push({ di, ask: true });
  }
  return plan;
}
// The Grid's start-all pill (2026-10-18): done = he starts every remaining game he has (at least one); none = no remaining game
// that counts (Out, no games left: no pill, "✓ all" would read as "he's starting"); go = N days one click starts; stuck = days
// left, but each asks who sits or needs a drop (the click would start nothing).
function allGamesPill(M, lineups, id) {
  const plan = allGamesPlan(M, lineups, id), n = plan.filter(x => !x.ask && !x.blocked).length;
  if (plan.length) return { state: n ? 'go' : 'stuck', n };
  const starts = M.days.some((d, di) => d.state !== 'past' && onRoster(M, di, id) && counted(M, di, id) && lineups[di].s.includes(id));
  return { state: starts ? 'done' : 'none', n: 0 };
}
// Games past the max for one group ('skaters' | 'goalies'), latest last, as Fantrax counts them.
function overList(M, lineups, group) {
  const max = M.max[group], over = max === null || max === undefined ? [] : gameLedger(M, lineups)[group].slice(max);
  return { n: over.length, names: over.map(e => M.players[e.id].shortName + ' ' + M.days[e.di].label.split(' ')[0]) };
}
function overNote(M, beforeLineups, afterLineups, group) {
  const b = overList(M, beforeLineups, group), a = overList(M, afterLineups, group);
  return a.n <= b.n ? '' : 'Puts ' + group + ' ' + a.n + ' over the max: ' + a.names.join(', ') + " won't count.";
}

// Fill (mock.js .. fillWeek). Ranks by Fantrax's own FP/G for this season, whatever the GP (user 2026-10-18: a field everyone can look up
// on Fantrax, no last season and no blend); a player with no games this season ranks last.
function rankFpg(M, id) { const p = M.players[id]; return p.gp && p.fpg !== null && p.fpg !== undefined ? p.fpg : null; }
// Grid name cell: this season's FP/G and GP ("9.2 · 8 GP"; "0 GP" before his first game).
function fpgShort(M, id) { const p = M.players[id], v = rankFpg(M, id); return v === null ? (p.gp || 0) + ' GP' : v.toFixed(1) + ' · ' + p.gp + ' GP'; }
function fpgHeader() { return 'FP/G this season'; }
function fpgText(M, id) { const v = rankFpg(M, id); return v === null ? 'no games yet' : v.toFixed(1) + ' FP/G'; }
// Comparator: higher FP/G first, none last, ties in roster order.
function byFpg(M) {
  const o = {}; M.order.forEach((id, i) => { o[id] = i; });
  return (a, b) => (rankFpg(M, b) ?? -1) - (rankFpg(M, a) ?? -1) || o[a] - o[b];
}
// Games still allowed under each group's max across the week (null max = unlimited).
function gameRoom(M, lineups) {
  const led = gameLedger(M, lineups), r = {};
  for (const g of ['skaters', 'goalies']) r[g] = M.max[g] === null || M.max[g] === undefined ? Infinity : M.max[g] - led[g].length;
  return r;
}
// Start `id` on day di: an open/shiftable slot, else swap out a not-playing, unlocked, non-fixed occupant of his group. → {L, out} | null
function fillOne(M, di, L, id) {
  const d = M.days[di], s = seat(M, di, L.s, id);
  if (s) return { L: { s: arrange(M, di, { s, ir: L.ir }), ir: L.ir.slice() }, out: null };
  for (const q of L.s) {
    if (!q || q in d.fixed || counted(M, di, q) || locked(M, di, q) || isGoalie(M, q) !== isGoalie(M, id)) continue;
    const s2 = seat(M, di, withoutId(L.s, q), id);
    if (s2) return { L: { s: arrange(M, di, { s: s2, ir: L.ir }), ir: L.ir.slice() }, out: q };
  }
  return null;
}
const fillable = (M, di, id) => counted(M, di, id) && !locked(M, di, id) && !(id in M.days[di].fixed);
const fillDay = (M, di) => M.days[di].slots !== null && M.days[di].state !== 'past';
const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
// Fill one day: lineups[di] is the starting lineup; the room is what the week's ledger (all lineups) still allows.
function suggestions(M, lineups, di) {
  const res = { moves: [], L: cloneLineup(lineups[di]), stuck: [], capped: [], msg: '' }, nm = id => M.players[id].name;
  if (fillDay(M, di)) {
    const room = gameRoom(M, lineups);
    for (const id of bench(M, di, res.L).sort(byFpg(M))) {
      if (!fillable(M, di, id)) continue;
      const g = isGoalie(M, id) ? 'goalies' : 'skaters';
      if (room[g] <= 0) { res.capped.push(id); continue; }
      const r = fillOne(M, di, res.L, id);
      if (!r) { res.stuck.push(id); continue; }
      res.L = r.L; res.moves.push({ in: id, out: r.out }); room[g]--;
    }
  }
  res.msg = plural(res.moves.length, 'move') + ' on ' + M.days[di].label + '.' +
    (res.capped.length ? ' Stopped at the games max: ' + res.capped.map(nm).join(', ') + ' also play' + (res.capped.length > 1 ? '' : 's') + '.' : '') +
    (res.stuck.length ? ' ' + res.stuck.map(nm).join(', ') + (res.stuck.length > 1 ? ' still need' : ' still needs') + ' a manual swap.' : '');
  return res;
}
// Fill every day: every bench game of the week competes for the room, best FP/G first, then the earlier day. → NEW lineups.
function fillWeek(M, lineups) {
  const out = lineups.map(cloneLineup), room = gameRoom(M, lineups), res = { lineups: out, moves: [], capped: [], stuck: [], msg: '' }, cmp = byFpg(M), cands = [];
  for (let di = 0; di < out.length; di++) if (fillDay(M, di)) for (const id of bench(M, di, out[di])) if (fillable(M, di, id)) cands.push({ di, id });
  cands.sort((x, y) => cmp(x.id, y.id) || x.di - y.di);
  for (const { di, id } of cands) {
    const g = isGoalie(M, id) ? 'goalies' : 'skaters', label = M.players[id].name + ' (' + M.days[di].label.split(' ')[0] + ')';
    if (room[g] <= 0) { res.capped.push(label); continue; }
    const r = fillOne(M, di, out[di], id);
    if (!r) { res.stuck.push(label); continue; }
    out[di] = r.L; room[g]--; res.moves.push({ in: id, out: r.out, di });
  }
  res.msg = plural(res.moves.length, 'move') + ' across the week.' +
    (res.capped.length ? ' Stopped at the games max; also playing: ' + res.capped.join(', ') + '.' : '') +
    (res.stuck.length ? ' Need a manual swap: ' + res.stuck.join(', ') + '.' : '');
  return res;
}

// The save gate (mock.js withoutLockedMoves .. savePlan): a day saves if, and only if, the lineup it would send is legal.
// Every locked player whose move can no longer happen goes back where Fantrax still has him; L null if that collides with another move.
function withoutLockedMoves(M, di, L) {
  const d = M.days[di], K = changes(M, di, L).map(c => c.id).filter(id => locked(M, di, id));
  if (!K.length) return { L: cloneLineup(L), dropped: [] };
  const N = { s: L.s.map(x => K.includes(x) ? null : x), ir: L.ir.filter(x => !K.includes(x)) };
  for (const k of K) {
    const i = d.base.s.indexOf(k);
    if (i >= 0) { if (N.s[i] !== null) return { L: null, dropped: K }; N.s[i] = k; }
    else if (d.base.ir.includes(k)) N.ir.push(k);
  }
  return { L: N, dropped: K };
}
// Compared as fieldMaps (what Fantrax is sent), never slot numbers. Warnings (games max, Out player started) never enter it.
function savePlan(M, di, L) {
  const d = M.days[di], no = why => ({ ok: false, L, errors: [], dropped: [], why });
  if (d.slots === null) return L.s.length || L.ir.length ? no(d.label + "'s lineup isn't loaded: it can't be saved.") : { none: true };
  if (!changes(M, di, L).length) return { none: true };
  if (d.state === 'past') return no(d.label + " has already been played: it can't be changed.");
  const w = withoutLockedMoves(M, di, L);
  if (!w.L) return Object.assign(no("A move you made can't happen any more (" + w.dropped.map(id => lockWhy(M, di, id)).join('; ') + '), and other moves that day depend on it. Re-check ' + d.label.split(' ')[0] + '.'), { dropped: w.dropped });
  const errors = dayErrors(M, di, w.L), same = sameFieldMap(fieldMapOf(M, di, w.L), fieldMapOf(M, di, d.base));
  return { ok: !errors.length && !same, L: w.L, errors, dropped: w.dropped, nothingLeft: same };
}
// One request per day that will save, in date order; only the period's last day may carry its lineup forward.
function saveRequests(M, lineups, keepLast) {
  const out = [], last = M.days.length - 1;
  for (let di = 0; di <= last; di++) {
    const sp = savePlan(M, di, lineups[di]);
    if (sp.ok) out.push({ di, n: M.days[di].n, fieldMap: fieldMapOf(M, di, sp.L), applyToFuturePeriods: !!keepLast && di === last });
  }
  return out;
}
function keepLastShown(M, lineups) { const last = M.days.length - 1; return !!savePlan(M, last, lineups[last]).ok; }
// One confirmOrExecuteTeamRosterChanges answer → {kind, mainMsg, illegal, changes}, messages without HTML (shapes: 2026-10-05 spike).
// none = "no changes detected"; locked = "already locked"; illegal = illegalRosterMsgs; error = a "Sorry" message, any other WARNING,
// no fantasyResponse, or a dry run (opts.dryRun) that lists no changes; ok otherwise (an execute answers CONFIRM, mainMsg '', no changes).
const stripHtml = t => String(t === null || t === undefined ? '' : t).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
function interpretResponse(data, opts) {
  const fr = data && data.fantasyResponse;
  if (!fr) return { kind: 'error', mainMsg: 'Fantrax sent no answer', illegal: [], changes: [] };
  const mainMsg = stripHtml(fr.mainMsg), illegal = (Array.isArray(fr.illegalRosterMsgs) ? fr.illegalRosterMsgs : []).map(stripHtml).filter(Boolean);
  const changes = (Array.isArray(fr.lineupChanges) ? fr.lineupChanges : []).map(c => ({ scorerId: c && c.scorerId, text: stripHtml(c && c.text) }));
  // A refusal ("Sorry") or a dry run listing no changes is error even with illegalRosterMsgs: nothing is executed after a non-ok dry run.
  const kind = /no changes detected/i.test(mainMsg) ? 'none' : /already locked/i.test(mainMsg) ? 'locked'
    : /^Sorry/.test(mainMsg) || (opts && opts.dryRun && !changes.length) ? 'error' : illegal.length ? 'illegal' : fr.msgType === 'WARNING' ? 'error' : 'ok';
  return { kind, mainMsg, illegal, changes };
}

// The panel's view helpers (mock.js meter / dayHeadHtml). A day header links to that lineup day's roster page; the teamId rides
// along only when the route has one (without it Fantrax shows the user's own team, as the route does).
function dayHref(route, n) { return '/fantasy/league/' + route.leagueId + '/team/roster;period=' + n + (route.teamId ? ';teamId=' + route.teamId : ''); }
// One group's games meter: played (under way or final) + scheduled = total of `max` (null = no max); delta = total minus the base
// lineups' total (pending moves); over = total - max (negative = games left), null without a max.
// Which lineups the meter counts: the pending ones while editing (delta against Fantrax's), Fantrax's own otherwise (what the body
// shows; same lineups for both, so no pending delta).
function meterLineups(E) {
  const base = baseOf(E.model);
  return { lineups: E.editing ? E.lineups : base, base };
}
function meterView(M, lineups, baseLineups, group) {
  const list = gameLedger(M, lineups)[group], played = list.filter(e => e.played).length, max = M.max[group] === undefined ? null : M.max[group];
  return { played, sched: list.length - played, total: list.length, max, delta: list.length - gameLedger(M, baseLineups)[group].length, over: max === null ? null : list.length - max };
}
// One day header: counted active games (both groups), players outside IR / the total max, skater slots empty (holder not counted)
// and open (nobody), what Fill would do (0 on a played or unloaded day; the tooltip lists the moves) and the day's state.
function dayHeadView(M, lineups, di) {
  const d = M.days[di], L = lineups[di], v = { games: 0, rosterN: null, rosterMax: M.limits.total, idle: 0, open: 0, fillN: 0, fillTip: '', state: d.state, locked: false };
  if (d.slots === null) return v;
  v.locked = d.state === 'today' && dayLocked(M, di);
  L.s.forEach((id, i) => {
    if (id && counted(M, di, id)) v.games++;
    else if (d.slots[i].group !== 'goalies') v[id ? 'idle' : 'open']++;
  });
  v.rosterN = rosterCount(M, di, L);
  const sg = suggestions(M, lineups, di), nm = id => M.players[id].name;
  v.fillN = sg.moves.length;
  v.fillTip = sg.moves.map(m => '+ ' + nm(m.in) + ' (' + fpgText(M, m.in) + ')' + (m.out ? ' for ' + nm(m.out) : '')).join('\n');
  return v;
}

// Day header second line (2026-10-18): short text; the full line in the hover; the roster count only when not at the max.
function dayHeadLine(v) {
  const max = v.rosterMax === null || v.rosterMax === undefined ? null : v.rosterMax, players = v.rosterN + (max === null ? '' : '/' + max) + ' players';
  return { text: v.games + ' start · ' + v.idle + ' empty' + (max !== null && v.rosterN !== max ? ' · ' + players : ''),
    title: v.games + ' games · ' + players + ' · ' + v.idle + ' empty' + (v.open ? ' · ' + v.open + ' open' : '') };
}
const shortTime = t => String(t).replace(/^(\d{1,2}:\d{2})([AP])M$/, (m, hm, ap) => hm + ap.toLowerCase());

// Columns view rows. A reserve column lists every reserve player (editing) or only those with a game that would count (read-only,
// as 1.3.7: a flagged one only when a return date is in play), the ones with a game first, then roster order. columnRows is what
// every day column pads to (max over days) so the rows line up across days; IR pads to the league's places or the longest list.
// A reserve game's kind exactly as weekView's gameKind(row, game, false): by the flag / return-date rule, never by GP.
function benchGame(M, row, g) {
  const counted = countsGame(row, g, M.today, M.opts);
  return { counted, by: counted && !!M.opts.returnDates && !!effectiveReturnDate(row, M.today) ? 'date' : 'flag' };
}
function columnBench(M, di, L, all) {
  const d = M.days[di], game = id => { const r = M.players[id].row; return r ? r.games.find(g => g.day === d.day) || null : null; };
  const shown = bench(M, di, L).filter(id => {
    if (all) return true;
    const g = game(id), row = M.players[id].row;
    return !!g && (benchGame(M, row, g).counted || (!!M.opts.returnDates && !!effectiveReturnDate(row, M.today)));
  });
  return shown.map((id, i) => ({ id, i, g: game(id) ? 0 : 1 })).sort((a, b) => a.g - b.g || a.i - b.i).map(x => x.id);
}
// The off-lineup entry (weekView `off`) folded into an IR row: the status tag's text and title ('back Thu 10/8' / 'no longer IR-eligible').
function offRowNote(e) {
  return e.kind === 'back' ? { text: e.short + ' ' + dayLabel(e.date).split(' ')[1], title: e.short + ': back ' + dayLabel(e.date) } : { text: e.short, title: 'no longer ' + e.short + '-eligible' };
}
function columnRows(M, lineups, all = true) {
  const r = { slots: 0, reserve: 0, ir: M.limits.ir || 0 };
  M.days.forEach((d, di) => {
    if (d.slots === null) return;
    r.slots = Math.max(r.slots, d.slots.length); r.reserve = Math.max(r.reserve, columnBench(M, di, lineups[di], all).length); r.ir = Math.max(r.ir, lineups[di].ir.length);
  });
  return r;
}

// The tag a player's row or cell shows that day, one rule for both views (as 1.3.0's week panel): a game counted from the expected
// return date shows RET, otherwise his injury tag (on a game day, or while on IR); title = Fantrax's tooltip + the return-date text.
// A reserve game goes by the flag rule (benchGame), an active / IR one by activeGame. → {text, kind, title} | null.
function gameTag(M, di, L, id) {
  const p = M.players[id], row = p && p.row;
  if (!row) return null;
  const g = row.games.find(x => x.day === M.days[di].day) || null, w = where(M, di, L, id), ret = row.returnText ? ' · ' + row.returnText : '';
  const act = g ? (w === 'R' ? benchGame(M, row, g) : activeGame(row, g, M.today, M.opts)) : null;
  if (act && act.counted && act.by === 'date') return { text: 'RET', kind: 'ret', title: (row.tag ? row.tag.text : 'flagged') + ret };
  if (row.tag && (g || w === 'IR')) return { text: row.tag.text, kind: row.tag.kind, title: (row.tag.tip || row.tag.text) + ret };
  return null;
}
// Mock parity #10: ['NEW'] on the first day of a roster span that is not the period's first loaded day, ['DROP'] on its last day when that is
// not the period's last loaded day. Only loaded days (slots known) count: an unloaded day neither starts nor ends a span.
function rosterTags(M, di, id) {
  const loaded = M.days.map((d, i) => d.slots !== null ? i : -1).filter(i => i >= 0), k = loaded.indexOf(di), out = [];
  if (k < 0 || !onRoster(M, di, id)) return out;
  if (k > 0 && !onRoster(M, loaded[k - 1], id)) out.push('NEW');
  if (k < loaded.length - 1 && !onRoster(M, loaded[k + 1], id)) out.push('DROP');
  return out;
}
// Grid view (1.4.0, Task 12). One cell per player and day: 'play' (active, his game counts), 'idle' (active, no counted game: striped),
// 'benchGame' (reserve, a game that would count: dashed), 'benchNo', 'ir', 'off' (not on the roster that day). `slot` is the slot's letter
// when active. `ledger` (gameLedger's result) can be passed in so a whole grid computes it once.
function gridCell(M, lineups, di, id, ledger) {
  const d = M.days[di], L = lineups[di];
  if (!onRoster(M, di, id)) return { kind: 'off', slot: null, locked: false, over: false, changed: false, tag: null };
  const i = L.s.indexOf(id), g = gameOn(M, di, id), row = M.players[id].row;
  const kind = i >= 0 ? (g && counted(M, di, id) ? 'play' : 'idle') : L.ir.includes(id) ? 'ir' : g && row && benchGame(M, row, g).counted ? 'benchGame' : 'benchNo';
  const led = ledger || gameLedger(M, lineups);
  return { kind, slot: i >= 0 && d.slots ? d.slots[i].pos : null, locked: locked(M, di, id), over: led.over.has(di + '|' + id), changed: where(M, di, d.base, id) !== where(M, di, L, id), tag: gameTag(M, di, L, id) };
}
// The cells one click would change in that day: [{id, to: 'slot'|'bench'|'ir', self}], `self` = the player who was clicked (`id`, if given).
function previewDiff(M, before, after, di, id) {
  const out = [];
  for (const p of M.order) {
    const a = where(M, di, before, p), b = where(M, di, after, p);
    if (a === null || a === 'fixed' || a === b) continue;
    out.push({ id: p, to: b === 'IR' ? 'ir' : b === 'R' ? 'bench' : 'slot', self: p === id });
  }
  return out;
}

// Review & save (mock.js saveBar): one entry per day with a move or a conflict, in date order. ok = the day will be sent (savePlan ok,
// the same test saveRequests uses). Lines: each move in Fantrax's words (a dropped locked move marked bad with lockWhy), each conflict
// with its reason, then why / nothing left / Would be illegal (bad) and the warnings (warn, never blocking).
const playerName = (M, id) => M.players[id] ? M.players[id].name : 'A player no longer on the roster';   // a conflict's player may be on no loaded day
function reviewView(M, lineups, conflicts) {
  const out = [], nm = id => playerName(M, id);
  M.days.forEach((d, di) => {
    const L = lineups[di], cs = d.slots === null ? [] : changes(M, di, L), cf = (conflicts || []).filter(c => c.di === di);
    if (!cs.length && !cf.length) return;
    const sp = savePlan(M, di, L), dropped = sp.dropped || [], lines = [];
    for (const c of cs) lines.push(dropped.includes(c.id) ? { text: nm(c.id) + ': ' + c.text + ' — dropped: ' + lockWhy(M, di, c.id), bad: true } : { text: nm(c.id) + ': ' + c.text });
    for (const c of cf) lines.push({ text: nm(c.id) + ": can't happen any more (" + c.reason + ')', bad: true });
    if (sp.why) lines.push({ text: sp.why, bad: true });
    if (sp.nothingLeft) lines.push({ text: "Nothing left to save: every move that day can't happen any more.", bad: true });
    for (const x of sp.errors || []) lines.push({ text: 'Would be illegal: ' + x, bad: true });
    if (!sp.none && d.slots !== null) for (const x of dayWarnings(M, di, sp.L || L)) lines.push({ text: x, warn: true });
    out.push({ di, label: d.label, ok: !!sp.ok, lines });
  });
  return out;
}
// The panel's banners (mock.js banner): unplayed days over the total max (only when it is known), players on IR on an unplayed day who
// are no longer IR-eligible, and the last save's results (saveAll) carrying Fantrax's illegal message about another day.
// Read-only (editing false): the IR one only (mock parity #4; the limits behind the over-limit one load on Edit).
function banners(M, lineups, results, editing = true) {
  const out = [], live = di => M.days[di].slots !== null && M.days[di].state !== 'past', ddd = di => M.days[di].label.split(' ')[0], total = M.limits.total;
  if (editing && total !== null && total !== undefined) {
    const over = M.days.map((d, di) => di).filter(di => live(di) && rosterCount(M, di, lineups[di]) > total);
    if (over.length) out.push('Roster over the limit on ' + over.map(di => ddd(di) + ' (' + rosterCount(M, di, lineups[di]) + '/' + total + ')').join(', ') + ': Fantrax scores nothing on an illegal day. Move someone into IR or drop a player.');
  }
  const bad = [];
  M.days.forEach((d, di) => { if (live(di)) for (const id of lineups[di].ir) if (!(id in d.fixed) && onRoster(M, di, id) && irIneligibleKnown(M, di, id) && !bad.includes(id)) bad.push(id); });
  if (bad.length) out.push(bad.map(id => M.players[id].name).join(', ') + (!editing ? (bad.length === 1 ? ' is on IR but no longer IR-eligible: Fantrax marks the roster illegal until he moves off IR.' : ' are on IR but no longer IR-eligible: Fantrax marks the roster illegal until they move off IR.')
    : bad.length === 1 ? " is on IR but no longer IR-eligible: a day with him on IR can't be saved until he moves off IR." : " are on IR but no longer IR-eligible: a day with one of them on IR can't be saved until he moves off IR."));
  const msgs = editing ? [...new Set((results || []).map(r => r.banner).filter(Boolean))] : [];
  if (msgs.length) {
    const flagged = M.days.map((d, di) => di).filter(di => M.days[di].illegalText).map(ddd);
    out.push("Fantrax flags another day's lineup" + (flagged.length ? ' (' + flagged.join(', ') + ')' : '') + ': ' + msgs.join(' ') + " The days saved here were legal by the script's count; fix that day on Fantrax.");
  }
  return out;
}

// ---------------------------------------------------------------- pending moves (1.4.0)
// Moves are kept per day as Fantrax-style fieldMaps: Stored = {v: 1, days: {'YYYY-MM-DD': {base, intended}}}, `base[id]` being where Fantrax
// had a mover when his move was made (everyone else: where Fantrax has him now). After every refresh they are re-applied to the fresh data;
// what can no longer happen is a conflict.
const pendingKey = (leagueId, teamId, periodId) => 'fgt-pending|' + leagueId + '|' + teamId + '|' + periodId;
// `conflicts` = the last reapply's: a conflicted move keeps its stored intended entry (and its stored base), so it is reported again
// until the user discards it or the day is saved; a day holding one is never pruned.
function pendingFrom(M, lineups, prev, conflicts = []) {
  const days = {};
  M.days.forEach((d, di) => {
    const old = prev && prev.days && prev.days[d.day];
    if (d.slots === null) { if (old) days[d.day] = old; return; }   // not loaded: his pending entry waits
    const fm = fieldMapOf(M, di, lineups[di]), fresh = fieldMapOf(M, di, d.base), held = old ? conflicts.filter(c => c.di === di && c.id in old.intended) : [];
    for (const c of held) fm[c.id] = old.intended[c.id];
    if (!held.length && sameFieldMap(fm, fresh)) return;
    // the stored base is kept only for that day's movers whose move Fantrax does not have yet, and for the conflicted; everyone else's base
    // is Fantrax's current entry, so a player changed on Fantrax since and then moved in the panel is a move from where he is now
    const base = Object.assign({}, fresh);
    if (old) for (const id in old.base) {
      const mover = id in old.intended && !sameEntry(old.intended[id], old.base[id]) && !(fresh[id] && sameEntry(fresh[id], old.intended[id]));
      if ((mover && id in fm) || held.some(c => c.id === id)) base[id] = old.base[id];
    }
    days[d.day] = { base, intended: fm };
  });
  return { v: 1, days };
}
// → {lineups: one per day (the fresh base where nothing is pending), conflicts: [{di, id, reason}] by day then roster order}
function reapply(M, stored) {
  const lineups = [], conflicts = [], ord = id => { const i = M.order.indexOf(id); return i < 0 ? M.order.length : i; };
  M.days.forEach((d, di) => {
    const e = stored && stored.days && stored.days[d.day], mine = [];
    if (!e) { lineups.push(cloneLineup(d.base)); return; }
    const moved = Object.keys(e.intended).filter(id => !sameEntry(e.intended[id], e.base[id])).sort((a, b) => ord(a) - ord(b) || (a < b ? -1 : 1));
    const no = (id, reason) => mine.push({ di, id, reason });
    if (d.slots === null) { lineups.push(cloneLineup(d.base)); for (const id of moved) no(id, d.label + "'s lineup isn't loaded"); conflicts.push(...mine); return; }
    const fresh = fieldMapOf(M, di, d.base), ok = [];
    for (const id of moved) {
      if (!fresh[id]) no(id, 'no longer on the roster');
      else if (sameEntry(fresh[id], e.intended[id])) continue;   // already there on Fantrax
      else if (d.state === 'past') no(id, d.label + ' has already been played');
      else if (!sameEntry(fresh[id], e.base[id]) || id in d.fixed) no(id, 'changed on Fantrax since');
      else if (locked(M, di, id)) no(id, lockWhy(M, di, id));
      else ok.push(id);
    }
    // everyone who does not move is seated first with his fresh entry (so he never loses his slot), then the movers
    let L = cloneLineup(d.base);
    while (ok.length) {
      const fm = Object.assign({}, fresh); for (const id of ok) delete fm[id];
      const r = lineupFromFieldMap(M, di, fm), lost = [];
      for (const id of ok) {
        const t = e.intended[id];
        if (t.stId === '3') r.L.ir.push(id);
        else if (t.stId === '1') { const i = d.slots.findIndex((x, k) => r.L.s[k] === null && x.posId === t.posId); if (i >= 0) r.L.s[i] = id; else lost.push(id); }
      }
      if (!lost.length) { L = r.L; break; }
      for (const id of lost) { no(id, 'no room left for this move'); ok.splice(ok.indexOf(id), 1); }
    }
    lineups.push(L); mine.sort((a, b) => ord(a.id) - ord(b.id)); conflicts.push(...mine);
  });
  return { lineups, conflicts };
}
function loadPending(key) {
  try { const o = JSON.parse(sessionStorage.getItem(key)); return o && o.v === 1 && o.days && typeof o.days === 'object' ? o : null; } catch (e) { return null; }
}
function savePending(key, stored) {
  try { if (!stored || !Object.keys(stored.days).length) sessionStorage.removeItem(key); else sessionStorage.setItem(key, JSON.stringify(stored)); } catch (e) { /* no sessionStorage */ }
}
function clearPendingDays(key, days) {
  const s = loadPending(key); if (!s) return;
  for (const d of days) delete s.days[d];
  savePending(key, s);
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
// The roster page's render key. It carries the league: without a teamId in the URL two leagues' roster pages had the
// same key, so after an in-app league switch (same document) the other league's strip counted as already rendered (1.3.4).
// "Full Season" (scoringPeriod 9999) on the roster page: no single period, so there is nothing for the strip or the panel to count.
const FULL_SEASON = 9999;
const isWholeSeason = route => route.period === FULL_SEASON;
// Overlapping loads of the same key (a fast double toggle of return dates: the first answer may be the slower one) — only the
// newest may land.
function latestGate() { let n = 0; return { next: () => ++n, isLatest: t => t === n }; }
function rosterKey(route, period, day) {
  return route.leagueId + '|' + (route.teamId || 'me') + '|' + (period === null ? 'cur' : period) + '|' + (day || '') + '|' + (route.view || '');
}

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

const API_TIMEOUT_MS = 20000, CACHE_TTL_MS = 60000, RETRY_DELAY_MS = 1500, PROFILE_TTL_MS = 600000;

// POST /fxpa/req?leagueId=<id> with {msgs:[{method,data}, …]} and return one data object per message. Fantrax runs
// the messages of one request in series, so slow views go in separate parallel requests. One automatic retry.
// fetchImpl and retryDelay are for tests.
// lenient (1.3.0, profile batches): a message answered without data becomes null instead of failing the whole request.
async function apiMulti(leagueId, msgs, fetchImpl, retryDelay, lenient) {
  try { return await apiOnce(leagueId, msgs, fetchImpl, lenient); }
  catch (e) {
    await new Promise(r => setTimeout(r, retryDelay === undefined ? RETRY_DELAY_MS : retryDelay));
    return apiOnce(leagueId, msgs, fetchImpl, lenient);
  }
}
async function apiOnce(leagueId, msgs, fetchImpl, lenient) {
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
    const out = msgs.map((m, i) => (j && j.responses && j.responses[i] && j.responses[i].data) || null);
    if (lenient) return out;
    if (out.some(d => !d)) throw new Error('empty response for ' + msgs[out.findIndex(d => !d)].method);
    return out;
  } finally { if (killer) clearTimeout(killer); }
}
async function api(leagueId, method, data, fetchImpl) { return (await apiMulti(leagueId, [{ method, data }], fetchImpl))[0]; }

// date (1.3.5, "YYYY-MM-DD"): stats for that one day only — what the roster page's "Days Back" pills send. The lineup
// (slots, statuses) is unchanged; GP becomes that day's games, and Fantrax adds a totals row (no posId, no scorerId).
function rosterMsg(leagueId, view, teamId, period, day, date) {
  const d = { leagueId, view };
  if (period !== null && period !== undefined) d.scoringPeriod = String(period);
  if (day !== null && day !== undefined) d.period = String(day);   // a lineup day; wins over scoringPeriod on Fantrax's side
  if (date) Object.assign(d, { startDate: date, endDate: date, timeframeTypeCode: 'BY_DATE' });
  if (teamId) d.teamId = teamId;
  return { method: 'getTeamRosterInfo', data: d };
}

// The period lists seen per league, so a lineup day can be mapped to its scoring period before the first load.
const periodLists = {};

// The days that start a 7-day SCHEDULE_PERIOD call. A SCHEDULE_PERIOD call (7 columns) lists the roster OF THE DAY it is asked for
// (verified 2026-10-03: the Sep 29 call had no goalie added Sep 30). 1.3.6: so a new call starts at every uncovered day whose lineup
// names someone the previous call's day did not; the calls run in parallel and merge in day order, never overwriting a game already
// found. 1.4.0: SCHEDULE_FULL can lag a fresh add too (2026-10-07: Faulk, added Wed just after midnight, was in Wednesday's lineup
// but not in the 30-day schedule from Wednesday), so a covered day whose lineup names someone the 30-day schedule lacks also starts
// a call, and that call's games count on covered days for those players only. A day's decision depends on earlier days only.
function planChunks(days, statusByDay, covered, inFull) {
  const out = [];
  let chunkIds = null, chunkEnd = null;
  for (const d of days) {
    const ids = Object.keys(statusByDay[d] || {}), need = covered.has(d) ? ids.filter(id => !inFull.has(id)) : ids;
    if (covered.has(d) && !need.length) continue;
    if (chunkEnd === null || d > chunkEnd || need.some(id => !chunkIds.has(id))) { out.push(d); chunkIds = new Set(ids); chunkEnd = addDays(d, 6); }
  }
  return out;
}

// One team for one scoring period → {teamId, teamName, period, groups:{skaters, goalies}}.
// period: scoring period id, or null for Fantrax's current one; day: a lineup day whose scoring period is wanted
// instead (the roster page's Stats tab). Requests, measured 2026-09-23: games-played (0.1 s); then in parallel the
// 30-day schedule (0.9 s) and one STATS call per lineup day of the period (0.8 s each, past days included since 1.2.0) —
// the per-day lineups. Days the 30-day schedule does not reach fall back to 7-day SCHEDULE_PERIOD calls (3.5 s each).
// profiles (2026-10-18): the return dates are on, so the profiles are asked early (loadReturnTexts' cache; withReturnDates reads it).
async function loadTeam(leagueId, { teamId, period, day, profiles }, fetchImpl, now, retryDelay) {
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
  // Schedule answers by request, kept on the team (team.schedule) for reuseSchedule. Handed-over answers are used only while every
  // lineup day names the same players as the team they came from (team.rosterKey); otherwise everything is asked again.
  let reuse = schedReuse && schedReuse.leagueId === leagueId && Date.now() - schedReuse.at < SCHEDULE_REUSE_MS ? schedReuse : null;
  const fetchedAt = Date.now();
  const asked = {}, schedule = {}, reused = new Set();
  const sched = msg => {
    const k = JSON.stringify(msg.data), hit = reuse && k in reuse.responses;
    if (!(k in asked)) {
      if (hit) reused.add(k);
      const mine = (hit ? Promise.resolve(reuse.responses[k]) : one(msg)).then(d => { if (asked[k] === mine) schedule[k] = d; return d; });
      asked[k] = mine;
    }
    return asked[k];
  };
  const periodMsg = d => rosterMsg(leagueId, 'SCHEDULE_PERIOD', teamId, null, indexFromDay(start, d)), fullMsg = rosterMsg(leagueId, 'SCHEDULE_FULL', teamId);
  const fullAsked = sched(fullMsg);
  const statsAsked = lineupDays.map(d => one(rosterMsg(leagueId, 'STATS', teamId, null, indexFromDay(start, d), d <= today ? d : null)));   // 1.3.6: every day up to today asks that day's GP
  // 2026-10-18 speed, all of it prefetching only (the plan below alone decides what is used; an unused answer is a wasted read):
  // the 30-day schedule starts today, so a period that began before today always needs the 7-day call from its first day (asked
  // with the first wave), and the later 7-day calls for past days follow from those days' lineups alone (asked once they are in,
  // not after today's slower lineup and the 30-day schedule); the return dates start from the first lineup's injury icons
  // (the same icons as the schedule rows', verified 2026-10-18 on both leagues).
  const past = lineupDays.filter(d => d < today);
  if (past.length) {
    sched(periodMsg(past[0])).catch(() => {});
    Promise.all(past.map(d => statsAsked[lineupDays.indexOf(d)])).then(list => {
      const byDay = {}; past.forEach((d, i) => { byDay[d] = parseDayLineup(list[i]).statuses; });
      for (const d of planChunks(past, byDay, new Set(), new Set())) sched(periodMsg(d)).catch(() => {});
    }, () => {});
  }
  if (profiles) Promise.any(statsAsked).then(d => {
    const ids = [];
    for (const t of (d && d.tables) || []) for (const r of t.rows || []) if (r.scorer && r.scorer.scorerId && DATED_FLAGS.has(rowFlag(r.scorer.icons)) && !ids.includes(r.scorer.scorerId)) ids.push(r.scorer.scorerId);
    if (ids.length) loadReturnTexts(leagueId, ids, fetchImpl, retryDelay);
  }, () => {});
  let [full, ...dayData] = await Promise.all([fullAsked].concat(statsAsked));
  const statusByDay = {}, detailByDay = {}, gpByDay = {}, lineups = {}, statusNames = {};
  dayData.forEach((d, i) => {
    const day = lineupDays[i], l = parseDayLineup(d);
    lineups[day] = l; statusByDay[day] = l.statuses; detailByDay[day] = l.detail; Object.assign(statusNames, l.statusNames);
    if (day <= today) gpByDay[day] = l.gp;                           // a later day's GP column is the season's, not the day's
  });
  const rosterKey = lineupDays.map(d => d + ':' + Object.keys(statusByDay[d] || {}).sort().join(',')).join('|');
  if (reuse && reuse.rosterKey !== rosterKey) {   // the roster changed since those answers: every reused one is asked again
    reuse = null;
    for (const k of reused) { delete asked[k]; delete schedule[k]; }
    full = await sched(fullMsg);
  }
  const covered = new Set(coveredDays(full, p));
  const rows = parseScheduleRows(full, p);
  const inFull = new Set(rows.skaters.concat(rows.goalies).map(r => r.id));
  const chunkDays = planChunks(p.days, statusByDay, covered, inFull);
  const chunks = await Promise.all(chunkDays.map(d => sched(rosterMsg(leagueId, 'SCHEDULE_PERIOD', teamId, null, indexFromDay(start, d)))));
  chunks.forEach((data, i) => {
    const from = chunkDays[i], until = addDays(from, 6), chunk = parseScheduleRows(data, p);
    for (const group of ['skaters', 'goalies']) for (const r of chunk[group]) {
      let target = rows[group].find(x => x.id === r.id);
      if (!target) { target = { id: r.id, name: r.name, shortName: r.shortName, pos: r.pos, injured: r.injured, tag: r.tag, flag: r.flag, returnDate: null, returnText: null, games: [] }; rows[group].push(target); }
      for (const gm of r.games) if (gm.day >= from && gm.day <= until && (!covered.has(gm.day) || !inFull.has(r.id)) && !target.games.some(x => x.day === gm.day)) target.games.push(gm);
    }
  });
  for (const group of ['skaters', 'goalies']) for (const r of rows[group]) r.games.sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
  return { teamId: g.teamId, teamName: g.teamName, ownTeam: g.ownTeam, period: p, seasonStartDay: start, lineups, statusNames,
    schedule, rosterKey, scheduleAt: reuse ? reuse.at : fetchedAt, groups: {
    skaters: { played: g.played.skaters, max: g.max.skaters, rows: applyDayStatuses(rows.skaters, statusByDay, detailByDay, gpByDay) },
    goalies: { played: g.played.goalies, max: g.max.goalies, rows: applyDayStatuses(rows.goalies, statusByDay, detailByDay, gpByDay) },
  } };
}

const cache = new Map();
// keepProfiles (2026-10-18): the reloads around a lineup save keep the return-date texts (their own 10-minute TTL still applies).
function clearCache(keep) { cache.clear(); editCache.clear(); schedReuse = null; if (!(keep && keep.keepProfiles)) profileCache.clear(); }
// 2026-10-18: the reloads around a lineup save (before it: locks and roster changes; after it: the new lineups) take the schedule
// answers of the team on screen (`team.schedule`) instead of asking again: a lineup save changes no game and no roster member, and a
// roster change is caught by loadTeam (rosterKey). Answers at most SCHEDULE_REUSE_MS old (counted from when they were fetched, so a
// long edit session cannot stretch it); ended by the next clearCache.
const SCHEDULE_REUSE_MS = 10 * 60 * 1000;
let schedReuse = null;
function reuseSchedule(leagueId, team) { schedReuse = team && team.schedule ? { leagueId, at: team.scheduleAt, responses: team.schedule, rosterKey: team.rosterKey } : null; }
function cacheKey(leagueId, teamId, period, day) { return leagueId + '|' + (teamId || 'me') + '|' + (period === null || period === undefined ? 'cur' : period) + '|' + (day || ''); }
// allowStale (1.3.0): serve an expired entry rather than reload — the option toggle re-renders what is on screen.
const cacheHas = (leagueId, args, allowStale) => { const hit = cache.get(cacheKey(leagueId, args.teamId, args.period, args.day)); return !!hit && (allowStale || Date.now() - hit.at < CACHE_TTL_MS); };
function cachedLoadTeam(leagueId, args, fetchImpl, now, retryDelay, allowStale) {
  const key = cacheKey(leagueId, args.teamId, args.period, args.day);
  const hit = cache.get(key);
  if (hit && (allowStale || Date.now() - hit.at < CACHE_TTL_MS)) return hit.promise;
  const entry = { at: Date.now(), promise: loadTeam(leagueId, args, fetchImpl, now, retryDelay) };
  cache.set(key, entry);
  // a load asked by lineup day (or Fantrax's default) is the same data as its resolved scoring period
  entry.promise.then(team => { cache.set(cacheKey(leagueId, args.teamId, team.period.id, null), entry); },
    () => { for (const [k, v] of cache) if (v === entry) cache.delete(k); });
  return entry.promise;
}

// ---- 1.3.0: expected return dates. getPlayerProfile {leagueId, playerId} (read-only; what the web app calls when a
// player card opens) → sectionContent.OVERVIEW.injuryInfo.injuryMsgs[0] = "Expected to return on Sat Sep 26 - <i>Out
// Indefinitely.</i>" (verified 2026-09-26: every Out / IR-list / Day-to-day player carried one, Suspended none).
// ~22 KB per player, so one batched request per team and a 10-minute cache per player; a failure is null, not cached.
const profileCache = new Map();
function profileMsg(leagueId, scorerId) { return { method: 'getPlayerProfile', data: { leagueId, playerId: scorerId } }; }
// The report lives in sectionContent.OVERVIEW.injuryInfo (seen live 2026-09-26); any section holding one is accepted.
function injuryText(d) {
  const sc = (d && d.sectionContent) || {};
  const info = sc.injuryInfo || Object.keys(sc).map(k => sc[k] && sc[k].injuryInfo).find(Boolean), msgs = info && info.injuryMsgs;
  return Array.isArray(msgs) && typeof msgs[0] === 'string' ? msgs[0].replace(/<[^>]*>/g, '') : null;
}
// {scorerId: text | null} for the given ids, one request for the uncached ones.
function loadReturnTexts(leagueId, scorerIds, fetchImpl, retryDelay) {
  const t = Date.now(), fresh = [];
  for (const id of scorerIds) {
    const key = leagueId + '|' + id, hit = profileCache.get(key);
    if (!hit || t - hit.at >= PROFILE_TTL_MS) fresh.push(id);
  }
  if (fresh.length) {
    const req = apiMulti(leagueId, fresh.map(id => profileMsg(leagueId, id)), fetchImpl, retryDelay, true).then(list => list.map(injuryText),
      err => { console.warn(LOG, 'return dates', err); for (const id of fresh) profileCache.delete(leagueId + '|' + id); return fresh.map(() => null); });
    fresh.forEach((id, i) => profileCache.set(leagueId + '|' + id, { at: t, promise: req.then(list => list[i]) }));
  }
  return Promise.all(scorerIds.map(id => profileCache.get(leagueId + '|' + id).promise)).then(texts => {
    const out = {}; scorerIds.forEach((id, i) => { out[id] = texts[i]; }); return out;
  });
}
const DATED_FLAGS = new Set(['out', 'ir', 'dtd']);   // Suspended players carry no date on Fantrax
// A copy of `team` whose flagged rows carry returnText and returnDate; the same object when nothing is flagged.
async function withReturnDates(leagueId, team, fetchImpl, now, retryDelay) {
  const ids = [];
  for (const g of ['skaters', 'goalies']) for (const r of team.groups[g].rows) if (DATED_FLAGS.has(r.flag) && r.id && !ids.includes(r.id)) ids.push(r.id);
  if (!ids.length) return team;
  const texts = await loadReturnTexts(leagueId, ids, fetchImpl, retryDelay), today = dayString(now || new Date());
  const groups = {};
  for (const g of ['skaters', 'goalies']) groups[g] = Object.assign({}, team.groups[g], { rows: team.groups[g].rows.map(r => {
    if (!(r.id in texts)) return r;
    const text = texts[r.id];
    return Object.assign({}, r, { returnText: text, returnDate: parseReturnDate(text === null ? null : [text], today) });
  }) });
  return Object.assign({}, team, { groups });
}

// ---- 1.4.0: what lineup editing reads (loaded by itself on the user's own team since 2026-10-18; real shapes from the 2026-10-05 spike)
// {scorerId: {gp, fpg}} from the GP and FP/G columns (header shortName); fpg null when the cell is not a number ("-");
// {} when the response has no GP column.
function parseSeasonStats(data) {
  const out = {};
  for (const table of (data && data.tables) || []) {
    const cells = (table.header && table.header.cells) || [], col = n => cells.findIndex(c => c && (c.shortName || c.name) === n), g = col('GP'), f = col('FP/G');
    if (g < 0) continue;
    const num = (row, i) => { const c = i >= 0 && row.cells && row.cells[i] && row.cells[i].content; return c === '' || c === null || c === undefined ? NaN : Number(c); };
    for (const row of table.rows || []) {
      const id = row.scorer && row.scorer.scorerId, gp = num(row, g), fpg = num(row, f);
      if (id && Number.isFinite(gp)) out[id] = { gp, fpg: Number.isFinite(fpg) ? fpg : null };
    }
  }
  return out;
}
// miscData.statusTotals max: total = Active + Reserve, ir = Inj Res (ids '1','2','3'); null when missing.
function parseRosterLimits(data) {
  const st = (data && data.miscData && data.miscData.statusTotals) || [], max = id => { const s = st.find(x => x && String(x.id) === id); return s && Number.isFinite(Number(s.max)) && s.max !== null ? Number(s.max) : null; };
  const a = max('1'), r = max('2'), ir = max('3');
  return { total: a !== null && r !== null ? a + r : null, ir, irCountsTowardTotal: false };
}
function ownTeamId(data) {
  const id = data && data.displayedSelections && data.displayedSelections.displayedFantasyTeamId;
  return id && Array.isArray(data.myTeamIds) && data.myTeamIds.includes(id) ? String(id) : null;
}
function isOwnTeam(data) { return ownTeamId(data) !== null; }
// Daily lineups: every period label is one date ("7 (Mon Oct 5)"); no explicit field exists.
function isDailyLineups(data) {
  const list = data && data.displayedLists && data.displayedLists.periodList;
  return Array.isArray(list) && list.length > 0 && list.every(p => /^\d+ \(\w{3} \w{3} \d{1,2}\)$/.test(String(p)));
}
// 2026-10-21: players on this week's lineups who are not in the current roster's STATS (dropped earlier in the week) → the last
// day each was on the roster, grouped: [{day, n, ids}] in day order. [] without a season start (no day index to ask for).
function missingStatsDays(team, fpg) {
  const last = {};
  if (!team || !team.seasonStartDay) return [];
  for (const day of Object.keys(team.lineups || {}).sort()) for (const id of Object.keys((team.lineups[day] && team.lineups[day].detail) || {})) if (!(id in fpg)) last[id] = day;
  const byDay = {};
  for (const [id, day] of Object.entries(last)) (byDay[day] = byDay[day] || []).push(id);
  return Object.keys(byDay).sort().map(day => ({ day, n: indexFromDay(team.seasonStartDay, day), ids: byDay[day] }));
}
const editCache = new Map();
// → extras for buildEditModel: one STATS request for this season. timeframeTypeCode YEAR_TO_DATE is required: in season, Fantrax's default
// for the roster's STATS view is the current period (SEASON_x_BY_PERIOD: 0 GP for everyone at a period's start; found 2026-10-18).
// Cached per league + team for CACHE_TTL_MS; a failed load rejects and is not cached.
function loadEditExtras(leagueId, team, route, fetchImpl, retryDelay) {
  const key = leagueId + '|' + (route.teamId || 'me'), hit = editCache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.promise;
  const promise = (async () => {
    const msg = rosterMsg(leagueId, 'STATS', route.teamId); msg.data.timeframeTypeCode = 'YEAR_TO_DATE';
    const a = (await apiMulti(leagueId, [msg], fetchImpl, retryDelay))[0];
    let applyToFuture = a.miscData && typeof a.miscData.applyToFuturePeriods === 'boolean' ? a.miscData.applyToFuturePeriods : null;
    if (applyToFuture === null) for (const d of Object.keys((team && team.lineups) || {}).sort()) { const m = team.lineups[d] && team.lineups[d].misc; if (m && typeof m.applyToFuturePeriods === 'boolean') { applyToFuture = m.applyToFuturePeriods; break; } }
    const fpg = parseSeasonStats(a);
    // Dropped players: a past lineup day asked with a date range (season start → today) lists that day's roster with each player's season
    // so far (YEAR_TO_DATE there would stop at that day). One request per day, in parallel; a failed day leaves its players without numbers.
    const today = dayString(new Date());
    await Promise.all(missingStatsDays(team, fpg).map(async ({ n, ids }) => {
      const m = rosterMsg(leagueId, 'STATS', route.teamId, null, n); Object.assign(m.data, { startDate: team.seasonStartDay, endDate: today, timeframeTypeCode: 'BY_DATE' });
      try { const got = parseSeasonStats((await apiMulti(leagueId, [m], fetchImpl, retryDelay))[0]); for (const id of ids) if (got[id]) fpg[id] = got[id]; }
      catch (e) { console.warn(LOG, 'season stats for dropped players', e); }
    }));
    return { fpg, limits: parseRosterLimits(a), ownTeam: isOwnTeam(a), daily: isDailyLineups(a), applyToFuture: !!applyToFuture };
  })();
  editCache.set(key, { at: Date.now(), promise });
  promise.catch(() => { if (editCache.get(key) && editCache.get(key).promise === promise) editCache.delete(key); });
  return promise;
}

// ---- 1.4.0: the script's ONLY write. leagueId goes in the URL (apiOnce); the payload is exactly what Fantrax's own lineup page sends
// for a manager (no daily, no adminMode); confirm: true = a dry run that saves nothing.
function lineupMsg(leagueId, teamId, n, fieldMap, applyToFuturePeriods, confirm) {
  const data = { rosterLimitPeriod: String(n), fantasyTeamId: teamId, fieldMap, applyToFuturePeriods };
  if (confirm) data.confirm = true;
  return { method: 'confirmOrExecuteTeamRosterChanges', data };
}
// One day: dry run → interpret → execute once → re-read and compare. req = a saveRequests entry {di, n, fieldMap, applyToFuturePeriods};
// opts: unused since 2026-10-18 (kept so callers need not change).
// Both lineup calls go through apiOnce: never retried automatically. An execute that errors, times out or answers badly may still have
// been saved, so it always goes on to the re-read (a read: apiMulti, one retry), which alone decides saved / failed.
// → {di, status: 'saved'|'held'|'failed', messages, changes? (saved: the dry run's [{scorerId, text}]), banner?}
async function saveDay(leagueId, teamId, req, opts, fetchImpl, retryDelay) {
  const sent = await sendDay(leagueId, teamId, req, opts, fetchImpl);
  return sent.result || checkDay(leagueId, teamId, req, sent, fetchImpl, retryDelay);
}
// saveDay's first half: dry run → interpret → execute once. → {result} when the day ends here (held, or nothing to change), else
// {dry, banner, execNote} for checkDay.
async function sendDay(leagueId, teamId, req, opts, fetchImpl) {
  const send = confirm => apiOnce(leagueId, [lineupMsg(leagueId, teamId, req.n, req.fieldMap, req.applyToFuturePeriods, confirm)], fetchImpl).then(r => r[0]);
  let dry;
  try { dry = interpretResponse(await send(true), { dryRun: true }); }
  catch (e) { return { result: { di: req.di, status: 'held', messages: ['Could not check this lineup with Fantrax: ' + (e && e.message || e)] } }; }
  if (dry.kind === 'none') return { result: { di: req.di, status: 'saved', messages: ['Fantrax already has this lineup'] } };
  if (dry.kind === 'locked' || dry.kind === 'error') return { result: { di: req.di, status: 'held', messages: [dry.mainMsg || 'Fantrax refused this lineup'] } };
  // Strict (user 2026-10-18): any illegal message from Fantrax holds the day, even when our own count says it is legal. Fantrax flags the
  // whole roster, so while another day is illegal on Fantrax nothing saves until that day is fixed there; until 2026-10-18 that case
  // was saved on our count alone, which trusted rules this script may not model.
  const banner = undefined;
  if (dry.kind === 'illegal') return { result: { di: req.di, status: 'held', messages: dry.illegal.concat(["Fantrax says the roster is illegal; if that is another day's lineup, fix it on Fantrax, then save again."]) } };
  let execNote = null;
  try { const x = interpretResponse(await send(false)); if (x.kind !== 'ok') execNote = x.mainMsg || x.illegal.join(' ') || null; }
  catch (e) { execNote = String(e && e.message || e); }
  return { dry, banner, execNote };
}
// saveDay's second half: re-read the day and compare; the re-read alone decides saved / failed.
async function checkDay(leagueId, teamId, req, { dry, banner, execNote }, fetchImpl, retryDelay) {
  let fresh;
  try { fresh = (await apiMulti(leagueId, [rosterMsg(leagueId, 'STATS', teamId, null, req.n)], fetchImpl, retryDelay))[0]; }
  catch (e) { return Object.assign({ di: req.di, status: 'failed', messages: ['Could not check the save: ' + (e && e.message || e)] }, banner ? { banner } : {}); }
  const kept = sameFieldMap(fieldMapFromLineup(parseDayLineup(fresh)), req.fieldMap);
  const messages = kept ? dry.changes.map(c => c.text).filter(Boolean) : ['Fantrax did not keep this lineup'].concat(execNote ? [execNote] : []);
  return Object.assign({ di: req.di, status: kept ? 'saved' : 'failed', messages }, kept ? { changes: dry.changes } : {}, banner ? { banner } : {});
}
// Every request in order (saveRequests' date order, the "keep for later days" day last), dry run and execute one day at a time; a
// failure never stops the next. 2026-10-18: the re-reads then run together (one round trip instead of one per day): only the last
// day carries its lineup forward, so no later execute changes an earlier day.
async function saveAll(leagueId, teamId, reqs, optsByDi, fetchImpl, retryDelay) {
  const fail = (req, e) => ({ di: req.di, status: 'failed', messages: [String(e && e.message || e)] }), sent = [];
  for (const req of reqs) {
    try { sent.push(await sendDay(leagueId, teamId, req, (optsByDi || {})[req.di], fetchImpl)); }
    catch (e) { sent.push({ result: fail(req, e) }); }
  }
  return Promise.all(reqs.map((req, i) => sent[i].result || checkDay(leagueId, teamId, req, sent[i], fetchImpl, retryDelay).catch(e => fail(req, e))));
}

// ---------------------------------------------------------------- DOM: shared

const SEL = {
  // Matchups page (2026-09-23): 3 heads per matchup — team A, middle, team B; name link href carries teamId=<id>
  matchupHeads: 'header.scoring-table__row div.scoring-table__head',
  matchupBlock: 'league-livescoring-table-header',
  matchupName: 'header.scoring-header__name a',
  matchupRow: 'header.scoring-table__row',   // the row holding the three heads; the 1.3.0 checkbox goes right before the first one
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
// 1.3.0: with the return-date option on, Sched / Potential cells that differ from the flag-only reading turn violet and
// a footer lists every flagged player by effect (gained / lost / no change), each name carrying Fantrax's text on hover.
const RET_COLOR = '#c4b5fd';
const EFFECT_LINES = [['gained', 'Counted from the date:', RET_COLOR], ['lost', 'Day-to-day, not counted before the date:', COLORS.unused], ['none', 'No change:', '#8b93a7']];
function buildEffectLines(team, now) {
  const x = explainTeam(team, now), lines = [];
  for (const [group, heading, color] of EFFECT_LINES) {
    if (!x[group].length) continue;
    const kids = [el('span', { style: 'color:#7c8497;margin-right:6px', text: heading })];
    x[group].forEach((e, i) => {
      if (i) kids.push(' · ');
      const row = [].concat(team.groups.skaters.rows, team.groups.goalies.rows).find(r => r.id === e.id);
      kids.push(el('span', { title: (row && row.returnText) || (row && row.tag && row.tag.tip) || '', text: formatEffect(e) }));
    });
    lines.push(el('div', { style: 'color:' + color, 'data-fgt-line': group }, kids));
  }
  return lines;
}
// 1.3.1: one blue line per off-lineup entry (IR players back this period, or in IR with no injury flag); never counted.
const OFF_COLOR = '#93c5fd';
function buildOffLines(team, now, opts) {
  const rows = [].concat(team.groups.skaters.rows, team.groups.goalies.rows);
  const all = offLineup(team, now, opts);
  return all.map(e => {
    const row = rows.find(r => r.id === e.id), text = formatOffLineup(e, all), i = text.indexOf(e.name);
    const kids = i >= 0 ? [text.slice(0, i), el('span', { title: (row && row.returnText) || (row && row.tag && row.tag.tip) || '', text: e.name }), text.slice(i + e.name.length)] : [text];
    return el('div', { style: 'color:' + OFF_COLOR, 'data-fgt-line': 'off' }, kids);
  });
}
function buildTable(kind, key, team, now, opts) {
  const on = !!(opts && opts.returnDates);
  const head = el('tr', { style: 'color:' + COLORS.muted }, [el('th', { style: 'text-align:left;padding:1px 6px;font-weight:normal;white-space:nowrap', text: team.period.start.slice(5) + ' – ' + team.period.end.slice(5) })]
    .concat(['Played', 'Max', 'Left', 'Sched', 'Potential', ''].map(h => el('th', { style: 'padding:1px 6px;text-align:right;font-weight:normal', text: h }))));
  const rows = ['skaters', 'goalies'].map(g => {
    const r = compute(team.groups[g], team.period, now, opts);
    const base = on ? compute(team.groups[g], team.period, now) : r;
    const color = statusColor(r.status);
    const tint = (v, b) => on && v !== b ? 'color:' + RET_COLOR : '';
    return el('tr', {}, [el('td', { style: 'padding:1px 6px;text-align:left', text: g === 'skaters' ? 'Skaters' : 'Goalies' }),
      numCell(r.played), numCell(r.max), numCell(r.left), numCell(r.scheduled, tint(r.scheduled, base.scheduled)), numCell(r.potential, tint(r.potential, base.potential)),
      el('td', { style: 'padding:1px 6px;text-align:left;white-space:nowrap;color:' + color, text: formatStatus(r.status) })]);
  });
  const parts = [head].concat(rows);
  const lines = (on ? buildEffectLines(team, now) : []).concat(buildOffLines(team, now, opts));
  if (lines.length) parts.push(el('tr', {}, [el('td', { colspan: '7', style: 'padding:3px 6px 1px;font:11px/1.5 sans-serif;white-space:normal;text-align:left' }, lines)]));
  return el('table', { 'data-fgt': kind, 'data-fgt-key': key, style: 'font:12px/1.4 sans-serif;border-collapse:collapse;margin:4px 0;color:#e5e7eb' }, parts);
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

// 1.3.0: after a (cached) team load, read the option as of now and attach the return dates when it is on.
function withDates(leagueId) {
  return team => {
    const opts = { returnDates: returnDatesOn() };
    return (opts.returnDates ? withReturnDates(leagueId, team, undefined, new Date()) : Promise.resolve(team)).then(t => ({ team: t, opts }));
  };
}

// ---------------------------------------------------------------- DOM: matchups page

function teamIdFromHead(head) {
  const a = head.querySelector(SEL.matchupName);
  const m = a && /teamId=([a-z0-9]+)/.exec(a.getAttribute('href') || '');
  return m ? m[1] : null;
}

function renderMatchups(route, force, stale) {
  const heads = Array.from(document.querySelectorAll(SEL.matchupHeads));
  const ctlKey = route.leagueId + '|' + (route.period === null ? 'cur' : route.period);
  const firstRow = document.querySelector(SEL.matchupRow);
  if (firstRow && heads.length && !document.querySelector('[data-fgt="retctl"][data-fgt-key="' + ctlKey + '"]')) {
    for (const n of document.querySelectorAll('[data-fgt="retctl"]')) n.remove();
    firstRow.insertAdjacentElement('beforebegin', buildReturnControl('matchups', ctlKey, () => renderMatchups(route, true, true)));
  }
  for (const head of heads) {
    const teamId = teamIdFromHead(head), block = head.querySelector(SEL.matchupBlock);
    if (!teamId || !block) continue;
    const key = teamId + '|' + (route.period === null ? 'cur' : route.period);
    const own = ownNodes(head, 'matchup');
    if (!shouldRender(own.table || own.marker, key, force)) continue;
    beginUpdate(head, 'matchup', key, n => block.insertAdjacentElement('afterend', n));
    const stillWanted = () => head.isConnected && block.isConnected && isCurrent(ownNodes(head, 'matchup').marker, key);
    cachedLoadTeam(route.leagueId, { teamId, period: route.period, day: null, profiles: returnDatesOn() }, undefined, undefined, undefined, stale).then(withDates(route.leagueId)).then(({ team, opts }) => {
      if (!stillWanted()) return;
      finishUpdate(head, 'matchup', () => block.insertAdjacentElement('afterend', buildTable('matchup', key, team, new Date(), opts)));
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

function renderPerDay(team, key, now, opts) {
  for (const table of document.querySelectorAll(SEL.rosterTables)) {
    removeOwn(table, 'perday');                            // 1.3.8: first, so a view without day columns drops stale rows
    const headerRow = table.querySelector(SEL.rosterHeaderRow), body = table.querySelector(SEL.rosterBody);
    if (!headerRow || !body) continue;
    const first = headerRow.querySelector(SEL.cell);
    const group = first && /^Skaters/i.test(first.textContent.trim()) ? 'skaters' : first && /^Goalies/i.test(first.textContent.trim()) ? 'goalies' : null;
    if (!group) continue;
    const { widths, days } = dayCellIndexes(headerRow, team.period);
    if (days.length === 0) continue;                       // not the Schedule - Week view
    const r = compute(team.groups[group], team.period, now, opts);
    const byDay = new Map(r.perDay.map(d => [d.day, d]));
    const active = new Map(), cumulative = new Map();
    for (const { index, day } of days) {
      const d = byDay.get(day);
      if (!d) continue;
      active.set(index, { text: team.lineups && team.lineups[day] ? String(d.active) : '' });
      cumulative.set(index, d.cumulative === null ? { text: '' } : { text: String(d.cumulative), color: d.crosses ? COLORS.over : (r.max !== null && d.cumulative > r.max ? COLORS.over : null) });
    }
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
.fgt-wkbody{border-top:1px solid #2c3140;overflow:auto;max-height:max(320px,calc(100vh - 190px));container-type:inline-size}
.fgt-cols .fgt-dh{position:sticky;top:0;z-index:1;background:#1c1f2b;padding-top:6px;margin-top:-6px}
.fgt-col.fgt-today .fgt-dh{background:#222738;box-shadow:inset 0 2px 0 #5b8def}
.fgt-cols{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(170px,1fr)}
.fgt-col{padding:6px 8px 8px;border-right:1px solid #2c3140;min-width:0}
.fgt-col:last-child{border-right:0}
.fgt-col.fgt-past{opacity:.5}
.fgt-col.fgt-today{background:#222738;box-shadow:inset 0 2px 0 #5b8def}
.fgt-dh{margin-bottom:5px;padding-bottom:4px;border-bottom:1px solid #2c3140;height:40px;box-sizing:border-box;overflow:hidden}
.fgt-dl{display:flex;align-items:baseline;gap:6px;white-space:nowrap}
.fgt-dl a,.fgt-dl b{color:#fff;font-weight:600;text-decoration:none}
.fgt-dl a:hover{color:#93c5fd;text-decoration:underline}
.fgt-go{color:#93c5fd;font-size:10px;margin-left:3px}
.fgt-dst{font-style:normal;font-size:10px;color:#9ca3af;border:1px solid #3b4256;border-radius:3px;padding:0 4px}
.fgt-dst.fgt-dst-today{color:#bfdbfe;border-color:#3b82f6}
.fgt-dc{color:#9ca3af;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fgt-minifill{margin-left:auto;font:600 10px sans-serif;color:#1c1f2b;background:#fbbf24;border:none;border-radius:3px;padding:1px 6px;cursor:pointer}
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
.fgt-ret{background:rgba(196,181,253,.10);border-radius:3px;margin:0 -4px;padding:1px 4px}
.fgt-ret .fgt-nm{color:#c4b5fd}
.fgt-tag-ret{background:rgba(196,181,253,.22);color:#c4b5fd}
.fgt-bench.fgt-ret{opacity:.8}
.fgt-bench.fgt-out .fgt-nm,.fgt-bench.fgt-out .fgt-gm{color:#6b7386;text-decoration:line-through;text-decoration-color:#4b5163}
.fgt-tag-off{background:rgba(147,197,253,.18);color:#93c5fd}
.fgt-tag-new{background:#123f2e;color:#a7f3d0}
.fgt-tag-drop{background:#3a3f50;color:#d1d5db}
.fgt-offrow .fgt-nm{color:#93c5fd}
.fgt-offrow .fgt-gm{color:#8b93a7}
/* 1.4.0 (ported from the design mock): header controls, games meter, bars, edit states, review, grid, dock */
.fgt-btn{font:600 12px sans-serif;border-radius:4px;border:1px solid #3b4256;background:#262a39;color:#e5e7eb;padding:4px 10px;cursor:pointer}
.fgt-btn:hover{background:#2e3345}
.fgt-btn.fgt-pri{background:#2563eb;border-color:#2563eb;color:#fff}
.fgt-btn.fgt-pri:hover{background:#1d4ed8}
.fgt-btn[disabled]{opacity:.45;cursor:default}
.fgt-wk.fgt-saving .fgt-wkbody,.fgt-wk.fgt-saving .fgt-dock{pointer-events:none;opacity:.6}
.fgt-btn.fgt-on{background:#1e3a5f;border-color:#3b82f6;color:#dbeafe}
.fgt-seg{display:inline-flex;border:1px solid #3b4256;border-radius:4px;overflow:hidden}
.fgt-seg button{font:12px sans-serif;background:#262a39;color:#9ca3af;border:none;padding:4px 9px;cursor:pointer}
.fgt-seg button[aria-pressed="true"]{background:#1e3a5f;color:#dbeafe}
.fgt-wkhead .fgt-small{font-size:11px}
.fgt-wkhead .fgt-note{font-size:11px;color:#9ca3af}
.fgt-meter{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:6px 18px;padding:8px 10px;background:#141823;border-top:1px solid #2c3140}
.fgt-meter .fgt-mrow{display:flex;flex-direction:column;gap:4px;min-width:0}
.fgt-meter .fgt-mtop{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}
.fgt-meter .fgt-mtop b{font-size:13px}
.fgt-meter .fgt-num{font-variant-numeric:tabular-nums}
.fgt-meter .fgt-bar2{position:relative;height:10px;background:#262a38;border-radius:2px;overflow:hidden}
.fgt-meter .fgt-seg2{position:absolute;top:0;bottom:0}
.fgt-meter .fgt-mx{position:absolute;top:-2px;bottom:-2px;width:2px;background:#e5e7eb}
.fgt-meter .fgt-sub2{color:#9ca3af;font-size:11px}
.fgt-meter .fgt-bad{color:#fca5a5;font-weight:600}.fgt-meter .fgt-good{color:#6ee7b7}.fgt-meter .fgt-pend{color:#fbbf24}
.fgt-bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:8px 10px;border-top:1px solid #2c3140;background:#191c27;min-height:44px;box-sizing:border-box}
.fgt-bar .fgt-msg{color:#9ca3af;flex:1 1 220px}
.fgt-bar .fgt-msg b{color:#fbbf24}
.fgt-conf{flex:1 1 100%;color:#9ca3af;font-size:11px}
.fgt-toast{font:12px sans-serif;color:#6ee7b7;padding:6px 10px;border-top:1px solid #2c3140;white-space:pre-line;display:flex;align-items:flex-start;gap:8px}
.fgt-toast>span{flex:1}
.fgt-x{background:none;border:none;color:#7c8497;font:16px/1 sans-serif;cursor:pointer;padding:0 4px}
.fgt-x:hover{color:#e5e7eb}
.fgt-review h4 .fgt-x{float:right}
.fgt-err{font:12px sans-serif;color:#9ca3af;padding:6px 10px;border-top:1px solid #2c3140}
.fgt-err a{color:#93c5fd;margin-left:6px;cursor:pointer}
.fgt-banner{margin:0;padding:6px 10px;border-top:1px solid #5c1f24;background:rgba(127,29,29,.25);color:#fecaca;font:12px sans-serif}
.fgt-edit .fgt-pl{border:1px solid transparent;border-radius:3px}
.fgt-edit .fgt-pl[data-click]{cursor:pointer}
.fgt-edit .fgt-pl[data-click]:hover{background:#262b3b}
.fgt-pl.fgt-sel{background:#1e3a5f;border-color:#3b82f6}
.fgt-pl.fgt-tgt{border:1px dashed #60a5fa;background:rgba(96,165,250,.07)}
.fgt-pl.fgt-tgt:hover{background:rgba(96,165,250,.18)}
.fgt-pl.fgt-tgt.fgt-bump{border-color:#f59e0b;background:rgba(245,158,11,.10)}
.fgt-pl.fgt-tgt.fgt-blockd{border-color:#f87171;border-style:dashed;cursor:not-allowed;background:rgba(248,113,113,.08)}
.fgt-pl.fgt-chg .fgt-nm::after{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:#fbbf24;margin-left:5px;vertical-align:1px}
.fgt-dim{opacity:.35}
.fgt-lk{color:#6b7386;font-size:10px;margin-left:2px}
.fgt-pl.fgt-lock{cursor:not-allowed}
.fgt-ovr{outline:1px solid #f87171;outline-offset:-1px}
.fgt-pl.fgt-ovr .fgt-gm::after{content:" over";color:#fca5a5;font-size:9px;font-weight:700}
.fgt-cell.fgt-ovr{outline:1.5px solid #f87171}
.fgt-tag.fgt-tag-over{background:#f87171;color:#1a0f0f;font-size:8px;line-height:11px;padding:0 3px;margin-left:3px}
.fgt-pl.fgt-blank{visibility:hidden}
.fgt-cols .fgt-pl.fgt-haspair{height:auto;flex-wrap:wrap;row-gap:0}
.fgt-pl .fgt-pair{flex:1 0 100%;color:#fbbf24;font-size:9px;line-height:12px;padding-left:2px}
.fgt-cols .fgt-pl{height:20px;box-sizing:border-box;overflow:hidden;align-items:center;margin:0}
.fgt-cols .fgt-pl.fgt-open{padding:0 4px}
.fgt-edit .fgt-bench{opacity:1}
.fgt-sec.fgt-tgtsec{border:1px dashed #60a5fa;background:rgba(96,165,250,.07);color:#93c5fd;cursor:pointer}
.fgt-sec.fgt-tgtsec span{text-transform:none;letter-spacing:0}
.fgt-review{padding:10px 12px;border-top:1px solid #2c3140;background:#171a24}
.fgt-review h4{margin:0 0 6px;font:600 13px sans-serif}
.fgt-review .fgt-day{margin:6px 0}
.fgt-review .fgt-day b{display:inline-block;min-width:78px}
.fgt-review .fgt-ln{color:#d6d9e2;font-size:12px;padding-left:82px}
.fgt-review .fgt-rnote{color:#9ca3af;font-size:12px;margin-top:8px}
.fgt-review .fgt-ok{color:#6ee7b7}.fgt-review .fgt-bad{color:#fca5a5}.fgt-review .fgt-warnl{color:#fbbf24}
/* 2026-10-18 (user): the Grid uses the room it has. Day columns share what the name column leaves (table-layout fixed) and scroll only below
   92 px each; a wide body (container query) widens the name column and puts each name on one line (shorter rows). */
.fgt-grid{--fgt-name:132px;border-collapse:separate;border-spacing:0;font:12px/1.3 sans-serif;table-layout:fixed;width:100%;min-width:calc(var(--fgt-name) + var(--fgt-days) * 92px)}
.fgt-grid th,.fgt-grid td{border-bottom:1px solid #262a38;padding:0}
.fgt-grid thead th{position:sticky;top:0;z-index:2;background:#1c1f2b;text-align:left;padding:5px 6px;border-bottom:1px solid #2c3140;font-weight:600;vertical-align:top}
.fgt-grid thead th.fgt-selday{background:#1a2638}
.fgt-grid .fgt-who,.fgt-grid thead th.fgt-whoh,.fgt-grid .fgt-grp td.fgt-gl,.fgt-grid tfoot td:first-child{position:sticky;left:0;z-index:1;background:#1c1f2b;border-right:1px solid #2c3140;width:var(--fgt-name);min-width:var(--fgt-name);max-width:var(--fgt-name);box-sizing:border-box}
.fgt-grid thead th.fgt-whoh{z-index:3;font-weight:400;color:#7c8497;font-size:11px;vertical-align:bottom}
.fgt-grid tfoot td:first-child{background:#191c27;white-space:normal}
.fgt-grid .fgt-who{padding:2px 6px 2px 8px;white-space:nowrap}
.fgt-grid .fgt-who .fgt-wr{display:flex;align-items:center;gap:4px}
.fgt-grid .fgt-who .fgt-wn{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;line-height:1.2}
.fgt-grid .fgt-who .fgt-p{display:block;color:#7c8497;font-size:10px;overflow:hidden;text-overflow:ellipsis}
.fgt-all{flex:0 0 auto;font:10px sans-serif;border-radius:9px;padding:0 6px;border:1px solid #363c52;color:#7c8497;background:none;white-space:nowrap}
button.fgt-all{color:#93c5fd;border-color:#33507f;background:#1f2c46;cursor:pointer}
button.fgt-all:hover{background:#26375a}
.fgt-grid .fgt-grp td{color:#7c8497;font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:7px 8px 3px;border-bottom:none}
.fgt-grid td.fgt-c{padding:0 3px;overflow:hidden}
.fgt-grid thead th:not(.fgt-whoh){box-sizing:border-box;overflow:hidden}
.fgt-grid .fgt-dh{height:auto;margin-bottom:2px}
.fgt-grid .fgt-dl{flex-wrap:wrap;row-gap:2px}
.fgt-grid .fgt-dl>a,.fgt-grid .fgt-dl>b{flex-basis:100%}
@container (min-width:960px){
.fgt-grid{--fgt-name:230px}
.fgt-grid .fgt-who .fgt-wn{display:flex;align-items:baseline;gap:6px}
.fgt-grid .fgt-who .fgt-p{display:inline;flex:0 1 auto;min-width:0}
}
@container (min-width:1200px){
.fgt-grid{--fgt-name:240px}
.fgt-grid .fgt-dl>a,.fgt-grid .fgt-dl>b{flex-basis:auto}
}
.fgt-grid tfoot td{padding:5px 6px;color:#9ca3af;font-size:11px;border-bottom:none;background:#191c27}
.fgt-grid tfoot .fgt-warn{color:#fbbf24}
.fgt-grid td.fgt-past,.fgt-grid th.fgt-past>*{opacity:.5}
.fgt-grid td.fgt-today{background:rgba(147,197,253,.07)}
.fgt-grid thead th.fgt-today{background:linear-gradient(rgba(147,197,253,.07),rgba(147,197,253,.07)),#1c1f2b}
.fgt-grid th.fgt-today{box-shadow:inset 0 2px 0 #60a5fa}
.fgt-grid th .fgt-dst{font-weight:400}
.fgt-grid .fgt-grp td.fgt-gl{white-space:nowrap;overflow:visible}
.fgt-grid thead th .fgt-minifill{margin-left:0}
.fgt-cell{display:block;width:100%;text-align:left;font:11px sans-serif;border:1px solid transparent;border-radius:3px;padding:3px 5px;margin:2px 0;cursor:pointer;background:none;color:#7c8497;white-space:nowrap;min-height:22px}
.fgt-cell.fgt-act{background:#24395c;color:#dbeafe;border-color:#33507f}
.fgt-cell.fgt-act .fgt-sl{color:#8fb3e8;font-size:10px;margin-right:4px}
.fgt-cell.fgt-act.fgt-ng{background:repeating-linear-gradient(135deg,#2a2e3c 0 5px,#252936 5px 10px);color:#6b7386;border-color:#3a3f50}
.fgt-cell.fgt-bn.fgt-hg{border:1px dashed rgba(251,191,36,.6);color:#e9d8a6}
.fgt-cell.fgt-bn.fgt-ng{color:#5b6276;font-style:italic}
.fgt-cell:hover{filter:brightness(1.2)}
.fgt-cell.fgt-chg{box-shadow:inset 0 0 0 1px #fbbf24}
.fgt-cell.fgt-strk .fgt-gt{text-decoration:line-through;text-decoration-color:#6b7386;color:#7c8497}
.fgt-cell .fgt-gt{margin-left:2px}
.fgt-cell.fgt-na{cursor:default;color:#3f4454}
.fgt-cell.fgt-lockd{cursor:not-allowed}
.fgt-grid td.fgt-c{position:relative}
.fgt-c .fgt-irb{position:absolute;top:50%;transform:translateY(-50%);font:700 11px/1 sans-serif;border-radius:3px;cursor:pointer;opacity:0;padding:2px 4px}
.fgt-c .fgt-irb{right:26px;border:1px solid #6b7386;color:#d1d5db;background:#2a2e3c;font-size:9px}
/* 2026-10-18: the always-visible IR chip is a small corner badge, so the game text and a RET tag keep the whole 118 px cell */
.fgt-c.fgt-hasirb .fgt-irb{right:5px;top:3px;transform:none;opacity:1;font:700 8px/9px sans-serif;padding:0 2px;background:#1c1f2b}
.fgt-c.fgt-hasirb .fgt-cell:has(.fgt-tag){padding-right:20px}

.fgt-c:hover .fgt-irb,.fgt-c:focus-within .fgt-irb{opacity:1}
@media (hover:none){.fgt-c .fgt-irb{opacity:.85}}
.fgt-cell.fgt-gx{position:relative;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:3px}
.fgt-cell.fgt-gx .fgt-gt{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis}
.fgt-cell.fgt-gx>:not(.fgt-gt){flex:none}
.fgt-cell.fgt-gx .fgt-sl{margin-right:1px}
.fgt-cell.fgt-gx.fgt-sel{background:#1e3a5f;border-color:#3b82f6;color:#dbeafe}
.fgt-cell.fgt-gx.fgt-tgt{border:1px dashed #60a5fa;box-shadow:inset 0 0 0 999px rgba(96,165,250,.12)}
.fgt-cell.fgt-gx.fgt-tgt.fgt-bump{border-color:#f59e0b;box-shadow:inset 0 0 0 999px rgba(245,158,11,.10)}
.fgt-cell.fgt-gx.fgt-tgt.fgt-blockd{border-color:#f87171;border-style:dashed;cursor:not-allowed;box-shadow:none;background:rgba(248,113,113,.08)}
.fgt-cell.fgt-gx.fgt-dim{opacity:.4}
.fgt-cell.fgt-gx.fgt-pv{outline:2px dashed #60a5fa;outline-offset:-2px}
.fgt-cell.fgt-gx.fgt-pvb{outline:2px dashed #f59e0b;outline-offset:-2px}
.fgt-cell.fgt-gx.fgt-pvs{outline:2px solid #60a5fa;outline-offset:-2px}
.fgt-chip{font:700 10px sans-serif;color:#fbbf24;background:none;border:1px dashed rgba(251,191,36,.55);border-radius:3px;padding:1px 4px;margin:2px 3px 0 0;cursor:pointer}
.fgt-chip.fgt-tgt{border:1px dashed #60a5fa;background:rgba(96,165,250,.12)}
.fgt-chip[disabled]{cursor:default;opacity:.6}
.fgt-pick{margin:8px 10px;padding:8px 10px;border:1px solid #3b82f6;border-radius:4px;background:#172338;font:12px sans-serif}
.fgt-pick .fgt-q{margin-bottom:6px}
.fgt-pick .fgt-btn{margin:2px 4px 2px 0}
.fgt-pick .fgt-opt-bump{border-color:#f59e0b}
.fgt-pick .fgt-opt-open,.fgt-pick .fgt-opt-shift{border-color:#3b82f6}
.fgt-pick .fgt-warnl{color:#fbbf24}
.fgt-dock{background:#141823;border-top:1px solid #3b82f6;max-height:40vh;overflow-y:auto}
.fgt-btn.fgt-link{background:none;border-color:transparent;color:#9ca3af;font-weight:400;text-decoration:underline}
.fgt-btn.fgt-link:hover{background:none;color:#e5e7eb}
.fgt-cell.fgt-gx.fgt-tgt.fgt-sits{border:1.5px solid #4ade80;box-shadow:inset 0 0 0 999px rgba(74,222,128,.14);padding-right:34px}
.fgt-cell.fgt-gx.fgt-sits::after{content:"sits ⇄";position:absolute;right:3px;top:50%;transform:translateY(-50%);font:700 9px sans-serif;color:#4ade80;background:none}
@media (prefers-reduced-motion:no-preference){.fgt-cell.fgt-gx.fgt-sits{animation:fgt-pulse 1.2s ease-in-out infinite}}
@keyframes fgt-pulse{50%{filter:brightness(1.4)}}
.fgt-dock .fgt-pick{margin:0;border:none;border-radius:0}
.fgt-bad2{color:#fca5a5;font-weight:600}
.fgt-wk button:focus-visible,.fgt-wk a:focus-visible{outline:2px solid #93c5fd;outline-offset:2px}
@media (prefers-reduced-motion:no-preference){.fgt-pl,.fgt-cell{transition:background .12s,border-color .12s}}
`;
function ensureWeekStyle() {
  if (document.getElementById('fgt-style')) return;
  const st = el('style', { id: 'fgt-style', 'data-fgt': 'css' }); st.textContent = WEEK_CSS;
  (document.head || document.documentElement).appendChild(st);
}
const WEEK_COLLAPSED_KEY = 'fgt-week-collapsed';
function weekCollapsed() { try { return localStorage.getItem(WEEK_COLLAPSED_KEY) === '1'; } catch (e) { return false; } }
function setWeekCollapsed(v) { try { localStorage.setItem(WEEK_COLLAPSED_KEY, v ? '1' : '0'); } catch (e) { /* private mode */ } }

// ---- 1.3.0: the "count from the expected return date" option, one setting for the whole script
const RETURN_DATES_KEY = 'fgt-return-dates';
function returnDatesOn() { try { return localStorage.getItem(RETURN_DATES_KEY) === '1'; } catch (e) { return false; } }
function setReturnDatesOn(v) { try { localStorage.setItem(RETURN_DATES_KEY, v ? '1' : '0'); } catch (e) { /* private mode */ } }
const RETURN_LABEL = 'Count players from their Fantrax expected return date';
const RETURN_OFF_NOTE = 'off: Out / IR / Suspended never count, Day-to-day always counts';
// A checkbox + label (+ on the roster page a muted note while off). onChange(checked) runs after the setting is saved.
function buildReturnControl(page, key, onChange) {
  const id = 'fgt-ret-' + page, on = returnDatesOn();
  const box = el('input', { type: 'checkbox', id, style: 'width:14px;height:14px;margin:0;accent-color:#5b8def;vertical-align:-2px' });
  box.checked = on;
  const note = page === 'roster' ? el('small', { style: 'color:#7c8497;font-size:11px;margin-left:8px' + (on ? ';display:none' : ''), text: RETURN_OFF_NOTE }) : null;
  box.addEventListener('change', () => { setReturnDatesOn(box.checked); if (note) note.style.display = box.checked ? 'none' : ''; try { onChange(box.checked); } catch (e) { console.warn(LOG, 'return dates toggle', e); } });
  const kids = [box, el('label', { for: id, style: 'margin-left:6px;cursor:pointer', text: RETURN_LABEL })];
  if (note) kids.push(note);
  return el('div', { 'data-fgt': 'retctl', 'data-fgt-key': key, style: 'font:12px/1.4 sans-serif;color:#c4c9d6;margin:4px 0' }, kids);
}

function slotLine(s, extraClass) {
  const kids = [el('span', { class: 'fgt-pos', text: s.pos })];
  if (s.kind === 'open') kids.push(el('span', { class: 'fgt-nm', text: 'open slot' }), el('span', { class: 'fgt-gm', text: '' }));
  else if (s.kind === 'idle') kids.push(el('span', { class: 'fgt-nm', text: 'empty' }), el('span', { class: 'fgt-gm', text: s.shortName, title: s.name + ': no game' }));
  else {
    kids.push(el('span', { class: 'fgt-nm', text: s.shortName, title: s.name }));
    const extra = s.returnText ? ' · ' + s.returnText : '';
    if (s.kind === 'ret') kids.push(el('span', { class: 'fgt-tag fgt-tag-ret', text: 'RET', title: (s.tag ? s.tag.text : 'flagged') + extra }));   // 1.3.0: counted from the expected return date
    else if (s.short) kids.push(el('span', { class: 'fgt-tag fgt-tag-off', text: s.short, title: (s.tag ? s.tag.tip || s.tag.text : 'no injury flag') + extra }));   // 1.3.1: an off-lineup (IR) row, not counted
    else if (s.tag) kids.push(el('span', { class: 'fgt-tag fgt-tag-' + s.tag.kind, text: s.tag.text, title: (s.tag.tip || s.tag.text) + extra }));
    kids.push(el('span', { class: 'fgt-gm', text: s.kind === 'out' ? s.opp : (s.opp + ' ' + s.time).trim() }));   // an out player's start time is noise
  }
  return el('div', { class: 'fgt-pl' + (s.kind && s.kind !== 'game' ? ' fgt-' + s.kind : '') + (extraClass ? ' ' + extraClass : '') }, kids);
}

// ---- 1.4.0: the panel controller. EDIT holds everything the Week panel draws; rerenderWeek() rebuilds the panel from it alone
// (no request). Every node the panel adds sits inside the root carrying data-fgt="week", which the page observer ignores: views
// never patch the DOM in place, they change EDIT and call rerenderWeek().
// Views: buildColumnsBody(EDIT) / buildGridBody(EDIT) each return the body under the meter (Tasks 11 / 12 replace them).
// Edits go through applyEdit(di, L) / applyLineups(lineups) (undo snapshot, sessionStorage, re-render); undoEdit(); discardAll().
const WEEK_VIEW_KEY = 'fgt-week-view';
function weekViewChoice() { try { return localStorage.getItem(WEEK_VIEW_KEY) === 'grid' ? 'grid' : 'columns'; } catch (e) { return 'columns'; } }
function setWeekViewChoice(v) { try { localStorage.setItem(WEEK_VIEW_KEY, v); } catch (e) { /* private mode */ } }
const EDIT = { key: null, pkey: null, route: null, team: null, now: null, opts: null, model: null, extras: null, lineups: [], undo: [], editing: false, view: weekViewChoice(),
  sel: null, pick: null, review: false, toast: '', saving: false, results: null, conflicts: [], loading: false, loadError: '', keepLast: null, savePhase: null };
const OWN_TEAMS = {};   // leagueId → the user's own teamId, once a load or the edit extras said so
const baseOf = M => M.days.map(d => cloneLineup(d.base));
const editableDays = M => M.days.some(d => d.slots !== null && d.state !== 'past');
function rebuildModel() { EDIT.model = buildEditModel(EDIT.team, EDIT.extras, EDIT.now, EDIT.opts); }
// On every renderWeek: a new pending key (another team or period) starts read-only with an empty undo stack; the same pending key
// keeps editing, view, undo, the extras, a save result and an open choice that still applies (2026-10-18: the render key alone no
// longer resets: a ;period=N URL renders first under 'cur|N', then under the mapped period, for the same team and week). Either
// way the model is rebuilt from the fresh team, the stored pending moves are re-applied, and storage is re-saved from the result (a
// move Fantrax already has is pruned, conflicts are kept). Editing ends when the fresh model has nothing left to edit.
function syncEdit(route, team, key, now, opts, fresh) {
  const pkey = pendingKey(route.leagueId, team.teamId, team.period.id), same = EDIT.pkey === pkey;
  if (!same) Object.assign(EDIT, { extras: null, undo: [], editing: false, review: false, toast: '', results: null, loading: false, loadError: '', keepLast: null });
  const keep = same ? { sel: EDIT.sel, pick: EDIT.pick } : { sel: null, pick: null };
  Object.assign(EDIT, { key, sel: null, pick: null, toast: '', pkey, route, team, now, opts });
  if (team.ownTeam === true || (team.ownTeam !== false && !route.teamId && team.teamId)) OWN_TEAMS[route.leagueId] = team.teamId;
  rebuildModel();
  const stored = loadPending(pkey), r = reapply(EDIT.model, stored);
  EDIT.lineups = r.lineups; EDIT.conflicts = r.conflicts;
  if (stored) savePending(pkey, pendingFrom(EDIT.model, r.lineups, stored, r.conflicts));
  // mock parity #21: said once per fetch that re-applied stored moves (fresh: renderRoster actually fetched, not a cached redraw); never over a save result
  const n = r.lineups.reduce((t, L, di) => t + changes(EDIT.model, di, L).length, 0);
  if (stored && fresh && !EDIT.saving && !EDIT.results && (n || r.conflicts.length)) EDIT.toast = rebuildNote(n, r.conflicts.length);
  if (EDIT.editing && (!editableDays(EDIT.model) || (EDIT.extras && !EDIT.model.editable))) Object.assign(EDIT, { editing: false, review: false });
  if (EDIT.editing) Object.assign(EDIT, stillOpen(EDIT.model, EDIT.lineups, keep));
}
// An open choice survives a redraw from fresh data while it still applies (tab return, resize and a refresh already in flight
// redraw without asking editPaused): "who sits?" while that click is still a pick (its options recomputed); a dock selection while
// its day is still editable and what it selected is still there.
function stillOpen(M, lineups, { sel, pick }) {
  const live = di => di >= 0 && di < M.days.length && M.days[di].slots !== null && M.days[di].state !== 'past';
  let p = null, s = null;
  if (pick && live(pick.di) && onRoster(M, pick.di, pick.id)) { const pl = planClick(M, pick.di, lineups[pick.di], pick.id); if (pl.k === 'pick') p = Object.assign({}, pick, { opts: pl.opts }); }
  if (sel && live(sel.di)) {
    const k = sel.key, id = k.slice(2);
    if (k.startsWith('s:') ? +id < M.days[sel.di].slots.length : onRoster(M, sel.di, id)) s = sel;
  }
  return { sel: s, pick: p };
}
// The timed and DOM-mutation refreshes skip while this is true (roster page only): moves pending / in conflict for the current
// pending key — the same count the save (or pending) bar shows, so a pause always has a visible bar and Discard — or an open
// "who sits?" / dock choice, which a redraw would wipe (2026-10-18: being editable alone no longer pauses; the skipped 5-minute tick
// is the spec's "waits", the next one comes at most 5 min later).
function editPaused() {
  if (!EDIT.pkey || !EDIT.model || typeof location === 'undefined' || parseRoute(location.href).page !== 'roster') return false;
  return pendingCount() > 0 || !!(EDIT.sel || EDIT.pick);
}
// The body scrolls both ways since 2026-10-18 (locked headers): every redraw keeps both offsets.
function bodyScroll(panel) { const b = panel && panel.querySelector('.fgt-wkbody'); return b ? { x: b.scrollLeft, y: b.scrollTop } : null; }
function restoreScroll(panel, pos) { const b = pos && panel.querySelector('.fgt-wkbody'); if (b) { b.scrollLeft = pos.x; b.scrollTop = pos.y; } }
// 2026-10-18 (user: messages take vertical space): every message has a ×; move messages close after 8 s, a save whose days all
// saved after 10 s; a day that did not save stays until closed.
function autoDismissMs(kind, results) {
  if (kind === 'toast') return 8000;
  return results && results.length && results.every(r => r.status === 'saved') ? 10000 : null;
}
const dismissBtn = fn => btn('×', 'fgt-x', () => { fn(); rerenderWeek(); }, { title: 'Dismiss', 'aria-label': 'Dismiss' });
const DISMISS = { toast: null, results: null };
function armDismiss() {
  const arm = (kind, clear) => {
    const val = EDIT[kind], d = DISMISS[kind];
    if (d && d.val === val) return;
    if (d) clearTimeout(d.t);
    DISMISS[kind] = null;
    const ms = val ? autoDismissMs(kind, kind === 'results' ? val : null) : null;
    if (ms) DISMISS[kind] = { val, t: setTimeout(() => {
      DISMISS[kind] = null;
      if (EDIT[kind] !== val) return;
      if (EDIT.saving) return armDismiss();   // still saving: try again on the next draw
      clear(); rerenderWeek();
    }, ms) };
  };
  arm('toast', () => { EDIT.toast = ''; });
  arm('results', () => Object.assign(EDIT, { results: null, review: false }));
}
function rerenderWeek() {
  if (typeof document === 'undefined') return;
  const root = document.querySelector(SEL.rosterRoot), old = root && root.querySelector('[data-fgt="week"]');
  if (!old || !EDIT.team) return;
  EDIT.now = new Date(); rebuildModel();   // locks follow the clock between loads
  const pos = bodyScroll(old), panel = buildWeekPanel();
  old.replaceWith(panel);
  restoreScroll(panel, pos);
  armDismiss();
}
// Undo snapshots are the stored pending moves (not slot arrays), so an undo after a refresh is re-applied like any other refresh.
function persist(lineups, toast) {
  if (EDIT.saving) return;   // 1.4.0: nothing moves while a save runs
  EDIT.undo.push(loadPending(EDIT.pkey));
  EDIT.lineups = lineups;
  savePending(EDIT.pkey, pendingFrom(EDIT.model, lineups, loadPending(EDIT.pkey), EDIT.conflicts));
  Object.assign(EDIT, { toast: toast || '', sel: null, pick: null, results: null });
  rerenderWeek();
}
function applyLineups(lineups, toast) { persist(lineups.map(cloneLineup), toast); }
function applyEdit(di, L, toast) { const next = EDIT.lineups.map(cloneLineup); next[di] = cloneLineup(L); persist(next, toast); }
function restoreStored(stored, toast) {
  if (EDIT.saving) return;
  savePending(EDIT.pkey, stored);
  const r = reapply(EDIT.model, stored);
  Object.assign(EDIT, { lineups: r.lineups, conflicts: r.conflicts, toast: toast || '', sel: null, pick: null, results: null });
  rerenderWeek();
}
function undoEdit() { if (EDIT.undo.length && !EDIT.saving) restoreStored(EDIT.undo.pop(), 'Undone.'); }
function discardAll() { if (EDIT.saving) return; EDIT.undo.push(loadPending(EDIT.pkey)); EDIT.review = false; restoreStored(null, 'Pending moves discarded.'); }
function pendingCount() { const M = EDIT.model; return EDIT.lineups.reduce((n, L, di) => n + changes(M, di, L).length, 0) + EDIT.conflicts.length; }

// 2026-10-18: FP/G (this season, as games are played) and the roster limits are reloaded quietly on a redraw that
// fetched, when nothing is pending or being chosen; the panel stays editable on the extras it has until the new ones land.
function extrasRefreshWanted(E, fresh) {
  return !!fresh && !!E.editing && !!E.extras && !E.loading && !E.saving && !E.sel && !E.pick && pendingCount() === 0;
}
function refreshExtras() {
  const pkey = EDIT.pkey, route = EDIT.route, team = EDIT.team;
  loadEditExtras(route.leagueId, team, route).then(ex => {
    if (EDIT.pkey !== pkey || EDIT.saving || pendingCount() > 0 || EDIT.sel || EDIT.pick) return;   // something started meanwhile: keep what it sees
    EDIT.extras = ex; rebuildModel();
    if (!(EDIT.model.editable && editableDays(EDIT.model))) Object.assign(EDIT, { editing: false, review: false });
    rerenderWeek();
  }, err => console.warn(LOG, 'edit extras refresh', err));
}
function startEditing() {
  if (EDIT.loading) return;
  const pkey = EDIT.pkey, route = EDIT.route, team = EDIT.team;   // the pending key: a render-key change for the same team and week keeps the load
  Object.assign(EDIT, { loading: true, loadError: '' }); rerenderWeek();
  loadEditExtras(route.leagueId, team, route).then(ex => {
    if (EDIT.pkey !== pkey) return;
    if (ex.ownTeam) OWN_TEAMS[route.leagueId] = team.teamId; else if (OWN_TEAMS[route.leagueId] === team.teamId) delete OWN_TEAMS[route.leagueId];
    Object.assign(EDIT, { extras: ex, loading: false }); rebuildModel();
    EDIT.editing = EDIT.model.editable && editableDays(EDIT.model);
    rerenderWeek();
  }, err => {
    console.warn(LOG, 'edit extras', err);
    if (EDIT.pkey !== pkey) return;
    const own = ownTeamState(team, route, OWN_TEAMS[route.leagueId]) === 'own' && editableDays(EDIT.model);
    Object.assign(EDIT, { loading: false, loadError: own ? 'Lineup data for editing could not be loaded' : 'FP/G this season could not be loaded' }); rerenderWeek();
  });
}
function fillDayClick(di) {
  const sg = suggestions(EDIT.model, EDIT.lineups, di);
  if (sg.moves.length) applyEdit(di, sg.L, sg.msg); else { EDIT.toast = sg.msg; rerenderWeek(); }
}
function fillWeekClick() {
  const res = fillWeek(EDIT.model, EDIT.lineups);
  if (res.moves.length) applyLineups(res.lineups, res.msg); else { EDIT.toast = res.msg; rerenderWeek(); }
}
function manualRefresh() { if (EDIT.saving) return; clearCache(); renderRoster(parseRoute(location.href), true); }

const click = (node, fn) => { node.addEventListener('click', e => { e.preventDefault(); try { fn(e); } catch (err) { console.warn(LOG, 'week panel', err); } }); return node; };
const btn = (text, cls, fn, attrs) => click(el('button', Object.assign({ type: 'button', class: 'fgt-btn' + (cls ? ' ' + cls : ''), text }, attrs || {})), fn);
const clock = d => { const h = d.getHours(), m = d.getMinutes(); return (h % 12 || 12) + ':' + pad2(m) + ' ' + (h < 12 ? 'AM' : 'PM'); };

// Own team: Fantrax's myTeamIds when the load carried it; else (spec ruling) no teamId in the route, or the teamId a load or the
// extras showed to be the user's. The edit extras decide in the end (notEditable).
function ownTeamState(t, r, own) {
  if (t.ownTeam === false || (t.ownTeam !== true && r.teamId && own && own !== r.teamId)) return 'other';
  return t.ownTeam === true || !r.teamId || own === r.teamId ? 'own' : 'unknown';
}
// 2026-10-18: no edit mode. On the user's own team the extras load by themselves (renderWeek) and the panel turns editable;
// this only says why it is not (yet) editable.
function autoEditWanted(E) {
  return !!E.team && !!E.route && ownTeamState(E.team, E.route, OWN_TEAMS[E.route.leagueId]) === 'own' && editableDays(E.model) &&
    !E.editing && !E.loading && !E.loadError && !(E.extras && !E.model.editable);
}
// 2026-10-21: the Grid's FP/G · GP also on another team and on a week with nothing left to edit: the same extras load once, read-only.
function statsWanted(E) {
  return !!E.team && !!E.route && !E.extras && !E.loading && !E.loadError && !autoEditWanted(E);
}
function editControl() {
  const M = EDIT.model, t = EDIT.team, r = EDIT.route, st = ownTeamState(t, r, OWN_TEAMS[r.leagueId]);
  if (EDIT.editing) return null;
  if (EDIT.extras && !M.editable) return el('span', { class: 'fgt-note', text: M.notEditable });
  if (st === 'other') return el('span', { class: 'fgt-note', text: 'Lineups can only be edited on your own team' });
  if (st !== 'own' || !editableDays(M)) return null;
  if (EDIT.loading) return el('span', { class: 'fgt-small', text: 'loading lineup data…' });
  return null;
}
function buildWeekHead(collapsed) {
  const M = EDIT.model, team = EDIT.team, paused = editPaused();
  const toggle = click(el('a', { href: '#', text: (collapsed ? '▸' : '▾') + ' Week' }), () => { setWeekCollapsed(!collapsed); rerenderWeek(); });
  const views = el('span', { class: 'fgt-seg', role: 'group', 'aria-label': 'View' }, [['columns', 'Columns'], ['grid', 'Grid']].map(([v, label]) =>
    click(el('button', { type: 'button', 'aria-pressed': String(EDIT.view === v), text: label }), () => { EDIT.view = v; setWeekViewChoice(v); Object.assign(EDIT, { sel: null, pick: null }); rerenderWeek(); })));
  const kids = [views, toggle, el('b', { text: dayLabel(team.period.start) + ' – ' + dayLabel(team.period.end) }), el('span', { text: 'now: ' + dayLabel(M.today) + ' ' + clock(EDIT.now) })];
  if (EDIT.opts && EDIT.opts.returnDates) kids.push(el('span', { style: 'color:' + RET_COLOR, text: 'return dates on' }));
  kids.push(el('span', { class: 'fgt-small', style: 'margin-left:auto', text: paused ? 'auto-refresh paused: ' + (pendingCount() > 0 ? 'unsaved moves' : 'choosing') : 'refreshes every 5 min' }),
    click(el('a', { href: '#', class: 'fgt-small', title: 'Reload from Fantrax now (pending moves are kept)', text: 'Refresh' }), manualRefresh));
  if (EDIT.editing) kids.push(btn('Fill every day', '', fillWeekClick, Object.assign({ title: 'Fill each day, best FP/G first, stopping at the games max' }, EDIT.saving ? { disabled: '' } : {})));
  const ctl = editControl(); if (ctl) kids.push(ctl);
  return el('div', { class: 'fgt-wkhead' }, kids);
}
// mock.js meter(): played + scheduled = total / max, room or "over by N", the pending delta hatched amber, the max marked on the bar.
function meterRow(label, v) {
  const scale = Math.max(v.total, v.max || 0, 1) * 1.04, pct = x => (x / scale * 100).toFixed(2) + '%';
  const savedSched = Math.max(0, v.sched - Math.max(v.delta, 0));
  const seg = (from, w, bg) => el('span', { class: 'fgt-seg2', style: 'left:' + pct(from) + ';width:' + pct(w) + ';background:' + bg });
  const bar = [seg(0, v.played, '#5b8def'), seg(v.played, savedSched, '#355a99')];
  if (v.delta > 0) bar.push(seg(v.played + savedSched, v.delta, 'repeating-linear-gradient(135deg,#fbbf24 0 3px,#a8801a 3px 6px)'));
  if (v.max !== null) bar.push(el('span', { class: 'fgt-mx', style: 'left:' + pct(v.max) }));
  const room = v.max === null ? el('span', { class: 'fgt-good', text: 'no max' }) : v.over > 0 ? el('span', { class: 'fgt-bad', text: 'over by ' + v.over + ': the last ' + v.over + " won't count" })
    : el('span', { class: 'fgt-good', text: v.over === 0 ? 'exactly at the max' : -v.over + ' left' });
  const sub = [];
  if (v.delta) sub.push(el('span', { class: 'fgt-pend', text: (v.delta > 0 ? '+' : '') + v.delta + ' from pending moves' }), ' · ');
  sub.push('played = games already under way or final');
  return el('div', { class: 'fgt-mrow' }, [
    el('div', { class: 'fgt-mtop' }, [el('span', {}, [el('b', { text: label }), ' ', el('span', { class: 'fgt-num' }, [v.played + ' played + ' + v.sched + ' scheduled = ', el('b', { text: String(v.total) }), v.max === null ? '' : ' / ' + v.max + ' max'])]), room]),
    el('div', { class: 'fgt-bar2', role: 'img', 'aria-label': label + ': ' + v.total + (v.max === null ? '' : ' of ' + v.max) }, bar),
    el('div', { class: 'fgt-sub2' }, sub)]);
}
function buildMeter() {
  const M = EDIT.model, { lineups, base } = meterLineups(EDIT);
  return el('div', { class: 'fgt-meter' }, [meterRow('Skater games', meterView(M, lineups, base, 'skaters')), meterRow('Goalie games', meterView(M, lineups, base, 'goalies'))]);
}
// Day headers read the lineups being edited while editing, Fantrax's own otherwise (the read-only body shows Fantrax's).
function dayHead(di) {
  const M = EDIT.model, d = M.days[di], v = dayHeadView(M, EDIT.editing ? EDIT.lineups : baseOf(M), di);
  const kids = [d.n === null ? el('b', { text: d.label }) : el('a', { href: dayHref(EDIT.route, d.n), target: '_blank', rel: 'noopener', title: 'Open ' + d.label + ' on Fantrax' }, [d.label, el('span', { class: 'fgt-go', text: '↗' })])];
  if (d.state === 'past') kids.push(el('em', { class: 'fgt-dst', text: 'played' }));
  else if (v.locked) kids.push(el('em', { class: 'fgt-dst', title: 'Fantrax has locked today: every game has started, nobody can be moved', text: 'locked' }));
  else if (d.state === 'today') kids.push(el('em', { class: 'fgt-dst fgt-dst-today', title: 'Today: players whose game started are locked', text: 'today' }));
  if (EDIT.editing && v.fillN) kids.push(click(el('button', { type: 'button', class: 'fgt-minifill', title: v.fillTip, text: 'Fill ' + v.fillN }), () => fillDayClick(di)));
  const line = d.slots === null ? { text: 'no lineup loaded', title: '' } : dayHeadLine(v);
  return el('div', { class: 'fgt-dh' }, [el('div', { class: 'fgt-dl' }, kids), el('div', { class: 'fgt-dc', title: line.title, text: line.text })]);
}
// While moves are pending and editing is off (own team only: the pending key carries the team).
// 2026-10-18: the save bar carries pending moves once the panel is editable; this bar is left only for moves kept in the tab
// while the lineup data is still loading or failed to load (they still need a Discard).
const saveBarShown = E => !!E.editing && (pendingCount() > 0 || !!E.results || !!E.review || E.undo.length > 0);
const pendingBarShown = E => !E.editing && pendingCount() > 0;
function pendingBarReason(E) {
  if (E.loading) return 'Lineup data is still loading.';
  if (E.loadError) return 'Lineup data could not be loaded.';
  if (E.extras && !E.model.editable) return E.model.notEditable + '.';
  if (!editableDays(E.model)) return 'Every day of this period has been played.';
  return 'Lineup data is still loading.';
}
const conflictLine = M => el('div', { class: 'fgt-conf', text: "Can't happen any more: " + EDIT.conflicts.map(c => playerName(M, c.id) + ' (' + M.days[c.di].label + '): ' + c.reason).join(' · ') });
function buildPendingBar() {
  const n = pendingCount(), M = EDIT.model;
  if (!pendingBarShown(EDIT)) return null;
  const kids = [el('span', { class: 'fgt-msg' }, [el('b', { text: n + ' pending move' + (n === 1 ? '' : 's') }), ' kept, not saved yet. ' + pendingBarReason(EDIT)]), btn('Discard', '', discardAll)];
  if (EDIT.conflicts.length) kids.push(conflictLine(M));
  return el('div', { class: 'fgt-bar' }, kids);
}
// ---- 1.4.0 Task 13: save bar, Review & save, the save itself. The ONLY path to a write: moves → Review & save → Save.
const off = (node, yes) => { if (yes) node.setAttribute('disabled', ''); return node; };
const pendingDays = () => EDIT.model.days.map((d, di) => di).filter(di => changes(EDIT.model, di, EDIT.lineups[di]).length || EDIT.conflicts.some(c => c.di === di));
const keepLastChecked = M => EDIT.keepLast === null ? M.applyToFuture : EDIT.keepLast;
// One day out of storage, its conflicts included (the only way a conflict leaves storage besides a save); undoable.
function discardDay(di) {
  if (EDIT.saving) return;
  const M = EDIT.model;
  EDIT.undo.push(loadPending(EDIT.pkey));
  clearPendingDays(EDIT.pkey, [M.days[di].day]);
  restoreStored(loadPending(EDIT.pkey), 'Pending moves on ' + dayName(M, di) + ' discarded.');
}
// Save: the days savePlan passes, in date order (saveRequests), one at a time through saveAll (dry run → execute → re-read). Saved days leave
// storage; held and failed days stay pending and are re-applied by the forced reload. Save is disabled (and a no-op) while one runs.
// A fresh load of the team being edited, as renderRoster loads it (cache cleared, the scoring period, the return-dates step).
// 2026-10-18: it keeps the return dates and reuses the panel's schedule answers (reuseSchedule: same roster, at most 10 minutes old).
function freshTeam(route, team, now) {
  clearCache({ keepProfiles: true }); reuseSchedule(route.leagueId, team);
  const opts = { returnDates: returnDatesOn() };
  return cachedLoadTeam(route.leagueId, { teamId: route.teamId, period: team.period.id, day: null, profiles: opts.returnDates }, undefined, now)
    .then(t => (opts.returnDates ? withReturnDates(route.leagueId, t, undefined, now) : t)).then(t => ({ team: t, opts }));
}
// Save. Before anything is sent the team is reloaded (locks inside today follow Fantrax's started flags, which only a load refreshes; loads
// are paused while editing), the model rebuilt with the loaded extras, the stored moves re-applied and the review recomputed. It is sent only
// if every day's ok flag, dropped moves and the lineup it would send (sameFieldMap) equal what the review showed and no new conflict appeared;
// the requests come from the fresh model.
// loadImpl / fetchImpl / now are for tests.
async function saveClick(fetchImpl, now, loadImpl) {
  if (EDIT.saving || !EDIT.editing) return;
  // per day: savePlan's ok flag + its dropped moves, and the fieldMap a day that saves would send
  const plan = (M, lineups) => lineups.map((L, di) => { const sp = savePlan(M, di, L); return { sig: (sp.ok ? 'ok' : '-') + ':' + (sp.dropped || []).slice().sort().join(','), fm: sp.ok ? fieldMapOf(M, di, sp.L) : null }; });
  const cKey = c => c.di + '|' + c.id + '|' + c.reason;
  const shown = plan(EDIT.model, EDIT.lineups), shownConf = new Set(EDIT.conflicts.map(cKey)), key = EDIT.key, pkey = EDIT.pkey, route = EDIT.route;
  Object.assign(EDIT, { saving: true, savePhase: 'checking', sel: null, pick: null, toast: '', results: null });
  let sent = false;
  try {
    rerenderWeek();
    const at = now || new Date();
    let fresh;
    try { fresh = await (loadImpl || freshTeam)(route, EDIT.team, at); }
    catch (e) { EDIT.toast = 'Could not refresh before saving: ' + (e && e.message || e); return; }
    if (EDIT.key !== key || EDIT.pkey !== pkey) return;   // the page moved to another team or period meanwhile
    Object.assign(EDIT, { team: fresh.team, opts: fresh.opts, now: at }); rebuildModel();
    const r = reapply(EDIT.model, loadPending(pkey));
    Object.assign(EDIT, { lineups: r.lineups, conflicts: r.conflicts });
    const started = 'A game started since these moves were made: check the panel and save again', added = r.conflicts.filter(c => !shownConf.has(cKey(c)));
    // a game start when some new conflict's player is now locked (reapply's lockWhy; the others can be its knock-on 'no room left'), else the roster changed
    if (added.length) { EDIT.toast = added.some(c => onRoster(EDIT.model, c.di, c.id) && locked(EDIT.model, c.di, c.id)) ? started : 'Your roster changed since these moves were made: check the panel and save again'; return; }
    const after = plan(EDIT.model, EDIT.lineups);
    if (after.length !== shown.length || after.some((p, di) => p.sig !== shown[di].sig)) { EDIT.toast = started; return; }
    // any other difference between what the review showed and what would be sent (e.g. a player changed on Fantrax's own page)
    if (after.some((p, di) => p.fm && !sameFieldMap(p.fm, shown[di].fm))) { EDIT.toast = 'Your lineup changed since these moves were made: check the panel and save again'; return; }
    const M = EDIT.model, lineups = EDIT.lineups, team = EDIT.team;
    const reqs = saveRequests(M, lineups, keepLastShown(M, lineups) && keepLastChecked(M));
    if (!reqs.length) return;
    const optsByDi = {};
    for (const q of reqs) optsByDi[q.di] = { countLegal: M.limits.total !== null, otherDayIllegal: M.days.some((d, j) => j !== q.di && !!d.illegalText) };
    EDIT.savePhase = 'saving'; rerenderWeek(); sent = true;
    let results;
    try { results = await saveAll(route.leagueId, team.teamId, reqs, optsByDi, fetchImpl); }
    catch (e) { results = reqs.map(q => ({ di: q.di, status: 'failed', messages: [String(e && e.message || e)] })); }
    const saved = results.filter(x => x.status === 'saved').map(x => M.days[x.di].day);
    if (saved.length) clearPendingDays(pkey, saved);
    // undo snapshots predate what Fantrax now has, so they are dropped
    if (EDIT.key === key && EDIT.pkey === pkey) Object.assign(EDIT, { results: results.map(x => Object.assign({ label: M.days[x.di].label }, x, x.changes ? { messages: changeLines(M, x.changes) } : {})), review: true, undo: [] });
  } finally {
    if (sent) {
      // 2026-10-18: the results show at once ('refreshing': still locked, as during the save); the panel unlocks when the reload lands.
      // The reload keeps the return dates and the schedule answers of the load just before the save (only lineups changed).
      EDIT.savePhase = 'refreshing'; rerenderWeek();
      const t = EDIT.team; clearCache({ keepProfiles: true }); reuseSchedule(route.leagueId, t);
      if (typeof document !== 'undefined') { try { await renderRoster(parseRoute(location.href), true); } catch (e) { console.warn(LOG, 'reload after save', e); } }
      Object.assign(EDIT, { saving: false, savePhase: null }); rerenderWeek();
    } else { Object.assign(EDIT, { saving: false, savePhase: null }); rerenderWeek(); }   // not sent: the panel redrawn from what was loaded, with the toast (a forced render would clear it)
  }
}
// a saved day's Fantrax changes with the player's name: "<Name>: Reserve to Active"
const changeLines = (M, changes) => changes.filter(c => c.text).map(c => (M.players[c.scorerId] ? M.players[c.scorerId].name + ': ' : '') + c.text);
const RESULT_WORD = { saved: ['fgt-ok', 'saved'], held: ['fgt-bad', 'held: not saved'], failed: ['fgt-bad', 'failed: not saved'] };
// While editing (mock.js saveBar): the pending count and days, Undo, Discard (everything), Review & save; under it the review when open.
// 2026-10-18 (user: Review & save only added clicks): one-click Save. What the review showed that the grid does not is kept, but only
// when there is something to say: per day, the moves that are dropped, conflicts, illegal lineups and warnings. Plain moves are not
// listed (the grid marks them). → {ok: days that will save, notes: [{di, label, saves, lines}]}
function saveBarView(M, lineups, conflicts) {
  const view = reviewView(M, lineups, conflicts);
  return { ok: view.filter(v => v.ok).length, notes: view.map(v => ({ di: v.di, label: v.label, saves: v.ok, lines: v.lines.filter(l => l.bad || l.warn) }))
    .filter(v => !v.saves || v.lines.length) };
}
const saveLabel = (ok, phase) => phase ? (phase === 'checking' ? 'Checking…' : 'Saving…') : 'Save' + (ok ? ' ' + ok + ' day' + (ok === 1 ? '' : 's') : '');
function buildSaveBar() {
  if (!saveBarShown(EDIT)) return [];
  const M = EDIT.model, n = pendingCount(), days = pendingDays(), busy = EDIT.saving, res = EDIT.results;
  const allSaved = !!res && res.length > 0 && res.every(r => r.status === 'saved'), refreshing = EDIT.savePhase === 'refreshing';
  const sv = n && !refreshing ? saveBarView(M, EDIT.lineups, EDIT.conflicts) : { ok: 0, notes: [] };
  const msg = refreshing ? el('span', { class: 'fgt-msg', text: 'Updating from Fantrax…' }) : n ? el('span', { class: 'fgt-msg' }, [el('b', { text: n + ' move' + (n === 1 ? '' : 's') }), ' pending on ' + days.map(di => dayName(M, di)).join(', ')])
    : el('span', { class: 'fgt-msg', style: allSaved ? 'color:#4ade80' : '', text: allSaved ? 'Saved. Fantrax checked each day first.' : 'No pending moves.' });
  const saveText = saveLabel(sv.ok, busy ? EDIT.savePhase : null);
  const out = [el('div', { class: 'fgt-bar' }, [msg,
    off(btn('↶ Undo', '', undoEdit, { title: 'Undo the last move' }), busy || !EDIT.undo.length),
    off(btn('Discard', '', discardAll), busy || !n),
    off(btn(saveText, 'fgt-pri', () => saveClick(), { title: 'Fantrax checks each day before it saves; a day that is not legal stays pending' }), busy || !sv.ok)])];
  const kids = [], line = x => el('div', { class: 'fgt-ln' + (x.bad ? ' fgt-bad' : '') + (x.warn ? ' fgt-warnl' : ''), text: x.text });
  if (res) {
    kids.push(el('h4', {}, ['Last save', busy ? '' : dismissBtn(() => Object.assign(EDIT, { results: null, review: false }))]));
    for (const r of res) {
      const [cls, word] = RESULT_WORD[r.status] || RESULT_WORD.failed;
      kids.push(el('div', { class: 'fgt-day' }, [el('b', { text: r.label }), ' ', el('span', { class: cls, text: word })].concat(
        (r.messages || []).map(t => line({ text: t, bad: r.status !== 'saved' })), r.banner ? [line({ text: 'Fantrax also said: ' + r.banner, warn: true })] : [])));
    }
    if (res.some(r => r.status !== 'saved')) kids.push(el('div', { class: 'fgt-rnote', text: 'Days not saved stay pending.' }));
  }
  if (sv.notes.length) {
    kids.push(el('h4', { text: 'Before you save' }));
    for (const v of sv.notes) {
      const head = [el('b', { text: v.label }), ' ', el('span', { class: v.saves ? 'fgt-ok' : 'fgt-bad', text: v.saves ? 'saves, but:' : "won't save (stays pending)" })];
      if (EDIT.conflicts.some(c => c.di === v.di)) head.push(' ', off(btn('Discard this day', '', () => discardDay(v.di), { title: 'Forget every pending move on ' + v.label + ", including the ones that can't happen any more" }), busy));
      kids.push(el('div', { class: 'fgt-day' }, head.concat(v.lines.map(line))));
    }
  }
  if (n && !refreshing && keepLastShown(M, EDIT.lineups)) {
    const last = M.days.length - 1, cb = el('input', { type: 'checkbox' });
    cb.checked = keepLastChecked(M); cb.disabled = busy;
    cb.addEventListener('change', () => { EDIT.keepLast = cb.checked; });
    kids.push(el('div', { class: 'fgt-rnote' }, [el('label', {}, [cb, ' Keep ' + dayName(M, last) + "'s lineup for later days"]), ' · default from your Fantrax setting “Apply lineup changes to future periods by default”']));
  }
  if (kids.length) out.push(el('div', { class: 'fgt-review' }, kids));
  return out;
}
// Columns body (1.4.0, Task 11): one row per slot / reserve player / IR player, padded to the same count in every day column
// (columnRows) so the rows line up across days. Editing: click a player or an open slot, that day's targets light up (blue: open /
// swap / shift / take; amber: bump / reserve; red: refused, the title says why), click a target to move. Read-only: the same rows
// from Fantrax's own lineups, inert. All state is EDIT.sel = {di, key, s}; every handler changes EDIT and rerenders.
const selOf = key => { const v = key.slice(2); return key[0] === 's' ? { kind: 'slot', i: +v } : key[0] === 'b' ? { kind: 'bench', id: v } : { kind: 'ir', id: v }; };
const dayName = (M, di) => M.days[di].label.split(' ')[0];
// The open selection's targets; the Grid's IR chip on a full IR opens it with irOnly (the IR swaps only).
const selTargets = (M, di, L, sel) => { const T = targetsFor(M, di, L, sel.s); return sel.irOnly ? new Set([...T].filter(k => k.startsWith('x:'))) : T; };
// An IR player's row / cell is a target as the swap 'x:<id>' while a full-IR swap is on offer, else by its own key.
const irTargetKey = (T, L, id, key) => T && L.ir.includes(id) && T.has('x:' + id) ? 'x:' + id : key;
const rosterTagNodes = (M, di, id) => rosterTags(M, di, id).map(t => el('span', { class: 'fgt-tag fgt-tag-' + t.toLowerCase(), text: t,
  title: t === 'NEW' ? 'Added ' + shortDay(M, di) + ': on the roster from today' : 'Dropped: last day on the roster' }));
const notIRTag = () => el('span', { class: 'fgt-tag fgt-tag-out', text: '!IR', title: 'On IR but no longer IR-eligible: the roster is illegal until he moves' });
function colMoveClick(di, key) {
  if (EDIT.saving) return;
  const M = EDIT.model, sel = EDIT.sel, L = EDIT.lineups[di];
  const doMove = () => {
    const N = computeMove(M, di, L, sel.s, key);
    if (N.blocked) { EDIT.toast = N.blocked + '.'; rerenderWeek(); return; }
    applyEdit(di, N, N.paired ? 'Roster stays at ' + M.limits.total + ': ' + M.players[N.paired].name + ' moved into IR on ' + dayName(M, di) + '.' : '');
  };
  EDIT.toast = '';
  if (sel && sel.di === di && selTargets(M, di, L, sel).has(key)) return doMove();
  if (key.startsWith('x:')) key = 'i:' + key.slice(2);   // a swap no longer on offer: clicking his IR row selects him
  if (sel && sel.di === di && sel.key === key) { EDIT.sel = null; return rerenderWeek(); }
  if (key === 'tobench' || key === 'toir') { EDIT.sel = null; return rerenderWeek(); }
  const s = selOf(key), id = s.kind === 'slot' ? L.s[s.i] : s.id;
  EDIT.sel = null;
  if (id && id in M.days[di].fixed) EDIT.toast = M.players[id].name + " can't be moved here (Fantrax locks his slot)";
  else if (id && locked(M, di, id)) EDIT.toast = 'Locked: ' + lockWhy(M, di, id);
  else EDIT.sel = { di, key, s };
  rerenderWeek();
}
function colRow(E, di, o) {
  const M = E.model, d = M.days[di], L = o.L, p = o.id ? M.players[o.id] : null, row = p && p.row, T = o.T, ch = o.ch;
  const g = row ? row.games.find(x => x.day === d.day) : null, act = g ? (o.bench && !o.ir ? benchGame(M, row, g) : activeGame(row, g, M.today, M.opts)) : null;
  let cls = 'fgt-pl', nm, gm = '', tag = null;
  if (!o.id) { cls += ' fgt-open'; nm = 'open slot'; }
  else {
    nm = p.shortName || p.name;
    if (g) { gm = act.counted ? (g.opp + ' ' + shortTime(g.time)).trim() : g.opp; if (!act.counted) cls += ' fgt-out'; else if (act.by === 'date') cls += ' fgt-ret'; }
    else if (o.slot) { cls += ' fgt-idle'; nm = 'empty'; gm = p.shortName || p.name; }
    else gm = 'no game';
    if (o.bench && !E.editing) cls += ' fgt-bench';
    const t = gameTag(M, di, L, o.id);
    if (t) tag = el('span', { class: 'fgt-tag fgt-tag-' + t.kind, text: t.text, title: t.title });
    if (E.editing && ch.has(o.id)) cls += ' fgt-chg';
    if (o.ledger.over.has(di + '|' + o.id)) cls += ' fgt-ovr';   // 2026-10-18: marked read-only too
    if (locked(M, di, o.id)) cls += ' fgt-lock';
  }
  const tk = o.id && o.ir ? irTargetKey(T, L, o.id, o.key) : o.key;
  const isSel = !!(E.sel && E.sel.di === di && E.sel.key === o.key), mk = T && T.has(tk) && !isSel ? moveKind(M, di, L, E.sel.s, tk) : null;
  const paired = mk && mk.k !== 'blocked' ? computeMove(M, di, L, E.sel.s, tk).paired : undefined;   // who the move sends into IR, shown on the row
  if (paired !== undefined) cls += ' fgt-haspair';
  if (isSel) cls += ' fgt-sel';
  else if (mk) cls += ' fgt-tgt' + (mk.k === 'bump' || mk.k === 'bench' ? ' fgt-bump' : '') + (mk.k === 'blocked' ? ' fgt-blockd' : '');
  else if (T) cls += ' fgt-dim';
  const tip = (mk ? (mk.k === 'blocked' ? mk.why + '. ' : 'Click: ' + mk.txt + '. ') : '') +
    (p ? p.name + ' · ' + (row && row.pos ? row.pos : '') + ' · ' + fpgText(M, o.id) + (locked(M, di, o.id) ? ' · locked: ' + lockWhy(M, di, o.id) : '') : 'open ' + o.pos + ' slot');
  const kids = [el('span', { class: 'fgt-pos', text: o.pos }), el('span', { class: 'fgt-nm', text: nm })];
  if (o.id) kids.push(...rosterTagNodes(M, di, o.id));
  if (tag && !(o.ir && tag.textContent === 'IR')) kids.push(tag);   // an IR row's status tag already says IR
  if (o.ir && irIneligibleKnown(M, di, o.id)) kids.push(notIRTag());   // mock parity #3: red !IR, read-only too
  else if (o.ir) { const sn = statusLabel(E.team.statusNames, '3'), n = o.off ? offRowNote(o.off) : { text: statusShort(sn), title: sn }; kids.push(el('span', { class: 'fgt-tag fgt-tag-off', text: n.text, title: n.title })); }   // 1.3.1's status tag
  if (o.id && locked(M, di, o.id) && d.state !== 'past') kids.push(el('span', { class: 'fgt-lk', text: '🔒', title: lockWhy(M, di, o.id) }));
  kids.push(el('span', { class: 'fgt-gm', text: gm }));
  if (paired !== undefined) kids.push(el('span', { class: 'fgt-pair', text: '· ' + (M.players[paired].shortName || M.players[paired].name) + ' into IR' }));
  const node = el('div', { class: cls, title: tip }, kids);
  if (o.clickable) {
    node.setAttribute('data-click', di + '|' + tk); node.setAttribute('tabindex', '0'); node.setAttribute('role', 'button');
    if (mk && mk.k === 'blocked') node.setAttribute('aria-disabled', 'true');
    click(node, () => colMoveClick(di, tk));
    node.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); try { colMoveClick(di, tk); } catch (err) { console.warn(LOG, 'week panel', err); } } });
  }
  return node;
}
function colSection(E, di, label, key, T) {
  const tgt = !!(T && T.has(key)), n = el('div', { class: 'fgt-sec' + (tgt ? ' fgt-tgtsec' : '') }, [label].concat(tgt ? [' ', el('span', { text: '← move here' })] : []));
  if (tgt) { n.setAttribute('data-click', di + '|' + key); n.setAttribute('tabindex', '0'); n.setAttribute('role', 'button'); click(n, () => colMoveClick(di, key)); n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); colMoveClick(di, key); } }); }
  return n;
}
// 2026-10-18 (user: the Grid legend lacked what the Columns legend explained): one legend definition for both views. Every tag
// (status, RET, the off-lineup status, NEW / DROP, over) is explained identically in both; the swatches and controls are each
// view's own. Items: { sw: swatch css | null, tags: [[class, text]] | null, text }.
function legendSpec(view, o) {
  const grid = view === 'grid', it = (sw, text, tags) => ({ sw: sw || null, tags: tags || null, text });
  const swatches = grid ? [
    it('background:#24395c;border:1px solid #33507f', 'active, plays (slot letter inside)'),
    it('background:repeating-linear-gradient(135deg,#2a2e3c 0 5px,#252936 5px 10px);border:1px solid #3a3f50', 'active, no counted game'),
    it('border:1px dashed rgba(251,191,36,.6)', 'reserve, has a game'),
    it('border:1px solid #262a38', 'reserve, no game'),
    it(null, 'IR in red'),
  ] : [
    it('background:#8fbcff', 'slot filled, plays that day'),
    it('background:#2a2e3c;border:1px solid #4b5163', 'slot empty: its player has no game (name in grey)'),
    it('border:1px dashed rgba(251,191,36,.7)', 'slot open: nobody in it (a change carries forward to later days)'),
    it('background:#4b5163', 'on reserve that day with a game'),
  ];
  const tags = (o.returnDates ? [
    it(null, ' struck: not counted that day (before the expected return date, no date, or the date passed)', [['out', 'OUT'], ['out', 'IR'], ['out', 'SUSP'], ['note', 'DTD']]),
    it(null, ' counted from the expected return date', [['ret', 'RET']]),
    it(null, " not struck: shown, still counted (hover for Fantrax's note) · dates: strip lines and hover", [['note', 'DTD'], ['note', 'MINORS']]),
  ] : [
    it(null, ' out, on IR, suspended: struck and not counted', [['out', 'OUT'], ['out', 'IR'], ['out', 'SUSP']]),
    it(null, " day-to-day, in the minors: shown, still counted (hover for Fantrax's note)", [['note', 'DTD'], ['note', 'MINORS']]),
  ]).concat(o.offStatus ? [it(null, ' on ' + statusShort(o.offStatus) + ' with a return date this period (from that date) or with no injury flag (every day): not counted anywhere', [['off', statusShort(o.offStatus)]])] : [],
    [it(null, ' his first day on the roster / his last day before he left it', [['new', 'NEW'], ['drop', 'DROP']]),
     it(null, " past the games max: won't count", [['over', 'over']])]);
  const common = [it(null, 'dimmed column = already played'), it(null, '🔒 game started'), it(null, 'Day header ↗ opens that day on Fantrax')];
  const edit = !o.editing ? [] : grid ? [
    it(null, 'click a cell: starts or benches him (hover to preview)'),
    it('border:1px dashed #60a5fa', 'open slot or swap'),
    it('border:1px dashed #f59e0b', 'that player goes to reserve'),
    it('border:1.5px solid #4ade80', 'green: who could sit, when every slot he fits holds a player who plays'),
    it(null, '+D open slot (in a day header)'),
    it('box-shadow:inset 0 0 0 1px #fbbf24', 'moved (pending)'),
    it(null, '✓ all: already starts every game he has · start +N: one click starts N more'),
  ] : [
    it('border:1px dashed #60a5fa', 'where the selected player can go (amber: someone goes to reserve; red: refused)'),
    it('background:#1e3a5f;border:1px solid #3b82f6', 'selected (Esc or click again to cancel)'),
    it('background:#fbbf24;border-radius:50%', 'moved (pending)'),
  ];
  return swatches.concat(tags, common, edit);
}
function buildLegend(view, E) {
  const offStatus = Object.keys(E.team.statusNames || {}).filter(id => id !== '1' && id !== '2').map(id => E.team.statusNames[id])[0];   // 1.3.1
  return el('div', { class: 'fgt-legend' }, legendSpec(view, { returnDates: !!(E.opts && E.opts.returnDates), editing: !!E.editing, offStatus }).map(x =>
    el('span', {}, (x.sw ? [el('span', { class: 'fgt-sw', style: x.sw })] : [])
      .concat(x.tags ? x.tags.flatMap((t, i) => (i ? [' / '] : []).concat([el('span', { class: 'fgt-tag fgt-tag-' + t[0], text: t[1] })])) : [], [x.text]))));
}
function buildColumnsBody(E) {
  const M = E.model, w = weekView(E.team, E.now, E.opts), on = !!(E.opts && E.opts.returnDates), lineups = E.editing ? E.lineups : baseOf(M);
  const rows = columnRows(M, lineups, E.editing), ledger = gameLedger(M, lineups), blank = () => el('div', { class: 'fgt-pl fgt-blank' });
  const cols = el('div', { class: 'fgt-cols' + (E.editing ? ' fgt-edit' : '') }, M.days.map((d, di) => {
    const kids = [dayHead(di)];
    if (d.slots === null) { kids.push(el('div', { class: 'fgt-pl fgt-none', text: 'no lineup loaded' })); return el('div', { class: 'fgt-col fgt-' + d.state }, kids); }
    const L = lineups[di], T = E.editing && E.sel && E.sel.di === di ? selTargets(M, di, L, E.sel) : null;
    const ch = new Set(E.editing ? changes(M, di, L).map(c => c.id) : []);
    const ok = id => E.editing && (id === null ? d.state !== 'past' : true);
    L.s.forEach((id, i) => {
      if (d.slots[i].group === 'goalies' && !(i > 0 && d.slots[i - 1].group === 'goalies')) kids.push(el('div', { class: 'fgt-gsep' }));
      kids.push(colRow(E, di, { id, pos: d.slots[i].pos, key: 's:' + i, T, ch, ledger, L, slot: true, clickable: ok(id) }));
    });
    const shown = columnBench(M, di, L, E.editing);
    kids.push(colSection(E, di, E.editing ? 'Reserve' : 'Bench, has a game', 'tobench', T));
    for (const id of shown) kids.push(colRow(E, di, { id, pos: (M.players[id].row && M.players[id].row.pos || '').split(',')[0].trim(), key: 'b:' + id, T, ch, ledger, L, bench: true, clickable: ok(id) }));
    for (let k = shown.length; k < rows.reserve; k++) kids.push(blank());
    kids.push(colSection(E, di, 'Injured reserve ' + L.ir.length + (M.limits.ir === null ? '' : '/' + M.limits.ir), 'toir', T));
    for (const id of L.ir) kids.push(colRow(E, di, { id, pos: (M.players[id].row && M.players[id].row.pos || '').split(',')[0].trim(), key: 'i:' + id, T, ch, ledger, L, bench: true, ir: true, off: w.days[di].off.find(x => x.id === id), clickable: ok(id) }));
    for (let k = L.ir.length; k < rows.ir; k++) kids.push(blank());
    // 1.3.1: off-lineup players who could play that day (never counted), then the rest on a fixed status as inert rows
    const offs = w.days[di].off.filter(x => !L.ir.includes(x.id)), seen = new Set(w.days[di].off.map(x => x.id));   // one row per player: an IR player's entry rides on his IR row
    for (const sec of offSections(offs)) {
      kids.push(el('div', { class: 'fgt-sec', text: sec.title }));
      for (const x of sec.entries) kids.push(slotLine(Object.assign({}, x, { kind: 'game' }), 'fgt-offrow'));
    }
    const fixedRows = M.order.filter(id => id in d.fixed && !seen.has(id) && !d.rows[id].secondary && !L.s.includes(id));
    if (fixedRows.length) kids.push(el('div', { class: 'fgt-sec', text: 'Fixed by Fantrax' }));
    for (const id of fixedRows) {
      const p = M.players[id], g = p.row && p.row.games.find(x => x.day === d.day), sn = statusLabel(E.team.statusNames, d.rows[id].stId);
      kids.push(el('div', { class: 'fgt-pl fgt-offrow', title: p.name + ' · ' + sn + ' · can\'t be moved here' }, [el('span', { class: 'fgt-pos', text: (p.row && p.row.pos || '').split(',')[0].trim() }), el('span', { class: 'fgt-nm', text: p.shortName || p.name }),
        el('span', { class: 'fgt-tag fgt-tag-off', text: statusShort(sn), title: sn }), el('span', { class: 'fgt-gm', text: g ? (g.opp + ' ' + g.time).trim() : 'no game' })]));
    }
    return el('div', { class: 'fgt-col fgt-' + d.state }, kids);
  }));
  const legend = buildLegend('columns', E);
  return [el('div', { class: 'fgt-wkbody' }, [cols]), legend];
}
// Grid body (1.4.0, Task 12): player x day. Editing: one click = planClick (the hover outlines previewDiff's cells; lock-aware seating,
// so the ⋯ menu was removed 2026-10-18), the IR chip on a full IR opens the Columns selection (EDIT.sel, same colMoveClick) as a list in the dock, a chip in a day header selects an open slot, IR chip where toIR
// allows, "start all games" per row. "Who sits?" is EDIT.pick = {di, id, opts}. Read-only: the same cells from Fantrax's lineups, inert.
const gameOfDay = (M, di, id) => { const r = M.players[id].row; return r ? r.games.find(g => g.day === M.days[di].day) || null : null; };
// The Grid cell's text without a game: 'no game' for a slot or reserve cell (2026-10-18: a reserve cell's lone dot read as blank),
// the dot after IR.
const gridCellText = (c, text) => text || (c.kind === 'ir' ? '·' : 'no game');
const gameText = (M, di, id, long) => { const g = gameOfDay(M, di, id); return g ? (g.opp + ' ' + (long ? g.time : shortTime(g.time))).trim() : ''; };
const gridKey = (L, id) => { const s = L.s.indexOf(id); return s >= 0 ? 's:' + s : L.ir.includes(id) ? 'i:' + id : 'b:' + id; };
const shortDay = (M, di) => dayName(M, di);
function gridCellClick(di, id) {
  if (EDIT.saving) return;
  const M = EDIT.model, L = EDIT.lineups[di];
  EDIT.toast = '';
  if (EDIT.sel) {   // a dock selection is open: a lit cell of that day takes the move, anything else just closes it
    const T = EDIT.sel.di === di ? selTargets(M, di, L, EDIT.sel) : null, k = irTargetKey(T, L, id, gridKey(L, id));
    if (T && T.has(k)) return colMoveClick(di, k);
    EDIT.sel = null; return rerenderWeek();
  }
  if (EDIT.pick) {   // a lit cell answers "who sits?"; any other cell just closes the question, nothing changed
    const t = pickTarget(EDIT.pick, di, id);
    if (t) return gridPick(t);
    EDIT.pick = null; return rerenderWeek();
  }
  const pl = planClick(M, di, L, id), nm = M.players[id].name + ' · ' + shortDay(M, di) + ': ';
  if (pl.k === 'move') return applyEdit(di, pl.L, clickToast(M, EDIT.lineups, di, id, pl));
  if (pl.k === 'pick') EDIT.pick = { di, id, opts: pl.opts }; else EDIT.toast = pl.text + '.';
  rerenderWeek();
}
// 2026-10-18: while "who sits?" is open, the cells of the players who could sit are targets; a click on one makes that swap.
function pickTip(M, pick, id) { return 'Click: ' + M.players[id].name + ' sits, ' + M.players[pick.id].name + ' starts ' + M.days[pick.di].label + '.'; }
function pickTarget(pick, di, id) { return pick && pick.di === di && pick.opts.find(o => o.out === id) || null; }
// 2026-10-18 (user): no message for a plain start or sit (the grid shows it). One when the click also moved someone else (a not-playing
// starter to reserve, others shifting slots, a pairing into IR) or put a group past its games max.
function clickToast(M, lineups, di, id, pl) {
  const next = lineups.map((L, i) => i === di ? pl.L : L), over = overNote(M, lineups, next, isGoalie(M, id) ? 'goalies' : 'skaters');
  const side = pl.out || /others shift|into IR/.test(pl.text) ? M.players[id].name + ' · ' + shortDay(M, di) + ': ' + pl.text.replace('Click: ', '') + '.' : '';
  return [side, over ? '⚠ ' + over : ''].filter(Boolean).join(' ');
}
function gridPick(o) {
  const { di, id } = EDIT.pick, M = EDIT.model, L = EDIT.lineups[di];
  const L2 = { s: o.s, ir: L.ir.filter(x => x !== id) }, over = overNote(M, EDIT.lineups, EDIT.lineups.map((x, i) => i === di ? L2 : x), isGoalie(M, id) ? 'goalies' : 'skaters');
  applyEdit(di, L2, over ? '⚠ ' + over : '');   // the swap the user chose is on screen: only a games-max overflow is worth saying
}
function allGamesTip(M, lineups, id) {
  const plan = allGamesPlan(M, lineups, id);
  if (!plan.length) return 'Already starts every remaining game he has';
  const sim = lineups.map(cloneLineup); plan.forEach(x => { if (x.L) sim[x.di] = x.L; });
  const warn = overNote(M, lineups, sim, isGoalie(M, id) ? 'goalies' : 'skaters');
  return 'Start on every remaining day he plays:\n' + plan.map(x => shortDay(M, x.di) + ': ' + (x.blocked ? 'roster full: needs a drop' : x.ask ? 'everyone he could replace plays too (click that cell to choose)' :
    (x.out ? M.players[x.out].name + ' (not playing) to reserve' : 'into an open slot') + (x.paired ? pairNote(M, x.paired) : ''))).join('\n') + (warn ? '\n⚠ ' + warn : '');
}
function allGamesClick(id) {
  const M = EDIT.model, before = EDIT.lineups, plan = allGamesPlan(M, before, id), next = before.map(cloneLineup), ok = [], ask = [], full = [];
  for (const x of plan) { if (x.blocked) full.push(shortDay(M, x.di)); else if (x.ask) ask.push(shortDay(M, x.di)); else { next[x.di] = x.L; ok.push(shortDay(M, x.di)); } }
  const warn = overNote(M, before, next, isGoalie(M, id) ? 'goalies' : 'skaters'), nm = M.players[id].name;
  const toast = nm + (ok.length ? ' starts ' + ok.join(', ') + '.' : ask.length || full.length ? " wasn't started anywhere." : ' already starts every remaining game he has.') +
    (ask.length ? ' On ' + ask.join(', ') + ' everyone he could replace plays too. Click that cell to choose.' : '') +
    (full.length ? ' On ' + full.join(', ') + ' the roster is full and nobody can go into IR: that needs a drop.' : '') + (warn ? ' ⚠ ' + warn : '');
  if (ok.length) applyLineups(next, toast); else { Object.assign(EDIT, { toast, sel: null, pick: null }); rerenderWeek(); }
}
// Hover preview: classes only on cells already drawn (the one in-place DOM change), cleared on mouseout; none while a selection or prompt is open.
let PV_ON = [];
function clearPreview() { PV_ON.forEach(n => n.classList.remove('fgt-pv', 'fgt-pvb', 'fgt-pvs')); PV_ON = []; }
function showPreview(table, cell) {
  clearPreview();
  if (!EDIT.editing || EDIT.sel || EDIT.pick) return;
  const [dis, id] = cell.getAttribute('data-g2').split('|'), di = +dis, M = EDIT.model, L = EDIT.lineups[di];
  const pl = planClick(M, di, L, id); if (pl.k !== 'move') return;
  for (const x of previewDiff(M, L, pl.L, di, id)) {
    const n = table.querySelector('[data-g2="' + di + '|' + x.id + '"]'); if (!n) continue;
    n.classList.add(x.self ? 'fgt-pvs' : x.to === 'bench' ? 'fgt-pvb' : 'fgt-pv'); PV_ON.push(n);
  }
}
function gridCellNode(E, di, id, lineups, ledger, T) {
  const M = E.model, d = M.days[di], L = lineups[di], c = gridCell(M, lineups, di, id, ledger), td = el('td', { class: 'fgt-c fgt-' + d.state });
  if (c.kind === 'off') { td.appendChild(el('span', { class: 'fgt-cell fgt-na', title: d.slots === null ? 'No lineup loaded' : 'Not on the roster ' + d.label, text: '—' })); return td; }
  const row = M.players[id].row, g = gameOfDay(M, di, id), key = gridKey(L, id), act = c.kind === 'play' || c.kind === 'idle', inIR = c.kind === 'ir';
  const live = E.editing && d.state !== 'past' && d.slots !== null, plan = live && !c.locked ? planClick(M, di, L, id) : null;
  const tk = irTargetKey(T, L, id, key), isSel = !!(E.sel && E.sel.di === di && E.sel.key === key), mk = T && T.has(tk) && !isSel ? moveKind(M, di, L, E.sel.s, tk) : null;
  let cls = 'fgt-cell fgt-gx ' + (act ? 'fgt-act' : 'fgt-bn') + (c.kind === 'play' || c.kind === 'benchGame' ? ' fgt-hg' : ' fgt-ng') + (g && act && c.kind === 'idle' ? ' fgt-strk' : '') +
    (E.editing && c.changed ? ' fgt-chg' : '') + (c.over ? ' fgt-ovr' : '') + (c.locked ? ' fgt-lockd' : '');
  if (isSel) cls += ' fgt-sel'; else if (mk) cls += ' fgt-tgt' + (mk.k === 'bump' || mk.k === 'bench' ? ' fgt-bump' : '') + (mk.k === 'blocked' ? ' fgt-blockd' : ''); else if (T) cls += ' fgt-dim';
  else if (E.pick) cls += E.pick.di === di && E.pick.id === id ? ' fgt-sel' : pickTarget(E.pick, di, id) ? ' fgt-tgt fgt-sits' : ' fgt-dim';
  const base = act ? 'In ' + c.slot : inIR ? 'On IR' : 'On the bench (reserve)';
  const pt = E.pick && pickTarget(E.pick, di, id), full = g ? gameText(M, di, id, true) + ' · ' : '', tip = d.state === 'past' ? full.slice(0, -3) : full + (pt ? pickTip(M, E.pick, id) : mk ? (mk.k === 'blocked' ? mk.why + '.' : 'Click: ' + mk.txt + '.') : c.locked ? 'Locked: ' + lockWhy(M, di, id) : plan ? plan.text + '.' : base);
  const kids = [];
  if (act) kids.push(el('span', { class: 'fgt-sl', text: c.slot })); else if (inIR) kids.push(el('span', { class: 'fgt-sl', style: 'color:#fca5a5', text: 'IR' }));
  kids.push(el('span', { class: 'fgt-gt', text: gridCellText(c, g ? gameText(M, di, id) : '') }));
  kids.push(...rosterTagNodes(M, di, id));
  if (c.tag && g && !(inIR && c.tag.text === 'IR')) kids.push(el('span', { class: 'fgt-tag fgt-tag-' + c.tag.kind, text: c.tag.text, title: c.tag.title }));
  if (c.over && g) kids.push(el('span', { class: 'fgt-tag fgt-tag-over', text: 'over', title: "Past the games max: this game won't count" }));
  if (inIR && irIneligibleKnown(M, di, id)) kids.push(notIRTag());   // mock parity #3, read-only too
  if (c.locked && d.state !== 'past') kids.push(el('span', { class: 'fgt-lk', text: '🔒', title: lockWhy(M, di, id) }));
  const node = el('button', { type: 'button', class: cls, title: tip, 'data-g2': di + '|' + id }, kids);
  td.appendChild(node);   // the cell first: the IR button is its sibling (tab order, no interactive nesting)
  if (!E.editing) { node.setAttribute('disabled', ''); return td; }
  if (live) {
    // IR chip, always visible (mock parity #1): with room it moves him to IR; IR full, he is IR-eligible -> the dock lists one swap per IR player
    const ir = !c.locked && !inIR ? toIR(M, di, L, id) : null;
    const swap = !ir && !c.locked && !inIR && !irRoom(M, L) && irEligible(M, di, id) && [...targetsFor(M, di, L, selOf(key))].some(k => k.startsWith('x:'));
    if (ir) td.appendChild(click(el('button', { type: 'button', class: 'fgt-irb', title: 'Move to IR on ' + shortDay(M, di), 'aria-label': M.players[id].name + ': move to IR on ' + shortDay(M, di), text: 'IR' }), e => { e.stopPropagation(); applyEdit(di, ir, M.players[id].name + ' to IR on ' + shortDay(M, di) + '.'); }));
    else if (swap) td.appendChild(click(el('button', { type: 'button', class: 'fgt-irb', title: 'IR is full: choose who comes out of IR on ' + shortDay(M, di), 'aria-label': M.players[id].name + ': IR is full, choose who he swaps with on ' + shortDay(M, di), text: 'IR' }),
      e => { e.stopPropagation(); Object.assign(EDIT, { toast: '', pick: null, sel: { di, key, s: selOf(key), irOnly: true } }); rerenderWeek(); }));
    if (ir || swap) td.classList.add('fgt-hasirb');
    click(node, () => gridCellClick(di, id));
  } else if (d.state === 'past' || c.locked) click(node, () => { Object.assign(EDIT, { toast: c.locked ? 'Locked: ' + lockWhy(M, di, id) + '.' : '', sel: null, pick: null }); rerenderWeek(); });
  return td;
}
function gridDock(E) {
  const M = E.model, kids = [];
  if (E.pick) {
    const { di, id, opts } = E.pick;
    kids.push(el('div', { class: 'fgt-q' }, ['Every slot ', el('b', { text: M.players[id].name }), ' fits on ', el('b', { text: M.days[di].label }), ' holds a player who plays. Who sits?']));
    for (const o of opts) kids.push(btn(M.players[o.out].name + ' · ' + (gameText(M, di, o.out) || 'no game') + ' · ' + fpgText(M, o.out), '', () => gridPick(o)));
    kids.push(btn('Cancel', 'fgt-link', () => { EDIT.pick = null; rerenderWeek(); }), el('div', { class: 'fgt-small', text: 'Or click a green cell in that day. Esc or a click elsewhere cancels.' }));
  } else {
    const { di, s } = E.sel, L = E.lineups[di], opts = dockOptions(M, di, L, E.sel), q = dockQuestion(M, di, L, E.sel);
    kids.push(el('div', { class: 'fgt-q' }, q ? [el('b', { text: M.players[q.id].name }), q.pre]
      : ['Open ', el('b', { text: M.days[di].slots[s.i].pos }), ' slot on ', el('b', { text: M.days[di].label }), '. Who goes in?']));
    for (const o of opts) {
      const open = !q && o.k !== 'blocked';
      const b = el('button', { type: 'button', class: 'fgt-btn fgt-opt-' + o.k }, [open ? openOption(M, di, o.key.slice(2)) : o.txt].concat(open && o.pair ? [el('span', { class: 'fgt-warnl', text: o.pair })] : []).concat(o.note ? [' ', el('span', { class: o.plays ? 'fgt-warnl' : 'fgt-small', text: o.note })] : []));
      if (o.title) b.title = o.title;
      if (o.k === 'blocked') { b.setAttribute('disabled', ''); b.title = o.why; } else click(b, () => colMoveClick(di, o.key));
      kids.push(b);
    }
    if (!opts.length) kids.push(el('span', { class: 'fgt-small', text: q ? 'Nowhere to move him that day.' : OPEN_NONE }));
    kids.push(btn('Cancel', 'fgt-link', () => { EDIT.sel = null; rerenderWeek(); }), el('div', { class: 'fgt-small', text: 'Or click a highlighted cell in that day. Blue dashed: an open slot or a swap. Amber dashed: that player goes to reserve. Esc cancels.' }));
  }
  return el('div', { class: 'fgt-dock', 'data-fgt': 'dock' }, [el('div', { class: 'fgt-pick' }, kids)]);
}
function buildGridBody(E) {
  const M = E.model, lineups = E.editing ? E.lineups : baseOf(M), ledger = gameLedger(M, lineups), loaded = M.days.some(d => d.slots !== null);
  const heads = M.days.map((d, di) => {
    const L = lineups[di], T = E.editing && E.sel && E.sel.di === di ? selTargets(M, di, L, E.sel) : null;
    const kids = [dayHead(di)];
    if (E.editing && d.slots !== null) {
      const open = [];
      L.s.forEach((q, i) => {
        if (q) return;
        const n = el('button', { type: 'button', class: 'fgt-chip' + (T && T.has('s:' + i) ? ' fgt-tgt' : ''), title: 'Open ' + d.slots[i].pos + ' slot', text: '+' + d.slots[i].pos });
        if (d.state === 'past') n.setAttribute('disabled', ''); else click(n, () => { EDIT.pick = null; colMoveClick(di, 's:' + i); });
        open.push(n);
      });
      kids.push(el('div', {}, open.length ? open : [el('span', { class: 'fgt-small', text: 'no open slots' })]));
    }
    return el('th', { class: 'fgt-' + d.state + (E.sel && E.sel.di === di ? ' fgt-selday' : '') }, kids);
  });
  const body = [], groups = [];
  const posOf = id => M.players[id].group === 'goalies' ? 'G' : ((M.players[id].row && M.players[id].row.pos || '').split(',')[0].trim() || 'Skaters');
  for (const id of M.order) { const g = posOf(id); let x = groups.find(y => y.g === g); if (!x) groups.push(x = { g, ids: [] }); x.ids.push(id); }
  groups.sort((a, b) => (a.g === 'G') - (b.g === 'G'));
  // Mock parity #2: whoever was on IR on the period's first loaded day is listed only in a last group.
  const fi = M.days.findIndex(d => d.slots !== null), irIds = new Set(fi >= 0 ? M.days[fi].base.ir : []);
  for (const x of groups) x.ids = x.ids.filter(id => !irIds.has(id));
  const irGroup = { g: 'Started the week on IR', ids: M.order.filter(id => irIds.has(id)) };
  groups.push(irGroup);
  for (const { g, ids } of groups.filter(x => x.ids.length)) {
    body.push(el('tr', { class: 'fgt-grp' }, [el('td', { class: 'fgt-gl', text: g }), el('td', { colspan: String(M.days.length) })]));
    for (const id of ids) {
      const p = M.players[id], sub = [(p.row && p.row.pos) || '', E.extras ? fpgShort(M, id) : '–'].filter(Boolean).join(' · ');
      const kids = [el('span', { class: 'fgt-wn' }, [p.shortName || p.name, el('span', { class: 'fgt-p', text: sub })])];
      // 2026-10-18: the start-all state shows without a hover; none on the started-on-IR rows (coming off IR is another move)
      const pill = E.editing && loaded && g !== irGroup.g ? allGamesPill(M, lineups, id) : null;
      if (pill && pill.state !== 'none') {
        kids.push(pill.state === 'done' ? el('span', { class: 'fgt-all', title: 'Already starts every remaining game he has', text: '✓ all' })
          : pill.state === 'go' ? click(el('button', { type: 'button', class: 'fgt-all', title: allGamesTip(M, lineups, id), text: 'start +' + pill.n }), () => allGamesClick(id))
          : el('span', { class: 'fgt-all', title: allGamesTip(M, lineups, id), text: 'start +0' }));
      }
      const who = el('td', { class: 'fgt-who', title: nameTitle(M, id, E.extras) }, [el('div', { class: 'fgt-wr' }, kids)]);
      body.push(el('tr', {}, [who].concat(M.days.map((d, di) => gridCellNode(E, di, id, lineups, ledger, E.editing && E.sel && E.sel.di === di ? selTargets(M, di, lineups[di], E.sel) : null)))));
    }
  }
  const foot = (label, f) => el('tr', {}, [el('td', { text: label })].concat(M.days.map((d, di) => el('td', { class: 'fgt-' + d.state }, d.slots === null ? ['–'] : f(di, d)))));
  const warn = t => el('span', { class: 'fgt-warn', text: t });
  const tfoot = el('tfoot', {}, [
    foot('Skater slots', di => { const v = dayHeadView(M, lineups, di), bad = [v.idle ? v.idle + ' not counted' : '', v.open ? v.open + ' open' : ''].filter(Boolean).join(', '); return [v.games + ' play' + (bad ? ' · ' : ''), bad ? warn(bad) : '']; }),
    foot('Roster (IR not counted)', di => { const n = rosterCount(M, di, lineups[di]), mx = M.limits.total; return [mx === null ? String(n) : n > mx ? el('span', { class: 'fgt-bad2', text: n + '/' + mx + ' over' }) : n === mx ? warn(n + '/' + mx + ' full') : n + '/' + mx]; }),
    foot('Bench', di => { const b = bench(M, di, lineups[di]), n = b.filter(id => gridCell(M, lineups, di, id, ledger).kind === 'benchGame').length; return [b.length + ' on bench' + (n ? ' · ' : ''), n ? warn(n + ' could play') : '']; }),
  ]);
  const table = el('table', { class: 'fgt-grid', style: '--fgt-days:' + M.days.length }, [el('thead', {}, [el('tr', {}, [el('th', { class: 'fgt-whoh', text: 'Player' + (E.extras ? ' · ' + fpgHeader() : '') })].concat(heads))]), el('tbody', {}, body), tfoot]);
  if (E.editing) {
    table.addEventListener('mouseover', e => { const c = e.target.closest && e.target.closest('[data-g2]'); if (!c || e.target.closest('.fgt-irb')) clearPreview(); else showPreview(table, c); });
    table.addEventListener('mouseout', e => { if (e.target.closest && e.target.closest('[data-g2]')) clearPreview(); });
    table.addEventListener('focusin', e => { const c = e.target.closest && e.target.closest('[data-g2]'); if (c) showPreview(table, c); else clearPreview(); });   // keyboard focus previews like hover
    table.addEventListener('focusout', clearPreview);
  }
  const legend = buildLegend('grid', E);
  const out = [el('div', { class: 'fgt-wkbody' }, [table]), legend];
  if (E.editing && (E.sel || E.pick)) out.unshift(gridDock(E));   // 2026-10-18: right above the grid, not fixed at the bottom
  return out;
}

function buildWeekPanel() {
  const collapsed = weekCollapsed(), kids = [buildWeekHead(collapsed)];
  if (!collapsed) {
    if (EDIT.loadError) kids.push(el('div', { class: 'fgt-err' }, [EDIT.loadError, click(el('a', { href: '#', text: 'retry' }), startEditing)]));
    kids.push(buildMeter());
    // the IR-eligibility banner also read-only, from the lineups the read-only body draws (mock parity #4)
    for (const b of banners(EDIT.model, EDIT.editing ? EDIT.lineups : baseOf(EDIT.model), EDIT.results, EDIT.editing)) kids.push(el('div', { class: 'fgt-banner', text: b }));
    const pend = buildPendingBar(); if (pend) kids.push(pend);
    // 2026-10-18: save bar, then the toast, then the prompt bar (dock) and the body, then the legend: what a click did and what to
    // answer next sit right above the grid (was: body, toast, save bar, legend)
    kids.push(...buildSaveBar());
    if (EDIT.toast) kids.push(el('div', { class: 'fgt-toast' }, [el('span', { text: EDIT.toast }), dismissBtn(() => { EDIT.toast = ''; })]));
    const body = EDIT.view === 'grid' ? buildGridBody(EDIT) : buildColumnsBody(EDIT), isLegend = n => /(^| )fgt-legend( |$)/.test(n.getAttribute('class') || '');
    kids.push(...body.filter(n => !isLegend(n)));
    kids.push(...body.filter(isLegend));
  }
  // title '': the panel sits inside Fantrax's <headline title="Team Roster">, whose tooltip every untitled spot in it would inherit
  return el('div', { class: 'fgt-wk' + (EDIT.saving ? ' fgt-saving' : ''), 'data-fgt': 'week', 'data-fgt-key': EDIT.key, title: '', style: 'flex:1 1 100%;min-width:0' }, kids);
}

// The headline is a flex row (title block ~900 px + team picker); letting it wrap and giving the panel a 100% basis puts
// the panel on its own full-width line under both (1068 px on 2026-09-24), the same width as Fantrax's tables.
function renderWeek(root, headline, route, team, key, now, opts, fresh) {
  ensureWeekStyle();
  syncEdit(route, team, key, now, opts, fresh);
  const pos = bodyScroll(root.querySelector('[data-fgt="week"]'));
  removeOwn(root, 'week');
  headline.style.flexWrap = 'wrap';
  const panel = buildWeekPanel();
  headline.appendChild(panel);
  restoreScroll(panel, pos);
  armDismiss();
  if (autoEditWanted(EDIT) || statsWanted(EDIT)) startEditing();   // 2026-10-18: the extras load by themselves (editable on the user's own team only)
  else if (extrasRefreshWanted(EDIT, fresh)) refreshExtras();
}

// ---- recolour Fantrax's own Schedule - Week cells by that day's lineup (1.2.0): the grid draws every row with the
// displayed day's slot, so a player benched for Thursday still looks active in Thursday's column. Rows are matched by
// the player's full name in the first cell (the player link carries no id); the day cells by the header's day columns.
// 1.3.2: a reserve day is left as Fantrax draws it (hover text only). A strike means "expected to miss this game"
// everywhere else in the script, and striking a healthy bench player's games hid the opponents a manager reads to pick
// which ones to start him in (league feedback, 2026-09-27); the missing green box already says he is not active.
const CELL_STYLE = {
  active: { background: 'rgba(74,222,128,.10)', boxShadow: 'inset 0 0 0 1px rgba(74,222,128,.35)' },
  activeOut: { background: 'rgba(248,113,113,.10)', boxShadow: 'inset 0 0 0 1px rgba(248,113,113,.35)', textDecoration: 'line-through' },
  reserve: {},
  ir: { opacity: '0.35' },
};
function activeTitle(row, a) {
  if (a.by === 'gp') return a.counted ? 'active that day, played' : 'active that day, did not play';
  return a.counted ? (a.by === 'date' ? 'active that day, counted from the expected return date' : 'active that day') : 'active that day, but ' + (row.tag ? row.tag.text : 'out');
}
function clearCellStyles(table) {
  for (const c of table.querySelectorAll('[data-fgt-cell]')) { for (const k of ['background', 'boxShadow', 'textDecoration', 'opacity']) c.style[k] = ''; c.removeAttribute('data-fgt-cell'); c.removeAttribute('title'); }
}
function renderCellStatus(team, key, now, opts) {
  const today = dayString(now || new Date());
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
        const a = activeGame(row, game, today, opts);   // 1.3.6: a game under way or played goes by that day's GP
        const st = game.status === 'active' ? (a.counted ? CELL_STYLE.active : CELL_STYLE.activeOut) : game.status === 'reserve' ? CELL_STYLE.reserve : CELL_STYLE.ir;
        Object.assign(cell.style, st);
        cell.setAttribute('data-fgt-cell', key);
        cell.setAttribute('title', game.status === 'active' ? activeTitle(row, a) : game.status === 'reserve' ? 'on reserve that day' : 'IR / not on the roster that day');
      }
    }
    table.setAttribute('data-fgt-cells', key);
  }
}

const ROSTER_LOADS = latestGate();
function renderRoster(route, force, stale) {
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
  const key = rosterKey(route, period, day);
  const own = ownNodes(root, 'strip');
  if (isWholeSeason(route)) {   // 2026-10-18: was "unavailable" with a retry that could never succeed
    if (own.marker && own.marker.getAttribute('data-fgt-key') === key && own.marker.getAttribute('data-fgt-state') === 'whole') return;
    for (const n of root.querySelectorAll('[data-fgt="perday"], [data-fgt="week"], [data-fgt="retctl"]')) n.remove();
    finishUpdate(root, 'strip', () => { const m = marker('strip', key, 'pick one scoring period to see the games count and the Week panel'); m.setAttribute('data-fgt-state', 'whole'); anchor.appendChild(m); });
    return;
  }
  // Only the Schedule - Week view has day columns; elsewhere the strip alone is the complete render.
  const hasDayColumns = Array.from(document.querySelectorAll(SEL.rosterTables + ' ' + SEL.rosterHeaderRow + ' > ' + SEL.cell))
    .some(c => /^\w{3} \d{1,2}\/\d{1,2}$/.test(c.textContent.trim()));
  const perDayPresent = !hasDayColumns || !!root.querySelector('[data-fgt="perday"]');
  const cellsPresent = !hasDayColumns || !!root.querySelector('[data-fgt-cells="' + key + '"]');
  const weekPresent = !!root.querySelector('[data-fgt="week"]');
  if (!shouldRender(own.table || own.marker, key, force) && perDayPresent && cellsPresent && weekPresent) return;
  beginUpdate(root, 'strip', key, n => anchor.appendChild(n));
  for (const n of root.querySelectorAll('[data-fgt="perday"], [data-fgt="week"]')) n.style.opacity = '0.45';
  const seq = ROSTER_LOADS.next(), stillWanted = () => anchor.isConnected && ROSTER_LOADS.isLatest(seq) && isCurrent(ownNodes(root, 'strip').marker, key);
  const fresh = !cacheHas(route.leagueId, { teamId: route.teamId, period, day }, stale);   // nothing usable cached: this render fetches
  return cachedLoadTeam(route.leagueId, { teamId: route.teamId, period, day, profiles: returnDatesOn() }, undefined, undefined, undefined, stale).then(withDates(route.leagueId)).then(({ team, opts }) => {
    if (!stillWanted()) return;
    const now = new Date();
    finishUpdate(root, 'strip', () => { anchor.appendChild(buildTable('strip', key, team, now, opts)); removeOwn(root, 'retctl'); anchor.appendChild(buildReturnControl('roster', key, () => renderRoster(route, true, true))); });
    renderWeek(root, headline, route, team, key, now, opts, fresh);
    renderPerDay(team, key, now, opts);
    renderCellStatus(team, key, now, opts);
  }, err => {
    console.warn(LOG, 'roster', err);
    if (!stillWanted()) return;
    finishUpdate(root, 'strip', () => anchor.appendChild(marker('strip', key, 'unavailable', () => renderRoster(route, true))));
  });
}

// ---------------------------------------------------------------- start-up

// 1.4.0: Esc cancels a selection (added once, in start)
function onEscape(e) { if (e.key === 'Escape' && (EDIT.sel || EDIT.pick)) { EDIT.sel = null; EDIT.pick = null; EDIT.toast = ''; rerenderWeek(); } }
function start() {
  document.addEventListener('keydown', onEscape);
  // 2026-10-18: a click outside the panel also closes an open "who sits?" (inside, the cell handlers decide)
  document.addEventListener('click', e => { if (EDIT.pick && !(e.target.closest && e.target.closest('[data-fgt="week"]'))) { EDIT.pick = null; rerenderWeek(); } });
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
  // 1.4.0: the timed refresh and the DOM-mutation refresh pause while moves are pending or a choice is open (editPaused); a URL change,
  // the save toast, tab focus, resize and the panel's Refresh link still rebuild, and the rebuild re-applies the pending moves.
  setInterval(() => { if (editPaused()) return; clearCache(); schedule(true); }, 5 * 60 * 1000);
  const observe = () => {
    const main = document.querySelector('section.fx-layout__main') || document.body;
    new MutationObserver(records => {
      // ignore mutations caused by our own nodes
      if (records.every(r => Array.from(r.addedNodes).concat(Array.from(r.removedNodes)).every(n => n.nodeType === 1 && n.hasAttribute && n.hasAttribute('data-fgt')))) return;
      if (editPaused() && document.querySelector('[data-fgt="week"]')) return;   // paused, unless Fantrax's re-render took the panel away
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
  module.exports = { INJURY_ICON_TYPES, FLAG_BY_ICON, GROUP_BY_SC, STATUS_BY_ID, dayString, periodDays, addDays, dayFromIndex, indexFromDay, seasonStart, periodForDay, dayLabel,
    parsePeriodList, parseGamesPerPos, isStartedCell, parseStart, parseGameText, iconTag, rowFlag, parseReturnDate, parseScheduleRows, coveredDays, parseDayStatuses, parseDayLineup, planChunks, applyDayStatuses, statusLabel, statusShort,
    compute, missingStatsDays, formatStatus, isPending, activeGame, activeTitle, effectiveReturnDate, countsGame, explainGroup, explainTeam, formatEffect, offLineup, formatOffLineup, offSections, weekView, buildEditModel, cloneLineup, onRoster, fits, irEligible, irIneligibleKnown, dockOptions, dockQuestion, openOption, nameTitle, OPEN_NONE, fpgLong, rebuildNote, gameLine, hasGame, locked, dayLocked, lockWhy, counted, isGoalie, where, bench, fieldMapOf, sameFieldMap, lineupFromFieldMap, changes, seat, arrange, swapsFor, rosterCount, fitRoster, dayErrors, dayWarnings, gameLedger, targetsFor, computeMove, moveKind, planClick, toIR, allGamesPlan, allGamesPill, autoDismissMs, clickToast, saveLabel, saveBarView, gridCellText, legendSpec, extrasRefreshWanted, pendingBarReason, pickTip, startEditing, isWholeSeason, latestGate, pickTarget, ownTeamState, autoEditWanted, statsWanted, saveBarShown, pendingBarShown, overNote, fpgShort, fpgHeader, dayHeadLine, shortTime, rankFpg, fpgText, byFpg, suggestions, fillWeek, withoutLockedMoves, savePlan, saveRequests, keepLastShown, dayHref, meterView, meterLineups, dayHeadView, columnBench, benchGame, offRowNote, columnRows, gridCell, gameTag, rosterTags, previewDiff, reviewView, banners, playerName, saveClick, EDIT, syncEdit, pendingCount, editPaused, pendingKey, pendingFrom, reapply, loadPending, savePending, clearPendingDays, shouldRender, isCurrent, rosterKey, parseRoute, renderPerDay,
    api, apiMulti, loadTeam, cachedLoadTeam, clearCache, reuseSchedule, SCHEDULE_REUSE_MS, RETURN_DATES_KEY, returnDatesOn, setReturnDatesOn, PROFILE_TTL_MS, profileMsg, loadReturnTexts, withReturnDates, parseSeasonStats, parseRosterLimits, ownTeamId, isOwnTeam, isDailyLineups, loadEditExtras, fieldMapFromLineup, interpretResponse, lineupMsg, saveDay, saveAll };
}
if (typeof document !== 'undefined') { try { start(); } catch (e) { console.warn(LOG, 'start failed', e); } }
