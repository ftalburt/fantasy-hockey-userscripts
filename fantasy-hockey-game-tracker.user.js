// ==UserScript==
// @name         Fantasy Hockey Game Tracker
// @namespace    http://ftalburt.com/
// @version      0.6.0
// @description  Adds information about number of games left to boxscore page on ESPN fantasy hockey
// @author       Forrest Talburt
// @match        https://fantasy.espn.com/hockey/boxscore*
// @grant        none
// @require      https://unpkg.com/axios/dist/axios.min.js
// ==/UserScript==

(async function() {
  let teamId = findGetParameter("teamId");
  let leagueId = findGetParameter("leagueId");
  let seasonId = findGetParameter("seasonId");

  let [leagueData, scheduleData] = (await Promise.all([
    axios.get(
      `https://fantasy.espn.com/apis/v3/games/fhl/seasons/${seasonId}/segments/0/leagues/${leagueId}?view=mBoxscore&view=mMatchupScore&view=mSchedule&view=mScoreboard&view=mSettings&view=mStatus&view=mTeam&view=mRoster&view=modular&view=mNav`
    ),
    axios.get(
      `https://fantasy.espn.com/apis/v3/games/fhl/seasons/${seasonId}/?view=proTeamSchedules`
    )
  ])).map(response => response.data);
  let currentMatchupPeriod = leagueData.status.currentMatchupPeriod;
  let matchup = leagueData.schedule.find(
    item =>
      ((item.home && item.home.teamId == teamId) ||
        (item.away && item.away.teamId == teamId)) &&
      item.matchupPeriodId == currentMatchupPeriod
  );
  let awaySkaters = matchup.away.rosterForCurrentScoringPeriod.entries
    .map(item => item.playerPoolEntry.player)
    .filter(
      item =>
        item.defaultPositionId != 5 &&
        item.injuryStatus != "INJURY_RESERVE" &&
        item.injuryStatus != "OUT" &&
        item.injuryStatus != "SUSPENSION"
    );
  let homeSkaters = matchup.home.rosterForCurrentScoringPeriod.entries
    .map(item => item.playerPoolEntry.player)
    .filter(
      item =>
        item.defaultPositionId != 5 &&
        item.injuryStatus != "INJURY_RESERVE" &&
        item.injuryStatus != "OUT" &&
        item.injuryStatus != "SUSPENSION"
    );
  let awayGoalies = matchup.away.rosterForCurrentScoringPeriod.entries
    .map(item => item.playerPoolEntry.player)
    .filter(
      item =>
        item.defaultPositionId == 5 &&
        item.injuryStatus != "INJURY_RESERVE" &&
        item.injuryStatus != "OUT" &&
        item.injuryStatus != "SUSPENSION"
    );
  let homeGoalies = matchup.home.rosterForCurrentScoringPeriod.entries
    .map(item => item.playerPoolEntry.player)
    .filter(
      item =>
        item.defaultPositionId == 5 &&
        item.injuryStatus != "INJURY_RESERVE" &&
        item.injuryStatus != "OUT" &&
        item.injuryStatus != "SUSPENSION"
    );
  let teamSchedules = scheduleData.settings.proTeams;

  let scoringPeriods = [].slice
    .call(
      document.querySelectorAll(".matchup-nav-section > div select > option")
    )
    .filter(
      item =>
        item.value != "total" &&
        item.value >= leagueData.status.latestScoringPeriod
    )
    .map(item => item.value);
  let interval = setInterval(() => {
    let options = document.querySelectorAll(
      ".matchup-nav-section > div select > option"
    );
    if (options.length > 0) {
      clearInterval(interval);

      let [, awayGoaliePlayed, awayGoalieTotal] = /(\d+)\/(\d+)/.exec(
        document.querySelector(
          "div.away-team > div.team-limits > table:nth-child(1) > tr:nth-child(1) > td:nth-child(2)"
        ).innerText
      );
      let [, awaySkaterPlayed, awaySkaterTotal] = /(\d+)\/(\d+)/.exec(
        document.querySelector(
          "div.away-team > div.team-limits > table:nth-child(1) > tr:nth-child(2) > td:nth-child(2)"
        ).innerText
      );
      let [, homeGoaliePlayed, homeGoalieTotal] = /(\d+)\/(\d+)/.exec(
        document.querySelector(
          "div.home-team > div.team-limits > table:nth-child(1) > tr:nth-child(1) > td:nth-child(2)"
        ).innerText
      );
      let [, homeSkaterPlayed, homeSkaterTotal] = /(\d+)\/(\d+)/.exec(
        document.querySelector(
          "div.home-team > div.team-limits > table:nth-child(1) > tr:nth-child(2) > td:nth-child(2)"
        ).innerText
      );

      getNewLimitsCell("away").innerHTML =
        "Goalie games left: " + (awayGoalieTotal - awayGoaliePlayed);

      getNewLimitsCell("away").innerHTML =
        "Skater games left: " + (awaySkaterTotal - awaySkaterPlayed);

      getNewLimitsCell("home").innerHTML =
        "Goalie games left: " + (homeGoalieTotal - homeGoaliePlayed);

      getNewLimitsCell("home").innerHTML =
        "Skater games left: " + (homeSkaterTotal - homeSkaterPlayed);

      let scoringPeriods = [].slice
        .call(options)
        .filter(
          item =>
            item.value != "total" &&
            item.value >= leagueData.status.latestScoringPeriod
        )
        .map(item => item.value);
      let totalHomeSkaterGames = 0;
      let totalAwaySkaterGames = 0;
      let totalHomeGoalieGames = 0;
      let totalAwayGoalieGames = 0;

      awayGoalies.forEach(goalie => {
        let goalieTeamGames = teamSchedules.find(
          team => team.id == goalie.proTeamId
        ).proGamesByScoringPeriod;
        scoringPeriods.forEach(period => {
          if (goalieTeamGames[period]) {
            totalAwayGoalieGames++;
          }
        });
      });

      getNewLimitsCell("away").innerHTML =
        "Potential goalie games left: " + totalAwayGoalieGames;

      awaySkaters.forEach(skater => {
        let skaterTeamGames = teamSchedules.find(
          team => team.id == skater.proTeamId
        ).proGamesByScoringPeriod;
        scoringPeriods.forEach(period => {
          if (skaterTeamGames[period]) {
            totalAwaySkaterGames++;
          }
        });
      });

      getNewLimitsCell("away").innerHTML =
        "Potential skater games left: " + totalAwaySkaterGames;

      homeGoalies.forEach(goalie => {
        let goalieTeamGames = teamSchedules.find(
          team => team.id == goalie.proTeamId
        ).proGamesByScoringPeriod;
        scoringPeriods.forEach(period => {
          if (goalieTeamGames[period]) {
            totalHomeGoalieGames++;
          }
        });
      });

      getNewLimitsCell("home").innerHTML =
        "Potential goalie games left: " + totalHomeGoalieGames;

      homeSkaters.forEach(skater => {
        let skaterTeamGames = teamSchedules.find(
          team => team.id == skater.proTeamId
        ).proGamesByScoringPeriod;
        scoringPeriods.forEach(period => {
          if (skaterTeamGames[period]) {
            totalHomeSkaterGames++;
          }
        });
      });

      getNewLimitsCell("home").innerHTML =
        "Potential skater games left: " + totalHomeSkaterGames;
    }
  }, 1000);
})();

// taken from https://stackoverflow.com/a/5448595
function findGetParameter(parameterName) {
  var result = null,
    tmp = [];
  location.search
    .substr(1)
    .split("&")
    .forEach(function(item) {
      tmp = item.split("=");
      if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    });
  return result;
}

function getNewLimitsCell(location) {
  let row = document
    .querySelector(`div.${location}-team > div.team-limits > table`)
    .insertRow(-1);
  row.insertCell(-1);
  return row.insertCell(-1);
}
