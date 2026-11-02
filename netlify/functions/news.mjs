import { XMLParser } from 'fast-xml-parser';
import sourcesData from '../data/sources.json';

const ALL_SOURCES = Array.isArray(sourcesData) ? sourcesData : sourcesData.sources || [];

const FEEDS = {
    'abc-news': 'https://abcnews.go.com/abcnews/topstories',
    'al-jazeera-english': 'https://www.aljazeera.com/xml/rss/all.xml',
    ansa: 'https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml',
    'ars-technica': 'https://feeds.arstechnica.com/arstechnica/index',
    axios: 'https://api.axios.com/feed/',
    'bbc-news': 'https://feeds.bbci.co.uk/news/rss.xml',
    'bbc-sport': 'https://feeds.bbci.co.uk/sport/rss.xml',
    bild: 'https://www.bild.de/feed/alles.xml',
    'business-insider': 'https://feeds.businessinsider.com/custom/all',
    'cbs-news': 'https://www.cbsnews.com/latest/rss/main',
    engadget: 'https://www.engadget.com/rss.xml',
    espn: 'https://www.espn.com/espn/rss/news',
    'fox-news': 'https://moxie.foxnews.com/google-publisher/latest.xml',
    'hacker-news': 'https://news.ycombinator.com/rss',
    independent: 'https://www.independent.co.uk/rss',
    'le-monde': 'https://www.lemonde.fr/en/rss/une.xml',
    msnbc: 'https://www.ms.now/feed',
    'nbc-news': 'https://feeds.nbcnews.com/nbcnews/public/news',
    newsweek: 'https://www.newsweek.com/rss',
    politico: 'https://rss.politico.com/politics-news.xml',
    'spiegel-online': 'https://www.spiegel.de/schlagzeilen/tops/index.rss',
    'svenska-dagbladet': 'https://www.svd.se/feed/articles.rss',
    techcrunch: 'https://techcrunch.com/feed/',
    'the-hill': 'https://thehill.com/feed/',
    'the-verge': 'https://www.theverge.com/rss/index.xml',
    'the-wall-street-journal': 'https://feeds.content.dowjones.io/public/rss/RSSMarketsMain',
    'the-washington-post': 'https://feeds.washingtonpost.com/rss/national',
    wired: 'https://www.wired.com/feed/rss',
};

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
});

function getText(value) {
    if (typeof value === 'string') {
        return value;
    }

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

async function getFeedArticles(sourceId) {
    const source = ALL_SOURCES.find((item) => item.id === sourceId);
    const feedUrl = FEEDS[sourceId];

    if (!source || !feedUrl) {
        throw new Error(`RSS feed not configured: ${sourceId}`);
    }

    const response = await fetch(feedUrl);

    if (!response.ok) {
        throw new Error(`RSS request failed: ${source.name} (${response.status})`);
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

        // Return all 125 sources from sources.json.
        if (endpoint === 'sources') {
            return Response.json({
                status: 'ok',
                sources: ALL_SOURCES,
            });
        }

        // Retrieve articles separately from the RSS feeds.

        if (endpoint === 'everything') {
            const requestedSources = url.searchParams.get('sources');

            const selectedSourceIds = requestedSources
                ? requestedSources.split(',').map((id) => id.trim())
                : Object.keys(FEEDS);

            const configuredSourceIds = selectedSourceIds.filter((id) => FEEDS[id]);

            const results = await Promise.allSettled(configuredSourceIds.map(getFeedArticles));

            const articles = results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));

            const failedSources = results
                .map((result, index) => ({
                    sourceId: configuredSourceIds[index],
                    status: result.status,
                }))
                .filter((result) => result.status === 'rejected')
                .map((result) => result.sourceId);

            return Response.json({
                status: 'ok',
                totalResults: articles.length,
                articles,
                failedSources,
            });
        }

        return Response.json(
            {
                status: 'error',
                message: 'Unknown endpoint',
            },
            { status: 404 }
        );
    } catch (error) {
        console.error('RSS function error:', error);

        return Response.json(
            {
                status: 'error',
                message: 'Unable to load news',
            },
            { status: 500 }
        );
    }
};
