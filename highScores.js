document.addEventListener("DOMContentLoaded", () => {
  const highscoreList = document.querySelector(".highscore-list");
  const backButton = document.getElementById("back-button");
  const loadingIndicator = document.getElementById("loading");

  backButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  async function fetchHighScores() {
    highscoreList.innerHTML = "";
    loadingIndicator.style.display = "block";
    const ws = new WebSocket("wss://nostrpub.yeghro.site");

    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(JSON.stringify(["REQ", "2", { kinds: [69420] }]));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data[0] === "EVENT" && data[2].content) {
        const scoreTag = data[2].tags.find((tag) => tag[0] === "s");
        if (scoreTag) {
          const score = scoreTag[1];
          const profile = data[2].pubkey;
          fetchProfile(profile).then((profileData) => {
            addHighScore(profileData, score);
            sortHighScores();
          });
        }
      }
    };

    ws.onerror = (error) => {
      console.error("Error fetching high scores:", error);
      displayErrorMessage();
    };

    ws.onclose = () => {
      loadingIndicator.style.display = "none";
      if (highscoreList.children.length === 0) {
        displayNoScoresMessage();
      }
    };
  }

  async function fetchProfile(pubkey) {
    const ws = new WebSocket("wss://nostrpub.yeghro.site");
    return new Promise((resolve, reject) => {
      ws.onopen = () => {
        ws.send(
          JSON.stringify(["REQ", "1", { kinds: [0], authors: [pubkey] }])
        );
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data[0] === "EVENT" && data[2].content) {
          try {
            const profile = JSON.parse(data[2].content);
            ws.close();
            resolve(profile);
          } catch (error) {
            console.error("Error parsing profile JSON:", error);
            ws.close();
            resolve({ name: pubkey, picture: null });
          }
        }
      };

      ws.onerror = (error) => {
        console.error("Error fetching profile:", error);
        reject(error);
      };
    });
  }

  function addHighScore(profileData, score) {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex align-items-center";
    const imgSrc = profileData.picture || "placeholder.png";
    li.innerHTML = `
        <img src="${imgSrc}" alt="Profile Picture" class="me-3" onerror="this.src='placeholder.png'; console.log('Error loading image for ${
      profileData.name
    }');">
        <span class="flex-grow-1">${
          profileData.name || profileData.pubkey
        }</span>
        <span class="badge bg-primary rounded-pill">${score}</span>
      `;
    highscoreList.appendChild(li);
  }

  function sortHighScores() {
    const scores = Array.from(highscoreList.children);
    scores.sort((a, b) => {
      const scoreA = parseInt(a.querySelector(".badge").textContent);
      const scoreB = parseInt(b.querySelector(".badge").textContent);
      return scoreB - scoreA;
    });
    scores.forEach((score) => highscoreList.appendChild(score));
  }

  function displayNoScoresMessage() {
    highscoreList.innerHTML =
      "<div class='alert alert-info'>No high scores available yet. Be the first to set a high score!</div>";
  }

  function displayErrorMessage() {
    highscoreList.innerHTML =
      "<div class='alert alert-danger'>Error loading high scores. Please try again later.</div>";
  }

  console.log("Initializing high scores fetch");
  fetchHighScores();
});
