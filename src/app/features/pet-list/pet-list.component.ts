import { Component, effect, inject, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PetsService } from "../../core/services/pets.service";
import type { Pet } from '../../core/models/pet.model';
import {FilterService, PetFilters, PetSort} from '../../core/services/filter.service';
import { ToastService } from '../../core/services/toast.service';
import { PaginationService } from '../../core/services/pagination.service';
import { PetCardComponent } from '../../shared/components/pet-card/pet-card.component';
import { APP_CONSTANTS, FILTER_CATEGORIES } from '../../core/constants';

@Component({
    selector: 'app-pet-list',
    standalone: true,
    imports: [CommonModule, PetCardComponent, TranslateModule],
    templateUrl: './pet-list.component.html',
    styleUrls: ['./pet-list.component.scss']
})
export class PetListComponent {
    public filterService = inject(FilterService);
    public paginationService = inject(PaginationService<Pet>);
    private router = inject(Router);
    private petsService = inject(PetsService);
    private toastService = inject(ToastService);

    pets: Pet[] = [];
    petOfTheDay: Pet | null = null;
    isLoading: boolean = true;

    // --- Effect Initialization Flags ---
    private isFiltersInitialized = false;
    private isSortInitialized = false;
    private isPageInitialized = false;

    constructor() {
        // Set page size for pagination
        this.paginationService.setPageSize(APP_CONSTANTS.DEFAULT_PAGE_SIZE);

        // --- Effects for Data Fetching Logic ---
        effect(() => {
            this.filterService.filters(); // Dependency on filters signal

            if (!this.isFiltersInitialized) {
                this.isFiltersInitialized = true;
                return;
            }

            // When filters change, reset pagination to page 1 and clear the cache
            const wasPageOne = untracked(() => this.paginationService.currentPage() === 1);
            this.paginationService.reset();

            // If we were already on page 1, the page change effect won't fire,
            // so we need to trigger the fetch manually for page 1.
            if (wasPageOne) {
                void this.fetchPaginatedPets(1);
            }
        });

        effect(() => {
            this.filterService.sort(); // Dependency on sort signal

            if (!this.isSortInitialized) {
                this.isSortInitialized = true;
                return;
            }

            // When sort order changes, clear the cache and refetch the current page
            this.paginationService.clearCache();
            const currentPage = untracked(() => this.paginationService.currentPage());
            void this.fetchPaginatedPets(currentPage);
        });

        effect(() => {
            const page = this.paginationService.currentPage(); // Dependency on current page signal

            if (!this.isPageInitialized) {
                this.isPageInitialized = true;
            }

            void this.fetchPaginatedPets(page);
        });
    }

    async loadPetOfTheDay(preloadedData?: { totalCount: number, pets: Pet[] }) {
        try {
            this.petOfTheDay = await firstValueFrom(
                this.petsService.getPetOfTheDay(this.paginationService.getPageSize(), preloadedData)
            );
        } catch (error) {
            // Error is handled by the service, which shows a toast message.
            this.petOfTheDay = null;
        }
    }

    private areFiltersEmpty(filters: PetFilters, sort: PetSort): boolean {
        const areFiltersDefault = !filters.name &&
            !filters.kind &&
            filters.weight === FILTER_CATEGORIES.WEIGHT.ALL &&
            filters.height === FILTER_CATEGORIES.HEIGHT.ALL &&
            filters.length === FILTER_CATEGORIES.LENGTH.ALL;

        const isSortDefault = sort.sortBy === APP_CONSTANTS.DEFAULT_SORT.SORT_BY &&
            sort.sortOrder === APP_CONSTANTS.DEFAULT_SORT.SORT_ORDER;

        return areFiltersDefault && isSortDefault;
    }

    async fetchPaginatedPets(page: number) {
        // Use cached page if available to avoid unnecessary API calls
        const cachedPage = untracked(() => this.paginationService.getPage(page));
        if (cachedPage) {
            this.pets = cachedPage;
            this.isLoading = false;
            if (!this.petOfTheDay) {
                void this.loadPetOfTheDay();
            }
            return;
        }

        // Prevent concurrent fetches
        if (untracked(() => this.paginationService.isFetchingPage())) {
            return;
        }

        const filters = untracked(() => this.filterService.filters());
        const sort = untracked(() => this.filterService.sort());

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

            this.paginationService.setTotalItems(totalCount);

            // Load Pet of the Day if it hasn't been loaded yet
            if (!this.petOfTheDay) {
                if (page === 1 && this.areFiltersEmpty(filters, sort)) {
                    // Reuse data if on the first page with no filters
                    void this.loadPetOfTheDay({ totalCount, pets });
                } else {
                    void this.loadPetOfTheDay();
                }
            }

            // If the current page has no pets (e.g., beyond the last page), go back one page
            if (pets.length === 0 && page > 1) {
                this.paginationService.setCurrentPage(page - 1);
                this.toastService.info('noMorePets');
                return;
            }

            this.paginationService.cachePage(page, pets);
            this.pets = pets;
        } catch (error) {
            // Errors are handled by the service. If no pets are cached, show an empty list.
            if (!this.paginationService.getPage(1)) {
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
        if (!this.paginationService.nextPage()) {
            this.toastService.info('noMorePets');
        }
    }

    prevPage() {
        this.paginationService.prevPage();
    }

    goToDetail(id: number) {
        void this.router.navigate(['/pets', id]);
    }
}
