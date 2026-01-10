import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

    private _filters = new BehaviorSubject<PetFilters>(this.loadFilters());
    private _sort = new BehaviorSubject<PetSort>(this.loadSort());

    filters$ = this._filters.asObservable();
    sort$ = this._sort.asObservable();

    private loadFilters(): PetFilters {
        if (typeof window === 'undefined') return this.DEFAULT_FILTERS;
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
        if (typeof window === 'undefined') return this.DEFAULT_SORT;
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
        const newState = { ...this._filters.value, ...filters };
        this._filters.next(newState);
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newState));
        }
    }

    updateSort(sort: Partial<PetSort>) {
        const newState = { ...this._sort.value, ...sort };
        this._sort.next(newState);
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.SORT_STORAGE_KEY, JSON.stringify(newState));
        }
    }

    get currentFilters() {
        return this._filters.value;
    }

    get currentSort() {
        return this._sort.value;
    }
}
