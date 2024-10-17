import type { FoodGame, Message, Project, PublicMessage, User } from './types';
import { wait } from './util';
import { env } from './env';

type Db = {
  version: 1 | 2 | 3;
  users: User[];
  times: {
    welcome: string;
    themeSelection: string;
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
  chat: Message[];
};

let dbText = '';
const dbFileLocation = env.NODE_ENV === 'development' ? './db.json' : '/var/data/db.json';
try {
  const dbFile = Bun.file(dbFileLocation);
  dbText = await dbFile.text();
} catch (err) {
  const seedDbState: Db = {
    version: 3,
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
      welcome: new Date('2024-10-18T18:00:00.000-07:00').toISOString(),
      themeSelection: new Date('2024-10-18T19:00:00.000-07:00').toISOString(),
      codingStart: new Date('2024-10-18T20:00:00.000-07:00').toISOString(),
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
    chat: [],
  };
  dbText = JSON.stringify(seedDbState, null, 2);
  await Bun.write(dbFileLocation, dbText);
}

export const db = JSON.parse(dbText) as Db;

(function migration() {
  if (db.version === 1) {
    db.version = 2;
    db.chat = [];
  }
  if (db.version === 2) {
    db.version = 3;
    db.times.welcome = new Date('2024-10-18T18:00:00.000-07:00').toISOString();
    db.times.themeSelection = new Date('2024-10-18T19:00:00.000-07:00').toISOString();
    db.times.codingStart = new Date('2024-10-18T20:00:00.000-07:00').toISOString();
  }
})();

let lastDbState = dbText;
async function saveDbState() {
  const dbState = JSON.stringify(db, null, 2);
  if (lastDbState !== dbState) {
    lastDbState = dbState;
    console.log('Saving db state to disk');
    await Bun.write(dbFileLocation, dbState);
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
