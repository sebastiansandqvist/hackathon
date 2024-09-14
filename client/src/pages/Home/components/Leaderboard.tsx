import type { Component } from 'solid-js';
import { Canvas } from '../../../components/Canvas';
import type { RouterOutput } from '../../../trpc';

type Progress = RouterOutput['homepage']['sideQuestProgress'][0]['progress'];
type Times = RouterOutput['homepage']['times'];

export const LeaderboardCanvas: Component<{ progress: Progress; times: Times }> = (props) => {
  const currentTime = new Date('2024-10-19T08:00:00.000Z').getTime();
  const hackathonStart = new Date(props.times.codingStart).getTime();
  const hackathonEnd = new Date(props.times.codingEnd).getTime();

  const categories = ['algorithms', 'forensics', 'hacking', 'logic', 'puzzles'] as const;
  const difficultyLevels = ['easy', 'hard'] as const;

  const draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const now = performance.now();
    const drawingArea = canvas.getBoundingClientRect();

    // clear the background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, drawingArea.width, drawingArea.height);

    // draw moving dots
    const pixelsPerSecond = 4;
    const pixelsBetweenDots = 10;
    const radius = 1;
    for (let i = 0; i < Math.ceil(drawingArea.width / pixelsBetweenDots) + 1; i++) {
      const xOffset = ((now * pixelsPerSecond) / 1000) % pixelsBetweenDots;
      const x = i * pixelsBetweenDots - xOffset;
      const y = drawingArea.height / 2 - radius;
      ctx.fillStyle = '#a5b4fc';
      ctx.beginPath();
      ctx.roundRect(x, y, radius * 2, radius * 2, radius);
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.fill();
      ctx.restore();
    }

    //draw char backgrounds
    const padding = 2;
    const fontHeight = 16 as const;
    const fontWidth = ctx.measureText(' ').width;
    const range = hackathonEnd - hackathonStart;

    ctx.save();
    ctx.translate(-fontWidth / 2, 0);
    ctx.fillStyle = '#020617';
    for (const category of categories) {
      for (const difficulty of difficultyLevels) {
        const isoDate = props.progress[category][difficulty];
        if (!isoDate) continue;
        const timestamp = new Date(isoDate).getTime();
        const percent = Math.abs(timestamp - hackathonStart) / range;
        const x = Math.floor(percent * drawingArea.width);
        ctx.fillRect(x - padding, 0 - padding, fontWidth + padding * 2, fontHeight + padding * 2);
      }
    }
    ctx.restore();

    // draw characters
    ctx.font = `bold ${fontHeight}px Zed`;
    ctx.save();
    ctx.translate(-fontWidth / 2, 0);

    for (const category of categories) {
      for (const difficulty of difficultyLevels) {
        const isoDate = props.progress[category][difficulty];
        if (!isoDate) continue;
        const timestamp = new Date(isoDate).getTime();
        const percent = Math.abs(timestamp - hackathonStart) / range;
        const x = Math.floor(percent * drawingArea.width);
        ctx.fillStyle = difficulty === 'easy' ? '#38bdf8' : '#34d399';
        ctx.fillText(category[0] ?? '', x, 14);
      }
    }

    ctx.restore();

    // draw a vertical line at the current time
    const currentTimePercent = (currentTime - hackathonStart) / range;
    const currentTimeX = Math.floor(currentTimePercent * drawingArea.width);
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(currentTimeX, 0, 1.5, drawingArea.height);
  };
  return <Canvas draw={draw} />;
};
