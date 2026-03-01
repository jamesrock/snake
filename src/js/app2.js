import '/css/app.css';
import {
	Rounder,
	Scaler,
	GameBase,
	setDocumentHeight,
	isValidKey,
	makeArray,
	random,
	getRandom,
	pluckFirst,
	pluckRandom,
} from '@jamesrock/rockjs';
import { Maker } from './Maker';
import { mazes } from './mazes';

setDocumentHeight();

const scaler = new Scaler(2);

const canScale = (baseWidth, baseHeight) => {

	return scaler.inflate(baseWidth)<window.innerWidth && scaler.inflate(baseHeight)<window.innerHeight;

};

const mapToGrid = (pixels, w) => {
  console.log(`mapToGrid`, w);
  // return [];
  let x = 0;
  let y = 0;
  return pixels.map((a, index) => {

    const bob = [!!a, x, y, index];

    if(x > 0 && x%(w-1)===0) {
      x = 0;
      y ++;
    }
    else {
      x ++;
    };

    return bob;

  });
};

class Wall {
	constructor(x, y, color = 'black') {

		this.x = x;
		this.y = y;
		this.color = color;

	};
};

class Coin {
	constructor(x, y, color = 'gold') {

		this.x = x;
		this.y = y;
		this.color = color;

	};
};

