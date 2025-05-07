document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch JSON data
    const response = await fetch("./JSON/schedule.json");
    const data = await response.json();
    //GET DOM elements
    const tableBody = document.querySelector("#schedule tbody");
    const scheduleFilter = document.getElementById("scheduleFilter");
    const teamFilter = document.getElementById("teamFilter");
    const displaySchedule = () => {
      tableBody.innerHTML = "";
      const selectedMonth = scheduleFilter.value.toLowerCase();
      const selectedTeam = teamFilter.value.toLowerCase();
     // Loop each game date in schedule data
      data.leagueSchedule.gameDates.forEach((date) => {
        // Loop each game in the date
        date.games.forEach((game) => {
          const gameDate = new Date(game.gameDateUTC);
          const gameMonth = gameDate.toLocaleString("en-US", { month: "long" }).toLowerCase();
          const homeTeamLogo = `images/team_logos/${game.homeTeam.teamId}.svg`;
          const awayTeamLogo = `images/team_logos/${game.awayTeam.teamId}.svg`;
          // Create matchup
          const matchup = `<img src="${awayTeamLogo}"> - ${game.awayTeam.teamName} VS ${game.homeTeam.teamName} - <img src="${homeTeamLogo}">`;

          // Check filters
          const monthMatch  = selectedMonth === "all" || gameMonth === selectedMonth;
          const teamMatch  = selectedTeam === "all" ||game.awayTeam.teamName.toLowerCase().includes(selectedTeam) ||game.homeTeam.teamName.toLowerCase().includes(selectedTeam);

          // Add matching games
          if (monthMatch  && teamMatch ) {
            const row = `
              <tr>
                <td>${gameDate.toLocaleDateString()}</td>
                <td>${matchup}</td>
                <td>${game.arenaName}</td>
                <td>${game.gameStatusText}</td>
              </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
          }
        });
      });

      if (!tableBody.innerHTML) {
        tableBody.innerHTML = "<tr><td colspan='4'>No games found</td></tr>";
      }
    };

    displaySchedule();
    //Event listeners for filters
    scheduleFilter.addEventListener("change", displaySchedule);
    teamFilter.addEventListener("change", displaySchedule);
  } catch (error) {
    console.error("Error loading schedule data:", error);
  }
});
