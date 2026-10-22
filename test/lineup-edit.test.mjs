import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkTeam, MOCK, BASE, MOCK_IR_FULL } from './lineup-fixtures.mjs';
const T = createRequire(import.meta.url)('../fantrax-game-tracker.user.js');
const clone = L => ({ s: L.s.slice(), ir: L.ir.slice() });
const build = spec => { const { team, extras, now, opts } = mkTeam(spec); return T.buildEditModel(team, extras, now, opts); };
const M = build(MOCK);   // Wed 7:15 PM: TOR 6:00PM started, @SEA 9:00PM not

test('buildEditModel: base lineup per day from the slots, IR from status 3, roster days from presence', () => {
  assert.equal(M.days.length, 7);
  assert.deepEqual(M.days[0].base.ir.slice().sort(), ['d7', 'd8']);
  assert.equal(M.days[0].slots.length, 21);
  assert.equal(M.days[0].base.s.length, 21);
  assert.equal(T.onRoster(M, 1, 'r4'), false); assert.equal(T.onRoster(M, 2, 'r4'), true);
  assert.equal(T.where(M, 0, M.days[0].base, 'c5'), 'R');
  assert.equal(T.where(M, 0, M.days[0].base, 'c1'), '206');
  assert.equal(T.where(M, 0, M.days[0].base, 'd7'), 'IR');
  assert.equal(T.where(M, 1, M.days[1].base, 'r4'), null);
  assert.equal(M.days[1].base.s[11], null);   // r4's slot is open the day before he arrives
  assert.deepEqual(M.days.map(d => d.state), ['past', 'past', 'today', 'future', 'future', 'future', 'future']);
  assert.equal(M.today, '2026-10-07');
  assert.deepEqual(M.max, { skaters: 64, goalies: 7 });
  assert.deepEqual(M.limits, { total: 26, ir: 2, irCountsTowardTotal: false });
  assert.equal(M.order.length, 29); assert.equal(M.order[28], 'g3');
  assert.deepEqual(M.players.c2, Object.assign({}, M.players.c2, { id: 'c2', name: 'Theo Marsh', group: 'skaters', posIds: ['206', '203', '208'], defaultPosId: '206', fpg: 1, gp: 2 }));
  assert.deepEqual(M.days[2].rows.c1, { posId: '206', stId: '1', eligible: ['1', '2'], eligiblePosIds: ['206', '208'], secondary: false, disabled: false });
  assert.equal(M.editable, true); assert.equal(M.notEditable, null);
});

test('locked: a past day, or today once his game started; not today before it', () => {
  assert.equal(T.locked(M, 1, 'c2'), true); assert.equal(T.locked(M, 2, 'c1'), true); assert.equal(T.locked(M, 2, 'c2'), false);
  assert.equal(T.locked(M, 3, 'c1'), false);
  assert.equal(T.lockWhy(M, 1, 'c2'), 'Tue 10/6 is already played');
  assert.equal(T.lockWhy(M, 2, 'c1'), "Nolan Pryce's game started at 6:00 PM");
});

test('hasGame, counted and irEligible follow the day\'s rows', () => {
  assert.equal(T.hasGame(M, 0, 'c1'), true); assert.equal(T.hasGame(M, 1, 'c1'), false);
  assert.equal(T.counted(M, 0, 'c1'), true);
  assert.equal(T.counted(M, 3, 'c4'), false);   // Out with no return date counted yet
  assert.equal(T.counted(M, 4, 'c4'), true);    // return date Fri: counts from then
  assert.equal(T.counted(M, 0, 'l3'), false);   // Out, played day: GP 0
  assert.equal(T.irEligible(M, 3, 'c4'), true); assert.equal(T.irEligible(M, 4, 'c4'), false);
  assert.equal(T.irEligible(M, 0, 'd8'), false);
  assert.equal(T.isGoalie(M, 'g1'), true); assert.equal(T.isGoalie(M, 'c1'), false);
});

test('fits uses Fantrax posIds, so the flex slot takes any skater and never a goalie', () => {
  assert.equal(T.fits(M, 3, 'd1', '208'), true); assert.equal(T.fits(M, 3, 'g1', '208'), false); assert.equal(T.fits(M, 3, 'c2', '203'), true);
  assert.equal(T.fits(M, 3, 'c1', '203'), false); assert.equal(T.fits(M, 3, 'g1', '201'), true);
});

test('fieldMapOf has no slot numbers: two lineups differing only by which C slot are equal', () => {
  const L = clone(M.days[3].base); [L.s[0], L.s[1]] = [L.s[1], L.s[0]];
  assert.ok(T.sameFieldMap(T.fieldMapOf(M, 3, L), T.fieldMapOf(M, 3, M.days[3].base)));
  const L2 = clone(M.days[3].base); L2.s[0] = null;
  assert.ok(!T.sameFieldMap(T.fieldMapOf(M, 3, L2), T.fieldMapOf(M, 3, M.days[3].base)));
});

test('fieldMapOf: off-lineup posId is the base row\'s if he was already off, else his default', () => {
  const base = M.days[3].base, fm = T.fieldMapOf(M, 3, base);
  assert.deepEqual(fm.c5, { posId: '206', stId: '2' });     // reserve in base: base row posId
  assert.deepEqual(fm.d7, { posId: '202', stId: '3' });
  assert.deepEqual(fm.c1, { posId: '206', stId: '1' });
  const L = clone(base); L.s[T.where(M, 3, base, 'c2') === '206' ? 1 : 0] = null;   // bench c2 (a C/LW): active in base → default posId
  assert.deepEqual(T.fieldMapOf(M, 3, L).c2, { posId: '206', stId: '2' });
  const Lw = clone(base); Lw.s[base.s.indexOf('l1')] = null;
  assert.deepEqual(T.fieldMapOf(M, 3, Lw).l1, { posId: '203', stId: '2' });
});

test('fieldMapOf → lineupFromFieldMap round-trips the base of every day', () => {
  M.days.forEach((d, di) => {
    const fm = T.fieldMapOf(M, di, d.base), r = T.lineupFromFieldMap(M, di, fm);
    assert.deepEqual(r.unplaced, []);
    assert.ok(T.sameFieldMap(T.fieldMapOf(M, di, r.L), fm), 'day ' + di);
  });
  const fm = T.fieldMapOf(M, 3, M.days[3].base); fm.c5 = { posId: '206', stId: '1' }; fm.c1 = { posId: '206', stId: '1' };
  fm.c2 = { posId: '206', stId: '1' }; fm.c3 = { posId: '206', stId: '1' }; fm.c4 = { posId: '206', stId: '1' };   // five Cs for four C slots
  assert.equal(T.lineupFromFieldMap(M, 3, fm).unplaced.length, 1);
});

test('bench lists reserve players on the roster in roster order', () => {
  assert.deepEqual(T.bench(M, 0, M.days[0].base), ['c5', 'l5', 'r5', 'd10', 'g3']);   // r4 / c6 not yet on the roster; d7 / d8 are on IR
  assert.deepEqual(T.bench(M, 5, M.days[5].base), ['c5', 'l5', 'c6', 'd10', 'g3']);   // r5 was dropped after Thu
});

test('changes speaks Fantrax\'s words', () => {
  const base = M.days[3].base, L = clone(base);
  L.s[base.s.indexOf('c4')] = 'c5';   // c4 (out) to reserve, c5 into the open C slot
  assert.deepEqual(T.changes(M, 3, L).map(c => [c.id, c.text]), [['c4', 'Active to Reserve'], ['c5', 'Reserve to Active (C)']]);
  const L2 = clone(base); L2.s[base.s.indexOf('d1')] = null; L2.ir.push('d1');
  assert.deepEqual(T.changes(M, 3, L2), [{ id: 'd1', from: '202', to: 'IR', text: 'Active to IR' }]);
  assert.deepEqual(T.changes(M, 3, base), []);
});

test('changes: a move between slot types reads "LW to Skt"', () => {
  const base = M.days[3].base, L = clone(base), skt = 18, lw = base.s.indexOf('l2');
  assert.equal(base.s[skt], 'd6');
  L.s[skt] = 'l2'; L.s[lw] = null;
  assert.deepEqual(T.changes(M, 3, L).map(c => [c.id, c.text]).filter(x => x[0] === 'l2'), [['l2', 'LW to Skt']]);
});

test('fixed statuses are sent unchanged and never movable', () => {
  const spec = Object.assign({}, MOCK, { players: MOCK.players.map(p => p.id === 'c5' ? Object.assign({}, p, { status: '9' }) : p) });
  const F = build(spec), base = F.days[3].base;
  assert.equal(T.where(F, 3, base, 'c5'), 'fixed');
  assert.ok(!T.bench(F, 3, base).includes('c5'));
  assert.deepEqual(F.days[3].fixed.c5, { posId: '206', stId: '9' });
  assert.deepEqual(T.fieldMapOf(F, 3, base).c5, { posId: '206', stId: '9' });
  assert.ok(!base.ir.includes('c5'));
});

test('a game with neither time nor score is no game', () => {
  const spec = Object.assign({}, MOCK, { players: MOCK.players.map(p => p.id === 'c1' ? Object.assign({}, p, { g: Object.assign({}, p.g, { 3: 'PPD' }) }) : p) });
  const P = build(spec);
  assert.equal(T.hasGame(P, 3, 'c1'), false); assert.equal(T.counted(P, 3, 'c1'), false); assert.equal(T.locked(P, 3, 'c1'), false);
  const today = build(Object.assign({}, MOCK, { players: MOCK.players.map(p => p.id === 'c1' ? Object.assign({}, p, { g: Object.assign({}, p.g, { 2: 'PPD' }) }) : p) }));
  assert.equal(today.days[2].state, 'today'); assert.equal(T.hasGame(today, 2, 'c1'), false); assert.equal(T.locked(today, 2, 'c1'), false);   // his 6:00 PM game on today is postponed: not locked
  assert.equal(T.hasGame(P, 4, 'c1'), true);
});

test('buildEditModel: not editable on another team, in a weekly league, or with no extras', () => {
  const o = build(Object.assign({}, MOCK, { own: false }));
  assert.equal(o.editable, false); assert.equal(o.notEditable, 'Lineups can only be edited on your own team');
  const w = build(Object.assign({}, MOCK, { daily: false }));
  assert.equal(w.editable, false); assert.match(w.notEditable, /daily/);
  const { team, now, opts } = mkTeam(MOCK), n = T.buildEditModel(team, null, now, opts);
  assert.equal(n.editable, false); assert.ok(n.notEditable); assert.equal(n.players.c1.fpg, null); assert.equal(n.limits.total, null);
});

test('a day whose lineup was not loaded has no slots and nobody on its roster', () => {
  const { team, extras, now, opts } = mkTeam(MOCK);
  delete team.lineups[team.period.days[4]];
  const N = T.buildEditModel(team, extras, now, opts);
  assert.equal(N.days[4].slots, null); assert.equal(T.onRoster(N, 4, 'c1'), false);
});

test('a fixed player in an active slot: where fixed, slot stays occupied, lineupFromFieldMap keeps him, a secondary row is not sent (disableLineupChange is a lock, not fixed: next test)', () => {
  const spec = Object.assign({}, MOCK, { players: MOCK.players.map(p => p.id === 'c1' ? Object.assign({}, p, { secondary: true }) : p) });
  const F = build(spec), base = F.days[3].base;
  assert.equal(T.where(F, 3, base, 'c1'), 'fixed'); assert.equal(base.s[0], 'c1'); assert.deepEqual(F.days[3].fixed.c1, { posId: '206', stId: '1' });
  const fm = T.fieldMapOf(F, 3, base);
  assert.ok(!('c1' in fm)); assert.ok('c1' in F.days[3].rows && F.days[3].rows.c1.secondary);   // a secondary row is not sent
  const L = T.lineupFromFieldMap(F, 3, fm).L;
  assert.equal(L.s[0], 'c1'); assert.equal(T.where(F, 3, L, 'c1'), 'fixed');
});

test('disableLineupChange is Fantrax\'s lock flag: the player is locked (not fixed) that day; lockWhy says "game started" only once it has', () => {
  const F = build(Object.assign({}, MOCK, { players: MOCK.players.map(p => p.id === 'c3' ? Object.assign({}, p, { disabled: true }) : p) }));
  assert.ok(!('c3' in F.days[3].fixed)); assert.equal(F.days[3].rows.c3.disabled, true);
  assert.equal(T.locked(F, 3, 'c3'), true); assert.equal(T.locked(F, 3, 'c1'), false);   // Thursday: nobody's game has started, only the flag says so
  assert.equal(T.lockWhy(F, 3, 'c3'), 'Fantrax has locked Jonah Reyes for Thu 10/8');
  assert.equal(T.dayLocked(F, 3), false);
  assert.equal(T.where(F, 3, F.days[3].base, 'c3'), '206');
  assert.equal(T.targetsFor(F, 3, F.days[3].base, { kind: 'slot', i: F.days[3].base.s.indexOf('c3') }).size, 0);
});

test('every player locked by Fantrax today (all games under way): the day is locked and a player with no game is not said to have started', () => {
  // live 2026-10-05 19:40: once every game of the day has started, Fantrax flags the whole roster, players with no game included
  const F = build(Object.assign({}, MOCK, { players: MOCK.players.map(p => Object.assign({}, p, { disabled: true })) }));
  assert.equal(F.days[2].state, 'today');
  assert.equal(T.dayLocked(F, 2), true);
  assert.equal(T.lockWhy(F, 2, 'l5'), 'Fantrax has locked Wed 10/7: every game has started');   // flagged, his game not yet shown as started
  assert.equal(T.lockWhy(F, 2, 'l4'), 'Fantrax has locked Wed 10/7: every game has started');   // l4 has no Wednesday game
  assert.equal(T.lockWhy(F, 2, 'c1'), "Nolan Pryce's game started at 6:00 PM");                 // his game really started (6:00 PM < 7:15 PM)
  assert.equal(T.dayHeadView(F, F.days.map(d => d.base), 2).locked, true);
  assert.equal(T.dayLocked(M, 2), false);   // the plain fixture at Wed 7:15 PM: only the started games are locked
  assert.equal(T.dayLocked(M, 1), true);    // a played day
});

// ---- seating, roster fit, legality, ledger
const dropAt = (L, i) => { const x = clone(L); x.s[i] = null; return x; };

test('seat shifts an unlocked C/LW into LW to free a C slot; never moves a locked player', () => {
  const s = dropAt(M.days[4].base, 7).s;   // Fri: open LW slot, all four C slots full; c6 is C only
  assert.equal(M.days[4].slots[7].posId, '203');
  const a = T.seat(M, 4, s, 'c6');
  assert.deepEqual([a[0], a[1], a[2], a[3], a[7]], ['c6', 'c1', 'c3', 'c4', 'c2']);
  assert.deepEqual(s, dropAt(M.days[4].base, 7).s);   // input untouched
  // fixed occupant in slot 0 is skipped like a locked one
  const F = build(Object.assign({}, MOCK, { players: MOCK.players.map(p => p.id === 'c1' ? Object.assign({}, p, { secondary: true }) : p) }));
  const b = T.seat(F, 4, dropAt(F.days[4].base, 7).s, 'c6');
  assert.deepEqual([b[0], b[1], b[7]], ['c1', 'c6', 'c2']);
  // today, c1 (6:00 PM) and c3 (7:00 PM) are locked: c2 would have to shift but the open LW slot takes c6's seating via c2 / c4 only
  const t = T.seat(M, 2, dropAt(M.days[2].base, 7).s, 'c6');
  assert.equal(t[0], 'c1'); assert.equal(t[2], 'c3');
});

test('seat returns null when every slot he fits holds a locked player', () => {
  assert.equal(T.seat(M, 1, M.days[1].base.s, 'g3'), null);   // Tue is played: both G slots are locked
  const full = M.days[3].base.s;
  assert.equal(T.seat(M, 3, full, 'c6'), null);               // everything full and nobody can move anywhere
});

test('swapsFor lists each unlocked same-group occupant he could replace', () => {
  const sw = T.swapsFor(M, 3, M.days[3].base, 'c5');
  assert.ok(sw.length > 0);
  assert.ok(sw.every(x => M.players[x.out].group === 'skaters'));
  const c4 = sw.find(x => x.out === 'c4');
  assert.ok(c4 && c4.s.includes('c5') && !c4.s.includes('c4'));
  assert.deepEqual(T.swapsFor(M, 3, M.days[3].base, 'g3').map(x => x.out).sort(), ['g1', 'g2']);
  assert.deepEqual(T.swapsFor(M, 1, M.days[1].base, 'g3'), []);   // past: all locked
});

test('rosterCount counts the roster outside IR (IR too when the league counts it)', () => {
  assert.equal(T.rosterCount(M, 0, M.days[0].base), 25);
  assert.equal(T.rosterCount(M, 3, M.days[3].base), 26);
  const C = Object.assign({}, M, { limits: Object.assign({}, M.limits, { irCountsTowardTotal: true }) });
  assert.equal(T.rosterCount(C, 3, M.days[3].base), 28);
});

test('fitRoster: off IR onto a full roster pairs the not-counted IR-eligible player into IR', () => {
  const base = M.days[4].base, L = clone(base); L.ir = L.ir.filter(x => x !== 'd7');   // Fri: d7 back from IR onto a full roster
  assert.equal(T.rosterCount(M, 4, base), 26);
  const r = T.fitRoster(M, 4, L, 'd7');
  assert.equal(r.paired, 'l3'); assert.deepEqual(r.L.ir.sort(), ['d8', 'l3'].sort()); assert.equal(r.L.s.includes('l3'), false);
  assert.equal(T.rosterCount(M, 4, r.L), 26);
  assert.deepEqual(T.fitRoster(M, 4, base, 'c1'), { L: base });   // no rise, no pairing
});

test('fitRoster: nobody IR-eligible -> blocked with the exact "needs a drop" copy', () => {
  const spec = Object.assign({}, MOCK, { limits: { total: RMAX_OF(), ir: 3 }, players: MOCK.players.map(p => p.irElig !== undefined && !p.ir && p.id !== 'd8' ? Object.assign({}, p, { irElig: false }) : p) });
  const N = build(spec), L = clone(N.days[4].base); L.ir = L.ir.filter(x => x !== 'd7');
  const r = T.fitRoster(N, 4, L, 'd7');
  assert.equal(r.paired, undefined);
  assert.equal(r.blocked, "Roster full (26/26): bringing Brett Okafor back needs a drop (nobody else can go into IR); drops are made on Fantrax's roster page");
});
function RMAX_OF() { return 26; }

test('fitRoster: IR full -> blocked, copy ends "(IR is full); drops are made on Fantrax\'s roster page"', () => {
  const N = Object.assign({}, M, { limits: { total: 26, ir: 1, irCountsTowardTotal: false } });   // d8 already holds the one IR place
  const L = clone(M.days[4].base); L.ir = ['d8'];
  const r = T.fitRoster(N, 4, L, 'd7');
  assert.equal(r.paired, undefined);
  assert.equal(r.blocked, "Roster full (26/26): bringing Brett Okafor back needs a drop (IR is full); drops are made on Fantrax's roster page");
});

