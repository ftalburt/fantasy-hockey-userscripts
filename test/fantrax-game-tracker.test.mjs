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
export function scheduleRow({ name = 'A. Player', statusId = '1', icons = [], games = {}, posId, posIds, pos, tip }, days) {
  posId = posId || '206';
  const cells = [Object.assign({ content: '1 • 2' }, tip ? { toolTip: tip } : {}), { content: '30' }, { content: '100' }, { content: '2.5' }];
  for (const d of days) cells.push(games[d] !== undefined ? { content: `@XXX<br/>${games[d]}`, eventId: 'e' + d } : { content: '' });
  const ids = posIds || [posId === '208' ? '206' : posId];
  const row = { posId, statusId, cells };
  if (name !== null) row.scorer = { name, shortName: name, scorerId: 'id-' + name, icons, posIdsNoFlex: ids, posShortNames: pos || ids.map(i => POS_NAME[i] || i).join(',') };
  return row;
}
export function schedule({ days, skaters = [], goalies = [] }) {
  // real shape (2026-09-23): fixed columns have name+shortName, day columns have only shortName + key "sched_M/D" + eventStr
  const header = { cells: [{ name: 'Position rank', shortName: 'Rk' }, { name: 'Age', shortName: 'Age' }, { name: 'Fantasy Points', shortName: 'FPts' }, { name: 'Average', shortName: 'FP/G' },
    ...days.map(d => ({ eventStr: true, shortName: d, key: 'sched_' + d.split(' ')[1] }))] };
  return { tables: [
    { scGroup: '2010', scGroupScorerHeader: 'Skaters', header, rows: skaters.map(r => scheduleRow(r, days)) },
    { scGroup: '2020', scGroupScorerHeader: 'Goalies', header, rows: goalies.map(r => scheduleRow(r, days)) },
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
function row(status, games, injured = false) { return { name: 'r', injured, games: games.map(g => Object.assign({ status }, g)) }; }   // every game carries its day's status
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
    return { ok: true, json: async () => ({ responses: body.msgs.map(m => ({ data: responsesByKey[m.data.period ? m.data.view + '@' + m.data.period : m.data.view] })) }) };
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
function statsDay(players, goalies = {}) { return schedule({ days: [], skaters: Object.entries(players).map(([name, statusId]) => ({ name, statusId })), goalies: Object.entries(goalies).map(([name, statusId]) => ({ name, statusId })) }); }
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
function weekTeam({ rows, goalies = [], lineups }) {
  const period = T.parsePeriodList(gamesPerPos().displayedLists.scoringPeriodList)[0];
  const statusByDay = {}; for (const [day, l] of Object.entries(lineups)) statusByDay[day] = l.statuses;
  return { teamId: 'teamA', teamName: 'Alpha Bets', period, lineups, groups: {
    skaters: { played: 0, max: 52, rows: T.applyDayStatuses(rows, statusByDay) },
    goalies: { played: 0, max: 4, rows: T.applyDayStatuses(goalies, statusByDay) } } };
}
const game = (day, time, opp = '@XXX') => ({ day, start: T.parseStart(time, day), opp, time: time.replace(/^\w{3} /, '') });
const prow = (name, games, extra) => Object.assign({ id: 'id-' + name, name, pos: 'C', injured: false, tag: null, games }, extra);
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
  assert.deepEqual(d.counts, { playing: 2, idle: 1, open: 1, out: 1 }, 'skater slots only; goalies are listed apart');
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
