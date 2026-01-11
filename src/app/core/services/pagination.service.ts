import { Injectable, signal, computed } from '@angular/core';

export interface PaginationState<T> {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    cache: Map<number, T[]>;
}

/**
 * Service to manage pagination state and caching
 */
@Injectable({
    providedIn: 'root'
})
export class PaginationService<T = any> {
    private pagesCache = signal<Map<number, T[]>>(new Map());
    private _currentPage = signal<number>(1);
    private _totalItems = signal<number>(0);
    private _pageSize: number = 6;
    private isFetching = signal<boolean>(false);

    // Public readonly signals
    readonly currentPage = this._currentPage.asReadonly();
    readonly totalItems = this._totalItems.asReadonly();

    readonly totalPages = computed(() => {
        return Math.ceil(this._totalItems() / this._pageSize);
    });

    readonly pages = computed(() => {
        const total = this.totalPages();
        return Array.from({ length: total }, (_, i) => i + 1);
    });

    readonly canGoNext = computed(() => {
        return this._currentPage() * this._pageSize < this._totalItems();
    });

    readonly canGoPrev = computed(() => {
        return this._currentPage() > 1;
    });

    /**
     * Set the page size
     */
    setPageSize(size: number): void {
        this._pageSize = size;
    }

    /**
     * Get the page size
     */
    getPageSize(): number {
        return this._pageSize;
    }

    /**
     * Get cached page
     */
    getPage(page: number): T[] | undefined {
        return this.pagesCache().get(page);
    }

    /**
     * Find an item in the cache across all pages
     * @param predicate - Function to test each item
     */
    findInCache(predicate: (item: T) => boolean): T | undefined {
        for (const items of this.pagesCache().values()) {
            const found = items.find(predicate);
            if (found) {
                return found;
            }
        }
        return undefined;
    }

    /**
     * Cache a page
     */
    cachePage(page: number, items: T[]): void {
        this.pagesCache.update(cache => {
            const newCache = new Map(cache);
            newCache.set(page, items);
            return newCache;
        });
    }

    /**
     * Clear all cached pages
     */
    clearCache(): void {
        this.pagesCache.set(new Map());
    }

    /**
     * Set total items count
     */
    setTotalItems(total: number): void {
        this._totalItems.set(total);
    }

    /**
     * Set current page
     */
    setCurrentPage(page: number): void {
        if (page >= 1) {
            this._currentPage.set(page);
        }
    }

    /**
     * Go to next page
     */
    nextPage(): boolean {
        if (this.canGoNext()) {
            this._currentPage.set(this._currentPage() + 1);
            return true;
        }
        return false;
    }

    /**
     * Go to previous page
     */
    prevPage(): boolean {
        if (this.canGoPrev()) {
            this._currentPage.set(this._currentPage() - 1);
            return true;
        }
        return false;
    }

    /**
     * Check if currently fetching
     */
    isFetchingPage(): boolean {
        return this.isFetching();
    }

    /**
     * Set fetching state
     */
    setFetching(fetching: boolean): void {
        this.isFetching.set(fetching);
    }

    /**
     * Reset pagination state
     */
    reset(): void {
        this._currentPage.set(1);
        this._totalItems.set(0);
        this.clearCache();
        this.isFetching.set(false);
    }
}
