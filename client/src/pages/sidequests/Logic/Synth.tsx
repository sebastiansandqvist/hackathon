import { createSignal, onCleanup, For, createEffect } from 'solid-js';
import { Canvas } from '~/components';

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

function tick(ctx: AudioContext, noiseBuffer: AudioBuffer, startTime: number, analyser: AnalyserNode) {
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const envelope = ctx.createGain();
  noise.connect(envelope);
  envelope.connect(analyser);
  analyser.connect(ctx.destination);

  envelope.gain.setValueAtTime(0.3, startTime);
  envelope.gain.exponentialRampToValueAtTime(0.005, startTime + 0.001);

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

export function Synth() {
  const [bits, setBits] = createSignal([false, false, false, false, false, false, false, false, false]);
  // const noiseBuffer = makeNoiseBuffer(ctx);
  // const noiseBuffer = makeSineWaveBuffer(ctx, 261.626);
  const [freq, setFreq] = createSignal(0);

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
      analyser.fftSize = 2048;
      // analyser.minDecibels = -80;
      analyser.maxDecibels = -60;
      analyser.smoothingTimeConstant = 0.4;
    }
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
        class="w-full"
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

            const dataArray = dataArrayOriginal.slice(300, 1200);
            const sliceWidth = canvas.width / dataArray.length;
            let x = 0;

            const max = Math.max(...dataArray);
            const min = Math.min(...dataArray);

            function scale(min: number, max: number, value: number) {
              return (value - min) / (max - min);
            }

            for (let i = 0; i < bufferLength; i++) {
              const v = scale(min, max, dataArray[i]!);
              const y = v * rect.height;

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }

              x += sliceWidth;
            }

            ctx.stroke();
          }}
        />
      </div>
    </div>
  );
}
