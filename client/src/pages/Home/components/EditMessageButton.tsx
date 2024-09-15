import { useNavigate } from '@solidjs/router';
import { mutate, trpc, invalidate } from '../../../trpc';
import { ButtonSecondary } from '../../../components/Button';

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

export function EditMessageButton() {
  const editMessage = mutate(trpc.hackThePublicMessage, {
    onError(err) {
      alert(err.message ?? 'Unable to edit message');
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
      return alert('incorrect password');
    }

    const text = prompt('enter message');
    if (!text) return;

    const result = await editMessage.mutateAsync({ password: input, text });
    // if (result.redirect) {
    //   window.location.href = result.redirect;
    // }
  };

  return (
    <ButtonSecondary onClick={handleClick} disabled={editMessage.isPending}>
      edit message
    </ButtonSecondary>
  );
}

export function AdminEditMessageButton() {
  const editMessage = mutate(trpc.hackThePublicMessage, {
    onError(err) {
      alert(err.message ?? 'Unable to edit message');
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
      return alert('incorrect admin password');
    }

    const text = prompt('enter message');
    if (!text) return;

    await editMessage.mutateAsync({ password: input, text });
  };

  return (
    <ButtonSecondary onClick={handleClick} disabled={editMessage.isPending}>
      edit image
    </ButtonSecondary>
  );
}
