import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import petsService from "../../core/services/pets.service";
import type { Pet } from '../../core/models/pet.model';
import { FilterService, PetFilters, PetSort } from '../../core/services/filter.service';
import { GramsToKgPipe } from '../../core/pipes/grams-to-kg.pipe';
import { PetCardComponent } from '../../shared/components/pet-card/pet-card.component';

@Component({
    selector: 'app-pet-list',
    standalone: true,
    imports: [CommonModule, GramsToKgPipe, PetCardComponent],
    templateUrl: './pet-list.component.html',
    styleUrls: ['./pet-list.component.scss']
})
export class PetListComponent implements OnInit {
    pets: Pet[] = [];
    allPets: Pet[] = [];
    petOfTheDay: Pet | null = null;
    isLoading: boolean = true;

    // Pagination
    currentPage: number = 1;
    pageSize: number = 6;
    totalPetsCount: number = 0;
    currentFilters: PetFilters = {
        name: '',
        kind: null,
        weight: 'all',
        height: 'all',
        length: 'all'
    };

    currentSort: PetSort = {
        sortBy: 'name',
        sortOrder: 'asc'
    };

    constructor(
        private router: Router,
        private filterService: FilterService,
    ) { }

    ngOnInit() {
        // Initialize currentPage and subscribe to filter changes
        this.filterService.filters$.subscribe(filters => {
            this.currentFilters = filters;
            this.currentPage = 1;
            this.fetchPaginatedPets();
        });
        this.filterService.sort$.subscribe(sort => {
            this.currentSort = sort;
            this.currentPage = 1;
            this.fetchPaginatedPets();
        });
        this.getPets();
    }

    async getPets() {
        this.isLoading = true;
        this.allPets = await petsService.getAllPets();
        this.petOfTheDay = this.getPetOfTheDay();
    }

    async fetchPaginatedPets() {
        this.isLoading = true;
        const { pets, totalCount } = await petsService.getPets(this.currentPage, this.pageSize, this.currentFilters, this.currentSort);
        this.pets = pets;
        this.totalPetsCount = totalCount;
        this.isLoading = false;
    }

    getPetOfTheDay(): Pet | null {
        if (this.allPets.length === 0) return null;

        const today = new Date();

        const year: number = today.getFullYear();
        const month: number = today.getMonth() + 1;
        const day: number = today.getDate();
        const dateSeed: number = year * 10000 + month * 100 + day;

        const index: number = dateSeed % this.allPets.length;

        return this.allPets[index];
    }

    get paginatedPets(): Pet[] {
        return this.pets;
    }

    get totalPages(): number {
        return Math.ceil(this.totalPetsCount / this.pageSize);
    }

    get pages(): number[] {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.fetchPaginatedPets();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.goToPage(this.currentPage + 1);
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
        }
    }

    goToDetail(id: number) {
        this.router.navigate(['/pets', id]);
    }
}
