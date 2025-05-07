 const playerLinks = document.querySelectorAll("a[href^='/stats/player/']");
  
 playerLinks.forEach(function(link) {
   link.addEventListener("click", function(event) {

     event.preventDefault();
     window.location.href = "player_stats.html"; 
   });
 });


 document.addEventListener("DOMContentLoaded", function () {
  
  fetch('xml/nba_top_pts_.xml')
    .then(response => response.text())
    .then(data => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml");
      const rows = xmlDoc.getElementsByTagName("row");
      const tableBody = document.getElementById("pointsTable").querySelector("tbody");
      tableBody.innerHTML = "";

      // get xml values
      for (let i = 0; i < rows.length; i++) {
        const playerId = rows[i].querySelector("PLAYER_ID")?.textContent;
        const player = rows[i].getElementsByTagName("PLAYER")[0].textContent;
        const team = rows[i].getElementsByTagName("TEAM")[0].textContent;
        const pts = rows[i].getElementsByTagName("PTS")[0].textContent;

        //  create tr td
        const row = `
          <tr>
            <td>${i + 1}.</td>
            <td>
              <a href="/player_stats.html?pId=${playerId}">${player}</a>
              <small>(${team})</small>
            </td>
            <td>${pts}</td>
          </tr>
        `;

        tableBody.insertAdjacentHTML('beforeend', row); // insert into row
      }
    })
    .catch(error => console.error("Error loading XML file:", error));
});

// 获取球队数据
async function getTeamData() {
    try {
        const response = await fetch('./data/teams.json');
        const teams = await response.json();
        return teams;
    } catch (error) {
        console.error('import teams json error:', error);
        return [];
    }
}

// team ID
function getTeamIdByName(teams, teamName) {
    const team = teams.find(t => t.nickname === teamName);
    return team ? team.id : null;
}

// 根据球队 ID 获取球队 logo URL
function getTeamLogoUrl(teamId) {
    return `./images/team_logos/${teamId}.svg`;
}

// 加载即将到来的比赛
async function loadUpcomingGames() {
  try {
    const [scheduleData, teams] = await Promise.all([
      fetch('./data/schedule.json').then(res => res.json()),
      getTeamData()
    ]);
    
    const upcomingGamesDiv = document.getElementById('upcomingGames');
    const today = new Date();
    
    // 筛选未来5场比赛
    const upcomingGames = scheduleData.filter(game => {
      const gameDate = new Date(game.date);
      return gameDate >= today;
    }).slice(0, 5);
    
    // 渲染比赛信息
    upcomingGames.forEach(game => {
      const gameDate = new Date(game.date);
      const homeTeamId = getTeamIdByName(teams, game.homeTeam);
      const awayTeamId = getTeamIdByName(teams, game.awayTeam);
      
      const gameElement = document.createElement('div');
      gameElement.className = 'p-3 border-bottom';
      gameElement.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <div class="team-logos d-flex align-items-center">
              <img src="${getTeamLogoUrl(homeTeamId)}" alt="${game.homeTeam}" class="team-logo me-2">
              <span class="vs-text mx-2">vs</span>
              <img src="${getTeamLogoUrl(awayTeamId)}" alt="${game.awayTeam}" class="team-logo ms-2">
            </div>
            <div class="ms-3">
              <div class="team-name">${game.homeTeam} vs ${game.awayTeam}</div>
              <small class="text-muted">${gameDate.toLocaleDateString()}</small>
            </div>
          </div>
          <div class="text-end">
            <small class="text-muted">${game.time}</small>
          </div>
        </div>
      `;
      upcomingGamesDiv.appendChild(gameElement);
    });
  } catch (error) {
    console.error('Error loading schedule:', error);
    
    
    const upcomingGamesDiv = document.getElementById('upcomingGames');
    upcomingGamesDiv.innerHTML = `
      <div class="p-3 text-center text-muted">
        <p>Unable to load schedule information temporarily</p>
      </div>
    `;
  }
}

// loading page
document.addEventListener('DOMContentLoaded', () => {
  loadUpcomingGames();
});



