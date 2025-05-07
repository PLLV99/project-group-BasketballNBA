document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/Json/score.json");
    const data = await response.json();

    // Get table elements
    const recentMatchesTable = document.getElementById("recent-matches-table").getElementsByTagName('tbody')[0];
    const upcomingMatchesTable = document.getElementById("upcoming-matches-table").getElementsByTagName('tbody')[0];
    const liveMatchesTable = document.getElementById("live-matches-table").getElementsByTagName('tbody')[0];

    let matchResults = data["Recent Test Result"] || [];
    let upcomingMatches = data["Upcoming Games"] || [];

    // Function to generate logo image HTML
    const getTeamLogo = (teamId) => {
      return `<img src="/images/team_logos/${teamId}.svg" alt="Team Logo" width="30" height="30">`;
    };

    // Function to create URL parameters for score details
    const getScoreDetailUrl = (match) => {
      const params = new URLSearchParams();
      params.append('date', match.Date);
      params.append('teams', match.TEAM_NAME);
      params.append('score', match.Score || "N/A");
      return `scoredetail.html?${params.toString()}`;
    };

    // Display ALL recent matches in table format with clickable rows
    const displayRecentMatches = () => {
      recentMatchesTable.innerHTML = "";
      
      if (matchResults.length === 0) {
        recentMatchesTable.innerHTML = `
          <tr>
            <td colspan="4" class="text-center">No recent matches available.</td>
          </tr>
        `;
        return;
      }

      // Sort by date (newest first)
      matchResults.sort((a, b) => new Date(b.Date) - new Date(a.Date));
      
      // Display ALL matches
      matchResults.forEach(match => {
        const row = document.createElement("tr");
        row.classList.add('clickable-row');
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
          window.location.href = getScoreDetailUrl(match);
        });

        const homeTeamLogo = getTeamLogo(match.teamId[match.TEAM_NAME.split(' vs ')[0]]);
        const awayTeamLogo = getTeamLogo(match.teamId[match.TEAM_NAME.split(' vs ')[1]]);

        row.innerHTML = `
          <td>${formatDate(match.Date)}</td>
          <td>${homeTeamLogo} ${match.TEAM_NAME} ${awayTeamLogo}</td>
          <td>${match.Score || "N/A"}</td>
          <td>Final</td>
        `;
        recentMatchesTable.appendChild(row);
      });
    };

    // Display upcoming matches in table format
    const displayUpcomingMatches = () => {
      upcomingMatchesTable.innerHTML = "";
      
      if (upcomingMatches.length === 0) {
        upcomingMatchesTable.innerHTML = `
          <tr>
            <td colspan="3" class="text-center">No upcoming matches scheduled.</td>
          </tr>
        `;
        return;
      }

      upcomingMatches.sort((a, b) => new Date(a.Date) - new Date(b.Date));
      
      upcomingMatches.forEach(match => {
        const row = document.createElement("tr");
        const homeTeamLogo = getTeamLogo(match.teamId[match.TEAM_NAME.split(' vs ')[0]]);
        const awayTeamLogo = getTeamLogo(match.teamId[match.TEAM_NAME.split(' vs ')[1]]);

        row.innerHTML = `
          <td>${formatDate(match.Date)}</td>
          <td>${homeTeamLogo} ${match.TEAM_NAME} ${awayTeamLogo}</td>
          <td>Scheduled</td>
        `;
        upcomingMatchesTable.appendChild(row);
      });
    };

    // Helper function to format date
    const formatDate = (dateString) => {
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Initialize displays
    displayRecentMatches();
    displayUpcomingMatches();

    // Calendar functionality with clickable matches
    const calendarContainer = document.getElementById("calendar");
    const scheduleResults = document.getElementById("schedule-results");
    const monthDisplay = document.getElementById("current-month");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");

    let currentMonthIndex = new Date().getMonth();

    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];

    const renderCalendar = () => {
      calendarContainer.innerHTML = "";
      monthDisplay.textContent = months[currentMonthIndex];

      const daysInMonth = new Date(2025, currentMonthIndex + 1, 0).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day";
        dayDiv.textContent = i;

        const dateStr = new Date(2025, currentMonthIndex, i).toISOString().split("T")[0];
        dayDiv.dataset.date = dateStr;

        dayDiv.addEventListener("click", () => {
          displayDayMatches(new Date(dateStr));
        });

        calendarContainer.appendChild(dayDiv);
      }
    };

    const displayDayMatches = (selectedDate) => {
      scheduleResults.innerHTML = "";
      const selectedDateStr = selectedDate.toISOString().split("T")[0];

      const matchesOnDate = [
        ...matchResults.filter(match => 
          new Date(match.Date).toISOString().split("T")[0] === selectedDateStr),
        ...upcomingMatches.filter(match => 
          new Date(match.Date).toISOString().split("T")[0] === selectedDateStr)
      ];

      if (matchesOnDate.length === 0) {
        scheduleResults.innerHTML = `
          <div class="alert alert-info">
            No matches scheduled for ${selectedDate.toLocaleDateString()}
          </div>
        `;
        return;
      }

      const table = document.createElement("table");
      table.className = "table table-striped table-hover";
      
      const thead = document.createElement("thead");
      thead.className = "table-dark";
      thead.innerHTML = `
        <tr>
          <th>Matchup</th>
          <th>Score</th>
          <th>Status</th>
        </tr>
      `;
      
      const tbody = document.createElement("tbody");
      
      matchesOnDate.forEach(match => {
        const row = document.createElement("tr");
        const isPastMatch = matchResults.some(m => m.Date === match.Date);
        
        if (isPastMatch) {
          row.classList.add('clickable-row');
          row.style.cursor = 'pointer';
          row.addEventListener('click', () => {
            window.location.href = getScoreDetailUrl(match);
          });
        }

        const homeTeamLogo = getTeamLogo(match.teamId[match.TEAM_NAME.split(' vs ')[0]]);
        const awayTeamLogo = getTeamLogo(match.teamId[match.TEAM_NAME.split(' vs ')[1]]);

        row.innerHTML = `
          <td>${homeTeamLogo} ${match.TEAM_NAME} ${awayTeamLogo}</td>
          <td>${isPastMatch ? (match.Score || "N/A") : "-"}</td>
          <td>${isPastMatch ? "Final" : "Scheduled"}</td>
        `;
        tbody.appendChild(row);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      scheduleResults.appendChild(table);
    };

    // Initialize calendar
    renderCalendar();

    // Event listeners for calendar navigation
    prevMonthBtn.addEventListener("click", () => {
      if (currentMonthIndex > 0) {
        currentMonthIndex--;
        renderCalendar();
      }
    });

    nextMonthBtn.addEventListener("click", () => {
      if (currentMonthIndex < 11) {
        currentMonthIndex++;
        renderCalendar();
      }
    });

    // Show today's matches by default
    displayDayMatches(new Date());

  } catch (error) {
    console.error("Error loading score data:", error);
    
    // Display error messages in tables
    document.getElementById("recent-matches-table").getElementsByTagName('tbody')[0].innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger">Error loading recent matches</td>
      </tr>
    `;
    
    document.getElementById("upcoming-matches-table").getElementsByTagName('tbody')[0].innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-danger">Error loading upcoming matches</td>
      </tr>
    `;
  }
});
/**document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/Json/score.json");
    const data = await response.json();

    // Get table elements
    const recentMatchesTable = document.getElementById("recent-matches-table").getElementsByTagName('tbody')[0];
    const upcomingMatchesTable = document.getElementById("upcoming-matches-table").getElementsByTagName('tbody')[0];
    const liveMatchesTable = document.getElementById("live-matches-table").getElementsByTagName('tbody')[0];

    let matchResults = data["Recent Test Result"] || [];
    let upcomingMatches = data["Upcoming Games"] || [];

    // Function to generate logo image HTML
    const getTeamLogo = (teamId) => {
      return `<img src="/images/team_logos/${teamId}.svg" alt="Team Logo" width="30" height="30">`;
    };

    // Display ALL recent matches in table format
    const displayRecentMatches = () => {
      recentMatchesTable.innerHTML = "";
      
      if (matchResults.length === 0) {
        recentMatchesTable.innerHTML = `
          <tr>
            <td colspan="4" class="text-center">No recent matches available.</td>
          </tr>
        `;
        return;
      }

      // Sort by date (newest first)
      matchResults.sort((a, b) => new Date(b.Date) - new Date(a.Date));
      
      // Display ALL matches
      matchResults.forEach(match => {
        const row = document.createElement("tr");
        const homeTeamLogo = getTeamLogo(match.teamId[match.TEAM_NAME.split(' vs ')[0]]);
        const awayTeamLogo = getTeamLogo(match.teamId[match.TEAM_NAME.split(' vs ')[1]]);

        row.innerHTML = `
          <td>${formatDate(match.Date)}</td>
          <td>${homeTeamLogo} ${match.TEAM_NAME} ${awayTeamLogo}</td>
          <td>${match.Score || "N/A"}</td>
          <td>Final</td>
        `;
        recentMatchesTable.appendChild(row);
      });
    };

    // Display upcoming matches in table format
    const displayUpcomingMatches = () => {
      upcomingMatchesTable.innerHTML = "";
      
      if (upcomingMatches.length === 0) {
        upcomingMatchesTable.innerHTML = `
          <tr>
            <td colspan="3" class="text-center">No upcoming matches scheduled.</td>
          </tr>
        `;
        return;
      }

      upcomingMatches.sort((a, b) => new Date(a.Date) - new Date(b.Date));
      
      upcomingMatches.forEach(match => {
        const row = document.createElement("tr");
        const homeTeamLogo = getTeamLogo(match.teamId[match.TEAM_NAME.split(' vs ')[0]]);
        const awayTeamLogo = getTeamLogo(match.teamId[match.TEAM_NAME.split(' vs ')[1]]);

        row.innerHTML = `
          <td>${formatDate(match.Date)}</td>
          <td>${homeTeamLogo} ${match.TEAM_NAME} ${awayTeamLogo}</td>
          <td>Scheduled</td>
        `;
        upcomingMatchesTable.appendChild(row);
      });
    };

    // Helper function to format date
    const formatDate = (dateString) => {
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Initialize displays
    displayRecentMatches();
    displayUpcomingMatches();

    // Restore old calendar functionality (not modified here)
    const calendarContainer = document.getElementById("calendar");
    const scheduleResults = document.getElementById("schedule-results");
    const monthDisplay = document.getElementById("current-month");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");

    let currentMonthIndex = new Date().getMonth();

    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];

    const renderCalendar = () => {
      calendarContainer.innerHTML = "";
      monthDisplay.textContent = months[currentMonthIndex];

      const daysInMonth = new Date(2025, currentMonthIndex + 1, 0).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day";
        dayDiv.textContent = i;

        const dateStr = new Date(2025, currentMonthIndex, i).toISOString().split("T")[0];
        dayDiv.dataset.date = dateStr;

        dayDiv.addEventListener("click", () => {
          displayDayMatches(new Date(dateStr));
        });

        calendarContainer.appendChild(dayDiv);
      }
    };

    const displayDayMatches = (selectedDate) => {
      scheduleResults.innerHTML = "";
      const selectedDateStr = selectedDate.toISOString().split("T")[0];

      const matchesOnDate = [
        ...matchResults.filter(match => 
          new Date(match.Date).toISOString().split("T")[0] === selectedDateStr),
        ...upcomingMatches.filter(match => 
          new Date(match.Date).toISOString().split("T")[0] === selectedDateStr)
      ];

      if (matchesOnDate.length === 0) {
        scheduleResults.innerHTML = `
          <div class="alert alert-info">
            No matches scheduled for ${selectedDate.toLocaleDateString()}
          </div>
        `;
        return;
      }

      const table = document.createElement("table");
      table.className = "table table-striped table-hover";
      
      const thead = document.createElement("thead");
      thead.className = "table-dark";
      thead.innerHTML = `
        <tr>
          <th>Matchup</th>
          <th>Score</th>
          <th>Status</th>
        </tr>
      `;
      
      const tbody = document.createElement("tbody");
      
      matchesOnDate.forEach(match => {
        const row = document.createElement("tr");
        const isPastMatch = matchResults.some(m => m.Date === match.Date);
        
        row.innerHTML = `
          <td> ${match.TEAM_NAME} </td>
          <td>${isPastMatch ? (match.Score || "N/A") : "-"}</td>
          <td>${isPastMatch ? "Final" : "Scheduled"}</td>
        `;
        tbody.appendChild(row);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      scheduleResults.appendChild(table);
    };

    // Initialize calendar
    renderCalendar();

    // Event listeners for calendar navigation
    prevMonthBtn.addEventListener("click", () => {
      if (currentMonthIndex > 0) {
        currentMonthIndex--;
        renderCalendar();
      }
    });

    nextMonthBtn.addEventListener("click", () => {
      if (currentMonthIndex < 11) {
        currentMonthIndex++;
        renderCalendar();
      }
    });

    // Show today's matches by default
    displayDayMatches(new Date());

  } catch (error) {
    console.error("Error loading score data:", error);
    
    // Display error messages in tables
    document.getElementById("recent-matches").innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger">Error loading recent matches</td>
      </tr>
    `;
    
    document.getElementById("upcoming-matches").innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-danger">Error loading upcoming matches</td>
      </tr>
    `;
  }
});


/**document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch match data
    const response = await fetch("/Json/score.json");
    if (!response.ok) throw new Error("Failed to fetch score data");
    const data = await response.json();

    // Team logos configuration
    const teamLogos = {
      "Heats": "images1610612737.svg",  
      "Wizards": "images/team_logos/wizards.png",
      "Clippers": "images/team_logos/clippers.png",
      "Cavaliers": "images/team_logos/cavaliers.png",
      // Add other teams as needed
    };

    // Helper function to get team logo
    const getTeamLogo = (teamName) => {
      return teamLogos[teamName] || "images/team_logos/default.svg";
    };

    // Helper function to format date
    const formatDate = (dateString) => {
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Get table elements
    const recentMatchesTable = document.getElementById("recent-matches-table").getElementsByTagName('tbody')[0];
    const upcomingMatchesTable = document.getElementById("upcoming-matches-table").getElementsByTagName('tbody')[0];
    const liveMatchesTable = document.getElementById("live-matches-table").getElementsByTagName('tbody')[0];

    // Process match data
    const matchResults = data["Recent Test Result"] || [];
    const upcomingMatches = data["Upcoming Games"] || [];
    const liveMatches = data["Live Games"] || []; // Add this to your JSON if needed

    // Display recent matches
    const displayRecentMatches = () => {
      recentMatchesTable.innerHTML = "";
      
      if (matchResults.length === 0) {
        recentMatchesTable.innerHTML = `
          <tr>
            <td colspan="4" class="text-center">No recent matches available.</td>
          </tr>
        `;
        return;
      }

      matchResults.sort((a, b) => new Date(b.Date) - new Date(a.Date));
      
      matchResults.forEach(match => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${formatDate(match.Date)}</td>
          <td>
            <img src="${getTeamLogo(match.TEAM_NAME)}" alt="${match.TEAM_NAME}" class="team-logo">
            ${match.TEAM_NAME}
          </td>
          <td>${match.Score || "N/A"}</td>
          <td>Final</td>
        `;
        recentMatchesTable.appendChild(row);
      });
    };

    // Display upcoming matches
    const displayUpcomingMatches = () => {
      upcomingMatchesTable.innerHTML = "";
      
      if (upcomingMatches.length === 0) {
        upcomingMatchesTable.innerHTML = `
          <tr>
            <td colspan="3" class="text-center">No upcoming matches scheduled.</td>
          </tr>
        `;
        return;
      }

      upcomingMatches.sort((a, b) => new Date(a.Date) - new Date(b.Date));
      
      upcomingMatches.forEach(match => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${formatDate(match.Date)}</td>
          <td>
            <img src="${getTeamLogo(match.TEAM_NAME)}" alt="${match.TEAM_NAME}" class="team-logo">
            ${match.TEAM_NAME}
          </td>
          <td>Scheduled</td>
        `;
        upcomingMatchesTable.appendChild(row);
      });
    };

    // Display live matches (if available)
    const displayLiveMatches = () => {
      liveMatchesTable.innerHTML = "";
      
      if (liveMatches.length === 0) {
        liveMatchesTable.innerHTML = `
          <tr>
            <td colspan="4" class="text-center">No live matches currently.</td>
          </tr>
        `;
        return;
      }

      liveMatches.forEach(match => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>Live</td>
          <td>
            <img src="${getTeamLogo(match.TEAM_NAME)}" alt="${match.TEAM_NAME}" class="team-logo">
            ${match.TEAM_NAME}
          </td>
          <td>${match.Score || "In Progress"}</td>
          <td>Live</td>
        `;
        liveMatchesTable.appendChild(row);
      });
    };

    // Calendar functionality
    const calendarContainer = document.getElementById("calendar");
    const scheduleResults = document.getElementById("schedule-results");
    const monthDisplay = document.getElementById("current-month");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");

    let currentMonthIndex = new Date().getMonth();
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];

    const renderCalendar = () => {
      calendarContainer.innerHTML = "";
      monthDisplay.textContent = months[currentMonthIndex];

      const daysInMonth = new Date(2025, currentMonthIndex + 1, 0).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day";
        dayDiv.textContent = i;

        const dateStr = new Date(2025, currentMonthIndex, i).toISOString().split("T")[0];
        dayDiv.dataset.date = dateStr;

        dayDiv.addEventListener("click", () => {
          displayDayMatches(new Date(dateStr));
        });

        calendarContainer.appendChild(dayDiv);
      }
    };

    const displayDayMatches = (selectedDate) => {
      scheduleResults.innerHTML = "";
      const selectedDateStr = selectedDate.toISOString().split("T")[0];

      const matchesOnDate = [
        ...matchResults.filter(match => 
          new Date(match.Date).toISOString().split("T")[0] === selectedDateStr),
        ...upcomingMatches.filter(match => 
          new Date(match.Date).toISOString().split("T")[0] === selectedDateStr)
      ];

      if (matchesOnDate.length === 0) {
        scheduleResults.innerHTML = `
          <div class="alert alert-info">
            No matches scheduled for ${selectedDate.toLocaleDateString()}
          </div>
        `;
        return;
      }

      const table = document.createElement("table");
      table.className = "table table-striped table-hover";
      
      const thead = document.createElement("thead");
      thead.className = "table-dark";
      thead.innerHTML = `
        <tr>
          <th>Team</th>
          <th>Score</th>
          <th>Status</th>
        </tr>
      `;
      
      const tbody = document.createElement("tbody");
      
      matchesOnDate.forEach(match => {
        const isPastMatch = matchResults.some(m => m.Date === match.Date);
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>
            <img src="${getTeamLogo(match.TEAM_NAME)}" alt="${match.TEAM_NAME}" class="team-logo-sm">
            ${match.TEAM_NAME}
          </td>
          <td>${isPastMatch ? (match.Score || "N/A") : "-"}</td>
          <td>${isPastMatch ? "Final" : "Scheduled"}</td>
        `;
        tbody.appendChild(row);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      scheduleResults.appendChild(table);
    };

    // Initialize displays
    displayRecentMatches();
    displayUpcomingMatches();
    displayLiveMatches();
    renderCalendar();
    displayDayMatches(new Date());

    // Event listeners for calendar navigation
    prevMonthBtn.addEventListener("click", () => {
      if (currentMonthIndex > 0) {
        currentMonthIndex--;
        renderCalendar();
      }
    });

    nextMonthBtn.addEventListener("click", () => {
      if (currentMonthIndex < 11) {
        currentMonthIndex++;
        renderCalendar();
      }
    });

  } catch (error) {
    console.error("Error loading score data:", error);
    
    // Display error messages
    document.getElementById("recent-matches-table").getElementsByTagName('tbody')[0].innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger">Error loading recent matches</td>
      </tr>
    `;
    
    document.getElementById("upcoming-matches-table").getElementsByTagName('tbody')[0].innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-danger">Error loading upcoming matches</td>
      </tr>
    `;
  }
});
/**document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/Json/score.json");
    const data = await response.json();

    const teamLogos = {
      "Heats": "images/team_logos/1610612737.svg",
      "Wizards": "images/wizards.png",
      "Clippers": "/images/clippers.png",
      "Cavaliers": "/images/cavaliers.png",
      // Add all other teams with their logo paths
    };
    // Get table elements
    const recentMatchesTable = document.getElementById("recent-matches-table").getElementsByTagName('tbody')[0];
    const upcomingMatchesTable = document.getElementById("upcoming-matches-table").getElementsByTagName('tbody')[0];
    const liveMatchesTable = document.getElementById("live-matches-table").getElementsByTagName('tbody')[0];

    let matchResults = data["Recent Test Result"] || [];
    let upcomingMatches = data["Upcoming Games"] || [];

    // Display ALL recent matches in table format
    const displayRecentMatches = () => {
      recentMatchesTable.innerHTML = "";
      
      if (matchResults.length === 0) {
        recentMatchesTable.innerHTML = `
          <tr>
            <td colspan="4" class="text-center">No recent matches available.</td>
          </tr>
        `;
        return;
      }

      // Sort by date (newest first)
      matchResults.sort((a, b) => new Date(b.Date) - new Date(a.Date));
      
      // Display ALL matches
      matchResults.forEach(match => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${formatDate(match.Date)}</td>
          <td> ${match.TEAM_NAME} </td>
          <td>${match.Score || "N/A"}</td>
          <td>Final</td>
        `;
        recentMatchesTable.appendChild(row);
      });
    };

    // Display upcoming matches in table format
    const displayUpcomingMatches = () => {
      upcomingMatchesTable.innerHTML = "";
      
      if (upcomingMatches.length === 0) {
        upcomingMatchesTable.innerHTML = `
          <tr>
            <td colspan="3" class="text-center">No upcoming matches scheduled.</td>
          </tr>
        `;
        return;
      }

      upcomingMatches.sort((a, b) => new Date(a.Date) - new Date(b.Date));
      
      upcomingMatches.forEach(match => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${formatDate(match.Date)}</td>
          <td> ${match.TEAM_NAME} </td>
          <td>Scheduled</td>
        `;
        upcomingMatchesTable.appendChild(row);
      });
    };

    // Helper function to format date
    const formatDate = (dateString) => {
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Initialize displays
    displayRecentMatches();
    displayUpcomingMatches();

    // Restore old calendar functionality
    const calendarContainer = document.getElementById("calendar");
    const scheduleResults = document.getElementById("schedule-results");
    const monthDisplay = document.getElementById("current-month");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");

    let currentMonthIndex = new Date().getMonth();

    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];

    const renderCalendar = () => {
      calendarContainer.innerHTML = "";
      monthDisplay.textContent = months[currentMonthIndex];

      const daysInMonth = new Date(2025, currentMonthIndex + 1, 0).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day";
        dayDiv.textContent = i;

        const dateStr = new Date(2025, currentMonthIndex, i).toISOString().split("T")[0];
        dayDiv.dataset.date = dateStr;

        dayDiv.addEventListener("click", () => {
          displayDayMatches(new Date(dateStr));
        });

        calendarContainer.appendChild(dayDiv);
      }
    };

    const displayDayMatches = (selectedDate) => {
      scheduleResults.innerHTML = "";
      const selectedDateStr = selectedDate.toISOString().split("T")[0];

      const matchesOnDate = [
        ...matchResults.filter(match => 
          new Date(match.Date).toISOString().split("T")[0] === selectedDateStr),
        ...upcomingMatches.filter(match => 
          new Date(match.Date).toISOString().split("T")[0] === selectedDateStr)
      ];

      if (matchesOnDate.length === 0) {
        scheduleResults.innerHTML = `
          <div class="alert alert-info">
            No matches scheduled for ${selectedDate.toLocaleDateString()}
          </div>
        `;
        return;
      }

      const table = document.createElement("table");
      table.className = "table table-striped table-hover";
      
      const thead = document.createElement("thead");
      thead.className = "table-dark";
      thead.innerHTML = `
        <tr>
          <th>Matchup</th>
          <th>Score</th>
          <th>Status</th>
        </tr>
      `;
      
      const tbody = document.createElement("tbody");
      
      matchesOnDate.forEach(match => {
        const row = document.createElement("tr");
        const isPastMatch = matchResults.some(m => m.Date === match.Date);
        
        row.innerHTML = `
          <td>- ${match.TEAM_NAME} -</td>
          <td>${isPastMatch ? (match.Score || "N/A") : "-"}</td>
          <td>${isPastMatch ? "Final" : "Scheduled"}</td>
        `;
        tbody.appendChild(row);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      scheduleResults.appendChild(table);
    };

    // Initialize calendar
    renderCalendar();

    // Event listeners for calendar navigation
    prevMonthBtn.addEventListener("click", () => {
      if (currentMonthIndex > 0) {
        currentMonthIndex--;
        renderCalendar();
      }
    });

    nextMonthBtn.addEventListener("click", () => {
      if (currentMonthIndex < 11) {
        currentMonthIndex++;
        renderCalendar();
      }
    });

    // Show today's matches by default
    displayDayMatches(new Date());

  } catch (error) {
    console.error("Error loading score data:", error);
    
    // Display error messages in tables
    document.getElementById("recent-matches").innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger">Error loading recent matches</td>
      </tr>
    `;
    
    document.getElementById("upcoming-matches").innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-danger">Error loading upcoming matches</td>
      </tr>
    `;
  }
});
/**document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/Json/score.json");
    const data = await response.json();

    // Get table elements
    const recentMatchesTable = document.getElementById("recent-matches-table").getElementsByTagName('tbody')[0];
    const upcomingMatchesTable = document.getElementById("upcoming-matches-table").getElementsByTagName('tbody')[0];
    const liveMatchesTable = document.getElementById("live-matches-table").getElementsByTagName('tbody')[0];

    let matchResults = data["Recent Test Result"] || [];
    let upcomingMatches = data["Upcoming Games"] || [];

    // Display ALL recent matches in table format
    const displayRecentMatches = () => {
      recentMatchesTable.innerHTML = "";
      
      if (matchResults.length === 0) {
        recentMatchesTable.innerHTML = `
          <tr>
            <td colspan="4" class="text-center">No recent matches available.</td>
          </tr>
        `;
        return;
      }

      // Sort by date (newest first)
      matchResults.sort((a, b) => new Date(b.Date) - new Date(a.Date));
      
      // Display ALL matches (removed the slice(0, 5) limit)
      matchResults.forEach(match => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${formatDate(match.Date)}</td>
          <td>- ${match.TEAM_NAME} -</td>
          <td>${match.Score || "N/A"}</td>
          <td>Final</td>
        `;
        recentMatchesTable.appendChild(row);
      });
    };

    // Rest of your existing code remains the same...
    const displayUpcomingMatches = () => {
      upcomingMatchesTable.innerHTML = "";
      
      if (upcomingMatches.length === 0) {
        upcomingMatchesTable.innerHTML = `
          <tr>
            <td colspan="3" class="text-center">No upcoming matches scheduled.</td>
          </tr>
        `;
        return;
      }

      upcomingMatches.sort((a, b) => new Date(a.Date) - new Date(b.Date));
      
      upcomingMatches.forEach(match => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${formatDate(match.Date)}</td>
          <td>- ${match.TEAM_NAME} -</td>
          <td>Scheduled</td>
        `;
        upcomingMatchesTable.appendChild(row);
      });
    };

    const formatDate = (dateString) => {
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Initialize displays
    displayRecentMatches();
    displayUpcomingMatches();

    // ... rest of your existing calendar and other functions

  } catch (error) {
    console.error("Error loading score data:", error);
    
    document.getElementById("recent-matches").innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger">Error loading recent matches</td>
      </tr>
    `;
  }
});**/
/**document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/Json/score.json");
    const data = await response.json();

    // Get table elements
    const recentMatchesTable = document.getElementById("recent-matches-table").getElementsByTagName('tbody')[0];
    const upcomingMatchesTable = document.getElementById("upcoming-matches-table").getElementsByTagName('tbody')[0];
    const liveMatchesTable = document.getElementById("live-matches-table").getElementsByTagName('tbody')[0];

    let matchResults = data["Recent Test Result"] || [];
    let upcomingMatches = data["Upcoming Games"] || [];

    // Display recent matches in table format
    const displayRecentMatches = () => {
      recentMatchesTable.innerHTML = "";
      
      if (matchResults.length === 0) {
        recentMatchesTable.innerHTML = `
          <tr>
            <td colspan="4" class="text-center">No recent matches available.</td>
          </tr>
        `;
        return;
      }

      // Sort by date (newest first)
      matchResults.sort((a, b) => new Date(b.Date) - new Date(a.Date));
      
      // Display only the most recent 5 matches
      const recentToShow = matchResults.slice(0, 5);
      
      recentToShow.forEach(match => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${formatDate(match.Date)}</td>
          <td>- ${match.TEAM_NAME} -</td>
          <td>${match.Score || "N/A"}</td>
          <td>Final</td>
        `;
        recentMatchesTable.appendChild(row);
      });
    };

    // Display upcoming matches in table format
    const displayUpcomingMatches = () => {
      upcomingMatchesTable.innerHTML = "";
      
      if (upcomingMatches.length === 0) {
        upcomingMatchesTable.innerHTML = `
          <tr>
            <td colspan="3" class="text-center">No upcoming matches scheduled.</td>
          </tr>
        `;
        return;
      }

      // Sort by date (soonest first)
      upcomingMatches.sort((a, b) => new Date(a.Date) - new Date(b.Date));
      
      upcomingMatches.forEach(match => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${formatDate(match.Date)}</td>
          <td>- ${match.TEAM_NAME} -</td>
          <td>Scheduled</td>
        `;
        upcomingMatchesTable.appendChild(row);
      });
    };

    // Helper function to format date
    const formatDate = (dateString) => {
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Initialize displays
    displayRecentMatches();
    displayUpcomingMatches();

    // Calendar functionality remains the same
    const calendarContainer = document.getElementById("calendar");
    const scheduleResults = document.getElementById("schedule-results");
    const monthDisplay = document.getElementById("current-month");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");

    let currentMonthIndex = new Date().getMonth();

    const renderCalendar = () => {
      const months = [
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"
      ];

      calendarContainer.innerHTML = "";
      monthDisplay.textContent = months[currentMonthIndex];

      const daysInMonth = new Date(2025, currentMonthIndex + 1, 0).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day";
        dayDiv.textContent = i;

        const dateStr = new Date(2025, currentMonthIndex, i).toISOString().split("T")[0];
        dayDiv.dataset.date = dateStr;

        dayDiv.addEventListener("click", function() {
          displayMatches(new Date(dateStr));
        });

        calendarContainer.appendChild(dayDiv);
      }
    };

    const displayMatches = (selectedDate) => {
      scheduleResults.innerHTML = "";
      const selectedDateStr = selectedDate.toISOString().split("T")[0];

      const pastMatches = matchResults.filter(match => {
        return new Date(match.Date).toISOString().split("T")[0] === selectedDateStr;
      });

      const upcomingMatchesForDate = upcomingMatches.filter(match => {
        return new Date(match.Date).toISOString().split("T")[0] === selectedDateStr;
      });

      if (pastMatches.length > 0 || upcomingMatchesForDate.length > 0) {
        const table = document.createElement("table");
        table.className = "table table-striped table-hover";
        
        const thead = document.createElement("thead");
        thead.className = "table-dark";
        thead.innerHTML = `
          <tr>
            <th>Matchup</th>
            <th>Score</th>
            <th>Status</th>
          </tr>
        `;
        
        const tbody = document.createElement("tbody");
        
        pastMatches.forEach(match => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>- ${match.TEAM_NAME} -</td>
            <td>${match.Score}</td>
            <td>Final</td>
          `;
          tbody.appendChild(row);
        });

        upcomingMatchesForDate.forEach(match => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>- ${match.TEAM_NAME} -</td>
            <td>-</td>
            <td>Scheduled</td>
          `;
          tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        scheduleResults.appendChild(table);
      } else {
        scheduleResults.innerHTML = `
          <div class="alert alert-warning">
            No matches found for ${selectedDate.toLocaleDateString()}
          </div>
        `;
      }
    };

    // Initialize calendar
    renderCalendar();

    // Event listeners for calendar navigation
    prevMonthBtn.addEventListener("click", () => {
      if (currentMonthIndex > 0) {
        currentMonthIndex--;
        renderCalendar();
      }
    });

    nextMonthBtn.addEventListener("click", () => {
      if (currentMonthIndex < 11) {
        currentMonthIndex++;
        renderCalendar();
      }
    });

  } catch (error) {
    console.error("Error loading score data:", error);
    
    // Display error messages in tables if fetch fails
    document.getElementById("recent-matches").innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger">Error loading recent matches</td>
      </tr>
    `;
    
    document.getElementById("upcoming-matches").innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-danger">Error loading upcoming matches</td>
      </tr>
    `;
  }
});**/
/**document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/Json/score.json");
    const data = await response.json();

    const recentMatchesContainer = document.getElementById("recent-matches");
    const upcomingMatchesContainer = document.getElementById("upcoming-matches");
    const calendarContainer = document.getElementById("calendar");
    const scheduleResults = document.getElementById("schedule-results");
    const monthDisplay = document.getElementById("current-month");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");

    let matchResults = data["Recent Test Result"] || [];
    let upcomingMatches = data["Upcoming Games"] || [];
    let currentMonthIndex = new Date().getMonth();

    const displayRecentMatches = () => {
      recentMatchesContainer.innerHTML = "<h4>Recent Matches</h4>";
      if (matchResults.length === 0) {
        recentMatchesContainer.innerHTML += "<p>No recent matches available.</p>";
        return;
      }

      matchResults.reverse().forEach(match => {
        recentMatchesContainer.innerHTML += `
          <div class="alert alert-success match-result" 
               data-date="${match.Date}" 
               data-teams="${match.TEAM_NAME}" 
               data-score="${match.Score || "N/A"}">
            <strong>${match.TEAM_NAME}</strong><br>
            <span>Score: ${match.Score || "N/A"}</span>
          </div>
        `;
      });

      document.querySelectorAll('.match-result').forEach(match => {
        match.addEventListener('click', function() {
          const date = this.getAttribute('data-date');
          const teams = this.getAttribute('data-teams');
          const score = this.getAttribute('data-score');
          window.location.href = `Scoredetail.html?date=${encodeURIComponent(date)}&teams=${encodeURIComponent(teams)}&score=${encodeURIComponent(score)}`;
        });
      });
    };

    const displayUpcomingMatches = () => {
      upcomingMatchesContainer.innerHTML = "<h4>Upcoming Matches</h4>";
      if (upcomingMatches.length === 0) {
        upcomingMatchesContainer.innerHTML += "<p>No upcoming matches scheduled.</p>";
        return;
      }

      upcomingMatches.forEach(match => {
        upcomingMatchesContainer.innerHTML += `
          <div class="alert alert-info">
            <strong>${match.TEAM_NAME}</strong><br>
            <span>Scheduled Date: ${match.Date}</span>
          </div>
        `;
      });
    };

    const renderCalendar = () => {
      const months = [
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"
      ];

      calendarContainer.innerHTML = "";
      monthDisplay.textContent = months[currentMonthIndex];

      const daysInMonth = new Date(2025, currentMonthIndex + 1, 0).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day";
        dayDiv.textContent = i;

        const dateStr = new Date(2025, currentMonthIndex, i).toISOString().split("T")[0];
        dayDiv.dataset.date = dateStr;

        dayDiv.addEventListener("click", function() {
          displayMatches(new Date(dateStr));
        });

        calendarContainer.appendChild(dayDiv);
      }
    };

    const displayMatches = (selectedDate) => {
      scheduleResults.innerHTML = "";
      const selectedDateStr = selectedDate.toISOString().split("T")[0];

      const pastMatches = matchResults.filter(match => {
        return new Date(match.Date).toISOString().split("T")[0] === selectedDateStr;
      });

      const upcomingMatchesForDate = upcomingMatches.filter(match => {
        return new Date(match.Date).toISOString().split("T")[0] === selectedDateStr;
      });

      if (pastMatches.length > 0) {
        pastMatches.forEach(match => {
          scheduleResults.innerHTML += `
            <div class='alert alert-success match-result' 
                 data-date="${match.Date}" 
                 data-teams="${match.TEAM_NAME}" 
                 data-score="${match.Score}">
              <strong>${match.TEAM_NAME}</strong><br>
              <span>Score: ${match.Score}</span>
            </div>
          `;
        });
      } else {
        scheduleResults.innerHTML += "<p>No results for this date.</p>";
      }

      if (upcomingMatchesForDate.length > 0) {
        upcomingMatchesForDate.forEach(match => {
          scheduleResults.innerHTML += `
            <div class='alert alert-info'>
              <strong>${match.TEAM_NAME}</strong><br>
              <span>Scheduled Date: ${match.Date}</span>
            </div>
          `;
        });
      } else {
        scheduleResults.innerHTML += "<p>No upcoming matches for this date.</p>";
      }

      document.querySelectorAll('.match-result').forEach(match => {
        match.addEventListener('click', function() {
          const date = this.getAttribute('data-date');
          const teams = this.getAttribute('data-teams');
          const score = this.getAttribute('data-score');
          window.location.href = `Scoredetail.html?date=${encodeURIComponent(date)}&teams=${encodeURIComponent(teams)}&score=${encodeURIComponent(score)}`;
        });
      });
    };

    const showDefaultData = () => {
      recentMatchesContainer.style.display = "block";
      upcomingMatchesContainer.style.display = "block";
      scheduleResults.innerHTML = "<h4>Recent Test Results</h4>";
      displayRecentMatches();
    };

    // Initialize
    displayRecentMatches();
    displayUpcomingMatches();
    renderCalendar();
    showDefaultData();

    // Event listeners
    prevMonthBtn.addEventListener("click", () => {
      if (currentMonthIndex > 0) {
        currentMonthIndex--;
        renderCalendar();
      }
    });

    nextMonthBtn.addEventListener("click", () => {
      if (currentMonthIndex < 11) {
        currentMonthIndex++;
        renderCalendar();
      }
    });

  } catch (error) {
    console.error("Error loading score data:", error);
  }
});**/
/**document.addEventListener("DOMContentLoaded", function () {
  const recentMatchesContainer = document.getElementById("recent-matches");
  const upcomingMatchesContainer = document.getElementById("upcoming-matches");
  const calendarContainer = document.getElementById("calendar");
  const scheduleResults = document.getElementById("schedule-results");
  const monthDisplay = document.getElementById("current-month");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");

  let matchResults = [];
  let upcomingMatches = [];
  let currentMonthIndex = new Date().getMonth();
  function fetchMatchData() {
    fetch("/Json/score.json") // Ensure this path is correct
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Fetched JSON Data:", data); // Debugging
        matchResults = data["Recent Test Result"] || [];
        upcomingMatches = data["Upcoming Games"] || [];

        // Process and display data
        displayRecentMatches(matchResults);
        displayUpcomingMatches(upcomingMatches);
        renderCalendar();
        showDefaultData();
      })
      .catch(error => console.error("Error fetching JSON:", error));
  }
  function displayRecentMatches(matches) {
    recentMatchesContainer.innerHTML = "<h4>Recent Matches</h4>";
    if (matches.length === 0) {
      recentMatchesContainer.innerHTML += "<p>No recent matches available.</p>";
      return;
    }
    matches.reverse().forEach(match => {
      recentMatchesContainer.innerHTML += `
        <div class="alert alert-success match-result" data-date="${match.Date}" data-teams="${match.TEAM_NAME}" data-score="${match.Score || "N/A"}">
          <strong>${match.TEAM_NAME}</strong><br>
          <span>Score: ${match.Score || "N/A"}</span>
        </div>
      `;
    });
    document.querySelectorAll('.match-result').forEach(match => {
      match.addEventListener('click', function () {
        const date = this.getAttribute('data-date');
        const teams = this.getAttribute('data-teams');
        const score = this.getAttribute('data-score');
        const url = `Scoredetail.html?date=${encodeURIComponent(date)}&teams=${encodeURIComponent(teams)}&score=${encodeURIComponent(score)}`;
        console.log("Redirecting to:", url); // Debugging
        window.location.href = url;
      });
    });
  }
  function displayUpcomingMatches(matches) {
    upcomingMatchesContainer.innerHTML = "<h4>Upcoming Matches</h4>";
    if (matches.length === 0) {
      upcomingMatchesContainer.innerHTML += "<p>No upcoming matches scheduled.</p>";
      return;
    }
    matches.forEach(match => {
      upcomingMatchesContainer.innerHTML += `
        <div class="alert alert-info">
          <strong>${match.TEAM_NAME}</strong><br>
          <span>Scheduled Date: ${match.Date}</span>
        </div>
      `;
    });
  }
  function renderCalendar() {
    const months = [
      "January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"
    ];

    calendarContainer.innerHTML = "";
    monthDisplay.textContent = months[currentMonthIndex];

    let daysInMonth = new Date(2025, currentMonthIndex + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      let dayDiv = document.createElement("div");
      dayDiv.className = "calendar-day";
      dayDiv.textContent = i;

      let dateStr = new Date(2025, currentMonthIndex, i).toISOString().split("T")[0];
      dayDiv.dataset.date = dateStr;

      dayDiv.addEventListener("click", function () {
        displayMatches(new Date(dateStr));
      });

      calendarContainer.appendChild(dayDiv);
    }
  }

  function displayMatches(selectedDate) {
    scheduleResults.innerHTML = "";

    // Filter matches based on the selected date
    let selectedDateStr = selectedDate.toISOString().split("T")[0];

    let pastMatches = matchResults.filter(match => {
      return new Date(match.Date).toISOString().split("T")[0] === selectedDateStr;
    });

    let upcomingMatchesForDate = upcomingMatches.filter(match => {
      return new Date(match.Date).toISOString().split("T")[0] === selectedDateStr;
    });
    if (pastMatches.length > 0) {
      pastMatches.forEach(match => {
        scheduleResults.innerHTML += `
          <div class='alert alert-success match-result' data-date="${match.Date}" data-teams="${match.TEAM_NAME}" data-score="${match.Score}">
            <strong>${match.TEAM_NAME}</strong><br>
            <span>Score: ${match.Score}</span>
          </div>
        `;
      });
    } else {
      scheduleResults.innerHTML += "<p>No results for this date.</p>";
    }

    if (upcomingMatchesForDate.length > 0) {
      upcomingMatchesForDate.forEach(match => {
        scheduleResults.innerHTML += `
          <div class='alert alert-info'>
            <strong>${match.TEAM_NAME}</strong><br>
            <span>Scheduled Date: ${match.Date}</span>
          </div>
        `;
      });
    } else {
      scheduleResults.innerHTML += "<p>No upcoming matches for this date.</p>";
    }
    document.querySelectorAll('.match-result').forEach(match => {
      match.addEventListener('click', function () {
        const date = this.getAttribute('data-date');
        const teams = this.getAttribute('data-teams');
        const score = this.getAttribute('data-score');
        const url = `Scoredetail.html?date=${encodeURIComponent(date)}&teams=${encodeURIComponent(teams)}&score=${encodeURIComponent(score)}`;
        console.log("Redirecting to:", url); // Debugging
        window.location.href = url;
      });
    });
  }
  function showDefaultData() {
    recentMatchesContainer.style.display = "block";
    upcomingMatchesContainer.style.display = "block";
    scheduleResults.innerHTML = "<h4>Recent Test Results</h4>";
    displayRecentMatches(matchResults);
  }
  prevMonthBtn.addEventListener("click", function () {
    if (currentMonthIndex > 0) {
      currentMonthIndex--;
      renderCalendar();
    }
  });
  nextMonthBtn.addEventListener("click", function () {
    if (currentMonthIndex < 11) {
      currentMonthIndex++;
      renderCalendar();
    }
  });
  fetchMatchData();
});**/

