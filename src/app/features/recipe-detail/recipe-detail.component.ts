import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { RecipesService } from "../../core/services/recipes.service";
import type { Recipe } from '../../core/models/recipe.model';
import { MinutesToTimePipe } from '../../core/pipes/minutes-to-time.pipe';
import { APP_CONSTANTS } from '../../core/constants';

@Component({
    selector: 'app-recipe-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule],
    templateUrl: './recipe-detail.component.html',
    styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent implements OnInit {
    recipe: Recipe | undefined;
    readonly defaultRecipeImage: string = APP_CONSTANTS.IMAGES.DEFAULT_RECIPE;
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private recipesService = inject(RecipesService);

    ngOnInit() {
        this.route.params.subscribe(params => {
            const idParam = params['id'];
            if (idParam) {
                // If it evaluates to a valid number implicitly, try parsing, otherwise keep as string 
                const id = isNaN(Number(idParam)) ? idParam : Number(idParam);
                void this.getRecipe(id);
            }
        });
    }

    async getRecipe(id: number | string) {
        try {
            this.recipe = await firstValueFrom(this.recipesService.getRecipeById(id));
            if (!this.recipe) {
                void this.router.navigate(['/']);
            }
        } catch (error) {
            // Error is already handled by the service with toast
            this.recipe = undefined;
        }
    }

    onImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = this.defaultRecipeImage;
    }



    getDifficultyIcon(): string {
        switch (this.recipe?.difficulty) {
            case 'easy': return '👨‍🍳';
            case 'hard': return '👨‍🍳👨‍🍳👨‍🍳';
            default: return '👨‍🍳👨‍🍳';
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
