import {Routes} from '@angular/router';
import {PetListComponent} from './features/pet-list/pet-list.component';
import {PetDetailComponent} from './features/pet-detail/pet-detail.component';

export const appRoutes: Routes = [
    { path: '', component: PetListComponent },
    { path: 'pets/:id', component: PetDetailComponent }
];
