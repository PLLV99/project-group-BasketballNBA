// ✅ 1. Extract URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const date = decodeURIComponent(urlParams.get('date') || '');
const teams = decodeURIComponent(urlParams.get('teams') || '');
const score = decodeURIComponent(urlParams.get('score') || '');
const status = decodeURIComponent(urlParams.get('status') || '');

// ✅ 2. Display match details
const scoreDetails = document.getElementById('score-details');
scoreDetails.innerHTML = `
  <p><strong>Date:</strong> ${date}</p>
  <p><strong>Teams:</strong> ${teams}</p>
  <p><strong>Score:</strong> ${score}</p>
  <p><strong>Status:</strong> ${status}</p>
`;

// ✅ 3. Fetch video URL from XML based on date & teams
async function fetchVideoUrl(date, teams) {
  try {
    const response = await fetch('/xml/nba_video.xml'); // Update path if needed
    if (!response.ok) throw new Error('Failed to fetch XML file');

    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "application/xml");
    const videos = xml.querySelectorAll('video');

    for (let video of videos) {
      const videoDate = video.querySelector('date')?.textContent.trim();
      const videoTeams = video.querySelector('teams')?.textContent.trim();

      if (videoDate === date && videoTeams === teams) {
        const videoUrl = video.querySelector('url')?.textContent.trim();
        return videoUrl;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching or parsing XML:', error);
    return null;
  }
}

// ✅ 4. Extract YouTube Video ID
function extractYouTubeID(url) {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

// ✅ 5. Embed YouTube iframe
function embedYouTube(videoId) {
  const videoContainer = document.getElementById('videoList');

  if (!videoId) {
    videoContainer.innerHTML = `<p class="text-danger mt-3">⚠️ Invalid YouTube URL format.</p>`;
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${videoId}`;
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  iframe.frameBorder = "0";

  videoContainer.innerHTML = ''; // clear previous
  videoContainer.appendChild(iframe);
}

// ✅ 6. Load video on page load
fetchVideoUrl(date, teams).then(videoUrl => {
  if (videoUrl) {
    const videoId = extractYouTubeID(videoUrl);
    embedYouTube(videoId);
  } else {
    const videoContainer = document.getElementById('videoList');
    videoContainer.innerHTML = `<p class="text-warning mt-3">📺 No video available for this match.</p>`;
  }
});
