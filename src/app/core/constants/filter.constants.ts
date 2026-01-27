/**
 * Filter threshold constants for prep time, cook time, and calories categories
 */
export const FILTER_THRESHOLDS = {
} as const;

/**
 * Filter category values
 */
export const FILTER_CATEGORIES = {
  CATEGORY: {
    DESSERT: 'dessert',
    FISH: 'fish',
    MEAT: 'meat',
    LEGUME: 'legume',
    RICE: 'rice',
    VEGETABLES: 'vegetables',
    DOUGHS: 'doughs',
    PASTA: 'pasta',
    OTHERS: 'others',
    ALL: 'all',
  },
  DIFFICULTY: {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
    ALL: 'all',
  },
} as const;
