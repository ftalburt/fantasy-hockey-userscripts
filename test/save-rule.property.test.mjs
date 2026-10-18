// Property test (ported from the mock's save-rule.property.test.js): a day saves  <=>  the lineup it would send is legal.
// Random edits through the pure API; legality is checked by an independent copy of the rules written against the fixture's
// raw player list (positions, roster days, IR eligibility, IR cap, total, game times), never against the model's helpers.
// FGT_PROPERTY_SEEDS=15 FGT_PROPERTY_STEPS=4000 node --test test/save-rule.property.test.mjs runs the full version.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkTeam, MOCK, MOCK_TEAM, BASE, SLOT_TYPES, POS_ID, TIMES, IR_CAP } from './lineup-fixtures.mjs';
const T = createRequire(import.meta.url)('../fantrax-game-tracker.user.js');

const SEEDS = +(process.env.FGT_PROPERTY_SEEDS || 5), STEPS = +(process.env.FGT_PROPERTY_STEPS || 2000), DAYS = MOCK.days;
const clone = L => ({ s: L.s.slice(), ir: L.ir.slice() });
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pick = (rnd, a) => a[Math.floor(rnd() * a.length)];

// Odd seeds: Dane Whitlock (l4) is fixed (a secondary row) in his base LW slot. Every third seed: a legal base (Brett Okafor
// d7 and Simon Ruud d8 IR-eligible all week, like C in lineup-edit.test.mjs), so refusals are not just the mock's illegal IR row.
// Seeds 2, 6, 10, 14 (seed % 4 === 2): Grant Holm (d1) carries Fantrax's lock flag (disableLineupChange) on every day: he must never move.
const LOCKED_ID = 'd1', lockSeed = seed => seed % 4 === 2;
const playersFor = seed => MOCK_TEAM.map(p => {
  const q0 = lockSeed(seed) && p.id === LOCKED_ID ? Object.assign({}, p, { disabled: true }) : p;
  const q = seed % 2 && p.id === 'l4' ? Object.assign({}, q0, { secondary: true }) : q0;
  const q2 = seed % 3 === 0 && (p.id === 'd7' || p.id === 'd8') ? Object.assign({}, q, { irElig: true }) : q;
  // IR swap (2026-10-05): even seeds make Luca Ferris (c5, reserve) IR-eligible, so reserve selections get x: targets too; on the
  // full-IR variant Ryan Kask (l3, IR-eligible) starts the week on IR, a third IR place holding him (cap = IR count, as the real league).
  const q3 = seed % 2 === 0 && p.id === 'c5' ? Object.assign({}, q2, { irElig: true }) : q2;
  return fullIR(seed) && p.id === 'l3' ? Object.assign({}, q3, { ir: true }) : q3;
});
// Seeds 5, 10, 15 (seed % 5 === 0): IR cap 3 with three players on IR (the mock's two plus l3) — IR starts full, as the real league.
const fullIR = seed => seed % 5 === 0, capFor = seed => fullIR(seed) ? 3 : IR_CAP;