test('fitRoster: a day already over the total pairs on the move that raises the count again, when `before` is the current lineup', () => {
  const N = Object.assign({}, M, { limits: { total: 25, ir: 3, irCountsTowardTotal: false } });   // Fri base is 26/25: over
  const base = M.days[4].base, cur = clone(base); cur.ir = cur.ir.concat('c4'); cur.s[cur.s.indexOf('c4')] = null;   // user put c4 into IR: 25
  const L = clone(cur); L.ir = L.ir.filter(x => x !== 'd7');   // then brings d7 out: 26
  assert.equal(T.rosterCount(N, 4, cur), 25); assert.equal(T.rosterCount(N, 4, L), 26);
  assert.equal(T.fitRoster(N, 4, L, 'd7', cur).paired, 'l3');
  assert.deepEqual(T.fitRoster(N, 4, L, 'd7'), { L });   // default `before` = base (26): no rise over it, no pairing
});

test('limits null: no pairing, no total error', () => {
  const N = Object.assign({}, M, { limits: { total: null, ir: null, irCountsTowardTotal: false } });
  const L = clone(M.days[4].base); L.ir = [];
  assert.deepEqual(T.fitRoster(N, 4, L, 'd7'), { L });
  assert.ok(!T.dayErrors(N, 4, L).some(e => /Roster over the limit/.test(e)));
  const many = clone(M.days[4].base); many.ir = ['d7', 'd8', 'l3'];
  assert.ok(!T.dayErrors(N, 4, many).some(e => /IR spots/.test(e)));
  assert.ok(T.dayErrors(M, 4, many).some(e => /Only 2 IR spots/.test(e)));
});

test('dayErrors: duplicate, ineligible slot, not on roster, IR not eligible, IR over cap, over total, locked moved', () => {
  const base = M.days[3].base, RUUD = 'Simon Ruud is on IR but no longer IR-eligible. Move him off IR first.';   // the mock's own illegal row (d8)
  const errs = L => T.dayErrors(M, 3, L).filter(e => e !== RUUD);
  assert.deepEqual(T.dayErrors(M, 3, base), [RUUD]);
  let L = clone(base); L.s[1] = 'c1';
  assert.deepEqual(errs(L), ['Nolan Pryce is in two places.']);
  L = clone(base); L.s[0] = 'g3';
  assert.deepEqual(errs(L), ["Hugo Barre can't play C."]);
  L = clone(base); L.s[11] = 'c6';   // c6 arrives Fri
  assert.deepEqual(errs(L), ['Nate Byrne is not on the roster Thu 10/8.']);
  L = clone(base); L.ir = ['d8', 'c5'];   // c5 (reserve) is not IR-eligible
  assert.deepEqual(errs(L), ['Luca Ferris is on IR but no longer IR-eligible. Move him off IR first.']);
  L = clone(base); L.ir = ['d7', 'd8', 'l3']; L.s[base.s.indexOf('l3')] = null;
  assert.deepEqual(errs(L), ['Only 2 IR spots.']);
  L = clone(base); L.ir = [];
  assert.deepEqual(errs(L), ['Roster over the limit: 28/26 players outside IR. Fantrax would save it and score nothing that day.']);
  const mv = clone(M.days[2].base); mv.s[0] = null;   // today: c1's 6:00 PM game started
  assert.deepEqual(T.dayErrors(M, 2, mv).filter(e => e !== RUUD), ["Nolan Pryce's game started at 6:00 PM after you moved him."]);
});

test('dayErrors ignores fixed players', () => {
  const F = build(Object.assign({}, MOCK, { players: MOCK.players.map(p => p.id === 'c1' ? Object.assign({}, p, { secondary: true }) : p) }));
  const L = clone(F.days[3].base); L.s[1] = 'c1';   // "in two places" would fire for a normal player
  assert.deepEqual(T.dayErrors(F, 3, L).filter(e => !/Simon Ruud/.test(e)), []);
  assert.equal(T.rosterCount(F, 3, L), 26);
});

test('dayWarnings: a started player who will not count', () => {
  const base = M.days[4].base, L = clone(base);
  L.s[base.s.indexOf('c4')] = 'r2';   // r2 is suspended; c4 comes off
  assert.deepEqual(T.dayWarnings(M, 4, L), []);   // r2 has no game Fri
  const L3 = clone(M.days[3].base); L3.s[L3.s.indexOf('c4')] = 'r2';
  assert.deepEqual(T.dayWarnings(M, 3, L3), ["Isaac Lund starts but won't count (suspended)."]);
  const L4 = clone(M.days[3].base); L4.s[L4.s.indexOf('l4')] = 'l3';   // l3 Out, no game Thu
  assert.deepEqual(T.dayWarnings(M, 3, L4), []);
  const L5 = clone(M.days[0].base); L5.s[L5.s.indexOf('c1')] = 'l3';   // not a skater slot he fits, but the warning only reads changes
  assert.deepEqual(T.dayWarnings(M, 0, L5), ["Ryan Kask starts but won't count (out)."]);
});

test("gameLedger marks the games past the max in Fantrax's counting order", () => {
  const lineups = M.days.map(d => d.base), led0 = T.gameLedger(Object.assign({}, M, { max: { skaters: null, goalies: null } }), lineups);
  assert.ok(led0.skaters.length > 2 && led0.over.size === 0);
  const keys = led0.skaters.map(e => [e.di, e.start === null ? 1e18 : e.start]);
  assert.deepEqual(keys, keys.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]));
  assert.ok(led0.goalies.length > 0 && led0.goalies.every(e => M.players[e.id].group === 'goalies'));
  const played = led0.skaters.filter(e => e.played).length;
  assert.ok(played > 0 && led0.skaters[played - 1].played && !led0.skaters[played].played);
  const N = Object.assign({}, M, { max: { skaters: led0.skaters.length - 2, goalies: null } });
  const led = T.gameLedger(N, lineups), last2 = led.skaters.slice(-2).map(e => e.di + '|' + e.id);
  assert.deepEqual([...led.over].sort(), last2.slice().sort());
  assert.equal(led.over.size, 2);
});

// ---- move planners
const sl = i => ({ kind: 'slot', i });
const keys = (di, L, sel, X = M) => [...T.targetsFor(X, di, L, sel)].sort();
const frozen = o => JSON.parse(JSON.stringify(o));

test('computeMove: open, swap, shift, bump, take, to reserve, to IR — one case each with exact lineups', () => {
  const B = M.days[4].base, open = dropAt(B, 7);   // Fri; slot 7 is the open LW slot
  const at = (L, i) => L.s[i];
  // open: a bench player takes the open slot
  const o = T.computeMove(M, 4, open, sl(7), 'b:c5');
  assert.equal(at(o, 7), 'c5'); assert.equal(o.paired, undefined);
  // swap: two players who fit each other's slots trade places (c5 sits in the flex slot, l2 in LW)
  const flex = clone(B); flex.s[18] = 'c5';
  const sw = T.computeMove(M, 4, flex, sl(5), 's:18');
  assert.equal(at(sw, 5), 'c5'); assert.equal(at(sw, 18), 'l2');
  // shift: c5 takes c2's C slot, c2 (C/LW) moves into the open LW slot
  const sh = T.computeMove(M, 4, open, { kind: 'bench', id: 'c5' }, 's:1');
  assert.equal(at(sh, 1), 'c5'); assert.equal(at(sh, 7), 'c2'); assert.equal(sh.s.includes(null), false);
  // bump: c5 takes c1's C slot (c1 is C only) and c1 goes to reserve
  const bu = T.computeMove(M, 4, B, { kind: 'bench', id: 'c5' }, 's:0');
  assert.equal(at(bu, 0), 'c5'); assert.equal(bu.s.includes('c1'), false); assert.deepEqual(bu.ir, B.ir);
  // take: the selected slot's player gives it up, the bench player takes it
  const tk = T.computeMove(M, 4, B, sl(0), 'b:c5');
  assert.equal(at(tk, 0), 'c5'); assert.equal(tk.s.includes('c1'), false);
  // to reserve / to IR
  assert.equal(at(T.computeMove(M, 4, B, sl(0), 'tobench'), 0), null);
  const I = Object.assign(clone(B), { ir: ['d7'] }), ir = T.computeMove(M, 4, I, sl(6), 'toir');
  assert.equal(at(ir, 6), null); assert.deepEqual(ir.ir, ['d7', 'l3']);
  // off IR into a slot (take from IR)
  const fi = T.computeMove(M, 4, open, { kind: 'ir', id: 'l3' }, 's:7');
  assert.equal(at(fi, 7), 'l3');
});

test('computeMove: a move onto a full roster pairs the cheapest IR-eligible player, or is blocked', () => {
  const B = M.days[4].base;   // 26/26: d7 coming off IR into a slot raises the count
  const sel = { kind: 'ir', id: 'd7' }, r = T.computeMove(M, 4, B, sel, 's:15');
  assert.equal(r.s[15], 'd7'); assert.equal(r.paired, 'l3'); assert.equal(r.blocked, undefined);
  // IR full and nobody eligible left: blocked
  const Z = build(MOCK);
  const nobody = clone(Z.days[4].base);
  Z.days[4].rows.l3.eligible = ['1', '2']; Z.days[4].rows.c4.eligible = ['1', '2']; Z.days[4].rows.d7.eligible = ['1', '2', '3'];
  const b = T.computeMove(Z, 4, nobody, { kind: 'ir', id: 'd7' }, 's:15');
  assert.match(b.blocked, /^Roster full \(26\/26\): bringing Brett Okafor back needs a drop/);
});

test('moveKind says before the click whether the occupant shifts or goes to reserve', () => {
  const open = dropAt(M.days[4].base, 7), B = M.days[4].base;
  assert.deepEqual(T.moveKind(M, 4, open, { kind: 'bench', id: 'c5' }, 's:1'), { k: 'shift', txt: 'C · Theo Marsh moves to LW' });
  assert.deepEqual(T.moveKind(M, 4, B, { kind: 'bench', id: 'c5' }, 's:8'), { k: 'bump', txt: 'RW · Cole Aster to reserve' });
  assert.deepEqual(T.moveKind(M, 4, open, sl(8), 's:7'), { k: 'open', txt: 'LW (open)' });
  const flex = clone(B); flex.s[18] = 'c5';
  assert.deepEqual(T.moveKind(M, 4, flex, sl(5), 's:18'), { k: 'swap', txt: 'Skt · swap with Luca Ferris' });
  assert.deepEqual(T.moveKind(M, 4, B, sl(5), 's:8'), { k: 'bump', txt: 'RW · Cole Aster to reserve' });
  assert.deepEqual(T.moveKind(M, 4, B, sl(0), 'b:c5'), { k: 'take', txt: 'Reserve · Luca Ferris takes his C' });
  assert.deepEqual(T.moveKind(M, 4, open, { kind: 'bench', id: 'c5' }, 's:7'), { k: 'open', txt: 'LW (open)' });
  assert.deepEqual(T.moveKind(M, 4, open, sl(7), 'b:c5'), { k: 'take', txt: 'Luca Ferris takes this LW slot' });
  assert.deepEqual(T.moveKind(M, 4, B, sl(0), 'tobench'), { k: 'bench', txt: 'Reserve' });
  assert.deepEqual(T.moveKind(M, 4, Object.assign(clone(B), { ir: [] }), sl(6), 'toir'), { k: 'ir', txt: 'IR' });
  // full roster: d7 off IR into a slot pairs l3 into IR (Out), or blocks
  const p = T.moveKind(M, 4, B, { kind: 'ir', id: 'd7' }, 's:15');
  assert.equal(p.k, 'bump'); assert.match(p.txt, / · Ryan Kask \(Out\) into IR$/);
});

test('targetsFor never offers a locked occupant\'s slot, a fixed player\'s slot or another slot of the same type', () => {
  const B = M.days[2].base;   // Wed 7:15 PM: c1, c3 (and others whose game started) are locked
  const t = keys(2, B, sl(1));   // c2 (C/LW) selected: C slots excluded (same type), locked LW occupants excluded
  assert.equal(t.some(k => ['s:0', 's:2', 's:3'].includes(k)), false);
  assert.equal(t.includes('s:4'), false);   // l1 plays TOR at 6:00 PM: locked
  assert.ok(t.includes('s:5'));
  const lockedBench = keys(2, B, { kind: 'bench', id: 'c5' });
  assert.equal(lockedBench.includes('s:0'), false);   // c1's game started
  assert.ok(lockedBench.includes('s:1'));
  // fixed occupant: his slot is never offered, he can't be selected
  const F = build(Object.assign({}, MOCK, { players: MOCK.players.map(p => p.id === 'l2' ? Object.assign({}, p, { secondary: true }) : p) }));
  assert.equal(keys(4, F.days[4].base, { kind: 'bench', id: 'c5' }, F).includes('s:5'), false);
  assert.deepEqual(keys(4, F.days[4].base, sl(5), F), []);
});

test('targetsFor: toir only when IR-eligible and IR has room (null cap = no cap); open slot offers bench and IR players who fit', () => {
  const B = M.days[4].base;
  assert.equal(keys(4, B, sl(6)).includes('toir'), false);   // IR holds d7 and d8: full
  const one = Object.assign(clone(B), { ir: ['d7'] });
  assert.ok(keys(4, one, sl(6)).includes('toir'));           // l3 is IR-eligible
  assert.equal(keys(4, one, sl(0)).includes('toir'), false); // c1 is not
  const N = Object.assign({}, M, { limits: Object.assign({}, M.limits, { ir: null }) });
  assert.ok([...T.targetsFor(N, 4, B, sl(6))].includes('toir'));
  const open = dropAt(B, 7), t = keys(4, open, sl(7));
  assert.ok(t.includes('b:c5') && t.includes('b:l5') && t.includes('i:l3') === false);   // l3 sits in slot 6, not IR
  assert.equal(t.includes('b:g3'), false);   // a goalie never fits an LW slot
  assert.ok(keys(4, open, sl(7)).every(k => k.startsWith('b:') || k.startsWith('i:')));
});

test('planClick: a bench player with an open slot starts there; with only playing occupants → pick; a not-playing occupant goes to reserve', () => {
  const B = M.days[3].base;
  const open = dropAt(B, 7), a = T.planClick(M, 3, open, 'l5');
  assert.equal(a.k, 'move'); assert.equal(a.L.s[7], 'l5'); assert.equal(a.text, 'Click: starts in LW (others shift slots)');   // lock-aware: Varga (6:00 PM) leaves Skt for a later D
  const pick = T.planClick(M, 3, B, 'd10');
  assert.equal(pick.k, 'pick'); assert.ok(pick.opts.length > 0 && pick.opts.every(o => o.s.includes('d10')));
  const idle = T.planClick(M, 3, B, 'l5');   // l3 is Out: not playing, so he sits
  assert.equal(idle.k, 'move'); assert.equal(idle.out, 'l3'); assert.equal(idle.L.s.includes('l3'), false); assert.equal(idle.L.s.includes('l5'), true);
  assert.match(idle.text, /^Click: starts in LW · Ryan Kask \(not playing\) to reserve \(others shift slots\)$/);   // lock-aware: Varga leaves Skt
  const res = T.planClick(M, 3, B, 'c1');
  assert.deepEqual([res.k, res.text, res.L.s[0]], ['move', 'Click: to reserve (his C slot opens)', null]);
  const shifted = T.planClick(M, 4, dropAt(M.days[4].base, 7), 'c6');   // c6 is C only; every C slot is full: c2 shifts to LW
  assert.equal(shifted.k, 'move'); assert.match(shifted.text, /^Click: starts in C \(others shift slots\)$/);
});

test('planClick off IR on a full roster pairs, and its text says who goes into IR', () => {
  const r = T.planClick(M, 4, M.days[4].base, 'd7');
  assert.equal(r.k, 'move'); assert.equal(r.text, 'Click: off IR to reserve · Ryan Kask (Out) into IR (roster stays at 26)');
  assert.deepEqual(r.L.ir.slice().sort(), ['d8', 'l3']); assert.equal(r.L.s.includes('l3'), false);
  const full = Object.assign(clone(M.days[4].base), { ir: ['d7', 'd8'] });
  const Z = build(Object.assign({}, MOCK, { players: MOCK.players.map(p => p.id === 'l3' || p.id === 'c4' ? Object.assign({}, p, { irElig: false }) : p) }));
  const b = T.planClick(Z, 4, full, 'd7');
  assert.equal(b.k, 'none'); assert.match(b.text, /^Roster full \(26\/26\): bringing Brett Okafor back needs a drop \((IR is full|nobody else can go into IR)\)/);
});

test('planClick on a locked player → k locked with lockWhy; on a fixed player → none', () => {
  const L = T.planClick(M, 2, M.days[2].base, 'c1');
  assert.deepEqual(L, { k: 'locked', text: 'Locked: ' + T.lockWhy(M, 2, 'c1') });
  assert.equal(T.planClick(M, 1, M.days[1].base, 'c2').k, 'locked');
  const F = build(Object.assign({}, MOCK, { players: MOCK.players.map(p => p.id === 'l2' ? Object.assign({}, p, { secondary: true }) : p) }));
  assert.deepEqual(T.planClick(F, 4, F.days[4].base, 'l2'), { k: 'none', text: "Eli Novak can't be moved here (Fantrax locks his slot)" });
});

test('toIR: only IR-eligible, unlocked, not fixed, with room; null cap = no cap', () => {
  const one = Object.assign(clone(M.days[4].base), { ir: ['d7'] });
  const r = T.toIR(M, 4, one, 'l3');
  assert.deepEqual([r.s[6], r.ir], [null, ['d7', 'l3']]);
  assert.equal(T.toIR(M, 4, one, 'c1'), null);               // not IR-eligible
  assert.equal(T.toIR(M, 4, M.days[4].base, 'l3'), null);    // IR full
  assert.equal(T.toIR(M, 2, M.days[2].base, 'l3'), null);    // l3 plays Wed at 6:00 PM: locked
  const N = Object.assign({}, M, { limits: Object.assign({}, M.limits, { ir: null }) });
  assert.deepEqual(T.toIR(N, 4, M.days[4].base, 'l3').ir, ['d7', 'd8', 'l3']);
});

test('allGamesPlan skips uncounted, locked and already-active days; asks where everyone plays', () => {
  const lineups = M.days.map(d => d.base), plan = T.allGamesPlan(M, lineups, 'c5');   // c5 games Wed(started? no: @LAK 9:30PM), Thu, Sat, Sun
  assert.deepEqual(plan.map(x => x.di), [2, 3, 5, 6]);
  assert.ok(plan.every(x => x.L && x.L.s.includes('c5')));
  const out = T.allGamesPlan(M, lineups, 'l5');   // l5: Wed @SEA 9:00 PM, Thu, Sat; l-slots hold l3 (Out) on Wed/Thu
  assert.deepEqual(out.map(x => x.di), [2, 3, 5]);
  assert.equal(T.allGamesPlan(M, lineups, 'c1').find(x => x.di === 0), undefined);   // Mon is played: locked
  assert.deepEqual(T.allGamesPlan(M, lineups, 'c4'), []);   // c4 is Out: his games never count
  const ask = T.allGamesPlan(M, lineups, 'd10').filter(x => x.ask);
  assert.ok(ask.length > 0);
  assert.equal(JSON.stringify(lineups), JSON.stringify(M.days.map(d => d.base)));
});

