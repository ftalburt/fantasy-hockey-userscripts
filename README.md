# fantasy-hockey-userscripts

Tampermonkey userscripts for fantasy hockey.

## Fantrax Game Tracker (`fantrax-game-tracker.user.js`)

Keeps track of your league's weekly games-played limit (skaters and goalies separately), so you don't waste games by
going over it or leave games unused, and lets you set your lineup for the whole week from one panel.

- **Matchups:** a small table under each team's header: games **Played**, the **Max**, games **Left**, games your
  lineup is set to play (**Sched**), and what reserve players could add (**Potential**). A verdict says what to do:
  red "over by N" (bench someone or lose the games), amber "N unused, bench covers…" (start reserve players on the
  right days), green "on track".
- **Team Roster:** the same table above Fantrax's roster, on every tab (on a phone, under the Week panel). On **Schedule - Week**, two rows under each
  group show active games per day and the running total, with the day you would go over in red. Each cell is tinted
  green when that player is in your lineup that day, and red and struck through when he is active but out.
- **Week panel** (Team Roster): the whole scoring period at a glance, as **Columns** (one per day) or a **Grid** (one
  row per player). Each slot shows the player, opponent and start time (once the game has started, his fantasy points
  instead, with a red dot while it is live), **empty** when he has no game, **open** when nobody is in it, and tags for **OUT / IR / SUSP** (not counted) and **DTD / MINORS** (still counted). Games that go
  past the max are marked **over**. A meter at the top shows played + scheduled against the max. Click a day's ↗ to
  open that day on Fantrax. The **Week** link collapses the panel.
- **Players on IR:** a player in an IR slot who is due back this period gets a line under the table saying who could
  take his IR spot, or that bringing him back needs a drop.
- **Expected return dates** (off by default): turn on the **↩ Return dates** chip in the Week panel's header (on
  Matchups, tick "Count players from their Fantrax expected return date") to count an injured player from the date in
  his Fantrax injury report. Numbers that change turn violet, with a line saying why,
  and a `RET` tag marks those days in the Week panel. Fantrax's dates are often placeholders, so treat this as a
  second opinion.

Players on IR, Out or suspended never count; day-to-day players do. The numbers refresh every five minutes, and when
you change period, team or page, save a lineup, or come back to the tab.

### Setting your lineup from the Week panel

On your own team (in a league with daily lineups), the Week panel is editable as soon as it loads. Nothing reaches
Fantrax until you press **Save**.

- **Move players:** click a player or open slot (Columns) or a cell (Grid) to start or sit him for that day. If someone
  has to sit to make room, the cells you can choose light up; click one, or **Cancel**. The IR chips move players in
  and out of IR. In the Grid, the script picks each starter's slot: players whose games start earlier get the slots
  later players can't use, so the flex (Skt) stays open for later games (Fantrax locks each player when his game
  starts). To choose a slot yourself, use Columns.
- **Fill:** `start +N` starts a player in every remaining game he can play (`✓ all` means he already does).
  `Fill <N>` in a day header, or **Fill every day**, fills open slots with the best players by their Fantrax FP/G this
  season (shown under each name), never going past the games max.
- **Save:** your moves are kept if you refresh the page, and auto-refresh pauses until you save. **↶ Undo** and
  **Discard** take moves back. **Save <N> days** saves each changed day and then checks Fantrax to confirm it. Each
  day comes back saved, held (with Fantrax's reason) or failed, and anything not saved stays pending. The "Keep
  <Sun>'s lineup for later days" box carries the last day forward. Messages close with ×; most also fade on their own.
- **Safe by design:** the script never adds, drops, claims or trades players. A day is only saved if its lineup is
  legal (everyone in a slot he can play, IR and roster limits respected) and Fantrax agrees. If Fantrax says your roster
  is illegal, even because of another day, nothing is saved until you fix it on Fantrax. Moves for games that have
  already started are skipped. Warnings (going past the games max, starting an Out player) don't block a save.

Other teams' panels show the same view, read-only.

### On a phone

The Matchups tables stack in one block above Fantrax's scores, so the opponent's column stays in reach. The Week panel
opens in the Grid on today, showing as many whole days as fit the screen (one day per swipe), and also works with the
phone on its side. **📌 Pinned | Page** chooses how it scrolls: Pinned keeps the day headers in view and snaps to whole
rows; Page shows the whole panel and lets the page scroll. Tap anything greyed out or locked to see why.

Install: Tampermonkey → open the [raw file](https://raw.githubusercontent.com/ftalburt/fantasy-hockey-userscripts/master/fantrax-game-tracker.user.js)
→ Install. Updates arrive automatically. It runs on Fantrax league pages only (never the draft room), needs no special
permissions, and only writes to Fantrax when you press Save.

Tests: `node --test`.

## Fantrax Peripherals (`fantrax-peripherals.user.js`)

Shows how much of each skater's fantasy points come from **peripherals** (shots, hits, blocks, faceoffs and whatever
other non-scoring categories your league uses) rather than goals and assists, so you can spot players who score every
night without needing to find the net.

- **Players list:** **Peri** (peripheral fantasy points) and **Peri/G** (per game) after FP/G. Click either header to
  sort the whole player pool by it, just like FP/G; the first sort can take a few seconds.
- **Player card:** Peri and Peri/G in every table that has FPts or FP/G (Recent Games, Stats, Splits, Games...).
- **Team Roster:** Peri and Peri/G in the skaters table on the Stats, Fantasy Points, Trends and Schedule tabs, for any
  team.
- **Live Scoring / Matchups:** a Peri category, first among the skater stats, in **Fpts** mode (hidden in Stats mode,
  where every other number is a raw stat count).

On the Players, card and roster pages the order is always FPts | FP/G | Peri | Peri/G. It works in any Fantrax points
league: the scoring weights come from your league's own rules.

**`–`** means there is no number to show: goalies, Peri/G with no games played, projections, or values still loading
(they appear when you change page or come back to the tab). **`?`** means the script could not match Fantrax's own
FPts for that row, so it shows nothing rather than a wrong number; hover it for the reason.

The script only adds these columns; it never removes or changes anything Fantrax shows, it is read-only, and it does not
make pages load any slower.

Install: Tampermonkey → open the [raw file](https://raw.githubusercontent.com/ftalburt/fantasy-hockey-userscripts/master/fantrax-peripherals.user.js)
→ Install. Updates arrive automatically.

Tests: `node --test`.

## ESPN Fantasy Hockey Game Tracker (`fantasy-hockey-game-tracker.user.js`)

The original ESPN version (2015–2026 seasons). Unmaintained now that the league is on Fantrax.
