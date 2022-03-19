
import * as express from "express";
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import * as cheerio from "cheerio";

import {removeStopwords} from 'stopword';
import { testConnection } from "./neo4j/client";

const bodyParser = require('body-parser');

const nlp = require('compromise');
nlp.extend(require('compromise-ngrams')) //done!

export function startServer() {

    const app = express();
    const root = path.join(__dirname, '../../../../../');

    const port = 3000
    app.use(express.static(root));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false
    }));

    let neo4jRnning = false;

    app.get('/res', (req, res) => {
        res.sendFile('index.html', {root: root});
    });

    const routes = {
        reqlist: {
            fn: () => {
                return Object.getOwnPropertyNames(routes)
                    .filter(prop => prop !== 'reqlist')
                    .map(prop => {
                        return {name: prop};
                    });
            }
        },

        neo4jHello: {
            fn: async () => {
                const result =  await testConnection();
                return result !== undefined? 'connected' : 'cannot connect';
            },
        },

        nlpVerbs: {
            fn: async () => {
                const text = await cleanText(path.join(root, '/res/res/thinking/A Rulebook for Arguments.18.html'));
                return getVerbs(text);
            }
        },

        nlpNgrams: {
            fn: async () => {
                const text = await cleanText(path.join(root, '/res/res/thinking/A Rulebook for Arguments.18.html'));
                const ngrams = nlp(text).ngrams({
                    size: 1
                });
        
                return ngrams;
            }
        }
    }

    app.post('/res', async(req, res) => {
        const params = req.body;
        const method = params.method;

        //@ts-ignore
        const target = routes[method];
        if (target !== undefined) {

            if (!neo4jRnning && method.startsWith('neo4j')) {
                res.send('neo4j is not running');
                return;
            }

            const result = await target.fn(...params.params);
            res.send(result);
        } else {
            res.send('error');
        }
    });

    // connection neo4j
    testConnection().then(() => {
        neo4jRnning = true;
        console.log('neo4j connected');
    }).catch(() => {
        neo4jRnning = false;
        console.log('cannot connect neo4j');
    })

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
