import { createSignal, Show, type Component } from 'solid-js';
import { ButtonPrimary } from '../../../components/Button';
import { mutate, trpc, invalidate } from '../../../trpc';
import { useNavigate } from '@solidjs/router';
import { MultiCharInput } from '../../../components/Input';

export const AnswerForm: Component<{
  category: 'algorithms' | 'forensics' | 'hacking' | 'logic' | 'puzzles';
  difficulty: 'easy' | 'hard';
  answerCharCount: number;
}> = (props) => {
  const navigate = useNavigate();
  const [solution, setSolution] = createSignal('');
  const submitPuzzle = mutate(trpc.submitSolution, {
    onError(err: Error) {
      alert(err.message ?? 'Unable to submit solution');
    },
    onSettled() {
      invalidate('homepage');
      invalidate('status');
    },
    onSuccess() {
      alert('correct!');
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
        <MultiCharInput chars={props.answerCharCount} onInput={setSolution} />
        <ButtonPrimary type="submit" disabled={submitPuzzle.isPending}>
          submit <span class="font-dot not-italic">&gt;</span>
        </ButtonPrimary>
      </form>
    </div>
  );
};
