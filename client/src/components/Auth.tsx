import {
  createEffect,
  createSignal,
  For,
  Match,
  Show,
  Switch,
  type Component,
  type JSX,
  type ParentComponent,
} from 'solid-js';
import { mutate, trpc, invalidate, query, type RouterOutput } from '../trpc';
import { Button, ButtonPrimary } from './Button';
import { Input } from './Input';
import { flashMessage } from './FlashMessage';

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

const BitInput: Component<{
  disabled: boolean;
  onStateChange: (valid: boolean) => void;
}> = (props) => {
  const bitsAmount = 8;
  const randomNumber = Math.floor(Math.random() * 50 + 50);
  const [bitState, setBitState] = createSignal(Array.from({ length: bitsAmount }, () => false));
  const bitStateNumber = () =>
    parseInt(
      bitState()
        .map((bit) => (bit ? '1' : '0'))
        .join(''),
      2,
    );

  const bitsMatchNumber = () => bitStateNumber() === randomNumber;

  createEffect(() => {
    if (bitsMatchNumber()) {
      flashMessage('hacker');
    }
  });

  return (
    <div class="flex flex-wrap items-center gap-4">
      <p class="text-indigo-200">
        Enter{' '}
        <data
          class="font-bold"
          classList={{
            'text-white': !bitsMatchNumber(),
            'text-emerald-400': bitsMatchNumber(),
          }}
        >
          {randomNumber}
        </data>{' '}
        to prove you are a hacker:
      </p>
      <fieldset class="flex items-center gap-2">
        <For each={bitState()}>
          {(bit, i) => (
            <input
              class="h-4 w-4 accent-indigo-500"
              type="checkbox"
              disabled={props.disabled}
              checked={bit}
              onChange={(e) => {
                setBitState((prev) => {
                  const next = [...prev];
                  next[i()] = e.currentTarget.checked;
                  return next;
                });
                props.onStateChange(bitsMatchNumber());
              }}
            />
          )}
        </For>
        <p>
          ={' '}
          <output
            class="font-bold"
            classList={{
              'text-white': !bitsMatchNumber(),
              'text-emerald-400': bitsMatchNumber(),
            }}
          >
            {bitStateNumber()}
          </output>
        </p>
      </fieldset>
    </div>
  );
};

export function AuthForm() {
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [inviteCode, setInviteCode] = createSignal('');
  const [bitsAreValid, setBitsAreValid] = createSignal(false);

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
    alert('The hackathon has ended and registration is now closed. Consider joining us next year!');
    // authenticate.mutateAsync({
    //   username: username(),
    //   password: password(),
    // });
  };

  const isSubmitDisabled = () => !bitsAreValid() || authenticate.isPending || !username() || !password();

  return (
    <div class="grid">
      <h2 class="font-pixel text-2xl leading-loose">register / log in</h2>
      <form onSubmit={handleSubmit} class="grid gap-4">
        <div class="flex flex-wrap gap-4">
          <Input
            class="w-36"
            type="text"
            placeholder="first name"
            disabled={authenticate.isPending}
            value={username()}
            onInput={(e) => setUsername(e.currentTarget.value.toLowerCase())}
          />
          <Input
            class="w-64"
            type="password"
            placeholder="a password you'll remember"
            disabled={authenticate.isPending}
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
          />
          {/* <Input
            class="w-28"
            type="text"
            placeholder="invite code"
            disabled={authenticate.isPending}
            value={inviteCode()}
            onInput={(e) => setInviteCode(e.currentTarget.value)}
          /> */}
        </div>
        <BitInput disabled={authenticate.isPending} onStateChange={(valid) => setBitsAreValid(valid)} />
        <div>
          <ButtonPrimary type="submit" disabled={isSubmitDisabled()}>
            submit
          </ButtonPrimary>
        </div>
      </form>
    </div>
  );
}

export const Authenticated: Component<{
  children: JSX.Element | ((status: RouterOutput['status'] & { isAuthed: true }) => JSX.Element);
}> = (props) => {
  const auth = query('status', trpc.status);

  return (
    <Switch>
      <Match when={auth.error} keyed>
        {(error) => <div>Error: {error.message ?? 'Unable to authenticate'}</div>}
      </Match>
      <Match when={auth.isLoading}>Loading...</Match>
      <Match when={auth.data?.isAuthed && auth.data} keyed>
        {(data) => (typeof props.children === 'function' ? props.children(data) : props.children)}
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