/**document.addEventListener("DOMContentLoaded", function () {
  const recentMatchesContainer = document.getElementById("recent-matches");
  const upcomingMatchesContainer = document.getElementById("upcoming-matches");
  const calendarContainer = document.getElementById("calendar");
  const scheduleResults = document.getElementById("schedule-results");
  const monthDisplay = document.getElementById("current-month");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");

  let matchResults = [];
  let upcomingMatches = [];

  // Fetch match data
  function fetchMatchData() {
    fetch("/Json/score.json") // Ensure this path is correct
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Fetched JSON Data:", data); // Debugging
        matchResults = data["Recent Test Result"];
        upcomingMatches = data["Upcoming Games"];

        // Process and display data
        displayRecentMatches(matchResults);
        displayUpcomingMatches(upcomingMatches);
        renderCalendar();
        showDefaultData();
      })
      .catch(error => console.error("Error fetching JSON:", error));
  }

  // Display recent matches
  function displayRecentMatches(matches) {
    recentMatchesContainer.innerHTML = "<h4>Recent Matches</h4>";
    if (matches.length === 0) {
      recentMatchesContainer.innerHTML += "<p>No recent matches available.</p>";
      return;
    }

    matches.reverse().forEach(match => {
      recentMatchesContainer.innerHTML += `
        <div class="alert alert-success match-result" data-date="${match.Date}" data-teams="${match.TEAM_NAME}" data-score="${match.Score || "N/A"}">
          <strong>${match.TEAM_NAME}</strong><br>
          <span>Score: ${match.Score || "N/A"}</span>
        </div>
      `;
    });

    // Add event listeners to match results
    document.querySelectorAll('.match-result').forEach(match => {
      match.addEventListener('click', function () {
        const date = this.getAttribute('data-date');
        const teams = this.getAttribute('data-teams');
        const score = this.getAttribute('data-score');
        const url = `Scoredetail.html?date=${encodeURIComponent(date)}&teams=${encodeURIComponent(teams)}&score=${encodeURIComponent(score)}`;
        console.log("Redirecting to:", url); // Debugging
        window.location.href = url;
      });
    });
  }

  // Display upcoming matches
  function displayUpcomingMatches(matches) {
    upcomingMatchesContainer.innerHTML = "<h4>Upcoming Matches</h4>";
    if (matches.length === 0) {
      upcomingMatchesContainer.innerHTML += "<p>No upcoming matches scheduled.</p>";
      return;
    }

    matches.forEach(match => {
      upcomingMatchesContainer.innerHTML += `
        <div class="alert alert-info">
          <strong>${match.TEAM_NAME}</strong><br>
          <span>Scheduled Date: ${match.Date}</span>
        </div>
      `;
    });
  }

  // Calendar logic
  let currentMonthIndex = new Date().getMonth(); // Default to current month

  // Render calendar
  function renderCalendar() {
    const months = [
      "January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"
    ];

    calendarContainer.innerHTML = "";
    monthDisplay.textContent = months[currentMonthIndex];

    let daysInMonth = new Date(2025, currentMonthIndex + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      let dayDiv = document.createElement("div");
      dayDiv.className = "calendar-day";
      dayDiv.textContent = i;

      let dateStr = new Date(2025, currentMonthIndex, i).toISOString().split("T")[0];
      dayDiv.dataset.date = dateStr;

      dayDiv.addEventListener("click", function () {
        displayMatches(new Date(dateStr));
      });

      calendarContainer.appendChild(dayDiv);
    }
  }

  // Display matches for the selected date
  function displayMatches(selectedDate) {
    scheduleResults.innerHTML = "";

    // Filter matches based on the selected date
    let selectedDateStr = selectedDate.toISOString().split("T")[0];

    let pastMatches = matchResults.filter(match => {
      return new Date(match.Date).toISOString().split("T")[0] === selectedDateStr;
    });

    let upcomingMatchesForDate = upcomingMatches.filter(match => {
      return new Date(match.Date).toISOString().split("T")[0] === selectedDateStr;
    });

    // Show the matches for the selected date
    if (pastMatches.length > 0) {
      pastMatches.forEach(match => {
        scheduleResults.innerHTML += `
          <div class='alert alert-success match-result' data-date="${match.Date}" data-teams="${match.TEAM_NAME}" data-score="${match.Score}">
            <strong>${match.TEAM_NAME}</strong><br>
            <span>Score: ${match.Score}</span>
          </div>
        `;
      });
    } else {
      scheduleResults.innerHTML += "<p>No results for this date.</p>";
    }

    if (upcomingMatchesForDate.length > 0) {
      upcomingMatchesForDate.forEach(match => {
        scheduleResults.innerHTML += `
          <div class='alert alert-info'>
            <strong>${match.TEAM_NAME}</strong><br>
            <span>Scheduled Date: ${match.Date}</span>
          </div>
        `;
      });
    } else {
      scheduleResults.innerHTML += "<p>No upcoming matches for this date.</p>";
    }

    // Add event listeners to match results
    document.querySelectorAll('.match-result').forEach(match => {
      match.addEventListener('click', function () {
        const date = this.getAttribute('data-date');
        const teams = this.getAttribute('data-teams');
        const score = this.getAttribute('data-score');
        const url = `Scoredetail.html?date=${encodeURIComponent(date)}&teams=${encodeURIComponent(teams)}&score=${encodeURIComponent(score)}`;
        console.log("Redirecting to:", url); // Debugging
        window.location.href = url;
      });
    });
  }

  // Show default data for today
  function showDefaultData() {
    recentMatchesContainer.style.display = "block";
    upcomingMatchesContainer.style.display = "block";
    scheduleResults.innerHTML = "<h4>Recent Test Results</h4>";
    displayRecentMatches(matchResults);
  }

  // Navigation for calendar
  prevMonthBtn.addEventListener("click", function () {
    if (currentMonthIndex > 0) {
      currentMonthIndex--;
      renderCalendar();
    }
  });

  nextMonthBtn.addEventListener("click", function () {
    if (currentMonthIndex < 11) {
      currentMonthIndex++;
      renderCalendar();
    }
  });

  // Initialize data fetch
  fetchMatchData();
});
**/
/**document.addEventListener("DOMContentLoaded", function () {
  const recentMatchesContainer = document.getElementById("recent-matches");
  const upcomingMatchesContainer = document.getElementById("upcoming-matches");
  const calendarContainer = document.getElementById("calendar");
  const scheduleResults = document.getElementById("schedule-results");
  const monthDisplay = document.getElementById("current-month");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");

  let matchResults = [];
  let upcomingMatches = [];

  // Fetch match data (replace with your actual path)
  function fetchMatchData() {
    fetch("/Json/score.json") // Replace with correct JSON path
      .then(response => response.json())
      .then(data => {
        matchResults = data["Recent Test Result"];
        upcomingMatches = data["Upcoming Games"];

        // Process and display data
        displayRecentMatches(matchResults);
        displayUpcomingMatches(upcomingMatches);
        renderCalendar();
        showDefaultData();
      })
      .catch(error => console.error("Error fetching JSON:", error));
  }

  // Display recent matches
  function displayRecentMatches(matches) {
    recentMatchesContainer.innerHTML = "<h4>Recent Matches</h4>";
    if (matches.length === 0) {
      recentMatchesContainer.innerHTML += "<p>No recent matches available.</p>";
      return;
    }

    matches.reverse().forEach(match => {
      recentMatchesContainer.innerHTML += `
        <div class="alert alert-success match-result" data-date="${match.Date}" data-teams="${match.TEAM_NAME}" data-score="${match.Score || "N/A"}">
          <strong>${match.TEAM_NAME}</strong><br>
          <span>Score: ${match.Score || "N/A"}</span>
        </div>
      `;
    });

    // Add event listeners to match results
    document.querySelectorAll('.match-result').forEach(match => {
      match.addEventListener('click', function() {
        const date = this.getAttribute('data-date');
        const teams = this.getAttribute('data-teams');
        const score = this.getAttribute('data-score');
        window.location.href = `Scoredetail.html?date=${encodeURIComponent(date)}&teams=${encodeURIComponent(teams)}&score=${encodeURIComponent(score)}`;
      });
    });
  }

  // Display upcoming matches
  function displayUpcomingMatches(matches) {
    upcomingMatchesContainer.innerHTML = "<h4>Upcoming Matches</h4>";
    if (matches.length === 0) {
      upcomingMatchesContainer.innerHTML += "<p>No upcoming matches scheduled.</p>";
      return;
    }

    matches.forEach(match => {
      upcomingMatchesContainer.innerHTML += `
        <div class="alert alert-info">
          <strong>${match.TEAM_NAME}</strong><br>
          <span>Scheduled Date: ${match.Date}</span>
        </div>
      `;
    });
  }

  // Calendar logic
  let currentMonthIndex = new Date().getMonth(); // Default to current month

  // Render calendar
  function renderCalendar() {
    const months = [
      "January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"
    ];

    calendarContainer.innerHTML = "";
    monthDisplay.textContent = months[currentMonthIndex];

    let daysInMonth = new Date(2025, currentMonthIndex + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      let dayDiv = document.createElement("div");
      dayDiv.className = "calendar-day";
      dayDiv.textContent = i;

      let dateStr = new Date(2025, currentMonthIndex, i).toISOString().split("T")[0];
      dayDiv.dataset.date = dateStr;

      dayDiv.addEventListener("click", function () {
        displayMatches(new Date(dateStr));
      });

      calendarContainer.appendChild(dayDiv);
    }
  }

  // Display matches for the selected date
  function displayMatches(selectedDate) {
    scheduleResults.innerHTML = "";
    
    // Filter matches based on the selected date
    let selectedDateStr = selectedDate.toISOString().split("T")[0];
    
    let pastMatches = matchResults.filter(match => {
      return new Date(match.Date).toISOString().split("T")[0] === selectedDateStr;
    });

    let upcomingMatchesForDate = upcomingMatches.filter(match => {
      return new Date(match.Date).toISOString().split("T")[0] === selectedDateStr;
    });

    // Show the matches for the selected date
    if (pastMatches.length > 0) {
      pastMatches.forEach(match => {
        scheduleResults.innerHTML += `
          <div class='alert alert-success match-result' data-date="${match.Date}" data-teams="${match.TEAM_NAME}" data-score="${match.Score}">
            <strong>${match.TEAM_NAME}</strong><br>
            <span>Score: ${match.Score}</span>
          </div>
        `;
      });
    } else {
      scheduleResults.innerHTML += "<p>No results for this date.</p>";
    }

    if (upcomingMatchesForDate.length > 0) {
      upcomingMatchesForDate.forEach(match => {
        scheduleResults.innerHTML += `
          <div class='alert alert-info'>
            <strong>${match.TEAM_NAME}</strong><br>
            <span>Scheduled Date: ${match.Date}</span>
          </div>
        `;
      });
    } else {
      scheduleResults.innerHTML += "<p>No upcoming matches for this date.</p>";
    }

    // Add event listeners to match results
    document.querySelectorAll('.match-result').forEach(match => {
      match.addEventListener('click', function() {
        const date = this.getAttribute('data-date');
        const teams = this.getAttribute('data-teams');
        const score = this.getAttribute('data-score');
        window.location.href = `Scoredetail.html?date=${encodeURIComponent(date)}&teams=${encodeURIComponent(teams)}&score=${encodeURIComponent(score)}`;
      });
    });
  }

  // Show default data for today (Recent Test Results)
  function showDefaultData() {
    recentMatchesContainer.style.display = "block";
    upcomingMatchesContainer.style.display = "block";
    scheduleResults.innerHTML = "<h4>Recent Test Results</h4>";
    displayRecentMatches(matchResults);
  }

  // Navigation for calendar
  prevMonthBtn.addEventListener("click", function () {
    if (currentMonthIndex > 0) {
      currentMonthIndex--;
      renderCalendar();
    }
  });

  nextMonthBtn.addEventListener("click", function () {
    if (currentMonthIndex < 11) {
      currentMonthIndex++;
      renderCalendar();
    }
  });

  // Initialize data fetch
  fetchMatchData();
});**/

