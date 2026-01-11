import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {firstValueFrom} from 'rxjs';
import {PetsService} from "../../core/services/pets.service";
import type {Pet} from '../../core/models/pet.model';
import {GramsToKgPipe} from '../../core/pipes/grams-to-kg.pipe';
import {APP_CONSTANTS} from '../../core/constants';

@Component({
    selector: 'app-pet-detail',
    standalone: true,
    imports: [CommonModule, GramsToKgPipe, RouterModule, TranslateModule],
    templateUrl: './pet-detail.component.html',
    styleUrls: ['./pet-detail.component.scss']
})
export class PetDetailComponent implements OnInit {
    pet: Pet | undefined;
    readonly defaultPetImage: string = APP_CONSTANTS.IMAGES.DEFAULT_PET;
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private petsService = inject(PetsService);

    ngOnInit() {
        this.route.params.subscribe(params => {
            const id = +params['id'];
            if (id) {
                void this.getPet(id);
            }
        });
    }

    async getPet(id: number) {
        try {
            this.pet = await firstValueFrom(this.petsService.getPetById(id));
            if (!this.pet) {
                void this.router.navigate(['/']);
            }
        } catch (error) {
            // Error is already handled by the service with toast
            this.pet = undefined;
        }
    }

    onImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = this.defaultPetImage;
    }

    getHealthHeart(): string {
        switch (this.pet?.health) {
            case 'unhealthy': return '❤️';
            case 'very healthy': return '💚';
            default: return '💛';
        }
    }
}
