import { createSignal, onCleanup, For, createEffect, type Component } from 'solid-js';
import { Canvas, flashMessage } from '~/components';
import { invalidate, mutate, trpc } from '~/trpc';

function makeSquareWaveBuffer(ctx: AudioContext, bufferFrequency: number) {
  const bufferSize = ctx.sampleRate * 0.001; // 1ms of sound
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Fill the buffer with a square wave at the buffer frequency
  for (let i = 0; i < bufferSize; i++) {
    const time = i / ctx.sampleRate;
    data[i] = Math.sign(Math.sin(2 * Math.PI * bufferFrequency * time)); // Generates a square wave
  }

  return buffer;
}

function makeNoiseBuffer(ctx: AudioContext) {
  const bufferSize = ctx.sampleRate * 0.001; // 1ms of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Fill the buffer with white noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

function makeSineWaveBuffer(ctx: AudioContext, bufferFrequency: number) {
  const bufferSize = ctx.sampleRate * 0.001; // 1ms of sound
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Fill the buffer with a sine wave at the buffer frequency
  for (let i = 0; i < bufferSize; i++) {
    const time = i / ctx.sampleRate;
    data[i] = Math.sin(2 * Math.PI * bufferFrequency * time);
  }

  return buffer;
}

function makeTriangleWaveBuffer(ctx: AudioContext, bufferFrequency: number) {
  const bufferSize = ctx.sampleRate * 0.001; // 1ms of sound
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Fill the buffer with a triangle wave at the buffer frequency
  for (let i = 0; i < bufferSize; i++) {
    const time = i / ctx.sampleRate;
    data[i] = Math.abs(Math.sin(2 * Math.PI * bufferFrequency * time));
  }

  return buffer;
}

function tick(ctx: AudioContext, noiseBuffer: AudioBuffer, startTime: number, analyser: AnalyserNode) {
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const envelope = ctx.createGain();
  noise.connect(envelope);
  envelope.connect(analyser);
  analyser.connect(ctx.destination);

  envelope.gain.setValueAtTime(0.3, startTime);
  envelope.gain.exponentialRampToValueAtTime(0.01, startTime + 0.001);

  noise.start(startTime);
  noise.stop(startTime + 0.001);
}

function startTicking(ctx: AudioContext, noiseBuffer: AudioBuffer, frequency: number, analyser: AnalyserNode) {
  let nextTickTime = ctx.currentTime;
  let frame: number;

  function scheduleTicks() {
    while (nextTickTime < ctx.currentTime + 0.1) {
      // schedule ahead for 100ms
      tick(ctx, noiseBuffer, nextTickTime, analyser);
      nextTickTime += 1 / frequency;
    }

    // use requestAnimationFrame for continuous scheduling
    // (also makes it so that switching tabs pauses the sound)
    frame = requestAnimationFrame(scheduleTicks);
  }

  scheduleTicks();

  return () => cancelAnimationFrame(frame);
}

function bitsToInt(bits: boolean[]) {
  return parseInt(bits.map((bit) => (bit ? '1' : '0')).join(''), 2);
}

const notes = [
  { note: 'A', octave: 0, hz: 27.5 },
  { note: 'A#', octave: 0, hz: 29.1353 },
  { note: 'B', octave: 0, hz: 30.8677 },
  { note: 'C', octave: 1, hz: 32.7032 },
  { note: 'C#', octave: 1, hz: 34.6478 },
  { note: 'D', octave: 1, hz: 36.7081 },
  { note: 'D#', octave: 1, hz: 38.8909 },
  { note: 'E', octave: 1, hz: 41.2034 },
  { note: 'F', octave: 1, hz: 43.6535 },
  { note: 'F#', octave: 1, hz: 46.2493 },
  { note: 'G', octave: 1, hz: 48.9994 },
  { note: 'G#', octave: 1, hz: 51.9131 },
  { note: 'A', octave: 1, hz: 55.0 },
  { note: 'A#', octave: 1, hz: 58.2705 },
  { note: 'B', octave: 1, hz: 61.7354 },
  { note: 'C', octave: 2, hz: 65.4064 },
  { note: 'C#', octave: 2, hz: 69.2957 },
  { note: 'D', octave: 2, hz: 73.4162 },
  { note: 'D#', octave: 2, hz: 77.7817 },
  { note: 'E', octave: 2, hz: 82.4069 },
  { note: 'F', octave: 2, hz: 87.3071 },
  { note: 'F#', octave: 2, hz: 92.4986 },
  { note: 'G', octave: 2, hz: 97.9989 },
  { note: 'G#', octave: 2, hz: 103.826 },
  { note: 'A', octave: 2, hz: 110.0 },
  { note: 'A#', octave: 2, hz: 116.541 },
  { note: 'B', octave: 2, hz: 123.471 },
  { note: 'C', octave: 3, hz: 130.813 },
  { note: 'C#', octave: 3, hz: 138.591 },
  { note: 'D', octave: 3, hz: 146.832 },
  { note: 'D#', octave: 3, hz: 155.563 },
  { note: 'E', octave: 3, hz: 164.814 },
  { note: 'F', octave: 3, hz: 174.614 },
  { note: 'F#', octave: 3, hz: 184.997 },
  { note: 'G', octave: 3, hz: 195.998 },
  { note: 'G#', octave: 3, hz: 207.652 },
  { note: 'A', octave: 3, hz: 220.0 },
  { note: 'A#', octave: 3, hz: 233.082 },
  { note: 'B', octave: 3, hz: 246.942 },
  { note: 'C', octave: 4, hz: 261.626 },
  { note: 'C#', octave: 4, hz: 277.183 },
  { note: 'D', octave: 4, hz: 293.665 },
  { note: 'D#', octave: 4, hz: 311.127 },
  { note: 'E', octave: 4, hz: 329.628 },
  { note: 'F', octave: 4, hz: 349.228 },
  { note: 'F#', octave: 4, hz: 369.994 },
  { note: 'G', octave: 4, hz: 391.995 },
  { note: 'G#', octave: 4, hz: 415.305 },
];

const PitchVisualizer: Component<{ frequency: number }> = (props) => {
  return (
    <Canvas
      draw={(canvas, ctx) => {
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
        const minNote = notes[0]!;
        const maxNote = notes[notes.length - 1]!;
        ctx.font = '12px zed';
        ctx.textAlign = 'center';

        for (const { note, hz } of notes) {
          const lineWidth = 1.5;
          const frequencyRange = maxNote.hz - minNote.hz;
          const normalizedFrequency = (hz - minNote.hz) / frequencyRange;
          const x = normalizedFrequency * rect.width; // adding 30px padding to the left
          const y = note.includes('#') ? rect.height : rect.height - 20;
          ctx.fillStyle = note.includes('#') ? '#6366f1' : '#38bdf8';
          ctx.fillRect(x - lineWidth / 2, 0, lineWidth, y - 20);
          if (hz > 52) {
            ctx.fillText(note, x, y);
          }
        }

        const lineWidth = 2;
        const frequencyRange = notes[notes.length - 1]!.hz - notes[0]!.hz;
        const normalizedFrequency = (props.frequency - notes[0]!.hz) / frequencyRange;
        const x = props.frequency < notes[0]!.hz ? 0 : normalizedFrequency * rect.width;
        ctx.fillStyle = '#0f0';
        ctx.fillRect(x - lineWidth / 2, 0, lineWidth, rect.height);
      }}
    />
  );
};

const Toggle: Component<{ checked: boolean; onChange: () => void }> = (props) => (
  <button class="cursor-pointer" onClick={props.onChange}>
    <img
      src={props.checked ? '/images/on.webp' : '/images/off.webp'}
      class="pointer-events-none w-[50px]"
      classList={{
        'opacity-75': !props.checked,
      }}
    />
  </button>
);

const Synth: Component<{ frequency: number }> = (props) => {
  let audioCtx: AudioContext;
  let analyser: AnalyserNode;
  let stop = () => {};

  createEffect(() => {
    const frequency = props.frequency;
    stop();
    if (frequency === 0) return;
    if (!audioCtx) {
      audioCtx = new window.AudioContext();
      analyser = audioCtx.createAnalyser();
      analyser.connect(audioCtx.destination);
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0;
    }
    const tickSound = makeSquareWaveBuffer(audioCtx, frequency);
    stop = startTicking(audioCtx, tickSound, frequency, analyser);
  });

  onCleanup(() => {
    stop();
    audioCtx?.close();
  });

  return (
    <Canvas
      class="bg-blue-800/10"
      draw={(canvas, ctx) => {
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);

        if (!analyser) return;

        const bufferLength = analyser.fftSize;
        const dataArrayOriginal = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArrayOriginal);
        // analyser.getByteTimeDomainData(dataArrayOriginal);

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(0, 255, 0)';
        ctx.beginPath();

        const dataArray = dataArrayOriginal.slice(0, -10);
        // const dataArray = dataArrayOriginal.slice(64, 128);
        const sliceWidth = canvas.width / dataArray.length;

        const max = Math.max(...dataArray);
        const min = Math.min(...dataArray);

        function scale(min: number, max: number, value: number) {
          return (value - min) / (max - min);
        }

        for (let i = 0; i < bufferLength; i++) {
          const v = scale(min, max, dataArray[i]!);
          const y = v * rect.height;
          const x = i * sliceWidth;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.stroke();
      }}
    />
  );
};

