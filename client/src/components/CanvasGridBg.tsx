import { createMousePosition } from '@solid-primitives/mouse';
import { type ParentComponent } from 'solid-js';
import { Canvas } from './Canvas';

export const CanvasGridBg: ParentComponent = (props) => {
  let parent: HTMLDivElement;
  const start = Date.now();

  const pos = createMousePosition(() => parent);
  // we have access to: pos.x, pos.y, pos.isInside
  const draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const { width, height } = canvas.getBoundingClientRect();
    const dt = Date.now() - start;
    const timeSeed = Math.floor(dt / 2000);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pixelSize = 3;
    const borderSize = 1;
    const colors = ['#818cf8', '#1e1b4b', '#312e81', '#3730a3', '#2e1065'];

    const deterministicRandom = (x: number, y: number) => {
      const seed = (x * 73856093) ^ (y * 19349663) ^ timeSeed;
      const randomValue = Math.sin(seed) * 10000;
      return Math.floor((randomValue - Math.floor(randomValue)) * colors.length);
    };

    for (let y = 0; y < height; y += pixelSize + borderSize) {
      for (let x = 0; x < width; x += pixelSize + borderSize) {
        const colorIndex = deterministicRandom(x + pos.x, y + pos.y);
        ctx.fillStyle = colors[colorIndex]!;
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
    }

    // draw a gradient from top to bottom that goes from black to transparent.
    // const gradient = ctx.createLinearGradient(0, 0, 0, height);
    // gradient.addColorStop(0, '#1e1b4b');
    // gradient.addColorStop(0.5, '#00000000');
    // gradient.addColorStop(1, '#1e1b4b');
    // ctx.globalCompositeOperation = 'multiply';
    // ctx.fillStyle = gradient;
    // ctx.fillRect(8, 8, width - 16, height - 16);

    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#1e1b4baa';
    ctx.fillRect(0, 0, width, height);

    // draw a border around the entire canvas
    // ctx.globalCompositeOperation = 'overlay';
    // ctx.lineWidth = 1;
    // ctx.strokeStyle = '#60a5fa';
    // ctx.strokeRect(1, 1, width - 2, height - 2);

    ctx.globalCompositeOperation = 'source-over';
  };
  return (
    <div class="relative" ref={parent!}>
      <Canvas class="pointer-events-none absolute inset-0 -z-10" draw={draw} />
      <div>{props.children}</div>
    </div>
  );
};
