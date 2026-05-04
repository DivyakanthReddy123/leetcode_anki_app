import { Edit3, Flag, MoreVertical, RotateCcw, Tags, Trash2 } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../app/AppDataContext';
import InlineHeader from '../components/layout/InlineHeader';
import type { Rating } from '../types';

const C = { bg: '#f5f4f1', surface: '#faf9f7', ink: '#111111', border: '#e8e6e2', muted: '#888880', faint: '#cccac5', easy: '#16a34a', medium: '#d97706', hardDiff: '#dc2626', again: '#c0392b', hard: '#4a5568', good: '#27ae60', blue: '#2196f3' };
const ratingButtons: Array<{ rating: Rating; time: string; color: string }> = [
  { rating: 'Again', time: '<1m', color: C.again }, { rating: 'Hard', time: '<10m', color: C.hard }, { rating: 'Good', time: '1d', color: C.good }, { rating: 'Easy', time: '4d', color: C.blue },
];
function difficultyColor(difficulty: string) { return difficulty === 'Easy' ? C.easy : difficulty === 'Medium' ? C.medium : C.hardDiff; }

function stableHash(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getCardPriority(card: { reviewState?: string; dueAt?: string | null; reviewCount?: number }) {
  const now = Date.now();

  // Hard/Again cards become learning cards. Keep them at the front of future sessions.
  if (card.reviewState === 'learning') return 0;

  // Due review cards should come before brand-new cards.
  if (card.dueAt && new Date(card.dueAt).getTime() <= now) return 1;

  // New cards are next.
  if (!card.reviewCount || card.reviewState === 'new') return 2;

  // Easy/Good cards scheduled for the future should go to the end.
  return 3;
}

export default function StudyPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { data, activeCards, rateCard, updateCard, deleteCard } = useAppData();
  const deck = data.decks.find(d => d.id === deckId);
  const cards = useMemo(() => {
    const todayKey = getTodayKey();

    return activeCards
      .filter(card => card.deckId === deckId)
      .slice()
      .sort((a, b) => {
        const priorityDiff = getCardPriority(a) - getCardPriority(b);
        if (priorityDiff !== 0) return priorityDiff;

        // Learning/due/future-review cards are sorted by due time first.
        const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Number.POSITIVE_INFINITY;
        const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Number.POSITIVE_INFINITY;
        if (aDue !== bDue && (getCardPriority(a) !== 2 || getCardPriority(b) !== 2)) return aDue - bDue;

        // New cards are shuffled in a stable daily order so the same card is not always first.
        return stableHash(`${todayKey}-${deckId}-${a.id}`) - stableHash(`${todayKey}-${deckId}-${b.id}`);
      });
  }, [activeCards, deckId]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const card = cards[index];

  function handleRate(rating: Rating) {
    if (!card) return;
    rateCard(card.id, rating);

    // After Easy/Good, the card is scheduled into the future, so the queue is re-sorted
    // and the next best card should become index 0.
    // After Hard/Again, the card remains learning-priority, so move forward once in the
    // current session to avoid instantly showing the exact same card again.
    const shouldMoveForwardInCurrentQueue = rating === 'Again' || rating === 'Hard';
    const nextIndex = shouldMoveForwardInCurrentQueue ? index + 1 : 0;

    if (cards.length <= 1) {
      navigate('/');
      return;
    }

    setIndex(Math.min(nextIndex, cards.length - 1));
    setRevealed(false);
    setMenuOpen(false);
    setFlagOpen(false);
  }
  function handleRedo() {
    // This top-bar button behaves like AnkiDroid's backward navigation inside the current deck.
    // It moves back through already-viewed cards until the first card.
    setMenuOpen(false);
    setFlagOpen(false);
    setRevealed(false);
    setIndex(prev => Math.max(0, prev - 1));
  }
  function handleDelete() {
    if (!card) return;
    if (!window.confirm(`Delete "${card.title}"?`)) return;
    deleteCard(card.id);
    if (cards.length <= 1) { navigate('/'); return; }
    setIndex(prev => Math.max(0, Math.min(prev, cards.length - 2)));
    setMenuOpen(false); setRevealed(false);
  }

  if (!deck || !card) {
    return <main style={pageStyle}><InlineHeader title="Study" subtitle="0 / 0" /><section style={{ padding: 24, textAlign: 'center' }}><h2>No cards found</h2><p>This deck has no active cards.</p></section></main>;
  }

  return (
    <main style={pageStyle}>
      <InlineHeader
        title={deck.name}
        subtitle={`${index + 1} / ${cards.length}`}
        actions={(
          <>
          <button style={iconButtonStyle} type="button" onClick={handleRedo}><RotateCcw size={22} /></button>
          <div style={{ position: 'relative' }}>
          <button
  style={iconButtonStyle}
  type="button"
  onClick={() => {
    setFlagOpen(prev => !prev);
    setMenuOpen(false);
  }}
>
  <Flag
    size={22}
    color={
      card.flag === 'red' ? '#ef4444' :
      card.flag === 'orange' ? '#f59e0b' :
      card.flag === 'green' ? '#22c55e' :
      card.flag === 'blue' ? '#2563eb' :
      card.flag === 'purple' ? '#9333ea' :
      '#ffffff'
    }
    fill={card.flag ? (
      card.flag === 'red' ? '#ef4444' :
      card.flag === 'orange' ? '#f59e0b' :
      card.flag === 'green' ? '#22c55e' :
      card.flag === 'blue' ? '#2563eb' :
      card.flag === 'purple' ? '#9333ea' :
      'none'
    ) : 'none'}
  />
</button>
            {flagOpen && (
  <div style={popoverStyle}>
    {[
      ['No flag', null, '#e8e6e2'],
      ['Red', 'red', '#ef4444'],
      ['Orange', 'orange', '#f59e0b'],
      ['Green', 'green', '#22c55e'],
      ['Blue', 'blue', '#2563eb'],
      ['Purple', 'purple', '#9333ea'],
    ].map(([label, value, color]) => {
      const isSelected = (card.flag ?? null) === value;

      return (
        <button
          key={String(label)}
          type="button"
          style={{
            ...popoverButtonStyle,
            background: isSelected ? '#eceae6' : 'transparent',
            fontWeight: isSelected ? 800 : 600,
            justifyContent: 'space-between',
          }}
          onClick={() => {
            updateCard(card.id, { flag: value as string | null });
            setFlagOpen(false);
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: String(color),
                display: 'inline-block',
              }}
            />
            {label}
          </span>

          {isSelected && (
            <span style={{ color: C.ink, fontWeight: 900 }}>
              ✓
            </span>
          )}
        </button>
      );
    })}
  </div>
)}
          </div>
          <div style={{ position: 'relative' }}>
            <button style={iconButtonStyle} type="button" onClick={() => { setMenuOpen(prev => !prev); setFlagOpen(false); }}><MoreVertical size={22} /></button>
            {menuOpen && <div style={popoverStyle}>
              <StudyMenuItem icon={<RotateCcw size={16} />} label="Redo answer" onClick={() => { setRevealed(false); setMenuOpen(false); }} />
              <StudyMenuItem icon={<Edit3 size={16} />} label="Edit note" onClick={() => navigate(`/browser?edit=${card.id}`)} />
              <StudyMenuItem icon={<Tags size={16} />} label="Edit tags" onClick={() => navigate(`/browser?edit=${card.id}&tags=1`)} />
              <StudyMenuItem icon={<Trash2 size={16} />} label="Delete note" danger onClick={handleDelete} />
            </div>}
          </div>
          </>
        )}
      />
      <div style={{ height: 2, background: C.border }}><i style={{ display: 'block', height: '100%', width: `${((index + 1) / cards.length) * 100}%`, background: C.ink }} /></div>
      <section style={contentStyle}>
        <article style={{ ...cardStyle, minHeight: revealed ? undefined : 'min(390px, 52dvh)' }}>
          <div style={cardTitleRowStyle}><h2 style={cardTitleStyle}>{card.title}</h2><span style={{ color: difficultyColor(card.difficulty), fontSize: 13, lineHeight: 1, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', paddingTop: 5 }}>{card.difficulty}</span></div>
          <div style={dividerStyle} /><pre style={preStyle}>{card.prompt}</pre>
        </article>
        {revealed && <article style={cardStyle}><h3 style={solutionLabelStyle}>Solution</h3><pre style={preStyle}>{card.solution}</pre></article>}
      </section>
      <footer style={bottomStyle}>{!revealed ? <button style={showAnswerStyle} type="button" onClick={() => setRevealed(true)}>Show Answer</button> : <div style={ratingRowStyle}>{ratingButtons.map(button => <button key={button.rating} type="button" onClick={() => handleRate(button.rating)} style={{ minHeight: 56, border: 0, color: '#fff', background: button.color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, fontFamily: 'DM Sans, Inter, system-ui, sans-serif' }}><span style={{ color: 'rgba(255,255,255,.74)', fontFamily: 'DM Mono, ui-monospace, monospace', fontSize: 10, lineHeight: 1 }}>{button.time}</span><strong style={{ color: '#fff', fontSize: 13, lineHeight: 1, fontWeight: 800 }}>{button.rating}</strong></button>)}</div>}</footer>
    </main>
  );
}

function StudyMenuItem({ icon, label, onClick, danger }: { icon: ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return <button type="button" style={{ ...popoverButtonStyle, color: danger ? C.hardDiff : C.ink }} onClick={onClick}>{icon}{label}</button>;
}

const pageStyle: CSSProperties = { height: '100dvh', minHeight: '100dvh', background: C.bg, display: 'grid', gridTemplateRows: 'auto 2px minmax(0, 1fr) auto', overflow: 'hidden', fontFamily: 'DM Sans, Inter, system-ui, sans-serif' };
const headerStyle: CSSProperties = { minHeight: 78, background: C.ink, color: '#fff', display: 'grid', gridTemplateColumns: '78px 1fr 104px', alignItems: 'center', gap: 6, padding: '10px 14px' };
const backButtonStyle: CSSProperties = { border: 0, background: 'transparent', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 600, padding: 0 };
const titleWrapStyle: CSSProperties = { textAlign: 'center', minWidth: 0 };
const headerTitleStyle: CSSProperties = { margin: 0, color: '#fff', fontSize: 18, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const headerSubStyle: CSSProperties = { margin: '4px 0 0', color: 'rgba(255,255,255,.72)', fontFamily: 'DM Mono, ui-monospace, monospace', fontSize: 13, lineHeight: 1 };
const actionWrapStyle: CSSProperties = { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 7 };
const iconButtonStyle: CSSProperties = { width: 30, height: 30, border: 0, background: 'transparent', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const popoverStyle: CSSProperties = { position: 'absolute', right: 0, top: 36, zIndex: 100, width: 172, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: '0 14px 34px rgba(0,0,0,.20)', overflow: 'hidden' };
const popoverButtonStyle: CSSProperties = { width: '100%', border: 0, background: 'transparent', color: C.ink, display: 'flex', alignItems: 'center', gap: 9, padding: '11px 12px', fontSize: 13, fontWeight: 600, textAlign: 'left' };
const contentStyle: CSSProperties = { minHeight: 0, overflowY: 'auto', padding: '22px 18px 14px', display: 'flex', flexDirection: 'column', gap: 16 };
const cardStyle: CSSProperties = { width: '100%', maxWidth: 820, margin: '0 auto', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: '0 1px 5px rgba(0,0,0,.06)', padding: '24px 28px' };
const cardTitleRowStyle: CSSProperties = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 };
const cardTitleStyle: CSSProperties = { margin: 0, color: C.ink, fontSize: 23, lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.04em' };
const dividerStyle: CSSProperties = { height: 1, background: C.border, margin: '20px 0' };
const preStyle: CSSProperties = { margin: 0, color: C.ink, fontFamily: 'DM Mono, ui-monospace, monospace', fontSize: 16, lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word' };
const solutionLabelStyle: CSSProperties = { margin: '0 0 18px', color: C.faint, fontSize: 13, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' };
const bottomStyle: CSSProperties = { background: C.bg, padding: '10px 18px calc(10px + env(safe-area-inset-bottom))', borderTop: `1px solid ${C.border}` };
const showAnswerStyle: CSSProperties = { width: '100%', maxWidth: 820, minHeight: 48, margin: '0 auto', border: 0, borderRadius: 9, background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 };
const ratingRowStyle: CSSProperties = { width: '100%', maxWidth: 820, minHeight: 56, margin: '0 auto', borderRadius: 9, overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' };
