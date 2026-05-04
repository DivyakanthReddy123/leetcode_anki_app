import { useRef, useState } from 'react';
import { useAppData } from '../app/AppDataContext';
import InlineHeader from '../components/layout/InlineHeader';
import type { AppData } from '../types';

export default function SettingsPage() {
  const { data, reset, exportData, importBackup } = useAppData();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState('');

  async function handleImport(file: File) {
    try {
      const text = await file.text();
      const payload = JSON.parse(text) as AppData;

      importBackup(payload);
      setMessage('Backup imported successfully.');
    } catch {
      setMessage('Invalid backup JSON.');
    }
  }

  return (
    <main className="settings-page" style={{ paddingTop: 0 }}>
      <InlineHeader title="Settings" />
      <section className="settings-card">
        <h2>Backup</h2>
        <p>Export or import your full local study data.</p>

        <div className="settings-actions">
          <button className="primary-btn" type="button" onClick={exportData}>
            Export backup JSON
          </button>

          <button
            className="secondary-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            Import backup JSON
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={event => {
            const file = event.target.files?.[0];
            if (file) handleImport(file);
            event.currentTarget.value = '';
          }}
        />
      </section>

      <section className="settings-card">
        <h2>Study</h2>
        <p>Daily goal: {data.settings.dailyGoal} cards</p>
      </section>

      <section className="settings-card danger-zone">
        <h2>Reset</h2>
        <p>This clears local browser data and restores the Sample deck.</p>

        <button
          className="danger-btn"
          type="button"
          onClick={() => {
            const confirmed = window.confirm('Reset all local data?');
            if (confirmed) reset();
          }}
        >
          Reset local data
        </button>
      </section>

      {message && <div className="settings-message">{message}</div>}
    </main>
  );
}