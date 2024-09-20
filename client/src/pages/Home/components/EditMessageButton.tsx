import { mutate, trpc, invalidate } from '../../../trpc';
import { ButtonSecondary, ButtonSecondaryAlt } from '../../../components/Button';
import { flashMessage } from '../../../components/FlashMessage';

export function EditMessageButton() {
  const editMessage = mutate(trpc.hackThePublicMessage, {
    onError(err) {
      flashMessage(err.message ?? 'unexpected error');
    },
    onSettled() {
      invalidate('homepage');
      invalidate('status');
    },
  });

  const handleClick = async () => {
    const input = prompt('enter password');
    if (!input) return;

    const password = 'supersecretlol';
    if (input !== password) {
      return flashMessage('ACCESS DENIED', 'red');
    }

    const text = prompt('enter message');
    if (!text) return;

    editMessage.mutate({ password: input, text });
  };

  return (
    <ButtonSecondary onClick={handleClick} disabled={editMessage.isPending}>
      edit message
    </ButtonSecondary>
  );
}

async function hash(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function isAdminPasswordValid(password: string) {
  const adminPasswordHash = '86ec338bef79eba77f9326d228ab6878875ee2786c10e867005bd43d6e2e2f67';
  return (await hash(password)) === adminPasswordHash;
}

export function EditMessageImageButton() {
  const editImage = mutate(trpc.hackThePublicMessageImage, {
    onError(err) {
      flashMessage(err.message ?? 'unexpected error', 'red');
    },
    onSettled() {
      invalidate('homepage');
      invalidate('status');
    },
  });

  const handleClick = async () => {
    const input = prompt('enter admin password');
    if (!input) return;

    if (!(await isAdminPasswordValid(input))) {
      return flashMessage('ACCESS DENIED', 'red');
    }

    const imageUrl = prompt('enter image url');
    if (!imageUrl) return;

    editImage.mutate({ password: input, imageUrl });
  };

  return (
    <ButtonSecondaryAlt onClick={handleClick} disabled={editImage.isPending}>
      edit image
    </ButtonSecondaryAlt>
  );
}
