type RequestOptions = Record<string, string | number | boolean>;

interface RequestConfig {
    endpoint: string;
    options?: RequestOptions;
}

type ResponseCallback<T = unknown> = (data: T) => void;

class Loader {
    private baseLink: string;
    private options: RequestOptions;

    constructor(baseLink: string, options: RequestOptions) {
        this.baseLink = baseLink;
        this.options = options;
    }

    public getResp<T = unknown>(
        { endpoint, options = {} }: RequestConfig,
        callback: ResponseCallback<T> = () => {
            console.error('No callback for GET response');
        }
    ): void {
        this.load('GET', endpoint, (data) => callback(data as T), options);
    }

    private errorHandler(res: Response): Response {
        if (!res.ok) {
            throw new Error(`Request failed: ${res.status} ${res.statusText}`);
        }

        return res;
    }

    private makeUrl(options: RequestOptions, endpoint: string): string {
        const urlOptions = { ...this.options, ...options };
        const url = new URL(this.baseLink, window.location.origin);

        url.searchParams.set('endpoint', endpoint);

        Object.entries(urlOptions).forEach(([key, value]) => {
            url.searchParams.set(key, String(value));
        });

        return url.toString();
    }

    private load(
        method: string,
        endpoint: string,
        callback: ResponseCallback<unknown>,
        options: RequestOptions = {}
    ): void {
        fetch(this.makeUrl(options, endpoint), { method })
            .then((res: Response) => this.errorHandler(res))
            .then((res: Response) => res.json() as Promise<unknown>)
            .then((data: unknown) => callback(data))
            .catch((err: unknown) => console.error('News request failed:', err));
    }
}

export default Loader;