test('overNote reports only new overage, per group', () => {
  const base = M.days.map(d => d.base);
  assert.equal(T.overNote(M, base, base, 'skaters'), '');
  const small = Object.assign({}, M, { max: { skaters: 2, goalies: 7 } });
  const before = base.map(clone); before[3].s[7] = null;   // Thu's LW slot is open; filling it adds a counted skater game
  const after = base.map(clone);
  const note = T.overNote(small, before, after, 'skaters');
  assert.match(note, /^Puts skaters \d+ over the max: .+ won't count\.$/);
  assert.equal(T.overNote(small, after, before, 'skaters'), '');
  assert.equal(T.overNote(small, before, after, 'goalies'), '');
  assert.match(note, /Dane Whitlock Thu/);
  const tiny = Object.assign({}, M, { max: { skaters: 64, goalies: 1 } }), g = base.map(clone);
  g[3].s[19] = 'g3';   // already over before (g1, g2 count ... ) and after: the note names the latest
  assert.match(T.overNote(tiny, base, g, 'goalies'), /^Puts goalies \d+ over the max: .* (Mon|Tue|Wed|Thu|Fri|Sat|Sun)/);
});

test('planners never mutate the lineup they are given', () => {
  const B = M.days[4].base, open = dropAt(B, 7), before = frozen([B, open]);
  const sel = [sl(7), sl(1), { kind: 'bench', id: 'c5' }, { kind: 'ir', id: 'd7' }];
  for (const L of [B, open]) for (const s of sel) for (const k of T.targetsFor(M, 4, L, s)) { T.computeMove(M, 4, L, s, k); T.moveKind(M, 4, L, s, k); }
  for (const id of ['c5', 'c1', 'd7', 'd10', 'l5', 'g3']) { T.planClick(M, 4, B, id); T.planClick(M, 4, open, id); T.toIR(M, 4, B, id); }
  T.allGamesPlan(M, M.days.map(d => d.base), 'c5'); T.overNote(M, M.days.map(d => d.base), M.days.map(d => d.base), 'skaters');
  assert.deepEqual(frozen([B, open]), before);
});

// ---- Fill by FP/G
const withMax = (X, max) => Object.assign({}, X, { max });
const baseLineups = (X = M) => X.days.map(d => clone(d.base));
const overSize = (X, ls) => T.gameLedger(X, ls).over.size;

test('rankFpg: Fantrax\'s FP/G this season, whatever the GP (user 2026-10-18: no last season, no blend); no games ranks last', () => {
  const X = build(MOCK);
  assert.equal(T.rankFpg(X, 'c1'), 3.5);   // 2 GP: still this season's
  assert.equal(T.rankFpg(X, 'c4'), null);   // 0 GP this season (last season 3.1 is not used)
  X.players.c4.fpg = 0; assert.equal(T.rankFpg(X, 'c4'), null);   // Fantrax sends FP/G 0 with 0 GP
  const Y = build(MOCK);
  assert.equal(T.fpgText(Y, 'c1'), '3.5 FP/G');
  assert.equal(T.fpgText(Y, 'c4'), 'no games yet');
  const order = Y.order.slice().sort(T.byFpg(Y));
  assert.equal(order[0], 'g3');   // 6.0 this season at 2 GP: this season's number, whatever the GP
  const r = id => T.rankFpg(Y, id) ?? -1;
  for (let i = 1; i < order.length; i++) assert.ok(r(order[i - 1]) > r(order[i]) || (r(order[i - 1]) === r(order[i]) && Y.order.indexOf(order[i - 1]) < Y.order.indexOf(order[i])));
  assert.equal(T.rankFpg(Y, order[order.length - 1]), null);   // no games this season: last
});

test('suggestions fills open slots best FP/G first and stops at the games max (capped lists the rest)', () => {
  const ls = baseLineups(), before = frozen(ls);
  // Thu bench with a counted game, best FP/G this season first: g3 6.0, l5 5.5, d10 3.5, c5 2.0, r5 0.0. Skater room 2 (62 of 64), goalie room none (8 of 7).
  // The slots are full, so each start swaps out a Thu non-player (c4, l3); d10 (D) has nobody to replace.
  const r = T.suggestions(M, ls, 3);
  assert.deepEqual(frozen(ls), before);   // inputs untouched
  assert.deepEqual(r.moves, [{ in: 'l5', out: 'l3' }, { in: 'c5', out: 'c4' }]);
  assert.deepEqual(r.capped, ['g3', 'r5']);
  assert.deepEqual(r.stuck, ['d10']);
  assert.equal(r.msg, '2 moves on Thu 10/8. Stopped at the games max: Hugo Barre, Sam Ortiz also play. Ben Roy still needs a manual swap.');
  assert.equal(overSize(M, ls.map((L, i) => i === 3 ? r.L : L)), overSize(M, ls));
  // open slots are used before anyone is swapped out
  const open = ls.map(clone); open[3].s[open[3].s.indexOf('c4')] = null;
  assert.deepEqual(T.suggestions(M, open, 3).moves.find(m => m.in === 'c5'), { in: 'c5', out: null });
  // a bigger room takes more, still best first
  const X = withMax(M, { skaters: 66, goalies: 9 });
  const r2 = T.suggestions(X, ls, 3);
  assert.deepEqual(r2.moves.map(m => m.in), ['g3', 'l5', 'c5', 'r5']);
  assert.deepEqual(r2.capped, []);
  assert.equal(T.suggestions(withMax(M, { skaters: null, goalies: null }), ls, 3).capped.length, 0);
});

test('suggestions swaps out only a not-playing, unlocked occupant; never benches a player who plays', () => {
  const X = withMax(M, { skaters: null, goalies: null }), ls = baseLineups(X);
  for (const di of [2, 3, 4, 5, 6]) {
    const r = T.suggestions(X, ls, di);
    for (const m of r.moves) if (m.out) {
      assert.equal(T.counted(X, di, m.out), false); assert.equal(T.locked(X, di, m.out), false);
      assert.equal(T.where(X, di, r.L, m.out), 'R'); assert.equal(T.where(X, di, ls[di], m.out) === 'R', false);
    }
    for (const id of ls[di].s) if (id && T.counted(X, di, id)) assert.ok(r.L.s.includes(id), id + ' still plays on day ' + di);
  }
  // Wed (today): c3's game started, so a started non-player is not swapped out
  const wed = T.suggestions(X, ls, 2);
  for (const m of wed.moves) assert.equal(T.locked(X, 2, m.out), false);
});

test('suggestions never takes anyone out of IR', () => {
  const X = withMax(M, { skaters: null, goalies: null });
  const ls = baseLineups(X);
  for (const di of [2, 3, 4, 5, 6]) {
    const r = T.suggestions(X, ls, di);
    assert.deepEqual(r.L.ir, ls[di].ir);
    assert.ok(!r.moves.some(m => ls[di].ir.includes(m.in)));
  }
  const w = T.fillWeek(X, ls);
  w.lineups.forEach((L, di) => assert.deepEqual(L.ir, ls[di].ir));
});

test('suggestions skips unloaded and past days', () => {
  const ls = baseLineups();
  const r = T.suggestions(M, ls, 0);
  assert.deepEqual(r.moves, []); assert.deepEqual(frozen(r.L), frozen(ls[0]));
  assert.equal(r.msg, '0 moves on Mon 10/5.');
});

test('fillWeek gives the room under the max to the best FP/G across the week, then the earlier day', () => {
  const ls = baseLineups(), before = frozen(ls);
  // skater room 2: bench games by rank this season: l5 5.5 (Wed/Thu/Sat), d10 3.5, c5 2.0, ... => l5 on the earliest two days he can start
  const r = T.fillWeek(M, ls);
  assert.deepEqual(frozen(ls), before);
  assert.deepEqual(r.moves.map(m => m.in + '|' + m.di), ['l5|2', 'l5|3']);
  assert.ok(r.lineups[2].s.includes('l5') && r.lineups[3].s.includes('l5') && !r.lineups[5].s.includes('l5'));
  assert.ok(r.capped.length > 0);
  assert.match(r.msg, /^2 moves across the week\. Stopped at the games max; also playing: /);
  assert.ok(r.capped[0].includes(' ('));
  // room 3: l5 (5.5) has a third game, Sat, before anyone ranked lower
  const r3 = T.fillWeek(withMax(M, { skaters: 65, goalies: 7 }), ls);
  assert.deepEqual(r3.moves.map(m => m.in + '|' + m.di), ['l5|2', 'l5|3', 'l5|5']);   // best FP/G keeps winning the room, then the earlier day
});

test('Fill and Fill every day never push the ledger past the max', () => {
  for (const skaters of [0, 55, 62, 63, 64, 70, 100, null]) for (const goalies of [0, 5, 8, 9, null]) {
    const X = withMax(M, { skaters, goalies }), ls = baseLineups(X), n0 = overSize(X, ls);
    const w = T.fillWeek(X, ls);
    assert.equal(overSize(X, w.lineups), n0, 'fillWeek ' + skaters + '/' + goalies);
    for (let di = 0; di < 7; di++) {
      const r = T.suggestions(X, ls, di);
      assert.equal(overSize(X, ls.map((L, i) => i === di ? r.L : L)), n0, 'suggestions ' + skaters + '/' + goalies + ' day ' + di);
    }
    // fixed and locked things never change
    w.lineups.forEach((L, di) => { if (M.days[di].state === 'past') assert.deepEqual(L, ls[di]); });
  }
});

test('Fill never moves a fixed player and never takes one as a candidate', () => {
  const spec = Object.assign({}, MOCK, { players: MOCK.players.map(p => p.id === 'c5' ? Object.assign({}, p, { secondary: true }) : p) });
  const X = withMax(build(spec), { skaters: null, goalies: null }), ls = baseLineups(X);
  assert.ok('c5' in X.days[3].fixed);
  const w = T.fillWeek(X, ls);
  assert.ok(!w.moves.some(m => m.in === 'c5' || m.out === 'c5'));
  w.lineups.forEach((L, di) => assert.equal(T.where(X, di, L, 'c5'), T.where(X, di, ls[di], 'c5')));
});


// ---- the save gate
// C: the mock with Simon Ruud (d8) and Brett Okafor (d7) IR-eligible all week, so every base lineup is legal.
const C = build(Object.assign({}, MOCK, { players: MOCK.players.map(p => p.id === 'd8' || p.id === 'd7' ? Object.assign({}, p, { irElig: true }) : p) }));
const fmEq = (X, di, A, B) => T.sameFieldMap(T.fieldMapOf(X, di, A), T.fieldMapOf(X, di, B));

test('savePlan refuses a played day', () => {
  assert.deepEqual(T.savePlan(C, 1, C.days[1].base), { none: true });
  const L = clone(C.days[1].base); L.s[0] = null;
  const sp = T.savePlan(C, 1, L);
  assert.equal(sp.ok, false);
  assert.equal(sp.why, "Tue 10/6 has already been played: it can't be changed.");
});

test('savePlan drops a move whose player has since locked and saves the rest', () => {
  const B = C.days[2].base, L = clone(B);   // Wed 7:15 PM: c1 (6:00 PM) locked, c2 (9:00 PM) and c5 (9:30 PM) not
  assert.equal(B.s[0], 'c1'); assert.equal(B.s[1], 'c2');
  L.s[0] = null; L.s[1] = 'c5';            // c1 to reserve (can't happen any more), c5 for c2 (fine)
  const sp = T.savePlan(C, 2, L);
  assert.equal(sp.ok, true); assert.deepEqual(sp.errors, []); assert.deepEqual(sp.dropped, ['c1']);
  assert.equal(sp.L.s[0], 'c1'); assert.equal(sp.L.s[1], 'c5'); assert.equal(sp.nothingLeft, false);
  assert.deepEqual(T.withoutLockedMoves(C, 2, L).dropped, ['c1']);
  assert.deepEqual(T.withoutLockedMoves(C, 3, C.days[3].base), { L: clone(C.days[3].base), dropped: [] });
});

test('savePlan holds the day when a dropped locked move collides with another move', () => {
  const L = clone(C.days[2].base); L.s[0] = 'c5';   // c5 takes the slot c1 (locked) still holds on Fantrax
  assert.deepEqual(T.withoutLockedMoves(C, 2, L), { L: null, dropped: ['c1'] });
  const sp = T.savePlan(C, 2, L);
  assert.equal(sp.ok, false); assert.deepEqual(sp.dropped, ['c1']);
  assert.equal(sp.why, "A move you made can't happen any more (Nolan Pryce's game started at 6:00 PM), and other moves that day depend on it. Re-check Wed.");
});

test('savePlan: a same-type slot shuffle is nothing to save', () => {   // the mock's second bug
  const L = clone(C.days[3].base); [L.s[0], L.s[1]] = [L.s[1], L.s[0]];
  assert.deepEqual(T.savePlan(C, 3, L), { none: true });
  const W = clone(C.days[2].base); [W.s[0], W.s[2]] = [W.s[2], W.s[0]];   // c1 and c3, both locked, trade C slots
  assert.deepEqual(T.savePlan(C, 2, W), { none: true });
});

test('savePlan: nothing left after dropping locked moves → nothingLeft, not ok', () => {
  const L = clone(C.days[2].base); L.s[0] = null;   // only c1 to reserve, and c1 is locked
  const sp = T.savePlan(C, 2, L);
  assert.equal(sp.ok, false); assert.equal(sp.nothingLeft, true); assert.deepEqual(sp.dropped, ['c1']); assert.deepEqual(sp.errors, []);
  assert.ok(fmEq(C, 2, sp.L, C.days[2].base));
});

test('savePlan never blocks on warnings (Out player started, over the games max)', () => {
  const L = clone(C.days[3].base); L.s[L.s.indexOf('r2')] = null; L.s[18] = 'r2';   // r2 (suspended, plays Thu) RW to Skt; d6 to reserve
  assert.deepEqual(C.days.map((d, i) => T.dayErrors(C, i, d.base)), C.days.map(() => []));
  assert.deepEqual(T.dayWarnings(C, 3, L), ["Isaac Lund starts but won't count (suspended)."]);
  assert.equal(T.savePlan(C, 3, L).ok, true);
  const X = Object.assign({}, C, { max: { skaters: 1, goalies: 1 } }), S = clone(X.days[3].base); S.s[0] = 'c5';
  assert.ok(T.gameLedger(X, X.days.map((d, i) => i === 3 ? S : d.base)).over.size > 0);
  assert.equal(T.savePlan(X, 3, S).ok, true);
});

test('savePlan refuses a day with no lineup loaded', () => {
  const X = Object.assign({}, C, { days: C.days.map((d, i) => i === 3 ? Object.assign({}, d, { slots: null, base: { s: [], ir: [] }, rows: {} }) : d) });
  assert.deepEqual(T.savePlan(X, 3, { s: [], ir: [] }), { none: true });
  const sp = T.savePlan(X, 3, { s: ['c1'], ir: [] });
  assert.equal(sp.ok, false); assert.equal(sp.why, "Thu 10/8's lineup isn't loaded: it can't be saved.");
});

const pendingWeek = () => {
  const ls = baseLineups(C);
  ls[1].s[0] = null;            // played day: refused
  ls[3].s[0] = 'c5';            // c5 for c1 Thu: legal
  ls[4].s[1] = 'c1';            // c1 twice Fri: illegal
  ls[6].s[0] = 'c5';            // Sun, the period's last day: legal
  return ls;
};

test('saveRequests: date order, false everywhere, true only on the last day when kept', () => {
  const ls = pendingWeek(), req = T.saveRequests(C, ls, false);
  assert.deepEqual(req.map(r => r.di), [3, 6]);
  assert.deepEqual(req.map(r => r.applyToFuturePeriods), [false, false]);
  req.forEach(r => { assert.equal(r.n, C.days[r.di].n); assert.ok(Number.isInteger(r.n)); assert.deepEqual(r.fieldMap, T.fieldMapOf(C, r.di, ls[r.di])); });
  assert.deepEqual(r0(T.saveRequests(C, ls, true)), [[3, false], [6, true]]);
  ls[6] = clone(C.days[6].base);   // the last day no longer saves: nothing carries forward
  assert.deepEqual(r0(T.saveRequests(C, ls, true)), [[3, false]]);
});
const r0 = req => req.map(r => [r.di, r.applyToFuturePeriods]);

test('keepLastShown only when the period\'s last day will save', () => {
  const ls = pendingWeek();
  assert.equal(T.keepLastShown(C, ls), true);
  ls[6] = clone(C.days[6].base);
  assert.equal(T.keepLastShown(C, ls), false);
  ls[6].s[1] = 'c1';   // illegal on the last day
  assert.equal(T.keepLastShown(C, ls), false);
});

// ---- Task 7: pending moves that survive refreshes
const EARLY = { d: 0, m: 9 * 60 }, THU = { d: 3, m: 12 * 60 };
const memStorage = () => { const m = new Map(); return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), m }; };
// Mon 9:00 AM edit on day di: slot 0 (Nolan Pryce) to the bench
const benchC1 = (X, di) => { const L = X.days[di].base, N = T.computeMove(X, di, L, { kind: 'slot', i: 0 }, 'tobench'); assert.equal(N.s[0], null); return N; };
const lineupsOf = (X, edits) => X.days.map((d, di) => edits[di] || clone(d.base));

test('pendingFrom → reapply on the same data gives back the same lineups and no conflicts', () => {
  const X = build(Object.assign({}, MOCK, { now: EARLY }));
  const ls = lineupsOf(X, { 4: benchC1(X, 4), 5: benchC1(X, 5) });
  const st = T.pendingFrom(X, ls, null);
  assert.equal(st.v, 1); assert.deepEqual(Object.keys(st.days), [X.days[4].day, X.days[5].day]);
  const r = T.reapply(X, st);
  assert.deepEqual(r.conflicts, []);
  r.lineups.forEach((L, di) => assert.ok(T.sameFieldMap(T.fieldMapOf(X, di, L), T.fieldMapOf(X, di, ls[di])), 'day ' + di));
  assert.deepEqual(T.pendingFrom(X, lineupsOf(X, {}), null), { v: 1, days: {} });
});

test('reapply: a played day\'s moves become conflicts', () => {
  const X = build(Object.assign({}, MOCK, { now: EARLY })), st = T.pendingFrom(X, lineupsOf(X, { 1: benchC1(X, 1), 4: benchC1(X, 4) }), null);
  const Y = build(Object.assign({}, MOCK, { now: THU })), r = T.reapply(Y, st);
  assert.deepEqual(r.conflicts, [{ di: 1, id: 'c1', reason: 'Tue 10/6 has already been played' }]);
  assert.deepEqual(r.lineups[1], Y.days[1].base);
  assert.equal(T.where(Y, 4, r.lineups[4], 'c1'), 'R');   // the Fri move still stands
  assert.equal(r.lineups.length, 7);
});

test('reapply: a player moved on Fantrax since is a conflict; one already moved there is not', () => {
  const X = build(Object.assign({}, MOCK, { now: EARLY })), st = T.pendingFrom(X, lineupsOf(X, { 4: benchC1(X, 4) }), null);
  const there = build(Object.assign({}, MOCK, { now: EARLY, base: MOCK.base.map((id, i) => i === 0 ? null : id) }));   // c1 already on the bench
  assert.deepEqual(T.reapply(there, st).conflicts, []);
  assert.equal(T.where(there, 4, T.reapply(there, st).lineups[4], 'c1'), 'R');
  const moved = build(Object.assign({}, MOCK, { now: EARLY, base: MOCK.base.map((id, i) => i === 0 ? null : i === 18 ? 'c1' : id) }));   // c1 now in the Skt slot
  const r = T.reapply(moved, st);
  assert.deepEqual(r.conflicts, [{ di: 4, id: 'c1', reason: 'changed on Fantrax since' }]);
  assert.deepEqual(r.lineups[4], moved.days[4].base);
});

