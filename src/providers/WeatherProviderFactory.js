import { VisualCrossingProvider } from './VisualCrossingProvider.js';
import { MockWeatherProvider } from './MockWeatherProvider.js';

export class WeatherProviderFactory {
  static createProvider(providerName = process.env.WEATHER_PROVIDER, options = {}) {
    switch (providerName?.toLowerCase()) {
      case 'visualcrossing':
        return new VisualCrossingProvider(
          options.apiKey || process.env.VISUAL_CROSSING_API_KEY,
          options.fetchFn
        );
      case 'mock':
        return new MockWeatherProvider();
      default:
        throw new Error(`Unsupported weather provider: "${providerName}"`);
    }
  }
}