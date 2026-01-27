import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'minutesToTime',
    standalone: true
})
export class MinutesToTimePipe implements PipeTransform {
    transform(minutes: number): string {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) {
            return `${hours}h`;
        }
        return `${hours}h ${remainingMinutes}min`;
    }
}