// ---- Fantrax's rules, independently (raw fixture data only)
const tmin = s => { const m = s.match(/(\d+):(\d+)(AM|PM)/); let h = +m[1] % 12; if (m[3] === 'PM') h += 12; return h * 60 + +m[2]; };
function rules(P, cap) {
  const BY = Object.fromEntries(P.map(p => [p.id, p]));
  const onR = (id, d) => { const p = BY[id]; return (p.from == null || d >= p.from) && (p.until == null || d <= p.until); };
  const irOk = (id, d) => { const e = BY[id].irElig; return e === true || (typeof e === 'number' && d < e); };
  const fitsT = (id, t) => t === 'Skt' ? !BY[id].pos.includes('G') : BY[id].pos.includes(t);
  const lockedT = (now, id, d) => { if (d < now.d || BY[id].disabled) return true; const g = (BY[id].g || {})[d]; return d === now.d && !!g && tmin(g.split(' ')[1]) <= now.m; };
  const typeOf = (L, id) => { const s = L.s.indexOf(id); return s >= 0 ? SLOT_TYPES[s] : L.ir.includes(id) ? 'IR' : 'Res'; };
  const sameTypes = (A, B, d) => P.every(p => !onR(p.id, d) || typeOf(A, p.id) === typeOf(B, p.id));
  // → 'ok' or why the lineup is illegal against `base` (Fantrax's lineup that day) at `now` with roster max `total`
  function why(st, d, L) {
    const seen = new Set(), base = st.bases[d];
    for (let i = 0; i < L.s.length; i++) {
      const id = L.s[i]; if (!id) continue;
      if (seen.has(id)) return 'dup ' + id; if (!onR(id, d)) return 'notonroster ' + id; if (!fitsT(id, SLOT_TYPES[i])) return 'fit ' + id + ' ' + SLOT_TYPES[i]; seen.add(id);
    }
    for (const id of L.ir) { if (seen.has(id)) return 'dupir ' + id; if (!onR(id, d)) return 'irnotroster ' + id; if (!irOk(id, d)) return 'irelig ' + id; seen.add(id); }
    if (L.ir.length > cap) return 'ircap';
    const outside = P.filter(p => onR(p.id, d) && !L.ir.includes(p.id)).length;
    if (outside > st.total) return 'over ' + outside + '/' + st.total;
    for (const p of P) {
      if (!onR(p.id, d)) continue;
      if (p.secondary && (base.s.indexOf(p.id) !== L.s.indexOf(p.id) || base.ir.includes(p.id) !== L.ir.includes(p.id))) return 'fixed moved ' + p.id;
      if (lockedT(st.now, p.id, d) && typeOf(base, p.id) !== typeOf(L, p.id)) return 'locked moved ' + p.id + ' base ' + typeOf(base, p.id) + ' new ' + typeOf(L, p.id);
    }
    return 'ok';
  }
  const baseFor = d => ({ s: BASE.map(id => id && onR(id, d) && !BY[id].ir ? id : null), ir: P.filter(p => p.ir && onR(p.id, d)).map(p => p.id) });
  return { BY, onR, why, legal: (st, d, L) => why(st, d, L) === 'ok', sameTypes, baseFor, lockedT, typeOf, irOk, fitsT };
}

// The model for the test's state: each day built from its own base (the fixture's, or what the test last saved on that day).
function modelFor(P, R, st, cache) {
  const days = [];
  let first = null;
  for (let d = 0; d < DAYS; d++) {
    const B = st.bases[d], key = JSON.stringify([st.now, B]);
    let X = cache.get(key);
    if (!X) {
      const players = P.map(p => R.onR(p.id, d) ? Object.assign({}, p, { ir: B.ir.includes(p.id) }) : p);
      const { team, extras, now, opts } = mkTeam(Object.assign({}, MOCK, { now: st.now, base: B.s, players, limits: { total: MOCK.limits.total, ir: st.cap } }));
      X = T.buildEditModel(team, extras, now, opts);
      assert.deepEqual(X.days[d].slots.map(s => s.posId), SLOT_TYPES.map(t => POS_ID[t]));   // slot i is SLOT_TYPES[i]
      assert.deepEqual(X.days[d].base.s, B.s); assert.deepEqual(X.days[d].base.ir.slice().sort(), B.ir.slice().sort());
      cache.set(key, X);
    }
    first = first || X; days.push(X.days[d]);
  }
  return Object.assign({}, first, { days, limits: Object.assign({}, first.limits, { total: st.total }) });
}

