import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VisualCrossingProvider } from '../../providers/VisualCrossingProvider.js';
import { WeatherApiError } from '../../errors/WeatherApiError.js';

describe('VisualCrossingProvider Unit Tests', () => {
    let mockFetch; // Mock fetch function
    let provider; // Instance of VisualCrossingProvider

    beforeEach(() => {
        mockFetch = vi.fn(); // Create a mock fetch function
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
                },
            })
        });
        
        const result = await provider.getWeather('Melbourne');

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch.mock.calls[0][0]).toContain('Melbourne'); // Check if the URL contains the city name
        expect(mockFetch.mock.calls[0][0]).toContain('test_api_key'); // Check if the URL contains the APImock key
        expect(result).toEqual({
            city: 'Melbourne, VIC, Australia',
            timezone: 'Australia/Melbourne',
            temperature: 19.5,
            conditions: 'Clear',
            humidity: 60,
            provider: 'visualcrossing',
        });
    });
});