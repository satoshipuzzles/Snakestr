import { CONFIG } from "./config.js";

export class SnakeGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = CONFIG.CANVAS_SIZE;
    this.canvas.height = CONFIG.CANVAS_SIZE;
    this.cellSize = CONFIG.CANVAS_SIZE / CONFIG.GAME_SIZE;
    this.reset();
    this.lastRenderTime = 0;
    this.gameLoopId = null;
    this.electrifiedUntil = 0;
    this.directionQueue = []; // Queue to store direction changes
    this.isPaused = false;
    this.pauseMenu = document.getElementById("pause-menu");
  }

  reset() {
    this.snake = [{ x: 10, y: 10 }];
    this.direction = { x: 0, y: 0 };
    this.lightning = this.getRandomPosition();
    this.score = 0;
    this.gameOver = false;
    this.electrifiedUntil = 0;
    this.directionQueue = []; // Reset direction queue
    this.isPaused = false;
  }

  start() {
    this.reset();
    this.gameLoop();
  }

  gameLoop(currentTime) {
    try {
      if (this.gameOver) {
        this.onGameOver(this.score);
        return;
      }

      this.gameLoopId = window.requestAnimationFrame(this.gameLoop.bind(this));

      if (this.isPaused) {
        return; // Don't update game state if paused
      }

      const secondsSinceLastRender = (currentTime - this.lastRenderTime) / 1000;
      if (secondsSinceLastRender < 1 / (CONFIG.TICK_RATE / 5)) return;

      this.lastRenderTime = currentTime;

      this.update();
      this.draw();
    } catch (error) {
      console.error("Error in game loop:", error);
      this.gameOver = true;
    }
  }

  update() {
    // Process the next direction from the queue
    if (this.directionQueue.length > 0) {
      const nextDir = this.directionQueue.shift();
      if (this.isValidDirectionChange(this.direction, nextDir)) {
        this.direction = nextDir;
      }
    }

    const head = {
      x: this.wrapCoordinate(this.snake[0].x + this.direction.x),
      y: this.wrapCoordinate(this.snake[0].y + this.direction.y),
    };

    // Check for collision before adding the new head
    if (this.checkCollision(head)) {
      this.gameOver = true;
      return;
    }

    // Add the new head to the snake
    this.snake.unshift(head);

    // Check if the snake has eaten the food
    if (head.x === this.lightning.x && head.y === this.lightning.y) {
      // Increase score and generate new food
      this.score++;
      this.updateScoreDisplay();
      this.lightning = this.getRandomPosition();
      this.onScoreUpdate(this.score);
      this.electrifiedUntil = Date.now() + CONFIG.ELECTRIFIED_DURATION;
      // Don't remove the tail when food is eaten
    } else {
      // Remove the tail if no food was eaten
      this.snake.pop();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const isElectrified = Date.now() < this.electrifiedUntil;

    // Draw snake
    this.snake.forEach((segment, index) => {
      this.ctx.font = `${this.cellSize * 0.8}px Arial`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";

      let emoji;
      if (index === 0) {
        emoji = CONFIG.DEFAULT_EMOJI;
      } else if (isElectrified && index % 2 === 0) {
        emoji = CONFIG.ELECTRIFIED_EMOJI;
      } else {
        emoji = "🟩";
      }

      this.ctx.fillText(
        emoji,
        segment.x * this.cellSize + this.cellSize / 2,
        segment.y * this.cellSize + this.cellSize / 2
      );
    });

    // Draw lightning
    this.ctx.fillText(
      CONFIG.LIGHTNING_EMOJI,
      this.lightning.x * this.cellSize + this.cellSize / 2,
      this.lightning.y * this.cellSize + this.cellSize / 2
    );
  }

  wrapCoordinate(coord) {
    return (coord + CONFIG.GAME_SIZE) % CONFIG.GAME_SIZE;
  }

  checkCollision(head) {
    return this.snake
      .slice(1)
      .some(
        (segment) =>
          this.wrapCoordinate(segment.x) === head.x &&
          this.wrapCoordinate(segment.y) === head.y
      );
  }

  getRandomPosition() {
    let newPosition;
    do {
      newPosition = {
        x: Math.floor(Math.random() * CONFIG.GAME_SIZE),
        y: Math.floor(Math.random() * CONFIG.GAME_SIZE),
      };
    } while (this.isPositionOccupied(newPosition));
    return newPosition;
  }

  isPositionOccupied(position) {
    return this.snake.some(
      (segment) => segment.x === position.x && segment.y === position.y
    );
  }

  changeDirection(newDirection) {
    const directionMap = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };

    if (directionMap[newDirection]) {
      // Add new direction to the queue instead of immediately changing
      this.directionQueue.push(directionMap[newDirection]);
    }
  }

  isValidDirectionChange(currentDir, newDir) {
    return currentDir.x + newDir.x !== 0 || currentDir.y + newDir.y !== 0;
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.pauseMenu.style.display = "flex";
    } else {
      this.pauseMenu.style.display = "none";
    }
  }

  resumeGame() {
    if (this.isPaused) {
      this.togglePause();
    }
  }

  restartGame() {
    this.reset();
    this.resumeGame();
  }

  navigateToHighscores() {
    this.isPaused = false;
    this.gameOver = true;
    window.location.href = "highscores.html";
  }

  updateScoreDisplay() {
    // This method should be implemented to update the score display in your UI
    console.log(`Score: ${this.score}`);
  }

  onGameOver(score) {
    // This method can be overridden from outside to handle game over events
    console.log(`Game Over. Final Score: ${score}`);
  }

  onScoreUpdate(score) {
    // This method can be overridden from outside to handle score updates
    console.log(`Score Updated: ${score}`);
  }
}
