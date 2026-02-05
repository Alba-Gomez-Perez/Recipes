import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RecipesService } from './recipes.service';
import { API_CONSTANTS } from '../constants/api.constants';
import { ToastService } from './toast.service';
import { PaginationService } from './pagination.service';
import { PLATFORM_ID } from '@angular/core';

describe('RecipesService', () => {
    let service: RecipesService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                RecipesService,
                { provide: ToastService, useValue: { error: jasmine.createSpy('error') } },
                { provide: PaginationService, useValue: { findInCache: () => null, clearCache: () => { } } }
            ]
        });
        service = TestBed.inject(RecipesService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should handle static db.json structure (Vercel deployment)', () => {
        const mockDbJson = {
            recipes: [
                { id: 1, name: 'Test Recipe 1', category: 'dessert' },
                { id: 2, name: 'Test Recipe 2', category: 'meat' },
                { id: 3, name: 'Test Recipe 3', category: 'fish' }
            ]
        };

        // Simulate request for page 1, limit 2
        service.getRecipes(1, 2).subscribe(response => {
            // Should return 2 recipes (client-side pagination)
            expect(response.recipes.length).toBe(2);
            expect(response.recipes[0].name).toBe('Test Recipe 1');
            expect(response.totalCount).toBe(3); // Total count should be 3 from the full array
        });

        const req = httpMock.expectOne(`${API_CONSTANTS.BASE_URL}?_page=1&_limit=2&_t=${Date.now()}`.replace(/&_t=\d+/, (m) => m));
        // We match loosely on URL because of the timestamp
        expect(req.request.method).toBe('GET');

        // Return the full static DB structure
        req.flush(mockDbJson);
    });

    it('should handle client-side filtering on static response', () => {
        const mockDbJson = {
            recipes: [
                { id: 1, name: 'Chocolate Cake', category: 'dessert' },
                { id: 2, name: 'Beef Stew', category: 'meat' }
            ]
        };

        const filters = { name: 'Chocolate', category: null };

        service.getRecipes(1, 10, filters).subscribe(response => {
            expect(response.recipes.length).toBe(1);
            expect(response.recipes[0].name).toBe('Chocolate Cake');
        });

        const req = httpMock.expectOne(req => req.url === API_CONSTANTS.BASE_URL);
        req.flush(mockDbJson);
    });

    it('should handle standard json-server response (Local)', () => {
        const mockRecipes = [
            { id: 1, name: 'Test Recipe 1' },
            { id: 2, name: 'Test Recipe 2' }
        ];

        service.getRecipes(1, 10).subscribe(response => {
            expect(response.recipes.length).toBe(2);
            expect(response.totalCount).toBe(50); // From header
        });

        const req = httpMock.expectOne(req => req.url === API_CONSTANTS.BASE_URL);
        req.flush(mockRecipes, { headers: { 'X-Total-Count': '50' } });
    });
});
