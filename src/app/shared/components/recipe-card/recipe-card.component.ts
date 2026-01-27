import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import type { Recipe } from '../../../core/models/recipe.model';
import { MinutesToTimePipe } from '../../../core/pipes/minutes-to-time.pipe';
import { APP_CONSTANTS } from '../../../core/constants';

@Component({
    selector: 'app-recipe-card',
    standalone: true,
    imports: [CommonModule, MinutesToTimePipe, TranslateModule],
    templateUrl: './recipe-card.component.html',
    styleUrls: ['./recipe-card.component.scss']
})
export class RecipeCardComponent {
    @Input({ required: true }) recipe!: Recipe;
    readonly defaultRecipeImage: string = APP_CONSTANTS.IMAGES.DEFAULT_RECIPE;

    onImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        if (img.src !== this.defaultRecipeImage) {
            img.src = this.defaultRecipeImage;
        }
    }

    getCategoryIcon(): string {
        switch (this.recipe?.category) {
            case 'dessert': return '🍰';
            case 'fish': return '🐟';
            case 'meat': return '🥩';
            case 'legume': return '🫘';
            case 'rice': return '🍚';
            case 'vegetables': return '🥦';
            case 'doughs': return '🥖';
            case 'pasta': return '🍝';
            case 'others': return '🍽️';
            default: return '🍽️';
        }
    }
}
