import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Recipe } from "../models/recipe.model";
import { API_CONSTANTS, FILTER_THRESHOLDS, FILTER_CATEGORIES } from "../constants";
import { RecipeFilters } from './filter.service';
import { ToastService } from './toast.service';
import { PaginationService } from './pagination.service';


export interface GetRecipesResponse {
    recipes: Recipe[];
    totalCount: number;
}

class RecipeQueryBuilder {
    private params = new HttpParams();

    withPagination(page?: number, limit?: number): this {
        if (page !== undefined && limit !== undefined) {
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.PAGE, page.toString());
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.LIMIT, limit.toString());
        }
        return this;
    }

    withFilters(filters?: RecipeFilters): this {
        if (!filters) {
            return this;
        }

        if (filters.name) {
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.NAME_LIKE, filters.name);
        }

        if (filters.category) {
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.CATEGORY, filters.category);
        }

        return this;
    }


    build(): HttpParams {
        return this.params;
    }
}


/**
 * Service to get recipes from API
 */
@Injectable({
    providedIn: 'root'
})
export class RecipesService {
    private readonly http = inject(HttpClient);
    private readonly toastService = inject(ToastService);
    private readonly paginationService = inject(PaginationService);

    public readonly refreshSignal = signal<number>(0);

    private readonly platformId = inject(PLATFORM_ID);
    private readonly apiUrl = API_CONSTANTS.BASE_URL;

    private get isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    /**
     * Get recipes with pagination and filters
     * @param page - The page number
     * @param limit - The number of recipes per page
     * @param filters - Optional filters
     * @returns Observable with recipes and total count
     */
    getRecipes(page?: number, limit?: number, filters?: RecipeFilters): Observable<GetRecipesResponse> {
        // Skip API calls during SSR
        if (!this.isBrowser) {
            return of({ recipes: [], totalCount: 0 });
        }

        const params = new RecipeQueryBuilder()
            .withPagination(page, limit)
            .withFilters(filters)
            .build()
            .append('_t', Date.now().toString());

        return this.http.get<Recipe[]>(this.apiUrl, {
            params,
            observe: 'response'
        }).pipe(
            map(response => {
                const totalCountHeader = response.headers.get(API_CONSTANTS.HEADERS.TOTAL_COUNT) ||
                    response.headers.get('x-total-count');
                const data: any = response.body;

                let recipes: Recipe[] = [];
                if (Array.isArray(data)) {
                    recipes = data;
                } else if (data?.data) {
                    recipes = data.data;
                } else if (data?.recipes) {
                    // Handle static db.json structure
                    recipes = data.recipes;
                }

                // Client-side filtering
                if (filters) {
                    if (filters.name) {
                        const searchTerm = filters.name.toLowerCase();
                        recipes = recipes.filter(recipe => {
                            const nameMatch = recipe.name.toLowerCase().includes(searchTerm);
                            const ingredientMatch = recipe.ingredients?.some(ingredient =>
                                ingredient.toLowerCase().includes(searchTerm)
                            ) || false;
                            return nameMatch || ingredientMatch;
                        });
                    }

                    if (filters.category) {
                        recipes = recipes.filter(recipe => recipe.category === filters.category);
                    }
                }

                recipes.forEach(recipe => {
                    // Rating removed
                });

                // json-server v1 returns 'items' in the body
                let totalCount = data?.items ?? (totalCountHeader ? parseInt(totalCountHeader, 10) : recipes.length);
                totalCount = isNaN(totalCount) ? recipes.length : totalCount;

                // Client-side pagination (if the API didn't do it)
                // Logic: Exists filters OR (pagination requested AND returned items > limit)
                const serverIgnoredPagination = page !== undefined && limit !== undefined && recipes.length > limit;

                if (serverIgnoredPagination) {
                    // Update totalCount to reflect the full dataset size since we are paginating client-side
                    totalCount = recipes.length;

                    const startIndex = (page - 1) * limit;
                    const endIndex = startIndex + limit;
                    recipes = recipes.slice(startIndex, endIndex);
                }

                return {
                    recipes,
                    totalCount
                };
            }),
            catchError((error: HttpErrorResponse) => {
                return this.handleError<GetRecipesResponse>('getRecipes', { recipes: [], totalCount: 0 }, error);
            })
        );
    }

    /**
     * Calculate the recipe of the day index based on the current date
     * @param totalCount - Total number of recipes
     * @returns The index (0-based) of the recipe of the day
     */
    private calculateRecipeOfTheDayIndex(totalCount: number): number {
        if (totalCount === 0) return -1;

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const dateSeed = year * 10000 + month * 100 + day;

        return dateSeed % totalCount;
    }

