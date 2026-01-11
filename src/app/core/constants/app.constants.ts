/**
 * General application constants
 */
export const APP_CONSTANTS = {
  /** Default page size for pagination */
  DEFAULT_PAGE_SIZE: 6,

  /** Asset image paths */
  IMAGES: {
    DEFAULT_PET: '/assets/default.png',
    DEFAULT_PET_RELATIVE: 'assets/default.png',
    LOADING: 'assets/loading.png',
    NO_FOUND: 'assets/no-found.png',
  },

  /** Toast display duration in milliseconds */
  TOAST_DURATION: 3000,

  /** Default sort configuration */
  DEFAULT_SORT: {
    SORT_BY: 'name',
    SORT_ORDER: 'asc' as const,
  },
} as const;
