import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import petsService from "../../core/services/pets.service";
import type { Pet } from '../../core/models/pet.model';
import { FilterService, PetFilters } from '../../core/services/filter.service';
import { GramsToKgPipe } from '../../core/pipes/grams-to-kg.pipe';

@Component({
    selector: 'app-pet-list',
    standalone: true,
    imports: [CommonModule, GramsToKgPipe],
    templateUrl: './pet-list.component.html',
    styleUrls: ['./pet-list.component.scss']
})
export class PetListComponent implements OnInit {
    allPets: Pet[] = [];
    pets: Pet[] = [];
    petOfTheDay: Pet | null = null;
    defaultPetImage: string = '/assets/default.png';
    isLoading: boolean = true;

    constructor(
        private router: Router,
        private filterService: FilterService,
    ) { }

    ngOnInit() {
        this.getPets();
    }

    async getPets() {
        this.isLoading = true;
        this.allPets = await petsService.getAllPets();

        // Select pet of the day
        this.petOfTheDay = this.getPetOfTheDay();

        // Subscribe to filter changes
        this.filterService.filters$.subscribe(filters => {
            this.filterPets(filters);
        });
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

    filterPets(filters: PetFilters) {
        this.pets = this.allPets.filter(pet => {
            // Filter by Name
            if (filters.name && !pet.name.toLowerCase().includes(filters.name.toLowerCase())) {
                return false;
            }

            // Filter by Kind
            if (filters.kind && pet.kind !== filters.kind) {
                return false;
            }

            // Filter by Weight
            if (filters.weight !== 'all') {
                if (filters.weight === 'small' && pet.weight >= 5000) return false;
                if (filters.weight === 'medium' && (pet.weight < 5000 || pet.weight > 15000)) return false;
                if (filters.weight === 'large' && pet.weight <= 15000) return false;
            }

            // Filter by Height
            if (filters.height !== 'all') {
                if (filters.height === 'short' && pet.height >= 30) return false;
                if (filters.height === 'average' && (pet.height < 30 || pet.height > 60)) return false;
                if (filters.height === 'tall' && pet.height <= 60) return false;
            }

            // Filter by Length
            if (filters.length !== 'all') {
                if (filters.length === 'short' && pet.length >= 40) return false;
                if (filters.length === 'average' && (pet.length < 40 || pet.length > 80)) return false;
                if (filters.length === 'long' && pet.length <= 80) return false;
            }

            return true;
        });
        this.isLoading = false;
    }

    goToDetail(id: number) {
        this.router.navigate(['/pets', id]);
    }

    onImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = this.defaultPetImage;
    }
}
