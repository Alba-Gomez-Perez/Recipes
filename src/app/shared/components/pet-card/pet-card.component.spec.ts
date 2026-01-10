import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PetCardComponent } from './pet-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { GramsToKgPipe } from '../../../core/pipes/grams-to-kg.pipe';
import { Pet } from '../../../core/models/pet.model';

describe('PetCardComponent', () => {
    let component: PetCardComponent;
    let fixture: ComponentFixture<PetCardComponent>;

    const mockPet: Pet = {
        id: 1,
        name: 'Rex',
        kind: 'dog',
        weight: 10000,
        height: 50,
        length: 60,
        photo_url: 'https://example.com/rex.jpg',
        description: 'A friendly dog'
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PetCardComponent, GramsToKgPipe, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(PetCardComponent);
        component = fixture.componentInstance;
        component.pet = mockPet;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display pet information', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('h3')?.textContent).toContain('Rex');
    });

    it('should handle image error by setting default image', () => {
        const img = fixture.nativeElement.querySelector('img');
        const event = { target: img } as any;

        component.onImageError(event);

        expect(img.src).toContain(component.defaultPetImage);
    });

    it('should not re-set default image if it is already the source', () => {
        const img = fixture.nativeElement.querySelector('img');
        img.src = component.defaultPetImage;
        const event = { target: img } as any;

        const originalSrc = img.src;
        component.onImageError(event);

        expect(img.src).toBe(originalSrc);
    });
});
