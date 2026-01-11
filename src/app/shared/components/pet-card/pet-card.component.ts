import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import type { Pet } from '../../../core/models/pet.model';
import { GramsToKgPipe } from '../../../core/pipes/grams-to-kg.pipe';
import { APP_CONSTANTS } from '../../../core/constants';
import { PetHealthService } from '../../../core/services/pet-health.service';

@Component({
    selector: 'app-pet-card',
    standalone: true,
    imports: [CommonModule, GramsToKgPipe, TranslateModule],
    templateUrl: './pet-card.component.html',
    styleUrls: ['./pet-card.component.scss']
})
export class PetCardComponent {
    private healthService = inject(PetHealthService);
    @Input({ required: true }) pet!: Pet;
    readonly defaultPetImage: string = APP_CONSTANTS.IMAGES.DEFAULT_PET_RELATIVE;

    onImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        if (img.src !== this.defaultPetImage) {
            img.src = this.defaultPetImage;
        }
    }
}
