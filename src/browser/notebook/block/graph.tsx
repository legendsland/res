/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import cytoscape from 'cytoscape';
import { useEffect } from 'react';
import '../static/style.css';
import { createRoot } from 'react-dom/client';

const App = (props: any) => {
    const {
        data,
    } = props;

    useEffect(() => {
        cytoscape({
            container: document.getElementById('cy-graph'), // container to render in
            elements: [ // list of graph elements to start with
                { // node a
                    data: { id: 'a' },
                },
                { // node b
                    data: { id: 'b' },
                },
                { // edge ab
                    data: { id: 'ab', source: 'a', target: 'b' },
                },
            ],

            style: [ // the stylesheet for the graph
                {
                    selector: 'node',
                    style: {
                        'background-color': '#666',
                        label: 'data(id)',
                    },
                },

                {
                    selector: 'edge',
                    style: {
                        width: 3,
                        'line-color': '#ccc',
                        'target-arrow-color': '#ccc',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                    },
                },
            ],

            layout: {
                name: 'grid',
                rows: 1,
            },

        });

        console.log(document.getElementById('cy-graph'));
    }, []);

    return (
        <div
            id="cy-graph"
        />
    );
};

export class Graph {
    static get toolbox() {
        return {
            title: 'Graph',
            icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>',
        };
    }

    data: any;

    // @ts-ignore
    constructor({ data }) {
        this.data = data;
    }

    render() {
        const wrapper = document.createElement('div');
        createRoot(wrapper).render(<App tune={this} />);
        return wrapper;
    }

    save(blockContent: any) {
        return {
            text: blockContent.textContent,
        };
    }
}
