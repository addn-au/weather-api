import { afterEach, describe, expect, it } from 'vitest';
import { MockWeatherProvider } from '../../providers/MockWeatherProvider.js';
import { VisualCrossingProvider } from '../../providers/VisualCrossingProvider.js';
import { WeatherProviderFactory as WeatherFactory } from '../../providers/WeatherProviderFactory.js';

describe('WeatherFactory', () => {
    it('creates a mock weather provider', () => {
        expect(WeatherFactory.createProvider('mock')).toBeInstanceOf(MockWeatherProvider);
    });

    it('creates a Visual Crossing provider using the configured API key', () => {
        process.env.VISUAL_CROSSING_API_KEY = 'test-api-key';

        const provider = WeatherFactory.createProvider('visualcrossing');

        expect(provider).toBeInstanceOf(VisualCrossingProvider);
        expect(provider.apiKey).toBe('test-api-key');
    });

    it('throws when the Visual Crossing API key is missing', () => {
        delete process.env.VISUAL_CROSSING_API_KEY;

        expect(() => WeatherFactory.createProvider('visualcrossing'))
            .toThrow('VisualCrossingProvider requires an API key');
    });

    it('throws for an unsupported provider type', () => {
        expect(() => WeatherFactory.createProvider('unsupported'))
            .toThrow('Unsupported weather provider: "unsupported"');
    });
});
