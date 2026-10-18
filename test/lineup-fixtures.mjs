import { createRequire } from 'node:module';
const T = createRequire(import.meta.url)('../fantrax-game-tracker.user.js');

// Hand-written lineup fixtures (made-up names; the roster is the published mock's, mock.js:3-50 of the design assets).
// mkTeam(spec) builds what loadTeam would return for one period from raw getTeamRosterInfo-shaped day responses run through the
// real parseDayLineup / applyDayStatuses, so the model is tested on the parser's output.
export const POS_ID = { C: '206', LW: '203', RW: '204', D: '202', Skt: '208', G: '201' };
export const SLOT_TYPES = [].concat(Array(4).fill('C'), Array(4).fill('LW'), Array(4).fill('RW'), Array(6).fill('D'), ['Skt'], Array(2).fill('G'));
export const BASE = ['c1', 'c2', 'c3', 'c4', 'l1', 'l2', 'l3', 'l4', 'r1', 'r2', 'r3', 'r4', 'd1', 'd2', 'd3', 'd4', 'd5', 'd9', 'd6', 'g1', 'g2'];
export const TIMES = [
  { d: 0, m: 9 * 60 }, { d: 2, m: 17 * 60 }, { d: 2, m: 19 * 60 + 15 }, { d: 2, m: 21 * 60 + 45 }, { d: 3, m: 12 * 60 }, { d: 6, m: 15 * 60 },
];
export const RMAX = 26, IR_CAP = 2;
// flag: out | dtd | susp | null; ret: day index he is expected back; irElig: boolean | day index (eligible before it); from / until: roster days.
export const MOCK_TEAM = [
  { id: 'c1', fpg: 3.5, gp: 2, lfpg: 2.9, n: 'Nolan Pryce', pos: ['C'], g: { 0: '@BOS 7:00PM', 2: 'TOR 6:00PM', 3: 'OTT 6:30PM', 4: '@NYR 7:00PM', 5: 'MTL 6:00PM' } },
  { id: 'c2', fpg: 1.0, gp: 2, lfpg: 2.4, n: 'Theo Marsh', pos: ['C', 'LW'], g: { 1: 'CHI 7:00PM', 2: '@SEA 9:00PM', 3: '@VAN 9:00PM', 5: '@CGY 8:00PM' } },
  { id: 'c3', fpg: 4.0, gp: 2, lfpg: 2.1, n: 'Jonah Reyes', pos: ['C', 'RW'], flag: 'dtd', g: { 2: '@DAL 7:00PM', 3: '@WPG 7:00PM', 4: 'STL 7:00PM', 6: '@COL 2:00PM' } },
  { id: 'c4', fpg: null, gp: 0, lfpg: 3.1, n: 'Owen Baird', pos: ['C'], flag: 'out', ret: 4, irElig: 4, g: { 1: 'NSH 7:00PM', 3: '@WPG 7:00PM', 4: '@MIN 7:00PM', 6: 'DET 5:00PM' } },
  { id: 'c5', fpg: 2.0, gp: 2, lfpg: 2.6, n: 'Luca Ferris', pos: ['C', 'LW', 'RW'], g: { 2: '@LAK 9:30PM', 3: '@ANA 9:00PM', 5: '@SJS 9:00PM', 6: '@VGK 8:00PM' } },
  { id: 'l1', fpg: 1.5, gp: 2, lfpg: 2.2, n: 'Mason Hale', pos: ['LW'], g: { 0: '@BOS 7:00PM', 2: 'TOR 6:00PM', 3: 'OTT 6:30PM', 5: 'MTL 6:00PM' } },
  { id: 'l2', fpg: 3.0, gp: 2, lfpg: 1.9, n: 'Eli Novak', pos: ['LW', 'RW'], g: { 1: '@PHI 6:00PM', 3: 'NJD 6:00PM', 4: '@WSH 6:00PM', 6: '@CAR 4:00PM' } },
  { id: 'l3', fpg: null, gp: 0, lfpg: 2.7, n: 'Ryan Kask', pos: ['LW'], flag: 'out', irElig: true, g: { 0: 'BUF 6:00PM', 2: '@TBL 6:00PM', 4: 'FLA 6:00PM' } },
  { id: 'l4', fpg: 0.5, gp: 2, lfpg: 0.9, n: 'Dane Whitlock', pos: ['LW'], g: { 3: 'CBJ 6:00PM', 6: 'CBJ 5:00PM' } },
  { id: 'l5', fpg: 5.5, gp: 2, lfpg: 1.4, n: 'Petr Valek', pos: ['LW'], g: { 2: '@SEA 9:00PM', 3: '@VAN 9:00PM', 5: '@CGY 8:00PM' } },
  { id: 'r1', fpg: 2.0, gp: 2, lfpg: 2.5, n: 'Cole Aster', pos: ['RW'], g: { 0: 'PIT 6:00PM', 2: '@DAL 7:00PM', 3: 'OTT 6:30PM', 4: 'STL 7:00PM', 5: '@UTA 8:00PM' } },
  { id: 'r2', fpg: null, gp: 0, lfpg: 1.6, n: 'Isaac Lund', pos: ['RW'], flag: 'susp', g: { 1: '@NYI 6:00PM', 3: 'BOS 6:00PM', 5: '@TOR 6:00PM' } },
  { id: 'r3', fpg: 1.0, gp: 2, lfpg: 2.0, n: 'Felix Brandt', pos: ['RW'], g: { 1: '@PHI 6:00PM', 3: 'NJD 6:00PM', 5: '@BUF 6:00PM', 6: '@CAR 4:00PM' } },
  { id: 'r4', fpg: null, gp: 0, lfpg: null, n: 'Kai Moreau', pos: ['RW'], from: 2, g: { 0: 'EDM 8:00PM', 2: '@LAK 9:30PM', 4: 'CHI 7:00PM', 6: '@SEA 9:00PM' } },
  { id: 'c6', fpg: null, gp: 0, lfpg: 1.7, n: 'Nate Byrne', pos: ['C'], from: 4, g: { 4: '@NYR 7:00PM', 5: 'MTL 6:00PM', 6: 'DET 5:00PM' } },
  { id: 'r5', fpg: 0.0, gp: 2, lfpg: 1.2, n: 'Sam Ortiz', pos: ['RW'], until: 3, g: { 1: 'COL 8:00PM', 3: '@CBJ 6:00PM', 5: 'NSH 7:00PM' } },
  { id: 'd1', fpg: 2.5, gp: 2, lfpg: 2.3, n: 'Grant Holm', pos: ['D'], g: { 0: '@BOS 7:00PM', 2: 'TOR 6:00PM', 3: 'OTT 6:30PM', 5: 'MTL 6:00PM', 6: '@MIN 5:00PM' } },
  { id: 'd2', fpg: 3.0, gp: 2, lfpg: 1.7, n: 'Matt Sorensen', pos: ['D'], g: { 1: 'NSH 7:00PM', 3: '@WPG 7:00PM', 5: '@EDM 3:00PM', 6: '@DAL 6:00PM' } },
  { id: 'd3', fpg: 0.5, gp: 2, lfpg: 1.5, n: 'Wes Kimura', pos: ['D'], flag: 'dtd', ret: 3, g: { 1: '@PHI 6:00PM', 2: '@SEA 9:00PM', 3: '@VAN 9:00PM', 5: '@CGY 8:00PM', 6: '@ANA 7:00PM' } },
  { id: 'd4', fpg: 1.0, gp: 2, lfpg: 1.8, n: 'Noah Grieve', pos: ['D'], g: { 2: '@DAL 7:00PM', 3: 'BOS 6:00PM', 4: 'STL 7:00PM', 6: 'NSH 4:00PM' } },
  { id: 'd5', fpg: 4.5, gp: 2, lfpg: 1.3, n: 'Aaron Pike', pos: ['D'], g: { 3: 'NJD 6:00PM', 6: '@CAR 4:00PM' } },
  { id: 'd6', fpg: 1.0, gp: 2, lfpg: 1.6, n: 'Leo Varga', pos: ['D'], g: { 3: '@CBJ 6:00PM', 4: '@WSH 6:00PM', 5: '@BUF 6:00PM', 6: '@WPG 5:00PM' } },
  { id: 'd9', fpg: 2.0, gp: 2, lfpg: 1.1, n: 'Jake Tull', pos: ['D'], g: { 3: '@CBJ 6:00PM', 6: '@CHI 5:00PM' } },
  { id: 'd10', fpg: 3.5, gp: 2, lfpg: 1.9, n: 'Ben Roy', pos: ['D'], g: { 1: '@MIN 7:00PM', 3: '@CBJ 6:00PM', 6: '@CHI 5:00PM' } },
  { id: 'd7', fpg: null, gp: 0, lfpg: 2.0, n: 'Brett Okafor', pos: ['D'], flag: 'out', ret: 5, irElig: 5, ir: true, g: { 3: 'OTT 6:30PM', 5: 'MTL 6:00PM', 6: '@NJD 1:00PM' } },
  { id: 'd8', fpg: 0.0, gp: 2, lfpg: 0.8, n: 'Simon Ruud', pos: ['D'], irElig: false, ir: true, g: { 2: '@LAK 9:30PM', 4: 'CHI 7:00PM' } },
  { id: 'g1', fpg: 4.0, gp: 2, lfpg: 3.4, n: 'Ivan Petrov', pos: ['G'], g: { 0: 'PIT 6:00PM', 2: '@DAL 7:00PM', 4: 'STL 7:00PM', 6: '@COL 2:00PM' } },
  { id: 'g2', fpg: 1.5, gp: 2, lfpg: 2.9, n: 'Mats Lindqvist', pos: ['G'], g: { 1: '@NYI 6:00PM', 3: 'BOS 6:00PM', 5: '@TOR 6:00PM', 6: '@MTL 6:00PM' } },
  { id: 'g3', fpg: 6.0, gp: 2, lfpg: 2.2, n: 'Hugo Barre', pos: ['G'], g: { 3: '@CBJ 6:00PM', 5: 'NSH 7:00PM' } },
];
// The whole mock as a mkTeam spec: Wed 7:15 PM, 64 skater / 7 goalie games, 26 players outside IR, 2 IR places.
export const MOCK = { start: '2026-10-05', days: 7, now: TIMES[2], slots: SLOT_TYPES, base: BASE, players: MOCK_TEAM, limits: { total: RMAX, ir: IR_CAP }, max: { skaters: 64, goalies: 7 }, own: true, daily: true };

