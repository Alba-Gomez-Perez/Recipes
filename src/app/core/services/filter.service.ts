import {Inject, Injectable, PLATFORM_ID, signal} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {APP_CONSTANTS, FILTER_CATEGORIES, STORAGE_KEYS} from '../constants';

export interface PetFilters {
    name: string;
    kind: 'dog' | 'cat' | null;
    weight: 'small' | 'medium' | 'large' | 'all';
    height: 'short' | 'average' | 'tall' | 'all';
    length: 'short' | 'average' | 'long' | 'all';
}

export interface PetSort {
    sortBy: string;
    sortOrder?: 'asc' | 'desc';
}

@Injectable({
    providedIn: 'root'
})
export class FilterService {
    private readonly STORAGE_KEY = STORAGE_KEYS.PET_FILTERS;
    private readonly SORT_STORAGE_KEY = STORAGE_KEYS.PET_SORT;

    private readonly DEFAULT_FILTERS: PetFilters = {
        name: '',
        kind: null,
        weight: FILTER_CATEGORIES.WEIGHT.ALL,
        height: FILTER_CATEGORIES.HEIGHT.ALL,
        length: FILTER_CATEGORIES.LENGTH.ALL
    };

    private readonly DEFAULT_SORT: PetSort = {
        sortBy: APP_CONSTANTS.DEFAULT_SORT.SORT_BY,
        sortOrder: APP_CONSTANTS.DEFAULT_SORT.SORT_ORDER
    };

    private readonly isBrowser: boolean;

    // Expose signals directly
    readonly filters: any;
    readonly sort: any;

    /**
     * Constructor
     * @param platformId - Platform ID to check if running in browser
     */
    constructor(@Inject(PLATFORM_ID) platformId: object) {
        this.isBrowser = isPlatformBrowser(platformId);
        this.filters = signal<PetFilters>(this.loadFilters());
        this.sort = signal<PetSort>(this.loadSort());
    }

    /**
     * Loads filters from local storage if available
     * @returns Saved filters mixed with defaults, or just defaults
     */
    private loadFilters(): PetFilters {
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
     * Loads sort configuration from local storage if available
     * @returns Saved sort mixed with defaults, or just defaults
     */
    private loadSort(): PetSort {
        if (!this.isBrowser) return this.DEFAULT_SORT;
        const saved = localStorage.getItem(this.SORT_STORAGE_KEY);
        if (saved) {
            try {
                return { ...this.DEFAULT_SORT, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Error parsing saved sort', e);
            }
        }
        return this.DEFAULT_SORT;
    }

    /**
     * Updates the current filters state and persists to local storage
     * @param filters - Partial object containing filter updates
     */
    updateFilters(filters: Partial<PetFilters>) {
        const newState = { ...this.filters(), ...filters };
        this.filters.set(newState);
        if (this.isBrowser) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newState));
        }
    }

    /**
     * Updates the current sort state and persists to local storage
     * @param sort - Partial object containing sort updates
     */
    updateSort(sort: Partial<PetSort>) {
        const newState = { ...this.sort(), ...sort };
        this.sort.set(newState);
        if (this.isBrowser) {
            localStorage.setItem(this.SORT_STORAGE_KEY, JSON.stringify(newState));
        }
    }

    /**
     * Gets the current value of filters signal
     */
    get currentFilters() {
        return this.filters();
    }

    /**
     * Gets the current value of sort signal
     */
    get currentSort() {
        return this.sort();
    }
}
