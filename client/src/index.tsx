/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import { QueryClientProvider } from '@tanstack/solid-query';
import { FlashMessageContainer, HomepageMessageFlasher } from './components/FlashMessage';
import { Home } from './pages/Home';
import { Invitation } from './pages/Invitation';
import { NotFound } from './pages/NotFound';
import { Logic } from './pages/sidequests/Logic';
import { Puzzles } from './pages/sidequests/Puzzles';
import { Hacking } from './pages/sidequests/Hacking';
import { Forensics } from './pages/sidequests/Forensics';
import { Graphics } from './pages/sidequests/Graphics';
import { Algorithms } from './pages/sidequests/Algorithms';
import { Vote } from './pages/Vote';
import { Results } from './pages/Results';
import { SubmitProject } from './pages/SubmitProject';
import { ProjectList } from './pages/ProjectList';
import { Project } from './pages/Project';
import { Chat } from './chat/Chat';
import { queryClient } from './trpc';

import './main.css';

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Route path="/" component={Home} />
        <Route path="/invitation" component={Invitation} />
        <Route path="/algorithms" component={Algorithms} />
        <Route path="/forensics" component={Forensics} />
        <Route path="/graphics" component={Graphics} />
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
      <Chat />
      <HomepageMessageFlasher />
      <FlashMessageContainer />
    </QueryClientProvider>
  ),
  document.getElementById('root')!,
);
