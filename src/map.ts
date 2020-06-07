import Snake from "./snake";
import Food from "./food";
let alltd: Array<any>[] = [];
export default class Map {
	heigth: number;
	width: number;
	constructor(heigth: number, width: number) {
		this.heigth = heigth;
		this.width = width;
	}

	createMap(divName: string) {
		const elt = document.getElementById(divName);
		for (let i = 0; i < this.heigth; i++) {
			let thistr = elt?.appendChild(document.createElement("tr"));
			let thistds = [];
			for (let j = 0; j < this.width; j++) {
				thistds[j] = thistr?.appendChild(document.createElement("td"));
			}
			alltd[i] = thistds;
		}
	}

	displaySnake(snake: Snake) {
		snake.body.forEach((value, index) => {
			const element = alltd[value.x][value.y];
			if (element) {
				index === 0
					? (element.style.background = "red")
					: (element.style.background = "black");
			}
		});
	}

	displayFood(food: Food) {
		const element = alltd[food.x][food.y];
		if (element) {
			element.style.background = "yellow";
		}
	}

	removeStyle(snake: Snake, food: Food) {
		alltd.forEach((value,i) => {
			value.forEach((v,j) => {
				if(food.x === i && food.y ===j){
				}else{
					v.style.background = "";
				}			
			});
		});
	}

	removeFoodStyle(food: Food) {
		const element = alltd[food.x][food.y];
		if (element) {
			element.style.background = "";
		}
	}
}
