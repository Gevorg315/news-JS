
const API_URL = 'https://newsapi.org/v2';

const ALLOWED_ENDPOINTS = [
    'everything',
    'top-headlines',
    'sources',
];

export default async (request) => {
    try {
        const requestUrl = new URL(request.url);
        const endpoint = requestUrl.searchParams.get('endpoint');

        if (!ALLOWED_ENDPOINTS.includes(endpoint)) {
            return Response.json(
                {
                    status: 'error',
                    message: 'Unknown endpoint',
                },
                { status: 404 }
            );
        }

        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            console.error('NewsAPI API_KEY environment variable is missing');

            return Response.json(
                {
                    status: 'error',
                    message: 'News service is not configured',
                },
                { status: 500 }
            );
        }

        // NewsAPI uses /top-headlines/sources for its sources list.
        const newsApiEndpoint =
            endpoint === 'sources'
                ? 'top-headlines/sources'
                : endpoint;

        // Copy all query parameters except our internal endpoint parameter.
        const params = new URLSearchParams(requestUrl.searchParams);
        params.delete('endpoint');

        const apiUrl = `${API_URL}/${newsApiEndpoint}?${params.toString()}`;

        const response = await fetch(apiUrl, {
            headers: {
                'X-Api-Key': apiKey,
            },
        });

        const data = await response.json();

        return Response.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error('NewsAPI proxy error:', error);

        return Response.json(
            {
                status: 'error',
                message: 'Unable to load news',
            },
            { status: 500 }
        );
    }
};

