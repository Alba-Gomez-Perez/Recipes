import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PetsService } from './pets.service';
import { Pet } from '../models/pet.model';
import { API_CONSTANTS, FILTER_THRESHOLDS, FILTER_CATEGORIES } from '../constants';
import { PaginationService } from './pagination.service';

describe('PetsService', () => {
    let service: PetsService;
    let httpMock: HttpTestingController;
    let paginationServiceSpy: jasmine.SpyObj<PaginationService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('PaginationService', ['findInCache']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                PetsService,
                { provide: PaginationService, useValue: spy }
            ]
        });
        service = TestBed.inject(PetsService);
        httpMock = TestBed.inject(HttpTestingController);
        paginationServiceSpy = TestBed.inject(PaginationService) as jasmine.SpyObj<PaginationService>;
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getPets', () => {
        it('should fetch pets with default parameters', () => {
            const mockPets: Pet[] = [{ id: 1, name: 'Rex', kind: 'dog', weight: 1000, height: 20, length: 30, photo_url: '', description: '' }];

            service.getPets().subscribe(result => {
                expect(result.pets).toEqual(mockPets);
                expect(result.totalCount).toBe(1);
            });

            const req = httpMock.expectOne(req => req.url === API_CONSTANTS.BASE_URL);
            expect(req.request.method).toBe('GET');
            req.flush(mockPets, {
                headers: { [API_CONSTANTS.HEADERS.TOTAL_COUNT]: '1' }
            });
        });

        it('should apply pagination parameters', () => {
            const mockPets: Pet[] = [];
            service.getPets(1, 6).subscribe();

            const req = httpMock.expectOne(req =>
                req.url === API_CONSTANTS.BASE_URL &&
                req.params.get(API_CONSTANTS.QUERY_PARAMS.PAGE) === '1' &&
                req.params.get(API_CONSTANTS.QUERY_PARAMS.LIMIT) === '6'
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockPets);
        });

        it('should apply name filter', () => {
            const mockPets: Pet[] = [];
            service.getPets(undefined, undefined, { name: 'Rex', kind: null, weight: 'all', height: 'all', length: 'all' } as any).subscribe();

            const req = httpMock.expectOne(req =>
                req.url === API_CONSTANTS.BASE_URL &&
                req.params.get(API_CONSTANTS.QUERY_PARAMS.NAME_LIKE) === 'Rex'
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockPets);
        });

        it('should apply kind filter', () => {
            const mockPets: Pet[] = [];
            service.getPets(undefined, undefined, { name: '', kind: 'dog', weight: 'all', height: 'all', length: 'all' } as any).subscribe();

            const req = httpMock.expectOne(req =>
                req.url === API_CONSTANTS.BASE_URL &&
                req.params.get(API_CONSTANTS.QUERY_PARAMS.KIND) === 'dog'
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockPets);
        });

        it('should apply weight filters (small, medium, large)', () => {
            const mockPets: Pet[] = [];

            // Small
            service.getPets(undefined, undefined, { name: '', kind: null, weight: FILTER_CATEGORIES.WEIGHT.SMALL, height: 'all', length: 'all' } as any).subscribe();
            let req = httpMock.expectOne(r => r.params.get(API_CONSTANTS.QUERY_PARAMS.WEIGHT_LT) === FILTER_THRESHOLDS.WEIGHT.SMALL_MAX.toString());
            expect(req.request.method).toBe('GET');
            req.flush(mockPets);

            // Medium
            service.getPets(undefined, undefined, { name: '', kind: null, weight: FILTER_CATEGORIES.WEIGHT.MEDIUM, height: 'all', length: 'all' } as any).subscribe();
            req = httpMock.expectOne(r =>
                r.params.get(API_CONSTANTS.QUERY_PARAMS.WEIGHT_GTE) === FILTER_THRESHOLDS.WEIGHT.MEDIUM_MIN.toString() &&
                r.params.get(API_CONSTANTS.QUERY_PARAMS.WEIGHT_LTE) === FILTER_THRESHOLDS.WEIGHT.MEDIUM_MAX.toString()
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockPets);

            // Large
            service.getPets(undefined, undefined, { name: '', kind: null, weight: FILTER_CATEGORIES.WEIGHT.LARGE, height: 'all', length: 'all' } as any).subscribe();
            req = httpMock.expectOne(r => r.params.get(API_CONSTANTS.QUERY_PARAMS.WEIGHT_GT) === FILTER_THRESHOLDS.WEIGHT.LARGE_MIN.toString());
            expect(req.request.method).toBe('GET');
            req.flush(mockPets);
        });

        it('should apply height filters (short, average, tall)', () => {
            const mockPets: Pet[] = [];

            // Short
            service.getPets(undefined, undefined, { name: '', kind: null, weight: 'all', height: FILTER_CATEGORIES.HEIGHT.SHORT, length: 'all' } as any).subscribe();
            let req = httpMock.expectOne(r => r.params.get(API_CONSTANTS.QUERY_PARAMS.HEIGHT_LT) === FILTER_THRESHOLDS.HEIGHT.SHORT_MAX.toString());
            expect(req.request.method).toBe('GET');
            req.flush(mockPets);

            // Average
            service.getPets(undefined, undefined, { name: '', kind: null, weight: 'all', height: FILTER_CATEGORIES.HEIGHT.AVERAGE, length: 'all' } as any).subscribe();
            req = httpMock.expectOne(r =>
                r.params.get(API_CONSTANTS.QUERY_PARAMS.HEIGHT_GTE) === FILTER_THRESHOLDS.HEIGHT.AVERAGE_MIN.toString() &&
                r.params.get(API_CONSTANTS.QUERY_PARAMS.HEIGHT_LTE) === FILTER_THRESHOLDS.HEIGHT.AVERAGE_MAX.toString()
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockPets);

            // Tall
            service.getPets(undefined, undefined, { name: '', kind: null, weight: 'all', height: FILTER_CATEGORIES.HEIGHT.TALL, length: 'all' } as any).subscribe();
            req = httpMock.expectOne(r => r.params.get(API_CONSTANTS.QUERY_PARAMS.HEIGHT_GT) === FILTER_THRESHOLDS.HEIGHT.TALL_MIN.toString());
            expect(req.request.method).toBe('GET');
            req.flush(mockPets);
        });

        it('should apply length filters (short, average, long)', () => {
            const mockPets: Pet[] = [];

            // Short
            service.getPets(undefined, undefined, { name: '', kind: null, weight: 'all', height: 'all', length: FILTER_CATEGORIES.LENGTH.SHORT } as any).subscribe();
            let req = httpMock.expectOne(r => r.params.get(API_CONSTANTS.QUERY_PARAMS.LENGTH_LT) === FILTER_THRESHOLDS.LENGTH.SHORT_MAX.toString());
            expect(req.request.method).toBe('GET');
            req.flush(mockPets);

            // Average
            service.getPets(undefined, undefined, { name: '', kind: null, weight: 'all', height: 'all', length: FILTER_CATEGORIES.LENGTH.AVERAGE } as any).subscribe();
            req = httpMock.expectOne(r =>
                r.params.get(API_CONSTANTS.QUERY_PARAMS.LENGTH_GTE) === FILTER_THRESHOLDS.LENGTH.AVERAGE_MIN.toString() &&
                r.params.get(API_CONSTANTS.QUERY_PARAMS.LENGTH_LTE) === FILTER_THRESHOLDS.LENGTH.AVERAGE_MAX.toString()
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockPets);

            // Long
            service.getPets(undefined, undefined, { name: '', kind: null, weight: 'all', height: 'all', length: FILTER_CATEGORIES.LENGTH.LONG } as any).subscribe();
            req = httpMock.expectOne(r => r.params.get(API_CONSTANTS.QUERY_PARAMS.LENGTH_GT) === FILTER_THRESHOLDS.LENGTH.LONG_MIN.toString());
            expect(req.request.method).toBe('GET');
            req.flush(mockPets);
        });

        it('should apply sort parameters', () => {
            const mockPets: Pet[] = [];
            service.getPets(undefined, undefined, undefined, { sortBy: 'name', sortOrder: 'desc' }).subscribe();

            const req = httpMock.expectOne(r =>
                r.params.get(API_CONSTANTS.QUERY_PARAMS.SORT) === 'name' &&
                r.params.get(API_CONSTANTS.QUERY_PARAMS.ORDER) === 'desc'
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockPets);
        });

        it('should default sort order to asc if not provided', () => {
            const mockPets: Pet[] = [];
            service.getPets(undefined, undefined, undefined, { sortBy: 'name' }).subscribe();

            const req = httpMock.expectOne(r =>
                r.params.get(API_CONSTANTS.QUERY_PARAMS.SORT) === 'name' &&
                r.params.get(API_CONSTANTS.QUERY_PARAMS.ORDER) === 'asc'
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockPets);
        });

        it('should handle alternative response format (data and items)', () => {
            const mockResponseData = { data: [{ id: 1 }], items: 10 };

            service.getPets().subscribe(result => {
                expect(result.pets).toEqual(mockResponseData.data as any);
                expect(result.totalCount).toBe(10);
            });

            const req = httpMock.expectOne(req => req.url === API_CONSTANTS.BASE_URL);
            req.flush(mockResponseData);
        });

        it('should prioritize data.items over X-Total-Count header', () => {
            const mockResponseData = { data: [{ id: 1 }], items: 10 };

            service.getPets().subscribe(result => {
                expect(result.totalCount).toBe(10);
            });

            const req = httpMock.expectOne(req => req.url === API_CONSTANTS.BASE_URL);
            req.flush(mockResponseData, {
                headers: { [API_CONSTANTS.HEADERS.TOTAL_COUNT]: '5' }
            });
        });

        it('should handle alternative response format (data and totalCount from headers if items missing)', () => {
            const mockResponseData = { data: [{ id: 1 }] };

            service.getPets().subscribe(result => {
                expect(result.totalCount).toBe(5);
            });

            const req = httpMock.expectOne(req => req.url === API_CONSTANTS.BASE_URL);
            req.flush(mockResponseData, {
                headers: { [API_CONSTANTS.HEADERS.TOTAL_COUNT]: '5' }
            });
        });

        it('should handle response where totalCount is not in headers but data is array', () => {
            const mockPets: Pet[] = [{ id: 1 } as Pet, { id: 2 } as Pet];

            service.getPets().subscribe(result => {
                expect(result.pets).toEqual(mockPets);
                expect(result.totalCount).toBe(2);
            });

            const req = httpMock.expectOne(req => req.url === API_CONSTANTS.BASE_URL);
            req.flush(mockPets);
        });

        it('should fallback to pets.length if X-Total-Count is invalid/isNaN', () => {
            const mockPets: Pet[] = [{ id: 1 } as Pet];

            service.getPets().subscribe(result => {
                expect(result.totalCount).toBe(1);
            });

            const req = httpMock.expectOne(req => req.url === API_CONSTANTS.BASE_URL);
            req.flush(mockPets, {
                headers: { [API_CONSTANTS.HEADERS.TOTAL_COUNT]: 'invalid' }
            });
        });

        it('should fallback to pets.length in alternative format if X-Total-Count is missing', () => {
            const mockResponseData = { data: [{ id: 1 }] };

            service.getPets().subscribe(result => {
                expect(result.totalCount).toBe(1);
            });

            const req = httpMock.expectOne(req => req.url === API_CONSTANTS.BASE_URL);
            req.flush(mockResponseData);
        });

        it('should return empty pets and 0 totalCount if data format is unknown', () => {
            service.getPets().subscribe(result => {
                expect(result).toEqual({ pets: [], totalCount: 0 });
            });

            const req = httpMock.expectOne(req => req.url === API_CONSTANTS.BASE_URL);
            req.flush({ unexpected: 'format' });
        });

        it('should return empty pets if data only has items but no data property', () => {
            service.getPets().subscribe(result => {
                expect(result).toEqual({ pets: [], totalCount: 0 });
            });

            const req = httpMock.expectOne(req => req.url === API_CONSTANTS.BASE_URL);
            req.flush({ items: 10 });
        });

        it('should handle HTTP errors', () => {
            spyOn(console, 'error');

            service.getPets().subscribe({
                error: (error) => {
                    expect(error).toBeDefined();
                }
            });

            const req = httpMock.expectOne(req => req.url === API_CONSTANTS.BASE_URL);
            req.error(new ProgressEvent('error'), { status: 500 });
            expect(console.error).toHaveBeenCalled();
        });
    });


    describe('getPetById', () => {
        it('should return a pet from cache if available', () => {
            const mockPet: Pet = { id: 1, name: 'Rex', kind: 'dog', weight: 1000, height: 20, length: 30, photo_url: '', description: '' };
            paginationServiceSpy.findInCache.and.returnValue(mockPet);

            service.getPetById(1).subscribe(result => {
                expect(result).toEqual(mockPet);
                expect(paginationServiceSpy.findInCache).toHaveBeenCalled();
            });

            // No HTTP request should be made
            httpMock.expectNone(`${API_CONSTANTS.BASE_URL}/1`);
        });

        it('should fetch from API if not in cache', () => {
            const mockPet: Pet = { id: 1, name: 'Rex', kind: 'dog', weight: 1000, height: 20, length: 30, photo_url: '', description: '' };
            paginationServiceSpy.findInCache.and.returnValue(undefined);

            service.getPetById(1).subscribe(result => {
                expect(result).toEqual(mockPet);
            });

            const req = httpMock.expectOne(`${API_CONSTANTS.BASE_URL}/1`);
            expect(req.request.method).toBe('GET');
            req.flush(mockPet);
        });

        it('should handle 404 errors', () => {
            spyOn(console, 'error');

            service.getPetById(999).subscribe({
                error: (error) => {
                    expect(error).toBeDefined();
                }
            });

            const req = httpMock.expectOne(`${API_CONSTANTS.BASE_URL}/999`);
            req.error(new ProgressEvent('error'), { status: 404 });
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle network errors', () => {
            spyOn(console, 'error');

            service.getPetById(1).subscribe({
                error: (error) => {
                    expect(error).toBeDefined();
                }
            });

            const req = httpMock.expectOne(`${API_CONSTANTS.BASE_URL}/1`);
            req.error(new ProgressEvent('Network error'));
            expect(console.error).toHaveBeenCalled();
        });
    });
});
