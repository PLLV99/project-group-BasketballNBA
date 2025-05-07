document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch JSON data
    const response = await fetch("./JSON/standings.json");
    const data = await response.json();
    //GET DOM elements
    const filterTypeSelect = document.getElementById("filterType");
    const standingsContainer = document.getElementById("standings");

    //Group teams by key (Conference/Division)
    function groupBy(data, key) {
      return data.reduce((result, team) => {
        const group = team[key];
        if (!result[group]) {
          result[group] = [];
        }
        result[group].push(team);
        return result;
      }, {});
    }

    // Create table from team group
    function createTable(groupName, teams, filterType) {
      let html = `
    <h3 class="mt-3">${groupName}</h3>
    <table class="table table-striped table-hover">
      <thead>
        <tr>
        <th>Rank</th>
          <th>Team</th>
          <th>W</th>
          <th>L</th>
          <th>Win %</th>
          <th>Home</th>
          <th>Away</th>
          <th>Last 10</th>
        </tr>
      </thead>
      <tbody>
  `;

      // Add row for each team
      teams.forEach((team) => {
        const last10 = team.L10 !== undefined ? team.L10 : "-";
        // Check conference or division rank
        const rank =
          filterType === "conference" ? team.PlayoffRank : team.DivisionRank;
        const teamLogo = `images/team_logos/${team.TeamID}.svg`;

        html += `
      <tr>
      <td>${rank !== undefined ? rank : "-"}</td>
        <td><img src="${teamLogo}">${team.TeamName}</td>
        <td>${team.WINS}</td>
        <td>${team.LOSSES}</td>
        <td>${team.WinPCT}</td>
        <td>${team.HOME}</td>
        <td>${team.ROAD}</td>
        <td>${last10}</td>
      </tr>
    `;
      });

      html += "</tbody></table>";
      return html;
    }

    // Display standings based on filter
    function renderStandings(filterType) {
      const grouped = groupBy(
        data,
        filterType === "conference" ? "Conference" : "Division"
      );
      standingsContainer.innerHTML = "";

      for (const groupName in grouped) {
        standingsContainer.innerHTML += createTable(
          groupName,
          grouped[groupName],
          filterType
        );
      }
    }

    // Initial display 
    renderStandings("conference");

    // Update standings on filter change
    filterTypeSelect.addEventListener("change", (e) => {
      renderStandings(e.target.value);
    });
  } catch (error) {
    console.error("Error loading JSON data:", error);
  }
});
