/**
 * General application constants
 */
export const APP_CONSTANTS = {
  /** Default page size for pagination */
  DEFAULT_PAGE_SIZE: 12,

  /** Asset image paths */
  IMAGES: {
    DEFAULT_RECIPE: '/assets/default.png',
    DEFAULT_RECIPE_RELATIVE: 'assets/default.png',
    LOADING: 'assets/loading.png',
    NO_FOUND: '/assets/no-found.png',
    LOGO: '/assets/logo.png',
    LOGO_DARK: '/assets/logo-dark.png',
  },

  /** Toast display duration in milliseconds */
  TOAST_DURATION: 3000,

  /** Default sort configuration */
  DEFAULT_SORT: {
    SORT_BY: 'name',
    SORT_ORDER: 'asc' as const,
  },
} as const;
