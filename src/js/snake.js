import { 
	isValidKey,
	formatNumber,
	makeArray,
	random
} from '@jamesrock/rockjs';

const scale = (a) => {
	return (a * 2);
};

const unscale = (a) => {
	return (a / 2);
};

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

		this.canvas.width = scale(this.width);
		this.canvas.height = scale(this.height);

		this.canvas.style.width = `${this.width}px`;

		this.node.appendChild(this.scoreNode);
		this.node.appendChild(this.canvas);
		this.node.appendChild(this.gameOverNode);

		this.updateScore();

		const _this = this;

		this.gameOverNode.addEventListener('click', function() {
			_this.start();
		});

	};
	start() {

		this.reset();

		this.segments = makeArray(10, (a, i) => new Segment(i, 0));

		this.createFood();

		this.draw();

	};
	draw() {

		this.canvas.width = scale(this.width);

		this.segments.forEach((seg) => {
			this.ctx.fillStyle = seg.color;
			this.ctx.fillRect(this.inflate(seg.x), this.inflate(seg.y), this.size, this.size);
		});
		
		this.foods.forEach((food) => {
			this.ctx.fillStyle = food.color;
			this.ctx.fillRect(this.inflate(food.x), this.inflate(food.y), this.size, this.size);
		});

		setTimeout(() => {
			this.update();
		}, 500 - (10 * this.eaten));

	};
	update() {

		var 
		seg = this.segments[this.segments.length-1],
		x = seg.x,
		y = seg.y;

		switch(this.direction) {
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

		if(this.checkCollision(x, y)) {
			this.gameOverNode.innerHTML = `<div>GAME OVER</div><div>Score: ${formatNumber(snake.eaten)}</div><div>Tap to continue</div>`;
			this.setGameOverScreen('true');
			return;
		};

		this.checkFood(x, y);

	};
	checkCollision(x, y) {

		var 
		collision = false,
		snake = this,
		seg;

		for(var i = 1; i < snake.segments.length; i++) {
			seg = snake.segments[i];
			if(seg.x === x && seg.y === y) {
				collision = true;
			};
		};

		if((x === -1) || (y === -1) || (x === this.deflate(this.width)) || (y === this.deflate(this.height))) {
			collision = true;
		};

		return collision;

	};
	checkFood(x, y) {

		this.foods.forEach((food, i) => {

			if(food.x === x && food.y === y) {
				
				this.eaten ++;
				this.segments.push(new Segment(food.x, food.y));

				this.foods.splice(i, 1);
				this.updateScore();

				return 'break';
				
			};

		});

		if(this.foods.length === 0) {
			
			this.createFood();

		};
		
		this.move(x, y);

	};
	createFood() {

		const {
			x, y
		} = this.getRandomXAndY();

		console.log('createFood', x, y);

		this.foods.push(new Food(x, y));
		return this;

	};
	move(x, y) {
		
		var 
		snake = this,
		seg = snake.segments.shift();

		seg.x = x;
		seg.y = y;
		snake.segments.push(seg);

		snake.draw();

	};
	turn(direction) {

		if(!direction) {
			return;
		};

		if((this.direction != opposites[direction])) {
			this.direction = direction;
		};

		return this;

	};
	updateScore() {

		this.scoreNode.innerHTML = `score: ${this.eaten}`;
		return this;

	};
	renderTo(to) {

		to.appendChild(this.node);
		return this;

	};
	reset() {
		
		this.eaten = 0;
		this.direction = directions.right;
		this.segments = [];
		this.foods = [];
		this.setGameOverScreen('false');
		this.updateScore();
		return this;

	};
	inflate(a) {
		
		return (a * this.size);

	};
	deflate(a) {
		
		return (a / unscale(this.size));

	};
	getRandomXAndY() {

		let 
		width = this.deflate(this.width)-1,
		height = this.deflate(this.height)-1,
		x = random(0, width),
		y = random(0, height);

		while(this.checkForSegment(`${x}${y}`)) {
			x = random(0, width);
			y = random(0, height);
		};

		return {
			x,
			y
		};

	};
	setGameOverScreen(visible) {

		this.gameOverNode.setAttribute('data-active', visible);
		return this;

	};
	checkForSegment(toCheck) {

		return this.segments.map((segment) => (`${segment.x}${segment.y}`)).some((value) => (toCheck===value));

	};
	width = 350;
	height = 450;
	size = scale(10);
	eaten = 0;
	direction = directions.right;
	segments = [];
	foods = [];
};

var 
body = document.body,
swipeThreshold = 30,
swipeThresholdInverse = (swipeThreshold*-1),
touchX,
touchY,
directions = {
	'left': 'left',
	'up': 'up',
	'right': 'right',
	'down': 'down'
},
directionsKeyMap = {
	'ArrowLeft': 'left',
	'ArrowUp': 'up',
	'ArrowRight': 'right',
	'ArrowDown': 'down'
},
opposites = {
	'left': 'right',
	'right': 'left',
	'up': 'down',
	'down': 'up'
},
directionsArray = Object.keys(directionsKeyMap),
snake = new Snake();

snake.renderTo(body);

document.addEventListener('keydown', function(e) {
		
	if(isValidKey(e.key, directionsArray)) {
		return snake.turn(directionsKeyMap[e.key]);
	};

});

document.addEventListener('touchstart', function(e) {

	var
	firstTouch = e.touches[0];

	touchX = firstTouch.clientX;
	touchY = firstTouch.clientY;

});

document.addEventListener('touchmove', function(e) {

	var
	firstTouch = e.touches[0],
	touchXDiff = (firstTouch.clientX - touchX),
	touchYDiff = (firstTouch.clientY - touchY),
	direction;

	if((touchXDiff >= swipeThreshold)) {
		direction = directions.right;
	}
	else if((touchXDiff <= swipeThresholdInverse)) {
		direction = directions.left;
	}
	else if((touchYDiff >= swipeThreshold)) {
		direction = directions.down;
	}
	else if((touchYDiff <= swipeThresholdInverse)) {
		direction = directions.up;
	};

	snake.turn(direction);

});

snake.start();
