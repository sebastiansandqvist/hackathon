import type { FoodGame, Message, Project, PublicMessage, User } from './types';
import { wait } from './util';
import { env } from './env';

type Db = {
  version: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  theme: string;
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
  themeIdeas: string[];
};

let dbText = '';
const dbFileLocation = env.NODE_ENV === 'development' ? './db.json' : '/var/data/db.json';
try {
  const dbFile = Bun.file(dbFileLocation);
  dbText = await dbFile.text();
} catch (err) {
  const seedDbState: Db = {
    version: 8,
    theme: '',
    users: [
      {
        anonymousName: 'tv',
        username: 'tv',
        id: '',
        password:
          '$argon2id$v=19$m=65536,t=2,p=1$M4yxGJORqjsv7OD9OztW4us21RftytMBhZZQfxjuQhs$7h7sPf+Ph0VHLgG+RVQ84aZD/4A+v8Lvd7d904VdOhc',
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
        themeRankings: [],
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
      title: '',
      items: [],
    },
    publicMessages: [{ createdAt: Date.now(), text: 'Welcome!', userId: '' }],
    projects: [],
    chat: [],
    themeIdeas: [
      'cooperation / asymmetry',
      'technologize your non-tech hobby',
      'impermanent',
      'limited information',
      'randomness',
    ],
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
  if (db.version === 3) {
    db.version = 4;
    db.theme = '';
    db.foodGame.title = '';
    db.foodGame.items = [];
    db.themeIdeas = [
      'cooperation / asymmetry',
      'technologize your non-tech hobby',
      'impermanent',
      'limited information',
      'randomness',
    ];
    db.users.forEach((user) => {
      user.themeRankings = [];
    });
  }
  if (db.version === 4) {
    db.version = 5;
    const tv = db.users.find((user) => user.username === 'tv');
    if (tv) {
      tv.password =
        '$argon2id$v=19$m=65536,t=2,p=1$M4yxGJORqjsv7OD9OztW4us21RftytMBhZZQfxjuQhs$7h7sPf+Ph0VHLgG+RVQ84aZD/4A+v8Lvd7d904VdOhc';
    }
  }
  if (db.version === 5) {
    db.version = 6;
    const sebIndex = db.users.findIndex((user) => user.username === 'tv');
    if (sebIndex !== -1) {
      db.users.splice(sebIndex, 1);
    }
  }
  if (db.version === 6) {
    db.version = 7;
    const sebIndex = db.users.findIndex((user) => user.username === 'seb');
    if (sebIndex !== -1) {
      db.users.splice(sebIndex, 1);
    }
  }
  if (db.version === 7) {
    db.version = 8;
    db.users.forEach((user) => {
      user.themeRankings = [];
    });
  }
  if (db.version === 8) {
    db.version = 9;
    const seb = db.users.find((user) => user.username === 'seb');
    if (seb) seb.hintDeductions = 18;
  }
  if (db.version === 9) {
    db.version = 10;
    db.times.welcome = new Date('2025-10-18T18:00:00.000-07:00').toISOString();
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
