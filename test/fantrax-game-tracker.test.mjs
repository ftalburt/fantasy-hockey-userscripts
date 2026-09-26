import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const T = createRequire(import.meta.url)('../fantrax-game-tracker.user.js');

// ---- fixture builders (hand-written shapes copied from the 2026-09-23 spec; names are made up) ----
export function gamesPerPos({ teamId = 'teamA', period = 1, skaters = [0, '52'], goalies = [0, '4'] } = {}) {
  return {
    scMinMaxData: { tableData: [
      { scoringCategory: 'Games Played - Goalies (GP)', total: String(goalies[0]), min: 'No min', max: goalies[1] },
      { scoringCategory: 'Games Played - Skaters (GP)', total: String(skaters[0]), min: 'No min', max: skaters[1] },
    ] },
    displayedSelections: { displayedScoringPeriod: period, displayedFantasyTeamId: teamId, displayedView: 'GAMES_PER_POS' },
    displayedLists: { scoringPeriodList: [
      { name: 'Full Season', value: 9999 },
      { name: '(Sep 29/26 - Oct 4/26)', value: 1 },
      { name: '(Oct 5/26 - Oct 11/26)', value: 2 },
      { name: '(Dec 28/26 - Jan 3/27)', value: 14 },
      { name: '(Feb 1/27 - Feb 14/27)', value: 19 },
    ] },
    fantasyTeams: [{ id: 'teamA', name: 'Alpha Bets' }, { id: 'teamB', name: 'Beta Blockers' }],
  };
}

// days: array of header labels like 'Tue 9/29'; games: {label -> 'Tue 4:00PM' | '' }
// posId: the SLOT's position (206 C, 203 LW, 204 RW, 202 D, 208 Skt/flex, 201 G — real ids 2026-09-24); posIds/pos: the
// player's own positions (scorer.posIdsNoFlex / posShortNames); tip: the rank cell's toolTip ("Skt rank: 42 • …").
// name === null with a posId is an OPEN active slot; name === null without one is Fantrax's "Reserve spot(s) available" row.
const POS_NAME = { 206: 'C', 203: 'LW', 204: 'RW', 202: 'D', 201: 'G' };
export function scheduleRow({ name = 'A. Player', statusId = '1', icons = [], games = {}, posId, posIds, pos, tip, eligible = ['1', '2'] }, days) {
  posId = posId || '206';
  const cells = [Object.assign({ content: '1 • 2' }, tip ? { toolTip: tip } : {}), { content: '30' }, { content: '100' }, { content: '2.5' }];
  for (const d of days) cells.push(games[d] !== undefined ? { content: `@XXX<br/>${games[d]}`, eventId: 'e' + d } : { content: '' });
  const ids = posIds || [posId === '208' ? '206' : posId];
  const row = { posId, statusId, cells, eligibleStatusIds: eligible };   // 1.3.1: Fantrax's own per-player answer (real shape 2026-09-26)
  if (name !== null) row.scorer = { name, shortName: name, scorerId: 'id-' + name, icons, posIdsNoFlex: ids, posShortNames: pos || ids.map(i => POS_NAME[i] || i).join(',') };
  return row;
}
const STATUS_TOTALS = [{ id: '1', name: 'Active' }, { id: '2', name: 'Reserve' }, { id: '3', name: 'Inj Res' }];
export function schedule({ days, skaters = [], goalies = [], statusTotals = STATUS_TOTALS }) {
  // real shape (2026-09-23): fixed columns have name+shortName, day columns have only shortName + key "sched_M/D" + eventStr
  const header = { cells: [{ name: 'Position rank', shortName: 'Rk' }, { name: 'Age', shortName: 'Age' }, { name: 'Fantasy Points', shortName: 'FPts' }, { name: 'Average', shortName: 'FP/G' },
    ...days.map(d => ({ eventStr: true, shortName: d, key: 'sched_' + d.split(' ')[1] }))] };
  const st = statusTotals ? { statusTotals } : {};
  return { tables: [
    Object.assign({ scGroup: '2010', scGroupScorerHeader: 'Skaters', header, rows: skaters.map(r => scheduleRow(r, days)) }, st),
    Object.assign({ scGroup: '2020', scGroupScorerHeader: 'Goalies', header, rows: goalies.map(r => scheduleRow(r, days)) }, st),
  ] };
}
const WEEK1 = ['Tue 9/29', 'Wed 9/30', 'Thu 10/1', 'Fri 10/2', 'Sat 10/3', 'Sun 10/4', 'Mon 10/5'];

test('parsePeriodList reads date ranges and skips Full Season', () => {
  const p = T.parsePeriodList(gamesPerPos().displayedLists.scoringPeriodList);
  assert.deepEqual(p.map(x => x.id), [1, 2, 14, 19]);
  assert.deepEqual(p[0], { id: 1, start: '2026-09-29', end: '2026-10-04', days: ['2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'] });
  assert.equal(p[2].start, '2026-12-28');
  assert.equal(p[2].end, '2027-01-03');
  assert.equal(p[3].days.length, 14);
});

test('parseGamesPerPos reads played, max, team and period', () => {
  const g = T.parseGamesPerPos(gamesPerPos({ skaters: [12, '52'], goalies: [2, '4'] }));
  assert.equal(g.teamId, 'teamA');
  assert.equal(g.teamName, 'Alpha Bets');
  assert.equal(g.period, 1);
  assert.deepEqual(g.played, { skaters: 12, goalies: 2 });
  assert.deepEqual(g.max, { skaters: 52, goalies: 4 });
  assert.equal(g.periods.length, 4);
});

test('parseGamesPerPos: "No max" becomes null, missing table becomes null', () => {
  assert.deepEqual(T.parseGamesPerPos(gamesPerPos({ skaters: [0, 'No max'] })).max, { skaters: null, goalies: 4 });
  const d = gamesPerPos(); delete d.scMinMaxData;
  assert.deepEqual(T.parseGamesPerPos(d).max, { skaters: null, goalies: null });
  assert.deepEqual(T.parseGamesPerPos(d).played, { skaters: 0, goalies: 0 });
});





test('dayString and periodDays use calendar days, not 24 h arithmetic', () => {
  assert.equal(T.dayString(new Date(2026, 10, 1, 0, 30)), '2026-11-01'); // DST ends that morning in Chicago
  assert.deepEqual(T.periodDays('2026-10-31', '2026-11-02'), ['2026-10-31', '2026-11-01', '2026-11-02']);
});

// ---- compute ----
function row(status, games, injured = false, extra = {}) { return Object.assign({ name: 'r', injured, flag: null, returnDate: null, games: games.map(g => Object.assign({ status }, g)) }, extra); }   // every game carries its day's status
function at(day, h = 19) { const [y, m, d] = day.split('-').map(Number); return { day, start: new Date(y, m - 1, d, h, 0) }; }
const P1 = { id: 1, start: '2026-09-29', end: '2026-10-04', days: T.periodDays('2026-09-29', '2026-10-04') };
const NOW_THU_18 = new Date(2026, 9, 1, 18, 0); // Thu Oct 1, 6 pm

test('compute: all games pending before the period starts', () => {
  const r = T.compute({ played: 0, max: 52, rows: [row('active', [at('2026-09-29'), at('2026-10-03')]), row('reserve', [at('2026-10-02')])] }, P1, new Date(2026, 8, 28, 12));
  assert.deepEqual([r.played, r.max, r.left, r.scheduled, r.potential], [0, 52, 52, 2, 3]);
  assert.deepEqual(r.status, { kind: 'unused', over: 0, unused: 50, bench: 1 });
  assert.deepEqual(r.perDay.map(d => d.cumulative), [1, 1, 1, 1, 2, 2]);
  assert.equal(r.perDay.some(d => d.crosses), false);
});

test('compute: mid-week — past days are started, today splits on start time', () => {
  const rows = [row('active', [at('2026-09-29'), at('2026-10-01', 17), at('2026-10-01', 20), at('2026-10-03')])];
  const r = T.compute({ played: 2, max: 4, rows }, P1, NOW_THU_18);
  assert.equal(r.scheduled, 2, '8 pm today and Saturday');
  assert.deepEqual(r.status, { kind: 'ok', over: 0, unused: 0, bench: 0 });
  assert.deepEqual(r.perDay.map(d => [d.active, d.cumulative]), [[1, null], [0, null], [2, 3], [0, 3], [1, 4], [0, 4]]);
});

test('compute: over the cap flags the crossing day', () => {
  const rows = [row('active', [at('2026-10-02'), at('2026-10-03'), at('2026-10-04')])];
  const r = T.compute({ played: 2, max: 4, rows }, P1, NOW_THU_18);
  assert.deepEqual(r.status, { kind: 'over', over: 1, unused: 0, bench: 0 });
  assert.deepEqual(r.perDay.map(d => d.crosses), [false, false, false, false, false, true]);
  assert.equal(T.formatStatus(r.status), 'over by 1');
});

test('compute: injured and IR rows never count, bench is capped by the unused room', () => {
  const rows = [row('active', [at('2026-10-02')], true), row('ir', [at('2026-10-02')]), row('active', [at('2026-10-03')]),
    row('reserve', [at('2026-10-02'), at('2026-10-03'), at('2026-10-04')])];
  const r = T.compute({ played: 0, max: 3, rows }, P1, NOW_THU_18);
  assert.deepEqual([r.scheduled, r.potential], [1, 4]);
  assert.deepEqual(r.status, { kind: 'unused', over: 0, unused: 2, bench: 2 });
  assert.equal(T.formatStatus(r.status), '2 unused, bench covers all 2');
  assert.equal(r.perDay[3].active, 0, 'injured active player does not appear in the per-day count');
});

test('compute: unused with nothing on the bench', () => {
  const r = T.compute({ played: 0, max: 3, rows: [row('active', [at('2026-10-02')])] }, P1, NOW_THU_18);
  assert.equal(T.formatStatus(r.status), '2 unused');
});

