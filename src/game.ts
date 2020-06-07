import Snake, { DirectionTypes } from "./snake";
import Map from "./map";
import Food from "./food";
let eatFood: boolean = false;
export default class Game {
	snake: Snake;
	map: Map;
	food: Food = { x: 0, y: 0 };
	private _timer: any;
	private _start = false;
	constructor() {
		this.map = new Map(15, 15);
		this.snake = new Snake(this.map.heigth, this.map.width, DirectionTypes.UP);
		this.map.createMap("map");
		this.createFood();
		this.map.displaySnake(this.snake);
		window.addEventListener("keydown", this._handleKeydown, false);
	}

	private move = () => {
		this.map.removeStyle(this.snake, this.food);
		this._eatFood();
		this.snake.move(eatFood);
		eatFood = false;
		this._gameover();
		this.map.displaySnake(this.snake);
	};

	private _handleKeydown = (event: KeyboardEvent) => {
		if (!this._start) {
			this._timer = setInterval(this.move, 200);
			this._start = true;
		}
		switch (event.keyCode) {
			case 37: //左
				this.snake.turnLeft();
				break;
			case 38: //上
				this.snake.turnUpward();
				break;
			case 39: //右
				this.snake.turnRight();
				break;
			case 40: //下
				this.snake.turnDownward();
				break;
		}
	};

	private _gameover() {
		let head = this.snake.body[0];
		let noHeadBody = this.snake.body.slice(1);
		if (
			head.x < 0 ||
			head.y < 0 ||
			head.x > this.map.heigth - 1 ||
			head.y > this.map.width - 1 ||
			JSON.stringify(noHeadBody).includes(JSON.stringify(head))
		) {
			clearInterval(this._timer);
			alert("game over");
			this.snake = new Snake(
				this.map.heigth,
				this.map.width,
				DirectionTypes.UP
			);
			this.map.removeFoodStyle(this.food);
			this.createFood();
			this._start = false;
		}
	}

	createFood(): Food {
		let x: number, y: number;
		while (true) {
			x = Math.floor(Math.random() * (this.map.heigth - 1));
			y = Math.floor(Math.random() * (this.map.width - 1));
			if (!this.snake.body.includes({ x: x, y: y })) {
				break;
			}
		}
		const food = new Food(x, y);
		this.food = food;
		this.map.displayFood(food);
		return food;
	}

	private _eatFood() {
		let head = this.snake.body[0];
		if (head.x === this.food.x && head.y === this.food.y) {
			this.map.removeFoodStyle(this.food);
			eatFood = true;
			this.createFood();
		}
	}
}

new Game();
