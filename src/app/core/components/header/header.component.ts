import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationEnd, Router, RouterModule} from '@angular/router';
import {filter} from 'rxjs/operators';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {FilterService} from '../../services/filter.service';
import {PetFiltersComponent} from '../../../shared/components/pet-filters/pet-filters.component';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterModule, PetFiltersComponent, TranslateModule],
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

    ngOnInit() {
        this.currentLang = this.translate.getCurrentLang() || 'en';
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
            this.isDetailPage = event.url.includes('/pets/');
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
}
