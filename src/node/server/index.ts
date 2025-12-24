/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import express from 'express';
import * as http from 'http';
import { NodeDb } from './res';
import { Note } from '../../common/db';

import cors from 'cors';
import bodyParser from 'body-parser';

export async function startServer() {
    const app = express();
    http.createServer(app);

    // const root = path.join(import.meta.dirname, '../../../../../');

    // TODO: hard-coded
    const root = '/home/zy/ws';

    console.log(`import.meta.dirname: ${import.meta.dirname}`);
    console.log(`root: ${root}`);
    const port = 34701;

    app.use(cors());
    app.use(express.static(root));
    app.use(bodyParser.json());
    app.use(
        bodyParser.urlencoded({
            extended: false,
        }),
    );

    const db = new NodeDb(`${root}/res/src/common/db.json`);
    await db.load();

    app.get('/res', (req, res) => {
        res.sendFile('index.html', { root: `${root}` });
    });

    const routes = {
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
