import AppController from '../controller/controller';
import { AppView } from '../view/appView';

class App {
    private controller: AppController;
    private view: AppView;

    constructor() {
        this.controller = new AppController();
        this.view = new AppView();
    }

    start(): void {
        const sourcesContainer = document.querySelector<HTMLElement>('.sources');

        if (!sourcesContainer) {
            console.error('Sources container was not found.');
            return;
        }

        sourcesContainer.addEventListener('click', (event: MouseEvent) => {
            this.controller.getNews(event, (data) => this.view.drawNews(data));
        });

        this.controller.getSources((data) => this.view.drawSources(data));
    }
}

export default App;
