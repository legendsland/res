import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import * as $ from 'jquery';
import { post } from '../server/request';
import {createRoot} from 'react-dom/client';

// import Verbs from 'compromise/types';
// import Document from 'compromise/types';
// import DefaultDocument from 'compromise';

const nlp = require('compromise');
// const nlp_ngrams = require('compromise-ngrams');
// nlp.extend(nlp_ngrams) //done!

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

    const onClickServer = (request: string) => {

        post('/res', {
            method: request,
            params: []
        }).then((data) => {
            console.log(data);
        });
    }

    const onClickClient = (request: string) => {
        let doc = nlp($('body').text());

        let result = '';
        if (request === 'verbs') {
            result = doc.verbs().out('array');
        }

        else if (request === 'ngrams') {
            result = doc.ngrams({size:1});
        }

        console.log(result);
    }

    return (
        <Box>
            <Button
                onClick={() => {onClickServer('nlpVerbs');}}
            >
                S-verbs
            </Button>

            <Button
                onClick={() => {onClickServer('nlpNgrams');}}
            >
                S-ngram
            </Button>


            <Button
                onClick={() => {onClickClient('nlpVerbs');}}
            >
                C-verbs
            </Button>
        </Box>
    );
}

export class Nlp {

    constructor(private containerId: string) {

    }

    create() {
        createRoot(document.querySelector(`#${this.containerId}`)).render(<App/>);
    }
}

