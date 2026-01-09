import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import petsService from "../../core/services/pets.service";
import type { Pet } from '../../core/models/pet.model';

@Component({
    selector: 'app-pet-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pet-detail.component.html',
    styleUrls: ['./pet-detail.component.scss']
})
export class PetDetailComponent implements OnInit {
    pet: Pet | undefined;
    defaultPetImage: string = '/assets/default.png';

    constructor(private route: ActivatedRoute) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            const id = +params['id'];
            if (id) {
                this.getPet(id);
            }
        });
    }

    async getPet(id: number) {
        this.pet = await petsService.getPetById(id);
    }

    onImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = this.defaultPetImage;
    }
}
