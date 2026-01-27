import { Component, effect, inject, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { RecipesService } from "../../core/services/recipes.service";
import type { Recipe } from '../../core/models/recipe.model';
import { FilterService, RecipeFilters } from '../../core/services/filter.service';
import { ToastService } from '../../core/services/toast.service';
import { PaginationService } from '../../core/services/pagination.service';
import { RecipeCardComponent } from '../../shared/components/recipe-card/recipe-card.component';
import { APP_CONSTANTS } from '../../core/constants';

@Component({
    selector: 'app-recipe-list',
    standalone: true,
    imports: [CommonModule, RecipeCardComponent, TranslateModule],
    templateUrl: './recipe-list.component.html',
    styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent {
    public filterService = inject(FilterService);
    public paginationService = inject(PaginationService<Recipe>);
    private router = inject(Router);
    private recipesService = inject(RecipesService);
    private toastService = inject(ToastService);

    recipes: Recipe[] = [];
    recipeOfTheDay: Recipe | null = null;
    isLoading: boolean = true;

    // --- Effect Initialization Flags ---
    private isFiltersInitialized = false;
    private isPageInitialized = false;

    constructor() {
        // Set page size for pagination
        this.paginationService.setPageSize(APP_CONSTANTS.DEFAULT_PAGE_SIZE);

        // --- Effects for Data Fetching Logic ---
        effect(() => {
            this.filterService.filters(); // Dependency on filters signal

            if (!this.isFiltersInitialized) {
                this.isFiltersInitialized = true;
                return;
            }

            // When filters change, reset pagination to page 1 and clear the cache
            const wasPageOne = untracked(() => this.paginationService.currentPage() === 1);
            this.paginationService.reset();

            // If we were already on page 1, the page change effect won't fire,
            // so we need to trigger the fetch manually for page 1.
            if (wasPageOne) {
                void this.fetchPaginatedRecipes(1);
            }
        });

        effect(() => {
            const page = this.paginationService.currentPage(); // Dependency on current page signal
            this.recipesService.refreshSignal(); // Dependency on refresh signal

            if (!this.isPageInitialized) {
                this.isPageInitialized = true;
            }

            void this.fetchPaginatedRecipes(page);
        });
    }

    async loadRecipeOfTheDay(preloadedData?: { totalCount: number, recipes: Recipe[] }) {
        try {
            this.recipeOfTheDay = await firstValueFrom(
                this.recipesService.getRecipeOfTheDay(this.paginationService.getPageSize(), preloadedData)
            );
        } catch (error) {
            // Error is handled by the service, which shows a toast message.
            this.recipeOfTheDay = null;
        }
    }

    private areFiltersEmpty(filters: RecipeFilters): boolean {
        return !filters.name && !filters.category;
    }

    async fetchPaginatedRecipes(page: number) {
        // Use cached page if available to avoid unnecessary API calls
        const cachedPage = untracked(() => this.paginationService.getPage(page));
        if (cachedPage) {
            this.recipes = cachedPage;
            this.isLoading = false;
            if (!this.recipeOfTheDay) {
                void this.loadRecipeOfTheDay();
            }
            return;
        }

        // Prevent concurrent fetches
        if (untracked(() => this.paginationService.isFetchingPage())) {
            return;
        }

        const filters = untracked(() => this.filterService.filters());

        this.isLoading = true;
        this.paginationService.setFetching(true);
        try {
            const { recipes, totalCount } = await firstValueFrom(
                this.recipesService.getRecipes(
                    page,
                    untracked(() => this.paginationService.getPageSize()),
                    filters
                )
            );

            this.paginationService.setTotalItems(totalCount);

            // Load Recipe of the Day if it hasn't been loaded yet
            if (!this.recipeOfTheDay) {
                if (page === 1 && this.areFiltersEmpty(filters)) {
                    // Reuse data if on the first page with no filters
                    void this.loadRecipeOfTheDay({ totalCount, recipes });
                } else {
                    void this.loadRecipeOfTheDay();
                }
            }

            // If the current page has no recipes (e.g., beyond the last page), go back one page
            if (recipes.length === 0 && page > 1) {
                this.paginationService.setCurrentPage(page - 1);
                this.toastService.info('noMoreRecipes');
                return;
            }

            this.paginationService.cachePage(page, recipes);
            this.recipes = recipes;
        } catch (error) {
            // Errors are handled by the service. If no recipes are cached, show an empty list.
            if (!this.paginationService.getPage(1)) {
                this.recipes = [];
            }
        } finally {
            this.isLoading = false;
            this.paginationService.setFetching(false);
        }
    }

    get paginatedRecipes(): Recipe[] {
        return this.recipes;
    }

    goToPage(page: number) {
        this.paginationService.setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    nextPage() {
        if (!this.paginationService.nextPage()) {
            this.toastService.info('noMoreRecipes');
        }
    }

    prevPage() {
        this.paginationService.prevPage();
    }

    goToDetail(id: number) {
        void this.router.navigate(['/recipes', id]);
    }
}
