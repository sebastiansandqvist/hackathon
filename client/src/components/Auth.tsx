import { createSignal, Match, Show, Switch, type Component, type JSX, type ParentComponent } from 'solid-js';
import { mutate, trpc, invalidate, query, type RouterOutput } from '../trpc';
import { Button, ButtonPrimary, ButtonSecondary } from './Button';
import { Input } from './Input';

export function SignOutButton() {
  const logout = mutate(trpc.signOut, {
    onSettled() {
      invalidate('status');
    },
  });
  return (
    <Button onClick={() => logout.mutate()} disabled={logout.isPending}>
      sign out
    </Button>
  );
}

export function RerollAnonymousNameButton() {
  const reroll = mutate(trpc.changeAnonUsername, {
    onSettled() {
      invalidate('status');
      invalidate('homepage');
    },
  });
  return (
    <ButtonPrimary onClick={() => reroll.mutate()} disabled={reroll.isPending}>
      reroll
    </ButtonPrimary>
  );
}

export function AuthForm() {
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const authenticate = mutate(trpc.authenticate, {
    onError(err: Error) {
      alert(err.message ?? 'Unable to authenticate');
    },
    onSettled() {
      invalidate('status');
    },
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    authenticate.mutate({ username: username(), password: password() });
  };

  return (
    <div class="grid">
      <h2 class="font-pixel text-2xl leading-loose">sign in / up</h2>
      <form onSubmit={handleSubmit} class="flex gap-4">
        <Input
          classList={{ 'w-36': true }}
          type="text"
          placeholder="first name"
          disabled={authenticate.isPending}
          value={username()}
          onInput={(e) => setUsername(e.currentTarget.value.toLowerCase())}
        />
        <Input
          classList={{ 'w-64': true }}
          type="password"
          placeholder="a password you'll remember"
          disabled={authenticate.isPending}
          value={password()}
          onInput={(e) => setPassword(e.currentTarget.value)}
        />
        <ButtonPrimary type="submit" disabled={authenticate.isPending}>
          connect
        </ButtonPrimary>
      </form>
    </div>
  );
}

export const Authenticated: Component<{
  children: (status: RouterOutput['status'] & { isAuthed: true }) => JSX.Element;
}> = (props) => {
  const auth = query('status', trpc.status);
  return (
    <Switch>
      <Match when={auth.error} keyed>
        {(error) => <div>Error: {error.message ?? 'Unable to authenticate'}</div>}
      </Match>
      <Match when={auth.isLoading}>Loading...</Match>
      <Match when={auth.data?.isAuthed && auth.data} keyed>
        {(data) => props.children(data)}
      </Match>
    </Switch>
  );
};

export const Unauthenticated: ParentComponent = (props) => {
  const auth = query('status', trpc.status);
  return <Show when={auth.data?.isAuthed === false}>{props.children}</Show>;
};

export const NotTv: ParentComponent = (props) => {
  const auth = query('status', trpc.status);
  const isNotTv = () => !auth.data || auth.data.isAuthed === false || auth.data.username !== 'tv';
  return <Show when={isNotTv()}>{props.children}</Show>;
};

export const TvOnly: ParentComponent = (props) => {
  const auth = query('status', trpc.status);
  const isTv = () => auth.data?.isAuthed && auth.data.username === 'tv';
  return <Show when={isTv()}>{props.children}</Show>;
};