/**document.addEventListener("DOMContentLoaded", function () {
  const recentMatchesContainer = document.getElementById("recent-matches");
  const upcomingMatchesContainer = document.getElementById("upcoming-matches");
  const calendarContainer = document.getElementById("calendar");
  const scheduleResults = document.getElementById("schedule-results");
  const monthDisplay = document.getElementById("current-month");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");

  let matchResults = [];
  let upcomingMatches = [];

  // Fetch match data (replace with your actual path)
  function fetchMatchData() {
    fetch("/Json/score.json") // Replace with correct JSON path
      .then(response => response.json())
      .then(data => {
        matchResults = data["Recent Test Result"];
        upcomingMatches = data["Upcoming Games"];

        // Process and display data
        displayRecentMatches(matchResults);
        displayUpcomingMatches(upcomingMatches);
        renderCalendar();
        showDefaultData();
      })
      .catch(error => console.error("Error fetching JSON:", error));
  }

  // Display recent matches
  function displayRecentMatches(matches) {
    recentMatchesContainer.innerHTML = "<h4>Recent Matches</h4>";
    if (matches.length === 0) {
      recentMatchesContainer.innerHTML += "<p>No recent matches available.</p>";
      return;
    }

    matches.reverse().forEach(match => {
      recentMatchesContainer.innerHTML += `
        <div class="alert alert-success">
          <strong>${match.TEAM_NAME}</strong><br>
          <span>Score: ${match.Score || "N/A"}</span>
        </div>
      `;
    });
  }

  // Display upcoming matches
  function displayUpcomingMatches(matches) {
    upcomingMatchesContainer.innerHTML = "<h4>Upcoming Matches</h4>";
    if (matches.length === 0) {
      upcomingMatchesContainer.innerHTML += "<p>No upcoming matches scheduled.</p>";
      return;
    }

    matches.forEach(match => {
      upcomingMatchesContainer.innerHTML += `
        <div class="alert alert-info">
          <strong>${match.TEAM_NAME}</strong><br>
          <span>Scheduled Date: ${match.Date}</span>
        </div>
      `;
    });
  }

  // Calendar logic
  let currentMonthIndex = new Date().getMonth(); // Default to current month

  // Render calendar
  function renderCalendar() {
    const months = [
      "January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"
    ];

    calendarContainer.innerHTML = "";
    monthDisplay.textContent = months[currentMonthIndex];

    let daysInMonth = new Date(2025, currentMonthIndex + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      let dayDiv = document.createElement("div");
      dayDiv.className = "calendar-day";
      dayDiv.textContent = i;

      let dateStr = new Date(2025, currentMonthIndex, i).toISOString().split("T")[0];
      dayDiv.dataset.date = dateStr;

      dayDiv.addEventListener("click", function () {
        displayMatches(new Date(dateStr));
      });

      calendarContainer.appendChild(dayDiv);
    }
  }

  // Display matches for the selected date
  function displayMatches(selectedDate) {
    scheduleResults.innerHTML = "";
    
    // Filter matches based on the selected date
    let selectedDateStr = selectedDate.toISOString().split("T")[0];
    
    let pastMatches = matchResults.filter(match => {
      return new Date(match.Date).toISOString().split("T")[0] === selectedDateStr;
    });

    let upcomingMatchesForDate = upcomingMatches.filter(match => {
      return new Date(match.Date).toISOString().split("T")[0] === selectedDateStr;
    });

    // Show the matches for the selected date
    if (pastMatches.length > 0) {
      pastMatches.forEach(match => {
        scheduleResults.innerHTML += `
          <div class='alert alert-success'>
            <strong>${match.TEAM_NAME}</strong><br>
            <span>Score: ${match.Score}</span>
          </div>
        `;
      });
    } else {
      scheduleResults.innerHTML += "<p>No results for this date.</p>";
    }

    if (upcomingMatchesForDate.length > 0) {
      upcomingMatchesForDate.forEach(match => {
        scheduleResults.innerHTML += `
          <div class='alert alert-info'>
            <strong>${match.TEAM_NAME}</strong><br>
            <span>Scheduled Date: ${match.Date}</span>
          </div>
        `;
      });
    } else {
      scheduleResults.innerHTML += "<p>No upcoming matches for this date.</p>";
    }
  }

  // Show default data for today (Recent Test Results)
  function showDefaultData() {
    recentMatchesContainer.style.display = "block";
    upcomingMatchesContainer.style.display = "block";
    scheduleResults.innerHTML = "<h4>Recent Test Results</h4>";
    displayRecentMatches(matchResults);
  }

  // Navigation for calendar
  prevMonthBtn.addEventListener("click", function () {
    if (currentMonthIndex > 0) {
      currentMonthIndex--;
      renderCalendar();
    }
  });

  nextMonthBtn.addEventListener("click", function () {
    if (currentMonthIndex < 11) {
      currentMonthIndex++;
      renderCalendar();
    }
  });

  // Initialize data fetch
  fetchMatchData();
});**/