test('reapply: a player dropped since is a conflict "no longer on the roster"', () => {
  const X = build(Object.assign({}, MOCK, { now: EARLY })), st = T.pendingFrom(X, lineupsOf(X, { 4: benchC1(X, 4) }), null);
  const Y = build(Object.assign({}, MOCK, { now: EARLY, players: MOCK.players.map(p => p.id === 'c1' ? Object.assign({}, p, { until: 3 }) : p) }));
  const r = T.reapply(Y, st);
  assert.deepEqual(r.conflicts, [{ di: 4, id: 'c1', reason: 'no longer on the roster' }]);
});

test('pendingFrom keeps the first base of a day across later edits', () => {
  const X = build(Object.assign({}, MOCK, { now: EARLY })), a = T.pendingFrom(X, lineupsOf(X, { 4: benchC1(X, 4) }), null), k = X.days[4].day;
  const L2 = T.computeMove(X, 4, benchC1(X, 4), { kind: 'slot', i: 1 }, 'tobench');
  const b = T.pendingFrom(X, lineupsOf(X, { 4: L2 }), a);
  assert.deepEqual(b.days[k].base, a.days[k].base); assert.notDeepEqual(b.days[k].intended, a.days[k].intended);
  assert.deepEqual(T.pendingFrom(X, lineupsOf(X, {}), b), { v: 1, days: {} });   // moved back to base: nothing pending
});

test('reapply: a move that no longer fits is "no room left for this move"; an unloaded day keeps its entry as conflicts', () => {
  const X = build(Object.assign({}, MOCK, { now: EARLY })), k = X.days[4].day;
  const st = { v: 1, days: { [k]: { base: T.fieldMapOf(X, 4, X.days[4].base), intended: Object.assign({}, T.fieldMapOf(X, 4, X.days[4].base), { c5: { posId: '206', stId: '1' } }) } } };
  const r = T.reapply(X, st);   // all four C slots are taken
  assert.deepEqual(r.conflicts, [{ di: 4, id: 'c5', reason: 'no room left for this move' }]);
  assert.deepEqual(r.lineups[4], X.days[4].base);
  const Z = build(Object.assign({}, MOCK, { now: EARLY })); Z.days[4] = Object.assign({}, Z.days[4], { slots: null, base: { s: [], ir: [] } });
  const u = T.reapply(Z, st);
  assert.deepEqual(u.conflicts, [{ di: 4, id: 'c5', reason: "Fri 10/9's lineup isn't loaded" }]);
});

test('pending storage: sessionStorage wrappers, silent without it', () => {
  assert.equal(T.pendingKey('L', 'T', 7), 'fgt-pending|L|T|7');
  assert.equal(T.loadPending('k'), null); T.savePending('k', { v: 1, days: { a: 1 } }); T.clearPendingDays('k', ['a']);   // no sessionStorage in Node: no throw
  const S = memStorage(); globalThis.sessionStorage = S;
  try {
    T.savePending('k', { v: 1, days: { a: { base: {}, intended: {} }, b: { base: {}, intended: {} } } });
    assert.deepEqual(Object.keys(T.loadPending('k').days), ['a', 'b']);
    T.clearPendingDays('k', ['a']); assert.deepEqual(Object.keys(T.loadPending('k').days), ['b']);
    T.clearPendingDays('k', ['b']); assert.equal(S.m.has('k'), false);
    S.setItem('k', 'not json'); assert.equal(T.loadPending('k'), null);
  } finally { delete globalThis.sessionStorage; }
});

test('targetsFor: nothing on a played day, an unloaded day, or for a locked or fixed player', () => {
  const L = clone(M.days[2].base);
  assert.equal(T.targetsFor(M, 1, M.days[1].base, { kind: 'slot', i: 0 }).size, 0);   // played day
  assert.equal(T.targetsFor(M, 2, L, { kind: 'slot', i: 0 }).size, 0);                // Nolan Pryce's game started
  assert.equal(T.targetsFor(M, 2, L, { kind: 'bench', id: 'c1' }).size, 0);
  assert.ok(T.targetsFor(M, 3, M.days[3].base, { kind: 'slot', i: 0 }).size > 0);
  const Z = build(MOCK); Z.days[4] = Object.assign({}, Z.days[4], { slots: null, base: { s: [], ir: [] } });
  assert.equal(T.targetsFor(Z, 4, { s: [], ir: [] }, { kind: 'bench', id: 'c5' }).size, 0);
});

test('reapply: a player who does not move is never benched by a mover that comes earlier in the roster order', () => {
  const Y = build(Object.assign({}, MOCK, { base: ['c1', 'c3', 'c4', 'c5'].concat(MOCK.base.slice(4)) }));   // Wed 7:15 PM: c3 (locked) in a C slot, c2 on the bench
  const fm = T.fieldMapOf(Y, 2, Y.days[2].base), k = Y.days[2].day;
  assert.equal(T.locked(Y, 2, 'c3'), true); assert.equal(T.where(Y, 2, Y.days[2].base, 'c2'), 'R');
  const r = T.reapply(Y, { v: 1, days: { [k]: { base: fm, intended: Object.assign({}, fm, { c2: { posId: '206', stId: '1' } }) } } });
  assert.deepEqual(r.conflicts, [{ di: 2, id: 'c2', reason: 'no room left for this move' }]);
  assert.equal(T.where(Y, 2, r.lineups[2], 'c3'), '206'); assert.equal(T.where(Y, 2, r.lineups[2], 'c2'), 'R');
  assert.ok(T.sameFieldMap(T.fieldMapOf(Y, 2, r.lineups[2]), fm));
});

test('conflicts survive reapply -> pendingFrom(prev, conflicts) -> reapply, and a day holding only conflicts is kept', () => {
  const X = build(Object.assign({}, MOCK, { now: EARLY })), st = T.pendingFrom(X, lineupsOf(X, { 1: benchC1(X, 1) }), null);
  const Y = build(Object.assign({}, MOCK, { now: THU })), r1 = T.reapply(Y, st);
  assert.equal(r1.conflicts.length, 1);
  const st2 = T.pendingFrom(Y, r1.lineups, st, r1.conflicts);
  assert.deepEqual(Object.keys(st2.days), [Y.days[1].day]);   // only conflicts: not pruned
  assert.deepEqual(T.reapply(Y, st2).conflicts, r1.conflicts);
  const ls = r1.lineups.map(clone); ls[5] = benchC1(Y, 5);   // the user then edits another day
  const st3 = T.pendingFrom(Y, ls, st2, r1.conflicts), r3 = T.reapply(Y, st3);
  assert.deepEqual(r3.conflicts, r1.conflicts); assert.deepEqual(Object.keys(st3.days), [Y.days[1].day, Y.days[5].day]);
  assert.equal(T.where(Y, 5, r3.lineups[5], 'c1'), 'R');
  assert.deepEqual(T.pendingFrom(Y, r1.lineups, st2, []).days, {});   // without them (discarded) the day goes
});

// ---- Task 10: the panel's pure view helpers
test('dayHref: the day\'s roster page, with the teamId only when the route carries one', () => {
  assert.equal(T.dayHref({ leagueId: 'lg1', teamId: null }, 7), '/fantasy/league/lg1/team/roster;period=7');
  assert.equal(T.dayHref({ leagueId: 'lg1', teamId: 'tm9' }, 12), '/fantasy/league/lg1/team/roster;period=12;teamId=tm9');
});

test('meterView: played + scheduled = total, delta from the base lineups, over = total - max', () => {
  const base = M.days.map(d => clone(d.base)), led = T.gameLedger(M, base).skaters;
  const v = T.meterView(M, base, base, 'skaters');
  assert.deepEqual(v, { played: led.filter(e => e.played).length, sched: led.filter(e => !e.played).length, total: led.length, max: 64, delta: 0, over: led.length - 64 });
  assert.ok(v.played > 0 && v.sched > 0 && v.over < 0);
  const sg = T.suggestions(M, base, 3), after = base.slice(); after[3] = sg.L;
  assert.ok(sg.moves.length > 0);
  const w = T.meterView(M, after, base, 'skaters');
  assert.equal(w.delta, sg.moves.filter(m => !T.isGoalie(M, m.in)).length);
  assert.equal(w.total, v.total + w.delta); assert.equal(w.played, v.played);
  const small = build(Object.assign({}, MOCK, { max: { skaters: 10, goalies: null } }));
  const sb = small.days.map(d => clone(d.base)), s = T.meterView(small, sb, sb, 'skaters');
  assert.equal(s.over, s.total - 10); assert.ok(s.over > 0);
  assert.deepEqual(T.meterView(small, sb, sb, 'goalies').max, null);
  assert.equal(T.meterView(small, sb, sb, 'goalies').over, null);
});

test('dayHeadView: games, players outside IR / max, empty and open skater slots, Fill N = suggestions', () => {
  const base = M.days.map(d => clone(d.base));
  const mon = T.dayHeadView(M, base, 0);
  assert.deepEqual(mon, { games: 5, rosterN: 25, rosterMax: 26, idle: 14, open: 1, fillN: 0, fillTip: '', state: 'past', locked: false });   // played: no Fill
  const thu = T.dayHeadView(M, base, 3), sg = T.suggestions(M, base, 3);
  assert.equal(thu.fillN, sg.moves.length); assert.ok(thu.fillN > 0);
  assert.equal(thu.fillTip.split('\n').length, thu.fillN);
  const m0 = sg.moves[0];
  assert.equal(thu.fillTip.split('\n')[0], '+ ' + M.players[m0.in].name + ' (' + T.fpgText(M, m0.in) + ')' + (m0.out ? ' for ' + M.players[m0.out].name : ''));
  assert.equal(thu.state, 'future'); assert.equal(thu.rosterN, T.rosterCount(M, 3, base[3]));
  assert.equal(T.dayHeadView(M, base, 2).state, 'today');
});

test('dayHeadView: a day whose lineup was not loaded has nothing to count', () => {
  const { team, extras, now, opts } = mkTeam(MOCK);
  delete team.lineups[team.period.days[5]];
  const N = T.buildEditModel(team, extras, now, opts), base = N.days.map(d => clone(d.base));
  assert.deepEqual(T.dayHeadView(N, base, 5), { games: 0, rosterN: null, rosterMax: 26, idle: 0, open: 0, fillN: 0, fillTip: '', state: 'future', locked: false });
});

// ---- Task 11: Columns view rows
test('columnBench: reserve players, with a game first then roster order; read-only lists only those with a game', () => {
  const base = M.days.map(d => clone(d.base));
  assert.deepEqual(T.columnBench(M, 0, base[0], true), ['c5', 'l5', 'r5', 'd10', 'g3']);   // Mon: nobody on reserve plays
  assert.deepEqual(T.columnBench(M, 0, base[0], false), []);
  assert.deepEqual(T.columnBench(M, 3, base[3], false), ['c5', 'l5', 'r5', 'd10', 'g3']);   // Thu: all five have a game
  const L = clone(base[3]); L.s[0] = null;   // c1 to reserve: he plays Thu, so he sorts among the players with a game, by roster order
  assert.deepEqual(T.columnBench(M, 3, L, true), ['c1', 'c5', 'l5', 'r5', 'd10', 'g3']);
});

test('columnBench: a played day lists its reserve games by the flag rule, not by GP (as 1.3.7 weekView)', () => {
  const base = M.days.map(d => clone(d.base));
  assert.deepEqual(T.columnBench(M, 1, base[1], false), ['r5', 'd10']);   // Tue is past; their GP is 0 (benched), the games still show
  const g = M.players.r5.row.games.find(x => x.day === M.days[1].day);
  assert.deepEqual(T.benchGame(M, M.players.r5.row, g), { counted: true, by: 'flag' });
  assert.deepEqual(T.columnBench(M, 1, base[1], false).sort(), T.weekView(mkTeam(MOCK).team, mkTeam(MOCK).now, mkTeam(MOCK).opts).days[1].bench.map(b => b.id).sort());   // same players as 1.3.7 (it ordered them by start time)
});

test('offRowNote: back carries the date, cleared says no longer eligible', () => {
  assert.deepEqual(T.offRowNote({ kind: 'back', short: 'IR', date: '2026-10-08' }), { text: 'IR 10/8', title: 'IR: back Thu 10/8' });
  assert.deepEqual(T.offRowNote({ kind: 'cleared', short: 'IR', date: null }), { text: 'IR', title: 'no longer IR-eligible' });
});

test('columnRows: every column pads to the most slots, reserve rows and IR rows over the days', () => {
  const base = M.days.map(d => clone(d.base));
  assert.deepEqual(T.columnRows(M, base), { slots: 21, reserve: 5, ir: 2 });   // IR: the league's 2 places
  assert.deepEqual(T.columnRows(M, base, false), { slots: 21, reserve: 5, ir: 2 });
  const more = base.map(clone); more[3].s[0] = null;   // one more on reserve Thursday
  more[4].ir.push('c5');   // a third in IR Friday: past the 2 places, the column grows
  assert.deepEqual(T.columnRows(M, more), { slots: 21, reserve: 6, ir: 3 });
  const bare = base.map(clone); bare[1].s[0] = null;   // Tue c1 to reserve; he has no game Tue
  assert.equal(T.columnRows(M, bare).reserve, 6); assert.equal(T.columnRows(M, bare, false).reserve, 5);
});

test('columnRows: an unloaded day adds no rows; no IR limit means the longest IR list', () => {
  const { team, extras, now, opts } = mkTeam(MOCK);
  delete team.lineups[team.period.days[5]]; extras.limits = { total: null, ir: null, irCountsTowardTotal: false };
  const N = T.buildEditModel(team, extras, now, opts), base = N.days.map(d => clone(d.base));
  assert.deepEqual(T.columnRows(N, base), { slots: 21, reserve: 5, ir: 2 });
});

// ---- Task 10 fix round 1: the controller's sync (page code, exported for these tests)
const ROUTE = { page: 'roster', leagueId: 'lg1', teamId: null, period: null, day: null, view: null };
const withPage = fn => {
  globalThis.sessionStorage = memStorage(); globalThis.location = { href: 'https://www.fantrax.com/fantasy/league/lg1/team/roster' };
  try { fn(); } finally { delete globalThis.sessionStorage; delete globalThis.location; Object.assign(T.EDIT, { key: null, pkey: null, editing: false, undo: [] }); }
};

test('syncEdit: a stored move already on Fantrax is pruned from storage, so the refresh is not paused', () => withPage(() => {
  const { team, now, opts } = mkTeam(MOCK);
  const X = T.buildEditModel(team, null, now, opts), day = X.days[3].day, fm = T.fieldMapOf(X, 3, X.days[3].base);
  const base = Object.assign({}, fm, { c1: { posId: fm.c1.posId, stId: '2' } });   // stored when c1 was on reserve; Fantrax has him active now
  const pkey = T.pendingKey('lg1', team.teamId, team.period.id);
  T.savePending(pkey, { v: 1, days: { [day]: { base, intended: fm } } });
  T.syncEdit(ROUTE, team, 'K1', now, opts);
  assert.equal(T.EDIT.conflicts.length, 0); assert.equal(T.pendingCount(), 0);
  assert.equal(T.loadPending(pkey), null);
  assert.equal(T.editPaused(), false);
}));

test('syncEdit: editing ends when no loaded day is left to edit (same key)', () => withPage(() => {
  const { team, now, opts } = mkTeam(MOCK);
  T.syncEdit(ROUTE, team, 'K1', now, opts); T.EDIT.editing = true;
  T.syncEdit(ROUTE, team, 'K1', now, opts); assert.equal(T.EDIT.editing, true);
  T.syncEdit(ROUTE, team, 'K1', new Date(2026, 9, 20, 12), opts);   // the whole period played
  assert.equal(T.EDIT.editing, false); assert.equal(T.editPaused(), false);
}));

test('syncEdit: a new pending key under the same render key (period rollover) resets editing and undo', () => withPage(() => {
  const { team, now, opts } = mkTeam(MOCK);
  T.syncEdit(ROUTE, team, 'K1', now, opts); Object.assign(T.EDIT, { editing: true, undo: [null] });
  const next = Object.assign({}, team, { period: Object.assign({}, team.period, { id: 2 }) });
  T.syncEdit(ROUTE, next, 'K1', now, opts);
  assert.equal(T.EDIT.editing, false); assert.deepEqual(T.EDIT.undo, []);
  assert.equal(T.EDIT.pkey, T.pendingKey('lg1', team.teamId, 2));
}));

// ---- Task 12: the grid's cell model and the hover preview
test('gridCell: kind, slot letter, lock and changed for every state a grid cell can be in', () => {
  const B = M.days.map(d => clone(d.base));
  assert.deepEqual(T.gridCell(M, B, 3, 'c1'), { kind: 'play', slot: 'C', locked: false, over: false, changed: false, tag: null });
  assert.deepEqual(T.gridCell(M, B, 6, 'c1'), { kind: 'idle', slot: 'C', locked: false, over: false, changed: false, tag: null });   // active, no game
  assert.deepEqual(T.gridCell(M, B, 3, 'c4'), { kind: 'idle', slot: 'C', locked: false, over: false, changed: false, tag: null });   // active but Out: his game does not count
  assert.equal(T.gridCell(M, B, 0, 'c5').kind, 'benchNo');      // reserve, no game Mon
  assert.equal(T.gridCell(M, B, 3, 'c5').kind, 'benchGame');    // reserve with a game Thu
  assert.equal(T.gridCell(M, B, 3, 'c5').slot, null);
  assert.deepEqual(T.gridCell(M, B, 0, 'd7'), { kind: 'ir', slot: null, locked: true, over: false, changed: false, tag: null });   // Mon is played
  assert.equal(T.gridCell(M, B, 3, 'd7').kind, 'ir'); assert.equal(T.gridCell(M, B, 3, 'd7').locked, false);
  assert.equal(T.gridCell(M, B, 1, 'r4').kind, 'off');          // not on the roster yet
  assert.equal(T.gridCell(M, B, 2, 'c1').locked, true);         // today, his game started
  assert.equal(T.gridCell(M, B, 2, 'c2').locked, false);
  const L = clone(B[3]); L.s[0] = null;                          // c1 to reserve on Thu
  assert.equal(T.gridCell(M, B.map((x, i) => i === 3 ? L : x), 3, 'c1').changed, true);
  assert.equal(T.gridCell(M, B.map((x, i) => i === 3 ? L : x), 3, 'c1').kind, 'benchGame');
  assert.equal(T.gridCell(M, B.map((x, i) => i === 3 ? L : x), 3, 'l1').changed, false);
});

test('gameTag: one rule for both views — the injury tag before the return date, RET from it (Grid showed OUT all week, 2026-10-05)', () => {
  const F = build(MOCK), base = F.days.map(d => d.base);
  F.players.c4.row.tag = { text: 'OUT', kind: 'out', tip: 'Lower body - Out' };   // Owen Baird: Out, expected back Fri (day 4), active all week
  F.players.c4.row.returnText = 'Expected to return on Fri Oct 9';
  const tags = [1, 3, 4, 6].map(di => T.gameTag(F, di, base[di], 'c4'));
  assert.deepEqual(tags.map(t => t && t.text), ['OUT', 'OUT', 'RET', 'RET']);
  assert.deepEqual(tags.map(t => t && t.kind), ['out', 'out', 'ret', 'ret']);
  assert.match(tags[2].title, /Expected to return on Fri Oct 9/);
  assert.equal(T.gameTag(F, 2, base[2], 'c4'), null);   // no game Wednesday, not on IR: no tag
  assert.deepEqual([1, 4].map(di => T.gridCell(F, base, di, 'c4').tag.text), ['OUT', 'RET']);   // the grid cell carries the same tag
  assert.equal(T.gameTag(F, 1, base[1], 'c1'), null);   // a healthy player: no tag
});

