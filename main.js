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
  const viewHighscoresButton = document.getElementById(
    "view-highscores-button"
  );
  const gameContainer = document.getElementById("game-container");
  const gameoverScreen = document.getElementById("gameover-screen");
  const scoreElement = document.getElementById("score");
  const finalScoreElement = document.getElementById("final-score");
  const settingsPopup = document.getElementById("settings-popup");
  const closeSettingsBtn = document.querySelector(".close-btn");
  const emojiListContainer = document.querySelector(".emoji-list");
  const feedback = document.getElementById("feedback");

  // Hide game elements initially
  gameContainer.style.display = "none";
  gameoverScreen.style.display = "none";
  settingsButton.style.display = "none";
  restartButton.style.display = "none";

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
      } catch (error) {
        console.error("Error posting high score:", error);
        feedback.textContent = "Error posting high score. Please try again.";
      }
    }
  });

  viewHighscoresButton.addEventListener("click", () => {
    window.location.href = "highscores.html";
  });

  game.onGameOver = async (score) => {
    if (score > highscore) {
      highscore = score;
      localStorage.setItem("highscore", highscore);
    }
    finalScoreElement.textContent = `Final Score: ${score}`;
    gameoverScreen.style.display = "flex";
  };

  game.onScoreUpdate = (score) => {
    scoreElement.textContent = `Score: ${score}`;
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

  // Keyboard controls
  document.addEventListener("keydown", (e) => game.changeDirection(e.key));

  // Initialize the game
  updateEmojiList();
});
