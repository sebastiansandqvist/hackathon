import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { createTRPCClient, httpBatchLink, type Resolver } from '@trpc/client';
import { createMutation, createQuery, QueryClient, type CreateMutationOptions } from '@tanstack/solid-query';
import type { AppRouter } from '../../server/src/index';

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000',
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 0 },
  },
});

export function mutate<
  Input extends {
    input: any;
    output: any;
    transformer: boolean;
    errorShape: any;
  },
  Output,
>(
  { mutate }: { mutate: Resolver<Input> },
  options: ReturnType<CreateMutationOptions<Output, Error, Parameters<typeof mutate>[0], Output>>,
) {
  return createMutation(() => ({
    mutationFn: (data: Parameters<typeof mutate>[0]) => mutate(data),
    ...options,
  }));
}

export function invalidate(endpoint: keyof typeof trpc) {
  return queryClient.invalidateQueries({ queryKey: [endpoint] });
}

export function query<
  Input extends {
    input: any;
    output: any;
    transformer: boolean;
    errorShape: any;
  },
>(key: keyof typeof trpc, { query }: { query: Resolver<Input> }) {
  return createQuery(() => ({
    queryKey: [key],
    queryFn: (data: Parameters<typeof query>[0]) => query(data),
  }));
}