test('gridCell: over = the game is past the games max (ledger), and a passed-in ledger is used as is', () => {
  const M3 = build(Object.assign({}, MOCK, { max: { skaters: 62, goalies: 7 } })), B = M3.days.map(d => clone(d.base));
  const led = T.gameLedger(M3, B);
  assert.ok(led.over.size >= 1);
  let n = 0;
  for (let di = 0; di < 7; di++) for (const id of M3.order) {
    const c = T.gridCell(M3, B, di, id); assert.equal(c.over, led.over.has(di + '|' + id)); if (c.over) { n++; assert.equal(c.kind, 'play'); }
  }
  assert.equal(n, led.over.size);
  assert.equal(T.gridCell(M3, B, 3, 'c1', { over: new Set(['3|c1']) }).over, true);
});

test('previewDiff: what one click changes in that day, the clicked player marked self', () => {
  const B = M.days.map(d => clone(d.base)), L = B[3];
  const start = T.planClick(M, 3, L, 'c5');   // a bench player with a game: starts, someone not playing sits (or an open slot)
  assert.equal(start.k, 'move');
  const dd = T.previewDiff(M, L, start.L, 3, 'c5');
  assert.deepEqual(dd.find(x => x.id === 'c5'), { id: 'c5', to: 'slot', self: true });
  assert.ok(dd.every(x => x.id === 'c5' || x.self === false));
  if (start.out) assert.deepEqual(dd.find(x => x.id === start.out), { id: start.out, to: 'bench', self: false });
  const bench = T.planClick(M, 3, L, 'c1');
  assert.deepEqual(T.previewDiff(M, L, bench.L, 3, 'c1'), [{ id: 'c1', to: 'bench', self: true }]);
  assert.deepEqual(T.previewDiff(M, L, L, 3, 'c1'), []);
  const L2 = { s: L.s, ir: ['d7'] }, ir = T.toIR(M, 3, L2, 'c4');   // one IR place free
  assert.deepEqual(T.previewDiff(M, L2, ir, 3, 'c4'), [{ id: 'c4', to: 'ir', self: true }]);
  assert.equal(T.previewDiff(M, L, bench.L, 3).find(x => x.id === 'c1').self, false);   // no id given: nobody is self
});

// ---- Task 13: Review & save, banners
const withLs = (X, edits) => X.days.map((d, di) => edits[di] || clone(d.base));

test('reviewView: Fantrax\'s words per move, a dropped locked move marked with lockWhy, untouched days left out', () => {
  const L = clone(C.days[2].base); L.s[0] = null; L.s[1] = 'c5';   // c1 (locked) to reserve, c5 for c2
  const v = T.reviewView(C, withLs(C, { 2: L }), []);
  assert.deepEqual(v, [{ di: 2, label: 'Wed 10/7', ok: true, lines: [
    { text: "Nolan Pryce: Active to Reserve — dropped: Nolan Pryce's game started at 6:00 PM", bad: true },
    { text: 'Theo Marsh: Active to Reserve' },
    { text: 'Luca Ferris: Reserve to Active (C)' },
  ] }]);
  assert.deepEqual(T.reviewView(C, baseLineups(C), []), []);
});

test('reviewView: nothing left after the dropped move → not ok, with the nothing-left line', () => {
  const L = clone(C.days[2].base); L.s[0] = null;
  const [d] = T.reviewView(C, withLs(C, { 2: L }), []);
  assert.equal(d.ok, false);
  assert.deepEqual(d.lines, [
    { text: "Nolan Pryce: Active to Reserve — dropped: Nolan Pryce's game started at 6:00 PM", bad: true },
    { text: "Nothing left to save: every move that day can't happen any more.", bad: true },
  ]);
});

test('reviewView: a conflict is listed with its reason on its day, even with no move left there', () => {
  const v = T.reviewView(C, baseLineups(C), [{ di: 3, id: 'c1', reason: 'changed on Fantrax since' }, { di: 4, id: 'd2', reason: 'no longer on the roster' }]);
  assert.deepEqual(v, [
    { di: 3, label: 'Thu 10/8', ok: false, lines: [{ text: "Nolan Pryce: can't happen any more (changed on Fantrax since)", bad: true }] },
    { di: 4, label: 'Fri 10/9', ok: false, lines: [{ text: "Matt Sorensen: can't happen any more (no longer on the roster)", bad: true }] },
  ]);
});

test('reviewView: a warning never blocks; Would be illegal and why lines do', () => {
  const W = clone(C.days[3].base); W.s[W.s.indexOf('r2')] = null; W.s[18] = 'r2';   // r2 (suspended) RW to Skt; d6 to reserve
  const I = clone(C.days[4].base); I.s[1] = 'c1';                                       // c1 twice on Fri
  const P = clone(C.days[1].base); P.s[0] = null;                                       // a played day
  const v = T.reviewView(C, withLs(C, { 1: P, 3: W, 4: I }), []);
  assert.deepEqual(v.map(d => [d.di, d.ok]), [[1, false], [3, true], [4, false]]);
  assert.deepEqual(v[0].lines.filter(x => x.bad), [{ text: "Tue 10/6 has already been played: it can't be changed.", bad: true }]);
  assert.deepEqual(v[1].lines.filter(x => x.warn), [{ text: "Isaac Lund starts but won't count (suspended).", warn: true }]);
  assert.ok(v[1].lines.every(x => !x.bad));
  assert.ok(v[2].lines.some(x => x.bad && x.text === 'Would be illegal: Nolan Pryce is in two places.'));
  assert.equal(v.filter(d => d.ok).length, T.saveRequests(C, withLs(C, { 1: P, 3: W, 4: I }), false).length);   // Save N days = what is sent
});

test('banners: roster over the limit on unplayed days, with each day\'s count', () => {
  const off = di => { const L = clone(C.days[di].base); L.ir = L.ir.filter(x => x !== 'd7'); return L; };   // d7 out of IR: 27 outside IR
  assert.deepEqual(T.banners(C, baseLineups(C)), []);
  assert.deepEqual(T.banners(C, withLs(C, { 1: off(1), 4: off(4), 5: off(5) })),
    ['Roster over the limit on Fri (27/26), Sat (27/26): Fantrax scores nothing on an illegal day. Move someone into IR or drop a player.']);
  const X = Object.assign({}, C, { limits: { total: null, ir: 2, irCountsTowardTotal: false } });
  assert.deepEqual(T.banners(X, withLs(X, { 4: off(4) })), []);   // no total max known: no count to show
});

test('banners: a player on IR who is no longer IR-eligible, named once', () => {
  // Simon Ruud (d8) is never IR-eligible; Brett Okafor (d7) is until Sat (day 5)
  assert.deepEqual(T.banners(M, baseLineups(M)), ["Simon Ruud, Brett Okafor are on IR but no longer IR-eligible: a day with one of them on IR can't be saved until he moves off IR."]);
  const noD7 = baseLineups(M).map((L, di) => di < 5 ? L : { s: L.s, ir: L.ir.filter(x => x !== 'd7') });
  const irB = ls => T.banners(M, ls).filter(b => !b.startsWith('Roster over'));   // taking d7 off IR puts the roster over 26
  assert.deepEqual(irB(noD7), ["Simon Ruud is on IR but no longer IR-eligible: a day with him on IR can't be saved until he moves off IR."]);
  const ls = noD7.map((L, di) => di < 2 ? L : { s: L.s, ir: L.ir.filter(x => x !== 'd8') });   // Simon Ruud only on played days now
  assert.deepEqual(irB(ls), []);
});

test('banners: the last save\'s other-day message from Fantrax', () => {
  const res = [{ di: 3, status: 'saved', messages: [], banner: 'The maximum number of 5 active F position(s) will be exceeded.' }, { di: 4, status: 'saved', messages: [] }, { di: 5, status: 'saved', messages: [], banner: 'The maximum number of 5 active F position(s) will be exceeded.' }];
  const X = Object.assign({}, C, { days: C.days.map((d, i) => i === 6 ? Object.assign({}, d, { illegalText: 'Too many F' }) : d) });
  assert.deepEqual(T.banners(X, baseLineups(X), res), ["Fantrax flags another day's lineup (Sun): The maximum number of 5 active F position(s) will be exceeded. The days saved here were legal by the script's count; fix that day on Fantrax."]);
  assert.deepEqual(T.banners(C, baseLineups(C), res.slice(1, 2)), []);
});

test('weekView off entries carry the return date, so an IR row\'s note can name it (offRowNote)', () => {
  const { team, now, opts } = mkTeam(Object.assign({}, MOCK, { players: MOCK.players.map(p => p.id === 'd7' ? Object.assign({}, p, { irElig: true }) : p) }));
  const e = T.weekView(team, now, opts).days[5].off.find(x => x.id === 'd7');   // Brett Okafor, on IR, back Sat 10/10 (return dates on)
  assert.equal(e.kind, 'back'); assert.equal(e.date, '2026-10-10');
  assert.deepEqual(T.offRowNote(e), { text: 'IR 10/10', title: 'IR: back Sat 10/10' });
});

// ---- Task 13 fix round 1
test('sameFieldMap: an off-lineup entry (reserve, IR) compares by status only; an active one by slot too', () => {
  const a = { x: { posId: '206', stId: '2' }, y: { posId: '202', stId: '3' }, z: { posId: '204', stId: '1' } };
  assert.ok(T.sameFieldMap(a, { x: { posId: '207', stId: '2' }, y: { posId: '207', stId: '3' }, z: { posId: '204', stId: '1' } }));
  assert.ok(!T.sameFieldMap(a, Object.assign({}, a, { z: { posId: '208', stId: '1' } })));
  assert.ok(!T.sameFieldMap(a, Object.assign({}, a, { x: { posId: '206', stId: '3' } })));
  assert.ok(!T.sameFieldMap(a, Object.assign({}, a, { x: { posId: '206', stId: '1' } })));
});

test('reapply: a reserve posId that differs from the stored one (Fantrax keeps its own) is not a conflict', () => {
  const X = build(Object.assign({}, MOCK, { base: MOCK.base.map(id => id === 'c1' ? null : id) })), di = 3, d = X.days[di];   // c1 on reserve, C slot 0 open
  const fresh = T.fieldMapOf(X, di, d.base);
  assert.equal(fresh.c1.stId, '2');
  const other = { posId: fresh.c1.posId === '207' ? '206' : '207', stId: '2' };
  // already there: he was sent to reserve with another posId than Fantrax now shows
  const A = { v: 1, days: { [d.day]: { base: Object.assign({}, fresh, { c1: { posId: '206', stId: '1' } }), intended: Object.assign({}, fresh, { c1: other }) } } };
  const ra = T.reapply(X, A);
  assert.deepEqual(ra.conflicts, []); assert.ok(fmEq(X, di, ra.lineups[di], d.base));
  // not changed since: stored base had him on reserve with another posId; the move to the open C slot still applies
  const B = { v: 1, days: { [d.day]: { base: Object.assign({}, fresh, { c1: other }), intended: Object.assign({}, fresh, { c1: { posId: '206', stId: '1' } }) } } };
  const rb = T.reapply(X, B);
  assert.deepEqual(rb.conflicts, []); assert.equal(T.where(X, di, rb.lineups[di], 'c1'), '206');
});

test('playerName: a player on no loaded day (dropped since) still has a name, and reviewView lists his conflict', () => {
  assert.equal(T.playerName(C, 'c1'), 'Nolan Pryce');
  assert.equal(T.playerName(C, 'gone9'), 'A player no longer on the roster');
  assert.deepEqual(T.reviewView(C, baseLineups(C), [{ di: 3, id: 'gone9', reason: 'no longer on the roster' }]),
    [{ di: 3, label: 'Thu 10/8', ok: false, lines: [{ text: "A player no longer on the roster: can't happen any more (no longer on the roster)", bad: true }] }]);
});

const C_SPEC = Object.assign({}, MOCK, { players: MOCK.players.map(p => p.id === 'd8' || p.id === 'd7' ? Object.assign({}, p, { irElig: true }) : p) });
// The review drawn at Wed 7:15 PM with c5 for c2 on Wed (c2's game: 9:00 PM), stored as pending; saveClick then reloads through `load`.
async function withReview(fn) {
  globalThis.sessionStorage = memStorage(); globalThis.location = { href: 'https://www.fantrax.com/fantasy/league/lg1/team/roster' };
  try {
    const { team, extras, now, opts } = mkTeam(C_SPEC);
    T.syncEdit(ROUTE, team, 'K1', now, opts); T.EDIT.extras = extras; T.syncEdit(ROUTE, team, 'K1', now, opts);
    const X = T.EDIT.model, L = clone(X.days[2].base); L.s[1] = 'c5';
    const ls = X.days.map((d, di) => di === 2 ? L : clone(d.base));
    T.savePending(T.EDIT.pkey, T.pendingFrom(X, ls, null));
    Object.assign(T.EDIT, { editing: true, review: true, lineups: ls });
    assert.deepEqual(T.reviewView(X, ls, []).map(v => [v.di, v.ok]), [[2, true]]);
    const calls = [], f = async (url, init) => { calls.push(JSON.parse(init.body).msgs[0].method); throw new Error('offline'); };
    await fn({ team, now, opts, f, calls });
  } finally { delete globalThis.sessionStorage; delete globalThis.location; Object.assign(T.EDIT, { key: null, pkey: null, editing: false, review: false, undo: [], results: null, toast: '', saving: false }); }
}

test('saveClick: the fresh load shows the moved player\'s game started → nothing sent, check again', () => withReview(async ({ f, calls, opts }) => {
  const later = mkTeam(Object.assign({}, C_SPEC, { now: { d: 2, m: 21 * 60 + 5 } }));   // Wed 9:05 PM: c2 has started
  const seen = [];
  await T.saveClick(f, later.now, (route, team, at) => { seen.push([route.leagueId, team.period.id, at]); return Promise.resolve({ team: later.team, opts }); });
  assert.deepEqual(calls, []); assert.equal(seen.length, 1); assert.equal(seen[0][0], 'lg1');
  assert.equal(T.EDIT.toast, 'A game started since these moves were made: check the panel and save again'); assert.equal(T.EDIT.saving, false);
  assert.equal(T.EDIT.team, later.team);   // the panel now shows the fresh load
}));

test('saveClick: a fresh load identical to the review → sent once, from the fresh model', () => withReview(async ({ team, now, opts, f, calls }) => {
  const fresh = mkTeam(C_SPEC).team;
  await T.saveClick(f, now, () => Promise.resolve({ team: fresh, opts }));
  assert.deepEqual(calls, ['confirmOrExecuteTeamRosterChanges']);   // one dry run (the fake fetch fails, so the day is held: no execute)
  assert.equal(T.EDIT.team, fresh); assert.equal(T.EDIT.saving, false);
  assert.deepEqual(T.EDIT.results.map(r => [r.di, r.status]), [[2, 'held']]);
}));

test('saveClick: a failed reload sends nothing and says why; a new conflict sends nothing', () => withReview(async ({ team, now, opts, f, calls }) => {
  await T.saveClick(f, now, () => Promise.reject(new Error('down')));
  assert.deepEqual(calls, []); assert.equal(T.EDIT.toast, 'Could not refresh before saving: down'); assert.equal(T.EDIT.saving, false);
  T.EDIT.review = true;
  const gone = mkTeam(Object.assign({}, C_SPEC, { players: C_SPEC.players.filter(p => p.id !== 'c5') })).team;   // c5 dropped since
  await T.saveClick(f, now, () => Promise.resolve({ team: gone, opts }));
  assert.deepEqual(calls, []); assert.equal(T.EDIT.toast, 'Your roster changed since these moves were made: check the panel and save again');
  assert.deepEqual(T.EDIT.conflicts.map(c => [c.di, c.id]), [[2, 'c5']]);
}));

// ---- Final review: a stored day's base follows Fantrax for everyone but that day's movers
// Fri: c1 to reserve is pending; then, on Fantrax's own page, Luca Ferris (c5) takes Dane Whitlock's (l4) LW slot.
const FR_PL = MOCK.players.map(p => p.id === 'd8' ? Object.assign({}, p, { irElig: true }) : p);
const FR_A = Object.assign({}, MOCK, { now: EARLY, players: FR_PL }), FR_B = Object.assign({}, FR_A, { base: BASE.map(x => x === 'l4' ? 'c5' : x) });
test('pendingFrom: a stored day keeps its old base only for its movers; a player changed on Fantrax moved back is kept as a move', () => {
  const X = build(FR_A), Y = build(FR_B), di = 4;
  const ls = X.days.map(d => clone(d.base)); ls[di].s = ls[di].s.map(x => x === 'c1' ? null : x);
  let st = T.pendingFrom(X, ls, null);
  const r = T.reapply(Y, st); assert.deepEqual(r.conflicts, []); assert.equal(T.where(Y, di, r.lineups[di], 'c5'), '203');
  st = T.pendingFrom(Y, r.lineups, st, r.conflicts);
  const e = st.days[Y.days[di].day], fresh = T.fieldMapOf(Y, di, Y.days[di].base);
  assert.deepEqual(e.base.c5, fresh.c5, 'a non-mover\'s base is Fantrax\'s current entry');
  assert.deepEqual(e.base.c1, T.fieldMapOf(X, di, X.days[di].base).c1, 'a mover keeps the base his move was made from');
  // in the panel: c5 back to reserve (where the old base had him) → still a move after the next reapply
  const ls2 = r.lineups.map(clone); ls2[di].s = ls2[di].s.map(x => x === 'c5' ? null : x);
  const r2 = T.reapply(Y, T.pendingFrom(Y, ls2, st, r.conflicts));
  assert.deepEqual(r2.conflicts, []); assert.equal(T.where(Y, di, r2.lineups[di], 'c5'), 'R'); assert.equal(T.where(Y, di, r2.lineups[di], 'c1'), 'R');
  // variant: c5 into the flex slot instead → applied, not a false "changed on Fantrax since"
  const ls3 = r.lineups.map(clone), sk = Y.days[di].slots.findIndex(s => s.posId === '208'), was = ls3[di].s[sk];
  ls3[di].s = ls3[di].s.map(x => x === 'c5' ? was : x); ls3[di].s[sk] = 'c5';
  const r3 = T.reapply(Y, T.pendingFrom(Y, ls3, st, r.conflicts));
  assert.deepEqual(r3.conflicts, []); assert.equal(T.where(Y, di, r3.lineups[di], 'c5'), '208');
  // a mover whose move Fantrax already has (c1 to reserve made on Fantrax, c2 to reserve still pending): his base becomes Fantrax's entry,
  // so moving him back into the lineup in the panel is a move again
  const lw = X.days.map(d => clone(d.base)); lw[di].s = lw[di].s.map(x => x === 'c1' || x === 'c2' ? null : x);
  const sw = T.pendingFrom(X, lw, null), Z = build(Object.assign({}, FR_A, { base: BASE.map(x => x === 'c1' ? null : x) }));
  const rz = T.reapply(Z, sw), sz = T.pendingFrom(Z, rz.lineups, sw, rz.conflicts);
  assert.deepEqual(sz.days[Z.days[di].day].base.c1, T.fieldMapOf(Z, di, Z.days[di].base).c1);
  const lb = rz.lineups.map(clone); lb[di].s[lb[di].s.indexOf(null)] = 'c1';
  const rb = T.reapply(Z, T.pendingFrom(Z, lb, sz, rz.conflicts));
  assert.deepEqual(rb.conflicts, []); assert.equal(T.where(Z, di, rb.lineups[di], 'c1'), '206'); assert.equal(T.where(Z, di, rb.lineups[di], 'c2'), 'R');
});

