export type RecipeCategory = 'dessert' | 'fish' | 'meat' | 'legume' | 'rice' | 'vegetables' | 'doughs' | 'others' | 'pasta';
export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

export interface Recipe {
  /** Recipe identity */
  id: number;

  /** Recipe name */
  name: string;

  /** Recipe category */
  category: RecipeCategory;

  /** Difficulty level */
  difficulty: RecipeDifficulty;

  /** Preparation time (minutes) */
  prepTime: number;

  /** Cooking time (minutes) */
  cookTime: number;

  /** Number of servings */
  servings: number;

  /** Calories per serving */
  calories: number;

  /** Recipe image */
  photo_url: string;

  /** Recipe description */
  description: string;

  /** Recipe instructions */
  instructions?: string;

  /** Recipe ingredients */
  ingredients?: string[];

  /** Rating (calculated) */
  rating?: string;
}