const posIdsOf = p => p.pos.map(x => POS_ID[x]);
const isG = p => p.pos.includes('G');
const onRosterDay = (p, d) => (p.from == null || d >= p.from) && (p.until == null || d <= p.until);

export function mkTeam(spec) {
  const days = Array.from({ length: spec.days || 7 }, (_, i) => T.addDays(spec.start, i));
  const [sy, sm, sd] = spec.start.split('-').map(Number), now = new Date(sy, sm - 1, sd + spec.now.d, 0, spec.now.m);
  const today = T.dayString(now), opts = { returnDates: spec.players.some(p => p.ret !== undefined) };
  const period = { id: 1, start: days[0], end: days[days.length - 1], days };
  const gameOf = (p, di) => {
    const raw = (p.g || {})[di];
    if (!raw) return null;
    const parts = raw.split(' '), time = parts.length > 1 ? parts[1] : parts[0], opp = parts.length > 1 ? parts[0] : 'XXX';
    const start = T.parseStart('XXX<br/>' + time, days[di]);
    return { day: days[di], start, started: !!start && start <= now, opp, time };
  };
  const out = p => p.flag === 'out' || p.flag === 'susp';
  const eligOf = (p, d) => { const ok = p.irElig === true || (typeof p.irElig === 'number' && d < p.irElig); return ['1', '2'].concat(ok ? ['3'] : []); };
  // one day's raw response in getTeamRosterInfo's shape, parsed with the real parser
  const rowFor = (p, d, posId, statusId) => {
    const g = gameOf(p, d), gpCell = d <= spec.now.d ? String(g && g.started && !out(p) ? 1 : 0) : '30';
    return { posId, statusId, secondary: p.secondary === true, eligibleStatusIds: eligOf(p, d), eligiblePosIds: isG(p) ? ['201'] : posIdsOf(p).concat('208'), cells: [{ content: gpCell }],
      scorer: { scorerId: p.id, name: p.n, shortName: p.n, posIds: isG(p) ? ['201'] : posIdsOf(p).concat('208'), posIdsNoFlex: isG(p) ? ['201'] : posIdsOf(p), posShortNames: p.pos.join(','),
        defaultPosId: posIdsOf(p)[0], icons: [], disableLineupChange: p.disabled === true } };
  };
  const lineups = {}, statusByDay = {}, detailByDay = {}, gpByDay = {};
  days.forEach((day, d) => {
    const on = spec.players.filter(p => onRosterDay(p, d)), byId = Object.fromEntries(on.map(p => [p.id, p]));
    const placed = new Set(), sk = [], go = [];
    spec.slots.forEach((t, i) => {
      const id = spec.base[i], q = id ? byId[id] : null, p = q && !q.status ? q : null, tbl = t === 'G' ? go : sk;
      if (p && !p.ir) { placed.add(p.id); tbl.push(rowFor(p, d, POS_ID[t], '1')); } else tbl.push({ posId: POS_ID[t], statusId: '1', cells: [{ content: '30' }] });
    });
    for (const p of on) if (!placed.has(p.id)) (isG(p) ? go : sk).push(rowFor(p, d, posIdsOf(p)[0] || '201', p.status ? p.status : p.ir ? '3' : '2'));
    const st = [{ id: '1', name: 'Active' }, { id: '2', name: 'Reserve' }, { id: '3', name: 'Inj Res' }];
    const header = { cells: [{ shortName: 'GP' }] };
    const l = T.parseDayLineup({ tables: [{ scGroup: '2010', header, rows: sk, statusTotals: st }, { scGroup: '2020', header, rows: go, statusTotals: st }], miscData: { applyToFuturePeriods: false, illegalRosterMsgsText: null } });
    lineups[day] = l; statusByDay[day] = l.statuses; detailByDay[day] = l.detail;
    if (day <= today) gpByDay[day] = l.gp;
  });
  const sched = p => ({ id: p.id, name: p.n, shortName: p.n, pos: p.pos.join(','), injured: out(p), tag: null, flag: p.flag || null, returnDate: p.ret !== undefined ? days[p.ret] : null, returnText: null,
    games: days.map((_, d) => gameOf(p, d)).filter(Boolean) });
  const rows = g => T.applyDayStatuses(spec.players.filter(p => isG(p) === (g === 'goalies')).map(sched), statusByDay, detailByDay, gpByDay);
  const team = { teamId: 'teamA', teamName: 'Test Team', period, seasonStartDay: T.addDays(spec.start, -7), lineups, statusNames: { 1: 'Active', 2: 'Reserve', 3: 'Inj Res' },
    groups: { skaters: { played: 0, max: spec.max.skaters, rows: rows('skaters') }, goalies: { played: 0, max: spec.max.goalies, rows: rows('goalies') } } };
  const extras = { fpg: {}, lastFpg: {}, lastLabel: '25-26', limits: { total: spec.limits.total, ir: spec.limits.ir, irCountsTowardTotal: false }, ownTeam: spec.own !== false, daily: spec.daily !== false, applyToFuture: false };
  for (const p of spec.players) { extras.fpg[p.id] = { gp: p.gp, fpg: p.fpg }; if (p.lfpg != null) extras.lastFpg[p.id] = p.lfpg; }
  return { team, extras, now, opts };
}

// The real league on 2026-10-05 in the mock's terms: IR at its cap (Brett Okafor d7 and Simon Ruud d8 on IR, both IR-eligible),
// the roster at its 26 max outside IR (Wed-Sun), one IR-eligible active player (Ryan Kask l3, LW slot 6) and one IR-eligible reserve
// player (Luca Ferris c5). Okafor stays IR-eligible until Sat (day 5), as in MOCK.
export const MOCK_IR_FULL = Object.assign({}, MOCK, {
  players: MOCK_TEAM.map(p => p.id === 'd8' || p.id === 'c5' ? Object.assign({}, p, { irElig: true }) : p),
});