// saveClick through the reviewer's sequence (stubbed load and fetch): what is sent is what the review showed.
async function withFri(fn) {
  globalThis.sessionStorage = memStorage(); globalThis.location = { href: 'https://www.fantrax.com/fantasy/league/lg1/team/roster' };
  try {
    const A = mkTeam(FR_A), B = mkTeam(FR_B), di = 4;
    T.syncEdit(ROUTE, A.team, 'K1', A.now, A.opts); T.EDIT.extras = A.extras; T.syncEdit(ROUTE, A.team, 'K1', A.now, A.opts);
    let ls = T.EDIT.lineups.map(clone); ls[di].s = ls[di].s.map(x => x === 'c1' ? null : x);   // the panel: c1 to reserve (as persist does)
    T.savePending(T.EDIT.pkey, T.pendingFrom(T.EDIT.model, ls, T.loadPending(T.EDIT.pkey), T.EDIT.conflicts)); T.EDIT.lineups = ls;
    T.syncEdit(ROUTE, B.team, 'K1', B.now, B.opts);   // the refresh after a change on Fantrax's own page
    ls = T.EDIT.lineups.map(clone); ls[di].s = ls[di].s.map(x => x === 'c5' ? null : x);   // the panel: c5 to reserve
    T.savePending(T.EDIT.pkey, T.pendingFrom(T.EDIT.model, ls, T.loadPending(T.EDIT.pkey), T.EDIT.conflicts)); T.EDIT.lineups = ls;
    Object.assign(T.EDIT, { editing: true, review: true });
    assert.deepEqual(T.reviewView(T.EDIT.model, T.EDIT.lineups, T.EDIT.conflicts).map(v => [v.di, v.ok, v.lines.map(l => l.text)]),
      [[4, true, ['Nolan Pryce: Active to Reserve', 'Luca Ferris: Active to Reserve']]]);
    // a fetch that answers a good dry run naming both players, executes, and reads back what was sent
    const sent = [];
    const f = async (url, init) => {
      const m = JSON.parse(init.body).msgs[0], fm = m.method === 'getTeamRosterInfo' ? sent[sent.length - 1].fieldMap : m.data.fieldMap;
      if (m.method !== 'getTeamRosterInfo') sent.push(m.data);
      const data = m.method === 'getTeamRosterInfo'
        ? { tables: [{ scGroup: '2010', header: { cells: [] }, rows: Object.entries(fm).map(([id, e]) => ({ posId: e.posId, statusId: e.stId, scorer: { scorerId: id, name: id } })) }], miscData: {} }
        : m.data.confirm ? { fantasyResponse: { msgType: 'CONFIRM', mainMsg: 'Please confirm', lineupChanges: [{ scorerId: 'c1', text: 'Active to <b>Reserve</b>' }, { scorerId: 'c5', text: 'Active to Reserve' }], illegalRosterMsgs: [] } }
        : { fantasyResponse: { msgType: 'CONFIRM', mainMsg: '', lineupChanges: [] } };
      return { ok: true, json: async () => ({ responses: [{ data }] }) };
    };
    await fn({ B, f, sent, di });
  } finally { delete globalThis.sessionStorage; delete globalThis.location; Object.assign(T.EDIT, { key: null, pkey: null, editing: false, review: false, undo: [], results: null, toast: '', saving: false }); }
}
test('saveClick: a player changed on Fantrax and moved back in the panel is sent where the review showed him; results name the players', () => withFri(async ({ B, f, sent }) => {
  await T.saveClick(f, B.now, () => Promise.resolve({ team: mkTeam(FR_B).team, opts: B.opts }));
  assert.equal(T.EDIT.toast, '');
  assert.equal(sent.length, 2, 'one dry run, one execute');
  for (const d of sent) { assert.equal(d.rosterLimitPeriod, '12'); assert.equal(d.fieldMap.c5.stId, '2'); assert.equal(d.fieldMap.c1.stId, '2'); }
  assert.deepEqual(T.EDIT.results.map(r => [r.di, r.status, r.messages]), [[4, 'saved', ['Nolan Pryce: Active to Reserve', 'Luca Ferris: Active to Reserve']]]);
}));
test('saveClick: the lineup that would be sent differs from the review (same ok days, same dropped moves) → nothing sent, check again', () => withFri(async ({ B, f, sent, di }) => {
  const ls = T.EDIT.lineups.map(clone); ls[di].s = ls[di].s.map(x => x === 'c2' ? null : x); T.EDIT.lineups = ls;   // shown, but not what storage re-applies
  await T.saveClick(f, B.now, () => Promise.resolve({ team: mkTeam(FR_B).team, opts: B.opts }));
  assert.deepEqual(sent, []); assert.equal(T.EDIT.toast, 'Your lineup changed since these moves were made: check the panel and save again'); assert.equal(T.EDIT.saving, false);
}));

// ---- Mock parity (2026-10-05), Task 1: swap a player into a full IR with the IR player of your choice
const F = build(MOCK_IR_FULL);   // IR 2/2 (d7, d8), 26/26 outside IR from Wed; l3 (LW slot 6, active) and c5 (reserve) IR-eligible
const xs = (di, L, sel, X = F) => keys(di, L, sel, X).filter(k => k.startsWith('x:'));

test('targetsFor: IR full -> x:<irId> for every unlocked IR player, only for an IR-eligible selection; with room, toir instead', () => {
  const B = F.days[4].base;   // Fri
  assert.deepEqual(xs(4, B, sl(6)), ['x:d7', 'x:d8']);                       // l3 active, IR-eligible
  assert.equal(keys(4, B, sl(6), F).includes('toir'), false);
  assert.deepEqual(xs(4, B, { kind: 'bench', id: 'c5' }), ['x:d7', 'x:d8']); // c5 on reserve, IR-eligible
  assert.deepEqual(xs(4, B, sl(0)), []);                                     // c1 is not IR-eligible
  assert.deepEqual(xs(4, B, { kind: 'bench', id: 'l5' }), []);               // l5 neither
  assert.deepEqual(xs(4, B, { kind: 'ir', id: 'd7' }), []);                  // an IR player is not swapped into IR
  assert.deepEqual(xs(4, dropAt(B, 6), sl(6)), []);                          // an open slot has nobody to send
  const room = Object.assign(clone(B), { ir: ['d7'] });                     // IR 1/2: toir as before, no swap
  assert.deepEqual(xs(4, room, sl(6)), []); assert.ok(keys(4, room, sl(6), F).includes('toir'));
  // locked selection (Wed 7:15 PM: l3's @TBL 6:00PM started) -> nothing at all
  assert.deepEqual(keys(2, F.days[2].base, sl(6), F), []);
  // an IR player Fantrax locked is not offered; a fixed selection offers nothing
  const LK = build(Object.assign({}, MOCK_IR_FULL, { players: MOCK_IR_FULL.players.map(p => p.id === 'd8' ? Object.assign({}, p, { disabled: true }) : p) }));
  assert.deepEqual(xs(4, LK.days[4].base, sl(6), LK), ['x:d7']);
  const FX = build(Object.assign({}, MOCK_IR_FULL, { players: MOCK_IR_FULL.players.map(p => p.id === 'l3' ? Object.assign({}, p, { secondary: true }) : p) }));
  assert.deepEqual(keys(4, FX.days[4].base, sl(6), FX), []);
  // a player on IR who is no longer IR-eligible can still be swapped out (MOCK: Simon Ruud d8)
  assert.deepEqual(xs(4, M.days[4].base, sl(6), M), ['x:d7', 'x:d8']);
});

test('computeMove x:: he goes into IR; the IR player takes his slot if he fits it, else reserve; IR and roster counts unchanged, legal', () => {
  const B = F.days[4].base, n = L => T.rosterCount(F, 4, L);
  // l3 (LW slot 6) <-> d7 (D only): d7 can't play LW -> reserve, the LW slot opens
  const a = T.computeMove(F, 4, B, sl(6), 'x:d7');
  assert.deepEqual(a.ir.slice().sort(), ['d8', 'l3']); assert.equal(a.s[6], null); assert.equal(a.s.includes('d7'), false);
  assert.equal(T.where(F, 4, a, 'd7'), 'R');
  // l3 in the flex (Skt) slot <-> d7: d7 fits Skt -> takes it
  const flex = clone(B); flex.s[6] = null; flex.s[18] = 'l3';   // d6 to reserve
  const b = T.computeMove(F, 4, flex, sl(18), 'x:d7');
  assert.equal(b.s[18], 'd7'); assert.deepEqual(b.ir.slice().sort(), ['d8', 'l3']);
  // c5 on reserve <-> d8: d8 to reserve
  const c = T.computeMove(F, 4, B, { kind: 'bench', id: 'c5' }, 'x:d8');
  assert.deepEqual(c.ir.slice().sort(), ['c5', 'd7']); assert.equal(T.where(F, 4, c, 'd8'), 'R'); assert.deepEqual(c.s, B.s);
  for (const [N, L] of [[a, B], [b, flex], [c, B]]) {
    assert.equal(N.ir.length, L.ir.length); assert.equal(n(N), n(L)); assert.equal(n(N), 26);
    assert.equal(N.paired, undefined); assert.equal(N.blocked, undefined);
    assert.deepEqual(T.dayErrors(F, 4, N), []);
    assert.equal(T.savePlan(F, 4, N).ok, true);
  }
  assert.deepEqual(frozen(B), frozen(F.days[4].base));   // never mutates
});

test('moveKind x:: "IR · swap with <name>: <name> to reserve" or "<name> takes his <pos>"', () => {
  const B = F.days[4].base, flex = clone(B); flex.s[6] = null; flex.s[18] = 'l3';
  assert.deepEqual(T.moveKind(F, 4, B, sl(6), 'x:d7'), { k: 'irswap', txt: 'IR · swap with Brett Okafor: Brett Okafor to reserve' });
  assert.deepEqual(T.moveKind(F, 4, flex, sl(18), 'x:d7'), { k: 'irswap', txt: 'IR · swap with Brett Okafor: Brett Okafor takes his Skt' });
  assert.deepEqual(T.moveKind(F, 4, B, { kind: 'bench', id: 'c5' }, 'x:d8'), { k: 'irswap', txt: 'IR · swap with Simon Ruud: Simon Ruud to reserve' });
});

test('banners read-only: the not-IR-eligible banner shows, the over-limit one does not (limits load on Edit)', () => {
  const off = Object.assign(clone(M.days[4].base), { ir: ['d8'] });   // d7 off IR: 27/26 on Fri, d8 not IR-eligible
  const ls = baseLineups(M); ls[4] = off;
  assert.ok(T.banners(M, ls).some(b => b.startsWith('Roster over the limit on Fri')));
  assert.deepEqual(T.banners(M, ls, [], false), ['Simon Ruud, Brett Okafor are on IR but no longer IR-eligible: Fantrax marks the roster illegal until they move off IR.']);
  const one = baseLineups(M).map((L, di) => di < 5 ? L : { s: L.s, ir: L.ir.filter(x => x !== 'd7') });   // d7 only while eligible
  assert.deepEqual(T.banners(M, one, [], false), ['Simon Ruud is on IR but no longer IR-eligible: Fantrax marks the roster illegal until he moves off IR.']);
  assert.deepEqual(T.banners(C, baseLineups(C), [], false), []);
});

test('no eligibility data from Fantrax (eligible []) = unknown: no !IR, no IR banner, read-only or editing; moves still need it', () => {
  const X = build(MOCK);
  for (const d of X.days) for (const r of Object.values(d.rows)) r.eligible = [];   // a response without eligibleStatusIds
  assert.equal(T.irIneligibleKnown(X, 4, 'd8'), false); assert.equal(T.irIneligibleKnown(M, 4, 'd8'), true);
  assert.equal(T.irIneligibleKnown(M, 4, 'd7'), false);   // eligible until Sat
  assert.deepEqual(T.banners(X, baseLineups(X), [], false), []);
  assert.deepEqual(T.banners(X, baseLineups(X)).filter(b => /IR-eligible/.test(b)), []);
  assert.equal(T.irEligible(X, 4, 'l3'), false); assert.deepEqual(xs(4, X.days[4].base, sl(6), X), []);   // editing logic unchanged
});

// ---- mock parity Task 2: the ⋯ list, open-slot picker, Fill sentence, rebuild note
{
  const MF = build(MOCK_IR_FULL), L3 = MF.days[3].base, selOfId = (L, id) => ({ s: L.s.indexOf(id) >= 0 ? { kind: 'slot', i: L.s.indexOf(id) } : L.ir.includes(id) ? { kind: 'ir', id } : { kind: 'bench', id } });
  test('dockOptions: ranked open 0, swap/take/irswap 1, bump not playing 2, bump plays 3, bench 4, ir 5, blocked last', () => {
    const o = T.dockOptions(MF, 3, L3, selOfId(L3, 'c5'));   // reserve player, IR full: swaps first, then who-sits bumps
    assert.deepEqual(o.map(x => x.rank), o.map(x => x.rank).slice().sort((a, b) => a - b));
    assert.equal(o[0].k, 'irswap'); assert.equal(o[0].rank, 1);
    const np = o.filter(x => x.k === 'bump' && !x.plays), pl = o.filter(x => x.k === 'bump' && x.plays);
    assert.ok(np.length && pl.length);
    assert.ok(np.every(x => x.rank === 2 && x.note === '(not playing)' && x.title === ''));
    assert.ok(pl.every(x => x.rank === 3 && x.note === '(he plays)' && x.title === 'He plays Thu: benching him costs a game'));
    assert.equal(np[0].txt, 'C · Owen Baird to reserve'); assert.equal(np[0].key, 's:3');
    const l3 = T.dockOptions(MF, 3, L3, selOfId(L3, 'l3'));   // slot player: take 1, irswap 1, bump, then bench 4
    assert.deepEqual(l3.map(x => x.k), ['take', 'take', 'irswap', 'irswap', 'bump', 'bench']);
    assert.equal(l3[l3.length - 1].rank, 4);
    assert.deepEqual(T.dockOptions(MF, 3, L3, Object.assign(selOfId(L3, 'c5'), { irOnly: true })).map(x => x.k), ['irswap', 'irswap']);   // the full-IR dock
    assert.deepEqual(T.dockOptions(MF, 3, L3, Object.assign(selOfId(L3, 'c2'), { irOnly: true })), []);   // nothing IR-eligible to swap
  });
  test('dockOptions: with IR room there is no swap; take first, bench last', () => {
    const base = build(MOCK), o = T.dockOptions(base, 3, base.days[3].base, selOfId(base.days[3].base, 'c2'));
    assert.equal(o[0].k, 'take'); assert.equal(o[o.length - 1].k, 'bench');
  });
  test('dockQuestion: name, positions, game, FP/G and where he is; the open slot has no question', () => {
    const q = T.dockQuestion(MF, 3, L3, selOfId(L3, 'c2'));
    assert.equal(q.id, 'c2'); assert.equal(q.pre, ' (C/LW · @VAN 9:00PM · 1.0 FP/G) is in C on Thu. Move him to:');
    assert.equal(T.dockQuestion(MF, 3, L3, selOfId(L3, 'c5')).pre, ' (C/LW/RW · @ANA 9:00PM · 2.0 FP/G) is on reserve on Thu. Move him to:');
    assert.equal(T.dockQuestion(MF, 3, L3, selOfId(L3, 'l3')).pre, ' (LW · no game · no games yet) is in LW on Thu. Move him to:');
    const ir = MF.days[3].base.ir[0];
    assert.match(T.dockQuestion(MF, 3, L3, selOfId(L3, ir)).pre, / is on IR on Thu\. Move him to:$/);
    assert.match(T.dockQuestion(MF, 3, L3, Object.assign(selOfId(L3, 'c5'), { irOnly: true })).pre, /\. IR is full \(2\/2\): swap him into IR with:$/);
    const open = cloneOpen(MF, 3); assert.equal(T.dockQuestion(MF, 3, open, { s: { kind: 'slot', i: 11 } }), null);
  });
  const cloneOpen = (M, di) => { const L = clone(M.days[di].base); L.s[11] = null; return L; };
  test('open-slot picker copy', () => {
    assert.equal(T.openOption(MF, 3, 'c5'), 'Luca Ferris · @ANA 9:00PM · 2.0 FP/G');
    assert.equal(T.openOption(MF, 3, 'l3'), 'Ryan Kask · no game · no games yet');
    assert.equal(T.OPEN_NONE, 'Nobody on reserve or IR fits it.');
  });
  test('fpgLong: the Fill ranking sentence for each case', () => {
    const m = build(MOCK);
    assert.equal(T.fpgLong(m, 'c1'), 'Fill ranks him by 3.5 FP/G this season (2 GP).');
    assert.equal(T.fpgLong(m, 'c4'), 'Fill ranks him last: no games this season.');
  });
  test('rebuildNote: plural, singular, with and without conflicts', () => {
    assert.equal(T.rebuildNote(3, 0), 'Panel rebuilt with fresh data. 3 pending moves re-applied, none in conflict.');
    assert.equal(T.rebuildNote(1, 2), 'Panel rebuilt with fresh data. 1 pending move re-applied, 2 in conflict.');
  });
}

test('rosterTags: NEW on a mid-week add\'s first roster day, DROP on a drop\'s last day, nothing else (mock parity #10)', () => {
  const tags = id => M.days.map((_, di) => T.rosterTags(M, di, id).join(','));
  assert.deepEqual(tags('r4'), ['', '', 'NEW', '', '', '', '']);   // on the roster from day 2
  assert.deepEqual(tags('c6'), ['', '', '', '', 'NEW', '', '']);   // from day 4
  assert.deepEqual(tags('r5'), ['', '', '', 'DROP', '', '', '']);  // until day 3
  assert.deepEqual(tags('c1'), ['', '', '', '', '', '', '']);      // there all week
});

test('rosterTags: an unloaded day neither starts nor ends a roster span', () => {
  const N = build(MOCK);
  N.days[0].slots = null;   // Monday not loaded: a player there Tuesday is on his first loaded day, not NEW
  assert.deepEqual(T.rosterTags(N, 0, 'c1'), []);
  assert.deepEqual(T.rosterTags(N, 1, 'r5'), []);
  assert.deepEqual(T.rosterTags(N, 2, 'r4'), ['NEW']);
  N.days[6].slots = null;   // Sunday not loaded: Saturday is the last loaded day, so no DROP there
  assert.deepEqual(T.rosterTags(N, 5, 'c6'), []);
});

