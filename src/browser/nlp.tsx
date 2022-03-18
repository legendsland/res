import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import * as $ from 'jquery';

// import Verbs from 'compromise/types';
// import Document from 'compromise/types';
// import DefaultDocument from 'compromise';

const nlp = require('compromise');

/**
 * Text process
 * 
 * A simple version could be used in browser,
 * a advanced version should be in server.
 * 
 * let client script to check this.
 * 
 */

const App = () => {

    // do it in browser, or on the server

    const onClickServer = () => {

        $.ajax({
            url: '/res/nlp'
        }).done((data) => {
            console.log(data);
        });

    }

    const onClickClient = () => {
        let doc = nlp($('body').text());
        let result = doc.verbs().out('array');
        console.log(result);
    }

    return (
        <Box>
            <Button
                onClick={onClickServer}
            >
                NLP-Server
            </Button>
            <Button
                onClick={onClickClient}
            >
                NLP-Client
            </Button>
        </Box>
    );
}

export class Nlp {

    constructor(private containerId: string) {

    }

    create() {
        ReactDOM.render(<App/>, document.querySelector(`#${this.containerId}`));
    }
}

