import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { seedData } from '../data/seedProblems';
import type { AppData, Card, Deck, DeckImport, Difficulty, Rating, Review, ReviewState } from '../types';

const STORAGE_KEY = 'leetcode-anki-app-data-v4';

type AddCardInput = {
  deckId: string;
  title: string;
  difficulty: Difficulty;
  prompt: string;
  solution: string;
  tags: string[];
};

type AppDataContextValue = {
  data: AppData;
  activeCards: Card[];
  updateCard: (id: string, patch: Partial<Card>) => void;
  addCard: (input: AddCardInput) => void;
  deleteCard: (id: string) => void;
  deleteDeck: (deckId: string) => void;
  rateCard: (id: string, rating: Rating) => Review | null;
  undoReview: (reviewId: string) => void;
  importDeck: (payload: DeckImport) => { imported: number; deckName: string };
  importBackup: (payload: AppData) => void;
  exportData: () => void;
  reset: () => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

function safeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `deck-${Date.now()}`;
}

function makeId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeData(raw: unknown): AppData {
  const fallback = seedData;

  if (!raw || typeof raw !== 'object') {
    return fallback;
  }

  const maybe = raw as Partial<AppData>;

  const now = new Date().toISOString();

  const cards = Array.isArray(maybe.cards)
    ? maybe.cards.map(card => ({
        ...card,
        tags: Array.isArray(card.tags) ? card.tags : [],
        isDeleted: card.isDeleted ?? false,
        reviewState: card.reviewState ?? 'new',
        dueAt: card.dueAt ?? null,
        intervalDays: card.intervalDays ?? 0,
        easeFactor: card.easeFactor ?? 2.5,
        reviewCount: card.reviewCount ?? 0,
        createdAt: card.createdAt ?? card.updatedAt ?? now,
        updatedAt: card.updatedAt ?? now,
      }))
    : fallback.cards;

  let decks: Deck[] = Array.isArray(maybe.decks)
    ? maybe.decks.map(deck => ({
        ...deck,
        createdAt: deck.createdAt ?? now,
        updatedAt: deck.updatedAt ?? now,
      }))
    : [];

  if (!decks.length) {
    const deckMap = new Map<string, Deck>();

    cards.forEach(card => {
      if (!deckMap.has(card.deckId)) {
        deckMap.set(card.deckId, {
          id: card.deckId,
          name:
            card.deckId === 'arrays' ? 'Arrays & Hashing' :
            card.deckId === 'trees' ? 'Trees & Graphs' :
            card.deckId === 'dp' ? 'Dynamic Programming' :
            card.deckId === 'slide' ? 'Sliding Window' :
            card.deckId === 'binary' ? 'Binary Search' :
            card.deckId,
          createdAt: now,
          updatedAt: now,
        });
      }
    });

    decks = Array.from(deckMap.values());
  }

  return {
    decks,
    cards,
    reviews: Array.isArray(maybe.reviews) ? maybe.reviews : [],
    settings: {
      dailyGoal: maybe.settings?.dailyGoal ?? 20,
    },
  };
}

function calculateNextSchedule(card: Card, rating: Rating) {
  const now = new Date();
  const ease = card.easeFactor ?? 2.5;
  const interval = card.intervalDays ?? 0;

  let nextEase = ease;
  let nextInterval = interval;
  let nextState: ReviewState = card.reviewState ?? 'new';

  if (rating === 'Again') {
    nextEase = Math.max(1.3, ease - 0.2);
    nextInterval = 0;
    nextState = 'learning';
    now.setMinutes(now.getMinutes() + 1);
  }

  if (rating === 'Hard') {
    nextEase = Math.max(1.3, ease - 0.15);
    nextInterval = Math.max(1, Math.round(interval * 1.2) || 1);
    nextState = 'learning';
    now.setMinutes(now.getMinutes() + 10);
  }

  if (rating === 'Good') {
    nextEase = ease;
    nextInterval = Math.max(1, Math.round(interval * ease) || 1);
    nextState = 'review';
    now.setDate(now.getDate() + nextInterval);
  }

  if (rating === 'Easy') {
    nextEase = ease + 0.15;
    nextInterval = Math.max(4, Math.round((interval || 1) * (ease + 0.5)));
    nextState = 'review';
    now.setDate(now.getDate() + nextInterval);
  }

  return {
    dueAt: now.toISOString(),
    intervalDays: nextInterval,
    easeFactor: nextEase,
    reviewState: nextState,
  };
}