test('meterLineups: read-only counts the lineups the body shows (no delta); editing counts the pending ones', () => {
  const pend = M.days.map(d => clone(d.base)); pend[3].s[0] = null;   // one pending move
  const ro = T.meterLineups({ model: M, editing: false, lineups: pend });
  assert.deepEqual(ro.lineups, ro.base);
  assert.equal(T.meterView(M, ro.lineups, ro.base, 'skaters').delta, 0);
  const ed = T.meterLineups({ model: M, editing: true, lineups: pend });
  assert.equal(ed.lineups, pend);
  assert.deepEqual(ed.base, ro.base);
});

// ---- mock parity final review fixes
test('nameTitle: the player name until the edit extras load, the Fill sentence after', () => {
  const m = build(MOCK);
  assert.equal(T.nameTitle(m, 'c1', null), m.players.c1.name);
  assert.equal(T.nameTitle(m, 'c1', {}), T.fpgLong(m, 'c1'));
  assert.equal(T.nameTitle(Object.assign({}, m, { editable: false }), 'c1', {}), m.players.c1.name + ' · ' + T.fpgText(m, 'c1'), 'not editable: no Fill sentence');
});
test('open-slot options carry the IR pair note, shown beside the name · game · FP/G text', () => {
  const MF = build(MOCK_IR_FULL), L = clone(MF.days[4].base), i = MF.days[4].slots.findIndex(x => x.pos === 'D'); L.s[i] = null;
  const o = T.dockOptions(MF, 4, L, { s: { kind: 'slot', i } });
  const plain = o.find(x => x.key === 'b:d1'), paired = o.find(x => x.key === 'i:d8');
  assert.equal(plain.pair, '');
  assert.equal(paired.pair, ' · Ryan Kask (Out) into IR');   // the lowest this season (no games yet) goes into IR assert.ok(paired.txt.endsWith(paired.pair));
  assert.equal(T.openOption(MF, 4, 'd8'), 'Simon Ruud · CHI 7:00PM · 0.0 FP/G');
});
test('syncEdit: the rebuild toast shows only for a fresh fetch, not a cached redraw', () => withPage(() => {
  const { team, extras, now, opts } = mkTeam(MOCK);
  T.syncEdit(ROUTE, team, 'K1', now, opts); T.EDIT.extras = extras; T.syncEdit(ROUTE, team, 'K1', now, opts);
  const X = T.EDIT.model, L = clone(X.days[3].base); L.s[T.EDIT.model.days[3].base.s.indexOf('c2')] = null;
  T.savePending(T.EDIT.pkey, T.pendingFrom(X, X.days.map((d, di) => di === 3 ? L : clone(d.base)), null));
  const redraw = Object.assign({}, team);   // withReturnDates hands a new object on every load, cached or not
  T.syncEdit(ROUTE, redraw, 'K1', now, opts); assert.equal(T.EDIT.toast, '');
  T.syncEdit(ROUTE, Object.assign({}, team), 'K1', now, opts, false); assert.equal(T.EDIT.toast, '');
  T.syncEdit(ROUTE, Object.assign({}, team), 'K1', now, opts, true); assert.match(T.EDIT.toast, /^Panel rebuilt with fresh data\. 1 pending move re-applied/);
}));

// ---- 2026-10-18 usability pass, Task 1: display helpers
test('shortTime drops the M', () => {
  assert.equal(T.shortTime('8:40PM'), '8:40p'); assert.equal(T.shortTime('12:00AM'), '12:00a'); assert.equal(T.shortTime('FLA 2'), 'FLA 2');
});
test('fpgShort / fpgHeader: this season\'s FP/G and GP, no last-season mark', () => {
  assert.equal(T.fpgShort(M, 'c1'), '3.5 · 2 GP');
  assert.equal(T.fpgShort(M, 'c4'), '0 GP');
  assert.equal(T.fpgHeader(M), 'FP/G this season');
});
test('dayHeadLine: short text, roster count only when not at the max', () => {
  const v = { games: 17, idle: 3, open: 1, rosterN: 26, rosterMax: 26 };
  assert.deepEqual(T.dayHeadLine(v), { text: '17 start · 3 empty', title: '17 games · 26/26 players · 3 empty · 1 open' });
  assert.equal(T.dayHeadLine(Object.assign({}, v, { rosterN: 27 })).text, '17 start · 3 empty · 27/26 players');
  assert.equal(T.dayHeadLine(Object.assign({}, v, { rosterMax: null })).text, '17 start · 3 empty');
  assert.equal(T.dayHeadLine(Object.assign({}, v, { open: 0, rosterMax: null })).title, '17 games · 26 players · 3 empty');
});
test('allGamesPill: done / go with startable days only / stuck', () => {
  const ls = M.days.map(d => d.base);
  assert.deepEqual(T.allGamesPill(M, ls, 'c4'), { state: 'done', n: 0 });    // c4 Out: empty plan
  assert.deepEqual(T.allGamesPill(M, ls, 'c5'), { state: 'go', n: 4 });      // Wed, Thu, Sat, Sun all startable
  assert.deepEqual(T.allGamesPill(M, ls, 'd7'), { state: 'go', n: 1 });      // Sat startable, Sun asks
  assert.ok(T.allGamesPlan(M, ls, 'd10').every(x => x.ask));
  assert.deepEqual(T.allGamesPill(M, ls, 'd10'), { state: 'stuck', n: 0 });  // Thu and Sun both ask
});

// ---- 2026-10-18 usability pass, Task 2: always editable on your own team
const withPage2 = fn => withPage(() => { try { fn(); } finally { Object.assign(T.EDIT, { sel: null, pick: null, loading: false, loadError: '', extras: null, results: null, review: false, lineups: [], conflicts: [] }); } });
test('ownTeamState: no teamId = own; another teamId with a known own team = other', () => {
  assert.equal(T.ownTeamState({ ownTeam: true }, ROUTE, null), 'own');
  assert.equal(T.ownTeamState({}, ROUTE, null), 'own');
  assert.equal(T.ownTeamState({}, Object.assign({}, ROUTE, { teamId: 't2' }), 't1'), 'other');
  assert.equal(T.ownTeamState({}, Object.assign({}, ROUTE, { teamId: 't1' }), 't1'), 'own');
  assert.equal(T.ownTeamState({}, Object.assign({}, ROUTE, { teamId: 't2' }), null), 'unknown');
  assert.equal(T.ownTeamState({ ownTeam: false }, ROUTE, null), 'other');
});
test('autoEditWanted: own team with an editable day, once', () => withPage2(() => {
  const { team, now, opts } = mkTeam(MOCK); T.syncEdit(ROUTE, team, 'K1', now, opts);
  assert.equal(T.autoEditWanted(T.EDIT), true);
  T.EDIT.loading = true; assert.equal(T.autoEditWanted(T.EDIT), false); T.EDIT.loading = false;
  T.EDIT.loadError = 'x'; assert.equal(T.autoEditWanted(T.EDIT), false); T.EDIT.loadError = '';
  T.EDIT.editing = true; assert.equal(T.autoEditWanted(T.EDIT), false); T.EDIT.editing = false;
  T.syncEdit(Object.assign({}, ROUTE, { teamId: 'other' }), Object.assign({}, team, { ownTeam: false }), 'K2', now, opts);
  assert.equal(T.autoEditWanted(T.EDIT), false);
}));
test('statsWanted: FP/G loads once without editing on another team (2026-10-21), never alongside autoEditWanted', () => withPage2(() => {
  const { team, now, opts } = mkTeam(MOCK); T.syncEdit(ROUTE, team, 'K1', now, opts);
  assert.equal(T.statsWanted(T.EDIT), false, 'own team: autoEditWanted loads them');
  T.syncEdit(Object.assign({}, ROUTE, { teamId: 'other' }), Object.assign({}, team, { ownTeam: false }), 'K2', now, opts);
  assert.equal(T.statsWanted(T.EDIT), true);
  T.EDIT.loading = true; assert.equal(T.statsWanted(T.EDIT), false); T.EDIT.loading = false;
  T.EDIT.loadError = 'x'; assert.equal(T.statsWanted(T.EDIT), false); T.EDIT.loadError = '';
  T.EDIT.extras = {}; assert.equal(T.statsWanted(T.EDIT), false, 'once');
}));
test('editPaused: editable alone does not pause; pending moves or an open choice do', () => withPage2(() => {
  const { team, now, opts } = mkTeam(MOCK); T.syncEdit(ROUTE, team, 'K1', now, opts); T.EDIT.editing = true;
  assert.equal(T.editPaused(), false);
  T.EDIT.pick = { di: 4, id: 'g3', opts: [] }; assert.equal(T.editPaused(), true); T.EDIT.pick = null;
  T.EDIT.sel = { di: 4, key: 's:0' }; assert.equal(T.editPaused(), true); T.EDIT.sel = null;
  T.EDIT.lineups[4] = T.planClick(T.EDIT.model, 4, T.EDIT.lineups[4], 'c1').L; assert.equal(T.editPaused(), true);
}));
test('syncEdit keeps editing across a same-key refresh (no flash back to read-only)', () => withPage2(() => {
  const { team, now, opts } = mkTeam(MOCK); T.syncEdit(ROUTE, team, 'K1', now, opts); T.EDIT.editing = true;
  T.syncEdit(ROUTE, team, 'K1', now, opts, true); assert.equal(T.EDIT.editing, true);
}));
test('save bar only with something to save or show; pending bar only before the extras', () => withPage2(() => {
  const { team, now, opts } = mkTeam(MOCK); T.syncEdit(ROUTE, team, 'K1', now, opts);
  T.EDIT.editing = true; assert.equal(T.saveBarShown(T.EDIT), false);
  T.EDIT.results = [{ status: 'saved' }]; assert.equal(T.saveBarShown(T.EDIT), true); T.EDIT.results = null;
  T.EDIT.lineups[4] = T.planClick(T.EDIT.model, 4, T.EDIT.lineups[4], 'c1').L;   // c1 to reserve Fri
  assert.equal(T.saveBarShown(T.EDIT), true); assert.equal(T.pendingBarShown(T.EDIT), false);
  T.EDIT.editing = false; assert.equal(T.saveBarShown(T.EDIT), false); assert.equal(T.pendingBarShown(T.EDIT), true);
}));

// ---- 2026-10-18: an unclosed @media in WEEK_CSS (cd65feb) put every later rule (targets, dim, chips, dock) behind hover:none
test('WEEK_CSS: braces balance, so no rule is swallowed by an unclosed block', async () => {
  const src = (await import('node:fs')).readFileSync(new URL('../fantrax-game-tracker.user.js', import.meta.url), 'utf8');
  const a = src.indexOf('const WEEK_CSS = `') + 'const WEEK_CSS = `'.length, css = src.slice(a, src.indexOf('`;', a));
  let d = 0, worst = 0;
  for (const line of css.split('\n')) { for (const c of line) d += c === '{' ? 1 : c === '}' ? -1 : 0; if (!/^\s*@media/.test(line)) worst = Math.max(worst, d); }
  assert.equal(d, 0);
  assert.ok(worst <= 1, 'a plain rule line left a block open');
});

// ---- 2026-10-18 usability pass, Task 4: who sits = the lit cells
test('pickTarget: only that day\'s options are targets', () => {
  const pick = { di: 3, id: 'g3', opts: [{ out: 'g1', s: [] }, { out: 'g2', s: [] }] };
  assert.equal(T.pickTarget(pick, 3, 'g1'), pick.opts[0]);
  assert.equal(T.pickTarget(pick, 3, 'g2'), pick.opts[1]);
  assert.equal(T.pickTarget(pick, 2, 'g1'), null);
  assert.equal(T.pickTarget(pick, 3, 'c1'), null);
  assert.equal(T.pickTarget(pick, 3, 'g3'), null);
  assert.equal(T.pickTarget(null, 3, 'g1'), null);
});

