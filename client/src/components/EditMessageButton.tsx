import { mutate, trpc, invalidate } from '../trpc';
import { ButtonSecondary } from './Button';

async function hash(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function isHardPasswordValid(password: string) {
  const hardPasswordHash = '86ec338bef79eba77f9326d228ab6878875ee2786c10e867005bd43d6e2e2f67';
  return (await hash(password)) === hardPasswordHash;
}

export function EditMessageButton() {
  const editMessage = mutate(trpc.hackThePublicMessage, {
    onError(err: Error) {
      alert(err.message ?? 'Unable to edit message');
    },
    onSettled() {
      invalidate('homepage');
      invalidate('status');
    },
  });

  const handleClick = async () => {
    const password = prompt('enter the password');
    if (!password) return;

    const easyPassword = 'supersecretlol';
    const redHerring = '1350';
    if (password !== easyPassword && password !== redHerring && !(await isHardPasswordValid(password))) {
      return alert('incorrect password');
    }

    const text = prompt('enter message');
    if (!text) {
      return alert('message cannot be empty');
    }

    try {
      await editMessage.mutateAsync({ password, text });
    } catch (err) {
      /* we expect an error here for the red herring password */
    }

    if (password === redHerring) {
      window.location.href = 'https://en.wikipedia.org/wiki/Red_herring';
    }
  };

  return (
    <ButtonSecondary onClick={handleClick} disabled={editMessage.isPending}>
      edit message
    </ButtonSecondary>
  );
}
