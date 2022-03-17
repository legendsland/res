import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Button from '@mui/material/Button';
import * as $ from 'jquery';

import Verbs from 'compromise/types';
import Document from 'compromise/types';
import DefaultDocument from 'compromise';

const nlp = require('compromise');
/**
 * Text process
 */
nlp
const App = () => {

    let doc = nlp($('body').text());

    const onClick = () => {
        let result = doc.verbs().out('array');

        console.log(result);
    }

    return (
        <Button
            onClick={onClick}
        >
            NLP
        </Button>
    );
}

export class Nlp {

    constructor(private containerId: string) {

    }

    create() {
        ReactDOM.render(<App/>, document.querySelector(`#${this.containerId}`));
    }
}
//