test('compute: no max → nomax, left null, nothing NaN', () => {
  const r = T.compute({ played: 5, max: null, rows: [row('active', [at('2026-10-02')])] }, P1, NOW_THU_18);
  assert.equal(r.left, null);
  assert.equal(r.status.kind, 'nomax');
  assert.equal(T.formatStatus(r.status), 'no games max');
  assert.deepEqual(r.perDay.map(d => d.crosses), [false, false, false, false, false, false]);
  assert.equal(r.perDay[3].cumulative, 6);
});

test('compute: a game today with no start time counts as pending', () => {
  const r = T.compute({ played: 0, max: 9, rows: [row('active', [{ day: '2026-10-01', start: null }])] }, P1, NOW_THU_18);
  assert.equal(r.scheduled, 1);
});

test('compute: games outside the period days are ignored; 14-day period with 7 columns of games', () => {
  const P19 = { id: 19, start: '2027-02-01', end: '2027-02-14', days: T.periodDays('2027-02-01', '2027-02-14') };
  const rows = [row('active', [at('2027-02-01'), at('2027-02-07'), at('2027-02-20')])];
  const r = T.compute({ played: 0, max: 120, rows }, P19, new Date(2027, 0, 31));
  assert.equal(r.perDay.length, 14);
  assert.equal(r.scheduled, 2);
  assert.equal(r.perDay[13].cumulative, 2);
});

// ---- routing ----
test('parseRoute: matchups and roster URLs with matrix params', () => {
  assert.deepEqual(T.parseRoute('https://www.fantrax.com/fantasy/league/abc123/livescoring'), { page: 'matchups', leagueId: 'abc123', period: null, day: null, teamId: null, view: null });
  assert.deepEqual(T.parseRoute('https://www.fantrax.com/fantasy/league/abc123/livescoring;period=2?matchupId=a_b&teamId=ALL&layout=STANDARD'), { page: 'matchups', leagueId: 'abc123', period: 2, day: null, teamId: null, view: null });
  assert.deepEqual(T.parseRoute('https://www.fantrax.com/fantasy/league/abc123/team/roster;view=SCHEDULE_PERIOD;scoringPeriod=3'), { page: 'roster', leagueId: 'abc123', period: 3, day: null, teamId: null, view: 'SCHEDULE_PERIOD' });
  assert.deepEqual(T.parseRoute('https://www.fantrax.com/fantasy/league/abc123/team/roster;teamId=zzz9'), { page: 'roster', leagueId: 'abc123', period: null, day: null, teamId: 'zzz9', view: null });
  assert.equal(T.parseRoute('https://www.fantrax.com/fantasy/league/abc123/standings').page, null);
  assert.equal(T.parseRoute('https://www.fantrax.com/fantasy/league/abc123/draft').page, null);
  assert.equal(T.parseRoute('https://www.fantrax.com/fantasy/home').leagueId, null);
});

// ---- data layer ----
// responsesByKey: 'GAMES_PER_POS' | 'SCHEDULE_FULL' | 'STATS@<lineup day N>' | 'SCHEDULE_PERIOD@<lineup day N>' → data
function fakeFetch(responsesByKey) {
  const calls = [];
  const f = async (url, init) => {
    const body = JSON.parse(init.body);
    for (const m of body.msgs) calls.push({ url, method: m.method, data: m.data });
    const keyOf = m => m.method === 'getPlayerProfile' ? 'PROFILE@' + m.data.playerId : (m.data.period ? m.data.view + '@' + m.data.period : m.data.view);
    return { ok: true, json: async () => ({ responses: body.msgs.map(m => ({ data: m.method === 'getPlayerProfile' ? (responsesByKey[keyOf(m)] === null ? undefined : responsesByKey[keyOf(m)] || { sectionContent: {} }) : responsesByKey[keyOf(m)] })) }) };
  };
  f.calls = calls;
  return f;
}
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function labelFor(day) { const [y, m, d] = day.split('-').map(Number); const t = new Date(Date.UTC(y, m - 1, d)); return DOW[t.getUTCDay()] + ' ' + m + '/' + d; }
// a SCHEDULE_FULL-like response: day columns from `from` for `n` days; players: name → {statusId, games: {day: 'Tue 4:00PM'}}
function scheduleFrom(from, n, players, goalies = {}) {
  const days = Array.from({ length: n }, (_, i) => labelFor(T.addDays(from, i)));
  const row = ([name, v]) => ({ name, statusId: v.statusId || '1', icons: v.icons || [], posId: v.posId, posIds: v.posIds, pos: v.pos, games: Object.fromEntries(Object.entries(v.games || {}).map(([d, t]) => [labelFor(d), t])) });
  return schedule({ days, skaters: Object.entries(players).map(row), goalies: Object.entries(goalies).map(row) });
}
// a STATS-like response for one lineup day: only statuses matter
// value: a statusId string, or {statusId, eligible} (1.3.1)
const asRow = ([name, v]) => typeof v === 'object' ? Object.assign({ name }, v) : { name, statusId: v };
function statsDay(players, goalies = {}) { return schedule({ days: [], skaters: Object.entries(players).map(asRow), goalies: Object.entries(goalies).map(asRow) }); }
const NOW_PRESEASON = new Date(2026, 8, 23, 12);

test('parseScheduleRows: games inside the period from a 30-day schedule, statuses, injuries, empty slots', () => {
  const period = T.parsePeriodList(gamesPerPos().displayedLists.scoringPeriodList)[0];
  const data = scheduleFrom('2026-09-29', 30, {
    'Active One': { games: { '2026-09-29': 'Tue 4:00PM', '2026-10-05': 'Mon 7:00PM' } },
    'Hurt Three': { icons: [{ typeId: '30', tooltip: 'Hip - Out Indefinitely' }], games: { '2026-09-30': 'Wed 6:30PM' } },
    'No Time': { games: { '2026-10-02': '' } },
  }, { 'Goalie One': { games: { '2026-10-04': 'Sun 12:00PM' } } });
  data.tables[0].rows.push({ posId: '206', statusId: '2', cells: [] });   // empty slot
  const r = T.parseScheduleRows(data, period);
  assert.deepEqual(r.skaters.map(x => [x.id, x.injured, x.games.map(g => g.day)]), [['id-Active One', false, ['2026-09-29']], ['id-Hurt Three', true, ['2026-09-30']], ['id-No Time', false, ['2026-10-02']]]);
  assert.equal(r.skaters[0].games[0].start.getHours(), 16);
  assert.equal(r.skaters[2].games[0].start, null);
  assert.equal(r.goalies[0].games[0].start.getHours(), 12);
});

test('parseScheduleRows rolls the year over across New Year', () => {
  const period = T.parsePeriodList(gamesPerPos().displayedLists.scoringPeriodList)[2]; // Dec 28 - Jan 3
  const r = T.parseScheduleRows(scheduleFrom('2026-12-20', 30, { X: { games: { '2026-12-31': 'Thu 7:00PM', '2027-01-02': 'Sat 7:00PM' } } }), period);
  assert.deepEqual(r.skaters[0].games.map(g => g.day), ['2026-12-31', '2027-01-02']);
  assert.equal(r.skaters[0].games[1].start.getFullYear(), 2027);
});

test('coveredDays: which period days a schedule response has columns for', () => {
  const period = T.parsePeriodList(gamesPerPos().displayedLists.scoringPeriodList)[3]; // Feb 1-14
  assert.deepEqual(T.coveredDays(scheduleFrom('2027-01-25', 30, {}), period).length, 14);
  assert.deepEqual(T.coveredDays(scheduleFrom('2027-02-10', 7, {}), period), ['2027-02-10', '2027-02-11', '2027-02-12', '2027-02-13', '2027-02-14']);
});

test('parseDayStatuses maps scorer id → status for one lineup day; unknown statusId is ir', () => {
  assert.deepEqual(T.parseDayStatuses(statsDay({ A: '1', B: '2', C: '3', D: '9' })), { 'id-A': 'active', 'id-B': 'reserve', 'id-C': 'ir', 'id-D': 'ir' });
});

test('applyDayStatuses: a game takes its day\'s lineup status; a day without a lineup, or a player missing that day, is ir', () => {
  const rows = [{ id: 'id-A', name: 'A', injured: false, games: [{ day: '2026-09-29', start: null }, { day: '2026-10-03', start: null }, { day: '2026-10-04', start: null }] }];
  const out = T.applyDayStatuses(rows, { '2026-09-29': { 'id-A': 'active' }, '2026-10-03': { 'id-A': 'reserve' }, '2026-10-04': {} });
  assert.deepEqual(out[0].games.map(g => g.status), ['active', 'reserve', 'ir']);
  assert.deepEqual(T.applyDayStatuses(rows, {})[0].games.map(g => g.status), ['ir', 'ir', 'ir']);
});

test('apiMulti posts the Fantrax envelope and unwraps one data object per message', async () => {
  const f = fakeFetch({ X: { hello: 1 }, Y: { hello: 2 } });
  const d = await T.apiMulti('abc', [{ method: 'm', data: { view: 'X' } }, { method: 'm', data: { view: 'Y' } }], f);
  assert.deepEqual(d, [{ hello: 1 }, { hello: 2 }]);
  assert.equal(f.calls[0].url, '/fxpa/req?leagueId=abc');
});

test('apiMulti retries once after a failure, then rejects', async () => {
  let n = 0;
  const flaky = async () => { n++; if (n === 1) throw new TypeError('Failed to fetch'); return { ok: true, json: async () => ({ responses: [{ data: { ok: 1 } }] }) }; };
  assert.deepEqual(await T.apiMulti('abc', [{ method: 'm', data: {} }], flaky, 0), [{ ok: 1 }]);
  assert.equal(n, 2);
  let k = 0;
  await assert.rejects(T.apiMulti('abc', [{ method: 'm', data: {} }], async () => { k++; return { ok: false, status: 500 }; }, 0), /HTTP 500/);
  assert.equal(k, 2, 'one retry, then give up');
  await assert.rejects(T.apiMulti('abc', [{ method: 'm', data: {} }], async () => ({ ok: true, json: async () => ({}) }), 0), /empty response/);
});

