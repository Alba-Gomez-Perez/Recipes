import { Pet } from "../models/pet.model";

const API_URL: string = 'https://my-json-server.typicode.com/Feverup/fever_pets_data/pets';

/**
 * Apply pagination parameters to URL
 * @param {URL} url - The URL object to modify
 * @param {number} page - The page number
 * @param {number} limit - The number of pets per page
 */
const applyPagination = (url: URL, page?: number, limit?: number): void => {
    if (page !== undefined && limit !== undefined) {
        url.searchParams.append('_page', page.toString());
        url.searchParams.append('_limit', limit.toString());
    }
};

/**
 * Apply name filter to URL
 * @param {URL} url - The URL object to modify
 * @param {string} name - The name to filter by
 */
const applyNameFilter = (url: URL, name?: string): void => {
    if (name) {
        url.searchParams.append('name_like', name);
    }
};

/**
 * Apply kind filter to URL
 * @param {URL} url - The URL object to modify
 * @param {string} kind - The kind to filter by
 */
const applyKindFilter = (url: URL, kind?: string): void => {
    if (kind) {
        url.searchParams.append('kind', kind);
    }
};

/**
 * Apply weight filter to URL
 * @param {URL} url - The URL object to modify
 * @param {string} weight - The weight category (small, medium, large)
 */
const applyWeightFilter = (url: URL, weight?: string): void => {
    if (weight === 'small') {
        url.searchParams.append('weight_lt', '5000');
    } else if (weight === 'medium') {
        url.searchParams.append('weight_gte', '5000');
        url.searchParams.append('weight_lte', '15000');
    } else if (weight === 'large') {
        url.searchParams.append('weight_gt', '15000');
    }
};

/**
 * Apply height filter to URL
 * @param {URL} url - The URL object to modify
 * @param {string} height - The height category (short, average, tall)
 */
const applyHeightFilter = (url: URL, height?: string): void => {
    if (height === 'short') {
        url.searchParams.append('height_lt', '30');
    } else if (height === 'average') {
        url.searchParams.append('height_gte', '30');
        url.searchParams.append('height_lte', '60');
    } else if (height === 'tall') {
        url.searchParams.append('height_gt', '60');
    }
};

/**
 * Apply length filter to URL
 * @param {URL} url - The URL object to modify
 * @param {string} length - The length category (short, average, long)
 */
const applyLengthFilter = (url: URL, length?: string): void => {
    if (length === 'short') {
        url.searchParams.append('length_lt', '40');
    } else if (length === 'average') {
        url.searchParams.append('length_gte', '40');
        url.searchParams.append('length_lte', '80');
    } else if (length === 'long') {
        url.searchParams.append('length_gt', '80');
    }
};

/**
 * Apply sort parameters to URL
 * @param {URL} url - The URL object to modify
 * @param {any} sort - The sort configuration
 */
const applySort = (url: URL, sort?: any): void => {
    if (sort?.sortBy) {
        url.searchParams.append('_sort', sort.sortBy);
        url.searchParams.append('_order', sort.sortOrder || 'asc');
    }
};

/**
 * Service to get pets from API
 */
const petsService = {
    /**
     * Get pets with pagination and filters
     * @param {number} page - The page number
     * @param {number} limit - The number of pets per page
     * @param {any} filters - Optional filters
     * @returns {Promise<{ pets: Pet[], totalCount: number }>} Pets and total count
     */
    async getPets(page?: number, limit?: number, filters?: any, sort?: any): Promise<{ pets: Pet[], totalCount: number }> {
        try {
            let url = new URL(API_URL);

            applyPagination(url, page, limit);

            if (filters) {
                applyNameFilter(url, filters.name);
                applyKindFilter(url, filters.kind);
                applyWeightFilter(url, filters.weight);
                applyHeightFilter(url, filters.height);
                applyLengthFilter(url, filters.length);
            }

            applySort(url, sort);

            const response = await fetch(url.toString());

            // Error response
            if (!response.ok) {
                throw new Error(`Error al obtener los datos: ${response.status}`);
            }

            const totalCountHeader = response.headers.get('X-Total-Count');
            const data: any = await response.json();

            if (Array.isArray(data)) {
                const totalCount = totalCountHeader ? parseInt(totalCountHeader, 10) : data.length;
                return { pets: data, totalCount: isNaN(totalCount) ? data.length : totalCount };
            }

            if (data?.data) {
                const pets = data.data;
                const totalCount = data.items ?? (totalCountHeader ? parseInt(totalCountHeader, 10) : pets.length);
                return { pets, totalCount: isNaN(totalCount) ? pets.length : totalCount };
            }

            return { pets: [], totalCount: 0 };
        } catch (error) {
            console.error('petsService.getPets:', error);
            return { pets: [], totalCount: 0 };
        }
    },

    /**
     * Get all pets (for Pet of the Day)
     * @returns {Promise<Pet[]>} All pets
     */
    async getAllPets(): Promise<Pet[]> {
        const { pets } = await this.getPets();
        return pets;
    },

    /**
     * Get a pet by id
     * @param {number} id - The id of the pet
     * @returns {Promise<Pet | undefined>} The pet found
     */
    async getPetById(id: number): Promise<Pet | undefined> {
        try {
            const response = await fetch(`${API_URL}/${id}`);

            if (!response.ok) {
                throw new Error(`Error al obtener el pet: ${response.status}`);
            }

            const data: Pet = await response.json();
            return data;
        } catch (error) {
            console.error('petsService.getPetById:', error);
            return undefined;
        }
    },
};

export default petsService;
