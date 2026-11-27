import NodeCache from 'node-cache';

// This service is responsible for fetching weather data, either from a cache or from an external provider.
// It uses a caching mechanism to store successful responses for a specified duration (default is 10 minutes).
// The service is designed to be flexible, allowing different weather providers to be injected as dependencies. 
export class WeatherService {
    constructor(provider, cache = new NodeCache({ stdTTL: 600 })) {
        this.provider = provider;
        this.cache = cache;
    }

    // Fetches weather data for a given city, first checking the cache and then falling back to the provider if necessary.
    // city: The name of the city for which to fetch weather data.
    // Returns an object containing the source of the data ('cache' or 'provider') and the weather data itself. 
    async fetchWeather(city) {
        const cacheKey = `weather:${city.toLowerCase().trim()}`;

        // 1. Lookup in node-cache
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) {
            return { source: 'cache', data: cachedData };
        }

        // 2. Fetch from active provider strategy
        const freshData = await this.provider.getWeather(city);

        // 3. Store only successful responses in cache
        this.cache.set(cacheKey, freshData);

        return { source: 'provider', data: freshData };
    }
}