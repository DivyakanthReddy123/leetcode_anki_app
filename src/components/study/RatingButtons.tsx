import type { Rating } from '../../types';

const ratings: Array<{ label: Rating; time: string; cls: string }> = [
  { label: 'Again', time: '<1m', cls: 'again' },
  { label: 'Hard', time: '<10m', cls: 'hard-rate' },
  { label: 'Good', time: '1d', cls: 'good' },
  { label: 'Easy', time: '4d', cls: 'easy-rate' },
];

export default function RatingButtons({ onRate }: { onRate: (rating: Rating) => void }) {
  return (
    <div className="rating-grid">
      {ratings.map(r => (
        <button className={`rating ${r.cls}`} key={r.label} onClick={() => onRate(r.label)}>
          <small>{r.time}</small>
          {r.label}
        </button>
      ))}
    </div>
  );
}
