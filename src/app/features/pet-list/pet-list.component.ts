import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import petsService from "../../core/services/pets.service";
import type { Pet } from '../../core/models/pet.model';
import { FilterService, PetFilters } from '../../core/services/filter.service';
import { combineLatest } from 'rxjs';

@Component({
    selector: 'app-pet-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pet-list.component.html',
    styleUrls: ['./pet-list.component.scss']
})
export class PetListComponent implements OnInit {
    allPets: Pet[] = [];
    pets: Pet[] = [];
    defaultPetImage: string = '/assets/default.png';
    isLoading: boolean = true;

    constructor(
        private router: Router,
        private filterService: FilterService
    ) { }

    ngOnInit() {
        this.getPets();
    }

    async getPets() {
        this.isLoading = true;
        this.allPets = await petsService.getAllPets();

        // Subscribe to filter changes
        this.filterService.filters$.subscribe(filters => {
            this.filterPets(filters);
        });
        this.isLoading = false;
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
                if (filters.weight === 'small' && pet.weight >= 5) return false;
                if (filters.weight === 'medium' && (pet.weight < 5 || pet.weight > 15)) return false;
                if (filters.weight === 'large' && pet.weight <= 15) return false;
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
    }

    goToDetail(id: number) {
        this.router.navigate(['/pets', id]);
    }

    onImageError(event: Event): void {
        console.log('Image error in list component');
        const img = event.target as HTMLImageElement;
        console.log('Failed image URL:', img.src);
        img.src = this.defaultPetImage;
        console.log('New image URL:', img.src);
    }
}
