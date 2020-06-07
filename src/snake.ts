export enum DirectionTypes {
	UP,
	DOWN,
	LEFT,
	RIGHT,
}
export default class Snake {
	body: { x: number; y: number }[];
	direction: DirectionTypes;
	constructor(heigth: number, width: number, direction: DirectionTypes) {
		this.body = [];
		this.body.push({ x: Math.floor(heigth / 2), y: Math.floor(width / 2) });
		this.body.push({ x: Math.floor(heigth / 2) + 1, y: Math.floor(width / 2) });
		this.body.push({ x: Math.floor(heigth / 2) + 2, y: Math.floor(width / 2) });
		this.direction = direction;
	}
	turnUpward() {
		if ([DirectionTypes.UP, DirectionTypes.DOWN].includes(this.direction))
			return;
		this.direction = DirectionTypes.UP;
	}

	turnDownward() {
		if ([DirectionTypes.UP, DirectionTypes.DOWN].includes(this.direction))
			return;
		this.direction = DirectionTypes.DOWN;
	}

	turnLeft() {
		if ([DirectionTypes.LEFT, DirectionTypes.RIGHT].includes(this.direction))
			return;
		this.direction = DirectionTypes.LEFT;
	}

	turnRight() {
		if ([DirectionTypes.LEFT, DirectionTypes.RIGHT].includes(this.direction))
			return;
		this.direction = DirectionTypes.RIGHT;
	}

	move(eatFood: boolean) {
		if(!eatFood){
			this.body.pop();
		}	
		let { x, y } = this.body[0];

		switch (this.direction) {
			case DirectionTypes.UP:
				x -= 1;
				break;
			case DirectionTypes.DOWN:
				x += 1;
				break;
			case DirectionTypes.LEFT:
				y -= 1;
				break;
			case DirectionTypes.RIGHT:
				y += 1;
				break;
		}
		this.body.unshift({ x: x, y: y });
	}
}
