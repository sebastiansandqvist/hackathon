export type User = {
  id: string;
  username: string;
  anonymousName: string;
  password: string;
  sessions: { id: string; created: number }[];
  hintDeductions: number;
  sideQuests: {
    algorithms: { easy: number | null; hard: number | null };
    forensics: { easy: number | null; hard: number | null };
    graphics: { easy: number | null; hard: number | null };
    hacking: { easy: number | null; hard: number | null };
    logic: { easy: number | null; hard: number | null };
    puzzles: { easy: number | null; hard: number | null };
  };
  renameCounter: number;
};

export type PublicMessage = {
  userId: string;
  text: string;
  imgUrl?: string;
  createdAt: number;
};

export type FoodGame = {
  title: string;
  items: string[];
};

export type Project = {
  id: string;
  createdBy: string; // user id
  contributors: string[]; // user ids
  name: string;
  description: string;
  repoUrl: string;
  hostedUrl: string;
  votes: {
    userId: string;
    points: {
      creativity: number;
      experience: number;
      technicalMerit: number;
    };
  }[];
};
