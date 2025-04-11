import Snake, { DirectionTypes } from './snake';
import Painter from './painter';

const GAME_GRID_SIZE = 21;

export interface Coord {
  x: number;
  y: number;
}

export enum PowerUpType {
  SPEED_UP,
  SPEED_DOWN,
  WALL_PASS,
  REVERSE_CONTROL
}

export interface PowerUp extends Coord {
  type: PowerUpType;
  duration: number;
}

export default class Game {

  snake: Snake;
  painter: Painter;
  size: number;
  private _timer: any;
  private _apple: Coord = { x: 0, y: 0 };
  private _powerUp: PowerUp | null = null;
  private _start = false;
  private _speed = 200;
  private _wallPass = false;
  private _reverseControl = false;
  private _powerUpTimeout: number | null = null;
  private _powerUpStartTime: number | null = null;
  private _score = 0;
  private _highScore = 0;
  private _powerUpCount = 0;
  private _lastFrameTime = 0;
  private _frameCount = 0;
  private _fps = 0;
  private _lastFpsUpdate = Date.now();

  getPowerUpRemainingTime(): number {
    if (!this._powerUpStartTime || !this._powerUpTimeout) return 0;
    const elapsed = Date.now() - this._powerUpStartTime;
    return Math.max(0, 5000 - elapsed);
  }

  constructor(container: HTMLElement, size = GAME_GRID_SIZE) {
    this.size = size;

    const headCoord = { x: Math.floor(this.size / 2), y: Math.floor(this.size / 2) };
    this.snake = new Snake(this.size, [
      headCoord,
      { x: headCoord.x, y: headCoord.y + 1 },
      { x: headCoord.x, y: headCoord.y + 2 },
    ], DirectionTypes.UP);

    // 初始化分数为0
    this._score = 0;
    // 从localStorage读取最高分
    this._highScore = parseInt(localStorage.getItem('snake_high_score') || '0');

    this.painter = new Painter(container, size);
    this.painter.setGame(this);

    window.addEventListener('keydown', this._handleKeydown, false);

    this._placeApple();
    // 初始化时不调用_update，避免提前计算分数
    this.painter.drawGrid();
    this.painter.drawApple(this._apple);
    this.painter.drawSnake(this.snake, 0);
    this.painter.drawInfoPanel(0, this._highScore);
  }

  private _getAvailableCoords = () => {
    const { segments } = this.snake;
    return new Array(this.size ** 2)
      .fill(0)
      .map((_, index) => ({
        x: index % this.size,
        y: Math.floor(index / this.size)
      }))
      .filter(coord => 
        segments.every(({ x, y }) => coord.x !== x || coord.y !== y) &&
        (this._powerUp === null || coord.x !== this._powerUp.x || coord.y !== this._powerUp.y) &&
        (coord.x !== this._apple.x || coord.y !== this._apple.y)
      );
  }

  private _placeApple = () => {
    const coords = this._getAvailableCoords();
    if (coords.length === 0) return;
    const index = Math.floor(coords.length * Math.random());
    this._apple = coords[index];
  }

  private _placePowerUp = () => {
    if (this._powerUp !== null) return;
    
    const coords = this._getAvailableCoords();
    if (coords.length === 0) return;
    
    const index = Math.floor(coords.length * Math.random());
    const coord = coords[index];
    
    const types = Object.values(PowerUpType).filter(x => typeof x === 'number');
    const type = types[Math.floor(Math.random() * types.length)] as PowerUpType;
    
    this._powerUp = {
      ...coord,
      type,
      duration: 5000
    };
  }

  private _applyPowerUp = (powerUp: PowerUp) => {
    if (this._powerUpTimeout) {
      clearTimeout(this._powerUpTimeout);
    }

    switch (powerUp.type) {
      case PowerUpType.SPEED_UP:
        this._speed = 100;
        break;
      case PowerUpType.SPEED_DOWN:
        this._speed = 300;
        break;
      case PowerUpType.WALL_PASS:
        this._wallPass = true;
        break;
      case PowerUpType.REVERSE_CONTROL:
        this._reverseControl = true;
        break;
    }

    clearInterval(this._timer);
    this._timer = setInterval(this._update, this._speed);

    this._powerUpStartTime = Date.now();
    this._powerUpTimeout = setTimeout(() => {
      this._speed = 200;
      this._wallPass = false;
      this._reverseControl = false;
      this._powerUpStartTime = null;
      clearInterval(this._timer);
      this._timer = setInterval(this._update, this._speed);
    }, powerUp.duration);
  }

