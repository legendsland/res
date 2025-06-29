/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import * as cheerio from 'cheerio';
import * as http from 'http';
import { removeStopwords } from 'stopword';
import { NodeDb } from './res';
import { Note } from '../../common/db';

const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const nlp = require('compromise');
nlp.extend(require('compromise-ngrams')); // done!

export async function startServer() {
    const app = express();
    const server = http.createServer(app);

    const root = path.join(__dirname, '../../../../../');
    const port = 34701;

    app.use(cors());
    app.use(compression());
    app.use(express.static(root));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false,
    }));

    const neo4jRunning = false;
    // const neo4jClient = new Neo4jClient();
    //
    // connection neo4j
    // await neo4jClient.check();

    // const programRunner = new ProgramRunner();
    const db = new NodeDb(`${root}/res/src/common/db.json`);
    await db.load();

    app.get('/res', (req, res) => {
        res.sendFile('index.html', { root: `${root}` });
    });

    const routes = {
        reqlist: {
            fn: () => Object.getOwnPropertyNames(routes)
                .filter((prop) => prop !== 'reqlist')
                .map((prop) => ({ name: prop })),
        },

        nlpVerbs: {
            fn: async () => {
                const text = await cleanText(path.join(root, '/res/res/thinking/A Rulebook for Arguments.18.html'));
                return getVerbs(text);
            },
        },

        resAnnUpdate: {
            fn: async (url: string, note: string) => {
                db.updateAnn(url, JSON.parse(note));
                db.save();
                return Promise.resolve();
            },
        },

        resAnnAdd: {
            fn: async (url: string, note: Note) => {
                db.addAnnotation(url, note);
                db.save();
                return Promise.resolve();
            },
        },

        resAnnAddTag: {
            fn: async (url: string, id: string, tag: string) => {
                db.updateAnnotationTag(url, id, tag);
                db.save();
                return Promise.resolve();
            },
        },

        resAnnDelTag: {
            fn: async (url: string, id: string, idx: number) => {
                db.delAnnotationTag(url, id, idx);
                db.save();
                return Promise.resolve();
            },
        },

        resAnnDel: {
            fn: async (url: string, id: string) => {
                db.delAnnotation(url, id);
                db.save();
                return Promise.resolve();
            },
        },

        resAnnSave: {
            fn: async () => {
                db.save();
                return Promise.resolve();
            },
        },
    };

    app.post('/res', async (req, res, next) => {
        const { body } = req;
        const { method } = body;

        // @ts-ignore
        const target = routes[method];
        console.log(`request: ${method}, params: ${JSON.stringify(body.params)}`);

        if (target !== undefined) {
            if (!neo4jRunning && method.startsWith('neo4j')) {
                res.send('neo4j is not running');
                return;
            }

            const result = await target.fn(...body.params);
            res.send(result);
        } else {
            next('error');
        }
    });

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
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
        });
    });
}

function getVerbs(text: string) {
    return nlp(text).verbs().out('array');
}
