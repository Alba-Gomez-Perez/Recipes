import { Pet } from "../models/pet.model";

const API_URL: string = 'https://my-json-server.typicode.com/Feverup/fever_pets_data/pets';

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
    async getPets(page?: number, limit?: number, filters?: any): Promise<{ pets: Pet[], totalCount: number }> {
        try {
            let url = new URL(API_URL);

            if (page !== undefined && limit !== undefined) {
                url.searchParams.append('_page', page.toString());
                url.searchParams.append('_limit', limit.toString());
            }

            if (filters) {
                if (filters.name) url.searchParams.append('name_like', filters.name);
                if (filters.kind) url.searchParams.append('kind', filters.kind);

                // Weight filters
                if (filters.weight === 'small') url.searchParams.append('weight_lt', '5000');
                if (filters.weight === 'medium') {
                    url.searchParams.append('weight_gte', '5000');
                    url.searchParams.append('weight_lte', '15000');
                }
                if (filters.weight === 'large') url.searchParams.append('weight_gt', '15000');

                // Height filters
                if (filters.height === 'short') url.searchParams.append('height_lt', '30');
                if (filters.height === 'average') {
                    url.searchParams.append('height_gte', '30');
                    url.searchParams.append('height_lte', '60');
                }
                if (filters.height === 'tall') url.searchParams.append('height_gt', '60');

                // Length filters
                if (filters.length === 'short') url.searchParams.append('length_lt', '40');
                if (filters.length === 'average') {
                    url.searchParams.append('length_gte', '40');
                    url.searchParams.append('length_lte', '80');
                }
                if (filters.length === 'long') url.searchParams.append('length_gt', '80');

                if (filters.sortBy) {
                    url.searchParams.append('_sort', filters.sortBy);
                    url.searchParams.append('_order', filters.sortOrder || 'asc');
                }
            }

            const response = await fetch(url.toString());

            // Error response
            if (!response.ok) {
                throw new Error(`Error al obtener los datos: ${response.status}`);
            }

            const totalCount = parseInt(response.headers.get('X-Total-Count') || '0', 10);
            const data: Pet[] = await response.json();

            if (Array.isArray(data)) {
                return { pets: data, totalCount: totalCount || data.length };
            } else if ((data as any).data) {
                return { pets: (data as any).data, totalCount: (data as any).items || totalCount };
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
