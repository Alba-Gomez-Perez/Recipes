import {TestBed} from '@angular/core/testing';
import {PetHealthService} from './pet-health.service';
import {Pet} from '../models/pet.model';
import {HealthCalculatorFactory} from '../utils/pet-health.calculator';

describe('PetHealthService', () => {
    let service: PetHealthService;

    const basePet: Pet = {
        id: 1,
        name: 'Test',
        kind: 'dog',
        weight: 1000,
        height: 10,
        length: 10,
        photo_url: '',
        description: ''
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [PetHealthService]
        });
        service = TestBed.inject(PetHealthService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getPetHealth', () => {
        it('should calculate health for dogs correctly', () => {
            const healthyDog: Pet = { ...basePet, kind: 'dog', weight: 4000, height: 10, length: 100 }; // Score 4
            expect(service.getPetHealth(healthyDog)).toBe('healthy');

            const veryHealthyDog: Pet = { ...basePet, kind: 'dog', weight: 2500, height: 10, length: 100 }; // Score 2.5
            expect(service.getPetHealth(veryHealthyDog)).toBe('very healthy');

            const unhealthyDog: Pet = { ...basePet, kind: 'dog', weight: 8000, height: 10, length: 100 }; // Score 8
            expect(service.getPetHealth(unhealthyDog)).toBe('unhealthy');
        });

        it('should calculate health for cats correctly', () => {
            const oneLifeCat: Pet = { ...basePet, kind: 'cat', number_of_lives: 1 };
            expect(service.getPetHealth(oneLifeCat)).toBe('unhealthy');

            const normalCat: Pet = { ...basePet, kind: 'cat', number_of_lives: 7, weight: 4000, height: 10, length: 100 }; // Score 4
            expect(service.getPetHealth(normalCat)).toBe('healthy');
        });

        it('should return "healthy" for unknown pet kinds', () => {
            const unknownPet: Pet = { ...basePet, kind: 'bird' as any };
            expect(service.getPetHealth(unknownPet)).toBe('healthy');
        });

        it('should return "unknown" and log a warning if calculator creation fails', () => {
            spyOn(HealthCalculatorFactory, 'getCalculator').and.throwError('Test Error');
            spyOn(console, 'warn');

            const dog: Pet = { ...basePet, kind: 'dog' };
            const result = service.getPetHealth(dog);

            expect(result).toBe('unknown');
            expect(console.warn).toHaveBeenCalledWith('Error calculating pet health:', jasmine.any(Error));
        });
    });
});
