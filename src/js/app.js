import '../css/app.css';
import { 
	Rounder,
	Scaler,
	GameBase,
	isValidKey,
	makeArray,
	random,
	getRandom,
	pluckFirst,
	pluckRandom,
	limit
} from '@jamesrock/rockjs';

const scaler = new Scaler(2);
const getMaxSize = () => {
	
	const constraint = 800;
	const h = Math.floor(limit(window.innerHeight, constraint) / 59);
	const w = Math.floor(limit(window.innerWidth, constraint) / 39);

	if(w>h) {
		return h;
	};

	return w;

};

// console.log(getMaxSize());

class Food {
	constructor(x, y, color = 'grey') {

		this.x = x;
		this.y = y;
		this.color = color;

	};
};

class Segment {
	constructor(x, y, color = 'black') {

		this.x = x;
		this.y = y;
		this.color = color;

	};
};

class Snake extends GameBase {
	constructor() {

		super('snake');

		this.canvas.width = this.inflate(this.width);
		this.canvas.height = this.inflate(this.height);
		this.canvas.style.width = `${scaler.deflate(this.canvas.width)}px`;
		
		this.node.style.borderWidth = `${scaler.deflate(this.size)}px`;
		this.node.appendChild(this.canvas);
		this.node.appendChild(this.gameOverNode);

		this.reset();

		this.gameOverNode.addEventListener('click', () => {
			this.reset();
		});

	};
	draw() {

		this.canvas.width = this.inflate(this.width);

		this.segments.forEach((seg) => {
			this.ctx.fillStyle = this.color;
			this.ctx.fillRect(this.inflate(seg.x), this.inflate(seg.y), this.size, this.size);
		});
		
		this.foods.forEach((food) => {
			this.ctx.fillStyle = food.color;
			this.ctx.fillRect(this.inflate(food.x), this.inflate(food.y), this.size, this.size);
		});

	};
	update() {

		var 
		seg = this.segments[this.segments.length-1],
		x = seg.x,
		y = seg.y,
		direction = this.direction = this.getDirection();

		switch(direction) {
			case directions.right:
				x ++;
			break;
			case directions.left:
				x --;
			break;
			case directions.down:
				y ++;
			break;
			case directions.up:
				y --;
			break;
		};

		this.move(x, y);
		this.draw();
		
		clearTimeout(this.timer);

		if(this.gameOver) {
			return;
		};

		this.timer = setTimeout(() => {
			
			if(this.directions.length===0) {
				// nothing queued, continue heading in the same direction
				this.directions.push(direction);
			};

			this.update();

		}, (250 - this.score));

	};
	getDirection() {

		return pluckFirst(this.directions);
		
	};
	checkCollision(x, y) {

		let collision = false;

		for(var i = 1; i < this.segments.length-2; i++) {
			const {x: sX, y: sY} = this.segments[i];
			if(sX === x && sY === y) {
				collision = true;
			};
		};

		if((x === -1) || (y === -1) || (x === this.width) || (y === this.height)) {
			collision = true;
		};

		return collision;

	};
	checkFood(x, y) {

		const food = this.foods.find((food) => food.x === x && food.y === y);

		if(food) {
			
			this.segments.push(new Segment(x, y));
			this.foods.splice(this.foods.indexOf(food), 1);
			this.color = food.color;

			if(food.color===this.poison) {
				return true;
			};

			this.score ++;
			this.makeFood(1);

		};

		return false;

	};
	makeFood(count = 50) {

		makeArray(count).forEach(() => {
			
			const numberOfPoison = this.foods.filter((food) => food.color === this.poison).length;
			const {x, y} = this.getRandomXAndY();
			
			this.foods.push(new Food(x, y, getRandom(numberOfPoison < 25 ? [this.poison, ...this.colors] : this.colors)));

		});
		return this;

	};
	move(x, y) {
		
		const seg = this.segments.shift();

		seg.x = x;
		seg.y = y;
		this.segments.push(seg);

		if(this.checkCollision(x, y) || this.checkFood(x, y)) {
			this.showGameOverScreen(true);
		};

		return this;

	};
	turn(direction) {

		if(!direction || direction === this.directions[this.directions.length-1] || direction === opposites[this.direction]) {
			return;
		};

		this.directions.push(direction);

		return this;

	};
	renderTo(to) {

		to.appendChild(this.node);
		return this;

	};
	reset() {

		this.score = 0;
		this.directions = [directions.right];
		this.foods = [];
		this.segments = makeArray(10, (a, i) => new Segment(i, 0));
		this.colors = [
			'gold', // yellow
			'rgb(237, 0, 73)', // red
			'magenta',
			'limegreen',
			'rgb(177, 49, 237)', // purple
			'rgb(0,100,200)', // blue
			'rgb(255,125,0)', // orange
		];
		this.color = 'black';
		this.poison = pluckRandom(this.colors);
		this.gameOver = false;
		this.makeFood();
		this.draw();

		this.gameOverNode.dataset.active = false;
		
		this.node.style.setProperty('--poison', this.poison);
		this.node.dataset.preview = true;

		setTimeout(() => {
			this.node.dataset.preview = false;
			this.update();
		}, 2000);

		return this;

	};
	inflate(a) {
		
		return (a * this.size);

	};
	getRandomXAndY() {

		let 
		width = this.width-2,
		height = this.height-2,
		x = random(1, width),
		y = random(1, height);

		while([
			`${x}${y}`,
			`${x}${y+1}`,
			`${x}${y-1}`,
			`${x-1}${y}`, 
			`${x-1}${y+1}`, 
			`${x-1}${y-1}`, 
			`${x+1}${y}`, 
			`${x+1}${y+1}`, 
			`${x+1}${y-1}`,
		].map((q) => this.query(q)).includes(true)) {
			console.log('clash');
			x = random(1, width);
			y = random(1, height);
		};

		return {
			x,
			y
		};

	};
	checkForSegment(toCheck) {

		return this.segments.map((segment) => (`${segment.x}${segment.y}`)).includes(toCheck);

	};
	checkForFood(toCheck) {

		return this.foods.map((food) => (`${food.x}${food.y}`)).includes(toCheck);

	};
	query(q) {
		
		return this.checkForSegment(q)||this.checkForFood(q);

	};
	width = 35;
	height = 55;
	size = scaler.inflate(getMaxSize());
};

