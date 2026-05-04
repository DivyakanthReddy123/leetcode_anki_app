import { Navigate, Route, Routes } from 'react-router-dom';
import { AppDataProvider } from './AppDataContext';
import AppShell from '../components/layout/AppShell';
import DecksPage from '../pages/DecksPage';
import StudyPage from '../pages/StudyPage';
import BrowserPage from '../pages/BrowserPage';
import StatsPage from '../pages/StatsPage';
import SettingsPage from '../pages/SettingsPage';
import AboutPage from '../pages/AboutPage';

export default function App() {
  return (
    <AppDataProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<DecksPage />} />
          <Route path="/study/:deckId" element={<StudyPage />} />
          <Route path="/browser" element={<BrowserPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </AppDataProvider>
  );
}