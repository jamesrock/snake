import {
  DisplayObject,
	makeArray,
	makeInput,
	makeNode,
	makeButton,
	makeSelect
} from '@jamesrock/rockjs';
import { mazes } from './mazes';

const makeOpacitySlider = () => {
  const node = makeInput(0, 'range');
  node.min = 0;
  node.max = 1;
  node.step = 0.1;
  node.value = 1;
  return node;
};

class Grid extends DisplayObject {
  constructor(s, w, h, data = makeArray(w*h, () => 0)) {

    super();

    this.data = data;

    let x = 0;
    let y = 0;
    const gap = 1;
    const node = this.node = makeNode('div', 'grid');
    node.style.width = `${w*s + (gap * (w-1))}px`;
    node.style.height = `${h*s + (gap * (h-1))}px`;
    node.style.gap = `${gap}px`;

    makeArray(w*h).forEach((index) => {
      const pixel = makeNode('div', 'grid-pixel');
      pixel.style.width = pixel.style.height = `${s}px`;
      pixel.dataset.index = index;
      pixel.dataset.x = x;
      pixel.dataset.y = y;
      pixel.dataset.active === 'no';
      pixel.classList.add(this.guides.includes(x) || this.guides.includes(y) ? 'guide' : 'pixel');
      node.append(pixel);
      this.pixels.push(pixel);

      if(x > 0 && x%(w-1)===0) {
        x = 0;
        y ++;
      }
      else {
        x ++;
      };

    });

    this.fill();

  };
  fill() {

    this.data.forEach((value, index) => {
      this.pixels[index].dataset.active = this.bobMap[value];
    });

    return this;

  };
  set(index, value) {

    this.data[index] = this.activeMap[value];
    return this;

  };
  activeMap = {
    'wall-yes': 1,
    'wall-no': 0,
    'coin-yes': 2,
    'coin-no': 0,
  };
  bobMap = ['no', 'yes', 'coin'];
  guides = makeArray(25).map((value) => value * 3);
  pixels = [];
};

export class Maker {
  constructor() {

    const body = document.body;

    const settings = {
      'easy': {
        xPos: 3,
        yPos: 38,
        size: 1475,
        pixelSize: 20,
        width: 37,
        height: 49
      },
      'medium': {
        xPos: 3,
        yPos: 37,
        size: 1405,
        pixelSize: 15,
        width: 46,
        height: 61
      },
      'hard': {
        xPos: 4,
        yPos: 36,
        size: 1370,
        pixelSize: 12,
        width: 55,
        height: 73
      },
    };

    const maker = makeNode('div', 'maker');
    const inputs = makeNode('div', 'inputs');
    const target = makeNode('div', 'grid-target');
    const difficulty = makeSelect(['easy', 'medium', 'hard'].map((a) => [a, a]));
    const mode = makeSelect([['add wall', 'wall-yes'], ['remove wall', 'wall-no'], ['add coin', 'coin-yes'], ['remove coin', 'coin-no']]);
    const constrain = {
      'wall-yes': 'guide',
      'wall-no': 'guide',
      'coin-yes': 'pixel',
      'coin-no': 'pixel'
    };
    const set = makeSelect(makeArray(10).map((a) => [`#${a + 1}`, a]));
    const copyButton = makeButton('copy', 'copy');
    let props = settings[difficulty.value];
    const xPos = makeInput(props.xPos);
    const yPos = makeInput(props.yPos);
    const size = makeInput(props.size);
    const pixelSize = makeInput(props.pixelSize);
    const width = makeInput(props.width);
    const height = makeInput(props.height);
    const opacity = makeOpacitySlider();
    let grid = null;

    const changeHandler = () => {
      body.style.backgroundImage = `url(/mazes/maze-${Number(set.value) + 1}-${difficulty.value}.png)`;
      body.style.backgroundSize = `${size.value}px`;
      body.style.backgroundPosition = `calc(50% - ${xPos.value}px) calc(50% - ${yPos.value}px)`;
      if(grid) {
        grid.destroy();
      };
      grid = new Grid(Number(pixelSize.value), Number(width.value), Number(height.value), mazes[difficulty.value][set.value]);
      grid.appendTo(target);
    };

    difficulty.addEventListener('input', () => {
      props = settings[difficulty.value];
      xPos.value = props.xPos;
      yPos.value = props.yPos;
      size.value = props.size;
      pixelSize.value = props.pixelSize;
      width.value = props.width;
      height.value = props.height;
      changeHandler();
    });

    set.addEventListener('input', changeHandler);

    opacity.addEventListener('input', () => {
      target.style.opacity = opacity.value;
    });

    [set, difficulty, mode, copyButton, opacity].forEach((input) => {
      inputs.append(input);
    });

    // [xPos, yPos, size, pixelSize, width, height].forEach((input) => {
    //   input.addEventListener('input', changeHandler);
    //   inputs.append(input);
    // });

    maker.append(target);
    maker.append(inputs);
    body.append(maker);

    changeHandler();

    let knobs = null;

    target.addEventListener('touchstart', (e) => {
      knobs = [];
    });

    target.addEventListener('touchmove', (e) => {
     	const knob = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
     	if(knob?.classList.contains(constrain[mode.value])) {
    		if(knobs.indexOf(knob)===-1) {
     			knobs.push(knob);
          grid.set(knob.dataset.index, mode.value);
    		};
     	};
     	e.preventDefault();
    });

    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(JSON.stringify(grid.data));
      copyButton.innerText = 'copied!';
      setTimeout(() => {
        copyButton.innerText = 'copy';
      }, 2000);
    });

  };
};
