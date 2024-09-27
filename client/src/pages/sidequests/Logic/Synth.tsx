import { createSignal, onCleanup, For, createEffect } from 'solid-js';
import { Canvas } from '~/components';

// let frequency = 261.626; // Middle C frequency
// setInterval(() => {
//   frequency *= 2;
// }, 1000);

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

function tick(ctx: AudioContext, noiseBuffer: AudioBuffer, startTime: number) {
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const envelope = ctx.createGain();
  noise.connect(envelope);
  envelope.connect(ctx.destination);

  envelope.gain.setValueAtTime(0.3, startTime);
  envelope.gain.exponentialRampToValueAtTime(0.01, startTime + 0.001);

  noise.start(startTime);
  noise.stop(startTime + 0.001);
}

function startTicking(ctx: AudioContext, noiseBuffer: AudioBuffer, frequency: number) {
  let nextTickTime = ctx.currentTime;
  let frame: number;

  function scheduleTicks() {
    while (nextTickTime < ctx.currentTime + 0.1) {
      // Schedule ahead for 100ms
      tick(ctx, noiseBuffer, nextTickTime);
      nextTickTime += 1 / frequency;
    }

    // Use requestAnimationFrame for continuous scheduling
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
      analyser.fftSize = 256;
      // analyser.minDecibels = -100;
      // analyser.maxDecibels = -30;
      // analyser.smoothingTimeConstant = 1;
      console.log(analyser.frequencyBinCount);
    }
    const tickSound = makeSquareWaveBuffer(audioCtx, frequency);
    stop = startTicking(audioCtx, tickSound, frequency);
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
          draw={(canvas, ctx) => {
            const rect = canvas.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);

            if (!analyser) return;

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, rect.width, rect.height);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            // analyser.getByteFrequencyData(dataArray);
            analyser.getByteTimeDomainData(dataArray);

            const barWidth = (rect.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
              barHeight = dataArray[i]! / 2;

              ctx.fillStyle = `rgb(${barHeight + 100} 50 50)`;
              ctx.fillRect(x, rect.height - barHeight / 2, barWidth, barHeight);

              x += barWidth + 1;
            }
          }}
        />
      </div>
    </div>
  );
}