function validateDeckImport(payload: DeckImport) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid JSON file.');
  }

  if (!payload.deck?.name) {
    throw new Error('Deck import must include deck.name.');
  }

  if (!Array.isArray(payload.cards) || payload.cards.length === 0) {
    throw new Error('Deck import must include at least one card.');
  }

  payload.cards.forEach((card, index) => {
    if (!card.title) throw new Error(`Card ${index + 1} is missing title.`);
    if (!card.prompt) throw new Error(`Card ${index + 1} is missing prompt.`);
    if (!card.solution) throw new Error(`Card ${index + 1} is missing solution.`);
    if (!['Easy', 'Medium', 'Hard'].includes(card.difficulty)) {
      throw new Error(`Card ${index + 1} has invalid difficulty.`);
    }
  });
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? normalizeData(JSON.parse(saved)) : seedData;
    } catch {
      return seedData;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const activeCards = useMemo(() => {
    return data.cards.filter(card => !card.isDeleted);
  }, [data.cards]);

  function updateCard(id: string, patch: Partial<Card>) {
    setData(prev => ({
      ...prev,
      cards: prev.cards.map(card =>
        card.id === id
          ? {
              ...card,
              ...patch,
              updatedAt: new Date().toISOString(),
            }
          : card
      ),
    }));
  }

  function addCard(input: AddCardInput) {
    const now = new Date().toISOString();

    const newCard: Card = {
      id: makeId(input.deckId),
      deckId: input.deckId,
      title: input.title,
      difficulty: input.difficulty,
      prompt: input.prompt,
      solution: input.solution,
      tags: input.tags,
      flag: null,
      isDeleted: false,
      reviewState: 'new',
      dueAt: null,
      intervalDays: 0,
      easeFactor: 2.5,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    setData(prev => ({
      ...prev,
      cards: [newCard, ...prev.cards],
      decks: prev.decks.map(deck =>
        deck.id === input.deckId
          ? { ...deck, updatedAt: now }
          : deck
      ),
    }));
  }

  function deleteCard(id: string) {
    updateCard(id, { isDeleted: true });
  }

  function deleteDeck(deckId: string) {
    setData(prev => ({
      ...prev,
      decks: prev.decks.filter(deck => deck.id !== deckId),
      cards: prev.cards.filter(card => card.deckId !== deckId),
      reviews: prev.reviews.filter(review => review.deckId !== deckId),
    }));
  }

  function rateCard(id: string, rating: Rating) {
    let createdReview: Review | null = null;

    setData(prev => {
      const card = prev.cards.find(c => c.id === id);
      if (!card) return prev;

      const schedule = calculateNextSchedule(card, rating);

      createdReview = {
        id: makeId('review'),
        cardId: card.id,
        deckId: card.deckId,
        rating,
        reviewedAt: new Date().toISOString(),

        previousDueAt: card.dueAt ?? null,
        nextDueAt: schedule.dueAt,

        previousIntervalDays: card.intervalDays ?? 0,
        nextIntervalDays: schedule.intervalDays,

        previousEaseFactor: card.easeFactor ?? 2.5,
        nextEaseFactor: schedule.easeFactor,

        previousReviewState: card.reviewState ?? 'new',
        nextReviewState: schedule.reviewState,
      };

      return {
        ...prev,
        cards: prev.cards.map(c =>
          c.id === id
            ? {
                ...c,
                ...schedule,
                reviewCount: (c.reviewCount ?? 0) + 1,
                updatedAt: new Date().toISOString(),
              }
            : c
        ),
        reviews: [createdReview, ...prev.reviews],
      };
    });

    return createdReview;
  }

  function undoReview(reviewId: string) {
    setData(prev => {
      const review = prev.reviews.find(r => r.id === reviewId);
      if (!review) return prev;

      return {
        ...prev,
        reviews: prev.reviews.filter(r => r.id !== reviewId),
        cards: prev.cards.map(card =>
          card.id === review.cardId
            ? {
                ...card,
                dueAt: review.previousDueAt ?? null,
                intervalDays: review.previousIntervalDays ?? 0,
                easeFactor: review.previousEaseFactor ?? 2.5,
                reviewState: review.previousReviewState ?? 'new',
                reviewCount: Math.max(0, (card.reviewCount ?? 1) - 1),
                updatedAt: new Date().toISOString(),
              }
            : card
        ),
      };
    });
  }

  function importDeck(payload: DeckImport) {
    validateDeckImport(payload);

    const now = new Date().toISOString();
    const deckId = safeSlug(payload.deck.id ?? payload.deck.name);

    const deck: Deck = {
      id: deckId,
      name: payload.deck.name,
      description: payload.deck.description ?? '',
      createdAt: now,
      updatedAt: now,
    };

    const cards: Card[] = payload.cards.map(card => ({
      id: card.id ? `${deckId}-${safeSlug(card.id)}` : makeId(deckId),
      deckId,
      title: card.title,
      difficulty: card.difficulty,
      prompt: card.prompt,
      solution: card.solution,
      tags: card.tags ?? [],
      flag: null,
      isDeleted: false,
      reviewState: 'new',
      dueAt: null,
      intervalDays: 0,
      easeFactor: 2.5,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    }));

    setData(prev => {
      const withoutSameDeck = prev.decks.filter(d => d.id !== deckId);
      const existingCardIds = new Set(prev.cards.map(card => card.id));

      const uniqueCards = cards.map(card => ({
        ...card,
        id: existingCardIds.has(card.id) ? makeId(deckId) : card.id,
      }));

      return {
        ...prev,
        decks: [deck, ...withoutSameDeck],
        cards: [...uniqueCards, ...prev.cards],
      };
    });

    return {
      imported: cards.length,
      deckName: deck.name,
    };
  }

  function importBackup(payload: AppData) {
    setData(normalizeData(payload));
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `leetcode-anki-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setData(seedData);
  }

  return (
    <AppDataContext.Provider
      value={{
        data,
        activeCards,
        updateCard,
        addCard,
        deleteCard,
        deleteDeck,
        rateCard,
        undoReview,
        importDeck,
        importBackup,
        exportData,
        reset,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error('useAppData must be used inside AppDataProvider');
  }

  return context;
}