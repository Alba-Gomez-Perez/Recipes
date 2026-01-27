import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FilterService } from '../../services/filter.service';
import { RecipeFiltersComponent } from '../../../shared/components/recipe-filters/recipe-filters.component';
import { RecipeCreateModalComponent } from '../../../shared/components/recipe-create-modal/recipe-create-modal.component';
import { FloatingAddButtonComponent } from '../../../shared/components/floating-add-button/floating-add-button.component';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterModule, RecipeFiltersComponent, RecipeCreateModalComponent, FloatingAddButtonComponent, TranslateModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    private router = inject(Router);
    public translate = inject(TranslateService);

    isDetailPage: boolean = false;
    showFilters: boolean = true;
    currentLang: string = 'en';
    isMobileMenuOpen: boolean = false;
    showCreateModal: boolean = false;

    ngOnInit() {
        this.currentLang = this.translate.getCurrentLang() || 'en';
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
            this.isDetailPage = event.url.includes('/recipes/');
            this.showFilters = !this.isDetailPage;
            this.isMobileMenuOpen = false; // Close menu on navigation
        });
    }

    switchLanguage(lang: string) {
        this.translate.use(lang);
        this.currentLang = lang;
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    openCreateModal() {
        this.showCreateModal = true;
    }

    closeCreateModal() {
        this.showCreateModal = false;
    }

    onRecipeCreated() {
        // The service already clears the cache and shows a success toast.
        // We just need to close the modal.
        this.closeCreateModal();
    }
}
