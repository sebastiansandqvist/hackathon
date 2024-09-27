import { createSignal, onCleanup, For } from 'solid-js';

// const frequency = 261.626;

function makeNoiseBuffer(ctx: AudioContext) {
  // if buffer size is the sample rate, it's 1 second of noise
  const bufferSize = ctx.sampleRate * 0.001;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // fill the buffer with white noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

function tick(ctx: AudioContext, noiseBuffer: AudioBuffer) {
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  // Create an envelope
  const envelope = ctx.createGain();
  noise.connect(envelope);
  envelope.connect(ctx.destination);

  // Short "tick" envelope
  envelope.gain.setValueAtTime(1, ctx.currentTime);
  envelope.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.01);

  noise.start();
  noise.stop(ctx.currentTime + 0.01); // Stop the noise after 10ms
}

export function Synth() {
  const [bits, setBits] = createSignal([false, false, false, false, false, false, false, false, false, true]);
  const ctx = new window.AudioContext();
  const noise = makeNoiseBuffer(ctx);

  function startTicking() {
    const interval = setInterval(() => {
      tick(ctx, noise);
    }, 1000 / 10);
    return () => clearInterval(interval);
  }

  const bitsInt = () =>
    parseInt(
      bits()
        .map((bit) => (bit ? '1' : '0'))
        .join(''),
      2,
    );

  // const tickBuffer = createTickBuffer(audioContext);

  return (
    <div>
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
                  // stopTicking();
                  // startTicking();
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
