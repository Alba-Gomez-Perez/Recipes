import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import petsService from "../../core/services/pets.service";
import type { Pet } from '../../core/models/pet.model';

@Component({
    selector: 'app-pet-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pet-list.component.html',
    styleUrls: ['./pet-list.component.scss']
})
export class PetListComponent implements OnInit {
    pets: Pet[] = [];

    constructor(private router: Router) { }

    ngOnInit() {
        this.getPets();
    }
    async getPets() {
        this.pets = await petsService.getAllPets();
        console.log('Todas las mascotas:', this.pets);
    }

    goToDetail(id: number) {
        this.router.navigate(['/pets', id]);
    }
}