class Maze extends GameBase {
	constructor(data, mode = 'easy') {

		super('maze');

		if(canScale(scaler.deflate(this.inflate(this.width)), scaler.deflate(this.inflate(this.height)))) {
			this.node.dataset.scale = 'true';
			this.size = scaler.inflate(this.size);
		};

		const targetWidth = 500;

		this.settings = {
      'easy': {
        pixelSize: 15,
        width: 37,
        height: 49
      },
      'medium': {
        pixelSize: 12,
        width: 46,
        height: 61
      },
      'hard': {
        pixelSize: 10,
        width: 55,
        height: 73
      },
    };

		this.mode = mode;
		this.props = this.settings[this.mode];

		this.width = this.props.width;
		this.height = this.props.height;
		this.size = scaler.inflate(targetWidth / this.props.width);

		const grid = mapToGrid(data, this.props.width);

		this.data = data;
		this.walls = grid.filter((a) => a[0]).map(([isWall, x, y]) => new Wall(x, y));

		this.canvas.width = this.inflate(this.width);
		this.canvas.height = this.inflate(this.height);
		this.canvas.style.width = `${scaler.deflate(this.canvas.width)}px`;

		this.node.style.borderWidth = `${scaler.deflate(this.size)}px`;
		this.node.appendChild(this.canvas);
		this.node.appendChild(this.gameOverNode);

		this.showGameOverScreen();
		this.reset();
		this.render();

		console.log(this);

	};
	render() {

		this.canvas.width = this.inflate(this.width);

		this.walls.forEach((seg) => {
			this.ctx.fillStyle = this.color;
			this.ctx.fillRect(this.inflate(seg.x), this.inflate(seg.y), this.size, this.size);
		});

		this.coins.forEach((coin) => {
			this.ctx.fillStyle = coin.color;
			this.ctx.fillRect(this.inflate(coin.x), this.inflate(coin.y), this.size, this.size);
		});

		this.toSquare().forEach(([x, y]) => {
			this.ctx.fillStyle = 'red';
			this.ctx.fillRect(this.inflate(x), this.inflate(y), this.size, this.size);
		});

		this.animationFrame = requestAnimationFrame(() => {
			this.render();
		});

		return this;

	};
	update() {

		if(this.gameOver || this.dying) {
			return;
		};

	};
	toSquare() {

	  const x = this.x;
		const y = this.y;

	  return [
			[x-1, y-1],
			[x-1, y],
			[x, y-1],
			[x, y]
		];

	};
	getDirection() {

		return pluckFirst(this.directions);

	};
	checkCollision(x, y) {

		let collision = false;

		for(var i = 1; i < this.walls.length-2; i++) {
			const {x: sX, y: sY} = this.walls[i];
			if(sX === x && sY === y) {
				collision = true;
			};
		};

		if((x === -1) || (y === -1) || (x === this.width) || (y === this.height)) {
			collision = true;
		};

		return collision;

	};
	checkCoins(x, y) {

		const food = this.coins.find((food) => food.x === x && food.y === y);

		if(food) {

			this.coins.splice(this.coins.indexOf(food), 1);
			this.color = food.color;

			if(food.color===this.poison) {
				return true;
			};

			this.score ++;
			this.makeCoins(1);

		};

		return false;

	};
	move(direction) {

	  if(!this.canMove(direction)) {
			return;
		};

		switch(direction) {
      case 'up':
        this.y --;
      break;
      case 'down':
        this.y ++;
      break;
      case 'left':
        this.x --;
      break;
      case 'right':
        this.x ++;
      break;
		};

		// this.checkCoins(x, y);

		return this;

	};
	canMove(direction) {

    let x = this.x;
    let y = this.y;

    switch(direction) {
      case 'up':
        y --;
      break;
      case 'down':
        y ++;
      break;
      case 'left':
        x --;
      break;
      case 'right':
        x ++;
      break;
		};

    return ![
			`x${x-1}y${y-1}`,
			`x${x-1}y${y}`,
			`x${x}y${y-1}`,
			`x${x}y${y}`,
		].map((q) => this.checkForWall(q)).includes(true);

	};
	renderTo(to) {

		to.appendChild(this.node);
		return this;

	};
	reset() {

		this.score = 0;
		this.directions = [directions.right];
		// this.walls = [];
		this.coins = [];
		this.colors = [
			'#F8C800', // yellow
			'#EF0040', // red
			'#FF00FF', // pink
			'#00E000', // green
			'#9C00FF', // purple
			'#25CCFD', // blue
			'#FF7F00', // orange
		];
		this.color = 'black';
		this.gameOver = false;
		this.dying = false;
		// this.makeCoins();

		this.gameOverNode.dataset.active = false;

		setTimeout(() => {
			this.node.dataset.preview = false;
			this.update();
		}, 2000);

		return this;

	};
	inflate(a) {

		return (a * this.size);

	};
	checkForWall(toCheck) {

		return this.walls.map((wall) => (`x${wall.x}y${wall.y}`)).includes(toCheck);

	};
	checkForFood(toCheck) {

		return this.coins.map((coin) => (`x${coin.x}y${coin.y}`)).includes(toCheck);

	};
	query(q) {

		return this.checkForWall(q)||this.checkForFood(q);

	};
	makeCoins(count = 50) {

		makeArray(count).forEach(() => {

			const numberOfPoison = this.coins.filter((food) => food.color === this.poison).length;
			const {x, y} = this.getRandomXAndY();

			this.coins.push(new Coin(x, y, getRandom(numberOfPoison < 25 ? [this.poison, ...this.colors] : this.colors)));

		});
		return this;

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
			// console.log('clash');
			x = random(1, width);
			y = random(1, height);
		};

		return {
			x,
			y
		};

	};
	stop() {

		cancelAnimationFrame(this.animationFrame);
		return this;

	};
	x = 2;
	y = 1;
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
mode = 'medium',
snake = window.snake = new Maze(mazes[mode][0], mode);

let touchX = 0;
let touchY = 0;

snake.renderTo(body);

document.addEventListener('keydown', (e) => {

	if(isValidKey(e.code, directionsArray)) {
		snake.move(directionsKeyMap[e.key]);
	};

	if(snake.gameOver && isValidKey(e.code, ['Space'])) {
		snake.reset();
	};

});

document.addEventListener('click', () => {

	if(snake.gameOver) {
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

	snake.move(direction);

});

// new Maker();
