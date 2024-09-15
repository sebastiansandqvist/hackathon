import { createElementSize } from '@solid-primitives/resize-observer';
import { type Component, createSignal, createEffect, onCleanup } from 'solid-js';

export const Canvas: Component<{
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
    props.draw(canvas, ctx);
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