/**document.addEventListener("DOMContentLoaded", function () {
  const recentMatchesContainer = document.getElementById("recent-matches");
  const upcomingMatchesContainer = document.getElementById("upcoming-matches");
  const calendarContainer = document.getElementById("calendar");
  const scheduleResults = document.getElementById("schedule-results");
  const monthDisplay = document.getElementById("current-month");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");

  let matchResults = [];
  let upcomingMatches = [];

  // Fetch match data (replace with your actual path)
  function fetchMatchData() {
    fetch("/Json/score.json") // Replace with correct JSON path
      .then(response => response.json())
      .then(data => {
        matchResults = data["Recent Test Result"];
        upcomingMatches = data["Upcoming Games"];

        // Process and display data
        displayRecentMatches(matchResults);
        displayUpcomingMatches(upcomingMatches);
        renderCalendar();
        showDefaultData();
      })
      .catch(error => console.error("Error fetching JSON:", error));
  }

  // Display recent matches
  function displayRecentMatches(matches) {
    recentMatchesContainer.innerHTML = "<h4>Recent Matches</h4>";
    if (matches.length === 0) {
      recentMatchesContainer.innerHTML += "<p>No recent matches available.</p>";
      return;
    }

    let today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for comparison

    let recentMatches = matches.filter(match => {
      let matchDate = new Date(match.Date);
      return matchDate < today; // Filter matches that are in the past
    });

    if (recentMatches.length === 0) {
      recentMatchesContainer.innerHTML += "<p>No recent matches found.</p>";
    } else {
      recentMatches.reverse().forEach(match => {
        recentMatchesContainer.innerHTML += `
          <div class="alert alert-success">
            <strong>${match.TEAM_NAME}</strong><br>
            <span>Score: ${match.Score || "N/A"}</span>
          </div>
        `;
      });
    }
  }

  // Display upcoming matches
  function displayUpcomingMatches(matches) {
    upcomingMatchesContainer.innerHTML = "<h4>Upcoming Matches</h4>";
    if (matches.length === 0) {
      upcomingMatchesContainer.innerHTML += "<p>No upcoming matches scheduled.</p>";
      return;
    }

    let today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for comparison

    let upcomingMatchesList = matches.filter(match => {
      let matchDate = new Date(match.Date);
      return matchDate > today; // Filter matches that are in the future
    });

    if (upcomingMatchesList.length === 0) {
      upcomingMatchesContainer.innerHTML += "<p>No upcoming matches found.</p>";
    } else {
      upcomingMatchesList.forEach(match => {
        upcomingMatchesContainer.innerHTML += `
          <div class="alert alert-info">
            <strong>${match.TEAM_NAME}</strong><br>
            <span>Scheduled Date: ${match.Date}</span>
          </div>
        `;
      });
    }
  }

  // Calendar logic
  let currentMonthIndex = new Date().getMonth(); // Default to current month

  // Render calendar
  function renderCalendar() {
    const months = [
      "January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"
    ];

    calendarContainer.innerHTML = "";
    monthDisplay.textContent = months[currentMonthIndex];

    let daysInMonth = new Date(2025, currentMonthIndex + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      let dayDiv = document.createElement("div");
      dayDiv.className = "calendar-day";
      dayDiv.textContent = i;

      let dateStr = new Date(2025, currentMonthIndex, i).toISOString().split("T")[0];
      dayDiv.dataset.date = dateStr;

      dayDiv.addEventListener("click", function () {
        displayMatches(new Date(dateStr));
      });

      calendarContainer.appendChild(dayDiv);
    }
  }

  // Display matches on a specific day
  function displayMatches(selectedDate) {
    scheduleResults.innerHTML = "";
    let today = new Date();

    let pastMatches = matchResults.filter(match => new Date(match.Date) <= selectedDate);
    let upcomingMatchesForDate = upcomingMatches.filter(match => new Date(match.Date) === selectedDate);

    if (pastMatches.length > 0) {
      scheduleResults.innerHTML += `<h4>Match Results up to ${selectedDate.toDateString()}</h4>`;
      pastMatches.forEach(match => {
        scheduleResults.innerHTML += `
          <div class='alert alert-success'>
            <strong>${match.TEAM_NAME}</strong><br>
            <span>Score: ${match.Score}</span>
          </div>
        `;
      });
    }

    if (upcomingMatchesForDate.length > 0) {
      scheduleResults.innerHTML += `<h4>Upcoming Matches on ${selectedDate.toDateString()}</h4>`;
      upcomingMatchesForDate.forEach(match => {
        scheduleResults.innerHTML += `
          <div class='alert alert-info'>
            <strong>${match.TEAM_NAME}</strong><br>
            <span>Scheduled Date: ${match.Date}</span>
          </div>
        `;
      });
    }

    if (pastMatches.length === 0 && upcomingMatchesForDate.length === 0) {
      scheduleResults.innerHTML = `
        <div class='alert alert-warning'>
          <strong>No matches found for this date.</strong>
        </div>
      `;
    }
  }

  // Show default data for today
  function showDefaultData() {
    displayMatches(new Date());
  }

  // Navigation for calendar
  prevMonthBtn.addEventListener("click", function () {
    if (currentMonthIndex > 0) {
      currentMonthIndex--;
      renderCalendar();
    }
  });

  nextMonthBtn.addEventListener("click", function () {
    if (currentMonthIndex < 11) {
      currentMonthIndex++;
      renderCalendar();
    }
  });

  // Initialize data fetch
  fetchMatchData();
});**/
/**document.addEventListener("DOMContentLoaded", function () {
  const recentMatchesContainer = document.getElementById("recent-matches");
  const upcomingMatchesContainer = document.getElementById("upcoming-matches");
  const liveMatchesContainer = document.getElementById("live-matches");
  const calendarContainer = document.getElementById("calendar");
  const scheduleResults = document.getElementById("schedule-results");
  const monthDisplay = document.getElementById("current-month");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");

  // Calendar Months & Days
  const months = [
    { name: "January", days: 31 },
    { name: "February", days: 28 },
    { name: "March", days: 31 },
    { name: "April", days: 30 },
    { name: "May", days: 31 },
    { name: "June", days: 30 },
    { name: "July", days: 31 },
    { name: "August", days: 31 },
    { name: "September", days: 30 },
    { name: "October", days: 31 },
    { name: "November", days: 30 },
    { name: "December", days: 31 },
  ];

  let currentMonthIndex = new Date().getMonth(); // Default to current month
  let matchResults = [];

  function fetchMatchData() {
    fetch("/Json/score.json") // Make sure this path is correct
      .then((response) => response.json())
      .then((data) => {
        matchResults = data.map((match) => ({
          date: new Date(match.Date), // Ensure you handle the Date format correctly
          match: match.TEAM_NAME,
          score: match.Score || "N/A",
        }));

        renderCalendar();
        showDefaultData();
      })
      .catch((error) => console.error("Error fetching JSON:", error));
  }

  function renderCalendar() {
    calendarContainer.innerHTML = "";
    monthDisplay.textContent = months[currentMonthIndex].name;

    for (let i = 1; i <= months[currentMonthIndex].days; i++) {
      let dayDiv = document.createElement("div");
      dayDiv.className = "calendar-day";
      dayDiv.textContent = i;
      dayDiv.dataset.date = `${months[currentMonthIndex].name} ${i}, 2025`;

      dayDiv.addEventListener("click", function () {
        let selectedDate = this.dataset.date;
        displayMatches(selectedDate);
      });

      calendarContainer.appendChild(dayDiv);
    }
  }

  function displayMatches(date) {
    scheduleResults.innerHTML = "";

    let filteredResults = matchResults.filter((match) => {
      let matchDate = new Date(match.date).toDateString();
      return matchDate === new Date(date).toDateString();
    });

    if (filteredResults.length > 0) {
      scheduleResults.innerHTML += `<h4>Match Results on ${date}</h4>`;
      filteredResults.forEach((match) => {
        scheduleResults.innerHTML += `
          <div class='alert alert-success'>
            <strong>${match.match}</strong><br>
            <span>Score: ${match.score}</span>
          </div>
        `;
      });
    }

    let filteredUpcoming = matchResults.filter((match) => {
      let matchDate = new Date(match.date).toDateString();
      return matchDate === new Date(date).toDateString() && !match.score;
    });

    if (filteredUpcoming.length > 0) {
      scheduleResults.innerHTML += `<h4>Upcoming Matches on ${date}</h4>`;
      filteredUpcoming.forEach((match) => {
        scheduleResults.innerHTML += `
          <div class='alert alert-info'>
            <strong>${match.match}</strong><br>
            <span>Scheduled Date: ${match.date.toDateString()}</span>
          </div>
        `;
      });
    }

    if (filteredResults.length === 0 && filteredUpcoming.length === 0) {
      scheduleResults.innerHTML = `
        <div class='alert alert-warning'>
          <strong>No matches found for ${date}.</strong>
        </div>
      `;
    }
  }

  function showDefaultData() {
    displayMatches(new Date().toLocaleDateString());
  }

  prevMonthBtn.addEventListener("click", function () {
    if (currentMonthIndex > 0) {
      currentMonthIndex--;
      renderCalendar();
    }
  });

  nextMonthBtn.addEventListener("click", function () {
    if (currentMonthIndex < months.length - 1) {
      currentMonthIndex++;
      renderCalendar();
    }
  });

  fetchMatchData();
});
function processMatchData(data) {
  let recentMatches = data["Recent Test Result"];
  let upcomingMatches = data["Upcoming Games"];
  
  if (!Array.isArray(recentMatches) || !Array.isArray(upcomingMatches)) {
    throw new Error("Invalid data structure: 'Recent Test Result' or 'Upcoming Games' is not an array.");
  }

  let today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to compare only the date

  let pastMatches = [];
  let futureMatches = [];
  let liveMatches = [];

  // Process recent matches
  recentMatches.forEach(match => {
    let matchDate = new Date(match.Date);
    matchDate.setHours(0, 0, 0, 0); // Remove time for proper comparison

    if (matchDate < today) {
      pastMatches.push(match);
    } else if (matchDate > today) {
      futureMatches.push(match);
    } else {
      liveMatches.push(match);
    }
  });

  // Process upcoming matches
  upcomingMatches.forEach(match => {
    let matchDate = new Date(match.Date);
    matchDate.setHours(0, 0, 0, 0);

    if (matchDate === today) {
      liveMatches.push(match);
    } else {
      futureMatches.push(match);
    }
  });

  displayRecentMatches(pastMatches);
  displayUpcomingMatches(futureMatches);
  displayLiveMatches(liveMatches);
}**/

