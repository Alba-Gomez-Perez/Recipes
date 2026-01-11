import { TestBed } from '@angular/core/testing';
import { PaginationService } from './pagination.service';

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

        it('should update total items', () => {
            service.setTotalItems(100);
            expect(service.totalItems()).toBe(100);
        });
    });
});
