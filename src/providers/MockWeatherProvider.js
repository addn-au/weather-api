import { WeatherStrategy } from './WeatherStrategy.js';

// This class is a mock implementation of a weather provider for testing purposes
// It allows for simulating various scenarios, including successful responses and error conditions
export class MockWeatherProvider extends WeatherStrategy {
    constructor() {
        super();
        this.simulatedError = null;
    }

    // Programmatic error injection for automated tests
    simulateNextError(statusCode, code, message) {
        this.simulatedError = new WeatherApiError(message, statusCode, code);
    }

    clearSimulatedError() {
        this.simulatedError = null;
    }

    async getWeather(city) {
        // 1. Check programmatic error simulation
        if (this.simulatedError) {
            const err = this.simulatedError;
            this.simulatedError = null; // Reset after throwing
            throw err;
        }

        // 2. Check prefix-based error simulation (useful for frontend offline testing)
        const normalizedCity = city.toLowerCase().trim();
        if (normalizedCity === 'sim_400') throw new WeatherApiError('Simulated Bad Request', 400, 'BAD_REQUEST');
        if (normalizedCity === 'sim_401') throw new WeatherApiError('Simulated Unauthorized', 401, 'UNAUTHORIZED');
        if (normalizedCity === 'sim_404') throw new WeatherApiError('Simulated Not Found', 404, 'NOT_FOUND');
        if (normalizedCity === 'sim_429') throw new WeatherApiError('Simulated Rate Limit', 429, 'TOO_MANY_REQUESTS');
        if (normalizedCity === 'sim_500') throw new WeatherApiError('Simulated Server Error', 500, 'INTERNAL_SERVER_ERROR');
        if (normalizedCity === 'sim_timeout') throw new WeatherApiError('Simulated Timeout', 504, 'GATEWAY_TIMEOUT');
        if (normalizedCity === 'sim_crash') throw new Error('Unexpected unhandled mock engine crash');

        // 3. Return deterministic mock weather payload
        return {
            city: city,
            timezone: 'Australia/Melbourne',
            temperature: 22.5,
            conditions: 'Partly Cloudy',
            humidity: 55,
            provider: 'mock',
        };
    }
}