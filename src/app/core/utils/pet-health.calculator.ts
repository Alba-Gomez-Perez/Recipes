import {Pet} from "../models/pet.model";

type PetHealthType = 'unhealthy' | 'healthy' | 'very healthy'

export interface HealthCalculator {
    calculate(pet: Pet): PetHealthType;
}

abstract class BaseHealthCalculator implements HealthCalculator {
    abstract calculate(pet: Pet): PetHealthType;

    protected getCommonHealth(pet: Pet): PetHealthType {
        const petHealthScore = pet.weight / (pet.height * pet.length);
        // unhealthy below 2 or over 5
        if (petHealthScore < 2 || petHealthScore > 5) {
            return 'unhealthy';
        }

        // healthy between 3 and 5
        if (petHealthScore >= 3) {
            return 'healthy';
        }

        // very healthy between 2 and 3
        return 'very healthy';
    }
}

export class CatHealthCalculator extends BaseHealthCalculator {
    calculate(pet: Pet): PetHealthType {
        if (pet.number_of_lives === 1) return 'unhealthy';
        return this.getCommonHealth(pet);
    }
}

export class DogHealthCalculator extends BaseHealthCalculator {
    calculate(pet: Pet): PetHealthType {
        return this.getCommonHealth(pet);
    }
}

export class DefaultHealthCalculator implements HealthCalculator {
    calculate(pet: Pet): PetHealthType {
        return 'healthy';
    }
}

export class HealthCalculatorFactory {
    static getCalculator(kind: string): HealthCalculator {
        switch (kind?.toLowerCase()) {
            case 'cat': return new CatHealthCalculator();
            case 'dog': return new DogHealthCalculator();
            default: return new DefaultHealthCalculator();
        }
    }
}