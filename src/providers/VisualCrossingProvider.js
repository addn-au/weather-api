import { WeatherStrategy } from './WeatherStrategy.js';
import { WeatherApiError } from '../errors/WeatherApiError.js';

// VisualCrossingProvider class that extends the WeatherStrategy
// This class is responsible for fetching weather data from the VisualCrossing API
export class VisualCrossingProvider extends WeatherStrategy {
    
    // Constructor for VisualCrossingProvider
    // apiKey: The API key for accessing the VisualCrossing API
    // fetchFn: Optional custom fetch function for making HTTP requests (default is global fetch)
    // Throws an error if the API key is not provided
    // Initializes the provider with the API key and fetch function, and sets the base URL for the VisualCrossing API 
    constructor(apiKey, fetchFn = globalThis.fetch) {
        super();
        if (!apiKey) {
            throw new Error('VisualCrossingProvider requires an API key');
        }
        this.apiKey = apiKey;
        this.fetch = fetchFn; // Use the injected fetch function
        this.baseUrl = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';
    }

    // Method to fetch weather data for a given city from the VisualCrossing API
    // This method constructs the API URL, makes the HTTP request, handles errors, and normalizes the response data
    // city: The name of the city for which to fetch weather data
    // Returns a Promise that resolves to the normalized weather data or throws a WeatherApiError in case of an error
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

    // Private method to handle HTTP errors based on status codes
    // This method throws a WeatherApiError with a specific message and status code based on the HTTP response status
    // status: The HTTP status code returned from the VisualCrossing API response
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

    // Private method to normalize the raw data from VisualCrossing API to a standard format
    // This method ensures that the data returned from the API is transformed into a consistent structure
    // rawData: The raw JSON data returned from the VisualCrossing raw API response
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