// ==UserScript==
// @name         Fantasy Hockey Game Tracker
// @namespace    http://ftalburt.com/
// @version      0.10.1
// @description  Adds information about number of games left to boxscore page on ESPN fantasy hockey
// @author       Forrest Talburt
// @match        https://fantasy.espn.com/hockey/boxscore*
// @grant        none
// @require      https://unpkg.com/axios/dist/axios.min.js
// ==/UserScript==

(async function () {
  let teamId = findGetParameter("teamId");
  let leagueId = findGetParameter("leagueId");
  let seasonId = parseInt(findGetParameter("seasonId"));

  let [leagueData, scheduleData] = (
    await Promise.all([
      axios.get(
        `https://fantasy.espn.com/apis/v3/games/fhl/seasons/${seasonId}/segments/0/leagues/${leagueId}?view=mBoxscore&view=mMatchupScore&view=mSchedule&view=mScoreboard&view=mSettings&view=mStatus&view=mTeam&view=mRoster&view=modular&view=mNav`
      ),
      axios.get(
        `https://fantasy.espn.com/apis/v3/games/fhl/seasons/${seasonId}/?view=proTeamSchedules`
      ),
    ])
  ).map((response) => response.data);
  let currentMatchupPeriod = leagueData.status.currentMatchupPeriod;
  let matchup = leagueData.schedule.find(
    (item) =>
      ((item.home && item.home.teamId == teamId) ||
        (item.away && item.away.teamId == teamId)) &&
      item.matchupPeriodId == currentMatchupPeriod
  );
  let awayTeamId = matchup.away.teamId;
  let homeTeamId = matchup.home.teamId;
  let awaySkaters = matchup.away.rosterForCurrentScoringPeriod.entries
    .filter((item) => item.lineupSlotId != 8)
    .map((item) => item.playerPoolEntry.player)
    .filter(
      (item) =>
        item.defaultPositionId != 5 &&
        item.injuryStatus != "INJURY_RESERVE" &&
        item.injuryStatus != "OUT" &&
        item.injuryStatus != "SUSPENSION"
    );
  let homeSkaters = matchup.home.rosterForCurrentScoringPeriod.entries
    .filter((item) => item.lineupSlotId != 8)
    .map((item) => item.playerPoolEntry.player)
    .filter(
      (item) =>
        item.defaultPositionId != 5 &&
        item.injuryStatus != "INJURY_RESERVE" &&
        item.injuryStatus != "OUT" &&
        item.injuryStatus != "SUSPENSION"
    );
  let awayGoalies = matchup.away.rosterForCurrentScoringPeriod.entries
    .filter((item) => item.lineupSlotId != 8)
    .map((item) => item.playerPoolEntry.player)
    .filter(
      (item) =>
        item.defaultPositionId == 5 &&
        item.injuryStatus != "INJURY_RESERVE" &&
        item.injuryStatus != "OUT" &&
        item.injuryStatus != "SUSPENSION"
    );
  let homeGoalies = matchup.home.rosterForCurrentScoringPeriod.entries
    .filter((item) => item.lineupSlotId != 8)
    .map((item) => item.playerPoolEntry.player)
    .filter(
      (item) =>
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
      (item) =>
        item.value != "total" &&
        item.value >= leagueData.status.latestScoringPeriod
    )
    .map((item) => item.value);
  let interval = setInterval(async () => {
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

      let listItems = [].slice
        .call(options)
        .filter(
          (item) =>
            item.value != "total" &&
            item.value >= leagueData.status.latestScoringPeriod
        );

      let scoringPeriods = listItems.map((item) => item.value);

      let dates = listItems.map((item) => item.innerText);
      let formattedDates = [];
      for (const date of dates) {
        let yearlessDate = new Date(`${date} 2000`);
        let dateWithYear =
          yearlessDate.getMonth() >= 7
            ? `${seasonId - 1}${padNumber(
                yearlessDate.getMonth() + 1
              )}${padNumber(yearlessDate.getDate())}`
            : `${seasonId}${padNumber(yearlessDate.getMonth() + 1)}${padNumber(
                yearlessDate.getDate()
              )}`;
        formattedDates.push(dateWithYear);
      }

      let schedulePromises = [];
      for (const formattedDate of formattedDates) {
        schedulePromises.push(
          axios.get(
            `https://site.api.espn.com/apis/fantasy/v2/games/fhl/games?useMap=true&dates=${formattedDate}&pbpOnly=true`
          )
        );
      }

      let scheduleResponses = await Promise.all(schedulePromises);

      let postponedGameIds = [];

      for (const scheduleResponse of scheduleResponses) {
        for (const event of scheduleResponse.data.events) {
          if (event.summary == "Postponed") {
            postponedGameIds.push(event.id);
          }
        }
      }

      let periodDetailsPromises = [];
      for (const period of scoringPeriods) {
        periodDetailsPromises.push(
          axios.get(
            `https://fantasy.espn.com/apis/v3/games/fhl/seasons/${seasonId}/segments/0/leagues/${leagueId}?view=mMatchup&scoringPeriodId=${period}`
          )
        );
      }
      let periodDetails = (await Promise.all(periodDetailsPromises)).map(
        (response) => response.data
      );

      let totalHomeSkaterGames = 0;
      let scheduledHomeSkaterGames = 0;
      let totalAwaySkaterGames = 0;
      let scheduledAwaySkaterGames = 0;
      let totalHomeGoalieGames = 0;
      let scheduledHomeGoalieGames = 0;
      let totalAwayGoalieGames = 0;
      let scheduledAwayGoalieGames = 0;

      awayGoalies.forEach((goalie) => {
        let goalieTeamGames = teamSchedules.find(
          (team) => team.id == goalie.proTeamId
        ).proGamesByScoringPeriod;
        scoringPeriods.forEach((period) => {
          if (
            goalieTeamGames[period] &&
            !postponedGameIds.includes(`${goalieTeamGames[period][0].id}`)
          ) {
            totalAwayGoalieGames++;
            let periodDetail = periodDetails.find(
              (periodDetail) => periodDetail.scoringPeriodId == period
            );
            let rosterForPeriod = periodDetail.teams.find(
              (team) => team.id == awayTeamId
            ).roster.entries;
            if (
              rosterForPeriod.find((entry) => entry.playerId == goalie.id)
                ?.lineupSlotId == 5
            ) {
              scheduledAwayGoalieGames++;
            }
          }
        });
      });

      getNewLimitsCell("away").innerHTML =
        "Potential goalie games left: " + totalAwayGoalieGames;
      getNewLimitsCell("away").innerHTML =
        "Scheduled goalie games: " + scheduledAwayGoalieGames;

      awaySkaters.forEach((skater) => {
        let skaterTeamGames = teamSchedules.find(
          (team) => team.id == skater.proTeamId
        ).proGamesByScoringPeriod;
        scoringPeriods.forEach((period) => {
          if (
            skaterTeamGames[period] &&
            !postponedGameIds.includes(`${skaterTeamGames[period][0].id}`)
          ) {
            totalAwaySkaterGames++;
            let periodDetail = periodDetails.find(
              (periodDetail) => periodDetail.scoringPeriodId == period
            );
            let rosterForPeriod = periodDetail.teams.find(
              (team) => team.id == awayTeamId
            ).roster.entries;
            if (
              [0, 1, 2, 3, 4, 6].includes(
                rosterForPeriod.find((entry) => entry.playerId == skater.id)
                  ?.lineupSlotId
              )
            ) {
              scheduledAwaySkaterGames++;
            }
          }
        });
      });

      getNewLimitsCell("away").innerHTML =
        "Potential skater games left: " + totalAwaySkaterGames;
      getNewLimitsCell("away").innerHTML =
        "Scheduled skater games: " + scheduledAwaySkaterGames;

      homeGoalies.forEach((goalie) => {
        let goalieTeamGames = teamSchedules.find(
          (team) => team.id == goalie.proTeamId
        ).proGamesByScoringPeriod;
        scoringPeriods.forEach((period) => {
          if (
            goalieTeamGames[period] &&
            !postponedGameIds.includes(`${goalieTeamGames[period][0].id}`)
          ) {
            totalHomeGoalieGames++;
            let periodDetail = periodDetails.find(
              (periodDetail) => periodDetail.scoringPeriodId == period
            );
            let rosterForPeriod = periodDetail.teams.find(
              (team) => team.id == homeTeamId
            ).roster.entries;
            if (
              rosterForPeriod.find((entry) => entry.playerId == goalie.id)
                ?.lineupSlotId == 5
            ) {
              scheduledHomeGoalieGames++;
            }
          }
        });
      });

      getNewLimitsCell("home").innerHTML =
        "Potential goalie games left: " + totalHomeGoalieGames;
      getNewLimitsCell("home").innerHTML =
        "Scheduled goalie games: " + scheduledHomeGoalieGames;

      homeSkaters.forEach((skater) => {
        let skaterTeamGames = teamSchedules.find(
          (team) => team.id == skater.proTeamId
        ).proGamesByScoringPeriod;
        scoringPeriods.forEach((period) => {
          if (
            skaterTeamGames[period] &&
            !postponedGameIds.includes(`${skaterTeamGames[period][0].id}`)
          ) {
            totalHomeSkaterGames++;
            let periodDetail = periodDetails.find(
              (periodDetail) => periodDetail.scoringPeriodId == period
            );
            let rosterForPeriod = periodDetail.teams.find(
              (team) => team.id == homeTeamId
            ).roster.entries;
            if (
              [0, 1, 2, 3, 4, 6].includes(
                rosterForPeriod.find((entry) => entry.playerId == skater.id)
                  ?.lineupSlotId
              )
            ) {
              scheduledHomeSkaterGames++;
            }
          }
        });
      });

      getNewLimitsCell("home").innerHTML =
        "Potential skater games left: " + totalHomeSkaterGames;
      getNewLimitsCell("home").innerHTML =
        "Scheduled skater games: " + scheduledHomeSkaterGames;
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
    .forEach(function (item) {
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

/**
 * Pad single digit numbers with a leading zero
 * @param {number} numToPad The number to pad
 * @returns {string} The padded number
 */
function padNumber(numToPad) {
  return `${numToPad < 10 ? "0" : ""}${numToPad}`;
}
