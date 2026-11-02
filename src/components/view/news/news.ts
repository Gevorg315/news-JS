import './news.css';

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

class News {
    draw(data: Article[]): void {
        const news = data.slice(0, 10);
        const fragment = document.createDocumentFragment();
        const newsItemTemplate = document.querySelector<HTMLTemplateElement>('#newsItemTemp');
        const newsContainer = document.querySelector<HTMLElement>('.news');

        if (!newsItemTemplate || !newsContainer) {
            console.error('News template or container was not found.');
            return;
        }

        news.forEach((item, index) => {
            const newsClone = newsItemTemplate.content.cloneNode(true) as DocumentFragment;

            const newsItem = newsClone.querySelector<HTMLElement>('.news__item');
            const photo = newsClone.querySelector<HTMLElement>('.news__meta-photo');
            const author = newsClone.querySelector<HTMLElement>('.news__meta-author');
            const date = newsClone.querySelector<HTMLElement>('.news__meta-date');
            const title = newsClone.querySelector<HTMLElement>('.news__description-title');
            const source = newsClone.querySelector<HTMLElement>('.news__description-source');
            const description = newsClone.querySelector<HTMLElement>('.news__description-content');
            const link = newsClone.querySelector<HTMLAnchorElement>('.news__read-more a');

            if (!newsItem || !photo || !author || !date || !title || !source || !description || !link) {
                console.error('A required element is missing from the news template.');
                return;
            }

            if (index % 2 !== 0) {
                newsItem.classList.add('alt');
            }

            photo.style.backgroundImage = `url(${item.urlToImage || 'img/news_placeholder.jpg'})`;
            author.textContent = item.author || item.source.name;
            date.textContent = item.publishedAt.slice(0, 10).split('-').reverse().join('-');
            title.textContent = item.title;
            source.textContent = item.source.name;
            description.textContent = item.description || '';
            link.setAttribute('href', item.url);

            fragment.append(newsClone);
        });

        newsContainer.innerHTML = '';
        newsContainer.appendChild(fragment);
    }
}

export default News;
