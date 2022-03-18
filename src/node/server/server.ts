
import * as express from "express";
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import * as cheerio from "cheerio";


const { english } = require('stopwords');

// console.log(sws.english);

import { PorterStemmer } from 'natural';
import {removeStopwords} from 'stopword';


const bodyParser = require('body-parser');

const nlp = require('compromise');
nlp.extend(require('compromise-ngrams')) //done!

interface NgramOption {
    size: number
}

export function startServer() {



    const app = express();
    const root = path.join(__dirname, '../../../../../');

    const port = 3000
    app.use(express.static(root));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false
    }));

    app.get('/res', (req, res) => {
        res.sendFile('index.html', {root: root});
    });

    /**
     * nlp process
     */
    app.get('/res/nlp/verbs', async (req, res) => {
        
        cleanText(path.join(root, '/res/res/thinking/A Rulebook for Arguments.18.html'))
            .then((result) => {
                
                res.send(getVerbs(result));
            
            }).catch(() => res.send('error'));

    });

    app.post('/res/nlp/ngrams', async (req, res) => {
        
        const text = await cleanText(path.join(root, '/res/res/thinking/A Rulebook for Arguments.18.html'))
        const params: NgramOption = req.body as NgramOption;
        
        console.log(params);

        const ngrams = nlp(text).ngrams({
            size: params.size
        });

        res.send(ngrams);
    });

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    });

} 

async function cleanText(path: string): Promise<string> {

    const readFile = util.promisify(fs.readFile);

    return new Promise((resolve, reject) => {
        readFile(path).then((data) => {
            const $ = cheerio.load(data.toString());
            

            const text: string = $('#OEBPS\\/prf\\.xhtml').text() as string;

            // const text = 'a b c d it man asked for for it it it man man';

            const result = removeStopwords(text.replace(/\n/g, ' ').split(' ')).join(' ');
            // const result = removeStopwords(text.replace(/\n/g, ' ').split(' '))
                // .map((word) => PorterStemmer.stem(word))
                // .reduce((prev, curr) => `${prev} ${curr}`);

            // do the clean

            console.log(result);
            resolve(result);
 
        }).catch((error) => {
            reject();
        })
    });

}

function getVerbs(text: string) {
    return nlp(text).verbs().out('array');
}
