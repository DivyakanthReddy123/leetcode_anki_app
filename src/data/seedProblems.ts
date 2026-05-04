import type { AppData } from '../types';

const now = new Date().toISOString();

export const seedData: AppData = {
  decks: [
    {
      id: 'sample',
      name: 'Sample',
      description: 'A small starter deck to understand how the app works.',
      createdAt: now,
      updatedAt: now,
    },
  ],

  cards: [
    {
      id: 'sample-two-sum',
      deckId: 'sample',
      title: 'Two Sum',
      difficulty: 'Easy',
      prompt:
        'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\n• 2 ≤ nums.length ≤ 10⁴\n• Exactly one solution exists',
      solution:
        'Use a hash map.\n\nFor each number x, check whether target - x already exists in the map.\nIf yes, return both indices.\nOtherwise, store x with its index.\n\nTime: O(n)\nSpace: O(n)',
      tags: ['array', 'hash-map'],
      flag: null,
      isDeleted: false,
      reviewState: 'new',
      dueAt: null,
      intervalDays: 0,
      easeFactor: 2.5,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sample-contains-duplicate',
      deckId: 'sample',
      title: 'Contains Duplicate',
      difficulty: 'Easy',
      prompt:
        'Given an integer array nums, return true if any value appears at least twice in the array.',
      solution:
        'Use a hash set.\n\nIterate through nums.\nIf the number already exists in the set, return true.\nOtherwise, add it to the set.\n\nTime: O(n)\nSpace: O(n)',
      tags: ['array', 'hash-set'],
      flag: null,
      isDeleted: false,
      reviewState: 'new',
      dueAt: null,
      intervalDays: 0,
      easeFactor: 2.5,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sample-binary-search',
      deckId: 'sample',
      title: 'Binary Search',
      difficulty: 'Easy',
      prompt:
        'Given a sorted array of integers nums and a target, return the index of target. If target does not exist, return -1.',
      solution:
        'Use two pointers: left and right.\n\nCalculate mid.\nIf nums[mid] equals target, return mid.\nIf nums[mid] is smaller, move left to mid + 1.\nOtherwise, move right to mid - 1.\n\nTime: O(log n)\nSpace: O(1)',
      tags: ['binary-search'],
      flag: null,
      isDeleted: false,
      reviewState: 'new',
      dueAt: null,
      intervalDays: 0,
      easeFactor: 2.5,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    },
  ],

  reviews: [],

  settings: {
    dailyGoal: 20,
  },
};