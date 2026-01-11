import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PetsService } from './pets.service';
import { Pet } from '../models/pet.model';
import { API_CONSTANTS, FILTER_CATEGORIES, FILTER_THRESHOLDS } from '../constants';
import { PaginationService } from './pagination.service';
import { ToastService } from './toast.service';
import { provideHttpClient } from '@angular/common/http';

describe('PetsService', () => {
    let service: PetsService;
    let httpMock: HttpTestingController;
    let paginationServiceSpy: jasmine.SpyObj<PaginationService>;
    let toastServiceSpy: jasmine.SpyObj<ToastService>;

    beforeEach(() => {
        const paginationSpy = jasmine.createSpyObj('PaginationService', ['findInCache']);
        const toastSpy = jasmine.createSpyObj('ToastService', ['error']);

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                PetsService,
                { provide: PaginationService, useValue: paginationSpy },
                { provide: ToastService, useValue: toastSpy }
            ]
        });
        service = TestBed.inject(PetsService);
        httpMock = TestBed.inject(HttpTestingController);
        paginationServiceSpy = TestBed.inject(PaginationService) as jasmine.SpyObj<PaginationService>;
        toastServiceSpy = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
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
            let req = httpMock.expectOne(r => r.params.get(API_CONSTANTS.QUERY_PARAMS.WEIGHT_LTE) === FILTER_THRESHOLDS.WEIGHT.SMALL_MAX.toString());
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
            req = httpMock.expectOne(r => r.params.get(API_CONSTANTS.QUERY_PARAMS.WEIGHT_GTE) === FILTER_THRESHOLDS.WEIGHT.LARGE_MIN.toString());
            expect(req.request.method).toBe('GET');
            req.flush(mockPets);
        });

        it('should apply height filters (short, average, tall)', () => {
            const mockPets: Pet[] = [];

            // Short
            service.getPets(undefined, undefined, { name: '', kind: null, weight: 'all', height: FILTER_CATEGORIES.HEIGHT.SHORT, length: 'all' } as any).subscribe();
            let req = httpMock.expectOne(r => r.params.get(API_CONSTANTS.QUERY_PARAMS.HEIGHT_LTE) === FILTER_THRESHOLDS.HEIGHT.SHORT_MAX.toString());
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
            req = httpMock.expectOne(r => r.params.get(API_CONSTANTS.QUERY_PARAMS.HEIGHT_GTE) === FILTER_THRESHOLDS.HEIGHT.TALL_MIN.toString());
            expect(req.request.method).toBe('GET');
            req.flush(mockPets);
        });

        it('should apply length filters (short, average, long)', () => {
            const mockPets: Pet[] = [];

            // Short
            service.getPets(undefined, undefined, { name: '', kind: null, weight: 'all', height: 'all', length: FILTER_CATEGORIES.LENGTH.SHORT } as any).subscribe();
            let req = httpMock.expectOne(r => r.params.get(API_CONSTANTS.QUERY_PARAMS.LENGTH_LTE) === FILTER_THRESHOLDS.LENGTH.SHORT_MAX.toString());
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
            req = httpMock.expectOne(r => r.params.get(API_CONSTANTS.QUERY_PARAMS.LENGTH_GTE) === FILTER_THRESHOLDS.LENGTH.LONG_MIN.toString());
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
                expect(result).toEqual({ pets: [], totalCount: 10 });
            });

            const req = httpMock.expectOne(req => req.url === API_CONSTANTS.BASE_URL);
            req.flush({ items: 10 });
        });
    });

    describe('getPets error handling', () => {
        it('should show network error toast on network error', () => {
            service.getPets().subscribe(response => {
                expect(response.pets).toEqual([]);
                expect(response.totalCount).toBe(0);
            });

            const req = httpMock.expectOne(r => r.url === API_CONSTANTS.BASE_URL);
            req.error(new ProgressEvent('network error'), { status: 0 });

            expect(toastServiceSpy.error).toHaveBeenCalledWith('errorNetwork');
        });

        it('should show fetching error toast on server error', () => {
            service.getPets().subscribe();

            const req = httpMock.expectOne(r => r.url === API_CONSTANTS.BASE_URL);
            req.flush('Server error', { status: 500, statusText: 'Server Error' });

            expect(toastServiceSpy.error).toHaveBeenCalledWith('errorFetchingPets');
        });

        it('should show fetching error toast on client error', () => {
            service.getPets().subscribe();

            const req = httpMock.expectOne(r => r.url === API_CONSTANTS.BASE_URL);
            req.flush('Client error', { status: 400, statusText: 'Bad Request' });

            expect(toastServiceSpy.error).toHaveBeenCalledWith('errorFetchingPets');
        });

        it('should show generic error toast on other errors', () => {
            service.getPets().subscribe();

            const req = httpMock.expectOne(r => r.url === API_CONSTANTS.BASE_URL);
            req.flush('Client error', { status: 300, statusText: 'Multiple Choices' });

            expect(toastServiceSpy.error).toHaveBeenCalledWith('errorGeneric');
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
    });

    describe('getPetById error handling', () => {
        beforeEach(() => {
            paginationServiceSpy.findInCache.and.returnValue(undefined);
        });

        it('should show pet not found toast on 404 error', () => {
            service.getPetById(999).subscribe(pet => {
                expect(pet).toBeUndefined();
            });

            const req = httpMock.expectOne(`${API_CONSTANTS.BASE_URL}/999`);
            req.flush('Not Found', { status: 404, statusText: 'Not Found' });

            expect(toastServiceSpy.error).toHaveBeenCalledWith('errorPetNotFound');
        });

        it('should show network error toast on network error', () => {
            service.getPetById(1).subscribe(pet => {
                expect(pet).toBeUndefined();
            });

            const req = httpMock.expectOne(`${API_CONSTANTS.BASE_URL}/1`);
            req.error(new ProgressEvent('network error'), { status: 0 });

            expect(toastServiceSpy.error).toHaveBeenCalledWith('errorNetwork');
        });

        it('should show fetching pet error on other http errors', () => {
            service.getPetById(1).subscribe(pet => {
                expect(pet).toBeUndefined();
            });

            const req = httpMock.expectOne(`${API_CONSTANTS.BASE_URL}/1`);
            req.flush('Server Error', { status: 500, statusText: 'Server Error' });

            expect(toastServiceSpy.error).toHaveBeenCalledWith('errorFetchingPet');
        });
    });

    describe('getPetOfTheDay', () => {
        const mockPets: Pet[] = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, name: `Pet ${i + 1}` } as Pet));

        beforeAll(() => {
            const mockDate = new Date(2023, 10, 21);
            jasmine.clock().install();
            jasmine.clock().mockDate(mockDate);
        });

        afterAll(() => {
            jasmine.clock().uninstall();
        });

        it('should return null if there are no pets', () => {
            service.getPetOfTheDay(10).subscribe(pet => {
                expect(pet).toBeNull();
            });

            const req = httpMock.expectOne(r => r.url === API_CONSTANTS.BASE_URL);
            req.flush([], { headers: { [API_CONSTANTS.HEADERS.TOTAL_COUNT]: '0' } });
        });

        it('should return pet from first page if it is there', () => {
            const totalCount = 20;
            const pageSize = 10;
            const expectedPet = mockPets[1];

            service.getPetOfTheDay(pageSize).subscribe(pet => {
                expect(pet).toEqual(expectedPet);
            });

            const req = httpMock.expectOne(r => r.url === API_CONSTANTS.BASE_URL && r.params.get(API_CONSTANTS.QUERY_PARAMS.PAGE) === '1');
            req.flush(mockPets.slice(0, pageSize), { headers: { [API_CONSTANTS.HEADERS.TOTAL_COUNT]: totalCount.toString() } });
        });

        it('should fetch the correct page if pet of the day is not on the first page', () => {
            const totalCount = 20;
            const pageSize = 1;
            const expectedPet = mockPets[1];

            service.getPetOfTheDay(pageSize).subscribe(pet => {
                expect(pet).toEqual(expectedPet);
            });

            const req1 = httpMock.expectOne(r => r.url === API_CONSTANTS.BASE_URL && r.params.get(API_CONSTANTS.QUERY_PARAMS.PAGE) === '1');
            req1.flush(mockPets.slice(0, pageSize), { headers: { [API_CONSTANTS.HEADERS.TOTAL_COUNT]: totalCount.toString() } });

            const req2 = httpMock.expectOne(r => r.url === API_CONSTANTS.BASE_URL && r.params.get(API_CONSTANTS.QUERY_PARAMS.PAGE) === '2');
            req2.flush([mockPets[1]], { headers: { [API_CONSTANTS.HEADERS.TOTAL_COUNT]: totalCount.toString() } });
        });

        it('should use preloadedData if provided', () => {
            const preloadedData = {
                pets: mockPets.slice(0, 10),
                totalCount: 20
            };
            const expectedPet = mockPets[1];

            service.getPetOfTheDay(10, preloadedData).subscribe(pet => {
                expect(pet).toEqual(expectedPet);
            });

            httpMock.expectNone(API_CONSTANTS.BASE_URL);
        });

        it('should handle errors during pet fetching and return null', () => {
            service.getPetOfTheDay(10).subscribe(pet => {
                expect(pet).toBeNull();
            });

            const req = httpMock.expectOne(r => r.url === API_CONSTANTS.BASE_URL);
            req.error(new ProgressEvent('error'));
        });

        it('should return null if something goes wrong on second fetch', () => {
            const totalCount = 20;
            const pageSize = 1;

            service.getPetOfTheDay(pageSize).subscribe(pet => {
                expect(pet).toBeNull();
            });

            const req1 = httpMock.expectOne(r => r.url === API_CONSTANTS.BASE_URL && r.params.get(API_CONSTANTS.QUERY_PARAMS.PAGE) === '1');
            req1.flush(mockPets.slice(0, pageSize), { headers: { [API_CONSTANTS.HEADERS.TOTAL_COUNT]: totalCount.toString() } });

            const req2 = httpMock.expectOne(r => r.url === API_CONSTANTS.BASE_URL && r.params.get(API_CONSTANTS.QUERY_PARAMS.PAGE) === '2');
            req2.flush([], { headers: { [API_CONSTANTS.HEADERS.TOTAL_COUNT]: totalCount.toString() } });
        });
    });
});
