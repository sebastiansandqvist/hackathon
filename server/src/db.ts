import type { FoodGame, Project, PublicMessage, User } from './types';
import { wait } from './util';

type Db = {
  users: User[];
  times: {
    codingStart: string;
    codingEnd: string;
    demoStart: string;
    demoEnd: string;
    votingStart: string;
    votingEnd: string;
  };
  foodGame: FoodGame;
  publicMessages: PublicMessage[];
  visibleSections: string[];
  projects: Project[];
};

let dbText = '';
try {
  const dbFile = Bun.file('./db.json');
  dbText = await dbFile.text();
} catch (err) {
  const seedDbState: Db = {
    users: [
      {
        anonymousName: 'tv',
        username: 'tv',
        id: '',
        password: '...',
        renameCounter: 0,
        hintDeductions: 0,
        sessions: [],
        sideQuests: {
          algorithms: { easy: null, hard: null },
          forensics: { easy: null, hard: null },
          graphics: { easy: null, hard: null },
          hacking: { easy: null, hard: null },
          logic: { easy: null, hard: null },
          puzzles: { easy: null, hard: null },
        },
        themeSuggestions: [],
      },
    ],
    visibleSections: [],
    times: {
      codingStart: new Date('2024-10-18T19:00:00.000-07:00').toISOString(),
      codingEnd: new Date('2024-10-20T15:00:00.000-07:00').toISOString(),
      demoStart: new Date('2024-10-20T15:30:00.000-07:00').toISOString(),
      demoEnd: new Date('2024-10-20T16:00:00.000-07:00').toISOString(),
      votingStart: new Date('2024-10-20T16:00:01.000-07:00').toISOString(),
      votingEnd: new Date('2024-10-20T16:30:00.000-07:00').toISOString(), // award ceremony begins at this time. but first: show stats. first completed entry. quest for the perfect anonymous username (first show the top renamed anon name, next slide show all the others and their counts). side quest stats. then end with top (3?) projects. powerpoint-like presentation.
    },
    foodGame: {
      title: 'Pick the hackathon theme',
      items: [
        'cooperation / asymmetry',
        'technologize your non-tech hobby',
        'impermanent',
        'limited information',
        'randomness',
      ],
    },
    publicMessages: [{ createdAt: Date.now(), text: 'Welcome!', userId: '' }],
    projects: [],
  };
  dbText = JSON.stringify(seedDbState, null, 2);
  await Bun.write('./db.json', dbText);
}

export const db = JSON.parse(dbText) as Db;

let lastDbState = dbText;
async function saveDbState() {
  const dbState = JSON.stringify(db, null, 2);
  if (lastDbState !== dbState) {
    lastDbState = dbState;
    console.log('Saving db state to disk');
    await Bun.write('./db.json', dbState);
  }
}

(async () => {
  async function saveDbLoop() {
    await saveDbState();
    await wait(500);
    return saveDbLoop();
  }
  await saveDbLoop();
})();

process.on('beforeExit', async () => {
  await saveDbState();
});
