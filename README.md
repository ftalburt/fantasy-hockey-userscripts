# fantasy-hockey-userscripts

Tampermonkey userscripts for fantasy hockey.

## Fantrax Game Tracker (`fantrax-game-tracker.user.js`)

Shows games played against the league's games-played cap, skaters and goalies separately, on two Fantrax pages:

- **Matchups** (`/livescoring`): a small table under each team's header — Played, Max, Left (Max − Played),
  Sched (games the active lineup still has this period, using each day's own lineup since Fantrax lineups are daily),
  Potential (Sched plus games players on reserve that day could add), and a verdict: red "over by N" (bench someone
  or lose the games), amber "N unused, bench covers all N" or "bench covers M" (activate reserve players on the right
  days), green "on track" / "N unused" (nothing on the bench to fill it).
- **Team Roster** (`/team/roster`): the same table under the page title on every tab (for the scoring period that
  contains the day shown in the Period picker), and on **Schedule - Week** two footer rows per group: active games per
  day and a running total against the max, with the day you would cross the cap in red. Saving a lineup change
  refreshes the numbers.
- **Week panel** (Team Roster, every tab, since 1.2.0): one column per day of the scoring period listing every lineup
  slot with that day's real lineup (Fantrax lineups are daily, and its Schedule - Week grid draws every day with the
  displayed day's slots). A slot shows the player, opponent and start time; **empty** when its player has no game that
  day (his name in grey); **open slot** when nobody is in it (a move to reserves carries forward to later days); an
  **OUT / IR / SUSP** tag, struck through, when Fantrax lists him as out (not counted); a **DTD / MINORS** note when he
  is day-to-day or assigned to the minors (still counted; hover the tag for Fantrax's wording).
  Under the goalie slots, "Bench, has a game" lists reserve players who play that day, the swaps worth making. Days
  already played are dimmed, today is marked. The "Week" link collapses the panel and remembers your choice.
- **Schedule - Week cells** (since 1.2.0) are recoloured by each day's lineup: green tint = in the active lineup that
  day, struck through = on reserve that day, red = active but out. Hover a cell for the wording.

Played and Max come from Fantrax's own Min/Max view, so they match what Fantrax enforces. Players on IR, tagged
Out or suspended never count; day-to-day players do. A game that has started today no longer counts as scheduled (whether Fantrax
adds it to Played before the final horn is a first-week check; if a started game's schedule cell loses its start time,
it will look scheduled until that is confirmed). Numbers refresh every five
minutes (one games-played call, one schedule call and one lineup call per day of the period, all read-only), whenever you change period, team or page, when you save a lineup, and when you come back to the tab.

Install: Tampermonkey → open the raw file → Install. Updates arrive automatically. The script only runs on
`www.fantrax.com/fantasy/league/*` (never the draft room), calls only Fantrax's read-only roster endpoints, and needs
no permissions (`@grant none`). To limit it to the two pages, replace the `@match` line with
`@match https://www.fantrax.com/fantasy/league/*/livescoring*` and `@match https://www.fantrax.com/fantasy/league/*/team/roster*`
(you then need to load or refresh the page on one of those URLs, because Fantrax navigates without page loads).

Tests: `node --test`.

## ESPN Fantasy Hockey Game Tracker (`fantasy-hockey-game-tracker.user.js`)

The original ESPN version (2015–2026 seasons). Unmaintained now that the league is on Fantrax.
