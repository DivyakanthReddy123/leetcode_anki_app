import { useNavigate } from 'react-router-dom';
import type { Deck } from '../../types';

type DeckCardProps = {
  deck: Deck & {
    total?: number;
    studied?: number;
    newCount?: number;
    learnCount?: number;
    dueCount?: number;
  };
};

export default function DeckCard({ deck }: DeckCardProps) {
  const navigate = useNavigate();

  const total = deck.total ?? 0;
  const studied = deck.studied ?? 0;
  const percent = total ? Math.round((studied / total) * 100) : 0;

  return (
    <section className="deck-card">
      <h3>{deck.name}</h3>

      <div className="progress">
        <div
          style={{
            width: `${Math.max(percent, total ? 4 : 0)}%`,
            background: '#cccac5',
          }}
        />
      </div>

      <div className="deck-card-counts">
        <span className="new-color">{deck.newCount ?? 0}</span>
        <span className="learn-color">{deck.learnCount ?? 0}</span>
        <span className="due-color">{deck.dueCount ?? 0}</span>
      </div>

      <button
        className="primary-btn"
        type="button"
        onClick={() => navigate(`/study/${deck.id}`)}
      >
        Study Deck
      </button>
    </section>
  );
}