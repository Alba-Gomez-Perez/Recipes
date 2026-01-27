import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FilterService } from '../../../core/services/filter.service';
import { RecipeCategory, RecipeDifficulty } from '../../../core/models/recipe.model';

@Component({
    selector: 'app-recipe-filters',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './recipe-filters.component.html',
    styleUrls: ['./recipe-filters.component.scss']
})
export class RecipeFiltersComponent {
    public filterService = inject(FilterService);

    categories: RecipeCategory[] = ['dessert', 'fish', 'meat', 'legume', 'rice', 'vegetables', 'doughs', 'pasta', 'others'];

    updateName(event: any) {
        const name = event.target.value;
        this.filterService.updateFilters({ name });
    }

    toggleCategory(category: RecipeCategory | null) {
        const newCategory = this.filterService.filters().category === category ? null : category;
        this.filterService.updateFilters({ category: newCategory });
    }

}
