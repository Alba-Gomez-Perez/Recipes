import { Inject, Injectable, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { APP_CONSTANTS, FILTER_CATEGORIES, STORAGE_KEYS } from '../constants';
import { RecipeCategory, RecipeDifficulty } from '../models/recipe.model';

export interface RecipeFilters {
    name: string;
    category: RecipeCategory | null;
}

@Injectable({
    providedIn: 'root'
})
export class FilterService {
    private readonly STORAGE_KEY = STORAGE_KEYS.RECIPE_FILTERS;

    private readonly DEFAULT_FILTERS: RecipeFilters = {
        name: '',
        category: null
    };

    private readonly isBrowser: boolean;

    // Expose signal directly
    readonly filters: WritableSignal<RecipeFilters>;

    /**
     * Constructor
     * @param platformId - Platform ID to check if running in browser
     */
    constructor(@Inject(PLATFORM_ID) platformId: object) {
        this.isBrowser = isPlatformBrowser(platformId);
        this.filters = signal<RecipeFilters>(this.loadFilters());
    }

    /**
     * Loads filters from local storage if available
     * @returns Saved filters mixed with defaults, or just defaults
     */
    private loadFilters(): RecipeFilters {
        if (!this.isBrowser) return this.DEFAULT_FILTERS;
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                return { ...this.DEFAULT_FILTERS, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Error parsing saved filters', e);
            }
        }
        return this.DEFAULT_FILTERS;
    }

    /**
     * Updates the current filters state and persists to local storage
     * @param filters - Partial object containing filter updates
     */
    updateFilters(filters: Partial<RecipeFilters>) {
        const newState = { ...this.filters(), ...filters };
        this.filters.set(newState);
        if (this.isBrowser) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newState));
        }
    }

    /**
     * Gets the current value of filters signal
     */
    get currentFilters() {
        return this.filters();
    }
}
