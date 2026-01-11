import { Injectable } from '@angular/core';
import { Pet } from '../models/pet.model';
import { HealthCalculatorFactory } from '../utils/pet-health.calculator';

@Injectable({
    providedIn: 'root'
})
export class PetHealthService {
    /**
     * Calculates the health status of a pet based on its kind and attributes.
     * @param pet The pet to calculate health for
     * @returns The health status ('unhealthy' | 'healthy' | 'very healthy')
     */
    getPetHealth(pet: Pet): string {
        try {
            const calculator = HealthCalculatorFactory.getCalculator(pet.kind);
            return calculator.calculate(pet);
        } catch (error) {
            console.warn('Error calculating pet health:', error);
            return 'unknown';
        }
    }
}
