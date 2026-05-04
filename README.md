# LeetCode Anki App - Phase 3

React + TypeScript + Vite web app for LeetCode spaced-repetition review.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Phase 3 additions

- Import JSON backup in Settings
- Export JSON backup with date-stamped filename
- Reset confirmation flow
- Editable daily goal setting
- Improved Anki-style SRS scheduling
- Better card browser with search, deck filter, difficulty filter, state filter
- Card browser edit modal
- Browser delete action
- Mobile and desktop responsive polish
- Data migration from Phase 2 localStorage key to Phase 3 key

## Data storage

The app stores data in browser localStorage under `leetcode-anki-phase3-data-v1`.
Use Settings > Export backup JSON before clearing browser data.