test('loadTeam: games-played, then the 30-day schedule and one stats call per remaining lineup day, in parallel', async () => {
  const stats = {}; for (let n = 1; n <= 6; n++) stats['STATS@' + n] = statsDay({ S: n === 6 ? '2' : '1' }, { G: '2' });
  const f = fakeFetch(Object.assign({ GAMES_PER_POS: gamesPerPos({ skaters: [3, '52'], goalies: [1, '4'] }),
    SCHEDULE_FULL: scheduleFrom('2026-09-29', 30, { S: { games: { '2026-09-29': 'Tue 4:00PM', '2026-10-03': 'Sat 7:00PM', '2026-10-04': 'Sun 7:00PM', '2026-10-06': 'Tue 7:00PM' } } }, { G: { games: { '2026-10-03': 'Sat 7:00PM' } } }) }, stats));
  const t = await T.loadTeam('abc', { teamId: 'teamA', period: 1, day: null }, f, NOW_PRESEASON);
  assert.equal(t.teamName, 'Alpha Bets');
  assert.deepEqual([t.groups.skaters.played, t.groups.skaters.max], [3, 52]);
  assert.deepEqual(t.groups.skaters.rows[0].games.map(g => [g.day, g.status]), [['2026-09-29', 'active'], ['2026-10-03', 'active'], ['2026-10-04', 'reserve']], 'Oct 6 is outside the period; each day has its own status');
  assert.deepEqual(t.groups.goalies.rows[0].games.map(g => g.status), ['reserve']);
  assert.deepEqual(f.calls[0].data, { leagueId: 'abc', view: 'GAMES_PER_POS', scoringPeriod: '1', teamId: 'teamA' });
  assert.deepEqual(f.calls[1].data, { leagueId: 'abc', view: 'SCHEDULE_FULL', teamId: 'teamA' });
  assert.deepEqual(f.calls.slice(2).map(c => [c.data.view, c.data.period]), [1, 2, 3, 4, 5, 6].map(n => ['STATS', String(n)]));
  assert.equal(f.calls.length, 8);
  assert.equal(new Set(f.calls.map(c => c.url)).size, 1);
});

test('loadTeam asks the lineup of every period day, past days included, and exposes them per day', async () => {
  const stats = {}; for (let n = 1; n <= 6; n++) stats['STATS@' + n] = statsDay({ S: n === 1 ? '2' : '1' });
  const f = fakeFetch(Object.assign({ GAMES_PER_POS: gamesPerPos(), SCHEDULE_FULL: scheduleFrom('2026-10-01', 30, { S: { games: { '2026-10-01': 'Thu 7:00PM' } } }),
    'SCHEDULE_PERIOD@1': scheduleFrom('2026-09-29', 7, { S: { games: { '2026-09-29': 'Tue 4:00PM', '2026-10-01': 'Thu 7:00PM' } } }) }, stats));
  const t = await T.loadTeam('abc', { teamId: null, period: 1, day: null }, f, NOW_THU_18);   // Thu Oct 1 = lineup day 3
  assert.deepEqual(f.calls.filter(c => c.data.view === 'STATS').map(c => c.data.period), ['1', '2', '3', '4', '5', '6']);
  assert.deepEqual(t.groups.skaters.rows[0].games.map(g => [g.day, g.status]), [['2026-09-29', 'reserve'], ['2026-10-01', 'active']], 'Tuesday takes Tuesday\'s lineup (he was on reserve), Thursday its own');
  assert.deepEqual(Object.keys(t.lineups).sort(), ['2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']);
  assert.deepEqual(t.lineups['2026-09-29'].slots.map(x => [x.pos, x.status, x.id]), [['C', 'reserve', 'id-S']]);
});

test('loadTeam falls back to per-week schedule calls for period days beyond the 30-day window', async () => {
  // today Sep 23; the 30-day schedule runs Sep 23 – Oct 22; period 5 (Oct 26 – Nov 1) is not covered
  const list = gamesPerPos().displayedLists.scoringPeriodList; list.push({ name: '(Oct 26/26 - Nov 1/26)', value: 5 });
  const gpp = gamesPerPos({ period: 5 }); gpp.displayedLists.scoringPeriodList = list;
  const responses = { GAMES_PER_POS: gpp, SCHEDULE_FULL: scheduleFrom('2026-09-23', 30, {}), 'SCHEDULE_PERIOD@28': scheduleFrom('2026-10-26', 7, { S: { games: { '2026-10-27': 'Tue 7:00PM' } } }) };
  for (let n = 28; n <= 34; n++) responses['STATS@' + n] = statsDay({ S: '1' });
  const f = fakeFetch(responses);
  const t = await T.loadTeam('abc', { teamId: null, period: 5, day: null }, f, NOW_PRESEASON);
  assert.deepEqual(f.calls.filter(c => c.data.view === 'SCHEDULE_PERIOD').map(c => c.data.period), ['28'], 'Oct 26 = lineup day 28');
  assert.deepEqual(t.groups.skaters.rows[0].games.map(g => [g.day, g.status]), [['2026-10-27', 'active']]);
});

test('loadTeam omits teamId and scoringPeriod when null and takes the period from the response', async () => {
  const stats = {}; for (let n = 7; n <= 13; n++) stats['STATS@' + n] = statsDay({});   // period 2 = lineup days 7–13
  const f = fakeFetch(Object.assign({ GAMES_PER_POS: gamesPerPos({ period: 2 }), SCHEDULE_FULL: scheduleFrom('2026-09-29', 30, {}) }, stats));
  const t = await T.loadTeam('abc', { teamId: null, period: null, day: null }, f, NOW_PRESEASON);
  assert.equal(t.period.id, 2);
  assert.deepEqual(f.calls[0].data, { leagueId: 'abc', view: 'GAMES_PER_POS' });
  assert.deepEqual(f.calls.filter(c => c.data.view === 'STATS').map(c => c.data.period), ['7', '8', '9', '10', '11', '12', '13']);
});

test('loadTeam rejects when the response period is not in the period list', async () => {
  const f = fakeFetch({ GAMES_PER_POS: gamesPerPos({ period: 77 }) });
  await assert.rejects(T.loadTeam('abc', { teamId: null, period: null, day: null }, f, NOW_PRESEASON), /period 77/);
});

test('cachedLoadTeam reuses a result within the TTL and clearCache forgets it', async () => {
  const stats = {}; for (let n = 1; n <= 6; n++) stats['STATS@' + n] = statsDay({});
  const f = fakeFetch(Object.assign({ GAMES_PER_POS: gamesPerPos(), SCHEDULE_FULL: scheduleFrom('2026-09-29', 30, {}) }, stats));
  T.clearCache();
  await T.cachedLoadTeam('abc', { teamId: 'teamA', period: 1 }, f, NOW_PRESEASON);
  await T.cachedLoadTeam('abc', { teamId: 'teamA', period: 1 }, f, NOW_PRESEASON);
  assert.equal(f.calls.length, 8, 'one load = games-played + schedule + six lineup days');
  T.clearCache();
  await T.cachedLoadTeam('abc', { teamId: 'teamA', period: 1 }, f, NOW_PRESEASON);
  assert.equal(f.calls.length, 16);
});

test('cachedLoadTeam does not cache a failure', async () => {
  T.clearCache();
  let n = 0;
  const failing = async () => { n++; return { ok: false, status: 502 }; };
  await assert.rejects(T.cachedLoadTeam('abc', { teamId: 'teamA', period: 1 }, failing, NOW_PRESEASON, 0));
  await assert.rejects(T.cachedLoadTeam('abc', { teamId: 'teamA', period: 1 }, failing, NOW_PRESEASON, 0));
  assert.equal(n, 4, 'two uncached loads, each failing on the games-played request and its one retry');
});

// ---- adapter decisions (pure; the DOM adapters call these) ----
function node(tag, attrs) { return { tagName: tag, getAttribute: k => (k in attrs ? attrs[k] : null) }; }
const K = 'teamA|cur';

test('shouldRender: nothing rendered yet, a different key, or force → render', () => {
  assert.equal(T.shouldRender(null, K, false), true);
  assert.equal(T.shouldRender(node('TABLE', { 'data-fgt-key': 'teamA|2' }), K, false), true);
  assert.equal(T.shouldRender(node('TABLE', { 'data-fgt-key': K }), K, true), true, 'the 5-minute refresh forces a re-render');
});

test('shouldRender: a finished table or a terminal error marker for the same key → leave it alone', () => {
  assert.equal(T.shouldRender(node('TABLE', { 'data-fgt-key': K }), K, false), false);
  assert.equal(T.shouldRender(node('DIV', { 'data-fgt-key': K, 'data-fgt-state': 'error' }), K, false), false, 'no retry storm on Fantrax redraws');
  assert.equal(T.shouldRender(node('DIV', { 'data-fgt-key': K, 'data-fgt-state': 'loading' }), K, false), true, 'a loading marker may be re-issued (cache hit, no new calls)');
});

test('isCurrent: a finished load only lands if the container still waits for its key', () => {
  assert.equal(T.isCurrent(node('DIV', { 'data-fgt-key': K, 'data-fgt-state': 'loading' }), K), true);
  assert.equal(T.isCurrent(node('TABLE', { 'data-fgt-key': 'teamA|1' }), K), false, 'a newer render replaced it');
  assert.equal(T.isCurrent(null, K), false);
});


// ---- per-day lineups, lineup-day → scoring-period mapping ----

test('compute uses each game\'s own day status', () => {
  const rows = [{ id: 'a', name: 'A', status: 'active', injured: false, games: [
    { day: '2026-10-02', start: null, status: 'active' }, { day: '2026-10-03', start: null, status: 'reserve' }, { day: '2026-10-04', start: null, status: 'ir' }] }];
  const r = T.compute({ played: 0, max: 9, rows }, P1, NOW_THU_18);
  assert.deepEqual([r.scheduled, r.potential], [1, 2]);
  assert.deepEqual(r.perDay.map(d => d.active), [0, 0, 0, 1, 0, 0]);
});

