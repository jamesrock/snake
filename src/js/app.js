import '../css/app.css';
import { 
	isValidKey,
	formatNumber,
	makeArray,
	random,
	pluckFirst,
	Rounder,
	Scaler
} from '@jamesrock/rockjs';

class Food {
	constructor(x, y) {

		this.x = x;
		this.y = y;

	};
	color = 'grey';
};

class Segment {
	constructor(x, y) {

		this.x = x;
		this.y = y;

	};
	color = 'black'
};

class Snake {
	constructor() {

		this.node = document.createElement('div');
		this.scoreNode = document.createElement('div');
		this.gameOverNode = document.createElement('div');
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');

		this.node.classList.add('snake');
		this.scoreNode.classList.add('score');

		this.gameOverNode.classList.add('game-over');

		this.canvas.width = scaler.inflate(this.width);
		this.canvas.height = scaler.inflate(this.height);

		this.canvas.style.width = `${this.width}px`;

		this.node.appendChild(this.scoreNode);
		this.node.appendChild(this.canvas);
		this.node.appendChild(this.gameOverNode);

		this.updateScore();

		this.reset();

		this.gameOverNode.addEventListener('click', () => {
			this.reset();
		});

	};
	draw() {

		this.canvas.width = scaler.inflate(this.width);

		this.segments.forEach((seg) => {
			this.ctx.fillStyle = seg.color;
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

		}, (300 + adjustment) - this.eaten);

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

		if((x === -1) || (y === -1) || (x === this.deflate(this.width)) || (y === this.deflate(this.height))) {
			collision = true;
		};

		return collision;

	};
	checkFood(x, y) {

		const food = this.foods.find((food) => food.x === x && food.y === y);

		if(food) {
			
			this.eaten ++;
			this.segments.push(new Segment(x, y));
			this.foods.splice(this.foods.indexOf(food), 1);
			this.updateScore();
			this.makeFood(1);

		};

	};
	makeFood(count = 32) {

		makeArray(count).forEach(() => {
			const {
				x, y
			} = this.getRandomXAndY();
			this.foods.push(new Food(x, y));
		});
		return this;

	};
	move(x, y) {
		
		const seg = this.segments.shift();

		seg.x = x;
		seg.y = y;
		this.segments.push(seg);

		this.checkFood(x, y);

		if(this.checkCollision(x, y)) {
			this.gameOverNode.innerHTML = `<h2>GAME OVER</h2><p>Score: ${formatNumber(this.eaten)}</p><p>Tap to continue</p>`;
			this.setGameOver(true);
		};

	};
	turn(direction) {

		if(!direction || direction === this.directions[this.directions.length-1] || direction === opposites[this.direction]) {
			return;
		};

		this.directions.push(direction);

		return this;

	};
	updateScore() {

		this.scoreNode.innerHTML = `score: ${formatNumber(this.eaten)}`;
		return this;

	};
	renderTo(to) {

		to.appendChild(this.node);
		return this;

	};
	reset() {

		this.eaten = 0;
		this.directions = [directions.right];
		this.foods = [];
		this.segments = makeArray(10, (a, i) => new Segment(i, 0));
		this.setGameOver(false);
		this.makeFood();
		this.update();
		this.updateScore();
		return this;

	};
	inflate(a) {
		
		return (a * this.size);

	};
	deflate(a) {
		
		return (a / scaler.deflate(this.size));

	};
	getRandomXAndY() {

		let 
		width = this.deflate(this.width)-2,
		height = this.deflate(this.height)-2,
		x = random(1, width),
		y = random(1, height),
		query = `${x}${y}`;

		while(this.checkForSegment(query)||this.checkForFood(query)) {
			console.log('clash');
			x = random(1, width);
			y = random(1, height);
			query = `${x}${y}`;
		};

		return {
			x,
			y
		};

	};
	setGameOver(a) {

		this.gameOver = a;
		this.gameOverNode.dataset.active = a;
		return this;

	};
	checkForSegment(toCheck) {

		return this.segments.map((segment) => (`${segment.x}${segment.y}`)).includes(toCheck);

	};
	checkForFood(toCheck) {

		return this.foods.map((food) => (`${food.x}${food.y}`)).includes(toCheck);

	};
	width = 350;
	height = 450;
	size = scaler.inflate(10);
	eaten = 0;
	directions = [directions.right];
	segments = [];
	foods = [];
	gameOver = false;
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
adjustment = 0,
rounder = new Rounder(60),
scaler = new Scaler(2),
directionsArray = Object.keys(directionsKeyMap),
snake = window.snake = new Snake();

let 
touchX = 0,
touchY = 0;

snake.renderTo(body);

document.addEventListener('keydown', (e) => {
		
	if(isValidKey(e.key, directionsArray)) {
		snake.turn(directionsKeyMap[e.key]);
	};

	if(snake.gameOver && isValidKey(e.key, [' '])) {
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