/**document.addEventListener("DOMContentLoaded", function () {
  const recentMatchesContainer = document.getElementById("recent-matches");
  const upcomingMatchesContainer = document.getElementById("upcoming-matches");
  const liveMatchesContainer = document.getElementById("live-matches");

  function fetchMatchData() {
    fetch("/Json/score.json") // Ensure the correct path
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Fetched JSON Data:", data); // Debugging line

        if (!data["Recent Test Result"] || !data["Upcoming Games"]) {
          throw new Error("Invalid JSON format: Missing keys");
        }

        processMatchData(data["Recent Test Result"], data["Upcoming Games"]);
      })
      .catch(error => console.error("Error fetching JSON:", error));
  }

  function processMatchData(recentMatches, upcomingMatches) {
    let today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only the date

    let pastMatches = [];
    let futureMatches = [];
    let liveMatches = [];

    recentMatches.forEach(match => {
      let matchDate = new Date(match.Date);
      matchDate.setHours(0, 0, 0, 0); // Remove time for proper comparison

      if (matchDate < today) {
        pastMatches.push(match);
      } else if (matchDate > today) {
        futureMatches.push(match);
      } else {
        liveMatches.push(match);
      }
    });

    upcomingMatches.forEach(match => {
      let matchDate = new Date(match.Date);
      matchDate.setHours(0, 0, 0, 0);

      if (matchDate === today) {
        liveMatches.push(match);
      } else {
        futureMatches.push(match);
      }
    });

    displayRecentMatches(pastMatches);
    displayUpcomingMatches(futureMatches);
    displayLiveMatches(liveMatches);
  }

  function displayRecentMatches(matches) {
    recentMatchesContainer.innerHTML = "<h4>Recent Matches</h4>";
    if (matches.length === 0) {
      recentMatchesContainer.innerHTML += "<p>No recent matches available.</p>";
      return;
    }

    matches.reverse().forEach(match => {
      recentMatchesContainer.innerHTML += `
        <div class="alert alert-success">
          <strong>${match.TEAM_NAME}</strong><br>
          <span>Score: ${match.Score || "N/A"}</span>
        </div>
      `;
    });
  }

  function displayUpcomingMatches(matches) {
    upcomingMatchesContainer.innerHTML = "<h4>Upcoming Matches</h4>";
    if (matches.length === 0) {
      upcomingMatchesContainer.innerHTML += "<p>No upcoming matches scheduled.</p>";
      return;
    }

    matches.forEach(match => {
      upcomingMatchesContainer.innerHTML += `
        <div class="alert alert-info">
          <strong>${match.TEAM_NAME}</strong><br>
          <span>Scheduled Date: ${match.Date}</span>
        </div>
      `;
    });
  }

  function displayLiveMatches(matches) {
    liveMatchesContainer.innerHTML = "<h4>Live Matches</h4>";
    if (matches.length === 0) {
      liveMatchesContainer.innerHTML += "<p>No live matches at the moment.</p>";
      return;
    }

    matches.forEach(match => {
      liveMatchesContainer.innerHTML += `
        <div class="alert alert-warning">
          <strong>Live: ${match.TEAM_NAME}</strong><br>
          <span>Score: ${match.Score || "Updating..."}</span>
        </div>
      `;
    });
  }

  fetchMatchData();
});**/

