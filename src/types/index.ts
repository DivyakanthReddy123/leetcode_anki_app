export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type ReviewState = 'new' | 'learning' | 'review';

export type Rating = 'Again' | 'Hard' | 'Good' | 'Easy';

export type Deck = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type Card = {
  id: string;
  deckId: string;
  title: string;
  difficulty: Difficulty;
  prompt: string;
  solution: string;
  tags: string[];
  flag?: string | null;
  isDeleted?: boolean;

  reviewState?: ReviewState;
  dueAt?: string | null;
  intervalDays?: number;
  easeFactor?: number;
  reviewCount?: number;

  createdAt?: string;
  updatedAt?: string;
};

export type Review = {
  id: string;
  cardId: string;
  deckId: string;
  rating: Rating;
  reviewedAt: string;

  previousDueAt?: string | null;
  nextDueAt?: string | null;

  previousIntervalDays?: number;
  nextIntervalDays?: number;

  previousEaseFactor?: number;
  nextEaseFactor?: number;

  previousReviewState?: ReviewState;
  nextReviewState?: ReviewState;
};

export type AppSettings = {
  dailyGoal: number;
};

export type AppData = {
  decks: Deck[];
  cards: Card[];
  reviews: Review[];
  settings: AppSettings;
};

export type DeckImport = {
  deck: {
    id?: string;
    name: string;
    description?: string;
  };
  cards: Array<{
    id?: string;
    title: string;
    difficulty: Difficulty;
    prompt: string;
    solution: string;
    tags?: string[];
  }>;
};