test('lineup day numbers: day N is the season start plus N-1 calendar days, and maps to its scoring period', () => {
  const periods = T.parsePeriodList(gamesPerPos().displayedLists.scoringPeriodList);
  assert.equal(T.seasonStart(periods), '2026-09-29');
  assert.equal(T.dayFromIndex('2026-09-29', 7), '2026-10-05');
  assert.equal(T.dayFromIndex('2026-09-29', 181), '2027-03-28');
  assert.equal(T.indexFromDay('2026-09-29', '2026-10-04'), 6);
  assert.equal(T.periodForDay(periods, '2026-10-05').id, 2);
  assert.equal(T.periodForDay(periods, '2026-10-04').id, 1);
  assert.equal(T.periodForDay(periods, '2026-11-01'), null, 'a day no listed period covers');
});

test('parseRoute: the roster page carries a lineup day as ;period=N and a scoring period as ;scoringPeriod=N', () => {
  assert.deepEqual(T.parseRoute('https://www.fantrax.com/fantasy/league/abc123/team/roster;period=7'), { page: 'roster', leagueId: 'abc123', period: null, day: 7, teamId: null, view: null });
  assert.deepEqual(T.parseRoute('https://www.fantrax.com/fantasy/league/abc123/team/roster;view=SCHEDULE_PERIOD;scoringPeriod=3').day, null);
  assert.equal(T.parseRoute('https://www.fantrax.com/fantasy/league/abc123/livescoring;period=2').day, null, 'on Matchups ;period is the scoring period');
});

test('loadTeam with a lineup day outside the default period re-fetches games-played for the right scoring period', async () => {
  const stats = {}; for (let n = 7; n <= 13; n++) stats['STATS@' + n] = statsDay({});
  const f = async (url, init) => { const body = JSON.parse(init.body); for (const m of body.msgs) f.calls.push(m.data);
    return { ok: true, json: async () => ({ responses: body.msgs.map(m => ({ data: m.data.view === 'STATS' ? stats['STATS@' + m.data.period] : m.data.view === 'SCHEDULE_FULL' ? scheduleFrom('2026-09-29', 30, {}) : gamesPerPos({ period: m.data.scoringPeriod === '2' ? 2 : 1 }) })) }) }; };
  f.calls = [];
  const t = await T.loadTeam('abc', { teamId: null, period: null, day: 7 }, f, NOW_PRESEASON);
  assert.equal(t.period.id, 2);
  assert.equal(f.calls.filter(d => d.scoringPeriod === '2').length, 1, 'games-played re-fetched for period 2');
  assert.deepEqual(f.calls.filter(d => d.view === 'STATS').map(d => d.period), ['7', '8', '9', '10', '11', '12', '13'], 'lineup days Oct 5–11');
});

test('formatStatus wording: bench covers all / part / nothing', () => {
  assert.equal(T.formatStatus({ kind: 'unused', over: 0, unused: 7, bench: 7 }), '7 unused, bench covers all 7');
  assert.equal(T.formatStatus({ kind: 'unused', over: 0, unused: 7, bench: 5 }), '7 unused, bench covers 5');
  assert.equal(T.formatStatus({ kind: 'unused', over: 0, unused: 7, bench: 0 }), '7 unused');
});

test('cachedLoadTeam also caches a load under its resolved scoring period, so the day → period re-render costs nothing', async () => {
  const stats = {}; for (let n = 7; n <= 13; n++) stats['STATS@' + n] = statsDay({});
  const f = async (url, init) => { const body = JSON.parse(init.body); for (const m of body.msgs) f.calls.push(m.data);
    return { ok: true, json: async () => ({ responses: body.msgs.map(m => ({ data: m.data.view === 'STATS' ? stats['STATS@' + m.data.period] : m.data.view === 'SCHEDULE_FULL' ? scheduleFrom('2026-09-29', 30, {}) : gamesPerPos({ period: m.data.scoringPeriod === '2' ? 2 : 1 }) })) }) }; };
  f.calls = [];
  T.clearCache();
  const a = await T.cachedLoadTeam('abc', { teamId: null, period: null, day: 7 }, f, NOW_PRESEASON);
  const n = f.calls.length;
  const b = await T.cachedLoadTeam('abc', { teamId: null, period: 2, day: null }, f, NOW_PRESEASON);
  assert.equal(f.calls.length, n, 'no new requests');
  assert.equal(a, b);
});

// ---- week view (1.2.0): opponent + time per game, injury tags, per-day lineup slots ----

test('parseGameText splits opponent and time and drops the weekday', () => {
  assert.deepEqual(T.parseGameText('@CAR<br/>Tue 4:00PM'), { opp: '@CAR', time: '4:00PM' });
  assert.deepEqual(T.parseGameText('VAN<br>Sat 6:00PM'), { opp: 'VAN', time: '6:00PM' });
  assert.deepEqual(T.parseGameText('@CAR'), { opp: '@CAR', time: '' });
  assert.deepEqual(T.parseGameText(''), { opp: '', time: '' });
  assert.deepEqual(T.parseGameText('@CAR<br/>2-1 F'), { opp: '@CAR', time: '2-1 F' }, 'a finished game keeps whatever Fantrax shows');
});

test('iconTag: Out, IR and Suspended will not play; Day-to-Day and Minors are notes; other icons are ignored', () => {
  assert.deepEqual(T.iconTag([{ typeId: '9', tooltip: 'news' }, { typeId: '30', tooltip: 'Lower body - Out Indefinitely' }]), { text: 'OUT', kind: 'out', tip: 'Lower body - Out Indefinitely' });
  assert.deepEqual(T.iconTag([{ typeId: '2', tooltip: 'Injured Reserve List - …' }]), { text: 'IR', kind: 'out', tip: 'Injured Reserve List - …' });
  assert.deepEqual(T.iconTag([{ typeId: '6', tooltip: 'Suspended' }]), { text: 'SUSP', kind: 'out', tip: 'Suspended' });
  assert.deepEqual(T.iconTag([{ typeId: '1', tooltip: 'Undisclosed - Day-to-Day' }]), { text: 'DTD', kind: 'note', tip: 'Undisclosed - Day-to-Day' });
  assert.deepEqual(T.iconTag([{ typeId: '4', tooltip: 'Minor Leagues' }]), { text: 'MINORS', kind: 'note', tip: 'Minor Leagues' }, 'not MIN: that is Minnesota in the game column');
  assert.deepEqual(T.iconTag([{ typeId: '1' }, { typeId: '2' }]), { text: 'IR', kind: 'out', tip: '' }, 'the worst one wins');
  assert.equal(T.iconTag([{ typeId: '20', tooltip: 'Keeper' }]), null);
  assert.equal(T.iconTag(undefined), null);
  assert.ok(T.INJURY_ICON_TYPES.has('6'), 'a suspended player never counts as scheduled');
});

test('parseScheduleRows keeps opponent, time, the player\'s positions and his injury tag', () => {
  const period = T.parsePeriodList(gamesPerPos().displayedLists.scoringPeriodList)[0];
  const data = scheduleFrom('2026-09-29', 30, {
    Two: { pos: 'C,LW', posIds: ['206', '203'], games: { '2026-09-29': 'Tue 4:00PM' } },
    Hurt: { icons: [{ typeId: '1', tooltip: 'Undisclosed - Day-to-Day' }], games: { '2026-09-30': 'Wed 6:30PM' } },
  });
  const r = T.parseScheduleRows(data, period);
  assert.deepEqual(r.skaters.map(x => [x.pos, x.tag, x.injured]), [['C,LW', null, false], ['C', { text: 'DTD', kind: 'note', tip: 'Undisclosed - Day-to-Day' }, false]]);
  assert.deepEqual(r.skaters[0].games[0].opp, '@XXX');
  assert.deepEqual(r.skaters[0].games[0].time, '4:00PM');
});

test('parseDayLineup: slots in Fantrax order with position labels, an open active slot, the empty-reserve row skipped', () => {
  const data = schedule({ days: [], skaters: [
    { name: 'A', posId: '206' },
    { name: 'B', posId: '203', posIds: ['203', '204'], pos: 'LW,RW' },
    { name: null, posId: '204', statusId: '1' },                                   // open RW slot
    { name: 'F', posId: '208', posIds: ['206'], pos: 'C', tip: 'Skt rank: 42 • Overall rank: 5' },
    { name: 'U', posId: '299', posIds: ['206'], pos: 'C' },                         // a slot id nothing names
    { name: 'R', posId: '203', statusId: '2' },
    { name: 'I', posId: '206', statusId: '3' },
  ], goalies: [{ name: 'G1', posId: '201' }] });
  data.tables[0].rows.push({ statusId: '2', numSpotsAvailableText: 'Reserve spot(s) available', cells: [] });
  const l = T.parseDayLineup(data);
  assert.deepEqual(l.slots.map(x => [x.posId, x.pos, x.status, x.id, x.name, x.group]), [
    ['206', 'C', 'active', 'id-A', 'A', 'skaters'], ['203', 'LW', 'active', 'id-B', 'B', 'skaters'], ['204', 'RW', 'active', null, '', 'skaters'],
    ['208', 'Skt', 'active', 'id-F', 'F', 'skaters'], ['299', '299', 'active', 'id-U', 'U', 'skaters'],
    ['203', 'LW', 'reserve', 'id-R', 'R', 'skaters'], ['206', 'C', 'ir', 'id-I', 'I', 'skaters'], ['201', 'G', 'active', 'id-G1', 'G1', 'goalies']]);
  assert.deepEqual(l.statuses, { 'id-A': 'active', 'id-B': 'active', 'id-F': 'active', 'id-U': 'active', 'id-R': 'reserve', 'id-I': 'ir', 'id-G1': 'active' });
  const flexOnly = T.parseDayLineup(schedule({ days: [], skaters: [{ name: 'F', posId: '208', posIds: ['206'], pos: 'C' }] }));
  assert.equal(flexOnly.slots[0].pos, 'Skt', 'the flex slot label falls back to the known NHL id when no tooltip names it');
});

test('dayLabel: "Thu 10/1" style, weekday from the calendar', () => {
  assert.equal(T.dayLabel('2026-10-01'), 'Thu 10/1');
  assert.equal(T.dayLabel('2027-01-03'), 'Sun 1/3');
});

