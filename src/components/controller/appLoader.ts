import Loader from './loader';

class AppLoader extends Loader {
    constructor() {
        super('/.netlify/functions/news', {});
    }
}

export default AppLoader;
