export type User = {
  id: string;
  username: string;
  anonymousName: string;
  password: string;
  sessions: { id: string; created: number }[];
  hintDeductions: number;
  sideQuests: {
    hacking: {
      easy: number | null; // timestamp of completion
      hard: number | null;
    };
    logic: {
      easy: number | null;
      hard: number | null;
    };
    forensics: {
      easy: number | null;
      hard: number | null;
    };
    puzzles: {
      easy: number | null;
      hard: number | null;
    };
    algorithms: {
      easy: number | null;
      hard: number | null;
      bigboy: number | null; // idea is that this will be a huge file that only an efficient algorithm and language can handle
    };
  };
  renameCounter: number;
};

export type PublicMessage = {
  userId: string;
  text: string;
  imgUrl?: string;
  createdAt: number;
};

export type Project = {
  primaryUserId: string;
  contributors: string[];
  projectUrl: string; // could be a github, website, etc.
  name: string;
  description: string;
  languages: string;
  votes: { userId: string; rank: number }[];
};

export type FoodGame = {
  title: string;
  items: string[];
};
