import { createSignal, Show, type Component } from 'solid-js';
import { ButtonPrimary } from '../../../components/Button';
import { mutate, trpc, invalidate } from '../../../trpc';
import { useNavigate } from '@solidjs/router';
import { Input, MultiCharInput } from '../../../components/Input';
import { flashMessage } from '../../../components/FlashMessage';

export const AnswerForm: Component<{
  category: 'algorithms' | 'forensics' | 'graphics' | 'hacking' | 'logic' | 'puzzles';
  difficulty: 'easy' | 'hard';
  answerCharCount?: number;
}> = (props) => {
  const navigate = useNavigate();
  const [solution, setSolution] = createSignal('');
  const submitPuzzle = mutate(trpc.submitSolution, {
    onError(err: Error) {
      if (err.message === 'incorrect') {
        flashMessage('incorrect', 'red');
      } else {
        alert(err.message ?? 'Unable to submit solution');
      }
    },
    async onSuccess() {
      await flashMessage('correct!');
      invalidate('homepage');
      invalidate('status');
      if (props.difficulty === 'hard') {
        navigate('/');
      }
    },
  });
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    submitPuzzle.mutate({
      category: props.category,
      difficulty: props.difficulty,
      solution: solution(),
    });
  };
  return (
    <div>
      <form class="flex gap-4" onSubmit={handleSubmit}>
        <Show
          when={props.answerCharCount}
          fallback={<Input type="text" onInput={(e) => setSolution(e.currentTarget.value)} />}
        >
          <MultiCharInput chars={props.answerCharCount!} onInput={setSolution} />
        </Show>
        <ButtonPrimary type="submit" disabled={submitPuzzle.isPending}>
          submit <span class="font-dot not-italic">&gt;</span>
        </ButtonPrimary>
      </form>
    </div>
  );
};
