import AppLoader from './appLoader';

interface Source {
    id: string;
    name: string;
}

interface SourcesResponse {
    sources?: Source[];
}

interface NewsArticle {
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

interface NewsResponse {
    articles?: NewsArticle[];
}

type ApiResponse = SourcesResponse | NewsResponse;
type ResponseCallback = (data: ApiResponse) => void;

class AppController extends AppLoader {
    getSources(callback: ResponseCallback): void {
        super.getResp<SourcesResponse>(
            {
                endpoint: 'sources',
            },
            callback
        );
    }

    getNews(e: MouseEvent, callback: ResponseCallback): void {
        let target: Node | null = e.target instanceof Node ? e.target : null;
        const newsContainer = e.currentTarget;

        if (!(newsContainer instanceof HTMLElement)) {
            return;
        }

        while (target && target !== newsContainer) {
            if (target instanceof Element && target.classList.contains('source__item')) {
                const sourceId = target.getAttribute('data-source-id');

                if (sourceId && newsContainer.getAttribute('data-source') !== sourceId) {
                    newsContainer.setAttribute('data-source', sourceId);

                    super.getResp<NewsResponse>(
                        {
                            endpoint: 'everything',
                            options: {
                                sources: sourceId,
                            },
                        },
                        callback
                    );
                }

                return;
            }

            target = target.parentNode;
        }
    }
}

export default AppController;
