# LeetCode Anki App

A clean, aesthetic, Anki-style spaced repetition web app for learning and revising LeetCode problems.

The main idea behind this app is simple:

> Build a cleaner and more visually pleasing version of Anki for coding interview preparation, where repeated review helps us learn patterns, algorithms, and problem-solving approaches more efficiently.

---

## Live App

Vercel link :
leetcode-anki-app.vercel.app



## Features

- Clean Anki-inspired deck UI
- Mobile-first responsive design
- Default Sample deck for first-time users
- Bulk deck import using JSON
- Add, edit, and delete cards
- Study mode with:
  - Show Answer
  - Again / Hard / Good / Easy ratings
  - Previous-card navigation
  - Flagging cards
- Card Browser with search and filters
- Statistics page based on usage
- Settings page with backup/export support
- Local persistence using browser `localStorage`
- About page with creator profile and app purpose

---

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Lucide React Icons
- CSS / Inline styling
- Browser `localStorage`

---

## Project Structure

```txt
src/
  app/
    App.tsx
    AppDataContext.tsx

  components/
    about/
      ProfileCard.tsx
      ProfileCard.css

    layout/
      AppShell.tsx
      InlineHeader.tsx

  data/
    seedProblems.ts

  pages/
    AboutPage.tsx
    BrowserPage.tsx
    DecksPage.tsx
    SettingsPage.tsx
    StatsPage.tsx
    StudyPage.tsx

  styles/
    index.css

  types/
    index.ts

  utils/
    progress.ts
    storage.ts
