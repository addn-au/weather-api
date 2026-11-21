import { WeatherStrategy } from './WeatherStrategy.js';
export class VisualCrossingProvider extends WeatherStrategy {
    constructor(apiKey, fetchFn = globalThis.fetch) {
        super();
        if (!apiKey) {
            throw new Error('VisualCrossingProvider requires an API key');
        }
        this.apiKey = apiKey;
        this.fetch = fetchFn; // Use the injected fetch function
        this.baseUrl = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';
    }

    async getWeather(city) {
        const url = `${this.baseUrl}/${encodeURIComponent(city)}?unitGroup=metric&contentType=json&key=${this.apiKey}`;
        let response;

        try {
            response = await this.fetch(url, { 
                method: 'GET',
                signal: AbortSignal.timeout(5000) // Set a timeout of 5 seconds
            });
        } catch (error) {
            if (error.name === 'TimeoutError' || error.name === 'AbortError') {
                throw new WeatherApiError('Request to VisualCrossing API timed out', 504, 'GATEWAY_TIMEOUT');
            }   
            throw new WeatherApiError(`Network error communicating with VisualCrossing API: ${error.message}`, 502, 'BAD_GATEWAY');
        }
    }
}