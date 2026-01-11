import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {PetListComponent} from './pet-list.component';
import {Router} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {FilterService} from '../../core/services/filter.service';
import {PetsService} from '../../core/services/pets.service';
import {ToastService} from '../../core/services/toast.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {of} from 'rxjs';
import {NO_ERRORS_SCHEMA} from '@angular/core';

describe('PetListComponent', () => {
    let component: PetListComponent;
    let fixture: ComponentFixture<PetListComponent>;
    let mockRouter: any;
    let filterService: FilterService;
    let petsService: PetsService;
    let toastService: any;

    const mockPets: any[] = [
        { id: 1, name: 'Pet 1', kind: 'dog', weight: 1000, height: 20, length: 30, photo_url: '', description: '' },
        { id: 2, name: 'Pet 2', kind: 'cat', weight: 2000, height: 30, length: 40, photo_url: '', description: '' },
    ];

    // Helper to generate unique pets for tests
    const generateUniquePets = (count: number, startId: number = 1): any[] => {
        return Array.from({ length: count }, (_, i) => ({
            ...mockPets[0],
            id: startId + i,
            name: `Pet ${startId + i}`
        }));
    };

    beforeEach(fakeAsync(async () => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        toastService = jasmine.createSpyObj('ToastService', ['info', 'error', 'success', 'warning']);

        // Mock localStorage
        spyOn(localStorage, 'getItem').and.returnValue(null);
        spyOn(localStorage, 'setItem');

        // Mock window.scrollTo
        spyOn(window, 'scrollTo');

        await TestBed.configureTestingModule({
            imports: [
                PetListComponent,
                TranslateModule.forRoot(),
                HttpClientTestingModule
            ],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: ToastService, useValue: toastService },
                FilterService,
                PetsService
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        filterService = TestBed.inject(FilterService);
        petsService = TestBed.inject(PetsService);

        // Mock petsService methods using spyOn
        spyOn(petsService, 'getPets').and.returnValue(of({
            pets: mockPets as any,
            totalCount: mockPets.length,
        }));

        fixture = TestBed.createComponent(PetListComponent);
        component = fixture.componentInstance;
        component.paginationService.setPageSize(2);

        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load pet of the day on initialization', fakeAsync(() => {
        // ngOnInit is no longer responsible for triggering the fetch, the effect is
        // We trigger change detection to let the effect run
        fixture.detectChanges();
        tick(); // Effect runs
        tick(); // Async fetch

        expect(petsService.getPets).toHaveBeenCalledWith(
            1,
            component.paginationService.getPageSize(),
            jasmine.anything(),
            jasmine.anything()
        );
        tick();
        // Pet of the day should be calculated from the first page
        expect(component.petOfTheDay).toBeDefined();
    }));

    describe('Pagination', () => {
        it('should return paginatedPets', () => {
            expect(component.paginatedPets).toEqual(component.pets);
        });

        it('should go to previous page if possible', () => {
            component.paginationService.setCurrentPage(2);
            component.prevPage();
            expect(component.paginationService.currentPage()).toBe(1);
        });

        it('should not go to previous page if on first page', () => {
            component.paginationService.setCurrentPage(1);
            const initialPage = component.paginationService.currentPage();
            component.prevPage();
            expect(component.paginationService.currentPage()).toBe(initialPage);
        });

        it('should show toast and stay on current page if no more results found on next', fakeAsync(() => {
            // Mock response with totalCount = 2, and we already have 2 pets
            component.paginationService.setTotalItems(2);
            (petsService.getPets as jasmine.Spy).and.returnValue(of({ pets: [], totalCount: 2 }));

            component.paginationService.setCurrentPage(1);

            component.nextPage();
            tick(); // Trigger effect
            fixture.detectChanges();
            tick(); // Await getPets
            fixture.detectChanges();
            tick(); // Await any post-fetch updates
            fixture.detectChanges();

            expect(component.paginationService.currentPage()).toBe(1);
            expect(toastService.info).toHaveBeenCalledWith('noMorePets');
        }));

        it('should use cache when navigating back and forth', fakeAsync(() => {
            const morePets = generateUniquePets(2, 3);
            (petsService.getPets as jasmine.Spy).calls.reset();

            // Setup: Manually populate cache with page 1 and page 2
            component.paginationService.setTotalItems(4);
            const cache = new Map<number, any[]>();
            cache.set(1, mockPets);
            cache.set(2, morePets);
            component.paginationService.cachePage(1, mockPets);
            component.paginationService.cachePage(2, morePets);
            component.paginationService.setCurrentPage(2);
            tick(); // Let the effect run
            fixture.detectChanges();

            expect(component.paginationService.currentPage()).toBe(2);
            expect(component.pets).toEqual(morePets);
            expect(petsService.getPets).not.toHaveBeenCalled();

            // Navigate back to Page 1
            component.prevPage();
            fixture.detectChanges();
            expect(component.paginationService.currentPage()).toBe(1);
            expect(component.pets).toEqual(mockPets);
            expect(petsService.getPets).not.toHaveBeenCalled();

            // Navigate forward to Page 2 (should use cache)
            component.nextPage();
            fixture.detectChanges();
            expect(component.paginationService.currentPage()).toBe(2);
            expect(component.pets).toEqual(morePets);
            expect(petsService.getPets).not.toHaveBeenCalled();
        }));
    });

    describe('Pet of the Day', () => {
        it('should load pet of the day from first page when index is in range', fakeAsync(() => {
            (petsService.getPets as jasmine.Spy).calls.reset();
            (petsService.getPets as jasmine.Spy).and.returnValue(of({
                pets: mockPets as any,
                totalCount: 2,
            }));

            component.loadPetOfTheDay();
            tick();

            expect(petsService.getPets).toHaveBeenCalledWith(1, component.paginationService.getPageSize());
            expect(component.petOfTheDay).toBeDefined();
            expect(mockPets).toContain(component.petOfTheDay as any);
        }));

        it('should fetch correct page when pet of the day is not in first page', fakeAsync(() => {
            const morePets = generateUniquePets(10, 3);
            (petsService.getPets as jasmine.Spy).calls.reset();

            // Setup: Mock two consecutive calls
            (petsService.getPets as jasmine.Spy).and.returnValues(
                of({
                    pets: mockPets as any,
                    totalCount: 12,
                }),
                of({
                    pets: morePets.slice(0, component.paginationService.getPageSize()) as any,
                    totalCount: 12,
                })
            );

            component.loadPetOfTheDay();
            tick();
            tick();

            expect(petsService.getPets).toHaveBeenCalledTimes(2);
            expect(component.petOfTheDay).toBeDefined();
        }));

        it('should return null if no pets available', fakeAsync(() => {
            (petsService.getPets as jasmine.Spy).calls.reset();
            (petsService.getPets as jasmine.Spy).and.returnValue(of({
                pets: [],
                totalCount: 0,
            }));

            component.loadPetOfTheDay();
            tick();

            expect(component.petOfTheDay).toBeNull();
        }));
    });

    describe('Navigation', () => {
        it('should navigate to pet detail', () => {
            component.goToDetail(1);
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/pets', 1]);
        });
    });

    describe('Reactivity', () => {
        it('should fetch pets when filters change', fakeAsync(() => {
            (petsService.getPets as jasmine.Spy).calls.reset();

            filterService.updateFilters({ name: 'Rex' });

            tick();
            fixture.detectChanges();
            tick();

            expect(petsService.getPets).toHaveBeenCalledWith(
                1,
                component.paginationService.getPageSize(),
                jasmine.objectContaining({ name: 'Rex' }),
                jasmine.anything()
            );
        }));

        it('should fetch pets when sort changes', fakeAsync(() => {
            (petsService.getPets as jasmine.Spy).calls.reset();

            filterService.updateSort({ sortBy: 'weight' });

            tick();
            fixture.detectChanges();
            tick();

            expect(petsService.getPets).toHaveBeenCalledWith(
                1,
                component.paginationService.getPageSize(),
                jasmine.anything(),
                jasmine.objectContaining({ sortBy: 'weight' })
            );
        }));
    });
});
