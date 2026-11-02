import Loader from './loader';

class AppLoader extends Loader {
    constructor() {
        const isDevelopment = process.env.NODE_ENV === 'development';

        super(
            isDevelopment ? process.env.API_URL ?? 'https://newsapi.org/v2' : '/.netlify/functions/news',
            isDevelopment ? { apiKey: process.env.API_KEY ?? '' } : {},
            isDevelopment
        );
    }
}

export default AppLoader;