/**document.addEventListener("DOMContentLoaded", function () {
  const recentMatchesContainer = document.getElementById("recent-matches");
  const upcomingMatchesContainer = document.getElementById("upcoming-matches");
  const liveMatchesContainer = document.getElementById("live-matches");

  function fetchMatchData() {
    fetch("/Json/score.json") // Ensure the correct path
      .then(response => response.json())
      .then(data => {
        processMatchData(data);
      })
      .catch(error => console.error("Error fetching JSON:", error));
  }

  function processMatchData(data) {
    let today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only the date

    let recentMatches = [];
    let upcomingMatches = [];
    let liveMatches = [];

    data.forEach(match => {
      let matchDate = new Date(match.Date);
      matchDate.setHours(0, 0, 0, 0); // Remove time for proper comparison

      if (matchDate < today) {
        recentMatches.push(match);
      } else if (matchDate > today) {
        upcomingMatches.push(match);
      } else {
        liveMatches.push(match);
      }
    });

    displayRecentMatches(recentMatches);
    displayUpcomingMatches(upcomingMatches);
    displayLiveMatches(liveMatches);
  }

  function displayRecentMatches(matches) {
    recentMatchesContainer.innerHTML = "";
    if (matches.length === 0) {
      recentMatchesContainer.innerHTML = "<p>No recent matches available.</p>";
      return;
    }

    matches.reverse().forEach(match => {
      recentMatchesContainer.innerHTML += `
        <div class="alert alert-success">
          <strong>${match.TEAM_NAME}</strong><br>
          <span>Score: ${match.Score || "N/A"}</span>
        </div>
      `;
    });
  }

  function displayUpcomingMatches(matches) {
    upcomingMatchesContainer.innerHTML = "";
    if (matches.length === 0) {
      upcomingMatchesContainer.innerHTML = "<p>No upcoming matches scheduled.</p>";
      return;
    }

    matches.forEach(match => {
      upcomingMatchesContainer.innerHTML += `
        <div class="alert alert-info">
          <strong>${match.TEAM_NAME}</strong><br>
          <span>Scheduled Date: ${match.Date}</span>
        </div>
      `;
    });
  }

  function displayLiveMatches(matches) {
    liveMatchesContainer.innerHTML = "";
    if (matches.length === 0) {
      liveMatchesContainer.innerHTML = "<p>No live matches at the moment.</p>";
      return;
    }

    matches.forEach(match => {
      liveMatchesContainer.innerHTML += `
        <div class="alert alert-warning">
          <strong>Live: ${match.TEAM_NAME}</strong><br>
          <span>Score: ${match.Score || "Updating..."}</span>
        </div>
      `;
    });
  }

  fetchMatchData();
});**/

