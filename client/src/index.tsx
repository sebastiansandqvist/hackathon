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
import { Vote } from './pages/Vote';
import { Results } from './pages/Results';
import { SubmitProject } from './pages/SubmitProject';
import { ProjectList } from './pages/ProjectList';
import { Project } from './pages/Project';
import { queryClient } from './trpc';

import './main.css';

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Route path="/" component={Home} />
        <Route path="/algorithms" component={Algorithms} />
        <Route path="/forensics" component={Forensics} />
        <Route path="/hacking" component={Hacking} />
        <Route path="/logic" component={Logic} />
        <Route path="/puzzles" component={Puzzles} />
        <Route path="/vote" component={Vote} />
        <Route path="/results" component={Results} />
        <Route path="/submit" component={SubmitProject} />
        <Route path="/projects" component={ProjectList} />
        <Route path="/projects/:id" component={Project} />
        <Route path="*404" component={NotFound} />
      </Router>
    </QueryClientProvider>
  ),
  document.getElementById('root')!,
);
