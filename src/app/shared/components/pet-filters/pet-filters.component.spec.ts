import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PetFiltersComponent } from './pet-filters.component';
import { TranslateModule } from '@ngx-translate/core';
import { FilterService } from '../../../core/services/filter.service';
import { signal } from '@angular/core';

describe('PetFiltersComponent', () => {
    let component: PetFiltersComponent;
    let fixture: ComponentFixture<PetFiltersComponent>;
    let filterService: FilterService;

    beforeEach(async () => {
        localStorage.clear();
        await TestBed.configureTestingModule({
            imports: [PetFiltersComponent, TranslateModule.forRoot()],
            providers: [FilterService]
        }).compileComponents();

        fixture = TestBed.createComponent(PetFiltersComponent);
        component = fixture.componentInstance;
        filterService = TestBed.inject(FilterService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update name filter', () => {
        spyOn(filterService, 'updateFilters');
        const event = { target: { value: 'Rex' } };
        component.updateName(event);
        expect(filterService.updateFilters).toHaveBeenCalledWith({ name: 'Rex' });
    });

    it('should toggle kind filter', () => {
        spyOn(filterService, 'updateFilters');

        // Toggle dog on
        component.toggleKind('dog');
        expect(filterService.updateFilters).toHaveBeenCalledWith({ kind: 'dog' });

        // Toggle dog off (if currently dog)
        (filterService.filters as any).set({ kind: 'dog' });
        fixture.detectChanges();
        component.toggleKind('dog');
        expect(filterService.updateFilters).toHaveBeenCalledWith({ kind: null });
    });

    it('should update various filters', () => {
        spyOn(filterService, 'updateFilters');
        const event = { target: { value: 'small' } };
        component.updateFilter('weight', event);
        expect(filterService.updateFilters).toHaveBeenCalledWith({ weight: 'small' });
    });

    it('should update sort options', () => {
        spyOn(filterService, 'updateSort');
        const event = { target: { value: 'weight' } };
        component.updateFilter('sortBy', event);
        expect(filterService.updateSort).toHaveBeenCalledWith({ sortBy: 'weight' });
    });

    it('should update sort order via updateFilter', () => {
        spyOn(filterService, 'updateSort');
        const event = { target: { value: 'desc' } };
        component.updateFilter('sortOrder', event);
        expect(filterService.updateSort).toHaveBeenCalledWith({ sortOrder: 'desc' });
    });

    it('should toggle sort order', () => {
        spyOn(filterService, 'updateSort');

        // Toggle from asc to desc
        (filterService.sort as any).set({ sortOrder: 'asc', sortBy: 'name' });
        fixture.detectChanges();
        component.toggleOrder();
        expect(filterService.updateSort).toHaveBeenCalledWith({ sortOrder: 'desc' });

        // Toggle from desc to asc
        (filterService.sort as any).set({ sortOrder: 'desc', sortBy: 'name' });
        fixture.detectChanges();
        component.toggleOrder();
        expect(filterService.updateSort).toHaveBeenCalledWith({ sortOrder: 'asc' });
    });
});
