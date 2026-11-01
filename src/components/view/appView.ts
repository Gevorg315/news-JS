import News from './news/news';
import Sources from './sources/sources';

interface Source {
    id: string;
    name: string;
}

interface Article {
    source: {
        id: string | null;
        name: string;
    };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
}

interface SourcesResponse {
    sources?: Source[];
}

interface NewsResponse {
    articles?: Article[];
}

type ApiResponse = SourcesResponse | NewsResponse;

export class AppView {
    private news: News;
    private sources: Sources;

    constructor() {
        this.news = new News();
        this.sources = new Sources();
    }

    public drawNews(data: ApiResponse): void {
        const values = 'articles' in data ? data.articles ?? [] : [];
        this.news.draw(values);
    }

    public drawSources(data: ApiResponse): void {
        const values = 'sources' in data ? data.sources ?? [] : [];
        this.sources.draw(values);
    }
}

export default AppView;
