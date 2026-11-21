export class WeatherApiError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
        super(message);
        this.name = 'WeatherApiError';
        this.statusCode = statusCode;
        this.code = code;
    }
}