import { Show } from 'solid-js';
import { A } from '@solidjs/router';
import { Authenticated, Unauthenticated, ButtonPrimary, Layout, Title, Uppercase } from '~/components';
import { AnswerForm } from './components/AnswerForm';

function EasyForensics() {
  return (
    <>
      <Title>Forensics – Part 1</Title>
      <Uppercase>image analysis:</Uppercase>
      <p class="text-indigo-100">on what island was this picture taken?</p>
      <img src="/images/holmes.jpg" class="w-[400px] max-w-full" />
    </>
  );
}

export function Forensics() {
  return (
    <Layout>
      <div class="grid gap-4">
        <Unauthenticated>
          <EasyForensics />
          <AnswerForm answerCharCount={4} difficulty="easy" category="forensics" />
          <>
            <hr class="border-indigo-500/30" />
            <Title>Forensics – Part 2</Title>
            <Uppercase>Background:</Uppercase>
            <p class="text-indigo-100">
              there is secret loot hidden somewhere in the house. where? the answer is hidden in this image using{' '}
              <a href="https://en.wikipedia.org/wiki/Steganography" class="underline transition hover:text-white">
                steganography
              </a>
              .
            </p>
            <img src="/images/poirot.bmp" class="pixelated w-[400px] max-w-full" />
            <Uppercase>vital info:</Uppercase>
            <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
              <li>it's an 8-bit .bmp image</li>
              <li>the first 54 bytes are the image header. ignore them.</li>
              <li>
                the remaining bytes are the image data. the message is hidden in the first 55 bytes (440 bits) of image
                data.
              </li>
              <li>you'll need to convert those bits to a string.</li>
            </ul>
            <Uppercase>to solve this challenge:</Uppercase>
            <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
              <li>read the image data into a Uint8Array</li>
              <li>skip over the header bytes</li>
              <li>
                from the relevant image data bytes, extract the least significant bits. for example:
                <pre class="italic text-indigo-300">
                  <code>
                    {`
function extractLSBs(data: Uint8Array, bitCount: number) {
const bits: number[] = [];
for (let i = 0; i < bitCount; i++) {
  const bit = data[i] & 1;
  bits.push(bit);
}
return bits;
}`}
                  </code>
                </pre>
              </li>
              <li>
                convert the bits to a string. for example:
                <pre class="italic text-indigo-300">
                  <code>
                    {`
function bitsToString(bits: number[]) {
let result = '';
for (let i = 0; i < bits.length; i += 8) {
  const byteBits = bits.slice(i, i + 8);
  const byte = bitsToByte(byteBits);
  result += String.fromCharCode(byte);
}
return result;
}

function bitsToByte(bits: number[]) {
let byte = 0;
for (let i = 0; i < bits.length; i++) {
  byte = (byte << 1) | bits[i];
}
return byte;
}`}
                  </code>
                </pre>
              </li>
              <li>enter the final word from the decoded message below</li>
            </ul>
            <AnswerForm answerCharCount={9} difficulty="hard" category="forensics" />
          </>
        </Unauthenticated>
        <Authenticated>
          {({ sideQuests }) => (
            <>
              <Show when={sideQuests.forensics.hard || !sideQuests.forensics.easy}>
                <EasyForensics />
                <Show when={sideQuests.forensics.easy}>
                  <hr class="border-indigo-500/30" />
                </Show>
              </Show>
              <Show
                when={sideQuests.forensics.easy}
                fallback={<AnswerForm answerCharCount={4} difficulty="easy" category="forensics" />}
              >
                <Title>Forensics – Part 2</Title>
                <Uppercase>Background:</Uppercase>
                <p class="text-indigo-100">
                  there is secret loot hidden somewhere in the house. where? the answer is hidden in this image using{' '}
                  <a href="https://en.wikipedia.org/wiki/Steganography" class="underline transition hover:text-white">
                    steganography
                  </a>
                  .
                </p>
                <img src="/images/poirot.bmp" class="pixelated w-[400px] max-w-full" />
                <Uppercase>vital info:</Uppercase>
                <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
                  <li>it's an 8-bit .bmp image</li>
                  <li>the first 54 bytes are the image header. ignore them.</li>
                  <li>
                    the remaining bytes are the image data. the message is hidden in the first 55 bytes (440 bits) of
                    image data.
                  </li>
                  <li>you'll need to convert those bits to a string.</li>
                </ul>
                <Uppercase>to solve this challenge:</Uppercase>
                <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
                  <li>read the image data into a Uint8Array</li>
                  <li>skip over the header bytes</li>
                  <li>
                    from the relevant image data bytes, extract the least significant bits. for example:
                    <pre class="italic text-indigo-300">
                      <code>
                        {`
function extractLSBs(data: Uint8Array, bitCount: number) {
  const bits: number[] = [];
  for (let i = 0; i < bitCount; i++) {
    const bit = data[i] & 1;
    bits.push(bit);
  }
  return bits;
}`}
                      </code>
                    </pre>
                  </li>
                  <li>
                    convert the bits to a string. for example:
                    <pre class="italic text-indigo-300">
                      <code>
                        {`
function bitsToString(bits: number[]) {
  let result = '';
  for (let i = 0; i < bits.length; i += 8) {
    const byteBits = bits.slice(i, i + 8);
    const byte = bitsToByte(byteBits);
    result += String.fromCharCode(byte);
  }
  return result;
}

function bitsToByte(bits: number[]) {
  let byte = 0;
  for (let i = 0; i < bits.length; i++) {
    byte = (byte << 1) | bits[i];
  }
  return byte;
}`}
                      </code>
                    </pre>
                  </li>
                  <li>enter the final word from the decoded message below</li>
                </ul>
                <Show when={!sideQuests.forensics.hard}>
                  <AnswerForm answerCharCount={9} difficulty="hard" category="forensics" />
                </Show>
              </Show>
            </>
          )}
        </Authenticated>
      </div>

      <footer class="border-t border-indigo-500/30 pt-8">
        <A href="/">
          <ButtonPrimary>
            <span class="font-dot not-italic">&lt;</span> back
          </ButtonPrimary>
        </A>
      </footer>
    </Layout>
  );
}
