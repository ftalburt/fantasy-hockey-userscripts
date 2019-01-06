// ==UserScript==
// @name         Fantasy Hockey Game Tracker
// @namespace    http://ftalburt.com/
// @version      0.4
// @description  Adds information about number of games left to boxscore page on ESPN fantasy hockey
// @author       Forrest Talburt
// @match        http://fantasy.espn.com/hockey/boxscore*
// @grant        none
// @require      https://unpkg.com/axios/dist/axios.min.js
// ==/UserScript==

(async function() {
  let teamId = findGetParameter("teamId");
  let leagueId = findGetParameter("leagueId");
  let seasonId = findGetParameter("seasonId");

  let [leagueData, scheduleData] = (await Promise.all([
    axios.get(
      `http://fantasy.espn.com/apis/v3/games/fhl/seasons/${seasonId}/segments/0/leagues/${leagueId}?view=mBoxscore&view=mMatchupScore&view=mSchedule&view=mScoreboard&view=mSettings&view=mStatus&view=mTeam&view=mRoster&view=modular&view=mNav`
    ),
    axios.get(
      `http://fantasy.espn.com/apis/v3/games/fhl/seasons/${seasonId}/?view=proTeamSchedules`
    )
  ])).map(response => response.data);
  let currentMatchupPeriod = leagueData.status.currentMatchupPeriod;
  let matchup = leagueData.schedule.find(
    item =>
      (item.home.teamId == teamId || item.away.teamId == teamId) &&
      item.matchupPeriodId == currentMatchupPeriod
  );
  let awaySkaters = matchup.away.rosterForCurrentScoringPeriod.entries
    .map(item => item.playerPoolEntry.player)
    .filter(
      item =>
        item.defaultPositionId != 5 &&
        item.injuryStatus != "INJURY_RESERVE" &&
        item.injuryStatus != "OUT"
    );
  let homeSkaters = matchup.home.rosterForCurrentScoringPeriod.entries
    .map(item => item.playerPoolEntry.player)
    .filter(
      item =>
        item.defaultPositionId != 5 &&
        item.injuryStatus != "INJURY_RESERVE" &&
        item.injuryStatus != "OUT"
    );
  let awayGoalies = matchup.away.rosterForCurrentScoringPeriod.entries
    .map(item => item.playerPoolEntry.player)
    .filter(
      item =>
        item.defaultPositionId == 5 &&
        item.injuryStatus != "INJURY_RESERVE" &&
        item.injuryStatus != "OUT"
    );
  let homeGoalies = matchup.home.rosterForCurrentScoringPeriod.entries
    .map(item => item.playerPoolEntry.player)
    .filter(
      item =>
        item.defaultPositionId == 5 &&
        item.injuryStatus != "INJURY_RESERVE" &&
        item.injuryStatus != "OUT"
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

      let {
        groups: { awayGoaliePlayed, awayGoalieTotal }
      } = /(?<awayGoaliePlayed>\d+)\/(?<awayGoalieTotal>\d+)/.exec(
        document.querySelector(
          "div.away-team > div.team-limits > table:nth-child(1) > tr:nth-child(1) > td:nth-child(2)"
        ).innerText
      );
      let {
        groups: { awaySkaterPlayed, awaySkaterTotal }
      } = /(?<awaySkaterPlayed>\d+)\/(?<awaySkaterTotal>\d+)/.exec(
        document.querySelector(
          "div.away-team > div.team-limits > table:nth-child(1) > tr:nth-child(2) > td:nth-child(2)"
        ).innerText
      );
      let {
        groups: { homeGoaliePlayed, homeGoalieTotal }
      } = /(?<homeGoaliePlayed>\d+)\/(?<homeGoalieTotal>\d+)/.exec(
        document.querySelector(
          "div.home-team > div.team-limits > table:nth-child(1) > tr:nth-child(1) > td:nth-child(2)"
        ).innerText
      );
      let {
        groups: { homeSkaterPlayed, homeSkaterTotal }
      } = /(?<homeSkaterPlayed>\d+)\/(?<homeSkaterTotal>\d+)/.exec(
        document.querySelector(
          "div.home-team > div.team-limits > table:nth-child(1) > tr:nth-child(2) > td:nth-child(2)"
        ).innerText
      );

      let awayRow4 = document
        .querySelector("div.away-team > div.team-limits > table")
        .insertRow(-1);
      awayRow4.insertCell(-1);
      let awayDataCell4 = awayRow4.insertCell(-1);
      awayDataCell4.innerHTML =
        "Goalie games left: " + (awayGoalieTotal - awayGoaliePlayed);

      let awayRow3 = document
        .querySelector("div.away-team > div.team-limits > table")
        .insertRow(-1);
      awayRow3.insertCell(-1);
      let awayDataCell3 = awayRow3.insertCell(-1);
      awayDataCell3.innerHTML =
        "Skater games left: " + (awaySkaterTotal - awaySkaterPlayed);

      let homeRow4 = document
        .querySelector("div.home-team > div.team-limits > table")
        .insertRow(-1);
      homeRow4.insertCell(-1);
      let homeDataCell4 = homeRow4.insertCell(-1);
      homeDataCell4.innerHTML =
        "Goalie games left: " + (homeGoalieTotal - homeGoaliePlayed);

      let homeRow3 = document
        .querySelector("div.home-team > div.team-limits > table")
        .insertRow(-1);
      homeRow3.insertCell(-1);
      let homeDataCell3 = homeRow3.insertCell(-1);
      homeDataCell3.innerHTML =
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
      let awayRow2 = document
        .querySelector("div.away-team > div.team-limits > table")
        .insertRow(-1);
      awayRow2.insertCell(-1);
      let awayDataCell2 = awayRow2.insertCell(-1);
      awayDataCell2.innerHTML =
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
      let awayRow = document
        .querySelector("div.away-team > div.team-limits > table")
        .insertRow(-1);
      awayRow.insertCell(-1);
      let awayDataCell = awayRow.insertCell(-1);
      awayDataCell.innerHTML =
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
      let homeRow2 = document
        .querySelector("div.home-team > div.team-limits > table")
        .insertRow(-1);
      homeRow2.insertCell(-1);
      let homeDataCell2 = homeRow2.insertCell(-1);
      homeDataCell2.innerHTML =
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
      let homeRow = document
        .querySelector("div.home-team > div.team-limits > table")
        .insertRow(-1);
      homeRow.insertCell(-1);
      let homeDataCell = homeRow.insertCell(-1);
      homeDataCell.innerHTML =
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
