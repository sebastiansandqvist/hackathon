import { createSignal, onCleanup, For, createEffect } from 'solid-js';
import { Canvas } from '~/components';

// sound puzzle:
// "play C:"
// Flip? reverse bits
// Offset/shift (by whole notes)
// Tune (bits)
// - display current note on a 2? octave scale

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
  { note: 'A', octave: 4, hz: 440.0 },
  { note: 'A#', octave: 4, hz: 466.164 },
  { note: 'B', octave: 4, hz: 493.883 },
  { note: 'C', octave: 5, hz: 523.251 },
  { note: 'C#', octave: 5, hz: 554.365 },
  { note: 'D', octave: 5, hz: 587.33 },
  { note: 'D#', octave: 5, hz: 622.254 },
  { note: 'E', octave: 5, hz: 659.255 },
  { note: 'F', octave: 5, hz: 698.456 },
  { note: 'F#', octave: 5, hz: 739.989 },
  { note: 'G', octave: 5, hz: 783.991 },
  { note: 'G#', octave: 5, hz: 830.609 },
  { note: 'A', octave: 5, hz: 880.0 },
  { note: 'A#', octave: 5, hz: 932.328 },
  { note: 'B', octave: 5, hz: 987.767 },
];

export function Synth() {
  const [bits, setBits] = createSignal([false, false, false, false, false, false, false, false, false]);
  // const noiseBuffer = makeNoiseBuffer(ctx);
  // const noiseBuffer = makeSineWaveBuffer(ctx, 261.626);
  const [freq, setFreq] = createSignal(0);
  const [freqOffset, setFreqOffset] = createSignal(0);

  let audioCtx: AudioContext;
  let analyser: AnalyserNode;
  let stop = () => {};

  createEffect(() => {
    const frequency = freq();
    stop();
    if (frequency === 0) return;
    if (!audioCtx) {
      audioCtx = new window.AudioContext();
      analyser = audioCtx.createAnalyser();
      analyser.connect(audioCtx.destination);
      analyser.fftSize = 1024;

      // analyser.fftSize = 2048;
      // analyser.minDecibels = -80;
      // analyser.maxDecibels = -60;
      // analyser.smoothingTimeConstant = 0.3;
      analyser.smoothingTimeConstant = 0;
    }
    // const tickSound = makeTriangleWaveBuffer(audioCtx, frequency);
    const tickSound = makeSquareWaveBuffer(audioCtx, frequency);
    stop = startTicking(audioCtx, tickSound, frequency, analyser);
  });

  onCleanup(() => {
    stop();
    audioCtx?.close();
  });

  return (
    <div>
      <input
        type="range"
        class="w-full accent-indigo-500"
        min={1}
        max={512}
        step={2}
        value={freq()}
        onInput={(e) => {
          const frequency = e.currentTarget.valueAsNumber;
          setFreq(frequency);
        }}
      />
      <fieldset class="flex items-center gap-2">
        <For each={bits()}>
          {(bit, i) => (
            <input
              class="h-4 w-4 accent-indigo-500"
              type="checkbox"
              checked={bit}
              onChange={(e) => {
                setBits((prev) => {
                  const next = [...prev];
                  next[i()] = e.currentTarget.checked;
                  setFreq(bitsToInt(next));
                  return next;
                });
              }}
            />
          )}
        </For>
      </fieldset>
      <div class="h-32 w-full">
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
      </div>
    </div>
  );
}
