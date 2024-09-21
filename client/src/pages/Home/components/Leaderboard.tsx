import { type Component } from 'solid-js';
import { Canvas } from '~/components';
import type { RouterOutput } from '~/trpc';

type Progress = RouterOutput['homepage']['sideQuestProgress'][0]['progress'];
type Times = RouterOutput['homepage']['times'];

export const LeaderboardCanvas: Component<{ progress: Progress; times: Times }> = (props) => {
  let parent: HTMLDivElement;
  let isMouseInside = false;
  let mouseX = 0;

  const start = new Date(props.times.codingStart);
  const end = new Date(props.times.codingEnd);
  const hackathonStart = start.getTime();
  const hackathonEnd = end.getTime();
  const midnights = allMidnightsBetween(start, end);

  const categories = ['algorithms', 'forensics', 'graphics', 'hacking', 'logic', 'puzzles'] as const;
  const difficultyLevels = ['easy', 'hard'] as const;

  const draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const currentTime = new Date('2024-10-19T10:00:00.000Z').getTime(); // TODO: make this the actual current time
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
        const isoDate = props.progress[category]?.[difficulty];
        if (!isoDate) continue;
        const timestamp = new Date(isoDate).getTime();
        const percent = Math.abs(timestamp - hackathonStart) / range;
        const x = Math.floor(percent * drawingArea.width);
        ctx.fillRect(x - padding, 0 - padding, fontWidth + padding * 2, fontHeight + padding * 2);
      }
    }
    ctx.restore();

    // draw characters

    const drawCategories = ({ mouseOver }: { mouseOver: boolean }) => {
      ctx.save();
      ctx.translate(-fontWidth / 2, 0);
      for (const category of categories) {
        for (const difficulty of difficultyLevels) {
          const isoDate = props.progress[category]?.[difficulty];
          if (!isoDate) continue;
          const timestamp = new Date(isoDate).getTime();
          const percent = Math.abs(timestamp - hackathonStart) / range;
          const x = Math.floor(percent * drawingArea.width);
          const rightEdge = x + fontWidth * 4;
          const mouseXAdjusted = mouseX - drawingArea.x + fontWidth / 2;
          const isMouseOver = mouseXAdjusted >= x && mouseXAdjusted <= rightEdge && isMouseInside;

          if (isMouseOver) {
            if (!mouseOver) continue;
            // TODO: fit this in the bounding box if it goes off the right edge
            ctx.font = `14px Zed`;
            const text = `${category} (${difficulty})`;
            const textWidth = ctx.measureText(text).width;
            ctx.fillStyle = '#2c304d';
            ctx.fillRect(x - 2, 0, textWidth + 6, drawingArea.height);
            ctx.fillStyle = difficulty === 'easy' ? '#38bdf8' : '#34d399';
            ctx.fillText(text, x + padding, 15);
          } else {
            if (mouseOver) continue;
            ctx.font = `normal 600 ${fontHeight}px Zed`;
            ctx.fillStyle = difficulty === 'easy' ? '#38bdf8' : '#34d399';
            ctx.fillText(category[0] ?? '', x, 14);
          }
        }
      }
      ctx.restore();
    };

    drawCategories({ mouseOver: false });

    // draw a vertical line at the current time
    const currentTimePercent = (currentTime - hackathonStart) / range;
    const currentTimeX = Math.floor(currentTimePercent * drawingArea.width);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(currentTimeX, 0, 1, drawingArea.height);

    ctx.fillStyle = '#7e89bf';

    // draw a line for the start time and label it "start"
    ctx.fillRect(0, 0, 1, drawingArea.height);

    // draw a line for each midnight and label it with the date, like 10/19
    for (const midnight of midnights) {
      const midnightPercent = (midnight.getTime() - start.getTime()) / range;
      const midnightX = Math.floor(midnightPercent * drawingArea.width);
      ctx.fillRect(midnightX, 0, 1, drawingArea.height);
    }

    // draw a line for the end time and label it "end"
    ctx.fillRect(drawingArea.width - 1, 0, 1, drawingArea.height);

    // ensure that we draw the mouseover pass after the default 1-letter pass
    // and after the "now" line
    drawCategories({ mouseOver: true });
  };

  return (
    <div
      ref={parent!}
      class="h-full"
      onMouseMove={(e) => {
        mouseX = e.clientX;
      }}
      onMouseEnter={() => {
        isMouseInside = true;
      }}
      onMouseLeave={() => {
        isMouseInside = false;
      }}
    >
      <Canvas draw={draw} />
    </div>
  );
};

function allMidnightsBetween(start: Date, end: Date) {
  const midnights = [];
  const current = new Date(start);
  const offset = current.getTimezoneOffset();

  current.setUTCHours(0, offset, 0, 0); // Set to midnight in local timezone

  while (current <= end) {
    midnights.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return midnights;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
}

export const LeaderboardCanvasMetadata: Component<{ times: Times }> = (props) => {
  const start = new Date(props.times.codingStart);
  const end = new Date(props.times.codingEnd);
  const range = end.getTime() - start.getTime();
  const midnights = allMidnightsBetween(start, end);

  return (
    <Canvas
      draw={(canvas, ctx) => {
        const drawingArea = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, drawingArea.width, drawingArea.height);

        // draw a vertical line at the current time
        const currentTime = new Date('2024-10-19T10:00:00.000Z').getTime();
        const currentTimePercent = (currentTime - start.getTime()) / range;
        const currentTimeX = Math.floor(currentTimePercent * drawingArea.width);
        ctx.font = '12px Zed';
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(currentTimeX, 0, 1, 14);
        ctx.textBaseline = 'top';
        ctx.textAlign = 'center';
        ctx.fillText('now', currentTimeX, drawingArea.height - 12);

        ctx.font = '10px Zed';
        ctx.fillStyle = '#7e89bf';
        ctx.textAlign = 'left';

        // draw a line for the start time and label it "start"
        ctx.fillRect(0, 0, 1, 6);
        ctx.fillRect(0, 6, 6, 1);
        ctx.fillText('start', 10, 2);

        // draw a line for each midnight and label it with the date, like 10/19
        for (const midnight of midnights) {
          const midnightPercent = (midnight.getTime() - start.getTime()) / range;
          const midnightX = Math.floor(midnightPercent * drawingArea.width);
          ctx.fillRect(midnightX, 0, 1, 6);
          ctx.fillRect(midnightX, 6, 6, 1);
          ctx.fillText(formatDate(midnight), midnightX + 10, 2);
        }

        // draw a line for the end time and label it "end"
        ctx.textAlign = 'right';
        ctx.fillRect(drawingArea.width - 1, 0, 1, 6);
        ctx.fillRect(drawingArea.width - 6, 6, 6, 1);
        ctx.fillText(formatTime(end), drawingArea.width - 10, 2);
      }}
    />
  );
};
