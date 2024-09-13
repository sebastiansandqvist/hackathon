import { createMousePosition } from '@solid-primitives/mouse';
import { createElementSize } from '@solid-primitives/resize-observer';
import { type Component, createSignal, createEffect, onCleanup, type ParentComponent } from 'solid-js';

const CanvasAnimation: Component<{
  class?: string;
  draw: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
}> = (props) => {
  const [canvasElement, setCanvasElement] = createSignal<HTMLCanvasElement>();
  const size = createElementSize(canvasElement);

  createEffect(() => {
    const canvas = canvasElement();
    if (!canvas || !size.width || !size.height) return;

    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.width = size.width * devicePixelRatio;
    canvas.height = size.height * devicePixelRatio;

    const ctx = canvas.getContext('2d')!;
    ctx.resetTransform();
    ctx.scale(devicePixelRatio, devicePixelRatio);
  });

  let raf = 0;
  createEffect(() => {
    const canvas = canvasElement()!;
    const ctx = canvas.getContext('2d')!;
    function drawLoop() {
      props.draw(canvas, ctx);
      raf = requestAnimationFrame(drawLoop);
    }
    raf = requestAnimationFrame(drawLoop);
  });

  onCleanup(() => {
    cancelAnimationFrame(raf);
  });

  return <canvas ref={setCanvasElement} class={props.class} />;
};

// TODO:
// draw a radial gradient that initially draws the focus to the left/welcome message.
// but if the user's mouse is in the canvas grid, then center it on the mouse.

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
      <CanvasAnimation class="pointer-events-none absolute inset-0 -z-10" draw={draw} />
      <div>{props.children}</div>
    </div>
  );
};
