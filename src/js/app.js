import '../css/app.css';
import { 
	isValidKey,
	makeArray,
	random,
	getRandom,
	pluckFirst,
	pluckRandom,
	Rounder,
	Scaler,
	Storage
} from '@jamesrock/rockjs';

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

class Snake {
	constructor() {

		this.node = document.createElement('div');
		this.gameOverNode = document.createElement('div');
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');

		this.node.classList.add('snake');

		this.gameOverNode.classList.add('game-over');

		this.canvas.width = scaler.inflate(this.width);
		this.canvas.height = scaler.inflate(this.height);

		this.canvas.style.width = `${this.width}px`;

		this.node.appendChild(this.canvas);
		this.node.appendChild(this.gameOverNode);

		this.reset();

		this.gameOverNode.addEventListener('click', () => {
			this.reset();
		});

	};
	draw() {

		this.canvas.width = scaler.inflate(this.width);

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

		}, (250 + adjustment) - this.eaten);

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
			
			this.segments.push(new Segment(x, y));
			this.foods.splice(this.foods.indexOf(food), 1);
			this.color = food.color;

			if(food.color===this.poison) {
				return true;
			};

			this.eaten ++;
			this.makeFood(1);

		};

		return false;

	};
	makeFood(count = 50) {

		makeArray(count).forEach(() => {
			
			const numberOfPoison = this.foods.filter((food) => food.color === this.poison).length;
			const {x, y} = this.getRandomXAndY();

			console.log(numberOfPoison);
			
			this.foods.push(new Food(x, y, getRandom(numberOfPoison<25 ? [this.poison, ...this.colors] : this.colors)));

		});
		return this;

	};
	move(x, y) {
		
		const seg = this.segments.shift();

		seg.x = x;
		seg.y = y;
		this.segments.push(seg);

		if(this.checkCollision(x, y) || this.checkFood(x, y)) {
			this.setGameOver(true);
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

		this.eaten = 0;
		this.directions = [directions.right];
		this.foods = [];
		this.color = 'black';
		this.segments = makeArray(10, (a, i) => new Segment(i, 0));
		this.poison = pluckRandom(this.colors);
		this.setGameOver(false);
		this.makeFood();
		this.draw();
		
		this.node.style.setProperty('--poison', this.poison);
		this.node.dataset.preview = 'true';

		setTimeout(() => {
			this.node.dataset.preview = 'false';
			this.update();
		}, 2000);

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
	setGameOver(a) {

		if(a) {
			const best = storage.get('best') || 0;
			storage.set('best', this.eaten > best ? this.eaten : best);
			this.gameOverNode.innerHTML = `\
				<h2>GAME OVER!</h2>\
				<p class="score">${this.eaten}</p>\
				<p class="continue">Tap to continue.</p>\
				<p class="best">Best: ${storage.get('best')}</p>`;
		};

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
	query(q) {
		
		return this.checkForSegment(q)||this.checkForFood(q);

	};
	colors = [
		'gold',
		'rgb(237, 0, 73)',
		'limegreen',
		'rgb(177, 49, 237)',
		'rgb(0,100,200)',
		'rgb(255,125,0)',
	];
	color = 'black';
	width = 350;
	height = 550;
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
storage = new Storage('me.jamesrock.snake'),
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
