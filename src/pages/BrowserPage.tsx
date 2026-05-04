import { ArrowLeft, Search, Trash2 } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppData } from '../app/AppDataContext';
import InlineHeader from '../components/layout/InlineHeader';
import type { Card, Difficulty } from '../types';

const C = { bg: '#f5f4f1', surface: '#faf9f7', ink: '#111111', border: '#e8e6e2', muted: '#888880', recessed: '#eceae6', due: '#c02626' };
const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

export default function BrowserPage() {
  const { data, activeCards, updateCard, deleteCard, addCard } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [deckFilter, setDeckFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (searchParams.get('add') === '1') setAdding(true);
    const editId = searchParams.get('edit');
    if (editId) {
      const found = activeCards.find(card => card.id === editId);
      if (found) setEditingCard(found);
    }
  }, [searchParams, activeCards]);

  function closeModal() {
    setAdding(false);
    setEditingCard(null);
    setSearchParams({});
  }

  const filteredCards = useMemo(() => activeCards.filter(card => {
    const haystack = `${card.title} ${card.tags.join(' ')} ${card.difficulty} ${card.prompt} ${card.solution}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (deckFilter === 'all' || card.deckId === deckFilter) && (difficultyFilter === 'all' || card.difficulty === difficultyFilter);
  }), [activeCards, query, deckFilter, difficultyFilter]);

  return (
    <main style={pageStyle}>
      <InlineHeader title="Card Browser" subtitle={`${filteredCards.length} cards`} />
      <section style={toolbarStyle}>
        <div style={searchBoxStyle}><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by problem, tag..." style={searchInputStyle} /></div>
        <select value={deckFilter} onChange={e => setDeckFilter(e.target.value)} style={selectStyle}><option value="all">All decks</option>{data.decks.map(deck => <option value={deck.id} key={deck.id}>{deck.name}</option>)}</select>
        <select value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)} style={selectStyle}><option value="all">All difficulties</option>{difficulties.map(d => <option value={d} key={d}>{d}</option>)}</select>
        <button style={primaryButtonStyle} type="button" onClick={() => setAdding(true)}>Add Note</button>
      </section>
      <section style={tableStyle}>
        <div style={tableHeadStyle}><span>Sort Field</span><span>Type</span><span>Due</span><span>Deck</span><span /></div>
        {filteredCards.map(card => {
          const deck = data.decks.find(deck => deck.id === card.deckId);
          return <div style={tableRowStyle} key={card.id}>
            <button type="button" onClick={() => setEditingCard(card)} style={cardOpenButtonStyle}><strong style={cardTitleStyle}>{card.title}</strong><em style={cardTagStyle}>{card.tags.join(', ') || 'No tags'}</em></button>
            <span>Card 1</span><span>{card.dueAt ? new Date(card.dueAt).toLocaleDateString() : 'New'}</span><span>{deck?.name ?? card.deckId}</span>
            <button type="button" style={deleteButtonStyle} onClick={() => deleteCard(card.id)}><Trash2 size={15} /></button>
          </div>;
        })}
      </section>
      {editingCard && <CardEditor title={searchParams.get('tags') === '1' ? 'Edit tags' : 'Edit note'} card={editingCard} decks={data.decks} onClose={closeModal} onSave={patch => { updateCard(editingCard.id, patch); closeModal(); }} />}
      {adding && <AddCardModal decks={data.decks} onClose={closeModal} onSave={input => { addCard(input); closeModal(); }} />}
    </main>
  );
}

function CardEditor({ title, card, decks, onClose, onSave }: { title: string; card: Card; decks: Array<{ id: string; name: string }>; onClose: () => void; onSave: (patch: Partial<Card>) => void }) {
  const [cardTitle, setCardTitle] = useState(card.title);
  const [deckId, setDeckId] = useState(card.deckId);
  const [difficulty, setDifficulty] = useState<Difficulty>(card.difficulty);
  const [prompt, setPrompt] = useState(card.prompt);
  const [solution, setSolution] = useState(card.solution);
  const [tags, setTags] = useState(card.tags.join(', '));
  return <EditorShell title={title} onClose={onClose} onSave={() => onSave({ title: cardTitle.trim(), deckId, difficulty, prompt, solution, tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) })}>
    <EditorFields decks={decks} deckId={deckId} setDeckId={setDeckId} title={cardTitle} setTitle={setCardTitle} difficulty={difficulty} setDifficulty={setDifficulty} prompt={prompt} setPrompt={setPrompt} solution={solution} setSolution={setSolution} tags={tags} setTags={setTags} />
  </EditorShell>;
}
function AddCardModal({ decks, onClose, onSave }: { decks: Array<{ id: string; name: string }>; onClose: () => void; onSave: (input: { deckId: string; title: string; difficulty: Difficulty; prompt: string; solution: string; tags: string[] }) => void }) {
  const [deckId, setDeckId] = useState(decks[0]?.id ?? 'sample'); const [title, setTitle] = useState(''); const [difficulty, setDifficulty] = useState<Difficulty>('Easy'); const [prompt, setPrompt] = useState(''); const [solution, setSolution] = useState(''); const [tags, setTags] = useState('');
  return <EditorShell title="Add note" onClose={onClose} onSave={() => { if (!title.trim()) return; onSave({ deckId, title: title.trim(), difficulty, prompt, solution, tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) }); }}>
    <EditorFields decks={decks} deckId={deckId} setDeckId={setDeckId} title={title} setTitle={setTitle} difficulty={difficulty} setDifficulty={setDifficulty} prompt={prompt} setPrompt={setPrompt} solution={solution} setSolution={setSolution} tags={tags} setTags={setTags} />
  </EditorShell>;
}

function EditorShell({
  title,
  children,
  onClose,
  onSave,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div style={modalBackdropStyle}>
      <section style={modalStyle}>
        <div style={modalTopStyle}>
          <button
            type="button"
            aria-label="Back"
            onClick={onClose}
            style={{
              width: 38,
              height: 38,
              border: 0,
              background: 'transparent',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <ArrowLeft size={22} />
          </button>

          <strong style={{ flex: 1, fontSize: 16 }}>
            {title}
          </strong>

          <button
            style={secondaryLightStyle}
            type="button"
            onClick={onSave}
          >
            Save
          </button>
        </div>

        <div style={{ overflowY: 'auto' }}>
          {children}
        </div>
      </section>
    </div>
  );
}




function EditorFields(props: { decks: Array<{ id: string; name: string }>; deckId: string; setDeckId: (v: string) => void; title: string; setTitle: (v: string) => void; difficulty: Difficulty; setDifficulty: (v: Difficulty) => void; prompt: string; setPrompt: (v: string) => void; solution: string; setSolution: (v: string) => void; tags: string; setTags: (v: string) => void }) {
  return <><EditorLabel label="Deck"><select value={props.deckId} onChange={e => props.setDeckId(e.target.value)} style={editorInputStyle}>{props.decks.map(deck => <option value={deck.id} key={deck.id}>{deck.name}</option>)}</select></EditorLabel><EditorLabel label="Title"><input value={props.title} onChange={e => props.setTitle(e.target.value)} style={editorInputStyle} /></EditorLabel><EditorLabel label="Difficulty"><select value={props.difficulty} onChange={e => props.setDifficulty(e.target.value as Difficulty)} style={editorInputStyle}><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option></select></EditorLabel><EditorLabel label="Prompt"><textarea value={props.prompt} onChange={e => props.setPrompt(e.target.value)} rows={5} style={editorTextareaStyle} /></EditorLabel><EditorLabel label="Solution"><textarea value={props.solution} onChange={e => props.setSolution(e.target.value)} rows={6} style={editorTextareaStyle} /></EditorLabel><EditorLabel label="Tags"><input value={props.tags} onChange={e => props.setTags(e.target.value)} style={editorInputStyle} /></EditorLabel></>;
}
function EditorLabel({ label, children }: { label: string; children: ReactNode }) { return <label style={editorLabelStyle}>{label}{children}</label>; }

const pageStyle: CSSProperties = { minHeight: '100dvh', background: C.bg, padding: 12, paddingTop: 0, fontFamily: 'DM Sans, Inter, system-ui, sans-serif' };
const toolbarStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 130px 130px 92px', gap: 8, margin: '12px 0' };
const searchBoxStyle: CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 7 };
const searchInputStyle: CSSProperties = { width: '100%', border: 0, outline: 0, background: 'transparent', padding: '10px 0', fontSize: 13 };
const selectStyle: CSSProperties = { border: `1px solid ${C.border}`, borderRadius: 10, background: C.surface, padding: '0 9px', minHeight: 40, fontSize: 12 };
const primaryButtonStyle: CSSProperties = { border: 0, borderRadius: 10, background: C.ink, color: '#fff', fontWeight: 800, fontSize: 12 };
const tableStyle: CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' };
const tableHeadStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(0,1.7fr) 58px 92px 90px 32px', gap: 8, alignItems: 'center', padding: 10, background: C.recessed, borderBottom: `1px solid ${C.border}`, color: C.muted, fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' };
const tableRowStyle: CSSProperties = { minHeight: 58, display: 'grid', gridTemplateColumns: 'minmax(0,1.7fr) 58px 92px 90px 32px', gap: 8, alignItems: 'center', padding: 10, borderBottom: `1px solid ${C.border}`, fontSize: 12 };
const cardOpenButtonStyle: CSSProperties = { border: 0, background: 'transparent', color: C.ink, textAlign: 'left', padding: 0, minWidth: 0 };
const cardTitleStyle: CSSProperties = { display: 'block', fontSize: 13, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const cardTagStyle: CSSProperties = { display: 'block', color: C.muted, fontFamily: 'DM Mono, ui-monospace, monospace', fontStyle: 'normal', fontSize: 10, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const deleteButtonStyle: CSSProperties = { width: 30, height: 30, border: 0, borderRadius: 8, background: 'transparent', color: C.muted };
const modalBackdropStyle: CSSProperties = { position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.42)', display: 'grid', placeItems: 'center', padding: 18 };
const modalStyle: CSSProperties = { width: 'min(720px,100%)', maxHeight: 'min(92dvh,860px)', background: C.bg, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 18px 70px rgba(0,0,0,.28)' };
const modalTopStyle: CSSProperties = { minHeight: 56, background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px' };
const backIconModalStyle: CSSProperties = { width: 36, height: 36, border: 0, background: 'transparent', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const secondaryLightStyle: CSSProperties = { border: 0, borderRadius: 999, background: 'rgba(255,255,255,.12)', color: '#fff', padding: '7px 11px', fontWeight: 800, fontSize: 13 };
const editorLabelStyle: CSSProperties = { display: 'block', background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '12px 14px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 900, color: C.muted };
const editorInputStyle: CSSProperties = { width: '100%', marginTop: 8, border: `1px solid ${C.border}`, borderRadius: 9, outline: 0, background: C.bg, color: C.ink, padding: '10px 11px', fontFamily: 'DM Mono, ui-monospace, monospace', fontSize: 13 };
const editorTextareaStyle: CSSProperties = { ...editorInputStyle, resize: 'vertical', lineHeight: 1.6 };