// ---- 2026-10-18 live find: a ;period=N URL renders first under 'cur|N', then under the mapped period once the period list is
// known — same team and week (same pending key). That must not reset editing, the undo stack or a save result.
test('syncEdit: a new render key for the same team and week keeps editing, undo, extras and the save result', () => withPage2(() => {
  const { team, extras, now, opts } = mkTeam(MOCK); T.syncEdit(ROUTE, team, 'lg1|me|cur|21|', now, opts);
  const ex = extras;
  Object.assign(T.EDIT, { editing: true, undo: [null], results: [{ status: 'saved' }], review: true, extras: ex });
  T.syncEdit(ROUTE, team, 'lg1|me|4||', now, opts, true);
  assert.equal(T.EDIT.key, 'lg1|me|4||');
  assert.equal(T.EDIT.editing, true); assert.deepEqual(T.EDIT.undo, [null]); assert.equal(T.EDIT.extras, ex);
  assert.deepEqual(T.EDIT.results, [{ status: 'saved' }]); assert.equal(T.EDIT.review, true);
}));
test('syncEdit: a refresh (tab return, resize, in-flight tick) keeps an open who-sits or ⋯ choice while it still applies', () => withPage2(() => {
  const { team, now, opts } = mkTeam(MOCK); T.syncEdit(ROUTE, team, 'K1', now, opts); T.EDIT.editing = true;
  const pl = T.planClick(T.EDIT.model, 3, T.EDIT.lineups[3], 'd10'); assert.equal(pl.k, 'pick');
  T.EDIT.pick = { di: 3, id: 'd10', opts: pl.opts };
  T.syncEdit(ROUTE, team, 'K1', now, opts, true);
  assert.equal(T.EDIT.pick && T.EDIT.pick.id, 'd10'); assert.deepEqual(T.EDIT.pick.opts.map(o => o.out), pl.opts.map(o => o.out));
  T.EDIT.pick = { di: 3, id: 'c5', opts: [] };   // c5 starts Thu already: no longer a who-sits question
  T.syncEdit(ROUTE, team, 'K1', now, opts, true); assert.equal(T.EDIT.pick, null);
  T.EDIT.sel = { di: 3, key: 's:0', s: { kind: 'slot', i: 0 } };
  T.syncEdit(ROUTE, team, 'K1', now, opts, true); assert.equal(T.EDIT.sel && T.EDIT.sel.key, 's:0');
  T.EDIT.sel = { di: 0, key: 's:0', s: { kind: 'slot', i: 0 } };   // Mon is played
  T.syncEdit(ROUTE, team, 'K1', now, opts, true); assert.equal(T.EDIT.sel, null);
}));
test('WEEK_CSS: sticky Grid day headers stay opaque on today and played days (rows scroll under them)', async () => {
  const src = (await import('node:fs')).readFileSync(new URL('../fantrax-game-tracker.user.js', import.meta.url), 'utf8');
  const a = src.indexOf('const WEEK_CSS = `') + 'const WEEK_CSS = `'.length, css = src.slice(a, src.indexOf('`;', a));
  const rules = css.split('}').map(r => r.split('{')).filter(r => r.length === 2).map(([sel, body]) => ({ sel, body }));
  assert.ok(!rules.some(r => r.sel.split(',').some(x => /th\.fgt-past\s*$/.test(x)) && /opacity/.test(r.body)), 'a played day header must not be see-through (dim its contents instead)');
  const today = rules.filter(r => /th\.fgt-today/.test(r.sel) && /background\s*:/.test(r.body));
  assert.ok(today.length && today.every(r => /#1c1f2b/.test(r.body)), "today's header tint needs an opaque base");
});

// ---- 2026-10-18 follow-up (user: fix the visible minors)
test('allGamesPill: "none" (no pill) when he has no remaining game that counts; "done" only when he starts at least one', () => {
  const ls = M.days.map(d => d.base);
  assert.deepEqual(T.allGamesPill(M, ls, 'l3'), { state: 'none', n: 0 });   // l3 Out: nothing left that counts
  assert.deepEqual(T.allGamesPill(M, ls, 'r2'), { state: 'none', n: 0 });
  assert.deepEqual(T.allGamesPill(M, ls, 'c1'), { state: 'done', n: 0 });   // starts Wed-Sat, every game he has
});
test('WEEK_CSS: the Grid IR chip is a corner badge that takes no room from the game text', async () => {
  const src = (await import('node:fs')).readFileSync(new URL('../fantrax-game-tracker.user.js', import.meta.url), 'utf8');
  const a = src.indexOf('const WEEK_CSS = `') + 'const WEEK_CSS = `'.length, css = src.slice(a, src.indexOf('`;', a));
  assert.ok(!/\.fgt-hasirb \.fgt-cell\{[^}]*padding-right/.test(css), 'no padding reserved for the IR chip');
});

// ---- 2026-10-18 pre-merge fixes
test('extrasRefreshWanted: a fresh redraw with nothing pending reloads FP/G and the limits quietly', () => withPage2(() => {
  const { team, extras, now, opts } = mkTeam(MOCK); T.syncEdit(ROUTE, team, 'K1', now, opts); Object.assign(T.EDIT, { editing: true, extras });
  assert.equal(T.extrasRefreshWanted(T.EDIT, true), true);
  assert.equal(T.extrasRefreshWanted(T.EDIT, false), false);   // a cached redraw: nothing new to ask
  T.EDIT.pick = { di: 3, id: 'd10', opts: [] }; assert.equal(T.extrasRefreshWanted(T.EDIT, true), false); T.EDIT.pick = null;
  T.EDIT.saving = true; assert.equal(T.extrasRefreshWanted(T.EDIT, true), false); T.EDIT.saving = false;
  T.EDIT.loading = true; assert.equal(T.extrasRefreshWanted(T.EDIT, true), false); T.EDIT.loading = false;
  T.EDIT.lineups[4] = T.planClick(T.EDIT.model, 4, T.EDIT.lineups[4], 'c1').L; assert.equal(T.extrasRefreshWanted(T.EDIT, true), false);
}));
test('pendingBarReason: says why moves kept in the tab cannot be saved yet', () => withPage2(() => {
  const { team, extras, now, opts } = mkTeam(MOCK); T.syncEdit(ROUTE, team, 'K1', now, opts);
  T.EDIT.loading = true; assert.equal(T.pendingBarReason(T.EDIT), 'Lineup data is still loading.'); T.EDIT.loading = false;
  T.EDIT.loadError = 'x'; assert.equal(T.pendingBarReason(T.EDIT), 'Lineup data could not be loaded.'); T.EDIT.loadError = '';
  const X = T.buildEditModel(team, Object.assign({}, extras, { ownTeam: false }), now, opts);
  T.EDIT.extras = extras; T.EDIT.model = X; assert.equal(T.pendingBarReason(T.EDIT), X.notEditable + '.');
  const P = build(MOCK); P.days.forEach(d => { d.state = 'past'; }); T.EDIT.model = P; T.EDIT.extras = null;
  assert.equal(T.pendingBarReason(T.EDIT), 'Every day of this period has been played.');
}));
test('pickTip: a lit who-sits cell says what its click does', () => {
  const pick = { di: 3, id: 'd10', opts: [{ out: 'd1', s: [] }] };
  assert.equal(T.pickTip(M, pick, 'd1'), 'Click: ' + M.players.d1.name + ' sits, ' + M.players.d10.name + ' starts ' + M.days[3].label + '.');
});
test('startEditing: a load still in flight when the week changes never lands on the new week', async () => {
  globalThis.sessionStorage = memStorage(); globalThis.location = { href: 'https://www.fantrax.com/fantasy/league/lg1/team/roster' };
  const realFetch = globalThis.fetch;
  try {
    let fail; globalThis.fetch = () => new Promise((_, rej) => { fail = rej; });
    const { team, now, opts } = mkTeam(MOCK); T.clearCache(); T.syncEdit(ROUTE, team, 'K1', now, opts);
    T.startEditing();
    assert.equal(T.EDIT.loading, true);
    const next = Object.assign({}, team, { period: Object.assign({}, team.period, { id: team.period.id + 1 }) });
    T.syncEdit(ROUTE, next, 'K1', now, opts);   // a no-period URL across a period rollover: same render key, new pending key
    globalThis.fetch = () => Promise.reject(new Error('old week'));
    fail(new Error('old week'));
    await new Promise(r => setTimeout(r, 1700));   // apiMulti retries once after RETRY_DELAY_MS
    assert.equal(T.EDIT.loadError, '');
  } finally { globalThis.fetch = realFetch; delete globalThis.sessionStorage; delete globalThis.location; Object.assign(T.EDIT, { key: null, pkey: null, editing: false, undo: [], loading: false, loadError: '', extras: null }); T.clearCache(); }
});
test('WEEK_CSS: "over" is a tag in the cell (no corner ::after to collide with ⋯ or "sits"); Columns today accent on its sticky header', async () => {
  const src = (await import('node:fs')).readFileSync(new URL('../fantrax-game-tracker.user.js', import.meta.url), 'utf8');
  const a = src.indexOf('const WEEK_CSS = `') + 'const WEEK_CSS = `'.length, css = src.slice(a, src.indexOf('`;', a));
  assert.ok(!/\.fgt-cell\.fgt-ovr::after/.test(css));
  assert.ok(/\.fgt-col\.fgt-today \.fgt-dh\{[^}]*box-shadow/.test(css));
});

// ---- 2026-10-18 user report: the Grid legend lacked what the Columns legend explained
test('legendSpec: both views explain the same tags (status, RET, NEW/DROP, over, IR status); Grid adds its own controls', () => {
  for (const returnDates of [false, true]) for (const editing of [false, true]) {
    const o = { returnDates, editing, offStatus: 'Inj Res' }, tags = v => T.legendSpec(v, o).filter(x => x.tags).map(x => JSON.stringify(x.tags) + x.text);
    assert.deepEqual(tags('grid'), tags('columns'), JSON.stringify(o));
    const all = v => T.legendSpec(v, o).map(x => (x.tags || []).map(t => t[1]).join('/') + ' ' + x.text).join(' | ');
    for (const v of ['grid', 'columns']) {
      assert.match(all(v), /NEW\/DROP/); assert.match(all(v), /over /); assert.match(all(v), /already played/); assert.match(all(v), /opens that day on Fantrax/);
      if (editing) assert.match(all(v), /moved \(pending\)/);
    }
    if (editing) { assert.match(all('grid'), /✓ all/); assert.match(all('grid'), /green/); }
  }
});
test('WEEK_CSS: Grid cell tags keep their size (the game text ellipsizes instead); IR badge inside the cell; headers top-aligned', async () => {
  const src = (await import('node:fs')).readFileSync(new URL('../fantrax-game-tracker.user.js', import.meta.url), 'utf8');
  const a = src.indexOf('const WEEK_CSS = `') + 'const WEEK_CSS = `'.length, css = src.slice(a, src.indexOf('`;', a));
  assert.match(css, /\.fgt-cell\.fgt-gx\{[^}]*display:flex/);
  assert.match(css, /\.fgt-cell\.fgt-gx \.fgt-gt\{[^}]*min-width:0[^}]*text-overflow:ellipsis/);
  assert.match(css, /\.fgt-c\.fgt-hasirb \.fgt-irb\{[^}]*top:3px/);
  assert.match(css, /\.fgt-grid thead th\{[^}]*vertical-align:top/);
});
test('WEEK_CSS: Grid day label on its own line, so "played"/"today" and Fill sit under it on every day', async () => {
  const src = (await import('node:fs')).readFileSync(new URL('../fantrax-game-tracker.user.js', import.meta.url), 'utf8');
  const a = src.indexOf('const WEEK_CSS = `') + 'const WEEK_CSS = `'.length, css = src.slice(a, src.indexOf('`;', a));
  assert.match(css, /\.fgt-grid \.fgt-dl>a,\.fgt-grid \.fgt-dl>b\{[^}]*flex-basis:100%/);
});

// ---- 2026-10-18 user: reserve cells with no game read as blank, and clicking one made a move that gains nothing
test('planClick: a reserve player whose game that day would not count (no game, or out) is not started: k none', () => {
  const lineups = M.days.map(d => d.base), di = 4, L = lineups[di], ledger = T.gameLedger(M, lineups);
  const ids = M.order.filter(id => T.gridCell(M, lineups, di, id, ledger).kind === 'benchNo');
  assert.ok(ids.length, 'fixture has a reserve player with nothing that counts on Fri');
  for (const id of ids) {
    const r = T.planClick(M, di, L, id);
    assert.equal(r.k, 'none', id);
    assert.match(r.text, /nothing to (start|gain)$/);   // 2026-10-18: the Grid's ⋯ menu is gone
  }
  assert.notEqual(T.planClick(M, 3, lineups[3], 'c5').k, 'none');   // a reserve player with a counted game (Thu) still starts
});
test('gridCellText: a reserve cell with no game says so (dim), an IR cell keeps its dot, a day off the roster is —', () => {
  assert.equal(T.gridCellText({ kind: 'benchNo' }, null), 'no game');
  assert.equal(T.gridCellText({ kind: 'idle' }, null), 'no game');
  assert.equal(T.gridCellText({ kind: 'ir' }, null), '·');
  assert.equal(T.gridCellText({ kind: 'play' }, 'CBJ 5:00p'), 'CBJ 5:00p');
});

// ---- 2026-10-18 user: Review & save only added clicks → one-click Save; the bar lists problems only
test('saveClick: no review step needed (one click on Save)', () => withReview(async ({ team, now, opts, f, calls }) => {
  T.EDIT.review = false;
  await T.saveClick(f, now, () => Promise.resolve({ team: mkTeam(C_SPEC).team, opts }));
  assert.deepEqual(calls, ['confirmOrExecuteTeamRosterChanges']);
}));
test('saveBarView: Save N days counts the days that will save; only problems are listed (no plain moves)', () => {
  const L = clone(C.days[2].base); L.s[0] = null; L.s[1] = 'c5';   // c1 (locked) to reserve: dropped; c5 for c2 still saves
  const ok = T.saveBarView(C, withLs(C, { 2: L }), []);
  assert.equal(ok.ok, 1);
  assert.deepEqual(ok.notes, [{ di: 2, label: 'Wed 10/7', saves: true, lines: [{ text: "Nolan Pryce: Active to Reserve — dropped: Nolan Pryce's game started at 6:00 PM", bad: true }] }]);
  const L2 = clone(C.days[2].base); L2.s[0] = null;   // only the dropped move: the day does not save
  const none = T.saveBarView(C, withLs(C, { 2: L2 }), []);
  assert.equal(none.ok, 0); assert.equal(none.notes[0].saves, false);
  const plain = clone(C.days[3].base); plain.s[1] = 'c5';   // a legal move with nothing to report
  const p = T.saveBarView(C, withLs(C, { 3: plain }), []);
  assert.equal(p.ok, 1); assert.deepEqual(p.notes.filter(n => n.lines.length), []);
});
test('saveLabel: "Save" with nothing to save, "Save 1 day" / "Save N days" otherwise, Checking… / Saving… while busy', () => {
  assert.equal(T.saveLabel(0, null), 'Save'); assert.equal(T.saveLabel(1, null), 'Save 1 day'); assert.equal(T.saveLabel(3, null), 'Save 3 days');
  assert.equal(T.saveLabel(2, 'checking'), 'Checking…'); assert.equal(T.saveLabel(2, 'saving'), 'Saving…');
});

// ---- 2026-10-18 user: Grid should use the room it has (1: less horizontal scroll, 2: less vertical scroll, 3: fill the panel)
test('WEEK_CSS: the Grid fills the body, its day columns share the width down to 92 px, and a wide panel puts each name on one line', async () => {
  const src = (await import('node:fs')).readFileSync(new URL('../fantrax-game-tracker.user.js', import.meta.url), 'utf8');
  const a = src.indexOf('const WEEK_CSS = `') + 'const WEEK_CSS = `'.length, css = src.slice(a, src.indexOf('`;', a));
  assert.match(css, /\.fgt-wkbody\{[^}]*container-type:inline-size/);
  assert.match(css, /\.fgt-grid\{[^}]*table-layout:fixed[^}]*width:100%[^}]*min-width:calc\(var\(--fgt-name\) \+ var\(--fgt-days\) \* 92px\)/);
  assert.ok(!/td\.fgt-c\{[^}]*width:118px/.test(css), 'no fixed day width');
  assert.match(css, /@container \(min-width:960px\)\{[^@]*--fgt-name:230px[^@]*\.fgt-grid \.fgt-who \.fgt-p\{[^}]*display:inline/);
  assert.match(css, /@container \(min-width:1200px\)\{[^@]*--fgt-name:240px[^@]*flex-basis:auto/);
  assert.match(src, /'--fgt-days:' \+ M\.days\.length/);
});

// ---- 2026-10-18 user: no message for a plain move (the grid shows it); one only when something else happened
test('clickToast: silent for a plain start or sit; says who else moved, a slot shift, or a games-max overflow', () => {
  const ls = M.days.map(d => d.base);
  const plain = T.planClick(M, 3, ls[3], 'c1');   // c1 to reserve: his slot opens
  assert.equal(T.clickToast(M, ls, 3, 'c1', plain), '');
  const idle = T.planClick(M, 3, ls[3], 'l5');   // l3 (Out, not playing) goes to reserve
  assert.ok(idle.out);
  assert.match(T.clickToast(M, ls, 3, 'l5', idle), new RegExp(M.players[idle.out].name));
});

// ---- 2026-10-18 user: messages take vertical space (dismiss / time out); page-level overlap; cut-off name details; IR badge over RET
test('autoDismissMs: move messages 8 s; a save that fully worked 10 s; a day not saved stays until closed', () => {
  assert.equal(T.autoDismissMs('toast', null), 8000);
  assert.equal(T.autoDismissMs('results', [{ status: 'saved' }, { status: 'saved' }]), 10000);
  assert.equal(T.autoDismissMs('results', [{ status: 'saved' }, { status: 'held' }]), null);
  assert.equal(T.autoDismissMs('results', [{ status: 'failed' }]), null);
});
test('WEEK_CSS: the meter is not pinned to the page (it covered the grid\'s own sticky header); a cell with a tag keeps room for the IR badge', async () => {
  const src = (await import('node:fs')).readFileSync(new URL('../fantrax-game-tracker.user.js', import.meta.url), 'utf8');
  const a = src.indexOf('const WEEK_CSS = `') + 'const WEEK_CSS = `'.length, css = src.slice(a, src.indexOf('`;', a));
  assert.ok(!/\.fgt-meter\{[^}]*position:sticky/.test(css));
  assert.match(css, /\.fgt-c\.fgt-hasirb \.fgt-cell:has\(\.fgt-tag\)\{[^}]*padding-right/);
  assert.match(css, /\.fgt-x\{/);
});

// ---- 2026-10-18 user: lock-aware seating. Fantrax locks each player at his own puck drop and a locked player keeps his slot, so a
// Grid start puts the earliest games in the slots later reserve players need least (the flex last); same starters, no points change.
// Tue (day 1): Erik Dahl (D, 1:00 PM) sits in Skt, the D slot is open; Lars Moe (D, 7:00 PM) and Roy Pitt (RW, 7:30 PM) on reserve.
const LA_PLAYERS = [
  { id: 'c1', fpg: 2, gp: 2, n: 'Carl Ames', pos: ['C'], g: { 1: 'BOS 7:00PM' } },
  { id: 'l1', fpg: 2, gp: 2, n: 'Lou Bray', pos: ['LW'], g: { 1: 'TOR 7:00PM' } },
  { id: 'dE', fpg: 2, gp: 2, n: 'Erik Dahl', pos: ['D'], g: { 1: 'NYI 1:00PM' } },
  { id: 'dL', fpg: 3, gp: 2, n: 'Lars Moe', pos: ['D'], g: { 1: 'MTL 7:00PM' } },
  { id: 'r1', fpg: 1, gp: 2, n: 'Roy Pitt', pos: ['RW'], g: { 1: '@BOS 7:30PM' } },
  { id: 'g1', fpg: 2, gp: 2, n: 'Gus Hale', pos: ['G'], g: { 1: 'SEA 7:00PM' } },
];
const LA = { start: '2026-10-05', days: 2, now: { d: 0, m: 9 * 60 }, slots: ['C', 'LW', 'D', 'Skt', 'G'], base: ['c1', 'l1', null, 'dE', 'g1'],
  players: LA_PLAYERS, limits: { total: 10, ir: 2 }, max: { skaters: 60, goalies: 10 }, own: true, daily: true };
const LAM = build(LA);
test('planClick (lock-aware): the 1:00 PM D takes the D slot and the 7:00 PM D the flex, so the 7:30 PM RW can still get in', () => {
  const r = T.planClick(LAM, 1, LAM.days[1].base, 'dL');
  assert.equal(r.k, 'move');
  assert.deepEqual(r.L.s, ['c1', 'l1', 'dE', 'dL', 'g1']);
  assert.match(r.text, /others shift slots/);
});
test('planClick (lock-aware): nobody on reserve plays later, so nobody else moves', () => {
  const X = build(Object.assign({}, LA, { players: LA_PLAYERS.map(p => p.id === 'r1' ? Object.assign({}, p, { g: {} }) : p) }));
  assert.deepEqual(T.planClick(X, 1, X.days[1].base, 'dL').L.s, ['c1', 'l1', 'dL', 'dE', 'g1']);
});
test('planClick (lock-aware): a player whose game started keeps his slot', () => {
  const X = build(Object.assign({}, LA, { now: { d: 1, m: 14 * 60 } }));   // Tue 2:00 PM: Dahl's 1:00 PM game is under way
  assert.equal(T.locked(X, 1, 'dE'), true);
  assert.deepEqual(T.planClick(X, 1, X.days[1].base, 'dL').L.s, ['c1', 'l1', 'dL', 'dE', 'g1']);
});
test('lock-aware seating also arranges Fill, start-all and the "who sits?" options', () => {
  const lineups = LAM.days.map(d => d.base);
  assert.deepEqual(T.suggestions(LAM, lineups, 1).L.s, ['c1', 'l1', 'dE', 'dL', 'g1']);
  assert.deepEqual(T.allGamesPlan(LAM, lineups, 'dL').find(x => x.di === 1).L.s, ['c1', 'l1', 'dE', 'dL', 'g1']);
  // every slot Moe fits holds a player who plays (Xavier Lind, D 7:00 PM, in the D slot): the option where Lind sits is arranged too
  const X = build(Object.assign({}, LA, { base: ['c1', 'l1', 'dX', 'dE', 'g1'], players: LA_PLAYERS.concat({ id: 'dX', fpg: 1, gp: 2, n: 'Xavier Lind', pos: ['D'], g: { 1: 'CBJ 7:00PM' } }) }));
  const r = T.planClick(X, 1, X.days[1].base, 'dL');
  assert.equal(r.k, 'pick');
  assert.deepEqual(r.opts.find(o => o.out === 'dX').s, ['c1', 'l1', 'dE', 'dL', 'g1']);
});
test('lock-aware seating moves only the players whose slot type changes (no rotation through same-type slots)', () => {
  const B = M.days[3].base, open = dropAt(B, 7), a = T.planClick(M, 3, open, 'l5');   // Thu: Leo Varga (D, 6:00 PM) sits in Skt
  const moved = open.s.map((q, i) => q !== a.L.s[i] ? i : -1).filter(i => i >= 0);
  assert.deepEqual(moved.map(i => [M.days[3].slots[i].pos, open.s[i], a.L.s[i]]), [['LW', null, 'l5'], ['D', 'd3', 'd6'], ['Skt', 'd6', 'd3']]);   // 9:00 PM D takes the flex for Luca Ferris (9:00 PM C/LW/RW)
});
test('the Grid has no ⋯ menu (2026-10-18, user): no handle button, no CSS for it, nothing in the legend or tooltips points to it', async () => {
  const src = (await import('node:fs')).readFileSync(new URL('../fantrax-game-tracker.user.js', import.meta.url), 'utf8');
  assert.ok(!src.includes('fgt-hdl'));
  assert.ok(!src.includes('Click ⋯') && !src.includes('⋯ choose'));
  for (const returnDates of [false, true]) assert.ok(!T.legendSpec('grid', { returnDates, editing: true }).some(x => x.text.includes('⋯')));
});
test('lock-aware seating when a not-playing starter makes room (click and start-all)', () => {
  // Nils Dorn (D, no game Tue) holds the D slot: Moe takes a slot, Dorn goes to reserve, and Dahl (1:00 PM) still leaves the flex
  const X = build(Object.assign({}, LA, { base: ['c1', 'l1', 'dN', 'dE', 'g1'], players: LA_PLAYERS.concat({ id: 'dN', fpg: 1, gp: 2, n: 'Nils Dorn', pos: ['D'], g: {} }) }));
  const r = T.planClick(X, 1, X.days[1].base, 'dL');
  assert.deepEqual([r.k, r.out, r.L.s], ['move', 'dN', ['c1', 'l1', 'dE', 'dL', 'g1']]);
  assert.match(r.text, /^Click: starts in Skt · Nils Dorn \(not playing\) to reserve \(others shift slots\)$/);
  const p = T.allGamesPlan(X, X.days.map(d => d.base), 'dL').find(x => x.di === 1);
  assert.deepEqual([p.out, p.L.s], ['dN', ['c1', 'l1', 'dE', 'dL', 'g1']]);
});
test('arrange keeps the same starters, each in a slot he fits, and never moves a locked or fixed player (random lineups)', () => {
  let seed = 7; const rnd = n => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  for (const X of [M, LAM]) for (let di = 0; di < X.days.length; di++) {
    const d = X.days[di]; if (d.state === 'past' || d.slots === null) continue;
    let L = clone(d.base);
    for (let step = 0; step < 300; step++) {
      const ids = X.order.filter(id => T.onRoster(X, di, id)), r = T.planClick(X, di, L, ids[rnd(ids.length)]);
      if (r.k === 'move') L = r.L;
      const s = T.arrange(X, di, L), msg = d.label + ' step ' + step;
      assert.deepEqual(s.filter(Boolean).sort(), L.s.filter(Boolean).sort(), msg);
      s.forEach((id, i) => { if (id) assert.ok(T.fits(X, di, id, d.slots[i].posId), msg + ' ' + id); });
      L.s.forEach((id, i) => { if (id && (id in d.fixed || T.locked(X, di, id))) assert.equal(s[i], id, msg + ' locked ' + id); });
    }
  }
});
test('arrange leaves a lineup it cannot re-seat as it was (a starter in a slot he does not fit is never dropped)', () => {
  // Tue 2:00 PM: Gil Moss (G, 1:00 PM) is locked in the only G slot and Gus Hale (G) sits in Skt, where no goalie fits
  const X = build(Object.assign({}, LA, { now: { d: 1, m: 14 * 60 }, players: LA_PLAYERS.concat({ id: 'g2', fpg: 1, gp: 2, n: 'Gil Moss', pos: ['G'], g: { 1: 'NYI 1:00PM' } }) }));
  const odd = ['c1', 'l1', null, 'g1', 'g2'];
  assert.equal(T.locked(X, 1, 'g2'), true);
  assert.deepEqual(T.arrange(X, 1, { s: odd, ir: [] }), odd);
});
