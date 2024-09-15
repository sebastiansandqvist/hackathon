/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import { QueryClientProvider } from '@tanstack/solid-query';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { Logic } from './pages/sidequests/Logic';
import { Puzzles } from './pages/sidequests/Puzzles';
import { Hacking } from './pages/sidequests/Hacking';
import { Forensics } from './pages/sidequests/Forensics';
import { Algorithms } from './pages/sidequests/Algorithms';
import { queryClient } from './trpc';

import './main.css';

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Route path="/" component={Home} />
        {/* TODO: make a tv-specific version */}
        <Route path="/tv" component={Home} />
        <Route path="/algorithms" component={Algorithms} />
        <Route path="/forensics" component={Forensics} />
        <Route path="/hacking" component={Hacking} />
        <Route path="/logic" component={Logic} />
        <Route path="/puzzles" component={Puzzles} />
        <Route path="*404" component={NotFound} />
      </Router>
    </QueryClientProvider>
  ),
  document.getElementById('root')!,
);
