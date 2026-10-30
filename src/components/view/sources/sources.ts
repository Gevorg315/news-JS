import './sources.css';

interface Source {
    id: string;
    name: string;
}

class Sources {
    draw(data: Source[]): void {
        const fragment = document.createDocumentFragment();
        const sourceItemTemplate = document.querySelector<HTMLTemplateElement>('#sourceItemTemp');
        const sourcesContainer = document.querySelector<HTMLElement>('.sources');

        if (!sourceItemTemplate || !sourcesContainer) {
            console.error('Sources template or container was not found.');
            return;
        }

        data.forEach((item) => {
            const sourceClone = sourceItemTemplate.content.cloneNode(true) as DocumentFragment;

            const sourceName = sourceClone.querySelector<HTMLElement>('.source__item-name');
            const sourceItem = sourceClone.querySelector<HTMLElement>('.source__item');

            if (!sourceName || !sourceItem) {
                console.error('A required element is missing from the sources template.');
                return;
            }

            sourceName.textContent = item.name;
            sourceItem.setAttribute('data-source-id', item.id);

            fragment.append(sourceClone);
        });

        sourcesContainer.append(fragment);
    }
}

export default Sources;
