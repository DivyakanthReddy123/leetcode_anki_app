import type { Card } from '../types';

export function getCardsByDeck(cards: Card[], deckId: string) {
  return cards.filter(card => card.deckId === deckId && !card.isDeleted);
}

export function getDeckProgress(cards: Card[], deckId: string) {
  const deckCards = getCardsByDeck(cards, deckId);
  const total = deckCards.length;
  const studied = deckCards.filter(card => (card.reviewCount ?? 0) > 0).length;

  return {
    total,
    studied,
    percent: total ? Math.round((studied / total) * 100) : 0,
  };
}