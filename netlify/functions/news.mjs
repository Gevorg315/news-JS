import { XMLParser } from 'fast-xml-parser';

const FEEDS = [
    {
        id: 'bbc-world',
        name: 'BBC News - World',
        url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    },
    {
        id: 'bbc-tech',
        name: 'BBC News - Technology',
        url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    },
    {
        id: 'guardian-world',
        name: 'The Guardian - World',
        url: 'https://www.theguardian.com/world/rss',
    },
];

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
});

function getText(value) {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
        return value['#text'] ?? '';
    }
    return '';
}

function normalizeArticle(item, source) {
    const enclosure = item.enclosure;
    const media = item['media:thumbnail'] || item['media:content'];

    return {
        source: {
            id: source.id,
            name: source.name,
        },
        author: getText(item.author) || getText(item['dc:creator']) || null,
        title: getText(item.title),
        description: getText(item.description),
        url: getText(item.link),
        urlToImage: media?.['@_url'] || enclosure?.['@_url'] || null,
        publishedAt: getText(item.pubDate) || null,
        content: getText(item.description),
    };
}

async function getFeedArticles(source) {
    const response = await fetch(source.url);

    if (!response.ok) {
        throw new Error(`RSS request failed: ${source.name}`);
    }

    const xml = await response.text();
    const parsed = parser.parse(xml);
    const channel = parsed.rss?.channel || parsed.feed;
    const items = channel?.item || channel?.entry || [];

    return (Array.isArray(items) ? items : [items])
        .map((item) => normalizeArticle(item, source))
        .filter((article) => article.title && article.url);
}

export default async (request) => {
    try {
        const url = new URL(request.url);
        const endpoint = url.searchParams.get('endpoint');

        if (endpoint === 'sources') {
            return Response.json({
                status: 'ok',
                sources: FEEDS,
            });
        }

        if (endpoint === 'everything') {
            const requestedSources = url.searchParams.get('sources');

            const selectedFeeds = requestedSources
                ? FEEDS.filter((feed) => requestedSources.split(',').includes(feed.id))
                : FEEDS;

            const results = await Promise.allSettled(selectedFeeds.map(getFeedArticles));

            const articles = results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));

            return Response.json({
                status: 'ok',
                totalResults: articles.length,
                articles,
            });
        }

        return Response.json({ status: 'error', message: 'Unknown endpoint' }, { status: 404 });
    } catch (error) {
        console.error('RSS function error:', error);

        return Response.json({ status: 'error', message: 'Unable to load RSS news' }, { status: 500 });
    }
};
