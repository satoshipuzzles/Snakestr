import { CONFIG } from "./config.js";
import { NostrClient } from "./nostrUtils.js";
import { SnakeGame } from "./game.js";

document.addEventListener("DOMContentLoaded", () => {
  const nostrClient = new NostrClient(CONFIG.WEBSOCKET_URL);
  const game = new SnakeGame("game-canvas");
  let npub = null;
  let highscore = localStorage.getItem("highscore") || 0;
  let unlockedEmojis = JSON.parse(localStorage.getItem("unlockedEmojis")) || [
    CONFIG.DEFAULT_EMOJI,
  ];

  const loginButton = document.getElementById("login-button");
  const profilePic = document.getElementById("profile-pic");
  const settingsButton = document.getElementById("settings-button");
  const restartButton = document.getElementById("restart-button");
  const postScoreButton = document.getElementById("post-score-button");
  const gameContainer = document.getElementById("game-container");
  const gameoverScreen = document.getElementById("gameover-screen");
  const highscoreElement = document.getElementById("highscore");
  const settingsPopup = document.getElementById("settings-popup");
  const closeSettingsBtn = document.querySelector(".close-btn");
  const emojiListContainer = document.querySelector(".emoji-list");
  const feedback = document.getElementById("feedback");

  highscoreElement.textContent = `High Score: ${highscore}`;
  settingsButton.style.display = "none";
  restartButton.style.display = "none";
  postScoreButton.style.display = "none";
  gameContainer.style.display = "none";

  loginButton.addEventListener("click", async () => {
    if (window.nostr && window.nostr.getPublicKey) {
      try {
        npub = await window.nostr.getPublicKey();
        await nostrClient.connect();
        const profile = await nostrClient.fetchProfile(npub);
        if (profile && profile.picture) {
          profilePic.innerHTML = `<img src="${profile.picture}" alt="Profile Picture">`;
        }
        loginButton.style.display = "none";
        settingsButton.style.display = "block";
        restartButton.style.display = "block";
        gameContainer.style.display = "block";
        game.start();
      } catch (error) {
        console.error("Error logging in:", error);
        feedback.textContent = "Error logging in. Please try again.";
      }
    } else {
      alert("NIP-07 extension not found. Please install a Nostr extension.");
    }
  });

  restartButton.addEventListener("click", () => {
    gameoverScreen.style.display = "none";
    game.start();
  });

  settingsButton.addEventListener("click", () => {
    updateEmojiList();
    settingsPopup.style.display = "block";
  });

  closeSettingsBtn.addEventListener("click", () => {
    settingsPopup.style.display = "none";
  });

  postScoreButton.addEventListener("click", async () => {
    if (npub) {
      try {
        await nostrClient.postHighScore(npub, game.score, unlockedEmojis);
        feedback.textContent = "High score posted to Nostr!";
        setTimeout(() => {
          feedback.textContent = "";
        }, 3000);
        await fetchAndDisplayHighScores();
      } catch (error) {
        console.error("Error posting high score:", error);
        feedback.textContent = "Error posting high score. Please try again.";
      }
    }
  });

  game.onGameOver = async (score) => {
    if (score > highscore) {
      highscore = score;
      localStorage.setItem("highscore", highscore);
      highscoreElement.textContent = `High Score: ${highscore}`;
      unlockNewEmoji();
    }
    gameoverScreen.style.display = "flex";
    postScoreButton.style.display = "block";
    await fetchAndDisplayHighScores();
  };

  function updateEmojiList() {
    emojiListContainer.innerHTML = "";
    unlockedEmojis.forEach((emoji, index) => {
      const emojiItem = document.createElement("div");
      emojiItem.textContent = emoji;
      emojiItem.classList.add("emoji-item");
      emojiItem.addEventListener("click", () => {
        CONFIG.DEFAULT_EMOJI = emoji;
        settingsPopup.style.display = "none";
      });
      emojiListContainer.appendChild(emojiItem);
    });
  }

  function unlockNewEmoji() {
    const newEmojis = CONFIG.UNLOCKABLE_EMOJIS.filter(
      (emoji) => !unlockedEmojis.includes(emoji)
    );
    if (newEmojis.length > 0) {
      const randomEmoji =
        newEmojis[Math.floor(Math.random() * newEmojis.length)];
      unlockedEmojis.push(randomEmoji);
      localStorage.setItem("unlockedEmojis", JSON.stringify(unlockedEmojis));
      feedback.textContent = `New emoji unlocked: ${randomEmoji}!`;
      setTimeout(() => {
        feedback.textContent = "";
      }, 3000);
      updateEmojiList();
    }
  }

  async function fetchAndDisplayHighScores() {
    try {
      const highScores = await nostrClient.fetchHighScores();
      displayHighScores(highScores);
    } catch (error) {
      console.error("Error fetching high scores:", error);
      feedback.textContent = "Error fetching high scores. Please try again.";
    }
  }

  function displayHighScores(highScores) {
    const highscoreList = document.querySelector("#highscore-list ul");
    highscoreList.innerHTML = "";
    highScores.slice(0, 10).forEach((score, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
                <img src="${
                  score.picture || "placeholder.png"
                }" alt="Profile Picture">
                <span>${score.name || "Anonymous"}</span>: ${score.score}
            `;
      highscoreList.appendChild(li);
    });
  }

  // Touch controls for mobile devices
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener(
    "touchstart",
    function (e) {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    },
    false
  );

  document.addEventListener(
    "touchend",
    function (e) {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        game.changeDirection(dx > 0 ? "ArrowRight" : "ArrowLeft");
      } else {
        game.changeDirection(dy > 0 ? "ArrowDown" : "ArrowUp");
      }
    },
    false
  );

  // Keyboard controls
  document.addEventListener("keydown", (e) => game.changeDirection(e.key));

  // Initialize the game
  updateEmojiList();
});
