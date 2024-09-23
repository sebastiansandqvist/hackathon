/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import { QueryClientProvider } from '@tanstack/solid-query';
import { FlashMessageContainer, HomepageMessageFlasher } from './components/FlashMessage';
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
      <Chat />
      <HomepageMessageFlasher />
      <FlashMessageContainer />
    </QueryClientProvider>
  ),
  document.getElementById('root')!,
);
