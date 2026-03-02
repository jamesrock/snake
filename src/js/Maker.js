import {
	makeArray,
	makeInput,
	makeNode,
	makeButton,
	makeSelect
} from '@jamesrock/rockjs';

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
    const mode = makeSelect([['add', 'yes'], ['remove', 'no']]);
    const set = makeSelect([3, 4, 5].map((a) => [a, a]));
    const copyButton = makeButton('copy', 'copy');
    const gap = 1;
    const guides = makeArray(25).map((value) => value * 3);
    let props = settings[difficulty.value];
    const xPos = makeInput(props.xPos);
    const yPos = makeInput(props.yPos);
    const size = makeInput(props.size);
    const pixelSize = makeInput(props.pixelSize);
    const width = makeInput(props.width);
    const height = makeInput(props.height);
    let data = this.data = [];

    const makeGrid = (s, w, h) => {
      let x = 0;
      let y = 0;
      const out = makeNode('div', 'grid');
      out.style.width = `${w*s + (gap * (w-1))}px`;
      out.style.height = `${h*s + (gap * (h-1))}px`;
      out.style.gap = `${gap}px`;
      makeArray(w*h).forEach((index) => {
        const pixel = makeNode('div', 'grid-pixel');
        pixel.style.width = pixel.style.height = `${s}px`;
        pixel.dataset.index = index;
        pixel.dataset.x = x;
        pixel.dataset.y = y;
        pixel.dataset.active === 'no';
        pixel.classList.add(guides.includes(x) || guides.includes(y) ? 'guide' : 'pixel');
        out.append(pixel);

        if(x > 0 && x%(w-1)===0) {
          x = 0;
          y ++;
        }
        else {
          x ++;
        };

      });
      return out;
    };

    const changeHandler = () => {
      data = this.data = makeArray(props.width*props.height, () => 0);
      body.style.backgroundImage = `url(/mazes/maze-${set.value}-${difficulty.value}.png)`;
      body.style.backgroundSize = `${size.value}px`;
      body.style.backgroundPosition = `calc(50% - ${xPos.value}px) calc(50% - ${yPos.value}px)`;
      if(grid) {
        grid.parentNode.removeChild(grid);
      };
      grid = makeGrid(Number(pixelSize.value), Number(width.value), Number(height.value));
      target.append(grid);
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

    let grid = null;

    [set, difficulty, mode, copyButton].forEach((input) => {
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

    const activeMap = {
      'yes': 1,
      'no': 0
    };

    target.addEventListener('touchstart', (e) => {
      knobs = [];
    });

    target.addEventListener('touchmove', (e) => {
     	const knob = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
     	if(knob?.classList.contains('guide')) {
    		if(knobs.indexOf(knob)===-1) {
     			knobs.push(knob);
          // knob.dataset.active = knob.dataset.active === 'yes' ? 'no' : 'yes';
          knob.dataset.active = mode.value;
          data[knob.dataset.index] = activeMap[knob.dataset.active];
    		};
     	};
     	e.preventDefault();
    });

    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(JSON.stringify(data));
      copyButton.innerText = 'copied!';
      setTimeout(() => {
        copyButton.innerText = 'copy';
      }, 2000);
    });

  };
  getData() {

    return JSON.stringify(this.data);

  };
};
