import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FilterService } from '../../services/filter.service';
import { PetFiltersComponent } from '../../../shared/components/pet-filters/pet-filters.component';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterModule, PetFiltersComponent],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    isDetailPage: boolean = false;
    showFilters: boolean = true;

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
    }
}