const 
body = document.body,
directions = {
	left: 'left',
	up: 'up',
	right: 'right',
	down: 'down'
},
directionsKeyMap = {
	ArrowLeft: 'left',
	ArrowUp: 'up',
	ArrowRight: 'right',
	ArrowDown: 'down'
},
opposites = {
	left: 'right',
	right: 'left',
	up: 'down',
	down: 'up'
},
directionsArray = Object.keys(directionsKeyMap),
rounder = new Rounder(60),
snake = window.snake = new Snake();

let 
touchX = 0,
touchY = 0;

snake.renderTo(body);

document.addEventListener('keydown', (e) => {
		
	if(isValidKey(e.code, directionsArray)) {
		snake.turn(directionsKeyMap[e.key]);
	};

	if(snake.gameOver && isValidKey(e.code, ['Space'])) {
		snake.reset();
	};

});

document.addEventListener('touchstart', (e) => {

	touchX = e.touches[0].clientX;
	touchY = e.touches[0].clientY;

});

document.addEventListener('touchmove', (e) => {

	const { clientX, clientY } = e.touches[0];
	const touchXDiff = rounder.round(clientX - touchX);
	const touchYDiff = rounder.round(clientY - touchY);
	let direction;

	if((touchXDiff > 0)) {
		direction = directions.right;
	}
	else if((touchXDiff < 0)) {
		direction = directions.left;
	}
	else if((touchYDiff > 0)) {
		direction = directions.down;
	}
	else if((touchYDiff < 0)) {
		direction = directions.up;
	};

	snake.turn(direction);

});
