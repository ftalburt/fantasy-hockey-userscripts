// Real Fantrax response shapes, hand-trimmed (captured 2026-10-17 in a logged-in browser, read-only calls).
// Public repo: no league, fantasy-team or manager identifiers. Only NHL player data (scorer.scorerId kept).
// See the ledger for what each shape means and how it was captured.

// getLeagueRulesOld -> data.content: ONLY the scoring <table>, a league WITH a position override
// (Points (Pt): Default 1.5, then an empty-category row: Defense 3). Four columns: Group, Category, Position, Points.
export const RULES_HTML = "<table class=\"fantasyTableLS rules\"><tr><th class=\"scGroup\"><p>Scoring Group</p></th><th class=\"scoringPts\"><p>Scoring Category</p></th><th class=\"position\"><p>Position</p></th><th class=\"points\"><p>Points</p></th></tr>    <tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"><p title=\"\">Assists (A)</p></td><td class=\"position\"><p><b>Default</b></p></td><td class=\"points\"><p>2</p></td></tr><tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"><p title=\"A player blocks a shot by an opposing shooter.\">Blocks (Blk)</p></td><td class=\"position\"><p><b>Default</b></p></td><td class=\"points\"><p>0.7</p></td></tr><tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"><p title=\"\">Faceoffs Lost (FOL)</p></td><td class=\"position\"><p><b>Default</b></p></td><td class=\"points\"><p>-0.27</p></td></tr><tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"><p title=\"\">Faceoffs Won (FOW)</p></td><td class=\"position\"><p><b>Default</b></p></td><td class=\"points\"><p>0.3</p></td></tr><tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"><p title=\"\">Game-winning Goals (GWG)</p></td><td class=\"position\"><p><b>Default</b></p></td><td class=\"points\"><p>2</p></td></tr><tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"><p title=\"\">Goals (G)</p></td><td class=\"position\"><p><b>Default</b></p></td><td class=\"points\"><p>3</p></td></tr><tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"><p title=\"Three or more goals in a game\">Hat Tricks (HT)</p></td><td class=\"position\"><p><b>Default</b></p></td><td class=\"points\"><p>3</p></td></tr><tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"><p title=\"\">Hits (Hit)</p></td><td class=\"position\"><p><b>Default</b></p></td><td class=\"points\"><p>0.6</p></td></tr><tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"><p title=\"Goals + Assists\">Points (Pt)</p></td><td class=\"position\"><p><b>Default</b></p></td><td class=\"points\"><p>1.5</p></td></tr><tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"></td><td class=\"position\"><p>Defense</p></td><td class=\"points\"><p>3</p></td></tr><tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"><p title=\"\">Shots on Goal (SOG)</p></td><td class=\"position\"><p><b>Default</b></p></td><td class=\"points\"><p>0.45</p></td></tr><tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"><p title=\"\">Power Play Points (PPP)</p></td><td class=\"position\"><p><b>Default</b></p></td><td class=\"points\"><p>1</p></td></tr><tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"><p title=\"\">Short-Handed Points (SHP)</p></td><td class=\"position\"><p><b>Default</b></p></td><td class=\"points\"><p>2</p></td></tr><tr><td class=\"scGroup\"><p>Goalies</p></td><td class=\"scoringPts\"><p title=\"\">Assists (A)</p></td><td class=\"position\"><p><b>Default</b></p></td><td class=\"points\"><p>3.5</p></td></tr><tr><td class=\"scGroup\"><p>Goalies</p></td><td class=\"scoringPts\"><p title=\"\">Goals Against (GA)</p></td><td class=\"position\"><p><b>Default</b></p></td><td class=\"points\"><p>-2.5</p></td></tr><tr><td class=\"scGroup\"><p>Goalies</p></td><td class=\"scoringPts\"><p title=\"\">Saves (SV)</p></td><td class=\"position\"><p><b>Default</b></p></td><td class=\"points\"><p>0.6</p></td></tr><tr><td class=\"scGroup\"><p>Goalies</p></td><td class=\"scoringPts\"><p title=\"\">Shutouts (SHO)</p></td><td class=\"position\"><p><b>Default</b></p></td><td class=\"points\"><p>4</p></td></tr><tr><td class=\"scGroup\"><p>Goalies</p></td><td class=\"scoringPts\"><p title=\"Includes Overtime Wins and Shootout Wins. Skaters cannot get a win using this category - for that - use the &#034;regular&#034; Wins category.\">Wins (Goalies only) (W)</p></td><td class=\"position\"><p><b>Default</b></p></td><td class=\"points\"><p>5</p></td></tr><tr><td class=\"scGroup\"><p>Goalies</p></td><td class=\"scoringPts\"><p title=\"\">Overtime Losses + Shootout Losses (OL+ShL)</p></td><td class=\"position\"><p><b>Default</b></p></td><td class=\"points\"><p>1</p></td></tr></table>";

// Same, from a league with NO position overrides: Fantrax drops the Position column (three columns).
export const RULES_HTML_NO_POSITION = "<table class=\"fantasyTableLS rules\"><tr><th class=\"scGroup\"><p>Scoring Group</p></th><th class=\"scoringPts\"><p>Scoring Category</p></th><th class=\"points\"><p>Points</p></th></tr>    <tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"><p title=\"\">Assists (A)</p></td><td class=\"points\"><p>3</p></td></tr><tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"><p title=\"\">Goals (G)</p></td><td class=\"points\"><p>4</p></td></tr><tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"><p title=\"By default, this is a positive category (i.e. the more Penalty Minutes the better).\">Penalty Minutes (PIM)</p></td><td class=\"points\"><p>0.5</p></td></tr><tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"><p title=\"\">Short-Handed Goals (SHG)</p></td><td class=\"points\"><p>2</p></td></tr><tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"><p title=\"\">Shots on Goal (SOG)</p></td><td class=\"points\"><p>0.5</p></td></tr><tr><td class=\"scGroup\"><p>Skaters</p></td><td class=\"scoringPts\"><p title=\"\">Power Play Points (PPP)</p></td><td class=\"points\"><p>1</p></td></tr><tr><td class=\"scGroup\"><p>Goalies</p></td><td class=\"scoringPts\"><p title=\"\">Assists (A)</p></td><td class=\"points\"><p>3</p></td></tr><tr><td class=\"scGroup\"><p>Goalies</p></td><td class=\"scoringPts\"><p title=\"\">Goals Against (GA)</p></td><td class=\"points\"><p>-1</p></td></tr><tr><td class=\"scGroup\"><p>Goalies</p></td><td class=\"scoringPts\"><p title=\"By default, this is a positive category (i.e. the more Penalty Minutes the better).\">Penalty Minutes (PIM)</p></td><td class=\"points\"><p>0.5</p></td></tr><tr><td class=\"scGroup\"><p>Goalies</p></td><td class=\"scoringPts\"><p title=\"\">Saves (SV)</p></td><td class=\"points\"><p>0.25</p></td></tr><tr><td class=\"scGroup\"><p>Goalies</p></td><td class=\"scoringPts\"><p title=\"\">Shutouts (SHO)</p></td><td class=\"points\"><p>5</p></td></tr><tr><td class=\"scGroup\"><p>Goalies</p></td><td class=\"scoringPts\"><p title=\"Includes Overtime Wins and Shootout Wins. Skaters cannot get a win using this category - for that - use the &#034;regular&#034; Wins category.\">Wins (Goalies only) (W)</p></td><td class=\"points\"><p>5</p></td></tr></table>";

// getPlayerStats, Skaters view (positionOrGroup HOCKEY_SKATING), 2026-27 YTD, scoringCategoryType 5 (Tracked),
// All Available. Rows: a C with faceoffs, a multi-position winger, a D with points, a D with 0 points, a GP-0 skater.
export const STATS_RESPONSE = {
 "tableHeader": {
  "cells": [
   {
    "sortDirection": 1,
    "name": "Ranking based on fantasy points among all players",
    "width": 4,
    "shortName": "Rk",
    "key": "rankOv"
   },
   {
    "sortDirection": 1,
    "sortKey": "STATUS",
    "sortType": "STATUS",
    "name": "Status",
    "width": 8.5,
    "shortName": "Sta",
    "key": "status"
   },
   {
    "sortDirection": 1,
    "sortKey": "AGE",
    "sortType": "AGE",
    "name": "Age",
    "width": 3.5,
    "shortName": "Age",
    "key": "age"
   },
   {
    "eventStr": true,
    "sortDirection": 1,
    "name": "Opponent",
    "shortName": "Opp",
    "key": "opponent"
   },
   {
    "sortDirection": 1,
    "sortKey": "SCORE",
    "sortType": "SCORE",
    "width": 5.5,
    "shortName": "FPts",
    "key": "fpts"
   },
   {
    "sortDirection": 1,
    "sortKey": "FPTS_PER_GAME",
    "sortType": "FPTS_PER_GAME",
    "width": 4.5,
    "shortName": "FP/G",
    "key": "fptsPerGame"
   },
   {
    "sortDirection": 1,
    "sortKey": "OVERVIEW_PERCENT_OWNED_2",
    "sortType": "OVERVIEW_PERCENT_OWNED_2",
    "name": "% of Fantrax leagues that have this player on their roster this week",
    "shortName": "Ros"
   },
   {
    "sortDirection": 1,
    "sortKey": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2",
    "sortType": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2",
    "name": "Change in percent Rostered from previous week",
    "shortName": "+/-"
   },
   {
    "sortDirection": 1,
    "sortKey": "SCORING_CATEGORY_2010#2100#-1",
    "scipId": "2010#2100#-1",
    "sortType": "SCORING_CATEGORY",
    "name": "Games Played",
    "width": 2.5,
    "shortName": "GP",
    "key": "2010#2100#-1",
    "maxWidth": 3
   },
   {
    "sortDirection": 1,
    "sortKey": "SCORING_CATEGORY_2010#2130#-1",
    "scipId": "2010#2130#-1",
    "sortType": "SCORING_CATEGORY",
    "name": "Goals",
    "width": 1.5,
    "shortName": "G",
    "key": "2010#2130#-1",
    "maxWidth": 3
   },
   {
    "sortDirection": 1,
    "sortKey": "SCORING_CATEGORY_2010#2090#-1",
    "scipId": "2010#2090#-1",
    "sortType": "SCORING_CATEGORY",
    "name": "Assists",
    "width": 1.5,
    "shortName": "A",
    "key": "2010#2090#-1",
    "maxWidth": 3
   },
   {
    "sortDirection": 1,
    "sortKey": "SCORING_CATEGORY_2010#2190#-1",
    "scipId": "2010#2190#-1",
    "sortType": "SCORING_CATEGORY",
    "name": "Points -- Goals + Assists",
    "width": 2.5,
    "shortName": "Pt",
    "key": "2010#2190#-1",
    "maxWidth": 3
   },
   {
    "sortDirection": 1,
    "sortKey": "SCORING_CATEGORY_2010#2270#-1",
    "scipId": "2010#2270#-1",
    "sortType": "SCORING_CATEGORY",
    "name": "Shots on Goal",
    "width": 3.5,
    "shortName": "SOG",
    "key": "2010#2270#-1",
    "maxWidth": 3
   },
   {
    "sortDirection": 1,
    "sortKey": "SCORING_CATEGORY_2010#2120#-1",
    "scipId": "2010#2120#-1",
    "sortType": "SCORING_CATEGORY",
    "name": "Game-winning Goals",
    "width": 3.5,
    "shortName": "GWG",
    "key": "2010#2120#-1",
    "maxWidth": 3
   },
   {
    "sortDirection": 1,
    "sortKey": "SCORING_CATEGORY_2010#2327#-1",
    "scipId": "2010#2327#-1",
    "sortType": "SCORING_CATEGORY",
    "name": "Power Play Points",
    "width": 3.5,
    "shortName": "PPP",
    "key": "2010#2327#-1",
    "maxWidth": 3
   },
   {
    "sortDirection": 1,
    "sortKey": "SCORING_CATEGORY_2010#2344#-1",
    "scipId": "2010#2344#-1",
    "sortType": "SCORING_CATEGORY",
    "name": "Short-Handed Points",
    "width": 3.5,
    "shortName": "SHP",
    "key": "2010#2344#-1",
    "maxWidth": 3
   },
   {
    "sortDirection": 1,
    "sortKey": "SCORING_CATEGORY_2010#2145#-1",
    "scipId": "2010#2145#-1",
    "sortType": "SCORING_CATEGORY",
    "name": "Hat Tricks -- Three or more goals in a game",
    "width": 2.5,
    "shortName": "HT",
    "key": "2010#2145#-1",
    "maxWidth": 3
   },
   {
    "sortDirection": 1,
    "sortKey": "SCORING_CATEGORY_2010#2147#-1",
    "scipId": "2010#2147#-1",
    "sortType": "SCORING_CATEGORY",
    "name": "Hits",
    "width": 3.5,
    "shortName": "Hit",
    "key": "2010#2147#-1",
    "maxWidth": 3
   },
   {
    "sortDirection": 1,
    "sortKey": "SCORING_CATEGORY_2010#2092#-1",
    "scipId": "2010#2092#-1",
    "sortType": "SCORING_CATEGORY",
    "name": "Blocks -- A player blocks a shot by an opposing shooter.",
    "width": 3.5,
    "shortName": "Blk",
    "key": "2010#2092#-1",
    "maxWidth": 3
   },
   {
    "sortDirection": 1,
    "sortKey": "SCORING_CATEGORY_2010#2096#-1",
    "scipId": "2010#2096#-1",
    "sortType": "SCORING_CATEGORY",
    "name": "Faceoffs Won",
    "width": 3.5,
    "shortName": "FOW",
    "key": "2010#2096#-1",
    "maxWidth": 3
   },
   {
    "sortDirection": -1,
    "sortKey": "SCORING_CATEGORY_2010#2095#-1",
    "scipId": "2010#2095#-1",
    "sortType": "SCORING_CATEGORY",
    "name": "Faceoffs Lost",
    "width": 3.5,
    "shortName": "FOL",
    "key": "2010#2095#-1",
    "maxWidth": 3
   }
  ]
 },
 "statsTable": [
  {
   "scorer": {
    "scorerId": "06sds",
    "name": "Tim Washe",
    "shortName": "T. Washe",
    "posShortNames": "C",
    "posIds": [
     "206",
     "208"
    ],
    "posIdsNoFlex": [
     "206"
    ],
    "defaultPosId": "206",
    "teamShortName": "ANA",
    "teamName": "Anaheim Ducks",
    "rookie": false,
    "statusId": "4"
   },
   "cells": [
    {
     "content": "118"
    },
    {
     "content": "FA",
     "toolTip": "Free Agent"
    },
    {
     "content": "25"
    },
    {
     "content": ""
    },
    {
     "content": "45.03"
    },
    {
     "content": "6.43"
    },
    {
     "content": "15%"
    },
    {
     "gainColor": 1,
     "content": "+4%"
    },
    {
     "content": "7"
    },
    {
     "content": "2"
    },
    {
     "content": "2"
    },
    {
     "content": "4"
    },
    {
     "content": "6"
    },
    {
     "content": "1"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "25"
    },
    {
     "content": "12"
    },
    {
     "content": "58"
    },
    {
     "content": "61"
    }
   ],
   "actions": [
    {
     "typeId": "1"
    },
    {
     "typeId": "5"
    },
    {
     "typeId": "7"
    }
   ]
  },
  {
   "scorer": {
    "scorerId": "02o70",
    "name": "Josh Anderson",
    "shortName": "J. Anderson",
    "posShortNames": "LW,RW",
    "posIds": [
     "203",
     "204",
     "208"
    ],
    "posIdsNoFlex": [
     "203",
     "204"
    ],
    "defaultPosId": "203",
    "teamShortName": "MTL",
    "teamName": "Montreal Canadiens",
    "rookie": false,
    "statusId": "4"
   },
   "cells": [
    {
     "content": "147"
    },
    {
     "content": "FA",
     "toolTip": "Free Agent"
    },
    {
     "content": "32"
    },
    {
     "content": "BUF<br/>Sat 6:00PM"
    },
    {
     "content": "41.05"
    },
    {
     "content": "5.86"
    },
    {
     "content": "23%"
    },
    {
     "gainColor": 1,
     "content": "+9%"
    },
    {
     "content": "7"
    },
    {
     "content": "4"
    },
    {
     "content": "2"
    },
    {
     "content": "6"
    },
    {
     "content": "15"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "15"
    },
    {
     "content": "0"
    },
    {
     "content": "1"
    },
    {
     "content": "0"
    }
   ],
   "actions": [
    {
     "typeId": "1"
    },
    {
     "typeId": "5"
    },
    {
     "typeId": "7"
    }
   ]
  },
  {
   "scorer": {
    "scorerId": "060v8",
    "name": "Elias Pettersson",
    "shortName": "E. Pettersson",
    "posShortNames": "D",
    "posIds": [
     "202",
     "208"
    ],
    "posIdsNoFlex": [
     "202"
    ],
    "defaultPosId": "202",
    "teamShortName": "VAN",
    "teamName": "Vancouver Canucks",
    "rookie": false,
    "statusId": "4"
   },
   "cells": [
    {
     "content": "100"
    },
    {
     "content": "FA",
     "toolTip": "Free Agent"
    },
    {
     "content": "22"
    },
    {
     "content": "@TBL<br/>Sat 3:00PM"
    },
    {
     "content": "46.5"
    },
    {
     "content": "5.17"
    },
    {
     "content": "30%"
    },
    {
     "gainColor": 1,
     "content": "+9%"
    },
    {
     "content": "9"
    },
    {
     "content": "3"
    },
    {
     "content": "0"
    },
    {
     "content": "3"
    },
    {
     "content": "10"
    },
    {
     "content": "1"
    },
    {
     "content": "0"
    },
    {
     "content": "1"
    },
    {
     "content": "0"
    },
    {
     "content": "17"
    },
    {
     "content": "14"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    }
   ],
   "actions": [
    {
     "typeId": "1"
    },
    {
     "typeId": "5"
    },
    {
     "typeId": "7"
    }
   ]
  },
  {
   "scorer": {
    "scorerId": "03pim",
    "name": "Jeremy Lauzon",
    "shortName": "J. Lauzon",
    "posShortNames": "D",
    "posIds": [
     "202",
     "208"
    ],
    "posIdsNoFlex": [
     "202"
    ],
    "defaultPosId": "202",
    "teamShortName": "VGK",
    "teamName": "Vegas Golden Knights",
    "rookie": false,
    "statusId": "4"
   },
   "cells": [
    {
     "content": "242"
    },
    {
     "content": "FA",
     "toolTip": "Free Agent"
    },
    {
     "content": "29"
    },
    {
     "content": "PIT<br/>Sat 9:00PM"
    },
    {
     "content": "32.95"
    },
    {
     "content": "3.66"
    },
    {
     "content": "30%"
    },
    {
     "content": "0%"
    },
    {
     "content": "9"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "13"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "30"
    },
    {
     "content": "13"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    }
   ],
   "actions": [
    {
     "typeId": "1"
    },
    {
     "typeId": "5"
    },
    {
     "typeId": "7"
    }
   ]
  },
  {
   "scorer": {
    "scorerId": "070fo",
    "name": "Chase Reid",
    "shortName": "C. Reid",
    "posShortNames": "D",
    "posIds": [
     "202",
     "208"
    ],
    "posIdsNoFlex": [
     "202"
    ],
    "defaultPosId": "202",
    "teamShortName": "SEA",
    "teamName": "Seattle Kraken",
    "rookie": true,
    "statusId": "4"
   },
   "cells": [
    {
     "content": "6736"
    },
    {
     "content": "FA",
     "toolTip": "Free Agent"
    },
    {
     "content": "18"
    },
    {
     "content": "@FLA<br/>Sat 5:00PM"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "46%"
    },
    {
     "gainColor": -1,
     "content": "-1%"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    },
    {
     "content": "0"
    }
   ],
   "actions": [
    {
     "typeId": "1"
    },
    {
     "typeId": "5"
    },
    {
     "typeId": "7"
    }
   ]
  }
 ],
 "paginatedResultSet": {
  "totalNumPages": 15,
  "pageNumber": 1,
  "maxResultsPerPage": 500,
  "totalNumResults": 7344
 },
 "displayedSelections": {
  "datePlaying": "ALL",
  "searchName": "",
  "displayedMiscDisplayType": "1",
  "displayedView": "STATS",
  "displayedStartDate": 1790654400000,
  "displayedScoringCategoryType": "5",
  "displayedEndDate": 1792209600000,
  "displayedSeasonOrProjection": {
   "code": "SEASON_31n_YEAR_TO_DATE",
   "endDate": 1807415999000,
   "name": "2026-27 Reg Season - YTD",
   "showGoBackDays": true,
   "shortName": "2026-27 Reg - YTD",
   "timeframeTypeCode": "YEAR_TO_DATE",
   "startDate": 1790654400000
  }
 },
 "displayedSortType": "SCORE",
 "displayedSortReversed": false,
 "displayedPosOrGroup": "HOCKEY_SKATING",
 "displayedStatusOrTeam": "ALL_AVAILABLE",
 "displayedScoringCategoryType": "5",
 "scoringCategoryTypes": [
  {
   "value": "Tracked",
   "key": "5"
  },
  {
   "value": "Tracked (Per-Game)",
   "key": "7"
  },
  {
   "value": "Standard",
   "key": "1"
  },
  {
   "value": "Extra",
   "key": "2"
  }
 ],
 "posOrGroupList": [
  {
   "name": "All Players",
   "id": "ALL",
   "shortName": "All"
  },
  {
   "name": "Skaters",
   "id": "HOCKEY_SKATING",
   "shortName": "Skt"
  },
  {
   "name": "Center",
   "id": "POS_206",
   "shortName": "C"
  },
  {
   "name": "Left Wing",
   "id": "POS_203",
   "shortName": "LW"
  },
  {
   "name": "Right Wing",
   "id": "POS_204",
   "shortName": "RW"
  },
  {
   "name": "Wing",
   "id": "POS_205",
   "shortName": "W"
  },
  {
   "name": "Defense",
   "id": "POS_202",
   "shortName": "D"
  },
  {
   "name": "Goalie",
   "id": "POS_201",
   "shortName": "G"
  }
 ],
 "seasonOrProjections": [
  {
   "code": "PROJECTION_0_31n_EVENT_PROJECTED_WEEKLY",
   "endDate": 1807415999000,
   "name": "Projected - Per Game",
   "shortName": "Proj - Per Game",
   "timeframeTypeCode": "PROJECTED_WEEKLY",
   "startDate": 1790654400000
  },
  {
   "code": "PROJECTION_0_31n_SEASON",
   "endDate": 1807415999000,
   "name": "Projected - Season",
   "shortName": "Proj - Season",
   "timeframeTypeCode": "PROJECTED_SEASON",
   "startDate": 1790654400000
  },
  {
   "code": "SEASON_31n_YEAR_TO_DATE",
   "endDate": 1807415999000,
   "name": "2026-27 Reg Season - YTD",
   "showGoBackDays": true,
   "shortName": "2026-27 Reg - YTD",
   "timeframeTypeCode": "YEAR_TO_DATE",
   "startDate": 1790654400000
  },
  {
   "code": "SEASON_31n_BY_PERIOD",
   "endDate": 1807415999000,
   "name": "2026-27 Reg Season - Period",
   "showGoBackDays": true,
   "shortName": "2026-27 Reg - Period",
   "timeframeTypeCode": "BY_PERIOD",
   "startDate": 1790654400000
  },
  {
   "code": "SEASON_31n_BY_DATE",
   "endDate": 1807415999000,
   "name": "2026-27 Reg Season - Dates",
   "showGoBackDays": true,
   "shortName": "2026-27 Reg - Dates",
   "timeframeTypeCode": "BY_DATE",
   "startDate": 1790654400000
  }
 ],
 "sortOptions": [
  {
   "object2": "SCORE",
   "object1": "Fantasy Points"
  },
  {
   "object2": "FPTS_PER_GAME",
   "object1": "Fantasy Points per Game"
  },
  {
   "object2": "SC_2100#-1",
   "object1": "Games Played (GP)"
  },
  {
   "object2": "SC_2130#-1",
   "object1": "Goals (G)"
  }
 ]
};

// getPlayerStats, All Players view (positionOrGroup ALL): NO scoring-category columns at all. A skater and a goalie.
export const STATS_RESPONSE_ALL_POSITIONS = {
 "tableHeader": {
  "cells": [
   {
    "sortDirection": 1,
    "name": "Ranking based on fantasy points among all players",
    "width": 4,
    "shortName": "Rk",
    "key": "rankOv"
   },
   {
    "sortDirection": 1,
    "sortKey": "STATUS",
    "sortType": "STATUS",
    "name": "Status",
    "width": 8.5,
    "shortName": "Sta",
    "key": "status"
   },
   {
    "sortDirection": 1,
    "sortKey": "AGE",
    "sortType": "AGE",
    "name": "Age",
    "width": 3.5,
    "shortName": "Age",
    "key": "age"
   },
   {
    "eventStr": true,
    "sortDirection": 1,
    "name": "Opponent",
    "shortName": "Opp",
    "key": "opponent"
   },
   {
    "sortDirection": 1,
    "sortKey": "SCORE",
    "sortType": "SCORE",
    "width": 5.5,
    "shortName": "FPts",
    "key": "fpts"
   },
   {
    "sortDirection": 1,
    "sortKey": "FPTS_PER_GAME",
    "sortType": "FPTS_PER_GAME",
    "width": 5.5,
    "shortName": "FP/G",
    "key": "fptsPerGame"
   },
   {
    "sortDirection": 1,
    "sortKey": "OVERVIEW_PERCENT_OWNED_2",
    "sortType": "OVERVIEW_PERCENT_OWNED_2",
    "name": "% of Fantrax leagues that have this player on their roster this week",
    "shortName": "Ros"
   },
   {
    "sortDirection": 1,
    "sortKey": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2",
    "sortType": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2",
    "name": "Change in percent Rostered from previous week",
    "shortName": "+/-"
   }
  ]
 },
 "statsTable": [
  {
   "scorer": {
    "scorerId": "04qzk",
    "name": "Paul Cotter",
    "shortName": "P. Cotter",
    "posShortNames": "LW",
    "posIds": [
     "203",
     "208"
    ],
    "posIdsNoFlex": [
     "203"
    ],
    "defaultPosId": "203",
    "teamShortName": "VAN",
    "teamName": "Vancouver Canucks",
    "rookie": false,
    "statusId": "4"
   },
   "cells": [
    {
     "content": "64"
    },
    {
     "content": "FA",
     "toolTip": "Free Agent"
    },
    {
     "content": "26"
    },
    {
     "content": "@TBL<br/>Sat 3:00PM"
    },
    {
     "content": "54.34"
    },
    {
     "content": "6.04"
    },
    {
     "content": "58%"
    },
    {
     "gainColor": -1,
     "content": "-3%"
    }
   ],
   "actions": [
    {
     "typeId": "1"
    },
    {
     "typeId": "5"
    },
    {
     "typeId": "7"
    }
   ]
  },
  {
   "scorer": {
    "scorerId": "05oxl",
    "name": "Leevi Merilainen",
    "shortName": "L. Merilainen",
    "posShortNames": "G",
    "posIds": [
     "201"
    ],
    "posIdsNoFlex": [
     "201"
    ],
    "defaultPosId": "201",
    "teamShortName": "VAN",
    "teamName": "Vancouver Canucks",
    "rookie": false,
    "statusId": "4"
   },
   "cells": [
    {
     "content": "32"
    },
    {
     "content": "FA",
     "toolTip": "Free Agent"
    },
    {
     "content": "24"
    },
    {
     "content": "@TBL<br/>Sat 3:00PM"
    },
    {
     "content": "65.4"
    },
    {
     "content": "10.9"
    },
    {
     "content": "29%"
    },
    {
     "gainColor": 1,
     "content": "+4%"
    }
   ],
   "actions": [
    {
     "typeId": "1"
    },
    {
     "typeId": "5"
    },
    {
     "typeId": "7"
    }
   ]
  }
 ],
 "paginatedResultSet": {
  "totalNumPages": 43,
  "pageNumber": 1,
  "maxResultsPerPage": 200,
  "totalNumResults": 8468
 },
 "displayedPosOrGroup": "ALL",
 "displayedSelections": {
  "datePlaying": "ALL",
  "searchName": "",
  "displayedMiscDisplayType": "1",
  "displayedView": "STATS",
  "displayedStartDate": 1790654400000,
  "displayedScoringCategoryType": "5",
  "displayedEndDate": 1792209600000,
  "displayedSeasonOrProjection": {
   "code": "SEASON_31n_YEAR_TO_DATE",
   "endDate": 1807415999000,
   "name": "2026-27 Reg Season - YTD",
   "showGoBackDays": true,
   "shortName": "2026-27 Reg - YTD",
   "timeframeTypeCode": "YEAR_TO_DATE",
   "startDate": 1790654400000
  }
 },
 "displayedSortType": "SCORE",
 "displayedSortReversed": false
};

// getPlayerProfile {playerId} for the C in STATS_RESPONSE. Season FPts lives in miscData.highlightStats
// (shortName "FPts") and miscData.leagueData (name "FPts"); Faceoffs cells are "W-L-%" strings.
export const PROFILE_RESPONSE = {
 "displayedSelections": {
  "seasonId": "31n"
 },
 "season": {
  "seasonType": {
   "code": "REGULAR"
  },
  "displayNameShort": "2026-27 Reg",
  "endDate": 1807415999000,
  "displayName": "2026-27 Reg Season",
  "id": "31n",
  "startDate": 1790654400000,
  "displayYear": "2026-27"
 },
 "sectionContent": {
  "OVERVIEW": {
   "tables": [
    {
     "caption": "2026-27 Stats",
     "header": {
      "cells": [
       {
        "sortDirection": 1,
        "name": "Games Played",
        "width": 3.3000000000000003,
        "shortName": "GP",
        "key": "2100"
       },
       {
        "sortDirection": 1,
        "name": "Goals",
        "width": 3.3000000000000003,
        "shortName": "G",
        "key": "2130"
       },
       {
        "sortDirection": 1,
        "name": "Assists",
        "width": 3.3000000000000003,
        "shortName": "A",
        "key": "2090"
       },
       {
        "sortDirection": 1,
        "name": "Points",
        "width": 3.3000000000000003,
        "shortName": "Pt",
        "key": "2190"
       },
       {
        "sortDirection": 1,
        "name": "Plus/Minus",
        "width": 3.3000000000000003,
        "shortName": "+/-",
        "key": "2181"
       },
       {
        "sortDirection": 1,
        "name": "Penalty Minutes",
        "width": 3.3000000000000003,
        "shortName": "PIM",
        "key": "2170"
       },
       {
        "sortDirection": 1,
        "name": "Shots on Goal",
        "width": 3.3000000000000003,
        "shortName": "SOG",
        "key": "2270"
       },
       {
        "sortDirection": 1,
        "name": "Shooting %",
        "width": 5.5,
        "shortName": "Shot%",
        "key": "2335"
       },
       {
        "sortDirection": 1,
        "name": "Power Play Goals",
        "width": 3.3000000000000003,
        "shortName": "PPG",
        "key": "2210"
       },
       {
        "sortDirection": 1,
        "name": "Power Play Assists",
        "width": 3.3000000000000003,
        "shortName": "PPA",
        "key": "2200"
       },
       {
        "sortDirection": 1,
        "name": "Short-Handed Goals",
        "width": 3.3000000000000003,
        "shortName": "SHG",
        "key": "2250"
       },
       {
        "sortDirection": 1,
        "name": "Short-Handed Assists",
        "width": 3.3000000000000003,
        "shortName": "SHA",
        "key": "2240"
       },
       {
        "sortDirection": 1,
        "name": "Game-winning Goals",
        "width": 3.3000000000000003,
        "shortName": "GWG",
        "key": "2120"
       },
       {
        "sortDirection": 1,
        "name": "Overtime Goals",
        "width": 3.3000000000000003,
        "shortName": "OG",
        "key": "2155"
       },
       {
        "sortDirection": 1,
        "name": "Hits",
        "width": 3.3000000000000003,
        "shortName": "Hit",
        "key": "2147"
       },
       {
        "sortDirection": 1,
        "name": "Blocks",
        "width": 3.3000000000000003,
        "shortName": "Blk",
        "key": "2092"
       },
       {
        "sortDirection": 1,
        "name": "Giveaways",
        "width": 3.3000000000000003,
        "shortName": "Gv",
        "key": "2125"
       },
       {
        "sortDirection": 1,
        "name": "Takeaways",
        "width": 3.3000000000000003,
        "shortName": "Tk",
        "key": "2295"
       },
       {
        "sortDirection": 1,
        "name": "Faceoffs Won/Lost",
        "width": 13.200000000000001,
        "shortName": "Faceoffs",
        "key": "231c"
       },
       {
        "sortDirection": 1,
        "name": "Time On Ice Per Game",
        "width": 3.3000000000000003,
        "shortName": "TOI",
        "key": "2347"
       },
       {
        "sortDirection": 1,
        "name": "Time On Ice Per Game - Power Play",
        "width": 5.5,
        "shortName": "TOIPP",
        "key": "234f"
       },
       {
        "sortDirection": 1,
        "name": "Time On Ice Per Game - Short-Handed",
        "width": 5.5,
        "shortName": "TOISH",
        "key": "234i"
       }
      ]
     },
     "rows": [
      {
       "cells": [
        {
         "content": "7"
        },
        {
         "content": "2"
        },
        {
         "content": "2"
        },
        {
         "content": "4"
        },
        {
         "content": "0"
        },
        {
         "content": "2"
        },
        {
         "content": "6"
        },
        {
         "content": "33.3"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "25"
        },
        {
         "content": "12"
        },
        {
         "content": "4"
        },
        {
         "content": "0"
        },
        {
         "content": "58-61-49%"
        },
        {
         "content": "15:23"
        },
        {
         "content": "00:24"
        },
        {
         "content": "03:05"
        }
       ]
      }
     ]
    },
    {
     "caption": "Recent Games",
     "header": {
      "cells": [
       {
        "name": "Date",
        "width": 7,
        "shortName": "Date",
        "key": "date"
       },
       {
        "name": "Team",
        "width": 4,
        "shortName": "Team",
        "key": "team"
       },
       {
        "name": "Opponent",
        "shortName": "Opp",
        "key": "opponent"
       },
       {
        "name": "Score",
        "width": 7,
        "shortName": "Score",
        "key": "score"
       },
       {
        "sortDirection": 1,
        "name": "Fantasy Points",
        "highlightColumn": true,
        "shortName": "FPts",
        "key": "fpts"
       },
       {
        "sortDirection": 1,
        "name": "Goals",
        "width": 3.3000000000000003,
        "shortName": "G",
        "key": "2130#-1"
       },
       {
        "sortDirection": 1,
        "name": "Assists",
        "width": 3.3000000000000003,
        "shortName": "A",
        "key": "2090#-1"
       },
       {
        "sortDirection": 1,
        "name": "Points",
        "width": 3.3000000000000003,
        "shortName": "Pt",
        "key": "2190#-1"
       },
       {
        "sortDirection": 1,
        "name": "Plus/Minus",
        "width": 3.3000000000000003,
        "shortName": "+/-",
        "key": "2181#-1"
       },
       {
        "sortDirection": 1,
        "name": "Penalty Minutes",
        "width": 3.3000000000000003,
        "shortName": "PIM",
        "key": "2170#-1"
       },
       {
        "sortDirection": 1,
        "name": "Shots on Goal",
        "width": 3.3000000000000003,
        "shortName": "SOG",
        "key": "2270#-1"
       },
       {
        "sortDirection": 1,
        "name": "Power Play Goals",
        "width": 3.3000000000000003,
        "shortName": "PPG",
        "key": "2210#-1"
       },
       {
        "sortDirection": 1,
        "name": "Power Play Assists",
        "width": 3.3000000000000003,
        "shortName": "PPA",
        "key": "2200#-1"
       },
       {
        "sortDirection": 1,
        "name": "Short-Handed Goals",
        "width": 3.3000000000000003,
        "shortName": "SHG",
        "key": "2250#-1"
       },
       {
        "sortDirection": 1,
        "name": "Short-Handed Assists",
        "width": 3.3000000000000003,
        "shortName": "SHA",
        "key": "2240#-1"
       },
       {
        "sortDirection": 1,
        "name": "Game-winning Goals",
        "width": 3.3000000000000003,
        "shortName": "GWG",
        "key": "2120#-1"
       },
       {
        "sortDirection": 1,
        "name": "Hits",
        "width": 3.3000000000000003,
        "shortName": "Hit",
        "key": "2147#-1"
       },
       {
        "sortDirection": 1,
        "name": "Blocks",
        "width": 3.3000000000000003,
        "shortName": "Blk",
        "key": "2092#-1"
       },
       {
        "sortDirection": 1,
        "name": "Faceoffs Won/Lost",
        "width": 13.200000000000001,
        "shortName": "Faceoffs",
        "key": "231c#-1"
       },
       {
        "sortDirection": 1,
        "name": "Time On Ice",
        "width": 5.720000000000001,
        "shortName": "TOI",
        "key": "2300#-1"
       },
       {
        "sortDirection": 1,
        "name": "Time On Ice - Power Play",
        "width": 5.5,
        "shortName": "TOIPP",
        "key": "2304#-1"
       },
       {
        "sortDirection": 1,
        "name": "Time On Ice - Short-Handed",
        "width": 5.5,
        "shortName": "TOISH",
        "key": "2306#-1"
       }
      ]
     },
     "rows": [
      {
       "cells": [
        {
         "content": "Oct 16"
        },
        {
         "content": "ANA",
         "toolTip": "Anaheim"
        },
        {
         "content": "BOS"
        },
        {
         "content": "L 2-4"
        },
        {
         "content": "5.65"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "2"
        },
        {
         "content": "1"
        },
        {
         "content": "5-10-33%"
        },
        {
         "content": "12:34"
        },
        {
         "content": "00:00"
        },
        {
         "content": "02:52"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "Oct 13"
        },
        {
         "content": "ANA",
         "toolTip": "Anaheim"
        },
        {
         "content": "CGY"
        },
        {
         "content": "L 2-4"
        },
        {
         "content": "3.51"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "-2"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "2"
        },
        {
         "content": "3"
        },
        {
         "content": "7-7-50%"
        },
        {
         "content": "13:26"
        },
        {
         "content": "00:00"
        },
        {
         "content": "01:25"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "Oct 10"
        },
        {
         "content": "ANA",
         "toolTip": "Anaheim"
        },
        {
         "content": "@CGY"
        },
        {
         "content": "W 4-2"
        },
        {
         "content": "7.73"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "2"
        },
        {
         "content": "2"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "9"
        },
        {
         "content": "2"
        },
        {
         "content": "10-11-48%"
        },
        {
         "content": "16:40"
        },
        {
         "content": "00:00"
        },
        {
         "content": "01:54"
        }
       ]
      }
     ]
    },
    {
     "caption": "Recent Trends",
     "header": {
      "cells": [
       {
        "width": 8,
        "shortName": "Trend",
        "key": "trend"
       },
       {
        "width": 10,
        "shortName": "Date Range",
        "key": "dateRange"
       },
       {
        "sortDirection": 1,
        "shortName": "FPts",
        "key": "fpts"
       },
       {
        "sortDirection": 1,
        "shortName": "FP/G",
        "key": "fptsPerGame"
       },
       {
        "sortDirection": 1,
        "name": "Games Played",
        "width": 3.3000000000000003,
        "shortName": "GP",
        "key": "2010#2100#-1"
       },
       {
        "sortDirection": 1,
        "name": "Goals",
        "width": 3.3000000000000003,
        "shortName": "G",
        "key": "2010#2130#-1"
       },
       {
        "sortDirection": 1,
        "name": "Assists",
        "width": 3.3000000000000003,
        "shortName": "A",
        "key": "2010#2090#-1"
       },
       {
        "sortDirection": 1,
        "name": "Points",
        "width": 3.3000000000000003,
        "shortName": "Pt",
        "key": "2010#2190#-1"
       },
       {
        "sortDirection": 1,
        "name": "Shots on Goal",
        "width": 3.3000000000000003,
        "shortName": "SOG",
        "key": "2010#2270#-1"
       },
       {
        "sortDirection": 1,
        "name": "Game-winning Goals",
        "width": 3.3000000000000003,
        "shortName": "GWG",
        "key": "2010#2120#-1"
       },
       {
        "sortDirection": 1,
        "name": "Power Play Points",
        "width": 3.3000000000000003,
        "shortName": "PPP",
        "key": "2010#2327#-1"
       },
       {
        "sortDirection": 1,
        "name": "Short-Handed Points",
        "width": 3.3000000000000003,
        "shortName": "SHP",
        "key": "2010#2344#-1"
       },
       {
        "sortDirection": 1,
        "name": "Hat Tricks",
        "width": 3.3000000000000003,
        "shortName": "HT",
        "key": "2010#2145#-1"
       },
       {
        "sortDirection": 1,
        "name": "Hits",
        "width": 3.3000000000000003,
        "shortName": "Hit",
        "key": "2010#2147#-1"
       },
       {
        "sortDirection": 1,
        "name": "Blocks",
        "width": 3.3000000000000003,
        "shortName": "Blk",
        "key": "2010#2092#-1"
       },
       {
        "sortDirection": 1,
        "name": "Faceoffs Won",
        "width": 3.3000000000000003,
        "shortName": "FOW",
        "key": "2010#2096#-1"
       },
       {
        "sortDirection": 1,
        "name": "Faceoffs Lost",
        "width": 3.3000000000000003,
        "shortName": "FOL",
        "key": "2010#2095#-1"
       }
      ]
     },
     "rows": [
      {
       "cells": [
        {
         "content": "7-Day"
        },
        {
         "briefContent": "Oct 10 -<br/>Oct 16",
         "content": "Sat Oct 10 -<br/>Fri Oct 16"
        },
        {
         "content": "16.89",
         "highlight": true
        },
        {
         "content": "5.63",
         "highlight": true
        },
        {
         "content": "3"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "3"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "13"
        },
        {
         "content": "6"
        },
        {
         "content": "22"
        },
        {
         "content": "28"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "7-Day"
        },
        {
         "briefContent": "Oct 3 -<br/>Oct 9",
         "content": "Sat Oct 3 -<br/>Fri Oct 9"
        },
        {
         "content": "21.69",
         "highlight": true
        },
        {
         "content": "7.23",
         "highlight": true
        },
        {
         "content": "3"
        },
        {
         "content": "1"
        },
        {
         "content": "1"
        },
        {
         "content": "2"
        },
        {
         "content": "2"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "10"
        },
        {
         "content": "5"
        },
        {
         "content": "25"
        },
        {
         "content": "23"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "7-Day"
        },
        {
         "briefContent": "Sep 26 -<br/>Oct 2",
         "content": "Sat Sep 26 -<br/>Fri Oct 2"
        },
        {
         "content": "6.45",
         "highlight": true
        },
        {
         "content": "6.45",
         "highlight": true
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "1"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "2"
        },
        {
         "content": "1"
        },
        {
         "content": "11"
        },
        {
         "content": "10"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "14-Day"
        },
        {
         "briefContent": "Oct 3 -<br/>Oct 16",
         "content": "Sat Oct 3 -<br/>Fri Oct 16"
        },
        {
         "content": "38.58",
         "highlight": true
        },
        {
         "content": "6.43",
         "highlight": true
        },
        {
         "content": "6"
        },
        {
         "content": "2"
        },
        {
         "content": "1"
        },
        {
         "content": "3"
        },
        {
         "content": "5"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "23"
        },
        {
         "content": "11"
        },
        {
         "content": "47"
        },
        {
         "content": "51"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "30-Day"
        },
        {
         "briefContent": "Sep 17 -<br/>Oct 16",
         "content": "Thu Sep 17 -<br/>Fri Oct 16"
        },
        {
         "content": "45.03",
         "highlight": true
        },
        {
         "content": "6.43",
         "highlight": true
        },
        {
         "content": "7"
        },
        {
         "content": "2"
        },
        {
         "content": "2"
        },
        {
         "content": "4"
        },
        {
         "content": "6"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "25"
        },
        {
         "content": "12"
        },
        {
         "content": "58"
        },
        {
         "content": "61"
        }
       ]
      }
     ]
    }
   ]
  }
 },
 "miscData": {
  "name": "Tim Washe",
  "defaultPosition": "C",
  "teamShortName": "ANA",
  "highlightStats": [
   {
    "name": "Fantasy Points (2026-27 Reg Season)",
    "shortName": "FPts",
    "value": "45"
   },
   {
    "name": "Average Fantasy Points per Game (2026-27 Reg Season)",
    "shortName": "FP/G",
    "value": "6.4"
   }
  ],
  "leagueData": [
   {
    "name": "FPts",
    "description": "Fantasy Points (2026-27 Reg Season)",
    "value": "45"
   },
   {
    "name": "FP/G",
    "description": "Average Fantasy Points per Game (2026-27 Reg Season)",
    "value": "6.43"
   }
  ]
 }
};

// getPlayerProfile {playerId, tab} responses for a D (Pt 3 per point in our league), trimmed from the live league
// 2026-10-17: the tab responses carry no miscData.defaultPosition, only leagueData "Eligible" ("D,Skt").
// STATS: past seasons show FPts rounded to whole points, "Career Total" has a blank FPts; no HT/PPP/SHP columns.
// SPLITS: totals per split, no HT. GAME_LOG_FANTASY: the league categories directly. GAME_LOG: no HT/PPP/SHP, Faceoffs "W-L-%".
export const PROFILE_TAB_STATS = {
 "sectionContent": {
  "STATS": {
   "tables": [
    {
     "header": {
      "cells": [
       {
        "name": "Season",
        "shortName": "Season",
        "key": "season"
       },
       {
        "name": "Team",
        "shortName": "Team",
        "key": "team"
       },
       {
        "sortDirection": 1,
        "name": "FPts",
        "highlightColumn": true,
        "shortName": "FPts",
        "key": "fpts"
       },
       {
        "sortDirection": 1,
        "name": "FP/G",
        "highlightColumn": true,
        "shortName": "FP/G",
        "key": "fptsPerGame"
       },
       {
        "sortDirection": 1,
        "name": "Games Played",
        "width": 3,
        "shortName": "GP",
        "key": "2100"
       },
       {
        "sortDirection": 1,
        "name": "Goals",
        "width": 3,
        "shortName": "G",
        "key": "2130"
       },
       {
        "sortDirection": 1,
        "name": "Assists",
        "width": 3,
        "shortName": "A",
        "key": "2090"
       },
       {
        "sortDirection": 1,
        "name": "Points",
        "width": 3,
        "shortName": "Pt",
        "key": "2190"
       },
       {
        "sortDirection": 1,
        "name": "Plus/Minus",
        "width": 3,
        "shortName": "+/-",
        "key": "2181"
       },
       {
        "sortDirection": 1,
        "name": "Penalty Minutes",
        "width": 3,
        "shortName": "PIM",
        "key": "2170"
       },
       {
        "sortDirection": 1,
        "name": "Shots on Goal",
        "width": 3,
        "shortName": "SOG",
        "key": "2270"
       },
       {
        "sortDirection": 1,
        "name": "Shooting %",
        "width": 5,
        "shortName": "Shot%",
        "key": "2335"
       },
       {
        "sortDirection": 1,
        "name": "Power Play Goals",
        "width": 3,
        "shortName": "PPG",
        "key": "2210"
       },
       {
        "sortDirection": 1,
        "name": "Power Play Assists",
        "width": 3,
        "shortName": "PPA",
        "key": "2200"
       },
       {
        "sortDirection": 1,
        "name": "Short-Handed Goals",
        "width": 3,
        "shortName": "SHG",
        "key": "2250"
       },
       {
        "sortDirection": 1,
        "name": "Short-Handed Assists",
        "width": 3,
        "shortName": "SHA",
        "key": "2240"
       },
       {
        "sortDirection": 1,
        "name": "Game-winning Goals",
        "width": 3,
        "shortName": "GWG",
        "key": "2120"
       },
       {
        "sortDirection": 1,
        "name": "Overtime Goals",
        "width": 3,
        "shortName": "OG",
        "key": "2155"
       },
       {
        "sortDirection": 1,
        "name": "Hits",
        "width": 3,
        "shortName": "Hit",
        "key": "2147"
       },
       {
        "sortDirection": 1,
        "name": "Blocks",
        "width": 3,
        "shortName": "Blk",
        "key": "2092"
       },
       {
        "sortDirection": 1,
        "name": "Giveaways",
        "width": 3,
        "shortName": "Gv",
        "key": "2125"
       },
       {
        "sortDirection": 1,
        "name": "Takeaways",
        "width": 3,
        "shortName": "Tk",
        "key": "2295"
       },
       {
        "sortDirection": 1,
        "name": "Faceoffs Won/Lost",
        "width": 12,
        "shortName": "Faceoffs",
        "key": "231c"
       },
       {
        "sortDirection": 1,
        "name": "Time On Ice Per Game",
        "width": 3,
        "shortName": "TOI",
        "key": "2347"
       },
       {
        "sortDirection": 1,
        "name": "Time On Ice Per Game - Power Play",
        "width": 5,
        "shortName": "TOIPP",
        "key": "234f"
       },
       {
        "sortDirection": 1,
        "name": "Time On Ice Per Game - Short-Handed",
        "width": 5,
        "shortName": "TOISH",
        "key": "234i"
       }
      ]
     },
     "rows": [
      {
       "cells": [
        {
         "content": "2026-27"
        },
        {
         "content": "VAN",
         "toolTip": "Vancouver Canucks"
        },
        {
         "content": "46.5"
        },
        {
         "content": "5.2"
        },
        {
         "content": "9"
        },
        {
         "content": "3"
        },
        {
         "content": "0"
        },
        {
         "content": "3"
        },
        {
         "content": "6"
        },
        {
         "content": "4"
        },
        {
         "content": "10"
        },
        {
         "content": "30.0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "17"
        },
        {
         "content": "14"
        },
        {
         "content": "7"
        },
        {
         "content": "2"
        },
        {
         "content": "0-0-0%"
        },
        {
         "content": "17:55"
        },
        {
         "content": "00:06"
        },
        {
         "content": "02:35"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "2025-26"
        },
        {
         "content": "VAN",
         "toolTip": "Vancouver Canucks"
        },
        {
         "content": "215"
        },
        {
         "content": "3.1"
        },
        {
         "content": "70"
        },
        {
         "content": "3"
        },
        {
         "content": "7"
        },
        {
         "content": "10"
        },
        {
         "content": "-16"
        },
        {
         "content": "39"
        },
        {
         "content": "46"
        },
        {
         "content": "6.5"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "136"
        },
        {
         "content": "85"
        },
        {
         "content": "68"
        },
        {
         "content": "14"
        },
        {
         "content": "0-0-0%"
        },
        {
         "content": "14:59"
        },
        {
         "content": "00:03"
        },
        {
         "content": "01:10"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "2024-25"
        },
        {
         "content": "VAN",
         "toolTip": "Vancouver Canucks"
        },
        {
         "content": "59"
        },
        {
         "content": "2.1"
        },
        {
         "content": "28"
        },
        {
         "content": "1"
        },
        {
         "content": "2"
        },
        {
         "content": "3"
        },
        {
         "content": "-4"
        },
        {
         "content": "17"
        },
        {
         "content": "19"
        },
        {
         "content": "5.3"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "39"
        },
        {
         "content": "16"
        },
        {
         "content": "24"
        },
        {
         "content": "1"
        },
        {
         "content": "0-0-0%"
        },
        {
         "content": "12:49"
        },
        {
         "content": "00:05"
        },
        {
         "content": "00:17"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "Career Total"
        },
        {
         "content": ""
        },
        {
         "content": ""
        },
        {
         "content": ""
        },
        {
         "content": "107"
        },
        {
         "content": "7"
        },
        {
         "content": "9"
        },
        {
         "content": "16"
        },
        {
         "content": "-14"
        },
        {
         "content": "60"
        },
        {
         "content": "75"
        },
        {
         "content": "9.3"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "192"
        },
        {
         "content": "115"
        },
        {
         "content": "99"
        },
        {
         "content": "17"
        },
        {
         "content": "0-0-0%"
        },
        {
         "content": "14:40"
        },
        {
         "content": "00:04"
        },
        {
         "content": "01:04"
        }
       ]
      }
     ]
    }
   ]
  }
 },
 "miscData": {
  "leagueData": [
   {
    "name": "FPts",
    "description": "Fantasy Points (2026-27 Reg Season)",
    "value": "46.5"
   },
   {
    "name": "FP/G",
    "description": "Average Fantasy Points per Game (2026-27 Reg Season)",
    "value": "5.17"
   },
   {
    "name": "Eligible",
    "description": "Eligible positions in this league",
    "value": "D,Skt"
   }
  ]
 }
};
export const PROFILE_TAB_SPLITS = {
 "sectionContent": {
  "SPLITS": {
   "tables": [
    {
     "caption": "Splits",
     "header": {
      "cells": [
       {
        "name": "Split",
        "width": 14,
        "shortName": "Split",
        "key": "split"
       },
       {
        "sortDirection": 1,
        "highlightColumn": true,
        "shortName": "FPts",
        "key": "fpts"
       },
       {
        "sortDirection": 1,
        "highlightColumn": true,
        "shortName": "FP/G",
        "key": "fptsPerGame"
       },
       {
        "sortDirection": 1,
        "name": "Games Played",
        "width": 3.3000000000000003,
        "shortName": "GP",
        "key": "2100"
       },
       {
        "sortDirection": 1,
        "name": "Goals",
        "width": 3.3000000000000003,
        "shortName": "G",
        "key": "2130"
       },
       {
        "sortDirection": 1,
        "name": "Assists",
        "width": 3.3000000000000003,
        "shortName": "A",
        "key": "2090"
       },
       {
        "sortDirection": 1,
        "name": "Points",
        "width": 3.3000000000000003,
        "shortName": "Pt",
        "key": "2190"
       },
       {
        "sortDirection": 1,
        "name": "Plus/Minus",
        "width": 3.3000000000000003,
        "shortName": "+/-",
        "key": "2181"
       },
       {
        "sortDirection": 1,
        "name": "Penalty Minutes",
        "width": 3.3000000000000003,
        "shortName": "PIM",
        "key": "2170"
       },
       {
        "sortDirection": 1,
        "name": "Shots on Goal",
        "width": 3.3000000000000003,
        "shortName": "SOG",
        "key": "2270"
       },
       {
        "sortDirection": 1,
        "name": "Shooting %",
        "width": 5.5,
        "shortName": "Shot%",
        "key": "2335"
       },
       {
        "sortDirection": 1,
        "name": "Power Play Goals",
        "width": 3.3000000000000003,
        "shortName": "PPG",
        "key": "2210"
       },
       {
        "sortDirection": 1,
        "name": "Power Play Assists",
        "width": 3.3000000000000003,
        "shortName": "PPA",
        "key": "2200"
       },
       {
        "sortDirection": 1,
        "name": "Short-Handed Goals",
        "width": 3.3000000000000003,
        "shortName": "SHG",
        "key": "2250"
       },
       {
        "sortDirection": 1,
        "name": "Short-Handed Assists",
        "width": 3.3000000000000003,
        "shortName": "SHA",
        "key": "2240"
       },
       {
        "sortDirection": 1,
        "name": "Game-winning Goals",
        "width": 3.3000000000000003,
        "shortName": "GWG",
        "key": "2120"
       },
       {
        "sortDirection": 1,
        "name": "Overtime Goals",
        "width": 3.3000000000000003,
        "shortName": "OG",
        "key": "2155"
       },
       {
        "sortDirection": 1,
        "name": "Hits",
        "width": 3.3000000000000003,
        "shortName": "Hit",
        "key": "2147"
       },
       {
        "sortDirection": 1,
        "name": "Blocks",
        "width": 3.3000000000000003,
        "shortName": "Blk",
        "key": "2092"
       },
       {
        "sortDirection": 1,
        "name": "Giveaways",
        "width": 3.3000000000000003,
        "shortName": "Gv",
        "key": "2125"
       },
       {
        "sortDirection": 1,
        "name": "Takeaways",
        "width": 3.3000000000000003,
        "shortName": "Tk",
        "key": "2295"
       },
       {
        "sortDirection": 1,
        "name": "Faceoffs Won/Lost",
        "width": 13.200000000000001,
        "shortName": "Faceoffs",
        "key": "231c"
       },
       {
        "sortDirection": 1,
        "name": "Time On Ice Per Game",
        "width": 3.3000000000000003,
        "shortName": "TOI",
        "key": "2347"
       },
       {
        "sortDirection": 1,
        "name": "Time On Ice Per Game - Power Play",
        "width": 5.5,
        "shortName": "TOIPP",
        "key": "234f"
       },
       {
        "sortDirection": 1,
        "name": "Time On Ice Per Game - Short-Handed",
        "width": 5.5,
        "shortName": "TOISH",
        "key": "234i"
       }
      ]
     },
     "rows": [
      {
       "cells": [
        {
         "content": "Home"
        },
        {
         "content": "12.35"
        },
        {
         "content": "4.12"
        },
        {
         "content": "3"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "3"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "100.0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "3"
        },
        {
         "content": "3"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "0-0-0%"
        },
        {
         "content": "16:03"
        },
        {
         "content": "00:05"
        },
        {
         "content": "03:12"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "Away"
        },
        {
         "content": "34.15"
        },
        {
         "content": "5.69"
        },
        {
         "content": "6"
        },
        {
         "content": "2"
        },
        {
         "content": "0"
        },
        {
         "content": "2"
        },
        {
         "content": "3"
        },
        {
         "content": "4"
        },
        {
         "content": "9"
        },
        {
         "content": "22.2"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "14"
        },
        {
         "content": "11"
        },
        {
         "content": "7"
        },
        {
         "content": "1"
        },
        {
         "content": "0-0-0%"
        },
        {
         "content": "18:52"
        },
        {
         "content": "00:07"
        },
        {
         "content": "02:17"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "Day"
        },
        {
         "content": "2.6"
        },
        {
         "content": "2.6"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "-"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "2"
        },
        {
         "content": "2"
        },
        {
         "content": "2"
        },
        {
         "content": "0"
        },
        {
         "content": "0-0-0%"
        },
        {
         "content": "19:31"
        },
        {
         "content": "00:00"
        },
        {
         "content": "02:42"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "Night"
        },
        {
         "content": "43.9"
        },
        {
         "content": "5.49"
        },
        {
         "content": "8"
        },
        {
         "content": "3"
        },
        {
         "content": "0"
        },
        {
         "content": "3"
        },
        {
         "content": "6"
        },
        {
         "content": "4"
        },
        {
         "content": "10"
        },
        {
         "content": "30.0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "15"
        },
        {
         "content": "12"
        },
        {
         "content": "5"
        },
        {
         "content": "2"
        },
        {
         "content": "0-0-0%"
        },
        {
         "content": "17:44"
        },
        {
         "content": "00:07"
        },
        {
         "content": "02:35"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "vs. NJD"
        },
        {
         "content": "2.6"
        },
        {
         "content": "2.6"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "-"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "2"
        },
        {
         "content": "2"
        },
        {
         "content": "2"
        },
        {
         "content": "0"
        },
        {
         "content": "0-0-0%"
        },
        {
         "content": "19:31"
        },
        {
         "content": "00:00"
        },
        {
         "content": "02:42"
        }
       ]
      }
     ]
    }
   ],
   "selectedSeason": {
    "seasonType": {
     "code": "REGULAR"
    },
    "displayNameShort": "2026-27 Reg",
    "endDate": 1807415999000,
    "displayName": "2026-27 Reg Season",
    "id": "31n",
    "startDate": 1790654400000,
    "displayYear": "2026-27"
   }
  }
 },
 "miscData": {
  "leagueData": [
   {
    "name": "FPts",
    "description": "Fantasy Points (2026-27 Reg Season)",
    "value": "46.5"
   },
   {
    "name": "FP/G",
    "description": "Average Fantasy Points per Game (2026-27 Reg Season)",
    "value": "5.17"
   },
   {
    "name": "Eligible",
    "description": "Eligible positions in this league",
    "value": "D,Skt"
   }
  ]
 }
};
export const PROFILE_TAB_GAME_LOG_FANTASY = {
 "sectionContent": {
  "GAME_LOG_FANTASY": {
   "tables": [
    {
     "caption": "Game Log (Fantasy)",
     "header": {
      "cells": [
       {
        "name": "Date",
        "width": 7,
        "shortName": "Date",
        "key": "date"
       },
       {
        "name": "Team",
        "width": 4,
        "shortName": "Team",
        "key": "team"
       },
       {
        "name": "Opponent",
        "shortName": "Opp",
        "key": "opponent"
       },
       {
        "name": "Score",
        "width": 7,
        "shortName": "Score",
        "key": "score"
       },
       {
        "sortDirection": 1,
        "name": "Fantasy Points",
        "highlightColumn": true,
        "shortName": "FPts",
        "key": "fpts"
       },
       {
        "sortDirection": 1,
        "name": "Goals",
        "width": 3.3000000000000003,
        "shortName": "G",
        "key": "2130#-1"
       },
       {
        "sortDirection": 1,
        "name": "Assists",
        "width": 3.3000000000000003,
        "shortName": "A",
        "key": "2090#-1"
       },
       {
        "sortDirection": 1,
        "name": "Points",
        "width": 3.3000000000000003,
        "shortName": "Pt",
        "key": "2190#-1"
       },
       {
        "sortDirection": 1,
        "name": "Shots on Goal",
        "width": 3.3000000000000003,
        "shortName": "SOG",
        "key": "2270#-1"
       },
       {
        "sortDirection": 1,
        "name": "Game-winning Goals",
        "width": 3.3000000000000003,
        "shortName": "GWG",
        "key": "2120#-1"
       },
       {
        "sortDirection": 1,
        "name": "Power Play Points",
        "width": 3.3000000000000003,
        "shortName": "PPP",
        "key": "2327#-1"
       },
       {
        "sortDirection": 1,
        "name": "Short-Handed Points",
        "width": 3.3000000000000003,
        "shortName": "SHP",
        "key": "2344#-1"
       },
       {
        "sortDirection": 1,
        "name": "Hat Tricks",
        "width": 3.3000000000000003,
        "shortName": "HT",
        "key": "2145#-1"
       },
       {
        "sortDirection": 1,
        "name": "Hits",
        "width": 3.3000000000000003,
        "shortName": "Hit",
        "key": "2147#-1"
       },
       {
        "sortDirection": 1,
        "name": "Blocks",
        "width": 3.3000000000000003,
        "shortName": "Blk",
        "key": "2092#-1"
       },
       {
        "sortDirection": 1,
        "name": "Faceoffs Won",
        "width": 3.3000000000000003,
        "shortName": "FOW",
        "key": "2096#-1"
       },
       {
        "sortDirection": -1,
        "name": "Faceoffs Lost",
        "width": 3.3000000000000003,
        "shortName": "FOL",
        "key": "2095#-1"
       }
      ]
     },
     "rows": [
      {
       "cells": [
        {
         "content": "Oct 15"
        },
        {
         "content": "VAN",
         "toolTip": "Vancouver"
        },
        {
         "content": "@FLA"
        },
        {
         "content": "L 2-3",
         "props": {
          "eventId": "06mjg"
         }
        },
        {
         "content": "9.5"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "2"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "2"
        },
        {
         "content": "2"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "Oct 13"
        },
        {
         "content": "VAN",
         "toolTip": "Vancouver"
        },
        {
         "content": "@NYI"
        },
        {
         "content": "L 2-3",
         "props": {
          "eventId": "06mj0"
         }
        },
        {
         "content": "1.9"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "2"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "Oct 11"
        },
        {
         "content": "VAN",
         "toolTip": "Vancouver"
        },
        {
         "content": "@NYR"
        },
        {
         "content": "L 2-6",
         "props": {
          "eventId": "06mio"
         }
        },
        {
         "content": "11.3"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "2"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "4"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "Oct 10"
        },
        {
         "content": "VAN",
         "toolTip": "Vancouver"
        },
        {
         "content": "@NJD"
        },
        {
         "content": "L 1-4",
         "props": {
          "eventId": "06mia"
         }
        },
        {
         "content": "2.6"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "2"
        },
        {
         "content": "2"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        }
       ]
      }
     ]
    }
   ],
   "selectedSeason": {
    "seasonType": {
     "code": "REGULAR"
    },
    "displayNameShort": "2026-27 Reg",
    "endDate": 1807415999000,
    "displayName": "2026-27 Reg Season",
    "id": "31n",
    "startDate": 1790654400000,
    "displayYear": "2026-27"
   }
  }
 },
 "miscData": {
  "leagueData": [
   {
    "name": "FPts",
    "description": "Fantasy Points (2026-27 Reg Season)",
    "value": "46.5"
   },
   {
    "name": "FP/G",
    "description": "Average Fantasy Points per Game (2026-27 Reg Season)",
    "value": "5.17"
   },
   {
    "name": "Eligible",
    "description": "Eligible positions in this league",
    "value": "D,Skt"
   }
  ]
 }
};
export const PROFILE_TAB_GAME_LOG = {
 "sectionContent": {
  "GAME_LOG": {
   "tables": [
    {
     "caption": "Game Log",
     "header": {
      "cells": [
       {
        "name": "Date",
        "width": 7,
        "shortName": "Date",
        "key": "date"
       },
       {
        "name": "Team",
        "width": 4,
        "shortName": "Team",
        "key": "team"
       },
       {
        "name": "Opponent",
        "shortName": "Opp",
        "key": "opponent"
       },
       {
        "name": "Score",
        "width": 7,
        "shortName": "Score",
        "key": "score"
       },
       {
        "sortDirection": 1,
        "name": "Fantasy Points",
        "highlightColumn": true,
        "shortName": "FPts",
        "key": "fpts"
       },
       {
        "sortDirection": 1,
        "name": "Goals",
        "width": 3.3000000000000003,
        "shortName": "G",
        "key": "2130#-1"
       },
       {
        "sortDirection": 1,
        "name": "Assists",
        "width": 3.3000000000000003,
        "shortName": "A",
        "key": "2090#-1"
       },
       {
        "sortDirection": 1,
        "name": "Points",
        "width": 3.3000000000000003,
        "shortName": "Pt",
        "key": "2190#-1"
       },
       {
        "sortDirection": 1,
        "name": "Plus/Minus",
        "width": 3.3000000000000003,
        "shortName": "+/-",
        "key": "2181#-1"
       },
       {
        "sortDirection": 1,
        "name": "Penalty Minutes",
        "width": 3.3000000000000003,
        "shortName": "PIM",
        "key": "2170#-1"
       },
       {
        "sortDirection": 1,
        "name": "Shots on Goal",
        "width": 3.3000000000000003,
        "shortName": "SOG",
        "key": "2270#-1"
       },
       {
        "sortDirection": 1,
        "name": "Power Play Goals",
        "width": 3.3000000000000003,
        "shortName": "PPG",
        "key": "2210#-1"
       },
       {
        "sortDirection": 1,
        "name": "Power Play Assists",
        "width": 3.3000000000000003,
        "shortName": "PPA",
        "key": "2200#-1"
       },
       {
        "sortDirection": 1,
        "name": "Short-Handed Goals",
        "width": 3.3000000000000003,
        "shortName": "SHG",
        "key": "2250#-1"
       },
       {
        "sortDirection": 1,
        "name": "Short-Handed Assists",
        "width": 3.3000000000000003,
        "shortName": "SHA",
        "key": "2240#-1"
       },
       {
        "sortDirection": 1,
        "name": "Game-winning Goals",
        "width": 3.3000000000000003,
        "shortName": "GWG",
        "key": "2120#-1"
       },
       {
        "sortDirection": 1,
        "name": "Hits",
        "width": 3.3000000000000003,
        "shortName": "Hit",
        "key": "2147#-1"
       },
       {
        "sortDirection": 1,
        "name": "Blocks",
        "width": 3.3000000000000003,
        "shortName": "Blk",
        "key": "2092#-1"
       },
       {
        "sortDirection": 1,
        "name": "Faceoffs Won/Lost",
        "width": 13.200000000000001,
        "shortName": "Faceoffs",
        "key": "231c#-1"
       },
       {
        "sortDirection": 1,
        "name": "Time On Ice",
        "width": 5.720000000000001,
        "shortName": "TOI",
        "key": "2300#-1"
       },
       {
        "sortDirection": 1,
        "name": "Time On Ice - Power Play",
        "width": 5.5,
        "shortName": "TOIPP",
        "key": "2304#-1"
       },
       {
        "sortDirection": 1,
        "name": "Time On Ice - Short-Handed",
        "width": 5.5,
        "shortName": "TOISH",
        "key": "2306#-1"
       }
      ]
     },
     "rows": [
      {
       "cells": [
        {
         "content": "Oct 15"
        },
        {
         "content": "VAN",
         "toolTip": "Vancouver"
        },
        {
         "content": "@FLA"
        },
        {
         "content": "L 2-3",
         "props": {
          "eventId": "06mjg"
         }
        },
        {
         "content": "9.5"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "2"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "2"
        },
        {
         "content": "2"
        },
        {
         "content": "0-0-0%"
        },
        {
         "content": "22:35"
        },
        {
         "content": "00:00"
        },
        {
         "content": "02:45"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "Oct 13"
        },
        {
         "content": "VAN",
         "toolTip": "Vancouver"
        },
        {
         "content": "@NYI"
        },
        {
         "content": "L 2-3",
         "props": {
          "eventId": "06mj0"
         }
        },
        {
         "content": "1.9"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "2"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "2"
        },
        {
         "content": "1"
        },
        {
         "content": "0-0-0%"
        },
        {
         "content": "16:37"
        },
        {
         "content": "00:00"
        },
        {
         "content": "01:58"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "Oct 11"
        },
        {
         "content": "VAN",
         "toolTip": "Vancouver"
        },
        {
         "content": "@NYR"
        },
        {
         "content": "L 2-6",
         "props": {
          "eventId": "06mio"
         }
        },
        {
         "content": "11.3"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "2"
        },
        {
         "content": "0"
        },
        {
         "content": "2"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "1"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "4"
        },
        {
         "content": "0"
        },
        {
         "content": "0-0-0%"
        },
        {
         "content": "21:30"
        },
        {
         "content": "00:00"
        },
        {
         "content": "02:42"
        }
       ]
      },
      {
       "cells": [
        {
         "content": "Oct 10"
        },
        {
         "content": "VAN",
         "toolTip": "Vancouver"
        },
        {
         "content": "@NJD"
        },
        {
         "content": "L 1-4",
         "props": {
          "eventId": "06mia"
         }
        },
        {
         "content": "2.6"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "0"
        },
        {
         "content": "2"
        },
        {
         "content": "2"
        },
        {
         "content": "0-0-0%"
        },
        {
         "content": "19:31"
        },
        {
         "content": "00:00"
        },
        {
         "content": "02:42"
        }
       ]
      }
     ]
    }
   ],
   "selectedSeason": {
    "seasonType": {
     "code": "REGULAR"
    },
    "displayNameShort": "2026-27 Reg",
    "endDate": 1807415999000,
    "displayName": "2026-27 Reg Season",
    "id": "31n",
    "startDate": 1790654400000,
    "displayYear": "2026-27"
   }
  }
 },
 "miscData": {
  "leagueData": [
   {
    "name": "FPts",
    "description": "Fantasy Points (2026-27 Reg Season)",
    "value": "46.5"
   },
   {
    "name": "FP/G",
    "description": "Average Fantasy Points per Game (2026-27 Reg Season)",
    "value": "5.17"
   },
   {
    "name": "Eligible",
    "description": "Eligible positions in this league",
    "value": "D,Skt"
   }
  ]
 }
};

// getTeamRosterInfo (Team Roster page), our league, hand-trimmed rows; scorer / row fields cut to what the script and the
// Game Tracker read (no fantasy-team ids, actions, icons or headshots). Captured 2026-10-17 (read-only replays of the page's
// own requests). DAY = lineup day 18 (period:"18"): has the Totals row (one cell short: no Rk) and the empty / spots rows;
// SEASON = 2025-26 YTD (no Totals row). STATS = counts, FPTS = the same cells as fantasy points, PERGAME = Tracked (Per-Game).
export const ROSTER_STATS_DAY = {"displayedSelections": {"displayedStatsType": "1", "displayedPeriod": 18, "adminMode": false, "displayedView": "STATS", "lineupChangeSystem": "EASY_CLICK", "displayedStartDate": 1790654400000, "displayedScoringCategoryType": "5", "displayedSeasonOrProjection": {"code": "SEASON_31n_BY_PERIOD", "endDate": 1807415999000, "name": "2026-27 Reg Season - Period", "showGoBackDays": true, "shortName": "2026-27 Reg - Period", "timeframeTypeCode": "BY_PERIOD", "startDate": 1790654400000}, "displayedEndDate": 1792209600000}, "tables": [{"scGroup": "2010", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 9.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2100#-1", "scipId": "2010#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 3.0, "shortName": "GP", "key": "2010#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2130#-1", "scipId": "2010#2130#-1", "sortType": "SCORING_CATEGORY", "name": "Goals", "width": 3.0, "shortName": "G", "key": "2010#2130#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2090#-1", "scipId": "2010#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3.0, "shortName": "A", "key": "2010#2090#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2190#-1", "scipId": "2010#2190#-1", "sortType": "SCORING_CATEGORY", "name": "Points -- Goals + Assists", "width": 3.0, "shortName": "Pt", "key": "2010#2190#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2270#-1", "scipId": "2010#2270#-1", "sortType": "SCORING_CATEGORY", "name": "Shots on Goal", "width": 3.0, "shortName": "SOG", "key": "2010#2270#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2120#-1", "scipId": "2010#2120#-1", "sortType": "SCORING_CATEGORY", "name": "Game-winning Goals", "width": 3.0, "shortName": "GWG", "key": "2010#2120#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2327#-1", "scipId": "2010#2327#-1", "sortType": "SCORING_CATEGORY", "name": "Power Play Points", "width": 3.0, "shortName": "PPP", "key": "2010#2327#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2344#-1", "scipId": "2010#2344#-1", "sortType": "SCORING_CATEGORY", "name": "Short-Handed Points", "width": 3.0, "shortName": "SHP", "key": "2010#2344#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2145#-1", "scipId": "2010#2145#-1", "sortType": "SCORING_CATEGORY", "name": "Hat Tricks -- Three or more goals in a game", "width": 3.0, "shortName": "HT", "key": "2010#2145#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2147#-1", "scipId": "2010#2147#-1", "sortType": "SCORING_CATEGORY", "name": "Hits", "width": 3.0, "shortName": "Hit", "key": "2010#2147#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2092#-1", "scipId": "2010#2092#-1", "sortType": "SCORING_CATEGORY", "name": "Blocks -- A player blocks a shot by an opposing shooter.", "width": 3.0, "shortName": "Blk", "key": "2010#2092#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2096#-1", "scipId": "2010#2096#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Won", "width": 3.0, "shortName": "FOW", "key": "2010#2096#-1", "maxWidth": 3.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2010#2095#-1", "scipId": "2010#2095#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Lost", "width": 3.0, "shortName": "FOL", "key": "2010#2095#-1", "maxWidth": 3.0}]}, "rows": [{"posId": "206", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["206", "208"], "scorer": {"scorerId": "03167", "name": "Bo Horvat", "shortName": "B. Horvat", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "NYI", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "11 • 37", "toolTip": "C rank: 11 • Overall rank: 37"}, {"content": "31"}, {"content": ""}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}, {"posId": "203", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "206", "208"], "scorer": {"scorerId": "04a9v", "name": "Morgan Geekie", "shortName": "M. Geekie", "posShortNames": "C,LW,RW", "posIds": ["206", "203", "204", "208"], "posIdsNoFlex": ["206", "203", "204"], "defaultPosId": "203", "teamShortName": "BOS", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "31 • 128", "toolTip": "LW rank: 31 • Overall rank: 128"}, {"content": "28"}, {"content": "BOS 4<br/>@ANA 2 F", "eventId": "06mjn"}, {"content": "6.01"}, {"content": "6.01"}, {"content": "1"}, {"content": "0"}, {"content": "1"}, {"content": "1"}, {"content": "1"}, {"content": "0"}, {"content": "1"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "1"}, {"content": "3"}, {"content": "2"}]}, {"posId": "204", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["204", "206", "208"], "scorer": {"scorerId": "06snb", "name": "Benjamin Kindel", "shortName": "B. Kindel", "posShortNames": "C,RW", "posIds": ["206", "204", "208"], "posIdsNoFlex": ["206", "204"], "defaultPosId": "204", "teamShortName": "PIT", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "102 • 331", "toolTip": "RW rank: 102 • Overall rank: 331"}, {"content": "19"}, {"content": "PIT 2<br/>@COL 5 F", "eventId": "06mjm"}, {"content": "0.39"}, {"content": "0.39"}, {"content": "1"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "2"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "1"}, {"content": "3"}]}, {"posId": "202", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["202", "208"], "scorer": {"scorerId": "02wy5", "name": "Nikita Zadorov", "shortName": "N. Zadorov", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "BOS", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "26 • 108", "toolTip": "D rank: 26 • Overall rank: 108"}, {"content": "31"}, {"content": "BOS 4<br/>@ANA 2 F", "eventId": "06mjn"}, {"content": "3.6"}, {"content": "3.6"}, {"content": "1"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "6"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}, {"posId": "202", "statusId": "1", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"posId": "204", "statusId": "2", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["204", "208"], "scorer": {"scorerId": "06bdr", "name": "Roman Kantserov", "shortName": "R. Kantserov", "posShortNames": "RW", "posIds": ["204", "208"], "posIdsNoFlex": ["204"], "defaultPosId": "204", "teamShortName": "CHI", "disableLineupChange": true, "rookie": true, "team": false, "minorsEligible": false}, "cells": [{"content": "119 • 370", "toolTip": "RW rank: 119 • Overall rank: 370"}, {"content": "22"}, {"content": ""}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}, {"statusId": "2", "numSpotsAvailableText": "Reserve spot(s) available", "numSpotsAvailableIcon": "LIMITED_BY_MAX", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"posId": "204", "statusId": "3", "eligibleStatusIds": ["1", "2", "3"], "eligiblePosIds": ["204", "208"], "scorer": {"scorerId": "03rik", "name": "Troy Terry", "shortName": "T. Terry", "posShortNames": "RW", "posIds": ["204", "208"], "posIdsNoFlex": ["204"], "defaultPosId": "204", "teamShortName": "ANA", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "1557 • 7910", "toolTip": "RW rank: 1557 • Overall rank: 7910"}, {"content": "29"}, {"content": "BOS 4<br/>@ANA 2 F", "eventId": "06mjn"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}, {"statusId": "3", "numSpotsAvailableText": "Inj Res spot(s) available", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"statusId": "y", "scorerColumn": "Totals", "bold": true, "scorer": {"rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": ""}, {"content": ""}, {"content": "10"}, {"content": "3.33"}, {"content": "3"}, {"content": "0"}, {"content": "1"}, {"content": "1"}, {"content": "3"}, {"content": "0"}, {"content": "1"}, {"content": "0"}, {"content": "0"}, {"content": "6"}, {"content": "1"}, {"content": "4"}, {"content": "5"}]}]}, {"scGroup": "2020", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 6.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2100#-1", "scipId": "2020#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 3.0, "shortName": "GP", "key": "2020#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#231b#-1", "scipId": "2020#231b#-1", "sortType": "SCORING_CATEGORY", "name": "Wins (Goalies only) -- Includes Overtime Wins and Shootout Wins. Skaters cannot get a win using this category - for that - use the \"regular\" Wins category.", "width": 3.0, "shortName": "W", "key": "2020#231b#-1", "maxWidth": 3.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#232c#-1", "scipId": "2020#232c#-1", "sortType": "SCORING_CATEGORY", "name": "Overtime Losses + Shootout Losses", "width": 6.0, "shortName": "OL+ShL", "key": "2020#232c#-1", "maxWidth": 6.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#2140#-1", "scipId": "2020#2140#-1", "sortType": "SCORING_CATEGORY", "name": "Goals Against", "width": 3.0, "shortName": "GA", "key": "2020#2140#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2230#-1", "scipId": "2020#2230#-1", "sortType": "SCORING_CATEGORY", "name": "Saves", "width": 3.0, "shortName": "SV", "key": "2020#2230#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2290#-1", "scipId": "2020#2290#-1", "sortType": "SCORING_CATEGORY", "name": "Shutouts", "width": 3.0, "shortName": "SHO", "key": "2020#2290#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2090#-1", "scipId": "2020#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3.0, "shortName": "A", "key": "2020#2090#-1", "maxWidth": 3.0}]}, "rows": [{"posId": "201", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["201"], "scorer": {"scorerId": "03ynu", "name": "Carter Hart", "shortName": "C. Hart", "posShortNames": "G", "posIds": ["201"], "posIdsNoFlex": ["201"], "defaultPosId": "201", "teamShortName": "VGK", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "6 • 23", "toolTip": "G rank: 6 • Overall rank: 23"}, {"content": "28"}, {"content": ""}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}, {"posId": "201", "statusId": "1", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"statusId": "2", "numSpotsAvailableText": "Reserve spot(s) available", "numSpotsAvailableIcon": "LIMITED_BY_MAX", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"statusId": "y", "scorerColumn": "Totals", "bold": true, "scorer": {"rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": ""}, {"content": ""}, {"content": "0"}, {"content": ""}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}]}]};
export const ROSTER_FPTS_DAY = {"displayedSelections": {"displayedStatsType": "1", "displayedPeriod": 18, "adminMode": false, "displayedView": "FPTS", "lineupChangeSystem": "EASY_CLICK", "displayedStartDate": 1790654400000, "displayedScoringCategoryType": "5", "displayedSeasonOrProjection": {"code": "SEASON_31n_BY_PERIOD", "endDate": 1807415999000, "name": "2026-27 Reg Season - Period", "showGoBackDays": true, "shortName": "2026-27 Reg - Period", "timeframeTypeCode": "BY_PERIOD", "startDate": 1790654400000}, "displayedEndDate": 1792209600000}, "tables": [{"scGroup": "2010", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 9.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2100#-1", "scipId": "2010#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 3.0, "shortName": "GP", "key": "2010#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2130#-1", "scipId": "2010#2130#-1", "sortType": "SCORING_CATEGORY", "name": "Goals", "width": 3.0, "shortName": "G", "key": "2010#2130#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2090#-1", "scipId": "2010#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3.0, "shortName": "A", "key": "2010#2090#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2190#-1", "scipId": "2010#2190#-1", "sortType": "SCORING_CATEGORY", "name": "Points -- Goals + Assists", "width": 3.0, "shortName": "Pt", "key": "2010#2190#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2270#-1", "scipId": "2010#2270#-1", "sortType": "SCORING_CATEGORY", "name": "Shots on Goal", "width": 3.0, "shortName": "SOG", "key": "2010#2270#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2120#-1", "scipId": "2010#2120#-1", "sortType": "SCORING_CATEGORY", "name": "Game-winning Goals", "width": 3.0, "shortName": "GWG", "key": "2010#2120#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2327#-1", "scipId": "2010#2327#-1", "sortType": "SCORING_CATEGORY", "name": "Power Play Points", "width": 3.0, "shortName": "PPP", "key": "2010#2327#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2344#-1", "scipId": "2010#2344#-1", "sortType": "SCORING_CATEGORY", "name": "Short-Handed Points", "width": 3.0, "shortName": "SHP", "key": "2010#2344#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2145#-1", "scipId": "2010#2145#-1", "sortType": "SCORING_CATEGORY", "name": "Hat Tricks -- Three or more goals in a game", "width": 3.0, "shortName": "HT", "key": "2010#2145#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2147#-1", "scipId": "2010#2147#-1", "sortType": "SCORING_CATEGORY", "name": "Hits", "width": 3.0, "shortName": "Hit", "key": "2010#2147#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2092#-1", "scipId": "2010#2092#-1", "sortType": "SCORING_CATEGORY", "name": "Blocks -- A player blocks a shot by an opposing shooter.", "width": 3.0, "shortName": "Blk", "key": "2010#2092#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2096#-1", "scipId": "2010#2096#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Won", "width": 3.0, "shortName": "FOW", "key": "2010#2096#-1", "maxWidth": 3.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2010#2095#-1", "scipId": "2010#2095#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Lost", "width": 3.0, "shortName": "FOL", "key": "2010#2095#-1", "maxWidth": 3.0}]}, "rows": [{"posId": "206", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["206", "208"], "scorer": {"scorerId": "03167", "name": "Bo Horvat", "shortName": "B. Horvat", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "NYI", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "11 • 37", "toolTip": "C rank: 11 • Overall rank: 37"}, {"content": "31"}, {"content": ""}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}, {"posId": "203", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "206", "208"], "scorer": {"scorerId": "04a9v", "name": "Morgan Geekie", "shortName": "M. Geekie", "posShortNames": "C,LW,RW", "posIds": ["206", "203", "204", "208"], "posIdsNoFlex": ["206", "203", "204"], "defaultPosId": "203", "teamShortName": "BOS", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "31 • 128", "toolTip": "LW rank: 31 • Overall rank: 128"}, {"content": "28"}, {"content": "BOS 4<br/>@ANA 2 F", "eventId": "06mjn"}, {"content": "6.01"}, {"content": "6.01"}, {"content": "0"}, {"content": "0"}, {"content": "2"}, {"content": "1.5"}, {"content": "0.45"}, {"content": "0"}, {"content": "1"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0.7"}, {"content": "0.9"}, {"content": "-0.54"}]}, {"posId": "204", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["204", "206", "208"], "scorer": {"scorerId": "06snb", "name": "Benjamin Kindel", "shortName": "B. Kindel", "posShortNames": "C,RW", "posIds": ["206", "204", "208"], "posIdsNoFlex": ["206", "204"], "defaultPosId": "204", "teamShortName": "PIT", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "102 • 331", "toolTip": "RW rank: 102 • Overall rank: 331"}, {"content": "19"}, {"content": "PIT 2<br/>@COL 5 F", "eventId": "06mjm"}, {"content": "0.39"}, {"content": "0.39"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0.9"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0.3"}, {"content": "-0.81"}]}, {"posId": "202", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["202", "208"], "scorer": {"scorerId": "02wy5", "name": "Nikita Zadorov", "shortName": "N. Zadorov", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "BOS", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "26 • 108", "toolTip": "D rank: 26 • Overall rank: 108"}, {"content": "31"}, {"content": "BOS 4<br/>@ANA 2 F", "eventId": "06mjn"}, {"content": "3.6"}, {"content": "3.6"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "3.6"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}, {"posId": "202", "statusId": "1", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"posId": "204", "statusId": "2", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["204", "208"], "scorer": {"scorerId": "06bdr", "name": "Roman Kantserov", "shortName": "R. Kantserov", "posShortNames": "RW", "posIds": ["204", "208"], "posIdsNoFlex": ["204"], "defaultPosId": "204", "teamShortName": "CHI", "disableLineupChange": true, "rookie": true, "team": false, "minorsEligible": false}, "cells": [{"content": "119 • 370", "toolTip": "RW rank: 119 • Overall rank: 370"}, {"content": "22"}, {"content": ""}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}, {"statusId": "2", "numSpotsAvailableText": "Reserve spot(s) available", "numSpotsAvailableIcon": "LIMITED_BY_MAX", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"posId": "204", "statusId": "3", "eligibleStatusIds": ["1", "2", "3"], "eligiblePosIds": ["204", "208"], "scorer": {"scorerId": "03rik", "name": "Troy Terry", "shortName": "T. Terry", "posShortNames": "RW", "posIds": ["204", "208"], "posIdsNoFlex": ["204"], "defaultPosId": "204", "teamShortName": "ANA", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "1557 • 7910", "toolTip": "RW rank: 1557 • Overall rank: 7910"}, {"content": "29"}, {"content": "BOS 4<br/>@ANA 2 F", "eventId": "06mjn"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}, {"statusId": "3", "numSpotsAvailableText": "Inj Res spot(s) available", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"statusId": "y", "scorerColumn": "Totals", "bold": true, "scorer": {"rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": ""}, {"content": ""}, {"content": "10"}, {"content": "3.33"}, {"content": "0"}, {"content": "0"}, {"content": "2"}, {"content": "1.5"}, {"content": "1.35"}, {"content": "0"}, {"content": "1"}, {"content": "0"}, {"content": "0"}, {"content": "3.6"}, {"content": "0.7"}, {"content": "1.2"}, {"content": "-1.35"}]}]}, {"scGroup": "2020", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 6.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2100#-1", "scipId": "2020#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 3.0, "shortName": "GP", "key": "2020#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#231b#-1", "scipId": "2020#231b#-1", "sortType": "SCORING_CATEGORY", "name": "Wins (Goalies only) -- Includes Overtime Wins and Shootout Wins. Skaters cannot get a win using this category - for that - use the \"regular\" Wins category.", "width": 3.0, "shortName": "W", "key": "2020#231b#-1", "maxWidth": 3.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#232c#-1", "scipId": "2020#232c#-1", "sortType": "SCORING_CATEGORY", "name": "Overtime Losses + Shootout Losses", "width": 6.0, "shortName": "OL+ShL", "key": "2020#232c#-1", "maxWidth": 6.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#2140#-1", "scipId": "2020#2140#-1", "sortType": "SCORING_CATEGORY", "name": "Goals Against", "width": 3.0, "shortName": "GA", "key": "2020#2140#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2230#-1", "scipId": "2020#2230#-1", "sortType": "SCORING_CATEGORY", "name": "Saves", "width": 3.0, "shortName": "SV", "key": "2020#2230#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2290#-1", "scipId": "2020#2290#-1", "sortType": "SCORING_CATEGORY", "name": "Shutouts", "width": 3.0, "shortName": "SHO", "key": "2020#2290#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2090#-1", "scipId": "2020#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3.0, "shortName": "A", "key": "2020#2090#-1", "maxWidth": 3.0}]}, "rows": [{"posId": "201", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["201"], "scorer": {"scorerId": "03ynu", "name": "Carter Hart", "shortName": "C. Hart", "posShortNames": "G", "posIds": ["201"], "posIdsNoFlex": ["201"], "defaultPosId": "201", "teamShortName": "VGK", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "6 • 23", "toolTip": "G rank: 6 • Overall rank: 23"}, {"content": "28"}, {"content": ""}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}, {"posId": "201", "statusId": "1", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"statusId": "2", "numSpotsAvailableText": "Reserve spot(s) available", "numSpotsAvailableIcon": "LIMITED_BY_MAX", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"statusId": "y", "scorerColumn": "Totals", "bold": true, "scorer": {"rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": ""}, {"content": ""}, {"content": "0"}, {"content": ""}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}]}]};
export const ROSTER_STATS_SEASON = {"displayedSelections": {"displayedStatsType": "1", "displayedPeriod": 19, "adminMode": false, "displayedView": "STATS", "lineupChangeSystem": "EASY_CLICK", "displayedStartDate": 1790654400000, "displayedScoringCategoryType": "5", "displayedSeasonOrProjection": {"code": "SEASON_31l_YEAR_TO_DATE", "endDate": 1776398399000, "name": "2025-26 Reg Season - YTD", "shortName": "2025-26 Reg - YTD", "timeframeTypeCode": "YEAR_TO_DATE", "startDate": 1759809600000}, "displayedEndDate": 1792209600000}, "tables": [{"scGroup": "2010", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 8.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "width": 6.5, "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2100#-1", "scipId": "2010#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 3.0, "shortName": "GP", "key": "2010#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2130#-1", "scipId": "2010#2130#-1", "sortType": "SCORING_CATEGORY", "name": "Goals", "width": 3.0, "shortName": "G", "key": "2010#2130#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2090#-1", "scipId": "2010#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3.0, "shortName": "A", "key": "2010#2090#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2190#-1", "scipId": "2010#2190#-1", "sortType": "SCORING_CATEGORY", "name": "Points -- Goals + Assists", "width": 3.0, "shortName": "Pt", "key": "2010#2190#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2270#-1", "scipId": "2010#2270#-1", "sortType": "SCORING_CATEGORY", "name": "Shots on Goal", "width": 3.0, "shortName": "SOG", "key": "2010#2270#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2120#-1", "scipId": "2010#2120#-1", "sortType": "SCORING_CATEGORY", "name": "Game-winning Goals", "width": 3.0, "shortName": "GWG", "key": "2010#2120#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2327#-1", "scipId": "2010#2327#-1", "sortType": "SCORING_CATEGORY", "name": "Power Play Points", "width": 3.0, "shortName": "PPP", "key": "2010#2327#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2344#-1", "scipId": "2010#2344#-1", "sortType": "SCORING_CATEGORY", "name": "Short-Handed Points", "width": 3.0, "shortName": "SHP", "key": "2010#2344#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2145#-1", "scipId": "2010#2145#-1", "sortType": "SCORING_CATEGORY", "name": "Hat Tricks -- Three or more goals in a game", "width": 3.0, "shortName": "HT", "key": "2010#2145#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2147#-1", "scipId": "2010#2147#-1", "sortType": "SCORING_CATEGORY", "name": "Hits", "width": 3.0, "shortName": "Hit", "key": "2010#2147#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2092#-1", "scipId": "2010#2092#-1", "sortType": "SCORING_CATEGORY", "name": "Blocks -- A player blocks a shot by an opposing shooter.", "width": 3.0, "shortName": "Blk", "key": "2010#2092#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2096#-1", "scipId": "2010#2096#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Won", "width": 3.0, "shortName": "FOW", "key": "2010#2096#-1", "maxWidth": 3.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2010#2095#-1", "scipId": "2010#2095#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Lost", "width": 3.0, "shortName": "FOL", "key": "2010#2095#-1", "maxWidth": 3.0}]}, "rows": [{"posId": "206", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["206", "208"], "scorer": {"scorerId": "03167", "name": "Bo Horvat", "shortName": "B. Horvat", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "NYI", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "21 • 80", "toolTip": "C rank: 21 • Overall rank: 80"}, {"content": "31"}, {"content": "@TOR<br/>Sat 6:00PM", "eventId": "06mjt"}, {"content": "486.68"}, {"content": "7.16"}, {"content": "68"}, {"content": "31"}, {"content": "26"}, {"content": "57"}, {"content": "226"}, {"content": "7"}, {"content": "16"}, {"content": "1"}, {"content": "1"}, {"content": "51"}, {"content": "38"}, {"content": "690"}, {"content": "536"}]}, {"posId": "203", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "208"], "scorer": {"scorerId": "042ye", "name": "Jesper Bratt", "shortName": "J. Bratt", "posShortNames": "LW,RW", "posIds": ["203", "204", "208"], "posIdsNoFlex": ["203", "204"], "defaultPosId": "203", "teamShortName": "NJD", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "31 • 116", "toolTip": "LW rank: 31 • Overall rank: 116"}, {"content": "28"}, {"content": "NJD 1<br/>@WSH 1", "eventId": "06mjo"}, {"content": "442.54"}, {"content": "5.4"}, {"content": "82"}, {"content": "22"}, {"content": "49"}, {"content": "71"}, {"content": "178"}, {"content": "4"}, {"content": "20"}, {"content": "2"}, {"content": "0"}, {"content": "74"}, {"content": "24"}, {"content": "3"}, {"content": "8"}]}, {"posId": "203", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "206", "208"], "scorer": {"scorerId": "04a9v", "name": "Morgan Geekie", "shortName": "M. Geekie", "posShortNames": "C,LW,RW", "posIds": ["206", "203", "204", "208"], "posIdsNoFlex": ["206", "203", "204"], "defaultPosId": "203", "teamShortName": "BOS", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "19 • 82", "toolTip": "LW rank: 19 • Overall rank: 82"}, {"content": "28"}, {"content": "@LAK<br/>Sat 8:00PM", "eventId": "06mjz"}, {"content": "485.66"}, {"content": "6"}, {"content": "81"}, {"content": "39"}, {"content": "29"}, {"content": "68"}, {"content": "181"}, {"content": "6"}, {"content": "24"}, {"content": "0"}, {"content": "1"}, {"content": "110"}, {"content": "34"}, {"content": "73"}, {"content": "87"}]}, {"posId": "204", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "208"], "scorer": {"scorerId": "04ln4", "name": "Kiefer Sherwood", "shortName": "K. Sherwood", "posShortNames": "LW,RW", "posIds": ["203", "204", "208"], "posIdsNoFlex": ["203", "204"], "defaultPosId": "204", "teamShortName": "SJS", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "23 • 94", "toolTip": "RW rank: 23 • Overall rank: 94"}, {"content": "31"}, {"content": "@DET<br/>Sat 6:00PM", "eventId": "06mju"}, {"content": "474.31"}, {"content": "6.59"}, {"content": "72"}, {"content": "23"}, {"content": "13"}, {"content": "36"}, {"content": "172"}, {"content": "3"}, {"content": "12"}, {"content": "1"}, {"content": "2"}, {"content": "339"}, {"content": "30"}, {"content": "16"}, {"content": "27"}]}, {"posId": "202", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["202", "208"], "scorer": {"scorerId": "04lbz", "name": "Quinn Hughes", "shortName": "Q. Hughes", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "MIN", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "9 • 35", "toolTip": "D rank: 9 • Overall rank: 35"}, {"content": "27"}, {"content": ""}, {"content": "572.25"}, {"content": "7.73"}, {"content": "74"}, {"content": "7"}, {"content": "69"}, {"content": "76"}, {"content": "187"}, {"content": "1"}, {"content": "34"}, {"content": "0"}, {"content": "0"}, {"content": "7"}, {"content": "87"}, {"content": "0"}, {"content": "0"}]}, {"posId": "202", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["202", "208"], "scorer": {"scorerId": "02wy5", "name": "Nikita Zadorov", "shortName": "N. Zadorov", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "BOS", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "56 • 218", "toolTip": "D rank: 56 • Overall rank: 218"}, {"content": "31"}, {"content": "@LAK<br/>Sat 8:00PM", "eventId": "06mjz"}, {"content": "351.15"}, {"content": "4.34"}, {"content": "81"}, {"content": "2"}, {"content": "20"}, {"content": "22"}, {"content": "107"}, {"content": "1"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "196"}, {"content": "102"}, {"content": "0"}, {"content": "0"}]}, {"posId": "202", "statusId": "1", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}]}, {"scGroup": "2020", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 6.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2100#-1", "scipId": "2020#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 3.0, "shortName": "GP", "key": "2020#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#231b#-1", "scipId": "2020#231b#-1", "sortType": "SCORING_CATEGORY", "name": "Wins (Goalies only) -- Includes Overtime Wins and Shootout Wins. Skaters cannot get a win using this category - for that - use the \"regular\" Wins category.", "width": 3.0, "shortName": "W", "key": "2020#231b#-1", "maxWidth": 3.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#232c#-1", "scipId": "2020#232c#-1", "sortType": "SCORING_CATEGORY", "name": "Overtime Losses + Shootout Losses", "width": 6.0, "shortName": "OL+ShL", "key": "2020#232c#-1", "maxWidth": 6.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#2140#-1", "scipId": "2020#2140#-1", "sortType": "SCORING_CATEGORY", "name": "Goals Against", "width": 3.0, "shortName": "GA", "key": "2020#2140#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2230#-1", "scipId": "2020#2230#-1", "sortType": "SCORING_CATEGORY", "name": "Saves", "width": 3.0, "shortName": "SV", "key": "2020#2230#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2290#-1", "scipId": "2020#2290#-1", "sortType": "SCORING_CATEGORY", "name": "Shutouts", "width": 3.0, "shortName": "SHO", "key": "2020#2290#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2090#-1", "scipId": "2020#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3.0, "shortName": "A", "key": "2020#2090#-1", "maxWidth": 3.0}]}, "rows": [{"posId": "201", "statusId": "2", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["201"], "scorer": {"scorerId": "03ynu", "name": "Carter Hart", "shortName": "C. Hart", "posShortNames": "G", "posIds": ["201"], "posIdsNoFlex": ["201"], "defaultPosId": "201", "teamShortName": "VGK", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "64 • 580", "toolTip": "G rank: 64 • Overall rank: 580"}, {"content": "28"}, {"content": "PIT<br/>Sat 9:00PM", "eventId": "06mk0"}, {"content": "168.6"}, {"content": "9.37"}, {"content": "18"}, {"content": "11"}, {"content": "3"}, {"content": "46"}, {"content": "376"}, {"content": "0"}, {"content": "0"}]}]}]};
export const ROSTER_FPTS_SEASON = {"displayedSelections": {"displayedStatsType": "1", "displayedPeriod": 19, "adminMode": false, "displayedView": "FPTS", "lineupChangeSystem": "EASY_CLICK", "displayedStartDate": 1790654400000, "displayedScoringCategoryType": "5", "displayedSeasonOrProjection": {"code": "SEASON_31l_YEAR_TO_DATE", "endDate": 1776398399000, "name": "2025-26 Reg Season - YTD", "shortName": "2025-26 Reg - YTD", "timeframeTypeCode": "YEAR_TO_DATE", "startDate": 1759809600000}, "displayedEndDate": 1792209600000}, "tables": [{"scGroup": "2010", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 8.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "width": 6.5, "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2100#-1", "scipId": "2010#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 3.0, "shortName": "GP", "key": "2010#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2130#-1", "scipId": "2010#2130#-1", "sortType": "SCORING_CATEGORY", "name": "Goals", "width": 3.0, "shortName": "G", "key": "2010#2130#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2090#-1", "scipId": "2010#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3.0, "shortName": "A", "key": "2010#2090#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2190#-1", "scipId": "2010#2190#-1", "sortType": "SCORING_CATEGORY", "name": "Points -- Goals + Assists", "width": 3.0, "shortName": "Pt", "key": "2010#2190#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2270#-1", "scipId": "2010#2270#-1", "sortType": "SCORING_CATEGORY", "name": "Shots on Goal", "width": 3.0, "shortName": "SOG", "key": "2010#2270#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2120#-1", "scipId": "2010#2120#-1", "sortType": "SCORING_CATEGORY", "name": "Game-winning Goals", "width": 3.0, "shortName": "GWG", "key": "2010#2120#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2327#-1", "scipId": "2010#2327#-1", "sortType": "SCORING_CATEGORY", "name": "Power Play Points", "width": 3.0, "shortName": "PPP", "key": "2010#2327#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2344#-1", "scipId": "2010#2344#-1", "sortType": "SCORING_CATEGORY", "name": "Short-Handed Points", "width": 3.0, "shortName": "SHP", "key": "2010#2344#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2145#-1", "scipId": "2010#2145#-1", "sortType": "SCORING_CATEGORY", "name": "Hat Tricks -- Three or more goals in a game", "width": 3.0, "shortName": "HT", "key": "2010#2145#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2147#-1", "scipId": "2010#2147#-1", "sortType": "SCORING_CATEGORY", "name": "Hits", "width": 3.0, "shortName": "Hit", "key": "2010#2147#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2092#-1", "scipId": "2010#2092#-1", "sortType": "SCORING_CATEGORY", "name": "Blocks -- A player blocks a shot by an opposing shooter.", "width": 3.0, "shortName": "Blk", "key": "2010#2092#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2096#-1", "scipId": "2010#2096#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Won", "width": 3.0, "shortName": "FOW", "key": "2010#2096#-1", "maxWidth": 3.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2010#2095#-1", "scipId": "2010#2095#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Lost", "width": 3.0, "shortName": "FOL", "key": "2010#2095#-1", "maxWidth": 3.0}]}, "rows": [{"posId": "206", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["206", "208"], "scorer": {"scorerId": "03167", "name": "Bo Horvat", "shortName": "B. Horvat", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "NYI", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "21 • 80", "toolTip": "C rank: 21 • Overall rank: 80"}, {"content": "31"}, {"content": "@TOR<br/>Sat 6:00PM", "eventId": "06mjt"}, {"content": "486.68"}, {"content": "7.16"}, {"content": "0"}, {"content": "93"}, {"content": "52"}, {"content": "85.5"}, {"content": "101.7"}, {"content": "14"}, {"content": "16"}, {"content": "2"}, {"content": "3"}, {"content": "30.6"}, {"content": "26.6"}, {"content": "207"}, {"content": "-144.72"}]}, {"posId": "203", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "208"], "scorer": {"scorerId": "042ye", "name": "Jesper Bratt", "shortName": "J. Bratt", "posShortNames": "LW,RW", "posIds": ["203", "204", "208"], "posIdsNoFlex": ["203", "204"], "defaultPosId": "203", "teamShortName": "NJD", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "31 • 116", "toolTip": "LW rank: 31 • Overall rank: 116"}, {"content": "28"}, {"content": "NJD 1<br/>@WSH 1", "eventId": "06mjo"}, {"content": "442.54"}, {"content": "5.4"}, {"content": "0"}, {"content": "66"}, {"content": "98"}, {"content": "106.5"}, {"content": "80.1"}, {"content": "8"}, {"content": "20"}, {"content": "4"}, {"content": "0"}, {"content": "44.4"}, {"content": "16.8"}, {"content": "0.9"}, {"content": "-2.16"}]}, {"posId": "203", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "206", "208"], "scorer": {"scorerId": "04a9v", "name": "Morgan Geekie", "shortName": "M. Geekie", "posShortNames": "C,LW,RW", "posIds": ["206", "203", "204", "208"], "posIdsNoFlex": ["206", "203", "204"], "defaultPosId": "203", "teamShortName": "BOS", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "19 • 82", "toolTip": "LW rank: 19 • Overall rank: 82"}, {"content": "28"}, {"content": "@LAK<br/>Sat 8:00PM", "eventId": "06mjz"}, {"content": "485.66"}, {"content": "6"}, {"content": "0"}, {"content": "117"}, {"content": "58"}, {"content": "102"}, {"content": "81.45"}, {"content": "12"}, {"content": "24"}, {"content": "0"}, {"content": "3"}, {"content": "66"}, {"content": "23.8"}, {"content": "21.9"}, {"content": "-23.49"}]}, {"posId": "204", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "208"], "scorer": {"scorerId": "04ln4", "name": "Kiefer Sherwood", "shortName": "K. Sherwood", "posShortNames": "LW,RW", "posIds": ["203", "204", "208"], "posIdsNoFlex": ["203", "204"], "defaultPosId": "204", "teamShortName": "SJS", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "23 • 94", "toolTip": "RW rank: 23 • Overall rank: 94"}, {"content": "31"}, {"content": "@DET<br/>Sat 6:00PM", "eventId": "06mju"}, {"content": "474.31"}, {"content": "6.59"}, {"content": "0"}, {"content": "69"}, {"content": "26"}, {"content": "54"}, {"content": "77.4"}, {"content": "6"}, {"content": "12"}, {"content": "2"}, {"content": "6"}, {"content": "203.4"}, {"content": "21"}, {"content": "4.8"}, {"content": "-7.29"}]}, {"posId": "202", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["202", "208"], "scorer": {"scorerId": "04lbz", "name": "Quinn Hughes", "shortName": "Q. Hughes", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "MIN", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "9 • 35", "toolTip": "D rank: 9 • Overall rank: 35"}, {"content": "27"}, {"content": ""}, {"content": "572.25"}, {"content": "7.73"}, {"content": "0"}, {"content": "21"}, {"content": "138"}, {"content": "228"}, {"content": "84.15"}, {"content": "2"}, {"content": "34"}, {"content": "0"}, {"content": "0"}, {"content": "4.2"}, {"content": "60.9"}, {"content": "0"}, {"content": "0"}]}, {"posId": "202", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["202", "208"], "scorer": {"scorerId": "02wy5", "name": "Nikita Zadorov", "shortName": "N. Zadorov", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "BOS", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "56 • 218", "toolTip": "D rank: 56 • Overall rank: 218"}, {"content": "31"}, {"content": "@LAK<br/>Sat 8:00PM", "eventId": "06mjz"}, {"content": "351.15"}, {"content": "4.34"}, {"content": "0"}, {"content": "6"}, {"content": "40"}, {"content": "66"}, {"content": "48.15"}, {"content": "2"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "117.6"}, {"content": "71.4"}, {"content": "0"}, {"content": "0"}]}, {"posId": "202", "statusId": "1", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}]}, {"scGroup": "2020", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 6.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2100#-1", "scipId": "2020#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 3.0, "shortName": "GP", "key": "2020#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#231b#-1", "scipId": "2020#231b#-1", "sortType": "SCORING_CATEGORY", "name": "Wins (Goalies only) -- Includes Overtime Wins and Shootout Wins. Skaters cannot get a win using this category - for that - use the \"regular\" Wins category.", "width": 3.0, "shortName": "W", "key": "2020#231b#-1", "maxWidth": 3.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#232c#-1", "scipId": "2020#232c#-1", "sortType": "SCORING_CATEGORY", "name": "Overtime Losses + Shootout Losses", "width": 6.0, "shortName": "OL+ShL", "key": "2020#232c#-1", "maxWidth": 6.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#2140#-1", "scipId": "2020#2140#-1", "sortType": "SCORING_CATEGORY", "name": "Goals Against", "width": 3.0, "shortName": "GA", "key": "2020#2140#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2230#-1", "scipId": "2020#2230#-1", "sortType": "SCORING_CATEGORY", "name": "Saves", "width": 3.0, "shortName": "SV", "key": "2020#2230#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2290#-1", "scipId": "2020#2290#-1", "sortType": "SCORING_CATEGORY", "name": "Shutouts", "width": 3.0, "shortName": "SHO", "key": "2020#2290#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2090#-1", "scipId": "2020#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3.0, "shortName": "A", "key": "2020#2090#-1", "maxWidth": 3.0}]}, "rows": [{"posId": "201", "statusId": "2", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["201"], "scorer": {"scorerId": "03ynu", "name": "Carter Hart", "shortName": "C. Hart", "posShortNames": "G", "posIds": ["201"], "posIdsNoFlex": ["201"], "defaultPosId": "201", "teamShortName": "VGK", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "64 • 580", "toolTip": "G rank: 64 • Overall rank: 580"}, {"content": "28"}, {"content": "PIT<br/>Sat 9:00PM", "eventId": "06mk0"}, {"content": "168.6"}, {"content": "9.37"}, {"content": "0"}, {"content": "55"}, {"content": "3"}, {"content": "-115"}, {"content": "225.6"}, {"content": "0"}, {"content": "0"}]}]}]};
export const ROSTER_PERGAME_SEASON = {"displayedSelections": {"displayedStatsType": "1", "displayedPeriod": 19, "adminMode": false, "displayedView": "STATS", "lineupChangeSystem": "EASY_CLICK", "displayedStartDate": 1790654400000, "displayedScoringCategoryType": "7", "displayedSeasonOrProjection": {"code": "SEASON_31l_YEAR_TO_DATE", "endDate": 1776398399000, "name": "2025-26 Reg Season - YTD", "shortName": "2025-26 Reg - YTD", "timeframeTypeCode": "YEAR_TO_DATE", "startDate": 1759809600000}, "displayedEndDate": 1792209600000}, "tables": [{"scGroup": "2010", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 8.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "width": 6.5, "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2100#-1", "scipId": "2010#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 3.0, "shortName": "GP", "key": "2010#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2131#-1", "scipId": "2010#2131#-1", "sortType": "SCORING_CATEGORY", "name": "Goals Per Game", "width": 3.0, "shortName": "G", "key": "2010#2131#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2099#-1", "scipId": "2010#2099#-1", "sortType": "SCORING_CATEGORY", "name": "Assists Per Game", "width": 3.0, "shortName": "A", "key": "2010#2099#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2326#-1", "scipId": "2010#2326#-1", "sortType": "SCORING_CATEGORY", "name": "Points Per Game", "width": 3.0, "shortName": "P/G", "key": "2010#2326#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2272#-1", "scipId": "2010#2272#-1", "sortType": "SCORING_CATEGORY", "name": "Shots on Goal Per Game -- The total shots on goal divided by the number of games played", "width": 3.0, "shortName": "SOG", "key": "2010#2272#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2121#-1", "scipId": "2010#2121#-1", "sortType": "SCORING_CATEGORY", "name": "Game-winning Goals Per Game", "width": 3.0, "shortName": "GWG", "key": "2010#2121#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#232i#-1", "scipId": "2010#232i#-1", "sortType": "SCORING_CATEGORY", "name": "Power Play Points Per Game -- The total power play points divided by the number of games played", "width": 3.0, "shortName": "PPP", "key": "2010#232i#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2344#-1", "scipId": "2010#2344#-1", "sortType": "SCORING_CATEGORY", "name": "Short-Handed Points", "width": 3.0, "shortName": "SHP", "key": "2010#2344#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2145#-1", "scipId": "2010#2145#-1", "sortType": "SCORING_CATEGORY", "name": "Hat Tricks -- Three or more goals in a game", "width": 3.0, "shortName": "HT", "key": "2010#2145#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2325#-1", "scipId": "2010#2325#-1", "sortType": "SCORING_CATEGORY", "name": "Hits Per Game", "width": 4.0, "shortName": "Ht/G", "key": "2010#2325#-1", "maxWidth": 4.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2311#-1", "scipId": "2010#2311#-1", "sortType": "SCORING_CATEGORY", "name": "Blocks Per Game", "width": 5.0, "shortName": "Blk/G", "key": "2010#2311#-1", "maxWidth": 5.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2097#-1", "scipId": "2010#2097#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Won Per Game", "width": 5.0, "shortName": "FOW/G", "key": "2010#2097#-1", "maxWidth": 5.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2010#2095#-1", "scipId": "2010#2095#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Lost", "width": 3.0, "shortName": "FOL", "key": "2010#2095#-1", "maxWidth": 3.0}]}, "rows": [{"posId": "206", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["206", "208"], "scorer": {"scorerId": "03167", "name": "Bo Horvat", "shortName": "B. Horvat", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "NYI", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "21 • 80", "toolTip": "C rank: 21 • Overall rank: 80"}, {"content": "31"}, {"content": "@TOR<br/>Sat 6:00PM", "eventId": "06mjt"}, {"content": "486.68"}, {"content": "7.16"}, {"content": "68"}, {"content": ".46"}, {"content": ".38"}, {"content": "0.84"}, {"content": "3.32"}, {"content": ".10"}, {"content": "0.24"}, {"content": "1"}, {"content": "1"}, {"content": ".75"}, {"content": ".56"}, {"content": "10.15"}, {"content": "536"}]}, {"posId": "203", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "208"], "scorer": {"scorerId": "042ye", "name": "Jesper Bratt", "shortName": "J. Bratt", "posShortNames": "LW,RW", "posIds": ["203", "204", "208"], "posIdsNoFlex": ["203", "204"], "defaultPosId": "203", "teamShortName": "NJD", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "31 • 116", "toolTip": "LW rank: 31 • Overall rank: 116"}, {"content": "28"}, {"content": "NJD 1<br/>@WSH 1", "eventId": "06mjo"}, {"content": "442.54"}, {"content": "5.4"}, {"content": "82"}, {"content": ".27"}, {"content": ".60"}, {"content": "0.87"}, {"content": "2.17"}, {"content": ".05"}, {"content": "0.24"}, {"content": "2"}, {"content": "0"}, {"content": ".90"}, {"content": ".29"}, {"content": "0.04"}, {"content": "8"}]}, {"posId": "203", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "206", "208"], "scorer": {"scorerId": "04a9v", "name": "Morgan Geekie", "shortName": "M. Geekie", "posShortNames": "C,LW,RW", "posIds": ["206", "203", "204", "208"], "posIdsNoFlex": ["206", "203", "204"], "defaultPosId": "203", "teamShortName": "BOS", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "19 • 82", "toolTip": "LW rank: 19 • Overall rank: 82"}, {"content": "28"}, {"content": "@LAK<br/>Sat 8:00PM", "eventId": "06mjz"}, {"content": "485.66"}, {"content": "6"}, {"content": "81"}, {"content": ".48"}, {"content": ".36"}, {"content": "0.84"}, {"content": "2.23"}, {"content": ".07"}, {"content": "0.30"}, {"content": "0"}, {"content": "1"}, {"content": "1.36"}, {"content": ".42"}, {"content": "0.90"}, {"content": "87"}]}, {"posId": "204", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "208"], "scorer": {"scorerId": "04ln4", "name": "Kiefer Sherwood", "shortName": "K. Sherwood", "posShortNames": "LW,RW", "posIds": ["203", "204", "208"], "posIdsNoFlex": ["203", "204"], "defaultPosId": "204", "teamShortName": "SJS", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "23 • 94", "toolTip": "RW rank: 23 • Overall rank: 94"}, {"content": "31"}, {"content": "@DET<br/>Sat 6:00PM", "eventId": "06mju"}, {"content": "474.31"}, {"content": "6.59"}, {"content": "72"}, {"content": ".32"}, {"content": ".18"}, {"content": "0.50"}, {"content": "2.39"}, {"content": ".04"}, {"content": "0.17"}, {"content": "1"}, {"content": "2"}, {"content": "4.71"}, {"content": ".42"}, {"content": "0.22"}, {"content": "27"}]}, {"posId": "202", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["202", "208"], "scorer": {"scorerId": "04lbz", "name": "Quinn Hughes", "shortName": "Q. Hughes", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "MIN", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "9 • 35", "toolTip": "D rank: 9 • Overall rank: 35"}, {"content": "27"}, {"content": ""}, {"content": "572.25"}, {"content": "7.73"}, {"content": "74"}, {"content": ".09"}, {"content": ".93"}, {"content": "1.03"}, {"content": "2.53"}, {"content": ".01"}, {"content": "0.46"}, {"content": "0"}, {"content": "0"}, {"content": ".09"}, {"content": "1.18"}, {"content": "0.00"}, {"content": "0"}]}, {"posId": "202", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["202", "208"], "scorer": {"scorerId": "02wy5", "name": "Nikita Zadorov", "shortName": "N. Zadorov", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "BOS", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "56 • 218", "toolTip": "D rank: 56 • Overall rank: 218"}, {"content": "31"}, {"content": "@LAK<br/>Sat 8:00PM", "eventId": "06mjz"}, {"content": "351.15"}, {"content": "4.34"}, {"content": "81"}, {"content": ".02"}, {"content": ".25"}, {"content": "0.27"}, {"content": "1.32"}, {"content": ".01"}, {"content": "0.00"}, {"content": "0"}, {"content": "0"}, {"content": "2.42"}, {"content": "1.26"}, {"content": "0.00"}, {"content": "0"}]}, {"posId": "202", "statusId": "1", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}]}, {"scGroup": "2020", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 6.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2100#-1", "scipId": "2020#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 3.0, "shortName": "GP", "key": "2020#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#231b#-1", "scipId": "2020#231b#-1", "sortType": "SCORING_CATEGORY", "name": "Wins (Goalies only) -- Includes Overtime Wins and Shootout Wins. Skaters cannot get a win using this category - for that - use the \"regular\" Wins category.", "width": 3.0, "shortName": "W", "key": "2020#231b#-1", "maxWidth": 3.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#232c#-1", "scipId": "2020#232c#-1", "sortType": "SCORING_CATEGORY", "name": "Overtime Losses + Shootout Losses", "width": 6.0, "shortName": "OL+ShL", "key": "2020#232c#-1", "maxWidth": 6.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#2320#-1", "scipId": "2020#2320#-1", "sortType": "SCORING_CATEGORY", "name": "Goals Against Average -- Goals Against x 60 / Minutes Played", "width": 3.0, "shortName": "GAA", "key": "2020#2320#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2330#-1", "scipId": "2020#2330#-1", "sortType": "SCORING_CATEGORY", "name": "Save Percentage -- Saves / Shots on Goal Against", "width": 3.0, "shortName": "SV%", "key": "2020#2330#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2290#-1", "scipId": "2020#2290#-1", "sortType": "SCORING_CATEGORY", "name": "Shutouts", "width": 3.0, "shortName": "SHO", "key": "2020#2290#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2099#-1", "scipId": "2020#2099#-1", "sortType": "SCORING_CATEGORY", "name": "Assists Per Game", "width": 3.0, "shortName": "A", "key": "2020#2099#-1", "maxWidth": 3.0}]}, "rows": [{"posId": "201", "statusId": "2", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["201"], "scorer": {"scorerId": "03ynu", "name": "Carter Hart", "shortName": "C. Hart", "posShortNames": "G", "posIds": ["201"], "posIdsNoFlex": ["201"], "defaultPosId": "201", "teamShortName": "VGK", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "64 • 580", "toolTip": "G rank: 64 • Overall rank: 580"}, {"content": "28"}, {"content": "PIT<br/>Sat 9:00PM", "eventId": "06mk0"}, {"content": "168.6"}, {"content": "9.37"}, {"content": "18"}, {"content": "11"}, {"content": "3"}, {"content": "2.71"}, {"content": ".891"}, {"content": "0"}, {"content": ".00"}]}]}]};
// Fantasy Team stats (statsType 2), 2026-27 YTD: the Totals row counts the whole team's season (dropped players too), so
// it is NOT the sum of the rows shown. Three rows + Totals kept.
export const ROSTER_STATS_FANTASY_TEAM = {"displayedSelections": {"displayedStatsType": "2", "displayedPeriod": 19, "adminMode": false, "displayedView": "STATS", "lineupChangeSystem": "EASY_CLICK", "displayedStartDate": 1790654400000, "displayedScoringCategoryType": "5", "displayedSeasonOrProjection": {"code": "SEASON_31n_YEAR_TO_DATE", "endDate": 1807415999000, "name": "2026-27 Reg Season - YTD", "showGoBackDays": true, "shortName": "2026-27 Reg - YTD", "timeframeTypeCode": "YEAR_TO_DATE", "startDate": 1790654400000}, "displayedEndDate": 1792209600000}, "tables": [{"scGroup": "2010", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 9.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2100#-1", "scipId": "2010#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 3.0, "shortName": "GP", "key": "2010#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2130#-1", "scipId": "2010#2130#-1", "sortType": "SCORING_CATEGORY", "name": "Goals", "width": 3.0, "shortName": "G", "key": "2010#2130#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2090#-1", "scipId": "2010#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3.0, "shortName": "A", "key": "2010#2090#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2190#-1", "scipId": "2010#2190#-1", "sortType": "SCORING_CATEGORY", "name": "Points -- Goals + Assists", "width": 3.0, "shortName": "Pt", "key": "2010#2190#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2270#-1", "scipId": "2010#2270#-1", "sortType": "SCORING_CATEGORY", "name": "Shots on Goal", "width": 3.0, "shortName": "SOG", "key": "2010#2270#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2120#-1", "scipId": "2010#2120#-1", "sortType": "SCORING_CATEGORY", "name": "Game-winning Goals", "width": 3.0, "shortName": "GWG", "key": "2010#2120#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2327#-1", "scipId": "2010#2327#-1", "sortType": "SCORING_CATEGORY", "name": "Power Play Points", "width": 3.0, "shortName": "PPP", "key": "2010#2327#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2344#-1", "scipId": "2010#2344#-1", "sortType": "SCORING_CATEGORY", "name": "Short-Handed Points", "width": 3.0, "shortName": "SHP", "key": "2010#2344#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2145#-1", "scipId": "2010#2145#-1", "sortType": "SCORING_CATEGORY", "name": "Hat Tricks -- Three or more goals in a game", "width": 3.0, "shortName": "HT", "key": "2010#2145#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2147#-1", "scipId": "2010#2147#-1", "sortType": "SCORING_CATEGORY", "name": "Hits", "width": 3.0, "shortName": "Hit", "key": "2010#2147#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2092#-1", "scipId": "2010#2092#-1", "sortType": "SCORING_CATEGORY", "name": "Blocks -- A player blocks a shot by an opposing shooter.", "width": 3.0, "shortName": "Blk", "key": "2010#2092#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2096#-1", "scipId": "2010#2096#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Won", "width": 3.0, "shortName": "FOW", "key": "2010#2096#-1", "maxWidth": 3.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2010#2095#-1", "scipId": "2010#2095#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Lost", "width": 3.0, "shortName": "FOL", "key": "2010#2095#-1", "maxWidth": 3.0}]}, "rows": [{"posId": "206", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["206", "208"], "scorer": {"scorerId": "03167", "name": "Bo Horvat", "shortName": "B. Horvat", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "NYI", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "11 • 37", "toolTip": "C rank: 11 • Overall rank: 37"}, {"content": "31"}, {"content": "@TOR<br/>Sat 6:00PM", "eventId": "06mjt"}, {"content": "63.15"}, {"content": "9.02"}, {"content": "7"}, {"content": "4"}, {"content": "3"}, {"content": "7"}, {"content": "24"}, {"content": "0"}, {"content": "4"}, {"content": "1"}, {"content": "0"}, {"content": "17"}, {"content": "3"}, {"content": "59"}, {"content": "45"}]}, {"posId": "204", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "208"], "scorer": {"scorerId": "04ln4", "name": "Kiefer Sherwood", "shortName": "K. Sherwood", "posShortNames": "LW,RW", "posIds": ["203", "204", "208"], "posIdsNoFlex": ["203", "204"], "defaultPosId": "204", "teamShortName": "SJS", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "36 • 141", "toolTip": "RW rank: 36 • Overall rank: 141"}, {"content": "31"}, {"content": "@DET<br/>Sat 6:00PM", "eventId": "06mju"}, {"content": "41.48"}, {"content": "5.93"}, {"content": "7"}, {"content": "1"}, {"content": "1"}, {"content": "2"}, {"content": "11"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "44"}, {"content": "3"}, {"content": "1"}, {"content": "1"}]}, {"posId": "202", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["202", "208"], "scorer": {"scorerId": "04lbz", "name": "Quinn Hughes", "shortName": "Q. Hughes", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "MIN", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "2 • 10", "toolTip": "D rank: 2 • Overall rank: 10"}, {"content": "27"}, {"content": ""}, {"content": "82.5"}, {"content": "10.31"}, {"content": "8"}, {"content": "2"}, {"content": "10"}, {"content": "12"}, {"content": "24"}, {"content": "1"}, {"content": "5"}, {"content": "0"}, {"content": "0"}, {"content": "1"}, {"content": "3"}, {"content": "0"}, {"content": "0"}]}, {"statusId": "y", "scorerColumn": "Totals", "bold": true, "scorer": {"rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": ""}, {"content": ""}, {"content": "833.7"}, {"content": "5.45"}, {"content": "153"}, {"content": "32"}, {"content": "63"}, {"content": "95"}, {"content": "293"}, {"content": "4"}, {"content": "41"}, {"content": "3"}, {"content": "1"}, {"content": "231"}, {"content": "122"}, {"content": "411"}, {"content": "385"}]}]}]};
export const ROSTER_FPTS_FANTASY_TEAM = {"displayedSelections": {"displayedStatsType": "2", "displayedPeriod": 19, "adminMode": false, "displayedView": "FPTS", "lineupChangeSystem": "EASY_CLICK", "displayedStartDate": 1790654400000, "displayedScoringCategoryType": "5", "displayedSeasonOrProjection": {"code": "SEASON_31n_YEAR_TO_DATE", "endDate": 1807415999000, "name": "2026-27 Reg Season - YTD", "showGoBackDays": true, "shortName": "2026-27 Reg - YTD", "timeframeTypeCode": "YEAR_TO_DATE", "startDate": 1790654400000}, "displayedEndDate": 1792209600000}, "tables": [{"scGroup": "2010", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 9.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2100#-1", "scipId": "2010#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 3.0, "shortName": "GP", "key": "2010#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2130#-1", "scipId": "2010#2130#-1", "sortType": "SCORING_CATEGORY", "name": "Goals", "width": 3.0, "shortName": "G", "key": "2010#2130#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2090#-1", "scipId": "2010#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3.0, "shortName": "A", "key": "2010#2090#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2190#-1", "scipId": "2010#2190#-1", "sortType": "SCORING_CATEGORY", "name": "Points -- Goals + Assists", "width": 3.0, "shortName": "Pt", "key": "2010#2190#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2270#-1", "scipId": "2010#2270#-1", "sortType": "SCORING_CATEGORY", "name": "Shots on Goal", "width": 3.0, "shortName": "SOG", "key": "2010#2270#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2120#-1", "scipId": "2010#2120#-1", "sortType": "SCORING_CATEGORY", "name": "Game-winning Goals", "width": 3.0, "shortName": "GWG", "key": "2010#2120#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2327#-1", "scipId": "2010#2327#-1", "sortType": "SCORING_CATEGORY", "name": "Power Play Points", "width": 3.0, "shortName": "PPP", "key": "2010#2327#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2344#-1", "scipId": "2010#2344#-1", "sortType": "SCORING_CATEGORY", "name": "Short-Handed Points", "width": 3.0, "shortName": "SHP", "key": "2010#2344#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2145#-1", "scipId": "2010#2145#-1", "sortType": "SCORING_CATEGORY", "name": "Hat Tricks -- Three or more goals in a game", "width": 3.0, "shortName": "HT", "key": "2010#2145#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2147#-1", "scipId": "2010#2147#-1", "sortType": "SCORING_CATEGORY", "name": "Hits", "width": 3.0, "shortName": "Hit", "key": "2010#2147#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2092#-1", "scipId": "2010#2092#-1", "sortType": "SCORING_CATEGORY", "name": "Blocks -- A player blocks a shot by an opposing shooter.", "width": 3.0, "shortName": "Blk", "key": "2010#2092#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2096#-1", "scipId": "2010#2096#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Won", "width": 3.0, "shortName": "FOW", "key": "2010#2096#-1", "maxWidth": 3.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2010#2095#-1", "scipId": "2010#2095#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Lost", "width": 3.0, "shortName": "FOL", "key": "2010#2095#-1", "maxWidth": 3.0}]}, "rows": [{"posId": "206", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["206", "208"], "scorer": {"scorerId": "03167", "name": "Bo Horvat", "shortName": "B. Horvat", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "NYI", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "11 • 37", "toolTip": "C rank: 11 • Overall rank: 37"}, {"content": "31"}, {"content": "@TOR<br/>Sat 6:00PM", "eventId": "06mjt"}, {"content": "63.15"}, {"content": "9.02"}, {"content": "0"}, {"content": "12"}, {"content": "6"}, {"content": "10.5"}, {"content": "10.8"}, {"content": "0"}, {"content": "4"}, {"content": "2"}, {"content": "0"}, {"content": "10.2"}, {"content": "2.1"}, {"content": "17.7"}, {"content": "-12.15"}]}, {"posId": "204", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "208"], "scorer": {"scorerId": "04ln4", "name": "Kiefer Sherwood", "shortName": "K. Sherwood", "posShortNames": "LW,RW", "posIds": ["203", "204", "208"], "posIdsNoFlex": ["203", "204"], "defaultPosId": "204", "teamShortName": "SJS", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "36 • 141", "toolTip": "RW rank: 36 • Overall rank: 141"}, {"content": "31"}, {"content": "@DET<br/>Sat 6:00PM", "eventId": "06mju"}, {"content": "41.48"}, {"content": "5.93"}, {"content": "0"}, {"content": "3"}, {"content": "2"}, {"content": "3"}, {"content": "4.95"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "26.4"}, {"content": "2.1"}, {"content": "0.3"}, {"content": "-0.27"}]}, {"posId": "202", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["202", "208"], "scorer": {"scorerId": "04lbz", "name": "Quinn Hughes", "shortName": "Q. Hughes", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "MIN", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "2 • 10", "toolTip": "D rank: 2 • Overall rank: 10"}, {"content": "27"}, {"content": ""}, {"content": "82.5"}, {"content": "10.31"}, {"content": "0"}, {"content": "6"}, {"content": "20"}, {"content": "36"}, {"content": "10.8"}, {"content": "2"}, {"content": "5"}, {"content": "0"}, {"content": "0"}, {"content": "0.6"}, {"content": "2.1"}, {"content": "0"}, {"content": "0"}]}, {"statusId": "y", "scorerColumn": "Totals", "bold": true, "scorer": {"rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": ""}, {"content": ""}, {"content": "833.7"}, {"content": "5.45"}, {"content": "0"}, {"content": "96"}, {"content": "126"}, {"content": "178.5"}, {"content": "131.85"}, {"content": "8"}, {"content": "41"}, {"content": "6"}, {"content": "3"}, {"content": "138.6"}, {"content": "85.4"}, {"content": "123.3"}, {"content": "-103.95"}]}]}]};

// Item 5 (2026-10-17): Trends (OVERVIEW) / Schedule - Week (SCHEDULE_PERIOD) roster views and their Tracked STATS lookups
// (same request + view STATS, scoringCategoryType 5); Players Schedule / Trends pages and their lookups (same request
// with view STATS: same players, same order). DAY = the default lineup day (Trends has a Stats-shaped Totals row LONGER
// than its header); SEASON = 2025-26 YTD. Players "Sta" cells of rostered players replaced by "T1".
export const ROSTER_TRENDS_SEASON = {"displayedSelections": {"displayedStatsType": "1", "displayedPeriod": 19, "adminMode": false, "displayedView": "OVERVIEW", "lineupChangeSystem": "EASY_CLICK", "displayedStartDate": 1790654400000, "displayedScoringCategoryType": "5", "displayedSeasonOrProjection": {"code": "SEASON_31l_YEAR_TO_DATE", "endDate": 1776398399000, "name": "2025-26 Reg Season - YTD", "shortName": "2025-26 Reg - YTD", "timeframeTypeCode": "YEAR_TO_DATE", "startDate": 1759809600000}, "displayedEndDate": 1792209600000}, "tables": [{"scGroup": "2010", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 8.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "width": 6.5, "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PERCENT_OWNED_2", "sortType": "OVERVIEW_PERCENT_OWNED_2", "name": "% of Fantrax leagues that have this player on their roster this week", "shortName": "Ros"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2", "sortType": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2", "name": "Change in percent Rostered from previous week", "shortName": "+/-"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PERCENT_ACTIVE_2", "sortType": "OVERVIEW_PERCENT_ACTIVE_2", "name": "% of leagues that have this player starting, i.e. in an active slot this week", "shortName": "Act"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PLUS_MINUS_PERCENT_ACTIVE_2", "sortType": "OVERVIEW_PLUS_MINUS_PERCENT_ACTIVE_2", "name": "Change in percent active from previous week", "shortName": "+/-"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PERCENT_DRAFTED", "sortType": "OVERVIEW_PERCENT_DRAFTED", "name": "Drafted", "shortName": "%D"}, {"sortDirection": 1, "sortKey": "OVERVIEW_AVG_DRAFT_POSITION", "sortType": "OVERVIEW_AVG_DRAFT_POSITION", "name": "Avg. Draft Position", "shortName": "ADP"}]}, "rows": [{"posId": "206", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["206", "208"], "scorer": {"scorerId": "03167", "name": "Bo Horvat", "shortName": "B. Horvat", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "NYI", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "21 • 80", "toolTip": "C rank: 21 • Overall rank: 80"}, {"content": "31"}, {"content": "@TOR<br/>Sat 6:00PM", "eventId": "06mjt"}, {"content": "486.68"}, {"content": "7.16"}, {"content": "93%"}, {"content": "+1%"}, {"content": "83%"}, {"content": "+6%"}, {"content": "99%"}, {"content": "118.32"}]}, {"posId": "203", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "208"], "scorer": {"scorerId": "042ye", "name": "Jesper Bratt", "shortName": "J. Bratt", "posShortNames": "LW,RW", "posIds": ["203", "204", "208"], "posIdsNoFlex": ["203", "204"], "defaultPosId": "203", "teamShortName": "NJD", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "31 • 116", "toolTip": "LW rank: 31 • Overall rank: 116"}, {"content": "28"}, {"content": "NJD 1<br/>@WSH 4", "eventId": "06mjo"}, {"content": "442.54"}, {"content": "5.4"}, {"content": "98%"}, {"content": "0%"}, {"content": "91%"}, {"content": "+7%"}, {"content": "100%"}, {"content": "78.06"}]}, {"posId": "203", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "206", "208"], "scorer": {"scorerId": "04a9v", "name": "Morgan Geekie", "shortName": "M. Geekie", "posShortNames": "C,LW,RW", "posIds": ["206", "203", "204", "208"], "posIdsNoFlex": ["206", "203", "204"], "defaultPosId": "203", "teamShortName": "BOS", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "19 • 82", "toolTip": "LW rank: 19 • Overall rank: 82"}, {"content": "28"}, {"content": "@LAK<br/>Sat 8:00PM", "eventId": "06mjz"}, {"content": "485.66"}, {"content": "6"}, {"content": "97%"}, {"content": "0%"}, {"content": "81%"}, {"content": "+2%"}, {"content": "100%"}, {"content": "109.45"}]}, {"posId": "202", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["202", "208"], "scorer": {"scorerId": "04lbz", "name": "Quinn Hughes", "shortName": "Q. Hughes", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "MIN", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "9 • 35", "toolTip": "D rank: 9 • Overall rank: 35"}, {"content": "27"}, {"content": ""}, {"content": "572.25"}, {"content": "7.73"}, {"content": "100%"}, {"content": "0%"}, {"content": "99%"}, {"content": "0%"}, {"content": "100%"}, {"content": "14.46"}]}, {"posId": "202", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["202", "208"], "scorer": {"scorerId": "02wy5", "name": "Nikita Zadorov", "shortName": "N. Zadorov", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "BOS", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "56 • 218", "toolTip": "D rank: 56 • Overall rank: 218"}, {"content": "31"}, {"content": "@LAK<br/>Sat 8:00PM", "eventId": "06mjz"}, {"content": "351.15"}, {"content": "4.34"}, {"content": "49%"}, {"content": "+2%"}, {"content": "43%"}, {"content": "+3%"}, {"content": "35%"}, {"content": "251.34"}]}, {"posId": "202", "statusId": "1", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"statusId": "2", "numSpotsAvailableText": "Reserve spot(s) available", "numSpotsAvailableIcon": "LIMITED_BY_MAX", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}]}, {"scGroup": "2020", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 6.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PERCENT_OWNED_2", "sortType": "OVERVIEW_PERCENT_OWNED_2", "name": "% of Fantrax leagues that have this player on their roster this week", "shortName": "Ros"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2", "sortType": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2", "name": "Change in percent Rostered from previous week", "shortName": "+/-"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PERCENT_ACTIVE_2", "sortType": "OVERVIEW_PERCENT_ACTIVE_2", "name": "% of leagues that have this player starting, i.e. in an active slot this week", "shortName": "Act"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PLUS_MINUS_PERCENT_ACTIVE_2", "sortType": "OVERVIEW_PLUS_MINUS_PERCENT_ACTIVE_2", "name": "Change in percent active from previous week", "shortName": "+/-"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PERCENT_DRAFTED", "sortType": "OVERVIEW_PERCENT_DRAFTED", "name": "Drafted", "shortName": "%D"}, {"sortDirection": 1, "sortKey": "OVERVIEW_AVG_DRAFT_POSITION", "sortType": "OVERVIEW_AVG_DRAFT_POSITION", "name": "Avg. Draft Position", "shortName": "ADP"}]}, "rows": [{"posId": "201", "statusId": "2", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["201"], "scorer": {"scorerId": "03ynu", "name": "Carter Hart", "shortName": "C. Hart", "posShortNames": "G", "posIds": ["201"], "posIdsNoFlex": ["201"], "defaultPosId": "201", "teamShortName": "VGK", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "64 • 580", "toolTip": "G rank: 64 • Overall rank: 580"}, {"content": "28"}, {"content": "PIT<br/>Sat 9:00PM", "eventId": "06mk0"}, {"content": "168.6"}, {"content": "9.37"}, {"content": "93%"}, {"content": "+1%"}, {"content": "79%"}, {"content": "0%"}, {"content": "86%"}, {"content": "166.3"}]}]}]};
export const ROSTER_TRENDS_SEASON_LOOKUP = {"displayedSelections": {"displayedStatsType": "1", "displayedPeriod": 19, "adminMode": false, "displayedView": "STATS", "lineupChangeSystem": "EASY_CLICK", "displayedStartDate": 1790654400000, "displayedScoringCategoryType": "5", "displayedSeasonOrProjection": {"code": "SEASON_31l_YEAR_TO_DATE", "endDate": 1776398399000, "name": "2025-26 Reg Season - YTD", "shortName": "2025-26 Reg - YTD", "timeframeTypeCode": "YEAR_TO_DATE", "startDate": 1759809600000}, "displayedEndDate": 1792209600000}, "tables": [{"scGroup": "2010", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 8.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "width": 6.5, "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2100#-1", "scipId": "2010#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 3.0, "shortName": "GP", "key": "2010#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2130#-1", "scipId": "2010#2130#-1", "sortType": "SCORING_CATEGORY", "name": "Goals", "width": 3.0, "shortName": "G", "key": "2010#2130#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2090#-1", "scipId": "2010#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3.0, "shortName": "A", "key": "2010#2090#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2190#-1", "scipId": "2010#2190#-1", "sortType": "SCORING_CATEGORY", "name": "Points -- Goals + Assists", "width": 3.0, "shortName": "Pt", "key": "2010#2190#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2270#-1", "scipId": "2010#2270#-1", "sortType": "SCORING_CATEGORY", "name": "Shots on Goal", "width": 3.0, "shortName": "SOG", "key": "2010#2270#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2120#-1", "scipId": "2010#2120#-1", "sortType": "SCORING_CATEGORY", "name": "Game-winning Goals", "width": 3.0, "shortName": "GWG", "key": "2010#2120#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2327#-1", "scipId": "2010#2327#-1", "sortType": "SCORING_CATEGORY", "name": "Power Play Points", "width": 3.0, "shortName": "PPP", "key": "2010#2327#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2344#-1", "scipId": "2010#2344#-1", "sortType": "SCORING_CATEGORY", "name": "Short-Handed Points", "width": 3.0, "shortName": "SHP", "key": "2010#2344#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2145#-1", "scipId": "2010#2145#-1", "sortType": "SCORING_CATEGORY", "name": "Hat Tricks -- Three or more goals in a game", "width": 3.0, "shortName": "HT", "key": "2010#2145#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2147#-1", "scipId": "2010#2147#-1", "sortType": "SCORING_CATEGORY", "name": "Hits", "width": 3.0, "shortName": "Hit", "key": "2010#2147#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2092#-1", "scipId": "2010#2092#-1", "sortType": "SCORING_CATEGORY", "name": "Blocks -- A player blocks a shot by an opposing shooter.", "width": 3.0, "shortName": "Blk", "key": "2010#2092#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2096#-1", "scipId": "2010#2096#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Won", "width": 3.0, "shortName": "FOW", "key": "2010#2096#-1", "maxWidth": 3.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2010#2095#-1", "scipId": "2010#2095#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Lost", "width": 3.0, "shortName": "FOL", "key": "2010#2095#-1", "maxWidth": 3.0}]}, "rows": [{"posId": "206", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["206", "208"], "scorer": {"scorerId": "03167", "name": "Bo Horvat", "shortName": "B. Horvat", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "NYI", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "21 • 80", "toolTip": "C rank: 21 • Overall rank: 80"}, {"content": "31"}, {"content": "@TOR<br/>Sat 6:00PM", "eventId": "06mjt"}, {"content": "486.68"}, {"content": "7.16"}, {"content": "68"}, {"content": "31"}, {"content": "26"}, {"content": "57"}, {"content": "226"}, {"content": "7"}, {"content": "16"}, {"content": "1"}, {"content": "1"}, {"content": "51"}, {"content": "38"}, {"content": "690"}, {"content": "536"}]}, {"posId": "203", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "208"], "scorer": {"scorerId": "042ye", "name": "Jesper Bratt", "shortName": "J. Bratt", "posShortNames": "LW,RW", "posIds": ["203", "204", "208"], "posIdsNoFlex": ["203", "204"], "defaultPosId": "203", "teamShortName": "NJD", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "31 • 116", "toolTip": "LW rank: 31 • Overall rank: 116"}, {"content": "28"}, {"content": "NJD 1<br/>@WSH 4", "eventId": "06mjo"}, {"content": "442.54"}, {"content": "5.4"}, {"content": "82"}, {"content": "22"}, {"content": "49"}, {"content": "71"}, {"content": "178"}, {"content": "4"}, {"content": "20"}, {"content": "2"}, {"content": "0"}, {"content": "74"}, {"content": "24"}, {"content": "3"}, {"content": "8"}]}, {"posId": "203", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "206", "208"], "scorer": {"scorerId": "04a9v", "name": "Morgan Geekie", "shortName": "M. Geekie", "posShortNames": "C,LW,RW", "posIds": ["206", "203", "204", "208"], "posIdsNoFlex": ["206", "203", "204"], "defaultPosId": "203", "teamShortName": "BOS", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "19 • 82", "toolTip": "LW rank: 19 • Overall rank: 82"}, {"content": "28"}, {"content": "@LAK<br/>Sat 8:00PM", "eventId": "06mjz"}, {"content": "485.66"}, {"content": "6"}, {"content": "81"}, {"content": "39"}, {"content": "29"}, {"content": "68"}, {"content": "181"}, {"content": "6"}, {"content": "24"}, {"content": "0"}, {"content": "1"}, {"content": "110"}, {"content": "34"}, {"content": "73"}, {"content": "87"}]}, {"posId": "202", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["202", "208"], "scorer": {"scorerId": "04lbz", "name": "Quinn Hughes", "shortName": "Q. Hughes", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "MIN", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "9 • 35", "toolTip": "D rank: 9 • Overall rank: 35"}, {"content": "27"}, {"content": ""}, {"content": "572.25"}, {"content": "7.73"}, {"content": "74"}, {"content": "7"}, {"content": "69"}, {"content": "76"}, {"content": "187"}, {"content": "1"}, {"content": "34"}, {"content": "0"}, {"content": "0"}, {"content": "7"}, {"content": "87"}, {"content": "0"}, {"content": "0"}]}, {"posId": "202", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["202", "208"], "scorer": {"scorerId": "02wy5", "name": "Nikita Zadorov", "shortName": "N. Zadorov", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "BOS", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "56 • 218", "toolTip": "D rank: 56 • Overall rank: 218"}, {"content": "31"}, {"content": "@LAK<br/>Sat 8:00PM", "eventId": "06mjz"}, {"content": "351.15"}, {"content": "4.34"}, {"content": "81"}, {"content": "2"}, {"content": "20"}, {"content": "22"}, {"content": "107"}, {"content": "1"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "196"}, {"content": "102"}, {"content": "0"}, {"content": "0"}]}, {"posId": "202", "statusId": "1", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"statusId": "2", "numSpotsAvailableText": "Reserve spot(s) available", "numSpotsAvailableIcon": "LIMITED_BY_MAX", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}]}, {"scGroup": "2020", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 6.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2100#-1", "scipId": "2020#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 3.0, "shortName": "GP", "key": "2020#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#231b#-1", "scipId": "2020#231b#-1", "sortType": "SCORING_CATEGORY", "name": "Wins (Goalies only) -- Includes Overtime Wins and Shootout Wins. Skaters cannot get a win using this category - for that - use the \"regular\" Wins category.", "width": 3.0, "shortName": "W", "key": "2020#231b#-1", "maxWidth": 3.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#232c#-1", "scipId": "2020#232c#-1", "sortType": "SCORING_CATEGORY", "name": "Overtime Losses + Shootout Losses", "width": 6.0, "shortName": "OL+ShL", "key": "2020#232c#-1", "maxWidth": 6.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#2140#-1", "scipId": "2020#2140#-1", "sortType": "SCORING_CATEGORY", "name": "Goals Against", "width": 3.0, "shortName": "GA", "key": "2020#2140#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2230#-1", "scipId": "2020#2230#-1", "sortType": "SCORING_CATEGORY", "name": "Saves", "width": 3.0, "shortName": "SV", "key": "2020#2230#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2290#-1", "scipId": "2020#2290#-1", "sortType": "SCORING_CATEGORY", "name": "Shutouts", "width": 3.0, "shortName": "SHO", "key": "2020#2290#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2090#-1", "scipId": "2020#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3.0, "shortName": "A", "key": "2020#2090#-1", "maxWidth": 3.0}]}, "rows": [{"posId": "201", "statusId": "2", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["201"], "scorer": {"scorerId": "03ynu", "name": "Carter Hart", "shortName": "C. Hart", "posShortNames": "G", "posIds": ["201"], "posIdsNoFlex": ["201"], "defaultPosId": "201", "teamShortName": "VGK", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "64 • 580", "toolTip": "G rank: 64 • Overall rank: 580"}, {"content": "28"}, {"content": "PIT<br/>Sat 9:00PM", "eventId": "06mk0"}, {"content": "168.6"}, {"content": "9.37"}, {"content": "18"}, {"content": "11"}, {"content": "3"}, {"content": "46"}, {"content": "376"}, {"content": "0"}, {"content": "0"}]}]}]};
export const ROSTER_TRENDS_DAY = {"displayedSelections": {"displayedStatsType": "1", "displayedPeriod": 19, "adminMode": false, "displayedView": "OVERVIEW", "lineupChangeSystem": "EASY_CLICK", "displayedStartDate": 1790654400000, "displayedScoringCategoryType": "5", "displayedSeasonOrProjection": {"code": "SEASON_31n_BY_PERIOD", "endDate": 1807415999000, "name": "2026-27 Reg Season - Period", "showGoBackDays": true, "shortName": "2026-27 Reg - Period", "timeframeTypeCode": "BY_PERIOD", "startDate": 1790654400000}, "displayedEndDate": 1792209600000}, "tables": [{"scGroup": "2010", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 9.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PERCENT_OWNED_2", "sortType": "OVERVIEW_PERCENT_OWNED_2", "name": "% of Fantrax leagues that have this player on their roster this week", "shortName": "Ros"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2", "sortType": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2", "name": "Change in percent Rostered from previous week", "shortName": "+/-"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PERCENT_ACTIVE_2", "sortType": "OVERVIEW_PERCENT_ACTIVE_2", "name": "% of leagues that have this player starting, i.e. in an active slot this week", "shortName": "Act"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PLUS_MINUS_PERCENT_ACTIVE_2", "sortType": "OVERVIEW_PLUS_MINUS_PERCENT_ACTIVE_2", "name": "Change in percent active from previous week", "shortName": "+/-"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PERCENT_DRAFTED", "sortType": "OVERVIEW_PERCENT_DRAFTED", "name": "Drafted", "shortName": "%D"}, {"sortDirection": 1, "sortKey": "OVERVIEW_AVG_DRAFT_POSITION", "sortType": "OVERVIEW_AVG_DRAFT_POSITION", "name": "Avg. Draft Position", "shortName": "ADP"}]}, "rows": [{"posId": "206", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["206", "208"], "scorer": {"scorerId": "03167", "name": "Bo Horvat", "shortName": "B. Horvat", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "NYI", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "11 • 37", "toolTip": "C rank: 11 • Overall rank: 37"}, {"content": "31"}, {"content": "@TOR<br/>Sat 6:00PM", "eventId": "06mjt"}, {"content": "0"}, {"content": "0"}, {"content": "93%"}, {"content": "+1%"}, {"content": "83%"}, {"content": "+6%"}, {"content": "99%"}, {"content": "118.32"}]}, {"posId": "203", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "208"], "scorer": {"scorerId": "042ye", "name": "Jesper Bratt", "shortName": "J. Bratt", "posShortNames": "LW,RW", "posIds": ["203", "204", "208"], "posIdsNoFlex": ["203", "204"], "defaultPosId": "203", "teamShortName": "NJD", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "26 • 115", "toolTip": "LW rank: 26 • Overall rank: 115"}, {"content": "28"}, {"content": "NJD 1<br/>@WSH 4", "eventId": "06mjo"}, {"content": "0.45"}, {"content": "0.45"}, {"content": "98%"}, {"content": "0%"}, {"content": "91%"}, {"content": "+7%"}, {"content": "100%"}, {"content": "78.06"}]}, {"posId": "202", "statusId": "1", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"statusId": "2", "numSpotsAvailableText": "Reserve spot(s) available", "numSpotsAvailableIcon": "LIMITED_BY_MAX", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"statusId": "y", "scorerColumn": "Totals", "bold": true, "scorer": {"rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": ""}, {"content": ""}, {"content": "0.45"}, {"content": "0.45"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "1"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}]}, {"scGroup": "2020", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 6.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PERCENT_OWNED_2", "sortType": "OVERVIEW_PERCENT_OWNED_2", "name": "% of Fantrax leagues that have this player on their roster this week", "shortName": "Ros"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2", "sortType": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2", "name": "Change in percent Rostered from previous week", "shortName": "+/-"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PERCENT_ACTIVE_2", "sortType": "OVERVIEW_PERCENT_ACTIVE_2", "name": "% of leagues that have this player starting, i.e. in an active slot this week", "shortName": "Act"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PLUS_MINUS_PERCENT_ACTIVE_2", "sortType": "OVERVIEW_PLUS_MINUS_PERCENT_ACTIVE_2", "name": "Change in percent active from previous week", "shortName": "+/-"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PERCENT_DRAFTED", "sortType": "OVERVIEW_PERCENT_DRAFTED", "name": "Drafted", "shortName": "%D"}, {"sortDirection": 1, "sortKey": "OVERVIEW_AVG_DRAFT_POSITION", "sortType": "OVERVIEW_AVG_DRAFT_POSITION", "name": "Avg. Draft Position", "shortName": "ADP"}]}, "rows": [{"posId": "201", "statusId": "2", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["201"], "scorer": {"scorerId": "03ynu", "name": "Carter Hart", "shortName": "C. Hart", "posShortNames": "G", "posIds": ["201"], "posIdsNoFlex": ["201"], "defaultPosId": "201", "teamShortName": "VGK", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "6 • 23", "toolTip": "G rank: 6 • Overall rank: 23"}, {"content": "28"}, {"content": "PIT<br/>Sat 9:00PM", "eventId": "06mk0"}, {"content": "0"}, {"content": "0"}, {"content": "93%"}, {"content": "+1%"}, {"content": "79%"}, {"content": "0%"}, {"content": "86%"}, {"content": "166.3"}]}]}]};
export const ROSTER_DAY_LOOKUP = {"displayedSelections": {"displayedStatsType": "1", "displayedPeriod": 19, "adminMode": false, "displayedView": "STATS", "lineupChangeSystem": "EASY_CLICK", "displayedStartDate": 1790654400000, "displayedScoringCategoryType": "5", "displayedSeasonOrProjection": {"code": "SEASON_31n_BY_PERIOD", "endDate": 1807415999000, "name": "2026-27 Reg Season - Period", "showGoBackDays": true, "shortName": "2026-27 Reg - Period", "timeframeTypeCode": "BY_PERIOD", "startDate": 1790654400000}, "displayedEndDate": 1792209600000}, "tables": [{"scGroup": "2010", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 9.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2100#-1", "scipId": "2010#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 3.0, "shortName": "GP", "key": "2010#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2130#-1", "scipId": "2010#2130#-1", "sortType": "SCORING_CATEGORY", "name": "Goals", "width": 3.0, "shortName": "G", "key": "2010#2130#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2090#-1", "scipId": "2010#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3.0, "shortName": "A", "key": "2010#2090#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2190#-1", "scipId": "2010#2190#-1", "sortType": "SCORING_CATEGORY", "name": "Points -- Goals + Assists", "width": 3.0, "shortName": "Pt", "key": "2010#2190#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2270#-1", "scipId": "2010#2270#-1", "sortType": "SCORING_CATEGORY", "name": "Shots on Goal", "width": 3.0, "shortName": "SOG", "key": "2010#2270#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2120#-1", "scipId": "2010#2120#-1", "sortType": "SCORING_CATEGORY", "name": "Game-winning Goals", "width": 3.0, "shortName": "GWG", "key": "2010#2120#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2327#-1", "scipId": "2010#2327#-1", "sortType": "SCORING_CATEGORY", "name": "Power Play Points", "width": 3.0, "shortName": "PPP", "key": "2010#2327#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2344#-1", "scipId": "2010#2344#-1", "sortType": "SCORING_CATEGORY", "name": "Short-Handed Points", "width": 3.0, "shortName": "SHP", "key": "2010#2344#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2145#-1", "scipId": "2010#2145#-1", "sortType": "SCORING_CATEGORY", "name": "Hat Tricks -- Three or more goals in a game", "width": 3.0, "shortName": "HT", "key": "2010#2145#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2147#-1", "scipId": "2010#2147#-1", "sortType": "SCORING_CATEGORY", "name": "Hits", "width": 3.0, "shortName": "Hit", "key": "2010#2147#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2092#-1", "scipId": "2010#2092#-1", "sortType": "SCORING_CATEGORY", "name": "Blocks -- A player blocks a shot by an opposing shooter.", "width": 3.0, "shortName": "Blk", "key": "2010#2092#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2096#-1", "scipId": "2010#2096#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Won", "width": 3.0, "shortName": "FOW", "key": "2010#2096#-1", "maxWidth": 3.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2010#2095#-1", "scipId": "2010#2095#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Lost", "width": 3.0, "shortName": "FOL", "key": "2010#2095#-1", "maxWidth": 3.0}]}, "rows": [{"posId": "206", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["206", "208"], "scorer": {"scorerId": "03167", "name": "Bo Horvat", "shortName": "B. Horvat", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "NYI", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "11 • 37", "toolTip": "C rank: 11 • Overall rank: 37"}, {"content": "31"}, {"content": "@TOR<br/>Sat 6:00PM", "eventId": "06mjt"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}, {"posId": "203", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "208"], "scorer": {"scorerId": "042ye", "name": "Jesper Bratt", "shortName": "J. Bratt", "posShortNames": "LW,RW", "posIds": ["203", "204", "208"], "posIdsNoFlex": ["203", "204"], "defaultPosId": "203", "teamShortName": "NJD", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "26 • 115", "toolTip": "LW rank: 26 • Overall rank: 115"}, {"content": "28"}, {"content": "NJD 1<br/>@WSH 4", "eventId": "06mjo"}, {"content": "0.45"}, {"content": "0.45"}, {"content": "1"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "1"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}, {"posId": "202", "statusId": "1", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"statusId": "2", "numSpotsAvailableText": "Reserve spot(s) available", "numSpotsAvailableIcon": "LIMITED_BY_MAX", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"statusId": "y", "scorerColumn": "Totals", "bold": true, "scorer": {"rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": ""}, {"content": ""}, {"content": "0.45"}, {"content": "0.45"}, {"content": "1"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "1"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}]}, {"scGroup": "2020", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 6.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2100#-1", "scipId": "2020#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 3.0, "shortName": "GP", "key": "2020#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#231b#-1", "scipId": "2020#231b#-1", "sortType": "SCORING_CATEGORY", "name": "Wins (Goalies only) -- Includes Overtime Wins and Shootout Wins. Skaters cannot get a win using this category - for that - use the \"regular\" Wins category.", "width": 3.0, "shortName": "W", "key": "2020#231b#-1", "maxWidth": 3.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#232c#-1", "scipId": "2020#232c#-1", "sortType": "SCORING_CATEGORY", "name": "Overtime Losses + Shootout Losses", "width": 6.0, "shortName": "OL+ShL", "key": "2020#232c#-1", "maxWidth": 6.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#2140#-1", "scipId": "2020#2140#-1", "sortType": "SCORING_CATEGORY", "name": "Goals Against", "width": 3.0, "shortName": "GA", "key": "2020#2140#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2230#-1", "scipId": "2020#2230#-1", "sortType": "SCORING_CATEGORY", "name": "Saves", "width": 3.0, "shortName": "SV", "key": "2020#2230#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2290#-1", "scipId": "2020#2290#-1", "sortType": "SCORING_CATEGORY", "name": "Shutouts", "width": 3.0, "shortName": "SHO", "key": "2020#2290#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2090#-1", "scipId": "2020#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3.0, "shortName": "A", "key": "2020#2090#-1", "maxWidth": 3.0}]}, "rows": [{"posId": "201", "statusId": "2", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["201"], "scorer": {"scorerId": "03ynu", "name": "Carter Hart", "shortName": "C. Hart", "posShortNames": "G", "posIds": ["201"], "posIdsNoFlex": ["201"], "defaultPosId": "201", "teamShortName": "VGK", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "6 • 23", "toolTip": "G rank: 6 • Overall rank: 23"}, {"content": "28"}, {"content": "PIT<br/>Sat 9:00PM", "eventId": "06mk0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}]}]};
export const ROSTER_SCHEDULE_WEEK = {"displayedSelections": {"displayedStatsType": "1", "displayedPeriod": 19, "adminMode": false, "displayedView": "SCHEDULE_PERIOD", "lineupChangeSystem": "EASY_CLICK", "displayedStartDate": 1790654400000, "displayedScoringCategoryType": "5", "displayedSeasonOrProjection": {"code": "SEASON_31n_BY_PERIOD", "endDate": 1807415999000, "name": "2026-27 Reg Season - Period", "showGoBackDays": true, "shortName": "2026-27 Reg - Period", "timeframeTypeCode": "BY_PERIOD", "startDate": 1790654400000}, "displayedEndDate": 1792209600000}, "tables": [{"scGroup": "2010", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 9.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"eventStr": true, "sortDirection": 1, "width": 8.0, "shortName": "Sat 10/17", "key": "sched_10/17"}, {"eventStr": true, "sortDirection": 1, "width": 8.0, "shortName": "Sun 10/18", "key": "sched_10/18"}, {"eventStr": true, "sortDirection": 1, "width": 8.0, "shortName": "Mon 10/19", "key": "sched_10/19"}, {"eventStr": true, "sortDirection": 1, "width": 8.0, "shortName": "Tue 10/20", "key": "sched_10/20"}, {"eventStr": true, "sortDirection": 1, "width": 8.0, "shortName": "Wed 10/21", "key": "sched_10/21"}, {"eventStr": true, "sortDirection": 1, "width": 8.0, "shortName": "Thu 10/22", "key": "sched_10/22"}, {"eventStr": true, "sortDirection": 1, "width": 8.0, "shortName": "Fri 10/23", "key": "sched_10/23"}]}, "rows": [{"posId": "206", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["206", "208"], "scorer": {"scorerId": "03167", "name": "Bo Horvat", "shortName": "B. Horvat", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "NYI", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "11 • 37", "toolTip": "C rank: 11 • Overall rank: 37"}, {"content": "31"}, {"content": "0"}, {"content": "0"}, {"content": "@TOR<br/>Sat 6:00PM", "eventId": "06mjt"}, {"content": ""}, {"content": ""}, {"content": "ANA<br/>Tue 6:00PM", "eventId": "06mka"}, {"content": ""}, {"content": "LAK<br/>Thu 6:30PM", "eventId": "06mkq"}, {"content": ""}]}, {"posId": "203", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "208"], "scorer": {"scorerId": "042ye", "name": "Jesper Bratt", "shortName": "J. Bratt", "posShortNames": "LW,RW", "posIds": ["203", "204", "208"], "posIdsNoFlex": ["203", "204"], "defaultPosId": "203", "teamShortName": "NJD", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "26 • 115", "toolTip": "LW rank: 26 • Overall rank: 115"}, {"content": "28"}, {"content": "0.45"}, {"content": "0.45"}, {"content": "NJD 1<br/>@WSH 4", "eventId": "06mjo"}, {"content": ""}, {"content": ""}, {"content": "COL<br/>Tue 6:00PM", "eventId": "06mk8"}, {"content": ""}, {"content": "ANA<br/>Thu 6:00PM", "eventId": "06mkl"}, {"content": ""}]}, {"posId": "202", "statusId": "1", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"statusId": "2", "numSpotsAvailableText": "Reserve spot(s) available", "numSpotsAvailableIcon": "LIMITED_BY_MAX", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}]}, {"scGroup": "2020", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 6.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"eventStr": true, "sortDirection": 1, "width": 8.0, "shortName": "Sat 10/17", "key": "sched_10/17"}, {"eventStr": true, "sortDirection": 1, "width": 8.0, "shortName": "Sun 10/18", "key": "sched_10/18"}, {"eventStr": true, "sortDirection": 1, "width": 8.0, "shortName": "Mon 10/19", "key": "sched_10/19"}, {"eventStr": true, "sortDirection": 1, "width": 8.0, "shortName": "Tue 10/20", "key": "sched_10/20"}, {"eventStr": true, "sortDirection": 1, "width": 8.0, "shortName": "Wed 10/21", "key": "sched_10/21"}, {"eventStr": true, "sortDirection": 1, "width": 8.0, "shortName": "Thu 10/22", "key": "sched_10/22"}, {"eventStr": true, "sortDirection": 1, "width": 8.0, "shortName": "Fri 10/23", "key": "sched_10/23"}]}, "rows": [{"posId": "201", "statusId": "2", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["201"], "scorer": {"scorerId": "03ynu", "name": "Carter Hart", "shortName": "C. Hart", "posShortNames": "G", "posIds": ["201"], "posIdsNoFlex": ["201"], "defaultPosId": "201", "teamShortName": "VGK", "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "6 • 23", "toolTip": "G rank: 6 • Overall rank: 23"}, {"content": "28"}, {"content": "0"}, {"content": "0"}, {"content": "PIT<br/>Sat 9:00PM", "eventId": "06mk0"}, {"content": ""}, {"content": ""}, {"content": "TBL<br/>Tue 9:30PM", "eventId": "06mki"}, {"content": ""}, {"content": "@STL<br/>Thu 7:00PM", "eventId": "06mks"}, {"content": ""}]}]}]};
export const PLAYERS_SCHEDULE = {"tableHeader": {"cells": [{"sortDirection": 1, "name": "Ranking based on fantasy points among all players", "width": 4.0, "shortName": "Rk", "key": "rankOv"}, {"sortDirection": 1, "sortKey": "STATUS", "sortType": "STATUS", "name": "Status", "width": 8.5, "shortName": "Sta", "key": "status"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.5, "shortName": "Age", "key": "age"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "width": 5.5, "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "width": 4.5, "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PERCENT_OWNED_2", "sortType": "OVERVIEW_PERCENT_OWNED_2", "name": "% of Fantrax leagues that have this player on their roster this week", "shortName": "Ros"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2", "sortType": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2", "name": "Change in percent Rostered from previous week", "shortName": "+/-"}, {"eventStr": true, "sortDirection": 1, "width": 8.2, "shortName": "Sat 10/17", "key": "sched_2026-10-17"}, {"eventStr": true, "sortDirection": 1, "width": 8.2, "shortName": "Sun 10/18", "key": "sched_2026-10-18"}, {"eventStr": true, "sortDirection": 1, "width": 8.2, "shortName": "Mon 10/19", "key": "sched_2026-10-19"}, {"eventStr": true, "sortDirection": 1, "width": 8.2, "shortName": "Tue 10/20", "key": "sched_2026-10-20"}, {"eventStr": true, "sortDirection": 1, "width": 8.2, "shortName": "Wed 10/21", "key": "sched_2026-10-21"}, {"eventStr": true, "sortDirection": 1, "width": 8.2, "shortName": "Thu 10/22", "key": "sched_2026-10-22"}, {"eventStr": true, "sortDirection": 1, "width": 8.2, "shortName": "Fri 10/23", "key": "sched_2026-10-23"}]}, "statsTable": [{"scorer": {"scorerId": "04qzk", "name": "Paul Cotter", "shortName": "P. Cotter", "posShortNames": "LW", "posIds": ["203", "208"], "posIdsNoFlex": ["203"], "defaultPosId": "203", "teamShortName": "VAN", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "64"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "26"}, {"content": "54.34"}, {"content": "6.04"}, {"content": "58%"}, {"gainColor": -1, "content": "-3%"}, {"content": "@TBL<br/>Sat 3:00PM", "eventId": "06mjq"}, {"content": ""}, {"content": ""}, {"content": "CAR<br/>Tue 9:00PM", "eventId": "06mkh"}, {"content": ""}, {"content": "DET<br/>Thu 9:00PM", "eventId": "06mkw"}, {"content": ""}]}, {"scorer": {"scorerId": "060v8", "name": "Elias Pettersson", "shortName": "E. Pettersson", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "VAN", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "100"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "22"}, {"content": "46.5"}, {"content": "5.17"}, {"content": "31%"}, {"gainColor": 1, "content": "+9%"}, {"content": "@TBL<br/>Sat 3:00PM", "eventId": "06mjq"}, {"content": ""}, {"content": ""}, {"content": "CAR<br/>Tue 9:00PM", "eventId": "06mkh"}, {"content": ""}, {"content": "DET<br/>Thu 9:00PM", "eventId": "06mkw"}, {"content": ""}]}, {"scorer": {"scorerId": "06sds", "name": "Tim Washe", "shortName": "T. Washe", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "ANA", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "118"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "25"}, {"content": "45.03"}, {"content": "6.43"}, {"content": "15%"}, {"gainColor": 1, "content": "+5%"}, {"content": ""}, {"content": ""}, {"content": "@NYR<br/>Mon 6:00PM", "eventId": "06mk5"}, {"content": "@NYI<br/>Tue 6:00PM", "eventId": "06mka"}, {"content": ""}, {"content": "@NJD<br/>Thu 6:00PM", "eventId": "06mkl"}, {"content": ""}]}, {"scorer": {"scorerId": "03c0c", "name": "Josh Manson", "shortName": "J. Manson", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "COL", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "120"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "35"}, {"content": "44.95"}, {"content": "5.62"}, {"content": "47%"}, {"gainColor": 1, "content": "+5%"}, {"content": ""}, {"content": ""}, {"content": "@PHI<br/>Mon 6:00PM", "eventId": "06mk4"}, {"content": "@NJD<br/>Tue 6:00PM", "eventId": "06mk8"}, {"content": ""}, {"content": ""}, {"content": "TBL<br/>Fri 8:00PM", "eventId": "06mky"}]}, {"scorer": {"scorerId": "02azh", "name": "Jamie Oleksiak", "shortName": "J. Oleksiak", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "VAN", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "139"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "33"}, {"content": "42.05"}, {"content": "5.26"}, {"content": "15%"}, {"gainColor": -1, "content": "-2%"}, {"content": "@TBL<br/>Sat 3:00PM", "eventId": "06mjq"}, {"content": ""}, {"content": ""}, {"content": "CAR<br/>Tue 9:00PM", "eventId": "06mkh"}, {"content": ""}, {"content": "DET<br/>Thu 9:00PM", "eventId": "06mkw"}, {"content": ""}]}, {"scorer": {"scorerId": "04l8y", "name": "Mark Kastelic", "shortName": "M. Kastelic", "posShortNames": "C,RW", "posIds": ["206", "204", "208"], "posIdsNoFlex": ["206", "204"], "defaultPosId": "206", "teamShortName": "BOS", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "140"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "27"}, {"content": "41.84"}, {"content": "5.23"}, {"content": "24%"}, {"gainColor": 1, "content": "+3%"}, {"content": "@LAK<br/>Sat 8:00PM", "eventId": "06mjz"}, {"content": ""}, {"content": ""}, {"content": "@DAL<br/>Tue 7:00PM", "eventId": "06mkd"}, {"content": ""}, {"content": "NSH<br/>Thu 6:00PM", "eventId": "06mko"}, {"content": ""}]}], "paginatedResultSet": {"totalNumPages": 368, "pageNumber": 1, "maxResultsPerPage": 20, "totalNumResults": 7344}, "displayedSelections": {"datePlaying": "ALL", "searchName": "", "displayedMiscDisplayType": "1", "displayedView": "SCHEDULE_PERIOD", "displayedStartDate": 1790654400000, "displayedScoringCategoryType": "5", "displayedEndDate": 1792209600000, "displayedSeasonOrProjection": {"code": "SEASON_31n_YEAR_TO_DATE", "endDate": 1807415999000, "name": "2026-27 Reg Season - YTD", "showGoBackDays": true, "shortName": "2026-27 Reg - YTD", "timeframeTypeCode": "YEAR_TO_DATE", "startDate": 1790654400000}}, "displayedSortType": "SCORE", "displayedSortReversed": false, "displayedPosOrGroup": "HOCKEY_SKATING", "displayedScoringCategoryType": "5"};
export const PLAYERS_SCHEDULE_LOOKUP = {"tableHeader": {"cells": [{"sortDirection": 1, "name": "Ranking based on fantasy points among all players", "width": 4.0, "shortName": "Rk", "key": "rankOv"}, {"sortDirection": 1, "sortKey": "STATUS", "sortType": "STATUS", "name": "Status", "width": 8.5, "shortName": "Sta", "key": "status"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.5, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "width": 5.5, "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "width": 4.5, "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PERCENT_OWNED_2", "sortType": "OVERVIEW_PERCENT_OWNED_2", "name": "% of Fantrax leagues that have this player on their roster this week", "shortName": "Ros"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2", "sortType": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2", "name": "Change in percent Rostered from previous week", "shortName": "+/-"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2100#-1", "scipId": "2010#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 2.5, "shortName": "GP", "key": "2010#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2130#-1", "scipId": "2010#2130#-1", "sortType": "SCORING_CATEGORY", "name": "Goals", "width": 1.5, "shortName": "G", "key": "2010#2130#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2090#-1", "scipId": "2010#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 1.5, "shortName": "A", "key": "2010#2090#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2190#-1", "scipId": "2010#2190#-1", "sortType": "SCORING_CATEGORY", "name": "Points -- Goals + Assists", "width": 2.5, "shortName": "Pt", "key": "2010#2190#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2270#-1", "scipId": "2010#2270#-1", "sortType": "SCORING_CATEGORY", "name": "Shots on Goal", "width": 3.5, "shortName": "SOG", "key": "2010#2270#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2120#-1", "scipId": "2010#2120#-1", "sortType": "SCORING_CATEGORY", "name": "Game-winning Goals", "width": 3.5, "shortName": "GWG", "key": "2010#2120#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2327#-1", "scipId": "2010#2327#-1", "sortType": "SCORING_CATEGORY", "name": "Power Play Points", "width": 3.5, "shortName": "PPP", "key": "2010#2327#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2344#-1", "scipId": "2010#2344#-1", "sortType": "SCORING_CATEGORY", "name": "Short-Handed Points", "width": 3.5, "shortName": "SHP", "key": "2010#2344#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2145#-1", "scipId": "2010#2145#-1", "sortType": "SCORING_CATEGORY", "name": "Hat Tricks -- Three or more goals in a game", "width": 2.5, "shortName": "HT", "key": "2010#2145#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2147#-1", "scipId": "2010#2147#-1", "sortType": "SCORING_CATEGORY", "name": "Hits", "width": 3.5, "shortName": "Hit", "key": "2010#2147#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2092#-1", "scipId": "2010#2092#-1", "sortType": "SCORING_CATEGORY", "name": "Blocks -- A player blocks a shot by an opposing shooter.", "width": 3.5, "shortName": "Blk", "key": "2010#2092#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2096#-1", "scipId": "2010#2096#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Won", "width": 3.5, "shortName": "FOW", "key": "2010#2096#-1", "maxWidth": 3.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2010#2095#-1", "scipId": "2010#2095#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Lost", "width": 3.5, "shortName": "FOL", "key": "2010#2095#-1", "maxWidth": 3.0}]}, "statsTable": [{"scorer": {"scorerId": "04qzk", "name": "Paul Cotter", "shortName": "P. Cotter", "posShortNames": "LW", "posIds": ["203", "208"], "posIdsNoFlex": ["203"], "defaultPosId": "203", "teamShortName": "VAN", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "64"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "26"}, {"content": "@TBL<br/>Sat 3:00PM", "eventId": "06mjq"}, {"content": "54.34"}, {"content": "6.04"}, {"content": "58%"}, {"gainColor": -1, "content": "-3%"}, {"content": "9"}, {"content": "4"}, {"content": "2"}, {"content": "6"}, {"content": "9"}, {"content": "1"}, {"content": "1"}, {"content": "1"}, {"content": "0"}, {"content": "31"}, {"content": "1"}, {"content": "24"}, {"content": "23"}]}, {"scorer": {"scorerId": "060v8", "name": "Elias Pettersson", "shortName": "E. Pettersson", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "VAN", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "100"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "22"}, {"content": "@TBL<br/>Sat 3:00PM", "eventId": "06mjq"}, {"content": "46.5"}, {"content": "5.17"}, {"content": "31%"}, {"gainColor": 1, "content": "+9%"}, {"content": "9"}, {"content": "3"}, {"content": "0"}, {"content": "3"}, {"content": "10"}, {"content": "1"}, {"content": "0"}, {"content": "1"}, {"content": "0"}, {"content": "17"}, {"content": "14"}, {"content": "0"}, {"content": "0"}]}, {"scorer": {"scorerId": "06sds", "name": "Tim Washe", "shortName": "T. Washe", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "ANA", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "118"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "25"}, {"content": ""}, {"content": "45.03"}, {"content": "6.43"}, {"content": "15%"}, {"gainColor": 1, "content": "+5%"}, {"content": "7"}, {"content": "2"}, {"content": "2"}, {"content": "4"}, {"content": "6"}, {"content": "1"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "25"}, {"content": "12"}, {"content": "58"}, {"content": "61"}]}, {"scorer": {"scorerId": "03c0c", "name": "Josh Manson", "shortName": "J. Manson", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "COL", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "120"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "35"}, {"content": ""}, {"content": "44.95"}, {"content": "5.62"}, {"content": "47%"}, {"gainColor": 1, "content": "+5%"}, {"content": "8"}, {"content": "1"}, {"content": "3"}, {"content": "4"}, {"content": "9"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "18"}, {"content": "13"}, {"content": "0"}, {"content": "0"}]}, {"scorer": {"scorerId": "02azh", "name": "Jamie Oleksiak", "shortName": "J. Oleksiak", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "VAN", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "139"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "33"}, {"content": "@TBL<br/>Sat 3:00PM", "eventId": "06mjq"}, {"content": "42.05"}, {"content": "5.26"}, {"content": "15%"}, {"gainColor": -1, "content": "-2%"}, {"content": "8"}, {"content": "1"}, {"content": "3"}, {"content": "4"}, {"content": "5"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "15"}, {"content": "14"}, {"content": "0"}, {"content": "0"}]}, {"scorer": {"scorerId": "04l8y", "name": "Mark Kastelic", "shortName": "M. Kastelic", "posShortNames": "C,RW", "posIds": ["206", "204", "208"], "posIdsNoFlex": ["206", "204"], "defaultPosId": "206", "teamShortName": "BOS", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "140"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "27"}, {"content": "@LAK<br/>Sat 8:00PM", "eventId": "06mjz"}, {"content": "41.84"}, {"content": "5.23"}, {"content": "24%"}, {"gainColor": 1, "content": "+3%"}, {"content": "8"}, {"content": "1"}, {"content": "4"}, {"content": "5"}, {"content": "7"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "20"}, {"content": "9"}, {"content": "18"}, {"content": "13"}]}], "paginatedResultSet": {"totalNumPages": 368, "pageNumber": 1, "maxResultsPerPage": 20, "totalNumResults": 7344}, "displayedSelections": {"datePlaying": "ALL", "searchName": "", "displayedMiscDisplayType": "1", "displayedView": "STATS", "displayedStartDate": 1790654400000, "displayedScoringCategoryType": "5", "displayedEndDate": 1792209600000, "displayedSeasonOrProjection": {"code": "SEASON_31n_YEAR_TO_DATE", "endDate": 1807415999000, "name": "2026-27 Reg Season - YTD", "showGoBackDays": true, "shortName": "2026-27 Reg - YTD", "timeframeTypeCode": "YEAR_TO_DATE", "startDate": 1790654400000}}, "displayedSortType": "SCORE", "displayedSortReversed": false, "displayedPosOrGroup": "HOCKEY_SKATING", "displayedScoringCategoryType": "5"};
export const PLAYERS_TRENDS_FPG_P2 = {"tableHeader": {"cells": [{"sortDirection": 1, "name": "Ranking based on fantasy points among all players", "width": 4.0, "shortName": "Rk", "key": "rankOv"}, {"sortDirection": 1, "sortKey": "STATUS", "sortType": "STATUS", "name": "Status", "width": 3.5, "shortName": "Sta", "key": "status"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.5, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "width": 5.5, "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "width": 4.5, "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PERCENT_DRAFTED", "sortType": "OVERVIEW_PERCENT_DRAFTED", "name": "Drafted", "shortName": "%D"}, {"sortDirection": 1, "sortKey": "OVERVIEW_AVG_DRAFT_POSITION", "sortType": "OVERVIEW_AVG_DRAFT_POSITION", "name": "Avg. Draft Position", "shortName": "ADP"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PERCENT_OWNED_2", "sortType": "OVERVIEW_PERCENT_OWNED_2", "name": "% of Fantrax leagues that have this player on their roster this week", "shortName": "Ros"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2", "sortType": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2", "name": "Change in percent Rostered from previous week", "shortName": "+/-"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PERCENT_ACTIVE_2", "sortType": "OVERVIEW_PERCENT_ACTIVE_2", "name": "% of leagues that have this player starting, i.e. in an active slot this week", "shortName": "Act"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PLUS_MINUS_PERCENT_ACTIVE_2", "sortType": "OVERVIEW_PLUS_MINUS_PERCENT_ACTIVE_2", "name": "Change in percent active from previous week", "shortName": "+/-"}]}, "statsTable": [{"scorer": {"scorerId": "02ybo", "name": "Rasmus Ristolainen", "shortName": "R. Ristolainen", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "PHI", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "539"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "31"}, {"content": "OTT<br/>Sat 6:00PM", "eventId": "06mjw"}, {"content": "15.1"}, {"content": "5.03"}, {"content": "2"}, {"content": "292.8"}, {"content": "10%"}, {"gainColor": -1, "content": "-1%"}, {"content": "2%"}, {"gainColor": -1, "content": "-2%"}]}, {"scorer": {"scorerId": "04zj9", "name": "Ben Meyers", "shortName": "B. Meyers", "posShortNames": "C,LW", "posIds": ["206", "203", "208"], "posIdsNoFlex": ["206", "203"], "defaultPosId": "203", "teamShortName": "SEA", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "281"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "27"}, {"content": "@FLA<br/>Sat 5:00PM", "eventId": "06mjr"}, {"content": "29.86"}, {"content": "4.98"}, {"content": "0"}, {"content": "-"}, {"content": "8%"}, {"gainColor": 1, "content": "+2%"}, {"content": "6%"}, {"gainColor": 1, "content": "+1%"}]}, {"scorer": {"scorerId": "05ymq", "name": "Matthew Poitras", "shortName": "M. Poitras", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "BOS", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "369"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "22"}, {"content": "@LAK<br/>Sat 8:00PM", "eventId": "06mjz"}, {"content": "24.84"}, {"content": "4.97"}, {"content": "0"}, {"content": "-"}, {"content": "17%"}, {"gainColor": 1, "content": "+1%"}, {"content": "7%"}, {"gainColor": 1, "content": "+3%"}]}, {"scorer": {"scorerId": "031nw", "name": "Michael McCarron", "shortName": "M. McCarron", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "MIN", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "163"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "31"}, {"content": ""}, {"content": "39.12"}, {"content": "4.89"}, {"content": "3"}, {"content": "291.5"}, {"content": "14%"}, {"gainColor": 1, "content": "+1%"}, {"content": "11%"}, {"gainColor": -1, "content": "-1%"}]}, {"scorer": {"scorerId": "05rjg", "name": "Danila Yurov", "shortName": "D. Yurov", "posShortNames": "C,LW", "posIds": ["206", "203", "208"], "posIdsNoFlex": ["206", "203"], "defaultPosId": "203", "teamShortName": "MIN", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "164"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "22"}, {"content": ""}, {"content": "39.05"}, {"content": "4.88"}, {"content": "3"}, {"content": "292.1"}, {"content": "42%"}, {"content": "0%"}, {"content": "23%"}, {"gainColor": 1, "content": "+1%"}]}, {"scorer": {"scorerId": "051ug", "name": "Maxwell Crozier", "shortName": "M. Crozier", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "TBL", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "377"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "26"}, {"content": "VAN<br/>Sat 3:00PM", "eventId": "06mjq"}, {"content": "24.4"}, {"content": "4.88"}, {"content": "1"}, {"content": "291.9"}, {"content": "8%"}, {"gainColor": 1, "content": "+1%"}, {"content": "5%"}, {"gainColor": 1, "content": "+1%"}]}], "paginatedResultSet": {"totalNumPages": 368, "pageNumber": 2, "maxResultsPerPage": 20, "totalNumResults": 7344}, "displayedSelections": {"datePlaying": "ALL", "searchName": "", "displayedMiscDisplayType": "1", "displayedView": "OVERVIEW", "displayedStartDate": 1790654400000, "displayedScoringCategoryType": "5", "displayedEndDate": 1792209600000, "displayedSeasonOrProjection": {"code": "SEASON_31n_YEAR_TO_DATE", "endDate": 1807415999000, "name": "2026-27 Reg Season - YTD", "showGoBackDays": true, "shortName": "2026-27 Reg - YTD", "timeframeTypeCode": "YEAR_TO_DATE", "startDate": 1790654400000}}, "displayedSortType": "FPTS_PER_GAME", "displayedSortReversed": false, "displayedPosOrGroup": "HOCKEY_SKATING", "displayedScoringCategoryType": "5"};
export const PLAYERS_TRENDS_FPG_P2_LOOKUP = {"tableHeader": {"cells": [{"sortDirection": 1, "name": "Ranking based on fantasy points among all players", "width": 4.0, "shortName": "Rk", "key": "rankOv"}, {"sortDirection": 1, "sortKey": "STATUS", "sortType": "STATUS", "name": "Status", "width": 3.5, "shortName": "Sta", "key": "status"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.5, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "width": 5.5, "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "width": 4.5, "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PERCENT_OWNED_2", "sortType": "OVERVIEW_PERCENT_OWNED_2", "name": "% of Fantrax leagues that have this player on their roster this week", "shortName": "Ros"}, {"sortDirection": 1, "sortKey": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2", "sortType": "OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2", "name": "Change in percent Rostered from previous week", "shortName": "+/-"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2100#-1", "scipId": "2010#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 2.5, "shortName": "GP", "key": "2010#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2130#-1", "scipId": "2010#2130#-1", "sortType": "SCORING_CATEGORY", "name": "Goals", "width": 1.5, "shortName": "G", "key": "2010#2130#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2090#-1", "scipId": "2010#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 1.5, "shortName": "A", "key": "2010#2090#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2190#-1", "scipId": "2010#2190#-1", "sortType": "SCORING_CATEGORY", "name": "Points -- Goals + Assists", "width": 2.5, "shortName": "Pt", "key": "2010#2190#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2270#-1", "scipId": "2010#2270#-1", "sortType": "SCORING_CATEGORY", "name": "Shots on Goal", "width": 3.5, "shortName": "SOG", "key": "2010#2270#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2120#-1", "scipId": "2010#2120#-1", "sortType": "SCORING_CATEGORY", "name": "Game-winning Goals", "width": 3.5, "shortName": "GWG", "key": "2010#2120#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2327#-1", "scipId": "2010#2327#-1", "sortType": "SCORING_CATEGORY", "name": "Power Play Points", "width": 3.5, "shortName": "PPP", "key": "2010#2327#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2344#-1", "scipId": "2010#2344#-1", "sortType": "SCORING_CATEGORY", "name": "Short-Handed Points", "width": 3.5, "shortName": "SHP", "key": "2010#2344#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2145#-1", "scipId": "2010#2145#-1", "sortType": "SCORING_CATEGORY", "name": "Hat Tricks -- Three or more goals in a game", "width": 2.5, "shortName": "HT", "key": "2010#2145#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2147#-1", "scipId": "2010#2147#-1", "sortType": "SCORING_CATEGORY", "name": "Hits", "width": 3.5, "shortName": "Hit", "key": "2010#2147#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2092#-1", "scipId": "2010#2092#-1", "sortType": "SCORING_CATEGORY", "name": "Blocks -- A player blocks a shot by an opposing shooter.", "width": 3.5, "shortName": "Blk", "key": "2010#2092#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2096#-1", "scipId": "2010#2096#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Won", "width": 3.5, "shortName": "FOW", "key": "2010#2096#-1", "maxWidth": 3.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2010#2095#-1", "scipId": "2010#2095#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Lost", "width": 3.5, "shortName": "FOL", "key": "2010#2095#-1", "maxWidth": 3.0}]}, "statsTable": [{"scorer": {"scorerId": "02ybo", "name": "Rasmus Ristolainen", "shortName": "R. Ristolainen", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "PHI", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "539"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "31"}, {"content": "OTT<br/>Sat 6:00PM", "eventId": "06mjw"}, {"content": "15.1"}, {"content": "5.03"}, {"content": "10%"}, {"gainColor": -1, "content": "-1%"}, {"content": "3"}, {"content": "1"}, {"content": "0"}, {"content": "1"}, {"content": "4"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "4"}, {"content": "7"}, {"content": "0"}, {"content": "0"}]}, {"scorer": {"scorerId": "04zj9", "name": "Ben Meyers", "shortName": "B. Meyers", "posShortNames": "C,LW", "posIds": ["206", "203", "208"], "posIdsNoFlex": ["206", "203"], "defaultPosId": "203", "teamShortName": "SEA", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "281"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "27"}, {"content": "@FLA<br/>Sat 5:00PM", "eventId": "06mjr"}, {"content": "29.86"}, {"content": "4.98"}, {"content": "8%"}, {"gainColor": 1, "content": "+2%"}, {"content": "6"}, {"content": "1"}, {"content": "4"}, {"content": "5"}, {"content": "4"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "11"}, {"content": "5"}, {"content": "9"}, {"content": "12"}]}, {"scorer": {"scorerId": "05ymq", "name": "Matthew Poitras", "shortName": "M. Poitras", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "BOS", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "369"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "22"}, {"content": "@LAK<br/>Sat 8:00PM", "eventId": "06mjz"}, {"content": "24.84"}, {"content": "4.97"}, {"content": "17%"}, {"gainColor": 1, "content": "+1%"}, {"content": "5"}, {"content": "3"}, {"content": "1"}, {"content": "4"}, {"content": "8"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "6"}, {"content": "1"}, {"content": "7"}, {"content": "8"}]}, {"scorer": {"scorerId": "031nw", "name": "Michael McCarron", "shortName": "M. McCarron", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "MIN", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "163"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "31"}, {"content": ""}, {"content": "39.12"}, {"content": "4.89"}, {"content": "14%"}, {"gainColor": 1, "content": "+1%"}, {"content": "8"}, {"content": "0"}, {"content": "4"}, {"content": "4"}, {"content": "12"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "21"}, {"content": "10"}, {"content": "49"}, {"content": "54"}]}, {"scorer": {"scorerId": "05rjg", "name": "Danila Yurov", "shortName": "D. Yurov", "posShortNames": "C,LW", "posIds": ["206", "203", "208"], "posIdsNoFlex": ["206", "203"], "defaultPosId": "203", "teamShortName": "MIN", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "164"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "22"}, {"content": ""}, {"content": "39.05"}, {"content": "4.88"}, {"content": "42%"}, {"content": "0%"}, {"content": "8"}, {"content": "3"}, {"content": "1"}, {"content": "4"}, {"content": "11"}, {"content": "1"}, {"content": "2"}, {"content": "0"}, {"content": "0"}, {"content": "11"}, {"content": "5"}, {"content": "37"}, {"content": "30"}]}, {"scorer": {"scorerId": "051ug", "name": "Maxwell Crozier", "shortName": "M. Crozier", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "TBL", "rookie": false, "team": false, "minorsEligible": false, "statusId": "4"}, "cells": [{"content": "377"}, {"content": "FA", "toolTip": "Free Agent"}, {"content": "26"}, {"content": "VAN<br/>Sat 3:00PM", "eventId": "06mjq"}, {"content": "24.4"}, {"content": "4.88"}, {"content": "8%"}, {"gainColor": 1, "content": "+1%"}, {"content": "5"}, {"content": "0"}, {"content": "2"}, {"content": "2"}, {"content": "8"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "11"}, {"content": "6"}, {"content": "0"}, {"content": "0"}]}], "paginatedResultSet": {"totalNumPages": 368, "pageNumber": 2, "maxResultsPerPage": 20, "totalNumResults": 7344}, "displayedSelections": {"datePlaying": "ALL", "searchName": "", "displayedMiscDisplayType": "1", "displayedView": "STATS", "displayedStartDate": 1790654400000, "displayedScoringCategoryType": "5", "displayedEndDate": 1792209600000, "displayedSeasonOrProjection": {"code": "SEASON_31n_YEAR_TO_DATE", "endDate": 1807415999000, "name": "2026-27 Reg Season - YTD", "showGoBackDays": true, "shortName": "2026-27 Reg - YTD", "timeframeTypeCode": "YEAR_TO_DATE", "startDate": 1790654400000}}, "displayedSortType": "FPTS_PER_GAME", "displayedSortReversed": false, "displayedPosOrGroup": "HOCKEY_SKATING", "displayedScoringCategoryType": "5"};
// Lineup day 18, Tracked (Per-Game) view (cells are per-game values; the Totals row too). Same rows as ROSTER_STATS_DAY.
export const ROSTER_PERGAME_DAY = {"displayedSelections": {"displayedStatsType": "1", "displayedPeriod": 18, "adminMode": false, "displayedView": "STATS", "lineupChangeSystem": "EASY_CLICK", "displayedStartDate": 1790654400000, "displayedScoringCategoryType": "7", "displayedSeasonOrProjection": {"code": "SEASON_31n_BY_PERIOD", "endDate": 1807415999000, "name": "2026-27 Reg Season - Period", "showGoBackDays": true, "shortName": "2026-27 Reg - Period", "timeframeTypeCode": "BY_PERIOD", "startDate": 1790654400000}, "displayedEndDate": 1792209600000}, "tables": [{"scGroup": "2010", "header": {"cells": [{"sortDirection": 1, "name": "Position rank â¢ Overall rank", "width": 9.0, "shortName": "Rk", "key": "rankPosOv"}, {"sortDirection": 1, "sortKey": "AGE", "sortType": "AGE", "name": "Age", "width": 3.0, "shortName": "Age", "key": "age"}, {"eventStr": true, "sortDirection": 1, "name": "Opponent", "shortName": "Opp", "key": "opponent"}, {"sortDirection": 1, "sortKey": "SCORE", "sortType": "SCORE", "name": "Fantasy Points", "shortName": "FPts", "key": "fpts"}, {"sortDirection": 1, "sortKey": "FPTS_PER_GAME", "sortType": "FPTS_PER_GAME", "name": "Average Fantasy Points per Game", "shortName": "FP/G", "key": "fptsPerGame"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2100#-1", "scipId": "2010#2100#-1", "sortType": "SCORING_CATEGORY", "name": "Games Played", "width": 3.0, "shortName": "GP", "key": "2010#2100#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2131#-1", "scipId": "2010#2131#-1", "sortType": "SCORING_CATEGORY", "name": "Goals Per Game", "width": 3.0, "shortName": "G", "key": "2010#2131#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2099#-1", "scipId": "2010#2099#-1", "sortType": "SCORING_CATEGORY", "name": "Assists Per Game", "width": 3.0, "shortName": "A", "key": "2010#2099#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2326#-1", "scipId": "2010#2326#-1", "sortType": "SCORING_CATEGORY", "name": "Points Per Game", "width": 3.0, "shortName": "P/G", "key": "2010#2326#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2272#-1", "scipId": "2010#2272#-1", "sortType": "SCORING_CATEGORY", "name": "Shots on Goal Per Game -- The total shots on goal divided by the number of games played", "width": 3.0, "shortName": "SOG", "key": "2010#2272#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2121#-1", "scipId": "2010#2121#-1", "sortType": "SCORING_CATEGORY", "name": "Game-winning Goals Per Game", "width": 3.0, "shortName": "GWG", "key": "2010#2121#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#232i#-1", "scipId": "2010#232i#-1", "sortType": "SCORING_CATEGORY", "name": "Power Play Points Per Game -- The total power play points divided by the number of games played", "width": 3.0, "shortName": "PPP", "key": "2010#232i#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2344#-1", "scipId": "2010#2344#-1", "sortType": "SCORING_CATEGORY", "name": "Short-Handed Points", "width": 3.0, "shortName": "SHP", "key": "2010#2344#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2145#-1", "scipId": "2010#2145#-1", "sortType": "SCORING_CATEGORY", "name": "Hat Tricks -- Three or more goals in a game", "width": 3.0, "shortName": "HT", "key": "2010#2145#-1", "maxWidth": 3.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2325#-1", "scipId": "2010#2325#-1", "sortType": "SCORING_CATEGORY", "name": "Hits Per Game", "width": 4.0, "shortName": "Ht/G", "key": "2010#2325#-1", "maxWidth": 4.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2311#-1", "scipId": "2010#2311#-1", "sortType": "SCORING_CATEGORY", "name": "Blocks Per Game", "width": 5.0, "shortName": "Blk/G", "key": "2010#2311#-1", "maxWidth": 5.0}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2097#-1", "scipId": "2010#2097#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Won Per Game", "width": 5.0, "shortName": "FOW/G", "key": "2010#2097#-1", "maxWidth": 5.0}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2010#2095#-1", "scipId": "2010#2095#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Lost", "width": 3.0, "shortName": "FOL", "key": "2010#2095#-1", "maxWidth": 3.0}]}, "rows": [{"posId": "206", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["206", "208"], "scorer": {"scorerId": "03167", "name": "Bo Horvat", "shortName": "B. Horvat", "posShortNames": "C", "posIds": ["206", "208"], "posIdsNoFlex": ["206"], "defaultPosId": "206", "teamShortName": "NYI", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "11 • 37", "toolTip": "C rank: 11 • Overall rank: 37"}, {"content": "31"}, {"content": ""}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}, {"posId": "203", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["203", "204", "206", "208"], "scorer": {"scorerId": "04a9v", "name": "Morgan Geekie", "shortName": "M. Geekie", "posShortNames": "C,LW,RW", "posIds": ["206", "203", "204", "208"], "posIdsNoFlex": ["206", "203", "204"], "defaultPosId": "203", "teamShortName": "BOS", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "31 • 128", "toolTip": "LW rank: 31 • Overall rank: 128"}, {"content": "28"}, {"content": "BOS 4<br/>@ANA 2 F", "eventId": "06mjn"}, {"content": "6.01"}, {"content": "6.01"}, {"content": "1"}, {"content": ".00"}, {"content": "1.00"}, {"content": "1.00"}, {"content": "1.00"}, {"content": ".00"}, {"content": "1.00"}, {"content": "0"}, {"content": "0"}, {"content": ".00"}, {"content": "1.00"}, {"content": "3.00"}, {"content": "2"}]}, {"posId": "204", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["204", "206", "208"], "scorer": {"scorerId": "06snb", "name": "Benjamin Kindel", "shortName": "B. Kindel", "posShortNames": "C,RW", "posIds": ["206", "204", "208"], "posIdsNoFlex": ["206", "204"], "defaultPosId": "204", "teamShortName": "PIT", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "102 • 331", "toolTip": "RW rank: 102 • Overall rank: 331"}, {"content": "19"}, {"content": "PIT 2<br/>@COL 5 F", "eventId": "06mjm"}, {"content": "0.39"}, {"content": "0.39"}, {"content": "1"}, {"content": ".00"}, {"content": ".00"}, {"content": "0.00"}, {"content": "2.00"}, {"content": ".00"}, {"content": "0.00"}, {"content": "0"}, {"content": "0"}, {"content": ".00"}, {"content": ".00"}, {"content": "1.00"}, {"content": "3"}]}, {"posId": "202", "statusId": "1", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["202", "208"], "scorer": {"scorerId": "02wy5", "name": "Nikita Zadorov", "shortName": "N. Zadorov", "posShortNames": "D", "posIds": ["202", "208"], "posIdsNoFlex": ["202"], "defaultPosId": "202", "teamShortName": "BOS", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "26 • 108", "toolTip": "D rank: 26 • Overall rank: 108"}, {"content": "31"}, {"content": "BOS 4<br/>@ANA 2 F", "eventId": "06mjn"}, {"content": "3.6"}, {"content": "3.6"}, {"content": "1"}, {"content": ".00"}, {"content": ".00"}, {"content": "0.00"}, {"content": "0.00"}, {"content": ".00"}, {"content": "0.00"}, {"content": "0"}, {"content": "0"}, {"content": "6.00"}, {"content": ".00"}, {"content": "0.00"}, {"content": "0"}]}, {"posId": "204", "statusId": "2", "eligibleStatusIds": ["1", "2"], "eligiblePosIds": ["204", "208"], "scorer": {"scorerId": "06bdr", "name": "Roman Kantserov", "shortName": "R. Kantserov", "posShortNames": "RW", "posIds": ["204", "208"], "posIdsNoFlex": ["204"], "defaultPosId": "204", "teamShortName": "CHI", "disableLineupChange": true, "rookie": true, "team": false, "minorsEligible": false}, "cells": [{"content": "119 • 370", "toolTip": "RW rank: 119 • Overall rank: 370"}, {"content": "22"}, {"content": ""}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}, {"statusId": "2", "numSpotsAvailableText": "Reserve spot(s) available", "numSpotsAvailableIcon": "LIMITED_BY_MAX", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"posId": "204", "statusId": "3", "eligibleStatusIds": ["1", "2", "3"], "eligiblePosIds": ["204", "208"], "scorer": {"scorerId": "03rik", "name": "Troy Terry", "shortName": "T. Terry", "posShortNames": "RW", "posIds": ["204", "208"], "posIdsNoFlex": ["204"], "defaultPosId": "204", "teamShortName": "ANA", "disableLineupChange": true, "rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": "1557 • 7910", "toolTip": "RW rank: 1557 • Overall rank: 7910"}, {"content": "29"}, {"content": "BOS 4<br/>@ANA 2 F", "eventId": "06mjn"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}, {"content": "0"}]}, {"statusId": "3", "numSpotsAvailableText": "Inj Res spot(s) available", "cells": [{"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}, {"content": ""}]}, {"statusId": "y", "scorerColumn": "Totals", "bold": true, "scorer": {"rookie": false, "team": false, "minorsEligible": false}, "cells": [{"content": ""}, {"content": ""}, {"content": "10"}, {"content": "3.33"}, {"content": "3"}, {"content": ".00"}, {"content": ".33"}, {"content": "0.33"}, {"content": "1.00"}, {"content": ".00"}, {"content": "0.33"}, {"content": "0"}, {"content": "0"}, {"content": "2.00"}, {"content": ".33"}, {"content": "1.33"}, {"content": "5"}]}]}]};

// ---- Live Scoring (getLiveScoringStats), trimmed from real responses 2026-10-17; fantasy team ids replaced ----
export const LIVE_CURRENT = {"allEventsFinished": false, "scoringCategoriesPerGroup": {"2010": [{"id": "2010#2130#-1", "name": "Goals", "shortName": "G", "tinyName": "G", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "G"}, {"id": "2010#2090#-1", "name": "Assists", "shortName": "A", "tinyName": "A", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "A"}, {"id": "2010#2190#-1", "name": "Points", "shortName": "Pt", "tinyName": "Pt", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "Pt"}, {"id": "2010#2270#-1", "name": "Shots on Goal", "shortName": "SOG", "tinyName": "SOG", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "SOG"}, {"id": "2010#2120#-1", "name": "Game-winning Goals", "shortName": "GWG", "tinyName": "GWG", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "GWG"}, {"id": "2010#2327#-1", "name": "Power Play Points", "shortName": "PPP", "tinyName": "PPP", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "PPP"}, {"id": "2010#2344#-1", "name": "Short-Handed Points", "shortName": "SHP", "tinyName": "SHP", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "SHP"}, {"id": "2010#2145#-1", "name": "Hat Tricks", "shortName": "HT", "tinyName": "HT", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "HT"}, {"id": "2010#2147#-1", "name": "Hits", "shortName": "Hit", "tinyName": "Hit", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "Hit"}, {"id": "2010#2092#-1", "name": "Blocks", "shortName": "Blk", "tinyName": "Blk", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "Blk"}, {"id": "2010#2096#-1", "name": "Faceoffs Won", "shortName": "FOW", "tinyName": "FOW", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "FOW"}, {"id": "2010#2095#-1", "name": "Faceoffs Lost", "shortName": "FOL", "tinyName": "FOL", "sortDirection": -1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "FOL"}], "2020": [{"id": "2020#231b#-1", "name": "Wins (Goalies only)", "shortName": "W", "tinyName": "W", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "W"}, {"id": "2020#232c#-1", "name": "Overtime Losses + Shootout Losses", "shortName": "OL+ShL", "tinyName": "OL+ShL", "sortDirection": -1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "OL+ShL"}, {"id": "2020#2140#-1", "name": "Goals Against", "shortName": "GA", "tinyName": "GA", "sortDirection": -1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "GA"}, {"id": "2020#2230#-1", "name": "Saves", "shortName": "SV", "tinyName": "SV", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "SV"}, {"id": "2020#2290#-1", "name": "Shutouts", "shortName": "SHO", "tinyName": "SHO", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "SHO"}, {"id": "2020#2090#-1", "name": "Assists", "shortName": "A", "tinyName": "A", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "A"}]}, "scoringCategoryGroups": [{"id": "2010", "name": "Skaters", "shortName": "Skt", "description": "Skaters"}, {"id": "2020", "name": "Goalies", "shortName": "Goal", "description": "Goalies"}], "miscData": {"pointsBased": true, "scipIdsCounted": ["2010#2327#-1", "2010#2190#-1", "2020#2290#-1", "2020#231b#-1", "2010#2120#-1", "2020#2090#-1", "2010#2145#-1", "2010#2270#-1", "2010#2092#-1", "2010#2147#-1", "2010#2344#-1", "2010#2090#-1", "2020#2140#-1", "2020#232c#-1", "2010#2096#-1", "2010#2095#-1", "2020#2230#-1", "2010#2130#-1"], "showProjections": true}, "displayedSelections": {"period": 3, "viewType": {"id": "2", "name": "Period"}, "viewTypeId": "2", "realOrStatProjProvider": {"id": "-1", "name": "NFL", "shortName": "NFL"}, "playerViewType": {"id": "1", "name": "Active Players Playing"}, "layout": "STANDARD"}, "standingsTable": {"standingsHeader": {"cells": [{"sortDirection": 1, "name": "Fantasy Points", "shortName": "FPts", "key": "score"}, {"sortDirection": 1, "name": "The change (green up, red down) in fantasy points from the previous game day", "shortName": "+/-", "key": "diff"}, {"sortDirection": 1, "name": "Projected fantasy points", "shortName": "Proj", "key": "proj"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2130#-1", "scipId": "2010#2130#-1", "sortType": "SCORING_CATEGORY", "name": "Goals", "width": 3, "shortName": "G", "key": "2010#2130#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2090#-1", "scipId": "2010#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3, "shortName": "A", "key": "2010#2090#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2190#-1", "scipId": "2010#2190#-1", "sortType": "SCORING_CATEGORY", "name": "Points -- Goals + Assists", "width": 3, "shortName": "Pt", "key": "2010#2190#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2270#-1", "scipId": "2010#2270#-1", "sortType": "SCORING_CATEGORY", "name": "Shots on Goal", "width": 3, "shortName": "SOG", "key": "2010#2270#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2120#-1", "scipId": "2010#2120#-1", "sortType": "SCORING_CATEGORY", "name": "Game-winning Goals", "width": 3, "shortName": "GWG", "key": "2010#2120#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2327#-1", "scipId": "2010#2327#-1", "sortType": "SCORING_CATEGORY", "name": "Power Play Points", "width": 3, "shortName": "PPP", "key": "2010#2327#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2344#-1", "scipId": "2010#2344#-1", "sortType": "SCORING_CATEGORY", "name": "Short-Handed Points", "width": 3, "shortName": "SHP", "key": "2010#2344#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2145#-1", "scipId": "2010#2145#-1", "sortType": "SCORING_CATEGORY", "name": "Hat Tricks -- Three or more goals in a game", "width": 3, "shortName": "HT", "key": "2010#2145#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2147#-1", "scipId": "2010#2147#-1", "sortType": "SCORING_CATEGORY", "name": "Hits", "width": 3, "shortName": "Hit", "key": "2010#2147#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2092#-1", "scipId": "2010#2092#-1", "sortType": "SCORING_CATEGORY", "name": "Blocks -- A player blocks a shot by an opposing shooter.", "width": 3, "shortName": "Blk", "key": "2010#2092#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2096#-1", "scipId": "2010#2096#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Won", "width": 3, "shortName": "FOW", "key": "2010#2096#-1", "maxWidth": 3}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2010#2095#-1", "scipId": "2010#2095#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Lost", "width": 3, "shortName": "FOL", "key": "2010#2095#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#231b#-1", "scipId": "2020#231b#-1", "sortType": "SCORING_CATEGORY", "name": "Wins (Goalies only) -- Includes Overtime Wins and Shootout Wins. Skaters cannot get a win using this category - for that - use the \"regular\" Wins category.", "width": 3, "shortName": "W", "key": "2020#231b#-1", "maxWidth": 3}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#232c#-1", "scipId": "2020#232c#-1", "sortType": "SCORING_CATEGORY", "name": "Overtime Losses + Shootout Losses", "width": 6, "shortName": "OL+ShL", "key": "2020#232c#-1", "maxWidth": 6}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#2140#-1", "scipId": "2020#2140#-1", "sortType": "SCORING_CATEGORY", "name": "Goals Against", "width": 3, "shortName": "GA", "key": "2020#2140#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2230#-1", "scipId": "2020#2230#-1", "sortType": "SCORING_CATEGORY", "name": "Saves", "width": 3, "shortName": "SV", "key": "2020#2230#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2290#-1", "scipId": "2020#2290#-1", "sortType": "SCORING_CATEGORY", "name": "Shutouts", "width": 3, "shortName": "SHO", "key": "2020#2290#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2090#-1", "scipId": "2020#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3, "shortName": "A", "key": "2020#2090#-1", "maxWidth": 3}]}}, "statsPerTeam": {"allTeamsStats": {"team0001": {"ACTIVE": {"statsMap": {"_2010": {"object2": [{"scipId": "2010#2130#-1", "sv": "9", "av": 9, "fpts": 27}, {"scipId": "2010#2090#-1", "sv": "16", "av": 16, "fpts": 32}, {"scipId": "2010#2190#-1", "sv": "25", "av": 25, "fpts": 51}, {"scipId": "2010#2270#-1", "sv": "77", "av": 77, "fpts": 34.65}, {"scipId": "2010#2120#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2327#-1", "sv": "6", "av": 6, "fpts": 6}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "25", "av": 25, "fpts": 15}, {"scipId": "2010#2092#-1", "sv": "25", "av": 25, "fpts": 17.5}, {"scipId": "2010#2096#-1", "sv": "50", "av": 50, "fpts": 15}, {"scipId": "2010#2095#-1", "sv": "72", "av": 72, "fpts": -19.44}], "object1": 180.71}, "_2020": {"object2": [{"scipId": "2020#231b#-1", "sv": "1", "av": 1, "fpts": 5}, {"scipId": "2020#2140#-1", "sv": "9", "av": 9, "fpts": -22.5}, {"scipId": "2020#2230#-1", "sv": "74", "av": 74, "fpts": 44.4}], "object1": 26.9}, "03rf5": {"object2": [{"scipId": "2010#2130#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2090#-1", "sv": "2", "av": 2, "fpts": 4}, {"scipId": "2010#2190#-1", "sv": "3", "av": 3, "fpts": 9}, {"scipId": "2010#2270#-1", "sv": "9", "av": 9, "fpts": 4.05}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "1", "av": 1, "fpts": 0.6}, {"scipId": "2010#2092#-1", "sv": "3", "av": 3, "fpts": 2.1}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 22.75}, "03mn8": {"object2": [{"scipId": "2010#2130#-1", "sv": "2", "av": 2, "fpts": 6}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2190#-1", "sv": "3", "av": 3, "fpts": 4.5}, {"scipId": "2010#2270#-1", "sv": "4", "av": 4, "fpts": 1.8}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2092#-1", "sv": "3", "av": 3, "fpts": 2.1}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 17.4}, "048xc": {"object2": [{"scipId": "2010#2130#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2190#-1", "sv": "2", "av": 2, "fpts": 3}, {"scipId": "2010#2270#-1", "sv": "8", "av": 8, "fpts": 3.6}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "2", "av": 2, "fpts": 1.2}, {"scipId": "2010#2092#-1", "sv": "2", "av": 2, "fpts": 1.4}, {"scipId": "2010#2096#-1", "sv": "19", "av": 19, "fpts": 5.7}, {"scipId": "2010#2095#-1", "sv": "15", "av": 15, "fpts": -4.05}], "object1": 16.85}, "0322w": {"object2": [{"scipId": "2020#231b#-1", "sv": "1", "av": 1, "fpts": 5}, {"scipId": "2020#232c#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2140#-1", "sv": "2", "av": 2, "fpts": -5}, {"scipId": "2020#2230#-1", "sv": "24", "av": 24, "fpts": 14.4}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 14.4}}, "projectedTotalsMap": {"03rf5": 16.44, "03mn8": 17.79, "048xc": 31.42, "0322w": 23.07}, "totalFpts": 207.61}}, "team0002": {"ACTIVE": {"statsMap": {"_2010": {"object2": [{"scipId": "2010#2130#-1", "sv": "10", "av": 10, "fpts": 30}, {"scipId": "2010#2090#-1", "sv": "24", "av": 24, "fpts": 48}, {"scipId": "2010#2190#-1", "sv": "34", "av": 34, "fpts": 67.5}, {"scipId": "2010#2270#-1", "sv": "72", "av": 72, "fpts": 32.4}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "10", "av": 10, "fpts": 10}, {"scipId": "2010#2344#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2145#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2147#-1", "sv": "42", "av": 42, "fpts": 25.2}, {"scipId": "2010#2092#-1", "sv": "30", "av": 30, "fpts": 21}, {"scipId": "2010#2096#-1", "sv": "110", "av": 110, "fpts": 33}, {"scipId": "2010#2095#-1", "sv": "95", "av": 95, "fpts": -25.65}], "object1": 246.45}, "_2020": {"object2": [{"scipId": "2020#231b#-1", "sv": "2", "av": 2, "fpts": 10}, {"scipId": "2020#232c#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2020#2140#-1", "sv": "9", "av": 9, "fpts": -22.5}, {"scipId": "2020#2230#-1", "sv": "88", "av": 88, "fpts": 52.8}], "object1": 41.3}, "04lbz": {"object2": [{"scipId": "2010#2130#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2090#-1", "sv": "5", "av": 5, "fpts": 10}, {"scipId": "2010#2190#-1", "sv": "5", "av": 5, "fpts": 15}, {"scipId": "2010#2270#-1", "sv": "7", "av": 7, "fpts": 3.15}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "2", "av": 2, "fpts": 2}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2092#-1", "sv": "1", "av": 1, "fpts": 0.7}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 30.85}, "01zvf": {"object2": [{"scipId": "2010#2130#-1", "sv": "3", "av": 3, "fpts": 9}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2190#-1", "sv": "4", "av": 4, "fpts": 6}, {"scipId": "2010#2270#-1", "sv": "5", "av": 5, "fpts": 2.25}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2147#-1", "sv": "1", "av": 1, "fpts": 0.6}, {"scipId": "2010#2092#-1", "sv": "1", "av": 1, "fpts": 0.7}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 24.55}, "01f6d": {"object2": [{"scipId": "2010#2130#-1", "sv": "2", "av": 2, "fpts": 6}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2190#-1", "sv": "3", "av": 3, "fpts": 4.5}, {"scipId": "2010#2270#-1", "sv": "6", "av": 6, "fpts": 2.7}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2092#-1", "sv": "1", "av": 1, "fpts": 0.7}, {"scipId": "2010#2096#-1", "sv": "23", "av": 23, "fpts": 6.9}, {"scipId": "2010#2095#-1", "sv": "13", "av": 13, "fpts": -3.51}], "object1": 22.29}, "01zs1": {"object2": [{"scipId": "2020#231b#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#232c#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2020#2140#-1", "sv": "2", "av": 2, "fpts": -5}, {"scipId": "2020#2230#-1", "sv": "20", "av": 20, "fpts": 12}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 8}}, "projectedTotalsMap": {"04lbz": 30.45, "01zvf": 27.04, "01f6d": 26.09, "01zs1": 8.57}, "totalFpts": 287.75}}}, "statsMap": {"team0001": {"ACTIVE": {"statsMap": {"_2010": {"object2": [{"scipId": "2010#2130#-1", "sv": "9", "av": 9, "fpts": 27}, {"scipId": "2010#2090#-1", "sv": "16", "av": 16, "fpts": 32}, {"scipId": "2010#2190#-1", "sv": "25", "av": 25, "fpts": 51}, {"scipId": "2010#2270#-1", "sv": "77", "av": 77, "fpts": 34.65}, {"scipId": "2010#2120#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2327#-1", "sv": "6", "av": 6, "fpts": 6}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "25", "av": 25, "fpts": 15}, {"scipId": "2010#2092#-1", "sv": "25", "av": 25, "fpts": 17.5}, {"scipId": "2010#2096#-1", "sv": "50", "av": 50, "fpts": 15}, {"scipId": "2010#2095#-1", "sv": "72", "av": 72, "fpts": -19.44}], "object1": 180.71}, "_2020": {"object2": [{"scipId": "2020#231b#-1", "sv": "1", "av": 1, "fpts": 5}, {"scipId": "2020#2140#-1", "sv": "9", "av": 9, "fpts": -22.5}, {"scipId": "2020#2230#-1", "sv": "74", "av": 74, "fpts": 44.4}], "object1": 26.9}, "03rf5": {"object2": [{"scipId": "2010#2130#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2090#-1", "sv": "2", "av": 2, "fpts": 4}, {"scipId": "2010#2190#-1", "sv": "3", "av": 3, "fpts": 9}, {"scipId": "2010#2270#-1", "sv": "9", "av": 9, "fpts": 4.05}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "1", "av": 1, "fpts": 0.6}, {"scipId": "2010#2092#-1", "sv": "3", "av": 3, "fpts": 2.1}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 22.75}, "03mn8": {"object2": [{"scipId": "2010#2130#-1", "sv": "2", "av": 2, "fpts": 6}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2190#-1", "sv": "3", "av": 3, "fpts": 4.5}, {"scipId": "2010#2270#-1", "sv": "4", "av": 4, "fpts": 1.8}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2092#-1", "sv": "3", "av": 3, "fpts": 2.1}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 17.4}, "048xc": {"object2": [{"scipId": "2010#2130#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2190#-1", "sv": "2", "av": 2, "fpts": 3}, {"scipId": "2010#2270#-1", "sv": "8", "av": 8, "fpts": 3.6}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "2", "av": 2, "fpts": 1.2}, {"scipId": "2010#2092#-1", "sv": "2", "av": 2, "fpts": 1.4}, {"scipId": "2010#2096#-1", "sv": "19", "av": 19, "fpts": 5.7}, {"scipId": "2010#2095#-1", "sv": "15", "av": 15, "fpts": -4.05}], "object1": 16.85}, "0322w": {"object2": [{"scipId": "2020#231b#-1", "sv": "1", "av": 1, "fpts": 5}, {"scipId": "2020#232c#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2140#-1", "sv": "2", "av": 2, "fpts": -5}, {"scipId": "2020#2230#-1", "sv": "24", "av": 24, "fpts": 14.4}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 14.4}}, "projectedTotalsMap": {"03rf5": 16.44, "03mn8": 17.79, "048xc": 31.42, "0322w": 23.07}, "totalFpts": 207.61}}, "team0002": {"ACTIVE": {"statsMap": {"_2010": {"object2": [{"scipId": "2010#2130#-1", "sv": "10", "av": 10, "fpts": 30}, {"scipId": "2010#2090#-1", "sv": "24", "av": 24, "fpts": 48}, {"scipId": "2010#2190#-1", "sv": "34", "av": 34, "fpts": 67.5}, {"scipId": "2010#2270#-1", "sv": "72", "av": 72, "fpts": 32.4}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "10", "av": 10, "fpts": 10}, {"scipId": "2010#2344#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2145#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2147#-1", "sv": "42", "av": 42, "fpts": 25.2}, {"scipId": "2010#2092#-1", "sv": "30", "av": 30, "fpts": 21}, {"scipId": "2010#2096#-1", "sv": "110", "av": 110, "fpts": 33}, {"scipId": "2010#2095#-1", "sv": "95", "av": 95, "fpts": -25.65}], "object1": 246.45}, "_2020": {"object2": [{"scipId": "2020#231b#-1", "sv": "2", "av": 2, "fpts": 10}, {"scipId": "2020#232c#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2020#2140#-1", "sv": "9", "av": 9, "fpts": -22.5}, {"scipId": "2020#2230#-1", "sv": "88", "av": 88, "fpts": 52.8}], "object1": 41.3}, "04lbz": {"object2": [{"scipId": "2010#2130#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2090#-1", "sv": "5", "av": 5, "fpts": 10}, {"scipId": "2010#2190#-1", "sv": "5", "av": 5, "fpts": 15}, {"scipId": "2010#2270#-1", "sv": "7", "av": 7, "fpts": 3.15}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "2", "av": 2, "fpts": 2}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2092#-1", "sv": "1", "av": 1, "fpts": 0.7}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 30.85}, "01zvf": {"object2": [{"scipId": "2010#2130#-1", "sv": "3", "av": 3, "fpts": 9}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2190#-1", "sv": "4", "av": 4, "fpts": 6}, {"scipId": "2010#2270#-1", "sv": "5", "av": 5, "fpts": 2.25}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2147#-1", "sv": "1", "av": 1, "fpts": 0.6}, {"scipId": "2010#2092#-1", "sv": "1", "av": 1, "fpts": 0.7}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 24.55}, "01f6d": {"object2": [{"scipId": "2010#2130#-1", "sv": "2", "av": 2, "fpts": 6}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2190#-1", "sv": "3", "av": 3, "fpts": 4.5}, {"scipId": "2010#2270#-1", "sv": "6", "av": 6, "fpts": 2.7}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2092#-1", "sv": "1", "av": 1, "fpts": 0.7}, {"scipId": "2010#2096#-1", "sv": "23", "av": 23, "fpts": 6.9}, {"scipId": "2010#2095#-1", "sv": "13", "av": 13, "fpts": -3.51}], "object1": 22.29}, "01zs1": {"object2": [{"scipId": "2020#231b#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#232c#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2020#2140#-1", "sv": "2", "av": 2, "fpts": -5}, {"scipId": "2020#2230#-1", "sv": "20", "av": 20, "fpts": 12}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 8}}, "projectedTotalsMap": {"04lbz": 30.45, "01zvf": 27.04, "01f6d": 26.09, "01zs1": 8.57}, "totalFpts": 287.75}}}, "delta": false, "refresh": false}};
export const LIVE_POLL = {"allEventsFinished": false, "miscData": {}, "displayedSelections": {}, "statsPerTeam": {"allTeamsStats": {"team0001": {"ACTIVE": {"statsMap": {"_2010": {"object2": [{"scipId": "2010#2130#-1", "sv": "9", "av": 9, "fpts": 27}, {"scipId": "2010#2090#-1", "sv": "16", "av": 16, "fpts": 32}, {"scipId": "2010#2190#-1", "sv": "25", "av": 25, "fpts": 51}, {"scipId": "2010#2270#-1", "sv": "77", "av": 77, "fpts": 34.65}, {"scipId": "2010#2120#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2327#-1", "sv": "6", "av": 6, "fpts": 6}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "25", "av": 25, "fpts": 15}, {"scipId": "2010#2092#-1", "sv": "25", "av": 25, "fpts": 17.5}, {"scipId": "2010#2096#-1", "sv": "50", "av": 50, "fpts": 15}, {"scipId": "2010#2095#-1", "sv": "72", "av": 72, "fpts": -19.44}], "object1": 180.71}, "_2020": {"object2": [{"scipId": "2020#231b#-1", "sv": "1", "av": 1, "fpts": 5}, {"scipId": "2020#2140#-1", "sv": "9", "av": 9, "fpts": -22.5}, {"scipId": "2020#2230#-1", "sv": "74", "av": 74, "fpts": 44.4}], "object1": 26.9}, "03rf5": {"object2": [{"scipId": "2010#2130#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2090#-1", "sv": "2", "av": 2, "fpts": 4}, {"scipId": "2010#2190#-1", "sv": "3", "av": 3, "fpts": 9}, {"scipId": "2010#2270#-1", "sv": "9", "av": 9, "fpts": 4.05}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "1", "av": 1, "fpts": 0.6}, {"scipId": "2010#2092#-1", "sv": "3", "av": 3, "fpts": 2.1}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 22.75}, "03mn8": {"object2": [{"scipId": "2010#2130#-1", "sv": "2", "av": 2, "fpts": 6}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2190#-1", "sv": "3", "av": 3, "fpts": 4.5}, {"scipId": "2010#2270#-1", "sv": "4", "av": 4, "fpts": 1.8}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2092#-1", "sv": "3", "av": 3, "fpts": 2.1}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 17.4}, "048xc": {"object2": [{"scipId": "2010#2130#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2190#-1", "sv": "2", "av": 2, "fpts": 3}, {"scipId": "2010#2270#-1", "sv": "8", "av": 8, "fpts": 3.6}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "2", "av": 2, "fpts": 1.2}, {"scipId": "2010#2092#-1", "sv": "2", "av": 2, "fpts": 1.4}, {"scipId": "2010#2096#-1", "sv": "19", "av": 19, "fpts": 5.7}, {"scipId": "2010#2095#-1", "sv": "15", "av": 15, "fpts": -4.05}], "object1": 16.85}, "0322w": {"object2": [{"scipId": "2020#231b#-1", "sv": "1", "av": 1, "fpts": 5}, {"scipId": "2020#232c#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2140#-1", "sv": "2", "av": 2, "fpts": -5}, {"scipId": "2020#2230#-1", "sv": "24", "av": 24, "fpts": 14.4}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 14.4}}, "projectedTotalsMap": {"03rf5": 16.44, "03mn8": 17.79, "048xc": 31.42, "0322w": 23.07}, "totalFpts": 207.61}}, "team0002": {"ACTIVE": {"statsMap": {"_2010": {"object2": [{"scipId": "2010#2130#-1", "sv": "10", "av": 10, "fpts": 30}, {"scipId": "2010#2090#-1", "sv": "24", "av": 24, "fpts": 48}, {"scipId": "2010#2190#-1", "sv": "34", "av": 34, "fpts": 67.5}, {"scipId": "2010#2270#-1", "sv": "72", "av": 72, "fpts": 32.4}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "10", "av": 10, "fpts": 10}, {"scipId": "2010#2344#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2145#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2147#-1", "sv": "42", "av": 42, "fpts": 25.2}, {"scipId": "2010#2092#-1", "sv": "30", "av": 30, "fpts": 21}, {"scipId": "2010#2096#-1", "sv": "110", "av": 110, "fpts": 33}, {"scipId": "2010#2095#-1", "sv": "95", "av": 95, "fpts": -25.65}], "object1": 246.45}, "_2020": {"object2": [{"scipId": "2020#231b#-1", "sv": "2", "av": 2, "fpts": 10}, {"scipId": "2020#232c#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2020#2140#-1", "sv": "9", "av": 9, "fpts": -22.5}, {"scipId": "2020#2230#-1", "sv": "88", "av": 88, "fpts": 52.8}], "object1": 41.3}, "04lbz": {"object2": [{"scipId": "2010#2130#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2090#-1", "sv": "5", "av": 5, "fpts": 10}, {"scipId": "2010#2190#-1", "sv": "5", "av": 5, "fpts": 15}, {"scipId": "2010#2270#-1", "sv": "7", "av": 7, "fpts": 3.15}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "2", "av": 2, "fpts": 2}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2092#-1", "sv": "1", "av": 1, "fpts": 0.7}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 30.85}, "01zvf": {"object2": [{"scipId": "2010#2130#-1", "sv": "3", "av": 3, "fpts": 9}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2190#-1", "sv": "4", "av": 4, "fpts": 6}, {"scipId": "2010#2270#-1", "sv": "5", "av": 5, "fpts": 2.25}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2147#-1", "sv": "1", "av": 1, "fpts": 0.6}, {"scipId": "2010#2092#-1", "sv": "1", "av": 1, "fpts": 0.7}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 24.55}, "01f6d": {"object2": [{"scipId": "2010#2130#-1", "sv": "2", "av": 2, "fpts": 6}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2190#-1", "sv": "3", "av": 3, "fpts": 4.5}, {"scipId": "2010#2270#-1", "sv": "6", "av": 6, "fpts": 2.7}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2092#-1", "sv": "1", "av": 1, "fpts": 0.7}, {"scipId": "2010#2096#-1", "sv": "23", "av": 23, "fpts": 6.9}, {"scipId": "2010#2095#-1", "sv": "13", "av": 13, "fpts": -3.51}], "object1": 22.29}, "01zs1": {"object2": [{"scipId": "2020#231b#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#232c#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2020#2140#-1", "sv": "2", "av": 2, "fpts": -5}, {"scipId": "2020#2230#-1", "sv": "20", "av": 20, "fpts": 12}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 8}}, "projectedTotalsMap": {"04lbz": 30.45, "01zvf": 27.04, "01f6d": 26.09, "01zs1": 8.57}, "totalFpts": 287.75}}}, "statsMap": {"team0001": {"ACTIVE": {"statsMap": {"_2010": {"object2": [{"scipId": "2010#2130#-1", "sv": "9", "av": 9, "fpts": 27}, {"scipId": "2010#2090#-1", "sv": "16", "av": 16, "fpts": 32}, {"scipId": "2010#2190#-1", "sv": "25", "av": 25, "fpts": 51}, {"scipId": "2010#2270#-1", "sv": "77", "av": 77, "fpts": 34.65}, {"scipId": "2010#2120#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2327#-1", "sv": "6", "av": 6, "fpts": 6}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "25", "av": 25, "fpts": 15}, {"scipId": "2010#2092#-1", "sv": "25", "av": 25, "fpts": 17.5}, {"scipId": "2010#2096#-1", "sv": "50", "av": 50, "fpts": 15}, {"scipId": "2010#2095#-1", "sv": "72", "av": 72, "fpts": -19.44}], "object1": 180.71}, "_2020": {"object2": [{"scipId": "2020#231b#-1", "sv": "1", "av": 1, "fpts": 5}, {"scipId": "2020#2140#-1", "sv": "9", "av": 9, "fpts": -22.5}, {"scipId": "2020#2230#-1", "sv": "74", "av": 74, "fpts": 44.4}], "object1": 26.9}, "03rf5": {"object2": [{"scipId": "2010#2130#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2090#-1", "sv": "2", "av": 2, "fpts": 4}, {"scipId": "2010#2190#-1", "sv": "3", "av": 3, "fpts": 9}, {"scipId": "2010#2270#-1", "sv": "9", "av": 9, "fpts": 4.05}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "1", "av": 1, "fpts": 0.6}, {"scipId": "2010#2092#-1", "sv": "3", "av": 3, "fpts": 2.1}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 22.75}, "03mn8": {"object2": [{"scipId": "2010#2130#-1", "sv": "2", "av": 2, "fpts": 6}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2190#-1", "sv": "3", "av": 3, "fpts": 4.5}, {"scipId": "2010#2270#-1", "sv": "4", "av": 4, "fpts": 1.8}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2092#-1", "sv": "3", "av": 3, "fpts": 2.1}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 17.4}, "048xc": {"object2": [{"scipId": "2010#2130#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2190#-1", "sv": "2", "av": 2, "fpts": 3}, {"scipId": "2010#2270#-1", "sv": "8", "av": 8, "fpts": 3.6}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "2", "av": 2, "fpts": 1.2}, {"scipId": "2010#2092#-1", "sv": "2", "av": 2, "fpts": 1.4}, {"scipId": "2010#2096#-1", "sv": "19", "av": 19, "fpts": 5.7}, {"scipId": "2010#2095#-1", "sv": "15", "av": 15, "fpts": -4.05}], "object1": 16.85}, "0322w": {"object2": [{"scipId": "2020#231b#-1", "sv": "1", "av": 1, "fpts": 5}, {"scipId": "2020#232c#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2140#-1", "sv": "2", "av": 2, "fpts": -5}, {"scipId": "2020#2230#-1", "sv": "24", "av": 24, "fpts": 14.4}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 14.4}}, "projectedTotalsMap": {"03rf5": 16.44, "03mn8": 17.79, "048xc": 31.42, "0322w": 23.07}, "totalFpts": 207.61}}, "team0002": {"ACTIVE": {"statsMap": {"_2010": {"object2": [{"scipId": "2010#2130#-1", "sv": "10", "av": 10, "fpts": 30}, {"scipId": "2010#2090#-1", "sv": "24", "av": 24, "fpts": 48}, {"scipId": "2010#2190#-1", "sv": "34", "av": 34, "fpts": 67.5}, {"scipId": "2010#2270#-1", "sv": "72", "av": 72, "fpts": 32.4}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "10", "av": 10, "fpts": 10}, {"scipId": "2010#2344#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2145#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2147#-1", "sv": "42", "av": 42, "fpts": 25.2}, {"scipId": "2010#2092#-1", "sv": "30", "av": 30, "fpts": 21}, {"scipId": "2010#2096#-1", "sv": "110", "av": 110, "fpts": 33}, {"scipId": "2010#2095#-1", "sv": "95", "av": 95, "fpts": -25.65}], "object1": 246.45}, "_2020": {"object2": [{"scipId": "2020#231b#-1", "sv": "2", "av": 2, "fpts": 10}, {"scipId": "2020#232c#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2020#2140#-1", "sv": "9", "av": 9, "fpts": -22.5}, {"scipId": "2020#2230#-1", "sv": "88", "av": 88, "fpts": 52.8}], "object1": 41.3}, "04lbz": {"object2": [{"scipId": "2010#2130#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2090#-1", "sv": "5", "av": 5, "fpts": 10}, {"scipId": "2010#2190#-1", "sv": "5", "av": 5, "fpts": 15}, {"scipId": "2010#2270#-1", "sv": "7", "av": 7, "fpts": 3.15}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "2", "av": 2, "fpts": 2}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2092#-1", "sv": "1", "av": 1, "fpts": 0.7}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 30.85}, "01zvf": {"object2": [{"scipId": "2010#2130#-1", "sv": "3", "av": 3, "fpts": 9}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2190#-1", "sv": "4", "av": 4, "fpts": 6}, {"scipId": "2010#2270#-1", "sv": "5", "av": 5, "fpts": 2.25}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2147#-1", "sv": "1", "av": 1, "fpts": 0.6}, {"scipId": "2010#2092#-1", "sv": "1", "av": 1, "fpts": 0.7}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 24.55}, "01f6d": {"object2": [{"scipId": "2010#2130#-1", "sv": "2", "av": 2, "fpts": 6}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2190#-1", "sv": "3", "av": 3, "fpts": 4.5}, {"scipId": "2010#2270#-1", "sv": "6", "av": 6, "fpts": 2.7}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2092#-1", "sv": "1", "av": 1, "fpts": 0.7}, {"scipId": "2010#2096#-1", "sv": "23", "av": 23, "fpts": 6.9}, {"scipId": "2010#2095#-1", "sv": "13", "av": 13, "fpts": -3.51}], "object1": 22.29}, "01zs1": {"object2": [{"scipId": "2020#231b#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#232c#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2020#2140#-1", "sv": "2", "av": 2, "fpts": -5}, {"scipId": "2020#2230#-1", "sv": "20", "av": 20, "fpts": 12}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 8}}, "projectedTotalsMap": {"04lbz": 30.45, "01zvf": 27.04, "01f6d": 26.09, "01zs1": 8.57}, "totalFpts": 287.75}}}, "delta": false, "refresh": false}};
export const LIVE_PAST = {"allEventsFinished": true, "scoringCategoriesPerGroup": {"2010": [{"id": "2010#2130#-1", "name": "Goals", "shortName": "G", "tinyName": "G", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "G"}, {"id": "2010#2090#-1", "name": "Assists", "shortName": "A", "tinyName": "A", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "A"}, {"id": "2010#2190#-1", "name": "Points", "shortName": "Pt", "tinyName": "Pt", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "Pt"}, {"id": "2010#2270#-1", "name": "Shots on Goal", "shortName": "SOG", "tinyName": "SOG", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "SOG"}, {"id": "2010#2120#-1", "name": "Game-winning Goals", "shortName": "GWG", "tinyName": "GWG", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "GWG"}, {"id": "2010#2327#-1", "name": "Power Play Points", "shortName": "PPP", "tinyName": "PPP", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "PPP"}, {"id": "2010#2344#-1", "name": "Short-Handed Points", "shortName": "SHP", "tinyName": "SHP", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "SHP"}, {"id": "2010#2145#-1", "name": "Hat Tricks", "shortName": "HT", "tinyName": "HT", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "HT"}, {"id": "2010#2147#-1", "name": "Hits", "shortName": "Hit", "tinyName": "Hit", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "Hit"}, {"id": "2010#2092#-1", "name": "Blocks", "shortName": "Blk", "tinyName": "Blk", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "Blk"}, {"id": "2010#2096#-1", "name": "Faceoffs Won", "shortName": "FOW", "tinyName": "FOW", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "FOW"}, {"id": "2010#2095#-1", "name": "Faceoffs Lost", "shortName": "FOL", "tinyName": "FOL", "sortDirection": -1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "FOL"}], "2020": [{"id": "2020#231b#-1", "name": "Wins (Goalies only)", "shortName": "W", "tinyName": "W", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "W"}, {"id": "2020#232c#-1", "name": "Overtime Losses + Shootout Losses", "shortName": "OL+ShL", "tinyName": "OL+ShL", "sortDirection": -1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "OL+ShL"}, {"id": "2020#2140#-1", "name": "Goals Against", "shortName": "GA", "tinyName": "GA", "sortDirection": -1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "GA"}, {"id": "2020#2230#-1", "name": "Saves", "shortName": "SV", "tinyName": "SV", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "SV"}, {"id": "2020#2290#-1", "name": "Shutouts", "shortName": "SHO", "tinyName": "SHO", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "SHO"}, {"id": "2020#2090#-1", "name": "Assists", "shortName": "A", "tinyName": "A", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "A"}]}, "scoringCategoryGroups": [{"id": "2010", "name": "Skaters", "shortName": "Skt", "description": "Skaters"}, {"id": "2020", "name": "Goalies", "shortName": "Goal", "description": "Goalies"}], "miscData": {"pointsBased": true, "scipIdsCounted": ["2010#2327#-1", "2010#2190#-1", "2020#2290#-1", "2020#231b#-1", "2010#2120#-1", "2020#2090#-1", "2010#2145#-1", "2010#2270#-1", "2010#2092#-1", "2010#2147#-1", "2010#2344#-1", "2010#2090#-1", "2020#2140#-1", "2020#232c#-1", "2010#2096#-1", "2010#2095#-1", "2020#2230#-1", "2010#2130#-1"], "showProjections": true}, "displayedSelections": {"period": 2, "viewType": {"id": "2", "name": "Period"}, "viewTypeId": "2", "realOrStatProjProvider": {"id": "-1", "name": "NFL", "shortName": "NFL"}, "playerViewType": {"id": "1", "name": "Active Players Playing"}, "layout": "STANDARD"}, "standingsTable": {"standingsHeader": {"cells": [{"sortDirection": 1, "name": "Fantasy Points", "shortName": "FPts", "key": "score"}, {"sortDirection": 1, "name": "The change (green up, red down) in fantasy points from the previous game day", "shortName": "+/-", "key": "diff"}, {"sortDirection": 1, "name": "Projected fantasy points", "shortName": "Proj", "key": "proj"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2130#-1", "scipId": "2010#2130#-1", "sortType": "SCORING_CATEGORY", "name": "Goals", "width": 3, "shortName": "G", "key": "2010#2130#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2090#-1", "scipId": "2010#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3, "shortName": "A", "key": "2010#2090#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2190#-1", "scipId": "2010#2190#-1", "sortType": "SCORING_CATEGORY", "name": "Points -- Goals + Assists", "width": 3, "shortName": "Pt", "key": "2010#2190#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2270#-1", "scipId": "2010#2270#-1", "sortType": "SCORING_CATEGORY", "name": "Shots on Goal", "width": 3, "shortName": "SOG", "key": "2010#2270#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2120#-1", "scipId": "2010#2120#-1", "sortType": "SCORING_CATEGORY", "name": "Game-winning Goals", "width": 3, "shortName": "GWG", "key": "2010#2120#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2327#-1", "scipId": "2010#2327#-1", "sortType": "SCORING_CATEGORY", "name": "Power Play Points", "width": 3, "shortName": "PPP", "key": "2010#2327#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2344#-1", "scipId": "2010#2344#-1", "sortType": "SCORING_CATEGORY", "name": "Short-Handed Points", "width": 3, "shortName": "SHP", "key": "2010#2344#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2145#-1", "scipId": "2010#2145#-1", "sortType": "SCORING_CATEGORY", "name": "Hat Tricks -- Three or more goals in a game", "width": 3, "shortName": "HT", "key": "2010#2145#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2147#-1", "scipId": "2010#2147#-1", "sortType": "SCORING_CATEGORY", "name": "Hits", "width": 3, "shortName": "Hit", "key": "2010#2147#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2092#-1", "scipId": "2010#2092#-1", "sortType": "SCORING_CATEGORY", "name": "Blocks -- A player blocks a shot by an opposing shooter.", "width": 3, "shortName": "Blk", "key": "2010#2092#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2096#-1", "scipId": "2010#2096#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Won", "width": 3, "shortName": "FOW", "key": "2010#2096#-1", "maxWidth": 3}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2010#2095#-1", "scipId": "2010#2095#-1", "sortType": "SCORING_CATEGORY", "name": "Faceoffs Lost", "width": 3, "shortName": "FOL", "key": "2010#2095#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#231b#-1", "scipId": "2020#231b#-1", "sortType": "SCORING_CATEGORY", "name": "Wins (Goalies only) -- Includes Overtime Wins and Shootout Wins. Skaters cannot get a win using this category - for that - use the \"regular\" Wins category.", "width": 3, "shortName": "W", "key": "2020#231b#-1", "maxWidth": 3}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#232c#-1", "scipId": "2020#232c#-1", "sortType": "SCORING_CATEGORY", "name": "Overtime Losses + Shootout Losses", "width": 6, "shortName": "OL+ShL", "key": "2020#232c#-1", "maxWidth": 6}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#2140#-1", "scipId": "2020#2140#-1", "sortType": "SCORING_CATEGORY", "name": "Goals Against", "width": 3, "shortName": "GA", "key": "2020#2140#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2230#-1", "scipId": "2020#2230#-1", "sortType": "SCORING_CATEGORY", "name": "Saves", "width": 3, "shortName": "SV", "key": "2020#2230#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2290#-1", "scipId": "2020#2290#-1", "sortType": "SCORING_CATEGORY", "name": "Shutouts", "width": 3, "shortName": "SHO", "key": "2020#2290#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2090#-1", "scipId": "2020#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3, "shortName": "A", "key": "2020#2090#-1", "maxWidth": 3}]}}, "statsPerTeam": {"allTeamsStats": {"team0001": {"ACTIVE": {"statsMap": {"_2010": {"object2": [{"scipId": "2010#2130#-1", "sv": "12", "av": 12, "fpts": 36}, {"scipId": "2010#2090#-1", "sv": "24", "av": 24, "fpts": 48}, {"scipId": "2010#2190#-1", "sv": "36", "av": 36, "fpts": 70.5}, {"scipId": "2010#2270#-1", "sv": "123", "av": 123, "fpts": 55.35}, {"scipId": "2010#2120#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2327#-1", "sv": "17", "av": 17, "fpts": 17}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "24", "av": 24, "fpts": 14.4}, {"scipId": "2010#2092#-1", "sv": "45", "av": 45, "fpts": 31.5}, {"scipId": "2010#2096#-1", "sv": "113", "av": 113, "fpts": 33.9}, {"scipId": "2010#2095#-1", "sv": "103", "av": 103, "fpts": -27.81}], "object1": 280.84}, "_2020": {"object2": [{"scipId": "2020#231b#-1", "sv": "2", "av": 2, "fpts": 10}, {"scipId": "2020#232c#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2140#-1", "sv": "11", "av": 11, "fpts": -27.5}, {"scipId": "2020#2230#-1", "sv": "71", "av": 71, "fpts": 42.6}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 25.1}, "02nq3": {"object2": [{"scipId": "2010#2130#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2090#-1", "sv": "3", "av": 3, "fpts": 6}, {"scipId": "2010#2190#-1", "sv": "4", "av": 4, "fpts": 12}, {"scipId": "2010#2270#-1", "sv": "8", "av": 8, "fpts": 3.6}, {"scipId": "2010#2120#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2327#-1", "sv": "3", "av": 3, "fpts": 3}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "1", "av": 1, "fpts": 0.6}, {"scipId": "2010#2092#-1", "sv": "1", "av": 1, "fpts": 0.7}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 30.9}, "03mn9": {"object2": [{"scipId": "2010#2130#-1", "sv": "2", "av": 2, "fpts": 6}, {"scipId": "2010#2090#-1", "sv": "3", "av": 3, "fpts": 6}, {"scipId": "2010#2190#-1", "sv": "5", "av": 5, "fpts": 7.5}, {"scipId": "2010#2270#-1", "sv": "9", "av": 9, "fpts": 4.05}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "2", "av": 2, "fpts": 1.2}, {"scipId": "2010#2092#-1", "sv": "2", "av": 2, "fpts": 1.4}, {"scipId": "2010#2096#-1", "sv": "4", "av": 4, "fpts": 1.2}, {"scipId": "2010#2095#-1", "sv": "3", "av": 3, "fpts": -0.81}], "object1": 27.54}, "04ad7": {"object2": [{"scipId": "2010#2130#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2090#-1", "sv": "2", "av": 2, "fpts": 4}, {"scipId": "2010#2190#-1", "sv": "2", "av": 2, "fpts": 6}, {"scipId": "2010#2270#-1", "sv": "8", "av": 8, "fpts": 3.6}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "2", "av": 2, "fpts": 1.2}, {"scipId": "2010#2092#-1", "sv": "13", "av": 13, "fpts": 9.1}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 24.9}, "0322w": {"object2": [{"scipId": "2020#231b#-1", "sv": "1", "av": 1, "fpts": 5}, {"scipId": "2020#232c#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2140#-1", "sv": "5", "av": 5, "fpts": -12.5}, {"scipId": "2020#2230#-1", "sv": "43", "av": 43, "fpts": 25.8}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 18.3}}, "projectedTotalsMap": {"02nq3": 23.18, "03mn9": 22.44, "04ad7": 22.81, "0322w": 22.24}, "totalFpts": 305.94}}, "team0002": {"ACTIVE": {"statsMap": {"_2010": {"object2": [{"scipId": "2010#2130#-1", "sv": "11", "av": 11, "fpts": 33}, {"scipId": "2010#2090#-1", "sv": "25", "av": 25, "fpts": 50}, {"scipId": "2010#2190#-1", "sv": "36", "av": 36, "fpts": 64.5}, {"scipId": "2010#2270#-1", "sv": "120", "av": 120, "fpts": 54}, {"scipId": "2010#2120#-1", "sv": "2", "av": 2, "fpts": 4}, {"scipId": "2010#2327#-1", "sv": "19", "av": 19, "fpts": 19}, {"scipId": "2010#2344#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "98", "av": 98, "fpts": 58.8}, {"scipId": "2010#2092#-1", "sv": "48", "av": 48, "fpts": 33.6}, {"scipId": "2010#2096#-1", "sv": "166", "av": 166, "fpts": 49.8}, {"scipId": "2010#2095#-1", "sv": "164", "av": 164, "fpts": -44.28}], "object1": 324.42}, "_2020": {"object2": [{"scipId": "2020#231b#-1", "sv": "2", "av": 2, "fpts": 10}, {"scipId": "2020#232c#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2020#2140#-1", "sv": "12", "av": 12, "fpts": -30}, {"scipId": "2020#2230#-1", "sv": "88", "av": 88, "fpts": 52.8}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "1", "av": 1, "fpts": 3.5}], "object1": 37.3}, "01zvf": {"object2": [{"scipId": "2010#2130#-1", "sv": "2", "av": 2, "fpts": 6}, {"scipId": "2010#2090#-1", "sv": "3", "av": 3, "fpts": 6}, {"scipId": "2010#2190#-1", "sv": "5", "av": 5, "fpts": 7.5}, {"scipId": "2010#2270#-1", "sv": "10", "av": 10, "fpts": 4.5}, {"scipId": "2010#2120#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2327#-1", "sv": "3", "av": 3, "fpts": 3}, {"scipId": "2010#2344#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "4", "av": 4, "fpts": 2.4}, {"scipId": "2010#2092#-1", "sv": "4", "av": 4, "fpts": 2.8}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "1", "av": 1, "fpts": -0.27}], "object1": 35.93}, "03167": {"object2": [{"scipId": "2010#2130#-1", "sv": "3", "av": 3, "fpts": 9}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2190#-1", "sv": "4", "av": 4, "fpts": 6}, {"scipId": "2010#2270#-1", "sv": "9", "av": 9, "fpts": 4.05}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "3", "av": 3, "fpts": 3}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "9", "av": 9, "fpts": 5.4}, {"scipId": "2010#2092#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2096#-1", "sv": "28", "av": 28, "fpts": 8.4}, {"scipId": "2010#2095#-1", "sv": "17", "av": 17, "fpts": -4.59}], "object1": 33.26}, "04lbz": {"object2": [{"scipId": "2010#2130#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2090#-1", "sv": "3", "av": 3, "fpts": 6}, {"scipId": "2010#2190#-1", "sv": "4", "av": 4, "fpts": 12}, {"scipId": "2010#2270#-1", "sv": "8", "av": 8, "fpts": 3.6}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "2", "av": 2, "fpts": 2}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "1", "av": 1, "fpts": 0.6}, {"scipId": "2010#2092#-1", "sv": "1", "av": 1, "fpts": 0.7}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 27.9}, "01zs1": {"object2": [{"scipId": "2020#231b#-1", "sv": "1", "av": 1, "fpts": 5}, {"scipId": "2020#232c#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2140#-1", "sv": "3", "av": 3, "fpts": -7.5}, {"scipId": "2020#2230#-1", "sv": "26", "av": 26, "fpts": 15.6}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 13.1}}, "projectedTotalsMap": {"01zvf": 18.85, "03167": 24.16, "04lbz": 21.52, "01zs1": 12.17}, "totalFpts": 361.72}}}, "statsMap": {"team0001": {"ACTIVE": {"statsMap": {"_2010": {"object2": [{"scipId": "2010#2130#-1", "sv": "12", "av": 12, "fpts": 36}, {"scipId": "2010#2090#-1", "sv": "24", "av": 24, "fpts": 48}, {"scipId": "2010#2190#-1", "sv": "36", "av": 36, "fpts": 70.5}, {"scipId": "2010#2270#-1", "sv": "123", "av": 123, "fpts": 55.35}, {"scipId": "2010#2120#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2327#-1", "sv": "17", "av": 17, "fpts": 17}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "24", "av": 24, "fpts": 14.4}, {"scipId": "2010#2092#-1", "sv": "45", "av": 45, "fpts": 31.5}, {"scipId": "2010#2096#-1", "sv": "113", "av": 113, "fpts": 33.9}, {"scipId": "2010#2095#-1", "sv": "103", "av": 103, "fpts": -27.81}], "object1": 280.84}, "_2020": {"object2": [{"scipId": "2020#231b#-1", "sv": "2", "av": 2, "fpts": 10}, {"scipId": "2020#232c#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2140#-1", "sv": "11", "av": 11, "fpts": -27.5}, {"scipId": "2020#2230#-1", "sv": "71", "av": 71, "fpts": 42.6}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 25.1}, "02nq3": {"object2": [{"scipId": "2010#2130#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2090#-1", "sv": "3", "av": 3, "fpts": 6}, {"scipId": "2010#2190#-1", "sv": "4", "av": 4, "fpts": 12}, {"scipId": "2010#2270#-1", "sv": "8", "av": 8, "fpts": 3.6}, {"scipId": "2010#2120#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2327#-1", "sv": "3", "av": 3, "fpts": 3}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "1", "av": 1, "fpts": 0.6}, {"scipId": "2010#2092#-1", "sv": "1", "av": 1, "fpts": 0.7}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 30.9}, "03mn9": {"object2": [{"scipId": "2010#2130#-1", "sv": "2", "av": 2, "fpts": 6}, {"scipId": "2010#2090#-1", "sv": "3", "av": 3, "fpts": 6}, {"scipId": "2010#2190#-1", "sv": "5", "av": 5, "fpts": 7.5}, {"scipId": "2010#2270#-1", "sv": "9", "av": 9, "fpts": 4.05}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "2", "av": 2, "fpts": 1.2}, {"scipId": "2010#2092#-1", "sv": "2", "av": 2, "fpts": 1.4}, {"scipId": "2010#2096#-1", "sv": "4", "av": 4, "fpts": 1.2}, {"scipId": "2010#2095#-1", "sv": "3", "av": 3, "fpts": -0.81}], "object1": 27.54}, "04ad7": {"object2": [{"scipId": "2010#2130#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2090#-1", "sv": "2", "av": 2, "fpts": 4}, {"scipId": "2010#2190#-1", "sv": "2", "av": 2, "fpts": 6}, {"scipId": "2010#2270#-1", "sv": "8", "av": 8, "fpts": 3.6}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "2", "av": 2, "fpts": 1.2}, {"scipId": "2010#2092#-1", "sv": "13", "av": 13, "fpts": 9.1}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 24.9}, "0322w": {"object2": [{"scipId": "2020#231b#-1", "sv": "1", "av": 1, "fpts": 5}, {"scipId": "2020#232c#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2140#-1", "sv": "5", "av": 5, "fpts": -12.5}, {"scipId": "2020#2230#-1", "sv": "43", "av": 43, "fpts": 25.8}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 18.3}}, "projectedTotalsMap": {"02nq3": 23.18, "03mn9": 22.44, "04ad7": 22.81, "0322w": 22.24}, "totalFpts": 305.94}}, "team0002": {"ACTIVE": {"statsMap": {"_2010": {"object2": [{"scipId": "2010#2130#-1", "sv": "11", "av": 11, "fpts": 33}, {"scipId": "2010#2090#-1", "sv": "25", "av": 25, "fpts": 50}, {"scipId": "2010#2190#-1", "sv": "36", "av": 36, "fpts": 64.5}, {"scipId": "2010#2270#-1", "sv": "120", "av": 120, "fpts": 54}, {"scipId": "2010#2120#-1", "sv": "2", "av": 2, "fpts": 4}, {"scipId": "2010#2327#-1", "sv": "19", "av": 19, "fpts": 19}, {"scipId": "2010#2344#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "98", "av": 98, "fpts": 58.8}, {"scipId": "2010#2092#-1", "sv": "48", "av": 48, "fpts": 33.6}, {"scipId": "2010#2096#-1", "sv": "166", "av": 166, "fpts": 49.8}, {"scipId": "2010#2095#-1", "sv": "164", "av": 164, "fpts": -44.28}], "object1": 324.42}, "_2020": {"object2": [{"scipId": "2020#231b#-1", "sv": "2", "av": 2, "fpts": 10}, {"scipId": "2020#232c#-1", "sv": "1", "av": 1, "fpts": 1}, {"scipId": "2020#2140#-1", "sv": "12", "av": 12, "fpts": -30}, {"scipId": "2020#2230#-1", "sv": "88", "av": 88, "fpts": 52.8}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "1", "av": 1, "fpts": 3.5}], "object1": 37.3}, "01zvf": {"object2": [{"scipId": "2010#2130#-1", "sv": "2", "av": 2, "fpts": 6}, {"scipId": "2010#2090#-1", "sv": "3", "av": 3, "fpts": 6}, {"scipId": "2010#2190#-1", "sv": "5", "av": 5, "fpts": 7.5}, {"scipId": "2010#2270#-1", "sv": "10", "av": 10, "fpts": 4.5}, {"scipId": "2010#2120#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2327#-1", "sv": "3", "av": 3, "fpts": 3}, {"scipId": "2010#2344#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "4", "av": 4, "fpts": 2.4}, {"scipId": "2010#2092#-1", "sv": "4", "av": 4, "fpts": 2.8}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "1", "av": 1, "fpts": -0.27}], "object1": 35.93}, "03167": {"object2": [{"scipId": "2010#2130#-1", "sv": "3", "av": 3, "fpts": 9}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 2}, {"scipId": "2010#2190#-1", "sv": "4", "av": 4, "fpts": 6}, {"scipId": "2010#2270#-1", "sv": "9", "av": 9, "fpts": 4.05}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "3", "av": 3, "fpts": 3}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "9", "av": 9, "fpts": 5.4}, {"scipId": "2010#2092#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2096#-1", "sv": "28", "av": 28, "fpts": 8.4}, {"scipId": "2010#2095#-1", "sv": "17", "av": 17, "fpts": -4.59}], "object1": 33.26}, "04lbz": {"object2": [{"scipId": "2010#2130#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2090#-1", "sv": "3", "av": 3, "fpts": 6}, {"scipId": "2010#2190#-1", "sv": "4", "av": 4, "fpts": 12}, {"scipId": "2010#2270#-1", "sv": "8", "av": 8, "fpts": 3.6}, {"scipId": "2010#2120#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "2", "av": 2, "fpts": 2}, {"scipId": "2010#2344#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2145#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2147#-1", "sv": "1", "av": 1, "fpts": 0.6}, {"scipId": "2010#2092#-1", "sv": "1", "av": 1, "fpts": 0.7}, {"scipId": "2010#2096#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2095#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 27.9}, "01zs1": {"object2": [{"scipId": "2020#231b#-1", "sv": "1", "av": 1, "fpts": 5}, {"scipId": "2020#232c#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2140#-1", "sv": "3", "av": 3, "fpts": -7.5}, {"scipId": "2020#2230#-1", "sv": "26", "av": 26, "fpts": 15.6}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 13.1}}, "projectedTotalsMap": {"01zvf": 18.85, "03167": 24.16, "04lbz": 21.52, "01zs1": 12.17}, "totalFpts": 361.72}}}, "delta": false, "refresh": false}};
export const LIVE_CURRENT_REQ = {"sppId": "-1", "teamId": "ALL", "layout": "STANDARD", "mainView": "MATCHUP", "mobileView": "MATCHUPS", "period": "3", "newView": true};
export const LIVE_POLL_REQ = {"sppId": "-1", "teamId": "ALL", "period": 3, "date": "2026-10-17", "viewType": "2", "playerViewType": "1", "newView": false, "arq": 1, "bgp": true};
export const LIVE_PAST_REQ = {"sppId": "-1", "teamId": "ALL", "layout": "STANDARD", "mainView": "MATCHUP", "mobileView": "MATCHUPS", "period": "2", "newView": true};
export const LIVE_TEST_ALL_TEAMS = {"allEventsFinished": true, "scoringCategoriesPerGroup": {"2010": [{"id": "2010#2130#-1", "name": "Goals", "shortName": "G", "tinyName": "G", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "G"}, {"id": "2010#2090#-1", "name": "Assists", "shortName": "A", "tinyName": "A", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "A"}, {"id": "2010#2170#-1", "name": "Penalty Minutes", "shortName": "PIM", "tinyName": "PIM", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "PIM"}, {"id": "2010#2270#-1", "name": "Shots on Goal", "shortName": "SOG", "tinyName": "SOG", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "SOG"}, {"id": "2010#2250#-1", "name": "Short-Handed Goals", "shortName": "SHG", "tinyName": "SHG", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "SHG"}, {"id": "2010#2327#-1", "name": "Power Play Points", "shortName": "PPP", "tinyName": "PPP", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "PPP"}], "2020": [{"id": "2020#231b#-1", "name": "Wins (Goalies only)", "shortName": "W", "tinyName": "W", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "W"}, {"id": "2020#2140#-1", "name": "Goals Against", "shortName": "GA", "tinyName": "GA", "sortDirection": -1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "GA"}, {"id": "2020#2230#-1", "name": "Saves", "shortName": "SV", "tinyName": "SV", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "SV"}, {"id": "2020#2290#-1", "name": "Shutouts", "shortName": "SHO", "tinyName": "SHO", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "SHO"}, {"id": "2020#2170#-1", "name": "Penalty Minutes", "shortName": "PIM", "tinyName": "PIM", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "PIM"}, {"id": "2020#2090#-1", "name": "Assists", "shortName": "A", "tinyName": "A", "sortDirection": 1, "tableHeading": {"name": "", "shortName": ""}, "ungroupedShortName": "A"}]}, "scoringCategoryGroups": [{"id": "2010", "name": "Skaters", "shortName": "Skt", "description": "Skaters"}, {"id": "2020", "name": "Goalies", "shortName": "Goal", "description": "Goalies"}], "miscData": {"pointsBased": true, "scipIdsCounted": ["2010#2327#-1", "2020#2170#-1", "2020#2290#-1", "2010#2090#-1", "2020#231b#-1", "2020#2140#-1", "2020#2090#-1", "2010#2170#-1", "2020#2230#-1", "2010#2250#-1", "2010#2130#-1", "2010#2270#-1"], "showProjections": true}, "displayedSelections": {"period": 2, "viewType": {"id": "2", "name": "Period"}, "viewTypeId": "2", "realOrStatProjProvider": {"id": "-1", "name": "NFL", "shortName": "NFL"}, "playerViewType": {"id": "1", "name": "Active Players Playing"}, "layout": "STANDARD"}, "standingsTable": {"standingsHeader": {"cells": [{"sortDirection": 1, "name": "Fantasy Points", "shortName": "FPts", "key": "score"}, {"sortDirection": 1, "name": "The change (green up, red down) in fantasy points from the previous game day", "shortName": "+/-", "key": "diff"}, {"sortDirection": 1, "name": "Projected fantasy points", "shortName": "Proj", "key": "proj"}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2130#-1", "scipId": "2010#2130#-1", "sortType": "SCORING_CATEGORY", "name": "Goals", "width": 3, "shortName": "G", "key": "2010#2130#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2090#-1", "scipId": "2010#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3, "shortName": "A", "key": "2010#2090#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2170#-1", "scipId": "2010#2170#-1", "sortType": "SCORING_CATEGORY", "name": "Penalty Minutes -- By default, this is a positive category (i.e. the more Penalty Minutes the better).", "width": 3, "shortName": "PIM", "key": "2010#2170#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2270#-1", "scipId": "2010#2270#-1", "sortType": "SCORING_CATEGORY", "name": "Shots on Goal", "width": 3, "shortName": "SOG", "key": "2010#2270#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2250#-1", "scipId": "2010#2250#-1", "sortType": "SCORING_CATEGORY", "name": "Short-Handed Goals", "width": 3, "shortName": "SHG", "key": "2010#2250#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2010#2327#-1", "scipId": "2010#2327#-1", "sortType": "SCORING_CATEGORY", "name": "Power Play Points", "width": 3, "shortName": "PPP", "key": "2010#2327#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#231b#-1", "scipId": "2020#231b#-1", "sortType": "SCORING_CATEGORY", "name": "Wins (Goalies only) -- Includes Overtime Wins and Shootout Wins. Skaters cannot get a win using this category - for that - use the \"regular\" Wins category.", "width": 3, "shortName": "W", "key": "2020#231b#-1", "maxWidth": 3}, {"sortDirection": -1, "sortKey": "SCORING_CATEGORY_2020#2140#-1", "scipId": "2020#2140#-1", "sortType": "SCORING_CATEGORY", "name": "Goals Against", "width": 3, "shortName": "GA", "key": "2020#2140#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2230#-1", "scipId": "2020#2230#-1", "sortType": "SCORING_CATEGORY", "name": "Saves", "width": 3, "shortName": "SV", "key": "2020#2230#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2290#-1", "scipId": "2020#2290#-1", "sortType": "SCORING_CATEGORY", "name": "Shutouts", "width": 3, "shortName": "SHO", "key": "2020#2290#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2170#-1", "scipId": "2020#2170#-1", "sortType": "SCORING_CATEGORY", "name": "Penalty Minutes -- By default, this is a positive category (i.e. the more Penalty Minutes the better).", "width": 3, "shortName": "PIM", "key": "2020#2170#-1", "maxWidth": 3}, {"sortDirection": 1, "sortKey": "SCORING_CATEGORY_2020#2090#-1", "scipId": "2020#2090#-1", "sortType": "SCORING_CATEGORY", "name": "Assists", "width": 3, "shortName": "A", "key": "2020#2090#-1", "maxWidth": 3}]}}, "statsPerTeam": {"allTeamsStats": {"team0003": {"ACTIVE": {"statsMap": {"_2010": {"object2": [{"scipId": "2010#2130#-1", "sv": "6", "av": 6, "fpts": 24}, {"scipId": "2010#2090#-1", "sv": "12", "av": 12, "fpts": 36}, {"scipId": "2010#2170#-1", "sv": "18", "av": 18, "fpts": 9}, {"scipId": "2010#2270#-1", "sv": "78", "av": 78, "fpts": 39}, {"scipId": "2010#2250#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "6", "av": 6, "fpts": 6}], "object1": 114}, "_2020": {"object2": [{"scipId": "2020#231b#-1", "sv": "3", "av": 3, "fpts": 15}, {"scipId": "2020#2140#-1", "sv": "13", "av": 13, "fpts": -13}, {"scipId": "2020#2230#-1", "sv": "92", "av": 92, "fpts": 23}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2170#-1", "sv": "10", "av": 10, "fpts": 5}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 30}, "042t5": {"object2": [{"scipId": "2010#2130#-1", "sv": "2", "av": 2, "fpts": 8}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2170#-1", "sv": "2", "av": 2, "fpts": 1}, {"scipId": "2010#2270#-1", "sv": "21", "av": 21, "fpts": 10.5}, {"scipId": "2010#2250#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}], "object1": 23.5}, "03mn8": {"object2": [{"scipId": "2010#2130#-1", "sv": "1", "av": 1, "fpts": 4}, {"scipId": "2010#2090#-1", "sv": "2", "av": 2, "fpts": 6}, {"scipId": "2010#2170#-1", "sv": "2", "av": 2, "fpts": 1}, {"scipId": "2010#2270#-1", "sv": "9", "av": 9, "fpts": 4.5}, {"scipId": "2010#2250#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "2", "av": 2, "fpts": 2}], "object1": 17.5}, "048xc": {"object2": [{"scipId": "2010#2130#-1", "sv": "2", "av": 2, "fpts": 8}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2170#-1", "sv": "2", "av": 2, "fpts": 1}, {"scipId": "2010#2270#-1", "sv": "6", "av": 6, "fpts": 3}, {"scipId": "2010#2250#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 15}, "03rih": {"object2": [{"scipId": "2020#231b#-1", "sv": "2", "av": 2, "fpts": 10}, {"scipId": "2020#2140#-1", "sv": "7", "av": 7, "fpts": -7}, {"scipId": "2020#2230#-1", "sv": "64", "av": 64, "fpts": 16}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2170#-1", "sv": "10", "av": 10, "fpts": 5}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 24}}, "projectedTotalsMap": {"042t5": 16.56, "03mn8": 15.16, "048xc": 16.24, "03rih": 11.71}, "totalFpts": 144}}, "team0004": {"ACTIVE": {"statsMap": {"_2010": {"object2": [{"scipId": "2010#2130#-1", "sv": "9", "av": 9, "fpts": 36}, {"scipId": "2010#2090#-1", "sv": "13", "av": 13, "fpts": 39}, {"scipId": "2010#2170#-1", "sv": "14", "av": 14, "fpts": 7}, {"scipId": "2010#2270#-1", "sv": "57", "av": 57, "fpts": 28.5}, {"scipId": "2010#2250#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "8", "av": 8, "fpts": 8}], "object1": 118.5}, "_2020": {"object2": [{"scipId": "2020#231b#-1", "sv": "2", "av": 2, "fpts": 10}, {"scipId": "2020#2140#-1", "sv": "14", "av": 14, "fpts": -14}, {"scipId": "2020#2230#-1", "sv": "149", "av": 149, "fpts": 37.25}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2170#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 33.25}, "02yjj": {"object2": [{"scipId": "2010#2130#-1", "sv": "3", "av": 3, "fpts": 12}, {"scipId": "2010#2090#-1", "sv": "5", "av": 5, "fpts": 15}, {"scipId": "2010#2170#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2270#-1", "sv": "10", "av": 10, "fpts": 5}, {"scipId": "2010#2250#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "3", "av": 3, "fpts": 3}], "object1": 35}, "06hcw": {"object2": [{"scipId": "2010#2130#-1", "sv": "2", "av": 2, "fpts": 8}, {"scipId": "2010#2090#-1", "sv": "2", "av": 2, "fpts": 6}, {"scipId": "2010#2170#-1", "sv": "6", "av": 6, "fpts": 3}, {"scipId": "2010#2270#-1", "sv": "9", "av": 9, "fpts": 4.5}, {"scipId": "2010#2250#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "2", "av": 2, "fpts": 2}], "object1": 23.5}, "03kra": {"object2": [{"scipId": "2010#2130#-1", "sv": "3", "av": 3, "fpts": 12}, {"scipId": "2010#2090#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2170#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2270#-1", "sv": "13", "av": 13, "fpts": 6.5}, {"scipId": "2010#2250#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 18.5}, "031pl": {"object2": [{"scipId": "2020#231b#-1", "sv": "1", "av": 1, "fpts": 5}, {"scipId": "2020#2140#-1", "sv": "7", "av": 7, "fpts": -7}, {"scipId": "2020#2230#-1", "sv": "63", "av": 63, "fpts": 15.75}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2170#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 13.75}}, "projectedTotalsMap": {"02yjj": 16.39, "06hcw": 14.7, "03kra": 17.76, "031pl": 10.97}, "totalFpts": 151.75}}}, "statsMap": {"team0003": {"ACTIVE": {"statsMap": {"_2010": {"object2": [{"scipId": "2010#2130#-1", "sv": "6", "av": 6, "fpts": 24}, {"scipId": "2010#2090#-1", "sv": "12", "av": 12, "fpts": 36}, {"scipId": "2010#2170#-1", "sv": "18", "av": 18, "fpts": 9}, {"scipId": "2010#2270#-1", "sv": "78", "av": 78, "fpts": 39}, {"scipId": "2010#2250#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "6", "av": 6, "fpts": 6}], "object1": 114}, "_2020": {"object2": [{"scipId": "2020#231b#-1", "sv": "3", "av": 3, "fpts": 15}, {"scipId": "2020#2140#-1", "sv": "13", "av": 13, "fpts": -13}, {"scipId": "2020#2230#-1", "sv": "92", "av": 92, "fpts": 23}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2170#-1", "sv": "10", "av": 10, "fpts": 5}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 30}, "042t5": {"object2": [{"scipId": "2010#2130#-1", "sv": "2", "av": 2, "fpts": 8}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2170#-1", "sv": "2", "av": 2, "fpts": 1}, {"scipId": "2010#2270#-1", "sv": "21", "av": 21, "fpts": 10.5}, {"scipId": "2010#2250#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "1", "av": 1, "fpts": 1}], "object1": 23.5}, "03mn8": {"object2": [{"scipId": "2010#2130#-1", "sv": "1", "av": 1, "fpts": 4}, {"scipId": "2010#2090#-1", "sv": "2", "av": 2, "fpts": 6}, {"scipId": "2010#2170#-1", "sv": "2", "av": 2, "fpts": 1}, {"scipId": "2010#2270#-1", "sv": "9", "av": 9, "fpts": 4.5}, {"scipId": "2010#2250#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "2", "av": 2, "fpts": 2}], "object1": 17.5}, "048xc": {"object2": [{"scipId": "2010#2130#-1", "sv": "2", "av": 2, "fpts": 8}, {"scipId": "2010#2090#-1", "sv": "1", "av": 1, "fpts": 3}, {"scipId": "2010#2170#-1", "sv": "2", "av": 2, "fpts": 1}, {"scipId": "2010#2270#-1", "sv": "6", "av": 6, "fpts": 3}, {"scipId": "2010#2250#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 15}, "03rih": {"object2": [{"scipId": "2020#231b#-1", "sv": "2", "av": 2, "fpts": 10}, {"scipId": "2020#2140#-1", "sv": "7", "av": 7, "fpts": -7}, {"scipId": "2020#2230#-1", "sv": "64", "av": 64, "fpts": 16}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2170#-1", "sv": "10", "av": 10, "fpts": 5}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 24}}, "projectedTotalsMap": {"042t5": 16.56, "03mn8": 15.16, "048xc": 16.24, "03rih": 11.71}, "totalFpts": 144}}, "team0004": {"ACTIVE": {"statsMap": {"_2010": {"object2": [{"scipId": "2010#2130#-1", "sv": "9", "av": 9, "fpts": 36}, {"scipId": "2010#2090#-1", "sv": "13", "av": 13, "fpts": 39}, {"scipId": "2010#2170#-1", "sv": "14", "av": 14, "fpts": 7}, {"scipId": "2010#2270#-1", "sv": "57", "av": 57, "fpts": 28.5}, {"scipId": "2010#2250#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "8", "av": 8, "fpts": 8}], "object1": 118.5}, "_2020": {"object2": [{"scipId": "2020#231b#-1", "sv": "2", "av": 2, "fpts": 10}, {"scipId": "2020#2140#-1", "sv": "14", "av": 14, "fpts": -14}, {"scipId": "2020#2230#-1", "sv": "149", "av": 149, "fpts": 37.25}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2170#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 33.25}, "02yjj": {"object2": [{"scipId": "2010#2130#-1", "sv": "3", "av": 3, "fpts": 12}, {"scipId": "2010#2090#-1", "sv": "5", "av": 5, "fpts": 15}, {"scipId": "2010#2170#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2270#-1", "sv": "10", "av": 10, "fpts": 5}, {"scipId": "2010#2250#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "3", "av": 3, "fpts": 3}], "object1": 35}, "06hcw": {"object2": [{"scipId": "2010#2130#-1", "sv": "2", "av": 2, "fpts": 8}, {"scipId": "2010#2090#-1", "sv": "2", "av": 2, "fpts": 6}, {"scipId": "2010#2170#-1", "sv": "6", "av": 6, "fpts": 3}, {"scipId": "2010#2270#-1", "sv": "9", "av": 9, "fpts": 4.5}, {"scipId": "2010#2250#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "2", "av": 2, "fpts": 2}], "object1": 23.5}, "03kra": {"object2": [{"scipId": "2010#2130#-1", "sv": "3", "av": 3, "fpts": 12}, {"scipId": "2010#2090#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2170#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2270#-1", "sv": "13", "av": 13, "fpts": 6.5}, {"scipId": "2010#2250#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2010#2327#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 18.5}, "031pl": {"object2": [{"scipId": "2020#231b#-1", "sv": "1", "av": 1, "fpts": 5}, {"scipId": "2020#2140#-1", "sv": "7", "av": 7, "fpts": -7}, {"scipId": "2020#2230#-1", "sv": "63", "av": 63, "fpts": 15.75}, {"scipId": "2020#2290#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2170#-1", "sv": "0", "av": 0, "fpts": 0}, {"scipId": "2020#2090#-1", "sv": "0", "av": 0, "fpts": 0}], "object1": 13.75}}, "projectedTotalsMap": {"02yjj": 16.39, "06hcw": 14.7, "03kra": 17.76, "031pl": 10.97}, "totalFpts": 151.75}}}, "delta": false, "refresh": false}};
export const LIVE_TEST_ALL_TEAMS_REQ = {"sppId": "-1", "mainView": "ALL_TEAMS", "layout": "STANDARD", "mode": "sv", "mobileView": "MATCHUPS", "period": "2", "newView": true};
// Projected mode (test league, period 1, sppId "0"), live 2026-10-17: one team's rows. The rows pass the exact check
// (projected fpts add up too), so only the sppId / provider gate keeps Peri out (projections carry no faceoff losses).
export const LIVE_TEST_PROJECTED_REQ = { sppId: '0', layout: 'STANDARD', mainView: 'ALL_TEAMS', mobileView: 'MATCHUPS', period: '1', newView: true };
export const LIVE_TEST_PROJECTED = {
  scoringCategoriesPerGroup: LIVE_TEST_ALL_TEAMS.scoringCategoriesPerGroup,
  miscData: LIVE_TEST_ALL_TEAMS.miscData,
  standingsTable: LIVE_TEST_ALL_TEAMS.standingsTable,
  displayedSelections: { period: 1, realOrStatProjProvider: { id: '0', name: 'Projected', shortName: 'Proj' } },
  statsPerTeam: { delta: false, refresh: false, statsMap: { team0005: { ACTIVE: { statsMap: {
    _2010: { object2: [{ scipId: '2010#2130#-1', sv: '5', av: 5.262, fpts: 21.05 }, { scipId: '2010#2090#-1', sv: '10', av: 9.58, fpts: 28.74 }, { scipId: '2010#2170#-1', sv: '8', av: 7.892, fpts: 3.95 }, { scipId: '2010#2270#-1', sv: '40', av: 40.312, fpts: 20.16 }, { scipId: '2010#2250#-1', sv: '0', av: 0.033, fpts: 0.07 }, { scipId: '2010#2327#-1', sv: '4', av: 4.163, fpts: 4.16 }], object1: 78.12 },
    _2020: { object2: [{ scipId: '2020#231b#-1', sv: '2', av: 2.18, fpts: 10.9 }, { scipId: '2020#2140#-1', sv: '11', av: 10.614, fpts: -10.61 }, { scipId: '2020#2230#-1', sv: '88', av: 88.236, fpts: 22.06 }, { scipId: '2020#2290#-1', sv: '0', av: 0.169, fpts: 0.85 }, { scipId: '2020#2170#-1', sv: '0', av: 0, fpts: 0 }, { scipId: '2020#2090#-1', sv: '0', av: 0, fpts: 0 }], object1: 23.19 },
    '05r1c': { object2: [{ scipId: '2010#2130#-1', sv: '0.68', av: 0.675, fpts: 2.7 }, { scipId: '2010#2090#-1', sv: '0.94', av: 0.936, fpts: 2.81 }, { scipId: '2010#2170#-1', sv: '1.04', av: 1.045, fpts: 0.52 }, { scipId: '2010#2270#-1', sv: '4', av: 4.004, fpts: 2 }, { scipId: '2010#2250#-1', sv: '0', av: 0, fpts: 0 }, { scipId: '2010#2327#-1', sv: '0.46', av: 0.457, fpts: 0.46 }], object1: 8.49 },
  } } } } },
};
LIVE_TEST_PROJECTED.statsPerTeam.allTeamsStats = JSON.parse(JSON.stringify(LIVE_TEST_PROJECTED.statsPerTeam.statsMap));

// Team Roster, Trends (OVERVIEW), own team, lineup day period 19, live games under way; the page's own responses as
// Fantrax sent them (2026-10-17 ~16:00 CT, our league): FIRST = the first render (lookup not answered yet: "loading"),
// LATER = a later render of the same request (values from LOOKUP, the Tracked STATS lookup of that request). Every row
// kept (30 + Totals skaters, 7 + Totals goalies); scorer / row fields cut to what the script reads, no fantasy-team ids.
export const ROSTER_TRENDS_LIVE_FIRST = {"displayedSelections":{"displayedStatsType":"1","displayedPeriod":19,"adminMode":false,"displayedView":"OVERVIEW","lineupChangeSystem":"EASY_CLICK","displayedStartDate":1790654400000,"displayedScoringCategoryType":"5","displayedSeasonOrProjection":{"code":"SEASON_31n_BY_PERIOD","endDate":1807415999000,"name":"2026-27 Reg Season - Period","showGoBackDays":true,"shortName":"2026-27 Reg - Period","timeframeTypeCode":"BY_PERIOD","startDate":1790654400000},"displayedEndDate":1792209600000},"tables":[{"scGroup":"2010","header":{"cells":[{"sortDirection":1,"name":"Position rank â¢ Overall rank","width":9,"shortName":"Rk","key":"rankPosOv"},{"sortDirection":1,"sortKey":"AGE","sortType":"AGE","name":"Age","width":3,"shortName":"Age","key":"age"},{"eventStr":true,"sortDirection":1,"name":"Opponent","shortName":"Opp","key":"opponent"},{"sortDirection":1,"sortKey":"SCORE","sortType":"SCORE","name":"Fantasy Points","shortName":"FPts","key":"fpts"},{"sortDirection":1,"sortKey":"FPTS_PER_GAME","sortType":"FPTS_PER_GAME","name":"Average Fantasy Points per Game","shortName":"FP/G","key":"fptsPerGame"},{"sortDirection":1,"sortKey":"OVERVIEW_PERCENT_OWNED_2","sortType":"OVERVIEW_PERCENT_OWNED_2","name":"% of Fantrax leagues that have this player on their roster this week","shortName":"Ros"},{"sortDirection":1,"sortKey":"OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2","sortType":"OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2","name":"Change in percent Rostered from previous week","shortName":"+/-"},{"sortDirection":1,"sortKey":"OVERVIEW_PERCENT_ACTIVE_2","sortType":"OVERVIEW_PERCENT_ACTIVE_2","name":"% of leagues that have this player starting, i.e. in an active slot this week","shortName":"Act"},{"sortDirection":1,"sortKey":"OVERVIEW_PLUS_MINUS_PERCENT_ACTIVE_2","sortType":"OVERVIEW_PLUS_MINUS_PERCENT_ACTIVE_2","name":"Change in percent active from previous week","shortName":"+/-"},{"sortDirection":1,"sortKey":"OVERVIEW_PERCENT_DRAFTED","sortType":"OVERVIEW_PERCENT_DRAFTED","name":"Drafted","shortName":"%D"},{"sortDirection":1,"sortKey":"OVERVIEW_AVG_DRAFT_POSITION","sortType":"OVERVIEW_AVG_DRAFT_POSITION","name":"Avg. Draft Position","shortName":"ADP"}]},"rows":[{"posId":"206","statusId":"1","scorer":{"scorerId":"03167","name":"Bo Horvat","shortName":"B. Horvat","posShortNames":"C","teamShortName":"NYI"},"cells":[{"content":"11 • 39","toolTip":"C rank: 11 • Overall rank: 39"},{"content":"31"},{"content":"@TOR<br/>Sat 6:00PM","eventId":"06mjt"},{"content":"0"},{"content":"0"},{"content":"93%"},{"gainColor":1,"content":"+1%"},{"content":"83%"},{"gainColor":1,"content":"+6%"},{"content":"99%"},{"content":"118.32"}]},{"posId":"206","statusId":"1","scorer":{"scorerId":"03duf","name":"Dylan Larkin","shortName":"D. Larkin","posShortNames":"C","teamShortName":"DET"},"cells":[{"content":"114 • 380","toolTip":"C rank: 114 • Overall rank: 380"},{"content":"30"},{"content":"SJS<br/>Sat 6:00PM","eventId":"06mju"},{"content":"0"},{"content":"0"},{"content":"96%"},{"content":"0%"},{"content":"72%"},{"gainColor":1,"content":"+5%"},{"content":"99%"},{"content":"97.55"}]},{"posId":"206","statusId":"1","scorer":{"scorerId":"01f6d","name":"Ryan O'Reilly","shortName":"R. O'Reilly","posShortNames":"C","teamShortName":"NSH"},"cells":[{"content":"21 • 80","toolTip":"C rank: 21 • Overall rank: 80"},{"content":"35"},{"content":"STL<br/>Sat 7:00PM","eventId":"06mjy"},{"content":"0"},{"content":"0"},{"content":"83%"},{"gainColor":-1,"content":"-1%"},{"content":"63%"},{"gainColor":1,"content":"+1%"},{"content":"93%"},{"content":"157.21"}]},{"posId":"206","statusId":"1","scorer":{"scorerId":"048x9","name":"Elias Pettersson","shortName":"E. Pettersson","posShortNames":"C","teamShortName":"VAN"},"cells":[{"content":"10 • 32","toolTip":"C rank: 10 • Overall rank: 32"},{"content":"27"},{"content":"VAN 2<br/>@TBL 1","eventId":"06mjq"},{"content":"6.55"},{"content":"6.55"},{"content":"94%"},{"content":"0%"},{"content":"83%"},{"gainColor":1,"content":"+1%"},{"content":"96%"},{"content":"146.18"}]},{"posId":"203","statusId":"1","scorer":{"scorerId":"042ye","name":"Jesper Bratt","shortName":"J. Bratt","posShortNames":"LW,RW","teamShortName":"NJD"},"cells":[{"content":"25 • 108","toolTip":"LW rank: 25 • Overall rank: 108"},{"content":"28"},{"content":"NJD 2<br/>@WSH 4 F","eventId":"06mjo"},{"content":"1.35"},{"content":"1.35"},{"content":"98%"},{"content":"0%"},{"content":"91%"},{"gainColor":1,"content":"+7%"},{"content":"100%"},{"content":"78.06"}]},{"posId":"203","statusId":"1","scorer":{"scorerId":"04a9v","name":"Morgan Geekie","shortName":"M. Geekie","posShortNames":"C,LW,RW","teamShortName":"BOS"},"cells":[{"content":"32 • 132","toolTip":"LW rank: 32 • Overall rank: 132"},{"content":"28"},{"content":"@LAK<br/>Sat 8:00PM","eventId":"06mjz"},{"content":"0"},{"content":"0"},{"content":"97%"},{"content":"0%"},{"content":"81%"},{"gainColor":1,"content":"+2%"},{"content":"100%"},{"content":"109.45"}]},{"posId":"203","statusId":"1","scorer":{"scorerId":"051yz","name":"Dylan Holloway","shortName":"D. Holloway","posShortNames":"LW,RW","teamShortName":"STL"},"cells":[{"content":"58 • 199","toolTip":"LW rank: 58 • Overall rank: 199"},{"content":"25"},{"content":"@NSH<br/>Sat 7:00PM","eventId":"06mjy"},{"content":"0"},{"content":"0"},{"content":"93%"},{"gainColor":-1,"content":"-2%"},{"content":"70%"},{"gainColor":-1,"content":"-2%"},{"content":"100%"},{"content":"81.38"}]},{"posId":"203","statusId":"1","scorer":{"scorerId":"05j3d","name":"Bobby McMann","shortName":"B. McMann","posShortNames":"LW","teamShortName":"SEA"},"cells":[{"content":"30 • 129","toolTip":"LW rank: 30 • Overall rank: 129"},{"content":"30"},{"content":"@FLA<br/>Sat 5:00PM","eventId":"06mjr"},{"content":"0"},{"content":"0"},{"content":"50%"},{"content":"0%"},{"content":"38%"},{"gainColor":-1,"content":"-1%"},{"content":"44%"},{"content":"255.41"}]},{"posId":"204","statusId":"1","scorer":{"scorerId":"03e1n","name":"Adrian Kempe","shortName":"A. Kempe","posShortNames":"RW","teamShortName":"LAK"},"cells":[{"content":"84 • 281","toolTip":"RW rank: 84 • Overall rank: 281"},{"content":"30"},{"content":"BOS<br/>Sat 8:00PM","eventId":"06mjz"},{"content":"0"},{"content":"0"},{"content":"96%"},{"gainColor":-1,"content":"-1%"},{"content":"72%"},{"gainColor":-1,"content":"-4%"},{"content":"100%"},{"content":"62.95"}]},{"posId":"204","statusId":"1","scorer":{"scorerId":"04843","name":"Mathieu Olivier","shortName":"M. Olivier","posShortNames":"RW","teamShortName":"CBJ"},"cells":[{"content":"146 • 441","toolTip":"RW rank: 146 • Overall rank: 441"},{"content":"29"},{"content":"NYR<br/>Sat 6:00PM","eventId":"06mjv"},{"content":"0"},{"content":"0"},{"content":"23%"},{"content":"0%"},{"content":"16%"},{"content":"0%"},{"content":"10%"},{"content":"284.38"}]},{"posId":"204","statusId":"1","scorer":{"scorerId":"04ln4","name":"Kiefer Sherwood","shortName":"K. Sherwood","posShortNames":"LW,RW","teamShortName":"SJS"},"cells":[{"content":"38 • 145","toolTip":"RW rank: 38 • Overall rank: 145"},{"content":"31"},{"content":"@DET<br/>Sat 6:00PM","eventId":"06mju"},{"content":"0"},{"content":"0"},{"content":"58%"},{"gainColor":-1,"content":"-2%"},{"content":"40%"},{"gainColor":1,"content":"+3%"},{"content":"75%"},{"content":"194.13"}]},{"posId":"204","statusId":"1","scorer":{"scorerId":"01zvf","name":"Mark Stone","shortName":"M. Stone","posShortNames":"RW","teamShortName":"VGK"},"cells":[{"content":"2 • 15","toolTip":"RW rank: 2 • Overall rank: 15"},{"content":"34"},{"content":"PIT<br/>Sat 9:00PM","eventId":"06mk0"},{"content":"0"},{"content":"0"},{"content":"97%"},{"content":"0%"},{"content":"92%"},{"gainColor":1,"content":"+1%"},{"content":"99%"},{"content":"100.44"}]},{"posId":"202","statusId":"1","scorer":{"scorerId":"03rad","name":"Thomas Chabot","shortName":"T. Chabot","posShortNames":"D","teamShortName":"OTT"},"cells":[{"content":"19 • 92","toolTip":"D rank: 19 • Overall rank: 92"},{"content":"29"},{"content":"@PHI<br/>Sat 6:00PM","eventId":"06mjw"},{"content":"0"},{"content":"0"},{"content":"88%"},{"gainColor":1,"content":"+2%"},{"content":"81%"},{"gainColor":1,"content":"+1%"},{"content":"95%"},{"content":"154.31"}]},{"posId":"202","statusId":"1","scorer":{"scorerId":"01zu5","name":"Justin Faulk","shortName":"J. Faulk","posShortNames":"D","teamShortName":"DET"},"cells":[{"content":"65 • 240","toolTip":"D rank: 65 • Overall rank: 240"},{"content":"34"},{"content":"SJS<br/>Sat 6:00PM","eventId":"06mju"},{"content":"0"},{"content":"0"},{"content":"45%"},{"gainColor":-1,"content":"-2%"},{"content":"36%"},{"gainColor":-1,"content":"-1%"},{"content":"43%"},{"content":"253.04"}]},{"posId":"202","statusId":"1","scorer":{"scorerId":"04lbz","name":"Quinn Hughes","shortName":"Q. Hughes","posShortNames":"D","teamShortName":"MIN"},"cells":[{"content":"2 • 10","toolTip":"D rank: 2 • Overall rank: 10"},{"content":"27"},{"content":""},{"content":"0"},{"content":"0"},{"content":"100%"},{"content":"0%"},{"content":"99%"},{"content":"0%"},{"content":"100%"},{"content":"14.46"}]},{"posId":"202","statusId":"1","scorer":{"scorerId":"05y7m","name":"Denton Mateychuk","shortName":"D. Mateychuk","posShortNames":"D","teamShortName":"CBJ"},"cells":[{"content":"112 • 424","toolTip":"D rank: 112 • Overall rank: 424"},{"content":"22"},{"content":"NYR<br/>Sat 6:00PM","eventId":"06mjv"},{"content":"0"},{"content":"0"},{"content":"52%"},{"gainColor":-1,"content":"-1%"},{"content":"34%"},{"gainColor":-1,"content":"-1%"},{"content":"15%"},{"content":"283.64"}]},{"posId":"202","statusId":"1","scorer":{"scorerId":"02wy5","name":"Nikita Zadorov","shortName":"N. Zadorov","posShortNames":"D","teamShortName":"BOS"},"cells":[{"content":"28 • 116","toolTip":"D rank: 28 • Overall rank: 116"},{"content":"31"},{"content":"@LAK<br/>Sat 8:00PM","eventId":"06mjz"},{"content":"0"},{"content":"0"},{"content":"49%"},{"gainColor":1,"content":"+2%"},{"content":"43%"},{"gainColor":1,"content":"+3%"},{"content":"35%"},{"content":"251.34"}]},{"posId":"202","statusId":"1","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"posId":"208","statusId":"1","scorer":{"scorerId":"04y4m","name":"Connor Bedard","shortName":"C. Bedard","posShortNames":"C","teamShortName":"CHI"},"cells":[{"content":"440 • 486","toolTip":"Skt rank: 440 • Overall rank: 486"},{"content":"21"},{"content":"DAL<br/>Sat 6:00PM","eventId":"06mjx"},{"content":"0"},{"content":"0"},{"content":"99%"},{"content":"0%"},{"content":"74%"},{"gainColor":1,"content":"+52%"},{"content":"99%"},{"content":"55.6"}]},{"posId":"204","statusId":"2","scorer":{"scorerId":"06bdr","name":"Roman Kantserov","shortName":"R. Kantserov","posShortNames":"RW","teamShortName":"CHI"},"cells":[{"content":"122 • 377","toolTip":"RW rank: 122 • Overall rank: 377"},{"content":"22"},{"content":"DAL<br/>Sat 6:00PM","eventId":"06mjx"},{"content":"0"},{"content":"0"},{"content":"64%"},{"content":"0%"},{"content":"29%"},{"gainColor":1,"content":"+2%"},{"content":"33%"},{"content":"265"}]},{"posId":"204","statusId":"2","scorer":{"scorerId":"06snb","name":"Benjamin Kindel","shortName":"B. Kindel","posShortNames":"C,RW","teamShortName":"PIT"},"cells":[{"content":"105 • 337","toolTip":"RW rank: 105 • Overall rank: 337"},{"content":"19"},{"content":"@VGK<br/>Sat 9:00PM","eventId":"06mk0"},{"content":"0"},{"content":"0"},{"content":"59%"},{"gainColor":-1,"content":"-1%"},{"content":"38%"},{"gainColor":-1,"content":"-5%"},{"content":"10%"},{"content":"287.84"}]},{"posId":"204","statusId":"2","scorer":{"scorerId":"06hj9","name":"Porter Martone","shortName":"P. Martone","posShortNames":"RW","teamShortName":"PHI"},"cells":[{"content":"167 • 528","toolTip":"RW rank: 167 • Overall rank: 528"},{"content":"19"},{"content":"OTT<br/>Sat 6:00PM","eventId":"06mjw"},{"content":"0"},{"content":"0"},{"content":"93%"},{"gainColor":-1,"content":"-5%"},{"content":"51%"},{"gainColor":-1,"content":"-18%"},{"content":"100%"},{"content":"74.37"}]},{"posId":"202","statusId":"2","scorer":{"scorerId":"05ril","name":"Simon Nemec","shortName":"S. Nemec","posShortNames":"D","teamShortName":"CGY"},"cells":[{"content":"114 • 426","toolTip":"D rank: 114 • Overall rank: 426"},{"content":"22"},{"content":""},{"content":"0"},{"content":"0"},{"content":"62%"},{"gainColor":-1,"content":"-7%"},{"content":"36%"},{"gainColor":-1,"content":"-6%"},{"content":"80%"},{"content":"197.39"}]},{"posId":"202","statusId":"2","scorer":{"scorerId":"059e0","name":"Jake Sanderson","shortName":"J. Sanderson","posShortNames":"D","teamShortName":"OTT"},"cells":[{"content":"234 • 736","toolTip":"D rank: 234 • Overall rank: 736"},{"content":"24"},{"content":"@PHI<br/>Sat 6:00PM","eventId":"06mjw"},{"content":"0"},{"content":"0"},{"content":"98%"},{"gainColor":-1,"content":"-1%"},{"content":"37%"},{"gainColor":-1,"content":"-9%"},{"content":"100%"},{"content":"52.66"}]},{"statusId":"2","description":"Reserve spot(s) available Limited by Max Players on Team","numSpotsAvailableText":"Reserve spot(s) available","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"posId":"206","statusId":"3","scorer":{"scorerId":"02un7","name":"Aleksander Barkov","shortName":"A. Barkov","posShortNames":"C","teamShortName":"FLA"},"cells":[{"content":"200 • 698","toolTip":"C rank: 200 • Overall rank: 698"},{"content":"31"},{"content":"SEA<br/>Sat 5:00PM","eventId":"06mjr"},{"content":"0"},{"content":"0"},{"content":"93%"},{"gainColor":-1,"content":"-2%"},{"content":"15%"},{"gainColor":-1,"content":"-5%"},{"content":"99%"},{"content":"53.19"}]},{"posId":"206","statusId":"3","scorer":{"scorerId":"0045u","name":"Jordan Staal","shortName":"J. Staal","posShortNames":"C","teamShortName":"CAR"},"cells":[{"content":"125 • 428","toolTip":"C rank: 125 • Overall rank: 428"},{"content":"38"},{"content":"CAR 1<br/>@WPG 2","eventId":"06mjp"},{"content":"0"},{"content":"0"},{"content":"20%"},{"gainColor":-1,"content":"-3%"},{"content":"4%"},{"gainColor":-1,"content":"-14%"},{"content":"12%"},{"content":"283.91"}]},{"posId":"204","statusId":"3","scorer":{"scorerId":"03dms","name":"Kevin Fiala","shortName":"K. Fiala","posShortNames":"LW,RW","teamShortName":"LAK"},"cells":[{"content":"651 • 2730","toolTip":"LW rank: 651 • Overall rank: 2730"},{"content":"30"},{"content":"BOS<br/>Sat 8:00PM","eventId":"06mjz"},{"content":"0"},{"content":"0"},{"content":"66%"},{"content":"0%"},{"content":"7%"},{"gainColor":-1,"content":"-1%"},{"content":"70%"},{"content":"203.02"}]},{"posId":"204","statusId":"3","scorer":{"scorerId":"03rik","name":"Troy Terry","shortName":"T. Terry","posShortNames":"RW","teamShortName":"ANA"},"cells":[{"content":"1557 • 7912","toolTip":"RW rank: 1557 • Overall rank: 7912"},{"content":"29"},{"content":""},{"content":"0"},{"content":"0"},{"content":"53%"},{"gainColor":-1,"content":"-1%"},{"content":"5%"},{"gainColor":-1,"content":"-1%"},{"content":"42%"},{"content":"253.47"}]},{"statusId":"3","description":"Inj Res spot(s) available","numSpotsAvailable":0,"numSpotsAvailableText":"Inj Res spot(s) available","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"statusId":"y","scorerColumn":"Totals","bold":true,"scorer":{"team":false,"rookie":false,"minorsEligible":false},"cells":[{"content":""},{"content":""},{"content":"7.9"},{"content":"3.95"},{"content":"1"},{"content":"0"},{"content":"1"},{"content":"5"},{"content":"0"},{"content":"1"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"5"},{"content":"5"}]}]},{"scGroup":"2020","header":{"cells":[{"sortDirection":1,"name":"Position rank â¢ Overall rank","width":6,"shortName":"Rk","key":"rankPosOv"},{"sortDirection":1,"sortKey":"AGE","sortType":"AGE","name":"Age","width":3,"shortName":"Age","key":"age"},{"eventStr":true,"sortDirection":1,"name":"Opponent","shortName":"Opp","key":"opponent"},{"sortDirection":1,"sortKey":"SCORE","sortType":"SCORE","name":"Fantasy Points","shortName":"FPts","key":"fpts"},{"sortDirection":1,"sortKey":"FPTS_PER_GAME","sortType":"FPTS_PER_GAME","name":"Average Fantasy Points per Game","shortName":"FP/G","key":"fptsPerGame"},{"sortDirection":1,"sortKey":"OVERVIEW_PERCENT_OWNED_2","sortType":"OVERVIEW_PERCENT_OWNED_2","name":"% of Fantrax leagues that have this player on their roster this week","shortName":"Ros"},{"sortDirection":1,"sortKey":"OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2","sortType":"OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2","name":"Change in percent Rostered from previous week","shortName":"+/-"},{"sortDirection":1,"sortKey":"OVERVIEW_PERCENT_ACTIVE_2","sortType":"OVERVIEW_PERCENT_ACTIVE_2","name":"% of leagues that have this player starting, i.e. in an active slot this week","shortName":"Act"},{"sortDirection":1,"sortKey":"OVERVIEW_PLUS_MINUS_PERCENT_ACTIVE_2","sortType":"OVERVIEW_PLUS_MINUS_PERCENT_ACTIVE_2","name":"Change in percent active from previous week","shortName":"+/-"},{"sortDirection":1,"sortKey":"OVERVIEW_PERCENT_DRAFTED","sortType":"OVERVIEW_PERCENT_DRAFTED","name":"Drafted","shortName":"%D"},{"sortDirection":1,"sortKey":"OVERVIEW_AVG_DRAFT_POSITION","sortType":"OVERVIEW_AVG_DRAFT_POSITION","name":"Avg. Draft Position","shortName":"ADP"}]},"rows":[{"posId":"201","statusId":"1","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"posId":"201","statusId":"1","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"posId":"201","statusId":"2","scorer":{"scorerId":"03ynu","name":"Carter Hart","shortName":"C. Hart","posShortNames":"G","teamShortName":"VGK"},"cells":[{"content":"7 • 25","toolTip":"G rank: 7 • Overall rank: 25"},{"content":"28"},{"content":"PIT<br/>Sat 9:00PM","eventId":"06mk0"},{"content":"0"},{"content":"0"},{"content":"93%"},{"gainColor":1,"content":"+1%"},{"content":"77%"},{"gainColor":-1,"content":"-2%"},{"content":"86%"},{"content":"166.3"}]},{"posId":"201","statusId":"2","scorer":{"scorerId":"04qzc","name":"Joel Hofer","shortName":"J. Hofer","posShortNames":"G","teamShortName":"STL"},"cells":[{"content":"17 • 57","toolTip":"G rank: 17 • Overall rank: 57"},{"content":"26"},{"content":"@NSH<br/>Sat 7:00PM","eventId":"06mjy"},{"content":"0"},{"content":"0"},{"content":"85%"},{"content":"0%"},{"content":"66%"},{"content":"0%"},{"content":"90%"},{"content":"170.18"}]},{"posId":"201","statusId":"2","scorer":{"scorerId":"01zs1","name":"Scott Wedgewood","shortName":"S. Wedgewood","posShortNames":"G","teamShortName":"COL"},"cells":[{"content":"46 • 449","toolTip":"G rank: 46 • Overall rank: 449"},{"content":"34"},{"content":""},{"content":"0"},{"content":"0"},{"content":"89%"},{"gainColor":-1,"content":"-4%"},{"content":"48%"},{"gainColor":-1,"content":"-9%"},{"content":"96%"},{"content":"122.14"}]},{"statusId":"2","description":"Reserve spot(s) available Limited by Max Players on Team","numSpotsAvailableText":"Reserve spot(s) available","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"statusId":"3","description":"Inj Res spot(s) available","numSpotsAvailable":0,"numSpotsAvailableText":"Inj Res spot(s) available","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"statusId":"y","scorerColumn":"Totals","bold":true,"scorer":{"team":false,"rookie":false,"minorsEligible":false},"cells":[{"content":""},{"content":""},{"content":"0"},{"content":""},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]}]}]};
export const ROSTER_TRENDS_LIVE_LATER = {"displayedSelections":{"displayedStatsType":"1","displayedPeriod":19,"adminMode":false,"displayedView":"OVERVIEW","lineupChangeSystem":"EASY_CLICK","displayedStartDate":1790654400000,"displayedScoringCategoryType":"5","displayedSeasonOrProjection":{"code":"SEASON_31n_BY_PERIOD","endDate":1807415999000,"name":"2026-27 Reg Season - Period","showGoBackDays":true,"shortName":"2026-27 Reg - Period","timeframeTypeCode":"BY_PERIOD","startDate":1790654400000},"displayedEndDate":1792209600000},"tables":[{"scGroup":"2010","header":{"cells":[{"sortDirection":1,"name":"Position rank â¢ Overall rank","width":9,"shortName":"Rk","key":"rankPosOv"},{"sortDirection":1,"sortKey":"AGE","sortType":"AGE","name":"Age","width":3,"shortName":"Age","key":"age"},{"eventStr":true,"sortDirection":1,"name":"Opponent","shortName":"Opp","key":"opponent"},{"sortDirection":1,"sortKey":"SCORE","sortType":"SCORE","name":"Fantasy Points","shortName":"FPts","key":"fpts"},{"sortDirection":1,"sortKey":"FPTS_PER_GAME","sortType":"FPTS_PER_GAME","name":"Average Fantasy Points per Game","shortName":"FP/G","key":"fptsPerGame"},{"sortDirection":1,"sortKey":"OVERVIEW_PERCENT_OWNED_2","sortType":"OVERVIEW_PERCENT_OWNED_2","name":"% of Fantrax leagues that have this player on their roster this week","shortName":"Ros"},{"sortDirection":1,"sortKey":"OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2","sortType":"OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2","name":"Change in percent Rostered from previous week","shortName":"+/-"},{"sortDirection":1,"sortKey":"OVERVIEW_PERCENT_ACTIVE_2","sortType":"OVERVIEW_PERCENT_ACTIVE_2","name":"% of leagues that have this player starting, i.e. in an active slot this week","shortName":"Act"},{"sortDirection":1,"sortKey":"OVERVIEW_PLUS_MINUS_PERCENT_ACTIVE_2","sortType":"OVERVIEW_PLUS_MINUS_PERCENT_ACTIVE_2","name":"Change in percent active from previous week","shortName":"+/-"},{"sortDirection":1,"sortKey":"OVERVIEW_PERCENT_DRAFTED","sortType":"OVERVIEW_PERCENT_DRAFTED","name":"Drafted","shortName":"%D"},{"sortDirection":1,"sortKey":"OVERVIEW_AVG_DRAFT_POSITION","sortType":"OVERVIEW_AVG_DRAFT_POSITION","name":"Avg. Draft Position","shortName":"ADP"}]},"rows":[{"posId":"206","statusId":"1","scorer":{"scorerId":"03167","name":"Bo Horvat","shortName":"B. Horvat","posShortNames":"C","teamShortName":"NYI"},"cells":[{"content":"11 • 39","toolTip":"C rank: 11 • Overall rank: 39"},{"content":"31"},{"content":"@TOR<br/>Sat 6:00PM","eventId":"06mjt"},{"content":"0"},{"content":"0"},{"content":"93%"},{"gainColor":1,"content":"+1%"},{"content":"83%"},{"gainColor":1,"content":"+6%"},{"content":"99%"},{"content":"118.32"}]},{"posId":"206","statusId":"1","scorer":{"scorerId":"03duf","name":"Dylan Larkin","shortName":"D. Larkin","posShortNames":"C","teamShortName":"DET"},"cells":[{"content":"114 • 380","toolTip":"C rank: 114 • Overall rank: 380"},{"content":"30"},{"content":"SJS<br/>Sat 6:00PM","eventId":"06mju"},{"content":"0"},{"content":"0"},{"content":"96%"},{"content":"0%"},{"content":"72%"},{"gainColor":1,"content":"+5%"},{"content":"99%"},{"content":"97.55"}]},{"posId":"206","statusId":"1","scorer":{"scorerId":"01f6d","name":"Ryan O'Reilly","shortName":"R. O'Reilly","posShortNames":"C","teamShortName":"NSH"},"cells":[{"content":"21 • 80","toolTip":"C rank: 21 • Overall rank: 80"},{"content":"35"},{"content":"STL<br/>Sat 7:00PM","eventId":"06mjy"},{"content":"0"},{"content":"0"},{"content":"83%"},{"gainColor":-1,"content":"-1%"},{"content":"63%"},{"gainColor":1,"content":"+1%"},{"content":"93%"},{"content":"157.21"}]},{"posId":"206","statusId":"1","scorer":{"scorerId":"048x9","name":"Elias Pettersson","shortName":"E. Pettersson","posShortNames":"C","teamShortName":"VAN"},"cells":[{"content":"10 • 32","toolTip":"C rank: 10 • Overall rank: 32"},{"content":"27"},{"content":"VAN 2<br/>@TBL 1","eventId":"06mjq"},{"content":"6.55"},{"content":"6.55"},{"content":"94%"},{"content":"0%"},{"content":"83%"},{"gainColor":1,"content":"+1%"},{"content":"96%"},{"content":"146.18"}]},{"posId":"203","statusId":"1","scorer":{"scorerId":"042ye","name":"Jesper Bratt","shortName":"J. Bratt","posShortNames":"LW,RW","teamShortName":"NJD"},"cells":[{"content":"25 • 108","toolTip":"LW rank: 25 • Overall rank: 108"},{"content":"28"},{"content":"NJD 2<br/>@WSH 4 F","eventId":"06mjo"},{"content":"1.35"},{"content":"1.35"},{"content":"98%"},{"content":"0%"},{"content":"91%"},{"gainColor":1,"content":"+7%"},{"content":"100%"},{"content":"78.06"}]},{"posId":"203","statusId":"1","scorer":{"scorerId":"04a9v","name":"Morgan Geekie","shortName":"M. Geekie","posShortNames":"C,LW,RW","teamShortName":"BOS"},"cells":[{"content":"32 • 132","toolTip":"LW rank: 32 • Overall rank: 132"},{"content":"28"},{"content":"@LAK<br/>Sat 8:00PM","eventId":"06mjz"},{"content":"0"},{"content":"0"},{"content":"97%"},{"content":"0%"},{"content":"81%"},{"gainColor":1,"content":"+2%"},{"content":"100%"},{"content":"109.45"}]},{"posId":"203","statusId":"1","scorer":{"scorerId":"051yz","name":"Dylan Holloway","shortName":"D. Holloway","posShortNames":"LW,RW","teamShortName":"STL"},"cells":[{"content":"58 • 199","toolTip":"LW rank: 58 • Overall rank: 199"},{"content":"25"},{"content":"@NSH<br/>Sat 7:00PM","eventId":"06mjy"},{"content":"0"},{"content":"0"},{"content":"93%"},{"gainColor":-1,"content":"-2%"},{"content":"70%"},{"gainColor":-1,"content":"-2%"},{"content":"100%"},{"content":"81.38"}]},{"posId":"203","statusId":"1","scorer":{"scorerId":"05j3d","name":"Bobby McMann","shortName":"B. McMann","posShortNames":"LW","teamShortName":"SEA"},"cells":[{"content":"30 • 129","toolTip":"LW rank: 30 • Overall rank: 129"},{"content":"30"},{"content":"@FLA<br/>Sat 5:00PM","eventId":"06mjr"},{"content":"0"},{"content":"0"},{"content":"50%"},{"content":"0%"},{"content":"38%"},{"gainColor":-1,"content":"-1%"},{"content":"44%"},{"content":"255.41"}]},{"posId":"204","statusId":"1","scorer":{"scorerId":"03e1n","name":"Adrian Kempe","shortName":"A. Kempe","posShortNames":"RW","teamShortName":"LAK"},"cells":[{"content":"84 • 281","toolTip":"RW rank: 84 • Overall rank: 281"},{"content":"30"},{"content":"BOS<br/>Sat 8:00PM","eventId":"06mjz"},{"content":"0"},{"content":"0"},{"content":"96%"},{"gainColor":-1,"content":"-1%"},{"content":"72%"},{"gainColor":-1,"content":"-4%"},{"content":"100%"},{"content":"62.95"}]},{"posId":"204","statusId":"1","scorer":{"scorerId":"04843","name":"Mathieu Olivier","shortName":"M. Olivier","posShortNames":"RW","teamShortName":"CBJ"},"cells":[{"content":"146 • 441","toolTip":"RW rank: 146 • Overall rank: 441"},{"content":"29"},{"content":"NYR<br/>Sat 6:00PM","eventId":"06mjv"},{"content":"0"},{"content":"0"},{"content":"23%"},{"content":"0%"},{"content":"16%"},{"content":"0%"},{"content":"10%"},{"content":"284.38"}]},{"posId":"204","statusId":"1","scorer":{"scorerId":"04ln4","name":"Kiefer Sherwood","shortName":"K. Sherwood","posShortNames":"LW,RW","teamShortName":"SJS"},"cells":[{"content":"38 • 145","toolTip":"RW rank: 38 • Overall rank: 145"},{"content":"31"},{"content":"@DET<br/>Sat 6:00PM","eventId":"06mju"},{"content":"0"},{"content":"0"},{"content":"58%"},{"gainColor":-1,"content":"-2%"},{"content":"40%"},{"gainColor":1,"content":"+3%"},{"content":"75%"},{"content":"194.13"}]},{"posId":"204","statusId":"1","scorer":{"scorerId":"01zvf","name":"Mark Stone","shortName":"M. Stone","posShortNames":"RW","teamShortName":"VGK"},"cells":[{"content":"2 • 15","toolTip":"RW rank: 2 • Overall rank: 15"},{"content":"34"},{"content":"PIT<br/>Sat 9:00PM","eventId":"06mk0"},{"content":"0"},{"content":"0"},{"content":"97%"},{"content":"0%"},{"content":"92%"},{"gainColor":1,"content":"+1%"},{"content":"99%"},{"content":"100.44"}]},{"posId":"202","statusId":"1","scorer":{"scorerId":"03rad","name":"Thomas Chabot","shortName":"T. Chabot","posShortNames":"D","teamShortName":"OTT"},"cells":[{"content":"19 • 92","toolTip":"D rank: 19 • Overall rank: 92"},{"content":"29"},{"content":"@PHI<br/>Sat 6:00PM","eventId":"06mjw"},{"content":"0"},{"content":"0"},{"content":"88%"},{"gainColor":1,"content":"+2%"},{"content":"81%"},{"gainColor":1,"content":"+1%"},{"content":"95%"},{"content":"154.31"}]},{"posId":"202","statusId":"1","scorer":{"scorerId":"01zu5","name":"Justin Faulk","shortName":"J. Faulk","posShortNames":"D","teamShortName":"DET"},"cells":[{"content":"65 • 240","toolTip":"D rank: 65 • Overall rank: 240"},{"content":"34"},{"content":"SJS<br/>Sat 6:00PM","eventId":"06mju"},{"content":"0"},{"content":"0"},{"content":"45%"},{"gainColor":-1,"content":"-2%"},{"content":"36%"},{"gainColor":-1,"content":"-1%"},{"content":"43%"},{"content":"253.04"}]},{"posId":"202","statusId":"1","scorer":{"scorerId":"04lbz","name":"Quinn Hughes","shortName":"Q. Hughes","posShortNames":"D","teamShortName":"MIN"},"cells":[{"content":"2 • 10","toolTip":"D rank: 2 • Overall rank: 10"},{"content":"27"},{"content":""},{"content":"0"},{"content":"0"},{"content":"100%"},{"content":"0%"},{"content":"99%"},{"content":"0%"},{"content":"100%"},{"content":"14.46"}]},{"posId":"202","statusId":"1","scorer":{"scorerId":"05y7m","name":"Denton Mateychuk","shortName":"D. Mateychuk","posShortNames":"D","teamShortName":"CBJ"},"cells":[{"content":"112 • 424","toolTip":"D rank: 112 • Overall rank: 424"},{"content":"22"},{"content":"NYR<br/>Sat 6:00PM","eventId":"06mjv"},{"content":"0"},{"content":"0"},{"content":"52%"},{"gainColor":-1,"content":"-1%"},{"content":"34%"},{"gainColor":-1,"content":"-1%"},{"content":"15%"},{"content":"283.64"}]},{"posId":"202","statusId":"1","scorer":{"scorerId":"02wy5","name":"Nikita Zadorov","shortName":"N. Zadorov","posShortNames":"D","teamShortName":"BOS"},"cells":[{"content":"28 • 116","toolTip":"D rank: 28 • Overall rank: 116"},{"content":"31"},{"content":"@LAK<br/>Sat 8:00PM","eventId":"06mjz"},{"content":"0"},{"content":"0"},{"content":"49%"},{"gainColor":1,"content":"+2%"},{"content":"43%"},{"gainColor":1,"content":"+3%"},{"content":"35%"},{"content":"251.34"}]},{"posId":"202","statusId":"1","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"posId":"208","statusId":"1","scorer":{"scorerId":"04y4m","name":"Connor Bedard","shortName":"C. Bedard","posShortNames":"C","teamShortName":"CHI"},"cells":[{"content":"440 • 486","toolTip":"Skt rank: 440 • Overall rank: 486"},{"content":"21"},{"content":"DAL<br/>Sat 6:00PM","eventId":"06mjx"},{"content":"0"},{"content":"0"},{"content":"99%"},{"content":"0%"},{"content":"74%"},{"gainColor":1,"content":"+52%"},{"content":"99%"},{"content":"55.6"}]},{"posId":"204","statusId":"2","scorer":{"scorerId":"06bdr","name":"Roman Kantserov","shortName":"R. Kantserov","posShortNames":"RW","teamShortName":"CHI"},"cells":[{"content":"122 • 377","toolTip":"RW rank: 122 • Overall rank: 377"},{"content":"22"},{"content":"DAL<br/>Sat 6:00PM","eventId":"06mjx"},{"content":"0"},{"content":"0"},{"content":"64%"},{"content":"0%"},{"content":"29%"},{"gainColor":1,"content":"+2%"},{"content":"33%"},{"content":"265"}]},{"posId":"204","statusId":"2","scorer":{"scorerId":"06snb","name":"Benjamin Kindel","shortName":"B. Kindel","posShortNames":"C,RW","teamShortName":"PIT"},"cells":[{"content":"105 • 337","toolTip":"RW rank: 105 • Overall rank: 337"},{"content":"19"},{"content":"@VGK<br/>Sat 9:00PM","eventId":"06mk0"},{"content":"0"},{"content":"0"},{"content":"59%"},{"gainColor":-1,"content":"-1%"},{"content":"38%"},{"gainColor":-1,"content":"-5%"},{"content":"10%"},{"content":"287.84"}]},{"posId":"204","statusId":"2","scorer":{"scorerId":"06hj9","name":"Porter Martone","shortName":"P. Martone","posShortNames":"RW","teamShortName":"PHI"},"cells":[{"content":"167 • 528","toolTip":"RW rank: 167 • Overall rank: 528"},{"content":"19"},{"content":"OTT<br/>Sat 6:00PM","eventId":"06mjw"},{"content":"0"},{"content":"0"},{"content":"93%"},{"gainColor":-1,"content":"-5%"},{"content":"51%"},{"gainColor":-1,"content":"-18%"},{"content":"100%"},{"content":"74.37"}]},{"posId":"202","statusId":"2","scorer":{"scorerId":"05ril","name":"Simon Nemec","shortName":"S. Nemec","posShortNames":"D","teamShortName":"CGY"},"cells":[{"content":"114 • 426","toolTip":"D rank: 114 • Overall rank: 426"},{"content":"22"},{"content":""},{"content":"0"},{"content":"0"},{"content":"62%"},{"gainColor":-1,"content":"-7%"},{"content":"36%"},{"gainColor":-1,"content":"-6%"},{"content":"80%"},{"content":"197.39"}]},{"posId":"202","statusId":"2","scorer":{"scorerId":"059e0","name":"Jake Sanderson","shortName":"J. Sanderson","posShortNames":"D","teamShortName":"OTT"},"cells":[{"content":"234 • 736","toolTip":"D rank: 234 • Overall rank: 736"},{"content":"24"},{"content":"@PHI<br/>Sat 6:00PM","eventId":"06mjw"},{"content":"0"},{"content":"0"},{"content":"98%"},{"gainColor":-1,"content":"-1%"},{"content":"37%"},{"gainColor":-1,"content":"-9%"},{"content":"100%"},{"content":"52.66"}]},{"statusId":"2","description":"Reserve spot(s) available Limited by Max Players on Team","numSpotsAvailableText":"Reserve spot(s) available","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"posId":"206","statusId":"3","scorer":{"scorerId":"02un7","name":"Aleksander Barkov","shortName":"A. Barkov","posShortNames":"C","teamShortName":"FLA"},"cells":[{"content":"200 • 698","toolTip":"C rank: 200 • Overall rank: 698"},{"content":"31"},{"content":"SEA<br/>Sat 5:00PM","eventId":"06mjr"},{"content":"0"},{"content":"0"},{"content":"93%"},{"gainColor":-1,"content":"-2%"},{"content":"15%"},{"gainColor":-1,"content":"-5%"},{"content":"99%"},{"content":"53.19"}]},{"posId":"206","statusId":"3","scorer":{"scorerId":"0045u","name":"Jordan Staal","shortName":"J. Staal","posShortNames":"C","teamShortName":"CAR"},"cells":[{"content":"125 • 428","toolTip":"C rank: 125 • Overall rank: 428"},{"content":"38"},{"content":"CAR 1<br/>@WPG 2","eventId":"06mjp"},{"content":"0"},{"content":"0"},{"content":"20%"},{"gainColor":-1,"content":"-3%"},{"content":"4%"},{"gainColor":-1,"content":"-14%"},{"content":"12%"},{"content":"283.91"}]},{"posId":"204","statusId":"3","scorer":{"scorerId":"03dms","name":"Kevin Fiala","shortName":"K. Fiala","posShortNames":"LW,RW","teamShortName":"LAK"},"cells":[{"content":"651 • 2730","toolTip":"LW rank: 651 • Overall rank: 2730"},{"content":"30"},{"content":"BOS<br/>Sat 8:00PM","eventId":"06mjz"},{"content":"0"},{"content":"0"},{"content":"66%"},{"content":"0%"},{"content":"7%"},{"gainColor":-1,"content":"-1%"},{"content":"70%"},{"content":"203.02"}]},{"posId":"204","statusId":"3","scorer":{"scorerId":"03rik","name":"Troy Terry","shortName":"T. Terry","posShortNames":"RW","teamShortName":"ANA"},"cells":[{"content":"1557 • 7912","toolTip":"RW rank: 1557 • Overall rank: 7912"},{"content":"29"},{"content":""},{"content":"0"},{"content":"0"},{"content":"53%"},{"gainColor":-1,"content":"-1%"},{"content":"5%"},{"gainColor":-1,"content":"-1%"},{"content":"42%"},{"content":"253.47"}]},{"statusId":"3","description":"Inj Res spot(s) available","numSpotsAvailable":0,"numSpotsAvailableText":"Inj Res spot(s) available","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"statusId":"y","scorerColumn":"Totals","bold":true,"scorer":{"team":false,"rookie":false,"minorsEligible":false},"cells":[{"content":""},{"content":""},{"content":"7.9"},{"content":"3.95"},{"content":"1"},{"content":"0"},{"content":"1"},{"content":"5"},{"content":"0"},{"content":"1"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"5"},{"content":"5"}]}]},{"scGroup":"2020","header":{"cells":[{"sortDirection":1,"name":"Position rank â¢ Overall rank","width":6,"shortName":"Rk","key":"rankPosOv"},{"sortDirection":1,"sortKey":"AGE","sortType":"AGE","name":"Age","width":3,"shortName":"Age","key":"age"},{"eventStr":true,"sortDirection":1,"name":"Opponent","shortName":"Opp","key":"opponent"},{"sortDirection":1,"sortKey":"SCORE","sortType":"SCORE","name":"Fantasy Points","shortName":"FPts","key":"fpts"},{"sortDirection":1,"sortKey":"FPTS_PER_GAME","sortType":"FPTS_PER_GAME","name":"Average Fantasy Points per Game","shortName":"FP/G","key":"fptsPerGame"},{"sortDirection":1,"sortKey":"OVERVIEW_PERCENT_OWNED_2","sortType":"OVERVIEW_PERCENT_OWNED_2","name":"% of Fantrax leagues that have this player on their roster this week","shortName":"Ros"},{"sortDirection":1,"sortKey":"OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2","sortType":"OVERVIEW_PLUS_MINUS_PERCENT_OWNED_2","name":"Change in percent Rostered from previous week","shortName":"+/-"},{"sortDirection":1,"sortKey":"OVERVIEW_PERCENT_ACTIVE_2","sortType":"OVERVIEW_PERCENT_ACTIVE_2","name":"% of leagues that have this player starting, i.e. in an active slot this week","shortName":"Act"},{"sortDirection":1,"sortKey":"OVERVIEW_PLUS_MINUS_PERCENT_ACTIVE_2","sortType":"OVERVIEW_PLUS_MINUS_PERCENT_ACTIVE_2","name":"Change in percent active from previous week","shortName":"+/-"},{"sortDirection":1,"sortKey":"OVERVIEW_PERCENT_DRAFTED","sortType":"OVERVIEW_PERCENT_DRAFTED","name":"Drafted","shortName":"%D"},{"sortDirection":1,"sortKey":"OVERVIEW_AVG_DRAFT_POSITION","sortType":"OVERVIEW_AVG_DRAFT_POSITION","name":"Avg. Draft Position","shortName":"ADP"}]},"rows":[{"posId":"201","statusId":"1","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"posId":"201","statusId":"1","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"posId":"201","statusId":"2","scorer":{"scorerId":"03ynu","name":"Carter Hart","shortName":"C. Hart","posShortNames":"G","teamShortName":"VGK"},"cells":[{"content":"7 • 25","toolTip":"G rank: 7 • Overall rank: 25"},{"content":"28"},{"content":"PIT<br/>Sat 9:00PM","eventId":"06mk0"},{"content":"0"},{"content":"0"},{"content":"93%"},{"gainColor":1,"content":"+1%"},{"content":"77%"},{"gainColor":-1,"content":"-2%"},{"content":"86%"},{"content":"166.3"}]},{"posId":"201","statusId":"2","scorer":{"scorerId":"04qzc","name":"Joel Hofer","shortName":"J. Hofer","posShortNames":"G","teamShortName":"STL"},"cells":[{"content":"17 • 57","toolTip":"G rank: 17 • Overall rank: 57"},{"content":"26"},{"content":"@NSH<br/>Sat 7:00PM","eventId":"06mjy"},{"content":"0"},{"content":"0"},{"content":"85%"},{"content":"0%"},{"content":"66%"},{"content":"0%"},{"content":"90%"},{"content":"170.18"}]},{"posId":"201","statusId":"2","scorer":{"scorerId":"01zs1","name":"Scott Wedgewood","shortName":"S. Wedgewood","posShortNames":"G","teamShortName":"COL"},"cells":[{"content":"46 • 449","toolTip":"G rank: 46 • Overall rank: 449"},{"content":"34"},{"content":""},{"content":"0"},{"content":"0"},{"content":"89%"},{"gainColor":-1,"content":"-4%"},{"content":"48%"},{"gainColor":-1,"content":"-9%"},{"content":"96%"},{"content":"122.14"}]},{"statusId":"2","description":"Reserve spot(s) available Limited by Max Players on Team","numSpotsAvailableText":"Reserve spot(s) available","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"statusId":"3","description":"Inj Res spot(s) available","numSpotsAvailable":0,"numSpotsAvailableText":"Inj Res spot(s) available","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"statusId":"y","scorerColumn":"Totals","bold":true,"scorer":{"team":false,"rookie":false,"minorsEligible":false},"cells":[{"content":""},{"content":""},{"content":"0"},{"content":""},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]}]}]};
export const ROSTER_TRENDS_LIVE_LOOKUP = {"displayedSelections":{"displayedStatsType":"1","displayedPeriod":19,"adminMode":false,"displayedView":"STATS","lineupChangeSystem":"EASY_CLICK","displayedStartDate":1790654400000,"displayedScoringCategoryType":"5","displayedSeasonOrProjection":{"code":"SEASON_31n_BY_PERIOD","endDate":1807415999000,"name":"2026-27 Reg Season - Period","showGoBackDays":true,"shortName":"2026-27 Reg - Period","timeframeTypeCode":"BY_PERIOD","startDate":1790654400000},"displayedEndDate":1792209600000},"tables":[{"scGroup":"2010","header":{"cells":[{"sortDirection":1,"name":"Position rank â¢ Overall rank","width":9,"shortName":"Rk","key":"rankPosOv"},{"sortDirection":1,"sortKey":"AGE","sortType":"AGE","name":"Age","width":3,"shortName":"Age","key":"age"},{"eventStr":true,"sortDirection":1,"name":"Opponent","shortName":"Opp","key":"opponent"},{"sortDirection":1,"sortKey":"SCORE","sortType":"SCORE","name":"Fantasy Points","shortName":"FPts","key":"fpts"},{"sortDirection":1,"sortKey":"FPTS_PER_GAME","sortType":"FPTS_PER_GAME","name":"Average Fantasy Points per Game","shortName":"FP/G","key":"fptsPerGame"},{"sortDirection":1,"sortKey":"SCORING_CATEGORY_2010#2100#-1","scipId":"2010#2100#-1","sortType":"SCORING_CATEGORY","name":"Games Played","width":3,"shortName":"GP","key":"2010#2100#-1","maxWidth":3},{"sortDirection":1,"sortKey":"SCORING_CATEGORY_2010#2130#-1","scipId":"2010#2130#-1","sortType":"SCORING_CATEGORY","name":"Goals","width":3,"shortName":"G","key":"2010#2130#-1","maxWidth":3},{"sortDirection":1,"sortKey":"SCORING_CATEGORY_2010#2090#-1","scipId":"2010#2090#-1","sortType":"SCORING_CATEGORY","name":"Assists","width":3,"shortName":"A","key":"2010#2090#-1","maxWidth":3},{"sortDirection":1,"sortKey":"SCORING_CATEGORY_2010#2190#-1","scipId":"2010#2190#-1","sortType":"SCORING_CATEGORY","name":"Points -- Goals + Assists","width":3,"shortName":"Pt","key":"2010#2190#-1","maxWidth":3},{"sortDirection":1,"sortKey":"SCORING_CATEGORY_2010#2270#-1","scipId":"2010#2270#-1","sortType":"SCORING_CATEGORY","name":"Shots on Goal","width":3,"shortName":"SOG","key":"2010#2270#-1","maxWidth":3},{"sortDirection":1,"sortKey":"SCORING_CATEGORY_2010#2120#-1","scipId":"2010#2120#-1","sortType":"SCORING_CATEGORY","name":"Game-winning Goals","width":3,"shortName":"GWG","key":"2010#2120#-1","maxWidth":3},{"sortDirection":1,"sortKey":"SCORING_CATEGORY_2010#2327#-1","scipId":"2010#2327#-1","sortType":"SCORING_CATEGORY","name":"Power Play Points","width":3,"shortName":"PPP","key":"2010#2327#-1","maxWidth":3},{"sortDirection":1,"sortKey":"SCORING_CATEGORY_2010#2344#-1","scipId":"2010#2344#-1","sortType":"SCORING_CATEGORY","name":"Short-Handed Points","width":3,"shortName":"SHP","key":"2010#2344#-1","maxWidth":3},{"sortDirection":1,"sortKey":"SCORING_CATEGORY_2010#2145#-1","scipId":"2010#2145#-1","sortType":"SCORING_CATEGORY","name":"Hat Tricks -- Three or more goals in a game","width":3,"shortName":"HT","key":"2010#2145#-1","maxWidth":3},{"sortDirection":1,"sortKey":"SCORING_CATEGORY_2010#2147#-1","scipId":"2010#2147#-1","sortType":"SCORING_CATEGORY","name":"Hits","width":3,"shortName":"Hit","key":"2010#2147#-1","maxWidth":3},{"sortDirection":1,"sortKey":"SCORING_CATEGORY_2010#2092#-1","scipId":"2010#2092#-1","sortType":"SCORING_CATEGORY","name":"Blocks -- A player blocks a shot by an opposing shooter.","width":3,"shortName":"Blk","key":"2010#2092#-1","maxWidth":3},{"sortDirection":1,"sortKey":"SCORING_CATEGORY_2010#2096#-1","scipId":"2010#2096#-1","sortType":"SCORING_CATEGORY","name":"Faceoffs Won","width":3,"shortName":"FOW","key":"2010#2096#-1","maxWidth":3},{"sortDirection":-1,"sortKey":"SCORING_CATEGORY_2010#2095#-1","scipId":"2010#2095#-1","sortType":"SCORING_CATEGORY","name":"Faceoffs Lost","width":3,"shortName":"FOL","key":"2010#2095#-1","maxWidth":3}]},"rows":[{"posId":"206","statusId":"1","scorer":{"scorerId":"03167","name":"Bo Horvat","shortName":"B. Horvat","posShortNames":"C","teamShortName":"NYI"},"cells":[{"content":"11 • 39","toolTip":"C rank: 11 • Overall rank: 39"},{"content":"31"},{"content":"@TOR<br/>Sat 6:00PM","eventId":"06mjt"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"206","statusId":"1","scorer":{"scorerId":"03duf","name":"Dylan Larkin","shortName":"D. Larkin","posShortNames":"C","teamShortName":"DET"},"cells":[{"content":"114 • 380","toolTip":"C rank: 114 • Overall rank: 380"},{"content":"30"},{"content":"SJS<br/>Sat 6:00PM","eventId":"06mju"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"206","statusId":"1","scorer":{"scorerId":"01f6d","name":"Ryan O'Reilly","shortName":"R. O'Reilly","posShortNames":"C","teamShortName":"NSH"},"cells":[{"content":"21 • 80","toolTip":"C rank: 21 • Overall rank: 80"},{"content":"35"},{"content":"STL<br/>Sat 7:00PM","eventId":"06mjy"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"206","statusId":"1","scorer":{"scorerId":"048x9","name":"Elias Pettersson","shortName":"E. Pettersson","posShortNames":"C","teamShortName":"VAN"},"cells":[{"content":"10 • 32","toolTip":"C rank: 10 • Overall rank: 32"},{"content":"27"},{"content":"VAN 2<br/>@TBL 1","eventId":"06mjq"},{"content":"6.55"},{"content":"6.55"},{"content":"1"},{"content":"1"},{"content":"0"},{"content":"1"},{"content":"2"},{"content":"0"},{"content":"1"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"5"},{"content":"5"}]},{"posId":"203","statusId":"1","scorer":{"scorerId":"042ye","name":"Jesper Bratt","shortName":"J. Bratt","posShortNames":"LW,RW","teamShortName":"NJD"},"cells":[{"content":"25 • 108","toolTip":"LW rank: 25 • Overall rank: 108"},{"content":"28"},{"content":"NJD 2<br/>@WSH 4 F","eventId":"06mjo"},{"content":"1.35"},{"content":"1.35"},{"content":"1"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"3"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"203","statusId":"1","scorer":{"scorerId":"04a9v","name":"Morgan Geekie","shortName":"M. Geekie","posShortNames":"C,LW,RW","teamShortName":"BOS"},"cells":[{"content":"32 • 132","toolTip":"LW rank: 32 • Overall rank: 132"},{"content":"28"},{"content":"@LAK<br/>Sat 8:00PM","eventId":"06mjz"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"203","statusId":"1","scorer":{"scorerId":"051yz","name":"Dylan Holloway","shortName":"D. Holloway","posShortNames":"LW,RW","teamShortName":"STL"},"cells":[{"content":"58 • 199","toolTip":"LW rank: 58 • Overall rank: 199"},{"content":"25"},{"content":"@NSH<br/>Sat 7:00PM","eventId":"06mjy"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"203","statusId":"1","scorer":{"scorerId":"05j3d","name":"Bobby McMann","shortName":"B. McMann","posShortNames":"LW","teamShortName":"SEA"},"cells":[{"content":"30 • 129","toolTip":"LW rank: 30 • Overall rank: 129"},{"content":"30"},{"content":"@FLA<br/>Sat 5:00PM","eventId":"06mjr"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"204","statusId":"1","scorer":{"scorerId":"03e1n","name":"Adrian Kempe","shortName":"A. Kempe","posShortNames":"RW","teamShortName":"LAK"},"cells":[{"content":"84 • 281","toolTip":"RW rank: 84 • Overall rank: 281"},{"content":"30"},{"content":"BOS<br/>Sat 8:00PM","eventId":"06mjz"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"204","statusId":"1","scorer":{"scorerId":"04843","name":"Mathieu Olivier","shortName":"M. Olivier","posShortNames":"RW","teamShortName":"CBJ"},"cells":[{"content":"146 • 441","toolTip":"RW rank: 146 • Overall rank: 441"},{"content":"29"},{"content":"NYR<br/>Sat 6:00PM","eventId":"06mjv"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"204","statusId":"1","scorer":{"scorerId":"04ln4","name":"Kiefer Sherwood","shortName":"K. Sherwood","posShortNames":"LW,RW","teamShortName":"SJS"},"cells":[{"content":"38 • 145","toolTip":"RW rank: 38 • Overall rank: 145"},{"content":"31"},{"content":"@DET<br/>Sat 6:00PM","eventId":"06mju"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"204","statusId":"1","scorer":{"scorerId":"01zvf","name":"Mark Stone","shortName":"M. Stone","posShortNames":"RW","teamShortName":"VGK"},"cells":[{"content":"2 • 15","toolTip":"RW rank: 2 • Overall rank: 15"},{"content":"34"},{"content":"PIT<br/>Sat 9:00PM","eventId":"06mk0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"202","statusId":"1","scorer":{"scorerId":"03rad","name":"Thomas Chabot","shortName":"T. Chabot","posShortNames":"D","teamShortName":"OTT"},"cells":[{"content":"19 • 92","toolTip":"D rank: 19 • Overall rank: 92"},{"content":"29"},{"content":"@PHI<br/>Sat 6:00PM","eventId":"06mjw"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"202","statusId":"1","scorer":{"scorerId":"01zu5","name":"Justin Faulk","shortName":"J. Faulk","posShortNames":"D","teamShortName":"DET"},"cells":[{"content":"65 • 240","toolTip":"D rank: 65 • Overall rank: 240"},{"content":"34"},{"content":"SJS<br/>Sat 6:00PM","eventId":"06mju"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"202","statusId":"1","scorer":{"scorerId":"04lbz","name":"Quinn Hughes","shortName":"Q. Hughes","posShortNames":"D","teamShortName":"MIN"},"cells":[{"content":"2 • 10","toolTip":"D rank: 2 • Overall rank: 10"},{"content":"27"},{"content":""},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"202","statusId":"1","scorer":{"scorerId":"05y7m","name":"Denton Mateychuk","shortName":"D. Mateychuk","posShortNames":"D","teamShortName":"CBJ"},"cells":[{"content":"112 • 424","toolTip":"D rank: 112 • Overall rank: 424"},{"content":"22"},{"content":"NYR<br/>Sat 6:00PM","eventId":"06mjv"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"202","statusId":"1","scorer":{"scorerId":"02wy5","name":"Nikita Zadorov","shortName":"N. Zadorov","posShortNames":"D","teamShortName":"BOS"},"cells":[{"content":"28 • 116","toolTip":"D rank: 28 • Overall rank: 116"},{"content":"31"},{"content":"@LAK<br/>Sat 8:00PM","eventId":"06mjz"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"202","statusId":"1","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"posId":"208","statusId":"1","scorer":{"scorerId":"04y4m","name":"Connor Bedard","shortName":"C. Bedard","posShortNames":"C","teamShortName":"CHI"},"cells":[{"content":"440 • 486","toolTip":"Skt rank: 440 • Overall rank: 486"},{"content":"21"},{"content":"DAL<br/>Sat 6:00PM","eventId":"06mjx"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"204","statusId":"2","scorer":{"scorerId":"06bdr","name":"Roman Kantserov","shortName":"R. Kantserov","posShortNames":"RW","teamShortName":"CHI"},"cells":[{"content":"122 • 377","toolTip":"RW rank: 122 • Overall rank: 377"},{"content":"22"},{"content":"DAL<br/>Sat 6:00PM","eventId":"06mjx"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"204","statusId":"2","scorer":{"scorerId":"06snb","name":"Benjamin Kindel","shortName":"B. Kindel","posShortNames":"C,RW","teamShortName":"PIT"},"cells":[{"content":"105 • 337","toolTip":"RW rank: 105 • Overall rank: 337"},{"content":"19"},{"content":"@VGK<br/>Sat 9:00PM","eventId":"06mk0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"204","statusId":"2","scorer":{"scorerId":"06hj9","name":"Porter Martone","shortName":"P. Martone","posShortNames":"RW","teamShortName":"PHI"},"cells":[{"content":"167 • 528","toolTip":"RW rank: 167 • Overall rank: 528"},{"content":"19"},{"content":"OTT<br/>Sat 6:00PM","eventId":"06mjw"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"202","statusId":"2","scorer":{"scorerId":"05ril","name":"Simon Nemec","shortName":"S. Nemec","posShortNames":"D","teamShortName":"CGY"},"cells":[{"content":"114 • 426","toolTip":"D rank: 114 • Overall rank: 426"},{"content":"22"},{"content":""},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"202","statusId":"2","scorer":{"scorerId":"059e0","name":"Jake Sanderson","shortName":"J. Sanderson","posShortNames":"D","teamShortName":"OTT"},"cells":[{"content":"234 • 736","toolTip":"D rank: 234 • Overall rank: 736"},{"content":"24"},{"content":"@PHI<br/>Sat 6:00PM","eventId":"06mjw"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"statusId":"2","description":"Reserve spot(s) available Limited by Max Players on Team","numSpotsAvailableText":"Reserve spot(s) available","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"posId":"206","statusId":"3","scorer":{"scorerId":"02un7","name":"Aleksander Barkov","shortName":"A. Barkov","posShortNames":"C","teamShortName":"FLA"},"cells":[{"content":"200 • 698","toolTip":"C rank: 200 • Overall rank: 698"},{"content":"31"},{"content":"SEA<br/>Sat 5:00PM","eventId":"06mjr"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"206","statusId":"3","scorer":{"scorerId":"0045u","name":"Jordan Staal","shortName":"J. Staal","posShortNames":"C","teamShortName":"CAR"},"cells":[{"content":"125 • 428","toolTip":"C rank: 125 • Overall rank: 428"},{"content":"38"},{"content":"CAR 1<br/>@WPG 2","eventId":"06mjp"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"204","statusId":"3","scorer":{"scorerId":"03dms","name":"Kevin Fiala","shortName":"K. Fiala","posShortNames":"LW,RW","teamShortName":"LAK"},"cells":[{"content":"651 • 2730","toolTip":"LW rank: 651 • Overall rank: 2730"},{"content":"30"},{"content":"BOS<br/>Sat 8:00PM","eventId":"06mjz"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"204","statusId":"3","scorer":{"scorerId":"03rik","name":"Troy Terry","shortName":"T. Terry","posShortNames":"RW","teamShortName":"ANA"},"cells":[{"content":"1557 • 7912","toolTip":"RW rank: 1557 • Overall rank: 7912"},{"content":"29"},{"content":""},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"statusId":"3","description":"Inj Res spot(s) available","numSpotsAvailable":0,"numSpotsAvailableText":"Inj Res spot(s) available","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"statusId":"y","scorerColumn":"Totals","bold":true,"scorer":{"team":false,"rookie":false,"minorsEligible":false},"cells":[{"content":""},{"content":""},{"content":"7.9"},{"content":"3.95"},{"content":"2"},{"content":"1"},{"content":"0"},{"content":"1"},{"content":"5"},{"content":"0"},{"content":"1"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"5"},{"content":"5"}]}]},{"scGroup":"2020","header":{"cells":[{"sortDirection":1,"name":"Position rank â¢ Overall rank","width":6,"shortName":"Rk","key":"rankPosOv"},{"sortDirection":1,"sortKey":"AGE","sortType":"AGE","name":"Age","width":3,"shortName":"Age","key":"age"},{"eventStr":true,"sortDirection":1,"name":"Opponent","shortName":"Opp","key":"opponent"},{"sortDirection":1,"sortKey":"SCORE","sortType":"SCORE","name":"Fantasy Points","shortName":"FPts","key":"fpts"},{"sortDirection":1,"sortKey":"FPTS_PER_GAME","sortType":"FPTS_PER_GAME","name":"Average Fantasy Points per Game","shortName":"FP/G","key":"fptsPerGame"},{"sortDirection":1,"sortKey":"SCORING_CATEGORY_2020#2100#-1","scipId":"2020#2100#-1","sortType":"SCORING_CATEGORY","name":"Games Played","width":3,"shortName":"GP","key":"2020#2100#-1","maxWidth":3},{"sortDirection":1,"sortKey":"SCORING_CATEGORY_2020#231b#-1","scipId":"2020#231b#-1","sortType":"SCORING_CATEGORY","name":"Wins (Goalies only) -- Includes Overtime Wins and Shootout Wins. Skaters cannot get a win using this category - for that - use the \"regular\" Wins category.","width":3,"shortName":"W","key":"2020#231b#-1","maxWidth":3},{"sortDirection":-1,"sortKey":"SCORING_CATEGORY_2020#232c#-1","scipId":"2020#232c#-1","sortType":"SCORING_CATEGORY","name":"Overtime Losses + Shootout Losses","width":6,"shortName":"OL+ShL","key":"2020#232c#-1","maxWidth":6},{"sortDirection":-1,"sortKey":"SCORING_CATEGORY_2020#2140#-1","scipId":"2020#2140#-1","sortType":"SCORING_CATEGORY","name":"Goals Against","width":3,"shortName":"GA","key":"2020#2140#-1","maxWidth":3},{"sortDirection":1,"sortKey":"SCORING_CATEGORY_2020#2230#-1","scipId":"2020#2230#-1","sortType":"SCORING_CATEGORY","name":"Saves","width":3,"shortName":"SV","key":"2020#2230#-1","maxWidth":3},{"sortDirection":1,"sortKey":"SCORING_CATEGORY_2020#2290#-1","scipId":"2020#2290#-1","sortType":"SCORING_CATEGORY","name":"Shutouts","width":3,"shortName":"SHO","key":"2020#2290#-1","maxWidth":3},{"sortDirection":1,"sortKey":"SCORING_CATEGORY_2020#2090#-1","scipId":"2020#2090#-1","sortType":"SCORING_CATEGORY","name":"Assists","width":3,"shortName":"A","key":"2020#2090#-1","maxWidth":3}]},"rows":[{"posId":"201","statusId":"1","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"posId":"201","statusId":"1","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"posId":"201","statusId":"2","scorer":{"scorerId":"03ynu","name":"Carter Hart","shortName":"C. Hart","posShortNames":"G","teamShortName":"VGK"},"cells":[{"content":"7 • 25","toolTip":"G rank: 7 • Overall rank: 25"},{"content":"28"},{"content":"PIT<br/>Sat 9:00PM","eventId":"06mk0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"201","statusId":"2","scorer":{"scorerId":"04qzc","name":"Joel Hofer","shortName":"J. Hofer","posShortNames":"G","teamShortName":"STL"},"cells":[{"content":"17 • 57","toolTip":"G rank: 17 • Overall rank: 57"},{"content":"26"},{"content":"@NSH<br/>Sat 7:00PM","eventId":"06mjy"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"posId":"201","statusId":"2","scorer":{"scorerId":"01zs1","name":"Scott Wedgewood","shortName":"S. Wedgewood","posShortNames":"G","teamShortName":"COL"},"cells":[{"content":"46 • 449","toolTip":"G rank: 46 • Overall rank: 449"},{"content":"34"},{"content":""},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]},{"statusId":"2","description":"Reserve spot(s) available Limited by Max Players on Team","numSpotsAvailableText":"Reserve spot(s) available","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"statusId":"3","description":"Inj Res spot(s) available","numSpotsAvailable":0,"numSpotsAvailableText":"Inj Res spot(s) available","cells":[{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""},{"content":""}]},{"statusId":"y","scorerColumn":"Totals","bold":true,"scorer":{"team":false,"rookie":false,"minorsEligible":false},"cells":[{"content":""},{"content":""},{"content":"0"},{"content":""},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"},{"content":"0"}]}]}]};
