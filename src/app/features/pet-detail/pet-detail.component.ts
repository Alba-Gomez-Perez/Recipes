import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PetsService } from "../../core/services/pets.service";
import type { Pet } from '../../core/models/pet.model';
import { GramsToKgPipe } from '../../core/pipes/grams-to-kg.pipe';
import { RouterModule } from '@angular/router';
import { APP_CONSTANTS } from '../../core/constants';
import { ToastService } from '../../core/services/toast.service';

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
    private petsService = inject(PetsService);
    private toastService = inject(ToastService);

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
                // Pet not found - error already shown by service
                // Could navigate back or show additional UI here
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
}