// a team as loadTeam builds it, with hand-written lineups
function weekTeam({ rows, goalies = [], lineups, statusNames = { '1': 'Active', '2': 'Reserve', '3': 'Inj Res' } }) {
  const period = T.parsePeriodList(gamesPerPos().displayedLists.scoringPeriodList)[0];
  const statusByDay = {}, detailByDay = {};
  for (const [day, l] of Object.entries(lineups)) { statusByDay[day] = l.statuses; if (l.detail) detailByDay[day] = l.detail; }
  return { teamId: 'teamA', teamName: 'Alpha Bets', period, lineups, statusNames, groups: {
    skaters: { played: 0, max: 52, rows: T.applyDayStatuses(rows, statusByDay, detailByDay) },
    goalies: { played: 0, max: 4, rows: T.applyDayStatuses(goalies, statusByDay, detailByDay) } } };
}
const game = (day, time, opp = '@XXX') => ({ day, start: T.parseStart(time, day), opp, time: time.replace(/^\w{3} /, '') });
const prow = (name, games, extra) => Object.assign({ id: 'id-' + name, name, shortName: name, pos: 'C', injured: false, tag: null, flag: null, returnDate: null, returnText: null, games }, extra);
const slot = (pos, status, name, group = 'skaters') => ({ posId: pos, pos, status, id: name ? 'id-' + name : null, name: name || '', group });

test('weekView: one entry per period day; slots keep lineup order and become game / idle / open / out', () => {
  const thu = '2026-10-01';
  const team = weekTeam({
    rows: [prow('A', [game('2026-09-29', 'Tue 4:00PM'), game(thu, 'Thu 7:00PM', 'CHI')]), prow('B', [game(thu, 'Thu 6:00PM')]),
      prow('C', [game(thu, 'Thu 9:00PM')], { injured: true, tag: { text: 'OUT', kind: 'out' } }), prow('D', [game('2026-10-03', 'Sat 7:00PM')]),
      prow('N', [game(thu, 'Thu 8:00PM')], { tag: { text: 'DTD', kind: 'note' } })],
    goalies: [prow('G', [game(thu, 'Thu 7:00PM')])],
    lineups: { [thu]: { statuses: { 'id-A': 'active', 'id-B': 'reserve', 'id-C': 'active', 'id-D': 'active', 'id-N': 'active', 'id-G': 'active' },
      slots: [slot('C', 'active', 'A'), slot('LW', 'reserve', 'B'), slot('RW', 'active', 'C'), slot('D', 'active', 'D'), slot('D', 'active', null), slot('C', 'active', 'N'), slot('G', 'active', 'G', 'goalies')] } },
  });
  const w = T.weekView(team, NOW_THU_18);
  assert.deepEqual(w.days.map(d => [d.day, d.label, d.state]), [['2026-09-29', 'Tue 9/29', 'past'], ['2026-09-30', 'Wed 9/30', 'past'], [thu, 'Thu 10/1', 'today'],
    ['2026-10-02', 'Fri 10/2', 'future'], ['2026-10-03', 'Sat 10/3', 'future'], ['2026-10-04', 'Sun 10/4', 'future']]);
  const d = w.days[2];
  assert.deepEqual(d.slots.map(s => [s.pos, s.kind, s.name, s.opp, s.time, s.tag && s.tag.text]), [
    ['C', 'game', 'A', 'CHI', '7:00PM', null], ['RW', 'out', 'C', '@XXX', '9:00PM', 'OUT'], ['D', 'idle', 'D', '', '', null], ['D', 'open', '', '', '', null], ['C', 'game', 'N', '@XXX', '8:00PM', 'DTD']]);
  assert.deepEqual(d.goalies.map(s => [s.pos, s.kind, s.name]), [['G', 'game', 'G']]);
  assert.deepEqual(d.bench.map(s => [s.pos, s.name, s.time]), [['LW', 'B', '6:00PM']], 'reserve players with a game that day');
  assert.deepEqual(d.counts, { playing: 2, idle: 1, open: 1, out: 1, ret: 0 }, 'skater slots only; goalies are listed apart');
  assert.equal(w.days[0].slots, null, 'a day whose lineup was not loaded has no slot list');
  assert.deepEqual(w.days[0].bench, []);
  assert.deepEqual(w.games, { skaters: 2, goalies: 1 }, 'active games by healthy players over the period: A and N on Thu; C is out, A\'s Tuesday has no lineup loaded');
});

test('weekView: bench is sorted by start time, injured reserve players are left out, IR players never appear', () => {
  const thu = '2026-10-01';
  const team = weekTeam({
    rows: [prow('Late', [game(thu, 'Thu 9:00PM')]), prow('Early', [game(thu, 'Thu 6:00PM')]), prow('Hurt', [game(thu, 'Thu 7:00PM')], { injured: true, tag: { text: 'IR', kind: 'out' } }), prow('Ir', [game(thu, 'Thu 7:00PM')])],
    lineups: { [thu]: { statuses: { 'id-Late': 'reserve', 'id-Early': 'reserve', 'id-Hurt': 'reserve', 'id-Ir': 'ir' },
      slots: [slot('C', 'reserve', 'Late'), slot('C', 'reserve', 'Early'), slot('C', 'reserve', 'Hurt'), slot('C', 'ir', 'Ir')] } },
  });
  const d = T.weekView(team, NOW_THU_18).days[2];
  assert.deepEqual(d.bench.map(s => s.name), ['Early', 'Late']);
  assert.deepEqual(d.slots, []);
});

test('weekView: a lineup player missing from the schedule (dropped since) shows as idle with his lineup name', () => {
  const thu = '2026-10-01';
  const team = weekTeam({ rows: [], lineups: { [thu]: { statuses: { 'id-Gone': 'active' }, slots: [slot('C', 'active', 'Gone')] } } });
  assert.deepEqual(T.weekView(team, NOW_THU_18).days[2].slots.map(s => [s.kind, s.name]), [['idle', 'Gone']]);
});

// ---- 1.3.0: expected return dates ----
test('parseReturnDate: reads the Fantrax injury line, strips tags, infers the year', () => {
  assert.equal(T.parseReturnDate(['Expected to return on Sat Sep 26 - <i>Out Indefinitely.</i>'], '2026-09-26'), '2026-09-26');
  assert.equal(T.parseReturnDate(['Expected to return on Mon Nov 2 - Injured Reserve - Long-term.'], '2026-09-26'), '2026-11-02');
  assert.equal(T.parseReturnDate(['Expected to return on Mon Feb 1 - Out Indefinitely.'], '2026-10-15'), '2027-02-01', 'more than 120 days back this year → next year');
  assert.equal(T.parseReturnDate(['Expected to return on Wed Sep 30 - Day-to-Day.'], '2026-10-05'), '2026-09-30', 'a few days back stays this year (a passed date)');
  assert.equal(T.parseReturnDate(['Expected to return on Tue Sep 29 - Out Indefinitely.'], '2027-01-10'), '2026-09-29', '103 days back stays this year');
});
test('parseReturnDate: anything else is null and never throws', () => {
  for (const v of [['Out for the season.'], [], null, undefined, 'Expected to return on Sat Sep 26', [42], ['Expected to return on Sat Xyz 26 - Out.']])
    assert.equal(T.parseReturnDate(v, '2026-09-26'), null);
});
test('rowFlag and parseScheduleRows: rows carry flag, shortName and empty return fields', () => {
  assert.deepEqual([[{ typeId: '30' }], [{ typeId: '2' }], [{ typeId: '6' }], [{ typeId: '1' }], [{ typeId: '4' }], [], undefined].map(T.rowFlag), ['out', 'ir', 'susp', 'dtd', null, null, null]);
  assert.equal(T.rowFlag([{ typeId: '1' }, { typeId: '30' }]), 'out', 'worst wins');
  const rows = T.parseScheduleRows(schedule({ days: WEEK1, skaters: [{ name: 'K. Out', icons: [{ typeId: '30', tooltip: 'Hip - Out Indefinitely' }] }, { name: 'N. Fine' }] }), P1);
  assert.deepEqual(rows.skaters.map(r => [r.shortName, r.flag, r.returnDate, r.returnText]), [['K. Out', 'out', null, null], ['N. Fine', null, null, null]]);
});

