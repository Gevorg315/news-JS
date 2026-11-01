
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
    ignoreAttributes: true,
    trimValues: true,
});

const SOURCES = [
    {
        id: 'bbc-world',
        name: 'BBC World',
        url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    },
    {
        id: 'bbc-tech',
        name: 'BBC Technology',
        url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    },
    {
        id: 'guardian-world',
        name: 'The Guardian - World',
        url: 'https://www.theguardian.com/world/rss',
    },
];

function getText(value) {
    if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
    }

    if (value && typeof value === 'object' && '#text' in value) {
        return String(value['#text']);
    }

    return '';
}

function cleanDescription(value) {
    return getText(value).replace(/<[^>]*>/g, '').trim();
}

async function getArticles(sourceId) {
    const source = SOURCES.find((item) => item.id === sourceId);

    if (!source) {
        throw new Error('Unknown news source');
    }

    const response = await fetch(source.url, {
        headers: {
            'User-Agent': 'NewsJS RSS Reader',
        },
    });

    if (!response.ok) {
        throw new Error(`RSS request failed: ${response.status}`);
    }

    const xml = await response.text();
    const parsed = parser.parse(xml);
    const items = parsed.rss?.channel?.item ?? [];
    const articles = Array.isArray(items) ? items : [items];

    return articles.slice(0, 20).map((item) => ({
        source: {
            id: source.id,
            name: source.name,
        },
        author: getText(item['dc:creator']) || null,
        title: cleanDescription(item.title) || 'Untitled article',
        description: cleanDescription(item.description) || null,
        url: getText(item.link),
        urlToImage: null,
        publishedAt: item.pubDate
            ? new Date(item.pubDate).toISOString()
            : new Date().toISOString(),
    }));
}

export default async (request) => {
    try {
        const url = new URL(request.url);
        const endpoint = url.searchParams.get('endpoint');

        if (endpoint === 'sources') {
            return Response.json({
                sources: SOURCES.map(({ id, name }) => ({ id, name })),
            });
        }

        if (endpoint === 'everything') {
            const sourceId = url.searchParams.get('sources');

            if (!sourceId) {
                return Response.json(
                    { message: 'A source ID is required' },
                    { status: 400 }
                );
            }

            const articles = await getArticles(sourceId);

            return Response.json({ articles });
        }

        return Response.json(
            { message: 'Unknown endpoint' },
            { status: 404 }
        );
    } catch (error) {
        console.error('News function error:', error);

        return Response.json(
            { message: 'Unable to load news at this time' },
            { status: 500 }
        );
    }
};
