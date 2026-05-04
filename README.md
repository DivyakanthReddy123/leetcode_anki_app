# LeetCode Anki App

A clean, mobile-friendly spaced repetition app for revising LeetCode and coding interview problems.

The goal of this app is to provide a more aesthetic and focused Anki-style experience for technical interview revision. Using repetition, users can review problem patterns, algorithms, data structures, and solution strategies more efficiently.

---

## About Me

Hi, I am **Divyakanth Reddy**.

I built this app because I wanted a cleaner and more aesthetically pleasing version of Anki, specifically designed for LeetCode and interview preparation. Traditional flashcard tools are powerful, but I wanted something that feels simpler, focused, and enjoyable to open every day.

The main idea behind this project is simple:

> Repetition helps us learn more efficiently.

By repeatedly reviewing coding problems, solution patterns, and time/space complexity, we can slowly build stronger problem-solving intuition.

---

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
```

* * * * *

**Main Pages**
--------------

### **Decks**

Shows all available decks with:

-   New cards
-   Learning cards
-   Due cards
-   Progress bar
-   Bulk deck import option
-   Drawer navigation

### **Study**

Used for reviewing cards.

Includes:

-   Question view
-   Show Answer button
-   Solution view
-   Again / Hard / Good / Easy buttons
-   Flag menu
-   Previous-card navigation

### **Card Browser**

Used to manage cards.

Includes:

-   Search
-   Filters
-   Add card
-   Edit card
-   Delete card

### **Statistics**

Shows review activity and card progress.

Includes:

-   Today's reviews
-   Future due cards
-   Calendar heatmap
-   Review counts
-   Card counts
-   Retention
-   Answer button usage

### **Settings**

Includes:

-   Export backup JSON
-   Import backup JSON
-   Reset local data

### **About**

Explains why the app exists and includes the creator profile card.

* * * * *

**Bulk Deck Import Format**
---------------------------

Decks can be imported using a JSON file.

Example:

```
{
  "deck": {
    "id": "arrays-basics",
    "name": "Arrays Basics",
    "description": "Basic array problems for LeetCode revision."
  },
  "cards": [
    {
      "title": "Two Sum",
      "difficulty": "Easy",
      "prompt": "Given an array of integers nums and a target, return indices of two numbers that add up to target.",
      "solution": "Use a hash map to store visited numbers and their indices.\n\nTime: O(n)\nSpace: O(n)",
      "tags": ["array", "hash-map"]
    }
  ]
}
```

Required card fields:

```
title
difficulty
prompt
solution
tags
```

Supported difficulties:

```
Easy
Medium
Hard
```

* * * * *

**Local Deployment / Local Setup**
----------------------------------

### **1\. Clone the repository**

```
git clone https://github.com/DivyakanthReddy123/leetcode_anki_app.git
```

### **2\. Move into the project folder**

```
cd leetcode_anki_app
```

### **3\. Install dependencies**

```
npm install
```

### **4\. Run the app locally**

```
npm run dev
```

After running this command, Vite will show a local URL like:

```
http://localhost:5173
```

Open that URL in your browser.

* * * * *

**Local Production Build**
--------------------------

To check whether the app builds correctly before deployment:

```
npm run build
```

This creates a production-ready `dist/` folder.

To preview the production build locally:

```
npm run preview
```

* * * * *

**Vercel Deployment**
---------------------

This app can be deployed on Vercel.

Recommended Vercel settings:

```
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

For React Router support, add a `vercel.json` file in the project root:

```
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

* * * * *

**Data Persistence**
--------------------

The app stores data in the browser using `localStorage`.

This means:

-   Data persists on the same browser/device
-   Data does not automatically sync across devices
-   Clearing browser data will remove app progress
-   Use Export Backup JSON before clearing browser data

To reset local data manually in the browser console:

```
localStorage.clear();
location.reload();
```

* * * * *

**Design Direction**
--------------------

The app uses a clean Anki-inspired visual system:

-   Black top header
-   Warm off-white background
-   Soft card surfaces
-   Minimal borders
-   DM Sans for UI
-   DM Mono for code-style/problem text
-   Blue for new cards
-   Orange for learning cards
-   Red for due cards
-   Green/blue/red rating buttons

* * * * *

**Purpose**
-----------

This app was created to make LeetCode revision feel cleaner, more focused, and more visually pleasing than traditional flashcard tools.

The main idea is simple:

Repetition helps us learn more efficiently.

By repeatedly reviewing problem patterns, solutions, and complexity analysis, users can build stronger intuition for coding interviews.

* * * * *

**GitHub Repository**
---------------------

```
https://github.com/DivyakanthReddy123/leetcode_anki_app
```

* * * * *

**License**
-----------

This project is for personal learning and interview preparation.
