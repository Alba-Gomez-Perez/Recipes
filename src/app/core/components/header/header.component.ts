import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FilterService } from '../../services/filter.service';
import { PetFiltersComponent } from '../../../shared/components/pet-filters/pet-filters.component';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterModule, PetFiltersComponent, TranslateModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    private router = inject(Router);
    private filterService = inject(FilterService);
    public translate = inject(TranslateService);

    isDetailPage: boolean = false;
    showFilters: boolean = true;
    currentLang: string = 'en';

    ngOnInit() {
        this.currentLang = this.translate.currentLang || 'en';
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            this.isDetailPage = event.url.includes('/pets/');
            this.showFilters = !this.isDetailPage;
        });
    }

    switchLanguage(lang: string) {
        this.translate.use(lang);
        this.currentLang = lang;
    }
}
