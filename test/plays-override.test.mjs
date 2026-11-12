// 1.5.2: "he plays" override. A player whose only blocker is Fantrax's injury tag (Out / IR tag, not suspended) can be started from
// the Grid; the click records the override and from then his games count like a healthy player's until the period ends.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkTeam, MOCK } from './lineup-fixtures.mjs';
const T = createRequire(import.meta.url)('../fantrax-game-tracker.user.js');

const withFlag = (id, flag) => Object.assign({}, MOCK, { players: MOCK.players.map(p => p.id === id ? Object.assign({}, p, { flag }) : p) });
const build = (spec, extra) => { const { team, extras, now, opts } = mkTeam(spec); return T.buildEditModel(team, extras, now, Object.assign({}, opts, extra || {})); };
const OUT = withFlag('c5', 'out');   // Luca Ferris, reserve: Wed @LAK 9:30PM, Thu @ANA 9:00PM, Sat @SJS, Sun @VGK
const M = build(OUT), day = di => M.days[di].day;

test('without an override an Out reserve player has no counted game', () => {
  assert.equal(T.counted(M, 3, 'c5'), false);
  assert.deepEqual(T.allGamesPlan(M, M.days.map(d => d.base), 'c5'), []);
});

test('planClick: a player blocked only by his injury tag starts anyway and asks for the override', () => {
  const pl = T.planClick(M, 3, M.days[3].base, 'c5');
  assert.equal(pl.k, 'move');
  assert.equal(pl.plays, 'c5');
  assert.ok(pl.L.s.includes('c5'));
  assert.match(pl.text, /Fantrax lists him out · you say he plays/);
});

test('planClick: the tag date shows in the note', () => {
  const D = build(Object.assign({}, OUT, { players: OUT.players.map(p => p.id === 'c5' ? Object.assign({}, p, { ret: 6 }) : p) }), { returnDates: true });
  const pl = T.planClick(D, 3, D.days[3].base, 'c5');
  assert.equal(pl.plays, 'c5');
  assert.match(pl.text, new RegExp('Fantrax lists him out until ' + T.dayLabel(D.days[6].day).split(' ')[1].replace(/\//g, '\\/') + ' · you say he plays'));
});

test('planClick: a suspended player still cannot be started for a game that will not count', () => {
  const S = build(withFlag('c5', 'susp'));
  const pl = T.planClick(S, 3, S.days[3].base, 'c5');
  assert.equal(pl.k, 'none');
  assert.match(pl.text, /won't count: nothing to gain/);
});

test('with the override his games count from its day to its end, and swaps and start-all treat him as playing', () => {
  const O = build(OUT, { plays: { c5: { from: day(3), until: day(6) } } });
  assert.equal(T.counted(O, 2, 'c5'), false);   // before the override's day
  assert.equal(T.counted(O, 3, 'c5'), true);
  assert.equal(T.counted(O, 6, 'c5'), true);
  assert.deepEqual(T.allGamesPlan(O, O.days.map(d => d.base), 'c5').map(x => x.di), [3, 5, 6]);
  const first = T.planClick(M, 3, M.days[3].base, 'c5');   // seats him (Ryan Kask, Out, sits)
  const next = T.planClick(O, 3, first.L, 'l5');            // another LW: c5 now plays, so he is not the one bumped
  assert.notEqual(next.out, 'c5');
  if (next.k === 'move') assert.ok(next.L.s.includes('c5'));
});

test('the override never applies to a suspended player', () => {
  const S = build(withFlag('c5', 'susp'), { plays: { c5: { from: day(3), until: day(6) } } });
  assert.equal(T.counted(S, 3, 'c5'), false);
});

test('explainTeam leaves an overridden player out of the return-date lines', () => {
  const { team, now } = mkTeam(OUT);
  assert.ok(T.explainTeam(team, now).none.some(e => e.id === 'c5'));
  assert.ok(!T.explainTeam(team, now, { c5: { from: day(3), until: day(6) } }).none.some(e => e.id === 'c5'));
});

test('stored overrides: added per league, dropped once their period has ended', () => {
  let all = T.addPlay({}, 'lg1', 'c5', '2026-11-11', '2026-11-15');
  all = T.addPlay(all, 'lg2', 'x9', '2026-11-01', '2026-11-08');
  assert.deepEqual(T.livePlays(all, 'lg1', '2026-11-15'), { c5: { from: '2026-11-11', until: '2026-11-15' } });
  assert.deepEqual(T.livePlays(all, 'lg1', '2026-11-16'), {});
  assert.deepEqual(T.livePlays(all, 'lg2', '2026-11-11'), {});
  assert.deepEqual(T.livePlays(undefined, 'lg1', '2026-11-11'), {});
  // a later click keeps the earlier start day
  assert.equal(T.addPlay(all, 'lg1', 'c5', '2026-11-14', '2026-11-15').lg1.c5.from, '2026-11-11');
});

// 1.5.2, multi-browser: the override lives in this browser only. A tagged player saved active on another device reads as "not counted"
// here; the panel names him with a one-click "He plays", and Fill says when it benches a tagged player.
const SAVED = Object.assign({}, OUT, { base: OUT.base.map(x => x === 'l3' ? 'c5' : x) });   // c5 saved active in Ryan Kask's LW slot
const MS = build(SAVED), baseS = MS.days.map(d => d.base);

test('unclaimedStarts: a tagged player saved active on a pending game this browser does not count', () => {
  const u = T.unclaimedStarts(MS, baseS).find(x => x.id === 'c5');
  assert.deepEqual(u.days, [2, 3, 5, 6]);   // his pending games (Mon/Tue are played)
  assert.match(T.unclaimedText(MS, u), /^Luca Ferris is tagged Out but active Wed, Thu, Sat, Sun: those games aren't counted in this browser\.$/);
});

test('unclaimedStarts: nothing once this browser has the override, or for a suspended player', () => {
  const O = build(SAVED, { plays: { c5: { from: MS.days[2].day, until: MS.days[6].day } } });
  assert.ok(!T.unclaimedStarts(O, O.days.map(d => d.base)).some(x => x.id === 'c5'));
  const S = build(Object.assign({}, SAVED, { players: SAVED.players.map(p => p.id === 'c5' ? Object.assign({}, p, { flag: 'susp' }) : p) }));
  assert.ok(!T.unclaimedStarts(S, S.days.map(d => d.base)).some(x => x.id === 'c5'));
});

test('unclaimedStarts: the tag date shows in the text', () => {
  const D = build(Object.assign({}, SAVED, { players: SAVED.players.map(p => p.id === 'c5' ? Object.assign({}, p, { ret: 6 }) : p) }), { returnDates: true });
  const u = T.unclaimedStarts(D, D.days.map(d => d.base)).find(x => x.id === 'c5');
  assert.deepEqual(u.days, [2, 3, 5]);   // Sun counts from his date
  assert.match(T.unclaimedText(D, u), /is tagged Out until \d+\/\d+ but active Wed, Thu, Sat:/);
});

test('Fill names a tagged player it benches', () => {
  const sg = T.suggestions(MS, baseS, 5);
  assert.ok(sg.moves.some(m => m.out === 'c5'));
  assert.match(sg.msg, /Luca Ferris \(tagged Out\) to reserve: if he plays, click "He plays" above first\./);
  const plain = T.suggestions(MS, baseS, 4);   // Fri: benches a healthy player only
  assert.doesNotMatch(plain.msg, /tagged/);
});
