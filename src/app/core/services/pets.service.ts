import { Pet } from "../models/pet.model";

const API_URL: string = 'https://my-json-server.typicode.com/Feverup/fever_pets_data/pets';

/**
 * Service to get pets from API
 */
const petsService = {
    /**
     * Get all pets with its information
     * @returns {Promise<Pet[]>} All pets
     */
    async getAllPets(): Promise<Pet[]> {
        try {
            const response = await fetch(API_URL);

            // Error response
            if (!response.ok) {
                throw new Error(`Error al obtener los datos: ${response.status}`);
            }

            const data: Pet[] = await response.json();
            return data;
        } catch (error) {
            console.error('petsService.getAllPets:', error);
            return [];
        }
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
