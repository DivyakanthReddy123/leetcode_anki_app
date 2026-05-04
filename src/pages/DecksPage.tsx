import {
  BarChart3,
  BookOpen,
  Download,
  HelpCircle,
  Menu,
  MoreVertical,
  Plus,
  RefreshCcw,
  Settings,
  Upload,
  X,
} from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../app/AppDataContext';
import type { DeckImport } from '../types';

const C = {
  bg: '#f5f4f1', surface: '#faf9f7', ink: '#111111', border: '#e8e6e2', muted: '#888880',
  new: '#2563eb', learn: '#b7791f', due: '#c02626', progress: '#dedcd7', progressFill: '#bfbdb7',
};

export default function DecksPage() {
  const navigate = useNavigate();
  const { data, activeCards, importDeck, exportData } = useAppData();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const deckStats = data.decks.map(deck => {
    const cards = activeCards.filter(card => card.deckId === deck.id);
    const newCount = cards.filter(card => !card.reviewCount || card.reviewState === 'new').length;
    const learnCount = cards.filter(card => card.reviewState === 'learning').length;
    const dueCount = cards.filter(card => card.dueAt && new Date(card.dueAt) <= new Date()).length;
    const studied = cards.filter(card => (card.reviewCount ?? 0) > 0).length;
    return { ...deck, total: cards.length, newCount, learnCount, dueCount, studied };
  });

  const totalDue = deckStats.reduce((sum, deck) => sum + deck.newCount + deck.learnCount + deck.dueCount, 0);

  function showMessage(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2400);
  }

  async function handleImportFile(file: File) {
    try {
      const payload = JSON.parse(await file.text()) as DeckImport;
      const result = importDeck(payload);
      setPlusOpen(false);
      setMoreOpen(false);
      showMessage(`Imported ${result.imported} cards into "${result.deckName}".`);
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to import deck.');
    }
  }

  function openImportPicker() {
    fileInputRef.current?.click();
  }

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <button type="button" aria-label="Open menu" onClick={() => setDrawerOpen(true)} style={headerIconButton}>
          <Menu size={24} />
        </button>

        <div style={{ textAlign: 'center', minWidth: 0 }}>
          <h1 style={titleStyle}>Decks</h1>
          <p style={subtitleStyle}>{totalDue} cards due</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, position: 'relative' }}>
          <button type="button" aria-label="Refresh" onClick={() => showMessage('Decks refreshed.')} style={headerIconButton}>
            <RefreshCcw size={23} />
          </button>
          <button type="button" aria-label="More options" onClick={() => setMoreOpen(prev => !prev)} style={headerIconButton}>
            <MoreVertical size={23} />
          </button>

          {moreOpen && (
            <div style={topMenuStyle}>
              <MenuItem icon={<Upload size={16} />} label="Import Deck JSON" onClick={openImportPicker} />
              <MenuItem icon={<Download size={16} />} label="Export backup" onClick={() => { exportData(); setMoreOpen(false); }} />
              <MenuItem icon={<BarChart3 size={16} />} label="Statistics" onClick={() => { setMoreOpen(false); navigate('/stats'); }} />
              <MenuItem icon={<Settings size={16} />} label="Settings" onClick={() => { setMoreOpen(false); navigate('/settings'); }} />
            </div>
          )}
        </div>
      </header>

      <section style={deckHeadStyle}>
        <span style={{ color: C.muted, fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Deck</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'right', fontSize: 13, fontWeight: 800 }}>
          <span style={{ color: C.new }}>New</span><span style={{ color: C.learn }}>Lrn</span><span style={{ color: C.due }}>Due</span>
        </div>
      </section>

      <section style={{ background: C.surface }}>
        {deckStats.map(deck => (
          <button key={deck.id} type="button" onClick={() => navigate(`/study/${deck.id}`)} style={deckRowStyle}>
            <div>
              <h2 style={deckTitleStyle}>{deck.name}</h2>
              <div style={progressTrackStyle}>
                <i style={{ display: 'block', height: '100%', width: `${deck.total ? Math.min(100, (deck.studied / deck.total) * 100) : 0}%`, background: C.progressFill }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'right', fontSize: 20, fontWeight: 800 }}>
              <span style={{ color: C.new }}>{deck.newCount}</span><span style={{ color: C.learn }}>{deck.learnCount}</span><span style={{ color: C.due }}>{deck.dueCount}</span>
            </div>
          </button>
        ))}
      </section>

      <footer style={footerStyle}><span style={{ color: C.muted, fontFamily: 'DM Mono, ui-monospace, monospace', fontSize: 13 }}>Studied 0 cards today</span></footer>

      <div style={fabWrapStyle}>
        {plusOpen && (
          <div style={floatingMenuStyle}>
            <MenuItem icon={<Plus size={16} />} label="Add Note" onClick={() => { setPlusOpen(false); navigate('/browser?add=1'); }} />
            <MenuItem icon={<Upload size={16} />} label="Import Deck JSON" onClick={openImportPicker} />
          </div>
        )}
        <button type="button" aria-label="Add" onClick={() => setPlusOpen(prev => !prev)} style={fabStyle}><Plus size={25} /></button>
      </div>

      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 160 }}>
          <button type="button" aria-label="Close drawer" onClick={() => setDrawerOpen(false)} style={{ position: 'absolute', inset: 0, border: 0, background: 'rgba(0,0,0,0.42)' }} />
          <aside style={drawerStyle}>
            <div style={drawerHeadStyle}>
              <div><strong style={{ display: 'block', fontSize: 18, fontWeight: 800 }}>LeetCode Anki</strong><span style={{ display: 'block', marginTop: 4, color: C.muted, fontFamily: 'DM Mono, ui-monospace, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>SRS • Spaced Repetition</span></div>
              <button type="button" onClick={() => setDrawerOpen(false)} style={{ width: 34, height: 34, border: 0, borderRadius: 999, background: 'transparent', color: C.ink }}><X size={20} /></button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column' }}>
              <DrawerItem icon={<BookOpen size={18} />} label="Decks" onClick={() => navigateAndClose('/')} />
              <DrawerItem icon={<BookOpen size={18} />} label="Card Browser" onClick={() => navigateAndClose('/browser')} />
              <DrawerItem icon={<BarChart3 size={18} />} label="Statistics" onClick={() => navigateAndClose('/stats')} />
              <DrawerItem icon={<Settings size={18} />} label="Settings" onClick={() => navigateAndClose('/settings')} />
              <DrawerItem icon={<HelpCircle size={18} />} label="Help" onClick={() => { setDrawerOpen(false); showMessage('Help page coming soon.'); }} />
            </nav>
          </aside>
        </div>
      )}

      {message && <div style={toastStyle}>{message}</div>}

      <input ref={fileInputRef} type="file" accept="application/json,.json" hidden onChange={event => { const file = event.target.files?.[0]; if (file) handleImportFile(file); event.currentTarget.value = ''; }} />
    </main>
  );

  function navigateAndClose(path: string) { setDrawerOpen(false); navigate(path); }
}

