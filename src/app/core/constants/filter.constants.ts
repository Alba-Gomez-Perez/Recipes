/**
 * Filter threshold constants for weight, height, and length categories
 */
export const FILTER_THRESHOLDS = {
  /** Weight thresholds in grams */
  WEIGHT: {
    SMALL_MAX: 5000,
    MEDIUM_MIN: 5000,
    MEDIUM_MAX: 15000,
    LARGE_MIN: 15000,
  },

  /** Height thresholds in centimeters */
  HEIGHT: {
    SHORT_MAX: 30,
    AVERAGE_MIN: 30,
    AVERAGE_MAX: 60,
    TALL_MIN: 60,
  },

  /** Length thresholds in centimeters */
  LENGTH: {
    SHORT_MAX: 40,
    AVERAGE_MIN: 40,
    AVERAGE_MAX: 80,
    LONG_MIN: 80,
  },
} as const;

/**
 * Filter category values
 */
export const FILTER_CATEGORIES = {
  WEIGHT: {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    ALL: 'all',
  },
  HEIGHT: {
    SHORT: 'short',
    AVERAGE: 'average',
    TALL: 'tall',
    ALL: 'all',
  },
  LENGTH: {
    SHORT: 'short',
    AVERAGE: 'average',
    LONG: 'long',
    ALL: 'all',
  },
} as const;
