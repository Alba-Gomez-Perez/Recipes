import {GramsToKgPipe} from './grams-to-kg.pipe';

describe('GramsToKgPipe', () => {
    let pipe: GramsToKgPipe;

    beforeEach(() => {
        pipe = new GramsToKgPipe();
    });

    it('should create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should transform 1000g to 1kg', () => {
        expect(pipe.transform(1000)).toBe(1);
    });

    it('should transform 500g to 0.5kg', () => {
        expect(pipe.transform(500)).toBe(0.5);
    });

    it('should transform 0g to 0kg', () => {
        expect(pipe.transform(0)).toBe(0);
    });

    it('should transform 15000g to 15kg', () => {
        expect(pipe.transform(15000)).toBe(15);
    });
});