function MenuItem({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} style={menuItemStyle}>{icon}{label}</button>;
}
function DrawerItem({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} style={drawerItemStyle}>{icon}{label}</button>;
}

const pageStyle: CSSProperties = { minHeight: '100dvh', background: C.bg, color: C.ink, fontFamily: 'DM Sans, Inter, system-ui, sans-serif', position: 'relative', paddingBottom: 66 };
const headerStyle: CSSProperties = { height: 82, background: C.ink, color: '#fff', display: 'grid', gridTemplateColumns: '44px 1fr 84px', alignItems: 'center', padding: '10px 16px' };
const headerIconButton: CSSProperties = { width: 36, height: 36, border: 0, background: 'transparent', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const titleStyle: CSSProperties = { margin: 0, color: '#fff', fontSize: 21, lineHeight: 1, fontWeight: 800, letterSpacing: '-0.04em' };
const subtitleStyle: CSSProperties = { margin: '7px 0 0', color: 'rgba(255,255,255,.68)', fontFamily: 'DM Mono, ui-monospace, monospace', fontSize: 13 };
const deckHeadStyle: CSSProperties = { height: 48, background: C.surface, borderBottom: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: '1fr 132px', alignItems: 'center', padding: '0 18px' };
const deckRowStyle: CSSProperties = { width: '100%', minHeight: 78, border: 0, borderBottom: `1px solid ${C.border}`, background: C.surface, display: 'grid', gridTemplateColumns: '1fr 132px', alignItems: 'center', padding: '0 18px', textAlign: 'left', fontFamily: 'DM Sans, Inter, system-ui, sans-serif' };
const deckTitleStyle: CSSProperties = { margin: 0, color: C.ink, fontSize: 20, lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.04em' };
const progressTrackStyle: CSSProperties = { width: '100%', maxWidth: 260, height: 3, background: C.progress, marginTop: 10, borderRadius: 999, overflow: 'hidden' };
const footerStyle: CSSProperties = { position: 'fixed', left: 0, right: 0, bottom: 0, height: 54, background: C.surface, borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 18px', zIndex: 40 };
const fabWrapStyle: CSSProperties = { position: 'fixed', right: 18, bottom: 70, zIndex: 90 };
const fabStyle: CSSProperties = { width: 52, height: 52, border: 0, borderRadius: 14, background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px rgba(0,0,0,.25)' };
const topMenuStyle: CSSProperties = { position: 'absolute', right: 0, top: 42, zIndex: 140, width: 205, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: '0 18px 42px rgba(0,0,0,.22)', overflow: 'hidden' };
const floatingMenuStyle: CSSProperties = { position: 'absolute', right: 0, bottom: 64, width: 210, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: '0 18px 42px rgba(0,0,0,.18)', overflow: 'hidden' };
const menuItemStyle: CSSProperties = { width: '100%', border: 0, background: 'transparent', color: C.ink, display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', fontSize: 14, fontWeight: 700, textAlign: 'left', fontFamily: 'DM Sans, Inter, system-ui, sans-serif' };
const drawerStyle: CSSProperties = { position: 'absolute', left: 0, top: 0, bottom: 0, width: 'min(78vw, 310px)', background: C.surface, color: C.ink, boxShadow: '18px 0 50px rgba(0,0,0,.22)' };
const drawerHeadStyle: CSSProperties = { minHeight: 86, padding: '20px 16px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };
const drawerItemStyle: CSSProperties = { width: '100%', minHeight: 54, border: 0, borderBottom: `1px solid ${C.border}`, background: 'transparent', color: C.ink, display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px', textAlign: 'left', fontSize: 15, fontWeight: 600, fontFamily: 'DM Sans, Inter, system-ui, sans-serif' };
const toastStyle: CSSProperties = { position: 'fixed', left: '50%', bottom: 132, transform: 'translateX(-50%)', background: C.ink, color: '#fff', padding: '10px 16px', borderRadius: 999, zIndex: 200, fontSize: 13, fontWeight: 700 };
