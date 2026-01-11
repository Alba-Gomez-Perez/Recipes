import { Component, OnInit, signal, effect, inject, untracked, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PetsService } from "../../core/services/pets.service";
import type { Pet } from '../../core/models/pet.model';
import { FilterService } from '../../core/services/filter.service';
import { ToastService } from '../../core/services/toast.service';
import { PaginationService } from '../../core/services/pagination.service';
import { GramsToKgPipe } from '../../core/pipes/grams-to-kg.pipe';
import { PetCardComponent } from '../../shared/components/pet-card/pet-card.component';
import { APP_CONSTANTS, FILTER_CATEGORIES } from '../../core/constants';

@Component({
    selector: 'app-pet-list',
    standalone: true,
    imports: [CommonModule, PetCardComponent, TranslateModule],
    templateUrl: './pet-list.component.html',
    styleUrls: ['./pet-list.component.scss']
})
export class PetListComponent implements OnInit {
    public filterService = inject(FilterService);
    public paginationService = inject(PaginationService<Pet>);
    private router = inject(Router);
    private petsService = inject(PetsService);
    private toastService = inject(ToastService);

    pets: Pet[] = [];
    petOfTheDay: Pet | null = null;
    isLoading: boolean = true;


    private onFiltersChanged = effect(() => {
        this.filterService.filters();
        this.filterService.sort();
        // Reset pagination state when filters or sort change
        this.paginationService.reset();
    });

    constructor() {
        // Set page size
        this.paginationService.setPageSize(APP_CONSTANTS.DEFAULT_PAGE_SIZE);

        // Fetch pets when page changes
        effect(() => {
            this.paginationService.currentPage();
            this.fetchPaginatedPets();
        });
    }

    ngOnInit() {
        // We load pet of the day in fetchPaginatedPets to leverage potential shared data
    }

    async loadPetOfTheDay(preloadedData?: { totalCount: number, pets: Pet[] }) {
        try {
            this.petOfTheDay = await firstValueFrom(
                this.petsService.getPetOfTheDay(this.paginationService.getPageSize(), preloadedData)
            );
        } catch (error) {
            // Error is already handled by the service with toast
            this.petOfTheDay = null;
        }
    }

    private areFiltersEmpty(filters: any, sort: any): boolean {
        // Check if filters match default values
        const areFiltersDefault = !filters.name &&
            !filters.kind &&
            filters.weight === FILTER_CATEGORIES.WEIGHT.ALL &&
            filters.height === FILTER_CATEGORIES.HEIGHT.ALL &&
            filters.length === FILTER_CATEGORIES.LENGTH.ALL;

        // Check if sort is default
        const isSortDefault = sort.sortBy === APP_CONSTANTS.DEFAULT_SORT.SORT_BY &&
            sort.sortOrder === APP_CONSTANTS.DEFAULT_SORT.SORT_ORDER;

        return areFiltersDefault && isSortDefault;
    }

    async fetchPaginatedPets() {
        const page = this.paginationService.currentPage();

        // If we already have this page in cache, use it
        // Use untracked to prevent effect re-execution when cache updates
        const cachedPage = untracked(() => this.paginationService.getPage(page));
        if (cachedPage) {
            this.pets = cachedPage;
            return;
        }

        // Guard against concurrent fetches
        // Use untracked to prevent effect re-execution when fetching state updates
        if (untracked(() => this.paginationService.isFetchingPage())) {
            return;
        }

        const filters = this.filterService.filters();
        const sort = this.filterService.sort();

        this.isLoading = true;
        this.paginationService.setFetching(true);
        try {
            const { pets, totalCount } = await firstValueFrom(
                this.petsService.getPets(
                    page,
                    untracked(() => this.paginationService.getPageSize()),
                    filters,
                    sort
                )
            );

            // Update total pets from header/response
            this.paginationService.setTotalItems(totalCount);

            // Try to load Pet of the Day if not loaded yet
            if (!this.petOfTheDay) {
                // If filters are empty and we are on page 1, we can reuse this data
                if (page === 1 && this.areFiltersEmpty(filters, sort)) {
                    this.loadPetOfTheDay({ totalCount, pets });
                } else {
                    // Otherwise we need to fetch it separately
                    this.loadPetOfTheDay();
                }
            }

            // If we got no pets and we are trying to go to a next page, stay on current page and show toast
            if (pets.length === 0 && page > 1) {
                this.paginationService.setCurrentPage(page - 1);
                this.toastService.info('noMorePets');
                return;
            }

            // Store pets in cache by page number
            this.paginationService.cachePage(page, pets);
            this.pets = pets;
        } catch (error) {
            // Error is already handled by the service with toast
            // Keep current pets if available
            const hasCache = this.paginationService.getPage(1) !== undefined;
            if (!hasCache) {
                this.pets = [];
            }
        } finally {
            this.isLoading = false;
            this.paginationService.setFetching(false);
        }
    }



    get paginatedPets(): Pet[] {
        return this.pets;
    }

    goToPage(page: number) {
        this.paginationService.setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    nextPage() {
        const moved = this.paginationService.nextPage();
        if (!moved) {
            this.toastService.info('noMorePets');
        }
    }

    prevPage() {
        this.paginationService.prevPage();
    }

    goToDetail(id: number) {
        this.router.navigate(['/pets', id]);
    }
}
