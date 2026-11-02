const API_URL = process.env.API_URL || 'https://newsapi.org/v2';

export default async (request) => {
    try {
        const requestUrl = new URL(request.url);
        const endpoint = requestUrl.searchParams.get('endpoint');

        // Only allow the NewsAPI endpoints used by this application.
        const allowedEndpoints = ['sources', 'everything'];

        if (!allowedEndpoints.includes(endpoint)) {
            return Response.json({ message: 'Unknown endpoint' }, { status: 404 });
        }

        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            console.error('NewsAPI key is missing from environment variables');

            return Response.json({ message: 'News service is not configured' }, { status: 500 });
        }

        const apiUrl = new URL(`${API_URL}/${endpoint}`);

        // Forward the original query parameters, except the internal endpoint.
        requestUrl.searchParams.forEach((value, key) => {
            if (key !== 'endpoint' && key !== 'apiKey') {
                apiUrl.searchParams.set(key, value);
            }
        });

        // Add the API key on the server, never in the frontend.
        apiUrl.searchParams.set('apiKey', apiKey);

        const apiResponse = await fetch(apiUrl);

        const responseBody = await apiResponse.text();

        return new Response(responseBody, {
            status: apiResponse.status,
            headers: {
                'Content-Type': apiResponse.headers.get('Content-Type') || 'application/json',
            },
        });
    } catch (error) {
        console.error('NewsAPI proxy error:', error);

        return Response.json({ message: 'Unable to load news at this time' }, { status: 500 });
    }
};
