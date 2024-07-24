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
    this.directionQueue = []; // New: Queue to store direction changes
  }

  reset() {
    this.snake = [{ x: 10, y: 10 }];
    this.direction = { x: 0, y: 0 };
    this.lightning = this.getRandomPosition();
    this.score = 0;
    this.gameOver = false;
    this.electrifiedUntil = 0;
    this.directionQueue = []; // Reset direction queue
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

    if (this.checkCollision(head)) {
      this.gameOver = true;
      return;
    }

    this.snake.unshift(head);

    if (head.x === this.lightning.x && head.y === this.lightning.y) {
      this.score++;
      this.lightning = this.getRandomPosition();
      this.onScoreUpdate(this.score);
      this.electrifiedUntil = Date.now() + CONFIG.ELECTRIFIED_DURATION;
    } else {
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
    return {
      x: Math.floor(Math.random() * CONFIG.GAME_SIZE),
      y: Math.floor(Math.random() * CONFIG.GAME_SIZE),
    };
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

  onGameOver(score) {
    // This method can be overridden from outside to handle game over events
  }

  onScoreUpdate(score) {
    // This method can be overridden from outside to handle score updates
  }
}
