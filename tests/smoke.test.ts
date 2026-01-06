import { describe, it, expect } from 'vitest';

describe('Smoke Test', () => {
    it('should pass if Vitest is working', () => {
        expect(true).toBe(true);
    });

    it('should perform basic math', () => {
        expect(1 + 1).toBe(2);
    });
});
