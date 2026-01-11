import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Pet } from "../models/pet.model";
import { API_CONSTANTS, FILTER_THRESHOLDS, FILTER_CATEGORIES } from "../constants";
import { PetFilters, PetSort } from './filter.service';
import { ToastService } from './toast.service';
import { PaginationService } from './pagination.service';
import { PetHealthService } from './pet-health.service';

export interface GetPetsResponse {
    pets: Pet[];
    totalCount: number;
}

class PetQueryBuilder {
    private params = new HttpParams();

    withPagination(page?: number, limit?: number): this {
        if (page !== undefined && limit !== undefined) {
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.PAGE, page.toString());
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.LIMIT, limit.toString());
        }
        return this;
    }

    withFilters(filters?: PetFilters): this {
        if (!filters) {
            return this;
        }

        if (filters.name) {
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.NAME_LIKE, filters.name);
        }

        if (filters.kind) {
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.KIND, filters.kind);
        }

        // Weight filter
        if (filters.weight === FILTER_CATEGORIES.WEIGHT.SMALL) {
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.WEIGHT_LTE, FILTER_THRESHOLDS.WEIGHT.SMALL_MAX.toString());
        } else if (filters.weight === FILTER_CATEGORIES.WEIGHT.MEDIUM) {
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.WEIGHT_GTE, FILTER_THRESHOLDS.WEIGHT.MEDIUM_MIN.toString());
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.WEIGHT_LTE, FILTER_THRESHOLDS.WEIGHT.MEDIUM_MAX.toString());
        } else if (filters.weight === FILTER_CATEGORIES.WEIGHT.LARGE) {
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.WEIGHT_GTE, FILTER_THRESHOLDS.WEIGHT.LARGE_MIN.toString());
        }

        // Height filter
        if (filters.height === FILTER_CATEGORIES.HEIGHT.SHORT) {
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.HEIGHT_LTE, FILTER_THRESHOLDS.HEIGHT.SHORT_MAX.toString());
        } else if (filters.height === FILTER_CATEGORIES.HEIGHT.AVERAGE) {
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.HEIGHT_GTE, FILTER_THRESHOLDS.HEIGHT.AVERAGE_MIN.toString());
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.HEIGHT_LTE, FILTER_THRESHOLDS.HEIGHT.AVERAGE_MAX.toString());
        } else if (filters.height === FILTER_CATEGORIES.HEIGHT.TALL) {
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.HEIGHT_GTE, FILTER_THRESHOLDS.HEIGHT.TALL_MIN.toString());
        }

        // Length filter
        if (filters.length === FILTER_CATEGORIES.LENGTH.SHORT) {
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.LENGTH_LTE, FILTER_THRESHOLDS.LENGTH.SHORT_MAX.toString());
        } else if (filters.length === FILTER_CATEGORIES.LENGTH.AVERAGE) {
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.LENGTH_GTE, FILTER_THRESHOLDS.LENGTH.AVERAGE_MIN.toString());
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.LENGTH_LTE, FILTER_THRESHOLDS.LENGTH.AVERAGE_MAX.toString());
        } else if (filters.length === FILTER_CATEGORIES.LENGTH.LONG) {
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.LENGTH_GTE, FILTER_THRESHOLDS.LENGTH.LONG_MIN.toString());
        }

        return this;
    }

    withSort(sort?: PetSort): this {
        if (sort?.sortBy) {
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.SORT, sort.sortBy);
            this.params = this.params.append(API_CONSTANTS.QUERY_PARAMS.ORDER, sort.sortOrder || 'asc');
        }
        return this;
    }

    build(): HttpParams {
        return this.params;
    }
}


/**
 * Service to get pets from API
 */
@Injectable({
    providedIn: 'root'
})
export class PetsService {
    private readonly http = inject(HttpClient);
    private readonly toastService = inject(ToastService);
    private readonly paginationService = inject(PaginationService);
    private readonly petHealthService = inject(PetHealthService);
    private readonly apiUrl = API_CONSTANTS.BASE_URL;

