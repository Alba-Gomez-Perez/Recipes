import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Pet } from "../models/pet.model";
import { API_CONSTANTS, FILTER_THRESHOLDS, FILTER_CATEGORIES } from "../constants";
import { PetFilters, PetSort } from './filter.service';
import { ToastService } from './toast.service';
import { PaginationService } from './pagination.service';

export interface GetPetsParams {
    page?: number;
    limit?: number;
    filters?: PetFilters;
    sort?: PetSort;
}

export interface GetPetsResponse {
    pets: Pet[];
    totalCount: number;
}

/**
 * Builds HttpParams from pagination, filters, and sort parameters
 */
function buildQueryParams(params: GetPetsParams): HttpParams {
    let httpParams = new HttpParams();

    // Pagination
    if (params.page !== undefined && params.limit !== undefined) {
        httpParams = httpParams.append(API_CONSTANTS.QUERY_PARAMS.PAGE, params.page.toString());
        httpParams = httpParams.append(API_CONSTANTS.QUERY_PARAMS.LIMIT, params.limit.toString());
    }

    // Filters
    if (params.filters) {
        const filters = params.filters;

        if (filters.name) {
            httpParams = httpParams.append(API_CONSTANTS.QUERY_PARAMS.NAME_LIKE, filters.name);
        }

        if (filters.kind) {
            httpParams = httpParams.append(API_CONSTANTS.QUERY_PARAMS.KIND, filters.kind);
        }

        // Weight filter
        if (filters.weight === FILTER_CATEGORIES.WEIGHT.SMALL) {
            httpParams = httpParams.append(API_CONSTANTS.QUERY_PARAMS.WEIGHT_LTE, FILTER_THRESHOLDS.WEIGHT.SMALL_MAX.toString());
        } else if (filters.weight === FILTER_CATEGORIES.WEIGHT.MEDIUM) {
            httpParams = httpParams.append(API_CONSTANTS.QUERY_PARAMS.WEIGHT_GTE, FILTER_THRESHOLDS.WEIGHT.MEDIUM_MIN.toString());
            httpParams = httpParams.append(API_CONSTANTS.QUERY_PARAMS.WEIGHT_LTE, FILTER_THRESHOLDS.WEIGHT.MEDIUM_MAX.toString());
        } else if (filters.weight === FILTER_CATEGORIES.WEIGHT.LARGE) {
            httpParams = httpParams.append(API_CONSTANTS.QUERY_PARAMS.WEIGHT_GTE, FILTER_THRESHOLDS.WEIGHT.LARGE_MIN.toString());
        }

        // Height filter
        if (filters.height === FILTER_CATEGORIES.HEIGHT.SHORT) {
            httpParams = httpParams.append(API_CONSTANTS.QUERY_PARAMS.HEIGHT_LTE, FILTER_THRESHOLDS.HEIGHT.SHORT_MAX.toString());
        } else if (filters.height === FILTER_CATEGORIES.HEIGHT.AVERAGE) {
            httpParams = httpParams.append(API_CONSTANTS.QUERY_PARAMS.HEIGHT_GTE, FILTER_THRESHOLDS.HEIGHT.AVERAGE_MIN.toString());
            httpParams = httpParams.append(API_CONSTANTS.QUERY_PARAMS.HEIGHT_LTE, FILTER_THRESHOLDS.HEIGHT.AVERAGE_MAX.toString());
        } else if (filters.height === FILTER_CATEGORIES.HEIGHT.TALL) {
            httpParams = httpParams.append(API_CONSTANTS.QUERY_PARAMS.HEIGHT_GTE, FILTER_THRESHOLDS.HEIGHT.TALL_MIN.toString());
        }

        // Length filter
        if (filters.length === FILTER_CATEGORIES.LENGTH.SHORT) {
            httpParams = httpParams.append(API_CONSTANTS.QUERY_PARAMS.LENGTH_LTE, FILTER_THRESHOLDS.LENGTH.SHORT_MAX.toString());
        } else if (filters.length === FILTER_CATEGORIES.LENGTH.AVERAGE) {
            httpParams = httpParams.append(API_CONSTANTS.QUERY_PARAMS.LENGTH_GTE, FILTER_THRESHOLDS.LENGTH.AVERAGE_MIN.toString());
            httpParams = httpParams.append(API_CONSTANTS.QUERY_PARAMS.LENGTH_LTE, FILTER_THRESHOLDS.LENGTH.AVERAGE_MAX.toString());
        } else if (filters.length === FILTER_CATEGORIES.LENGTH.LONG) {
            httpParams = httpParams.append(API_CONSTANTS.QUERY_PARAMS.LENGTH_GTE, FILTER_THRESHOLDS.LENGTH.LONG_MIN.toString());
        }
    }

    // Sort
    if (params.sort?.sortBy) {
        httpParams = httpParams.append(API_CONSTANTS.QUERY_PARAMS.SORT, params.sort.sortBy);
        httpParams = httpParams.append(API_CONSTANTS.QUERY_PARAMS.ORDER, params.sort.sortOrder || 'asc');
    }

    return httpParams;
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
        let params = buildQueryParams({ page, limit, filters, sort });

        // Add cache busting to ensure we get headers like X-Total-Count
        params = params.append('_t', Date.now().toString());

        return this.http.get<Pet[]>(this.apiUrl, {
            params,
            observe: 'response'
        }).pipe(
            map(response => {
                const totalCountHeader = response.headers.get(API_CONSTANTS.HEADERS.TOTAL_COUNT);
                const data: any = response.body;

                if (Array.isArray(data)) {
                    const totalCount = totalCountHeader ? parseInt(totalCountHeader, 10) : data.length;
                    return {
                        pets: data,
                        totalCount: isNaN(totalCount) ? data.length : totalCount
                    };
                }

                if (data?.data) {
                    const pets = data.data;
                    const totalCount = data.items ?? (totalCountHeader ? parseInt(totalCountHeader, 10) : pets.length);
                    return {
                        pets,
                        totalCount: isNaN(totalCount) ? pets.length : totalCount
                    };
                }

                return { pets: [], totalCount: 0 };
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
    getPetOfTheDay(pageSize: number, _preloadedData?: { totalCount: number, pets: Pet[] }): Observable<Pet | null> {
        const STORAGE_KEY = 'fever_pet_of_day';
        const today = new Date().toDateString();
        let storedPet: Pet | null = null;

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.date === today && parsed.pet && parsed.pet.name) {
                    storedPet = parsed.pet;
                }
            }
        } catch (e) {
            console.error('Error reading local storage', e);
        }

        if (storedPet) {
            // Try to fetch fresh data for this ID to ensure we have the latest text/details
            return this.getPetById(storedPet.id).pipe(
                map(freshPet => {
                    if (freshPet) {
                        // Update storage with fresh data
                        localStorage.setItem(STORAGE_KEY, JSON.stringify({
                            date: today,
                            pet: freshPet
                        }));
                        return freshPet;
                    }
                    // Fallback to stored pet if fetch fails (e.g. network error)
                    return storedPet!;
                })
            );
        }

        // Always fetch fresh, unfiltered data to ensure the Pet of the Day remains constant regardless of current filters or sort
        const source$ = this.getPets(1, pageSize);

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
                        return firstPagePets[0] || null;
                    })
                );
            }),
            tap(pet => {
                if (pet) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify({
                        date: today,
                        pet
                    }));
                }
            }),
            catchError(() => of(null))
        );
    }

    /**
     * Get a pet by id
     * @param id - The id of the pet
     * @returns Observable with the pet found, or undefined if not found
     */
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


// https://my-json-server.typicode.com/Feverup/fever_pets_data/pets?_page=1&_limit=6&weight_gte=15000&_sort=name&_order=asc&_t=1768095835556
// https://my-json-server.typicode.com/Feverup/fever_pets_data/pets?_page=1&_limit=6&weight_gt=15000&_sort=weight&_order=desc&_t=1768096280688
