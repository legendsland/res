import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Button from '@mui/material/Button';
// import DefaultDocument from 'compromise';

const nlp = require('compromise');
/**
 * Text process
 */
nlp
const App = () => {

    let doc = nlp('she sells seashells by the seashore.');

    const onClick = () => {
        doc.verbs().toPastTense();
        let result = doc.text();

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