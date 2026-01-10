import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterService, PetFilters, PetSort } from '../../../core/services/filter.service';

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
        length: 'all'
    };

    sort: PetSort = {
        sortBy: 'name',
        sortOrder: 'asc'
    };

    constructor(private filterService: FilterService) { }

    ngOnInit() {
        this.filterService.filters$.subscribe(filters => {
            this.filters = filters;
        });
        this.filterService.sort$.subscribe(sort => {
            this.sort = sort;
        });
    }

    updateName(event: any) {
        const name = event.target.value;
        this.filterService.updateFilters({ name });
    }

    toggleKind(kind: 'dog' | 'cat' | null) {
        const newKind = this.filters.kind === kind ? null : kind;
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
        const sortOrder = this.sort.sortOrder === 'asc' ? 'desc' : 'asc';
        this.filterService.updateSort({ sortOrder });
    }
}
