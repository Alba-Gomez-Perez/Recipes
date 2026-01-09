import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterService, PetFilters } from '../../../core/services/filter.service';

@Component({
    selector: 'app-pet-filters',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pet-filters.component.html',
    styleUrls: ['./pet-filters.component.scss']
})
export class PetFiltersComponent implements OnInit {
    filters: PetFilters = {
        name: '',
        kind: null,
        weight: 'all',
        height: 'all',
        length: 'all',
        sortBy: 'name',
        sortOrder: 'asc',
        page: 1
    };

    constructor(private filterService: FilterService) { }

    ngOnInit() {
        this.filterService.filters$.subscribe(filters => {
            this.filters = filters;
        });
    }

    updateName(event: any) {
        const name = event.target.value;
        this.filterService.updateFilters({ name, page: 1 });
    }

    toggleKind(kind: 'dog' | 'cat' | null) {
        const newKind = this.filters.kind === kind ? null : kind;
        this.filterService.updateFilters({ kind: newKind, page: 1 });
    }

    updateFilter(type: 'weight' | 'height' | 'length' | 'sortBy' | 'sortOrder', event: any) {
        const value = event.target.value;
        this.filterService.updateFilters({ [type]: value, page: 1 });
    }

    toggleOrder() {
        const sortOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc';
        this.filterService.updateFilters({ sortOrder, page: 1 });
    }
}
