import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'gramsToKg',
    standalone: true
})
export class GramsToKgPipe implements PipeTransform {
    transform(grams: number): number {
        return grams / 1000;
    }
}
