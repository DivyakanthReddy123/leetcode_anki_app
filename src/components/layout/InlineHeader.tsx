import {
  BarChart3,
  BookOpen,
  UserRound,
  Menu,
  Settings as SettingsIcon,
  X,
} from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const C = {
  surface: '#faf9f7',
  ink: '#111111',
  border: '#e8e6e2',
  muted: '#888880',
};

type InlineHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export default function InlineHeader({ title, subtitle, actions }: InlineHeaderProps) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [message, setMessage] = useState('');

  function showMessage(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2200);
  }

  function go(path: string) {
    setDrawerOpen(false);
    navigate(path);
  }

  return (
    <>
      <header style={headerStyle}>
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
          style={headerIconButton}
        >
          <Menu size={24} />
        </button>

        <div style={{ textAlign: 'center', minWidth: 0 }}>
          <h1 style={titleStyle}>{title}</h1>
          {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        </div>

        <div style={actionsStyle}>{actions}</div>
      </header>

      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500 }}>
          <button
            type="button"
            aria-label="Close drawer"
            onClick={() => setDrawerOpen(false)}
            style={{ position: 'absolute', inset: 0, border: 0, background: 'rgba(0,0,0,.42)' }}
          />
          <aside style={drawerStyle}>
            <div style={drawerHeadStyle}>
              <div>
                <strong style={{ display: 'block', fontSize: 18, fontWeight: 800 }}>LeetCode Anki</strong>
                <span style={{ display: 'block', marginTop: 4, color: C.muted, fontFamily: 'DM Mono, ui-monospace, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  SRS • Spaced Repetition
                </span>
              </div>
              <button type="button" onClick={() => setDrawerOpen(false)} style={{ width: 34, height: 34, border: 0, borderRadius: 999, background: 'transparent', color: C.ink }}>
                <X size={20} />
              </button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column' }}>
              <DrawerItem icon={<BookOpen size={18} />} label="Decks" onClick={() => go('/')} />
              <DrawerItem icon={<BookOpen size={18} />} label="Card Browser" onClick={() => go('/browser')} />
              <DrawerItem icon={<BarChart3 size={18} />} label="Statistics" onClick={() => go('/stats')} />
              <DrawerItem icon={<SettingsIcon size={18} />} label="Settings" onClick={() => go('/settings')} />
              <DrawerItem icon={<UserRound size={18} />} label="About" onClick={() => go('/about')} />
            </nav>
          </aside>
        </div>
      )}

      {message && <div style={toastStyle}>{message}</div>}
    </>
  );
}

function DrawerItem({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} style={drawerItemStyle}>{icon}{label}</button>;
}

const headerStyle: CSSProperties = {
  height: 82,
  background: C.ink,
  color: '#fff',
  display: 'grid',
  gridTemplateColumns: '72px minmax(0, 1fr) 72px',
  alignItems: 'center',
  padding: '10px 16px',
};

const headerIconButton: CSSProperties = {
  width: 36,
  height: 36,
  border: 0,
  background: 'transparent',
  color: '#fff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const titleStyle: CSSProperties = {
  margin: 0,
  color: '#fff',
  fontSize: 21,
  lineHeight: 1,
  fontWeight: 800,
  letterSpacing: '-0.04em',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const subtitleStyle: CSSProperties = {
  margin: '7px 0 0',
  color: 'rgba(255,255,255,.68)',
  fontFamily: 'DM Mono, ui-monospace, monospace',
  fontSize: 13,
};

const actionsStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 6,
  position: 'relative',
};

const drawerStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: 'min(78vw, 310px)',
  background: C.surface,
  color: C.ink,
  boxShadow: '18px 0 50px rgba(0,0,0,.22)',
};

const drawerHeadStyle: CSSProperties = {
  minHeight: 86,
  padding: '20px 16px 14px',
  borderBottom: `1px solid ${C.border}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
};

const drawerItemStyle: CSSProperties = {
  width: '100%',
  minHeight: 54,
  border: 0,
  borderBottom: `1px solid ${C.border}`,
  background: 'transparent',
  color: C.ink,
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '0 20px',
  textAlign: 'left',
  fontSize: 15,
  fontWeight: 600,
  fontFamily: 'DM Sans, Inter, system-ui, sans-serif',
};

const toastStyle: CSSProperties = {
  position: 'fixed',
  left: '50%',
  bottom: 132,
  transform: 'translateX(-50%)',
  background: C.ink,
  color: '#fff',
  padding: '10px 16px',
  borderRadius: 999,
  zIndex: 800,
  fontSize: 13,
  fontWeight: 700,
};