// 001000101 = 69
// 010001010 = 138 // actual is ~138.5
// 010001011 = 139
// 100010101 = 277
const validCombos = [
  [false, false, true, false, false, false, true, false, true],
  [false, true, false, false, false, true, false, true, false],
  [false, true, false, false, false, true, false, true, true],
  [true, false, false, false, true, false, true, false, true],
];

export function SoundPuzzle() {
  const [bits, setBits] = createSignal([false, false, false, false, false, false, false, false, false]);
  const [freq, setFreq] = createSignal(0);

  const submitPuzzle = mutate(trpc.submitSolution, {
    onError(err: Error) {
      if (err.message === 'incorrect') {
        flashMessage('incorrect', 'red');
      } else {
        alert(err.message ?? 'Unable to submit solution');
      }
    },
    async onSuccess() {
      await flashMessage('nice C#');
      invalidate('homepage');
      invalidate('status');
    },
  });

  createEffect(() => {
    const currentBits = bits();
    for (const combo of validCombos) {
      if (combo.every((bit, i) => bit === currentBits[i])) {
        submitPuzzle.mutate({
          category: 'logic',
          difficulty: 'easy',
          solution: 'C#',
        });
        return;
      }
    }
  });

  return (
    <div>
      <div class="h-32 w-full">
        <Synth frequency={freq()} />
      </div>
      <div class="h-16 w-full bg-blue-800/10 pb-2">
        <PitchVisualizer frequency={freq()} />
      </div>
      <fieldset class="mt-4 flex items-center gap-2">
        <For each={bits()}>
          {(bit, i) => (
            <Toggle
              checked={bit}
              onChange={() => {
                setBits((prev) => {
                  const next = [...prev];
                  next[i()] = !next[i()];
                  setFreq(bitsToInt(next));
                  return next;
                });
              }}
            />
          )}
        </For>
      </fieldset>
    </div>
  );
}
