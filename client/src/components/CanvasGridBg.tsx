import { type ParentComponent } from 'solid-js';
import { Canvas } from './Canvas';

const deterministicRandom = (x: number, y: number, timeSeed: number, max: number) => {
  const seed = (x * 73856093) ^ (y * 19349663) ^ timeSeed;
  const randomValue = Math.sin(seed) * 10000;
  return Math.floor((randomValue - Math.floor(randomValue)) * max);
};

export const CanvasGridBg: ParentComponent = (props) => {
  let parent: HTMLDivElement;
  let mouseX = 0;
  let mouseY = 0;
  const start = Date.now();

  return (
    <div
      class="relative"
      ref={parent!}
      onMouseMove={(e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }}
    >
      <Canvas
        class="pointer-events-none absolute inset-0 -z-10"
        draw={(canvas, ctx) => {
          const { width, height } = canvas.getBoundingClientRect();
          const dt = Date.now() - start;
          const timeSeed = Math.floor(dt / 2000);

          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const pixelSize = 4;
          const borderSize = 1;
          const colors = ['#141341', '#161352', '#36397e', '#110733', '#0c0b26'];

          for (let y = 0; y < height; y += pixelSize + borderSize) {
            for (let x = 0; x < width; x += pixelSize + borderSize) {
              const colorIndex = deterministicRandom(x + mouseX, y + mouseY, timeSeed, colors.length);
              ctx.fillStyle = colors[colorIndex]!;
              ctx.fillRect(x, y, pixelSize, pixelSize);
            }
          }
        }}
      />
      <div>{props.children}</div>
    </div>
  );
};
