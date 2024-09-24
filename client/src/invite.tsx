/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import { QueryClientProvider } from '@tanstack/solid-query';
import { Authenticated, FlashMessageContainer, HomepageMessageFlasher } from '~/components';
import { Invitation } from './pages/Invitation';
import { NotFound } from './pages/NotFound';
import { Chat } from './chat/Chat';
import { queryClient } from './trpc';

import './main.css';

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Route path="/" component={Invitation} />
        <Route path="*404" component={NotFound} />
      </Router>
      <Authenticated>
        <Chat />
      </Authenticated>
      <HomepageMessageFlasher />
      <FlashMessageContainer />
    </QueryClientProvider>
  ),
  document.getElementById('root')!,
);