    /**
     * Get the recipe of the day
     * Algorithm:
     * 1. Fetch first page to get total count
     * 2. Calculate which recipe should be recipe of the day based on date
     * 3. If it's in first page, return it
     * 4. Otherwise, fetch the specific page containing it
     * @param pageSize - Page size to use for fetching
     * @param preloadedData - Optional data from a previous search (must be page 1 and unfiltered)
     * @returns Observable with the recipe of the day or null
     */
    getRecipeOfTheDay(pageSize: number, preloadedData?: { totalCount: number, recipes: Recipe[] }): Observable<Recipe | null> {
        // Skip API calls during SSR
        if (!this.isBrowser) {
            return of(null);
        }

        const source$ = preloadedData
            ? of(preloadedData)
            : this.getRecipes(1, pageSize);

        return source$.pipe(
            switchMap(({ recipes: firstPageRecipes, totalCount }) => {
                if (totalCount === 0) {
                    return of(null);
                }

                const recipeOfTheDayIndex = this.calculateRecipeOfTheDayIndex(totalCount);

                // If recipe is in first page, return it
                if (recipeOfTheDayIndex < firstPageRecipes.length) {
                    return of(firstPageRecipes[recipeOfTheDayIndex]);
                }

                // Calculate which page contains the recipe
                const targetPage = Math.floor(recipeOfTheDayIndex / pageSize) + 1;
                const positionInPage = recipeOfTheDayIndex % pageSize;

                // Fetch the target page
                return this.getRecipes(targetPage, pageSize).pipe(
                    map(({ recipes: targetPageRecipes }) => {
                        if (targetPageRecipes.length > positionInPage) {
                            return targetPageRecipes[positionInPage];
                        }
                        // Fallback to first recipe if something went wrong
                        return null;
                    })
                );
            }),
            catchError(() => of(null))
        );
    }

    /**
     * Get a recipe by id
     * @param id - The id of the recipe
     * @returns Observable with the recipe found, or undefined if not found
     */
    getRecipeById(id: number | string): Observable<Recipe | undefined> {
        // Skip API calls during SSR
        if (!this.isBrowser) {
            return of(undefined);
        }

        // Check local cache first
        const cachedRecipe = this.paginationService.findInCache(recipe => String(recipe.id) === String(id));
        if (cachedRecipe) {
            return of(cachedRecipe);
        }

        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => {
                // If it returns the full db.json object (static deployment)
                if (response && response.recipes && Array.isArray(response.recipes)) {
                    return response.recipes.find((r: Recipe) => String(r.id) === String(id));
                }
                // If it returns a single recipe (standard API)
                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                console.error(`recipesService.getRecipeById:`, error);
                if (error.status === 404) {
                    this.toastService.error('errorRecipeNotFound');
                } else if (error.status === 0 || error.error instanceof ProgressEvent) {
                    this.toastService.error('errorNetwork');
                } else {
                    this.toastService.error('errorFetchingRecipe');
                }
                // Return undefined instead of throwing
                return of(undefined);
            })
        );
    }

    /**
     * Create a new recipe
     * @param recipe - The recipe data without ID
     * @returns Observable with the created recipe
     */
    createRecipe(recipe: Omit<Recipe, 'id'>): Observable<Recipe | undefined> {
        // Skip API calls during SSR
        if (!this.isBrowser) {
            return of(undefined);
        }

        return this.http.post<Recipe>(this.apiUrl, recipe).pipe(
            map(newRecipe => {
                this.toastService.success('recipeCreatedSuccess');
                this.paginationService.clearCache();
                this.refreshSignal.update((v: number) => v + 1);
                return newRecipe;
            }),
            catchError((error: HttpErrorResponse) => {
                console.error(`recipesService.createRecipe:`, error);
                this.toastService.error('errorCreatingRecipe');
                return of(undefined);
            })
        );
    }

    /**
     * Handle HTTP errors
     * @param operation - Name of the operation that failed
     * @param result - Optional value to return as the observable result
     * @param error - The HTTP error response
     */
    private handleError<T>(operation: string, result: T, error: HttpErrorResponse): Observable<T> {
        console.error(`recipesService.${operation}:`, error);

        // Show user-friendly error message
        if (error.status === 0 || error.error instanceof ProgressEvent) {
            // Network error
            this.toastService.error('errorNetwork');
        } else if (error.status >= 500) {
            // Server error
            this.toastService.error('errorFetchingRecipes');
        } else if (error.status >= 400) {
            // Client error
            this.toastService.error('errorFetchingRecipes');
        } else {
            // Other errors
            this.toastService.error('errorGeneric');
        }

        // Return a safe result
        return of(result);
    }
}
