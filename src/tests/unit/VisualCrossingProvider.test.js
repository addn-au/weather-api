import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VisualCrossingProvider } from '../../providers/VisualCrossingProvider.js';

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
        expect(mockFetch.mock.calls[0][0]).toContain('test_api_key'); // Check if the URL contains the API key
        expect(result).toEqual({
            city: 'Melbourne, VIC, Australia',
            timezone: 'Australia/Melbourne',
            temperature: 19.5,
            conditions: 'Clear',
            humidity: 60,
            provider: 'visualcrossing',
        });
    });

    // Test error mapping for multiple HTTP status codes using parameterized tests
    it.each([
        [400, 'BAD_REQUEST'],
        [401, 'UNAUTHORIZED'],
        [404, 'NOT_FOUND'],
        [429, 'TOO_MANY_REQUESTS'],
        [500, 'INTERNAL_SERVER_ERROR'],
    ])('maps HTTP %i response to WeatherApiError with code %s', async (status, expectedCode) => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status,
        });
        await provider.getWeather('Melbourne')
            .catch(error => {
                expect(error).toMatchObject({
                    name: 'WeatherApiError',
                    statusCode: status,
                    code: expectedCode,
                });
            });
    });

    // Test for timeout handling and error throwing when the 3rd-party API takes longer than 5 seconds to respond
    it('aborts and throws 504 GATEWAY_TIMEOUT if 3rd-party API freezes beyond 5 seconds', async () => {
        vi.useFakeTimers();

        // Simulate a hanging fetch that respects AbortSignal
        mockFetch.mockImplementationOnce((_url, { signal }) => {
            return new Promise((_resolve, reject) => {
                signal?.addEventListener('abort', () => {
                    reject(signal.reason || new DOMException('The operation was aborted', 'TimeoutError'));
                });
            });
        });

        const weatherPromise = provider.getWeather('Melbourne');

        // Fast-forward time by 5000ms
        vi.advanceTimersByTime(5000);

        await expect(weatherPromise).rejects.toMatchObject({
            name: 'WeatherApiError',
            statusCode: 504,
            code: 'GATEWAY_TIMEOUT',
        });
    }, 15000); // Set a timeout of 15 seconds for this test
});