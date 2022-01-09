// ==UserScript==
// @name         Fantasy Hockey Game Tracker
// @namespace    http://ftalburt.com/
// @version      0.11.0
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
  let matchupPeriodId = findGetParameter("matchupPeriodId");

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
  let teamSchedules = scheduleData.settings.proTeams;

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
            `https://fantasy.espn.com/apis/v3/games/fhl/seasons/${seasonId}/segments/0/leagues/${leagueId}?view=mMatchup&scoringPeriodId=${period}`,
            {
              headers: {
                "x-fantasy-filter": `{"schedule":{"filterMatchupPeriodIds":{"value":[${matchupPeriodId}]}}}`,
              },
            }
          )
        );
      }
      let periodDetails = (await Promise.all(periodDetailsPromises)).map(
        (response) => response.data
      );

      let gameData = {
        home: {
          skater: {
            potentialGames: 0,
            scheduledGames: 0,
          },
          goalie: {
            potentialGames: 0,
            scheduledGames: 0,
          },
        },
        away: {
          skater: {
            potentialGames: 0,
            scheduledGames: 0,
          },
          goalie: {
            potentialGames: 0,
            scheduledGames: 0,
          },
        },
      };

      let homeTeamId;
      let awayTeamId;
      let firstLoopIteration = true;
      for (const periodDetail of periodDetails) {
        if (firstLoopIteration) {
          let matchup = periodDetail.schedule.find(
            (item) => item.home?.teamId == teamId || item.away?.teamId == teamId
          );
          homeTeamId = matchup.home?.teamId;
          awayTeamId = matchup.away?.teamId;
        }

        if (homeTeamId != undefined && awayTeamId != undefined) {
          let period = periodDetail.scoringPeriodId;
          // Update home gameData
          let homePlayers = periodDetail.teams.find(
            (team) => team.id == homeTeamId
          ).roster.entries;
          for (const player of homePlayers) {
            let playerTeamSchedule = teamSchedules.find(
              (team) => team.id == player.playerPoolEntry.player.proTeamId
            ).proGamesByScoringPeriod;

            if (
              player.playerPoolEntry.player.injuryStatus != "INJURY_RESERVE" &&
              player.playerPoolEntry.player.injuryStatus != "OUT" &&
              player.playerPoolEntry.player.injuryStatus != "SUSPENSION"
            ) {
              if (
                player.playerPoolEntry.player.defaultPositionId != 5 &&
                player.lineupSlotId != 8 &&
                playerTeamSchedule[period] &&
                !postponedGameIds.includes(
                  `${playerTeamSchedule[period][0].id}`
                )
              ) {
                gameData.home.skater.potentialGames++;
              } else if (
                player.playerPoolEntry.player.defaultPositionId == 5 &&
                playerTeamSchedule[period] &&
                !postponedGameIds.includes(
                  `${playerTeamSchedule[period][0].id}`
                )
              ) {
                gameData.home.goalie.potentialGames++;
              }

              if (
                [0, 1, 2, 3, 4, 6].includes(player.lineupSlotId) &&
                playerTeamSchedule[period] &&
                !postponedGameIds.includes(
                  `${playerTeamSchedule[period][0].id}`
                )
              ) {
                gameData.home.skater.scheduledGames++;
              } else if (
                player.lineupSlotId == 5 &&
                playerTeamSchedule[period] &&
                !postponedGameIds.includes(
                  `${playerTeamSchedule[period][0].id}`
                )
              ) {
                gameData.home.goalie.scheduledGames++;
              }
            }
          }
          // Update away gameData
          let awayPlayers = periodDetail.teams.find(
            (team) => team.id == awayTeamId
          ).roster.entries;
          for (const player of awayPlayers) {
            let playerTeamSchedule = teamSchedules.find(
              (team) => team.id == player.playerPoolEntry.player.proTeamId
            ).proGamesByScoringPeriod;

            if (
              player.playerPoolEntry.player.injuryStatus != "INJURY_RESERVE" &&
              player.playerPoolEntry.player.injuryStatus != "OUT" &&
              player.playerPoolEntry.player.injuryStatus != "SUSPENSION"
            ) {
              if (
                player.playerPoolEntry.player.defaultPositionId != 5 &&
                player.lineupSlotId != 8 &&
                playerTeamSchedule[period] &&
                !postponedGameIds.includes(
                  `${playerTeamSchedule[period][0].id}`
                )
              ) {
                gameData.away.skater.potentialGames++;
              } else if (
                player.playerPoolEntry.player.defaultPositionId == 5 &&
                playerTeamSchedule[period] &&
                !postponedGameIds.includes(
                  `${playerTeamSchedule[period][0].id}`
                )
              ) {
                gameData.away.goalie.potentialGames++;
              }

              if (
                [0, 1, 2, 3, 4, 6].includes(player.lineupSlotId) &&
                playerTeamSchedule[period] &&
                !postponedGameIds.includes(
                  `${playerTeamSchedule[period][0].id}`
                )
              ) {
                gameData.away.skater.scheduledGames++;
              } else if (
                player.lineupSlotId == 5 &&
                playerTeamSchedule[period] &&
                !postponedGameIds.includes(
                  `${playerTeamSchedule[period][0].id}`
                )
              ) {
                gameData.away.goalie.scheduledGames++;
              }
            }
          }
        } else {
          break;
        }
        firstLoopIteration = false;
      }

      getNewLimitsCell("away").innerHTML =
        "Potential goalie games left: " + gameData.away.goalie.potentialGames;
      getNewLimitsCell("away").innerHTML =
        "Scheduled goalie games: " + gameData.away.goalie.scheduledGames;
      getNewLimitsCell("away").innerHTML =
        "Potential skater games left: " + gameData.away.skater.potentialGames;
      getNewLimitsCell("away").innerHTML =
        "Scheduled skater games: " + gameData.away.skater.scheduledGames;

      getNewLimitsCell("home").innerHTML =
        "Potential goalie games left: " + gameData.home.goalie.potentialGames;
      getNewLimitsCell("home").innerHTML =
        "Scheduled goalie games: " + gameData.home.goalie.scheduledGames;
      getNewLimitsCell("home").innerHTML =
        "Potential skater games left: " + gameData.home.skater.potentialGames;
      getNewLimitsCell("home").innerHTML =
        "Scheduled skater games: " + gameData.home.skater.scheduledGames;
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