const R = { returnDates: true };
test('countsGame: off → healthy only; on → from the return date, passed date = no date, today counts', () => {
  const out = { injured: true, flag: 'out', returnDate: '2026-10-02' }, dtd = { injured: false, flag: 'dtd', returnDate: '2026-10-03' }, stale = { injured: true, flag: 'out', returnDate: '2026-09-30' };
  const g = day => ({ day });
  assert.deepEqual([T.countsGame(out, g('2026-10-01'), '2026-10-01', {}), T.countsGame(dtd, g('2026-10-01'), '2026-10-01', {})], [false, true], 'off = 1.2.1');
  assert.deepEqual([T.countsGame(out, g('2026-10-01'), '2026-10-01', R), T.countsGame(out, g('2026-10-02'), '2026-10-01', R), T.countsGame(out, g('2026-10-03'), '2026-10-01', R)], [false, true, true]);
  assert.deepEqual([T.countsGame(dtd, g('2026-10-02'), '2026-10-01', R), T.countsGame(dtd, g('2026-10-03'), '2026-10-01', R)], [false, true]);
  assert.equal(T.countsGame(stale, g('2026-10-03'), '2026-10-01', R), false, 'a passed date is no date: Out never counts');
  assert.equal(T.countsGame({ injured: true, flag: 'out', returnDate: '2026-10-01' }, g('2026-10-01'), '2026-10-01', R), true, 'a date equal to today counts from today');
  assert.equal(T.countsGame({ injured: true, flag: 'susp', returnDate: null }, g('2026-10-03'), '2026-10-01', R), false);
  assert.equal(T.countsGame({ injured: false, flag: 'dtd', returnDate: null }, g('2026-10-03'), '2026-10-01', R), true);
});
test('compute with return dates: Out gains games from the date, DTD loses games before it, bench follows the rule', () => {
  const rows = [
    row('active', [at('2026-10-01'), at('2026-10-03')], true, { flag: 'out', returnDate: '2026-10-02' }),   // Thu no, Sat yes → +1
    row('active', [at('2026-10-02'), at('2026-10-04')], false, { flag: 'dtd', returnDate: '2026-10-03' }), // Fri no, Sun yes → −1
    row('reserve', [at('2026-10-02'), at('2026-10-03')], true, { flag: 'out', returnDate: '2026-10-03' }), // bench: Sat only → potential +1
    row('active', [at('2026-10-03')], true, { flag: 'out', returnDate: '2026-10-15' }),                     // after the period → 0
  ];
  const off = T.compute({ played: 10, max: 52, rows }, P1, NOW_THU_18);
  const on = T.compute({ played: 10, max: 52, rows }, P1, NOW_THU_18, R);
  assert.deepEqual([off.scheduled, off.potential], [2, 2]);
  assert.deepEqual([on.scheduled, on.potential], [2, 3]);
  assert.deepEqual(on.perDay.map(d => d.active), [0, 0, 0, 0, 1, 1], 'perDay counts the same games (the reserve row is not active)');
  assert.deepEqual(T.compute({ played: 10, max: 52, rows }, P1, NOW_THU_18, { returnDates: false }), off, 'explicit off equals default');
});
test('explainTeam groups strictly by effect; zero always under none with its reason', () => {
  const mk = (name, status, games, flag, returnDate, injured = flag !== 'dtd' && flag !== null) => Object.assign(row(status, games, injured, { flag, returnDate }), { id: name, shortName: name });
  const skaters = [
    mk('Kap', 'active', [at('2026-10-01'), at('2026-10-02'), at('2026-10-03')], 'out', '2026-10-02'),
    mk('Eic', 'active', [at('2026-10-02'), at('2026-10-04')], 'dtd', '2026-10-03'),
    mk('Nec', 'active', [at('2026-10-01', 20), at('2026-10-03')], 'dtd', '2026-10-01'),
    mk('Hug', 'active', [at('2026-10-03')], 'out', '2026-10-15'),
    mk('Vil', 'active', [at('2026-10-02')], 'out', '2026-09-30'),
    mk('McA', 'active', [at('2026-10-03')], 'susp', null),
    mk('Byr', 'active', [at('2026-10-03')], 'dtd', null),
    mk('Duc', 'reserve', [at('2026-10-02'), at('2026-10-03')], 'out', '2026-10-03'),
    mk('Fin', 'active', [at('2026-10-03')], null, null),
    mk('Pas', 'active', [at('2026-09-29')], 'out', '2026-10-02'),   // only a past game: not listed
  ];
  const goalies = [mk('Oet', 'active', [at('2026-10-02'), at('2026-10-03')], 'out', '2026-10-03')];
  const team = { period: P1, groups: { skaters: { played: 0, max: 52, rows: skaters }, goalies: { played: 0, max: 4, rows: goalies } } };
  const x = T.explainTeam(team, NOW_THU_18);
  assert.deepEqual(x.gained.map(T.formatEffect), ['Kap Fri 10/2 +2', 'Duc Sat 10/3 +1 (bench)', 'Oet Sat 10/3 +1 (G)']);
  assert.deepEqual(x.lost.map(T.formatEffect), ['Eic Sat 10/3 −1']);
  assert.deepEqual(x.none.map(T.formatEffect), ['Nec DTD, back today', 'Hug 10/15, after this period', 'Vil 9/30 passed, still Out', 'McA suspended, no date', 'Byr DTD, no date']);
  assert.ok(!x.none.some(e => e.name === 'Fin') && !x.none.some(e => e.name === 'Pas'));
});
test('weekView with return dates: out before the date, ret from it; flagged bench rows shown struck then counted', () => {
  const rows = [prow('Kap', [game('2026-10-01', 'Thu 7:00PM'), game('2026-10-03', 'Sat 7:00PM')], { injured: true, flag: 'out', returnDate: '2026-10-02', tag: { text: 'OUT', kind: 'out', tip: 'Hip - Out Indefinitely' } }),
    prow('Duc', [game('2026-10-01', 'Thu 8:00PM'), game('2026-10-03', 'Sat 8:00PM')], { injured: true, flag: 'out', returnDate: '2026-10-03', tag: { text: 'OUT', kind: 'out', tip: '' } }),
    prow('Sus', [game('2026-10-03', 'Sat 9:00PM')], { injured: true, flag: 'susp', returnDate: null, tag: { text: 'SUSP', kind: 'out', tip: '' } })];
  const day = { slots: [slot('C', 'active', 'Kap'), slot('LW', 'reserve', 'Duc'), slot('RW', 'reserve', 'Sus')], statuses: { 'id-Kap': 'active', 'id-Duc': 'reserve', 'id-Sus': 'reserve' } };
  const team = weekTeam({ rows, lineups: { '2026-10-01': day, '2026-10-03': day } });
  const off = T.weekView(team, NOW_THU_18), on = T.weekView(team, NOW_THU_18, { returnDates: true });
  assert.deepEqual(off.days.map(d => d.slots && d.slots[0].kind), [null, null, 'out', null, 'out', null]);
  assert.deepEqual(on.days.map(d => d.slots && d.slots[0].kind), [null, null, 'out', null, 'ret', null]);
  assert.deepEqual(off.days[4].bench.map(b => [b.name, b.kind]), [], 'off: injured reserve players are left out, as in 1.2.1');
  assert.deepEqual(on.days[2].bench.map(b => [b.name, b.kind]), [['Duc', 'out']]);
  assert.deepEqual(on.days[4].bench.map(b => [b.name, b.kind]), [['Duc', 'ret']]);
  assert.deepEqual([on.days[4].counts.playing, on.days[4].counts.ret, on.games.skaters], [1, 1, 1]);
});

// real shape (2026-09-26, live): the injury report sits under the OVERVIEW section; a Suspended player's OVERVIEW has no injuryInfo
const profile = text => ({ sectionContent: { OVERVIEW: text === undefined ? { tables: [] } : { tables: [], injuryInfo: { icon: { typeId: '1' }, injuryMsgs: [text], title: 'Injury Report' } } } });
test('withReturnDates: one profile request for Out / IR / DTD rows, dates parsed, susp and healthy rows untouched, team not mutated', async () => {
  const f = fakeFetch({ 'PROFILE@id-K': profile('Expected to return on Fri Oct 2 - <i>Out Indefinitely.</i>'), 'PROFILE@id-D': profile('Expected to return on Sat Oct 3 - Day-to-Day.'), 'PROFILE@id-M': profile() });
  const rows = [prow('K', [], { injured: true, flag: 'out' }), prow('D', [], { flag: 'dtd' }), prow('S', [], { injured: true, flag: 'susp' }), prow('M', [], { injured: true, flag: 'ir' }), prow('F', [])];
  const team = weekTeam({ rows, lineups: {} });
  T.clearCache();
  const t2 = await T.withReturnDates('abc', team, f, NOW_THU_18);
  assert.equal(f.calls.length, 3);
  assert.deepEqual(f.calls.map(c => [c.method, c.data]), [['getPlayerProfile', { leagueId: 'abc', playerId: 'id-K' }], ['getPlayerProfile', { leagueId: 'abc', playerId: 'id-D' }], ['getPlayerProfile', { leagueId: 'abc', playerId: 'id-M' }]]);
  assert.deepEqual(t2.groups.skaters.rows.map(r => [r.name, r.returnDate]), [['K', '2026-10-02'], ['D', '2026-10-03'], ['S', null], ['M', null], ['F', null]]);
  assert.equal(t2.groups.skaters.rows[0].returnText, 'Expected to return on Fri Oct 2 - Out Indefinitely.');
  assert.equal(team.groups.skaters.rows[0].returnDate, null, 'input untouched');
  assert.equal(t2.period, team.period);
});
test('withReturnDates: profiles are cached 10 min per player; a failed request gives null without rejecting or caching', async () => {
  T.clearCache();
  const f = fakeFetch({ 'PROFILE@id-K': profile('Expected to return on Fri Oct 2 - Out.') });
  const team = weekTeam({ rows: [prow('K', [], { injured: true, flag: 'out' })], lineups: {} });
  await T.withReturnDates('abc', team, f, NOW_THU_18); await T.withReturnDates('abc', team, f, NOW_THU_18);
  assert.equal(f.calls.length, 1);
  T.clearCache();
  let n = 0; const bad = async () => { n++; throw new Error('down'); };
  const t3 = await T.withReturnDates('abc', team, bad, NOW_THU_18, 0);
  assert.equal(t3.groups.skaters.rows[0].returnDate, null);
  assert.equal(n, 2, 'apiMulti retried once');
  const t4 = await T.withReturnDates('abc', team, f, NOW_THU_18);
  assert.equal(t4.groups.skaters.rows[0].returnDate, '2026-10-02', 'the failure was not cached');
  const t0 = weekTeam({ rows: [prow('F', [])], lineups: {} }), before = n;
  assert.strictEqual(await T.withReturnDates('abc', t0, bad, NOW_THU_18), t0, 'no flagged rows: same object, no call');
  assert.equal(n, before);
});
test('return-dates setting helpers tolerate a missing localStorage and default off', () => {
  assert.equal(T.returnDatesOn(), false);
  assert.doesNotThrow(() => T.setReturnDatesOn(true));
  assert.equal(T.RETURN_DATES_KEY, 'fgt-return-dates');
});

