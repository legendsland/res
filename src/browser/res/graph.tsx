import $ from 'jquery';
import { createRoot, Root } from 'react-dom/client';

export const KnowledgeGraphView = () => <div>aaa</div>;

export class KnowledgeGraphViewContainer {
    private readonly _elemId = 'res-kg-container';

    private readonly _elemSelector = '#res-kg-container';

    private _root: Root | undefined;

    render() {
        if ($(this._elemSelector).length === 0) {
            $('body').append(`<div id="${this._elemId}"></div>`);
        }
        this._dispose();
        this._root = createRoot($(this._elemSelector)[0]);
        this._root.render(<KnowledgeGraphView />);
    }

    private _dispose() {
        if (this._root !== undefined) {
            this._root.unmount();
            $(this._elemSelector).remove();
            this._root = undefined;
        }
    }
}
