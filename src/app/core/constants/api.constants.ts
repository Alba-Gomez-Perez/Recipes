/**
 * API-related constants
 */
export const API_CONSTANTS = {
  /** Base URL for the pets API */
  BASE_URL: 'https://my-json-server.typicode.com/Feverup/fever_pets_data/pets',

  /** Error messages */
  ERROR_MESSAGES: {
    FETCH_PETS: 'Error al obtener los datos',
    FETCH_PET_BY_ID: 'Error al obtener el pet',
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
    KIND: 'kind',
    WEIGHT_LT: 'weight_lt',
    WEIGHT_GTE: 'weight_gte',
    WEIGHT_LTE: 'weight_lte',
    WEIGHT_GT: 'weight_gt',
    HEIGHT_LT: 'height_lt',
    HEIGHT_GTE: 'height_gte',
    HEIGHT_LTE: 'height_lte',
    HEIGHT_GT: 'height_gt',
    LENGTH_LT: 'length_lt',
    LENGTH_GTE: 'length_gte',
    LENGTH_LTE: 'length_lte',
    LENGTH_GT: 'length_gt',
  },
} as const;
