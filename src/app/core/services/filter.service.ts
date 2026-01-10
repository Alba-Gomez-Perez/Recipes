import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface PetFilters {
    name: string;
    kind: 'dog' | 'cat' | null;
    weight: string; // 'small' | 'medium' | 'large' | 'all'
    height: string; // 'short' | 'average' | 'tall' | 'all'
    length: string; // 'short' | 'average' | 'long' | 'all'
}

export interface PetSort {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

@Injectable({
    providedIn: 'root'
})
export class FilterService {
    private readonly STORAGE_KEY = 'fever_pet_filters';
    private readonly SORT_STORAGE_KEY = 'fever_pet_sort';

    private readonly DEFAULT_FILTERS: PetFilters = {
        name: '',
        kind: null,
        weight: 'all',
        height: 'all',
        length: 'all'
    };

    private readonly DEFAULT_SORT: PetSort = {
        sortBy: 'name',
        sortOrder: 'asc'
    };

    private readonly isBrowser: boolean;

    // Expose signals directly
    readonly filters: any;
    readonly sort: any;

    constructor(@Inject(PLATFORM_ID) platformId: object) {
        this.isBrowser = isPlatformBrowser(platformId);
        this.filters = signal<PetFilters>(this.loadFilters());
        this.sort = signal<PetSort>(this.loadSort());
    }

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

    updateFilters(filters: Partial<PetFilters>) {
        const newState = { ...this.filters(), ...filters };
        this.filters.set(newState);
        if (this.isBrowser) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newState));
        }
    }

    updateSort(sort: Partial<PetSort>) {
        const newState = { ...this.sort(), ...sort };
        this.sort.set(newState);
        if (this.isBrowser) {
            localStorage.setItem(this.SORT_STORAGE_KEY, JSON.stringify(newState));
        }
    }

    get currentFilters() {
        return this.filters();
    }

    get currentSort() {
        return this.sort();
    }
}
