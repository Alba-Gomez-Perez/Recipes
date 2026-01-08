import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PetFilters {
    name: string;
    kind: 'dog' | 'cat' | null;
    weight: string; // 'small' | 'medium' | 'large' | 'all'
    height: string; // 'short' | 'average' | 'tall' | 'all'
    length: string; // 'short' | 'average' | 'long' | 'all'
}

@Injectable({
    providedIn: 'root'
})
export class FilterService {
    private _filters = new BehaviorSubject<PetFilters>({
        name: '',
        kind: null,
        weight: 'all',
        height: 'all',
        length: 'all'
    });

    filters$ = this._filters.asObservable();

    updateFilters(filters: Partial<PetFilters>) {
        this._filters.next({ ...this._filters.value, ...filters });
    }

    get currentFilters() {
        return this._filters.value;
    }
}
