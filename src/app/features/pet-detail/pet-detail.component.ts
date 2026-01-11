import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {firstValueFrom} from 'rxjs';
import {PetsService} from "../../core/services/pets.service";
import type {Pet} from '../../core/models/pet.model';
import {GramsToKgPipe} from '../../core/pipes/grams-to-kg.pipe';
import {APP_CONSTANTS} from '../../core/constants';
import {PetHealthService} from "../../core/services/pet-health.service";

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
    private healthService = inject(PetHealthService);
    private petsService = inject(PetsService);

    ngOnInit() {
        this.route.params.subscribe(params => {
            const id = +params['id'];
            if (id) {
                this.getPet(id);
            }
        });
    }

    async getPet(id: number) {
        try {
            this.pet = await firstValueFrom(this.petsService.getPetById(id));
            if (!this.pet) {
                this.router.navigate(['/']);
                return;
            }
            this.getHealthStatus();
        } catch (error) {
            // Error is already handled by the service with toast
            this.pet = undefined;
        }
    }

    onImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = this.defaultPetImage;
    }

    getHealthStatus(): string {
        if (!this.pet) return ''
        if (!this.pet.health) {
            this.pet.health = this.healthService.getPetHealth(this.pet);
        }
        return this.pet.health;
    }

    getHealthHeart(): string {
        switch (this.pet?.health) {
            case 'unhealthy': return '❤️';
            case 'very healthy': return '💚';
            default: return '💛';
        }
    }
}
