import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VisualCrossingProvider } from '../../providers/VisualCrossingProvider.js';
import { WeatherApiError } from '../../errors/WeatherApiError.js';

describe('VisualCrossingProvider Unit Tests', () => {
    let mockFetch;
    let provider;

    beforeEach(() => {
        mockFetch = vi.fn();
        provider = new VisualCrossingProvider('test_api_key', mockFetch);
    });

    afterEach(() => {
        vi.useRealTimers(); // Reset timers after each test
        vi.restoreAllMocks(); // Restore all mocks after each test
    });

    it('200 OK: fetches and normalises weather data successfully', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true, 
            status: 200, 
            json: async () => ({
                resolvedAddress: "Melbourne, VIC, Australia",
                timezone: "Australia/Melbourne",
                currentConditions: {
                    temp: 19.5,
                    conditions: "Clear",
                    humidity: 60,
                }
            })
        });    
    });
});