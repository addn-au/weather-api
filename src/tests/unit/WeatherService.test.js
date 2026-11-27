import { describe, expect, it, vi, beforeEach } from 'vitest';
import NodeCache from 'node-cache';
import { WeatherService } from '../../services/WeatherService.js';

describe('WeatherService', () => {
    let mockProvider;
    let weatherService;
    let cache;

    beforeEach(() => {
        // 1. Create a fresh mock provider before each test
        mockProvider = {
            getWeather: vi.fn(),
        };

        // 2. Use a real NodeCache instance (it runs in-memory and is very fast)
        cache = new NodeCache({ stdTTL: 600 });

        // 3. Inject dependencies into the service
        weatherService = new WeatherService(mockProvider, cache);
    });

    it('fetches from provider and caches data on a cache miss', async () => {
        const mockWeatherData = {
            city: 'Melbourne',
            temperature: 22.5,
            conditions: 'Partly Cloudy'
        };

        mockProvider.getWeather.mockResolvedValueOnce(mockWeatherData);

        const result = await weatherService.fetchWeather('Melbourne');

        expect(result).toEqual({
            source: 'provider',
            data: mockWeatherData,
        });
        expect(mockProvider.getWeather).toHaveBeenCalledTimes(1);
        expect(mockProvider.getWeather).toHaveBeenCalledWith('Melbourne');

        // Verify the data was actually saved in the cache
        expect(cache.get('weather:melbourne')).toEqual(mockWeatherData);
    });

    it('returns cached data without calling provider on a cache hit', async () => {
        const cachedWeatherData = {
            city: 'Sydney',
            temp: 18,
            condition: 'Cloudy'
        };
        cache.set('weather:sydney', cachedWeatherData);

        const result = await weatherService.fetchWeather('Sydney');

        expect(result).toEqual({
            source: 'cache',
            data: cachedWeatherData,
        });
        // Provider should not be touched
        expect(mockProvider.getWeather).not.toHaveBeenCalled();
    });

    it('normalizes city names (casing and whitespace) for cache lookups', async () => {
        const mockWeatherData = {
            city: 'Brisbane',
            temp: 25,
            condition: 'Clear'
        };
        mockProvider.getWeather.mockResolvedValueOnce(mockWeatherData);

        // First call populates the cache
        await weatherService.fetchWeather('Brisbane');

        // Second call uses messy formatting
        const result = await weatherService.fetchWeather('  bRiSbAnE   ');

        expect(result).toEqual({
            source: 'cache',
            data: mockWeatherData,
        });
        expect(mockProvider.getWeather).toHaveBeenCalledTimes(1);
    });

    it('propagates errors and does not cache failed provider responses', async () => {
        const apiError = new Error('Provider API timeout');
        mockProvider.getWeather.mockRejectedValueOnce(apiError);

        // Expect the service to reject with the provider's error
        await expect(weatherService.fetchWeather('Perth')).rejects.toThrow(
            'Provider API timeout'
        );

        // Ensure nothing was written to the cache
        expect(cache.get('weather:perth')).toBeUndefined();
    });
});
