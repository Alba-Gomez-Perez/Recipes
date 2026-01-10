import petsService from './pets.service';
import { Pet } from '../models/pet.model';

describe('PetsService', () => {
    let fetchSpy: jasmine.Spy;

    beforeEach(() => {
        fetchSpy = spyOn(window, 'fetch');
    });

    describe('getPets', () => {
        it('should fetch pets with default parameters', async () => {
            const mockPets = [{ id: 1, name: 'Rex' }] as any;
            const mockResponse = new Response(JSON.stringify(mockPets), {
                status: 200,
                headers: { 'X-Total-Count': '1' }
            });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            const result = await petsService.getPets();

            expect(window.fetch).toHaveBeenCalledWith(jasmine.stringMatching(/pets/));
            expect(result).toEqual({ pets: mockPets, totalCount: 1 });
        });

        it('should apply pagination parameters', async () => {
            const mockResponse = new Response(JSON.stringify([]), { status: 200 });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            await petsService.getPets(1, 6);

            const callUrl = fetchSpy.calls.mostRecent().args[0];
            expect(callUrl).toContain('_page=1');
            expect(callUrl).toContain('_limit=6');
        });

        it('should apply name filter', async () => {
            const mockResponse = new Response(JSON.stringify([]), { status: 200 });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            await petsService.getPets(undefined, undefined, { name: 'Rex' });

            const callUrl = fetchSpy.calls.mostRecent().args[0];
            expect(callUrl).toContain('name_like=Rex');
        });

        it('should apply kind filter', async () => {
            const mockResponse = new Response(JSON.stringify([]), { status: 200 });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            await petsService.getPets(undefined, undefined, { kind: 'dog' });

            const callUrl = fetchSpy.calls.mostRecent().args[0];
            expect(callUrl).toContain('kind=dog');
        });

        it('should apply weight filters (small, medium, large, all)', async () => {
            const mockResponse = new Response(JSON.stringify([]), { status: 200 });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            // Small
            await petsService.getPets(undefined, undefined, { weight: 'small' });
            expect(fetchSpy.calls.mostRecent().args[0]).toContain('weight_lt=5000');

            // Medium
            await petsService.getPets(undefined, undefined, { weight: 'medium' });
            expect(fetchSpy.calls.mostRecent().args[0]).toContain('weight_gte=5000');
            expect(fetchSpy.calls.mostRecent().args[0]).toContain('weight_lte=15000');

            // Large
            await petsService.getPets(undefined, undefined, { weight: 'large' });
            expect(fetchSpy.calls.mostRecent().args[0]).toContain('weight_gt=15000');

            // All/Other
            await petsService.getPets(undefined, undefined, { weight: 'all' });
            expect(fetchSpy.calls.mostRecent().args[0]).not.toContain('weight');
        });

        it('should apply height filters (short, average, tall, all)', async () => {
            const mockResponse = new Response(JSON.stringify([]), { status: 200 });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            // Short
            await petsService.getPets(undefined, undefined, { height: 'short' });
            expect(fetchSpy.calls.mostRecent().args[0]).toContain('height_lt=30');

            // Average
            await petsService.getPets(undefined, undefined, { height: 'average' });
            expect(fetchSpy.calls.mostRecent().args[0]).toContain('height_gte=30');
            expect(fetchSpy.calls.mostRecent().args[0]).toContain('height_lte=60');

            // Tall
            await petsService.getPets(undefined, undefined, { height: 'tall' });
            expect(fetchSpy.calls.mostRecent().args[0]).toContain('height_gt=60');

            // All/Other
            await petsService.getPets(undefined, undefined, { height: 'all' });
            expect(fetchSpy.calls.mostRecent().args[0]).not.toContain('height');
        });

        it('should apply length filters (short, average, long, all)', async () => {
            const mockResponse = new Response(JSON.stringify([]), { status: 200 });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            // Short
            await petsService.getPets(undefined, undefined, { length: 'short' });
            expect(fetchSpy.calls.mostRecent().args[0]).toContain('length_lt=40');

            // Average
            await petsService.getPets(undefined, undefined, { length: 'average' });
            expect(fetchSpy.calls.mostRecent().args[0]).toContain('length_gte=40');
            expect(fetchSpy.calls.mostRecent().args[0]).toContain('length_lte=80');

            // Long
            await petsService.getPets(undefined, undefined, { length: 'long' });
            expect(fetchSpy.calls.mostRecent().args[0]).toContain('length_gt=80');

            // All/Other
            await petsService.getPets(undefined, undefined, { length: 'all' });
            expect(fetchSpy.calls.mostRecent().args[0]).not.toContain('length');
        });

        it('should apply sort parameters', async () => {
            const mockResponse = new Response(JSON.stringify([]), { status: 200 });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            await petsService.getPets(undefined, undefined, undefined, { sortBy: 'name', sortOrder: 'desc' });

            const callUrl = fetchSpy.calls.mostRecent().args[0];
            expect(callUrl).toContain('_sort=name');
            expect(callUrl).toContain('_order=desc');
        });

        it('should default sort order to asc if not provided', async () => {
            const mockResponse = new Response(JSON.stringify([]), { status: 200 });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            await petsService.getPets(undefined, undefined, undefined, { sortBy: 'name' });

            expect(fetchSpy.calls.mostRecent().args[0]).toContain('_order=asc');
        });

        it('should handle alternative response format (data and items)', async () => {
            const mockResponseData = { data: [{ id: 1 }], items: 10 };
            const mockResponse = new Response(JSON.stringify(mockResponseData), { status: 200 });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            const result = await petsService.getPets();

            expect(result).toEqual({ pets: mockResponseData.data as any, totalCount: 10 });
        });

        it('should prioritize data.items over X-Total-Count header', async () => {
            const mockResponseData = { data: [{ id: 1 }], items: 10 };
            const mockResponse = new Response(JSON.stringify(mockResponseData), {
                status: 200,
                headers: { 'X-Total-Count': '5' }
            });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            const result = await petsService.getPets();

            expect(result).toEqual({ pets: mockResponseData.data as any, totalCount: 10 });
        });

        it('should handle alternative response format (data and totalCount from headers if items missing)', async () => {
            const mockResponseData = { data: [{ id: 1 }] };
            const mockResponse = new Response(JSON.stringify(mockResponseData), {
                status: 200,
                headers: { 'X-Total-Count': '5' }
            });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            const result = await petsService.getPets();

            expect(result).toEqual({ pets: mockResponseData.data as any, totalCount: 5 });
        });

        it('should handle response where totalCount is not in headers but data is array', async () => {
            const mockPets: any[] = [{ id: 1 }, { id: 2 }];
            const mockResponse = new Response(JSON.stringify(mockPets), { status: 200 });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            const result = await petsService.getPets();

            expect(result).toEqual({ pets: mockPets, totalCount: 2 });
        });

        it('should fallback to pets.length if X-Total-Count is invalid/isNaN', async () => {
            const mockPets: any[] = [{ id: 1 }];
            const mockResponse = new Response(JSON.stringify(mockPets), {
                status: 200,
                headers: { 'X-Total-Count': 'invalid' }
            });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            const result = await petsService.getPets();
            expect(result.totalCount).toBe(1);
        });

        it('should fallback to pets.length in alternative format if X-Total-Count is missing', async () => {
            const mockResponseData = { data: [{ id: 1 }] };
            const mockResponse = new Response(JSON.stringify(mockResponseData), {
                status: 200
                // missing X-Total-Count and items
            });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            const result = await petsService.getPets();
            expect(result.totalCount).toBe(1);
        });

        it('should return empty pets and 0 totalCount if data format is unknown', async () => {
            const mockResponse = new Response(JSON.stringify({ unexpected: 'format' }), { status: 200 });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            const result = await petsService.getPets();

            expect(result).toEqual({ pets: [], totalCount: 0 });
        });

        it('should return empty pets if data only has items but no data property', async () => {
            const mockResponse = new Response(JSON.stringify({ items: 10 }), { status: 200 });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));
            const result = await petsService.getPets();
            expect(result).toEqual({ pets: [], totalCount: 0 });
        });

        it('should return empty pets if data is null and not log error', async () => {
            spyOn(console, 'error');
            const mockResponse = new Response('null', { status: 200 });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));
            const result = await petsService.getPets();
            expect(result.pets).toEqual([]);
            expect(console.error).not.toHaveBeenCalled();
        });

        it('should log exact error message if response is not ok', async () => {
            spyOn(console, 'error');
            const mockResponse = new Response('', { status: 500 });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            const result = await petsService.getPets();

            expect(result).toEqual({ pets: [], totalCount: 0 });
            expect(console.error).toHaveBeenCalledWith('petsService.getPets:', jasmine.objectContaining({
                message: 'Error al obtener los datos: 500'
            }));
        });

        it('should log exact error message on network failure', async () => {
            spyOn(console, 'error');
            const networkError = new Error('Network failure');
            fetchSpy.and.returnValue(Promise.reject(networkError));

            const result = await petsService.getPets();

            expect(result).toEqual({ pets: [], totalCount: 0 });
            expect(console.error).toHaveBeenCalledWith('petsService.getPets:', networkError);
        });
    });

    describe('getAllPets', () => {
        it('should call getPets and return pets array', async () => {
            const mockPets = [{ id: 1 }];
            spyOn(petsService, 'getPets').and.returnValue(Promise.resolve({
                pets: mockPets as any,
                totalCount: 1,
            }));

            const result = await petsService.getAllPets();

            expect(petsService.getPets).toHaveBeenCalled();
            expect(result).toEqual(mockPets as any);
        });
    });

    describe('getPetById', () => {
        it('should return a pet by id', async () => {
            const mockPet: Partial<Pet> = { id: 1, name: 'Rex' };
            const mockResponse = new Response(JSON.stringify(mockPet), { status: 200 });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            const result = await petsService.getPetById(1);

            expect(window.fetch).toHaveBeenCalledWith(jasmine.stringMatching(/\/pets\/1/));
            expect(result).toEqual(mockPet as any);
        });

        it('should log exact error message if pet response is not ok', async () => {
            spyOn(console, 'error');
            const mockResponse = new Response('', { status: 404 });
            fetchSpy.and.returnValue(Promise.resolve(mockResponse));

            const result = await petsService.getPetById(1);

            expect(result).toBeUndefined();
            expect(console.error).toHaveBeenCalledWith('petsService.getPetById:', jasmine.objectContaining({
                message: 'Error al obtener el pet: 404'
            }));
        });

        it('should log exact error message if getPetById fetch throws', async () => {
            spyOn(console, 'error');
            const networkError = new Error('Network error');
            fetchSpy.and.returnValue(Promise.reject(networkError));

            const result = await petsService.getPetById(1);

            expect(result).toBeUndefined();
            expect(console.error).toHaveBeenCalledWith('petsService.getPetById:', networkError);
        });
    });
});
