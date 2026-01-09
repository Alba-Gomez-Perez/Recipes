import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PetFilters {
    name: string;
    kind: 'dog' | 'cat' | null;
    weight: string; // 'small' | 'medium' | 'large' | 'all'
    height: string; // 'short' | 'average' | 'tall' | 'all'
    length: string; // 'short' | 'average' | 'long' | 'all'
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    page: number;
}

@Injectable({
    providedIn: 'root'
})
export class FilterService {
    private readonly STORAGE_KEY = 'fever_pet_filters';
    private readonly DEFAULT_FILTERS: PetFilters = {
        name: '',
        kind: null,
        weight: 'all',
        height: 'all',
        length: 'all',
        sortBy: 'name',
        sortOrder: 'asc',
        page: 1
    };

    private _filters = new BehaviorSubject<PetFilters>(this.loadFilters());

    filters$ = this._filters.asObservable();

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

    updateFilters(filters: Partial<PetFilters>) {
        const newState = { ...this._filters.value, ...filters };
        this._filters.next(newState);
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newState));
        }
    }

    get currentFilters() {
        return this._filters.value;
    }
}