// ---- final-review fixes (2026-09-26) ----
test('cachedLoadTeam with allowStale serves an expired entry without a request (the toggle re-renders from cache)', async () => {
  const stats = {}; for (let n = 1; n <= 6; n++) stats['STATS@' + n] = statsDay({});
  const f = fakeFetch(Object.assign({ GAMES_PER_POS: gamesPerPos(), SCHEDULE_FULL: scheduleFrom('2026-09-29', 30, {}) }, stats));
  T.clearCache();
  const a = await T.cachedLoadTeam('abc', { teamId: 'teamA', period: 1 }, f, NOW_PRESEASON);
  const realNow = Date.now; Date.now = () => realNow() + 61000;
  try {
    const b = await T.cachedLoadTeam('abc', { teamId: 'teamA', period: 1 }, f, NOW_PRESEASON, undefined, true);
    assert.strictEqual(b, a); assert.equal(f.calls.length, 8, 'stale but accepted: no request');
    await T.cachedLoadTeam('abc', { teamId: 'teamA', period: 1 }, f, NOW_PRESEASON);
    assert.equal(f.calls.length, 16, 'without allowStale the expired entry reloads');
  } finally { Date.now = realNow; }
});
test('loadReturnTexts: one profile without data gives null for that player only, in one request', async () => {
  T.clearCache();
  const f = fakeFetch({ 'PROFILE@id-A': profile('Expected to return on Fri Oct 2 - Out.'), 'PROFILE@id-B': null, 'PROFILE@id-C': profile('Expected to return on Sat Oct 3 - Out.') });
  const texts = await T.loadReturnTexts('abc', ['id-A', 'id-B', 'id-C'], f, 0);
  assert.deepEqual(texts, { 'id-A': 'Expected to return on Fri Oct 2 - Out.', 'id-B': null, 'id-C': 'Expected to return on Sat Oct 3 - Out.' });
  assert.equal(f.calls.length, 3, 'one request, no retry');
});
test('explainTeam: the bench note follows the games that changed; Out with games only before its date; DTD with games only after', () => {
  const res = day => Object.assign(at(day), { status: 'reserve' });
  const mk = (name, games, flag, returnDate) => Object.assign(row('active', games, flag !== 'dtd', { flag, returnDate }), { id: name, shortName: name });
  const skaters = [
    mk('LostAct', [at('2026-10-02'), res('2026-10-04')], 'dtd', '2026-10-03'),     // loses Fri (active), keeps Sun (bench) → −1, not a bench change
    mk('LostBench', [res('2026-10-02'), at('2026-10-04')], 'dtd', '2026-10-03'),   // loses Fri (bench) → −1 (bench)
    mk('GainAct', [res('2026-10-02'), at('2026-10-03')], 'out', '2026-10-03'),     // gains Sat (active) → +1, not a bench change
    mk('OutBefore', [at('2026-10-02')], 'out', '2026-10-03'),                     // a game before the date only
    mk('DtdAfter', [at('2026-10-04')], 'dtd', '2026-10-03'),                      // a game after the date only
  ];
  const x = T.explainTeam({ period: P1, groups: { skaters: { played: 0, max: 52, rows: skaters }, goalies: { played: 0, max: 4, rows: [] } } }, NOW_THU_18);
  assert.deepEqual(x.gained.map(T.formatEffect), ['GainAct Sat 10/3 +1']);
  assert.deepEqual(x.lost.map(T.formatEffect), ['LostAct Sat 10/3 −1', 'LostBench Sat 10/3 −1 (bench)']);
  assert.deepEqual(x.none.map(T.formatEffect), ['OutBefore 10/3, no game from then', 'DtdAfter no game before the date']);
});

// ---- 1.3.1: IR and other off-lineup slots ----
test('parseDayLineup: status names from statusTotals, eligibility per slot, raw detail per scorer', () => {
  const l = T.parseDayLineup(schedule({ days: [], skaters: [{ name: 'Hurt', statusId: '3', posId: '206', eligible: ['1', '2', '3'] }, { name: 'Fine', statusId: '1', posId: '203' }] }));
  assert.deepEqual(l.statusNames, { '1': 'Active', '2': 'Reserve', '3': 'Inj Res' });
  assert.deepEqual(l.detail, { 'id-Hurt': { statusId: '3', eligible: ['1', '2', '3'] }, 'id-Fine': { statusId: '1', eligible: ['1', '2'] } });
  assert.deepEqual(l.slots.map(s => s.eligible), [['1', '2', '3'], ['1', '2']]);
});
test('parseDayLineup without statusTotals or eligibleStatusIds: empty names, empty eligibility, no throw', () => {
  const data = schedule({ days: [], skaters: [{ name: 'X', statusId: '3', posId: '206' }], statusTotals: null });
  for (const t of data.tables) for (const r of t.rows) delete r.eligibleStatusIds;
  const l = T.parseDayLineup(data);
  assert.deepEqual([l.statusNames, l.detail['id-X'], l.slots[0].eligible], [{}, { statusId: '3', eligible: [] }, []]);
  assert.equal(T.statusLabel(l.statusNames, '3'), 'off-lineup');
});
test('statusShort: initials for multi-word names, upper-case otherwise', () => {
  assert.deepEqual(['Inj Res', 'Minors', 'Injured Reserve', 'off-lineup'].map(T.statusShort), ['IR', 'MINORS', 'IR', 'OFF-LINEUP']);
});
test('applyDayStatuses with detail: games carry the raw statusId, rows carry the latest eligibility', () => {
  const rows = [prow('L', [game('2026-10-01', 'Thu 7:00PM'), game('2026-10-03', 'Sat 7:00PM')])];
  const d1 = { 'id-L': { statusId: '3', eligible: ['1', '2', '3'] } }, d3 = { 'id-L': { statusId: '1', eligible: ['1', '2'] } };
  const out = T.applyDayStatuses(rows, { '2026-10-01': { 'id-L': 'ir' }, '2026-10-03': { 'id-L': 'active' } }, { '2026-10-01': d1, '2026-10-03': d3 });
  assert.deepEqual(out[0].games.map(g => [g.status, g.statusId]), [['ir', '3'], ['active', '1']]);
  assert.deepEqual(out[0].eligible, ['1', '2']);
  assert.deepEqual(out[0].statusIds, { '2026-10-01': '3', '2026-10-03': '1' }, 'the slot status of every day that lists him');
  assert.equal(T.applyDayStatuses(rows, { '2026-10-01': { 'id-L': 'ir' } })[0].games[0].statusId, undefined, 'two-argument form unchanged');
});
test('loadTeam exposes statusNames and eligibility', async () => {
  const stats = {}; for (let n = 1; n <= 6; n++) stats['STATS@' + n] = statsDay({ S: { statusId: '3', eligible: ['1', '2', '3'] } });
  const f = fakeFetch(Object.assign({ GAMES_PER_POS: gamesPerPos(), SCHEDULE_FULL: scheduleFrom('2026-09-29', 30, { S: { games: { '2026-10-03': 'Sat 7:00PM' } } }) }, stats));
  const t = await T.loadTeam('abc', { teamId: 'teamA', period: 1, day: null }, f, NOW_PRESEASON);
  assert.deepEqual(t.statusNames, { '1': 'Active', '2': 'Reserve', '3': 'Inj Res' });
  assert.deepEqual([t.groups.skaters.rows[0].eligible, t.groups.skaters.rows[0].games[0].statusId], [['1', '2', '3'], '3']);
});
test('offLineup: back and cleared entries, swap candidates by eligibility, nothing for dates outside the period', () => {
  const g = (day, time, statusId, status) => Object.assign(game(day, time), { statusId, status });
  const irRow = (name, games, extra) => prow(name, games, Object.assign({ eligible: ['1', '2', '3'], statusIds: { '2026-10-01': '3' } }, extra));
  const rows = [
    irRow('Larkin', [g('2026-10-02', 'Fri 8:00PM', '3', 'ir'), g('2026-10-03', 'Sat 7:00PM', '3', 'ir')], { injured: true, flag: 'out', returnDate: '2026-10-02' }),
    irRow('Terry', [g('2026-10-03', 'Sat 7:00PM', '3', 'ir')], { injured: true, flag: 'out', returnDate: '2026-10-15' }),
    irRow('Bedard', [g('2026-10-03', 'Sat 7:00PM', '3', 'ir')], { injured: true, flag: 'out', returnDate: null }),
    irRow('Fiala', [g('2026-10-01', 'Thu 8:30PM', '3', 'ir'), g('2026-10-03', 'Sat 6:00PM', '3', 'ir')], { flag: null, eligible: ['1', '2'] }),   // healthy, Fantrax no longer allows IR
    irRow('Moved', [g('2026-10-01', 'Thu 7:00PM', '3', 'ir'), g('2026-10-03', 'Sat 7:00PM', '1', 'active')], { injured: true, flag: 'out', returnDate: '2026-10-01' }),
    prow('Vilardi', [g('2026-10-02', 'Fri 7:00PM', '1', 'active')], { injured: true, flag: 'out', returnDate: '2026-09-30', eligible: ['1', '2', '3'], statusIds: { '2026-10-01': '1' } }),
    prow('Necas', [g('2026-10-03', 'Sat 8:00PM', '1', 'active')], { flag: 'dtd', returnDate: '2026-10-01', eligible: ['1', '2'], statusIds: { '2026-10-01': '1' } }),
    prow('Fine', [g('2026-10-03', 'Sat 8:00PM', '2', 'reserve')], { eligible: ['1', '2'], statusIds: { '2026-10-01': '2' } }),
  ];
  const team = { period: P1, statusNames: { '1': 'Active', '2': 'Reserve', '3': 'Inj Res' }, groups: { skaters: { played: 0, max: 52, rows }, goalies: { played: 0, max: 4, rows: [] } } };
  const on = T.offLineup(team, NOW_THU_18, { returnDates: true });
  assert.deepEqual(on.map(e => [e.kind, e.name, e.games, e.date || null, (e.swapCandidates || []).map(c => c.name)]),
    [['back', 'Larkin', 2, '2026-10-02', ['Vilardi']], ['cleared', 'Fiala', 2, null, []]]);
  assert.deepEqual(on.map(T.formatOffLineup), [
    'On IR, back this period: Larkin Fri 10/2, 2 games, not counted · free IR swap: Vilardi (Out) could take his spot',
    'On IR, no longer IR-eligible: Fiala, 2 games this period, not counted — Fantrax no longer allows him there; the roster is illegal until he moves']);
  const off = T.offLineup(team, NOW_THU_18);
  assert.deepEqual(off.map(e => [e.kind, e.name]), [['cleared', 'Fiala']], 'off: no dates, so no back entries; cleared still listed');
  assert.ok(!on.some(e => e.name === 'Moved'), 'a player with an active day this period is a lineup player, not an off-lineup entry');
});
test('offLineup: no candidate wording, two returning players share a candidate, started game today is not pending', () => {
  const g = (day, time, statusId, status) => Object.assign(game(day, time), { statusId, status });
  const rows = [
    prow('A', [g('2026-10-03', 'Sat 7:00PM', '3', 'ir')], { injured: true, flag: 'out', returnDate: '2026-10-02', eligible: ['1', '2', '3'], statusIds: { '2026-10-01': '3' } }),
    prow('B', [g('2026-10-04', 'Sun 7:00PM', '3', 'ir')], { injured: true, flag: 'ir', returnDate: '2026-10-03', eligible: ['1', '2', '3'], statusIds: { '2026-10-01': '3' } }),
    prow('C', [g('2026-10-01', 'Thu 4:00PM', '3', 'ir')], { injured: true, flag: 'out', returnDate: '2026-10-01', eligible: ['1', '2', '3'], statusIds: { '2026-10-01': '3' } }),   // 4 pm game, now is 6 pm
    prow('Hurt', [g('2026-10-04', 'Sun 7:00PM', '1', 'active')], { injured: true, flag: 'out', returnDate: null, eligible: ['1', '2', '3'], statusIds: { '2026-10-01': '1' } }),
  ];
  const team = { period: P1, statusNames: { '1': 'Active', '2': 'Reserve', '3': 'Inj Res' }, groups: { skaters: { played: 0, max: 52, rows }, goalies: { played: 0, max: 4, rows: [] } } };
  const x = T.offLineup(team, NOW_THU_18, { returnDates: true });
  assert.deepEqual(x.map(e => [e.name, e.swapCandidates.map(c => c.name)]), [['A', ['Hurt']], ['B', ['Hurt']]], 'C has no pending game from his date; Hurt serves both');
  const none = T.offLineup({ period: P1, statusNames: team.statusNames, groups: { skaters: { played: 0, max: 52, rows: [rows[0], rows[3]].map(r => Object.assign({}, r, { eligible: r.name === 'Hurt' ? ['1', '2'] : r.eligible })) }, goalies: { played: 0, max: 4, rows: [] } } }, NOW_THU_18, { returnDates: true });
  assert.equal(T.formatOffLineup(none[0]), 'On IR, back this period: A Fri 10/2, 1 game, not counted · no IR-eligible player to swap: activating him needs a drop');
});
test('weekView.off: IR player listed from his date, cleared player every day, never counted', () => {
  const rows = [prow('Larkin', [game('2026-10-01', 'Thu 7:00PM'), game('2026-10-03', 'Sat 7:00PM')], { injured: true, flag: 'out', returnDate: '2026-10-03', pos: 'C', eligible: ['1', '2', '3'] }),
    prow('Fiala', [game('2026-10-01', 'Thu 8:30PM'), game('2026-10-03', 'Sat 6:00PM')], { flag: null, pos: 'LW', eligible: ['1', '2'] })];
  const day = { slots: [slot('C', 'ir', 'Larkin'), slot('LW', 'ir', 'Fiala')], statuses: { 'id-Larkin': 'ir', 'id-Fiala': 'ir' }, detail: { 'id-Larkin': { statusId: '3', eligible: ['1', '2', '3'] }, 'id-Fiala': { statusId: '3', eligible: ['1', '2'] } } };
  const team = weekTeam({ rows, lineups: { '2026-10-01': day, '2026-10-03': day } });
  const on = T.weekView(team, NOW_THU_18, { returnDates: true }), off = T.weekView(team, NOW_THU_18);
  assert.deepEqual(on.days[2].off.map(o => [o.name, o.kind, o.short]), [['Fiala', 'cleared', 'IR']]);
  assert.deepEqual(on.days[4].off.map(o => [o.name, o.kind, o.statusName]), [['Fiala', 'cleared', 'Inj Res'], ['Larkin', 'back', 'Inj Res']]);
  assert.deepEqual(off.days[4].off.map(o => o.name), ['Fiala'], 'option off: no dates, cleared only');
  assert.deepEqual([on.days[4].counts.playing, on.games.skaters, on.days[4].slots.length], [0, 0, 0], 'nothing counted; IR slots are not lineup slots, so the slots list is empty');
  assert.deepEqual(on.days[0].off, []);
});

