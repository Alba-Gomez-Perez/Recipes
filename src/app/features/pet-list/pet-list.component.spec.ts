import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { PetListComponent } from './pet-list.component';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FilterService } from '../../core/services/filter.service';
import petsService from '../../core/services/pets.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PetListComponent', () => {
    let component: PetListComponent;
    let fixture: ComponentFixture<PetListComponent>;
    let mockRouter: any;
    let filterService: FilterService;

    const mockPets: any[] = [
        { id: 1, name: 'Pet 1', kind: 'dog', weight: 1000, height: 20, length: 30, photo_url: '', description: '' },
        { id: 2, name: 'Pet 2', kind: 'cat', weight: 2000, height: 30, length: 40, photo_url: '', description: '' },
    ];

    beforeEach(fakeAsync(async () => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

        // Mock localStorage
        spyOn(localStorage, 'getItem').and.returnValue(null);
        spyOn(localStorage, 'setItem');

        // Mock petsService methods using spyOn
        spyOn(petsService, 'getAllPets').and.returnValue(Promise.resolve(mockPets as any));
        spyOn(petsService, 'getPets').and.returnValue(Promise.resolve({
            pets: mockPets as any,
            totalCount: mockPets.length,
        }));

        // Mock window.scrollTo
        spyOn(window, 'scrollTo');

        await TestBed.configureTestingModule({
            imports: [PetListComponent, TranslateModule.forRoot()],
            providers: [
                { provide: Router, useValue: mockRouter },
                FilterService
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        filterService = TestBed.inject(FilterService);
        fixture = TestBed.createComponent(PetListComponent);
        component = fixture.componentInstance;
        component.totalPetsCount = 100;

        fixture.detectChanges();
        tick();
        flush();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load initial data on ngOnInit', () => {
        expect(petsService.getAllPets).toHaveBeenCalled();
        expect(component.allPets).toEqual(mockPets);
    });

    describe('Pagination', () => {
        it('should calculate totalPages correctly', () => {
            component.totalPetsCount = 13;
            component.pageSize = 6;
            expect(component.totalPages).toBe(3);
        });

        it('should return paginatedPets', () => {
            expect(component.paginatedPets).toEqual(component.pets);
        });

        it('should return pages array', () => {
            component.totalPetsCount = 13; // 3 pages
            expect(component.pages).toEqual([1, 2, 3]);
        });

        it('should navigate to valid page', () => {
            component.totalPetsCount = 20;
            component.goToPage(2);
            expect(component.currentPage()).toBe(2);
        });

        it('should not navigate to invalid page', () => {
            component.totalPetsCount = 10;
            component.currentPage.set(1);
            component.goToPage(3);
            expect(component.currentPage()).toBe(1);
        });

        it('should go to next page if possible', () => {
            component.totalPetsCount = 20;
            component.currentPage.set(1);
            spyOn(component, 'goToPage').and.callThrough();
            component.nextPage();
            expect(component.goToPage).toHaveBeenCalledWith(2);
            expect(component.currentPage()).toBe(2);
        });

        it('should not go to next page if on last page', () => {
            component.totalPetsCount = 6;
            component.currentPage.set(1);
            spyOn(component, 'goToPage');
            component.nextPage();
            expect(component.goToPage).not.toHaveBeenCalled();
        });

        it('should go to previous page if possible', () => {
            component.totalPetsCount = 20;
            component.currentPage.set(2);
            spyOn(component, 'goToPage').and.callThrough();
            component.prevPage();
            expect(component.goToPage).toHaveBeenCalledWith(1);
            expect(component.currentPage()).toBe(1);
        });

        it('should not go to previous page if on first page', () => {
            component.totalPetsCount = 20;
            component.currentPage.set(1);
            spyOn(component, 'goToPage');
            component.prevPage();
            expect(component.goToPage).not.toHaveBeenCalled();
        });
    });

    describe('Pet of the Day', () => {
        it('should return null if no pets available', () => {
            component.allPets = [];
            expect(component.getPetOfTheDay()).toBeNull();
        });

        it('should return a pet deterministically based on date', () => {
            component.allPets = mockPets as any;
            const pet1 = component.getPetOfTheDay();
            const pet2 = component.getPetOfTheDay();
            expect(pet1).toBe(pet2);
            expect(mockPets).toContain(pet1 as any);
        });
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
                component.pageSize,
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
                component.pageSize,
                jasmine.anything(),
                jasmine.objectContaining({ sortBy: 'weight' })
            );
        }));

        it('should fetch pets when page changes', fakeAsync(() => {
            // Initial call happens in effect, we wait for it
            tick();
            fixture.detectChanges();
            tick();

            (petsService.getPets as jasmine.Spy).calls.reset();

            component.currentPage.set(2);

            tick();
            fixture.detectChanges();
            tick();

            expect(petsService.getPets).toHaveBeenCalled();
            const lastCall = (petsService.getPets as jasmine.Spy).calls.mostRecent();
            expect(lastCall.args[0]).toBe(2);
            flush();
        }));
    });
});
