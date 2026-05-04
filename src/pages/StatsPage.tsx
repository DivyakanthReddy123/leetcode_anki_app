import { Download } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAppData } from '../app/AppDataContext';
import InlineHeader from '../components/layout/InlineHeader';

type Scope = 'deck' | 'collection';
type GlobalRange = '12m' | 'all';
type ChartRange = '1m' | '3m' | '1y' | 'all';
type RetentionMode = 'young' | 'mature' | 'all';

const DAY_MS = 24 * 60 * 60 * 1000;

const RATINGS = ['Again', 'Hard', 'Good', 'Easy'] as const;

const COLORS = {
  new: '#60a5fa',
  learning: '#d97706',
  relearning: '#ef4444',
  young: '#22c55e',
  mature: '#6366f1',
  again: '#ef4444',
  hard: '#64748b',
  good: '#22c55e',
  easy: '#0ea5e9',
  orange: '#d97706',
  blue: '#2563eb',
  grid: '#e5e5e5',
  text: '#111111',
  muted: '#888880',
};

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dateKey(input: string) {
  return input.slice(0, 10);
}

function daysAgo(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

function isWithinDays(dateString: string, days: number) {
  const d = new Date(dateString);
  return d >= daysAgo(days);
}

function pct(part: number, total: number) {
  if (!total) return '0%';
  return `${((part / total) * 100).toFixed(1)}%`;
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function rangeToDays(range: GlobalRange | ChartRange) {
  if (range === '1m') return 31;
  if (range === '3m') return 92;
  if (range === '1y' || range === '12m') return 365;
  return null;
}

export default function StatsPage() {
  const { data, activeCards, exportData } = useAppData();

  const [scope, setScope] = useState<Scope>('deck');
  const [globalRange, setGlobalRange] = useState<GlobalRange>('12m');

  const [futureRange, setFutureRange] = useState<ChartRange>('1m');
  const [reviewsRange, setReviewsRange] = useState<ChartRange>('1m');
  const [intervalRange, setIntervalRange] = useState<ChartRange>('all');
  const [retentionMode, setRetentionMode] = useState<RetentionMode>('all');
  const [hourlyRange, setHourlyRange] = useState<ChartRange>('1y');
  const [answerRange, setAnswerRange] = useState<ChartRange>('1y');
  const [addedRange, setAddedRange] = useState<ChartRange>('1m');

  const selectedDeckId = activeCards[0]?.deckId ?? 'arrays';

  const scopedCards = useMemo(() => {
    if (scope === 'collection') return activeCards;
    return activeCards.filter(card => card.deckId === selectedDeckId);
  }, [activeCards, scope, selectedDeckId]);

  const scopedReviews = useMemo(() => {
    const cardIds = new Set(scopedCards.map(card => card.id));
    let reviews = data.reviews.filter(review => cardIds.has(review.cardId));

    const days = rangeToDays(globalRange);
    if (days) {
      reviews = reviews.filter(review => isWithinDays(review.reviewedAt, days));
    }

    return reviews;
  }, [data.reviews, scopedCards, globalRange]);

  const todayStats = useMemo(() => {
    const today = isoDate(new Date());
    const reviewsToday = scopedReviews.filter(review => dateKey(review.reviewedAt) === today);

    const again = reviewsToday.filter(review => review.rating === 'Again').length;
    const learn = reviewsToday.filter(review => {
      const card = scopedCards.find(c => c.id === review.cardId);
      return !card || card.reviewState === 'learning' || (card.reviewCount ?? 0) <= 1;
    }).length;

    const review = reviewsToday.length - learn;
    const secondsPerCard = reviewsToday.length ? 13.71 : 0;
    const totalMinutes = reviewsToday.length ? (reviewsToday.length * secondsPerCard) / 60 : 0;
    const matureStudied = reviewsToday.filter(review => {
      const card = scopedCards.find(c => c.id === review.cardId);
      return (card?.intervalDays ?? 0) >= 21;
    }).length;

    return {
      count: reviewsToday.length,
      again,
      learn,
      review,
      relearn: 0,
      minutes: totalMinutes,
      secondsPerCard,
      matureStudied,
    };
  }, [scopedReviews, scopedCards]);

  const futureDue = useMemo(() => {
    const days = rangeToDays(futureRange) ?? 365;
    const now = new Date();
    const buckets = Array.from({ length: days }, (_, i) => ({
      label: i === 0 ? '0' : String(i),
      value: 0,
    }));

    scopedCards.forEach(card => {
      if (!card.dueAt || card.isDeleted) return;
      const due = new Date(card.dueAt);
      const diff = Math.floor((due.getTime() - now.getTime()) / DAY_MS);
      if (diff >= 0 && diff < days) {
        buckets[diff].value += 1;
      }
    });

    const compact = days <= 31
      ? buckets
      : buckets.filter((_, i) => i % Math.ceil(days / 31) === 0);

    const total = buckets.reduce((sum, x) => sum + x.value, 0);
    const dueTomorrow = buckets[1]?.value ?? 0;
    const dailyLoad = Math.round(total / Math.max(1, Math.min(days, 31)));

    return {
      buckets: compact.map(x => x.value),
      labels: compact.map(x => x.label),
      total,
      dueTomorrow,
      dailyLoad,
      average: Math.round(total / Math.max(1, days)),
    };
  }, [scopedCards, futureRange]);

  const calendar = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 69);

    const counts = new Map<string, number>();
    scopedReviews.forEach(review => {
      const key = dateKey(review.reviewedAt);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return Array.from({ length: 70 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const count = counts.get(isoDate(d)) ?? 0;

      let level = 0;
      if (count >= 1) level = 1;
      if (count >= 3) level = 2;
      if (count >= 6) level = 3;
      if (count >= 10) level = 4;

      return { date: isoDate(d), count, level };
    });
  }, [scopedReviews]);

  const reviewsChart = useMemo(() => {
    const days = rangeToDays(reviewsRange) ?? 31;
    const labels: string[] = [];
    const values: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = daysAgo(i);
      const key = isoDate(d);
      const value = scopedReviews.filter(review => dateKey(review.reviewedAt) === key).length;

      if (days <= 31 || i % Math.ceil(days / 31) === 0) {
        labels.push(key.slice(5));
        values.push(value);
      }
    }

    const studiedDays = new Set(scopedReviews.map(review => dateKey(review.reviewedAt))).size;
    const total = scopedReviews.length;

    return {
      labels,
      values,
      studiedDays,
      total,
      days,
      avgOverPeriod: Math.round(total / Math.max(1, days)),
      avgForStudiedDays: studiedDays ? Math.round(total / studiedDays) : 0,
    };
  }, [scopedReviews, reviewsRange]);

  const cardCounts = useMemo(() => {
    const newCards = scopedCards.filter(card => !card.reviewCount || card.reviewState === 'new').length;
    const learningCards = scopedCards.filter(card => card.reviewState === 'learning').length;
    const youngCards = scopedCards.filter(card => card.reviewState === 'review' && (card.intervalDays ?? 0) < 21).length;
    const matureCards = scopedCards.filter(card => card.reviewState === 'review' && (card.intervalDays ?? 0) >= 21).length;
    const relearningCards = 0;

    const items = [
      { label: 'New', value: newCards, color: COLORS.new },
      { label: 'Learning', value: learningCards, color: COLORS.learning },
      { label: 'Relearning', value: relearningCards, color: COLORS.relearning },
      { label: 'Young', value: youngCards, color: COLORS.young },
      { label: 'Mature', value: matureCards, color: COLORS.mature },
    ];

    return {
      items,
      total: items.reduce((sum, x) => sum + x.value, 0),
    };
  }, [scopedCards]);

  const reviewIntervals = useMemo(() => {
    const days = rangeToDays(intervalRange);
    const cards = days
      ? scopedCards.filter(card => card.updatedAt && isWithinDays(card.updatedAt, days))
      : scopedCards;

    const intervals = cards
      .map(card => card.intervalDays ?? 0)
      .filter(value => value > 0);

    const bins = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5];
    const values = bins.map(bin => {
      return intervals.filter(value => value >= bin && value < bin + 0.5).length;
    });

    return {
      labels: bins.map(String),
      values,
      median: median(intervals),
    };
  }, [scopedCards, intervalRange]);

  const cardEase = useMemo(() => {
    const easeValues = scopedCards
    .filter(card => (card.reviewCount ?? 0) > 0)
      .map(card => Math.round((card.easeFactor ?? 2.5) * 100));

    const labels = ['140%', '160%', '180%', '200%', '220%', '230%', '240%', '250%', '260%'];
    const buckets = [140, 160, 180, 200, 220, 230, 240, 250, 260];

    const values = buckets.map(bucket => {
      return easeValues.filter(value => Math.abs(value - bucket) <= 10).length;
    });

    return {
      labels,
      values,
      median: easeValues.length ? Math.round(median(easeValues)) : 250,
    };
  }, [scopedCards]);

  const retention = useMemo(() => {
    const rows = [
      { label: 'Today', days: 1 },
      { label: 'Yesterday', days: 2, onlyYesterday: true },
      { label: 'Last week', days: 7 },
      { label: 'Last month', days: 31 },
      { label: 'Last year', days: 365 },
    ];

    return rows.map(row => {
      let reviews = scopedReviews;

      if (row.onlyYesterday) {
        const yesterday = isoDate(daysAgo(1));
        reviews = reviews.filter(review => dateKey(review.reviewedAt) === yesterday);
      } else {
        reviews = reviews.filter(review => isWithinDays(review.reviewedAt, row.days));
      }

      const youngReviews = reviews.filter(review => {
        const card = scopedCards.find(c => c.id === review.cardId);
        return (card?.intervalDays ?? 0) < 21;
      });

      const matureReviews = reviews.filter(review => {
        const card = scopedCards.find(c => c.id === review.cardId);
        return (card?.intervalDays ?? 0) >= 21;
      });

      const youngPassed = youngReviews.filter(review => review.rating !== 'Again').length;
      const maturePassed = matureReviews.filter(review => review.rating !== 'Again').length;
      const totalPassed = reviews.filter(review => review.rating !== 'Again').length;

      return {
        label: row.label,
        young: youngReviews.length ? pct(youngPassed, youngReviews.length) : 'N/A',
        mature: matureReviews.length ? pct(maturePassed, matureReviews.length) : 'N/A',
        total: reviews.length ? pct(totalPassed, reviews.length) : 'N/A',
        count: reviews.length,
      };
    });
  }, [scopedReviews, scopedCards]);

  const hourlyBreakdown = useMemo(() => {
    const days = rangeToDays(hourlyRange) ?? 365;
    const reviews = scopedReviews.filter(review => isWithinDays(review.reviewedAt, days));

    const values = Array.from({ length: 24 }, (_, hour) => {
      return reviews.filter(review => new Date(review.reviewedAt).getHours() === hour).length;
    });

    return {
      labels: Array.from({ length: 24 }, (_, i) => String(i)),
      values,
    };
  }, [scopedReviews, hourlyRange]);

  const answerButtons = useMemo(() => {
    const days = rangeToDays(answerRange) ?? 365;
    const reviews = scopedReviews.filter(review => isWithinDays(review.reviewedAt, days));

    return RATINGS.map(rating => ({
      label: rating,
      value: reviews.filter(review => review.rating === rating).length,
      color:
        rating === 'Again' ? COLORS.again :
        rating === 'Hard' ? COLORS.hard :
        rating === 'Good' ? COLORS.good :
        COLORS.easy,
    }));
  }, [scopedReviews, answerRange]);

  const added = useMemo(() => {
    const days = rangeToDays(addedRange) ?? 365;
    const labels: string[] = [];
    const values: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = daysAgo(i);
      const key = isoDate(d);

      if (days <= 31 || i % Math.ceil(days / 31) === 0) {
        labels.push(key.slice(5));
        values.push(
          scopedCards.filter(card => dateKey(card.updatedAt ?? new Date().toISOString()) === key).length
        );
      }
    }

    const total = scopedCards.length;

    return {
      labels,
      values,
      total,
      average: Math.round(total / Math.max(1, days)),
    };
  }, [scopedCards, addedRange]);

  return (
    <>
      <InlineHeader title="Statistics" />
      <div className="stats-page ankidroid-stats">
      <div className="stats-top-actions">
        <button className="secondary-btn" onClick={exportData}>
          <Download size={16} />
          Export backup JSON
        </button>
      </div>

      <section className="stats-filter-bar">
        <div className="stats-filter-group">
          <label>
            <input
              type="radio"
              name="stats-scope"
              checked={scope === 'deck'}
              onChange={() => setScope('deck')}
            />
            deck
          </label>

          <label>
            <input
              type="radio"
              name="stats-scope"
              checked={scope === 'collection'}
              onChange={() => setScope('collection')}
            />
            collection
          </label>

          <input
            className="stats-deck-input"
            value={scope === 'deck' ? 'deck:current' : 'collection:all'}
            readOnly
          />
        </div>

        <div className="stats-filter-group">
          <label>
            <input
              type="radio"
              name="stats-global-range"
              checked={globalRange === '12m'}
              onChange={() => setGlobalRange('12m')}
            />
            last 12 months
          </label>

          <label>
            <input
              type="radio"
              name="stats-global-range"
              checked={globalRange === 'all'}
              onChange={() => setGlobalRange('all')}
            />
            all history
          </label>
        </div>
      </section>

      <StatCard title="Today">
        <div className="today-lines">
          <p>
            Studied {todayStats.count} cards in {todayStats.minutes.toFixed(2)} minutes today
            {todayStats.count ? ` (${todayStats.secondsPerCard.toFixed(2)}s/card)` : ''}
          </p>
          <p>
            Again count: {todayStats.again} ({todayStats.count ? Math.round((todayStats.again / todayStats.count) * 100) : 0}%)
          </p>
          <p>
            Learn: {todayStats.learn}, Review: {todayStats.review}, Relearn: {todayStats.relearn}, Filtered: 0
          </p>
          <p>
            {todayStats.matureStudied
              ? `Mature cards studied today: ${todayStats.matureStudied}.`
              : 'No mature cards were studied today.'}
          </p>
        </div>
      </StatCard>

      <StatCard title="Future Due" subtitle="The number of reviews due in the future.">
        <RadioRow
          name="future-range"
          value={futureRange}
          onChange={setFutureRange}
          options={[
            ['1m', '1 month'],
            ['3m', '3 months'],
            ['1y', '1 year'],
            ['all', 'all'],
          ]}
        />

        <BarChart labels={futureDue.labels} values={futureDue.buckets} color="#41b66e" />

        <div className="stats-summary">
          <p>Total: {futureDue.total} reviews</p>
          <p>Average: {futureDue.average} reviews/day</p>
          <p>Due tomorrow: {futureDue.dueTomorrow} reviews</p>
          <p>Daily load: {futureDue.dailyLoad} reviews/day</p>
        </div>
      </StatCard>

      <StatCard title="Calendar">
        <div className="calendar-title">
          <span>◀</span>
          <b>{new Date().getFullYear()}</b>
          <span>▶</span>
        </div>

        <div className="calendar-wrap">
          <div className="calendar-days">
            <span>S</span>
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
          </div>

          <div className="calendar-heatmap">
            {calendar.map(day => (
              <i
                key={day.date}
                className={`heat-level-${day.level}`}
                title={`${day.date}: ${day.count} reviews`}
              />
            ))}
          </div>
        </div>
      </StatCard>

      <StatCard title="Reviews" subtitle="The number of questions you have answered.">
        <RadioRow
          name="reviews-range"
          value={reviewsRange}
          onChange={setReviewsRange}
          options={[
            ['1m', '1 month'],
            ['3m', '3 months'],
            ['1y', '1 year'],
          ]}
        />

        <BarChart labels={reviewsChart.labels} values={reviewsChart.values} color="#e8912d" />

        <div className="stats-summary centered">
          <p>Days studied: {reviewsChart.studiedDays} of {reviewsChart.days}</p>
          <p>Total: {reviewsChart.total} reviews</p>
          <p>Average over period: {reviewsChart.avgOverPeriod} review/day</p>
          <p>Average for days studied: {reviewsChart.avgForStudiedDays} reviews/day</p>
        </div>
      </StatCard>

      <StatCard title="Card Counts">
        <div className="card-count-layout">
          <PieChart items={cardCounts.items} total={cardCounts.total} />

          <div className="card-count-table">
            {cardCounts.items.map(item => (
              <div key={item.label}>
                <span>
                  <i style={{ background: item.color }} />
                  {item.label}
                </span>
                <b>{item.value}</b>
                <em>{pct(item.value, cardCounts.total)}</em>
              </div>
            ))}

            <strong>
              <span>Total</span>
              <b>{cardCounts.total}</b>
              <em />
            </strong>
          </div>
        </div>
      </StatCard>

      <StatCard title="Review Intervals" subtitle="Delays until review cards are shown again.">
        <RadioRow
          name="interval-range"
          value={intervalRange}
          onChange={setIntervalRange}
          options={[
            ['1m', '1 month'],
            ['3m', '3 months'],
            ['1y', '1 year'],
            ['all', 'all'],
          ]}
        />

        <BarChart labels={reviewIntervals.labels} values={reviewIntervals.values} color="#4f7de8" />

        <div className="stats-summary centered">
          <p>Median interval: {reviewIntervals.median || 0} days</p>
        </div>
      </StatCard>

      <StatCard title="Card Ease" subtitle="The lower the ease, the more frequently a card will appear.">
        <BarChart labels={cardEase.labels} values={cardEase.values} color="#41b66e" />

        <div className="stats-summary centered">
          <p>Median ease: {cardEase.median}%</p>
        </div>
      </StatCard>

      <StatCard title="Retention" subtitle="Pass rate of cards with an interval ≥ 1 day.">
        <RadioRow
          name="retention-mode"
          value={retentionMode}
          onChange={setRetentionMode}
          options={[
            ['young', 'Young'],
            ['mature', 'Mature'],
            ['all', 'All'],
          ]}
        />

        <table className="retention-table">
          <thead>
            <tr>
              <th />
              <th>Young</th>
              <th>Mature</th>
              <th>Total</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {retention.map(row => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td>{retentionMode === 'mature' ? '—' : row.young}</td>
                <td>{retentionMode === 'young' ? '—' : row.mature}</td>
                <td>{row.total}</td>
                <td>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StatCard>

      <StatCard title="Hourly Breakdown" subtitle="Review success rate for each hour of the day.">
        <RadioRow
          name="hourly-range"
          value={hourlyRange}
          onChange={setHourlyRange}
          options={[
            ['1m', '1 month'],
            ['3m', '3 months'],
            ['1y', '1 year'],
          ]}
        />

        <BarChart labels={hourlyBreakdown.labels} values={hourlyBreakdown.values} color="#4f7de8" compactLabels />
      </StatCard>

      <StatCard title="Answer Buttons" subtitle="The number of times you have pressed each button.">
        <RadioRow
          name="answer-range"
          value={answerRange}
          onChange={setAnswerRange}
          options={[
            ['1m', '1 month'],
            ['3m', '3 months'],
            ['1y', '1 year'],
          ]}
        />

        <div className="answer-button-chart">
          {answerButtons.map(item => (
            <div key={item.label}>
              <i style={{ height: `${Math.max(4, item.value * 18)}px`, background: item.color }} />
              <span>{item.label}</span>
              <b>{item.value}</b>
            </div>
          ))}
        </div>
      </StatCard>

      <StatCard title="Added" subtitle="The number of new cards you have added.">
        <RadioRow
          name="added-range"
          value={addedRange}
          onChange={setAddedRange}
          options={[
            ['1m', '1 month'],
            ['3m', '3 months'],
            ['1y', '1 year'],
            ['all', 'all'],
          ]}
        />

        <BarChart labels={added.labels} values={added.values} color="#60a5fa" />

        <div className="stats-summary centered">
          <p>Total: {added.total} cards</p>
          <p>Average: {added.average} cards/day</p>
        </div>
      </StatCard>
      </div>
    </>
  );
}

function StatCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="anki-stat-card">
      <h2>{title}</h2>
      {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      <div className="stat-divider" />
      {children}
    </section>
  );
}