/**document.addEventListener("DOMContentLoaded", function () {
  const calendarContainer = document.getElementById("calendar");
  const scheduleResults = document.getElementById("schedule-results");
  const monthDisplay = document.getElementById("current-month");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");

  let matchResults = [];
  let currentMonthIndex = new Date().getMonth(); // Default to current month

  function fetchMatchData() {
    fetch("/Json/score.json") // Change this to your actual JSON path
      .then(response => response.json())
      .then(data => {
        matchResults = data.map(match => ({
          date: new Date(match.Date),
          match: match.TEAM_NAME,
          score: match.Score || "N/A"
        }));

        renderCalendar();
        showDefaultData();
      })
      .catch(error => console.error("Error fetching JSON:", error));
  }

  function renderCalendar() {
    calendarContainer.innerHTML = "";
    monthDisplay.textContent = new Date(2025, currentMonthIndex).toLocaleString('default', { month: "long" });

    let daysInMonth = new Date(2025, currentMonthIndex + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      let dayDiv = document.createElement("div");
      dayDiv.className = "calendar-day";
      dayDiv.textContent = i;

      let dateStr = new Date(2025, currentMonthIndex, i).toISOString().split("T")[0];
      dayDiv.dataset.date = dateStr;

      dayDiv.addEventListener("click", function () {
        displayMatches(new Date(dateStr));
      });

      calendarContainer.appendChild(dayDiv);
    }
  }

  function displayMatches(selectedDate) {
    scheduleResults.innerHTML = "";
    let today = new Date();

    let pastMatches = matchResults.filter(match => match.date <= selectedDate);
    let upcomingMatches = matchResults.filter(match => match.date > selectedDate);

    if (pastMatches.length > 0) {
      scheduleResults.innerHTML += `<h4>Match Results up to ${selectedDate.toDateString()}</h4>`;
      pastMatches.forEach(match => {
        scheduleResults.innerHTML += `
          <div class='alert alert-success'>
            <strong>${match.match}</strong><br>
            <span>Score: ${match.score}</span>
          </div>
        `;
      });
    }

    if (upcomingMatches.length > 0) {
      scheduleResults.innerHTML += `<h4>Upcoming Matches after ${selectedDate.toDateString()}</h4>`;
      upcomingMatches.forEach(match => {
        scheduleResults.innerHTML += `
          <div class='alert alert-info'>
            <strong>${match.match}</strong><br>
            <span>Scheduled Date: ${match.date.toDateString()}</span>
          </div>
        `;
      });
    }

    if (pastMatches.length === 0 && upcomingMatches.length === 0) {
      scheduleResults.innerHTML = `
        <div class='alert alert-warning'>
          <strong>No matches found for this date.</strong>
        </div>
      `;
    }
  }

  function showDefaultData() {
    displayMatches(new Date());
  }

  prevMonthBtn.addEventListener("click", function () {
    if (currentMonthIndex > 0) {
      currentMonthIndex--;
      renderCalendar();
    }
  });

  nextMonthBtn.addEventListener("click", function () {
    if (currentMonthIndex < 11) {
      currentMonthIndex++;
      renderCalendar();
    }
  });

  fetchMatchData();
}); **/

