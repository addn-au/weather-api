export class BaseWeatherProvider {
    async getWeather(city) { throw new Error('getWeather method must be implemented by subclasses'); }
}
