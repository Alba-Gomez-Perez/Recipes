import { environment } from '../../../environments/environment';

/**
 * API-related constants
 */
export const API_CONSTANTS = {
  /** Base URL for the recipes API */
  BASE_URL: `${environment.apiUrl}/recipes`,

  /** Error messages */
  ERROR_MESSAGES: {
    FETCH_RECIPES: 'Error al obtener las recetas',
    FETCH_RECIPE_BY_ID: 'Error al obtener la receta',
  },

  /** HTTP Headers */
  HEADERS: {
    TOTAL_COUNT: 'X-Total-Count',
  },

  /** Query parameter names */
  QUERY_PARAMS: {
    PAGE: '_page',
    LIMIT: '_limit',
    SORT: '_sort',
    ORDER: '_order',
    NAME_LIKE: 'name_like',
    CATEGORY: 'category',
    DIFFICULTY: 'difficulty',
    PREP_TIME_GTE: 'prepTime_gte',
    PREP_TIME_LTE: 'prepTime_lte',
    COOK_TIME_GTE: 'cookTime_gte',
    COOK_TIME_LTE: 'cookTime_lte',
    CALORIES_GTE: 'calories_gte',
    CALORIES_LTE: 'calories_lte',
  },
} as const;
