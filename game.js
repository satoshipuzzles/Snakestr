import { CONFIG } from "./config.js";

export class SnakeGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = CONFIG.CANVAS_SIZE;
    this.canvas.height = CONFIG.CANVAS_SIZE;
    this.cellSize = CONFIG.CANVAS_SIZE / CONFIG.GAME_SIZE;
    this.reset();
  }

  reset() {
    this.snake = [{ x: 10, y: 10 }];
    this.direction = { x: 0, y: 0 };
    this.lightning = this.getRandomPosition();
    this.score = 0;
    this.gameOver = false;
  }

  start() {
    this.reset();
    this.gameLoop();
  }

  gameLoop() {
    if (this.gameOver) return;
    setTimeout(() => {
      this.update();
      this.draw();
      this.gameLoop();
    }, 1000 / (CONFIG.TICK_RATE / 5));
  }

  update() {
    const head = {
      x:
        (this.snake[0].x + this.direction.x + CONFIG.GAME_SIZE) %
        CONFIG.GAME_SIZE,
      y:
        (this.snake[0].y + this.direction.y + CONFIG.GAME_SIZE) %
        CONFIG.GAME_SIZE,
    };

    if (this.checkCollision(head)) {
      this.gameOver = true;
      document.getElementById("gameover-screen").style.display = "flex";
      return;
    }

    this.snake.unshift(head);

    if (head.x === this.lightning.x && head.y === this.lightning.y) {
      this.score++;
      this.lightning = this.getRandomPosition();
    } else {
      this.snake.pop();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw snake
    this.snake.forEach((segment, index) => {
      this.ctx.font = `${this.cellSize}px Arial`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(
        index === 0 ? CONFIG.DEFAULT_EMOJI : "🟩",
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

    // Update score
    document.getElementById("score").textContent = `Score: ${this.score}`;
  }

  checkCollision(head) {
    return this.snake
      .slice(1)
      .some((segment) => segment.x === head.x && segment.y === head.y);
  }

  getRandomPosition() {
    return {
      x: Math.floor(Math.random() * CONFIG.GAME_SIZE),
      y: Math.floor(Math.random() * CONFIG.GAME_SIZE),
    };
  }

  changeDirection(newDirection) {
    const opposites = {
      ArrowUp: "ArrowDown",
      ArrowDown: "ArrowUp",
      ArrowLeft: "ArrowRight",
      ArrowRight: "ArrowLeft",
    };
    if (newDirection === opposites[this.lastDirection]) return;

    this.direction =
      {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      }[newDirection] || this.direction;

    this.lastDirection = newDirection;
  }
}
