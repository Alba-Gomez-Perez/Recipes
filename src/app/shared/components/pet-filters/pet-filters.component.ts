import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FilterService, PetFilters, PetSort } from '../../../core/services/filter.service';

@Component({
    selector: 'app-pet-filters',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './pet-filters.component.html',
    styleUrls: ['./pet-filters.component.scss']
})
export class PetFiltersComponent {
    public filterService = inject(FilterService);

    updateName(event: any) {
        const name = event.target.value;
        this.filterService.updateFilters({ name });
    }

    toggleKind(kind: 'dog' | 'cat' | null) {
        const newKind = this.filterService.filters().kind === kind ? null : kind;
        this.filterService.updateFilters({ kind: newKind });
    }

    updateFilter(type: 'weight' | 'height' | 'length' | 'sortBy' | 'sortOrder', event: any) {
        const value = event.target.value;
        if (type === 'sortBy' || type === 'sortOrder') {
            this.filterService.updateSort({ [type]: value });
        } else {
            this.filterService.updateFilters({ [type]: value });
        }
    }

    toggleOrder() {
        const sortOrder = this.filterService.sort().sortOrder === 'asc' ? 'desc' : 'asc';
        this.filterService.updateSort({ sortOrder });
    }
}
