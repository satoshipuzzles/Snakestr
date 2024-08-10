import { CONFIG } from "./config.js";
import { NostrClient } from "./nostrUtils.js";
import { SnakeGame } from "./game.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialization
  console.log("DOM fully loaded");
  const nostrClient = new NostrClient(CONFIG.WEBSOCKET_URL);
  const game = new SnakeGame("game-canvas");
  let isOpen = false;
  let npub = null;
  let highscore = localStorage.getItem("highscore") || 0;
  let unlockedEmojis = JSON.parse(localStorage.getItem("unlockedEmojis")) || [
    CONFIG.DEFAULT_EMOJI,
  ];

  // DOM Element Selection
  const elements = {
    loginButton: document.getElementById("login-button"),
    profilePic: document.getElementById("profile-pic"),
    recentScores: document.getElementById("recent-scores"),
    recentScoresList: document.getElementById("recent-scores-list"),
    settingsButton: document.getElementById("settings-button"),
    restartButton: document.getElementById("restart-button"),
    postScoreButton: document.getElementById("post-score-button"),
    viewHighscoresButton: document.getElementById("view-highscores-button"),
    gameContainer: document.getElementById("game-container"),
    gameoverScreen: document.getElementById("gameover-screen"),
    scoreElement: document.getElementById("score"),
    highscoreElement: document.getElementById("highscore"),
    finalScoreElement: document.getElementById("final-score"),
    settingsPopup: document.getElementById("settings-popup"),
    closeSettingsBtn: document.querySelector(".close-btn"),
    emojiListContainer: document.querySelector(".emoji-list"),
    feedback: document.getElementById("feedback"),
  };

  // Initial UI Setup
  elements.restartButton.style.display = "none";
  elements.settingsButton.style.display = "none";
  updateHighscoreDisplay();

  // Event Listeners
  elements.loginButton.addEventListener("click", handleLogin);
  elements.restartButton.addEventListener("click", handleRestart);
  elements.settingsButton.addEventListener("click", handleSettingsOpen);
  elements.closeSettingsBtn.addEventListener("click", handleSettingsClose);
  elements.postScoreButton.addEventListener("click", handlePostScore);
  elements.viewHighscoresButton.addEventListener("click", handleViewHighscores);
  document.addEventListener("keydown", (e) => game.changeDirection(e.key));
  elements.profilePic.addEventListener("click", toggleRecentScores);

  // Add document click event listener to close recent scores when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !elements.profilePic.contains(event.target) &&
      !elements.recentScores.contains(event.target)
    ) {
      elements.recentScores.classList.remove("open");
      isOpen = false;
    }
  });

  // Game-related functions
  game.onGameOver = async (score) => {
    if (score > highscore) {
      highscore = score;
      localStorage.setItem("highscore", highscore);
      updateHighscoreDisplay();
    }
    elements.finalScoreElement.textContent = `Final Score: ${score}`;
    elements.gameoverScreen.style.display = "flex";
  };

  game.onScoreUpdate = (score) => {
    elements.scoreElement.textContent = `Score: ${score}`;
  };

  // UI-related functions
  async function handleLogin() {
    console.log("Login button clicked");
    if (window.nostr && window.nostr.getPublicKey) {
      try {
        npub = await window.nostr.getPublicKey();
        console.log("Logged in with npub:", npub);
        await nostrClient.connect();
        const profile = await nostrClient.fetchProfile(npub);
        if (profile && profile.picture) {
          elements.profilePic.innerHTML = `<img src="${profile.picture}" alt="Profile Picture">`;
        }
        elements.loginButton.style.display = "none";
        elements.settingsButton.style.display = "block";
        elements.restartButton.style.display = "block";
        game.start();
        console.log("Added event listeners to profile pic");
      } catch (error) {
        console.error("Error logging in:", error);
        showFeedback("Error logging in. Please try again.");
      }
    } else {
      alert("NIP-07 extension not found. Please install a Nostr extension.");
    }
  }

  function handleRestart() {
    elements.gameoverScreen.style.display = "none";
    game.start();
  }

  function handleSettingsOpen() {
    updateEmojiList();
    elements.settingsPopup.style.display = "block";
  }

  function handleSettingsClose() {
    elements.settingsPopup.style.display = "none";
  }

  async function handlePostScore() {
    if (npub) {
      try {
        await nostrClient.postHighScore(npub, game.score, unlockedEmojis);
        showFeedback("High score posted to Nostr!");
      } catch (error) {
        console.error("Error posting high score:", error);
        showFeedback("Error posting high score. Please try again.");
      }
    }
  }

  function handleViewHighscores() {
    window.location.href = "highscores.html";
  }

  function toggleRecentScores() {
    isOpen = !isOpen;
    if (isOpen) {
      elements.recentScores.classList.add("open");
      showRecentScores();
    } else {
      elements.recentScores.classList.remove("open");
    }
  }

  async function showRecentScores() {
    console.log("showRecentScores called");
    if (npub && nostrClient) {
      try {
        const scores = await nostrClient.fetchUserHighScores(npub);
        console.log("Fetched recent scores:", scores);
        if (elements.recentScoresList) {
          elements.recentScoresList.innerHTML = scores
            .map((score) => `<li>${score}</li>`)
            .join("");
          console.log("Recent scores list updated");
        } else {
          console.error("Recent scores list element not found");
        }
      } catch (error) {
        console.error("Error fetching recent scores:", error);
      }
    } else {
      console.error("npub or nostrClient is not defined");
    }
  }

  // Utility functions
  function updateEmojiList() {
    elements.emojiListContainer.innerHTML = "";
    unlockedEmojis.forEach((emoji) => {
      const emojiItem = document.createElement("div");
      emojiItem.textContent = emoji;
      emojiItem.classList.add("emoji-item");
      emojiItem.addEventListener("click", () => {
        CONFIG.DEFAULT_EMOJI = emoji;
        elements.settingsPopup.style.display = "none";
      });
      elements.emojiListContainer.appendChild(emojiItem);
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
      showFeedback(`New emoji unlocked: ${randomEmoji}!`);
      updateEmojiList();
    }
  }

  function showFeedback(message) {
    elements.feedback.textContent = message;
    setTimeout(() => {
      elements.feedback.textContent = "";
    }, 3000);
  }

  function updateHighscoreDisplay() {
    elements.highscoreElement.textContent = `High Score: ${highscore}`;
  }

  // Initialize the game
  updateEmojiList();
});
