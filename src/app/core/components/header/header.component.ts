import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FilterService, PetFilters } from '../../services/filter.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    showFilters = true;
    isDetailPage = false;

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

    constructor(
        private router: Router,
        private filterService: FilterService
    ) { }

    ngOnInit() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            this.isDetailPage = event.url.includes('/pets/');
            this.showFilters = !this.isDetailPage;
        });

        // Initialize local filters from service and stay in sync
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