/**document.addEventListener('DOMContentLoaded', function () {
  const calendarContainer = document.getElementById('calendar');
  const scheduleResults = document.getElementById('schedule-results');
  const monthDisplay = document.getElementById('current-month');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');

  // Calendar Months & Days
  const months = [
    { name: 'January', days: 31 },
    { name: 'February', days: 28 },
    { name: 'March', days: 31 },
    { name: 'April', days: 30 },
    { name: 'May', days: 31 },
    { name: 'June', days: 30 },
    { name: 'July', days: 31 },
    { name: 'August', days: 31 },
    { name: 'September', days: 30 },
    { name: 'October', days: 31 },
    { name: 'November', days: 30 },
    { name: 'December', days: 31 }
  ];

  // Match Results (Scoreboard)
  const matchResults = [
    
    
    { date: 'February 15, 2025', match: 'Coders vs Lions', score: '98-100' },
    { date: 'February 14, 2025', match: 'Coders vs Panthers', score: '98-100' },
    { date: 'February 12, 2025', match: 'Coders vs Dragons', score: '98-100' },
    { date: 'February 11, 2025', match: 'Coders vs Sharks', score: '98-100' },
    { date: 'February 10, 2025', match: 'Coders vs Bulls', score: '100-98' },
    { date: 'February 9, 2025', match: 'Coders vs Warriors', score: '105-98' },
    { date: 'February 8, 2025', match: 'Coders vs Titans', score: '112-110' },
    { date: 'February 7, 2025', match: 'Coders vs Hawks', score: '99-101' }
  ];

  // Upcoming Matches
  const upcomingMatches = [
    { date: 'February 12, 2025', match: 'Coders vs Dragons' },
    { date: 'February 15, 2025', match: 'Coders vs Panthers' },
    { date: 'February 18, 2025', match: 'Coders vs Lions' }
  ];

  let currentMonthIndex = 1;

  function renderCalendar() {
    calendarContainer.innerHTML = '';
    monthDisplay.textContent = months[currentMonthIndex].name;

    for (let i = 1; i <= months[currentMonthIndex].days; i++) {
      let dayDiv = document.createElement('div');
      dayDiv.className = 'calendar-day';
      dayDiv.textContent = i;
      dayDiv.dataset.date = `${months[currentMonthIndex].name} ${i}, 2025`;
      
      dayDiv.addEventListener('click', function () {
        let selectedDate = this.dataset.date;
        displayMatches(selectedDate);
      });

      calendarContainer.appendChild(dayDiv);
    }
  }

  function displayMatches(date) {
    scheduleResults.innerHTML = '';

    let filteredResults = matchResults.filter(match => match.date === date);
    if (filteredResults.length > 0) {
      scheduleResults.innerHTML += `<h4>Match Results on ${date}</h4>`;
      filteredResults.forEach(match => {
        scheduleResults.innerHTML += `
          <div class='alert alert-success'>
            <strong>${match.match}</strong><br>
            <span>Score: ${match.score}</span>
          </div>
        `;
      });
    }

    let filteredUpcoming = upcomingMatches.filter(match => match.date === date);
    if (filteredUpcoming.length > 0) {
      scheduleResults.innerHTML += `<h4>Upcoming Matches on ${date}</h4>`;
      filteredUpcoming.forEach(match => {
        scheduleResults.innerHTML += `
          <div class='alert alert-info'>
            <strong>${match.match}</strong><br>
            <span>Scheduled Date: ${match.date}</span>
          </div>
        `;
      });
    }

    if (filteredResults.length === 0 && filteredUpcoming.length === 0) {
      scheduleResults.innerHTML = `
        <div class='alert alert-warning'>
          <strong>No matches found for ${date}.</strong>
        </div>
      `;
    }
  }

  function showDefaultData() {
    scheduleResults.innerHTML = `<h4>Recent Match Results</h4>`;
    matchResults.forEach(match => {
      scheduleResults.innerHTML += `
        <div class='alert alert-success'>
          <strong>${match.match}</strong><br>
          <span>Score: ${match.score}</span>
        </div>
      `;
    });

    scheduleResults.innerHTML += `<h4>Upcoming Matches</h4>`;
    upcomingMatches.forEach(match => {
      scheduleResults.innerHTML += `
        <div class='alert alert-info'>
          <strong>${match.match}</strong><br>
          <span>Scheduled Date: ${match.date}</span>
        </div>
      `;
    });
  }

  prevMonthBtn.addEventListener('click', function () {
    if (currentMonthIndex > 0) {
      currentMonthIndex--;
      renderCalendar();
    }
  });

  nextMonthBtn.addEventListener('click', function () {
    if (currentMonthIndex < months.length - 1) {
      currentMonthIndex++;
      renderCalendar();
    }
  });

  renderCalendar();

  showDefaultData();
//});**/