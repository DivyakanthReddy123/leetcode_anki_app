import { seedData } from '../data/seedProblems';
import type { AppData } from '../types';

const STORAGE_KEY = 'leetcode-anki-app-data-v4';

export function loadStoredData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData;

    return JSON.parse(raw) as AppData;
  } catch {
    return seedData;
  }
}

export function saveStoredData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearStoredData() {
  localStorage.removeItem(STORAGE_KEY);
}