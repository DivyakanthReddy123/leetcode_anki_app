import type { Card } from '../../types';

const difficultyClass = {
  Easy: 'difficulty-easy',
  Medium: 'difficulty-medium',
  Hard: 'difficulty-hard',
};

type StudyCardProps = {
  card: Card;
  revealed: boolean;
};

export default function StudyCard({ card, revealed }: StudyCardProps) {
  return (
    <>
      <article className="study-card question-card">
        <div className="study-card-title-row">
          <h2>{card.title}</h2>
          <span className={difficultyClass[card.difficulty]}>
            {card.difficulty}
          </span>
        </div>

        <div className="study-card-divider" />

        <pre>{card.prompt}</pre>
      </article>

      {revealed && (
        <article className="study-card solution-card">
          <h3>Solution</h3>
          <pre>{card.solution}</pre>
        </article>
      )}
    </>
  );
}