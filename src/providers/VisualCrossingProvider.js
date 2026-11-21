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

        if (!response.ok) {
            this.#handleHttpError(response.status);
        }

        const data = await response.json();
        return this.#normalize(data);
    }

      #handleHttpError(status) {
        switch (status) {
            case 400:
                throw new WeatherApiError('Invalid parameter or bad request format', 400, 'BAD_REQUEST');
            case 401:
                throw new WeatherApiError('Invalid API key or unauthorized subscription feature', 401, 'UNAUTHORIZED');
            case 404:
                throw new WeatherApiError('City or endpoint not found', 404, 'NOT_FOUND');
            case 429:
                throw new WeatherApiError('API rate limit exceeded', 429, 'TOO_MANY_REQUESTS');
            case 500:
            default:
                throw new WeatherApiError('3rd-party weather provider internal error', 500, 'INTERNAL_SERVER_ERROR');
        }
    }

    #normalize(rawData) {
        return {
        city: rawData.resolvedAddress || rawData.address,
        timezone: rawData.timezone,
        temperature: rawData.currentConditions?.temp,
        conditions: rawData.currentConditions?.conditions,
        humidity: rawData.currentConditions?.humidity,
        provider: 'visualcrossing',
        };
    }    
}