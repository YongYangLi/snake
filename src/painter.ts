import { Coord, PowerUp, PowerUpType } from './game';
import Snake, { DirectionTypes } from './snake';

const GRID_SIZE = 25;

export default class Painter {

  size: number;
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor(container: HTMLElement, size: number) {
    this.container = container;
    this.size = size;
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;

    // 增加画布宽度以容纳信息面板
    this.canvas.style.width = (this.size * GRID_SIZE + 200) + 'px';
    this.canvas.style.height = this.size * GRID_SIZE + 'px';
    this.canvas.width = this.size * GRID_SIZE + 200;
    this.canvas.height = this.size * GRID_SIZE;

    this.container.appendChild(this.canvas);
    
    // 绑定game实例
    (this as any).game = null;
  }
  
  setGame(game: any) {
    (this as any).game = game;
  }

  drawGrid() {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const color = (x + y) % 2 === 0 ? 'rgb(171, 213, 90)' : 'rgb(163, 207, 83)';
        this.context.fillStyle = color;
        this.context.beginPath();
        this.context.rect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        this.context.closePath();
        this.context.fill();
      }
    }
  }

  drawApple(apple: Coord) {
    const [x, y] = this._convertCoord(apple);
    this.context.save();
    this.context.shadowColor = 'rgba(50, 50, 50, .2)';
    this.context.shadowBlur = 10;
    this.context.beginPath();
    this.context.arc(x, y, 8, 0, Math.PI * 2);
    this.context.fillStyle = '#f5222d';
    this.context.fill();
    this.context.restore();
  }

  drawSnake(snake: Snake, powerUpRemainingTime: number = 0) {
    const { segments, head, direction } = snake;

    // draw body
    const bodyPath = new Path2D();
    segments.forEach((coord, index) => {
      const [x, y] = this._convertCoord(coord);
      if (index === 0) {
        bodyPath.moveTo(x, y);
      } else {
        bodyPath.lineTo(x, y);
      }
    });

    this.context.save();
    this.context.shadowColor = 'rgba(50, 50, 50, .2)';
    this.context.shadowBlur = 10;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
    this.context.lineWidth = GRID_SIZE * 0.8;

    if (powerUpRemainingTime > 0) {
      // 计算闪烁效果
      const blinkRate = 500; // 闪烁周期（毫秒）
      const blinkPhase = (Date.now() % blinkRate) / blinkRate;
      const blinkIntensity = Math.sin(blinkPhase * Math.PI * 2) * 0.5 + 0.5;

      // 计算渐变效果
      const progress = powerUpRemainingTime / 5000;
      const baseOpacity = 0.3 + (progress * 0.7); // 基础不透明度从0.3到1.0

      // 合并闪烁和渐变效果
      const finalOpacity = baseOpacity * (0.7 + blinkIntensity * 0.3);

      // 应用特效颜色
      this.context.strokeStyle = `rgba(64, 169, 255, ${finalOpacity})`;
    } else {
      this.context.strokeStyle = '#40a9ff';
    }

    this.context.stroke(bodyPath);
    this.context.restore();

    // draw eyes
    const [x, y] = this._convertCoord(head);
    const socketOffset = { x: 0, y: 0 };
    const eyeOffset = { x: 0 ,y: 0 };
    switch (direction) {
      case DirectionTypes.UP:
        socketOffset.x = 7;
        eyeOffset.y = -2;
        break;
      case DirectionTypes.DOWN:
        socketOffset.x = 7;
        eyeOffset.y = 2;
        break;
      case DirectionTypes.LEFT:
        socketOffset.y = 7;
        eyeOffset.x = -2;
        break;
      case DirectionTypes.RIGHT:
        socketOffset.y = 7;
        eyeOffset.x = 2;
        break;
    }

    this.context.save();
    this.context.beginPath();
    this.context.arc(x - socketOffset.x, y - socketOffset.y, 5, 0, Math.PI * 2);
    this.context.closePath();
    this.context.arc(x + socketOffset.x, y + socketOffset.y, 5, 0, Math.PI * 2);
    this.context.closePath();
    this.context.lineWidth = 4;
    this.context.strokeStyle = '#40a9ff';
    this.context.fillStyle = '#fff';
    this.context.stroke();
    this.context.fill();

    this.context.beginPath();
    this.context.arc(x - socketOffset.x + eyeOffset.x, y - socketOffset.y + eyeOffset.y, 3, 0, Math.PI * 2);
    this.context.closePath();
    this.context.arc(x + socketOffset.x + eyeOffset.x, y + socketOffset.y + eyeOffset.y, 3, 0, Math.PI * 2);
    this.context.closePath();
    this.context.fillStyle = '#000';
    this.context.fill();
    this.context.restore();

  }

  drawPowerUp(powerUp: PowerUp) {
    const [x, y] = this._convertCoord(powerUp);
    this.context.save();
    this.context.shadowColor = 'rgba(50, 50, 50, .2)';
    this.context.shadowBlur = 10;
    this.context.beginPath();
    this.context.arc(x, y, 8, 0, Math.PI * 2);

    switch (powerUp.type) {
      case PowerUpType.SPEED_UP:
        this.context.fillStyle = '#52c41a'; // 绿色表示加速
        break;
      case PowerUpType.SPEED_DOWN:
        this.context.fillStyle = '#722ed1'; // 紫色表示减速
        break;
      case PowerUpType.WALL_PASS:
        this.context.fillStyle = '#faad14'; // 黄色表示穿墙
        break;
      case PowerUpType.REVERSE_CONTROL:
        this.context.fillStyle = '#eb2f96'; // 粉色表示反向控制
        break;
    }

    this.context.fill();

    // 添加星形效果
    this.context.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5;
      const radius = i === 0 ? 8 : 4;
      const px = x + radius * Math.cos(angle);
      const py = y + radius * Math.sin(angle);
      if (i === 0) {
        this.context.moveTo(px, py);
      } else {
        this.context.lineTo(px, py);
      }
    }
    this.context.closePath();
    this.context.strokeStyle = '#fff';
    this.context.lineWidth = 2;
    this.context.stroke();
    this.context.restore();
  }

  drawGameOver() {
    this.context.font = 'bold 36px YaHei';
    this.context.fillStyle = 'red';
    const size = this.context.measureText('GAME OVER');
    this.context.fillText(
      'GAME OVER',
      (this.size * GRID_SIZE - size.width) / 2,
      (this.canvas.height - 48) / 2 - 40,
    );

    // 绘制重新开始按钮
    const buttonWidth = 180;
    const buttonHeight = 50;
    const buttonX = (this.size * GRID_SIZE - buttonWidth) / 2;
    const buttonY = (this.size * GRID_SIZE - buttonHeight) / 2 + 40;

    // 按钮背景（带圆角和渐变效果）
    this.context.save();
    this.context.shadowColor = 'rgba(0, 0, 0, 0.2)';
    this.context.shadowBlur = 10;
    this.context.shadowOffsetY = 4;
    
    const gradient = this.context.createLinearGradient(
      buttonX, buttonY, 
      buttonX, buttonY + buttonHeight
    );
    gradient.addColorStop(0, '#40a9ff');
    gradient.addColorStop(1, '#1890ff');
    
    this.context.fillStyle = gradient;
    this.context.beginPath();
    this.context.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 12);
    this.context.fill();
    this.context.restore();

    // 按钮文字
    this.context.save();
    this.context.font = 'bold 20px YaHei';
    this.context.fillStyle = 'white';
    this.context.shadowColor = 'rgba(0, 0, 0, 0.3)';
    this.context.shadowBlur = 2;
    const text = '重新开始';
    const textSize = this.context.measureText(text);
    this.context.fillText(
      text,
      buttonX + (buttonWidth - textSize.width) / 2,
      buttonY + buttonHeight / 2 + 8
    );
    this.context.restore();

    // 添加点击事件
    this.canvas.addEventListener('click', this._handleRestartClick);
  }

  private _handleRestartClick = (e: MouseEvent) => {
    console.log('点击事件触发，坐标:', e.clientX, e.clientY);
    const buttonWidth = 180;
    const buttonHeight = 50;
    const buttonX = (this.size * GRID_SIZE - buttonWidth) / 2;
    const buttonY = (this.size * GRID_SIZE - buttonHeight) / 2 + 40;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
      console.log('点击在重新开始按钮区域内');
      this.canvas.removeEventListener('click', this._handleRestartClick);
      const game = (this as any).game;
      if (game && typeof game.resetGame === 'function') {
        console.log('调用game.resetGame()');
        game.resetGame();
      } else {
        console.warn('game实例不存在或resetGame方法不可用');
      }
    } else {
      console.log('点击在按钮区域外');
    }
  }

  drawInfoPanel(score: number, highScore: number, fps?: number) {
    const panelX = this.size * GRID_SIZE + 10;
    const panelWidth = 180;
    const padding = 15;
    
    // 绘制FPS计数器
    this.context.save();
    this.context.font = '12px "Microsoft YaHei"';
    this.context.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.context.textAlign = 'right';
    this.context.fillText(
      `FPS: ${fps !== undefined ? fps : Math.round((this as any).game?.fps || 0)}`,
      this.size * GRID_SIZE - 10,
      20
    );
    this.context.restore();

    // 绘制磨砂玻璃效果背景
    this.context.save();
    this.context.fillStyle = 'rgba(255, 255, 255, 0.95)';
    this.context.shadowColor = '#434343';
    this.context.shadowBlur = 20;
    this.context.shadowOffsetX = -2;
    this.context.beginPath();
    this.context.roundRect(panelX, 0, panelWidth, this.canvas.height, 16);
    this.context.fill();

    // 添加内部光晕效果
    this.context.fillStyle = 'rgba(255, 255, 255, 0.08)';
    this.context.shadowColor = 'rgba(255, 255, 255, 0.15)';
    this.context.shadowBlur = 12;
    this.context.shadowOffsetX = 1;
    this.context.shadowOffsetY = 1;
    this.context.roundRect(panelX + 2, 2, panelWidth - 4, this.canvas.height - 4, 14);
    this.context.fill();
    this.context.restore();

    // 绘制分数区域
    this.context.save();
    const scoreY = 30;
    // 分数区域卡片背景
    const scoreCardGradient = this.context.createLinearGradient(
      panelX + padding - 10,
      scoreY - 15,
      panelX + padding - 10,
      scoreY + 75
    );
    scoreCardGradient.addColorStop(0, 'rgba(64, 169, 255, 0.12)');
    scoreCardGradient.addColorStop(1, 'rgba(64, 169, 255, 0.05)');
    
    this.context.fillStyle = scoreCardGradient;
    this.context.shadowColor = 'rgba(0, 0, 0, 0.08)';
    this.context.shadowBlur = 8;
    this.context.shadowOffsetY = 2;
    this.context.beginPath();
    this.context.roundRect(panelX + padding - 10, scoreY - 15, panelWidth - padding * 2 + 10, 90, 12);
    this.context.fill();

    // 当前得分标签
    this.context.font = '16px "Microsoft YaHei"';
    this.context.fillStyle = '#333';
    this.context.fillText('当前得分', panelX + padding, scoreY + 10);

    // 分数显示
    this.context.font = 'bold 32px "Microsoft YaHei"';
    const scoreGradient = this.context.createLinearGradient(
      panelX + padding,
      scoreY + 45 - 32,
      panelX + padding + 80,
      scoreY + 45
    );
    scoreGradient.addColorStop(0, '#40a9ff');
    scoreGradient.addColorStop(1, '#1890ff');
    this.context.fillStyle = scoreGradient;
    this.context.fillText(score.toString(), panelX + padding, scoreY + 45);

    // 最高分
    this.context.font = '14px "Microsoft YaHei"';
    this.context.fillStyle = '#666';
    this.context.fillText('最高分: ' + highScore, panelX + padding, scoreY + 65);
    this.context.restore();

    // 绘制规则标题
    this.context.save();
    this.context.font = 'bold 26px "Microsoft YaHei"';
    this.context.fillStyle = '#111';
    this.context.fillText('游戏规则', panelX + padding, 150);
    this.context.restore();

    // 绘制规则说明
    let y = 190;
    const lineHeight = 34;
    this.context.font = '14px "Microsoft YaHei"';

    // 食物图标和说明
    const items = [
      { color: '#f5222d', text: '普通食物：增加长度', type: 'circle' },
      { color: '#52c41a', text: '加速', type: 'star' },
      { color: '#722ed1', text: '减速', type: 'star' },
      { color: '#faad14', text: '穿墙', type: 'star' },
      { color: '#eb2f96', text: '反向控制', type: 'star' }
    ];

    items.forEach((item, index) => {
      this.context.save();
      // 绘制图标背景
      const iconGradient = this.context.createRadialGradient(
        panelX + padding,
        y + 6,
        0,
        panelX + padding,
        y + 6,
        8
      );
      iconGradient.addColorStop(0, item.color);
      iconGradient.addColorStop(1, this._adjustColor(item.color, -20));
      
      this.context.fillStyle = iconGradient;
      this.context.shadowColor = 'rgba(0, 0, 0, 0.2)';
      this.context.shadowBlur = 8;
      this.context.beginPath();
      this.context.arc(panelX + padding, y + 6, 8, 0, Math.PI * 2);
      this.context.fill();

      if (item.type === 'star') {
        // 绘制星形
        this.context.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        this.context.lineWidth = 2;
        this.drawStar(panelX + padding, y + 6, 6);
      }

      // 绘制文本
      this.context.shadowBlur = 0;
      this.context.fillStyle = '#444';
      this.context.fillText(item.text, panelX + padding + 24, y + 10);
      this.context.restore();
      y += lineHeight;
    });

    // 操作说明
    y += 8;
    this.context.save();
    this.context.fillStyle = '#444';
    this.context.font = 'bold 15px "Microsoft YaHei"';
    this.context.fillText('操作说明', panelX + padding, y);
    this.context.font = '14px "Microsoft YaHei"';
    this.context.fillText('使用方向键控制蛇的移动', panelX + padding, y + lineHeight - 8);
    this.context.restore();
  }

  private drawStar(x: number, y: number, radius: number) {
    this.context.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5;
      const r = i === 0 ? radius : radius / 2;
      const px = x + r * Math.cos(angle);
      const py = y + r * Math.sin(angle);
      if (i === 0) {
        this.context.moveTo(px, py);
      } else {
        this.context.lineTo(px, py);
      }
    }
    this.context.closePath();
    this.context.fill();
    this.context.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    this.context.lineWidth = 1.5;
    this.context.stroke();
  }

  private _adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  private _convertCoord = (coord: Coord) => {
    return [coord.x * GRID_SIZE + GRID_SIZE / 2, coord.y * GRID_SIZE + GRID_SIZE / 2];
  }
}