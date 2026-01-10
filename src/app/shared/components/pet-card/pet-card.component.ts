import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import type { Pet } from '../../../core/models/pet.model';
import { GramsToKgPipe } from '../../../core/pipes/grams-to-kg.pipe';

@Component({
    selector: 'app-pet-card',
    standalone: true,
    imports: [CommonModule, GramsToKgPipe, TranslateModule],
    templateUrl: './pet-card.component.html',
    styleUrls: ['./pet-card.component.scss']
})
export class PetCardComponent {
    @Input({ required: true }) pet!: Pet;
    defaultPetImage: string = 'assets/default.png';

    onImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        if (img.src !== this.defaultPetImage) {
            img.src = this.defaultPetImage;
        }
    }
}
