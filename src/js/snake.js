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

		this.reset();

		this.gameOverNode.addEventListener('click', () => {
			this.reset();
		});

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

		clearTimeout(this.timer);

		this.timer = setTimeout(() => {
			this.update();
		}, 300 - this.eaten);

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
			this.gameOverNode.innerHTML = `<div>GAME OVER</div><div>Score: ${formatNumber(this.eaten)}</div><div>Tap to continue</div>`;
			this.setGameOverScreen(true);
			return;
		};

		this.checkFood(x, y);

	};
	checkCollision(x, y) {

		var 
		collision = false,
		seg;

		for(var i = 1; i < this.segments.length; i++) {
			seg = this.segments[i];
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
				this.createFood(1);
				return 'break';
				
			};

		});
		
		this.move(x, y);

	};
	createFood(count = 17) {

		makeArray(count).forEach(() => {
			const {
				x, y
			} = this.getRandomXAndY();
			this.foods.push(new Food(x, y));
		});
		return this;

	};
	move(x, y) {
		
		var 
		seg = this.segments.shift();

		seg.x = x;
		seg.y = y;
		this.segments.push(seg);

		this.draw();

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

		this.scoreNode.innerHTML = `score: ${formatNumber(this.eaten)}`;
		return this;

	};
	renderTo(to) {

		to.appendChild(this.node);
		return this;

	};
	reset() {

		this.eaten = 0;
		this.direction = directions.right;
		this.foods = [];
		this.segments = makeArray(10, (a, i) => new Segment(i, 0));
		this.createFood();
		this.draw();
		this.setGameOverScreen(false);
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
	setGameOverScreen(active) {

		this.gameOverNode.dataset.active = active;
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
