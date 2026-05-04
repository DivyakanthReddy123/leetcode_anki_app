import type { CSSProperties } from 'react';
import InlineHeader from '../components/layout/InlineHeader';
import ProfileCard from '../components/about/ProfileCard';

const C = {
  bg: '#f5f4f1',
  surface: '#faf9f7',
  ink: '#111111',
  border: '#e8e6e2',
  muted: '#888880',
};

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100dvh', background: C.bg, color: C.ink, fontFamily: 'DM Sans, Inter, system-ui, sans-serif' }}>
      <InlineHeader title="       About" subtitle="       Why this app exists" />

      <section style={{ width: 'min(980px, calc(100vw - 28px))', margin: '0 auto', padding: '22px 0 48px' }}>
        <div style={{ display: 'grid', gap: 22, justifyItems: 'center' }}>
          <ProfileCard
            name="Divyakanth"
            title="AI Developer • NY"
            handle="divyakanthreddy"
            status="Online"
            contactText=" HI !! "
            avatarUrl="/divya1.png"
            onContactClick={() => {
              window.location.href = 'mailto:kanth.buchupalle@gmail.com';
            }}
          />

          <article style={aboutCardStyle}>
            <p style={eyebrowStyle}>Creator note</p>
            <h2 style={headingStyle}>Why I created this app</h2>
            <p style={paragraphStyle}>
              I wanted a cleaner and much more aesthetically pleasing version of Anki for focused LeetCode and interview revision.
              The core idea is simple: when we repeat important concepts at the right time, we learn them more efficiently and remember them longer.
            </p>
            <p style={paragraphStyle}>
              This app keeps that spaced-repetition mindset, but wraps it in a calmer interface that feels good to open every day. The goal is not to make studying complicated. The goal is to make revision clean, repeatable, and easy to stick with.
            </p>
          </article>

          <article style={aboutCardStyle}>
            <p style={eyebrowStyle}>What this app focuses on</p>
            <div style={gridStyle}>
              <InfoBlock title="Repetition" text="Review cards repeatedly so patterns, code structure, and tradeoffs become automatic." />
              <InfoBlock title="Clarity" text="Keep each card readable with problem, intuition, solution, tags, and difficulty." />
              <InfoBlock title="Speed" text="Import full decks using JSON instead of manually creating every card one by one." />
              <InfoBlock title="Aesthetic study" text="Use a clean mobile-first experience that feels closer to a polished learning app." />
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, background: '#ffffff66' }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, letterSpacing: '-0.03em' }}>{title}</h3>
      <p style={{ margin: 0, color: C.muted, lineHeight: 1.6, fontSize: 14 }}>{text}</p>
    </div>
  );
}

const aboutCardStyle: CSSProperties = {
  width: '100%',
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 18,
  padding: 22,
  boxShadow: '0 12px 32px rgba(0,0,0,.05)',
};

const eyebrowStyle: CSSProperties = {
  margin: '0 0 8px',
  color: C.muted,
  fontFamily: 'DM Mono, ui-monospace, monospace',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
};

const headingStyle: CSSProperties = {
  margin: '0 0 12px',
  fontSize: 26,
  lineHeight: 1.1,
  letterSpacing: '-0.05em',
};

const paragraphStyle: CSSProperties = {
  margin: '0 0 12px',
  color: '#33322f',
  lineHeight: 1.75,
  fontSize: 16,
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
  gap: 12,
};
