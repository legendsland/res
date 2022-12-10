/**
 * Generate a graph from text (code)
 */

import * as React from "react";
import * as ReactDOM from 'react-dom';
import {post} from '../../server/request';

const App = (props: any) => {

    const {
        tune
    } = props;

    const handleClick = () => {
        // get content
        const content = tune.block.holder.textContent;

        //TODO: check if it is runnable

        post('/res', {
            method: 'runGraph',
            params: [content]
        }).then(data => {
//
            // should render result to editor
            const result = {
                type: 'paragraph',
                data: {
                    text: data
                }
            };

            tune.api.blocks.insert(result.type, result.data);

        });

    }

    return (
        <div
            className={tune.api.styles.settingsButton}
            onClick={handleClick}
        >
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15.8 10.592v2.043h2.35v2.138H15.8v2.232h-2.25v-2.232h-2.4v-2.138h2.4v-2.28h2.25v.237h1.15-1.15zM1.9 8.455v-3.42c0-1.154.985-2.09 2.2-2.09h4.2v2.137H4.15v3.373H1.9zm0 2.137h2.25v3.325H8.3v2.138H4.1c-1.215 0-2.2-.936-2.2-2.09v-3.373zm15.05-2.137H14.7V5.082h-4.15V2.945h4.2c1.215 0 2.2.936 2.2 2.09v3.42z"/></svg>
        </div>
    )
}

export class RunTune {
    static get isTune() {
        return true;
    }

    public api: any;
    public block: any;
    public data: any;

    // @ts-ignore
    constructor({ api, block, data }) {
        this.api = api;
        this.block = block;
        this.data = data;
    }

    render() {
        const wrapper = document.createElement('div');

        ReactDOM.render(<App tune={this}/>, wrapper);
        return wrapper;
    }
}



