import { TestBed } from '@angular/core/testing';
import { FilterService, PetFilters, PetSort } from './filter.service';
import { PLATFORM_ID } from '@angular/core';
import { STORAGE_KEYS, APP_CONSTANTS, FILTER_CATEGORIES } from '../constants';

describe('FilterService', () => {
    let service: FilterService;
    const STORAGE_KEY = STORAGE_KEYS.PET_FILTERS;
    const SORT_STORAGE_KEY = STORAGE_KEYS.PET_SORT;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({
            providers: [
                { provide: PLATFORM_ID, useValue: 'browser' },
                FilterService
            ]
        });
        service = TestBed.inject(FilterService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with default filters if nothing in localStorage', () => {
        expect(service.filters()).toEqual({
            name: '',
            kind: null,
            weight: FILTER_CATEGORIES.WEIGHT.ALL,
            height: FILTER_CATEGORIES.HEIGHT.ALL,
            length: FILTER_CATEGORIES.LENGTH.ALL
        });
    });

    it('should initialize with default sort if nothing in localStorage', () => {
        expect(service.sort()).toEqual({
            sortBy: APP_CONSTANTS.DEFAULT_SORT.SORT_BY,
            sortOrder: APP_CONSTANTS.DEFAULT_SORT.SORT_ORDER
        });
    });

    it('should update filters and save to localStorage', () => {
        const newFilters: Partial<PetFilters> = { name: 'Rex', kind: 'dog' };
        service.updateFilters(newFilters);

        expect(service.filters().name).toBe('Rex');
        expect(service.filters().kind).toBe('dog');

        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
        expect(saved.name).toBe('Rex');
        expect(saved.kind).toBe('dog');
    });

    it('should update sort and save to localStorage', () => {
        const newSort: Partial<PetSort> = { sortBy: 'weight', sortOrder: 'desc' };
        service.updateSort(newSort);

        expect(service.sort().sortBy).toBe('weight');
        expect(service.sort().sortOrder).toBe('desc');

        const saved = JSON.parse(localStorage.getItem(SORT_STORAGE_KEY)!);
        expect(saved.sortBy).toBe('weight');
        expect(saved.sortOrder).toBe('desc');
    });

    it('should load filters from localStorage on initialization', () => {
        const savedFilters = { name: 'Buddy', kind: 'cat' };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedFilters));

        // Re-inject service to trigger loadFilters
        const newService = TestBed.runInInjectionContext(() => new FilterService('browser' as any));
        expect(newService.filters().name).toBe('Buddy');
        expect(newService.filters().kind).toBe('cat');
    });

    it('should load sort from localStorage on initialization', () => {
        const savedSort = { sortBy: 'height', sortOrder: 'desc' };
        localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(savedSort));

        const newService = TestBed.runInInjectionContext(() => new FilterService('browser' as any));
        expect(newService.sort().sortBy).toBe('height');
        expect(newService.sort().sortOrder).toBe('desc');
    });

    it('should handle invalid JSON in localStorage and log exact error', () => {
        spyOn(console, 'error');
        localStorage.setItem(STORAGE_KEY, 'invalid-json');
        localStorage.setItem(SORT_STORAGE_KEY, 'invalid-json');

        const newService = TestBed.runInInjectionContext(() => new FilterService('browser' as any));
        expect(newService.filters().name).toBe('');
        expect(newService.sort().sortBy).toBe('name');
        expect(console.error).toHaveBeenCalledWith('Error parsing saved filters', jasmine.anything());
        expect(console.error).toHaveBeenCalledWith('Error parsing saved sort', jasmine.anything());
    });

    it('should partially update filters and preserve other fields in localStorage', () => {
        const initialFilters: PetFilters = {
            name: 'Initial',
            kind: 'cat',
            weight: 'small',
            height: 'short',
            length: 'short'
        };
        service.updateFilters(initialFilters);

        service.updateFilters({ name: 'Updated' });
        expect(service.filters().name).toBe('Updated');
        expect(service.filters().kind).toBe('cat');

        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
        expect(saved.name).toBe('Updated');
        expect(saved.kind).toBe('cat');
    });

    it('should partially update sort and preserve other fields in localStorage', () => {
        service.updateSort({ sortBy: 'weight', sortOrder: 'desc' });
        service.updateSort({ sortBy: 'height' });

        expect(service.sort().sortBy).toBe('height');
        expect(service.sort().sortOrder).toBe('desc');

        const saved = JSON.parse(localStorage.getItem(SORT_STORAGE_KEY)!);
        expect(saved.sortBy).toBe('height');
        expect(saved.sortOrder).toBe('desc');
    });

    it('should merge saved filters with default filters', () => {
        const savedFilters = { name: 'Buddy' }; // missing other fields
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedFilters));

        const newService = TestBed.runInInjectionContext(() => new FilterService('browser' as any));
        expect(newService.filters().name).toBe('Buddy');
        expect(newService.filters().kind).toBeNull(); // default
        expect(newService.filters().weight).toBe(FILTER_CATEGORIES.WEIGHT.ALL); // default
    });

    it('should merge saved sort with default sort', () => {
        const savedSort = { sortBy: 'weight' }; // missing sortOrder
        localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(savedSort));

        const newService = TestBed.runInInjectionContext(() => new FilterService('browser' as any));
        expect(newService.sort().sortBy).toBe('weight');
        expect(newService.sort().sortOrder).toBe('asc'); // default
    });

    it('should provide getters for current state', () => {
        expect(service.currentFilters).toEqual(service.filters());
        expect(service.currentSort).toEqual(service.sort());
    });

    describe('Environment: Server', () => {
        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                providers: [
                    { provide: PLATFORM_ID, useValue: 'server' },
                    FilterService
                ]
            });
            service = TestBed.inject(FilterService);
        });

        it('should use default filters on server initialization', () => {
            expect(service.currentFilters.name).toBe('');
        });

        it('should use default filters on server even if localStorage has data', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: 'ShouldNotLoad' }));
            const serverService = TestBed.runInInjectionContext(() => new FilterService('server' as any));
            expect(serverService.filters().name).toBe('');
        });

        it('should use default sort on server even if localStorage has data', () => {
            localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify({ sortBy: 'weight' }));
            const serverService = TestBed.runInInjectionContext(() => new FilterService('server' as any));
            expect(serverService.sort().sortBy).toBe('name');
        });

        it('should not save to localStorage on server during updates', () => {
            spyOn(localStorage, 'setItem');
            service.updateFilters({ name: 'Rex' });
            expect(localStorage.setItem).not.toHaveBeenCalled();

            service.updateSort({ sortBy: 'weight' });
            expect(localStorage.setItem).not.toHaveBeenCalled();
        });
    });
});
