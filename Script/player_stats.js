// get pId

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const playerId = urlParams.get("pId");
console.log("Player ID:", playerId);


// change player image
const pImage = document.querySelector("#p_image");
pImage.src = `images/player/${playerId}.png`;
pImage.alt = `Player ${playerId}`;

// name
const pName = document.querySelector("#p_name");
pName.textContent = playerId;

// 获取球队数据
async function getTeamData() {
    try {
        const response = await fetch('./data/teams.json');
        const teams = await response.json();
        return teams;
    } catch (error) {
        console.error('加载球队数据时出错:', error);
        return [];
    }
}

// 根据球队ID获取球队信息
function getTeamById(teams, teamId) {
    if (!teamId) return null;
    return teams.find(team => team.id === parseInt(teamId));
}

// 根据球队 ID 获取球队 logo URL
function getTeamLogoUrl(teamId) {
    return `./images/team_logos/${teamId}.svg`;
}

// 显示球队logo
function displayTeamLogo(teamId, teamAbbreviation) {
    if (!teamId) return;
    
    const teamLogo = document.createElement('img');
    teamLogo.src = getTeamLogoUrl(teamId);
    teamLogo.alt = `${teamAbbreviation} Logo`;
    teamLogo.className = 'team-logo-player';
    
    const teamLogoContainer = document.getElementById('teamLogoContainer');
    if (teamLogoContainer) {
        teamLogoContainer.appendChild(teamLogo);
    }
}

// input playerstatus xml
// function getParameterByName(name, url = window.location.href) {
//     name = name.replace(/[\[\]]/g, '\\$&');
//     var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
//         results = regex.exec(url);
//     if (!results) return null;
//     if (!results[2]) return '';
//     return decodeURIComponent(results[2].replace(/\+/g, ' '));
// }

// 加载球队数据
let teamsData = [];

// 加载球队数据
getTeamData().then(data => {
    teamsData = data;
});

//  XML 
fetch('xml/player_stats_name.xml')
    .then(response => response.text())
    .then(xmlText => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");

        // get data
        const players = xmlDoc.getElementsByTagName("PlayerSeasonStats");

        // URL player_id
        const targetPlayerId = playerId;
        if (!targetPlayerId) {
            console.error(" player_id not found!!!!! ");
            return;
        }

        let selectedPlayer = null;
        for (let i = 0; i < players.length; i++) {
            const pid = players[i].getElementsByTagName("PLAYER_ID")[0].textContent;
            const season = players[i].getElementsByTagName("SEASON_ID")[0].textContent;

            //  2024-25 
            if (pid === targetPlayerId && season === "2024-25") {
                selectedPlayer = players[i];
                break;
            }
        }

        if (selectedPlayer) {
            // XML
            const getText = tagName => {
                const el = selectedPlayer.getElementsByTagName(tagName)[0];
                return el ? el.textContent : "N/A";
            };

            // update
            document.getElementById("p_name").textContent = getText("PLAYER");
            document.getElementById("p_image").src = `images/player/${targetPlayerId}.png`; // player_id.jpg

            // 获取球队ID并显示logo
            const teamId = getText("TEAM_ID");
            const teamAbbreviation = getText("TEAM_ABBREVIATION");
            displayTeamLogo(teamId, teamAbbreviation);

            // insert
            const pTeam = document.getElementById("p_team");
            const pAge = document.getElementById("p_age");
            const pSeason = document.getElementById("p_season");
            
            if (pTeam && pAge && pSeason) {
                pTeam.textContent = getText("TEAM_ABBREVIATION");
                pAge.textContent = getText("PLAYER_AGE");
                pSeason.textContent = "2024-2025";
            } else {
                // 旧结构兼容
                const infoPs = document.querySelectorAll("main .col-md-8 .player-info > p");
                if (infoPs.length >= 3) {
                    infoPs[0].innerHTML = `<strong>Team:</strong> ${getText("TEAM_ABBREVIATION")}`;
                    infoPs[1].innerHTML = `<strong>Age:</strong> ${getText("PLAYER_AGE")}`;
                    infoPs[2].innerHTML = `<strong>Season:</strong> 2024-2025`;
                }
            }

            // create table
            const tbody = document.querySelector(".table-striped tbody");
            // tr*7 td*2
            tbody.innerHTML = `
                <tr><td>Games Played</td><td>${getText("GP")}</td></tr>
                <tr><td>Points per Game</td><td>${getText("PTS")}</td></tr>
                <tr><td>Rebounds per Game</td><td>${getText("REB")}</td></tr>
                <tr><td>Assists per Game</td><td>${getText("AST")}</td></tr>
                <tr><td>Field Goal %</td><td>${(parseFloat(getText("FG_PCT")) * 100).toFixed(1)}%</td></tr>
                <tr><td>Three-Point %</td><td>${(parseFloat(getText("FG3_PCT")) * 100).toFixed(1)}%</td></tr>
                <tr><td>Free Throw %</td><td>${(parseFloat(getText("FT_PCT")) * 100).toFixed(1)}%</td></tr>
            `;

            // advance data
            // const advTbody = document.querySelector(".table-bordered tbody");
            // advTbody.innerHTML = `
            //     <tr><td>Efficiency Rating</td><td>${getText("EFF")}</td></tr>
            //     <tr><td>Usage Rate</td><td>${(parseFloat(getText("USG_PCT")) * 100).toFixed(1)}%</td></tr>
            //     <tr><td>Player Efficiency Rating (PER)</td><td>${getText("PER")}</td></tr>
            // `;
        } else {
            console.error("data not found!!!!!!!");
        }
    })
    .catch(error => {
        console.error("XML error~~~~~~~:", error);
    });
