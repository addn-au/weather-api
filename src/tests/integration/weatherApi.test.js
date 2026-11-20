import { describe, it, expect, beforeEach } from 'vitest';
import { buildApp } from '../app.js';

describe('Weather API Integration Tests', () => {
  let app;

  beforeEach(() => {
    process.env.WEATHER_PROVIDER = 'mock'; // Use the mock provider
    app = buildApp();
  });

  it('should return 400 when query parameter is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/weather'
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: 'Missing required query parameter: city'
    });
  });
});