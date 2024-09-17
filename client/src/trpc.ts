import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { createTRPCClient, httpBatchLink, type Resolver } from '@trpc/client';
import {
  createMutation,
  createQuery,
  QueryClient,
  type CreateMutateAsyncFunction,
  type CreateMutationOptions,
} from '@tanstack/solid-query';
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
    queries: { retry: 1 },
  },
});

export function mutate<
  Input extends {
    input: any;
    output: any;
    transformer: boolean;
    errorShape: any;
  },
>(
  { mutate }: { mutate: Resolver<Input> },
  options: ReturnType<CreateMutationOptions<Input['output'], Error, Parameters<typeof mutate>[0], Input['output']>>,
) {
  const mutation = createMutation(() => ({
    mutationFn: (data: Parameters<typeof mutate>[0]) => mutate(data),
    ...options,
  }));
  return mutation;
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
>(
  key: keyof typeof trpc,
  { query }: { query: Resolver<Input> },
  options?: {
    refetchInterval?: number;
  },
) {
  return createQuery(() => ({
    ...(options ?? {}),
    queryKey: [key],
    reconcile(oldData, newData) {
      if (JSON.stringify(oldData) === JSON.stringify(newData)) return oldData;
      return newData;
    },
    queryFn: (data: Parameters<typeof query>[0]) => query(data),
  }));
}
