import {TestBed} from '@angular/core/testing';
import {PaginationService} from './pagination.service';

describe('PaginationService', () => {
    let service: PaginationService<any>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [PaginationService]
        });
        service = TestBed.inject(PaginationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Page Size', () => {
        it('should set and get page size', () => {
            const newSize = 10;
            service.setPageSize(newSize);
            expect(service.getPageSize()).toBe(newSize);
        });
    });

    describe('Cache Management', () => {
        it('should cache and retrieve a page', () => {
            const page = 1;
            const data = [{ id: 1 }];
            service.cachePage(page, data);
            expect(service.getPage(page)).toEqual(data);
        });

        it('should return undefined for a non-cached page', () => {
            expect(service.getPage(99)).toBeUndefined();
        });

        it('should clear the cache', () => {
            service.cachePage(1, [{ id: 1 }]);
            service.clearCache();
            expect(service.getPage(1)).toBeUndefined();
        });
    });

    describe('findInCache', () => {
        it('should return item if found in any page', () => {
            const item1 = { id: 1, name: 'Pet 1' };
            const item2 = { id: 2, name: 'Pet 2' };

            service.cachePage(1, [item1]);
            service.cachePage(2, [item2]);

            const result = service.findInCache(item => item.id === 2);
            expect(result).toEqual(item2);
        });

        it('should return undefined if item not found', () => {
            const item1 = { id: 1, name: 'Pet 1' };
            service.cachePage(1, [item1]);

            const result = service.findInCache(item => item.id === 3);
            expect(result).toBeUndefined();
        });
    });

    describe('State Management', () => {
        it('should update current page', () => {
            service.setCurrentPage(2);
            expect(service.currentPage()).toBe(2);
        });

        it('should not set current page to a value less than 1', () => {
            service.setCurrentPage(0);
            expect(service.currentPage()).toBe(1);
        });

        it('should update total items', () => {
            service.setTotalItems(100);
            expect(service.totalItems()).toBe(100);
        });

        it('should set and get fetching state', () => {
            expect(service.isFetchingPage()).toBe(false);
            service.setFetching(true);
            expect(service.isFetchingPage()).toBe(true);
        });
    });

    describe('Navigation', () => {
        beforeEach(() => {
            service.setTotalItems(20);
            service.setPageSize(5);
        });

        it('should go to the next page', () => {
            service.setCurrentPage(1);
            const success = service.nextPage();
            expect(success).toBe(true);
            expect(service.currentPage()).toBe(2);
        });

        it('should not go to the next page if on the last page', () => {
            service.setCurrentPage(4);
            const success = service.nextPage();
            expect(success).toBe(false);
            expect(service.currentPage()).toBe(4);
        });

        it('should go to the previous page', () => {
            service.setCurrentPage(2);
            const success = service.prevPage();
            expect(success).toBe(true);
            expect(service.currentPage()).toBe(1);
        });

        it('should not go to the previous page if on the first page', () => {
            service.setCurrentPage(1);
            const success = service.prevPage();
            expect(success).toBe(false);
            expect(service.currentPage()).toBe(1);
        });
    });

    describe('Computed Signals', () => {
        it('should calculate total pages correctly', () => {
            service.setPageSize(10);
            service.setTotalItems(100);
            expect(service.totalPages()).toBe(10);

            service.setTotalItems(95);
            expect(service.totalPages()).toBe(10);

            service.setTotalItems(0);
            expect(service.totalPages()).toBe(0);
        });

        it('should generate pages array correctly', () => {
            service.setPageSize(10);
            service.setTotalItems(30);
            expect(service.pages()).toEqual([1, 2, 3]);
        });

        it('should compute canGoNext correctly', () => {
            service.setPageSize(10);
            service.setTotalItems(20);

            service.setCurrentPage(1);
            expect(service.canGoNext()).toBe(true);

            service.setCurrentPage(2);
            expect(service.canGoNext()).toBe(false);
        });

        it('should compute canGoPrev correctly', () => {
            service.setCurrentPage(1);
            expect(service.canGoPrev()).toBe(false);

            service.setCurrentPage(2);
            expect(service.canGoPrev()).toBe(true);
        });
    });

    describe('Reset', () => {
        it('should reset the state', () => {
            service.setTotalItems(100);
            service.setCurrentPage(5);
            service.cachePage(1, [{ id: 1 }]);
            service.setFetching(true);

            service.reset();

            expect(service.currentPage()).toBe(1);
            expect(service.totalItems()).toBe(0);
            expect(service.getPage(1)).toBeUndefined();
            expect(service.isFetchingPage()).toBe(false);
        });
    });
});
