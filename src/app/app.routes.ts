import { Routes } from '@angular/router';
import { RecipeListComponent } from './features/recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './features/recipe-detail/recipe-detail.component';

export const appRoutes: Routes = [
    { path: '', component: RecipeListComponent },
    { path: 'recipes/:id', component: RecipeDetailComponent }
];