    /**
     * Get pets with pagination and filters
     * @param page - The page number
     * @param limit - The number of pets per page
     * @param filters - Optional filters
     * @param sort - Optional sort configuration
     * @returns Observable with pets and total count
     */
    getPets(page?: number, limit?: number, filters?: PetFilters, sort?: PetSort): Observable<GetPetsResponse> {
        const params = new PetQueryBuilder()
            .withPagination(page, limit)
            .withFilters(filters)
            .withSort(sort)
            .build()
            .append('_t', Date.now().toString());

        return this.http.get<Pet[]>(this.apiUrl, {
            params,
            observe: 'response'
        }).pipe(
            map(response => {
                const totalCountHeader = response.headers.get(API_CONSTANTS.HEADERS.TOTAL_COUNT);
                const data: any = response.body;

                let pets: Pet[] = [];
                if (Array.isArray(data)) {
                    pets = data;
                } else if (data?.data) {
                    pets = data.data;
                }

                pets.forEach(pet => pet.health = this.petHealthService.getPetHealth(pet));

                const totalCount = data?.items ?? (totalCountHeader ? parseInt(totalCountHeader, 10) : pets.length);

                return {
                    pets,
                    totalCount: isNaN(totalCount) ? pets.length : totalCount
                };
            }),
            catchError((error: HttpErrorResponse) => {
                return this.handleError<GetPetsResponse>('getPets', { pets: [], totalCount: 0 }, error);
            })
        );
    }

    /**
     * Calculate the pet of the day index based on the current date
     * @param totalCount - Total number of pets
     * @returns The index (0-based) of the pet of the day
     */
    private calculatePetOfTheDayIndex(totalCount: number): number {
        if (totalCount === 0) return -1;

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const dateSeed = year * 10000 + month * 100 + day;

        return dateSeed % totalCount;
    }

    /**
     * Get the pet of the day
     * Algorithm:
     * 1. Fetch first page to get total count
     * 2. Calculate which pet should be pet of the day based on date
     * 3. If it's in first page, return it
     * 4. Otherwise, fetch the specific page containing it
     * @param pageSize - Page size to use for fetching
     * @param preloadedData - Optional data from a previous search (must be page 1 and unfiltered)
     * @returns Observable with the pet of the day or null
     */
    getPetOfTheDay(pageSize: number, preloadedData?: { totalCount: number, pets: Pet[] }): Observable<Pet | null> {
        const source$ = preloadedData
            ? of(preloadedData)
            : this.getPets(1, pageSize);

        return source$.pipe(
            switchMap(({ pets: firstPagePets, totalCount }) => {
                if (totalCount === 0) {
                    return of(null);
                }

                const petOfTheDayIndex = this.calculatePetOfTheDayIndex(totalCount);

                // If pet is in first page, return it
                if (petOfTheDayIndex < firstPagePets.length) {
                    return of(firstPagePets[petOfTheDayIndex]);
                }

                // Calculate which page contains the pet
                const targetPage = Math.floor(petOfTheDayIndex / pageSize) + 1;
                const positionInPage = petOfTheDayIndex % pageSize;

                // Fetch the target page
                return this.getPets(targetPage, pageSize).pipe(
                    map(({ pets: targetPagePets }) => {
                        if (targetPagePets.length > positionInPage) {
                            return targetPagePets[positionInPage];
                        }
                        // Fallback to first pet if something went wrong
                        return null;
                    })
                );
            }),
            catchError(() => of(null))
        );
    }

    /**
     * Get a pet by id
     * @param id - The id of the pet
     * @returns Observable with the pet found, or undefined if not found
     */
    getPetById(id: number): Observable<Pet | undefined> {
        // Check local cache first
        const cachedPet = this.paginationService.findInCache(pet => pet.id === id);
        if (cachedPet) {
            return of(cachedPet);
        }

        return this.http.get<Pet>(`${this.apiUrl}/${id}`).pipe(
            map(pet => {
                if (pet) {
                    pet.health = this.petHealthService.getPetHealth(pet);
                }
                return pet;
            }),
            catchError((error: HttpErrorResponse) => {
                console.error(`petsService.getPetById:`, error);
                if (error.status === 404) {
                    this.toastService.error('errorPetNotFound');
                } else if (error.status === 0 || error.error instanceof ProgressEvent) {
                    this.toastService.error('errorNetwork');
                } else {
                    this.toastService.error('errorFetchingPet');
                }
                // Return undefined instead of throwing
                return of(undefined);
            })
        );
    }

    /**
     * Handle HTTP errors
     * @param operation - Name of the operation that failed
     * @param result - Optional value to return as the observable result
     * @param error - The HTTP error response
     */
    private handleError<T>(operation: string, result: T, error: HttpErrorResponse): Observable<T> {
        console.error(`petsService.${operation}:`, error);

        // Show user-friendly error message
        if (error.status === 0 || error.error instanceof ProgressEvent) {
            // Network error
            this.toastService.error('errorNetwork');
        } else if (error.status >= 500) {
            // Server error
            this.toastService.error('errorFetchingPets');
        } else if (error.status >= 400) {
            // Client error
            this.toastService.error('errorFetchingPets');
        } else {
            // Other errors
            this.toastService.error('errorGeneric');
        }

        // Return a safe result
        return of(result);
    }
}
