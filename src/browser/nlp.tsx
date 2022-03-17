import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Button from '@mui/material/Button';

/**
 * Text process
 */


const App = () => {
    return (
        <Button>
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