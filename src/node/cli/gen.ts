import { ParsedPath } from 'path';
import * as path from 'path';
import { fromIgnoreFile } from './ignorefile';
import { NodeDb } from '../server/res';
import { Note } from '../../common/db';

const fs = require('fs');

export async function createIndex() {
    const list = fromIgnoreFile();

    const config = {
        containerId: 'container',
        data: list,
    };

    const db_: { db: NodeDb } = await require('./db');
    const { db } = db_;

    list.forEach((l: ParsedPath & { stars: number, note: number, review: string }) => {
        let notes: Note[] = [];
        let review = '';
        if (l.base?.endsWith('.html')) {
            const htmlUrl = encodeURI(path.join('/res/', l.dir, l.base));
            notes = db.getAnn(htmlUrl);
        }
        if (l.base?.endsWith('.pdf')) {
            const pdfUrl = encodeURI(path.join(`/res/pdf.html?pdf=${l.dir}`, l.base));
            notes = db.getAnn(pdfUrl);
        }
        let maxStars = 0;
        notes.forEach((n) => {
            let stars = 0;
            if (n.tags?.includes('#R')) {
                // console.log(`add review ${n.note}`);
                review = n.note;
                for (let i = 0; i < n.note.length; ++i) {
                    if (n.note[i] === '⭐') {
                        // debug
                        // console.log(l.base);
                        ++stars;
                    }
                }
            }
            maxStars = Math.max(maxStars, stars);
        });
        l.note = notes.length;
        l.stars = maxStars;
        l.review = review;
    });

    const config_json = JSON.stringify(config);

    const html = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Res</title>
        <link rel="stylesheet" href="/res/dist/res/style.css" />
    </head>
    <body>
    <div id="${config.containerId}"></div>
    <script>var res_config = ${config_json};</script>
    <script src="/res/dist/res/main.js"></script>
    </body>
</html>
`;

    console.log('index.html created');
    fs.writeFileSync('index.html', html);
}