  private _update = () => {
    const gameOver = this.snake.update(this._apple, this._wallPass);

    if (gameOver) {
      clearInterval(this._timer);
      if (this._powerUpTimeout) {
        clearTimeout(this._powerUpTimeout);
      }
      // 游戏结束时保存最高分到localStorage
      localStorage.setItem('snake_high_score', this._highScore.toString());
      this.painter.drawGameOver();
      return;
    }

    if (this._apple.x === this.snake.head.x && this._apple.y === this.snake.head.y) {
      this._placeApple();
      if (Math.random() < 0.3 && !this._powerUp) {
        this._placePowerUp();
      }
    }

    if (this._powerUp && this._powerUp.x === this.snake.head.x && this._powerUp.y === this.snake.head.y) {
      this._applyPowerUp(this._powerUp);
      this._powerUp = null;
      this._powerUpCount++;
    }

    // 计算分数：(蛇的长度 - 初始长度2) * 10 + 特殊食物数 * 50
    this._score = (this.snake.segments.length - 2) * 10 + this._powerUpCount * 50;
    this._highScore = Math.max(this._score, this._highScore);
    
    // 计算FPS
    const now = Date.now();
    if (now - this._lastFpsUpdate > 1000) {
      this._fps = this._frameCount;
      this._frameCount = 0;
      this._lastFpsUpdate = now;
    } else {
      this._frameCount++;
    }
    this._lastFrameTime = now;

    this.painter.drawGrid();
    this.painter.drawApple(this._apple);
    if (this._powerUp) {
      this.painter.drawPowerUp(this._powerUp);
    }
    this.painter.drawSnake(this.snake, this.getPowerUpRemainingTime());
    this.painter.drawInfoPanel(this._score, this._highScore, this._fps);
  }

  resetGame() {
    clearInterval(this._timer);
    if (this._powerUpTimeout) {
      clearTimeout(this._powerUpTimeout);
    }
    
    const headCoord = { x: Math.floor(this.size / 2), y: Math.floor(this.size / 2) };
    this.snake = new Snake(this.size, [
      headCoord,
      { x: headCoord.x, y: headCoord.y + 1 }
    ], DirectionTypes.UP);
    
    this._score = 0;
    this._powerUpCount = 0;
    this._powerUp = null;
    this._wallPass = false;
    this._reverseControl = false;
    this._speed = 200;
    this._start = false;
    this._timer = null;
    this._powerUpTimeout = null;
    
    this._placeApple();
    // 初始化时不调用_update，避免提前计算分数
    this.painter.drawGrid();
    this.painter.drawApple(this._apple);
    this.painter.drawSnake(this.snake, 0);
    this.painter.drawInfoPanel(0, this._highScore);
  }

  private _handleKeydown = (event: KeyboardEvent) => {
    if (!this._start) {
      this._timer = setInterval(this._update, this._speed);
      this._start = true;
    }

    if (this._reverseControl) {
      switch (event.key) {
        case 'ArrowUp':
          this.snake.turnDownward();
          break;
        case 'ArrowDown':
          this.snake.turnUpward();
          break;
        case 'ArrowLeft':
          this.snake.turnRight();
          break;
        case 'ArrowRight':
          this.snake.turnLeft();
          break;
      }
    } else {
      switch (event.key) {
        case 'ArrowUp':
          this.snake.turnUpward();
          break;
        case 'ArrowDown':
          this.snake.turnDownward();
          break;
        case 'ArrowLeft':
          this.snake.turnLeft();
          break;
        case 'ArrowRight':
          this.snake.turnRight();
          break;
      }
    }
  }
}