function RadioRow<T extends string>({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<[T, string]>;
}) {
  return (
    <div className="stat-radio-row">
      {options.map(([optionValue, label]) => (
        <label key={optionValue}>
          <input
            type="radio"
            name={name}
            checked={value === optionValue}
            onChange={() => onChange(optionValue)}
          />
          {label}
        </label>
      ))}
    </div>
  );
}

function BarChart({
  labels,
  values,
  color,
  compactLabels = false,
}: {
  labels: string[];
  values: number[];
  color: string;
  compactLabels?: boolean;
}) {
  const max = Math.max(1, ...values);

  const labelStep =
    labels.length > 24 ? 5 :
    labels.length > 14 ? 3 :
    labels.length > 8 ? 2 :
    1;

  return (
    <div className="anki-bar-chart">
      {values.map((value, index) => {
        const shouldShowLabel =
          compactLabels
            ? index % 4 === 0
            : index % labelStep === 0 || index === labels.length - 1;

        return (
          <div key={`${labels[index]}-${index}`} className="anki-bar-item">
            <i
              style={{
                height: value ? `${Math.max(6, (value / max) * 110)}px` : '2px',
                background: value ? color : 'transparent',
              }}
            />
            <span>{shouldShowLabel ? labels[index] : ''}</span>
          </div>
        );
      })}
    </div>
  );
}

function PieChart({
  items,
  total,
}: {
  items: Array<{ label: string; value: number; color: string }>;
  total: number;
}) {
  let current = 0;

  const gradient = total
    ? items
        .map(item => {
          const start = current;
          const end = current + (item.value / total) * 100;
          current = end;
          return `${item.color} ${start}% ${end}%`;
        })
        .join(', ')
    : '#e5e5e5 0% 100%';

  return (
    <div
      className="anki-pie"
      style={{
        background: `conic-gradient(${gradient})`,
      }}
    />
  );
}