function runSeed(seed, out) {
  const rnd = mulberry(seed), P = playersFor(seed), R = rules(P, capFor(seed)), cache = new Map();
  const st = { now: TIMES[2], total: MOCK.limits.total, cap: capFor(seed), bases: Array.from({ length: DAYS }, (_, d) => R.baseFor(d)) };
  let M = modelFor(P, R, st, cache), lineups = st.bases.map(clone);
  let stored = null, held = [];
  const undo = [], edit = ls => { undo.push(lineups.map(clone)); lineups = ls; };
  const setDay = (d, L) => { const ls = lineups.map(clone); ls[d] = clone(L); edit(ls); };
  const rosterOn = d => P.map(p => p.id).filter(id => R.onR(id, d));
  const randomMove = () => {
    const d = Math.floor(rnd() * DAYS), L = lineups[d], r = rnd();
    const b = T.bench(M, d, L), sel = r < 0.5 || (!b.length && !L.ir.length) ? { kind: 'slot', i: Math.floor(rnd() * L.s.length) }
      : r < 0.85 && b.length ? { kind: 'bench', id: pick(rnd, b) } : L.ir.length ? { kind: 'ir', id: pick(rnd, L.ir) } : { kind: 'slot', i: Math.floor(rnd() * L.s.length) };
    const keys = [...T.targetsFor(M, d, L, sel)];
    if (!keys.length) return;
    const k = pick(rnd, keys);
    if (k.startsWith('x:')) return checkSwap(d, L, sel, k.slice(2));   // the same on-the-spot check as irSwap
    const N = T.computeMove(M, d, L, sel, k);
    if (!N.blocked) setDay(d, N);
  };
  // IR swap: an IR-eligible player outside IR, selected in his slot or on reserve, swapped with a random x: target (targetsFor's keys).
  // Checked on the spot against the raw rules: exactly he and the IR player move, he is IR-eligible, the IR player lands in the slot he
  // left only if he fits it (else reserve), neither is locked or fixed, IR and the roster outside IR keep their counts.
  const irSwap = () => {
    const d = Math.floor(rnd() * DAYS), L = lineups[d], cand = rosterOn(d).filter(id => !L.ir.includes(id) && R.irOk(id, d));
    if (!cand.length) return randomMove();
    const id = pick(rnd, cand), s = L.s.indexOf(id), sel = s >= 0 ? { kind: 'slot', i: s } : { kind: 'bench', id };
    const xs = [...T.targetsFor(M, d, L, sel)].filter(k => k.startsWith('x:'));
    if (!xs.length) return randomMove();
    checkSwap(d, L, sel, pick(rnd, xs).slice(2));
  };
  function checkSwap(d, L, sel, y) {
    const id = sel.kind === 'slot' ? L.s[sel.i] : sel.id, N = T.computeMove(M, d, L, sel, 'x:' + y), bad = w => out.bad.push({ seed, step: out.step, d, what: 'IR swap ' + id + ' <-> ' + y + ': ' + w });
    out.swaps++;
    if (N.blocked || N.paired) bad('blocked or paired');
    const moved = rosterOn(d).filter(q => R.typeOf(L, q) !== R.typeOf(N, q)).sort();
    if (JSON.stringify(moved) !== JSON.stringify([id, y].sort())) bad('moved ' + moved.join(','));
    if (!N.ir.includes(id) || N.ir.includes(y)) bad('IR ' + N.ir.join(','));
    if (!R.irOk(id, d)) bad('not IR-eligible');
    if (L.ir.length < st.cap) bad('offered with IR room');
    if (N.ir.length !== L.ir.length) bad('IR count ' + L.ir.length + '->' + N.ir.length);
    const outside = X => rosterOn(d).filter(q => !X.ir.includes(q)).length;
    if (outside(N) !== outside(L)) bad('roster count ' + outside(L) + '->' + outside(N));
    const ys = N.s.indexOf(y);
    if (ys >= 0 && (sel.kind !== 'slot' || ys !== sel.i || !R.fitsT(y, SLOT_TYPES[ys]))) bad('IR player in slot ' + ys);
    if (ys < 0 && sel.kind === 'slot' && R.fitsT(y, SLOT_TYPES[sel.i])) bad('IR player sent to reserve though he fits ' + SLOT_TYPES[sel.i]);
    for (const q of [id, y]) if (R.lockedT(st.now, q, d) || R.BY[q].secondary) bad(q + ' is locked or fixed');
    setDay(d, N);
  }
  const click = () => {
    const d = Math.floor(rnd() * DAYS), c = T.planClick(M, d, lineups[d], pick(rnd, rosterOn(d)));
    if (c.k === 'move') setDay(d, c.L);
    else if (c.k === 'pick') setDay(d, { s: pick(rnd, c.opts).s, ir: lineups[d].ir });
  };
  const verify = step => {
    for (let d = 0; d < DAYS; d++) {
      const L = lineups[d], sp = T.savePlan(M, d, L), B = st.bases[d];
      if (sp.none) { if (!R.sameTypes(L, B, d)) out.bad.push({ seed, step, d, what: 'none, but the lineup changed' }); continue; }
      out.checks++;
      if (sp.ok) {
        out.saves++;
        if (!R.legal(st, d, sp.L)) out.bad.push({ seed, step, d, what: 'saves an illegal lineup', why: R.why(st, d, sp.L) });
        if (T.sameFieldMap(T.fieldMapOf(M, d, sp.L), T.fieldMapOf(M, d, M.days[d].base)) || R.sameTypes(sp.L, B, d)) out.bad.push({ seed, step, d, what: 'saves nothing' });
        // what is sent is the user's lineup, except each locked player whose move can't happen, who stays where Fantrax has him
        const K = new Set(P.map(p => p.id).filter(id => R.onR(id, d) && R.lockedT(st.now, id, d) && R.typeOf(L, id) !== R.typeOf(B, id)));
        const off = P.map(p => p.id).filter(id => R.onR(id, d) && R.typeOf(sp.L, id) !== R.typeOf(K.has(id) ? B : L, id));
        if (off.length) out.bad.push({ seed, step, d, what: 'sends a lineup other than the user\'s', why: off.map(id => id + ' ' + R.typeOf(L, id) + '->' + R.typeOf(sp.L, id)).join(', ') });
        if (lockSeed(seed) && R.typeOf(sp.L, LOCKED_ID) !== R.typeOf(B, LOCKED_ID)) out.bad.push({ seed, step, d, what: 'a player with the lock flag moved in a saved lineup', why: R.typeOf(B, LOCKED_ID) + '->' + R.typeOf(sp.L, LOCKED_ID) });
        const dr = new Set(sp.dropped);
        if (dr.size !== K.size || [...K].some(id => !dr.has(id))) out.bad.push({ seed, step, d, what: 'dropped moves differ', why: JSON.stringify([sp.dropped, [...K]]) });
      } else {
        out.refusals++;
        if (R.legal(st, d, B)) out.legalBaseRefusals++;
        // refused: the pending lineup itself must be illegal (a locked move counts), or there is nothing to send
        if (R.legal(st, d, L) && !R.sameTypes(L, B, d)) out.bad.push({ seed, step, d, what: 'refuses a legal lineup', why: sp.why || sp.errors.join(' | ') });
      }
    }
  };
  for (let step = 0; step < STEPS; step++) {
    out.step = step;
    const r = Math.floor(rnd() * 100);
    if (r < 35) click();
    else if (r < 70) randomMove();
    else if (r < 74) { const d = Math.floor(rnd() * DAYS), N = T.toIR(M, d, lineups[d], pick(rnd, rosterOn(d))); if (N) setDay(d, N); }
    else if (r < 77) { const d = Math.floor(rnd() * DAYS); setDay(d, T.suggestions(M, lineups, d).L); }
    else if (r < 79) {
      const plan = T.allGamesPlan(M, lineups, pick(rnd, P.map(p => p.id))), ls = lineups.map(clone);
      for (const e of plan) if (e.L) ls[e.di] = clone(e.L);
      edit(ls);
    }
    else if (r < 81) edit(T.fillWeek(M, lineups).lineups);
    else if (r < 84) click();
    else if (r < 87) { if (undo.length) lineups = undo.pop(); }
    else if (r < 89) {
      const M1 = M; st.now = pick(rnd, TIMES); M = modelFor(P, R, st, cache);
      stored = T.pendingFrom(M1, lineups, stored, held); const rr = T.reapply(M, stored); lineups = rr.lineups.map(clone); held = rr.conflicts;
      // a conflict is never dropped silently: it is still reported after the next pendingFrom + reapply on unchanged data
      const again = T.reapply(M, T.pendingFrom(M, lineups, stored, held)).conflicts;
      for (const c of held) if (!again.some(x => x.di === c.di && x.id === c.id && x.reason === c.reason)) out.bad.push({ seed, step, what: 'conflict dropped', why: JSON.stringify(c) });
    }
    else if (r < 91) { st.total = 24 + Math.floor(rnd() * 4); M = modelFor(P, R, st, cache); }
    else if (r < 93) irSwap();
    else if (r < 95) {   // save: each day that will save becomes that day's base
      let any = false;
      lineups = lineups.map((L, d) => { const sp = T.savePlan(M, d, L); if (!sp.ok) return L; any = true; st.bases[d] = clone(sp.L); if (stored) delete stored.days[M.days[d].day]; held = held.filter(c => c.di !== d); return clone(sp.L); });   // a saved day's pending entry is cleared
      if (any) { M = modelFor(P, R, st, cache); out.saved++; }
    }
    else if (r < 96) edit(st.bases.map(clone));
    else if (r < 98) {
      // a change on Fantrax's own page while moves are pending: the panel's moves are stored (persist), one player moves on Fantrax that
      // day, the refresh re-applies and re-stores (syncEdit); then one panel edit, half the time on the player Fantrax moved. What the
      // panel then shows must be what storage re-applies on the same data: no lineup difference and no new conflict.
      stored = T.pendingFrom(M, lineups, stored, held);
      const d = Math.floor(rnd() * DAYS), id = pick(rnd, rosterOn(d)), c = T.planClick(M, d, st.bases[d], id);
      if (M.days[d].state !== 'past' && (c.k === 'move' || c.k === 'pick')) {
        st.bases[d] = clone(c.k === 'move' ? c.L : { s: pick(rnd, c.opts).s, ir: st.bases[d].ir }); M = modelFor(P, R, st, cache);
        const rr = T.reapply(M, stored); lineups = rr.lineups.map(clone); held = rr.conflicts; stored = T.pendingFrom(M, lineups, stored, held);
        if (rnd() < 0.5) { const c2 = T.planClick(M, d, lineups[d], id); if (c2.k === 'move') setDay(d, c2.L); else if (c2.k === 'pick') setDay(d, { s: pick(rnd, c2.opts).s, ir: lineups[d].ir }); }
        else click();
        const s2 = T.pendingFrom(M, lineups, stored, held), r2 = T.reapply(M, s2);
        for (let dd = 0; dd < DAYS; dd++) {
          if (held.some(x => x.di === dd)) continue;   // a held conflict keeps its stored move, not the panel's
          if (r2.conflicts.some(x => x.di === dd)) out.bad.push({ seed, step, d: dd, what: 'a panel edit after a change on Fantrax re-applies as a conflict', why: JSON.stringify(r2.conflicts.filter(x => x.di === dd)) });
          else if (!T.sameFieldMap(T.fieldMapOf(M, dd, r2.lineups[dd]), T.fieldMapOf(M, dd, lineups[dd]))) out.bad.push({ seed, step, d: dd, what: 'the panel shows a lineup storage does not re-apply', why: T.changes(M, dd, lineups[dd]).map(x => x.id + ':' + x.text).join(', ') + ' vs ' + T.changes(M, dd, r2.lineups[dd]).map(x => x.id + ':' + x.text).join(', ') });
        }
        stored = s2; out.fantraxChanges++;
      }
    }
    verify(step);
  }
}

test('save rule: a day saves if, and only if, the lineup it would send is legal (' + SEEDS + ' seeds x ' + STEPS + ' steps)', () => {
  const out = { swaps: 0, checks: 0, saves: 0, refusals: 0, legalBaseRefusals: 0, saved: 0, fantraxChanges: 0, bad: [] };
  for (let seed = 1; seed <= SEEDS; seed++) runSeed(seed, out);
  console.log('seeds ' + SEEDS + ' · steps ' + STEPS + ' · day checks ' + out.checks + ' · would save ' + out.saves + ' · refused ' + out.refusals + ' (base legal: ' + out.legalBaseRefusals + ') · saves applied ' + out.saved + ' · changes on Fantrax ' + out.fantraxChanges + ' · IR swaps ' + out.swaps + ' · violations ' + out.bad.length);
  if (out.bad.length) console.log(JSON.stringify(out.bad.slice(0, 8), null, 1));
  assert.ok(out.saves > 0 && out.refusals > 0 && out.legalBaseRefusals > 0 && out.saved > 0 && out.fantraxChanges > 0 && out.swaps > 0, 'the run never saved, never refused, never changed a lineup on Fantrax or never swapped into a full IR: the property is vacuous');
  assert.equal(out.bad.length, 0);
});