// ---- final-review fixes (2026-09-26, 1.3.1) ----
test('offLineup: rows classified by pending games and current slot — moved to IR mid-week is listed, never offered; an injured lineup player with no game is offered', () => {
  const g = (day, time, statusId, status) => Object.assign(game(day, time), { statusId, status });
  const allIR = { '2026-09-29': '3', '2026-09-30': '3', '2026-10-01': '3', '2026-10-02': '3', '2026-10-03': '3', '2026-10-04': '3' };
  const rows = [
    prow('Larkin', [g('2026-10-02', 'Fri 8:00PM', '3', 'ir'), g('2026-10-03', 'Sat 7:00PM', '3', 'ir')], { injured: true, flag: 'out', returnDate: '2026-10-02', eligible: ['1', '2', '3'], statusIds: allIR }),
    prow('MidIR', [g('2026-09-29', 'Tue 7:00PM', '1', 'active'), g('2026-10-04', 'Sun 7:00PM', '3', 'ir')], { injured: true, flag: 'out', returnDate: '2026-10-04', eligible: ['1', '2', '3'], statusIds: { '2026-09-29': '1', '2026-09-30': '3', '2026-10-01': '3', '2026-10-02': '3', '2026-10-03': '3', '2026-10-04': '3' } }),
    prow('NoGame', [], { injured: true, flag: 'out', returnDate: null, eligible: ['1', '2', '3'], statusIds: { '2026-10-01': '1' } }),
    prow('Moved', [g('2026-10-01', 'Thu 7:00PM', '3', 'ir'), g('2026-10-03', 'Sat 7:00PM', '1', 'active')], { injured: true, flag: 'out', returnDate: '2026-10-01', eligible: ['1', '2', '3'], statusIds: { '2026-10-01': '3', '2026-10-03': '1' } }),
  ];
  const team = { period: P1, statusNames: { '1': 'Active', '2': 'Reserve', '3': 'Inj Res' }, groups: { skaters: { played: 0, max: 52, rows }, goalies: { played: 0, max: 4, rows: [] } } };
  const x = T.offLineup(team, NOW_THU_18, { returnDates: true });
  assert.deepEqual(x.map(e => [e.name, e.kind, e.games, e.swapCandidates.map(c => c.name)]), [['Larkin', 'back', 2, ['NoGame']], ['MidIR', 'back', 1, ['NoGame']]]);
});
test('offLineup: cleared means Fantrax no longer allows the slot, not "no injury flag"; a healthy prospect in a Minors slot is not listed', () => {
  const g = (day, time, statusId, status) => Object.assign(game(day, time), { statusId, status });
  const rows = [
    prow('HealthyIR', [g('2026-10-01', 'Thu 8:30PM', '3', 'ir'), g('2026-10-03', 'Sat 6:00PM', '3', 'ir')], { flag: null, eligible: ['1', '2'], statusIds: { '2026-10-01': '3' } }),
    prow('Prospect', [g('2026-10-03', 'Sat 6:00PM', '4', 'ir')], { flag: null, eligible: ['1', '2', '4'], statusIds: { '2026-10-01': '4' } }),
    prow('DtdIR', [g('2026-10-03', 'Sat 6:00PM', '3', 'ir')], { flag: 'dtd', returnDate: '2026-10-01', eligible: ['1', '2'], statusIds: { '2026-10-01': '3' } }),
    prow('NoData', [g('2026-10-03', 'Sat 6:00PM', '3', 'ir')], { flag: null, eligible: [], statusIds: { '2026-10-01': '3' } }),
  ];
  const team = { period: P1, statusNames: { '1': 'Active', '2': 'Reserve', '3': 'Inj Res', '4': 'Minors' }, groups: { skaters: { played: 0, max: 52, rows }, goalies: { played: 0, max: 4, rows: [] } } };
  const x = T.offLineup(team, NOW_THU_18, { returnDates: true });
  assert.deepEqual(x.map(e => [e.name, e.kind, e.games]), [['HealthyIR', 'cleared', 2], ['DtdIR', 'cleared', 1], ['NoData', 'cleared', 1]], 'no eligibility data: fall back to the flag rule');
  assert.equal(T.formatOffLineup(x[1]), 'On IR, no longer IR-eligible: DtdIR, 1 game this period, not counted — Fantrax no longer allows him there; the roster is illegal until he moves');
});
test('weekView.off lists off-lineup players on pending days only (a cleared player is not shown on days already played)', () => {
  const rows = [prow('Fiala', [game('2026-09-29', 'Tue 8:30PM'), game('2026-10-01', 'Thu 4:00PM'), game('2026-10-03', 'Sat 6:00PM')], { flag: null, pos: 'LW', eligible: ['1', '2'] })];
  const day = { slots: [slot('LW', 'ir', 'Fiala')], statuses: { 'id-Fiala': 'ir' }, detail: { 'id-Fiala': { statusId: '3', eligible: ['1', '2'] } } };
  const w = T.weekView(weekTeam({ rows, lineups: { '2026-09-29': day, '2026-10-01': day, '2026-10-03': day } }), NOW_THU_18);
  assert.deepEqual(w.days.map(d => d.off.map(o => o.name)), [[], [], [], [], ['Fiala'], []], 'Tue is past, Thu 4 pm has started at 6 pm, Sat is pending');
});
test('offSections: one panel section per off-lineup status, titled by that status and its entries', () => {
  const e = (name, statusName, kind) => ({ name, statusName, kind });
  assert.deepEqual(T.offSections([e('Larkin', 'Inj Res', 'back'), e('Kid', 'Minors', 'cleared'), e('Fiala', 'Inj Res', 'cleared')]).map(s => [s.title, s.entries.map(x => x.name)]),
    [['Inj Res, could play', ['Larkin', 'Fiala']], ['Minors, could play', ['Kid']]]);
  assert.deepEqual(T.offSections([e('Larkin', 'Inj Res', 'back')]).map(s => s.title), ['Inj Res, expected back']);
  assert.deepEqual(T.offSections([]), []);
});
